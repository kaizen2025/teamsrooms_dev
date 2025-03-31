/**
 * Optimisations harmonisées pour l'application de réservation de salles
 * Version 4.0 - Améliorations d'harmonie visuelle et fonctionnelle:
 * 1. Organisation optimisée des salles sur plusieurs rangées
 * 2. Fermeture de la liste des salles au clic dans le vide
 * 3. Redirection directe Teams perfectionnée
 * 4. Transparence des bannières améliorée
 * 5. Harmonie visuelle globale
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Initialisation des optimisations harmonisées v4.0");
    
    // Application des améliorations
    improveRoomsLayout();
    enhanceVisualHarmony();
    perfectTeamsRedirect();
    setupGlobalEventHandlers();
    reducePerformanceOverhead();
});

/**
 * Améliore la disposition des salles pour une utilisation optimale de l'espace
 */
function improveRoomsLayout() {
    // Styles pour optimiser l'affichage des salles sur plusieurs rangées
    addGlobalStyles(`
        /* Conteneur des salles optimisé */
        .rooms-section {
            position: absolute !important;
            bottom: 60px !important;
            left: 50% !important;
            right: auto !important;
            top: auto !important;
            transform: translateX(-50%) !important;
            width: 96% !important;
            max-width: 1200px !important;
            max-height: 260px !important;
            margin: 0 auto !important;
            padding: 15px !important;
            background: rgba(40, 40, 40, 0.92) !important;
            backdrop-filter: blur(10px) !important;
            border-radius: 15px 15px 0 0 !important;
            box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.25) !important;
            display: none;
            opacity: 0;
            transition: opacity 0.3s ease, transform 0.3s ease !important;
            z-index: 1000 !important;
            border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
            overflow: hidden !important;
        }
        
        .rooms-section.visible {
            display: block !important;
            opacity: 1 !important;
        }
        
        /* Organisation multi-rangées des salles */
        .rooms {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 12px !important;
            justify-content: center !important;
            align-items: center !important;
            max-height: 220px !important;
            overflow-y: auto !important;
            padding: 5px 0 !important;
            margin: 0 !important;
        }
        
        /* Cartes de salle optimisées */
        .room-card {
            width: 150px !important;
            height: 90px !important;
            padding: 10px !important;
            margin: 0 !important;
            background: rgba(50, 50, 50, 0.7) !important;
            border-radius: 10px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            cursor: pointer !important;
            transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            text-align: center !important;
        }
        
        /* Effet hover harmonieux */
        .room-card:hover {
            transform: translateY(-3px) !important;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3) !important;
            background: rgba(60, 60, 60, 0.8) !important;
            border-color: rgba(255, 255, 255, 0.25) !important;
        }
        
        /* Titre de salle */
        .room-name {
            font-weight: bold !important;
            margin-bottom: 8px !important;
            font-size: 1em !important;
            color: white !important;
        }
        
        /* Statut de la salle */
        .room-status {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            font-size: 0.9em !important;
            color: rgba(255, 255, 255, 0.85) !important;
        }
        
        /* Indicateur de statut */
        .status-icon {
            width: 10px !important;
            height: 10px !important;
            border-radius: 50% !important;
            display: inline-block !important;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.3) !important;
        }
        
        /* Couleurs des statuts */
        .status-icon.available {
            background-color: #4CAF50 !important;
            box-shadow: 0 0 8px rgba(76, 175, 80, 0.5) !important;
        }
        
        .status-icon.occupied {
            background-color: #F44336 !important;
            box-shadow: 0 0 8px rgba(244, 67, 54, 0.5) !important;
        }
        
        .status-icon.soon {
            background-color: #FF9800 !important;
            box-shadow: 0 0 8px rgba(255, 152, 0, 0.5) !important;
        }
        
        /* Scrollbar pour liste de salles */
        .rooms::-webkit-scrollbar {
            width: 6px !important;
        }
        
        .rooms::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05) !important;
            border-radius: 3px !important;
        }
        
        .rooms::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2) !important;
            border-radius: 3px !important;
        }
        
        .rooms::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3) !important;
        }
    `);
    
    // Observer les mutations du DOM pour attraper les changements dynamiques
    const roomsObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                const roomsSection = document.querySelector('.rooms-section');
                if (roomsSection && !roomsSection.hasAttribute('data-optimized')) {
                    reorganizeRoomCards(roomsSection);
                    roomsSection.setAttribute('data-optimized', 'true');
                }
            }
        });
    });
    
    roomsObserver.observe(document.body, { childList: true, subtree: true });
    
    // Essayer d'optimiser la section des salles existante
    const roomsSection = document.querySelector('.rooms-section');
    if (roomsSection) {
        reorganizeRoomCards(roomsSection);
    }
    
    // Fonction pour réorganiser les cartes de salle
    function reorganizeRoomCards(container) {
        const roomsContainer = container.querySelector('.rooms');
        if (!roomsContainer) return;
        
        // Appliquer des styles améliorés
        roomsContainer.style.display = 'flex';
        roomsContainer.style.flexWrap = 'wrap';
        roomsContainer.style.gap = '12px';
        roomsContainer.style.justifyContent = 'center';
        
        // Optimiser chaque carte
        const roomCards = roomsContainer.querySelectorAll('.room-card');
        roomCards.forEach(card => {
            // Styles harmonieux
            card.style.width = '150px';
            card.style.height = '90px';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.justifyContent = 'center';
            card.style.alignItems = 'center';
            card.style.margin = '0';
            card.style.textAlign = 'center';
            
            // Animation fluide
            card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease';
            
            // Ajouter l'événement de clic pour naviguer
            if (!card.hasAttribute('data-click-handler')) {
                card.addEventListener('click', () => {
                    const roomName = card.dataset.room;
                    if (roomName) {
                        window.location.href = '/' + roomName.toLowerCase();
                    }
                });
                card.setAttribute('data-click-handler', 'true');
            }
        });
    }
}

/**
 * Améliore l'harmonie visuelle globale de l'application
 */
function enhanceVisualHarmony() {
    // Styles pour améliorer la cohérence visuelle et la transparence
    addGlobalStyles(`
        /* Bannière d'en-tête avec transparence améliorée */
        .header {
            background: rgba(40, 40, 40, 0.75) !important;
            backdrop-filter: blur(8px) !important;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2) !important;
            border-radius: 0 0 15px 15px !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-top: none !important;
            margin: 0 10px !important;
            transition: background 0.3s ease !important;
        }
        
        /* Bannière de bas de page harmonisée */
        .controls-container {
            background: rgba(40, 40, 40, 0.75) !important;
            backdrop-filter: blur(8px) !important;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2) !important;
            border-radius: 15px 15px 0 0 !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-bottom: none !important;
            margin: 0 10px !important;
            transition: background 0.3s ease !important;
        }
        
        /* Conteneur de réunions harmonisé */
        .meetings-container {
            background: rgba(40, 40, 40, 0.75) !important;
            backdrop-filter: blur(8px) !important;
            border-radius: 15px !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2) !important;
            transition: background 0.3s ease !important;
        }
        
        /* En-tête des réunions */
        .meetings-title-bar {
            background: rgba(50, 50, 50, 0.5) !important;
            backdrop-filter: blur(5px) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 15px 15px 0 0 !important;
            padding: 12px 15px !important;
        }
        
        /* Éléments de réunion */
        .meeting-item {
            background: rgba(50, 50, 50, 0.7) !important;
            backdrop-filter: blur(5px) !important;
            border-radius: 10px !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
            margin-bottom: 10px !important;
            padding: 12px !important;
            transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease !important;
        }
        
        .meeting-item:hover {
            transform: translateY(-2px) !important;
            background: rgba(60, 60, 60, 0.8) !important;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3) !important;
            border-color: rgba(255, 255, 255, 0.15) !important;
        }
        
        /* Boutons harmonisés */
        button {
            transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease !important;
            border-radius: 8px !important;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2) !important;
        }
        
        button:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
        }
        
        button:active {
            transform: translateY(1px) !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2) !important;
        }
        
        /* Bouton Rejoindre harmonisé */
        .meeting-join-btn {
            background: linear-gradient(to right, #6264A7, #7B83EB) !important;
            color: white !important;
            font-weight: 500 !important;
            padding: 6px 12px !important;
            border: none !important;
            transition: all 0.2s ease !important;
        }
        
        .meeting-join-btn:hover {
            background: linear-gradient(to right, #7B83EB, #8A92F0) !important;
            box-shadow: 0 4px 10px rgba(98, 100, 167, 0.4) !important;
        }
        
        /* Zone ID de réunion */
        .meeting-id-entry {
            background: rgba(50, 50, 50, 0.5) !important;
            backdrop-filter: blur(5px) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 0 0 15px 15px !important;
            padding: 15px !important;
        }
        
        /* Champ de saisie ID */
        #meeting-id {
            background: rgba(40, 40, 40, 0.7) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-radius: 8px 0 0 8px !important;
            color: white !important;
            padding: 8px 12px !important;
        }
        
        #meeting-id:focus {
            border-color: rgba(98, 100, 167, 0.6) !important;
            box-shadow: 0 0 0 2px rgba(98, 100, 167, 0.3) !important;
            outline: none !important;
        }
        
        /* Menu latéral harmonisé */
        .side-menu {
            background: rgba(30, 30, 30, 0.9) !important;
            backdrop-filter: blur(10px) !important;
            box-shadow: 5px 0 10px rgba(0, 0, 0, 0.3) !important;
        }
        
        /* Titre avec contour lumineux */
        .title {
            background: rgba(40, 40, 40, 0.7) !important;
            backdrop-filter: blur(5px) !important;
            border-radius: 10px !important;
            padding: 8px 20px !important;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) !important;
            color: white !important;
        }
        
        /* Couleurs harmonisées pour les statuts de réunion */
        .meeting-item.current {
            border-left: 4px solid #4CAF50 !important;
        }
        
        .meeting-item.upcoming {
            border-left: 4px solid #2196F3 !important;
        }
        
        .meeting-item.past {
            border-left: 4px solid #9E9E9E !important;
            opacity: 0.8 !important;
        }
        
        /* Barres de progression */
        .meeting-progress-bar {
            background: linear-gradient(to right, #4CAF50, #8BC34A) !important;
            border-radius: 3px !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2) !important;
        }
    `);
    
    // Appliquer des styles spécifiques aux éléments existants
    const header = document.querySelector('.header');
    if (header) {
        header.style.background = 'rgba(40, 40, 40, 0.75)';
        header.style.backdropFilter = 'blur(8px)';
    }
    
    const controlsContainer = document.querySelector('.controls-container');
    if (controlsContainer) {
        controlsContainer.style.background = 'rgba(40, 40, 40, 0.75)';
        controlsContainer.style.backdropFilter = 'blur(8px)';
    }
    
    // Améliorer les animations des boutons rejoindre
    const joinButtons = document.querySelectorAll('.meeting-join-btn');
    joinButtons.forEach(button => {
        button.style.background = 'linear-gradient(to right, #6264A7, #7B83EB)';
        button.style.transition = 'all 0.2s ease';
        button.onmouseover = () => {
            button.style.background = 'linear-gradient(to right, #7B83EB, #8A92F0)';
            button.style.boxShadow = '0 4px 10px rgba(98, 100, 167, 0.4)';
        };
        button.onmouseout = () => {
            button.style.background = 'linear-gradient(to right, #6264A7, #7B83EB)';
            button.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
        };
    });
}

/**
 * Perfectionne la redirection directe vers Teams avec analyse du lien fourni
 */
function perfectTeamsRedirect() {
    // Sauvegarder l'état pour éviter les déclenchements multiples
    window.joiningMeeting = false;
    
    // Déterminer le Tenant ID de l'organisation (TenantID)
    const organizationTenantId = '3991cba7-1148-49eb-9aa9-0c46dba8f57e'; // Extrait du lien d'exemple
    
    // Fonction avancée pour rejoindre directement une réunion Teams
    function advancedTeamsJoin(providedId = null) {
        // Éviter les déclenchements multiples
        if (window.joiningMeeting) {
            console.log("Jointure déjà en cours, ignoré");
            return;
        }
        
        window.joiningMeeting = true;
        
        // Déterminer l'ID de réunion
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
        
        // Nettoyer et normaliser l'ID
        meetingId = cleanMeetingId(meetingId);
        
        // Gérer l'UI
        const joinButton = document.getElementById('joinMeetingBtn');
        const originalButtonText = joinButton ? joinButton.innerHTML : '';
        
        if (joinButton) {
            joinButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
            joinButton.disabled = true;
        }
        
        // Sauvegarder dans l'historique
        saveRecentId(meetingId);
        
        // Optimisation critique: toujours tenter d'abord l'approche protocole teams://
        // qui offre la meilleure expérience en contournant l'écran de choix
        launchTeamsWithProtocol(meetingId)
            .then(success => {
                if (!success) {
                    // Fallback au lookupMeeting puis lien direct
                    return tryAPIThenFallback(meetingId);
                }
                return true;
            })
            .catch(error => {
                console.error("Erreur de protocole Teams:", error);
                return tryAPIThenFallback(meetingId);
            })
            .finally(() => {
                // Restaurer l'UI
                setTimeout(() => {
                    if (joinButton) {
                        joinButton.innerHTML = originalButtonText;
                        joinButton.disabled = false;
                    }
                    window.joiningMeeting = false;
                }, 2000);
            });
    }
    
    // Tente le lancement via protocole teams://
    async function launchTeamsWithProtocol(meetingId) {
        return new Promise((resolve) => {
            try {
                // Créer une URL de protocole Teams
                const teamsProtocolUrl = `msteams:/l/meetup-join/19:meeting_${meetingId}@thread.v2`;
                
                // Créer un iframe invisible pour le lancement
                const hiddenFrame = document.createElement('iframe');
                hiddenFrame.style.display = 'none';
                hiddenFrame.src = teamsProtocolUrl;
                
                // Événements pour détecter le succès/échec
                let protocolLaunched = false;
                
                // Sur les navigateurs modernes, blur peut indiquer que Teams a été lancé
                window.addEventListener('blur', function onBlur() {
                    protocolLaunched = true;
                    window.removeEventListener('blur', onBlur);
                    showStatusMessage("Application Teams lancée", "success");
                    // Nettoyer
                    setTimeout(() => {
                        document.body.removeChild(hiddenFrame);
                        resolve(true);
                    }, 500);
                }, { once: true });
                
                // Timeout pour détecter l'échec
                setTimeout(() => {
                    if (!protocolLaunched) {
                        // Nettoyer
                        if (document.body.contains(hiddenFrame)) {
                            document.body.removeChild(hiddenFrame);
                        }
                        resolve(false);
                    }
                }, 2000);
                
                // Ajouter l'iframe au document
                document.body.appendChild(hiddenFrame);
                
            } catch (e) {
                console.error("Erreur de protocole:", e);
                resolve(false);
            }
        });
    }
    
    // Essaye l'API lookupMeeting puis le fallback direct
    async function tryAPIThenFallback(meetingId) {
        try {
            // Essayer l'API lookupMeeting
            const joinUrl = await tryLookupMeeting(meetingId);
            
            if (joinUrl) {
                // Construire et ouvrir l'URL améliorée
                const enhancedUrl = enhanceTeamsUrl(joinUrl);
                window.open(enhancedUrl, "_blank");
                showStatusMessage("Redirection vers Teams...", "success");
                return true;
            } else {
                // Créer et ouvrir une URL directe
                const directUrl = buildEnhancedDirectUrl(meetingId);
                window.open(directUrl, "_blank");
                showStatusMessage("Redirection vers Teams...", "info");
                return true;
            }
        } catch (error) {
            console.error("Erreur lors de la jointure:", error);
            // Dernière tentative - URL directe simplifiée
            const fallbackUrl = buildFallbackUrl(meetingId);
            window.open(fallbackUrl, "_blank");
            showStatusMessage("Tentative alternative...", "warning");
            return false;
        }
    }
    
    // Construction d'URL optimisée avec le Tenant ID correct
    function buildEnhancedDirectUrl(meetingId) {
        // Format inspiré de l'exemple fourni
        return `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${meetingId}%40thread.v2/0` +
               `?context=%7B%22Tid%22%3A%22${organizationTenantId}%22%7D` +
               `&directDl=true&msLaunch=true&enableMobilePage=true&suppressPrompt=true` + 
               `&skipRollback=true&launchMode=full&preferredHandlingOf=teams`;
    }
    
    // URL de secours simplifiée
    function buildFallbackUrl(meetingId) {
        return `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${meetingId}%40thread.v2/0`;
    }
    
    // Améliore une URL Teams existante
    function enhanceTeamsUrl(baseUrl) {
        try {
            const url = new URL(baseUrl);
            
            // Ajouter tous les paramètres nécessaires
            url.searchParams.set('directDl', 'true');
            url.searchParams.set('msLaunch', 'true');
            url.searchParams.set('enableMobilePage', 'true');
            url.searchParams.set('suppressPrompt', 'true');
            url.searchParams.set('skipRollback', 'true');
            url.searchParams.set('launchMode', 'full');
            url.searchParams.set('preferredHandlingOf', 'teams');
            
            // Garantir le contexte avec le bon Tenant ID
            if (!url.searchParams.has('context')) {
                url.searchParams.set('context', `{"Tid":"${organizationTenantId}"}`);
            }
            
            return url.toString();
        } catch (e) {
            console.error("Erreur d'amélioration d'URL:", e);
            return baseUrl;
        }
    }
    
    // Utilise l'API lookupMeeting pour obtenir l'URL de jointure
    async function tryLookupMeeting(meetingId) {
        try {
            // Ajout d'un paramètre de cache-busting pour éviter les réponses mises en cache
            const cacheBust = Date.now();
            const response = await fetch(`/lookupMeeting?meetingId=${encodeURIComponent(meetingId)}&_=${cacheBust}`);
            
            if (!response.ok) {
                return null;
            }
            
            const data = await response.json();
            return data.joinUrl || null;
        } catch (e) {
            console.error("Erreur de lookup:", e);
            return null;
        }
    }
    
    // Nettoie l'ID de réunion pour différents formats
    function cleanMeetingId(id) {
        // Si c'est déjà un ID numérique simple
        if (/^\d+$/.test(id)) {
            return id;
        }
        
        // Si c'est un UUID complet (format utilisé par Teams)
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            return id;
        }
        
        // Si c'est un format base64 comme dans l'exemple du client
        if (/^[A-Za-z0-9+/=]+$/.test(id)) {
            return id;
        }
        
        // Si c'est une URL complète, extraire l'ID
        if (id.includes('teams.microsoft.com/l/meetup-join')) {
            // Extraire l'ID de réunion (differents formats possibles)
            const meetingMatch = id.match(/19%3Ameeting_([^%@]+)/i) || 
                                 id.match(/19:meeting_([^@]+)/i);
            
            if (meetingMatch && meetingMatch[1]) {
                return meetingMatch[1];
            }
        }
        
        // Nettoyage général
        return id.replace(/[^a-zA-Z0-9]/g, '');
    }
    
    // Sauvegarde l'ID dans l'historique récent
    function saveRecentId(id) {
        let recentIds = JSON.parse(localStorage.getItem('recentMeetingIds') || '[]');
        
        // Éviter les doublons
        const index = recentIds.indexOf(id);
        if (index !== -1) {
            recentIds.splice(index, 1);
        }
        
        // Ajouter au début et garder les 5 plus récents
        recentIds.unshift(id);
        recentIds = recentIds.slice(0, 5);
        
        localStorage.setItem('recentMeetingIds', JSON.stringify(recentIds));
    }
    
    // Affiche un message de statut
    function showStatusMessage(message, type) {
        // Créer ou trouver l'élément
        let messageEl = document.getElementById('status-message');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'status-message';
            messageEl.style.position = 'fixed';
            messageEl.style.top = '20px';
            messageEl.style.left = '50%';
            messageEl.style.transform = 'translateX(-50%)';
            messageEl.style.padding = '10px 20px';
            messageEl.style.borderRadius = '8px';
            messageEl.style.color = 'white';
            messageEl.style.fontWeight = 'bold';
            messageEl.style.zIndex = '9999';
            messageEl.style.textAlign = 'center';
            messageEl.style.display = 'none';
            messageEl.style.opacity = '0';
            messageEl.style.transition = 'opacity 0.3s ease';
            document.body.appendChild(messageEl);
        }
        
        // Styles selon le type
        switch (type) {
            case 'success':
                messageEl.style.backgroundColor = '#4CAF50';
                messageEl.style.boxShadow = '0 4px 10px rgba(76, 175, 80, 0.4)';
                break;
            case 'error':
                messageEl.style.backgroundColor = '#F44336';
                messageEl.style.boxShadow = '0 4px 10px rgba(244, 67, 54, 0.4)';
                break;
            case 'warning':
                messageEl.style.backgroundColor = '#FF9800';
                messageEl.style.boxShadow = '0 4px 10px rgba(255, 152, 0, 0.4)';
                break;
            case 'info':
            default:
                messageEl.style.backgroundColor = '#2196F3';
                messageEl.style.boxShadow = '0 4px 10px rgba(33, 150, 243, 0.4)';
        }
        
        // Afficher le message avec animation
        messageEl.textContent = message;
        messageEl.style.display = 'block';
        
        setTimeout(() => {
            messageEl.style.opacity = '1';
        }, 10);
        
        // Masquer après 3 secondes
        setTimeout(() => {
            messageEl.style.opacity = '0';
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 300);
        }, 3000);
    }
    
    // Remplacer la fonction globale
    window.joinMeetingWithId = advancedTeamsJoin;
    
    // Remplacer dans l'objet JoinSystem
    if (window.JoinSystem) {
        window.JoinSystem.joinMeetingWithId = advancedTeamsJoin;
    } else {
        window.JoinSystem = { joinMeetingWithId: advancedTeamsJoin };
    }
    
    // Attacher la fonction au bouton
    const joinButton = document.getElementById('joinMeetingBtn');
    if (joinButton) {
        // Supprimer les anciens gestionnaires
        const newJoinButton = joinButton.cloneNode(true);
        joinButton.parentNode.replaceChild(newJoinButton, joinButton);
        
        // Ajouter le nouveau gestionnaire
        newJoinButton.addEventListener('click', function(e) {
            e.preventDefault();
            advancedTeamsJoin();
        });
    }
    
    // Gérer les champs d'entrée ID
    const idFields = document.querySelectorAll('#meeting-id, input[placeholder*="ID"]');
    idFields.forEach(field => {
        field.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                advancedTeamsJoin();
            }
        });
    });
    
    // Améliorer le champ de réunion ID
    enhanceIdAutoComplete();
}

/**
 * Améliore l'autocomplétion du champ ID de réunion
 */
function enhanceIdAutoComplete() {
    // Styles pour l'historique des ID récents
    addGlobalStyles(`
        /* Conteneur des IDs récents */
        .recent-ids-container {
            position: absolute !important;
            background: rgba(45, 45, 45, 0.95) !important;
            backdrop-filter: blur(10px) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-radius: 8px !important;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3) !important;
            z-index: 1000 !important;
            width: 100% !important;
            overflow: hidden !important;
            animation: fadeInUp 0.3s ease !important;
        }
        
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* En-tête */
        .recent-ids-container h4 {
            margin: 0 !important;
            padding: 10px 15px !important;
            font-size: 0.9rem !important;
            color: white !important;
            background: rgba(98, 100, 167, 0.3) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        
        /* Liste des IDs */
        .recent-id {
            display: flex !important;
            align-items: center !important;
            padding: 10px 15px !important;
            cursor: pointer !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
            transition: background 0.2s ease !important;
        }
        
        .recent-id:last-child {
            border-bottom: none !important;
        }
        
        .recent-id:hover {
            background: rgba(98, 100, 167, 0.2) !important;
        }
        
        /* Icône */
        .recent-id i {
            margin-right: 10px !important;
            color: rgba(255, 255, 255, 0.7) !important;
        }
        
        /* ID en monospace */
        .id-text {
            font-family: monospace !important;
            font-size: 1.1em !important;
            color: white !important;
            font-weight: bold !important;
        }
    `);
    
    // Trouver ou créer le conteneur d'ID récents
    let recentIdsContainer = document.getElementById('recent-ids');
    if (!recentIdsContainer) {
        recentIdsContainer = document.createElement('div');
        recentIdsContainer.id = 'recent-ids';
        recentIdsContainer.className = 'recent-ids-container';
        recentIdsContainer.style.display = 'none';
        document.body.appendChild(recentIdsContainer);
    }
    
    // Gérer le focus et le clic dans le champ ID
    const meetingIdField = document.getElementById('meeting-id');
    if (meetingIdField) {
        // Supprimer les anciens écouteurs
        const newIdField = meetingIdField.cloneNode(true);
        meetingIdField.parentNode.replaceChild(newIdField, meetingIdField);
        
        // Ajouter les nouveaux écouteurs
        newIdField.addEventListener('focus', function() {
            showRecentIds(this);
        });
        
        newIdField.addEventListener('click', function() {
            showRecentIds(this);
        });
    }
    
    // Gestion globale des clics pour fermer la liste
    document.addEventListener('click', function(e) {
        if (recentIdsContainer.style.display === 'block' && 
            e.target !== meetingIdField && 
            !recentIdsContainer.contains(e.target)) {
            recentIdsContainer.style.display = 'none';
        }
    });
    
    // Fonction pour afficher les ID récents
    function showRecentIds(inputField) {
        // Récupérer les ID récents
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
        
        // Titre et liste
        recentIdsContainer.innerHTML = `
            <h4><i class="fas fa-history"></i> Récemment utilisés</h4>
            <div class="recent-ids-list"></div>
        `;
        
        const listElement = recentIdsContainer.querySelector('.recent-ids-list');
        recentIds.forEach(id => {
            const item = document.createElement('div');
            item.className = 'recent-id';
            item.innerHTML = `
                <i class="fas fa-key"></i>
                <span class="id-text">${id}</span>
            `;
            
            // Utiliser cet ID au clic
            item.addEventListener('click', function() {
                inputField.value = id;
                recentIdsContainer.style.display = 'none';
                
                // Lancer la jointure
                if (window.joinMeetingWithId) {
                    window.joinMeetingWithId(id);
                }
            });
            
            listElement.appendChild(item);
        });
        
        // Afficher et animer
        recentIdsContainer.style.display = 'block';
    }
}

/**
 * Configure les gestionnaires d'événements globaux
 */
function setupGlobalEventHandlers() {
    // Gestionnaire pour fermer les salles au clic dans le vide
    document.addEventListener('click', function(e) {
        // Ignorer les clics sur les éléments liés aux salles
        if (e.target.closest('.rooms-section, .toggle-rooms-button, #toggleRoomsBtn, #showRoomsBtn, button[id*="Room"]')) {
            return;
        }
        
        // Fermer la section des salles
        const roomsSection = document.querySelector('.rooms-section');
        if (roomsSection && roomsSection.classList.contains('visible')) {
            roomsSection.classList.remove('visible');
            
            // Mettre à jour les textes des boutons
            updateRoomButtonsText(false);
        }
    });
    
    // Gestionnaire amélioré pour les boutons d'affichage des salles
    const toggleButtons = document.querySelectorAll('.toggle-rooms-button, #toggleRoomsBtn, #showRoomsBtn, [id*="Room"]');
    toggleButtons.forEach(button => {
        if (button && !button.hasAttribute('data-room-handler')) {
            // Supprimer les anciens gestionnaires
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Ajouter le nouveau gestionnaire
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const roomsSection = document.querySelector('.rooms-section');
                if (!roomsSection) return;
                
                const isVisible = roomsSection.classList.contains('visible');
                roomsSection.classList.toggle('visible', !isVisible);
                
                // Mettre à jour les textes
                updateRoomButtonsText(!isVisible);
            });
            
            // Marquer comme traité
            newButton.setAttribute('data-room-handler', 'true');
        }
    });
    
    // Fonction pour mettre à jour le texte des boutons
    function updateRoomButtonsText(isVisible) {
        const showText = '<i class="fas fa-door-open"></i> Afficher les salles';
        const hideText = '<i class="fas fa-times"></i> Masquer les salles';
        
        toggleButtons.forEach(button => {
            // Vérifier si le bouton existe et possède le bon attribut
            if (button && button.hasAttribute('data-room-handler')) {
                button.innerHTML = isVisible ? hideText : showText;
            }
        });
    }
}

/**
 * Réduit la surcharge de performance
 */
function reducePerformanceOverhead() {
    // Réduire la fréquence des rafraîchissements
    if (typeof window.fetchMeetings === 'function' && !window.originalFetchMeetings) {
        window.originalFetchMeetings = window.fetchMeetings;
        
        // Version optimisée
        window.fetchMeetings = function(forceUpdate = false) {
            // Limiter la fréquence
            const now = Date.now();
            const lastUpdate = window.lastMeetingsUpdate || 0;
            
            if (!forceUpdate && (now - lastUpdate < 5000)) {
                return;
            }
            
            window.lastMeetingsUpdate = now;
            return window.originalFetchMeetings(forceUpdate);
        };
    }
    
    // Optimiser la manipulation DOM
    optimizeDomOperations();
    
    // Utiliser requestAnimationFrame pour les animations
    optimizeAnimations();
}

/**
 * Optimise les opérations DOM
 */
function optimizeDomOperations() {
    // Utiliser DocumentFragment pour les insertions de plusieurs éléments
    const originalAppendChild = Element.prototype.appendChild;
    if (!Element.prototype._optimizedAppend) {
        Element.prototype._optimizedAppend = true;
        
        Element.prototype.appendChild = function(child) {
            // Si plusieurs enfants à ajouter, utiliser un fragment
            if (this._pendingChildren) {
                this._pendingChildren.appendChild(child);
                return child;
            }
            
            return originalAppendChild.call(this, child);
        };
        
        // Méthode pour regrouper les ajouts
        Element.prototype.batchAppend = function(callback) {
            this._pendingChildren = document.createDocumentFragment();
            callback();
            originalAppendChild.call(this, this._pendingChildren);
            delete this._pendingChildren;
        };
    }
}

/**
 * Optimise les animations
 */
function optimizeAnimations() {
    // Remplacer setTimeout par requestAnimationFrame pour les animations
    const originalSetTimeout = window.setTimeout;
    if (!window._originalSetTimeout) {
        window._originalSetTimeout = originalSetTimeout;
        
        window.setTimeout = function(callback, delay) {
            // Pour les délais courts, utiliser requestAnimationFrame
            if (typeof callback === 'function' && delay < 100) {
                return requestAnimationFrame(callback);
            }
            
            // Sinon, utiliser le setTimeout normal
            return originalSetTimeout(callback, delay);
        };
    }
}

/**
 * Utilitaire pour ajouter des styles globaux sans duplication
 */
function addGlobalStyles(cssText) {
    // Calculer un hash pour éviter les doublons
    const hash = hashString(cssText);
    const styleId = `optimized-style-${hash}`;
    
    // Vérifier si ce style existe déjà
    if (!document.getElementById(styleId)) {
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = cssText;
        document.head.appendChild(styleElement);
    }
}

/**
 * Fonction de hachage simple pour les chaînes
 */
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 32-bit
    }
    return Math.abs(hash).toString(16);
}
