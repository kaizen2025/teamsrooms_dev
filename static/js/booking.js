/**
 * Gestion de la réservation de réunions
 * Version améliorée avec:
 * - Intégration plus étroite avec la liste des réunions
 * - Meilleure gestion des états et des erreurs
 * - Vérification plus robuste des disponibilités
 * - Retour visuel amélioré
 */

// Système de réservation de salles
const BookingSystem = {
  // État du système
  isLoading: false,
  selectedRoom: '',
  selectedDate: '',
  startTime: '',
  endTime: '',
  selectedDuration: 30, // minutes
  debug: true, // Activer les logs de débogage
  
  /**
   * Initialise le système de réservation
   */
  init() {
    // Initialiser les événements
    this.initializeEvents();
    
    // Associer les boutons de création
    this.attachCreateButtons();
    
    if (this.debug) console.log("Système de réservation initialisé");
  },
  
  /**
   * Attache les gestionnaires d'événements aux boutons de création
   */
  attachCreateButtons() {
    // Trouver tous les boutons de création de réunion
    const createButtons = document.querySelectorAll(
      '.create-meeting-integrated, #createMeetingBtn, button[data-action="create-meeting"]'
    );
    
    createButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.openModal();
      });
    });
    
    if (this.debug) console.log(`${createButtons.length} boutons de création attachés`);
  },
  
  /**
   * Ouvre le modal de réservation
   */
  openModal() {
    const modal = document.getElementById('bookingModal');
    if (!modal) {
      console.error("Modal de réservation introuvable");
      return;
    }
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Empêche le défilement en arrière-plan
    
    // Remplir le select avec les salles
    this.populateRooms();
    
    // Définir la date à aujourd'hui
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.value = today;
      dateInput.min = today; // Empêcher les dates passées
      this.selectedDate = today;
    }
    
    // Mettre à jour l'heure actuelle pour le début
    const startTimeInput = document.getElementById('booking-start');
    if (startTimeInput) {
      const roundedTime = this.getRoundedCurrentTime();
      startTimeInput.value = roundedTime;
      this.startTime = roundedTime;
    }
    
    // Mettre à jour l'heure de fin par défaut (start + 30min)
    this.updateEndTimeFromDuration(30);
    
    // Sélectionner par défaut le bouton 30 minutes
    const durationButtons = document.querySelectorAll('.duration-button');
    durationButtons.forEach(btn => btn.classList.remove('active'));
    const defaultDuration = document.querySelector('.duration-button[data-minutes="30"]');
    if (defaultDuration) {
      defaultDuration.classList.add('active');
      this.selectedDuration = 30;
    }
    
    // Effacer les champs de formulaire précédents
    const titleInput = document.getElementById('booking-title');
    const participantsInput = document.getElementById('booking-participants');
    if (titleInput) titleInput.value = '';
    if (participantsInput) participantsInput.value = '';
    
    // Masquer le message de disponibilité
    const availabilityDiv = document.getElementById('room-availability');
    if (availabilityDiv) availabilityDiv.innerHTML = '';
    
    // Animation d'entrée
    setTimeout(() => {
      const modalContent = modal.querySelector('.booking-modal-content');
      if (modalContent) {
        modalContent.style.opacity = '1';
        modalContent.style.transform = 'translateY(0)';
      }
    }, 50);
  },
  
  /**
   * Ferme le modal de réservation
   */
  closeModal() {
    const modal = document.getElementById('bookingModal');
    if (!modal) return;
    
    // Animation de sortie
    const modalContent = modal.querySelector('.booking-modal-content');
    if (modalContent) {
      modalContent.style.opacity = '0';
      modalContent.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restaurer le défilement
      }, 300);
    } else {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
    
    // Réinitialiser les états
    this.isLoading = false;
    this.selectedRoom = '';
  },
  
  /**
   * Remplit le sélecteur de salles
   */
  populateRooms() {
    const roomSelect = document.getElementById('booking-room');
    if (!roomSelect) return;
    
    // Vider les options sauf la première
    while (roomSelect.children.length > 1) {
      roomSelect.removeChild(roomSelect.lastChild);
    }
    
    // Ajouter les salles depuis la configuration
    if (window.SALLES) {
      for (const room in window.SALLES) {
        const option = document.createElement('option');
        option.value = room;
        option.textContent = room;
        roomSelect.appendChild(option);
      }
      
      // Sélectionner la salle actuelle si on est sur une page spécifique de salle
      const currentRoom = window.salleName || window.resourceName;
      if (currentRoom && currentRoom !== 'toutes les salles') {
        const normalized = currentRoom.charAt(0).toUpperCase() + currentRoom.slice(1).toLowerCase();
        
        // Trouver l'option correspondante
        for (let i = 0; i < roomSelect.options.length; i++) {
          if (roomSelect.options[i].value.toLowerCase() === normalized.toLowerCase()) {
            roomSelect.selectedIndex = i;
            this.selectedRoom = roomSelect.options[i].value;
            
            // Vérifier la disponibilité
            setTimeout(() => this.checkRoomAvailability(), 300);
            break;
          }
        }
      }
    } else {
      console.warn("Configuration des salles non trouvée (window.SALLES)");
    }
  },
  
  /**
   * Obtient l'heure actuelle arrondie au quart d'heure supérieur
   */
  getRoundedCurrentTime() {
    const now = new Date();
    const minutes = now.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 15) * 15;
    
    now.setMinutes(roundedMinutes);
    now.setSeconds(0);
    
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  },
  
  /**
   * Met à jour l'heure de fin en fonction de la durée sélectionnée
   */
  updateEndTimeFromDuration(durationMinutes) {
    const startTimeInput = document.getElementById('booking-start');
    const endTimeInput = document.getElementById('booking-end');
    const dateInput = document.getElementById('booking-date');
    
    if (!startTimeInput || !endTimeInput || !dateInput || !startTimeInput.value) return;
    
    this.selectedDuration = durationMinutes;
    const selectedDate = dateInput.value;
    const [startHours, startMinutes] = startTimeInput.value.split(':').map(Number);
    
    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(startHours, startMinutes);
    
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + durationMinutes);
    
    const endTimeStr = `${String(endDateTime.getHours()).padStart(2, '0')}:${String(endDateTime.getMinutes()).padStart(2, '0')}`;
    endTimeInput.value = endTimeStr;
    this.endTime = endTimeStr;
    
    // Vérifier la disponibilité
    this.checkRoomAvailability();
  },
  
  /**
   * Vérifie la disponibilité d'une salle
   */
  async checkRoomAvailability() {
    const roomSelect = document.getElementById('booking-room');
    const availabilityDiv = document.getElementById('room-availability');
    const startTimeInput = document.getElementById('booking-start');
    const endTimeInput = document.getElementById('booking-end');
    const dateInput = document.getElementById('booking-date');
    
    if (!roomSelect || !availabilityDiv || !startTimeInput || !endTimeInput || !dateInput) return;
    
    const selectedRoom = roomSelect.value;
    this.selectedRoom = selectedRoom;
    
    const selectedDate = dateInput.value;
    this.selectedDate = selectedDate;
    
    const startTime = startTimeInput.value;
    this.startTime = startTime;
    
    const endTime = endTimeInput.value;
    this.endTime = endTime;
    
    if (!selectedRoom || !selectedDate || !startTime || !endTime) {
      availabilityDiv.innerHTML = '';
      return;
    }
    
    // Afficher un indicateur de chargement
    availabilityDiv.innerHTML = '<div class="modal-loading"><i class="fas fa-circle-notch fa-spin"></i> Vérification de la disponibilité...</div>';
    
    // Convertir en objets Date
    const startDateTime = new Date(`${selectedDate}T${startTime}`);
    const endDateTime = new Date(`${selectedDate}T${endTime}`);
    
    // Vérifier que l'heure de fin est après l'heure de début
    if (endDateTime <= startDateTime) {
      availabilityDiv.innerHTML = `
        <div class="occupied">
          <i class="fas fa-exclamation-triangle"></i>
          L'heure de fin doit être après l'heure de début.
        </div>
      `;
      return;
    }
    
    try {
      // Récupérer les réunions du jour
      const apiUrl = window.API_URLS && window.API_URLS.GET_MEETINGS 
        ? window.API_URLS.GET_MEETINGS 
        : '/meetings.json';
      
      // Ajouter un timestamp pour éviter le cache
      const cacheBust = `?t=${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      const response = await fetch(`${apiUrl}${cacheBust}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const meetings = await response.json();
      
      // Vérifier les conflits
      let isAvailable = true;
      let conflictingMeeting = null;
      
      // Normaliser le nom de la salle pour la comparaison
      const normalizedRoomName = selectedRoom.toLowerCase().trim();
      
      // Filtrer les réunions de la même salle
      const roomMeetings = meetings.filter(m => {
        const meetingSalle = (m.salle || '').toLowerCase().trim();
        return meetingSalle === normalizedRoomName || 
               meetingSalle.includes(normalizedRoomName) || 
               normalizedRoomName.includes(meetingSalle);
      });
      
      if (this.debug) console.log(`Vérification de disponibilité pour ${selectedRoom}: ${roomMeetings.length} réunions trouvées`);
      
      // Vérifier chaque réunion pour un conflit
      for (const meeting of roomMeetings) {
        const meetingStart = new Date(meeting.start);
        const meetingEnd = new Date(meeting.end);
        
        // Vérifier si les plages horaires se chevauchent
        if ((startDateTime >= meetingStart && startDateTime < meetingEnd) || 
            (endDateTime > meetingStart && endDateTime <= meetingEnd) ||
            (startDateTime <= meetingStart && endDateTime >= meetingEnd)) {
          isAvailable = false;
          conflictingMeeting = meeting;
          break;
        }
      }
      
      // Afficher le résultat
      if (isAvailable) {
        availabilityDiv.innerHTML = `
          <div class="available">
            <i class="fas fa-check-circle"></i> 
            Salle disponible pour cette période
          </div>
        `;
      } else {
        const conflictStart = new Date(conflictingMeeting.start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const conflictEnd = new Date(conflictingMeeting.end).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        availabilityDiv.innerHTML = `
          <div class="occupied">
            <i class="fas fa-times-circle"></i> 
            Salle déjà réservée (${conflictStart} - ${conflictEnd} : ${conflictingMeeting.subject})
          </div>
        `;
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de disponibilité:", error);
      availabilityDiv.innerHTML = `
        <div class="occupied">
          <i class="fas fa-exclamation-triangle"></i> 
          Impossible de vérifier la disponibilité
        </div>
      `;
    }
  },
  
  /**
   * Crée une réunion Teams avec l'API Graph
   */
  async createTeamsMeeting() {
    const title = document.getElementById('booking-title').value;
    const room = document.getElementById('booking-room').value;
    const dateInput = document.getElementById('booking-date').value;
    const startTime = document.getElementById('booking-start').value;
    const endTime = document.getElementById('booking-end').value;
    const participantsInput = document.getElementById('booking-participants').value;
    const isOnlineMeeting = document.getElementById('booking-online-meeting')?.checked ?? true;
    
    // Validation de base
    if (!title) {
      this.showError("Veuillez entrer un titre pour la réunion.");
      return;
    }
    
    if (!room) {
      this.showError("Veuillez sélectionner une salle.");
      return;
    }
    
    if (!dateInput) {
      this.showError("Veuillez sélectionner une date.");
      return;
    }
    
    if (!startTime) {
      this.showError("Veuillez spécifier une heure de début.");
      return;
    }
    
    if (!endTime) {
      this.showError("Veuillez spécifier une heure de fin.");
      return;
    }
    
    // Construire les dates de début et de fin
    const startDateTime = new Date(`${dateInput}T${startTime}`);
    const endDateTime = new Date(`${dateInput}T${endTime}`);
    
    // Vérifier que l'heure de fin est après l'heure de début
    if (endDateTime <= startDateTime) {
      this.showError("L'heure de fin doit être après l'heure de début.");
      return;
    }
    
    // Récupérer les participants 
    const participants = participantsInput
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0 && email.includes('@'));
    
    // Obtenir l'adresse email de la salle depuis la configuration
    const roomEmail = window.SALLES?.[room] || '';
    
    if (!roomEmail) {
      this.showError("Erreur: impossible de trouver l'email de la salle sélectionnée.");
      return;
    }
    
    // Préparation des données pour la création de la réunion
    const meetingData = {
      title,
      room,
      roomEmail,
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      participants,
      isOnlineMeeting
    };
    
    if (this.debug) console.log("Données de réunion à créer:", meetingData);
    
    // Afficher un indicateur de chargement
    this.showLoading(true);
    
    try {
      // URL de l'API
      const apiUrl = window.API_URLS && window.API_URLS.CREATE_MEETING 
        ? window.API_URLS.CREATE_MEETING 
        : '/api/create-meeting';
      
      // Appel à l'API pour créer la réunion
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(meetingData)
      });
      
      // Analyser la réponse
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la création de la réunion");
      }
      
      // Afficher un message de succès
      this.showSuccess("Réunion créée avec succès !");
      
      // Fermer le modal après un délai
      setTimeout(() => {
        this.closeModal();
        
        // Rafraîchir la liste des réunions
        if (typeof window.fetchMeetings === 'function') {
          console.log("Rafraîchissement des réunions après création...");
          window.fetchMeetings(true);
        } else {
          console.error("La fonction fetchMeetings n'est pas disponible");
          // Tenter de rafraîchir la page si la fonction n'est pas disponible
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }, 1500);
      
    } catch (error) {
      console.error("Erreur lors de la création de la réunion:", error);
      this.showError(`Erreur: ${error.message || "Impossible de créer la réunion"}`);
      this.showLoading(false);
    }
  },
  
  /**
   * Affiche un message d'erreur dans le modal
   */
  showError(message) {
    const availabilityDiv = document.getElementById('room-availability');
    if (availabilityDiv) {
      availabilityDiv.innerHTML = `
        <div class="occupied">
          <i class="fas fa-exclamation-circle"></i> 
          ${message}
        </div>
      `;
      
      // Faire défiler jusqu'au message
      availabilityDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      alert(message);
    }
  },
  
  /**
   * Affiche un message de succès dans le modal
   */
  showSuccess(message) {
    const availabilityDiv = document.getElementById('room-availability');
    if (availabilityDiv) {
      availabilityDiv.innerHTML = `
        <div class="available">
          <i class="fas fa-check-circle"></i> 
          ${message}
        </div>
      `;
    }
  },
  
  /**
   * Affiche ou masque l'indicateur de chargement
   */
  showLoading(show) {
    this.isLoading = show;
    
    const createButton = document.getElementById('createTeamsMeetingBtn');
    if (createButton) {
      if (show) {
        createButton.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Création en cours...';
        createButton.disabled = true;
      } else {
        createButton.innerHTML = '<i class="fas fa-check"></i> Créer la réunion';
        createButton.disabled = false;
      }
    }
  },
  
  /**
   * Initialise les événements du modal de réservation
   */
  initializeEvents() {
    // Gestionnaire pour les boutons de durée
    const durationButtons = document.querySelectorAll('.duration-button');
    durationButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Retirer la classe active des autres boutons
        durationButtons.forEach(btn => btn.classList.remove('active'));
        // Ajouter la classe active au bouton cliqué
        button.classList.add('active');
        
        // Mettre à jour l'heure de fin en fonction de la durée
        const durationMinutes = parseInt(button.dataset.minutes);
        this.updateEndTimeFromDuration(durationMinutes);
      });
    });
    
    // Événements pour vérifier la disponibilité en cas de changements
    const roomSelect = document.getElementById('booking-room');
    const dateInput = document.getElementById('booking-date');
    const startTimeInput = document.getElementById('booking-start');
    const endTimeInput = document.getElementById('booking-end');
    
    if (roomSelect) {
      roomSelect.addEventListener('change', () => this.checkRoomAvailability());
    }
    
    if (dateInput) {
      dateInput.addEventListener('change', () => this.checkRoomAvailability());
    }
    
    if (startTimeInput) {
      startTimeInput.addEventListener('change', () => {
        this.startTime = startTimeInput.value;
        
        // Mettre à jour l'heure de fin si un bouton de durée est actif
        const activeButton = document.querySelector('.duration-button.active');
        if (activeButton) {
          const durationMinutes = parseInt(activeButton.dataset.minutes);
          this.updateEndTimeFromDuration(durationMinutes);
        } else {
          this.checkRoomAvailability();
        }
      });
    }
    
    if (endTimeInput) {
      endTimeInput.addEventListener('change', () => {
        this.endTime = endTimeInput.value;
        this.checkRoomAvailability();
      });
    }
    
    // Fermer le modal si on clique en dehors du contenu
    const modal = document.getElementById('bookingModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal && !this.isLoading) {
          this.closeModal();
        }
      });
    }
    
    // Bouton de fermeture du modal
    const closeBtn = document.getElementById('closeBookingModalBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (!this.isLoading) {
          this.closeModal();
        }
      });
    }
    
    // Boutons du modal
    const cancelBtn = document.getElementById('cancelBookingBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        if (!this.isLoading) {
          this.closeModal();
        }
      });
    }
    
    const createBtn = document.getElementById('createTeamsMeetingBtn');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        if (!this.isLoading) {
          this.createTeamsMeeting();
        }
      });
    }
    
    // Soumettre le formulaire via la touche Enter
    const form = document.getElementById('bookingForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!this.isLoading) {
          this.createTeamsMeeting();
        }
      });
    }
  }
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  BookingSystem.init();
});

// Exporter le système pour utilisation dans d'autres modules
window.BookingSystem = BookingSystem;
