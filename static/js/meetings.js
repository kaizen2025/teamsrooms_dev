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
// Ajouter une variable pour stocker la dernière heure de synchronisation
let lastSyncTimeFormatted = '';

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
    // CHANGEMENT: Ne jamais montrer le chargement sauf si explicitement demandé ou premier chargement
    const now = Date.now();
    const hasExistingMeetings = meetingsContainer.querySelector('.meeting-item') !== null;
    const shouldShowLoading = forceVisibleUpdate || isFirstLoad || !hasExistingMeetings;
    
    // Afficher l'indicateur de chargement uniquement si nécessaire
    let loadingIndicator = null;
    if (shouldShowLoading) {
      // Sauvegarder le contenu original uniquement si on va montrer le chargement
      const originalContent = meetingsContainer.innerHTML;
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
      if (debugMode) console.log(`Mise à jour complète de l'affichage (${meetings.length} réunions)`);
    } else {
      // Mise à jour silencieuse - uniquement mettre à jour les timers et états
      updateMeetingTimers();
      if (debugMode) console.log("Mise à jour des timers uniquement");
    }
    
    // NOUVEAU: Mettre à jour l'heure de dernière synchronisation
    lastVisibleUpdate = now;
    lastRefreshTime = now;
    
    // Formater l'heure de dernière synchronisation
    const syncDate = new Date(now);
    lastSyncTimeFormatted = syncDate.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
    
    // Mettre à jour l'affichage de l'heure de dernière synchronisation
    updateLastSyncTimeDisplay();
    
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
 * Fonction pour mettre à jour l'affichage de la dernière heure de synchronisation
 */
function updateLastSyncTimeDisplay() {
  // Trouver ou créer l'élément d'affichage de la dernière synchronisation
  let lastSyncDisplay = document.getElementById('last-sync-time');
  
  if (!lastSyncDisplay) {
    // Créer l'élément s'il n'existe pas
    lastSyncDisplay = document.createElement('div');
    lastSyncDisplay.id = 'last-sync-time';
    lastSyncDisplay.className = 'last-sync-time';
    lastSyncDisplay.style.cssText = `
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.7);
      text-align: center;
      margin-top: 5px;
      padding: 2px 5px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.05);
    `;
    
    // Trouver le bouton de rafraîchissement
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn && refreshBtn.parentNode) {
      // Insérer après le bouton de rafraîchissement
      refreshBtn.parentNode.insertBefore(lastSyncDisplay, refreshBtn.nextSibling);
    } else {
      // Fallback: ajouter au conteneur de contrôles
      const controlsContainer = document.querySelector('.control-buttons');
      if (controlsContainer) {
        controlsContainer.appendChild(lastSyncDisplay);
      }
    }
  }
  
  // Mettre à jour le texte
  if (lastSyncTimeFormatted) {
    lastSyncDisplay.innerHTML = `<i class="fas fa-history"></i> Dernière synchro: ${lastSyncTimeFormatted}`;
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
  
  // Affichage des participants - Version améliorée selon paste.txt
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
 * Initialise les popups pour afficher tous les participants
 * Version améliorée selon paste.txt
 */
function initializeParticipantsPopups() {
  // Ajouter des styles améliorés pour les popups de participants
  if (!document.getElementById('participants-popup-styles')) {
    const styles = document.createElement('style');
    styles.id = 'participants-popup-styles';
    styles.textContent = `
      .meeting-participants {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 4px 0;
      }
      
      .show-more-participants {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: #ddd;
        cursor: pointer;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        margin-left: 4px;
      }
      
      .show-more-participants:hover {
        background-color: rgba(255, 255, 255, 0.2);
        transform: scale(1.1);
      }
      
      .participants-popup {
        position: fixed;
        z-index: 1000;
        background-color: #2c2c2c;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
        width: 300px;
        max-width: 90vw;
        max-height: 80vh;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.15);
        opacity: 0;
        transform: translateY(-10px);
        transition: opacity 0.3s ease, transform 0.3s ease;
        display: none;
      }
      
      .participants-popup.visible {
        opacity: 1;
        transform: translateY(0);
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
        transition: transform 0.2s ease;
        width: 25px;
        height: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }
      
      .close-participants:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: scale(1.1);
      }
      
      .participants-list {
        padding: 10px 15px;
        overflow-y: auto;
        max-height: 300px;
      }
      
      .participant-item {
        padding: 8px 10px;
        border-radius: 4px;
        margin-bottom: 4px;
        color: #ddd;
        transition: background-color 0.2s ease;
      }
      
      .participant-item:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }
    `;
    document.head.appendChild(styles);
  }

  // Supprimer les popups existants pour éviter les doublons
  document.querySelectorAll('.participants-popup').forEach(popup => {
    popup.remove();
  });

  // Recréer les popups avec le bon positionnement et les bons styles
  document.querySelectorAll('.meeting-item').forEach(meetingItem => {
    const meetingId = meetingItem.getAttribute('data-id');
    if (!meetingId) return;

    // Trouver le bouton "voir plus"
    const moreButton = meetingItem.querySelector('.show-more-participants');
    if (!moreButton) return;

    // Créer une nouvelle popup pour cet élément
    const popup = document.createElement('div');
    popup.id = `participants-${meetingId}`;
    popup.className = 'participants-popup';
    
    // Obtenir les participants depuis l'attribut de données ou l'élément
    let participants = [];
    
    // Trouver les participants à partir du HTML existant
    const participantsElement = meetingItem.querySelector('.meeting-participants');
    if (participantsElement) {
      const text = participantsElement.textContent.trim();
      // Extraire seulement la partie participants, en excluant l'icône et le texte "voir plus"
      const parts = text.split(',');
      if (parts.length > 0) {
        // Nettoyer les participants
        participants = parts.map(p => p.trim())
          .filter(p => p && !p.includes('...') && !p.includes('voir plus'));
      }
    }
    
    // Préparer le contenu de la popup
    popup.innerHTML = `
      <div class="participants-popup-content">
        <div class="participants-popup-header">
          <h4><i class="fas fa-users"></i> Participants (${participants.length})</h4>
          <button class="close-participants" data-meeting-id="${meetingId}">&times;</button>
        </div>
        <div class="participants-list">
          ${participants.map(p => `<div class="participant-item"><i class="fas fa-user"></i> ${p}</div>`).join('')}
          ${participants.length === 0 ? '<div class="participant-item">Aucun participant trouvé</div>' : ''}
        </div>
      </div>
    `;
    
    // Ajouter la popup au document
    document.body.appendChild(popup);
    
    // Gérer le clic sur le bouton "voir plus"
    moreButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Fermer toutes les autres popups
      document.querySelectorAll('.participants-popup').forEach(p => {
        if (p.id !== `participants-${meetingId}`) {
          p.style.display = 'none';
          p.classList.remove('visible');
        }
      });
      
      // Positionner et afficher cette popup
      const rect = this.getBoundingClientRect();
      popup.style.position = 'fixed';
      popup.style.top = `${rect.bottom + 10}px`;
      
      // Ajuster horizontalement pour éviter de sortir de l'écran
      const leftPos = Math.min(rect.left, window.innerWidth - 320);
      popup.style.left = `${leftPos}px`;
      
      // Afficher avec animation
      popup.style.display = 'block';
      
      // Forcer un reflow pour que l'animation fonctionne
      popup.offsetHeight;
      
      // Ajouter la classe visible pour l'animation
      popup.classList.add('visible');
      
      // Ajouter un gestionnaire d'événements global pour fermer la popup lors d'un clic ailleurs
      document.addEventListener('click', function closePopup(event) {
        if (!popup.contains(event.target) && event.target !== moreButton) {
          popup.classList.remove('visible');
          
          // Cacher complètement après la fin de l'animation
          setTimeout(() => {
            popup.style.display = 'none';
          }, 300);
          
          document.removeEventListener('click', closePopup);
        }
      });
    });
  });
  
  // Gérer les boutons de fermeture dans les popups
  document.querySelectorAll('.close-participants').forEach(button => {
    button.addEventListener('click', function() {
      const meetingId = this.getAttribute('data-meeting-id');
      const popup = document.getElementById(`participants-${meetingId}`);
      
      if (popup) {
        // Animer la fermeture
        popup.classList.remove('visible');
        
        // Cacher complètement après la fin de l'animation
        setTimeout(() => {
          popup.style.display = 'none';
        }, 300);
      }
    });
  });
}
