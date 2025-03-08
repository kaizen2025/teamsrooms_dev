/* =========================
   D) Gestion des réunions
   ========================= */
let previousMeetings = JSON.stringify([]);

async function fetchMeetings() {
  try {
    // Charger la liste
    const response = await fetch(`/meetings.json?t=${Date.now()}`);
    let meetings = await response.json();

    // Filtrer par salle si ce n'est pas "toutes les salles"
    if (!window.isAllRooms) {
      meetings = meetings.filter(m => (m.salle || '').toLowerCase() === salleName);
    }
    // Filtrer pour ne garder que celles du jour
    const today = new Date().toDateString();
    meetings = meetings.filter(m => new Date(m.start).toDateString() === today);

    const currentMeetingsString = JSON.stringify(meetings);
    if (previousMeetings === currentMeetingsString) return;
    previousMeetings = currentMeetingsString;

    updateMeetingsDisplay(meetings);
  } catch (error) {
    console.error("❌ Erreur lors du chargement des réunions :", error);
    document.getElementById('meetings-container').innerHTML =
      '<p style="color: red; font-weight: bold; text-align: center;"><i class="fas fa-exclamation-triangle"></i> Impossible de récupérer les réunions.</p>';
  }
}

function updateMeetingsDisplay(meetings) {
  const container = document.getElementById('meetings-container');
  container.innerHTML = '';
  const now = new Date();

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

  // Afficher différemment selon qu'il y a des réunions ou non
  if (currentMeetings.length === 0 && upcomingMeetings.length === 0 && pastMeetings.length === 0) {
    // Aucune réunion - Bouton centré
    container.innerHTML = `
      <div class="empty-meetings-message">
        <p><i class="fas fa-calendar-times"></i> Aucune réunion prévue aujourd'hui.</p>
        <button class="create-meeting-button" onclick="openBookingModal()">
          <i class="fas fa-plus"></i> Créer une réunion Teams
        </button>
      </div>
    `;
  } else {
    // Il y a des réunions - Bouton dans l'en-tête
    // Ajout du bouton de création à côté du statut actuel
    if (currentMeetings.length > 0) {
      container.innerHTML += `
        <div class="status-section">
          <h4 class="status-current"><i class="fas fa-circle"></i> En cours</h4>
          <button class="create-meeting-button" onclick="openBookingModal()">
            <i class="fas fa-plus"></i> Créer
          </button>
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
          <button class="create-meeting-button" onclick="openBookingModal()">
            <i class="fas fa-plus"></i> Créer
          </button>
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

function createMeetingItem(meeting, category) {
  const start = new Date(meeting.start);
  const end = new Date(meeting.end);
  const now = new Date();
  const startTime = start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const endTime = end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // Information sur le temps restant
  let progressBar = '';
  
  if (category === 'En cours') {
    // Calcul du temps total de la réunion et du temps écoulé
    const totalDuration = end.getTime() - start.getTime();
    const elapsedTime = now.getTime() - start.getTime();
    const progressPercent = Math.min(100, Math.max(0, (elapsedTime / totalDuration) * 100)).toFixed(1);
    
    // Temps restant en minutes
    const remainingMinutes = Math.floor((end.getTime() - now.getTime()) / 60000);
    
    // Détermine la classe de couleur en fonction du temps écoulé
    let progressClass = 'early';
    if (progressPercent > 75) progressClass = 'ending';
    else if (progressPercent > 50) progressClass = 'late';
    else if (progressPercent > 25) progressClass = 'middle';
    
    // Formater le temps restant
    const remainingHours = Math.floor(remainingMinutes / 60);
    const remainingMins = remainingMinutes % 60;
    const remainingText = remainingHours > 0 
      ? `${remainingHours}h ${remainingMins}min`
      : `${remainingMins}min`;
    
    // Création de la barre de progression
    progressBar = `
      <div class="meeting-progress-container">
        <div class="meeting-progress-bar ${progressClass}" style="width: ${progressPercent}%"></div>
      </div>
      <div class="meeting-progress-text">
        <span>${progressPercent}% écoulé</span>
        <span><i class="fas fa-clock"></i> Reste: ${remainingText}</span>
      </div>
      <div class="time-marker">
        <span class="start">${startTime}</span>
        <span class="progress-now" style="margin-left: ${progressPercent}%"><i class="fas fa-hourglass-half"></i></span>
        <span class="end" style="float: right">${endTime}</span>
      </div>
    `;
  }

  // Afficher la salle si "Toutes les salles"
  let salleHTML = '';
  if (window.isAllRooms && meeting.salle) {
    salleHTML = `<p class="meeting-salle"><i class="fas fa-map-marker-alt"></i> Salle : ${meeting.salle}</p>`;
  }

  // Bouton "Rejoindre" amélioré
  let joinButton = '';
  if (meeting.joinUrl) {
    joinButton = `<button onclick="window.open('${meeting.joinUrl}', '_blank')"><i class="fas fa-link"></i> Rejoindre</button>`;
  }

  return `
    <div class="meeting-item ${category === 'Terminée' ? 'past' : ''}">
      <h3>${meeting.subject || 'Réunion sans titre'}</h3>
      <p><i class="far fa-clock"></i> ${startTime} - ${endTime}</p>
      ${category === 'En cours' ? progressBar : ''}
      ${salleHTML}
      <p><i class="fas fa-users"></i> ${Array.isArray(meeting.attendees) ? meeting.attendees.slice(0, 3).join(', ') + (meeting.attendees.length > 3 ? '...' : '') : (meeting.attendees || 'Aucun invité')}</p>
      ${joinButton}
    </div>
  `;
}

/* =========================
   G) FONCTIONNALITÉ "REJOINDRE AVEC ID" AMÉLIORÉE
   ========================= */
async function joinMeetingWithId() {
  const meetingIdField = document.getElementById('meeting-id');
  let meetingId = meetingIdField.value.trim();
  
  if (!meetingId) {
    alert("Veuillez entrer l'ID de la réunion.");
    return;
  }
  
  // Préparation de l'interface
  const joinButton = meetingIdField.nextElementSibling;
  const originalText = joinButton.innerHTML;
  meetingIdField.disabled = true;
  joinButton.disabled = true;
  joinButton.innerHTML = "Connexion…";
  
  try {
    // Nettoyer l'ID (enlever espaces, tirets, etc.)
    if (meetingId.match(/[\d\s\-]+/)) {
      meetingId = meetingId.replace(/[^\d]/g, '');
    }
    
    // Construction d'URL Teams complète avec tous les paramètres nécessaires
    const teamsUrl = `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${meetingId}%40thread.v2/0?context=%7B%22Tid%22%3A%224dc0974a-7836-414e-8dda-347f31dac3eb%22%7D&deeplinkId=${generateUUID()}&directDl=true&msLaunch=true&enableMobilePage=true&suppressPrompt=true`;
    
    console.log("URL Teams construite:", teamsUrl);
    
    // Sauvegarder l'ID récent
    saveRecentMeetingId(meetingId);
    
    // Ouvrir dans une nouvelle fenêtre
    const win = window.open(teamsUrl, "_blank");
    
    // Si la fenêtre est bloquée par le navigateur
    if (!win || win.closed || typeof win.closed === 'undefined') {
      alert("Le navigateur a bloqué l'ouverture de la fenêtre. Veuillez autoriser les popups pour ce site.");
    }
    
  } catch (err) {
    console.error("Erreur lors de la connexion:", err);
    alert("Erreur lors de la tentative de connexion à la réunion.");
  } finally {
    meetingIdField.disabled = false;
    joinButton.disabled = false;
    joinButton.innerHTML = originalText;
  }
}

// Générer un UUID pour le paramètre deeplinkId
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Gestion des IDs récents
function saveRecentMeetingId(id) {
  let recentIds = JSON.parse(localStorage.getItem('recentMeetingIds') || '[]');
  if (!recentIds.includes(id)) {
    recentIds.unshift(id);
    recentIds = recentIds.slice(0, 5); // Garder les 5 derniers
    localStorage.setItem('recentMeetingIds', JSON.stringify(recentIds));
  }
  updateRecentIdsList();
}

function updateRecentIdsList() {
  // Trouver le conteneur
  let container = document.getElementById('recent-ids');
  
  if (!container) return;
  
  const recentIds = JSON.parse(localStorage.getItem('recentMeetingIds') || '[]');
  
  if (recentIds.length > 0) {
    // Positionner la liste sous le champ de saisie
    const inputField = document.getElementById('meeting-id');
    if (inputField) {
      const rect = inputField.getBoundingClientRect();
      container.style.position = 'absolute';
      container.style.top = (rect.bottom + window.scrollY + 5) + 'px';
      container.style.left = (rect.left + window.scrollX) + 'px';
    }
    
    container.innerHTML = '<h4>Récemment utilisés</h4>';
    recentIds.forEach(id => {
      container.innerHTML += `<div class="recent-id" onclick="document.getElementById('meeting-id').value='${id}'; joinMeetingWithId();">${id}</div>`;
    });
    container.style.display = 'block';
  } else {
    container.style.display = 'none';
  }
}

/* =========================
   H) Création de réunions Teams
   ========================= */
async function createTeamsMeeting() {
  const title = document.getElementById('booking-title').value;
  const room = document.getElementById('booking-room').value;
  const startTime = document.getElementById('booking-start').value;
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
  
  if (!startTime) {
    alert("Veuillez spécifier une heure de début.");
    return;
  }
  
  // Obtenir la durée sélectionnée
  const activeDuration = document.querySelector('.duration-button.active');
  const durationMinutes = activeDuration ? parseInt(activeDuration.dataset.minutes) : 30;
  
  // Récupérer les participants 
  const participants = participantsInput
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0);
  
  // Construire les dates de début et de fin
  const today = new Date().toISOString().split('T')[0];
  const [hours, minutes] = startTime.split(':');
  const start = new Date(`${today}T${hours}:${minutes}:00`);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + durationMinutes);
  
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
    start: start.toISOString(),
    end: end.toISOString(),
    participants,
    isOnlineMeeting: true
  };
  
  // Afficher un indicateur de chargement
  const createButton = document.querySelector('.create-button');
  const originalText = createButton.textContent;
  createButton.textContent = "Création en cours...";
  createButton.disabled = true;
  
  try {
    // Appel à l'API pour créer la réunion
    const response = await fetch('/api/create-meeting', {
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