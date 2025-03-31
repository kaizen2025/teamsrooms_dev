/**
 * SOLUTION COMPLÈTE FINALE - Correction de tous les problèmes
 * Version 7.0 - Combinaison de toutes les améliorations:
 * 1. Connexion Teams directe (méthode éprouvée avec votre URL)
 * 2. Correction de l'espacement entre les blocs (plus de superposition)
 * 3. Disposition des salles en grille multi-colonnes au centre
 * 4. Transparence optimale
 * 5. Correction du premier clic du menu
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Initialisation de la solution complète finale v7.0");
    
    // Appliquer toutes les corrections
    setTimeout(() => {
        // 1. Connexion Teams directe
        implementDirectTeamsJoin();
        
        // 2. Correction des espaces et superpositions
        fixSpacingAndOverlaps();
        
        // 3. Disposition des salles en grille
        implementRoomsGrid();
        
        // 4. Transparence optimale
        applyOptimalTransparency();
        
        // 5. Correction du premier clic du menu
        fixMenuFirstClick();
    }, 100);
});

/**
 * Implémente la solution éprouvée de connexion Teams directe
 * basée sur l'URL qui fonctionne
 */
function implementDirectTeamsJoin() {
    // Paramètres de l'organisation
    const TENANT_ID = "3991cba7-1148-49eb-9aa9-0c46dba8f57e";
    const ORGANIZER_ID = "03e7afff-48b3-4742-96ed-ddae7b010407";
    
    // Etat
    window._joiningTeams = false;
    
    /**
     * Fonction principale pour rejoindre directement une réunion Teams
     */
    function directTeamsConnection(providedId = null) {
        // Empêcher les appels multiples
        if (window._joiningTeams) {
            console.log("Jointure déjà en cours");
            return;
        }
        window._joiningTeams = true;
        
        // Récupérer l'ID
        const meetingIdField = document.getElementById('meeting-id');
        let meetingId = providedId || (meetingIdField ? meetingIdField.value.trim() : '');
        
        if (!meetingId) {
            showStatusMessage("Veuillez entrer l'ID de la réunion", "error");
            window._joiningTeams = false;
            return;
        }
        
        // Mise à jour de l'interface
        const joinButton = document.getElementById('joinMeetingBtn');
        let originalText = "";
        if (joinButton) {
            originalText = joinButton.innerHTML;
            joinButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            joinButton.disabled = true;
        }
        
        // Sauvegarder l'ID dans l'historique
        saveRecentId(meetingId);
        
        // Construire l'URL Teams avec les deux approches possibles
        try {
            // Approche 1: Essayer d'abord avec l'API
            fetch(`/lookupMeeting?meetingId=${encodeURIComponent(meetingId)}&_=${Date.now()}`)
                .then(response => response.json())
                .then(data => {
                    if (data && data.joinUrl) {
                        // Améliorer l'URL renvoyée par l'API avec le format qui fonctionne
                        const enhancedUrl = enhanceTeamsUrl(data.joinUrl);
                        console.log("URL améliorée via API:", enhancedUrl);
                        window.open(enhancedUrl, "_blank");
                        showStatusMessage("Redirection vers Teams...", "success");
                    } else {
                        // Construire directement
                        const directUrl = buildDirectTeamsUrl(meetingId);
                        console.log("URL construite directement:", directUrl);
                        window.open(directUrl, "_blank");
                        showStatusMessage("Redirection vers Teams...", "success");
                    }
                })
                .catch(error => {
                    console.error("Erreur API:", error);
                    // Approche directe en cas d'erreur
                    const directUrl = buildDirectTeamsUrl(meetingId);
                    console.log("URL construite après erreur:", directUrl);
                    window.open(directUrl, "_blank");
                    showStatusMessage("Redirection vers Teams...", "success");
                })
                .finally(() => {
                    // Restaurer l'interface
                    setTimeout(() => {
                        if (joinButton) {
                            joinButton.innerHTML = originalText;
                            joinButton.disabled = false;
                        }
                        window._joiningTeams = false;
                    }, 2000);
                });
        } catch (error) {
            console.error("Erreur générale:", error);
            // Restaurer l'interface en cas d'erreur
            if (joinButton) {
                joinButton.innerHTML = originalText;
                joinButton.disabled = false;
            }
            window._joiningTeams = false;
            showStatusMessage("Erreur de connexion", "error");
        }
    }
    
    /**
     * Construit une URL Teams directe au format éprouvé
     */
    function buildDirectTeamsUrl(meetingId) {
        // Déterminer le type d'ID
        if (/^[\d\s]+$/.test(meetingId)) {
            // ID numérique (ex: 379 204 162 196)
            console.log("ID numérique détecté");
            const cleanId = meetingId.replace(/\s+/g, "");
            // Format URL éprouvé avec les deux paramètres de contexte
            const context = `%7b%22Tid%22%3a%22${TENANT_ID}%22%2c%22Oid%22%3a%22${ORGANIZER_ID}%22%7d`;
            return `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${cleanId}%40thread.v2/0?context=${context}`;
        } 
        else if (/^[A-Za-z0-9+/=_-]+$/.test(meetingId)) {
            // ID encodé (comme dans l'URL d'exemple)
            console.log("ID encodé détecté");
            // Format URL éprouvé avec les deux paramètres de contexte
            const context = `%7b%22Tid%22%3a%22${TENANT_ID}%22%2c%22Oid%22%3a%22${ORGANIZER_ID}%22%7d`;
            return `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${meetingId}%40thread.v2/0?context=${context}`;
        }
        else if (meetingId.includes('teams.microsoft.com')) {
            // URL complète
            console.log("URL complète détectée");
            return meetingId;
        }
        else {
            // Autre format (essai avec ID tel quel)
            console.log("Format d'ID non reconnu, tentative directe");
            const context = `%7b%22Tid%22%3a%22${TENANT_ID}%22%2c%22Oid%22%3a%22${ORGANIZER_ID}%22%7d`;
            return `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${meetingId}%40thread.v2/0?context=${context}`;
        }
    }
    
    /**
     * Améliore une URL Teams en ajoutant les paramètres de contexte
     */
    function enhanceTeamsUrl(baseUrl) {
        try {
            // Si l'URL contient déjà un contexte complet, ne pas modifier
            if (baseUrl.includes('%22Oid%22%3a') && baseUrl.includes('%22Tid%22%3a')) {
                return baseUrl;
            }
            
            // Ajouter le contexte complet
            const url = new URL(baseUrl);
            const context = `%7b%22Tid%22%3a%22${TENANT_ID}%22%2c%22Oid%22%3a%22${ORGANIZER_ID}%22%7d`;
            url.searchParams.set('context', context);
            
            return url.toString();
        } catch (error) {
            console.error("Erreur d'amélioration d'URL:", error);
            return baseUrl;
        }
    }
    
    /**
     * Sauvegarde l'ID dans l'historique récent
     */
    function saveRecentId(id) {
        let recentIds = JSON.parse(localStorage.getItem('recentMeetingIds') || '[]');
        
        // Éviter les doublons
        const index = recentIds.indexOf(id);
        if (index !== -1) {
            recentIds.splice(index, 1);
        }
        
        // Ajouter en tête et limiter à 5
        recentIds.unshift(id);
        recentIds = recentIds.slice(0, 5);
        
        localStorage.setItem('recentMeetingIds', JSON.stringify(recentIds));
    }
    
    /**
     * Affiche un message de statut
     */
    function showStatusMessage(message, type) {
        let statusDiv = document.getElementById('status-message');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'status-message';
            statusDiv.style.position = 'fixed';
            statusDiv.style.top = '20px';
            statusDiv.style.left = '50%';
            statusDiv.style.transform = 'translateX(-50%)';
            statusDiv.style.padding = '10px 20px';
            statusDiv.style.borderRadius = '8px';
            statusDiv.style.color = 'white';
            statusDiv.style.fontWeight = 'bold';
            statusDiv.style.zIndex = '9999';
            statusDiv.style.display = 'none';
            statusDiv.style.transition = 'opacity 0.3s ease';
            document.body.appendChild(statusDiv);
        }
        
        // Styles selon le type
        if (type === 'success') {
            statusDiv.style.background = 'rgba(76, 175, 80, 0.9)';
        } else if (type === 'error') {
            statusDiv.style.background = 'rgba(244, 67, 54, 0.9)';
        } else {
            statusDiv.style.background = 'rgba(33, 150, 243, 0.9)';
        }
        
        // Afficher avec animation
        statusDiv.textContent = message;
        statusDiv.style.display = 'block';
        statusDiv.style.opacity = '0';
        
        setTimeout(() => {
            statusDiv.style.opacity = '1';
            
            // Cacher après 3 secondes
            setTimeout(() => {
                statusDiv.style.opacity = '0';
                setTimeout(() => {
                    statusDiv.style.display = 'none';
                }, 300);
            }, 3000);
        }, 10);
    }
    
    // Créer l'historique des ID récents
    setupRecentIds();
    
    // Remplacer la fonction de jointure
    window.joinMeetingWithId = directTeamsConnection;
    
    if (window.JoinSystem) {
        window.JoinSystem.joinMeetingWithId = directTeamsConnection;
    } else {
        window.JoinSystem = { joinMeetingWithId: directTeamsConnection };
    }
    
    // Attacher aux éléments
    attachToElements();
    
    /**
     * Configure l'affichage des ID récents
     */
    function setupRecentIds() {
        // Créer le conteneur s'il n'existe pas
        let recentIdsContainer = document.getElementById('recent-ids');
        if (!recentIdsContainer) {
            recentIdsContainer = document.createElement('div');
            recentIdsContainer.id = 'recent-ids';
            recentIdsContainer.style.position = 'absolute';
            recentIdsContainer.style.background = 'rgba(50, 50, 50, 0.95)';
            recentIdsContainer.style.backdropFilter = 'blur(8px)';
            recentIdsContainer.style.border = '1px solid rgba(255, 255, 255, 0.2)';
            recentIdsContainer.style.borderRadius = '8px';
            recentIdsContainer.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
            recentIdsContainer.style.zIndex = '9999';
            recentIdsContainer.style.minWidth = '250px';
            recentIdsContainer.style.maxWidth = '100%';
            recentIdsContainer.style.overflow = 'hidden';
            recentIdsContainer.style.display = 'none';
            document.body.appendChild(recentIdsContainer);
        }
        
        // Styles pour l'historique
        addStylesheet(`
            .recent-ids-header {
                background: rgba(76, 89, 175, 0.3);
                padding: 10px 15px;
                font-size: 14px;
                color: white;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .recent-id-item {
                padding: 10px 15px;
                cursor: pointer;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                display: flex;
                align-items: center;
                transition: background 0.2s ease;
            }
            
            .recent-id-item:hover {
                background: rgba(76, 89, 175, 0.2);
            }
            
            .recent-id-item i {
                margin-right: 10px;
                color: rgba(255, 255, 255, 0.7);
            }
            
            .recent-id-item span {
                font-family: monospace;
                font-weight: bold;
                color: white;
            }
        `, 'recent-ids-styles');
        
        // Fermer au clic en dehors
        document.addEventListener('click', function(e) {
            const idField = document.getElementById('meeting-id');
            if (recentIdsContainer.style.display === 'block' && 
                e.target !== idField && 
                !recentIdsContainer.contains(e.target)) {
                recentIdsContainer.style.display = 'none';
            }
        });
    }
    
    /**
     * Attache les événements aux éléments
     */
    function attachToElements() {
        // Bouton rejoindre
        const joinButton = document.getElementById('joinMeetingBtn');
        if (joinButton) {
            // Cloner pour supprimer les écouteurs existants
            const newJoinButton = joinButton.cloneNode(true);
            if (joinButton.parentNode) {
                joinButton.parentNode.replaceChild(newJoinButton, joinButton);
            }
            
            // Ajouter le nouvel écouteur
            newJoinButton.addEventListener('click', function(e) {
                e.preventDefault();
                directTeamsConnection();
            });
        }
        
        // Champ ID
        const meetingIdField = document.getElementById('meeting-id');
        if (meetingIdField) {
            // Cloner pour supprimer les écouteurs existants
            const newIdField = meetingIdField.cloneNode(true);
            newIdField.value = meetingIdField.value;
            if (meetingIdField.parentNode) {
                meetingIdField.parentNode.replaceChild(newIdField, meetingIdField);
            }
            
            // S'assurer que le champ est actif
            newIdField.disabled = false;
            newIdField.style.backgroundColor = 'rgba(30, 30, 30, 0.6)';
            newIdField.style.color = 'white';
            newIdField.style.border = '1px solid rgba(255, 255, 255, 0.2)';
            newIdField.style.borderRadius = '6px 0 0 6px';
            newIdField.style.padding = '8px 12px';
            
            // Écouteur pour Enter
            newIdField.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    directTeamsConnection();
                }
            });
            
            // Écouteurs pour les ID récents
            newIdField.addEventListener('focus', function() {
                showRecentIds(this);
            });
            
            newIdField.addEventListener('click', function() {
                showRecentIds(this);
            });
        }
    }
    
    /**
     * Affiche la liste des ID récents
     */
    function showRecentIds(inputField) {
        const recentIds = JSON.parse(localStorage.getItem('recentMeetingIds') || '[]');
        const recentIdsContainer = document.getElementById('recent-ids');
        
        if (!recentIdsContainer || recentIds.length === 0) return;
        
        // Positionner la liste
        const rect = inputField.getBoundingClientRect();
        recentIdsContainer.style.top = `${rect.bottom + window.scrollY + 5}px`;
        recentIdsContainer.style.left = `${rect.left + window.scrollX}px`;
        recentIdsContainer.style.width = `${rect.width}px`;
        
        // Contenu
        recentIdsContainer.innerHTML = `
            <div class="recent-ids-header">
                <i class="fas fa-history"></i> Récemment utilisés
            </div>
            <div id="recent-ids-list"></div>
        `;
        
        const listElement = document.getElementById('recent-ids-list');
        recentIds.forEach(id => {
            const item = document.createElement('div');
            item.className = 'recent-id-item';
            item.innerHTML = `
                <i class="fas fa-key"></i>
                <span>${id}</span>
            `;
            
            item.addEventListener('click', function() {
                inputField.value = id;
                recentIdsContainer.style.display = 'none';
                
                // Lancer la connexion
                directTeamsConnection(id);
            });
            
            listElement.appendChild(item);
        });
        
        recentIdsContainer.style.display = 'block';
    }
}

/**
 * Corrige les espacements et superpositions
 */
function fixSpacingAndOverlaps() {
    // Styles pour corriger les espacements
    addStylesheet(`
        /* Correction de l'espacement du conteneur de réunions */
        .meetings-container {
            margin-bottom: 80px !important;
            margin-top: 20px !important;
            overflow: visible !important;
        }
        
        /* Position fixe de la barre du bas */
        .controls-container {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 100 !important;
            padding: 10px 0 !important;
        }
        
        /* Assez d'espace en bas du conteneur principal */
        .main-container {
            padding-bottom: 70px !important;
        }
        
        /* Section des réunions avec scroll interne */
        .meetings-list {
            max-height: calc(100vh - 350px) !important;
            overflow-y: auto !important;
            padding-right: 5px !important;
        }
        
        /* Correction du z-index des boutons */
        .meeting-join-btn {
            position: relative !important;
            z-index: 5 !important;
        }
        
        /* Éviter les débordements de texte */
        .meeting-item h3 {
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            max-width: calc(100% - 100px) !important;
        }
        
        /* Styles pour la section ID */
        .meeting-id-entry {
            padding: 15px !important;
            position: relative !important;
            z-index: 1 !important;
        }
        
        /* Styles pour le champ ID */
        #meeting-id {
            background: rgba(30, 30, 30, 0.6) !important;
            color: white !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-radius: 6px 0 0 6px !important;
            padding: 8px 12px !important;
            width: calc(100% - 120px) !important;
        }
        
        /* Styles pour le bouton Rejoindre */
        #joinMeetingBtn {
            background: linear-gradient(to right, #6264A7, #7B83EB) !important;
            color: white !important;
            border: none !important;
            border-radius: 0 6px 6px 0 !important;
            padding: 8px 15px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
        }
        
        #joinMeetingBtn:hover {
            background: linear-gradient(to right, #7B83EB, #8A92F0) !important;
            box-shadow: 0 2px 8px rgba(98, 100, 167, 0.4) !important;
        }
    `, 'spacing-fix-styles');
    
    // Application directe à certains éléments
    fixElementsDirectly();
    
    function fixElementsDirectly() {
        // Conteneur de réunions
        const meetingsContainer = document.querySelector('.meetings-container');
        if (meetingsContainer) {
            meetingsContainer.style.marginBottom = '80px';
            meetingsContainer.style.marginTop = '20px';
        }
        
        // Conteneur principal
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer) {
            mainContainer.style.paddingBottom = '70px';
        }
        
        // Liste des réunions
        const meetingsList = document.querySelector('.meetings-list');
        if (meetingsList) {
            meetingsList.style.maxHeight = 'calc(100vh - 350px)';
            meetingsList.style.overflowY = 'auto';
        }
        
        // Boutons rejoindre
        const joinButtons = document.querySelectorAll('.meeting-join-btn');
        joinButtons.forEach(btn => {
            btn.style.position = 'relative';
            btn.style.zIndex = '5';
        });
        
        // Titres des réunions
        const meetingTitles = document.querySelectorAll('.meeting-item h3');
        meetingTitles.forEach(title => {
            title.style.overflow = 'hidden';
            title.style.textOverflow = 'ellipsis';
            title.style.whiteSpace = 'nowrap';
        });
        
        // Champ ID
        const meetingIdField = document.getElementById('meeting-id');
        if (meetingIdField) {
            meetingIdField.style.backgroundColor = 'rgba(30, 30, 30, 0.6)';
            meetingIdField.style.color = 'white';
            meetingIdField.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        }
    }
}

/**
 * Implémente une disposition en grille pour les salles
 */
function implementRoomsGrid() {
    // Styles pour la disposition en grille
    addStylesheet(`
        /* Section des salles (au centre, en grille) */
        .rooms-section {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 80% !important;
            max-width: 900px !important;
            max-height: 70vh !important;
            background: rgba(30, 30, 30, 0.85) !important;
            backdrop-filter: blur(10px) !important;
            border-radius: 15px !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
            z-index: 1000 !important;
            padding: 20px !important;
            display: none;
            opacity: 0;
            transition: opacity 0.3s ease !important;
            overflow: auto !important;
        }
        
        .rooms-section.visible {
            display: block !important;
            opacity: 1 !important;
        }
        
        /* Disposition en grille des salles */
        .rooms {
            display: grid !important;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
            grid-gap: 15px !important;
            justify-content: center !important;
            align-items: stretch !important;
            padding: 10px !important;
        }
        
        /* Cartes de salle adaptées à la grille */
        .room-card {
            background: rgba(50, 50, 50, 0.5) !important;
            backdrop-filter: blur(5px) !important;
            border-radius: 10px !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            padding: 15px !important;
            height: 100px !important;
            transition: all 0.2s ease !important;
            cursor: pointer !important;
            text-align: center !important;
        }
        
        .room-card:hover {
            transform: translateY(-5px) !important;
            background: rgba(60, 60, 60, 0.7) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3) !important;
        }
        
        /* Nom de la salle */
        .room-name {
            font-weight: bold !important;
            font-size: 1.1em !important;
            color: white !important;
            margin-bottom: 10px !important;
        }
        
        /* Statut de la salle */
        .room-status {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            font-size: 0.9em !important;
            color: rgba(255, 255, 255, 0.9) !important;
        }
        
        /* Indicateur de statut */
        .status-icon {
            width: 10px !important;
            height: 10px !important;
            border-radius: 50% !important;
            box-shadow: 0 0 8px currentColor !important;
        }
        
        .status-icon.available {
            background-color: #4CAF50 !important;
            box-shadow: 0 0 8px rgba(76, 175, 80, 0.7) !important;
        }
        
        .status-icon.occupied {
            background-color: #F44336 !important;
            box-shadow: 0 0 8px rgba(244, 67, 54, 0.7) !important;
        }
        
        .status-icon.soon {
            background-color: #FF9800 !important;
            box-shadow: 0 0 8px rgba(255, 152, 0, 0.7) !important;
        }
        
        /* Titre de la section des salles */
        .rooms-section-title {
            color: white !important;
            text-align: center !important;
            margin-top: 0 !important;
            margin-bottom: 15px !important;
            font-size: 1.3em !important;
            font-weight: normal !important;
            padding-bottom: 10px !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        
        /* Bouton de fermeture */
        .rooms-section-close {
            position: absolute !important;
            top: 15px !important;
            right: 15px !important;
            background: rgba(255, 255, 255, 0.1) !important;
            border: none !important;
            color: white !important;
            width: 30px !important;
            height: 30px !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            transition: background 0.2s ease !important;
            font-size: 18px !important;
        }
        
        .rooms-section-close:hover {
            background: rgba(255, 255, 255, 0.2) !important;
        }
    `, 'rooms-grid-styles');
    
    // Attacher aux boutons d'affichage
    setupRoomsButtons();
    
    // Créer la structure améliorée si nécessaire
    enhanceRoomsSection();
    
    function enhanceRoomsSection() {
        // Trouver ou créer la section des salles
        let roomsSection = document.querySelector('.rooms-section');
        if (!roomsSection) {
            roomsSection = document.createElement('div');
            roomsSection.className = 'rooms-section';
            document.body.appendChild(roomsSection);
        }
        
        // Ajouter un titre et un bouton de fermeture
        const roomsContainer = document.querySelector('.rooms');
        if (roomsContainer && !document.querySelector('.rooms-section-title')) {
            // Ajouter le titre
            const title = document.createElement('h3');
            title.className = 'rooms-section-title';
            title.innerHTML = '<i class="fas fa-door-open"></i> Salles disponibles';
            
            // Ajouter le bouton de fermeture
            const closeButton = document.createElement('button');
            closeButton.className = 'rooms-section-close';
            closeButton.innerHTML = '&times;';
            closeButton.addEventListener('click', function() {
                roomsSection.classList.remove('visible');
                updateRoomsButtonsText(false);
            });
            
            // Insérer avant le conteneur des salles
            roomsSection.insertBefore(title, roomsContainer);
            roomsSection.insertBefore(closeButton, roomsContainer);
        }
    }
    
    function setupRoomsButtons() {
        const toggleButtons = document.querySelectorAll('.toggle-rooms-button, #toggleRoomsBtn, #showRoomsBtn, [id*="Room"], .rooms-toggle-button-floating, button[id*="salle"]');
        
        toggleButtons.forEach(button => {
            if (button && !button.hasAttribute('data-rooms-grid-handler')) {
                // Cloner pour supprimer les écouteurs existants
                const newButton = button.cloneNode(true);
                if (button.parentNode) {
                    button.parentNode.replaceChild(newButton, button);
                }
                
                // Ajouter le nouvel écouteur
                newButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const roomsSection = document.querySelector('.rooms-section');
                    if (!roomsSection) return;
                    
                    const isVisible = roomsSection.classList.contains('visible');
                    roomsSection.classList.toggle('visible', !isVisible);
                    
                    // Mettre à jour les textes des boutons
                    updateRoomsButtonsText(!isVisible);
                });
                
                // Marquer comme traité
                newButton.setAttribute('data-rooms-grid-handler', 'true');
            }
        });
        
        // Fermer au clic en dehors
        document.addEventListener('click', function(e) {
            const roomsSection = document.querySelector('.rooms-section');
            if (!roomsSection) return;
            
            // Si la section est visible et le clic est en dehors
            if (roomsSection.classList.contains('visible') && 
                !roomsSection.contains(e.target) && 
                !e.target.closest('.toggle-rooms-button, #toggleRoomsBtn, #showRoomsBtn, [id*="Room"], .rooms-toggle-button-floating')) {
                roomsSection.classList.remove('visible');
                updateRoomsButtonsText(false);
            }
        });
    }
    
    function updateRoomsButtonsText(isVisible) {
        const showText = '<i class="fas fa-door-open"></i> Afficher les salles';
        const hideText = '<i class="fas fa-times"></i> Masquer les salles';
        
        const toggleButtons = document.querySelectorAll('.toggle-rooms-button, #toggleRoomsBtn, #showRoomsBtn, [id*="Room"], .rooms-toggle-button-floating, button[id*="salle"]');
        
        toggleButtons.forEach(button => {
            if (button) {
                button.innerHTML = isVisible ? hideText : showText;
            }
        });
    }
}

/**
 * Applique la transparence optimale
 */
function applyOptimalTransparency() {
    // Styles pour la transparence
    addStylesheet(`
        /* Transparence de la bannière d'en-tête */
        .header {
            background-color: rgba(30, 30, 30, 0.4) !important;
            backdrop-filter: blur(5px) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 0 0 15px 15px !important;
            border-top: none !important;
        }
        
        /* Transparence de la bannière de bas de page */
        .controls-container {
            background-color: rgba(30, 30, 30, 0.4) !important;
            backdrop-filter: blur(5px) !important;
            border-radius: 15px 15px 0 0 !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-bottom: none !important;
        }
        
        /* Transparence du conteneur de réunions */
        .meetings-container {
            background-color: rgba(30, 30, 30, 0.4) !important;
            backdrop-filter: blur(5px) !important;
            border-radius: 15px !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        
        /* Transparence de l'en-tête des réunions */
        .meetings-title-bar {
            background-color: rgba(40, 40, 40, 0.3) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(5px) !important;
        }
        
        /* Transparence des éléments de réunion */
        .meeting-item {
            background-color: rgba(40, 40, 40, 0.3) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(3px) !important;
        }
        
        /* Transparence du menu latéral */
        .side-menu {
            background-color: rgba(25, 25, 25, 0.65) !important;
            backdrop-filter: blur(10px) !important;
        }
        
        /* Transparence de la section ID de réunion */
        .meeting-id-entry {
            background-color: rgba(40, 40, 40, 0.3) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(5px) !important;
        }
    `, 'optimal-transparency-styles');
    
    // Application directe
    const header = document.querySelector('.header');
    if (header) {
        header.style.backgroundColor = 'rgba(30, 30, 30, 0.4)';
        header.style.backdropFilter = 'blur(5px)';
    }
    
    const controlsContainer = document.querySelector('.controls-container');
    if (controlsContainer) {
        controlsContainer.style.backgroundColor = 'rgba(30, 30, 30, 0.4)';
        controlsContainer.style.backdropFilter = 'blur(5px)';
    }
    
    const meetingsContainer = document.querySelector('.meetings-container');
    if (meetingsContainer) {
        meetingsContainer.style.backgroundColor = 'rgba(30, 30, 30, 0.4)';
        meetingsContainer.style.backdropFilter = 'blur(5px)';
    }
    
    const sideMenu = document.querySelector('.side-menu');
    if (sideMenu) {
        sideMenu.style.backgroundColor = 'rgba(25, 25, 25, 0.65)';
        sideMenu.style.backdropFilter = 'blur(10px)';
    }
}

/**
 * Corrige l'ouverture du menu au premier clic
 */
function fixMenuFirstClick() {
    // Trouver les éléments du menu
    const menuToggle = document.querySelector('.menu-toggle-visible');
    const sideMenu = document.querySelector('.side-menu');
    const mainContainer = document.querySelector('.main-container');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    if (!menuToggle || !sideMenu || !mainContainer) return;
    
    // Styles optimisés pour le menu
    addStylesheet(`
        /* Optimisations pour le premier clic */
        .side-menu {
            transform: translateX(-100%) !important;
            transition: transform 0.25s ease !important;
            will-change: transform !important;
        }
        
        .side-menu.expanded {
            transform: translateX(0) !important;
        }
        
        .menu-overlay {
            opacity: 0 !important;
            visibility: hidden !important;
            transition: opacity 0.25s ease, visibility 0.25s ease !important;
            will-change: opacity !important;
        }
        
        .menu-overlay.active {
            opacity: 1 !important;
            visibility: visible !important;
        }
    `, 'menu-first-click-styles');
    
    // Supprimer tous les écouteurs existants
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
    
    // Ajouter l'écouteur optimisé
    newMenuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Basculer l'état immédiatement
        const isExpanded = sideMenu.classList.contains('expanded');
        
        // Utiliser requestAnimationFrame pour garantir l'exécution au prochain cycle de rendu
        requestAnimationFrame(() => {
            sideMenu.classList.toggle('expanded', !isExpanded);
            mainContainer.classList.toggle('menu-expanded', !isExpanded);
            
            if (menuOverlay) {
                menuOverlay.classList.toggle('active', !isExpanded);
            }
        });
    });
    
    // Gérer la fermeture au clic en dehors
    document.addEventListener('click', function(e) {
        // Si le menu est ouvert et le clic est en dehors
        if (sideMenu.classList.contains('expanded') && 
            !sideMenu.contains(e.target) && 
            e.target !== newMenuToggle && 
            !newMenuToggle.contains(e.target)) {
            
            sideMenu.classList.remove('expanded');
            mainContainer.classList.remove('menu-expanded');
            
            if (menuOverlay) {
                menuOverlay.classList.remove('active');
            }
        }
    });
    
    // Gérer la fermeture via l'overlay
    if (menuOverlay) {
        document.querySelector('.menu-overlay').addEventListener('click', function() {
            sideMenu.classList.remove('expanded');
            mainContainer.classList.remove('menu-expanded');
            this.classList.remove('active');
        });
    }
}

/**
 * Utilitaire pour ajouter une feuille de style
 */
function addStylesheet(cssText, id) {
    // Vérifier si elle existe déjà
    if (id && document.getElementById(id)) {
        document.getElementById(id).textContent = cssText;
        return;
    }
    
    // Créer un élément style
    const style = document.createElement('style');
    if (id) style.id = id;
    style.textContent = cssText;
    document.head.appendChild(style);
}
