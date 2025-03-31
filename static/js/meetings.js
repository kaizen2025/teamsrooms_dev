/**
 * Gestion des réunions
 * Version améliorée avec synchronisation en temps réel et filtrage précis par salle
 * MODIFICATION : Suppression de l'affichage "Dernière synchro"
 */

// Variables globales pour le système de réunions
let previousMeetings = JSON.stringify([]);
let isLoadingMeetings = false;
let lastVisibleUpdate = 0;
const MIN_VISIBLE_UPDATE_INTERVAL = 30000; // 30 secondes minimum entre les mises à jour visibles
let meetingsContainer = null;
let isFirstLoad = true;
let lastRefreshTime = Date.now();
let debugMode = window.APP_CONFIG?.DEBUG ?? false; // Utiliser la config globale si dispo

/**
 * Récupère les réunions depuis l'API
 * @param {boolean} forceVisibleUpdate - Force une mise à jour visible même si l'intervalle minimum n'est pas atteint
 * @returns {Promise<void>}
 */
async function fetchMeetings(forceVisibleUpdate = false) {
  // Éviter les requêtes multiples simultanées
  if (isLoadingMeetings) {
    if (debugMode) console.log("fetchMeetings: Requête déjà en cours, ignorée.");
    return Promise.resolve(); // Retourne une promesse résolue
  }
  isLoadingMeetings = true;
  if (debugMode) console.log(`fetchMeetings: Début (forceVisibleUpdate: ${forceVisibleUpdate})`);

  return new Promise(async (resolve, reject) => { // Envelopper dans une promesse
      try {
        // Récupérer le conteneur une fois pour éviter les sélections multiples
        if (!meetingsContainer) {
          meetingsContainer = document.getElementById('meetingsContainer') || document.querySelector('.meetings-list');
          if (!meetingsContainer) {
            console.error("Conteneur de réunions introuvable (meetingsContainer ou .meetings-list)");
            isLoadingMeetings = false;
            return reject(new Error("Conteneur de réunions introuvable")); // Rejeter la promesse
          }
        }

        // Déterminer si nous devons afficher l'indicateur de chargement
        const now = Date.now();
        const hasExistingMeetings = meetingsContainer.querySelector('.meeting-item') !== null;
        // Afficher le chargement si forcé, au premier chargement, ou s'il n'y a pas de réunions affichées
        const shouldShowLoading = forceVisibleUpdate || isFirstLoad || !hasExistingMeetings;

        let loadingIndicator = null;
        if (shouldShowLoading) {
          if (debugMode) console.log("fetchMeetings: Affichage de l'indicateur de chargement");
          loadingIndicator = document.createElement('div');
          loadingIndicator.className = 'loading-indicator';
          loadingIndicator.innerHTML = `
            <i class="fas fa-circle-notch fa-spin"></i>
            <span>Chargement des réunions...</span>
            <p class="loading-detail">Mise à jour en cours...</p>
          `;
          meetingsContainer.innerHTML = ''; // Vider avant d'ajouter le loader
          meetingsContainer.appendChild(loadingIndicator);
        } else {
          if (debugMode) console.log("fetchMeetings: Mise à jour silencieuse en arrière-plan");
        }

        // URL de l'API
        const apiUrl = window.API_URLS?.GET_MEETINGS || '/meetings.json';
        const cacheBust = `?t=${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        const fullUrl = `${apiUrl}${cacheBust}`;

        if (debugMode) console.log(`fetchMeetings: Requête API vers ${fullUrl}`);

        const response = await fetch(fullUrl);

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
        }

        let meetings = await response.json();
        if (debugMode) console.log(`fetchMeetings: Réunions brutes reçues: ${meetings.length}`);

        // Filtrage par salle si nécessaire
        const salleName = window.resourceName || window.salleName;
        const isAllRooms = !salleName || salleName.toLowerCase() === 'toutes les salles';
        if (debugMode) console.log(`fetchMeetings: Filtrage pour: "${salleName}", isAllRooms: ${isAllRooms}`);

        if (!isAllRooms && salleName) {
          const normalizedSalleName = salleName.toLowerCase().trim();
          const originalCount = meetings.length;
          meetings = meetings.filter(m =>
             m.salle && (
                m.salle.toLowerCase().trim() === normalizedSalleName ||
                m.salle.toLowerCase().trim().includes(normalizedSalleName) || // Tolérance
                normalizedSalleName.includes(m.salle.toLowerCase().trim()) // Tolérance inverse
            )
          );
          if (debugMode) console.log(`fetchMeetings: Réunions après filtrage salle: ${meetings.length}/${originalCount}`);
        }

        // Validation et filtrage par date (aujourd'hui et demain)
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const dayAfterTomorrow = new Date(today); dayAfterTomorrow.setDate(today.getDate() + 2);

        meetings = meetings.filter(m => {
          if (!m.start || !m.end) {
            console.warn(`Réunion ignorée (date invalide): ${m.subject}`);
            return false;
          }
          try {
            const meetingDate = new Date(m.start);
            return meetingDate >= today && meetingDate < dayAfterTomorrow;
          } catch (e) {
            console.error(`Erreur date réunion ${m.subject}: ${e.message}`);
            return false;
          }
        });
         if (debugMode) console.log(`fetchMeetings: Réunions après filtrage date: ${meetings.length}`);

        // Tri des réunions par heure de début
        meetings.sort((a, b) => new Date(a.start) - new Date(b.start));

        // Vérifier si les données ont changé
        const currentMeetingsString = JSON.stringify(meetings);
        const dataChanged = previousMeetings !== currentMeetingsString;
         if (debugMode) console.log(`fetchMeetings: Données changées: ${dataChanged}`);

        previousMeetings = currentMeetingsString; // Mémoriser les nouvelles données

        // Mise à jour de l'affichage ou des timers
        if (shouldShowLoading || dataChanged) {
          updateMeetingsDisplay(meetings);
          if (debugMode) console.log(`fetchMeetings: Mise à jour complète de l'affichage.`);
        } else {
          updateMeetingTimers();
          if (debugMode) console.log("fetchMeetings: Mise à jour des timers uniquement.");
        }

        // Mise à jour de l'heure de la dernière tentative de rafraîchissement
        lastRefreshTime = now;
        isFirstLoad = false; // Marquer que le premier chargement est terminé
        resolve(); // Résoudre la promesse

      } catch (error) {
        console.error("fetchMeetings: Erreur lors du chargement des réunions:", error);
        // Afficher l'erreur uniquement si on était censé afficher le chargement
        if (document.querySelector('.loading-indicator') || isFirstLoad) {
           if (meetingsContainer) {
                meetingsContainer.innerHTML = `
                  <div class="empty-meetings-message error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Impossible de charger les réunions.</p>
                    <p class="error-detail">${error.message}</p>
                    <button id="retryBtn" class="btn btn-primary">
                      <i class="fas fa-sync-alt"></i> Réessayer
                    </button>
                  </div>
                `;
                const retryBtn = document.getElementById('retryBtn');
                if (retryBtn) {
                  retryBtn.addEventListener('click', () => fetchMeetings(true));
                }
           }
        }
        reject(error); // Rejeter la promesse en cas d'erreur
      } finally {
        isLoadingMeetings = false;
        if (debugMode) console.log("fetchMeetings: Terminé.");
      }
  }); // Fin de la promesse
}

/**
 * Fonction pour afficher la dernière heure de synchronisation (SUPPRIMÉE)
 * function updateLastSyncTimeDisplay() { ... }
 * L'appel à cette fonction a également été retiré de fetchMeetings
 */

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
  if (debugMode) console.log(`updateMeetingsDisplay: Mise à jour avec ${meetings.length} réunions.`);

  meetingsContainer.innerHTML = ''; // Vider le conteneur

  if (meetings.length === 0) {
    const salleName = window.resourceName || window.salleName;
    const isAllRooms = !salleName || salleName.toLowerCase() === 'toutes les salles';
    const message = isAllRooms
        ? "Aucune réunion prévue aujourd'hui."
        : `Aucune réunion prévue aujourd'hui pour la salle ${salleName}.`;

    meetingsContainer.innerHTML = `
      <div class="empty-meetings-message">
        <i class="fas fa-calendar-day"></i>
        <p>${message}</p>
      </div>
    `;
    return;
  }

  const now = new Date();
  const currentMeetings = [], upcomingMeetings = [], pastMeetings = [];

  // Classer les réunions
  meetings.forEach(meeting => {
    const startTime = new Date(meeting.start);
    const endTime = new Date(meeting.end);
    const adjustedNow = new Date(now.getTime() + (1 * 60 * 1000)); // Marge 1 min pour "en cours"

    if (startTime <= adjustedNow && endTime > now) { // endTime > now (et non adjustedNow)
      currentMeetings.push({ ...meeting, status: 'current' });
    } else if (startTime > now) {
      upcomingMeetings.push({ ...meeting, status: 'upcoming' });
    } else {
      pastMeetings.push({ ...meeting, status: 'past' });
    }
  });

  let sectionsHTML = '';

  // Générer HTML pour chaque section
  const createSection = (title, icon, meetingsList) => {
    if (meetingsList.length === 0) return '';
    let html = `<div class="status-section"><h4><i class="${icon}"></i> ${title}</h4></div>`;
    meetingsList.forEach(m => html += createMeetingHTML(m));
    return html;
  };

  sectionsHTML += createSection('En cours', 'fas fa-play-circle', currentMeetings);
  sectionsHTML += createSection('À venir', 'fas fa-clock', upcomingMeetings);
  sectionsHTML += createSection('Terminées', 'fas fa-check-circle', pastMeetings);

  meetingsContainer.innerHTML = sectionsHTML;

  // Initialiser les timers et popups après l'insertion du HTML
  initializeMeetingTimers();
  initializeParticipantsPopups();

  // S'assurer que les boutons rejoindre sont fonctionnels (Appelé depuis interface-improvements)
  // fixJoinButtonsFunctionality(); // Peut être redondant si l'observer fonctionne bien
}


/**
 * Crée le HTML pour une réunion
 */
function createMeetingHTML(meeting) {
  const startTime = new Date(meeting.start);
  const endTime = new Date(meeting.end);
  const now = new Date();

  const formatTime = (date) => date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const startTimeStr = formatTime(startTime);
  const endTimeStr = formatTime(endTime);

  let statusClass = meeting.status || '';
  let progressHTML = '';

  if (meeting.status === 'current') {
    statusClass = 'current';
    const totalDuration = endTime - startTime;
    const elapsed = Math.max(0, now - startTime); // Assurer >= 0
    const progress = totalDuration > 0 ? Math.min(100, (elapsed / totalDuration) * 100) : 0;
    const remainingMs = Math.max(0, endTime - now); // Assurer >= 0
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    let remainingText = '';
     if (remainingMinutes > 0) {
         remainingText = remainingMinutes < 60
            ? `${remainingMinutes} min`
            : `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}min`;
         remainingText = `<span class="time-remaining"><i class="fas fa-hourglass-half"></i> ${remainingText}</span>`;
     } else {
         remainingText = `<span class="time-remaining ending"><i class="fas fa-flag-checkered"></i> Se termine</span>`;
     }


    progressHTML = `
      <div class="meeting-status-indicator">
          <div class="meeting-status-badge current-badge">En cours</div>
          <div class="meeting-progress-container">
            <div class="meeting-progress-bar" style="width: ${progress}%"></div>
          </div>
          <div class="time-info">
             <span>${startTimeStr} - ${endTimeStr}</span>
             ${remainingText}
          </div>
      </div>
    `;
  } else if (meeting.status === 'upcoming') {
     statusClass = 'upcoming';
     // Afficher "Dans X minutes/heures"
     const diffMs = startTime - now;
     const diffMinutes = Math.round(diffMs / 60000);
     let startsInText = '';
     if (diffMinutes <= 0) {
         startsInText = 'Commence bientôt';
     } else if (diffMinutes < 60) {
         startsInText = `Dans ${diffMinutes} min`;
     } else {
         startsInText = `Dans ${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}min`;
     }
     progressHTML = `<div class="meeting-status-badge upcoming-badge"><i class="far fa-clock"></i> ${startsInText}</div>`;

  } else { // Past
     statusClass = 'past';
     progressHTML = `<div class="meeting-status-badge past-badge"><i class="fas fa-check"></i> Terminée</div>`;
  }

  const isTeamsMeeting = meeting.isOnline || meeting.joinUrl;
  const meetingUrl = meeting.joinUrl || '';

  // Gestion des participants
  let participantsHTML = '';
  let allParticipantsList = [];
  if (meeting.attendees && meeting.attendees.length > 0) {
    const salleMails = Object.values(window.SALLES || {}).map(mail => mail ? mail.toLowerCase() : '');
    allParticipantsList = meeting.attendees.filter(mail => mail && !salleMails.includes(mail.toLowerCase()));

    if (allParticipantsList.length > 0) {
      const previewParticipants = allParticipantsList.slice(0, 2); // Max 2 en preview
      const hasMore = allParticipantsList.length > 2;
      participantsHTML = `
        <p class="meeting-participants">
          <i class="fas fa-users"></i>
          ${previewParticipants.join(', ')}
          ${hasMore ?
            `<button class="show-more-participants" data-meeting-id="${meeting.id}" title="Voir tous les participants (${allParticipantsList.length})">
              +${allParticipantsList.length - 2}
             </button>` :
            ''}
        </p>
      `;
    }
  }

   // Générer la popup si nécessaire (et si elle n'existe pas déjà)
   if (allParticipantsList.length > 2 && !document.getElementById(`participants-${meeting.id}`)) {
        const popup = document.createElement('div');
        popup.id = `participants-${meeting.id}`;
        popup.className = 'participants-popup'; // Assurez-vous que le style CSS cible cette classe
        popup.style.display = 'none'; // Cachée par défaut
        popup.innerHTML = `
          <div class="participants-popup-content">
            <div class="participants-popup-header">
              <h4><i class="fas fa-users"></i> Participants (${allParticipantsList.length})</h4>
              <button class="close-participants" data-meeting-id="${meeting.id}" title="Fermer">×</button>
            </div>
            <div class="participants-list">
              ${allParticipantsList.map(p => `<div class="participant-item"><i class="fas fa-user"></i> ${p}</div>`).join('')}
            </div>
          </div>
        `;
        document.body.appendChild(popup); // Ajouter au body pour le positionnement fixe
   }


  return `
    <div class="meeting-item ${statusClass}"
         data-id="${meeting.id}"
         data-start="${meeting.start}"
         data-end="${meeting.end}"
         data-is-teams="${isTeamsMeeting}"
         ${meetingUrl ? `data-url="${meetingUrl}"` : ''}>
      <div class="meeting-header">
         <h3>${meeting.subject}</h3>
         ${isTeamsMeeting && meeting.status !== 'past' ? `<button class="meeting-join-btn" ${meetingUrl ? `data-url="${meetingUrl}"` : ''}><i class="fas fa-video"></i> Rejoindre</button>` : ''}
      </div>
       ${progressHTML}
       <div class="meeting-details">
           <p class="meeting-time"><i class="far fa-clock"></i> ${startTimeStr} - ${endTimeStr}</p>
           ${meeting.salle ? `<p class="meeting-salle"><i class="fas fa-door-open"></i> ${meeting.salle}</p>` : ''}
           ${participantsHTML}
       </div>
    </div>
  `;
}


/**
 * Met à jour les chronomètres et barres de progression toutes les minutes
 */
function updateMeetingTimers() {
  const now = new Date();
  if (debugMode) console.log("updateMeetingTimers: Mise à jour des états/timers");

  document.querySelectorAll('.meeting-item').forEach(item => {
    const startAttr = item.dataset.start;
    const endAttr = item.dataset.end;
    if (!startAttr || !endAttr) return;

    const startTime = new Date(startAttr);
    const endTime = new Date(endAttr);
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) return;

    const isCurrent = startTime <= now && endTime > now;
    const isPast = endTime <= now;
    const isUpcoming = startTime > now;

    let needsFullUpdate = false; // Flag pour redessiner si le statut change drastiquement

    // --- Mise à jour du statut ---
    if (isCurrent && !item.classList.contains('current')) {
        item.classList.remove('upcoming', 'past');
        item.classList.add('current');
        needsFullUpdate = true; // Redessiner pour ajouter/maj badge/progression
    } else if (isPast && !item.classList.contains('past')) {
        item.classList.remove('current', 'upcoming');
        item.classList.add('past');
        needsFullUpdate = true; // Redessiner pour montrer badge "Terminée"
    } else if (isUpcoming && !item.classList.contains('upcoming')) {
        item.classList.remove('current', 'past');
        item.classList.add('upcoming');
        needsFullUpdate = true; // Redessiner pour montrer badge "A venir"
    }

    // Si le statut a changé, on pourrait reconstruire le HTML de l'item
    // Pour simplifier ici, on met juste à jour les éléments internes si 'current'
     if (item.classList.contains('current')) {
        const totalDuration = endTime - startTime;
        const elapsed = Math.max(0, now - startTime);
        const progress = totalDuration > 0 ? Math.min(100, (elapsed / totalDuration) * 100) : 0;
        const remainingMs = Math.max(0, endTime - now);
        const remainingMinutes = Math.ceil(remainingMs / 60000);
        let remainingText = '';
        if (remainingMinutes > 0) {
            remainingText = remainingMinutes < 60
               ? `${remainingMinutes} min`
               : `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}min`;
            remainingText = `<span class="time-remaining"><i class="fas fa-hourglass-half"></i> ${remainingText}</span>`;
        } else {
             remainingText = `<span class="time-remaining ending"><i class="fas fa-flag-checkered"></i> Se termine</span>`;
        }


        const progressBar = item.querySelector('.meeting-progress-bar');
        if (progressBar) progressBar.style.width = `${progress}%`;

        const timeRemainingEl = item.querySelector('.time-remaining');
        // Le HTML contient déjà l'icône, on met juste à jour le contenu texte
        const timeInfoDiv = item.querySelector('.time-info');
         if (timeInfoDiv) {
             // Reconstruire le contenu de time-info pour s'assurer que l'élément existe
             const startTimeStr = formatTime(startTime);
             const endTimeStr = formatTime(endTime);
              timeInfoDiv.innerHTML = `<span>${startTimeStr} - ${endTimeStr}</span> ${remainingText}`;
         }

        // Assurer que le badge "En cours" est là
        let badge = item.querySelector('.meeting-status-badge');
        if (!badge || !badge.classList.contains('current-badge')) {
             if (badge) badge.remove(); // Supprimer ancien badge si type différent
             badge = document.createElement('div');
             badge.className = 'meeting-status-badge current-badge';
             badge.textContent = 'En cours';
             const indicatorDiv = item.querySelector('.meeting-status-indicator');
             if(indicatorDiv) indicatorDiv.prepend(badge);
        }

     } else if (item.classList.contains('upcoming')) {
         // Mettre à jour le badge "A venir"
         const diffMs = startTime - now;
         const diffMinutes = Math.round(diffMs / 60000);
         let startsInText = '';
          if (diffMinutes <= 0) {
             startsInText = 'Commence bientôt';
         } else if (diffMinutes < 60) {
             startsInText = `Dans ${diffMinutes} min`;
         } else {
             startsInText = `Dans ${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}min`;
         }
         let badge = item.querySelector('.meeting-status-badge');
         const expectedHTML = `<i class="far fa-clock"></i> ${startsInText}`;
         if (!badge || !badge.classList.contains('upcoming-badge')) {
             if (badge) badge.remove();
             badge = document.createElement('div');
             badge.className = 'meeting-status-badge upcoming-badge';
             badge.innerHTML = expectedHTML;
             // Insérer après le header
             const header = item.querySelector('.meeting-header');
             if(header) header.insertAdjacentElement('afterend', badge); else item.prepend(badge);
         } else {
              // Juste mettre à jour le texte si le badge existe déjà
              badge.innerHTML = expectedHTML;
         }
         // S'assurer qu'il n'y a pas de barre de progression
         item.querySelectorAll('.meeting-progress-container, .time-info').forEach(el => el.remove());

     } else if (item.classList.contains('past')) {
          // S'assurer que le badge "Terminée" est là
         let badge = item.querySelector('.meeting-status-badge');
         if (!badge || !badge.classList.contains('past-badge')) {
             if (badge) badge.remove();
             badge = document.createElement('div');
             badge.className = 'meeting-status-badge past-badge';
             badge.innerHTML = `<i class="fas fa-check"></i> Terminée`;
             const header = item.querySelector('.meeting-header');
             if(header) header.insertAdjacentElement('afterend', badge); else item.prepend(badge);
         }
          // S'assurer qu'il n'y a pas de barre de progression
         item.querySelectorAll('.meeting-progress-container, .time-info').forEach(el => el.remove());
         // Désactiver le bouton rejoindre si encore présent
         const joinBtn = item.querySelector('.meeting-join-btn');
         if (joinBtn) joinBtn.disabled = true;
     }

  });
}


/**
 * Initialise les minuteurs pour mettre à jour l'état des réunions
 */
function initializeMeetingTimers() {
  if (debugMode) console.log("initializeMeetingTimers: Initialisation des timers");
  updateMeetingTimers(); // Mettre à jour immédiatement
  // Pas besoin d'intervalle ici si updateMeetingTimers est appelé par le refresh global
}


/**
 * Initialise les popups pour afficher tous les participants
 */
function initializeParticipantsPopups() {
   if (debugMode) console.log("initializeParticipantsPopups: Initialisation des popups participants");
  // La logique est maintenant gérée par délégation dans meetings.js via initializeParticipantsPopupsStylesAndLogic

  // Assurer que les styles et la logique sont présents (appel unique)
  initializeParticipantsPopupsStylesAndLogic();
}

/**
 * Ajoute les styles et la logique pour les popups participants une seule fois
 */
let participantsLogicInitialized = false;
function initializeParticipantsPopupsStylesAndLogic() {
    if (participantsLogicInitialized) return;
    participantsLogicInitialized = true;

    if (debugMode) console.log("initializeParticipantsPopupsStylesAndLogic: Configuration unique styles et logique");

    // Ajouter les styles CSS (si non déjà présents)
    if (!document.getElementById('participants-popup-styles')) {
        const styles = document.createElement('style');
        styles.id = 'participants-popup-styles';
        styles.textContent = `
            .show-more-participants {
                display: inline-flex; align-items: center; justify-content: center;
                min-width: 24px; height: 24px; padding: 0 6px;
                background: rgba(255, 255, 255, 0.1); border: none; border-radius: 12px; /* Bouton pilule */
                color: #ddd; font-size: 11px; font-weight: 600; cursor: pointer;
                margin-left: 8px; transition: background-color 0.2s; vertical-align: middle;
            }
            .show-more-participants:hover { background: rgba(255, 255, 255, 0.2); }
            .participants-popup {
                position: fixed; z-index: 1051; /* Au dessus des modals standards */
                background: #333; border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.5); width: 300px; max-height: 400px;
                border: 1px solid rgba(255, 255, 255, 0.2); overflow: hidden;
                display: none; /* Caché par défaut */
                color: #eee;
            }
            .participants-popup-content { display: flex; flex-direction: column; max-height: 400px; }
            .participants-popup-header {
                display: flex; justify-content: space-between; align-items: center;
                padding: 10px 15px; background: #444; border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            .participants-popup-header h4 { margin: 0; font-size: 1rem; color: white; }
            .close-participants { background: none; border: none; color: #ccc; font-size: 1.4rem; cursor: pointer; line-height: 1; padding: 0 5px;}
            .close-participants:hover { color: white; }
            .participants-list { padding: 5px 0; overflow-y: auto; flex-grow: 1; }
            .participant-item { display: flex; align-items: center; gap: 8px; padding: 7px 15px; font-size: 0.9rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
            .participant-item:last-child { border-bottom: none; }
            .participant-item i { color: #aaa; }
        `;
        document.head.appendChild(styles);
    }

    // Logique de délégation d'événements pour afficher/masquer
    document.body.addEventListener('click', function(e) {
        const showMoreButton = e.target.closest('.show-more-participants');
        const closeButton = e.target.closest('.close-participants');
        const openedPopup = document.querySelector('.participants-popup[style*="display: block"]');

        if (showMoreButton) {
            e.preventDefault();
            e.stopPropagation();
            const meetingId = showMoreButton.getAttribute('data-meeting-id');
            const popup = document.getElementById(`participants-${meetingId}`);

            if (popup) {
                // Fermer une autre popup ouverte
                if (openedPopup && openedPopup !== popup) {
                    openedPopup.style.display = 'none';
                }

                // Positionner et afficher la popup
                const rect = showMoreButton.getBoundingClientRect();
                popup.style.display = 'block'; // Afficher d'abord pour calculer la hauteur

                const popupHeight = popup.offsetHeight;
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;

                // Position verticale : en dessous si assez de place, sinon au dessus
                if (spaceBelow >= popupHeight + 10) {
                    popup.style.top = `${rect.bottom + 5}px`;
                } else if (spaceAbove >= popupHeight + 10) {
                     popup.style.top = `${rect.top - popupHeight - 5}px`;
                } else { // Pas assez de place ni en haut ni en bas, centrer verticalement
                     popup.style.top = `${Math.max(10, (window.innerHeight - popupHeight) / 2)}px`;
                }

                 // Position horizontale : à gauche du bouton si possible, sinon aligné à droite de l'écran
                 popup.style.left = `${Math.max(10, rect.left - popup.offsetWidth + rect.width)}px`; // Essayer à gauche du bouton
                 const popupRect = popup.getBoundingClientRect();
                 if (popupRect.left < 10) { // Si ça sort à gauche, aligner à gauche de l'écran
                      popup.style.left = '10px';
                 }
                  if (popupRect.right > window.innerWidth - 10) { // Si ça sort à droite
                     popup.style.left = `${window.innerWidth - popup.offsetWidth - 10}px`;
                 }


            }
        } else if (closeButton) {
            e.preventDefault();
            const meetingId = closeButton.getAttribute('data-meeting-id');
            const popup = document.getElementById(`participants-${meetingId}`);
            if (popup) {
                popup.style.display = 'none';
            }
        } else if (openedPopup && !openedPopup.contains(e.target)) {
            // Fermer si clic en dehors de la popup ouverte
            openedPopup.style.display = 'none';
        }
    });
}


// --- Initialisation et Auto-Refresh ---

// Initialiser au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  if (debugMode) console.log("DOM Chargé: Initialisation du module Meetings.");
  fetchMeetings(true); // Premier chargement forcé visible

  // Configurer l'auto-refresh si activé
  const refreshInterval = window.APP_CONFIG?.REFRESH_INTERVAL || 10000; // 10 secondes par défaut
  const autoRefreshEnabled = window.APP_CONFIG?.AUTO_REFRESH !== false; // Activé par défaut

  if (autoRefreshEnabled) {
      if (debugMode) console.log(`Auto-refresh activé toutes les ${refreshInterval / 1000} secondes.`);
      setInterval(() => {
          // Rafraîchir silencieusement sauf si l'onglet est inactif depuis longtemps
          const timeSinceLastRefresh = Date.now() - lastRefreshTime;
          // Forcer une maj visible si > 5 mins sans refresh (ex: après mise en veille)
          const forceVisible = timeSinceLastRefresh > 300000;
          if (!document.hidden || forceVisible) { // Ne rafraîchit pas si l'onglet est caché (sauf si inactif depuis longtemps)
             fetchMeetings(forceVisible);
          } else {
             if (debugMode) console.log("Onglet caché, auto-refresh silencieux ignoré.");
          }
      }, refreshInterval);
  } else {
       if (debugMode) console.log("Auto-refresh désactivé.");
  }

  // Ajouter un listener pour rafraîchir quand l'onglet redevient visible
  document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
          const timeSinceLastRefresh = Date.now() - lastRefreshTime;
          if (timeSinceLastRefresh > (refreshInterval * 1.5)) { // Si plus de 1.5x l'intervalle s'est écoulé
             if (debugMode) console.log("Onglet visible après inactivité, rafraîchissement forcé.");
             fetchMeetings(true); // Forcer une mise à jour visible
          } else {
              if (debugMode) console.log("Onglet visible, rafraîchissement normal (silencieux).");
              fetchMeetings(false); // Rafraîchissement normal
          }
      }
  });
});

// Exposer fetchMeetings globalement pour le bouton refresh manuel
window.fetchMeetings = fetchMeetings;
