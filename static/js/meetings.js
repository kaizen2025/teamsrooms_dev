/**
 * Gestion des réunions
 * Version améliorée avec synchronisation en temps réel et filtrage précis par salle
 */

// Variables globales pour le système de réunions
let previousMeetings = JSON.stringify([]);
let isLoadingMeetings = false;
let lastVisibleUpdate = 0;
const MIN_VISIBLE_UPDATE_INTERVAL = 30000; // 30 secondes minimum entre les mises à jour visibles
let meetingsContainer = null;
let isFirstLoad = true;
let lastRefreshTime = Date.now();
let debugMode = true; // Activer pour plus de logs

// Styles pour la popup des participants
const participantsStyles = `
  .meeting-participants {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 4px 0;
  }
  
  .show-more-participants {
    background: none;
    border: none;
    color: #ddd;
    cursor: pointer;
    padding: 2px 5px;
    border-radius: 50%;
    transition: background-color 0.2s;
  }
  
  .show-more-participants:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .participants-popup {
    position: fixed;
    z-index: 1000;
    background-color: #2c2c2c;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 300px;
    max-width: 90vw;
    max-height: 80vh;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .participants-popup-content {
    display: flex;
    flex-direction: column;
    max-height: 80vh;
  }
  
  .participants-popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background-color: rgba(60, 60, 60, 0.5);
  }
  
  .participants-popup-header h4 {
    margin: 0;
    color: white;
    font-size: 16px;
  }
  
  .close-participants {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
  }
  
  .participants-list {
    padding: 10px 15px;
    overflow-y: auto;
    max-height: 300px;
  }
  
  .participant-item {
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    color: #ddd;
  }
  
  .participant-item:last-child {
    border-bottom: none;
  }
`;

// Ajouter les styles au chargement du document
document.addEventListener('DOMContentLoaded', function() {
  const styleElem = document.createElement('style');
  styleElem.textContent = participantsStyles;
  document.head.appendChild(styleElem);
});

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
      meetingsContainer = document.getElementById('meetingsContainer') || document.querySelector('.meetings-list');
      if (!meetingsContainer) {
        console.error("Conteneur de réunions introuvable (meetingsContainer ou .meetings-list)");
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
    let originalContent = '';
    if (shouldShowLoading) {
      originalContent = meetingsContainer.innerHTML;
      loadingIndicator = document.createElement('div');
      loadingIndicator.className = 'loading-indicator';
      loadingIndicator.innerHTML = `
        <i class="fas fa-circle-notch fa-spin"></i>
        <span>Chargement des réunions...</span>
        <p class="loading-detail">Dernière mise à jour: ${new Date().toLocaleTimeString()}</p>
      `;
      
      // Vider et afficher l'indicateur
      meetingsContainer.innerHTML = '';
      meetingsContainer.appendChild(loadingIndicator);
      
      if (debugMode) console.log("Affichage de l'indicateur de chargement");
    } else {
      if (debugMode) console.log("Mise à jour silencieuse des réunions en arrière-plan");
    }

    // URL de l'API avec un timestamp pour éviter la mise en cache
    const apiUrl = window.API_URLS && window.API_URLS.GET_MEETINGS 
      ? window.API_URLS.GET_MEETINGS 
      : '/meetings.json';
    
    // Cache-busting amélioré avec timestamp unique et nombre aléatoire
    const cacheBust = `?t=${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    
    if (debugMode) console.log(`Requête API: ${apiUrl}${cacheBust}`);
    
    // Effectuer la requête avec un timestamp pour éviter le cache
    const response = await fetch(`${apiUrl}${cacheBust}`);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    // Traiter la réponse
    let meetings = await response.json();
    
    if (debugMode) console.log(`Réunions récupérées: ${meetings.length}`);

    // Filtrage amélioré selon le contexte actuel
    const salleName = window.resourceName || window.salleName;
    const isAllRooms = !salleName || salleName.toLowerCase() === 'toutes les salles';

    if (debugMode) console.log(`Filtrage des réunions pour: "${salleName}", isAllRooms: ${isAllRooms}`);
    
    if (!isAllRooms && salleName) {
      // Normaliser le nom de la salle pour le filtrage
      const normalizedSalleName = salleName.toLowerCase().trim();
      
      // Version originale des meetings pour log
      const originalCount = meetings.length;
      
      meetings = meetings.filter(m => {
        // Vérifier si la salle est définie
        if (!m.salle) return false;
        
        const meetingSalle = m.salle.toLowerCase().trim();
        
        // Vérifier correspondance exacte ou partielle
        const isMatch = meetingSalle === normalizedSalleName || 
                       meetingSalle.includes(normalizedSalleName) ||
                       normalizedSalleName.includes(meetingSalle);
        
        if (isMatch && debugMode) {
          console.log(`Réunion correspondante: "${m.subject}" (${m.salle})`);
        }
        
        return isMatch;
      });
      
      if (debugMode) console.log(`Réunions après filtrage: ${meetings.length}/${originalCount} pour "${normalizedSalleName}"`);
    }
    
    // Vérifier si toutes les réunions ont des données valides
    meetings = meetings.filter(meeting => {
      if (!meeting.start || !meeting.end) {
        console.warn(`Réunion ignorée - données manquantes: ${meeting.subject}`);
        return false;
      }
      return true;
    });
    
    // Filtrer pour ne garder que celles d'aujourd'hui et de demain 
    // (pour éviter les problèmes de fuseaux horaires, utilisons une approche plus large)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    
    meetings = meetings.filter(m => {
      try {
        const meetingDate = new Date(m.start);
        // Garder les réunions d'aujourd'hui et de demain
        return meetingDate >= today && meetingDate < dayAfterTomorrow;
      } catch (e) {
        console.error(`Erreur de date pour la réunion ${m.subject}: ${e.message}`);
        return false;
      }
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
      if (debugMode) console.log(`Mise à jour complète de l'affichage (${meetings.length} réunions)`);
    } else {
      // Mise à jour silencieuse - uniquement mettre à jour les timers et états
      updateMeetingTimers();
      if (debugMode) console.log("Mise à jour des timers uniquement");
    }
    
    // Marquer la fin du premier chargement
    isFirstLoad = false;
    lastRefreshTime = Date.now();
    
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
    meetingsContainer = document.getElementById('meetingsContainer') || document.querySelector('.meetings-list');
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
  if (debugMode) console.log(`Heure actuelle pour classification: ${now.toISOString()}`);

  // Séparer les réunions en cours, futures et passées
  const currentMeetings = [];
  const upcomingMeetings = [];
  const pastMeetings = [];

  // Classer les réunions selon leur statut avec une marge de tolérance de 2 minutes
  meetings.forEach(meeting => {
    // Analyser correctement les dates avec prise en compte des fuseaux horaires
    const startTime = new Date(meeting.start);
    const endTime = new Date(meeting.end);
    
    if (debugMode) console.log(`Réunion: "${meeting.subject}", Début: ${startTime.toISOString()}, Fin: ${endTime.toISOString()}`);
    
    // Ajouter une marge de 2 minutes pour les réunions "en cours"
    const adjustedNow = new Date(now.getTime());
    const adjustedStartTime = new Date(startTime.getTime() - (2 * 60 * 1000)); // 2 minutes avant
    
    if (adjustedStartTime <= adjustedNow && endTime > adjustedNow) {
      currentMeetings.push({ ...meeting, status: 'current' });
      if (debugMode) console.log(`Classée comme en cours: ${meeting.subject}`);
    } else if (startTime > adjustedNow) {
      upcomingMeetings.push({ ...meeting, status: 'upcoming' });
      if (debugMode) console.log(`Classée comme à venir: ${meeting.subject}`);
    } else {
      pastMeetings.push({ ...meeting, status: 'past' });
      if (debugMode) console.log(`Classée comme terminée: ${meeting.subject}`);
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
  
  // Initialiser les popups de participants
  initializeParticipantsPopups();
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
  
  // Déterminer si c'est une réunion Teams
  const isTeamsMeeting = meeting.isOnline || meeting.joinUrl;
  const meetingUrl = meeting.joinUrl || '';
  
  // Affichage des participants
  let participantsHTML = '';
  if (meeting.attendees && meeting.attendees.length > 0) {
    // Filtrer les emails des salles
    const salleMails = Object.values(window.SALLES || {}).map(mail => mail.toLowerCase());
    const participants = meeting.attendees.filter(mail => 
      !salleMails.includes(mail.toLowerCase())
    );
    
    // Afficher un aperçu des participants (3 premiers)
    const previewParticipants = participants.slice(0, 3);
    const hasMore = participants.length > 3;
    
    if (participants.length > 0) {
      participantsHTML = `
        <p class="meeting-participants">
          <i class="fas fa-users"></i> 
          ${previewParticipants.join(', ')}
          ${hasMore ? 
            `<button class="show-more-participants" data-meeting-id="${meeting.id}" title="Voir tous les participants">
              <i class="fas fa-ellipsis-h"></i>
             </button>` : 
            ''}
        </p>
        <div class="participants-popup" id="participants-${meeting.id}" style="display:none;">
          <div class="participants-popup-content">
            <div class="participants-popup-header">
              <h4>Participants</h4>
              <button class="close-participants" data-meeting-id="${meeting.id}">&times;</button>
            </div>
            <div class="participants-list">
              ${participants.map(p => `<div class="participant-item">${p}</div>`).join('')}
            </div>
          </div>
        </div>
      `;
    }
  }
  
  // HTML de la réunion
  return `
    <div class="meeting-item ${statusClass}" 
         data-id="${meeting.id}" 
         data-start="${meeting.start}" 
         data-end="${meeting.end}" 
         data-is-teams="${isTeamsMeeting}"
         data-url="${meetingUrl}">
      <h3>${meeting.subject}</h3>
      ${progressHTML}
      <p class="meeting-time"><i class="far fa-clock"></i> ${startTimeStr} - ${endTimeStr}</p>
      ${meeting.salle ? `<p class="meeting-salle"><i class="fas fa-door-open"></i> ${meeting.salle}</p>` : ''}
      ${participantsHTML}
      ${isTeamsMeeting ? `<button class="meeting-join-btn" data-url="${meetingUrl}"><i class="fas fa-video"></i> Rejoindre</button>` : ''}
    </div>
  `;
}

/**
 * Initialise les minuteurs pour les réunions
 */
function initializeMeetingTimers() {
  // Attacher les événements aux boutons de réunion
  document.querySelectorAll('.meeting-join-btn').forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      
      // Récupérer l'URL depuis le bouton ou le parent
      const url = button.getAttribute('data-url') || button.parentElement.getAttribute('data-url');
      const meetingId = button.getAttribute('data-meeting-id') || button.parentElement.getAttribute('data-id');
      
      if (url && url.trim() !== '') {
        // Ouvrir directement l'URL Teams
        window.open(url, '_blank');
        if (debugMode) console.log(`Ouverture de la réunion Teams avec URL: ${url}`);
      } else if (meetingId) {
        // Utiliser le système de jointure avec l'ID
        if (window.JoinSystem) {
          if (debugMode) console.log(`Utilisation de JoinSystem avec ID: ${meetingId}`);
          
          // Remplir le champ d'ID
          const meetingIdInput = document.getElementById('meeting-id') || 
                                document.getElementById('meetingIdInput');
          if (meetingIdInput) {
            meetingIdInput.value = meetingId;
            
            // Déclencher la fonction de jointure
            window.JoinSystem.joinMeetingWithId();
          } else {
            console.error("Champ d'ID de réunion introuvable");
            alert("Erreur: Champ d'ID de réunion introuvable");
          }
        } else {
          // Fallback si JoinSystem n'est pas disponible
          console.warn("Join system non disponible, utilisation du fallback");
          const teamsUrl = `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${meetingId}%40thread.v2/0`;
          window.open(teamsUrl, '_blank');
        }
      } else {
        console.error("Aucune URL ou ID de réunion trouvé");
        alert("Impossible de rejoindre cette réunion: URL ou ID manquant");
      }
    });
  });
  
  // Mettre à jour immédiatement les timers
  updateMeetingTimers();
}

/**
 * Initialise les boutons pour afficher tous les participants
 */
function initializeParticipantsPopups() {
  // Gérer les clics sur "voir plus"
  document.querySelectorAll('.show-more-participants').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const meetingId = this.getAttribute('data-meeting-id');
      const popup = document.getElementById(`participants-${meetingId}`);
      
      if (popup) {
        // Positionner la popup près du bouton
        const rect = this.getBoundingClientRect();
        popup.style.position = 'fixed';
        popup.style.top = `${rect.bottom + 10}px`;
        popup.style.left = `${rect.left}px`;
        popup.style.display = 'block';
        
        // Ajouter un gestionnaire d'événements global pour fermer la popup lors d'un clic ailleurs
        document.addEventListener('click', function closePopup(event) {
          if (!popup.contains(event.target) && event.target !== button) {
            popup.style.display = 'none';
            document.removeEventListener('click', closePopup);
          }
        });
      }
    });
  });
  
  // Gérer les boutons de fermeture dans les popups
  document.querySelectorAll('.close-participants').forEach(button => {
    button.addEventListener('click', function() {
      const meetingId = this.getAttribute('data-meeting-id');
      const popup = document.getElementById(`participants-${meetingId}`);
      if (popup) popup.style.display = 'none';
    });
  });
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
  if (debugMode) console.log("Initialisation du système de réunions amélioré");
  
  // Bouton de rafraîchissement manuel
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      if (debugMode) console.log("Rafraîchissement manuel des réunions");
      fetchMeetings(true);
    });
  }
  
  // Premier chargement des réunions
  fetchMeetings(true);
  
  // Rafraîchissement périodique plus fréquent
  const refreshInterval = 10000; // 10 secondes
  if (debugMode) console.log(`Configuration du rafraîchissement automatique toutes les ${refreshInterval/1000} secondes`);
  
  setInterval(() => {
    fetchMeetings(false);
  }, refreshInterval);
  
  // Mise à jour des timers plus fréquente
  const timerInterval = 30000; // 30 secondes
  setInterval(updateMeetingTimers, timerInterval);
  
  // Détection de focus sur la fenêtre pour rafraîchir après une inactivité
  window.addEventListener('focus', () => {
    const now = Date.now();
    // Si la dernière mise à jour date de plus de 30 secondes, force un rafraîchissement
    if (now - lastRefreshTime > 30000) {
      if (debugMode) console.log("Rafraîchissement après retour sur la fenêtre");
      fetchMeetings(true);
    }
  });
});

// Fonction globale pour rafraîchir les réunions (utilisée par d'autres modules)
window.fetchMeetings = fetchMeetings;
