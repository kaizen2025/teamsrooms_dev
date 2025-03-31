/**
 * Corrections finales pour l'application de réservation de salles
 * Version 5.0 - Correctifs critiques:
 * 1. Correction définitive de la redirection Teams directe
 * 2. Réorganisation visuelle des salles en largeur complète
 * 3. Augmentation significative de la transparence des bannières
 * 4. Correction des superpositions de blocs
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Initialisation des corrections finales v5.0");
    setTimeout(() => {
        // 1. Correction de la redirection Teams
        fixTeamsRedirection();
        
        // 2. Correction de l'affichage des salles
        fixRoomsDisplayLayout();
        
        // 3. Amélioration de la transparence et correction des superpositions
        fixVisualAppearance();
        
        // 4. Optimisation globale
        improveGlobalPerformance();
    }, 100);
});

/**
 * Corrige définitivement la redirection Teams à partir des logs
 */
function fixTeamsRedirection() {
    // Désactiver les redirections précédentes
    if (window.JoinSystem && window.JoinSystem.joinMeetingWithId) {
        window.JoinSystem._originalJoinMeetingWithId = window.JoinSystem.joinMeetingWithId;
    }
    
    // Tenant ID de l'organisation (extrait de votre URL d'exemple)
    const TENANT_ID = "3991cba7-1148-49eb-9aa9-0c46dba8f57e";
    
    // Nouvelle implémentation corrigée pour la jointure
    function correctTeamsJoin(providedId = null) {
        // Éviter les déclenchements multiples
        if (window.isJoiningMeeting) {
            console.log("Une jointure est déjà en cours");
            return;
        }
        
        window.isJoiningMeeting = true;
        
        // Trouver le champ d'ID et récupérer la valeur
        const meetingIdField = document.getElementById('meeting-id');
        const meetingId = providedId || (meetingIdField ? meetingIdField.value.trim() : '');
        
        if (!meetingId) {
            alert("Veuillez entrer l'ID de la réunion");
            window.isJoiningMeeting = false;
            return;
        }
        
        // Actualiser l'interface
        const joinButton = document.getElementById('joinMeetingBtn');
        if (joinButton) {
            joinButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            joinButton.disabled = true;
        }
        
        // MÉTHODE 1: Tentative de récupération via API
        fetch(`/lookupMeeting?meetingId=${encodeURIComponent(meetingId)}&_=${Date.now()}`)
            .then(response => response.json())
            .then(data => {
                // Sauvegarder l'ID pour l'historique
                saveRecentMeetingId(meetingId);
                
                let teamsUrl;
                if (data && data.joinUrl) {
                    // Si l'API retourne une URL, l'utiliser mais avec nos propres paramètres
                    teamsUrl = createBetterTeamsUrl(meetingId);
                } else {
                    // Sinon utiliser notre URL optimisée
                    teamsUrl = createBetterTeamsUrl(meetingId);
                }
                
                // Rédiriger vers la réunion
                window.open(teamsUrl, "_blank");
                
                // Réinitialiser l'interface après un délai
                setTimeout(() => {
                    if (joinButton) {
                        joinButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Rejoindre';
                        joinButton.disabled = false;
                    }
                    window.isJoiningMeeting = false;
                }, 2000);
            })
            .catch(error => {
                console.error("Erreur lors de la recherche de la réunion:", error);
                
                // En cas d'erreur, utiliser directement l'URL optimisée
                const teamsUrl = createBetterTeamsUrl(meetingId);
                window.open(teamsUrl, "_blank");
                
                // Réinitialiser l'interface
                setTimeout(() => {
                    if (joinButton) {
                        joinButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Rejoindre';
                        joinButton.disabled = false;
                    }
                    window.isJoiningMeeting = false;
                }, 2000);
            });
    }
    
    /**
     * Crée une URL Teams optimisée EXACTEMENT comme l'exemple fourni
     * @param {string} meetingId - ID de la réunion
     * @returns {string} - URL Teams optimisée
     */
    function createBetterTeamsUrl(meetingId) {
        // CORRECTION CRUCIALE : utilisation du format exact de l'URL fournie en exemple
        // Le format est différent des URL que nous avons tenté de construire précédemment
        
        // Préparer le context avec les IDs requis dans le même format que l'exemple fourni
        const context = `%7b%22Tid%22%3a%22${TENANT_ID}%22%7d`;
        
        // Construire l'URL complète
        return `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${meetingId}%40thread.v2/0?context=${context}`
               + `&directDl=true&msLaunch=true&enableMobilePage=true&suppressPrompt=true`;
    }
    
    /**
     * Sauvegarde l'ID de réunion dans l'historique
     */
    function saveRecentMeetingId(id) {
        if (!id) return;
        
        let recentIds = JSON.parse(localStorage.getItem('recentMeetingIds') || '[]');
        
        // Éviter les doublons
        const index = recentIds.indexOf(id);
        if (index !== -1) {
            recentIds.splice(index, 1);
        }
        
        // Ajouter en premier et limiter à 5
        recentIds.unshift(id);
        recentIds = recentIds.slice(0, 5);
        
        localStorage.setItem('recentMeetingIds', JSON.stringify(recentIds));
    }
    
    // Remplacer la fonction de jointure
    window.joinMeetingWithId = correctTeamsJoin;
    
    // Remplacer dans l'objet JoinSystem
    if (window.JoinSystem) {
        window.JoinSystem.joinMeetingWithId = correctTeamsJoin;
    } else {
        window.JoinSystem = { joinMeetingWithId: correctTeamsJoin };
    }
    
    // Réattacher au bouton de jointure
    const joinButton = document.getElementById('joinMeetingBtn');
    if (joinButton) {
        const newJoinButton = joinButton.cloneNode(true);
        joinButton.parentNode.replaceChild(newJoinButton, joinButton);
        
        newJoinButton.addEventListener('click', function(e) {
            e.preventDefault();
            correctTeamsJoin();
        });
    }
    
    // Attacher à la touche Entrée dans le champ ID
    const meetingIdField = document.getElementById('meeting-id');
    if (meetingIdField) {
        meetingIdField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                correctTeamsJoin();
            }
        });
    }
    
    // Améliorations de l'historique des IDs
    enhanceRecentIds();
}

/**
 * Améliore l'affichage des IDs récents
 */
function enhanceRecentIds() {
    // Rechercher ou créer le conteneur pour les IDs récents
    let recentIdsContainer = document.getElementById('recent-ids');
    if (!recentIdsContainer) {
        recentIdsContainer = document.createElement('div');
        recentIdsContainer.id = 'recent-ids';
        recentIdsContainer.style.position = 'absolute';
        recentIdsContainer.style.background = 'rgba(60, 60, 60, 0.95)';
        recentIdsContainer.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        recentIdsContainer.style.borderRadius = '8px';
        recentIdsContainer.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
        recentIdsContainer.style.zIndex = '1000';
        recentIdsContainer.style.width = '100%';
        recentIdsContainer.style.overflow = 'hidden';
        recentIdsContainer.style.backdropFilter = 'blur(8px)';
        recentIdsContainer.style.display = 'none';
        document.body.appendChild(recentIdsContainer);
    }
    
    // Gérer le focus sur le champ ID
    const meetingIdField = document.getElementById('meeting-id');
    if (meetingIdField) {
        meetingIdField.addEventListener('focus', function() {
            updateRecentIdsDisplay(this);
        });
        
        meetingIdField.addEventListener('click', function() {
            updateRecentIdsDisplay(this);
        });
    }
    
    // Fermer la liste au clic en dehors
    document.addEventListener('click', function(e) {
        if (e.target !== meetingIdField && !recentIdsContainer.contains(e.target)) {
            recentIdsContainer.style.display = 'none';
        }
    });
    
    // Fonction pour afficher les IDs récents
    function updateRecentIdsDisplay(inputField) {
        const recentIds = JSON.parse(localStorage.getItem('recentMeetingIds') || '[]');
        
        if (recentIds.length === 0) {
            recentIdsContainer.style.display = 'none';
            return;
        }
        
        // Positionner par rapport au champ
        const rect = inputField.getBoundingClientRect();
        recentIdsContainer.style.top = `${rect.bottom + window.scrollY + 5}px`;
        recentIdsContainer.style.left = `${rect.left + window.scrollX}px`;
        recentIdsContainer.style.width = `${rect.width}px`;
        
        // Construire le contenu
        recentIdsContainer.innerHTML = `
            <div style="background: rgba(98, 100, 167, 0.4); padding: 10px 15px; font-size: 14px; color: white; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                <i class="fas fa-history"></i> Récemment utilisés
            </div>
            <div id="recent-ids-list"></div>
        `;
        
        const listElement = document.getElementById('recent-ids-list');
        recentIds.forEach(id => {
            const item = document.createElement('div');
            item.style.padding = '10px 15px';
            item.style.cursor = 'pointer';
            item.style.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';
            item.style.transition = 'background 0.2s ease';
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            
            item.innerHTML = `
                <i class="fas fa-key" style="margin-right: 10px; color: rgba(255, 255, 255, 0.7);"></i>
                <span style="font-family: monospace; font-weight: bold; font-size: 16px; color: white;">${id}</span>
            `;
            
            item.addEventListener('mouseover', function() {
                this.style.background = 'rgba(98, 100, 167, 0.3)';
            });
            
            item.addEventListener('mouseout', function() {
                this.style.background = 'transparent';
            });
            
            item.addEventListener('click', function() {
                inputField.value = id;
                recentIdsContainer.style.display = 'none';
                
                if (window.joinMeetingWithId) {
                    window.joinMeetingWithId(id);
                }
            });
            
            listElement.appendChild(item);
        });
        
        recentIdsContainer.style.display = 'block';
    }
}

/**
 * Corrige l'affichage des salles avec une disposition en largeur complète
 */
function fixRoomsDisplayLayout() {
    // Supprimer les styles précédents qui pourraient causer des conflits
    removeStylesWithPrefix('rooms-section-styles');
    
    // Ajouter les nouveaux styles pour la section des salles
    addStylesheet(`
        /* Styles optimisés pour la section des salles */
        .rooms-section {
            position: absolute !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 60px !important;
            top: auto !important;
            transform: none !important;
            width: 100% !important;
            max-width: none !important;
            height: auto !important;
            max-height: none !important;
            background: rgba(30, 30, 30, 0.85) !important;
            backdrop-filter: blur(8px) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
            box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.2) !important;
            margin: 0 !important;
            padding: 10px !important;
            z-index: 900 !important;
            display: none;
            border-radius: 0 !important;
        }
        
        .rooms-section.visible {
            display: block !important;
        }
        
        /* Disposition des cartes de salle en ligne */
        .rooms {
            display: flex !important;
            flex-wrap: nowrap !important;
            justify-content: center !important;
            align-items: center !important;
            gap: 10px !important;
            width: 100% !important;
            overflow-x: auto !important;
            padding: 5px 0 !important;
            scrollbar-width: thin !important;
        }
        
        /* Style pour les cartes de salle */
        .room-card {
            flex: 0 0 auto !important;
            width: auto !important;
            min-width: 120px !important;
            height: 80px !important;
            padding: 10px !important;
            margin: 0 !important;
            background: rgba(50, 50, 50, 0.5) !important;
            border-radius: 8px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            cursor: pointer !important;
            transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            text-align: center !important;
        }
        
        .room-card:hover {
            transform: translateY(-3px) !important;
            box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3) !important;
            background: rgba(60, 60, 60, 0.8) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
        }
        
        /* Texte des salles */
        .room-name {
            font-weight: bold !important;
            font-size: 0.9em !important;
            margin-bottom: 5px !important;
            color: white !important;
        }
        
        .room-status {
            font-size: 0.8em !important;
            display: flex !important;
            align-items: center !important;
            gap: 5px !important;
            color: #ddd !important;
        }
        
        /* Scrollbar pour la liste des salles */
        .rooms::-webkit-scrollbar {
            height: 5px !important;
        }
        
        .rooms::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05) !important;
        }
        
        .rooms::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2) !important;
            border-radius: 10px !important;
        }
    `, 'rooms-section-styles');
    
    // S'assurer que le clic en dehors ferme la liste des salles
    setupRoomsDismissal();
    
    // Corriger les boutons d'affichage des salles
    fixRoomsToggleButtons();
    
    // Fonction qui ferme la liste des salles quand on clique en dehors
    function setupRoomsDismissal() {
        document.addEventListener('click', function(e) {
            const roomsSection = document.querySelector('.rooms-section');
            if (!roomsSection) return;
            
            // Si la liste est visible et le clic est en dehors
            if (roomsSection.classList.contains('visible')) {
                // Ignorer les clics sur la section elle-même ou sur les boutons de contrôle
                if (!roomsSection.contains(e.target) && 
                    !e.target.closest('.toggle-rooms-button, #toggleRoomsBtn, #showRoomsBtn, [id*="Room"], .rooms-toggle-button-floating')) {
                    roomsSection.classList.remove('visible');
                    updateRoomsButtonsText(false);
                }
            }
        });
    }
    
    // Fonction pour corriger les boutons d'affichage des salles
    function fixRoomsToggleButtons() {
        const toggleButtons = document.querySelectorAll('.toggle-rooms-button, #toggleRoomsBtn, #showRoomsBtn, .rooms-toggle-button-floating, [id*="Room"], button[id*="salle"]');
        
        toggleButtons.forEach(button => {
            // Éviter d'ajouter plusieurs écouteurs
            if (button && !button.hasAttribute('data-rooms-handler-fixed')) {
                // Cloner pour supprimer les anciens écouteurs
                const newButton = button.cloneNode(true);
                if (button.parentNode) {
                    button.parentNode.replaceChild(newButton, button);
                }
                
                // Ajouter le nouvel écouteur
                newButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Basculer la visibilité
                    const roomsSection = document.querySelector('.rooms-section');
                    if (!roomsSection) return;
                    
                    const isVisible = roomsSection.classList.contains('visible');
                    roomsSection.classList.toggle('visible', !isVisible);
                    
                    // Mettre à jour le texte des boutons
                    updateRoomsButtonsText(!isVisible);
                });
                
                // Marquer comme traité
                newButton.setAttribute('data-rooms-handler-fixed', 'true');
            }
        });
    }
    
    // Fonction pour mettre à jour le texte des boutons
    function updateRoomsButtonsText(isVisible) {
        const showText = '<i class="fas fa-door-open"></i> Afficher les salles';
        const hideText = '<i class="fas fa-times"></i> Masquer les salles';
        
        const toggleButtons = document.querySelectorAll('.toggle-rooms-button, #toggleRoomsBtn, #showRoomsBtn, .rooms-toggle-button-floating, [id*="Room"], button[id*="salle"]');
        
        toggleButtons.forEach(button => {
            if (button) {
                button.innerHTML = isVisible ? hideText : showText;
            }
        });
    }
}

/**
 * Corrige l'apparence visuelle globale et les superpositions
 */
function fixVisualAppearance() {
    // Supprimer les styles précédents
    removeStylesWithPrefix('visual-appearance-styles');
    
    // Ajouter les nouveaux styles avec transparence considérablement augmentée
    addStylesheet(`
        /* Transparence augmentée pour la bannière d'en-tête */
        .header {
            background: rgba(30, 30, 30, 0.6) !important;
            backdrop-filter: blur(5px) !important;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2) !important;
            border-radius: 0 0 15px 15px !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-top: none !important;
            margin: 0 10px !important;
        }
        
        /* Transparence augmentée pour la bannière de bas de page */
        .controls-container {
            background: rgba(30, 30, 30, 0.6) !important;
            backdrop-filter: blur(5px) !important;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2) !important;
            border-radius: 15px 15px 0 0 !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-bottom: none !important;
            margin: 0 10px !important;
        }
        
        /* Transparence augmentée pour le conteneur de réunions */
        .meetings-container {
            background: rgba(30, 30, 30, 0.6) !important;
            backdrop-filter: blur(5px) !important;
            border-radius: 15px !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2) !important;
            overflow: hidden !important;
        }
        
        /* En-tête des réunions */
        .meetings-title-bar {
            background: rgba(40, 40, 40, 0.5) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 15px 15px 0 0 !important;
            padding: 12px 15px !important;
        }
        
        /* Éléments de réunion */
        .meeting-item {
            background: rgba(40, 40, 40, 0.5) !important;
            border-radius: 8px !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
            margin-bottom: 10px !important;
            padding: 12px !important;
            transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        }
        
        .meeting-item:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
        }
        
        /* Section ID de réunion en bas */
        .meeting-id-entry {
            background: rgba(40, 40, 40, 0.5) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 0 0 15px 15px !important;
            padding: 15px !important;
        }
        
        /* Champ ID de réunion */
        #meeting-id {
            background: rgba(30, 30, 30, 0.6) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-radius: 6px 0 0 6px !important;
            color: white !important;
            padding: 8px 12px !important;
        }
        
        /* Menu latéral */
        .side-menu {
            background: rgba(20, 20, 20, 0.8) !important;
            backdrop-filter: blur(10px) !important;
            box-shadow: 5px 0 10px rgba(0, 0, 0, 0.3) !important;
        }
        
        /* Titre central */
        .title {
            background: rgba(30, 30, 30, 0.7) !important;
            backdrop-filter: blur(5px) !important;
            border-radius: 10px !important;
            padding: 8px 20px !important;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25) !important;
        }
        
        /* Bannière de date/heure */
        .datetime {
            background: rgba(30, 30, 30, 0.7) !important;
            backdrop-filter: blur(5px) !important;
            border-radius: 10px !important;
            padding: 8px 15px !important;
        }
        
        /* Correction des superpositions */
        .meeting-item-details {
            max-width: 100% !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
        }
        
        /* Bouton Rejoindre des réunions */
        .meeting-join-btn {
            background: linear-gradient(to right, #6264A7, #7B83EB) !important;
            color: white !important;
            font-weight: 500 !important;
            padding: 6px 12px !important;
            border: none !important;
            border-radius: 6px !important;
            transition: all 0.2s ease !important;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3) !important;
        }
        
        .meeting-join-btn:hover {
            background: linear-gradient(to right, #7B83EB, #8A92F0) !important;
            box-shadow: 0 4px 8px rgba(98, 100, 167, 0.4) !important;
            transform: translateY(-1px) !important;
        }
        
        /* Bouton d'ID de réunion */
        #joinMeetingBtn {
            background: linear-gradient(to right, #6264A7, #7B83EB) !important;
            color: white !important;
            font-weight: 500 !important;
            border: none !important;
            border-radius: 0 6px 6px 0 !important;
            transition: all 0.2s ease !important;
        }
        
        #joinMeetingBtn:hover {
            background: linear-gradient(to right, #7B83EB, #8A92F0) !important;
        }
    `, 'visual-appearance-styles');
    
    // Corriger directement certains éléments
    fixSpecificElements();
    
    // Fonction pour corriger des éléments spécifiques
    function fixSpecificElements() {
        // Header
        const header = document.querySelector('.header');
        if (header) {
            header.style.background = 'rgba(30, 30, 30, 0.6)';
            header.style.backdropFilter = 'blur(5px)';
        }
        
        // Controls container
        const controlsContainer = document.querySelector('.controls-container');
        if (controlsContainer) {
            controlsContainer.style.background = 'rgba(30, 30, 30, 0.6)';
            controlsContainer.style.backdropFilter = 'blur(5px)';
        }
        
        // Meetings container
        const meetingsContainer = document.querySelector('.meetings-container');
        if (meetingsContainer) {
            meetingsContainer.style.background = 'rgba(30, 30, 30, 0.6)';
            meetingsContainer.style.backdropFilter = 'blur(5px)';
        }
        
        // Corriger les superpositions dans les items de réunion
        const meetingItems = document.querySelectorAll('.meeting-item');
        meetingItems.forEach(item => {
            // S'assurer que le contenu ne déborde pas
            const title = item.querySelector('h3');
            if (title) {
                title.style.overflow = 'hidden';
                title.style.textOverflow = 'ellipsis';
                title.style.whiteSpace = 'nowrap';
            }
            
            // Ajouter un z-index aux boutons pour les garder au-dessus
            const button = item.querySelector('.meeting-join-btn');
            if (button) {
                button.style.position = 'relative';
                button.style.zIndex = '5';
            }
        });
    }
}

/**
 * Améliore les performances globales
 */
function improveGlobalPerformance() {
    // Réduire les rafraîchissements
    throttleFetchMeetings();
    
    // Optimiser les gestionnaires d'événements
    consolidateEventListeners();
    
    // Supprimer les logs inutiles
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        disableDebugLogs();
    }
    
    // Fonction pour réduire la fréquence des appels fetchMeetings
    function throttleFetchMeetings() {
        if (typeof window.fetchMeetings === 'function' && !window._originalFetchMeetings) {
            window._originalFetchMeetings = window.fetchMeetings;
            
            // Remplacer par une version limitée
            window.fetchMeetings = function(forceUpdate = false) {
                const now = Date.now();
                const lastUpdate = window._lastFetchMeetingsTime || 0;
                
                // Limiter à au moins 5 secondes entre les appels
                if (!forceUpdate && now - lastUpdate < 5000) {
                    return;
                }
                
                window._lastFetchMeetingsTime = now;
                return window._originalFetchMeetings(forceUpdate);
            };
        }
    }
    
    // Fonction pour regrouper les écouteurs d'événements
    function consolidateEventListeners() {
        // Utiliser la délégation d'événements pour les clics
        if (!window._hasGlobalClickHandler) {
            window._hasGlobalClickHandler = true;
            
            document.addEventListener('click', function(e) {
                // Gestionnaire commun pour les boutons
                if (e.target.closest('button')) {
                    const button = e.target.closest('button');
                    
                    // Effet visuel pour tous les boutons
                    if (!button.disabled) {
                        button.style.transform = 'scale(0.98)';
                        setTimeout(() => {
                            button.style.transform = '';
                        }, 100);
                    }
                }
            });
        }
    }
    
    // Fonction pour désactiver les logs de débogage
    function disableDebugLogs() {
        // Sauvegarder pour usage ultérieur
        window._originalConsole = {
            log: console.log,
            debug: console.debug,
            info: console.info
        };
        
        // Remplacer par des fonctions vides
        console.log = function() {};
        console.debug = function() {};
        console.info = function() {};
    }
}

/**
 * Utilitaire : Ajoute une feuille de style à la page
 */
function addStylesheet(cssText, id) {
    // Vérifier si le style existe déjà
    if (id && document.getElementById(id)) {
        document.getElementById(id).textContent = cssText;
        return;
    }
    
    // Créer un nouvel élément style
    const style = document.createElement('style');
    if (id) style.id = id;
    style.textContent = cssText;
    document.head.appendChild(style);
}

/**
 * Utilitaire : Supprime les styles avec un préfixe spécifique
 */
function removeStylesWithPrefix(prefix) {
    const styles = document.querySelectorAll('style');
    styles.forEach(style => {
        if (style.id && style.id.startsWith(prefix)) {
            style.parentNode.removeChild(style);
        }
    });
}
