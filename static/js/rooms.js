/**
 * Gestion des salles de réunion
 * Version corrigée pour garantir l'affichage des salles
 */

// Système de gestion des salles
const RoomsSystem = {
  // État du système
  rooms: {},
  isRoomsVisible: false,
  isInitialized: false,
  
  /**
   * Initialise le système de salles
   */
  init() {
    console.log("Initialisation du système de salles");
    
    // Créer la structure HTML si elle n'existe pas
    this.createRoomsSection();
    
    // Charger les salles depuis la configuration
    this.loadRooms();
    
    // Initialiser les événements
    this.initEvents();
    
    // Mettre à jour le statut initial
    this.updateRoomStatus();
    
    // Définir comme initialisé
    this.isInitialized = true;
    
    // Configurer les mises à jour périodiques
    this.setupPeriodicUpdates();
  },
  
  /**
   * Crée la structure HTML pour la section des salles
   */
  createRoomsSection() {
    console.log("Création de la section des salles");
    
    // Vérifier si la section existe déjà
    let roomsSection = document.querySelector('.rooms-section');
    
    if (!roomsSection) {
      // Créer la section
      roomsSection = document.createElement('div');
      roomsSection.className = 'rooms-section';
      
      // Structure HTML
      roomsSection.innerHTML = `
        <div class="rooms-container">
          <div class="rooms">
            <!-- Les cartes de salles seront ajoutées ici -->
          </div>
        </div>
      `;
      
      // Ajouter au body
      document.body.appendChild(roomsSection);
    }
    
    // Créer le bouton flottant s'il n'existe pas
    let floatingButton = document.querySelector('.rooms-toggle-button-floating');
    
    if (!floatingButton) {
      floatingButton = document.createElement('button');
      floatingButton.className = 'rooms-toggle-button-floating';
      floatingButton.innerHTML = '<i class="fas fa-door-open"></i> <span>Afficher les salles</span>';
      
      // Ajouter au body
      document.body.appendChild(floatingButton);
    }
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
          status: 'unknown', // État initial
          currentMeeting: null,
          nextMeeting: null
        };
      }
      
      console.log(`${Object.keys(this.rooms).length} salles chargées depuis la configuration`);
    } else {
      console.warn("Configuration des salles introuvable (window.SALLES)");
      
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
   * Initialise les événements pour les salles
   */
  initEvents() {
    // Supprimer tous les écouteurs d'événements existants
    document.querySelectorAll('.toggle-rooms-button, #toggleRoomsBtn, .rooms-toggle-button-floating').forEach(btn => {
      const newBtn = btn.cloneNode(true);
      if (btn.parentNode) {
        btn.parentNode.replaceChild(newBtn, btn);
      }
    });
    
    // Bouton dans le menu latéral
    const sideMenuButton = document.querySelector('.side-menu .toggle-rooms-button');
    if (sideMenuButton) {
      sideMenuButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleRoomsVisibility();
      });
    }
    
    // Bouton flottant
    const floatingButton = document.querySelector('.rooms-toggle-button-floating');
    if (floatingButton) {
      floatingButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleRoomsVisibility();
      });
    }
    
    // Bouton dans la barre de contrôle
    const controlButton = document.getElementById('toggleRoomsBtn');
    if (controlButton) {
      controlButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleRoomsVisibility();
      });
    }
    
    // Bouton dans la barre en bas (compatibilité)
    const bottomButton = document.querySelector('.afficher-salles');
    if (bottomButton) {
      bottomButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleRoomsVisibility();
      });
    }
    
    // Clic en dehors pour fermer
    document.addEventListener('click', (e) => {
      if (this.isRoomsVisible) {
        const roomsSection = document.querySelector('.rooms-section');
        const isClickInside = 
          (roomsSection && roomsSection.contains(e.target)) ||
          e.target.closest('.rooms-toggle-button-floating') ||
          e.target.closest('#toggleRoomsBtn') ||
          e.target.closest('.toggle-rooms-button') ||
          e.target.closest('.afficher-salles');
        
        if (!isClickInside) {
          this.hideRooms();
        }
      }
    });
  },
  
  /**
   * Configure les mises à jour périodiques
   */
  setupPeriodicUpdates() {
    // Mise à jour du statut des salles
    const interval = window.REFRESH_INTERVALS?.ROOM_STATUS || 60000; // 1 minute par défaut
    
    setInterval(() => {
      this.updateRoomStatus();
    }, interval);
  },
  
  /**
   * Bascule la visibilité des salles
   */
  toggleRoomsVisibility() {
    console.log("Tentative de basculement de l'affichage des salles - État actuel:", this.isRoomsVisible);
    
    if (this.isRoomsVisible) {
      this.hideRooms();
    } else {
      this.showRooms();
    }
  },
  
  /**
   * Affiche la section des salles
   */
  showRooms() {
    console.log("Affichage des salles");
    
    // S'assurer que la section existe
    this.createRoomsSection();
    
    const roomsSection = document.querySelector('.rooms-section');
    if (roomsSection) {
      // Force la création du contenu avant d'afficher
      this.updateRoomStatus();
      
      // Forcer le style d'affichage
      roomsSection.style.display = 'block';
      roomsSection.classList.add('visible');
      this.isRoomsVisible = true;
      
      // Mettre à jour les textes des boutons
      this.updateButtonsText();
      
      console.log("Section des salles maintenant visible");
    } else {
      console.error("Impossible de trouver la section des salles");
    }
  },
  
  /**
   * Masque la section des salles
   */
  hideRooms() {
    console.log("Masquage des salles");
    
    const roomsSection = document.querySelector('.rooms-section');
    if (roomsSection) {
      roomsSection.classList.remove('visible');
      roomsSection.style.display = 'none';
      this.isRoomsVisible = false;
      
      // Mettre à jour les textes des boutons
      this.updateButtonsText();
      
      console.log("Section des salles maintenant masquée");
    }
  },
  
  /**
   * Met à jour le texte des boutons selon l'état
   */
  updateButtonsText() {
    const sideMenuButton = document.querySelector('.side-menu .toggle-rooms-button');
    const floatingButton = document.querySelector('.rooms-toggle-button-floating');
    const controlButton = document.getElementById('toggleRoomsBtn');
    const bottomButton = document.querySelector('.afficher-salles');
    
    const showText = '<i class="fas fa-door-open"></i> <span>Afficher les salles</span>';
    const hideText = '<i class="fas fa-times"></i> <span>Masquer les salles</span>';
    
    if (sideMenuButton) {
      sideMenuButton.innerHTML = this.isRoomsVisible ? hideText : showText;
    }
    
    if (floatingButton) {
      floatingButton.innerHTML = this.isRoomsVisible ? hideText : showText;
    }
    
    if (controlButton) {
      controlButton.innerHTML = this.isRoomsVisible 
        ? '<i class="fas fa-times"></i> Masquer les salles' 
        : '<i class="fas fa-door-open"></i> Afficher les salles';
    }
    
    if (bottomButton) {
      bottomButton.innerHTML = this.isRoomsVisible 
        ? '<i class="fas fa-times"></i> Masquer les salles' 
        : '<i class="fas fa-door-open"></i> Afficher les salles';
    }
  },
  
  /**
   * Met à jour le statut des salles en fonction des réunions
   */
  updateRoomStatus() {
    console.log("Mise à jour du statut des salles");
    
    // Récupérer les réunions courantes
    let meetings = [];
    try {
      meetings = JSON.parse(previousMeetings || '[]');
    } catch (e) {
      console.error("Erreur lors de la récupération des réunions:", e);
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
      console.error("Conteneur de salles introuvable");
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
        timeText = `${room.remainingTime || '?'} min`;
      } else if (room.status === 'soon' && room.nextMeeting) {
        statusText = 'Bientôt';
        timeText = `Dans ${room.minutesUntilNext || '?'} min`;
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
        const currentLocation = window.location.origin;
        window.location.href = `${currentLocation}/${room.name.toLowerCase()}`;
      });
      
      // Ajouter au conteneur
      roomsContainer.appendChild(card);
    }
    
    console.log(`Affichage mis à jour avec ${Object.keys(this.rooms).length} salles`);
  },
  
  /**
   * Force l'affichage des salles et met à jour l'état
   * (méthode de secours)
   */
  forceShowRooms() {
    // Créer les éléments s'ils n'existent pas
    this.createRoomsSection();
    
    // Charger les salles
    this.loadRooms();
    
    // Mettre à jour les statuts
    this.updateRoomStatus();
    
    // Forcer l'affichage
    const roomsSection = document.querySelector('.rooms-section');
    if (roomsSection) {
      roomsSection.style.display = 'block';
      roomsSection.classList.add('visible');
      this.isRoomsVisible = true;
      
      // Mettre à jour les textes des boutons
      this.updateButtonsText();
    }
  }
};

// Initialiser le système de salles au chargement du document
document.addEventListener('DOMContentLoaded', () => {
  console.log("Chargement du système de salles");
  RoomsSystem.init();
  
  // Ajouter une méthode de secours pour les boutons qui utilisent l'ancien système
  window.afficherSalles = function() {
    console.log("Méthode de compatibilité afficherSalles() appelée");
    RoomsSystem.forceShowRooms();
    return false; // Empêcher la navigation
  };
});

// Exporter pour utilisation dans d'autres modules
window.RoomsSystem = RoomsSystem;
