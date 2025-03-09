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
  
  // Définir la date à aujourd'hui
  const dateInput = document.getElementById('booking-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.min = today; // Empêcher les dates passées
  }
  
  // Mettre à jour l'heure actuelle pour le début
  const startTimeInput = document.getElementById('booking-start');
  if (startTimeInput) {
    startTimeInput.value = getCurrentTime();
  }
  
  // Mettre à jour l'heure de fin par défaut (start + 30min)
  const endTimeInput = document.getElementById('booking-end');
  if (endTimeInput && startTimeInput.value) {
    const start = new Date();
    const [hours, minutes] = startTimeInput.value.split(':').map(Number);
    start.setHours(hours, minutes + 30);
    endTimeInput.value = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
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
 * Met à jour l'heure de fin en fonction de la durée sélectionnée
 */
function updateEndTimeFromDuration(durationMinutes) {
  const startTimeInput = document.getElementById('booking-start');
  const endTimeInput = document.getElementById('booking-end');
  const dateInput = document.getElementById('booking-date');
  
  if (!startTimeInput || !endTimeInput || !dateInput || !startTimeInput.value) return;
  
  const selectedDate = dateInput.value;
  const [startHours, startMinutes] = startTimeInput.value.split(':').map(Number);
  
  const startDateTime = new Date(selectedDate);
  startDateTime.setHours(startHours, startMinutes);
  
  const endDateTime = new Date(startDateTime);
  endDateTime.setMinutes(endDateTime.getMinutes() + durationMinutes);
  
  endTimeInput.value = `${String(endDateTime.getHours()).padStart(2, '0')}:${String(endDateTime.getMinutes()).padStart(2, '0')}`;
}

/**
 * Vérifie la disponibilité d'une salle
 */
function checkRoomAvailability() {
  const roomSelect = document.getElementById('booking-room');
  const availabilityDiv = document.getElementById('room-availability');
  const startTimeInput = document.getElementById('booking-start');
  const endTimeInput = document.getElementById('booking-end');
  const dateInput = document.getElementById('booking-date');
  
  if (!roomSelect || !availabilityDiv || !startTimeInput || !dateInput) return;
  
  const selectedRoom = roomSelect.value;
  const selectedDate = dateInput.value;
  const startTime = startTimeInput.value;
  const endTime = endTimeInput.value;
  
  if (!selectedRoom || !selectedDate || !startTime) {
    availabilityDiv.innerHTML = '';
    return;
  }
  
  // Convertir en objets Date
  const startDateTime = new Date(`${selectedDate}T${startTime}`);
  let endDateTime;
  
  if (endTime) {
    endDateTime = new Date(`${selectedDate}T${endTime}`);
  } else {
    // Obtenir l'heure de fin basée sur la durée sélectionnée
    const activeDuration = document.querySelector('.duration-button.active');
    const durationMinutes = activeDuration ? parseInt(activeDuration.dataset.minutes) : 30;
    endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + durationMinutes);
  }
  
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
        const today = new Date().toISOString().split('T')[0];
        const meetingStart = new Date(`${today}T${meetingStartStr}`);
        const meetingEnd = new Date(`${today}T${meetingEndStr}`);
        
        // Ajuster si la date sélectionnée est différente d'aujourd'hui
        if (selectedDate !== today) {
          const diff = new Date(selectedDate).getTime() - new Date(today).getTime();
          meetingStart.setTime(meetingStart.getTime() + diff);
          meetingEnd.setTime(meetingEnd.getTime() + diff);
        }
        
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
        if ((startDateTime >= meeting.start && startDateTime < meeting.end) || 
            (endDateTime > meeting.start && endDateTime <= meeting.end) ||
            (startDateTime <= meeting.start && endDateTime >= meeting.end)) {
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
  const dateInput = document.getElementById('booking-date').value;
  const startTime = document.getElementById('booking-start').value;
  const endTime = document.getElementById('booking-end').value;
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
  
  if (!dateInput) {
    alert("Veuillez sélectionner une date.");
    return;
  }
  
  if (!startTime) {
    alert("Veuillez spécifier une heure de début.");
    return;
  }
  
  if (!endTime) {
    alert("Veuillez spécifier une heure de fin.");
    return;
  }
  
  // Construire les dates de début et de fin
  const startDateTime = new Date(`${dateInput}T${startTime}`);
  const endDateTime = new Date(`${dateInput}T${endTime}`);
  
  // Vérifier que l'heure de fin est après l'heure de début
  if (endDateTime <= startDateTime) {
    alert("L'heure de fin doit être après l'heure de début.");
    return;
  }
  
  // Récupérer les participants 
  const participants = participantsInput
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0);
  
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
    start: startDateTime.toISOString(),
    end: endDateTime.toISOString(),
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
      
      // Mettre à jour l'heure de fin en fonction de la durée
      const durationMinutes = parseInt(this.dataset.minutes);
      updateEndTimeFromDuration(durationMinutes);
      
      // Vérifier la disponibilité de la salle
      checkRoomAvailability();
    });
  });
  
  // Événements pour vérifier la disponibilité en cas de changements
  const roomSelect = document.getElementById('booking-room');
  const dateInput = document.getElementById('booking-date');
  const startTimeInput = document.getElementById('booking-start');
  const endTimeInput = document.getElementById('booking-end');
  
  if (roomSelect) {
    roomSelect.addEventListener('change', checkRoomAvailability);
  }
  
  if (dateInput) {
    dateInput.addEventListener('change', checkRoomAvailability);
  }
  
  if (startTimeInput) {
    startTimeInput.addEventListener('change', function() {
      // Mettre à jour l'heure de fin si un bouton de durée est actif
      const activeButton = document.querySelector('.duration-button.active');
      if (activeButton) {
        const durationMinutes = parseInt(activeButton.dataset.minutes);
        updateEndTimeFromDuration(durationMinutes);
      }
      checkRoomAvailability();
    });
  }
  
  if (endTimeInput) {
    endTimeInput.addEventListener('change', checkRoomAvailability);
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
