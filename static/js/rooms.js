/**
 * Gestion des salles de réunion
 * Affiche et met à jour le statut des salles
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
    }
  },
  
  /**
   * Initialise les événements pour les salles
   */
  initEvents() {
    // Bouton dans le menu latéral
    const sideMenuButton = document.querySelector('.side-menu .toggle-rooms-button');
    if (sideMenuButton) {
      sideMenuButton.addEventListener('click', () => {
        this.toggleRoomsVisibility();
      });
    }
    
    // Bouton flottant
    const floatingButton = document.querySelector('.rooms-toggle-button-floating');
    if (floatingButton) {
      floatingButton.addEventListener('click', () => {
        this.toggleRoomsVisibility();
      });
    }
    
    // Bouton dans la barre de contrôle
    const controlButton = document.getElementById('toggleRoomsBtn');
    if (controlButton) {
      controlButton.addEventListener('click', () => {
        this.toggleRoomsVisibility();
      });
    }
    
    // Clic en dehors pour fermer
    document.addEventListener('click', (e) => {
      if (this.isRoomsVisible) {
        const roomsSection = document.querySelector('.rooms-section');
        const roomsButton = document.querySelector('.rooms-toggle-button-floating');
        const controlButton = document.getElementById('toggleRoomsBtn');
        const sideMenuButton = document.querySelector('.side-menu .toggle-rooms-button');
        
        // Vérifier si le clic est en dehors des éléments de salles
        if (roomsSection && 
            !roomsSection.contains(e.target) && 
            !(roomsButton && roomsButton.contains(e.target)) && 
            !(controlButton && controlButton.contains(e.target)) && 
            !(sideMenuButton && sideMenuButton.contains(e.target))) {
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
    
    const roomsSection = document.querySelector('.rooms-section');
    if (roomsSection) {
      roomsSection.classList.add('visible');
      this.isRoomsVisible = true;
      
      // Mettre à jour les textes des boutons
      this.updateButtonsText();
      
      // Mettre à jour les statuts
      this.updateRoomStatus();
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
      this.isRoomsVisible = false;
      
      // Mettre à jour les textes des boutons
      this.updateButtonsText();
    }
  },
  
  /**
   * Met à jour le texte des boutons selon l'état
   */
  updateButtonsText() {
    const sideMenuButton = document.querySelector('.side-menu .toggle-rooms-button');
    const floatingButton = document.querySelector('.rooms-toggle-button-floating');
    const controlButton = document.getElementById('toggleRoomsBtn');
    
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
  },
  
  /**
   * Met à jour le statut des salles en fonction des réunions
   */
  updateRoomStatus() {
    // Ne pas mettre à jour si les salles ne sont pas affichées (économie de ressources)
    if (!this.isRoomsVisible && this.isInitialized) {
      return;
    }
    
    console.log("Mise à jour du statut des salles");
    
    // Récupérer les réunions courantes
    const meetings = JSON.parse(previousMeetings || '[]');
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
    if (!roomsContainer) return;
    
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
  }
};

// Initialiser le système de salles au chargement du document
document.addEventListener('DOMContentLoaded', () => {
  console.log("Chargement du système de salles");
  RoomsSystem.init();
});

// Exporter pour utilisation dans d'autres modules
window.RoomsSystem = RoomsSystem;
