/**
 * Fonctionnalités pour rejoindre une réunion avec ID
 */

/**
 * Rejoindre une réunion Teams avec l'ID fourni
 */
async function joinMeetingWithId() {
  const meetingIdField = document.getElementById('meeting-id');
  if (!meetingIdField) return;
  
  let meetingId = meetingIdField.value.trim();
  
  if (!meetingId) {
    alert("Veuillez entrer l'ID de la réunion.");
    return;
  }
  
  // Préparation de l'interface
  const joinButton = document.getElementById('joinMeetingBtn');
  const originalText = joinButton.innerHTML;
  meetingIdField.disabled = true;
  joinButton.disabled = true;
  joinButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
  
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

/**
 * Génère un UUID pour le paramètre deeplinkId
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Sauvegarde l'ID de réunion dans l'historique récent
 */
function saveRecentMeetingId(id) {
  let recentIds = JSON.parse(localStorage.getItem('recentMeetingIds') || '[]');
  if (!recentIds.includes(id)) {
    recentIds.unshift(id);
    recentIds = recentIds.slice(0, 5); // Garder les 5 derniers
    localStorage.setItem('recentMeetingIds', JSON.stringify(recentIds));
  }
  updateRecentIdsList();
}

/**
 * Met à jour l'affichage de la liste des IDs récents
 */
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
      container.style.bottom = (window.innerHeight - rect.top + 10) + 'px';
      container.style.right = (window.innerWidth - rect.right + 10) + 'px';
    }
    
    container.innerHTML = '<h4>Récemment utilisés</h4>';
    recentIds.forEach(id => {
      container.innerHTML += `<div class="recent-id" onclick="selectRecentId('${id}')">${id}</div>`;
    });
    container.style.display = 'block';
  } else {
    container.style.display = 'none';
  }
}

/**
 * Sélectionne un ID récent et le place dans le champ
 */
function selectRecentId(id) {
  const inputField = document.getElementById('meeting-id');
  if (inputField) {
    inputField.value = id;
    
    // Masquer la liste
    const container = document.getElementById('recent-ids');
    if (container) {
      container.style.display = 'none';
    }
    
    // Option: rejoindre automatiquement
    joinMeetingWithId();
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  // Associer le bouton "Rejoindre"
  const joinButton = document.getElementById('joinMeetingBtn');
  if (joinButton) {
    joinButton.addEventListener('click', joinMeetingWithId);
  }
  
  // Associer l'événement Enter au champ d'ID
  const meetingIdField = document.getElementById('meeting-id');
  if (meetingIdField) {
    meetingIdField.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        joinMeetingWithId();
      }
    });
    
    // Afficher la liste des IDs récents lors du focus
    meetingIdField.addEventListener('focus', function() {
      updateRecentIdsList();
    });
  }
  
  // Cacher la liste lorsque l'utilisateur clique ailleurs
  document.addEventListener('click', function(e) {
    const meetingIdField = document.getElementById('meeting-id');
    if (meetingIdField && e.target !== meetingIdField) {
      const container = document.getElementById('recent-ids');
      if (container) container.style.display = 'none';
    }
  });
});
