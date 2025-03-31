/**
 * interface-unified.js
 * Version consolidée des améliorations d'interface pour l'application Salles de Réunion
 * 
 * Ce fichier combine les fonctionnalités de:
 * - interface-improvements.js
 * - performance-optimizations.js
 * 
 * Tout en éliminant les redondances et en améliorant la performance
 */

// Système unifié de gestion de l'interface
const InterfaceSystem = {
    // État de l'interface
    menuExpanded: false,
    roomsVisible: false,
    isInitialized: false,
    lastDOMSize: 0,
    debugMode: false,
    
    /**
     * Initialise le système d'interface utilisateur
     */
    init() {
        // Éviter l'initialisation multiple
        if (this.isInitialized) {
            console.log("Interface déjà initialisée, abandon");
            return;
        }
        
        console.log("Initialisation du système d'interface unifié v1.0");
        
        // Appliquer les styles prioritaires
        this.applyPriorityStyles();
        
        // Initialiser l'interface avec un léger délai pour s'assurer que le DOM est prêt
        setTimeout(() => {
            try {
                // 1. Suppression de la bannière du haut et réduction de celle du bas
                this.optimizeHeaderFooter();
                
                // 2. Correction des espaces et superpositions
                this.fixSpacingAndOverlaps();
                
                // 3. Transparence optimale pour un rendu moderne
                this.applyOptimalTransparency();
                
                // 4. Disposition des salles en grille
                this.setupRoomsGrid();
                
                // 5. Optimiser le menu latéral
                this.initializeMenu();
                
                // 6. Optimiser la fonction Teams
                this.setupDirectTeamsJoin();
                
                // 7. Cacher les informations de synchronisation (dernière mise à jour)
                this.hideSyncInfo();
                
                // 8. Amélioration spécifique pour Safari et les navigateurs mobiles
                this.addBrowserSpecificFixes();
                
                // 9. Initialisation du menu utilisateur
                this.initUserProfileMenu();
                
                // 10. Initialiser les boutons globaux et éviter les conflits d'événements
                this.initGlobalButtons();
                
                console.log("✅ Interface optimisée initialisée avec succès");
                
                // Montrer un message de succès subtil pour confirmer le bon chargement
                this.showSuccessToast("Interface chargée", 2000);
                
                // Marquer comme initialisé
                this.isInitialized = true;
                
                // Observer le DOM pour réinitialiser si nécessaire lors de changements importants
                this.observeDOMChanges();
            } catch (error) {
                console.error("❌ Erreur lors de l'initialisation de l'interface:", error);
            }
        }, 100);
    },
    
    /**
     * Observation des changements importants dans le DOM
     * pour réinitialiser l'interface si nécessaire
     */
    observeDOMChanges() {
        this.lastDOMSize = document.body.innerHTML.length;
        
        // Vérifier périodiquement les changements importants
        setInterval(() => {
            const currentSize = document.body.innerHTML.length;
            // Si le DOM a changé de manière significative
            if (Math.abs(currentSize - this.lastDOMSize) > 1000) {
                console.log("Changement important du DOM détecté, réapplication de certains styles");
                this.lastDOMSize = currentSize;
                
                // Réappliquer uniquement les styles critiques
                this.applyPriorityStyles();
                this.fixSpacingAndOverlaps();
                this.hideSyncInfo();
                
                // Réinitialiser les boutons critiques
                this.fixJoinButtons();
            }
        }, 3000);
    },
    
    /**
     * Applique les styles CSS prioritaires pour maintenir l'apparence visuelle
     */
    applyPriorityStyles() {
        this.addStylesheet(`
            /* Position fixe de la barre du bas */
            .controls-container {
                position: fixed !important;
                bottom: 0 !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                width: 40% !important;
                max-width: 500px !important;
                min-width: 400px !important;
                z-index: 100 !important;
                padding: 10px 15px !important;
                border-radius: 15px 15px 0 0 !important;
                border-bottom: none !important;
                box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.1) !important;
                margin: 0 !important;
                background-color: rgba(30, 30, 30, 0.7) !important;
                backdrop-filter: blur(10px) !important;
            }
            
            /* Section des salles (centrée) */
            .rooms-section {
                position: fixed !important;
                left: 50% !important;
                top: 50% !important;
                transform: translate(-50%, -50%) !important;
                width: 70% !important;
                max-width: 800px !important;
                max-height: 80vh !important;
                background: rgba(30, 30, 30, 0.8) !important;
                backdrop-filter: blur(15px) !important;
                border-radius: 15px !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
                z-index: 9995 !important;
                padding: 20px !important;
                display: none !important;
                margin: 0 !important;
                overflow: auto !important;
            }
            
            .rooms-section.visible {
                display: block !important;
            }

            /* Transparence du conteneur de réunions */
            .meetings-container {
                background-color: rgba(30, 30, 30, 0.6) !important;
                backdrop-filter: blur(10px) !important;
                border-radius: 15px !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                margin-bottom: 100px !important;
                overflow: visible !important;
            }
            
            /* Espace vide sous le bloc d'ID */
            .meeting-id-entry {
                margin-bottom: 20px !important;
                border-bottom-left-radius: 15px !important;
                border-bottom-right-radius: 15px !important;
            }
        `, 'priority-styles');
    },
    
    /**
     * Ajouter une feuille de style à la page
     */
    addStylesheet(cssText, id) {
        // Vérifier si le style existe déjà
        const existingStyle = document.getElementById(id);
        if (existingStyle) {
            // Mettre à jour le contenu si le style existe déjà
            existingStyle.textContent = cssText;
            return;
        }
        
        // Créer un nouvel élément style
        const styleElement = document.createElement('style');
        styleElement.id = id;
        styleElement.textContent = cssText;
        document.head.appendChild(styleElement);
    },
    
    /**
     * Optimise l'affichage en supprimant la bannière du haut et en réduisant la barre du bas
     */
    optimizeHeaderFooter() {
        // Styles pour masquer le header et réduire la largeur du footer
        this.addStylesheet(`
            /* Masquer la bannière du haut */
            .header {
                display: none !important;
                height: 0 !important;
                opacity: 0 !important;
                visibility: hidden !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                overflow: hidden !important;
            }
            
            /* Réduire la largeur de la bannière du bas */
            .controls-container {
                width: 40% !important;
                max-width: 500px !important;
                min-width: 400px !important;
                margin: 0 auto !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                border-radius: 15px 15px 0 0 !important;
                box-sizing: border-box !important;
                background-color: rgba(30, 30, 30, 0.7) !important;
                backdrop-filter: blur(10px) !important;
                box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.1) !important;
            }
            
            /* Ajustement des contrôles dans la bannière du bas */
            .control-buttons {
                display: flex !important;
                justify-content: center !important;
                flex-wrap: wrap !important;
                gap: 10px !important;
                padding: 8px 15px !important;
            }
            
            /* Ajuster le contenu principal pour compenser l'absence de bannière */
            .main-container {
                padding-top: 20px !important;
                margin-top: 0 !important;
                grid-template-rows: 0px 1fr auto !important;
            }
            
            /* Ajuster la position verticale des blocs de contenu */
            .meetings-container {
                margin-top: 20px !important;
            }
        `, 'header-footer-styles');
    },
    
    /**
     * Corrige les espacements et superpositions pour une mise en page fluide
     */
    fixSpacingAndOverlaps() {
        this.addStylesheet(`
            /* Correction de l'espacement du conteneur de réunions */
            .meetings-container {
                margin-bottom: 100px !important;
                margin-top: 20px !important;
                overflow: visible !important;
                width: 95% !important;
                max-width: 1000px !important;
                margin-left: auto !important;
                margin-right: auto !important;
                border-radius: 15px !important;
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1) !important;
            }
            
            /* Liste des réunions avec scroll interne */
            .meetings-list {
                max-height: calc(100vh - 250px) !important;
                overflow-y: auto !important;
                scrollbar-width: thin !important;
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
                margin-top: 15px !important;
                border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
                border-bottom-left-radius: 15px !important;
                border-bottom-right-radius: 15px !important;
            }
            
            /* Correction des éléments de réunion */
            .meeting-item {
                margin-bottom: 12px !important;
                border-radius: 10px !important;
                padding: 12px !important;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1) !important;
                transition: transform 0.2s ease, box-shadow 0.2s ease !important;
            }
            
            .meeting-item:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15) !important;
            }
            
            /* Titre de la section des réunions */
            .meetings-title-bar {
                padding: 15px !important;
                border-top-left-radius: 15px !important;
                border-top-right-radius: 15px !important;
                background: rgba(40, 40, 40, 0.4) !important;
                backdrop-filter: blur(8px) !important;
            }
            
            /* Espacements internes cohérents */
            .meetings-list {
                padding: 15px !important;
                padding-top: 5px !important;
            }
            
            /* Éviter le débordement du menu latéral */
            .side-menu {
                max-width: 280px !important;
                overscroll-behavior: contain !important;
            }
            
            /* Ensure button spacing */
            button {
                margin: 2px !important;
            }
        `, 'spacing-fix-styles');
    },
    
    /**
     * Applique une transparence optimale pour une interface élégante
     */
    applyOptimalTransparency() {
        this.addStylesheet(`
            /* Transparence optimisée */
            .meetings-container {
                background-color: rgba(30, 30, 30, 0.5) !important;
                backdrop-filter: blur(10px) !important;
            }
            
            .meetings-title-bar {
                background-color: rgba(40, 40, 40, 0.3) !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                backdrop-filter: blur(10px) !important;
            }
            
            .meeting-item {
                background-color: rgba(45, 45, 45, 0.5) !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                backdrop-filter: blur(5px) !important;
            }
            
            .meeting-item:hover {
                background-color: rgba(55, 55, 55, 0.6) !important;
            }
            
            .side-menu {
                background-color: rgba(25, 25, 25, 0.85) !important;
                backdrop-filter: blur(15px) !important;
                border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
            }
            
            .meeting-id-entry {
                background-color: rgba(40, 40, 40, 0.4) !important;
                border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
                backdrop-filter: blur(8px) !important;
            }
        `, 'transparency-styles');
    },
    
    /**
     * Initialise et configure la disposition en grille pour les salles
     */
    setupRoomsGrid() {
        this.addStylesheet(`
            /* Disposition des salles en grille */
            .rooms {
                display: grid !important;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
                grid-gap: 15px !important;
                justify-content: center !important;
                align-items: stretch !important;
                padding: 10px !important;
                width: 100% !important;
                box-sizing: border-box !important;
            }
            
            /* Cartes de salle améliorées */
            .room-card {
                background: rgba(50, 50, 50, 0.5) !important;
                backdrop-filter: blur(5px) !important;
                border-radius: 10px !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
                align-items: center !important;
                padding: 15px !important;
                height: 120px !important;
                transition: all 0.2s ease-out !important;
                cursor: pointer !important;
                text-align: center !important;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1) !important;
            }
            
            .room-card:hover {
                transform: translateY(-5px) !important;
                background: rgba(60, 60, 60, 0.7) !important;
                border-color: rgba(255, 255, 255, 0.2) !important;
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2) !important;
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
            
            /* Overlay pour mieux gérer les clics */
            .rooms-overlay {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                background-color: rgba(0, 0, 0, 0.5) !important;
                z-index: 9994 !important;
                display: none !important;
                opacity: 0 !important;
                transition: opacity 0.3s ease !important;
            }
            
            .rooms-overlay.visible {
                display: block !important;
                opacity: 1 !important;
            }
        `, 'rooms-grid-styles');
        
        // Ajouter un overlay pour les clics en dehors des salles
        let roomsOverlay = document.querySelector('.rooms-overlay');
        if (!roomsOverlay) {
            roomsOverlay = document.createElement('div');
            roomsOverlay.className = 'rooms-overlay';
            document.body.appendChild(roomsOverlay);
            
            // Fermer au clic sur l'overlay
            roomsOverlay.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideRooms();
            });
        }
        
        // Ajouter un titre et un bouton de fermeture à la section des salles
        this.enhanceRoomsSection();
        
        // Configurer les boutons d'affichage des salles
        this.setupRoomsButtons();
    },
    
    /**
     * Améliore la section des salles avec un titre et un bouton de fermeture
     */
    enhanceRoomsSection() {
        const roomsSection = document.querySelector('.rooms-section');
        if (!roomsSection) return;
        
        const roomsContainer = roomsSection.querySelector('.rooms');
        if (!roomsContainer) return;
        
        // Ajouter un titre si nécessaire
        if (!roomsSection.querySelector('.rooms-section-title')) {
            const title = document.createElement('h3');
            title.className = 'rooms-section-title';
            title.innerHTML = '<i class="fas fa-door-open"></i> Salles disponibles';
            roomsSection.insertBefore(title, roomsContainer);
        }
        
        // Ajouter un bouton de fermeture
        if (!roomsSection.querySelector('.rooms-section-close')) {
            const closeButton = document.createElement('button');
            closeButton.className = 'rooms-section-close';
            closeButton.innerHTML = '&times;';
            closeButton.style.cssText = `
                position: absolute;
                top: 15px;
                right: 15px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                color: white;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: background 0.2s ease;
                font-size: 18px;
            `;
            
            closeButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideRooms();
            });
            
            roomsSection.insertBefore(closeButton, roomsContainer);
        }
    },
    
    /**
     * Configure les boutons pour afficher/masquer les salles
     */
    setupRoomsButtons() {
        const toggleButtons = document.querySelectorAll('.toggle-rooms-button, #toggleRoomsBtn, #showRoomsBtn, .rooms-toggle-button-floating');
        
        toggleButtons.forEach(button => {
            if (button && !button.hasAttribute('data-rooms-handler')) {
                // Cloner pour supprimer les écouteurs existants
                const newButton = button.cloneNode(true);
                if (button.parentNode) {
                    button.parentNode.replaceChild(newButton, button);
                }
                
                // Ajouter le nouvel écouteur
                newButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleRooms();
                });
                
                // Marquer comme traité
                newButton.setAttribute('data-rooms-handler', 'true');
            }
        });
    },
    
    /**
     * Bascule l'affichage des salles
     */
    toggleRooms() {
        const roomsSection = document.querySelector('.rooms-section');
        const roomsOverlay = document.querySelector('.rooms-overlay');
        
        if (!roomsSection) return;
        
        const isVisible = roomsSection.classList.contains('visible');
        
        if (isVisible) {
            this.hideRooms();
        } else {
            this.showRooms();
        }
    },
    
    /**
     * Affiche la section des salles
     */
    showRooms() {
        const roomsSection = document.querySelector('.rooms-section');
        const roomsOverlay = document.querySelector('.rooms-overlay');
        
        if (roomsSection) {
            roomsSection.classList.add('visible');
            
            if (roomsOverlay) {
                roomsOverlay.classList.add('visible');
            }
            
            // Mettre à jour le texte des boutons
            this.updateRoomsButtonsText(true);
            
            // Si le système de gestion des salles est disponible
            if (window.RoomsSystem) {
                window.RoomsSystem.isRoomsVisible = true;
            }
        }
    },
    
    /**
     * Masque la section des salles
     */
    hideRooms() {
        const roomsSection = document.querySelector('.rooms-section');
        const roomsOverlay = document.querySelector('.rooms-overlay');
        
        if (roomsSection) {
            roomsSection.classList.remove('visible');
            
            if (roomsOverlay) {
                roomsOverlay.classList.remove('visible');
            }
            
            // Mettre à jour le texte des boutons
            this.updateRoomsButtonsText(false);
            
            // Si le système de gestion des salles est disponible
            if (window.RoomsSystem) {
                window.RoomsSystem.isRoomsVisible = false;
            }
        }
    },
    
    /**
     * Met à jour le texte des boutons d'affichage des salles
     */
    updateRoomsButtonsText(isVisible) {
        const toggleRoomsButton = document.querySelector('.toggle-rooms-button');
        const controlRoomsBtn = document.getElementById('showRoomsBtn') || document.getElementById('toggleRoomsBtn');
        const floatingButton = document.querySelector('.rooms-toggle-button-floating');
        
        const showText = '<i class="fas fa-door-open"></i> Afficher les salles';
        const hideText = '<i class="fas fa-times"></i> Masquer les salles';
        
        if (toggleRoomsButton) {
            toggleRoomsButton.innerHTML = isVisible ? hideText : showText;
        }
        
        if (controlRoomsBtn) {
            controlRoomsBtn.innerHTML = isVisible ? hideText : showText;
        }
        
        if (floatingButton) {
            floatingButton.innerHTML = isVisible ? hideText : showText;
        }
    },
    
    /**
     * Initialise le menu latéral
     */
    initializeMenu() {
        const menuToggleBtn = document.querySelector('.menu-toggle-visible');
        const sideMenu = document.querySelector('.side-menu');
        const mainContainer = document.querySelector('.main-container');
        const menuOverlay = document.querySelector('.menu-overlay');
        
        // S'assurer que le menu commence replié
        if (sideMenu && mainContainer) {
            sideMenu.classList.remove('expanded');
            mainContainer.classList.remove('menu-expanded');
            
            if (menuOverlay) {
                menuOverlay.classList.remove('active');
            }
        }
        
        // Gestionnaire pour le bouton du menu
        if (menuToggleBtn && !menuToggleBtn.hasAttribute('data-menu-handler')) {
            menuToggleBtn.setAttribute('data-menu-handler', 'true');
            
            menuToggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (sideMenu && mainContainer) {
                    const isExpanded = sideMenu.classList.contains('expanded');
                    
                    // Basculer les classes
                    sideMenu.classList.toggle('expanded', !isExpanded);
                    mainContainer.classList.toggle('menu-expanded', !isExpanded);
                    
                    if (menuOverlay) {
                        menuOverlay.classList.toggle('active', !isExpanded);
                    }
                }
            });
        }
        
        // Gestionnaire pour le clic sur l'overlay
        if (menuOverlay && !menuOverlay.hasAttribute('data-menu-handler')) {
            menuOverlay.setAttribute('data-menu-handler', 'true');
            
            menuOverlay.addEventListener('click', () => {
                if (sideMenu && mainContainer) {
                    sideMenu.classList.remove('expanded');
                    mainContainer.classList.remove('menu-expanded');
                    menuOverlay.classList.remove('active');
                }
            });
        }
    },
    
    /**
     * Optimise la gestion des menus utilisateur
     */
    initUserProfileMenu() {
        const userProfile = document.querySelector('.user-profile-button');
        const userDropdown = document.querySelector('.user-dropdown');
        
        if (userProfile && userDropdown && !userProfile.hasAttribute('data-menu-handler')) {
            userProfile.setAttribute('data-menu-handler', 'true');
            
            // Au clic, alterne l'affichage du menu
            userProfile.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
            });
            
            // Éviter la fermeture en cliquant sur le menu
            userDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            
            // Cacher au clic en dehors
            document.addEventListener('click', () => {
                userDropdown.classList.remove('show');
            });
            
            // Maintenir ouvert au survol
            userProfile.addEventListener('mouseenter', () => {
                userDropdown.classList.add('show');
            });
            
            // Délai avant fermeture pour éviter fermeture prématurée
            let timeoutId;
            userProfile.addEventListener('mouseleave', () => {
                timeoutId = setTimeout(() => {
                    if (!userDropdown.matches(':hover')) {
                        userDropdown.classList.remove('show');
                    }
                }, 300);
            });
            
            userDropdown.addEventListener('mouseenter', () => {
                clearTimeout(timeoutId);
            });
            
            userDropdown.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    if (!userProfile.matches(':hover')) {
                        userDropdown.classList.remove('show');
                    }
                }, 300);
            });
        }
    },
    
    /**
     * Optimise la jointure des réunions Teams
     */
    setupDirectTeamsJoin() {
        this.fixJoinButtons();
    },
    
    /**
     * Fixe les boutons de jointure Teams
     */
    fixJoinButtons() {
        // Traiter les boutons existants
        const meetingItems = document.querySelectorAll('.meeting-item');
        meetingItems.forEach(meetingItem => {
            const isTeamsMeeting = meetingItem.hasAttribute('data-is-teams') ? 
                meetingItem.getAttribute('data-is-teams') === 'true' : 
                meetingItem.querySelector('.meeting-join-btn') !== null;
            
            // Obtenir ou créer un bouton de jointure
            let joinButton = meetingItem.querySelector('.meeting-join-btn');
            
            // Si ce n'est pas une réunion Teams, supprimer le bouton
            if (!isTeamsMeeting) {
                if (joinButton) {
                    joinButton.remove();
                }
                return;
            }
            
            // Si le bouton n'existe pas mais devrait exister, le créer
            if (!joinButton && isTeamsMeeting) {
                joinButton = document.createElement('button');
                joinButton.className = 'meeting-join-btn';
                joinButton.innerHTML = '<i class="fas fa-video"></i> Rejoindre';
                meetingItem.appendChild(joinButton);
            }
            
            // Obtenir l'URL de jointure
            const joinUrl = meetingItem.getAttribute('data-url');
            const meetingId = meetingItem.getAttribute('data-id');
            
            // S'assurer que le bouton a les données appropriées
            if (joinUrl) {
                joinButton.setAttribute('data-url', joinUrl);
            } else if (meetingId) {
                joinButton.setAttribute('data-meeting-id', meetingId);
            }
            
            // Uniquement si le bouton n'a pas déjà un gestionnaire
            if (!joinButton.hasAttribute('data-join-handler')) {
                joinButton.setAttribute('data-join-handler', 'true');
                
                // Ajouter un gestionnaire d'événements
                joinButton.addEventListener('click', this.joinMeetingHandler);
            }
        });
        
        // Bouton principal de jointure
        const mainJoinButton = document.getElementById('joinMeetingBtn');
        if (mainJoinButton && !mainJoinButton.hasAttribute('data-join-handler')) {
            mainJoinButton.setAttribute('data-join-handler', 'true');
            
            mainJoinButton.addEventListener('click', () => {
                const meetingIdInput = document.getElementById('meeting-id') || 
                                      document.getElementById('meetingIdInput');
                if (meetingIdInput && meetingIdInput.value) {
                    if (window.JoinSystem) {
                        window.JoinSystem.joinMeetingWithId();
                    } else {
                        // Fallback basique
                        const teamsUrl = `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${meetingIdInput.value}%40thread.v2/0`;
                        window.open(teamsUrl, '_blank');
                    }
                } else {
                    this.showToast("Veuillez entrer l'ID de la réunion", "warning");
                }
            });
        }
    },
    
    /**
     * Gestionnaire d'événement pour la jointure des réunions
     */
    joinMeetingHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Vérifier si le processus de jointure est déjà en cours
        if (window.JoinSystem && window.JoinSystem.isJoining) {
            console.log("Jointure déjà en cours, ignorer ce clic");
            return;
        }
        
        // Désactiver temporairement le bouton pour éviter les clics multiples
        this.disabled = true;
        
        // Récupérer l'URL depuis le bouton ou le parent
        const buttonUrl = this.getAttribute('data-url');
        const buttonMeetingId = this.getAttribute('data-meeting-id') || 
                               this.parentElement.getAttribute('data-id');
        
        if (buttonUrl) {
            // URL directe disponible, l'ouvrir
            console.log("Opening Teams meeting URL:", buttonUrl);
            window.open(buttonUrl, '_blank');
            
            // Réactiver le bouton après un délai
            setTimeout(() => {
                this.disabled = false;
            }, 2000);
        } else if (buttonMeetingId) {
            // Utiliser le système de jointure avec l'ID
            if (window.JoinSystem) {
                console.log("Using JoinSystem with ID:", buttonMeetingId);
                // Définir l'ID dans le champ d'entrée
                const meetingIdInput = document.getElementById('meeting-id') || 
                                    document.getElementById('meetingIdInput');
                if (meetingIdInput) {
                    meetingIdInput.value = buttonMeetingId;
                    
                    // Déclencher la fonction de jointure
                    window.JoinSystem.joinMeetingWithId();
                    
                    // Le JoinSystem gère sa propre réactivation
                } else {
                    console.error("Meeting ID input field not found");
                    alert("Erreur: Champ d'ID de réunion introuvable.");
                    this.disabled = false;
                }
            } else {
                // Fallback si JoinSystem n'est pas disponible
                console.error("Join system not available, using fallback");
                const teamsUrl = `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${buttonMeetingId}%40thread.v2/0`;
                window.open(teamsUrl, '_blank');
                
                // Réactiver le bouton après un délai
                setTimeout(() => {
                    this.disabled = false;
                }, 2000);
            }
        } else {
            console.error("No join URL or meeting ID found");
            alert("Impossible de rejoindre cette réunion: URL ou ID manquant.");
            this.disabled = false;
        }
    },
    
    /**
     * Masque les informations de synchronisation qui peuvent encombrer l'interface
     */
    hideSyncInfo() {
        // Fonction pour vérifier si un élément contient un texte lié à la synchronisation
        function containsSyncText(element) {
            if (!element || !element.textContent) return false;
            
            const text = element.textContent.toLowerCase();
            return text.includes('dernière') || 
                   text.includes('synchro') || 
                   text.includes('mise à jour');
        }
        
        // Masquer un élément
        function hideElement(element) {
            if (!element) return;
            
            element.style.display = 'none';
            element.style.visibility = 'hidden';
            element.style.height = '0';
            element.style.overflow = 'hidden';
            element.style.opacity = '0';
        }
        
        // Sélecteurs connus pour les infos de synchronisation
        const syncSelectors = [
            '[id*="synchro"]', '[class*="synchro"]', '.sync-info', '.last-sync',
            'div[class*="derniere"]', 'span[class*="derniere"]', '#last-sync-time'
        ];
        
        // Masquer les éléments correspondants
        syncSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    hideElement(element);
                });
            } catch (e) {
                // Ignorer les erreurs
            }
        });
        
        // Rechercher par contenu textuel
        try {
            const allElements = document.querySelectorAll('*');
            allElements.forEach(element => {
                if (containsSyncText(element)) {
                    hideElement(element);
                }
            });
        } catch (e) {
            // Ignorer les erreurs
        }
    },
    
    /**
     * Ajoute des correctifs spécifiques pour certains navigateurs
     */
    addBrowserSpecificFixes() {
        // Détection du navigateur
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isSafari || isMobile) {
            // Correctifs pour Safari / Mobile
            this.addStylesheet(`
                /* Correctifs pour Safari et Mobile */
                .rooms-section {
                    -webkit-backdrop-filter: blur(15px) !important;
                }
                
                .rooms-overlay {
                    -webkit-backdrop-filter: blur(5px) !important;
                }
                
                /* Amélioration du tap sur mobile */
                button, .room-card, .menu-item, .meeting-join-btn {
                    touch-action: manipulation !important;
                }
                
                /* Éviter le zoom sur les champs texte (mobile) */
                input[type="text"], input[type="password"], input[type="email"], input[type="number"] {
                    font-size: 16px !important;
                }
            `, 'browser-specific-styles');
        }
    },
    
    /**
     * Initialise les boutons globaux (refresh, plein écran, etc.)
     */
    initGlobalButtons() {
        // Bouton de rafraîchissement
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn && !refreshBtn.hasAttribute('data-handler')) {
            refreshBtn.setAttribute('data-handler', 'true');
            
            refreshBtn.addEventListener('click', () => {
                // Afficher une animation de rotation
                const icon = refreshBtn.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-spin');
                    setTimeout(() => {
                        icon.classList.remove('fa-spin');
                    }, 1000);
                }
                
                // Rafraîchir les réunions si la fonction est disponible
                if (typeof window.fetchMeetings === 'function') {
                    window.fetchMeetings(true);
                    this.showToast("Réunions rafraîchies", "success");
                } else {
                    this.showToast("Impossible de rafraîchir les réunions", "error");
                }
            });
        }
        
        // Bouton de création de réunion
        const createMeetingBtn = document.getElementById('createMeetingBtn');
        if (createMeetingBtn && !createMeetingBtn.hasAttribute('data-handler')) {
            createMeetingBtn.setAttribute('data-handler', 'true');
            
            createMeetingBtn.addEventListener('click', () => {
                // Tenter d'ouvrir le modal de réservation
                if (window.BookingSystem) {
                    window.BookingSystem.openModal();
                } else {
                    const bookingModal = document.getElementById('bookingModal');
                    if (bookingModal) {
                        bookingModal.style.display = 'flex';
                    } else {
                        this.showToast("Fonctionnalité non disponible", "error");
                    }
                }
            });
        }
        
        // Bouton de plein écran
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn && !fullscreenBtn.hasAttribute('data-handler')) {
            fullscreenBtn.setAttribute('data-handler', 'true');
            
            fullscreenBtn.addEventListener('click', () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => {
                        this.showToast("Erreur lors du passage en plein écran", "error");
                    });
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    }
                }
            });
            
            // Mettre à jour l'icône selon l'état du plein écran
            document.addEventListener('fullscreenchange', () => {
                fullscreenBtn.innerHTML = document.fullscreenElement
                    ? '<i class="fas fa-compress"></i> Quitter'
                    : '<i class="fas fa-expand"></i> Plein écran';
            });
        }
        
        // Bouton d'aide
        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn && !helpBtn.hasAttribute('data-handler')) {
            helpBtn.setAttribute('data-handler', 'true');
            
            helpBtn.addEventListener('click', () => {
                this.showHelpModal();
            });
        }
    },
    
    /**
     * Affiche un modal d'aide
     */
    showHelpModal() {
        // Supprimer un modal existant s'il y en a un
        const existingModal = document.querySelector('.help-modal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }
        
        // Créer le modal d'aide
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
                        <i class="fas fa-sync-alt"></i> Actualisation
                    </h3>
                    <p>
                        Les réunions se rafraîchissent automatiquement toutes les 10 secondes.
                        Pour forcer une actualisation, cliquez sur le bouton <strong>"Rafraîchir"</strong> en bas.
                    </p>
                </div>
            </div>
        `;
        
        // Ajouter au document
        document.body.appendChild(helpModal);
        
        // Gérer la fermeture
        document.getElementById('closeHelpBtn').addEventListener('click', () => {
            document.body.removeChild(helpModal);
        });
        
        // Fermer en cliquant en dehors
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                document.body.removeChild(helpModal);
            }
        });
    },
    
    /**
     * Affiche un toast de notification
     */
    showToast(message, type = 'info', duration = 3000) {
        // Supprimer les toasts existants
        const existingToasts = document.querySelectorAll('.toast-notification');
        existingToasts.forEach(toast => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
        
        // Créer le toast
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: rgba(40, 40, 40, 0.9);
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 10px;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
            border-left: 4px solid;
        `;
        
        // Définir la couleur de la bordure selon le type
        switch (type) {
            case 'success':
                toast.style.borderLeftColor = '#28a745';
                break;
            case 'error':
                toast.style.borderLeftColor = '#dc3545';
                break;
            case 'warning':
                toast.style.borderLeftColor = '#ffc107';
                break;
            default:
                toast.style.borderLeftColor = '#17a2b8';
        }
        
        // Ajouter l'icône selon le type
        let icon;
        switch (type) {
            case 'success':
                icon = 'check-circle';
                break;
            case 'error':
                icon = 'exclamation-circle';
                break;
            case 'warning':
                icon = 'exclamation-triangle';
                break;
            default:
                icon = 'info-circle';
        }
        
        toast.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
        
        // Ajouter au document
        document.body.appendChild(toast);
        
        // Animation d'entrée
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);
        
        // Masquer après la durée spécifiée
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            
            // Supprimer après l'animation
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    },
    
    /**
     * Affiche un toast de succès (plus discret)
     */
    showSuccessToast(message, duration = 3000) {
        this.showToast(message, 'success', duration);
    }
};

// Initialiser l'interface au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    InterfaceSystem.init();
});

// Exposer l'objet pour une utilisation globale
window.InterfaceSystem = InterfaceSystem;
