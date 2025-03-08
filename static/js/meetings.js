/**
 * Gestion des réunions
 */

// Variable pour suivre les modifications des réunions
let previousMeetings = JSON.stringify([]);

/**
 * Récupère les réunions depuis l'API
 */
async function fetchMeetings() {
  try {
    // Ajouter un timestamp pour éviter le cache
    const response = await fetch(`${window.API_URLS.GET_MEETINGS}?t=${Date.now()}`);
    let meetings = await response.json();

    // Filtrer par salle si ce n'est pas "toutes les salles"
    if (!window.isAllRooms) {
      meetings = meetings.filter(m => (m.salle || '').toLowerCase() === window.salleName);
    }
    
    // Filtrer pour ne garder que celles du jour
    const today = new Date().toDateString();
    meetings = meetings.filter(m => new Date(m.start).toDateString() === today);

    // Vérifier si les données ont changé pour éviter des rafraîchissements inutiles
    const currentMeetingsString = JSON.stringify(meetings);
    if (previousMeetings === currentMeetingsString) return;
    previousMeetings = currentMeetingsString;

    // Mettre à jour l'affichage
    updateMeetingsDisplay(meetings);
  } catch (error) {
    console.error("❌ Erreur lors du chargement des réunions :", error);
    document.getElementById('meetingsContainer').innerHTML =
      '<p style="color: red; font-weight: bold; text-align: center;"><i class="fas fa-exclamation-triangle"></i> Impossible de récupérer les réunions.</p>';
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
        <p><i class="fas fa-calendar-times"></i> Aucune réunion prévue aujourd'hui.</p>
      </div>
    `;
  } else {
    // Il y a des réunions
    if (currentMeetings.length > 0) {
      container.innerHTML += `
        <div class="status-section">
          <h4 class="status-current"><i class="fas fa-circle"></i> En cours</h4>
        </div>
      `;
      currentMeetings.forEach(m => {
        container.innerHTML += createMeetingItem(m, 'En cours');
      });
    } else {
      // Pas de réunion en cours mais d'autres types
      container.innerHTML += `
        <div class="status-section">
          <h4><i class="fas fa-clock"></i> Aujourd'hui</h4>
        </div>
      `;
    }
    
    // À venir
    if (upcomingMeetings.length > 0) {
      container.innerHTML += `<h4><i class="fas fa-circle text-info"></i> À venir</h4>`;
      upcomingMeetings.forEach(m => {
        container.innerHTML += createMeetingItem(m, 'À venir');
      });
    }
    
    // Terminées
    if (pastMeetings.length > 0) {
      container.innerHTML += `<h4><i class="far fa-circle"></i> Terminées</h4>`;
      pastMeetings.forEach(m => {
        container.innerHTML += createMeetingItem(m, 'Terminée');
      });
    }
  }
  
  // Mettre à jour les chronomètres après création des éléments
  updateMeetingTimers();
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

  // Afficher la salle si "Toutes les salles"
  let salleHTML = '';
  if (window.isAllRooms && meeting.salle) {
    salleHTML = `<p class="meeting-salle"><i class="fas fa-map-marker-alt"></i> Salle : ${meeting.salle}</p>`;
  }

  // Bouton "Rejoindre"
  let joinButton = '';
  if (meeting.joinUrl) {
    joinButton = `<button onclick="window.open('${meeting.joinUrl}', '_blank')"><i class="fas fa-link"></i> Rejoindre</button>`;
  }

  return `
    <div class="meeting-item ${category === 'Terminée' ? 'past' : ''}">
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
      const start = timeStringToDate(startStr);
      const end = timeStringToDate(endStr);
      
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

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  fetchMeetings(); // Premier chargement
  
  // Mise à jour régulière
  setInterval(fetchMeetings, window.REFRESH_INTERVALS.MEETINGS);
  setInterval(updateMeetingTimers, window.REFRESH_INTERVALS.MEETING_TIMERS);
  
  // Associer le bouton de rafraîchissement
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', fetchMeetings);
  }
});
