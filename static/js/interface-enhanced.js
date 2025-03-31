/**
 * interface-enhanced.js
 * Solution unifiée, robuste et bien organisée pour l'interface de l'application Salles de Réunion
 * 
 * Cette version résout les problèmes suivants:
 * 1. Conflits entre scripts d'optimisation
 * 2. Duplication et dysfonctionnement des boutons "Afficher les salles"
 * 3. Bugs lors de l'annulation de création de réunions
 * 4. Masquage inapproprié des informations de synchronisation
 * 5. Problèmes de fluidité générale
 */

// Système unifié d'interface
const EnhancedInterface = {
    // Configuration et état
    config: {
        debug: false,                    // Mode debug pour les logs détaillés
        showSyncInfo: true,              // Afficher les informations de synchro
        enableRoomsGrid: true,           // Utiliser l'affichage en grille pour les salles
        enableTeamsDirectJoin: true,     // Utiliser la jointure directe pour Teams
        autoUpdateInterval: 15000,       // Intervalle de mise à jour auto (en ms)
        buttonsTheme: "gradient",        // Thème des boutons (flat, gradient)
        animationsEnabled: true          // Activer les animations
    },
    
    // État de l'interface
    state: {
        menuExpanded: false,              // État du menu latéral
        roomsVisible: false,              // Visibilité de la section des salles
        isJoiningMeeting: false,          // En cours de jointure d'une réunion
        isCreatingMeeting: false,         // En cours de création d'une réunion
        isInitialized: false,             // Interface initialisée
        lastDOMSize: 0,                   // Pour suivre les changements du DOM
        recentMeetingIds: [],             // IDs de réunion récemment utilisés
        lastRefreshTime: new Date()       // Dernière mise à jour
    },
    
    // References aux éléments DOM fréquemment utilisés
    elements: {
        roomsSection: null,
        roomsToggleButtons: [],
        menuToggle: null,
        sideMenu: null,
        mainContainer: null,
        meetingIdField: null,
        joinButton: null,
        meetingsContainer: null,
        meetingsList: null,
        createMeetingButton: null,
        bookingModal: null
    },
    
    /**
     * Point d'entrée principal - Initialise l'interface améliorée
     */
    init() {
        // Éviter les initialisations multiples
        if (this.state.isInitialized) {
            if (this.config.debug) console.log("Interface déjà initialisée, mise à jour uniquement");
            this.update();
            return;
        }
        
        console.log("✨ Initialisation de l'interface améliorée");
        
        try {
            // Charger les références aux éléments du DOM
            this.cacheElements();
            
            // Initialiser les composants principaux dans un ordre précis
            this.initMenuSystem();           // 1. Menu latéral
            this.initMeetingsDisplay();      // 2. Affichage des réunions
            this.initRoomsSystem();          // 3. Système de salles
            this.initTeamsJoinSystem();      // 4. Jointure aux réunions Teams
            this.initCreateMeetingSystem();  // 5. Création de réunions
            this.initSyncSystem();           // 6. Gestion de la synchronisation
            
            // Observer les changements importants du DOM
            this.initDOMObserver();
            
            // Marquer comme initialisé
            this.state.isInitialized = true;
            this.state.lastRefreshTime = new Date();
            console.log("✅ Interface améliorée initialisée avec succès");
            
            // Premier rafraîchissement des données
            this.refreshData();
            
            // Afficher un message de confirmation
            this.showToast("Interface optimisée chargée", "success");
        } catch (error) {
            console.error("❌ Erreur lors de l'initialisation de l'interface:", error);
            
            // Tenter de rétablir une interface fonctionnelle
            this.attemptRecovery();
        }
    },
    
    /**
     * Met à jour l'interface existante
     */
    update() {
        // Appliquer uniquement les fixes critiques sans réinitialiser
        this.fixRoomsButtonsDisplay();
        this.fixSyncInfoDisplay();
        this.fixCreateMeetingModal();
        this.refreshData();
    },
    
    /**
     * Tente de rétablir une interface fonctionnelle en cas d'erreur
     */
    attemptRecovery() {
        console.log("🔄 Tentative de récupération de l'interface...");
        
        // Réappliquer les styles de base
        this.applyBaseStyles();
        
        // Corriger les éléments critiques
        this.fixRoomsButtonsDisplay();
        this.fixCreateMeetingModal();
        
        // Réactiver l'affichage des informations de synchronisation
        this.fixSyncInfoDisplay();
        
        console.log("🔄 Récupération terminée - Interface basique rétablie");
        this.showToast("Interface restaurée en mode basique", "warning");
    },
    
    /**
     * Cache les références aux éléments du DOM pour améliorer les performances
     */
    cacheElements() {
        // Section des salles
        this.elements.roomsSection = document.querySelector('.rooms-section');
        
        // Boutons d'affichage des salles
        this.elements.roomsToggleButtons = Array.from(document.querySelectorAll(
            '#toggleRoomsBtn, #showRoomsBtn, .toggle-rooms-button, .rooms-toggle-button-floating'
        ));
        
        // Éléments du menu
        this.elements.menuToggle = document.querySelector('.menu-toggle-visible');
        this.elements.sideMenu = document.querySelector('.side-menu');
        this.elements.mainContainer = document.querySelector('.main-container');
        
        // Éléments de jointure de réunion
        this.elements.meetingIdField = document.getElementById('meeting-id') || document.getElementById('meetingIdInput');
        this.elements.joinButton = document.getElementById('joinMeetingBtn');
        
        // Éléments d'affichage des réunions
        this.elements.meetingsContainer = document.querySelector('.meetings-container');
        this.elements.meetingsList = document.querySelector('.meetings-list');
        
        // Éléments de création de réunion
        this.elements.createMeetingButton = document.querySelector('.create-meeting-integrated') || 
                                           document.getElementById('createMeetingBtn');
        this.elements.bookingModal = document.getElementById('bookingModal');
        
        if (this.config.debug) {
            console.log("Éléments DOM cachés:", {
                roomsSection: !!this.elements.roomsSection,
                roomsToggleButtons: this.elements.roomsToggleButtons.length,
                menuToggle: !!this.elements.menuToggle,
                sideMenu: !!this.elements.sideMenu,
                mainContainer: !!this.elements.mainContainer,
                meetingIdField: !!this.elements.meetingIdField,
                joinButton: !!this.elements.joinButton,
                meetingsContainer: !!this.elements.meetingsContainer,
                meetingsList: !!this.elements.meetingsList,
                createMeetingButton: !!this.elements.createMeetingButton,
                bookingModal: !!this.elements.bookingModal
            });
        }
    },
    
    /**
     * Initialise le système du menu latéral
     */
    initMenuSystem() {
        if (this.config.debug) console.log("Initialisation du système de menu");
        
        const { menuToggle, sideMenu, mainContainer } = this.elements;
        
        // Vérifier si les éléments nécessaires sont présents
        if (!menuToggle || !sideMenu || !mainContainer) {
            console.warn("Éléments du menu non trouvés, initialisation du menu ignorée");
            return;
        }
        
        // S'assurer que le menu commence replié par défaut
        sideMenu.classList.remove('expanded');
        mainContainer.classList.remove('menu-expanded');
        this.state.menuExpanded = false;
        
        // Supprimer les gestionnaires d'événements existants
        const newMenuToggle = menuToggle.cloneNode(true);
        menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);
        this.elements.menuToggle = newMenuToggle;
        
        // Ajouter le nouveau gestionnaire
        newMenuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMenu();
        });
        
        // Fermer le menu au clic en dehors sur mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                this.state.menuExpanded && 
                !sideMenu.contains(e.target) && 
                e.target !== menuToggle) {
                this.closeMenu();
            }
        });
        
        // Ajouter un overlay pour mobile si nécessaire
        this.ensureMenuOverlay();
    },
    
    /**
     * Ouvre ou ferme le menu latéral
     */
    toggleMenu() {
        const { sideMenu, mainContainer } = this.elements;
        const menuOverlay = document.querySelector('.menu-overlay');
        
        this.state.menuExpanded = !this.state.menuExpanded;
        
        sideMenu.classList.toggle('expanded', this.state.menuExpanded);
        mainContainer.classList.toggle('menu-expanded', this.state.menuExpanded);
        
        if (menuOverlay) {
            menuOverlay.classList.toggle('active', this.state.menuExpanded);
        }
        
        if (this.config.debug) console.log(`Menu ${this.state.menuExpanded ? 'ouvert' : 'fermé'}`);
    },
    
    /**
     * Ferme le menu latéral
     */
    closeMenu() {
        const { sideMenu, mainContainer } = this.elements;
        const menuOverlay = document.querySelector('.menu-overlay');
        
        if (this.state.menuExpanded) {
            this.state.menuExpanded = false;
            sideMenu.classList.remove('expanded');
            mainContainer.classList.remove('menu-expanded');
            
            if (menuOverlay) {
                menuOverlay.classList.remove('active');
            }
            
            if (this.config.debug) console.log("Menu fermé");
        }
    },
    
    /**
     * S'assure que l'overlay du menu est présent pour les appareils mobiles
     */
    ensureMenuOverlay() {
        if (!document.querySelector('.menu-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'menu-overlay';
            document.body.appendChild(overlay);
            
            overlay.addEventListener('click', () => {
                this.closeMenu();
            });
        }
    },
    
    /**
     * Initialise le système d'affichage des réunions
     */
    initMeetingsDisplay() {
        if (this.config.debug) console.log("Initialisation du système d'affichage des réunions");
        
        // Améliorer l'apparence du conteneur de réunions
        if (this.elements.meetingsContainer) {
            this.applyMeetingsStyles();
        }
        
        // Observer les modifications des éléments de réunion pour gérer les boutons de jointure
        if (this.elements.meetingsList) {
            this.initMeetingsObserver();
        }
        
        // Corriger le bouton de création de réunion
        if (this.elements.createMeetingButton) {
            this.setupCreateMeetingButton();
        }
    },
    
    /**
     * Applique les styles optimisés au conteneur de réunions
     */
    applyMeetingsStyles() {
        // Ajouter des styles optimisés
        this.addStylesheet(`
            /* Conteneur principal des réunions */
            .meetings-container {
                background-color: rgba(30, 30, 30, 0.6) !important;
                backdrop-filter: blur(10px) !important;
                border-radius: 15px !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                margin-bottom: 100px !important;
                overflow: visible !important;
                width: 95% !important;
                max-width: 1000px !important;
                margin-left: auto !important;
                margin-right: auto !important;
                transition: all 0.3s ease !important;
            }
            
            /* En-tête des réunions */
            .meetings-title-bar {
                background: rgba(40, 40, 40, 0.4) !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                border-radius: 15px 15px 0 0 !important;
                padding: 15px !important;
            }
            
            /* Conteneur des réunions avec scroll */
            .meetings-list {
                max-height: calc(100vh - 250px) !important;
                overflow-y: auto !important;
                padding: 15px !important;
                padding-top: 5px !important;
                scrollbar-width: thin !important;
            }
            
            /* Éléments de réunion */
            .meeting-item {
                background-color: rgba(45, 45, 45, 0.5) !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                border-radius: 10px !important;
                padding: 12px !important;
                margin-bottom: 12px !important;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1) !important;
                transition: transform 0.2s ease, box-shadow 0.2s ease !important;
                position: relative !important;
            }
            
            .meeting-item:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15) !important;
                background-color: rgba(55, 55, 55, 0.6) !important;
            }
            
            /* Zone d'entrée d'ID de réunion */
            .meeting-id-entry {
                background-color: rgba(40, 40, 40, 0.4) !important;
                border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
                border-bottom-left-radius: 15px !important;
                border-bottom-right-radius: 15px !important;
                padding: 15px !important;
                margin-bottom: 20px !important;
            }
            
            /* Bouton de jointure */
            .meeting-join-btn {
                position: relative !important;
                z-index: 5 !important;
                background: linear-gradient(to right, var(--primary-color), var(--primary-color-light)) !important;
                color: white !important;
                border: none !important;
                border-radius: var(--border-radius-sm) !important;
                padding: 6px 12px !important;
                font-size: 0.9rem !important;
                font-weight: bold !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
            }
            
            .meeting-join-btn:hover:not(:disabled) {
                transform: translateY(-2px) !important;
                box-shadow: 0 4px 10px rgba(98, 100, 167, 0.4) !important;
            }
            
            /* Champ d'ID et bouton */
            #meeting-id, .meeting-id-input {
                background: rgba(30, 30, 30, 0.6) !important;
                color: white !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 6px 0 0 6px !important;
                padding: 8px 12px !important;
            }
            
            #joinMeetingBtn, .join-meeting-btn {
                background: linear-gradient(to right, #6264A7, #7B83EB) !important;
                color: white !important;
                border: none !important;
                border-radius: 0 6px 6px 0 !important;
                padding: 8px 15px !important;
                font-weight: 500 !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
            }
            
            #joinMeetingBtn:hover:not(:disabled), .join-meeting-btn:hover:not(:disabled) {
                background: linear-gradient(to right, #7B83EB, #8A92F0) !important;
                box-shadow: 0 2px 8px rgba(98, 100, 167, 0.4) !important;
            }
        `, 'enhanced-meetings-styles');
        
        // Ajouter un bouton de rafraîchissement dans la barre de titre si nécessaire
        this.addRefreshButton();
    },
    
    /**
     * Initialise l'observateur pour les éléments de réunion
     * afin de garantir un fonctionnement correct des boutons de jointure
     */
    initMeetingsObserver() {
        // Observer les modifications du conteneur des réunions
        const observer = new MutationObserver((mutations) => {
            let needsUpdate = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    needsUpdate = true;
                }
            });
            
            if (needsUpdate) {
                // Mettre à jour les boutons de jointure
                setTimeout(() => this.fixMeetingJoinButtons(), 100);
                
                // Mettre à jour les informations de synchronisation
                setTimeout(() => this.updateSyncInfo(), 200);
            }
        });
        
        // Démarrer l'observation
        observer.observe(this.elements.meetingsList, {
            childList: true,
            subtree: true
        });
        
        // Fixer les boutons existants
        this.fixMeetingJoinButtons();
    },
    
    /**
     * Corrige les boutons de jointure dans les éléments de réunion
     */
    fixMeetingJoinButtons() {
        const meetingItems = document.querySelectorAll('.meeting-item');
        
        meetingItems.forEach(item => {
            // Déterminer s'il s'agit d'une réunion Teams (en vérifiant l'attribut data-is-teams ou data-url)
            const isTeamsMeeting = 
                item.hasAttribute('data-is-teams') ? item.getAttribute('data-is-teams') === 'true' : 
                item.hasAttribute('data-url') || item.hasAttribute('data-id');
            
            // Obtenir le bouton existant
            let joinButton = item.querySelector('.meeting-join-btn');
            
            // Si ce n'est pas une réunion Teams, supprimer le bouton
            if (!isTeamsMeeting) {
                if (joinButton) joinButton.remove();
                return;
            }
            
            // Si c'est une réunion Teams mais qu'il n'y a pas de bouton, le créer
            if (!joinButton) {
                joinButton = document.createElement('button');
                joinButton.className = 'meeting-join-btn';
                joinButton.innerHTML = '<i class="fas fa-video"></i> Rejoindre';
                item.appendChild(joinButton);
            }
            
            // Copier les données de l'élément parent vers le bouton
            const joinUrl = item.getAttribute('data-url');
            const meetingId = item.getAttribute('data-id');
            
            if (joinUrl) joinButton.setAttribute('data-url', joinUrl);
            if (meetingId) joinButton.setAttribute('data-meeting-id', meetingId);
            
            // Remplacer le bouton pour supprimer les gestionnaires d'événements existants
            if (!joinButton.hasAttribute('data-enhanced')) {
                const newJoinButton = joinButton.cloneNode(true);
                newJoinButton.setAttribute('data-enhanced', 'true');
                joinButton.parentNode.replaceChild(newJoinButton, joinButton);
                
                // Ajouter le nouveau gestionnaire d'événement
                newJoinButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.joinMeeting(newJoinButton);
                });
            }
        });
    },
    
    /**
     * Configure le bouton de création de réunion
     */
    setupCreateMeetingButton() {
        const button = this.elements.createMeetingButton;
        
        // Remplacer pour supprimer les gestionnaires existants
        if (!button.hasAttribute('data-enhanced')) {
            const newButton = button.cloneNode(true);
            newButton.setAttribute('data-enhanced', 'true');
            button.parentNode.replaceChild(newButton, button);
            this.elements.createMeetingButton = newButton;
            
            // Ajouter le nouveau gestionnaire
            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openCreateMeetingModal();
            });
        }
    },
    
    /**
     * Ajoute un bouton de rafraîchissement à la barre de titre des réunions
     */
    addRefreshButton() {
        const titleBar = document.querySelector('.meetings-title-bar');
        if (!titleBar || document.querySelector('.refresh-meetings-btn')) return;
        
        // Créer le bouton de rafraîchissement
        const refreshButton = document.createElement('button');
        refreshButton.className = 'refresh-meetings-btn';
        refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i>';
        refreshButton.title = "Rafraîchir les réunions";
        refreshButton.style.cssText = `
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        // Ajouter des effets
        refreshButton.addEventListener('mouseover', function() {
            this.style.background = 'rgba(255, 255, 255, 0.2)';
        });
        
        refreshButton.addEventListener('mouseout', function() {
            this.style.background = 'rgba(255, 255, 255, 0.1)';
        });
        
        // Ajouter l'événement de rafraîchissement
        refreshButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Ajouter une animation de rotation
            refreshButton.querySelector('i').classList.add('fa-spin');
            
            // Rafraîchir les données
            this.refreshData();
            
            // Arrêter l'animation après 1 seconde
            setTimeout(() => {
                refreshButton.querySelector('i').classList.remove('fa-spin');
            }, 1000);
        });
        
        // Ajouter à la barre de titre
        titleBar.style.position = 'relative';
        titleBar.appendChild(refreshButton);
    },
    
    /**
     * Initialise le système de gestion des salles
     */
    initRoomsSystem() {
        if (this.config.debug) console.log("Initialisation du système de salles");
        
        // Créer la section des salles si elle n'existe pas
        this.ensureRoomsSection();
        
        // Configurer les boutons d'affichage des salles
        this.setupRoomsButtons();
        
        // Mettre à jour l'affichage des salles
        this.updateRoomsDisplay();
        
        // Appliquer les styles de grille si activé
        if (this.config.enableRoomsGrid) {
            this.applyRoomsGridStyles();
        }
    },
    
    /**
     * S'assure que la section des salles existe dans le DOM
     */
    ensureRoomsSection() {
        // Vérifier si la section existe déjà
        let roomsSection = document.querySelector('.rooms-section');
        
        if (!roomsSection) {
            // Créer la section
            roomsSection = document.createElement('div');
            roomsSection.className = 'rooms-section';
            
            // Ajouter le titre
            const title = document.createElement('h3');
            title.className = 'rooms-section-title';
            title.innerHTML = '<i class="fas fa-door-open"></i> Salles disponibles';
            roomsSection.appendChild(title);
            
            // Ajouter le bouton de fermeture
            const closeButton = document.createElement('button');
            closeButton.className = 'rooms-section-close';
            closeButton.innerHTML = '&times;';
            closeButton.addEventListener('click', () => this.hideRooms());
            roomsSection.appendChild(closeButton);
            
            // Créer le conteneur des salles
            const roomsContainer = document.createElement('div');
            roomsContainer.className = 'rooms';
            roomsSection.appendChild(roomsContainer);
            
            // Ajouter au body
            document.body.appendChild(roomsSection);
            
            // Mettre à jour la référence
            this.elements.roomsSection = roomsSection;
        }
        
        // S'assurer que l'overlay existe
        this.ensureRoomsOverlay();
    },
    
    /**
     * S'assure que l'overlay des salles existe
     */
    ensureRoomsOverlay() {
        if (!document.querySelector('.rooms-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'rooms-overlay';
            
            // Ajouter au DOM
            document.body.appendChild(overlay);
            
            // Ajouter l'événement de fermeture
            overlay.addEventListener('click', () => {
                this.hideRooms();
            });
        }
    },
    
    /**
     * Configure les boutons d'affichage des salles
     */
    setupRoomsButtons() {
        const buttons = this.elements.roomsToggleButtons;
        
        buttons.forEach(button => {
            // Remplacer pour supprimer les gestionnaires existants
            if (!button.hasAttribute('data-enhanced')) {
                const newButton = button.cloneNode(true);
                newButton.setAttribute('data-enhanced', 'true');
                
                if (button.parentNode) {
                    button.parentNode.replaceChild(newButton, button);
                }
                
                // Ajouter le nouveau gestionnaire
                newButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleRooms();
                });
            }
        });
        
        // Mettre à jour les textes des boutons
        this.updateRoomsButtonsText();
    },
    
    /**
     * Bascule l'affichage des salles
     */
    toggleRooms() {
        if (this.state.roomsVisible) {
            this.hideRooms();
        } else {
            this.showRooms();
        }
    },
    
    /**
     * Affiche la section des salles
     */
    showRooms() {
        if (this.config.debug) console.log("Affichage des salles");
        
        // Mettre à jour l'état
        this.state.roomsVisible = true;
        
        // Mettre à jour l'affichage
        this.updateRoomsDisplay();
        
        // Afficher la section
        const roomsSection = this.elements.roomsSection || document.querySelector('.rooms-section');
        const roomsOverlay = document.querySelector('.rooms-overlay');
        
        if (roomsSection) {
            roomsSection.classList.add('visible');
            roomsSection.style.display = 'block';
        }
        
        if (roomsOverlay) {
            roomsOverlay.classList.add('visible');
        }
        
        // Mettre à jour les textes des boutons
        this.updateRoomsButtonsText();
    },
    
    /**
     * Masque la section des salles
     */
    hideRooms() {
        if (this.config.debug) console.log("Masquage des salles");
        
        // Mettre à jour l'état
        this.state.roomsVisible = false;
        
        // Masquer la section
        const roomsSection = this.elements.roomsSection || document.querySelector('.rooms-section');
        const roomsOverlay = document.querySelector('.rooms-overlay');
        
        if (roomsSection) {
            roomsSection.classList.remove('visible');
        }
        
        if (roomsOverlay) {
            roomsOverlay.classList.remove('visible');
        }
        
        // Mettre à jour les textes des boutons
        this.updateRoomsButtonsText();
    },
    
    /**
     * Met à jour les textes des boutons d'affichage des salles
     */
    updateRoomsButtonsText() {
        const buttons = document.querySelectorAll('.toggle-rooms-button, #toggleRoomsBtn, #showRoomsBtn, .rooms-toggle-button-floating');
        
        const showText = '<i class="fas fa-door-open"></i> Afficher les salles';
        const hideText = '<i class="fas fa-times"></i> Masquer les salles';
        
        buttons.forEach(button => {
            if (button) {
                if (this.state.roomsVisible) {
                    button.innerHTML = hideText;
                } else {
                    button.innerHTML = showText;
                }
            }
        });
    },
    
    /**
     * Applique les styles de grille optimisés pour les salles
     */
    applyRoomsGridStyles() {
        // Ajouter les styles de grille
        this.addStylesheet(`
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
        `, 'enhanced-rooms-grid-styles');
    },
    
    /**
     * Met à jour l'affichage des salles avec les données actuelles
     */
    updateRoomsDisplay() {
        // Vérifier si la section existe
        if (!this.elements.roomsSection) {
            this.ensureRoomsSection();
        }
        
        const roomsContainer = document.querySelector('.rooms');
        if (!roomsContainer) return;
        
        // Vider le conteneur
        roomsContainer.innerHTML = '';
        
        // Récupérer les salles depuis la configuration
        let rooms = {};
        if (window.SALLES) {
            // Convertir l'objet en tableau d'objets
            for (const [name, email] of Object.entries(window.SALLES)) {
                rooms[name.toLowerCase()] = {
                    name,
                    email,
                    status: 'available', // État initial
                    currentMeeting: null,
                    nextMeeting: null
                };
            }
        } else {
            // Configuration par défaut
            rooms = {
                'canigou': { name: 'Canigou', email: 'Sallecanigou@anecoop-france.com', status: 'available' },
                'castillet': { name: 'Castillet', email: 'Sallecastillet@anecoop-france.com', status: 'available' },
                'mallorca': { name: 'Mallorca', email: 'Sallemallorca@anecoop-france.com', status: 'available' },
                'tramontane': { name: 'Tramontane', email: 'Salletramontane@anecoop-france.com', status: 'available' }
            };
        }
        
        // Mettre à jour le statut des salles en fonction des réunions
        this.updateRoomStatus(rooms);
        
        // Créer les cartes de salle
        for (const [key, room] of Object.entries(rooms)) {
            const card = document.createElement('div');
            card.className = `room-card ${room.status}`;
            card.dataset.room = key;
            
            // Déterminer le texte de statut et l'icône
            let statusText = 'Disponible';
            let timeText = '';
            
            if (room.status === 'occupied' && room.currentMeeting) {
                statusText = 'Occupée';
                
                // Temps restant
                if (room.remainingTime) {
                    if (room.remainingTime < 60) {
                        timeText = `${room.remainingTime} min`;
                    } else {
                        const hours = Math.floor(room.remainingTime / 60);
                        const minutes = room.remainingTime % 60;
                        timeText = minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
                    }
                }
            } else if (room.status === 'soon' && room.nextMeeting) {
                statusText = 'Bientôt';
                
                if (room.minutesUntilNext) {
                    if (room.minutesUntilNext < 60) {
                        timeText = `Dans ${room.minutesUntilNext} min`;
                    } else {
                        const hours = Math.floor(room.minutesUntilNext / 60);
                        const minutes = room.minutesUntilNext % 60;
                        timeText = minutes > 0 ? `Dans ${hours}h ${minutes}min` : `Dans ${hours}h`;
                    }
                }
            }
            
            // HTML de la carte
            card.innerHTML = `
                <div class="room-name">${room.name}</div>
                <div class="room-status">
                    <span class="status-icon ${room.status}"></span>
                    ${statusText}
                </div>
                ${timeText ? `<div class="room-time">${timeText}</div>` : ''}
            `;
            
            // Ajouter un événement de clic pour ouvrir la page de la salle
            card.addEventListener('click', () => {
                // Rediriger vers la page de la salle
                window.location.href = `/${room.name.toLowerCase()}`;
            });
            
            // Ajouter au conteneur
            roomsContainer.appendChild(card);
        }
        
        if (this.config.debug) console.log(`Affichage mis à jour avec ${Object.keys(rooms).length} salles`);
    },
    
    /**
     * Met à jour le statut des salles en fonction des réunions actuelles
     */
    updateRoomStatus(rooms) {
        // Récupérer les réunions
        let meetings = [];
        try {
            // Essayer différentes sources pour les réunions
            if (typeof previousMeetings !== 'undefined') {
                meetings = JSON.parse(previousMeetings || '[]');
            } else if (window.APP_DATA && window.APP_DATA.meetings) {
                meetings = window.APP_DATA.meetings;
            }
        } catch (e) {
            console.error("Erreur lors de la récupération des réunions:", e);
            meetings = [];
        }
        
        const now = new Date();
        
        // Traiter chaque réunion
        meetings.forEach(meeting => {
            const roomName = (meeting.salle || '').toLowerCase();
            if (rooms[roomName]) {
                const startTime = new Date(meeting.start);
                const endTime = new Date(meeting.end);
                
                // Déterminer le statut de la salle
                if (startTime <= now && endTime > now) {
                    // Réunion en cours
                    rooms[roomName].status = 'occupied';
                    rooms[roomName].currentMeeting = meeting;
                    
                    // Calculer le temps restant
                    const remainingMs = endTime - now;
                    const remainingMinutes = Math.ceil(remainingMs / 60000);
                    rooms[roomName].remainingTime = remainingMinutes;
                } else if (startTime > now) {
                    // Réunion future
                    if (!rooms[roomName].nextMeeting || 
                        startTime < new Date(rooms[roomName].nextMeeting.start)) {
                        rooms[roomName].nextMeeting = meeting;
                        
                        // Si la prochaine réunion commence dans moins de 30 minutes
                        const minutesUntilStart = Math.floor((startTime - now) / 60000);
                        if (minutesUntilStart <= 30) {
                            rooms[roomName].status = 'soon';
                            rooms[roomName].minutesUntilNext = minutesUntilStart;
                        }
                    }
                }
            }
        });
    },
    
    /**
     * Initialise le système de jointure aux réunions Teams
     */
    initTeamsJoinSystem() {
        if (this.config.debug) console.log("Initialisation du système de jointure Teams");
        
        const { meetingIdField, joinButton } = this.elements;
        
        // Configurer le champ d'ID
        if (meetingIdField) {
            // Événement Enter pour rejoindre
            meetingIdField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !this.state.isJoiningMeeting) {
                    e.preventDefault();
                    this.joinMeetingWithId();
                }
            });
            
            // Charger les IDs récents depuis localStorage
            try {
                this.state.recentMeetingIds = JSON.parse(localStorage.getItem('recentMeetingIds') || '[]');
            } catch (e) {
                this.state.recentMeetingIds = [];
            }
        }
        
        // Configurer le bouton principal de jointure
        if (joinButton && !joinButton.hasAttribute('data-enhanced')) {
            const newButton = joinButton.cloneNode(true);
            newButton.setAttribute('data-enhanced', 'true');
            joinButton.parentNode.replaceChild(newButton, joinButton);
            this.elements.joinButton = newButton;
            
            // Ajouter le gestionnaire
            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.joinMeetingWithId();
            });
        }
    },
    
    /**
     * Rejoint une réunion Teams depuis un bouton de réunion
     */
    joinMeeting(button) {
        // Éviter les clics multiples
        if (this.state.isJoiningMeeting) {
            if (this.config.debug) console.log("Jointure déjà en cours, ignorer ce clic");
            return;
        }
        
        this.state.isJoiningMeeting = true;
        
        // Désactiver temporairement le bouton
        button.disabled = true;
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
        
        try {
            // Récupérer l'URL ou l'ID depuis le bouton
            const joinUrl = button.getAttribute('data-url');
            const meetingId = button.getAttribute('data-meeting-id');
            
            if (joinUrl) {
                // URL disponible, l'ouvrir directement
                if (this.config.debug) console.log("Ouverture de l'URL Teams:", joinUrl);
                
                // Différer légèrement l'ouverture pour éviter les blocages
                setTimeout(() => {
                    window.open(joinUrl, '_blank');
                    
                    // Afficher un message de succès
                    this.showToast("Connexion réussie à la réunion Teams", "success");
                }, 500);
            } else if (meetingId) {
                // Utiliser l'ID pour rejoindre
                if (this.config.debug) console.log("Utilisation de l'ID pour rejoindre:", meetingId);
                
                // Tenter d'obtenir l'URL via l'API
                this.lookupMeetingUrl(meetingId)
                    .then(url => {
                        if (url) {
                            // URL trouvée, l'ouvrir
                            setTimeout(() => {
                                window.open(url, '_blank');
                                this.showToast("Connexion réussie à la réunion Teams", "success");
                            }, 500);
                        } else {
                            throw new Error("URL de réunion non trouvée");
                        }
                    })
                    .catch(error => {
                        console.error("Erreur lors de la jointure:", error);
                        this.showToast("Erreur lors de la connexion à la réunion", "error");
                    });
            } else {
                this.showToast("Impossible de rejoindre: informations manquantes", "error");
            }
        } catch (error) {
            console.error("Erreur lors de la jointure:", error);
            this.showToast("Erreur lors de la connexion à la réunion", "error");
        } finally {
            // Réactiver le bouton après un délai
            setTimeout(() => {
                button.disabled = false;
                button.innerHTML = originalText;
                this.state.isJoiningMeeting = false;
            }, 2000);
        }
    },
    
    /**
     * Rejoint une réunion Teams avec l'ID fourni ou depuis le champ d'entrée
     */
    joinMeetingWithId() {
        // Éviter les clics multiples
        if (this.state.isJoiningMeeting) {
            if (this.config.debug) console.log("Jointure déjà en cours, ignorer ce clic");
            return;
        }
        
        const meetingIdField = this.elements.meetingIdField;
        const joinButton = this.elements.joinButton;
        
        if (!meetingIdField) {
            this.showToast("Champ d'ID de réunion introuvable", "error");
            return;
        }
        
        // Obtenir l'ID
        const meetingId = meetingIdField.value.trim();
        if (!meetingId) {
            this.showToast("Veuillez entrer l'ID de la réunion", "warning");
            return;
        }
        
        // Marquer comme en cours de jointure
        this.state.isJoiningMeeting = true;
        
        // Désactiver l'interface
        meetingIdField.disabled = true;
        if (joinButton) {
            joinButton.disabled = true;
            joinButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
        }
        
        // Nettoyer l'ID
        const cleanedId = this.cleanMeetingId(meetingId);
        
        // Sauvegarder dans l'historique
        this.saveRecentMeetingId(meetingId);
        
        // Tenter d'obtenir l'URL via l'API
        this.lookupMeetingUrl(cleanedId)
            .then(url => {
                if (url) {
                    // URL trouvée, l'ouvrir
                    this.showToast("Connexion réussie! Redirection...", "success");
                    setTimeout(() => {
                        window.open(url, '_blank');
                    }, 500);
                } else {
                    // Utiliser l'URL générique
                    this.showToast("Utilisation de l'URL générique Teams...", "warning");
                    const fallbackUrl = `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${cleanedId}%40thread.v2/0`;
                    setTimeout(() => {
                        window.open(fallbackUrl, '_blank');
                    }, 500);
                }
            })
            .catch(error => {
                console.error("Erreur lors de la recherche de l'URL:", error);
                
                // Utiliser l'URL générique en cas d'erreur
                this.showToast("Problème de recherche, utilisation de l'URL générique...", "warning");
                const fallbackUrl = `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${cleanedId}%40thread.v2/0`;
                setTimeout(() => {
                    window.open(fallbackUrl, '_blank');
                }, 500);
            })
            .finally(() => {
                // Réactiver l'interface après un délai
                setTimeout(() => {
                    meetingIdField.disabled = false;
                    if (joinButton) {
                        joinButton.disabled = false;
                        joinButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Rejoindre';
                    }
                    this.state.isJoiningMeeting = false;
                }, 2000);
            });
    },
    
    /**
     * Recherche l'URL d'une réunion via l'API
     */
    async lookupMeetingUrl(meetingId) {
        try {
            const response = await fetch(`/lookupMeeting?meetingId=${encodeURIComponent(meetingId)}`);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data && data.joinUrl) {
                return data.joinUrl;
            }
            
            return null;
        } catch (error) {
            console.error("Erreur lors de la recherche de l'URL:", error);
            return null;
        }
    },
    
    /**
     * Nettoie l'ID de réunion pour le rendre utilisable
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
     * Sauvegarde l'ID de réunion dans l'historique récent
     */
    saveRecentMeetingId(id) {
        if (!id) return;
        
        // Mettre à jour l'état
        if (!this.state.recentMeetingIds.includes(id)) {
            this.state.recentMeetingIds.unshift(id);
            this.state.recentMeetingIds = this.state.recentMeetingIds.slice(0, 5); // Garder les 5 derniers
            
            // Sauvegarder dans localStorage
            localStorage.setItem('recentMeetingIds', JSON.stringify(this.state.recentMeetingIds));
        }
    },
    
    /**
     * Initialise le système de création de réunions
     */
    initCreateMeetingSystem() {
        if (this.config.debug) console.log("Initialisation du système de création de réunions");
        
        // Vérifier si le modal existe
        const bookingModal = this.elements.bookingModal;
        if (!bookingModal) return;
        
        // Fixer les boutons d'annulation
        const cancelButtons = bookingModal.querySelectorAll('.cancel-button, [data-dismiss="modal"]');
        cancelButtons.forEach(button => {
            // Remplacer pour supprimer les gestionnaires existants
            if (!button.hasAttribute('data-enhanced')) {
                const newButton = button.cloneNode(true);
                newButton.setAttribute('data-enhanced', 'true');
                button.parentNode.replaceChild(newButton, button);
                
                // Ajouter le nouveau gestionnaire
                newButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.closeCreateMeetingModal();
                });
            }
        });
        
        // Fixer le bouton de création
        const createButton = bookingModal.querySelector('.create-button, #createMeetingConfirmBtn');
        if (createButton && !createButton.hasAttribute('data-enhanced')) {
            const newButton = createButton.cloneNode(true);
            newButton.setAttribute('data-enhanced', 'true');
            createButton.parentNode.replaceChild(newButton, createButton);
            
            // Conserver le gestionnaire d'événement d'origine
            if (window.BookingSystem && typeof window.BookingSystem.createMeeting === 'function') {
                newButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Appeler la méthode de création de réunion
                    window.BookingSystem.createMeeting();
                    
                    // Fermer le modal après un court délai
                    setTimeout(() => {
                        this.closeCreateMeetingModal();
                    }, 1000);
                });
            }
        }
    },
    
    /**
     * Ouvre le modal de création de réunion
     */
    openCreateMeetingModal() {
        const bookingModal = this.elements.bookingModal;
        if (!bookingModal) return;
        
        // Marquer comme en cours de création
        this.state.isCreatingMeeting = true;
        
        // Utiliser le système existant si disponible
        if (window.BookingSystem && typeof window.BookingSystem.openModal === 'function') {
            window.BookingSystem.openModal();
        } else {
            // Afficher directement
            bookingModal.style.display = 'flex';
        }
    },
    
    /**
     * Ferme le modal de création de réunion
     */
    closeCreateMeetingModal() {
        const bookingModal = this.elements.bookingModal;
        if (!bookingModal) return;
        
        // Ne plus être en cours de création
        this.state.isCreatingMeeting = false;
        
        // Utiliser le système existant si disponible
        if (window.BookingSystem && typeof window.BookingSystem.closeModal === 'function') {
            window.BookingSystem.closeModal();
        } else {
            // Masquer directement
            bookingModal.style.display = 'none';
        }
        
        // Rafraîchir les données après un court délai
        setTimeout(() => this.refreshData(), 1000);
    },
    
    /**
     * Corrige le bug du modal de création de réunion
     */
    fixCreateMeetingModal() {
        // Trouver le modal
        const bookingModal = document.getElementById('bookingModal');
        if (!bookingModal) return;
        
        // Ajouter des styles pour fixer le modal
        this.addStylesheet(`
            /* Correction du modal de réservation */
            #bookingModal {
                z-index: 9999 !important;
                display: none !important;
            }
            
            /* Bouton d'annulation */
            #bookingModal .cancel-button, 
            #bookingModal [data-dismiss="modal"] {
                background-color: rgba(255, 255, 255, 0.2) !important;
                color: white !important;
                border: none !important;
                border-radius: 6px !important;
                padding: 8px 16px !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
            }
            
            #bookingModal .cancel-button:hover, 
            #bookingModal [data-dismiss="modal"]:hover {
                background-color: rgba(255, 255, 255, 0.3) !important;
                transform: translateY(-2px) !important;
            }
            
            /* Bouton de création */
            #bookingModal .create-button,
            #bookingModal #createMeetingConfirmBtn {
                background-color: var(--success-color) !important;
                color: white !important;
                border: none !important;
                border-radius: 6px !important;
                padding: 8px 16px !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
            }
            
            #bookingModal .create-button:hover,
            #bookingModal #createMeetingConfirmBtn:hover {
                background-color: var(--success-color-dark) !important;
                transform: translateY(-2px) !important;
                box-shadow: 0 4px 10px rgba(40, 167, 69, 0.4) !important;
            }
        `, 'booking-modal-fix-styles');
        
        // Corriger les boutons d'annulation
        const cancelButtons = bookingModal.querySelectorAll('.cancel-button, [data-dismiss="modal"]');
        cancelButtons.forEach(button => {
            if (!button.hasAttribute('data-enhanced')) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Masquer le modal
                    bookingModal.style.display = 'none';
                    
                    // Rafraîchir les données
                    setTimeout(() => this.refreshData(), 1000);
                });
                
                button.setAttribute('data-enhanced', 'true');
            }
        });
    },
    
    /**
     * Initialise le système de gestion de la synchronisation
     */
    initSyncSystem() {
        if (this.config.debug) console.log("Initialisation du système de synchronisation");
        
        // Appliquer les styles pour les infos de synchro
        this.applyStylesForSyncInfo();
        
        // Mettre à jour l'affichage des informations de synchro
        this.updateSyncInfo();
        
        // Configurer la mise à jour périodique
        setInterval(() => {
            this.updateSyncInfo();
        }, 10000); // Mise à jour toutes les 10 secondes
    },
    
    /**
     * Applique les styles pour les informations de synchronisation
     */
    applyStylesForSyncInfo() {
        // Ajouter les styles pour les infos de synchro
        this.addStylesheet(`
            /* Styles pour les informations de synchronisation */
            .sync-info, .last-sync, [id*="sync"], [class*="sync"], 
            div[class*="derniere"], span[class*="derniere"],
            #last-sync-time, .update-info {
                display: ${this.config.showSyncInfo ? 'block' : 'none'} !important;
                font-size: 0.8rem !important;
                color: rgba(255, 255, 255, 0.7) !important;
                text-align: center !important;
                margin: 5px 0 !important;
                background: rgba(0, 0, 0, 0.2) !important;
                padding: 3px 8px !important;
                border-radius: 4px !important;
                max-width: 80% !important;
                margin-left: auto !important;
                margin-right: auto !important;
            }
        `, 'sync-info-styles');
    },
    
    /**
     * Met à jour l'affichage des informations de synchronisation
     */
    updateSyncInfo() {
        if (!this.config.showSyncInfo) return;
        
        // Trouver les éléments d'information de synchronisation
        const syncElements = document.querySelectorAll('.sync-info, .last-sync, [id*="sync"], [class*="sync"], div[class*="derniere"], span[class*="derniere"], #last-sync-time, .update-info');
        
        // S'il n'y a pas d'élément, en créer un
        if (syncElements.length === 0) {
            const syncInfo = document.createElement('div');
            syncInfo.className = 'sync-info';
            
            // Chercher où placer l'élément
            const meetingsContainer = document.querySelector('.meetings-container');
            if (meetingsContainer) {
                // Ajouter en bas du conteneur des réunions
                meetingsContainer.appendChild(syncInfo);
            }
        }
        
        // Mettre à jour tous les éléments trouvés
        syncElements.forEach(element => {
            // Redevenir visible
            element.style.display = 'block';
            
            // Formater la date/heure actuelle
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            
            // Mettre à jour le texte
            element.textContent = `Dernière synchronisation: ${hours}:${minutes}:${seconds}`;
        });
        
        // Mettre à jour la dernière heure de rafraîchissement
        this.state.lastRefreshTime = new Date();
    },
    
    /**
     * Corrige l'affichage des informations de synchronisation
     */
    fixSyncInfoDisplay() {
        // Ajouter les styles pour les infos de synchro
        this.addStylesheet(`
            /* Correction pour les informations de synchronisation */
            .sync-info, .last-sync, [id*="sync"], [class*="sync"], 
            div[class*="derniere"], span[class*="derniere"],
            #last-sync-time, .update-info {
                display: block !important;
                opacity: 1 !important;
                visibility: visible !important;
                height: auto !important;
                width: auto !important;
                overflow: visible !important;
                position: static !important;
                pointer-events: auto !important;
                clip: auto !important;
            }
        `, 'sync-info-fix-styles');
        
        // Mettre à jour l'affichage
        this.updateSyncInfo();
    },
    
    /**
     * Corrige l'affichage des boutons d'affichage des salles
     */
    fixRoomsButtonsDisplay() {
        const buttons = document.querySelectorAll('.toggle-rooms-button, #toggleRoomsBtn, #showRoomsBtn, .rooms-toggle-button-floating');
        
        // Supprimer les boutons en double
        const visibleButtons = new Set();
        
        buttons.forEach(button => {
            const buttonId = button.id || button.className;
            
            if (visibleButtons.has(buttonId)) {
                // Cacher les boutons en double
                button.style.display = 'none';
            } else {
                // Ajouter l'identifiant aux boutons visibles
                visibleButtons.add(buttonId);
                
                // S'assurer que le bouton est visible
                button.style.display = 'inline-flex';
                
                // Mettre à jour le texte du bouton
                const isRoomsVisible = document.querySelector('.rooms-section.visible') !== null;
                button.innerHTML = isRoomsVisible 
                    ? '<i class="fas fa-times"></i> Masquer les salles' 
                    : '<i class="fas fa-door-open"></i> Afficher les salles';
            }
        });
    },
    
    /**
     * Initialise l'observateur du DOM pour détecter les changements importants
     */
    initDOMObserver() {
        // Observer les changements importants dans le body
        const observer = new MutationObserver((mutations) => {
            // Calculer la taille actuelle du DOM
            const currentSize = document.body.innerHTML.length;
            
            // Vérifier s'il y a eu un changement important
            if (Math.abs(currentSize - this.state.lastDOMSize) > 1000) {
                if (this.config.debug) console.log("Changement important du DOM détecté");
                
                // Mettre à jour la taille enregistrée
                this.state.lastDOMSize = currentSize;
                
                // Appliquer les fixes critiques
                this.fixRoomsButtonsDisplay();
                this.fixSyncInfoDisplay();
                this.fixMeetingJoinButtons();
                this.fixCreateMeetingModal();
            }
        });
        
        // Configuration de l'observation
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false
        });
        
        // Enregistrer la taille initiale
        this.state.lastDOMSize = document.body.innerHTML.length;
    },
    
    /**
     * Rafraîchit toutes les données (réunions, salles, etc.)
     */
    refreshData() {
        if (this.config.debug) console.log("Rafraîchissement des données");
        
        // Utiliser la fonction globale fetchMeetings si elle existe
        if (typeof window.fetchMeetings === 'function') {
            window.fetchMeetings(true);
            
            // Mettre à jour après un court délai
            setTimeout(() => {
                // Mettre à jour l'affichage des salles
                this.updateRoomsDisplay();
                
                // Mettre à jour les informations de synchronisation
                this.updateSyncInfo();
                
                // Corriger les boutons de jointure
                this.fixMeetingJoinButtons();
            }, 500);
        } else {
            // Sinon, effectuer une mise à jour manuelle
            this.updateRoomsDisplay();
            this.updateSyncInfo();
            this.fixMeetingJoinButtons();
        }
    },
    
    /**
     * Ajoute une feuille de style au document
     */
    addStylesheet(cssText, id) {
        // Vérifier si la feuille de style existe déjà
        let styleElement = document.getElementById(id);
        
        if (!styleElement) {
            // Créer un nouvel élément de style
            styleElement = document.createElement('style');
            styleElement.id = id;
            document.head.appendChild(styleElement);
        }
        
        // Mise à jour du contenu
        styleElement.textContent = cssText;
    },
    
    /**
     * Applique les styles de base pour corriger les problèmes courants
     */
    applyBaseStyles() {
        // Styles pour corriger les problèmes les plus courants
        this.addStylesheet(`
            /* Correction de base pour les problèmes courants */
            body {
                overflow-x: hidden !important;
            }
            
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
            
            /* Correction des boutons en doublon */
            .control-buttons button + button[id$="RoomsBtn"],
            button[id$="RoomsBtn"] + button[id$="RoomsBtn"] {
                display: none !important;
            }
            
            /* Ajuster l'espacement en bas des conteneurs */
            .meetings-container {
                margin-bottom: 100px !important;
            }
            
            /* Restaurer la visibilité des infos de synchro */
            .sync-info, .last-sync, [id*="sync"], [class*="sync"], 
            div[class*="derniere"], span[class*="derniere"],
            #last-sync-time, .update-info {
                display: block !important;
                opacity: 1 !important;
                visibility: visible !important;
                height: auto !important;
                width: auto !important;
                overflow: visible !important;
                position: static !important;
                pointer-events: auto !important;
            }
        `, 'base-fix-styles');
    },
    
    /**
     * Affiche un message toast de notification
     */
    showToast(message, type = 'info', duration = 3000) {
        // Supprimer les toasts existants
        document.querySelectorAll('.toast-notification').forEach(toast => {
            toast.remove();
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
    }
};

// Initialiser l'interface améliorée au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    EnhancedInterface.init();
});

// Exposer l'objet pour utilisation globale
window.EnhancedInterface = EnhancedInterface;

// Maintenir la compatibilité avec les anciens systèmes
window.afficherSalles = function() {
    if (window.EnhancedInterface) {
        window.EnhancedInterface.showRooms();
    }
    return false; // Empêcher la navigation
};
