/**
 * Fonctionnalités pour rejoindre une réunion avec ID
 */

const JoinSystem = {
  /**
   * Initialise le système de jointure
   */
  init() {
    // Associer le bouton "Rejoindre"
    const joinButton = document.getElementById('joinMeetingBtn');
    if (joinButton) {
      joinButton.addEventListener('click', () => this.joinMeetingWithId());
    }
    
    // Associer l'événement Enter au champ d'ID
    const meetingIdField = document.getElementById('meeting-id');
    if (meetingIdField) {
      meetingIdField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.joinMeetingWithId();
        }
      });
      
      // Afficher la liste des IDs récents lors du focus
      meetingIdField.addEventListener('focus', () => {
        this.updateRecentIdsList();
      });
    }
    
    // Cacher la liste lorsque l'utilisateur clique ailleurs
    document.addEventListener('click', (e) => {
      const meetingIdField = document.getElementById('meeting-id');
      if (meetingIdField && e.target !== meetingIdField) {
        const container = document.getElementById('recent-ids');
        if (container) container.style.display = 'none';
      }
    });
    
    console.log("Système de jointure initialisé");
  },
  
  /**
   * Rejoindre une réunion Teams avec l'ID fourni
   */
  async joinMeetingWithId() {
    const meetingIdField = document.getElementById('meeting-id');
    if (!meetingIdField) return;
    
    let meetingId = meetingIdField.value.trim();
    
    if (!meetingId) {
      alert("Veuillez entrer l'ID de la réunion.");
      return;
    }
    
    // Préparation de l'interface
    const joinButton = document.getElementById('joinMeetingBtn');
    const originalText = joinButton ? joinButton.innerHTML : '';
    if (meetingIdField) meetingIdField.disabled = true;
    if (joinButton) {
      joinButton.disabled = true;
      joinButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
    }
    
    try {
      // Nettoyer l'ID (enlever espaces, tirets, etc.)
      if (meetingId.match(/[\d\s\-]+/)) {
        meetingId = meetingId.replace(/[^\d]/g, '');
      }
      
      // Tentative d'utilisation de l'API pour récupérer l'URL de la réunion
      const apiUrl = '/lookupMeeting';
      const response = await fetch(`${apiUrl}?meetingId=${encodeURIComponent(meetingId)}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.joinUrl) {
        // Sauvegarder l'ID récent
        this.saveRecentMeetingId(meetingId);
        
        // Ouvrir la réunion dans une nouvelle fenêtre
        window.open(data.joinUrl, "_blank");
      } else {
        // Construction d'URL Teams standard (fallback)
        console.log("URL de jointure non trouvée, utilisation du format standard");
        const teamsUrl = `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${meetingId}%40thread.v2/0?context=%7B%22Tid%22%3A%224dc0974a-7836-414e-8dda-347f31dac3eb%22%7D`;
        
        // Sauvegarder l'ID récent
        this.saveRecentMeetingId(meetingId);
        
        // Ouvrir dans une nouvelle fenêtre
        window.open(teamsUrl, "_blank");
      }
    } catch (err) {
      console.error("Erreur lors de la connexion:", err);
      alert("Erreur lors de la tentative de connexion à la réunion.");
    } finally {
      // Restaurer l'interface
      if (meetingIdField) meetingIdField.disabled = false;
      if (joinButton) {
        joinButton.disabled = false;
        joinButton.innerHTML = originalText;
      }
    }
  },
  
  /**
   * Sauvegarde l'ID de réunion dans l'historique récent
   */
  saveRecentMeetingId(id) {
    let recentIds = JSON.parse(localStorage.getItem('recentMeetingIds') || '[]');
    
    // Ajouter l'ID s'il n'existe pas déjà
    if (!recentIds.includes(id)) {
      recentIds.unshift(id);
      recentIds = recentIds.slice(0, 5); // Garder les 5 derniers
      localStorage.setItem('recentMeetingIds', JSON.stringify(recentIds));
    }
    
    this.updateRecentIdsList();
  },
  
  /**
   * Met à jour l'affichage de la liste des IDs récents
   */
  updateRecentIdsList() {
    // Trouver le conteneur
    const container = document.getElementById('recent-ids');
    if (!container) return;
    
    const recentIds = JSON.parse(localStorage.getItem('recentMeetingIds') || '[]');
    
    if (recentIds.length > 0) {
      // Positionner la liste près du champ de saisie
      const inputField = document.getElementById('meeting-id');
      if (inputField) {
        const rect = inputField.getBoundingClientRect();
        container.style.position = 'absolute';
        container.style.top = (rect.bottom + 10) + 'px';
        container.style.left = rect.left + 'px';
        container.style.width = rect.width + 'px';
      }
      
      container.innerHTML = '<h4>Récemment utilisés</h4>';
      recentIds.forEach(id => {
        container.innerHTML += `<div class="recent-id" onclick="JoinSystem.selectRecentId('${id}')">${id}</div>`;
      });
      container.style.display = 'block';
    } else {
      container.style.display = 'none';
    }
  },
  
  /**
   * Sélectionne un ID récent et le place dans le champ
   */
  selectRecentId(id) {
    const inputField = document.getElementById('meeting-id');
    if (inputField) {
      inputField.value = id;
      
      // Masquer la liste
      const container = document.getElementById('recent-ids');
      if (container) {
        container.style.display = 'none';
      }
      
      // Option: rejoindre automatiquement
      this.joinMeetingWithId();
    }
  }
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  JoinSystem.init();
});

// Exposer pour utilisation globale
window.JoinSystem = JoinSystem;
