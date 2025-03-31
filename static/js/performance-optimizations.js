/**
 * Optimisations corrigées pour l'application de réservation de salles
 * Version 3.0 - Résout les problèmes spécifiques avec:
 * 1. Positionnement correct de la liste des salles (au-dessus des boutons)
 * 2. Amélioration de l'affichage des ID récents
 * 3. Correction du comportement du menu (ouverture/fermeture)
 * 4. Redirection directe vers Teams sans écran intermédiaire
 */

document.addEventListener('DOMContentLoaded', function() {
    // Appliquer les optimisations et corrections
    fixRoomsDisplayPosition();
    enhanceRecentIdsDisplay();
    fixMenuBehavior();
    fixTeamsDirectJoin();
    reduceInteractionLatency();
    
    // Log pour confirmer l'initialisation
    console.log("Optimisations corrigées initialisées - v3.0");
});

/**
 * Corrige le positionnement de la liste des salles
 * pour l'afficher juste au-dessus du bandeau de boutons en bas
 */
function fixRoomsDisplayPosition() {
    // Styles corrigés pour positionner la section des salles
    addGlobalStyles(`
        .rooms-section {
            position: absolute !important;
            bottom: 60px !important; /* Position juste au-dessus du bandeau du bas */
            left: 0 !important;
            right: 0 !important;
            top: auto !important;
            transform: none !important;
            width: 100% !important;
            max-width: none !important;
            max-height: 230px !important;
            margin: 0 !important;
            padding: 10px 15px !important;
            background: rgba(40, 40, 40, 0.95) !important;
            backdrop-filter: blur(10px) !important;
            border-radius: 15px 15px 0 0 !important;
            box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.4) !important;
            display: none;
            opacity: 0;
            transition: opacity 0.3s ease, transform 0.3s ease !important;
            z-index: 1000 !important; /* Valeur élevée pour s'assurer qu'il est au-dessus des autres éléments */
            transform: translateY(100%) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        
        .rooms-section.visible {
            display: block !important;
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
        /* Layout amélioré pour les salles */
        .rooms {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 10px !important;
            justify-content: center !important;
            overflow-y: auto !important;
            max-height: 200px !important;
            padding: 5px 0 !important;
            margin: 0 !important;
        }
        
        .room-card {
            width: 120px !important;
            height: 80px !important;
            padding: 10px !important;
            margin: 0 !important;
            background: rgba(50, 50, 50, 0.7) !important;
            border-radius: 8px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            cursor: pointer !important;
            transition: transform 0.2s ease, box-shadow 0.2s ease !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        
        .room-card:hover {
            transform: translateY(-3px) !important;
            box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3) !important;
            background: rgba(60, 60, 60, 0.8) !important;
        }
    `);
    
    // Observer pour corriger dynamiquement
    const roomsSection = document.querySelector('.rooms-section');
    if (roomsSection) {
        fixRoomsSectionPosition(roomsSection);
    }
    
    // Observer les mutations du DOM pour attraper la création dynamique
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (let node of mutation.addedNodes) {
                    if (node.classList && node.classList.contains('rooms-section')) {
                        fixRoomsSectionPosition(node);
                    }
                }
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Fonction pour appliquer correctement la position
    function fixRoomsSectionPosition(element) {
        if (!element) return;
        
        // Forcer le style directement
        element.style.position = 'absolute';
        element.style.bottom = '60px';
        element.style.left = '0';
        element.style.right = '0';
        element.style.top = 'auto';
        element.style.transform = 'translateY(100%)';
        element.style.width = '100%';
        element.style.maxWidth = 'none';
        element.style.margin = '0';
        element.style.zIndex = '1000';
        element.style.borderRadius = '15px 15px 0 0';
        
        // Ajouter une classe pour nos styles
        element.classList.add('optimized-room-section');
    }
    
    // Corriger le comportement des boutons d'affichage
    const toggleButtons = document.querySelectorAll('.toggle-rooms-button, #toggleRoomsBtn, #showRoomsBtn, .rooms-toggle-button-floating');
    toggleButtons.forEach(button => {
        // Cloner pour supprimer les anciens événements
        const newButton = button.cloneNode(true);
        if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);
        }
        
        // Ajouter le nouvel événement
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const roomsSection = document.querySelector('.rooms-section');
            if (!roomsSection) return;
            
            const isVisible = roomsSection.classList.contains('visible');
            
            // Basculer la visibilité
            if (isVisible) {
                roomsSection.classList.remove('visible');
                updateToggleButtonsText(false);
            } else {
                // S'assurer que la position est correcte avant d'afficher
                fixRoomsSectionPosition(roomsSection);
                roomsSection.classList.add('visible');
                updateToggleButtonsText(true);
            }
        });
    });
    
    // Mettre à jour le texte des boutons
    function updateToggleButtonsText(isVisible) {
        const showText = '<i class="fas fa-door-open"></i> Afficher les salles';
        const hideText = '<i class="fas fa-times"></i> Masquer les salles';
        
        toggleButtons.forEach(button => {
            if (button) button.innerHTML = isVisible ? hideText : showText;
        });
    }
}

/**
 * Améliore l'affichage des ID récemment utilisés
 */
function enhanceRecentIdsDisplay() {
    // Styles améliorés pour l'historique des ID
    addGlobalStyles(`
        /* Conteneur des ID récents */
        .recent-ids-container {
            position: absolute !important;
            background: rgba(50, 50, 50, 0.95) !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5) !important;
            z-index: 1000 !important;
            min-width: 250px !important;
            width: 100% !important;
            padding: 0 !important;
            margin-top: 5px !important;
            backdrop-filter: blur(5px) !important;
            overflow: hidden !important;
        }
        
        /* Titre */
        .recent-ids-container h4 {
            margin: 0 !important;
            padding: 12px 15px !important;
            font-size: 0.9rem !important;
            color: #fff !important;
            background: rgba(73, 109, 199, 0.3) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.15) !important;
            font-weight: bold !important;
        }
        
        /* Items */
        .recent-id {
            padding: 10px 15px !important;
            cursor: pointer !important;
            transition: background 0.2s !important;
            font-size: 1rem !important;
            display: flex !important;
            align-items: center !important;
            color: #fff !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
        
        .recent-id:last-child {
            border-bottom: none !important;
        }
        
        .recent-id i {
            margin-right: 10px !important;
            color: rgba(255, 255, 255, 0.7) !important;
            font-size: 1rem !important;
        }
        
        .recent-id .id-text {
            font-family: monospace !important;
            font-weight: bold !important;
        }
        
        .recent-id:hover {
            background: rgba(73, 109, 199, 0.5) !important;
        }
    `);
    
    // Trouver ou créer le conteneur des ID récents
    let recentIdsContainer = document.getElementById('recent-ids');
    if (!recentIdsContainer) {
        recentIdsContainer = document.createElement('div');
        recentIdsContainer.id = 'recent-ids';
        recentIdsContainer.className = 'recent-ids-container';
        recentIdsContainer.style.display = 'none';
        document.body.appendChild(recentIdsContainer);
    }
    
    // Gérer l'affichage des ID récents
    const meetingIdField = document.getElementById('meeting-id');
    if (meetingIdField) {
        // Supprimer les anciens écouteurs
        const newMeetingIdField = meetingIdField.cloneNode(true);
        if (meetingIdField.parentNode) {
            meetingIdField.parentNode.replaceChild(newMeetingIdField, meetingIdField);
        }
        
        // Ajouter les nouveaux écouteurs
        newMeetingIdField.addEventListener('focus', function() {
            showRecentIds(this);
        });
        
        newMeetingIdField.addEventListener('click', function() {
            showRecentIds(this);
        });
        
        // Empêcher la fermeture immédiate au clic
        newMeetingIdField.addEventListener('mousedown', function(e) {
            e.stopPropagation();
        });
    }
    
    // Fonction pour afficher les ID récents
    function showRecentIds(inputField) {
        // Récupérer les ID récents
        const recentIds = JSON.parse(localStorage.getItem('recentMeetingIds') || '[]');
        
        if (recentIds.length === 0) {
            recentIdsContainer.style.display = 'none';
            return;
        }
        
        // Positionner correctement
        const rect = inputField.getBoundingClientRect();
        recentIdsContainer.style.top = `${rect.bottom + window.scrollY}px`;
        recentIdsContainer.style.left = `${rect.left + window.scrollX}px`;
        recentIdsContainer.style.width = `${rect.width}px`;
        
        // Construire le contenu
        recentIdsContainer.innerHTML = `
            <h4><i class="fas fa-history"></i> Récemment utilisés</h4>
            <div class="recent-ids-list"></div>
        `;
        
        const idsList = recentIdsContainer.querySelector('.recent-ids-list');
        recentIds.forEach(id => {
            const idItem = document.createElement('div');
            idItem.className = 'recent-id';
            idItem.innerHTML = `
                <i class="fas fa-key"></i>
                <span class="id-text">${id}</span>
            `;
            
            idItem.addEventListener('click', function(e) {
                e.stopPropagation();
                inputField.value = id;
                recentIdsContainer.style.display = 'none';
                
                // Tenter de rejoindre directement
                if (window.JoinSystem && typeof window.JoinSystem.joinMeetingWithId === 'function') {
                    setTimeout(() => {
                        window.JoinSystem.joinMeetingWithId(id);
                    }, 100);
                }
            });
            
            idsList.appendChild(idItem);
        });
        
        // Afficher
        recentIdsContainer.style.display = 'block';
        
        // Cliquer en dehors pour fermer
        function closeOnClickOutside(e) {
            if (!recentIdsContainer.contains(e.target) && e.target !== inputField) {
                recentIdsContainer.style.display = 'none';
                document.removeEventListener('mousedown', closeOnClickOutside);
            }
        }
        
        document.addEventListener('mousedown', closeOnClickOutside);
    }
}

/**
 * Corrige le comportement du menu latéral (ouverture/fermeture)
 */
function fixMenuBehavior() {
    const menuToggle = document.querySelector('.menu-toggle-visible');
    const sideMenu = document.querySelector('.side-menu');
    const mainContainer = document.querySelector('.main-container');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    if (!menuToggle || !sideMenu || !mainContainer) return;
    
    // Supprimer tous les écouteurs existants pour le menu
    const newMenuToggle = menuToggle.cloneNode(true);
    if (menuToggle.parentNode) {
        menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);
    }
    
    if (menuOverlay) {
        const newMenuOverlay = menuOverlay.cloneNode(true);
        if (menuOverlay.parentNode) {
            menuOverlay.parentNode.replaceChild(newMenuOverlay, menuOverlay);
        }
    }
    
    // Flag pour l'état du menu
    let menuExpanded = false;
    
    // Fonction pour ouvrir le menu
    function openMenu() {
        if (menuExpanded) return;
        
        menuExpanded = true;
        sideMenu.classList.add('expanded');
        mainContainer.classList.add('menu-expanded');
        
        if (menuOverlay) {
            menuOverlay.classList.add('active');
        }
    }
    
    // Fonction pour fermer le menu
    function closeMenu() {
        if (!menuExpanded) return;
        
        menuExpanded = false;
        sideMenu.classList.remove('expanded');
        mainContainer.classList.remove('menu-expanded');
        
        if (menuOverlay) {
            menuOverlay.classList.remove('active');
        }
    }
    
    // Attacher le gestionnaire pour l'ouverture du menu
    newMenuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Basculer l'état
        if (!menuExpanded) {
            openMenu();
        } else {
            closeMenu();
        }
    });
    
    // Attacher le gestionnaire à l'overlay pour la fermeture
    if (menuOverlay && menuOverlay.parentNode) {
        menuOverlay.parentNode.querySelector('.menu-overlay').addEventListener('click', function() {
            closeMenu();
        });
    }
    
    // Gestionnaire global pour fermer le menu au clic en dehors
    document.addEventListener('click', function(e) {
        if (menuExpanded) {
            // Vérifier si le clic est en dehors du menu et du bouton de menu
            if (!sideMenu.contains(e.target) && e.target !== newMenuToggle && !newMenuToggle.contains(e.target)) {
                closeMenu();
            }
        }
    });
    
    // Optimiser les animations
    addGlobalStyles(`
        .side-menu {
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            will-change: transform;
        }
        
        .side-menu.expanded {
            transform: translateX(0);
        }
        
        .menu-overlay {
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
            will-change: opacity;
        }
        
        .menu-overlay.active {
            opacity: 1;
            visibility: visible;
        }
    `);
}

/**
 * Solution avancée pour la redirection directe vers Teams sans écran intermédiaire 
 */
function fixTeamsDirectJoin() {
    // Sauvegarde de l'état pour empêcher les déclenchements multiples
    window.joiningMeeting = false;
    
    /**
     * Fonction améliorée pour la redirection directe vers Teams
     * @param {string} providedId - ID de réunion optionnel
     */
    function enhancedJoinMeetingWithId(providedId = null) {
        // Empêcher les déclenchements multiples
        if (window.joiningMeeting) {
            console.log("Jointure déjà en cours");
            return;
        }
        
        window.joiningMeeting = true;
        
        // Récupérer l'ID depuis le champ ou le paramètre
        const meetingIdField = document.getElementById('meeting-id');
        if (!meetingIdField && !providedId) {
            showStatusMessage("Veuillez entrer l'ID de la réunion", "error");
            window.joiningMeeting = false;
            return;
        }
        
        let meetingId = providedId || (meetingIdField ? meetingIdField.value.trim() : '');
        if (!meetingId) {
            showStatusMessage("Veuillez entrer l'ID de la réunion", "error");
            window.joiningMeeting = false;
            return;
        }
        
        // Nettoyer l'ID
        meetingId = cleanMeetingId(meetingId);
        
        // Éléments d'interface
        const joinButton = document.getElementById('joinMeetingBtn');
        const originalButtonText = joinButton ? joinButton.innerHTML : '';
        
        // Mettre à jour l'interface
        if (joinButton) {
            joinButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
            joinButton.disabled = true;
        }
        
        // Sauvegarder l'ID dans l'historique récent
        saveRecentId(meetingId);
        
        // Essayer d'utiliser l'API lookup (si disponible)
        tryLookupMeeting(meetingId)
            .then(joinUrl => {
                if (joinUrl) {
                    // Lancer l'application Teams directement via différentes méthodes
                    launchTeamsMeeting(joinUrl, meetingId);
                } else {
                    // Utiliser l'approche directe avec l'ID
                    launchTeamsMeeting(null, meetingId);
                }
            })
            .catch(error => {
                console.error("Erreur lors de la jointure:", error);
                showStatusMessage("Erreur lors de la connexion à Teams", "error");
                launchTeamsMeeting(null, meetingId);
            })
            .finally(() => {
                // Restaurer l'interface
                setTimeout(() => {
                    if (joinButton) {
                        joinButton.innerHTML = originalButtonText;
                        joinButton.disabled = false;
                    }
                    window.joiningMeeting = false;
                }, 2000);
            });
    }
    
    /**
     * Fonction qui tente différentes approches pour lancer directement Teams
     * @param {string} joinUrl - URL de jointure si disponible
     * @param {string} meetingId - ID de la réunion
     */
    function launchTeamsMeeting(joinUrl, meetingId) {
        // MÉTHODE 1: Teams Protocol URL (msteams://)
        try {
            const teamsProtocolUrl = buildTeamsProtocolUrl(meetingId);
            const teamsFrame = document.createElement('iframe');
            teamsFrame.style.display = 'none';
            teamsFrame.onload = function() {
                // S'il se charge, l'app Teams est ouverte
                document.body.removeChild(teamsFrame);
            };
            teamsFrame.onerror = function() {
                // En cas d'échec, essayer les autres méthodes
                document.body.removeChild(teamsFrame);
                tryAlternativeMethod();
            };
            teamsFrame.src = teamsProtocolUrl;
            document.body.appendChild(teamsFrame);
            
            // Toujours essayer les méthodes alternatives après un délai
            // car l'iframe pourrait ne pas déclencher d'erreur même si Teams n'est pas installé
            setTimeout(tryAlternativeMethod, 500);
        } catch (e) {
            console.error("Erreur lors du lancement via protocol:", e);
            tryAlternativeMethod();
        }
        
        // Fonction pour essayer les méthodes alternatives
        function tryAlternativeMethod() {
            // MÉTHODE 2: URL avec paramètres spéciaux
            if (joinUrl) {
                const enhancedUrl = enhanceTeamsUrl(joinUrl);
                window.open(enhancedUrl, "_blank");
                showStatusMessage("Redirection vers Teams...", "success");
            } else {
                // MÉTHODE 3: URL avec l'ID direct (fallback)
                const directUrl = buildDirectTeamsUrl(meetingId);
                window.open(directUrl, "_blank");
                showStatusMessage("Redirection vers Teams...", "info");
            }
        }
    }
    
    /**
     * Construit une URL de protocole Teams pour lancement direct
     * @param {string} meetingId - ID de la réunion
     * @returns {string} URL de protocole Teams
     */
    function buildTeamsProtocolUrl(meetingId) {
        // Format: msteams:/l/meetup-join/[meetingID]
        return `msteams:/l/meetup-join/19:meeting_${meetingId}@thread.v2`;
    }
    
    /**
     * Construit une URL directe Teams avec tous les paramètres nécessaires
     * @param {string} meetingId - ID de la réunion
     * @returns {string} URL directe Teams
     */
    function buildDirectTeamsUrl(meetingId) {
        const baseUrl = `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${meetingId}%40thread.v2/0`;
        const params = new URLSearchParams({
            'context': '{"Tid":"4dc0974a-7836-414e-8dda-347f31dac3eb"}',
            'directDl': 'true',
            'msLaunch': 'true',
            'enableMobilePage': 'true',
            'suppressPrompt': 'true',
            'skipRollback': 'true',
            'launchMode': 'full',
            'preferredHandlingOf': 'teams'
        });
        
        return `${baseUrl}?${params.toString()}`;
    }
    
    /**
     * Améliore une URL Teams existante avec des paramètres pour redirection directe
     * @param {string} baseUrl - URL de base Teams
     * @returns {string} URL améliorée
     */
    function enhanceTeamsUrl(baseUrl) {
        try {
            const url = new URL(baseUrl);
            
            // Paramètres pour lancement direct
            url.searchParams.set('directDl', 'true');
            url.searchParams.set('msLaunch', 'true');
            url.searchParams.set('enableMobilePage', 'true');
            url.searchParams.set('suppressPrompt', 'true');
            url.searchParams.set('skipRollback', 'true');
            url.searchParams.set('launchMode', 'full');
            url.searchParams.set('preferredHandlingOf', 'teams');
            
            return url.toString();
        } catch (e) {
            console.error("Erreur lors de l'amélioration de l'URL:", e);
            return baseUrl;
        }
    }
    
    /**
     * Utilise l'API lookupMeeting pour obtenir l'URL de réunion
     * @param {string} meetingId - ID de la réunion
     * @returns {Promise<string>} URL de réunion ou null
     */
    async function tryLookupMeeting(meetingId) {
        try {
            const response = await fetch(`/lookupMeeting?meetingId=${encodeURIComponent(meetingId)}`);
            if (!response.ok) {
                return null;
            }
            const data = await response.json();
            return data.joinUrl || null;
        } catch (e) {
            console.error("Erreur API lookup:", e);
            return null;
        }
    }
    
    /**
     * Nettoie l'ID de réunion selon différentes règles
     * @param {string} id - ID de réunion brut
     * @returns {string} ID nettoyé
     */
    function cleanMeetingId(id) {
        // Si c'est une URL complète, extraire l'ID
        if (id.includes('teams.microsoft.com/l/meetup-join')) {
            const urlMatch = id.match(/19%3ameeting_([^%@]+)/i);
            if (urlMatch && urlMatch[1]) {
                return urlMatch[1];
            }
        }
        
        // Si c'est un ID numérique simple (comme dans l'exemple)
        if (/^\d+$/.test(id)) {
            return id;
        }
        
        // Nettoyage général pour autres formats
        return id.replace(/[^a-zA-Z0-9]/g, '');
    }
    
    /**
     * Sauvegarde l'ID dans l'historique récent
     * @param {string} id - ID de réunion
     */
    function saveRecentId(id) {
        let recentIds = JSON.parse(localStorage.getItem('recentMeetingIds') || '[]');
        
        // Éviter les doublons
        if (!recentIds.includes(id)) {
            recentIds.unshift(id);
            recentIds = recentIds.slice(0, 5); // Garder les 5 plus récents
            localStorage.setItem('recentMeetingIds', JSON.stringify(recentIds));
        }
    }
    
    /**
     * Affiche un message de statut temporaire
     * @param {string} message - Message à afficher
     * @param {string} type - Type de message (success, error, info, warning)
     */
    function showStatusMessage(message, type) {
        // Créer ou trouver l'élément de message
        let messageContainer = document.getElementById('status-message');
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.id = 'status-message';
            messageContainer.style.position = 'fixed';
            messageContainer.style.top = '20px';
            messageContainer.style.left = '50%';
            messageContainer.style.transform = 'translateX(-50%)';
            messageContainer.style.padding = '10px 20px';
            messageContainer.style.borderRadius = '5px';
            messageContainer.style.color = 'white';
            messageContainer.style.fontWeight = 'bold';
            messageContainer.style.zIndex = '9999';
            messageContainer.style.textAlign = 'center';
            messageContainer.style.display = 'none';
            messageContainer.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
            document.body.appendChild(messageContainer);
        }
        
        // Définir le style selon le type
        switch (type) {
            case 'success':
                messageContainer.style.backgroundColor = '#4CAF50';
                break;
            case 'error':
                messageContainer.style.backgroundColor = '#F44336';
                break;
            case 'warning':
                messageContainer.style.backgroundColor = '#FF9800';
                break;
            case 'info':
            default:
                messageContainer.style.backgroundColor = '#2196F3';
        }
        
        // Afficher le message
        messageContainer.textContent = message;
        messageContainer.style.display = 'block';
        
        // Masquer après 3 secondes
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 3000);
    }
    
    // Remplacer la fonction originale
    if (window.JoinSystem) {
        window.JoinSystem.joinMeetingWithId = enhancedJoinMeetingWithId;
    } else {
        window.JoinSystem = { joinMeetingWithId: enhancedJoinMeetingWithId };
    }
    
    // Fonction globale également
    window.joinMeetingWithId = enhancedJoinMeetingWithId;
    
    // Attacher au bouton de jointure
    const joinButton = document.getElementById('joinMeetingBtn');
    if (joinButton) {
        // Supprimer les anciens écouteurs
        const newJoinButton = joinButton.cloneNode(true);
        if (joinButton.parentNode) {
            joinButton.parentNode.replaceChild(newJoinButton, joinButton);
        }
        
        // Nouveau gestionnaire
        newJoinButton.addEventListener('click', function(e) {
            e.preventDefault();
            enhancedJoinMeetingWithId();
        });
    }
    
    // Attacher à l'appui sur Entrée dans le champ
    const meetingIdField = document.getElementById('meeting-id');
    if (meetingIdField) {
        meetingIdField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                enhancedJoinMeetingWithId();
            }
        });
    }
}

/**
 * Optimisations ciblées pour réduire la latence des interactions (INP)
 */
function reduceInteractionLatency() {
    // Désactiver le logging excessif
    disableDebugLogging();
    
    // Optimiser les écouteurs d'événements
    optimizeEventListeners();
    
    // Réduire les manipulations DOM
    reduceDomOperations();
    
    // Optimiser le rendu
    optimizeRendering();
}

/**
 * Désactive les logs de débogage en production
 */
function disableDebugLogging() {
    // Vérifier l'environnement
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return; // Garder les logs en développement
    }
    
    // Sauvegarder les fonctions originales
    if (!window._originalConsole) {
        window._originalConsole = {
            log: console.log,
            debug: console.debug,
            info: console.info
        };
    }
    
    // Fonction vide
    const noop = function() {};
    
    // Remplacer les fonctions non critiques
    console.log = noop;
    console.debug = noop;
    console.info = noop;
    
    // Garder error et warn intacts pour le débogage
}

/**
 * Optimise les écouteurs d'événements
 */
function optimizeEventListeners() {
    // Utiliser la délégation d'événements pour les boutons
    document.addEventListener('click', function(e) {
        // Boutons génériques
        const button = e.target.closest('button:not([data-optimized-handler])');
        if (button) {
            // Marquer comme traité
            button.setAttribute('data-optimized-handler', 'true');
            
            // Effet visuel
            button.style.transform = 'scale(0.97)';
            setTimeout(() => {
                button.style.transform = '';
            }, 100);
        }
    });
}

/**
 * Réduit les manipulations DOM
 */
function reduceDomOperations() {
    // Utiliser DocumentFragment pour les insertions multiples
    const originalAppendChild = Element.prototype.appendChild;
    Element.prototype.appendChild = function(child) {
        // Si plusieurs enfants à ajouter, utiliser un fragment
        if (this._pendingChildren) {
            this._pendingChildren.appendChild(child);
            return child;
        }
        
        return originalAppendChild.call(this, child);
    };
    
    // Ajouter des méthodes pour grouper les manipulations DOM
    Element.prototype.batchAppend = function(callback) {
        this._pendingChildren = document.createDocumentFragment();
        callback();
        originalAppendChild.call(this, this._pendingChildren);
        delete this._pendingChildren;
    };
}

/**
 * Optimise le rendu et les animations
 */
function optimizeRendering() {
    // Styles pour optimiser le rendu
    addGlobalStyles(`
        /* Empêcher les reflows inutiles */
        * {
            box-sizing: border-box;
        }
        
        /* Utiliser transform au lieu de propriétés coûteuses */
        .meeting-item, .room-card, button, .popup, .modal-content {
            will-change: transform, opacity;
            transform: translateZ(0);
            backface-visibility: hidden;
        }
        
        /* Accélération matérielle pour les animations */
        .side-menu, .rooms-section, .menu-overlay {
            will-change: transform, opacity;
            transform: translateZ(0);
        }
        
        /* Optimiser les transitions */
        .meeting-item:hover, .room-card:hover, button:hover {
            transform: translateY(-2px) translateZ(0);
        }
    `);
}

/**
 * Utilitaire pour ajouter des styles globaux
 * @param {string} cssText - Code CSS à ajouter
 */
function addGlobalStyles(cssText) {
    // Vérifier si ce style existe déjà
    const styleId = 'optimized-styles-' + hashString(cssText.substring(0, 100));
    if (document.getElementById(styleId)) return;
    
    // Créer l'élément style
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = cssText;
    document.head.appendChild(styleElement);
}

/**
 * Calcule un hash simple pour une chaîne
 * @param {string} str - Chaîne à hasher
 * @returns {string} Hash hexadécimal
 */
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Conversion en 32-bit
    }
    return Math.abs(hash).toString(16);
}
