/**
 * Gestion des réunions
 * Version améliorée avec meilleure gestion des erreurs et états de chargement
 */

// Variable pour suivre les modifications des réunions
let previousMeetings = JSON.stringify([]);
let isLoadingMeetings = false;

/**
 * Récupère les réunions depuis l'API
 */
async function fetchMeetings() {
  // Éviter les requêtes multiples simultanées
  if (isLoadingMeetings) return;
  isLoadingMeetings = true;

  try {
    // Afficher l'indicateur de chargement
    const container = document.getElementById('meetingsContainer');
    if (container) {
      container.innerHTML = `
        <div class="loading-indicator">
          <i class="fas fa-circle-notch fa-spin"></i>
          <span>Chargement des réunions...</span>
        </div>
      `;
    }

    // URL de l'API avec un timestamp pour éviter la mise en cache
    const apiUrl = window.API_URLS && window.API_URLS.GET_MEETINGS 
      ? window.API_URLS.GET_MEETINGS 
      : '/meetings.json';
    
    // Ajouter un timestamp pour éviter le cache
    const response = await fetch(`${apiUrl}?t=${Date.now()}`);
    
    // Vérifier si la réponse est OK
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    // Traiter la réponse
    let meetings = await response.json();

    // Déterminer le contexte actuel (salle spécifique ou toutes les salles)
    const salleName = window.resourceName || window.salleName;
    const isAllRooms = !salleName || salleName === 'toutes les salles';

    // Filtrer par salle si ce n'est pas "toutes les salles"
    if (!isAllRooms && salleName) {
      meetings = meetings.filter(m => {
        const meetingSalle = (m.salle || '').toLowerCase();
        return meetingSalle === salleName.toLowerCase();
      });
    }
    
    // Filtrer pour ne garder que celles du jour
    const today = new Date().toDateString();
    meetings = meetings.filter(m => {
      const meetingDate = new Date(m.start).toDateString();
      return meetingDate === today;
    });

    // Trier les réunions par heure de début
    meetings.sort((a, b) => new Date(a.start) - new Date(b.start));

    // Vérifier si les données ont changé pour éviter des rafraîchissements inutiles
    const currentMeetingsString = JSON.stringify(meetings);
    if (previousMeetings === currentMeetingsString) {
      isLoadingMeetings = false;
      return;
    }
    previousMeetings = currentMeetingsString;

    // Mettre à jour l'affichage
    updateMeetingsDisplay(meetings);
    
    console.log(`Réunions chargées avec succès (${meetings.length} réunions)`);
    
  } catch (error) {
    console.error("❌ Erreur lors du chargement des réunions :", error);
    
    const container = document.getElementById('meetingsContainer');
    if (container) {
      container.innerHTML = `
        <div class="empty-meetings-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Impossible de charger les réunions.</p>
          <button id="retryBtn" class="btn btn-primary">
            <i class="fas fa-sync-alt"></i> Réessayer
          </button>
        </div>
      `;
      
      // Ajouter un bouton pour réessayer
      const retryBtn = document.getElementById('retryBtn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => fetchMeetings());
      }
    }
  } finally {
    isLoadingMeetings = false;
  }
}

/**
 * Met à jour l'affichage des réunions en les triant par statut
 */
function updateMeetingsDisplay(meetings) {
  const container = document.getElementById('meetingsContainer');
  if (!container) return;
  
  container.innerHTML = '';
  const now = new Date();

  // Tri des réunions par statut
  const pastMeetings = [];
  const currentMeetings = [];
  const upcomingMeetings = [];

  meetings.forEach(m => {
    const start = new Date(m.start);
    const end = new Date(m.end);
    
    if (end < now) {
      pastMeetings.push(m);
    } else if (start <= now && now < end) {
      currentMeetings.push(m);
    } else {
      upcomingMeetings.push(m);
    }
  });

  // Affichage selon qu'il y a des réunions ou non
  if (currentMeetings.length === 0 && upcomingMeetings.length === 0 && pastMeetings.length === 0) {
    // Aucune réunion
    container.innerHTML = `
      <div class="empty-meetings-message">
        <i class="far fa-calendar-times"></i>
        <p>Aucune réunion prévue aujourd'hui.</p>
        <button id="createEmptyBtn" class="create-meeting-integrated">
          <i class="fas fa-plus"></i> Créer une réunion
        </button>
      </div>
    `;
    
    // Attacher l'événement au bouton de création
    const createBtn = document.getElementById('createEmptyBtn');
    if (createBtn && window.BookingSystem) {
      createBtn.addEventListener('click', () => window.BookingSystem.openModal());
    }
  } else {
    // Il y a des réunions
    let html = '';
    
    // En cours
    if (currentMeetings.length > 0) {
      html += `
        <div class="status-section">
          <h4 class="status-current"><i class="fas fa-circle"></i> En cours</h4>
        </div>
      `;
      
      currentMeetings.forEach(m => {
        html += createMeetingItem(m, 'En cours');
      });
    }
    
    // À venir
    if (upcomingMeetings.length > 0) {
      html += `
        <div class="status-section">
          <h4><i class="fas fa-clock"></i> À venir</h4>
        </div>
      `;
      
      upcomingMeetings.forEach(m => {
        html += createMeetingItem(m, 'À venir');
      });
    }
    
    // Terminées
    if (pastMeetings.length > 0) {
      html += `
        <div class="status-section">
          <h4><i class="far fa-check-circle"></i> Terminées</h4>
        </div>
      `;
      
      pastMeetings.forEach(m => {
        html += createMeetingItem(m, 'Terminée');
      });
    }
    
    container.innerHTML = html;
    
    // Attacher les événements aux boutons
    attachMeetingEventHandlers();
  }
  
  // Mettre à jour les chronomètres après création des éléments
  updateMeetingTimers();
}

/**
 * Attache les gestionnaires d'événements aux éléments de réunion
 */
function attachMeetingEventHandlers() {
  // Boutons "Rejoindre"
  document.querySelectorAll('.meeting-item button').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const joinUrl = button.getAttribute('data-url');
      if (joinUrl) {
        window.open(joinUrl, '_blank');
      }
    });
  });
  
  // Clic sur une réunion pour afficher les détails
  document.querySelectorAll('.meeting-item').forEach(item => {
    item.addEventListener('click', () => {
      const meetingId = item.getAttribute('data-id');
      if (meetingId && window.showMeetingDetails) {
        window.showMeetingDetails(meetingId);
      }
    });
  });
}

/**
 * Crée le HTML pour un élément de réunion
 */
function createMeetingItem(meeting, category) {
  const start = new Date(meeting.start);
  const end = new Date(meeting.end);
  const now = new Date();
  const startTime = start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const endTime = end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // ID unique pour la réunion
  const meetingId = meeting.id || `meeting_${start.getTime()}_${Math.random().toString(36).substr(2, 9)}`;

  // Badge de statut
  let statusBadge = '';
  if (category === 'En cours') {
    statusBadge = `<div class="meeting-status-badge">En cours</div>`;
  }

  // Information sur le temps restant
  let progressBar = '';
  
  if (category === 'En cours') {
    // Calcul du temps total et du temps écoulé
    const totalDuration = end.getTime() - start.getTime();
    const elapsedTime = now.getTime() - start.getTime();
    const progressPercent = Math.min(100, Math.max(0, (elapsedTime / totalDuration) * 100)).toFixed(1);
    
    // Temps restant en minutes
    const remainingMinutes = Math.floor((end.getTime() - now.getTime()) / 60000);
    const remainingText = formatRemainingTime(remainingMinutes);
    
    // Création de la barre de progression
    progressBar = `
      <div class="meeting-progress-container">
        <div class="meeting-progress-bar" style="width: ${progressPercent}%"></div>
      </div>
      <div class="meeting-progress-info">
        <span>${progressPercent}% écoulé</span>
        <div class="time-remaining">
          <i class="far fa-clock"></i> Reste: ${remainingText}
        </div>
      </div>
      <div class="time-info">
        <span>${startTime}</span>
        <span>${endTime}</span>
      </div>
    `;
  }

  // Afficher la salle si on affiche toutes les salles
  let salleHTML = '';
  const isAllRooms = !window.salleName || window.salleName === 'toutes les salles';
  if (isAllRooms && meeting.salle) {
    salleHTML = `<p class="meeting-salle"><i class="fas fa-map-marker-alt"></i> Salle : ${meeting.salle}</p>`;
  }

  // Bouton "Rejoindre"
  let joinButton = '';
  if (meeting.joinUrl) {
    joinButton = `<button data-url="${meeting.joinUrl}"><i class="fas fa-link"></i> Rejoindre</button>`;
  }

  return `
    <div class="meeting-item ${category === 'Terminée' ? 'past' : ''}" data-id="${meetingId}">
      ${statusBadge}
      <h3>${meeting.subject || 'Réunion sans titre'}</h3>
      <p><i class="far fa-clock"></i> ${startTime} - ${endTime}</p>
      ${salleHTML}
      ${category === 'En cours' ? progressBar : ''}
      <p><i class="fas fa-users"></i> ${formatAttendees(meeting.attendees)}</p>
      ${joinButton}
    </div>
  `;
}

/**
 * Formate la liste des participants pour l'affichage
 */
function formatAttendees(attendees) {
  if (!attendees) return 'Aucun invité';
  
  if (Array.isArray(attendees)) {
    if (attendees.length === 0) return 'Aucun invité';
    if (attendees.length <= 3) return attendees.join(', ');
    return attendees.slice(0, 3).join(', ') + '...';
  }
  
  return attendees;
}

/**
 * Met à jour les chronomètres des réunions en cours
 */
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
      const startParts = startStr.split(':').map(Number);
      const endParts = endStr.split(':').map(Number);
      
      const today = new Date();
      
      const start = new Date(today.setHours(startParts[0], startParts[1], 0, 0));
      today.setHours(endParts[0], endParts[1], 0, 0);
      const end = new Date(today);
      
      // Si c'est une réunion en cours, mettre à jour la barre de progression
      if (start <= now && now < end) {
        const totalDuration = end.getTime() - start.getTime();
        const elapsedTime = now.getTime() - start.getTime();
        const progressPercent = Math.min(100, Math.max(0, (elapsedTime / totalDuration) * 100)).toFixed(1);
        
        // Trouver et mettre à jour la barre de progression
        const progressBar = item.querySelector('.meeting-progress-bar');
        const progressText = item.querySelector('.meeting-progress-info span:first-child');
        const remainingText = item.querySelector('.time-remaining');
        
        if (progressBar && progressText) {
          // Mise à jour visuelle
          progressBar.style.width = `${progressPercent}%`;
          progressText.textContent = `${progressPercent}% écoulé`;
          
          // Mise à jour du temps restant
          const remainingMinutes = Math.floor((end.getTime() - now.getTime()) / 60000);
          const remainingTextStr = formatRemainingTime(remainingMinutes);
          
          if (remainingText) {
            remainingText.innerHTML = `<i class="far fa-clock"></i> Reste: ${remainingTextStr}`;
          }
        }
      }
    }
  });
}

/**
 * Formater un temps restant en minutes en chaîne lisible
 */
function formatRemainingTime(remainingMinutes) {
  const remainingHours = Math.floor(remainingMinutes / 60);
  const remainingMins = remainingMinutes % 60;
  
  if (remainingHours > 0) {
    return `${remainingHours}h ${remainingMins}min`;
  } else {
    return `${remainingMins}min`;
  }
}

/**
 * Convertir une heure au format HH:MM en Date
 */
function timeStringToDate(timeString) {
  const today = new Date();
  const [hours, minutes] = timeString.split(':').map(Number);
  
  today.setHours(hours, minutes, 0, 0);
  return new Date(today);
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  // Premier chargement
  fetchMeetings();
  
  // Mise à jour régulière
  const refreshInterval = (window.REFRESH_INTERVALS && window.REFRESH_INTERVALS.MEETINGS) || 20000;
  const timerInterval = (window.REFRESH_INTERVALS && window.REFRESH_INTERVALS.MEETING_TIMERS) || 60000;
  
  setInterval(fetchMeetings, refreshInterval);
  setInterval(updateMeetingTimers, timerInterval);
  
  // Associer le bouton de rafraîchissement
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', fetchMeetings);
  }
});

// Exporter les fonctions pour utilisation ailleurs
window.fetchMeetings = fetchMeetings;
window.updateMeetingTimers = updateMeetingTimers;
