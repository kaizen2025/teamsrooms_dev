/**
 * Gestion des réunions
 * Version améliorée avec chargement silencieux en arrière-plan
 */

// Variables globales pour le système de réunions
let previousMeetings = JSON.stringify([]);
let isLoadingMeetings = false;
let lastVisibleUpdate = 0;
const MIN_VISIBLE_UPDATE_INTERVAL = 60000; // 60 secondes minimum entre les mises à jour visibles
let meetingsContainer = null;
let isFirstLoad = true;

/**
 * Récupère les réunions depuis l'API
 * @param {boolean} forceVisibleUpdate - Force une mise à jour visible même si l'intervalle minimum n'est pas atteint
 */
async function fetchMeetings(forceVisibleUpdate = false) {
  // Éviter les requêtes multiples simultanées
  if (isLoadingMeetings) return;
  isLoadingMeetings = true;

  try {
    // Récupérer le conteneur une fois pour éviter les sélections multiples
    if (!meetingsContainer) {
      meetingsContainer = document.getElementById('meetingsContainer');
      if (!meetingsContainer) {
        console.error("Conteneur de réunions introuvable (meetingsContainer)");
        isLoadingMeetings = false;
        return;
      }
    }

    // Déterminer si nous devons afficher l'indicateur de chargement
    const now = Date.now();
    const hasExistingMeetings = meetingsContainer.querySelector('.meeting-item') !== null;
    const shouldShowLoading = forceVisibleUpdate || 
                             isFirstLoad || 
                             !hasExistingMeetings || 
                             (now - lastVisibleUpdate > MIN_VISIBLE_UPDATE_INTERVAL);
    
    // Afficher l'indicateur de chargement uniquement si nécessaire
    let loadingIndicator = null;
    if (shouldShowLoading) {
      loadingIndicator = document.createElement('div');
      loadingIndicator.className = 'loading-indicator';
      loadingIndicator.innerHTML = `
        <i class="fas fa-circle-notch fa-spin"></i>
        <span>Chargement des réunions...</span>
      `;
      
      // Sauvegarder le contenu actuel
      const originalContent = meetingsContainer.innerHTML;
      
      // Vider et afficher l'indicateur
      meetingsContainer.innerHTML = '';
      meetingsContainer.appendChild(loadingIndicator);
      
      console.log("Affichage de l'indicateur de chargement");
    } else {
      console.log("Mise à jour silencieuse des réunions en arrière-plan");
    }

    // URL de l'API avec un timestamp pour éviter la mise en cache
    const apiUrl = window.API_URLS && window.API_URLS.GET_MEETINGS 
      ? window.API_URLS.GET_MEETINGS 
      : '/meetings.json';
    
    // Effectuer la requête avec un timestamp pour éviter le cache
    const response = await fetch(`${apiUrl}?t=${Date.now()}`);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    // Traiter la réponse
    let meetings = await response.json();

    // Filtrer selon le contexte actuel
    const salleName = window.resourceName || window.salleName;
    const isAllRooms = !salleName || salleName === 'toutes les salles';

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

    // Trier les réunions
    meetings.sort((a, b) => new Date(a.start) - new Date(b.start));

    // Vérifier si les données ont changé
    const currentMeetingsString = JSON.stringify(meetings);
    const dataChanged = previousMeetings !== currentMeetingsString;
    
    // Mettre à jour les données en mémoire
    previousMeetings = currentMeetingsString;

    // Décider si on met à jour l'affichage
    if (shouldShowLoading || dataChanged) {
      // Mettre à jour l'interface complètement
      updateMeetingsDisplay(meetings);
      lastVisibleUpdate = now;
      console.log(`Mise à jour complète de l'affichage (${meetings.length} réunions)`);
    } else {
      // Mise à jour silencieuse - uniquement mettre à jour les timers et états
      updateMeetingTimers();
      console.log("Mise à jour des timers uniquement");
    }
    
    // Marquer la fin du premier chargement
    isFirstLoad = false;
    
  } catch (error) {
    console.error("Erreur lors du chargement des réunions:", error);
    
    // Afficher l'erreur uniquement si c'est un rafraîchissement forcé ou le premier chargement
    if (forceVisibleUpdate || isFirstLoad) {
      if (meetingsContainer) {
        meetingsContainer.innerHTML = `
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
          retryBtn.addEventListener('click', () => fetchMeetings(true));
        }
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
  if (!meetingsContainer) {
    meetingsContainer = document.getElementById('meetingsContainer');
    if (!meetingsContainer) {
      console.error("Conteneur de réunions introuvable pour l'affichage");
      return;
    }
  }

  // Vider le conteneur
  meetingsContainer.innerHTML = '';

  // Pas de réunions aujourd'hui
  if (meetings.length === 0) {
    meetingsContainer.innerHTML = `
      <div class="empty-meetings-message">
        <i class="fas fa-calendar-day"></i>
        <p>Aucune réunion prévue aujourd'hui.</p>
      </div>
    `;
    return;
  }

  // Date actuelle pour comparer et déterminer les statuts
  const now = new Date();

  // Séparer les réunions en cours, futures et passées
  const currentMeetings = [];
  const upcomingMeetings = [];
  const pastMeetings = [];

  // Classer les réunions selon leur statut
  meetings.forEach(meeting => {
    const startTime = new Date(meeting.start);
    const endTime = new Date(meeting.end);

    if (startTime <= now && endTime > now) {
      currentMeetings.push({ ...meeting, status: 'current' });
    } else if (startTime > now) {
      upcomingMeetings.push({ ...meeting, status: 'upcoming' });
    } else {
      pastMeetings.push({ ...meeting, status: 'past' });
    }
  });

  // Création des sections HTML
  let sectionsHTML = '';

  // Réunions en cours
  if (currentMeetings.length > 0) {
    sectionsHTML += `
      <div class="status-section">
        <h4><i class="fas fa-play-circle"></i> En cours</h4>
      </div>
    `;

    currentMeetings.forEach(meeting => {
      sectionsHTML += createMeetingHTML(meeting);
    });
  }

  // Réunions à venir
  if (upcomingMeetings.length > 0) {
    sectionsHTML += `
      <div class="status-section">
        <h4><i class="fas fa-clock"></i> À venir</h4>
      </div>
    `;

    upcomingMeetings.forEach(meeting => {
      sectionsHTML += createMeetingHTML(meeting);
    });
  }

  // Réunions passées
  if (pastMeetings.length > 0) {
    sectionsHTML += `
      <div class="status-section">
        <h4><i class="fas fa-check-circle"></i> Terminées</h4>
      </div>
    `;

    pastMeetings.forEach(meeting => {
      sectionsHTML += createMeetingHTML(meeting);
    });
  }

  // Ajouter les sections au conteneur
  meetingsContainer.innerHTML = sectionsHTML;

  // Initialiser les barres de progression et les chronomètres
  initializeMeetingTimers();
}

/**
 * Crée le HTML pour une réunion
 */
function createMeetingHTML(meeting) {
  const startTime = new Date(meeting.start);
  const endTime = new Date(meeting.end);
  const now = new Date();
  
  // Formatage de l'heure de début/fin
  const startTimeStr = startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const endTimeStr = endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  
  // Classes CSS en fonction du statut
  let statusClass = '';
  let progressHTML = '';
  
  if (meeting.status === 'current') {
    statusClass = 'current';
    
    // Calculer la progression
    const totalDuration = endTime - startTime;
    const elapsed = now - startTime;
    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    
    // Calculer le temps restant en minutes
    const remainingMs = endTime - now;
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    const remainingText = remainingMinutes < 60 
      ? `${remainingMinutes} min` 
      : `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}min`;
    
    progressHTML = `
      <div class="meeting-status-badge">En cours</div>
      <div class="meeting-progress-container">
        <div class="meeting-progress-bar" style="width: ${progress}%"></div>
      </div>
      <div class="time-info">
        <span>${startTimeStr} - ${endTimeStr}</span>
        <span class="time-remaining"><i class="fas fa-hourglass-half"></i> ${remainingText}</span>
      </div>
    `;
  } else if (meeting.status === 'past') {
    statusClass = 'past';
  } else {
    // Réunion à venir
    statusClass = 'upcoming';
  }
  
  // HTML de la réunion
  return `
    <div class="meeting-item ${statusClass}" data-id="${meeting.id}" data-start="${meeting.start}" data-end="${meeting.end}">
      <h3>${meeting.subject}</h3>
      ${progressHTML}
      <p class="meeting-time">${startTimeStr} - ${endTimeStr}</p>
      ${meeting.salle ? `<p class="meeting-salle"><i class="fas fa-door-open"></i> ${meeting.salle}</p>` : ''}
      ${meeting.joinUrl ? `<button class="join-meeting-btn" data-url="${meeting.joinUrl}"><i class="fas fa-video"></i> Rejoindre</button>` : ''}
    </div>
  `;
}

/**
 * Initialise les minuteurs pour les réunions
 */
function initializeMeetingTimers() {
  // Attacher les événements aux boutons de réunion
  document.querySelectorAll('.join-meeting-btn').forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      const url = button.dataset.url;
      if (url) {
        window.open(url, '_blank');
      }
    });
  });
  
  // Mettre à jour immédiatement les timers
  updateMeetingTimers();
}

/**
 * Met à jour les chronomètres et barres de progression
 */
function updateMeetingTimers() {
  const now = new Date();
  
  document.querySelectorAll('.meeting-item').forEach(item => {
    if (!item.dataset.start || !item.dataset.end) return;
    
    const startTime = new Date(item.dataset.start);
    const endTime = new Date(item.dataset.end);
    
    // Si l'élément n'a pas de données de temps valides, ignorer
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) return;
    
    // Réunion en cours
    if (startTime <= now && endTime > now) {
      // Mettre à jour la classe si ce n'était pas déjà 'current'
      if (!item.classList.contains('current')) {
        item.classList.remove('upcoming', 'past');
        item.classList.add('current');
        
        // Ajouter les éléments de progression s'ils n'existent pas
        if (!item.querySelector('.meeting-status-badge')) {
          const meetingTime = item.querySelector('.meeting-time');
          if (meetingTime) {
            const startTimeStr = startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            const endTimeStr = endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            
            const progressHTML = `
              <div class="meeting-status-badge">En cours</div>
              <div class="meeting-progress-container">
                <div class="meeting-progress-bar" style="width: 0%"></div>
              </div>
              <div class="time-info">
                <span>${startTimeStr} - ${endTimeStr}</span>
                <span class="time-remaining"><i class="fas fa-hourglass-half"></i> Calcul...</span>
              </div>
            `;
            
            meetingTime.insertAdjacentHTML('beforebegin', progressHTML);
          }
        }
      }
      
      // Mettre à jour la barre de progression
      const progressBar = item.querySelector('.meeting-progress-bar');
      const timeRemaining = item.querySelector('.time-remaining');
      
      if (progressBar) {
        const totalDuration = endTime - startTime;
        const elapsed = now - startTime;
        const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
        progressBar.style.width = `${progress}%`;
      }
      
      if (timeRemaining) {
        const remainingMs = endTime - now;
        const remainingMinutes = Math.ceil(remainingMs / 60000);
        const remainingText = remainingMinutes < 60 
          ? `${remainingMinutes} min` 
          : `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}min`;
        
        timeRemaining.innerHTML = `<i class="fas fa-hourglass-half"></i> ${remainingText}`;
      }
    }
    // Réunion terminée
    else if (endTime <= now) {
      if (!item.classList.contains('past')) {
        item.classList.remove('current', 'upcoming');
        item.classList.add('past');
        
        // Supprimer les éléments de progression
        const badge = item.querySelector('.meeting-status-badge');
        const progressContainer = item.querySelector('.meeting-progress-container');
        const timeInfo = item.querySelector('.time-info');
        
        if (badge) badge.remove();
        if (progressContainer) progressContainer.remove();
        if (timeInfo) timeInfo.remove();
      }
    }
    // Réunion à venir
    else {
      if (!item.classList.contains('upcoming')) {
        item.classList.remove('current', 'past');
        item.classList.add('upcoming');
      }
    }
  });
}

// Attacher le gestionnaire d'événements au chargement du document
document.addEventListener('DOMContentLoaded', () => {
  console.log("Initialisation du système de réunions");
  
  // Bouton de rafraîchissement manuel
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      console.log("Rafraîchissement manuel des réunions");
      fetchMeetings(true);
    });
  }
  
  // Premier chargement des réunions
  fetchMeetings(true);
  
  // Rafraîchissement périodique en arrière-plan
  const refreshInterval = (window.REFRESH_INTERVALS && window.REFRESH_INTERVALS.MEETINGS) || 20000;
  console.log(`Configuration du rafraîchissement automatique toutes les ${refreshInterval/1000} secondes`);
  
  setInterval(() => {
    fetchMeetings(false);
  }, refreshInterval);
  
  // Mise à jour des timers plus fréquente
  const timerInterval = (window.REFRESH_INTERVALS && window.REFRESH_INTERVALS.MEETING_TIMERS) || 60000;
  setInterval(updateMeetingTimers, timerInterval);
});

// Fonction globale pour rafraîchir les réunions (utilisée par d'autres modules)
window.fetchMeetings = fetchMeetings;
