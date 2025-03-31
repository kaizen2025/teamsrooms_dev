// static/js/meetings.js

let meetingsData = []; // Stocker les données brutes
let currentMeetingsFilter = 'all'; // 'all' or room name
let meetingUpdateInterval;

// Fonction principale pour récupérer et afficher les réunions
async function fetchMeetings(forceRefresh = false) {
    const meetingsListContainer = document.getElementById('meetingsList');
    const loadingIndicator = document.getElementById('meetingsLoading');
    const emptyMessage = document.getElementById('meetingsEmpty');

    if (!meetingsListContainer || !loadingIndicator || !emptyMessage) {
        console.error("Éléments DOM manquants pour les réunions.");
        return;
    }

    // Afficher l'indicateur de chargement seulement si on force ou si la liste est vide
    if (forceRefresh || meetingsListContainer.children.length <= 1) { // <=1 pour ne pas compter les indicateurs
        loadingIndicator.style.display = 'flex';
        emptyMessage.style.display = 'none';
        if (!forceRefresh) meetingsListContainer.innerHTML = ''; // Vider seulement si pas de refresh forcé (pour éviter clignotement)
        meetingsListContainer.appendChild(loadingIndicator);
    }

    try {
        console.log(`Fetching meetings from ${window.API_URLS.GET_MEETINGS}`);
        const response = await fetch(window.API_URLS.GET_MEETINGS);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        meetingsData = await response.json();
        console.log(`Réunions récupérées: ${meetingsData.length}`);

        // Filtrer et afficher
        displayMeetings();

    } catch (error) {
        console.error("Erreur lors de la récupération des réunions:", error);
        meetingsListContainer.innerHTML = ''; // Vider en cas d'erreur
        emptyMessage.innerHTML = `<i class="fas fa-exclamation-triangle"></i><p>Impossible de charger les réunions.</p><p><small>${error.message}</small></p>`;
        emptyMessage.style.display = 'flex';
        loadingIndicator.style.display = 'none';
    } finally {
        // Masquer l'indicateur de chargement s'il n'est plus nécessaire
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        updateLastSyncTime(); // Mettre à jour l'heure de synchro
    }
}

// Fonction pour afficher les réunions filtrées
function displayMeetings() {
    const meetingsListContainer = document.getElementById('meetingsList');
    const loadingIndicator = document.getElementById('meetingsLoading');
    const emptyMessage = document.getElementById('meetingsEmpty');

    if (!meetingsListContainer || !loadingIndicator || !emptyMessage) return;

    const salleFilter = window.APP_CONTEXT?.resourceName || 'toutes les salles';
    const isAllRooms = salleFilter === 'toutes les salles';

    console.log(`Filtrage des réunions pour: "${salleFilter}", isAllRooms: ${isAllRooms}`);

    const filteredMeetings = meetingsData.filter(meeting =>
        isAllRooms || (meeting.salle && meeting.salle.toLowerCase() === salleFilter)
    );

    // Trier les réunions par date de début
    filteredMeetings.sort((a, b) => new Date(a.start) - new Date(b.start));

    // Classifier les réunions
    const now = new Date();
    console.log("Heure actuelle pour classification:", now.toISOString());

    const classifiedMeetings = {
        current: [],
        upcoming: [],
        past: []
    };

    filteredMeetings.forEach(meeting => {
        try {
            const start = new Date(meeting.start);
            const end = new Date(meeting.end);

            console.log(`Réunion: "${meeting.title}", Début: ${start.toISOString()}, Fin: ${end.toISOString()}`);

            if (isNaN(start) || isNaN(end)) {
                console.warn(`Dates invalides pour la réunion: ${meeting.title}`);
                classifiedMeetings.past.push(meeting); // Classer comme passée si dates invalides
            } else if (end < now) {
                console.log(`Classée comme terminée: ${meeting.title}`);
                classifiedMeetings.past.push(meeting);
            } else if (start <= now && end >= now) {
                 console.log(`Classée comme en cours: ${meeting.title}`);
                classifiedMeetings.current.push(meeting);
            } else if (start > now) {
                 console.log(`Classée comme à venir: ${meeting.title}`);
                classifiedMeetings.upcoming.push(meeting);
            } else {
                 console.warn(`Cas non classifié pour la réunion: ${meeting.title}`);
                 classifiedMeetings.past.push(meeting); // Sécurité
            }
        } catch(e) {
             console.error(`Erreur lors de la classification de la réunion ${meeting.title}:`, e);
             classifiedMeetings.past.push(meeting); // Classer comme passée en cas d'erreur
        }
    });

    // Construire le HTML
    let html = '';
    html += buildSectionHtml('En cours', classifiedMeetings.current, 'current', 'fa-play-circle');
    html += buildSectionHtml('À venir', classifiedMeetings.upcoming, 'upcoming', 'fa-clock');
    // Optionnel: Afficher les réunions passées
    // html += buildSectionHtml('Terminées', classifiedMeetings.past, 'past', 'fa-check-circle');

    meetingsListContainer.innerHTML = html; // Remplacer le contenu

     // Afficher message si aucune réunion après filtrage
     if (filteredMeetings.length === 0) {
        emptyMessage.innerHTML = `<i class="fas fa-calendar-times"></i><p>Aucune réunion prévue ${isAllRooms ? "aujourd'hui" : `pour la salle ${salleFilter}`}.</p>`;
        emptyMessage.style.display = 'flex';
    } else {
        emptyMessage.style.display = 'none';
    }

    // Ajouter les écouteurs pour les boutons "Rejoindre" et "..."
    addMeetingItemEventListeners(meetingsListContainer);
    // Démarrer les timers de progression si nécessaire
    startMeetingTimers();
}


function buildSectionHtml(title, meetings, statusClass, iconClass) {
    if (meetings.length === 0) return '';

    let sectionHtml = `
        <div class="status-section">
            <h4><i class="fas ${iconClass}"></i> ${title} (${meetings.length})</h4>
        </div>`;

    meetings.forEach(meeting => {
        sectionHtml += buildMeetingItemHtml(meeting, statusClass);
    });

    return sectionHtml;
}

function buildMeetingItemHtml(meeting, statusClass) {
    const start = new Date(meeting.start);
    const end = new Date(meeting.end);
    const isCurrent = statusClass === 'current';
    const isPast = statusClass === 'past';

    // Formatage simple heure:minute
    const formatTime = (date) => {
        if (isNaN(date)) return 'N/A';
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const startTimeFormatted = formatTime(start);
    const endTimeFormatted = formatTime(end);

    // Participants (limiter l'affichage initial)
    const participants = meeting.participants || [];
    const maxVisibleParticipants = 3;
    let participantsHtml = '';
    if (participants.length > 0) {
        participantsHtml = `
        <div class="meeting-participants">
            <i class="fas fa-users" title="Participants"></i>`;
        participants.slice(0, maxVisibleParticipants).forEach(p => {
            participantsHtml += `<span class="participant-email" title="${p}">${p.split('@')[0]}</span>`; // Afficher juste le nom avant @
        });
        if (participants.length > maxVisibleParticipants) {
            participantsHtml += `<button class="show-more-participants" data-meeting-id="${meeting.id}" title="Voir plus">... (+${participants.length - maxVisibleParticipants})</button>`;
        }
        participantsHtml += `</div>`;
    }

    // Barre de progression (seulement si en cours)
    let progressHtml = '';
    if (isCurrent) {
        progressHtml = `
            <div class="meeting-progress-container" data-start="${start.toISOString()}" data-end="${end.toISOString()}">
                <div class="meeting-progress-bar" style="width: 0%;"></div>
            </div>
            <div class="meeting-progress-info">
                <span class="time-info">Termine à ${endTimeFormatted}</span>
                <span class="time-remaining"><i class="fas fa-hourglass-half"></i> ...</span>
            </div>
        `;
    }

    // Bouton rejoindre (seulement si non passée)
    let joinButtonHtml = '';
    if (!isPast) {
        // Utiliser data-url si disponible, sinon data-meeting-id
        const joinAttribute = meeting.joinUrl ? `data-url="${meeting.joinUrl}"` : `data-meeting-id="${meeting.id || meeting.title}"`; // Utiliser title comme fallback ID
        joinButtonHtml = `
            <button class="btn btn-sm btn-primary meeting-join-btn" ${joinAttribute}>
                <i class="fas fa-video"></i> Rejoindre
            </button>`;
    }

    return `
        <div class="meeting-item status-${statusClass}" data-id="${meeting.id || meeting.title}">
            <h3>${meeting.title || 'Réunion sans titre'}</h3>
            <div class="meeting-details">
                <p><i class="fas fa-clock" title="Heure"></i> ${startTimeFormatted} - ${endTimeFormatted}</p>
                ${meeting.salle ? `<p><i class="fas fa-door-open" title="Salle"></i> ${meeting.salle}</p>` : ''}
                ${participantsHtml}
                ${progressHtml}
            </div>
            <div class="meeting-actions">
                ${joinButtonHtml}
            </div>
        </div>`;
}

// Ajouter les écouteurs d'événements (utilisera la délégation dans app.js)
function addMeetingItemEventListeners(container) {
    // La logique de clic pour "Rejoindre" et "..." sera gérée par la délégation dans app.js
    // pour éviter les problèmes avec le contenu dynamique.
    console.log("Écouteurs d'événements pour les réunions seront gérés par délégation.");
}

// Mettre à jour les barres de progression et temps restant
function updateMeetingTimers() {
    const now = new Date().getTime();
    document.querySelectorAll('.meeting-progress-container').forEach(container => {
        const progressBar = container.querySelector('.meeting-progress-bar');
        const timeRemainingElement = container.nextElementSibling?.querySelector('.time-remaining');
        if (!progressBar || !timeRemainingElement) return;

        const start = new Date(container.dataset.start).getTime();
        const end = new Date(container.dataset.end).getTime();

        if (isNaN(start) || isNaN(end) || end <= start || now > end) {
            progressBar.style.width = '100%'; // Terminé ou erreur
            timeRemainingElement.innerHTML = '<i class="fas fa-check"></i> Terminé';
            return;
        }

        const totalDuration = end - start;
        const elapsed = now - start;
        const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
        progressBar.style.width = `${progress.toFixed(1)}%`;

        // Temps restant
        const remainingMillis = Math.max(0, end - now);
        const remainingMinutes = Math.floor(remainingMillis / 60000);
        const remainingSeconds = Math.floor((remainingMillis % 60000) / 1000);

        let remainingText = '';
        if (remainingMinutes > 0) {
            remainingText = `${remainingMinutes} min`;
        } else {
            remainingText = `${remainingSeconds} s`;
        }
        timeRemainingElement.innerHTML = `<i class="fas fa-hourglass-half"></i> Reste ${remainingText}`;
    });
}


// Démarrer la mise à jour des timers
function startMeetingTimers() {
    stopMeetingTimers(); // Arrêter les anciens timers
    updateMeetingTimers(); // Mettre à jour immédiatement
    meetingUpdateInterval = setInterval(updateMeetingTimers, window.REFRESH_INTERVALS.MEETING_TIMERS || 15000);
}

// Arrêter la mise à jour des timers
function stopMeetingTimers() {
    if (meetingUpdateInterval) {
        clearInterval(meetingUpdateInterval);
        meetingUpdateInterval = null;
    }
}

// Fonction pour mettre à jour l'heure de la dernière synchro
function updateLastSyncTime() {
    const timeElement = document.getElementById('lastSyncTime');
    if (timeElement) {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString('fr-FR');
    }
     const syncInfoElement = document.getElementById('syncInfo');
    // Décommenter pour masquer/afficher dynamiquement l'info de synchro
    // if (syncInfoElement) {
    //     syncInfoElement.style.display = 'block'; // Ou 'inline'
    // }
}

// Initialisation gérée par app.js
console.log("meetings.js chargé.");
