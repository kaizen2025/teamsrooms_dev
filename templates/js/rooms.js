/**
 * Gestion de l'affichage et du statut des salles
 */

/**
 * Initialise la section d'état des salles
 */
function createRoomStatusSection() {
  updateRoomStatus();
}

/**
 * Met à jour le statut des salles
 */
async function updateRoomStatus() {
  const container = document.getElementById('roomsList');
  if (!container) return;
  
  try {
    // Obtenir les données des réunions
    const response = await fetch(`${window.API_URLS.GET_MEETINGS}?t=${Date.now()}`);
    if (!response.ok) throw new Error('Impossible de récupérer les données');
    
    const meetings = await response.json();
    const now = new Date();
    
    // Organiser les réunions par salle
    const roomMeetings = {};
    
    // Obtenir toutes les salles de la configuration
    for (const room in window.SALLES) {
      roomMeetings[room.toLowerCase()] = [];
    }
    
    // Ajouter les réunions aux salles correspondantes
    meetings.forEach(meeting => {
      const salle = meeting.salle?.toLowerCase();
      if (salle && roomMeetings[salle]) {
        roomMeetings[salle].push({
          id: meeting.id,
          subject: meeting.subject,
          start: new Date(meeting.start),
          end: new Date(meeting.end),
          isOnline: meeting.isOnline,
          joinUrl: meeting.joinUrl
        });
      }
    });
    
    // Vider le conteneur
    container.innerHTML = '';
    
    // Créer les cartes de statut pour chaque salle
    for (const room in roomMeetings) {
      // Convertir en titre avec majuscule initiale
      const roomName = room.charAt(0).toUpperCase() + room.slice(1);
      
      // Trier les réunions par heure de début
      const sortedMeetings = roomMeetings[room].sort((a, b) => a.start - b.start);
      
      // Trouver la réunion actuelle et la prochaine
      let currentMeeting = null;
      let nextMeeting = null;
      
      for (const meeting of sortedMeetings) {
        if (meeting.start <= now && meeting.end > now) {
          currentMeeting = meeting;
        } else if (meeting.start > now) {
          if (!nextMeeting || meeting.start < nextMeeting.start) {
            nextMeeting = meeting;
          }
        }
      }
      
      // Déterminer le statut
      let status = 'available';
      let statusText = 'Disponible';
      let timeText = '';
      
      if (currentMeeting) {
        status = 'occupied';
        statusText = 'Occupée';
        
        // Calculer le temps restant
        const remainingMinutes = Math.floor((currentMeeting.end - now) / 60000);
        timeText = `Fin dans ${remainingMinutes} min`;
      } else if (nextMeeting) {
        // Vérifier si la prochaine réunion est dans moins de 30 minutes
        const minutesUntilNext = Math.floor((nextMeeting.start - now) / 60000);
        
        if (minutesUntilNext <= 30) {
          status = 'soon';
          statusText = 'Bientôt';
          timeText = `Dans ${minutesUntilNext} min`;
        }
      }
      
      // Créer la carte de statut
      const card = document.createElement('div');
      card.className = `room-card ${status}`;
      card.innerHTML = `
        <div class="room-name">${roomName}</div>
        <div class="room-status">
          <span class="status-icon ${status}"></span>
          ${statusText}
        </div>
        ${timeText ? `<div class="room-time">${timeText}</div>` : ''}
      `;
      
      // Ajouter un événement pour rediriger vers la page de la salle
      card.addEventListener('click', function() {
        window.location.href = `/${room.toLowerCase()}`;
      });
      
      container.appendChild(card);
    }
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut des salles:', error);
    container.innerHTML = '<p>Impossible de récupérer le statut des salles</p>';
  }
}

/**
 * Bascule la visibilité de la section des salles
 */
function toggleRoomsVisibility() {
  const roomsSection = document.getElementById('roomsSection');
  if (!roomsSection) return;
  
  roomsSection.classList.toggle('visible');
  
  const button = document.getElementById('toggleRoomsBtn');
  if (button) {
    const icon = button.querySelector('i');
    const buttonText = button.querySelector('.button-text');
    
    if (roomsSection.classList.contains('visible')) {
      icon.className = 'fas fa-eye-slash';
      buttonText.textContent = 'Masquer salles';
    } else {
      icon.className = 'fas fa-eye';
      buttonText.textContent = 'Afficher salles';
    }
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  // Initialiser le statut des salles
  createRoomStatusSection();
  
  // Mise à jour régulière
  setInterval(updateRoomStatus, window.REFRESH_INTERVALS.ROOM_STATUS);
  
  // Associer le bouton toggle
  const toggleRoomsBtn = document.getElementById('toggleRoomsBtn');
  if (toggleRoomsBtn) {
    toggleRoomsBtn.addEventListener('click', toggleRoomsVisibility);
  }
});
