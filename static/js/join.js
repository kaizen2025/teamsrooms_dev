/**
 * Fonctionnalités améliorées pour rejoindre une réunion avec ID
 * Améliorations principales:
 * - Meilleure gestion des formats d'ID de réunion
 * - Feedback visuel plus clair
 * - Gestion des erreurs robuste
 * - Compatibilité avec les données remontées du fichier meetings.json
 */

const JoinSystem = {
  // Configuration
  debug: true,
  maxRetries: 2,
  retryDelay: 1000,
  isJoining: false,
  
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
    const meetingIdField = document.getElementById('meeting-id') || document.getElementById('meetingIdInput');
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
      
      // Créer le conteneur pour les IDs récents s'il n'existe pas
      if (!document.getElementById('recent-ids')) {
        const recentIdsContainer = document.createElement('div');
        recentIdsContainer.id = 'recent-ids';
        recentIdsContainer.className = 'recent-ids-container';
        recentIdsContainer.style.cssText = `
          position: absolute;
          background: rgba(40, 40, 40, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          z-index: 1000;
          min-width: 200px;
          max-width: 300px;
          display: none;
          padding: 8px 0;
        `;
        
        document.body.appendChild(recentIdsContainer);
        
        // Ajouter les styles CSS pour les items récents
        const style = document.createElement('style');
        style.textContent = `
          .recent-ids-container h4 {
            margin: 0;
            padding: 8px 12px;
            font-size: 0.9rem;
            color: #ddd;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          .recent-id {
            padding: 8px 12px;
            cursor: pointer;
            transition: background 0.2s;
            font-size: 0.9rem;
          }
          .recent-id:hover {
            background: rgba(255, 255, 255, 0.1);
          }
          .join-error, .join-success {
            background: rgba(30, 30, 30, 0.9);
            border-radius: 8px;
            padding: 10px 15px;
            margin-top: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.9rem;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            animation: fadeIn 0.3s ease;
            max-width: 90%;
          }
          .join-error {
            border-left: 4px solid #e74c3c;
            color: #e74c3c;
          }
          .join-success {
            border-left: 4px solid #2ecc71;
            color: #2ecc71;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `;
        document.head.appendChild(style);
      }
    }
    
    // Cacher la liste lorsque l'utilisateur clique ailleurs
    document.addEventListener('click', (e) => {
      const meetingIdField = document.getElementById('meeting-id') || document.getElementById('meetingIdInput');
      const recentIdsContainer = document.getElementById('recent-ids');
      
      if (meetingIdField && recentIdsContainer && e.target !== meetingIdField && !recentIdsContainer.contains(e.target)) {
        recentIdsContainer.style.display = 'none';
      }
    });
    
    if (this.debug) console.log("Système de jointure initialisé");
  },
  
  /**
   * Rejoindre une réunion Teams avec l'ID fourni
   * @param {string} [providedId] - Optionnel: ID de réunion fourni directement
   * @param {number} [retryCount=0] - Nombre de tentatives
   */
  async joinMeetingWithId(providedId = null, retryCount = 0) {
    // Empêcher les déclenchements multiples qui causent l'ouverture de multiples onglets
    if (this.isJoining) {
      console.log("Jointure déjà en cours, ignorer ce clic");
      return;
    }
    this.isJoining = true;
    
    const meetingIdField = document.getElementById('meeting-id') || document.getElementById('meetingIdInput');
    if (!meetingIdField && !providedId) {
      this.showError("Erreur: Champ d'ID de réunion introuvable");
      this.isJoining = false;
      return;
    }
    
    // Déterminer l'ID à utiliser
    let meetingId = providedId || meetingIdField.value.trim();
    
    if (!meetingId) {
      this.showError("Veuillez entrer l'ID de la réunion");
      this.isJoining = false;
      return;
    }
    
    // Nettoyer l'ID pour qu'il soit utilisable
    const cleanedId = this.cleanMeetingId(meetingId);
    
    // Préparation de l'interface
    const joinButton = document.getElementById('joinMeetingBtn');
    const originalText = joinButton ? joinButton.innerHTML : '';
    
    try {
      // Désactiver les contrôles pendant la recherche
      if (meetingIdField) meetingIdField.disabled = true;
      if (joinButton) {
        joinButton.disabled = true;
        joinButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
      }
      
      // Tentative d'utilisation de l'API
      const apiUrl = '/lookupMeeting';
      const response = await fetch(`${apiUrl}?meetingId=${encodeURIComponent(cleanedId)}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.joinUrl) {
        // IMPORTANT: Créer une variable locale pour l'URL
        const joinUrl = data.joinUrl;
        
        // Sauvegarder l'ID récent
        this.saveRecentMeetingId(meetingId);
        
        // Montrer un message de succès
        this.showSuccess("Connexion réussie! Redirection vers Teams...");
        
        // Utiliser setTimeout pour éviter les problèmes de timing
        setTimeout(() => {
          // Ouvrir une SEULE FOIS la réunion dans une nouvelle fenêtre
          window.open(joinUrl, "_blank");
        }, 500);
        
        // Réinitialiser l'état après un court délai
        setTimeout(() => {
          this.isJoining = false;
        }, 2000);
        
        return;
      } else {
        // Construction d'une URL de secours
        const teamsUrl = `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${cleanedId}%40thread.v2/0`;
        
        // Sauvegarder l'ID récent
        this.saveRecentMeetingId(meetingId);
        
        // Montrer un avertissement
        this.showWarning("Utilisation de l'URL générique Teams...");
        
        // Ouvrir une SEULE FOIS dans une nouvelle fenêtre
        setTimeout(() => {
          window.open(teamsUrl, "_blank");
        }, 500);
        
        // Réinitialiser l'état après un court délai
        setTimeout(() => {
          this.isJoining = false;
        }, 2000);
      }
    } catch (err) {
      console.error("Erreur lors de la connexion:", err);
      this.showError(`Erreur lors de la connexion: ${err.message}`);
      // Réinitialiser l'état en cas d'erreur
      this.isJoining = false;
    } finally {
      // Restaurer l'interface après un délai
      setTimeout(() => {
        if (meetingIdField) meetingIdField.disabled = false;
        if (joinButton) {
          joinButton.disabled = false;
          joinButton.innerHTML = originalText;
        }
      }, 2000);
    }
  },
  
  /**
   * Nettoie l'ID de réunion selon différentes règles
   */
  cleanMeetingId(id) {
    // Si l'ID ressemble à un UUID, l'utiliser tel quel
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return id;
    }
    
    // Si l'ID contient un '@thread.v2', extraire la partie pertinente
    const threadMatch = id.match(/meeting_([^@]+)@thread\.v2/i);
    if (threadMatch && threadMatch[1]) {
      return threadMatch[1];
    }
    
    // Si c'est une URL complète, extraire l'ID
    if (id.includes('teams.microsoft.com/l/meetup-join')) {
      const urlMatch = id.match(/19%3ameeting_([^%@]+)/i);
      if (urlMatch && urlMatch[1]) {
        return urlMatch[1];
      }
    }
    
    // Sinon, enlever tous les caractères non alphanumériques
    return id.replace(/[^a-zA-Z0-9]/g, '');
  },
  
  /**
   * Génère une variante alternative de l'ID en cas d'échec
   */
  getAlternativeId(id) {
    // Essayer d'ajouter/enlever des tirets si l'ID semble être un UUID
    if (id.length >= 32 && !id.includes('-')) {
      // Ajouter des tirets au format UUID
      return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
    } else if (id.includes('-')) {
      // Enlever les tirets
      return id.replace(/-/g, '');
    }
    
    // Si l'ID est court, essayer d'ajouter des zéros au début
    if (id.length < 12) {
      return id.padStart(12, '0');
    }
    
    // Sinon, retourner l'ID original
    return id;
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
      const inputField = document.getElementById('meeting-id') || document.getElementById('meetingIdInput');
      if (inputField) {
        const rect = inputField.getBoundingClientRect();
        container.style.position = 'absolute';
        container.style.top = (rect.bottom + 5) + 'px';
        container.style.left = rect.left + 'px';
        container.style.width = rect.width + 'px';
      }
      
      container.innerHTML = '<h4>Récemment utilisés</h4>';
      recentIds.forEach(id => {
        const idItem = document.createElement('div');
        idItem.className = 'recent-id';
        idItem.textContent = id;
        idItem.addEventListener('click', () => this.selectRecentId(id));
        container.appendChild(idItem);
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
    const inputField = document.getElementById('meeting-id') || document.getElementById('meetingIdInput');
    if (inputField) {
      inputField.value = id;
      
      // Masquer la liste
      const container = document.getElementById('recent-ids');
      if (container) {
        container.style.display = 'none';
      }
      
      // Rejoindre automatiquement
      this.joinMeetingWithId();
    }
  },
  
  /**
   * Affiche un message d'erreur
   */
  showError(message) {
    const meetingEntry = document.querySelector('.meeting-id-entry');
    if (!meetingEntry) return;
    
    // Supprimer les messages précédents
    this.removeMessages();
    
    // Créer le message d'erreur
    const errorDiv = document.createElement('div');
    errorDiv.className = 'join-error';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    // Ajouter le message après le champ de saisie
    meetingEntry.appendChild(errorDiv);
    
    // Supprimer après un délai
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  },
  
  /**
   * Affiche un message de succès
   */
  showSuccess(message) {
    const meetingEntry = document.querySelector('.meeting-id-entry');
    if (!meetingEntry) return;
    
    // Supprimer les messages précédents
    this.removeMessages();
    
    // Créer le message de succès
    const successDiv = document.createElement('div');
    successDiv.className = 'join-success';
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    
    // Ajouter le message après le champ de saisie
    meetingEntry.appendChild(successDiv);
    
    // Supprimer après un délai
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.parentNode.removeChild(successDiv);
      }
    }, 5000);
  },
  
  /**
   * Affiche un message d'avertissement
   */
  showWarning(message) {
    const meetingEntry = document.querySelector('.meeting-id-entry');
    if (!meetingEntry) return;
    
    // Supprimer les messages précédents
    this.removeMessages();
    
    // Créer le message d'avertissement
    const warningDiv = document.createElement('div');
    warningDiv.className = 'join-error'; // Utiliser la classe d'erreur avec style personnalisé
    warningDiv.style.borderLeftColor = '#f39c12';
    warningDiv.style.color = '#f39c12';
    warningDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    
    // Ajouter le message après le champ de saisie
    meetingEntry.appendChild(warningDiv);
    
    // Supprimer après un délai
    setTimeout(() => {
      if (warningDiv.parentNode) {
        warningDiv.parentNode.removeChild(warningDiv);
      }
    }, 5000);
  },
  
  /**
   * Supprime tous les messages d'erreur/succès
   */
  removeMessages() {
    document.querySelectorAll('.join-error, .join-success').forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  }
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  JoinSystem.init();
});

// Exposer pour utilisation globale
window.JoinSystem = JoinSystem;

/**
 * Initialise une fonction d'aide synthétique
 */
function initializeHelpFunction() {
  const helpBtn = document.getElementById('helpBtn');
  
  // Vérifier si le bouton existe ET s'il n'a pas déjà un gestionnaire d'événements
  if (helpBtn && !helpBtn._hasHelpHandler) {
    helpBtn.addEventListener('click', showHelpModal);
    // Marquer le bouton comme ayant un gestionnaire
    helpBtn._hasHelpHandler = true;
  }
  // Ne PAS créer de nouveau bouton d'aide
}

/**
 * Affiche un modal d'aide synthétique
 */
function showHelpModal() {
  // Création du modal d'aide
  const helpModal = document.createElement('div');
  helpModal.className = 'help-modal';
  helpModal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999;
  `;
  
  // Contenu du modal
  helpModal.innerHTML = `
    <div class="help-modal-content" style="
      width: 80%;
      max-width: 800px;
      max-height: 80vh;
      overflow-y: auto;
      background-color: #2c2c2c;
      border-radius: 15px;
      padding: 20px;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
    ">
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <h2 style="color: white; margin: 0;"><i class="fas fa-question-circle"></i> Guide d'utilisation</h2>
        <button id="closeHelpBtn" style="
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
        ">&times;</button>
      </div>
      
      <div style="color: #ddd; line-height: 1.6;">
        <h3 style="color: white; border-bottom: 1px solid rgba(255, 255, 255, 0.2); padding-bottom: 10px;">
          <i class="fas fa-door-open"></i> Gestion des salles
        </h3>
        <p>
          <strong>Consulter les salles</strong> : Cliquez sur le bouton <strong>"Afficher les salles disponibles"</strong> en bas 
          pour voir toutes les salles et leur statut.
        </p>
        <p>
          <strong>Filtrer par salle</strong> : Cliquez sur une salle dans la liste pour voir uniquement les 
          réunions de cette salle.
        </p>
        
        <h3 style="color: white; border-bottom: 1px solid rgba(255, 255, 255, 0.2); padding-bottom: 10px;">
          <i class="fas fa-calendar-plus"></i> Création de réunions
        </h3>
        <p>
          <strong>Réserver une salle</strong> : Cliquez sur le bouton <strong>"Créer une réunion Teams"</strong> en haut 
          du panneau des réunions, ou utilisez le menu <strong>"Salle de réunion"</strong> dans la section Réservations.
        </p>
        
        <h3 style="color: white; border-bottom: 1px solid rgba(255, 255, 255, 0.2); padding-bottom: 10px;">
          <i class="fas fa-video"></i> Rejoindre une réunion
        </h3>
        <p>
          <strong>Méthode 1</strong> : Cliquez sur le bouton <strong>"Rejoindre"</strong> à côté d'une réunion en cours ou à venir.
        </p>
        <p>
          <strong>Méthode 2</strong> : Entrez l'ID de la réunion dans le champ en bas de la liste des réunions et cliquez sur <strong>"Rejoindre"</strong>.
        </p>
        
        <h3 style="color: white; border-bottom: 1px solid rgba(255, 255, 255, 0.2); padding-bottom: 10px;">
          <i class="fas fa-users"></i> Gestion des participants
        </h3>
        <p>
          Pour voir tous les participants d'une réunion, cliquez sur les <strong>trois points</strong> (...) à côté de la liste des participants.
        </p>
        
        <h3 style="color: white; border-bottom: 1px solid rgba(255, 255, 255, 0.2); padding-bottom: 10px;">
          <i class="fas fa-sync-alt"></i> Actualisation
        </h3>
        <p>
          Les réunions se rafraîchissent automatiquement toutes les 10 secondes.
          Pour forcer une actualisation, cliquez sur le bouton <strong>"Rafraîchir"</strong> en bas.
        </p>
      </div>
    </div>
  `;
  
  // Ajouter le modal au document
  document.body.appendChild(helpModal);
  
  // Gérer la fermeture du modal
  document.getElementById('closeHelpBtn').addEventListener('click', () => {
    document.body.removeChild(helpModal);
  });
  
  // Fermer en cliquant en dehors du contenu
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
      document.body.removeChild(helpModal);
    }
  });
}

// Appeler la fonction d'initialisation de l'aide à la fin de l'initialisation principale
document.addEventListener('DOMContentLoaded', function() {
  // Fonction existantes...
  
  // Ajouter l'initialisation de l'aide
  initializeHelpFunction();
});
