/**
 * SOLUTION DÉFINITIVE pour l'application de réservation de salles
 * Version 6.0 - Résolution complète des problèmes:
 * 1. Redirection Teams parfaite (méthode entièrement nouvelle)
 * 2. Correction des superpositions des blocs
 * 3. Transparence maximale des bannières
 * 4. Ouverture du menu au premier clic
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Initialisation de la solution définitive v6.0");
    
    // Appliquer immédiatement les corrections
    fixTeamsLauncherURL();
    fixBlockOverlaps();
    increaseTransparency();
    fixMenuFirstClick();
    fixRoomsDisplay();
});

/**
 * CORRECTION DÉFINITIVE pour la redirection Teams
 * Utilise l'approche launcher.html comme dans l'URL d'exemple
 */
function fixTeamsLauncherURL() {
    // Désactiver les solutions précédentes
    window._originalJoinMeetingWithId = window.joinMeetingWithId;
    
    // ID du tenant de l'organisation (extrait de l'URL d'exemple)
    const TENANT_ID = "3991cba7-1148-49eb-9aa9-0c46dba8f57e";
    
    // Nouvelle fonction de redirection qui utilise exactement le format de l'URL fournie
    function definitiveMeetingJoin(providedId = null) {
        // Bloquer les multiples appels
        if (window._joiningInProgress) {
            console.log("Jointure déjà en cours");
            return;
        }
        window._joiningInProgress = true;
        
        // Récupérer l'ID
        const meetingIdField = document.getElementById('meeting-id');
        let meetingId = providedId || (meetingIdField ? meetingIdField.value.trim() : '');
        
        if (!meetingId) {
            alert("Veuillez entrer l'ID de la réunion");
            window._joiningInProgress = false;
            return;
        }
        
        // Mise à jour de l'interface
        const joinButton = document.getElementById('joinMeetingBtn');
        if (joinButton) {
            joinButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            joinButton.disabled = true;
        }
        
        try {
            // SOLUTION FINALE: Utiliser le format exact de l'URL launcher avec l'ID tel quel
            // IMPORTANT - PRÉSERVER les espaces dans l'ID (comme montré dans les logs)
            
            // Étape 1: Préserver l'ID exactement comme entré (avec espaces)
            const preservedId = meetingId;
            
            // Étape 2: Encoder les caractères spéciaux pour l'URL (mais avec une méthode qui préserve mieux les espaces)
            // Dans l'URL d'exemple, les espaces sont encodés comme %2520 (double encodage)
            const encodedId = encodeURIComponent(preservedId).replace(/%20/g, '%2520');
            
            // Étape 3: Construire l'URL exactement comme dans l'exemple fourni
            const contextParam = `%257b%2522Tid%2522%253a%2522${TENANT_ID}%2522%257d`;
            
            // URL interne de la réunion (partie encodée dans le paramètre url)
            const innerUrl = `%2F_%23%2Fl%2Fmeetup-join%2F19%3Ameeting_${encodedId}%40thread.v2%2F0%3Fcontext%3D${contextParam}%26directDl%3Dtrue%26msLaunch%3Dtrue%26enableMobilePage%3Dtrue%26suppressPrompt%3Dtrue%26anon%3Dtrue`;
            
            // URL complète avec les paramètres externes
            const finalUrl = `https://teams.microsoft.com/dl/launcher/launcher.html?url=${innerUrl}&type=meetup-join&deeplinkId=${generateUUID()}&directDl=true&msLaunch=true&enableMobilePage=true&suppressPrompt=true`;
            
            // Sauvegarder l'ID dans l'historique
            saveRecentId(meetingId);
            
            // Redirection
            console.log("Redirection via launcher URL:", finalUrl);
            window.open(finalUrl, "_blank");
            
            // Afficher un message de succès
            showStatusMessage("Redirection vers Teams...", "success");
        } catch (error) {
            console.error("Erreur lors de la redirection:", error);
            showStatusMessage("Erreur de redirection", "error");
        } finally {
            // Rétablir l'interface
            setTimeout(() => {
                if (joinButton) {
                    joinButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Rejoindre';
                    joinButton.disabled = false;
                }
                window._joiningInProgress = false;
            }, 2000);
        }
    }
    
    // Générer un UUID pour le deeplinkId (comme dans l'URL d'exemple)
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    // Sauvegarder l'ID dans l'historique
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
    
    // Afficher un message d'état
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
    
    // Remplacer les fonctions
    window.joinMeetingWithId = definitiveMeetingJoin;
    
    if (window.JoinSystem) {
        window.JoinSystem.joinMeetingWithId = definitiveMeetingJoin;
    } else {
        window.JoinSystem = { joinMeetingWithId: definitiveMeetingJoin };
    }
    
    // Attacher au bouton
    const joinButton = document.getElementById('joinMeetingBtn');
    if (joinButton) {
        const newJoinButton = joinButton.cloneNode(true);
        if (joinButton.parentNode) {
            joinButton.parentNode.replaceChild(newJoinButton, joinButton);
        }
        
        newJoinButton.addEventListener('click', function(e) {
            e.preventDefault();
            definitiveMeetingJoin();
        });
    }
    
    // Attacher à l'événement Enter dans le champ ID
    const meetingIdField = document.getElementById('meeting-id');
    if (meetingIdField) {
        meetingIdField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                definitiveMeetingJoin();
            }
        });
    }
    
    // Optimiser l'historique des ID récents
    enhanceRecentIds();
}

/**
 * Amélioration de l'affichage des ID récents
 */
function enhanceRecentIds() {
    // Trouver ou créer le conteneur
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
    
    // Gérer le champ ID
    const meetingIdField = document.getElementById('meeting-id');
    if (meetingIdField) {
        // Nettoyer les écouteurs existants
        const newIdField = meetingIdField.cloneNode(true);
        if (meetingIdField.parentNode) {
            meetingIdField.parentNode.replaceChild(newIdField, meetingIdField);
        }
        
        // Ajouter les nouveaux écouteurs
        newIdField.addEventListener('focus', function() {
            showRecentIds(this);
        });
        
        newIdField.addEventListener('click', function() {
            showRecentIds(this);
        });
    }
    
    // Fermer au clic en dehors
    document.addEventListener('click', function(e) {
        if (recentIdsContainer.style.display === 'block' && 
            e.target !== meetingIdField && 
            !recentIdsContainer.contains(e.target)) {
            recentIdsContainer.style.display = 'none';
        }
    });
    
    // Fonction pour afficher les ID récents
    function showRecentIds(inputField) {
        const recentIds = JSON.parse(localStorage.getItem('recentMeetingIds') || '[]');
        
        if (recentIds.length === 0) {
            recentIdsContainer.style.display = 'none';
            return;
        }
        
        // Positionner correctement
        const rect = inputField.getBoundingClientRect();
        recentIdsContainer.style.top = `${rect.bottom + window.scrollY + 5}px`;
        recentIdsContainer.style.left = `${rect.left + window.scrollX}px`;
        recentIdsContainer.style.width = `${rect.width}px`;
        
        // Construire le contenu
        recentIdsContainer.innerHTML = `
            <div style="background: rgba(76, 89, 175, 0.3); padding: 10px 15px; font-size: 14px; color: white; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
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
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.transition = 'background 0.2s ease';
            
            item.innerHTML = `
                <i class="fas fa-key" style="margin-right: 10px; color: rgba(255, 255, 255, 0.7);"></i>
                <span style="font-family: monospace; font-weight: bold; color: white;">${id}</span>
            `;
            
            item.addEventListener('mouseover', function() {
                this.style.background = 'rgba(76, 89, 175, 0.2)';
            });
            
            item.addEventListener('mouseout', function() {
                this.style.background = 'transparent';
            });
            
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
        
        recentIdsContainer.style.display = 'block';
    }
}

/**
 * Correction des superpositions de blocs
 */
function fixBlockOverlaps() {
    // Ajouter les styles pour corriger les superpositions
    addStylesheet(`
        /* Correction des espaces entre les blocs */
        .meetings-container {
            margin-bottom: 20px !important;
            padding-bottom: 15px !important;
        }
        
        /* S'assurer que les contrôles ont un espace suffisant */
        .controls-container {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 100 !important;
            padding: 10px 0 !important;
        }
        
        /* S'assurer que le contenu principal a assez d'espace */
        .main-container {
            padding-bottom: 60px !important;
        }
        
        /* S'assurer que le contenu des réunions ne déborde pas */
        .meetings-list {
            overflow-y: auto !important;
            max-height: calc(100vh - 300px) !important;
        }
        
        /* Correction de la superposition des boutons rejoindre */
        .meeting-join-btn {
            z-index: 5 !important;
            position: relative !important;
        }
        
        /* Empêcher les titres de réunion de déborder */
        .meeting-item h3 {
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            max-width: calc(100% - 100px) !important;
        }
    `, 'overlap-fix-styles');
    
    // Appliquer des corrections directes à certains éléments
    fixSpecificOverlaps();
    
    function fixSpecificOverlaps() {
        // Assurer que le conteneur de réunions a une marge en bas
        const meetingsContainer = document.querySelector('.meetings-container');
        if (meetingsContainer) {
            meetingsContainer.style.marginBottom = '20px';
        }
        
        // Ajuster l'espacement du conteneur principal
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer) {
            mainContainer.style.paddingBottom = '60px';
        }
        
        // Ajuster les boutons rejoindre
        const joinButtons = document.querySelectorAll('.meeting-join-btn');
        joinButtons.forEach(btn => {
            btn.style.zIndex = '5';
            btn.style.position = 'relative';
        });
        
        // Ajuster les titres des réunions
        const meetingTitles = document.querySelectorAll('.meeting-item h3');
        meetingTitles.forEach(title => {
            title.style.overflow = 'hidden';
            title.style.textOverflow = 'ellipsis';
            title.style.whiteSpace = 'nowrap';
        });
    }
}

/**
 * Augmente encore plus la transparence des bannières
 */
function increaseTransparency() {
    // Ajouter les styles avec transparence maximale
    addStylesheet(`
        /* Transparence maximale de la bannière d'en-tête */
        .header {
            background-color: rgba(30, 30, 30, 0.4) !important;
            backdrop-filter: blur(5px) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 0 0 15px 15px !important;
            border-top: none !important;
        }
        
        /* Transparence maximale de la bannière de bas de page */
        .controls-container {
            background-color: rgba(30, 30, 30, 0.4) !important;
            backdrop-filter: blur(5px) !important;
            border-radius: 15px 15px 0 0 !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-bottom: none !important;
        }
        
        /* Transparence maximale du conteneur de réunions */
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
            background-color: rgba(25, 25, 25, 0.7) !important;
            backdrop-filter: blur(10px) !important;
        }
        
        /* Transparence de la section ID de réunion */
        .meeting-id-entry {
            background-color: rgba(40, 40, 40, 0.3) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(5px) !important;
        }
        
        /* Transparence du champ ID */
        #meeting-id {
            background-color: rgba(25, 25, 25, 0.5) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }
    `, 'max-transparency-styles');
    
    // Appliquer directement à certains éléments
    applyMaxTransparency();
    
    function applyMaxTransparency() {
        // Header
        const header = document.querySelector('.header');
        if (header) {
            header.style.backgroundColor = 'rgba(30, 30, 30, 0.4)';
            header.style.backdropFilter = 'blur(5px)';
        }
        
        // Controls container
        const controlsContainer = document.querySelector('.controls-container');
        if (controlsContainer) {
            controlsContainer.style.backgroundColor = 'rgba(30, 30, 30, 0.4)';
            controlsContainer.style.backdropFilter = 'blur(5px)';
        }
        
        // Meetings container
        const meetingsContainer = document.querySelector('.meetings-container');
        if (meetingsContainer) {
            meetingsContainer.style.backgroundColor = 'rgba(30, 30, 30, 0.4)';
            meetingsContainer.style.backdropFilter = 'blur(5px)';
        }
        
        // Menu latéral
        const sideMenu = document.querySelector('.side-menu');
        if (sideMenu) {
            sideMenu.style.backgroundColor = 'rgba(25, 25, 25, 0.7)';
            sideMenu.style.backdropFilter = 'blur(10px)';
        }
    }
}

/**
 * Corrige le problème nécessitant deux clics pour ouvrir le menu
 */
function fixMenuFirstClick() {
    // Trouver les éléments du menu
    const menuToggle = document.querySelector('.menu-toggle-visible');
    const sideMenu = document.querySelector('.side-menu');
    const mainContainer = document.querySelector('.main-container');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    if (!menuToggle || !sideMenu || !mainContainer) return;
    
    // Supprimer tous les écouteurs d'événements existants
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
    
    // S'assurer qu'il n'y a pas de délais ou d'animations bloquantes
    addStylesheet(`
        /* Optimisation du menu pour le premier clic */
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
    `, 'menu-first-click-fix');
    
    // Ajouter l'écouteur d'événements optimisé
    newMenuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Utiliser requestAnimationFrame pour garantir que ça se produit au prochain cycle de rendu
        requestAnimationFrame(() => {
            // Basculer les classes directement
            sideMenu.classList.toggle('expanded');
            mainContainer.classList.toggle('menu-expanded');
            
            if (menuOverlay) {
                menuOverlay.classList.toggle('active', sideMenu.classList.contains('expanded'));
            }
        });
    });
    
    // Gérer la fermeture du menu
    if (menuOverlay) {
        document.querySelector('.menu-overlay').addEventListener('click', function() {
            sideMenu.classList.remove('expanded');
            mainContainer.classList.remove('menu-expanded');
            this.classList.remove('active');
        });
    }
    
    // Fermer le menu au clic en dehors
    document.addEventListener('click', function(e) {
        // Si le menu est ouvert et le clic est en dehors du menu et du bouton de menu
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
}

/**
 * Gère correctement l'affichage des salles
 */
function fixRoomsDisplay() {
    // Ajouter les styles corrigés
    addStylesheet(`
        /* Affichage des salles en bas (barre horizontale) */
        .rooms-section {
            position: fixed !important;
            bottom: 60px !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            height: auto !important;
            background-color: rgba(30, 30, 30, 0.5) !important;
            backdrop-filter: blur(8px) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
            box-shadow: 0 -5px 10px rgba(0, 0, 0, 0.2) !important;
            z-index: 900 !important;
            padding: 10px !important;
            margin: 0 !important;
            display: none;
            opacity: 0;
            transition: opacity 0.3s ease !important;
        }
        
        .rooms-section.visible {
            display: block !important;
            opacity: 1 !important;
        }
        
        /* Disposition des salles en ligne */
        .rooms {
            display: flex !important;
            flex-wrap: nowrap !important;
            justify-content: center !important;
            align-items: center !important;
            gap: 10px !important;
            overflow-x: auto !important;
            padding: 5px !important;
            scrollbar-width: thin !important;
        }
        
        .room-card {
            flex: 0 0 auto !important;
            width: auto !important;
            min-width: 120px !important;
            height: 80px !important;
            background: rgba(50, 50, 50, 0.5) !important;
            backdrop-filter: blur(5px) !important;
            border-radius: 8px !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            padding: 10px !important;
            transition: all 0.2s ease !important;
            cursor: pointer !important;
        }
        
        .room-card:hover {
            transform: translateY(-3px) !important;
            background: rgba(60, 60, 60, 0.6) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3) !important;
        }
        
        /* Scrollbar pour les salles */
        .rooms::-webkit-scrollbar {
            height: 5px !important;
        }
        
        .rooms::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05) !important;
            border-radius: 5px !important;
        }
        
        .rooms::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2) !important;
            border-radius: 5px !important;
        }
        
        .rooms::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3) !important;
        }
    `, 'rooms-display-fix');
    
    // Correction des boutons d'affichage des salles
    fixRoomsToggleButtons();
    
    // Gestion de la fermeture au clic en dehors
    document.addEventListener('click', function(e) {
        const roomsSection = document.querySelector('.rooms-section');
        if (!roomsSection) return;
        
        // Si la section est visible et le clic est en dehors
        if (roomsSection.classList.contains('visible')) {
            // Ignorer les clics sur la section ou les boutons de toggle
            if (!roomsSection.contains(e.target) && 
                !e.target.closest('[id*="Room"], .toggle-rooms-button, #showRoomsBtn, .rooms-toggle-button-floating')) {
                roomsSection.classList.remove('visible');
                updateRoomsButtonsText(false);
            }
        }
    });
    
    function fixRoomsToggleButtons() {
        const toggleButtons = document.querySelectorAll('.toggle-rooms-button, #toggleRoomsBtn, #showRoomsBtn, [id*="Room"], .rooms-toggle-button-floating');
        
        toggleButtons.forEach(button => {
            if (button && !button.hasAttribute('data-fixed-rooms-handler')) {
                // Supprimer les écouteurs existants
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
                newButton.setAttribute('data-fixed-rooms-handler', 'true');
            }
        });
    }
    
    function updateRoomsButtonsText(isVisible) {
        const showText = '<i class="fas fa-door-open"></i> Afficher les salles';
        const hideText = '<i class="fas fa-times"></i> Masquer les salles';
        
        const toggleButtons = document.querySelectorAll('.toggle-rooms-button, #toggleRoomsBtn, #showRoomsBtn, [id*="Room"], .rooms-toggle-button-floating');
        
        toggleButtons.forEach(button => {
            if (button) {
                button.innerHTML = isVisible ? hideText : showText;
            }
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
    
    // Créer un nouvel élément style
    const style = document.createElement('style');
    if (id) style.id = id;
    style.textContent = cssText;
    document.head.appendChild(style);
}
