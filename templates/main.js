/* =========================
   A) Initialisation et configuration
   ========================= */
// Définir les salles pour l'utilisation dans le script
window.SALLES = {
  'Canigou': 'Sallecanigou@anecoop-france.com',
  'Castillet': 'Sallecastillet@anecoop-france.com',
  'Florensud': 'salleflorensud@florensud.fr',
  'Mallorca': 'Sallemallorca@anecoop-france.com',
  'Mimosa': 'Sallemimosa@florensud.fr',
  'Pivoine': 'SallePivoine@florensud.fr',
  'Renoncule': 'SalleRenoncule@florensud.fr',
  'Tramontane': 'Salletramontane@anecoop-france.com',
  'Massane': 'Sallemassane@anecoop-france.com'
};

/* =========================
   B) Date/Heure
   ========================= */
function updateDateTime() {
  const now = new Date();
  document.getElementById('current-date').textContent =
    now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  document.getElementById('current-time').textContent =
    now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
setInterval(updateDateTime, 1000);
updateDateTime();

/* =========================
   C) Nom de la salle
   ========================= */
let salleName = (window.location.pathname.split('/')[1] || '').trim().toLowerCase();
if (!salleName) salleName = 'toutes les salles';
document.getElementById('salle-title').textContent =
  "Salle de Réunion " + salleName.charAt(0).toUpperCase() + salleName.slice(1);
window.isAllRooms = (salleName === 'toutes les salles');

/* =========================
   E) Chronomètre visuel pour les réunions
   ========================= */
function updateMeetingTimers() {
  const currentItems = document.querySelectorAll('.meeting-item:not(.past)');
  const now = new Date();
  
  currentItems.forEach(item => {
    // Extraire les heures de début et de fin
    const timeText = item.querySelector('p')?.textContent || '';
    const times = timeText.match(/(\d{2}:\d{2}) - (\d{2}:\d{2})/);
    
    if (times && times.length === 3) {
      const [_, startStr, endStr] = times;
      
      // Convertir en objets Date
      const today = now.toISOString().split('T')[0];
      const startParts = startStr.split(':');
      const endParts = endStr.split(':');
      
      const start = new Date(`${today}T${startParts[0]}:${startParts[1]}:00`);
      const end = new Date(`${today}T${endParts[0]}:${endParts[1]}:00`);
      
      // Si c'est une réunion en cours, mettre à jour la barre de progression
      if (start <= now && now < end) {
        const totalDuration = end.getTime() - start.getTime();
        const elapsedTime = now.getTime() - start.getTime();
        const progressPercent = Math.min(100, Math.max(0, (elapsedTime / totalDuration) * 100)).toFixed(1);
        
        // Trouver et mettre à jour la barre de progression
        const progressBar = item.querySelector('.meeting-progress-bar');
        const progressText = item.querySelector('.meeting-progress-text span:first-child');
        const remainingText = item.querySelector('.meeting-progress-text span:last-child');
        const progressNow = item.querySelector('.progress-now');
        
        if (progressBar && progressText) {
          // Mise à jour visuelle
          progressBar.style.width = `${progressPercent}%`;
          progressText.textContent = `${progressPercent}% écoulé`;
          
          // Mise à jour du temps restant
          const remainingMinutes = Math.floor((end.getTime() - now.getTime()) / 60000);
          const remainingHours = Math.floor(remainingMinutes / 60);
          const remainingMins = remainingMinutes % 60;
          const remainingTextStr = remainingHours > 0 
            ? `${remainingHours}h ${remainingMins}min`
            : `${remainingMins}min`;
          
          if (remainingText) {
            remainingText.innerHTML = `<i class="fas fa-clock"></i> Reste: ${remainingTextStr}`;
          }
          
          if (progressNow) {
            progressNow.style.marginLeft = `${progressPercent}%`;
          }
          
          // Mise à jour de la classe de couleur
          progressBar.className = 'meeting-progress-bar';
          if (progressPercent > 75) progressBar.classList.add('ending');
          else if (progressPercent > 50) progressBar.classList.add('late');
          else if (progressPercent > 25) progressBar.classList.add('middle');
          else progressBar.classList.add('early');
        }
      }
    }
  });
}

/* =========================
   F) Statut visuel des salles
   ========================= */
function createRoomStatusSection() {
  updateRoomStatus();
}

async function updateRoomStatus() {
  const container = document.getElementById('roomsList');
  if (!container) return;
  
  try {
    // Obtenir les données des réunions
    const response = await fetch(`/meetings.json?t=${Date.now()}`);
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

/* =========================
   H) Réservation rapide de réunions
   ========================= */
function openBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (modal) {
    modal.style.display = 'flex';
  }
  
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

// Obtenir l'heure courante au format HH:MM
function getCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

// Fermer le modal de réservation
function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (modal) {
    modal.style.display = 'none';
    
    // Réinitialiser les champs
    const titleInput = document.getElementById('booking-title');
    const participantsInput = document.getElementById('booking-participants');
    
    if (titleInput) titleInput.value = '';
    if (participantsInput) participantsInput.value = '';
  }
}

// Vérifier la disponibilité d'une salle
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
  const today = new Date().toISOString().split('T')[0];
  const [hours, minutes] = startTime.split(':');
  const start = new Date(`${today}T${hours}:${minutes}:00`);
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
        const [startHours, startMinutes] = meetingStartStr.split(':');
        const [endHours, endMinutes] = meetingEndStr.split(':');
        
        const meetingStart = new Date(`${today}T${startHours}:${startMinutes}:00`);
        const meetingEnd = new Date(`${today}T${endHours}:${endMinutes}:00`);
        
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

/* =========================
   I) Rotation de l'arrière-plan
   ========================= */
const backgrounds = [
  '/static/Images/iStock-1137376794.jpg',
  '/static/Images/iStock-1512013316.jpg',
  '/static/Images/iStock-2019872476.jpg',
  '/static/Images/iStock-2154828608.jpg',
  '/static/Images/iStock-2157915069.jpg',
  '/static/Images/iStock-2162113462.jpg',
  '/static/Images/iStock-2178301876.jpg',
  '/static/Images/iStock-2186748328.jpg',
  '/static/Images/iStock-2187797860.jpg',
  '/static/Images/iStock-2188982874.jpg'
];

function changeBackground() {
  const randomImage = backgrounds[Math.floor(Math.random() * backgrounds.length)];
  document.getElementById('background-container').style.backgroundImage = `url('${randomImage}')`;
}

/* =========================
   J) Menu mobile et gestion de l'interface
   ========================= */
   
// Toggle du menu latéral
function toggleSideMenu() {
  const sideMenu = document.getElementById('sideMenu');
  sideMenu.classList.toggle('expanded');
  
  // Ajustement dynamique du conteneur principal
  const mainContainer = document.querySelector('.main-container');
  if (sideMenu.classList.contains('expanded')) {
    mainContainer.style.gridTemplateColumns = "220px 1fr 450px";
  } else {
    mainContainer.style.gridTemplateColumns = "60px 1fr 450px";
  }
}
   
// Afficher/masquer le menu mobile
function toggleMobileMenu() {
  const sideMenu = document.getElementById('sideMenu');
  sideMenu.classList.toggle('visible');
}

// Vérifier si on est en mobile pour afficher le bouton de menu
function checkMobileView() {
  const menuToggle = document.getElementById('menuToggle');
  if (window.innerWidth <= 768) {
    menuToggle.style.display = 'flex';
  } else {
    menuToggle.style.display = 'none';
    // S'assurer que le menu est visible en mode bureau
    const sideMenu = document.getElementById('sideMenu');
    sideMenu.classList.remove('visible');
  }
}

// Fonction pour masquer/afficher les salles
function toggleRoomsVisibility() {
  const roomsSection = document.querySelector('.rooms-section');
  roomsSection.classList.toggle('visible');
  
  const button = document.querySelector('.toggle-rooms-button');
  const buttonText = button.querySelector('.button-text');
  const icon = button.querySelector('i');
  
  if (roomsSection.classList.contains('visible')) {
    icon.className = 'fas fa-eye-slash';
    buttonText.textContent = 'Masquer salles';
  } else {
    icon.className = 'fas fa-eye';
    buttonText.textContent = 'Afficher salles';
  }
}

/* =========================
   K) Initialisation
   ========================= */
// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
  // Initialiser l'arrière-plan
  changeBackground();
  
  // Ajouter un bouton pour le toggle du menu
  const sideMenu = document.getElementById('sideMenu');
  const menuToggle = document.createElement('button');
  menuToggle.className = 'menu-toggle';
  menuToggle.innerHTML = '<i class="fas fa-chevron-right"></i>';
  menuToggle.onclick = toggleSideMenu;
  sideMenu.appendChild(menuToggle);
  
  // Modifier le bouton de toggle des salles pour inclure une span
  const toggleRoomsBtn = document.querySelector('.toggle-rooms-button');
  if (toggleRoomsBtn) {
    toggleRoomsBtn.innerHTML = '<i class="fas fa-eye"></i> <span class="button-text">Afficher salles</span>';
  }
  
  // Mettre à jour l'affichage des réunions
  fetchMeetings();
  
  // Initialiser le statut des salles
  createRoomStatusSection();
  
  // Mettre à jour les IDs récents
  updateRecentIdsList();
  
  // Initialiser les événements du modal de réservation
  initializeBookingEvents();
  
  // Initialiser le menu mobile
  checkMobileView();
  window.addEventListener('resize', checkMobileView);
  
  // Configurer le bouton de menu mobile
  const mobileMenuToggle = document.getElementById('menuToggle');
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
  }
  
  // Ajouter l'événement pour la touche Entrée au champ d'ID
  const meetingIdField = document.getElementById('meeting-id');
  if (meetingIdField) {
    meetingIdField.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        joinMeetingWithId();
      }
    });
  }
  
  // Mise en place des mises à jour périodiques
  setInterval(updateMeetingTimers, 60000); // Mise à jour des chronomètres chaque minute
  setInterval(fetchMeetings, 20000);       // Rafraîchit la liste toutes les 20 secondes
  setInterval(updateRoomStatus, 60000);    // Mise à jour du statut des salles
  setInterval(changeBackground, 3600000);  // Toutes les 60 minutes
});

// Initialiser les événements du modal de réservation
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
}