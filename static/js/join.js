/**
 * Système de jointure de réunion amélioré
 * - Gère différents formats d'ID (numérique, URL, UUID...).
 * - Appelle l'API backend /lookupMeeting pour une recherche temps réel + cache.
 * - Évite les fallbacks non fiables pour les ID numériques purs.
 * - Fournit un feedback utilisateur clair.
 * - Gère un historique des ID récents.
 */
const JoinSystem = {
  // Configuration (peut être surchargée par window.APP_CONFIG si défini)
  debug: window.APP_CONFIG?.DEBUG ?? false,
  isJoining: false,

  /**
   * Initialise le système de jointure et les écouteurs d'événements.
   */
  init() {
    const joinButton = document.getElementById('joinMeetingBtn');
    const meetingIdField = document.getElementById('meeting-id') || document.getElementById('meetingIdInput');

    if (joinButton && meetingIdField) {
      // Clic sur le bouton "Rejoindre"
      joinButton.addEventListener('click', () => this.joinMeetingWithId());

      // Touche "Entrée" dans le champ ID
      meetingIdField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault(); // Empêcher la soumission de formulaire par défaut
          this.joinMeetingWithId();
        }
      });

      // Afficher la liste des ID récents au focus
      meetingIdField.addEventListener('focus', () => {
        this.updateRecentIdsList();
      });

      // Mettre en place le conteneur et les styles pour les ID récents
      this.setupRecentIdsContainer();

    } else {
      console.warn("JOIN: Éléments DOM (bouton ou champ ID) manquants pour l'initialisation.");
    }

    // Cacher la liste des IDs récents si on clique en dehors
    document.addEventListener('click', (e) => {
      const recentIdsContainer = document.getElementById('recent-ids');
      // Vérifier si le clic n'est ni sur le champ, ni dans le conteneur des récents
      if (meetingIdField && recentIdsContainer &&
          e.target !== meetingIdField && !recentIdsContainer.contains(e.target)) {
        recentIdsContainer.style.display = 'none';
      }
    });

    if (this.debug) console.log("JOIN: Système initialisé.");
  },

  /**
   * Crée le conteneur DOM et injecte le CSS pour la liste des IDs récents si nécessaire.
   */
  setupRecentIdsContainer() {
    // Créer le conteneur s'il n'existe pas
    if (!document.getElementById('recent-ids')) {
      const recentIdsContainer = document.createElement('div');
      recentIdsContainer.id = 'recent-ids';
      recentIdsContainer.className = 'recent-ids-container'; // Pour le ciblage CSS
      // Le positionnement se fait dans updateRecentIdsList
      recentIdsContainer.style.display = 'none'; // Caché par défaut
      document.body.appendChild(recentIdsContainer);
    }

    // Ajouter les styles CSS une seule fois
    if (!document.getElementById('join-styles')) {
      const style = document.createElement('style');
      style.id = 'join-styles';
      // Styles pour le conteneur, les items, les messages et la scrollbar
      style.textContent = `
        :root { /* Définir des couleurs CSS si besoin */
          --join-bg-dark: rgba(40, 40, 40, 0.97);
          --join-border-light: rgba(255, 255, 255, 0.2);
          --join-text-primary: #eee;
          --join-text-secondary: #aaa;
          --join-hover-bg: rgba(255, 255, 255, 0.1);
          --join-scrollbar-color: rgba(98, 100, 167, 0.5);
          --join-error-color: #e74c3c;
          --join-success-color: #2ecc71;
          --join-warning-color: #f39c12;
          --join-info-color: #3498db;
        }
        .recent-ids-container {
          position: absolute; background: var(--join-bg-dark);
          border: 1px solid var(--join-border-light); border-radius: 8px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4); z-index: 1050; /* Au dessus d'autres éléments */
          min-width: 200px; max-width: 350px; display: none; padding: 0; /* Padding géré par les enfants */
          max-height: 250px; overflow-y: auto; /* Limiter hauteur et scroller */
          scrollbar-width: thin; scrollbar-color: var(--join-scrollbar-color) transparent;
        }
        .recent-ids-container::-webkit-scrollbar { width: 6px; }
        .recent-ids-container::-webkit-scrollbar-track { background: transparent; }
        .recent-ids-container::-webkit-scrollbar-thumb { background-color: var(--join-scrollbar-color); border-radius: 10px; border: 1px solid transparent; }
        .recent-ids-container h4 {
          margin: 0; padding: 10px 15px; font-size: 0.85rem; color: var(--join-text-secondary);
          border-bottom: 1px solid var(--join-border-light); font-weight: 600;
          position: sticky; top: 0; background: var(--join-bg-dark); /* Titre fixe au scroll */
        }
        .recent-id {
          padding: 10px 15px; cursor: pointer; transition: background 0.15s ease-in-out;
          font-size: 0.9rem; color: var(--join-text-primary);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; /* Gérer texte long */
          border-bottom: 1px solid rgba(255, 255, 255, 0.05); /* Séparateur léger */
        }
        .recent-id:last-child { border-bottom: none; }
        .recent-id:hover { background: var(--join-hover-bg); }
        /* Styles pour les messages (succès, erreur, etc.) */
        .join-message {
          background: rgba(45, 45, 45, 0.95); border-radius: 6px; padding: 12px 18px;
          margin-top: 12px; display: flex; align-items: center; gap: 12px;
          font-size: 0.95rem; box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
          animation: fadeIn 0.4s ease-out; max-width: 100%; /* S'adapte au conteneur */
          border-left: 5px solid transparent; /* Bordure latérale pour type */
          color: var(--join-text-primary); /* Couleur par défaut */
        }
        .join-message i { font-size: 1.1em; line-height: 1; } /* Taille icône */
        .join-message.error   { border-left-color: var(--join-error-color);   color: var(--join-error-color); }
        .join-message.success { border-left-color: var(--join-success-color); color: var(--join-success-color); }
        .join-message.warning { border-left-color: var(--join-warning-color); color: var(--join-warning-color); }
        .join-message.info    { border-left-color: var(--join-info-color);    color: var(--join-info-color); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `;
      document.head.appendChild(style);
    }
  },

  /**
   * Tente de rejoindre une réunion via l'ID fourni.
   * Appelle l'API backend /lookupMeeting pour obtenir l'URL de jointure réelle.
   * @param {string} [providedId] - ID optionnel (ex: depuis un bouton). Sinon, utilise le champ input.
   */
  async joinMeetingWithId(providedId = null) {
    if (this.isJoining) {
      if (this.debug) console.log("JOIN: Ignoré, jointure déjà en cours.");
      return;
    }
    this.isJoining = true;
    this.removeMessages(); // Nettoyer les messages précédents

    const meetingIdField = document.getElementById('meeting-id') || document.getElementById('meetingIdInput');
    const meetingIdRaw = providedId || (meetingIdField ? meetingIdField.value.trim() : '');

    if (!meetingIdRaw) {
      this.showMessage("Veuillez entrer un ID ou un lien de réunion.", "warning");
      this.isJoining = false;
      return;
    }

    // Détecter si l'ID brut est purement numérique (pour logique de fallback)
    const isNumericId = /^[\d\s]+$/.test(meetingIdRaw);
    // Nettoyer l'ID pour l'envoyer à l'API backend
    const cleanedIdForLookup = this.cleanMeetingId(meetingIdRaw);

    if (!cleanedIdForLookup) {
        this.showMessage("Format d'ID ou de lien invalide.", "error");
        this.isJoining = false;
        return;
    }

    if (this.debug) console.log(`JOIN: Tentative pour ID brut: "${meetingIdRaw}", Nettoyé API: "${cleanedIdForLookup}", Est Numérique: ${isNumericId}`);

    const joinButton = document.getElementById('joinMeetingBtn');
    const originalButtonText = joinButton ? joinButton.innerHTML : '';
    let finalJoinUrl = null; // URL qui sera finalement ouverte

    // Bloquer l'UI pendant la recherche
    if (meetingIdField) meetingIdField.disabled = true;
    if (joinButton) {
        joinButton.disabled = true;
        joinButton.innerHTML = '<i class="fas fa-spinner fa-spin fa-fw"></i> Recherche...';
    }

    try {
      // Étape 1: Appel API Backend (/lookupMeeting)
      const apiUrl = `/lookupMeeting?meetingId=${encodeURIComponent(cleanedIdForLookup)}`;
      if (this.debug) console.log(`JOIN: Appel API Backend -> ${apiUrl}`);

      const response = await fetch(apiUrl);
      // Essayer de parser la réponse JSON, même si le statut n'est pas OK
      let result = {};
      try {
          result = await response.json();
      } catch (e) {
          // Si la réponse n'est pas du JSON valide (ex: erreur serveur HTML)
          console.error("JOIN: Réponse API non-JSON reçue.", response.status, await response.text().catch(()=>''));
          result = { error: `Erreur serveur (${response.status})` }; // Créer un objet d'erreur
      }

      // Étape 2: Traiter la réponse de l'API Backend
      if (response.ok && result.joinUrl) {
          // Succès: L'API backend a trouvé l'URL
          finalJoinUrl = result.joinUrl;
          if (this.debug) console.log("JOIN: URL trouvée via backend:", finalJoinUrl);
      } else {
          // Échec: L'API backend n'a pas trouvé d'URL ou a renvoyé une erreur
          const errorMsg = result.error || `Lien introuvable (${response.status})`;
          console.warn(`JOIN: Échec lookup backend (${response.status}): ${errorMsg}`);

          // Étape 3: Gérer le Fallback (SEULEMENT si non-numérique)
          if (isNumericId) {
              // Si l'ID était numérique et que l'API échoue, NE PAS FAIRE DE FALLBACK
              if (this.debug) console.log("JOIN: Échec lookup pour ID numérique détecté. Pas de fallback généré.");
              this.showMessage(errorMsg + ". Vérifiez l'ID ou utilisez l'app Teams.", "error");
              // finalJoinUrl reste null
          } else {
              // Si l'ID n'était PAS numérique, on peut TENTER un fallback (peu fiable)
              // Utiliser l'ID nettoyé qui pourrait être une partie extraite d'URL/UUID etc.
              finalJoinUrl = `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${cleanedIdForLookup}%40thread.v2/0`;
              this.showMessage("Lien direct non trouvé. Tentative avec une URL générique...", "warning");
              if (this.debug) console.log("JOIN: Utilisation fallback URL construite (non-numérique):", finalJoinUrl);
          }
      }

      // Étape 4: Sauvegarder l'ID récent (l'original entré)
      this.saveRecentMeetingId(meetingIdRaw);

      // Étape 5: Ouvrir l'URL si elle est définie
      if (finalJoinUrl) {
           this.showMessage("Redirection vers Microsoft Teams...", "success");
           // Petit délai pour laisser le message s'afficher avant l'ouverture
           setTimeout(() => {
               window.open(finalJoinUrl, "_blank");
           }, 300);
      }
      // Si finalJoinUrl est resté null (ex: échec API pour ID numérique), rien ne s'ouvre ici.

    } catch (error) {
      // Gérer les erreurs JavaScript inattendues (ex: réseau, parsing...)
      console.error("JOIN: Erreur Javascript inattendue lors de la jointure:", error);
      this.showMessage(`Erreur technique inattendue: ${error.message}`, "error");
    } finally {
      // Étape 6: Restaurer l'UI après un délai (quel que soit le résultat)
      setTimeout(() => {
        if (meetingIdField) meetingIdField.disabled = false;
        if (joinButton) {
          joinButton.disabled = false;
          joinButton.innerHTML = originalButtonText; // Restaurer texte original
        }
        this.isJoining = false; // Permettre une nouvelle tentative
        // Nettoyer les messages succès/warning après un délai plus long pour laisser le temps de lire
        // Garder les erreurs affichées plus longtemps par défaut (ou jusqu'au prochain clic)
        setTimeout(() => this.removeMessages(['success', 'warning', 'info']), 4000);
      }, 1500); // Délai avant de réactiver les boutons/champ
    }
  }, // Fin joinMeetingWithId

  /**
   * Nettoie l'ID/lien de réunion fourni par l'utilisateur.
   * Extrait les informations pertinentes pour l'API backend.
   * Gère : ID numériques, URLs Teams, UUIDs.
   * @param {string} id L'ID/lien brut entré.
   * @returns {string|null} L'ID nettoyé pour l'API, ou null si invalide.
   */
  cleanMeetingId(id) {
    if (!id || typeof id !== 'string') return null;
    id = id.trim();

    // 1. ID Numérique (avec/sans espaces)
    if (/^[\d\s]+$/.test(id)) {
        const numericId = id.replace(/\s+/g, '');
        // Valider la longueur (ex: ID Teams typiques > 9 chiffres)
        return numericId.length >= 9 ? numericId : null;
    }

    // 2. Extraire partie pertinente d'URL Teams (@thread.v2)
    // Format: https://teams.microsoft.com/l/meetup-join/19%3ameeting_Base64EncodedPart%40thread.v2/0?...
    // Ou: 19:meeting_Base64EncodedPart@thread.v2
    const threadMatch = id.match(/(?:19(?:%3a|:))?meeting_([a-zA-Z0-9\-_=]+)(?:(?:%40|@)thread\.v2)?/i);
    if (threadMatch && threadMatch[1]) {
      // Retourner la partie encodée (souvent Base64 ou similaire)
      if (this.debug) console.log("JOIN clean: Trouvé partie @thread.v2:", threadMatch[1]);
      return threadMatch[1];
    }

    // 3. Extraire d'autres formats d'URL (ex: /meetup-join/EncodedInfo)
    const urlPathMatch = id.match(/\/(?:meetup-join|meeting)\/([^\/?#&]+)/i);
    if (urlPathMatch && urlPathMatch[1]) {
        try {
            let urlPart = decodeURIComponent(urlPathMatch[1]);
            // Si après décodage on retrouve le format @thread.v2
            const innerThreadMatch = urlPart.match(/19:meeting_([a-zA-Z0-9\-_=]+)@thread\.v2/i);
            if (innerThreadMatch && innerThreadMatch[1]) {
                if (this.debug) console.log("JOIN clean: Trouvé partie @thread.v2 (via URL path):", innerThreadMatch[1]);
                return innerThreadMatch[1];
            }
            // Sinon, la partie pourrait être un autre identifiant (ex: VTC ID, JoinMeetingID)
            // Nettoyer et retourner si elle semble plausible
            const cleanedUrlPart = urlPart.replace(/[^a-zA-Z0-9\-_=]/g, '');
            if (cleanedUrlPart.length > 10) { // Heuristique de longueur
                 if (this.debug) console.log("JOIN clean: Trouvé partie URL path (nettoyée):", cleanedUrlPart);
                 return cleanedUrlPart;
            }
        } catch (e) { console.warn("JOIN clean: Erreur décodage URL part:", e); }
    }

    // 4. Format UUID
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      if (this.debug) console.log("JOIN clean: Trouvé format UUID:", id);
      return id;
    }

    // 5. Fallback: Nettoyage générique si aucun format spécifique n'a été reconnu
    // Garde alphanumériques et quelques caractères spéciaux courants dans les ID
    const genericCleaned = id.replace(/[^a-zA-Z0-9\-_=]/g, '');
    if (genericCleaned.length >= 9) { // Vérifier longueur minimale
         if (this.debug) console.log("JOIN clean: Utilisation fallback nettoyage générique:", genericCleaned);
         return genericCleaned;
    }

    // Si rien ne correspond ou si trop court après nettoyage
    if (this.debug) console.log("JOIN clean: ID non reconnu ou invalide après nettoyage:", id);
    return null;
  },

  /**
   * Sauvegarde l'ID utilisé dans le localStorage (historique récent).
   * @param {string} id L'ID brut à sauvegarder.
   */
  saveRecentMeetingId(id) {
    if (!id) return;
    const MAX_RECENT = 5;
    const STORAGE_KEY = 'recentMeetingIds_v2'; // Clé de stockage
    try {
        let recentIds = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        // Filtrer l'ID existant pour le remonter
        recentIds = recentIds.filter(existingId => existingId !== id);
        // Ajouter le nouvel ID au début
        recentIds.unshift(id);
        // Limiter la taille de l'historique
        recentIds = recentIds.slice(0, MAX_RECENT);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recentIds));
        if (this.debug) console.log("JOIN: ID sauvegardé dans récents:", id);
    } catch (e) {
        console.error("JOIN: Erreur sauvegarde ID récent dans localStorage:", e);
        // Optionnel: Essayer de nettoyer le localStorage si corrompu
        // localStorage.removeItem(STORAGE_KEY);
    }
  },

  /**
   * Met à jour et affiche la liste déroulante des IDs récents sous le champ input.
   */
  updateRecentIdsList() {
    const container = document.getElementById('recent-ids');
    const inputField = document.getElementById('meeting-id') || document.getElementById('meetingIdInput');
    if (!container || !inputField) {
      if (this.debug) console.log("JOIN: Éléments manquants pour afficher IDs récents.");
      return;
    }

    const STORAGE_KEY = 'recentMeetingIds_v2';
    try {
        const recentIds = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        container.innerHTML = ''; // Vider le contenu précédent

        if (recentIds.length > 0) {
            // Ajouter un titre
            const title = document.createElement('h4');
            title.textContent = 'Récemment utilisés';
            container.appendChild(title);

            // Ajouter chaque ID récent comme un élément cliquable
            recentIds.forEach(id => {
              const idItem = document.createElement('div');
              idItem.className = 'recent-id'; // Pour le style
              idItem.textContent = id; // Afficher l'ID complet
              idItem.title = `Utiliser cet ID: ${id}`; // Tooltip au survol
              // Au clic, sélectionner cet ID
              idItem.addEventListener('click', (e) => {
                 e.stopPropagation(); // Empêcher le clic de fermer la liste immédiatement via le listener global
                 this.selectRecentId(id);
              });
              container.appendChild(idItem);
            });

            // Positionner la liste juste sous le champ d'entrée
            const inputRect = inputField.getBoundingClientRect();
            container.style.top = `${inputRect.bottom + window.scrollY + 3}px`; // Ajuster l'espace vertical
            container.style.left = `${inputRect.left + window.scrollX}px`;
            container.style.width = `${inputRect.width}px`; // Adapter la largeur
            container.style.display = 'block'; // Rendre visible
            if (this.debug) console.log("JOIN: Liste IDs récents affichée.", recentIds);

        } else {
          // S'il n'y a pas d'ID récent, cacher le conteneur
          container.style.display = 'none';
          if (this.debug) console.log("JOIN: Aucun ID récent à afficher.");
        }
    } catch (e) {
         // Gérer les erreurs de parsing JSON du localStorage
         console.error("JOIN: Erreur lecture/parsing IDs récents depuis localStorage:", e);
         container.style.display = 'none'; // Cacher en cas d'erreur
         // Optionnel: Nettoyer la clé corrompue
         // localStorage.removeItem(STORAGE_KEY);
    }
  },

  /**
   * Gère la sélection d'un ID depuis la liste des récents.
   * @param {string} id L'ID sélectionné.
   */
  selectRecentId(id) {
    const inputField = document.getElementById('meeting-id') || document.getElementById('meetingIdInput');
    const container = document.getElementById('recent-ids');

    if (inputField) {
      inputField.value = id; // Mettre l'ID dans le champ
      if (this.debug) console.log("JOIN: ID récent sélectionné:", id);
      if (container) {
        container.style.display = 'none'; // Cacher la liste des récents
      }
      inputField.focus(); // Garder le focus sur le champ
      // Lancer automatiquement la tentative de jointure avec cet ID
      this.joinMeetingWithId(id);
    }
  },

  /**
   * Affiche un message (erreur, succès, warning, info) sous la zone de saisie.
   * @param {string} message Le texte du message.
   * @param {'error'|'success'|'warning'|'info'} type Le type de message pour le style et l'icône.
   */
  showMessage(message, type = 'info') {
    // Trouver le conteneur parent où ajouter le message
    const meetingEntryContainer = document.querySelector('.meeting-id-entry');
    if (!meetingEntryContainer) {
        console.warn("JOIN: Conteneur '.meeting-id-entry' introuvable pour afficher message:", message);
        return; // Ne rien faire si le conteneur n'existe pas
    }

    // Supprimer les messages existants du même type ou de tous types ?
    // Pour l'instant, supprimons tous les messages précédents pour n'en avoir qu'un à la fois.
    this.removeMessages();

    // Créer l'élément du message
    const messageDiv = document.createElement('div');
    messageDiv.className = `join-message ${type}`; // Appliquer les classes CSS
    // Utiliser innerHTML pour inclure l'icône Font Awesome
    messageDiv.innerHTML = `<i class="fas ${this.getIconForType(type)} fa-fw"></i> <span>${message}</span>`;

    // Ajouter le message à la fin du conteneur parent
    meetingEntryContainer.appendChild(messageDiv);
  },

  /**
   * Supprime les messages affichés précédemment.
   * @param {Array<string>} [types=['error','success','warning','info']] Types spécifiques à supprimer.
   */
  removeMessages(types = ['error', 'success', 'warning', 'info']) {
      // Construire un sélecteur CSS pour tous les types de messages à supprimer
      const selectors = types.map(type => `.join-message.${type}`).join(', ');
      // Trouver tous les éléments correspondants dans le document
      document.querySelectorAll(selectors).forEach(el => {
        el.remove(); // Supprimer l'élément du DOM
      });
  },

  /**
   * Retourne la classe d'icône Font Awesome appropriée pour un type de message.
   * @param {'error'|'success'|'warning'|'info'} type Le type de message.
   * @returns {string} La classe CSS de l'icône.
   */
  getIconForType(type) {
    switch (type) {
      case 'success': return 'fa-check-circle';
      case 'error':   return 'fa-exclamation-circle';
      case 'warning': return 'fa-exclamation-triangle';
      case 'info':    // ou pour tout autre cas non spécifié
      default:        return 'fa-info-circle';
    }
  }

}; // --- Fin de l'objet JoinSystem ---

// --- Initialisation Globale ---
document.addEventListener('DOMContentLoaded', () => {
  // Initialiser le système de jointure
  JoinSystem.init();

  // Essayer d'initialiser la fonction d'aide si elle existe (définie ailleurs ou plus bas)
  if (typeof initializeHelpFunction === 'function') {
    initializeHelpFunction();
  }
});

// Rendre JoinSystem accessible globalement (ex: pour appels depuis d'autres scripts ou console)
window.JoinSystem = JoinSystem;


// --- Fonction d'Aide (exemple, peut être dans un autre fichier) ---
/**
 * Initialise le bouton d'aide s'il existe.
 */
function initializeHelpFunction() {
  const helpBtn = document.getElementById('helpBtn');
  if (helpBtn && !helpBtn._hasHelpHandler) {
    helpBtn.addEventListener('click', showHelpModal);
    helpBtn._hasHelpHandler = true; // Marqueur pour éviter double attachement
     if (JoinSystem.debug) console.log("HELP: Gestionnaire d'aide attaché à #helpBtn.");
  } else if (JoinSystem.debug && !helpBtn) {
      console.log("HELP: Bouton #helpBtn non trouvé.");
  }
}

/**
 * Affiche le modal d'aide (exemple de contenu).
 */
function showHelpModal() {
   if (document.querySelector('.help-modal')) return; // Éviter modals multiples

  const helpModal = document.createElement('div');
  helpModal.className = 'help-modal';
  helpModal.style.cssText = `/* ... styles du modal ... */`; // Styles du modal comme avant
  helpModal.innerHTML = `<!-- ... contenu HTML du modal ... -->`; // Contenu HTML comme avant

  document.body.appendChild(helpModal);

  // Logique pour fermer le modal (bouton, clic extérieur, touche Echap)
  const closeHelpModal = () => { /* ... logique de fermeture ... */ };
  helpModal.querySelector('#closeHelpBtn')?.addEventListener('click', closeHelpModal);
  helpModal.addEventListener('click', (e) => { if (e.target === helpModal) closeHelpModal(); });
  const escapeListener = (e) => { if (e.key === 'Escape') closeHelpModal(); };
  document.addEventListener('keydown', escapeListener);
  // S'assurer de retirer l'écouteur Echap lors de la fermeture
  const originalClose = closeHelpModal;
  closeHelpModal = () => { originalClose(); document.removeEventListener('keydown', escapeListener); };

  // Appliquer animation d'entrée
  requestAnimationFrame(() => {
      helpModal.style.opacity = '1';
      helpModal.querySelector('.help-modal-content').style.transform = 'scale(1)';
  });
   if (JoinSystem.debug) console.log("HELP: Modal affiché.");
}

// Le contenu détaillé de showHelpModal et la logique de fermeture sont omis ici pour la clarté,
// mais ils devraient être basés sur votre version précédente qui fonctionnait.
