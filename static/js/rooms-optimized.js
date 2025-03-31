/**
 * rooms-optimized.js
 * Système de gestion des salles optimisé et simplifié
 * Compatible avec interface-unified.js
 */

// Système optimisé de gestion des salles
const RoomsSystemOptimized = {
    // État du système
    rooms: {},
    isRoomsVisible: false,
    isInitialized: false,
    updateInterval: null,
    debug: false,
    
    /**
     * Initialise le système de salles
     */
    init() {
        if (this.isInitialized) {
            if (this.debug) console.log("Système de salles déjà initialisé");
            return;
        }
        
        if (this.debug) console.log("Initialisation du système de salles optimisé");
        
        // Charger les salles depuis la configuration
        this.loadRooms();
        
        // Mettre à jour le statut initial
        this.updateRoomStatus();
        
        // Configurer les mises à jour périodiques
        this.setupPeriodicUpdates();
        
        // Marquer comme initialisé
        this.isInitialized = true;
        
        // Exposer la méthode de compatibilité
        window.afficherSalles = () => {
            if (this.debug) console.log("Méthode de compatibilité afficherSalles() appelée");
            this.showRooms();
            return false; // Empêcher la navigation
        };
    },
    
    /**
     * Charge les salles depuis la configuration
     */
    loadRooms() {
        // Charger les salles depuis window.SALLES
        if (window.SALLES) {
            this.rooms = {};
            
            // Convertir l'objet en tableau d'objets
            for (const [name, email] of Object.entries(window.SALLES)) {
                this.rooms[name.toLowerCase()] = {
                    name,
                    email,
                    status: 'available', // État initial
                    currentMeeting: null,
                    nextMeeting: null
                };
            }
            
            if (this.debug) console.log(`${Object.keys(this.rooms).length} salles chargées depuis la configuration`);
        } else {
            if (this.debug) console.warn("Configuration des salles introuvable (window.SALLES)");
            
            // Configuration par défaut au cas où
            this.rooms = {
                'canigou': { name: 'Canigou', email: 'Sallecanigou@anecoop-france.com', status: 'available' },
                'castillet': { name: 'Castillet', email: 'Sallecastillet@anecoop-france.com', status: 'available' },
                'florensud': { name: 'Florensud', email: 'salleflorensud@florensud.fr', status: 'available' },
                'mallorca': { name: 'Mallorca', email: 'Sallemallorca@anecoop-france.com', status: 'available' },
                'mimosa': { name: 'Mimosa', email: 'Sallemimosa@florensud.fr', status: 'available' },
                'pivoine': { name: 'Pivoine', email: 'SallePivoine@florensud.fr', status: 'available' },
                'renoncule': { name: 'Renoncule', email: 'SalleRenoncule@florensud.fr', status: 'available' },
                'tramontane': { name: 'Tramontane', email: 'Salletramontane@anecoop-france.com', status: 'available' },
                'massane': { name: 'Massane', email: 'Sallemassane@anecoop-france.com', status: 'available' }
            };
        }
    },
    
    /**
     * Configure les mises à jour périodiques
     */
    setupPeriodicUpdates() {
        // Éviter les doublons en nettoyant l'intervalle existant
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Mise à jour du statut des salles
        const interval = window.REFRESH_INTERVALS?.ROOM_STATUS || 60000; // 1 minute par défaut
        
        this.updateInterval = setInterval(() => {
            this.updateRoomStatus();
        }, interval);
    },
    
    /**
     * Met à jour le statut des salles en fonction des réunions
     */
    updateRoomStatus() {
        if (this.debug) console.log("Mise à jour du statut des salles");
        
        // Récupérer les réunions courantes
        let meetings = [];
        try {
            // Tenter d'obtenir les réunions depuis la variable globale si elle existe
            if (typeof previousMeetings !== 'undefined') {
                meetings = JSON.parse(previousMeetings || '[]');
            } else if (window.APP_DATA && window.APP_DATA.meetings) {
                // Autre source possible
                meetings = window.APP_DATA.meetings;
            }
        } catch (e) {
            if (this.debug) console.error("Erreur lors de la récupération des réunions:", e);
            meetings = [];
        }
        
        const now = new Date();
        
        // Réinitialiser les données des salles
        for (const roomKey in this.rooms) {
            this.rooms[roomKey].status = 'available';
            this.rooms[roomKey].currentMeeting = null;
            this.rooms[roomKey].nextMeeting = null;
        }
        
        // Traiter chaque réunion
        meetings.forEach(meeting => {
            const roomName = (meeting.salle || '').toLowerCase();
            if (this.rooms[roomName]) {
                const startTime = new Date(meeting.start);
                const endTime = new Date(meeting.end);
                
                // Déterminer le statut de la salle
                if (startTime <= now && endTime > now) {
                    // Réunion en cours
                    this.rooms[roomName].status = 'occupied';
                    this.rooms[roomName].currentMeeting = meeting;
                    
                    // Calculer le temps restant
                    const remainingMs = endTime - now;
                    const remainingMinutes = Math.ceil(remainingMs / 60000);
                    this.rooms[roomName].remainingTime = remainingMinutes;
                } else if (startTime > now) {
                    // Réunion future
                    if (!this.rooms[roomName].nextMeeting || 
                        startTime < new Date(this.rooms[roomName].nextMeeting.start)) {
                        this.rooms[roomName].nextMeeting = meeting;
                        
                        // Si la prochaine réunion commence dans moins de 30 minutes
                        const minutesUntilStart = Math.floor((startTime - now) / 60000);
                        if (minutesUntilStart <= 30) {
                            this.rooms[roomName].status = 'soon';
                            this.rooms[roomName].minutesUntilNext = minutesUntilStart;
                        }
                    }
                }
            }
        });
        
        // Mettre à jour l'interface
        this.updateRoomsDisplay();
    },
    
    /**
     * Met à jour l'affichage des salles
     */
    updateRoomsDisplay() {
        const roomsContainer = document.querySelector('.rooms');
        if (!roomsContainer) {
            if (this.debug) console.error("Conteneur de salles introuvable");
            return;
        }
        
        // Vider le conteneur
        roomsContainer.innerHTML = '';
        
        // Ajouter chaque salle
        for (const [key, room] of Object.entries(this.rooms)) {
            const card = document.createElement('div');
            card.className = `room-card ${room.status}`;
            card.dataset.room = key;
            
            // Déterminer le texte de statut et l'icône
            let statusText = 'Disponible';
            let timeText = '';
            
            if (room.status === 'occupied' && room.currentMeeting) {
                statusText = 'Occupée';
                
                // Temps restant
                if (room.remainingTime) {
                    if (room.remainingTime < 60) {
                        timeText = `${room.remainingTime} min`;
                    } else {
                        const hours = Math.floor(room.remainingTime / 60);
                        const minutes = room.remainingTime % 60;
                        timeText = minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
                    }
                }
            } else if (room.status === 'soon' && room.nextMeeting) {
                statusText = 'Bientôt';
                
                if (room.minutesUntilNext) {
                    if (room.minutesUntilNext < 60) {
                        timeText = `Dans ${room.minutesUntilNext} min`;
                    } else {
                        const hours = Math.floor(room.minutesUntilNext / 60);
                        const minutes = room.minutesUntilNext % 60;
                        timeText = minutes > 0 ? `Dans ${hours}h ${minutes}min` : `Dans ${hours}h`;
                    }
                }
            }
            
            // HTML de la carte
            card.innerHTML = `
                <div class="room-name">${room.name}</div>
                <div class="room-status">
                    <span class="status-icon ${room.status}"></span>
                    ${statusText}
                </div>
                ${timeText ? `<div class="room-time">${timeText}</div>` : ''}
            `;
            
            // Ajouter un événement de clic pour ouvrir la page de la salle
            card.addEventListener('click', () => {
                // Rediriger vers la page de la salle
                window.location.href = `/${room.name.toLowerCase()}`;
            });
            
            // Ajouter au conteneur
            roomsContainer.appendChild(card);
        }
        
        if (this.debug) console.log(`Affichage mis à jour avec ${Object.keys(this.rooms).length} salles`);
    },
    
    /**
     * Affiche la section des salles
     */
    showRooms() {
        if (this.debug) console.log("Affichage des salles");
        
        // Mettre à jour le statut
        this.updateRoomStatus();
        
        // Utiliser le système d'interface unifié si disponible
        if (window.InterfaceSystem) {
            window.InterfaceSystem.showRooms();
        } else {
            // Sinon, utiliser la méthode classique
            const roomsSection = document.querySelector('.rooms-section');
            if (roomsSection) {
                roomsSection.classList.add('visible');
                roomsSection.style.display = 'block';
                this.isRoomsVisible = true;
                
                // Mettre à jour les textes des boutons
                this.updateButtonsText(true);
            }
        }
    },
    
    /**
     * Masque la section des salles
     */
    hideRooms() {
        if (this.debug) console.log("Masquage des salles");
        
        // Utiliser le système d'interface unifié si disponible
        if (window.InterfaceSystem) {
            window.InterfaceSystem.hideRooms();
        } else {
            // Sinon, utiliser la méthode classique
            const roomsSection = document.querySelector('.rooms-section');
            if (roomsSection) {
                roomsSection.classList.remove('visible');
                roomsSection.style.display = 'none';
                this.isRoomsVisible = false;
                
                // Mettre à jour les textes des boutons
                this.updateButtonsText(false);
            }
        }
    },
    
    /**
     * Bascule la visibilité des salles
     */
    toggleRooms() {
        if (this.isRoomsVisible) {
            this.hideRooms();
        } else {
            this.showRooms();
        }
    },
    
    /**
     * Met à jour le texte des boutons selon l'état
     */
    updateButtonsText(isVisible) {
        // Cette fonction est utilisée uniquement lorsque InterfaceSystem n'est pas disponible
        const sideMenuButton = document.querySelector('.side-menu .toggle-rooms-button');
        const floatingButton = document.querySelector('.rooms-toggle-button-floating');
        const controlButton = document.getElementById('toggleRoomsBtn') || document.getElementById('showRoomsBtn');
        
        const showText = '<i class="fas fa-door-open"></i> <span>Afficher les salles</span>';
        const hideText = '<i class="fas fa-times"></i> <span>Masquer les salles</span>';
        
        if (sideMenuButton) {
            sideMenuButton.innerHTML = isVisible ? hideText : showText;
        }
        
        if (floatingButton) {
            floatingButton.innerHTML = isVisible ? hideText : showText;
        }
        
        if (controlButton) {
            controlButton.innerHTML = isVisible 
                ? '<i class="fas fa-times"></i> Masquer les salles' 
                : '<i class="fas fa-door-open"></i> Afficher les salles';
        }
    }
};

// Initialiser le système de salles au chargement du document
document.addEventListener('DOMContentLoaded', function() {
    // Différer légèrement l'initialisation pour permettre au système d'interface de s'initialiser d'abord si présent
    setTimeout(function() {
        RoomsSystemOptimized.init();
    }, 200);
});

// Exposer pour utilisation globale - conserver la compatibilité avec l'ancien nom
window.RoomsSystem = RoomsSystemOptimized;
window.RoomsSystemOptimized = RoomsSystemOptimized;
