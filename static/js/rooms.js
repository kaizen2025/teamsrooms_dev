/**
 * Gestion de l'affichage des salles et de leur statut
 */

const RoomsSystem = {
  // État
  rooms: [],
  visibleRooms: [],
  showOccupied: true,
  showAvailable: true,
  
  /**
   * Initialise le système de gestion des salles
   */
  init() {
    // Charger la configuration des salles
    this.loadRooms();
    
    // Initialiser les événements
    this.initEvents();
    
    // Mettre à jour périodiquement le statut des salles
    this.scheduleStatusUpdates();
    
    console.log("Système de gestion des salles initialisé");
  },
  
  /**
   * Charge la liste des salles depuis la configuration
   */
  loadRooms() {
    if (!window.SALLES) {
      console.error("Configuration des salles non disponible");
      return;
    }
    
    this.rooms = Object.keys(window.SALLES).map(name => ({
      id: name.toLowerCase(),
      name: name,
      email: window.SALLES[name],
      status: 'loading', // Statut initial en attendant la vérification
      nextMeeting: null
    }));
    
    // Charger les statuts
    this.updateRoomStatuses();
  },
  
  /**
   * Initialise les événements liés aux salles
   */
  initEvents() {
    // Bouton d'affichage/masquage des salles
    const toggleRoomsBtn = document.querySelector('.toggle-rooms-button, .rooms-toggle-button-floating');
    if (toggleRoomsBtn) {
      toggleRoomsBtn.addEventListener('click', () => {
        this.toggleRoomsSection();
      });
    }
    
    // Filtres des salles
    const roomsFilterInput = document.getElementById('rooms-filter');
    if (roomsFilterInput) {
      roomsFilterInput.addEventListener('input', () => {
        this.filterRooms(roomsFilterInput.value);
      });
    }
    
    // Filtre de statut
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => {
        const value = statusFilter.value;
        this.showOccupied = value === 'all' || value === 'occupied';
        this.showAvailable = value === 'all' || value === 'available';
        this.updateRoomsDisplay();
      });
    }
    
    // Bouton de rafraîchissement
    const refreshBtn = document.getElementById('refresh-rooms-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.updateRoomStatuses();
      });
    }
  },
  
  /**
   * Programme la mise à jour périodique des statuts
   */
  scheduleStatusUpdates() {
    // Intervalle de rafraîchissement des statuts
    const intervalMs = (window.REFRESH_INTERVALS && window.REFRESH_INTERVALS.ROOM_STATUS) || 60000;
    
    setInterval(() => {
      this.updateRoomStatuses();
    }, intervalMs);
  },
  
  /**
   * Met à jour le statut de toutes les salles
   */
  async updateRoomStatuses() {
    try {
      // Marquer toutes les salles comme en cours de chargement
      this.rooms.forEach(room => {
        room.status = 'loading';
      });
      
      // Mettre à jour l'affichage avec l'état de chargement
      this.updateRoomsDisplay();
      
      // Récupérer les réunions
      const apiUrl = window.API_URLS && window.API_URLS.GET_MEETINGS 
        ? window.API_URLS.GET_MEETINGS 
        : '/meetings.json';
      
      const response = await fetch(`${apiUrl}?t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const meetings = await response.json();
      const now = new Date();
      
      // Pour chaque salle, vérifier les réunions en cours et à venir
      this.rooms.forEach(room => {
        const roomMeetings = meetings.filter(m => 
          m.salle && m.salle.toLowerCase() === room.id.toLowerCase()
        );
        
        // Chercher une réunion en cours
        const currentMeeting = roomMeetings.find(m => {
          const startTime = new Date(m.start);
          const endTime = new Date(m.end);
          return startTime <= now && now < endTime;
        });
        
        if (currentMeeting) {
          room.status = 'occupied';
          room.currentMeeting = currentMeeting;
          room.timeRemaining = this.calculateTimeRemaining(currentMeeting.end);
        } else {
          room.status = 'available';
          room.currentMeeting = null;
          
          // Chercher la prochaine réunion
          const upcomingMeetings = roomMeetings
            .filter(m => new Date(m.start) > now)
            .sort((a, b) => new Date(a.start) - new Date(b.start));
          
          if (upcomingMeetings.length > 0) {
            room.nextMeeting = upcomingMeetings[0];
            
            // Si la prochaine réunion est dans moins de 15 minutes, marquer comme "bientôt occupée"
            const timeUntilNext = (new Date(room.nextMeeting.start) - now) / 60000; // en minutes
            if (timeUntilNext <= 15) {
              room.status = 'soon';
              room.timeUntilNext = timeUntilNext;
            }
          } else {
            room.nextMeeting = null;
          }
        }
      });
      
      // Mettre à jour l'affichage avec les statuts à jour
      this.updateRoomsDisplay();
      
    } catch (error) {
      console.error("Erreur lors de la mise à jour des statuts de salles:", error);
      
      // En cas d'erreur, marquer toutes les salles comme ayant un statut inconnu
      this.rooms.forEach(room => {
        room.status = 'unknown';
      });
      
      // Mettre à jour l'affichage
      this.updateRoomsDisplay();
    }
  },
  
  /**
   * Calcule le temps restant jusqu'à une date
   */
  calculateTimeRemaining(endTimeStr) {
    const now = new Date();
    const endTime = new Date(endTimeStr);
    
    // Différence en millisecondes
    const diffMs = endTime - now;
    if (diffMs <= 0) return '0min';
    
    // Convertir en minutes
    const diffMinutes = Math.floor(diffMs / 60000);
    
    // Formater
    if (diffMinutes >= 60) {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
    } else {
      return `${diffMinutes}min`;
    }
  },
  
  /**
   * Filtre les salles par nom
   */
  filterRooms(filterText) {
    if (!filterText) {
      this.visibleRooms = [...this.rooms];
    } else {
      const lowerFilter = filterText.toLowerCase();
      this.visibleRooms = this.rooms.filter(room => 
        room.name.toLowerCase().includes(lowerFilter)
      );
    }
    
    this.updateRoomsDisplay();
  },
  
  /**
   * Met à jour l'affichage des salles
   */
  updateRoomsDisplay() {
    const roomsContainer = document.querySelector('.rooms');
    if (!roomsContainer) return;
    
    // Filtrer selon les options de visibilité
    let displayedRooms = this.visibleRooms.filter(room => {
      if (room.status === 'occupied' || room.status === 'soon') {
        return this.showOccupied;
      } else if (room.status === 'available') {
        return this.showAvailable;
      }
      return true; // Toujours afficher les salles avec d'autres statuts (loading, unknown)
    });
    
    // Trier les salles (occupées en premier, puis bientôt occupées, puis disponibles)
    displayedRooms.sort((a, b) => {
      const statusOrder = { 'occupied': 0, 'soon': 1, 'available': 2, 'loading': 3, 'unknown': 4 };
      return statusOrder[a.status] - statusOrder[b.status] || a.name.localeCompare(b.name);
    });
    
    // Générer le HTML
    let html = '';
    
    // Message si aucune salle ne correspond aux filtres
    if (displayedRooms.length === 0) {
      html = `
        <div class="no-rooms-message">
          <i class="fas fa-search"></i>
          <p>Aucune salle ne correspond aux critères de recherche.</p>
        </div>
      `;
    } else {
      // Générer les cartes de salles
      displayedRooms.forEach(room => {
        html += this.createRoomCard(room);
      });
    }
    
    roomsContainer.innerHTML = html;
    
    // Attacher les événements aux cartes
    this.attachRoomCardEvents();
  },
  
  /**
   * Crée le HTML d'une carte de salle
   */
  createRoomCard(room) {
    let statusText = '';
    let statusClass = '';
    let timeInfo = '';
    
    switch (room.status) {
      case 'loading':
        statusText = 'Chargement...';
        statusClass = 'loading';
        break;
      case 'occupied':
        statusText = 'Occupée';
        statusClass = 'occupied';
        timeInfo = room.timeRemaining ? `Libre dans: ${room.timeRemaining}` : '';
        break;
      case 'soon':
        statusText = 'Bientôt occupée';
        statusClass = 'soon';
        timeInfo = room.nextMeeting ? 
          `Début dans: ${Math.floor(room.timeUntilNext)}min` : '';
        break;
      case 'available':
        statusText = 'Disponible';
        statusClass = 'available';
        timeInfo = room.nextMeeting ? 
          `Prochaine: ${new Date(room.nextMeeting.start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : '';
        break;
      case 'unknown':
        statusText = 'Statut inconnu';
        statusClass = 'unknown';
        break;
    }
    
    return `
      <div class="room-card ${statusClass}" data-room-id="${room.id}">
        <div class="room-name">${room.name}</div>
        <div class="room-status">
          <span class="status-icon ${statusClass}"></span>
          ${statusText}
        </div>
        ${timeInfo ? `<div class="room-time">${timeInfo}</div>` : ''}
      </div>
    `;
  },
  
  /**
   * Attache les événements aux cartes de salles
   */
  attachRoomCardEvents() {
    document.querySelectorAll('.room-card').forEach(card => {
      card.addEventListener('click', () => {
        const roomId = card.dataset.roomId;
        this.navigateToRoom(roomId);
      });
    });
  },
  
  /**
   * Navigue vers la page d'une salle spécifique
   */
  navigateToRoom(roomId) {
    window.location.href = `/${roomId}`;
  },
  
  /**
   * Affiche ou masque la section des salles
   */
  toggleRoomsSection() {
    const roomsSection = document.querySelector('.rooms-section');
    if (roomsSection) {
      roomsSection.classList.toggle('visible');
      
      // Si on affiche la section, mettre à jour les statuts
      if (roomsSection.classList.contains('visible')) {
        this.updateRoomStatuses();
      }
    }
  }
};

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  RoomsSystem.init();
});

// Exposer le système pour utilisation dans d'autres modules
window.RoomsSystem = RoomsSystem;
