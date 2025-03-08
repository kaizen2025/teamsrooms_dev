/**
 * Gestion de la réservation de réunions
 */

/**
 * Ouvre le modal de réservation
 */
function openBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (!modal) return;
  
  modal.style.display = 'flex';
  
  // Remplir le select avec les salles
  const roomSelect = document.getElementById('booking-room');
  if (roomSelect && roomSelect.children.length <= 1) {
    for (const room in window.SALLES) {
      const option = document.createElement('option');
      option.value = room;
      option.textContent = room;
      roomSelect.appendChild(option);
    }
  }
  
  // Mettre à jour l'heure actuelle
  const startTimeInput = document.getElementById('booking-start');
  if (startTimeInput) {
    startTimeInput.value = getCurrentTime();
  }
  
  // Sélectionner par défaut le bouton 30 minutes
  const defaultDuration = document.querySelector('.duration-button[data-minutes="30"]');
  if (defaultDuration) {
    const durationButtons = document.querySelectorAll('.duration-button');
    durationButtons.forEach(btn => btn.classList.remove('active'));
    defaultDuration.classList.add('active');
  }
  
  // Vérifier la disponibilité
  setTimeout(checkRoomAvailability, 500);
}

/**
 * Ferme le modal de réservation
 */
function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (!modal) return;
  
  modal.style.display = 'none';
  
  // Réinitialiser les champs
  const titleInput = document.getElementById('booking-title');
  const participantsInput = document.getElementById('booking-participants');
  
  if (titleInput) titleInput.value = '';
  if (participantsInput) participantsInput.value = '';
}

/**
 * Vérifie la disponibilité d'une salle
 */
function checkRoomAvailability() {
  const roomSelect = document.getElementById('booking-room');
  const availabilityDiv = document.getElementById('room-availability');
  const startTimeInput = document.getElementById('booking-start');
  
  if (!roomSelect || !availabilityDiv || !startTimeInput) return;
  
  const selectedRoom = roomSelect.value;
  const startTime = startTimeInput.value;
  
  if (!selectedRoom || !startTime) {
    availabilityDiv.innerHTML = '';
    return;
  }
  
  // Obtenir l'heure de fin basée sur la durée sélectionnée
  const activeDuration = document.querySelector('.duration-button.active');
  const durationMinutes = activeDuration ? parseInt(activeDuration.dataset.minutes) : 30;
  
  // Convertir en objets Date
  const start = timeStringToDate(startTime);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + durationMinutes);
  
  // Vérifier s'il y a un conflit avec les réunions existantes
  let isAvailable = true;
  let conflictingMeeting = null;
  
  try {
    // Utiliser les réunions déjà chargées dans l'interface
    const allMeetings = Array.from(document.querySelectorAll('.meeting-item'))
      .map(item => {
        const title = item.querySelector('h3')?.textContent || 'Sans titre';
        const timeText = item.querySelector('p')?.textContent || '';
        const times = timeText.match(/(\d{2}:\d{2}) - (\d{2}:\d{2})/);
        
        if (!times || times.length !== 3) return null;
        
        const [_, meetingStartStr, meetingEndStr] = times;
        
        // Convertir en objets Date
        const meetingStart = timeStringToDate(meetingStartStr);
        const meetingEnd = timeStringToDate(meetingEndStr);
        
        // Récupérer la salle depuis le texte si disponible
        const salleText = item.textContent;
        const salleMatch = salleText.match(/Salle : (\w+)/);
        const salle = salleMatch ? salleMatch[1] : '';
        
        return { title, start: meetingStart, end: meetingEnd, salle };
      })
      .filter(meeting => meeting !== null);
    
    // Vérifier les conflits
    for (const meeting of allMeetings) {
      if (meeting.salle.toLowerCase() === selectedRoom.toLowerCase()) {
        // Vérifier si les plages horaires se chevauchent
        if ((start >= meeting.start && start < meeting.end) || 
            (end > meeting.start && end <= meeting.end) ||
            (start <= meeting.start && end >= meeting.end)) {
          isAvailable = false;
          conflictingMeeting = meeting;
          break;
        }
      }
    }
    
    // Afficher le résultat
    if (isAvailable) {
      availabilityDiv.innerHTML = '<span class="available"><i class="fas fa-check"></i> Salle disponible</span>';
    } else {
      const conflictStart = conflictingMeeting.start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const conflictEnd = conflictingMeeting.end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      availabilityDiv.innerHTML = `<span class="occupied"><i class="fas fa-times"></i> Salle occupée</span> (${conflictStart} - ${conflictEnd} : ${conflictingMeeting.title})`;
    }
    
  } catch (error) {
    console.error("Erreur lors de la vérification de disponibilité:", error);
    availabilityDiv.innerHTML = '<span class="occupied">Impossible de vérifier la disponibilité</span>';
  }
}

/**
 * Crée une réunion Teams avec l'API Graph
 */
async function createTeamsMeeting() {
  const title = document.getElementById('booking-title').value;
  const room = document.getElementById('booking-room').value;
  const startTime = document.getElementById('booking-start').value;
  const participantsInput = document.getElementById('booking-participants').value;
  
  // Validation de base
  if (!title) {
    alert("Veuillez entrer un titre pour la réunion.");
    return;
  }
  
  if (!room) {
    alert("Veuillez sélectionner une salle.");
    return;
  }
  
  if (!startTime) {
    alert("Veuillez spécifier une heure de début.");
    return;
  }
  
  // Obtenir la durée sélectionnée
  const activeDuration = document.querySelector('.duration-button.active');
  const durationMinutes = activeDuration ? parseInt(activeDuration.dataset.minutes) : 30;
  
  // Récupérer les participants 
  const participants = participantsInput
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0);
  
  // Construire les dates de début et de fin
  const start = timeStringToDate(startTime);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + durationMinutes);
  
  // Obtenir l'adresse email de la salle depuis la configuration
  const roomEmail = window.SALLES?.[room] || '';
  
  if (!roomEmail) {
    alert("Erreur: impossible de trouver l'email de la salle sélectionnée.");
    return;
  }
  
  // Préparation des données pour la création de la réunion
  const meetingData = {
    title,
    room,
    roomEmail,
    start: start.toISOString(),
    end: end.toISOString(),
    participants,
    isOnlineMeeting: true
  };
  
  // Afficher un indicateur de chargement
  const createButton = document.getElementById('createTeamsMeetingBtn');
  const originalText = createButton.textContent;
  createButton.textContent = "Création en cours...";
  createButton.disabled = true;
  
  try {
    // Appel à l'API pour créer la réunion
    const response = await fetch(window.API_URLS.CREATE_MEETING, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(meetingData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || "Erreur lors de la création de la réunion");
    }
    
    // Afficher un message de succès
    alert("Réunion créée avec succès!");
    
    // Fermer le modal
    closeBookingModal();
    
    // Rafraîchir la liste des réunions
    fetchMeetings();
    
  } catch (error) {
    console.error("Erreur lors de la création de la réunion:", error);
    alert(`Erreur: ${error.message || "Impossible de créer la réunion"}`);
  } finally {
    // Restaurer le bouton
    createButton.textContent = originalText;
    createButton.disabled = false;
  }
}

/**
 * Initialise les événements du modal de réservation
 */
function initializeBookingEvents() {
  // Gestionnaire pour les boutons de durée
  const durationButtons = document.querySelectorAll('.duration-button');
  durationButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Retirer la classe active des autres boutons
      durationButtons.forEach(btn => btn.classList.remove('active'));
      // Ajouter la classe active au bouton cliqué
      this.classList.add('active');
      // Vérifier la disponibilité de la salle
      checkRoomAvailability();
    });
  });
  
  // Événements pour vérifier la disponibilité en cas de changements
  const roomSelect = document.getElementById('booking-room');
  const startTimeInput = document.getElementById('booking-start');
  
  if (roomSelect) {
    roomSelect.addEventListener('change', checkRoomAvailability);
  }
  
  if (startTimeInput) {
    startTimeInput.addEventListener('change', checkRoomAvailability);
  }
  
  // Fermer le modal si on clique en dehors du contenu
  const modal = document.getElementById('bookingModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeBookingModal();
      }
    });
  }
  
  // Boutons du modal
  const cancelBtn = document.getElementById('cancelBookingBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeBookingModal);
  }
  
  const createBtn = document.getElementById('createTeamsMeetingBtn');
  if (createBtn) {
    createBtn.addEventListener('click', createTeamsMeeting);
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  // Initialiser les événements
  initializeBookingEvents();
  
  // Associer le bouton de création
  const createMeetingBtn = document.getElementById('createMeetingBtn');
  if (createMeetingBtn) {
    createMeetingBtn.addEventListener('click', openBookingModal);
  }
});
