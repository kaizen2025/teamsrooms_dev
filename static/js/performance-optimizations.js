/**
 * SOLUTION COMPLÈTE FINALE - Correction de tous les problèmes visuels
 * Version 8.0 - Refonte visuelle harmonieuse:
 * 1. Connexion Teams directe (méthode éprouvée avec votre URL)
 * 2. Correction de l'espacement entre les blocs (plus de superposition)
 * 3. Suppression de la bannière du haut
 * 4. Réduction de la largeur de la bannière du bas
 * 5. Disposition harmonieuse des salles en grille
 * 6. Espace vide sous le bloc d'ID pour voir l'arrière-plan
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Initialisation de la solution complète finale v8.0 - Interface harmonieuse");
    
    // Appliquer toutes les corrections visuelles et fonctionnelles
    initializeUI();
});

/**
 * Initialise l'interface utilisateur avec toutes les améliorations
 */
function initializeUI() {
    // Appliquer les corrections avec un léger délai pour s'assurer que le DOM est prêt
    setTimeout(() => {
        try {
            // 1. Suppression de la bannière du haut et réduction de celle du bas (en premier pour éviter les flashs)
            removeHeaderAndShrinkFooter();
            
            // 2. Correction des espaces et superpositions
            fixSpacingAndOverlaps();
            
            // 3. Transparence optimale
            applyOptimalTransparency();
            
            // 4. Disposition des salles en grille
            implementRoomsGrid();
            
            // 5. Correction du premier clic du menu
            fixMenuFirstClick();
            
            // 6. Connexion Teams directe
            implementDirectTeamsJoin();
            
            console.log("✅ Interface harmonieuse initialisée avec succès");
        } catch (error) {
            console.error("❌ Erreur lors de l'initialisation de l'interface:", error);
            
            // Réessayer après un délai plus long en cas d'erreur
            setTimeout(() => {
                initializeUI();
            }, 500);
        }
    }, 100);
});

/**
 * Supprime la bannière du haut et réduit la largeur de la bannière du bas
 */
/**
 * Supprime la bannière du haut et réduit la largeur de la bannière du bas
 * pour une interface plus propre et harmonieuse
 */
function removeHeaderAndShrinkFooter() {
    // Styles pour masquer le header et réduire la largeur du footer
    addStylesheet(`
        /* Masquer complètement la bannière du haut */
        .header, .top-banner, .app-header, div[class*="header"], 
        div[class*="Header"], div[id*="header"], div[id*="Header"] {
            display: none !important;
            height: 0 !important;
            opacity: 0 !important;
            visibility: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
        }
        
        /* Masquer l'information de dernière synchro */
        [id*="synchro"], [class*="synchro"], .sync-info, .last-sync, 
        span:has(> [id*="synchro"]), div:has(> [id*="synchro"]) {
            display: none !important;
            visibility: hidden !important;
        }
        
        /* Réduire la largeur de la bannière du bas - Version compact */
        .controls-container, .footer-banner, .app-footer, 
        div[class*="footer"], div[class*="Footer"], 
        div[id*="footer"], div[id*="Footer"] {
            width: 50% !important;
            max-width: 600px !important;
            margin: 0 auto !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            border-radius: 15px 15px 0 0 !important;
            box-sizing: border-box !important;
            background-color: rgba(30, 30, 30, 0.7) !important;
            backdrop-filter: blur(10px) !important;
        }
        
        /* Ajustement de l'espace sous le bloc d'ID de réunion */
        .meeting-id-entry, .id-entry, div[class*="id-entry"], 
        div[id*="id-entry"] {
            margin-bottom: 40px !important;
            border-bottom-left-radius: 15px !important;
            border-bottom-right-radius: 15px !important;
        }
        
        /* Ajuster le contenu principal pour compenser l'absence de bannière */
        .main-container, .content-container, .app-content {
            padding-top: 20px !important;
            margin-top: 0 !important;
        }
        
        /* Ajuster la positon verticale des blocs de contenu */
        .meetings-container, .content-block, .app-block {
            margin-top: 20px !important;
        }
        
        /* Assurer que tout le contenu est bien visible */
        body {
            padding-top: 0 !important;
            margin-top: 0 !important;
        }
    `, 'header-footer-adjustment-styles');
    
    // Application directe à certains éléments
    const headerElements = document.querySelectorAll('.header, .top-banner, .app-header, [class*="header"], [class*="Header"], [id*="header"], [id*="Header"]');
    headerElements.forEach(element => {
        if (element) {
            element.style.display = 'none';
            element.style.height = '0';
            element.style.opacity = '0';
            element.style.visibility = 'hidden';
        }
    });
    
    const footerElements = document.querySelectorAll('.controls-container, .footer-banner, .app-footer, [class*="footer"], [class*="Footer"], [id*="footer"], [id*="Footer"]');
    footerElements.forEach(element => {
        if (element) {
            element.style.width = '80%';
            element.style.maxWidth = '900px';
            element.style.margin = '0 auto';
            element.style.left = '50%';
            element.style.transform = 'translateX(-50%)';
            element.style.borderRadius = '15px 15px 0 0';
        }
    });
    
    const idEntryElements = document.querySelectorAll('.meeting-id-entry, .id-entry, [class*="id-entry"], [id*="id-entry"]');
    idEntryElements.forEach(element => {
        if (element) {
            element.style.marginBottom = '40px';
            element.style.borderBottomLeftRadius = '15px';
            element.style.borderBottomRightRadius = '15px';
        }
    });
    
    // Ajuster les conteneurs principaux
    const mainContainers = document.querySelectorAll('.main-container, .content-container, .app-content');
    mainContainers.forEach(container => {
        if (container) {
            container.style.paddingTop = '20px';
            container.style.marginTop = '0';
        }
    });
}

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
            margin-bottom: 100px !important;
            margin-top: 20px !important;
            overflow: visible !important;
            width: 90% !important;
            max-width: 1000px !important;
            margin-left: auto !important;
            margin-right: auto !important;
            border-radius: 15px !important;
        }
        
        /* Position fixe de la barre du bas */
        .controls-container, .bottom-controls, .footer-controls, div[id*="footer-control"] {
            position: fixed !important;
            bottom: 0 !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: 50% !important;
            max-width: 600px !important;
            z-index: 100 !important;
            padding: 10px 15px !important;
            border-bottom: none !important;
            display: flex !important;
            justify-content: center !important;
            gap: 15px !important;
        }
        
        /* Assez d'espace en bas du conteneur principal */
        .main-container {
            padding-bottom: 80px !important;
            width: 100% !important;
            max-width: 100% !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            box-sizing: border-box !important;
        }
        
        /* Section des réunions avec scroll interne */
        .meetings-list {
            max-height: calc(100vh - 250px) !important;
            overflow-y: auto !important;
            padding-right: 5px !important;
            margin-bottom: 15px !important;
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
        .meeting-id-entry, #reunion-id-form, .id-entry-zone {
            padding: 15px !important;
            position: relative !important;
            z-index: 1 !important;
            margin-top: 15px !important;
            border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-bottom-left-radius: 15px !important;
            border-bottom-right-radius: 15px !important;
            background-color: rgba(40, 40, 40, 0.7) !important;
        }
        
        /* Espace vide sous le bloc d'ID */
        .meeting-id-entry:after {
            content: '' !important;
            display: block !important;
            height: 40px !important;
            width: 100% !important;
            margin-bottom: -40px !important;
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
        
        /* Correction des éléments de réunion */
        .meeting-item {
            margin-bottom: 12px !important;
            border-radius: 10px !important;
            padding: 12px !important;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1) !important;
        }
        
        /* Titre de la section des réunions */
        .meetings-title-bar, .section-title {
            padding: 15px !important;
            border-top-left-radius: 15px !important;
            border-top-right-radius: 15px !important;
        }
        
        /* Espacements internes cohérents */
        .meetings-list {
            padding: 15px !important;
            padding-top: 5px !important;
        }
    `, 'spacing-fix-styles');
    
    // Application directe à certains éléments
    fixElementsDirectly();
    
    function fixElementsDirectly() {
        // Conteneur de réunions
        const meetingsContainer = document.querySelector('.meetings-container');
        if (meetingsContainer) {
            meetingsContainer.style.marginBottom = '100px';
            meetingsContainer.style.marginTop = '20px';
            meetingsContainer.style.width = '90%';
            meetingsContainer.style.maxWidth = '1000px';
            meetingsContainer.style.marginLeft = 'auto';
            meetingsContainer.style.marginRight = 'auto';
            meetingsContainer.style.borderRadius = '15px';
        }
        
        // Contrôles (footer)
        const controlsContainer = document.querySelector('.controls-container');
        if (controlsContainer) {
            controlsContainer.style.position = 'fixed';
            controlsContainer.style.bottom = '0';
            controlsContainer.style.left = '50%';
            controlsContainer.style.transform = 'translateX(-50%)';
            controlsContainer.style.width = '80%';
            controlsContainer.style.maxWidth = '900px';
            controlsContainer.style.borderBottomLeftRadius = '0';
            controlsContainer.style.borderBottomRightRadius = '0';
            controlsContainer.style.borderBottom = 'none';
        }
        
        // Conteneur principal
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer) {
            mainContainer.style.paddingBottom = '80px';
            mainContainer.style.width = '100%';
            mainContainer.style
