/**
 * SOLUTION COMPLÈTE FINALE v9.0
 * Optimisations visuelles sans perturber les fonctionnalités existantes
 * 
 * Fonctionnalités principales:
 * 1. Masquage ciblé des informations de synchronisation
 * 2. Réduction et centrage de la barre inférieure
 * 3. Amélioration de l'affichage des salles (disposition en grille)
 * 4. Fermeture automatique des menus au clic en dehors
 * 5. Connexion Teams directe optimisée
 * 6. Correction des espacements et superpositions
 * 7. Transparence optimale pour l'interface
 * 8. Support mobile optimisé
 * 9. Adaptations spécifiques pour Safari et autres navigateurs
 */

// Exécuter le code lors du chargement du document
document.addEventListener('DOMContentLoaded', function() {
    console.log("🔄 Initialisation de la solution complète finale v9.0 - Interface harmonieuse");
    
    // Vérifier si le script a déjà été chargé pour éviter les doublons
    if (window._interfaceInitialized) {
        console.log("⚠️ Interface déjà initialisée, abandon");
        return;
    }
    
    // Marquer comme initialisé
    window._interfaceInitialized = true;
    
    // Lancer l'initialisation
    initializeUI();
    
    // Ajouter un gestionnaire pour réinitialiser en cas de changement important du DOM
    let lastDOMSize = document.body.innerHTML.length;
    
    setInterval(() => {
        const currentSize = document.body.innerHTML.length;
        // Si le DOM a changé de manière significative
        if (Math.abs(currentSize - lastDOMSize) > 1000) {
            console.log("🔄 Changement important du DOM détecté, réinitialisation");
            lastDOMSize = currentSize;
            initializeUI();
        }
    }, 2000);
});

/**
 * Initialise l'interface utilisateur avec toutes les améliorations
 * et gère les interactions de manière robuste
 */
function initializeUI() {
    console.log("🚀 Initialisation de l'interface harmonieuse v9.0");
    
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
            
            // 7. Masquer agressivement les infos de synchro
            hideAllSyncInfo();
            
            // 8. Amélioration spécifique pour Safari et les navigateurs mobiles
            addSpecificBrowserFixes();
            
            // 9. Mise en place de la fermeture automatique des menus au clic en dehors
            setupClickOutsideToClose();
            
            console.log("✅ Interface harmonieuse initialisée avec succès");
            
            // Ajouter un message visuel de succès
            showSuccessMessage("Interface optimisée avec succès");
        } catch (error) {
            console.error("❌ Erreur lors de l'initialisation de l'interface:", error);
            
            // Réessayer après un délai plus long en cas d'erreur
            setTimeout(() => {
                console.log("🔄 Nouvelle tentative d'initialisation...");
                initializeUI();
            }, 500);
        }
    }, 100);
}

/**
 * Masque agressivement toutes les informations de synchronisation
 * sans toucher aux conteneurs principaux
 */
function hideAllSyncInfo() {
    console.log("📌 Masquage agressif des informations de synchronisation");
    
    // Fonction pour vérifier si un élément est un conteneur principal à protéger
    function isMainContainer(element) {
        return element.classList.contains('main-container') || 
               element.classList.contains('meetings-container') || 
               element.classList.contains('meetings') || 
               element.classList.contains('meetings-list') ||
               element.classList.contains('rooms-section') ||
               element.classList.contains('control-buttons');
    }
    
    // Fonction pour vérifier si un élément contient un texte lié à la synchronisation
    function containsSyncText(element) {
        if (!element || !element.textContent) return false;
        
        const text = element.textContent.toLowerCase();
        return text.includes('dernière') || 
               text.includes('synchro') || 
               text.includes('mise à jour') ||
               (text.includes(':') && (text.includes('11:') || text.includes('12:')));
    }
    
    try {
        // 1. Masquer les éléments avec des sélecteurs spécifiques
        document.querySelectorAll('[id*="synchro"], [class*="synchro"], .sync-info, .last-sync').forEach(element => {
            if (!isMainContainer(element)) {
                element.style.display = 'none';
                element.style.visibility = 'hidden';
                element.style.height = '0';
                element.style.overflow = 'hidden';
                element.style.opacity = '0';
            }
        });
        
        // 2. Parcourir les éléments de texte pour trouver ceux avec du texte de synchronisation
        document.querySelectorAll('div, span, p').forEach(element => {
            if (!isMainContainer(element) && containsSyncText(element)) {
                element.style.display = 'none';
                element.style.visibility = 'hidden';
                element.style.height = '0';
                element.style.width = '0';
                element.style.overflow = 'hidden';
                element.style.opacity = '0';
                element.style.position = 'absolute';
                element.style.pointerEvents = 'none';
            }
        });
        
        // 3. Cibler spécifiquement l'élément de synchronisation en bas
        const syncElement = document.querySelector('.datetime-info, [title*="synchro"], [aria-label*="synchro"]');
        if (syncElement && !isMainContainer(syncElement)) {
            syncElement.style.display = 'none';
        }
    } catch (error) {
        console.log("Erreur lors du masquage des infos de synchronisation:", error);
    }
}

/**
 * Configurer la fermeture des menus au clic en dehors
 */
function setupClickOutsideToClose() {
    console.log("📌 Configuration de la fermeture automatique des menus");
    
    // Éviter les doublons d'installation
    if (window._clickOutsideConfigured) return;
    window._clickOutsideConfigured = true;
    
    // Éléments à fermer au clic en dehors
    const closeableElements = [
        {
            selector: '.side-menu, #tableau-de-bord, .dashboard-menu',
            isOpen: (el) => el.classList.contains('expanded') || el.classList.contains('open'),
            close: (el) => {
                el.classList.remove('expanded', 'open');
                const mainContainer = document.querySelector('.main-container');
                if (mainContainer) mainContainer.classList.remove('menu-expanded');
                
                const overlay = document.querySelector('.menu-overlay');
                if (overlay) overlay.classList.remove('active');
            }
        },
        {
            selector: '.rooms-section, .rooms-list, .available-rooms',
            isOpen: (el) => el.style.display !== 'none' && !el.classList.contains('hidden'),
            close: (el) => {
                el.style.display = 'none';
                
                // Mettre à jour le texte des boutons
                document.querySelectorAll('#showRoomsBtn, .toggle-rooms-button, .rooms-toggle-button-floating').forEach(btn => {
                    if (btn && btn.innerHTML.includes('Masquer')) {
                        btn.innerHTML = btn.innerHTML.replace('Masquer', 'Afficher').replace('fa-door-closed', 'fa-door-open');
                    }
                });
            }
        },
        {
            selector: '.user-dropdown',
            isOpen: (el) => el.classList.contains('active') || el.classList.contains('show') || el.style.display === 'block',
            close: (el) => {
                el.classList.remove('active', 'show');
                el.style.display = 'none';
            }
        }
    ];
    
    // Installer l'écouteur de clic global
    document.addEventListener('click', function(event) {
        closeableElements.forEach(item => {
            const elements = document.querySelectorAll(item.selector);
            
            elements.forEach(element => {
                // Vérifier si l'élément est ouvert
                if (item.isOpen(element)) {
                    // Vérifier si le clic est en dehors
                    let isOutside = true;
                    
                    // Vérifier si le clic est sur l'élément lui-même ou un de ses enfants
                    if (element.contains(event.target)) {
                        isOutside = false;
                    }
                    
                    // Vérifier si le clic est sur un bouton d'ouverture
                    const toggleButtons = document.querySelectorAll('button[class*="toggle"], [id*="toggle"], [class*="Toggle"], [id*="show"], [class*="Show"], .menu-toggle-visible');
                    toggleButtons.forEach(button => {
                        if (button && button.contains(event.target)) {
                            isOutside = false;
                        }
                    });
                    
                    // Si le clic est en dehors, fermer
                    if (isOutside) {
                        item.close(element);
                    }
                }
            });
        });
    });
    
    // Configurer l'ouverture/fermeture des salles
    document.querySelectorAll('#showRoomsBtn, .toggle-rooms-button, .rooms-toggle-button-floating').forEach(button => {
        if (button) {
            // Supprimer les gestionnaires existants
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
                
                // Basculer l'affichage
                const isVisible = roomsSection.style.display !== 'none';
                roomsSection.style.display = isVisible ? 'none' : 'block';
                
                // Mettre à jour le texte du bouton
                const newText = isVisible ? 
                    newButton.innerHTML.replace('Masquer', 'Afficher').replace('fa-door-closed', 'fa-door-open') : 
                    newButton.innerHTML.replace('Afficher', 'Masquer').replace('fa-door-open', 'fa-door-closed');
                
                newButton.innerHTML = newText;
            });
        }
    });
}

/**
 * Ajoute des correctifs spécifiques pour certains navigateurs
 */
function addSpecificBrowserFixes() {
    console.log("📌 Application de correctifs spécifiques pour les navigateurs");
    
    // Détection du navigateur
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isSafari || isMobile) {
        console.log("📌 Application de correctifs spécifiques pour", isSafari ? "Safari" : "Mobile");
        
        // Correctifs pour Safari / Mobile
        addStylesheet(`
            /* Correctifs pour Safari et Mobile */
            .rooms-section {
                -webkit-backdrop-filter: blur(15px) !important;
            }
            
            /* Amélioration du tap sur mobile */
            button, .room-card, .menu-item, .meeting-join-btn {
                touch-action: manipulation !important;
            }
            
            /* Éviter le zoom sur les champs texte (mobile) */
            input[type="text"], input[type="password"], input[type="email"], input[type="number"] {
                font-size: 16px !important;
            }
            
            /* Ajustements mobiles */
            @media (max-width: 768px) {
                .controls-container {
                    width: 90% !important;
                    min-width: unset !important;
                }
                
                .rooms-section {
                    width: 90% !important;
                }
                
                .rooms {
                    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)) !important;
                }
            }
        `, 'browser-specific-fixes');
    }
}

/**
 * Implémente la jointure directe à Teams
 */
function implementDirectTeamsJoin() {
    console.log("📌 Implémentation de la jointure directe Teams");
    
    // Optimisation du bouton de jointure principal
    const joinButton = document.getElementById('joinMeetingBtn');
    const meetingIdInput = document.getElementById('meeting-id');
    
    if (joinButton && meetingIdInput) {
        // Remplacer l'événement existant
        const newJoinButton = joinButton.cloneNode(true);
        if (joinButton.parentNode) {
            joinButton.parentNode.replaceChild(newJoinButton, joinButton);
        }
        
        newJoinButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            const meetingId = meetingIdInput.value.trim();
            if (!meetingId) {
                alert("Veuillez entrer l'ID de la réunion");
                return;
            }
            
            // Construire l'URL Teams standard
            const teamsUrl = `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${meetingId}%40thread.v2/0`;
            window.open(teamsUrl, "_blank");
        });
    }
    
    // Optimisation des boutons "Rejoindre" dans la liste des réunions
    document.querySelectorAll('.meeting-join-btn').forEach(button => {
        const newButton = button.cloneNode(true);
        if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);
        }
        
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Animation du bouton
            this.classList.add('joining');
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            // Récupérer l'URL ou l'ID
            const url = this.getAttribute('data-url');
            const id = this.getAttribute('data-id') || this.getAttribute('data-meeting-id');
            
            if (url) {
                window.open(url, "_blank");
            } else if (id) {
                const teamsUrl = `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${id}%40thread.v2/0`;
                window.open(teamsUrl, "_blank");
            }
            
            // Restaurer le bouton après un délai
            setTimeout(() => {
                this.classList.remove('joining');
                this.innerHTML = '<i class="fas fa-sign-in-alt"></i> Rejoindre';
            }, 1000);
        });
    });
    
    // Ajouter des styles pour les boutons de jointure
    addStylesheet(`
        .meeting-join-btn {
            background: linear-gradient(to right, #6264A7, #7B83EB) !important;
            color: white !important;
            border: none !important;
            border-radius: 4px !important;
            padding: 8px 12px !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
        }
        
        .meeting-join-btn:hover {
            background: linear-gradient(to right, #7B83EB, #8A92F0) !important;
            box-shadow: 0 2px 8px rgba(98, 100, 167, 0.4) !important;
        }
        
        .meeting-join-btn.joining {
            background: #6264A7 !important;
            cursor: wait !important;
        }
    `, 'teams-join-styles');
}

/**
 * Corrige le premier clic du menu
 */
function fixMenuFirstClick() {
    console.log("📌 Correction du premier clic du menu");
    
    // Traiter les éléments du menu pour s'assurer que le premier clic fonctionne
    document.querySelectorAll('.menu-item').forEach(item => {
        if (item.getAttribute('data-click-fixed')) return;
        
        // Marquer comme traité
        item.setAttribute('data-click-fixed', 'true');
        
        // Ajouter un effet au survol
        item.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });
        
        item.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.backgroundColor = '';
            }
        });
        
        // Assurer que le clic fonctionne correctement
        item.addEventListener('click', function(e) {
            // Ne pas traiter les liens externes
            if (this.getAttribute('target') === '_blank') return;
            
            // Ajouter la classe active
            document.querySelectorAll('.menu-item').forEach(i => {
                i.classList.remove('active');
                i.style.backgroundColor = '';
            });
            
            this.classList.add('active');
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            
            // Fermer le menu sur mobile
            if (window.innerWidth <= 768) {
                const sideMenu = document.querySelector('.side-menu');
                const mainContainer = document.querySelector('.main-container');
                const menuOverlay = document.querySelector('.menu-overlay');
                
                if (sideMenu) sideMenu.classList.remove('expanded', 'open');
                if (mainContainer) mainContainer.classList.remove('menu-expanded');
                if (menuOverlay) menuOverlay.classList.remove('active');
            }
        });
    });
}

/**
 * Supprime la bannière du haut et réduit la largeur de la bannière du bas
 */
function removeHeaderAndShrinkFooter() {
    console.log("📌 Application des modifications d'interface principales");
    
    // Styles pour masquer le header et réduire la largeur du footer
    addStylesheet(`
        /* Masquer la bannière du haut */
        .header, .top-banner, .app-header, div[class*="header"], 
        div[class*="Header"], div[id*="header"], div[id*="Header"] {
            display: none !important;
            height: 0 !important;
            opacity: 0 !important;
            visibility: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            overflow: hidden !important;
        }
        
        /* Masquer les informations de synchronisation */
        [id*="synchro"]:not(.main-container):not(.meetings-container):not(.meetings):not(.meetings-list),
        [class*="synchro"]:not(.main-container):not(.meetings-container):not(.meetings):not(.meetings-list),
        .sync-info, .last-sync {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            overflow: hidden !important;
            opacity: 0 !important;
            position: absolute !important;
            pointer-events: none !important;
        }
        
        /* Réduire la largeur de la bannière du bas */
        .controls-container, .footer-banner, .app-footer, 
        div[class*="footer"], div[class*="Footer"], 
        div[id*="footer"], div[id*="Footer"] {
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
            position: fixed !important;
            bottom: 0 !important;
            z-index: 100 !important;
        }
        
        /* Ajustement des contrôles dans la bannière du bas */
        .control-buttons, .footer-controls, .action-buttons {
            display: flex !important;
            justify-content: center !important;
            flex-wrap: wrap !important;
            gap: 10px !important;
            padding: 8px 15px !important;
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
        
        /* Ajuster la position verticale des blocs de contenu */
        .meetings-container, .content-block, .app-block {
            margin-top: 20px !important;
        }
        
        /* Support mobile */
        @media (max-width: 768px) {
            .controls-container, .footer-banner, .app-footer {
                width: 90% !important;
                min-width: unset !important;
            }
        }
    `, 'header-footer-adjustment-enhanced-styles');
    
    // Application directe à certains éléments critiques
    try {
        // Masquer manuellement et sélectivement les infos de synchro
        document.querySelectorAll('div, span, p').forEach(el => {
            if (el && el.textContent && 
                !el.classList.contains('main-container') && 
                !el.classList.contains('meetings-container') && 
                !el.classList.contains('meetings') && 
                !el.classList.contains('meetings-list')) {
                
                const text = el.textContent.toLowerCase();
                if (text.includes('dernière synchro') || text.includes('mise à jour:')) {
                    el.style.display = 'none';
                }
            }
        });
        
        // Optimiser la barre de contrôle inférieure
        const controlBar = document.querySelector('.controls-container');
        if (controlBar) {
            controlBar.style.width = window.innerWidth <= 768 ? '90%' : '40%';
            controlBar.style.maxWidth = '500px';
            controlBar.style.minWidth = window.innerWidth <= 768 ? 'auto' : '400px';
            controlBar.style.margin = '0 auto';
            controlBar.style.left = '50%';
            controlBar.style.transform = 'translateX(-50%)';
            controlBar.style.borderRadius = '15px 15px 0 0';
            controlBar.style.position = 'fixed';
            controlBar.style.bottom = '0';
            controlBar.style.zIndex = '100';
            
            // Organisation des boutons
            const buttonContainer = controlBar.querySelector('.control-buttons');
            if (buttonContainer) {
                buttonContainer.style.display = 'flex';
                buttonContainer.style.justifyContent = 'center';
                buttonContainer.style.flexWrap = 'wrap';
                buttonContainer.style.gap = '10px';
                buttonContainer.style.padding = '10px';
            }
        }
    } catch (e) {
        console.error("Erreur lors de l'application des styles directs:", e);
    }
}

/**
 * Corrige les espacements et superpositions pour une mise en page fluide
 */
function fixSpacingAndOverlaps() {
    console.log("📌 Correction des espacements et superpositions");
    
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
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1) !important;
        }
        
        /* Section des réunions avec scroll interne */
        .meetings-list {
            max-height: calc(100vh - 250px) !important;
            overflow-y: auto !important;
            padding-right: 5px !important;
            margin-bottom: 15px !important;
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
        .meetings-title-bar, .section-title {
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
    `, 'spacing-fix-enhanced-styles');
    
    // Application directe à certains éléments pour garantir l'application
    try {
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
        
        // Liste des réunions
        const meetingsList = document.querySelector('.meetings-list');
        if (meetingsList) {
            meetingsList.style.maxHeight = 'calc(100vh - 250px)';
            meetingsList.style.overflowY = 'auto';
        }
        
        // Section d'entrée d'ID
        const idEntry = document.querySelector('.meeting-id-entry');
        if (idEntry) {
            idEntry.style.borderBottomLeftRadius = '15px';
            idEntry.style.borderBottomRightRadius = '15px';
            
            // Assurer l'espace en bas
            const spacer = document.createElement('div');
            spacer.style.height = '40px';
            spacer.style.marginBottom = '-40px';
            
            // Ne l'ajouter que s'il n'existe pas déjà
            if (!idEntry.querySelector('[style*="height: 40px"]')) {
                idEntry.appendChild(spacer);
            }
        }
    } catch (e) {
        console.error("Erreur lors de l'application des espacements directs:", e);
    }
}

/**
 * Applique la transparence optimale pour une interface élégante
 */
function applyOptimalTransparency() {
    console.log("📌 Application de la transparence optimale");
    
    // Styles pour la transparence
    addStylesheet(`
        /* Transparence du conteneur de réunions */
        .meetings-container {
            background-color: rgba(30, 30, 30, 0.5) !important;
            backdrop-filter: blur(10px) !important;
            border-radius: 15px !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        
        /* Transparence de l'en-tête des réunions */
        .meetings-title-bar {
            background-color: rgba(40, 40, 40, 0.3) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(10px) !important;
        }
        
        /* Transparence des éléments de réunion */
        .meeting-item {
            background-color: rgba(45, 45, 45, 0.5) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(5px) !important;
            transition: all 0.2s ease !important;
        }
        
        .meeting-item:hover {
            background-color: rgba(55, 55, 55, 0.6) !important;
        }
        
        /* Transparence du menu latéral */
        .side-menu {
            background-color: rgba(25, 25, 25, 0.85) !important;
            backdrop-filter: blur(15px) !important;
            border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
        
        /* Transparence de la section ID de réunion */
        .meeting-id-entry {
            background-color: rgba(40, 40, 40, 0.4) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(8px) !important;
        }
        
        /* Transparence des boutons */
        button {
            transition: all 0.2s ease !important;
        }
        
        button:hover {
            transform: translateY(-1px) !important;
        }
    `, 'optimal-transparency-enhanced-styles');
}

/**
 * Implémente une disposition en grille pour les salles
 * avec une interface moderne et fluide, centrée au milieu de l'écran
 */
function implementRoomsGrid() {
    console.log("📌 Initialisation de la disposition en grille des salles");
    
    // Styles pour la disposition en grille au centre
    addStylesheet(`
        /* Section des salles (centrée) */
        .rooms-section, .rooms-container, #roomsSection, .rooms-popup {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 70% !important;
            max-width: 800px !important;
            max-height: 80vh !important;
            background: rgba(30, 30, 30, 0.85) !important;
            backdrop-filter: blur(15px) !important;
            border-radius: 15px !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
            z-index: 9995 !important;
            padding: 20px !important;
            overflow: auto !important;
            margin: 0 !important;
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
            margin-top: auto !important;
        }
        
        /* Indicateur de statut */
        .status-icon {
            width: 10px !important;
            height: 10px !important;
            border-radius: 50% !important;
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
    `, 'rooms-grid-enhanced-styles');
    
    // Application directe à la section des salles
    try {
        const roomsSection = document.querySelector('.rooms-section');
        if (roomsSection) {
            // Appliquer les styles directement
            roomsSection.style.position = 'fixed';
            roomsSection.style.left = '50%';
            roomsSection.style.top = '50%';
            roomsSection.style.transform = 'translate(-50%, -50%)';
            roomsSection.style.width = window.innerWidth <= 768 ? '90%' : '70%';
            roomsSection.style.maxWidth = '800px';
            roomsSection.style.maxHeight = '80vh';
            roomsSection.style.borderRadius = '15px';
            roomsSection.style.backgroundColor = 'rgba(30, 30, 30, 0.85)';
            roomsSection.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
            roomsSection.style.zIndex = '9995';
            
            // Conteneur des salles en grille
            const roomsContainer = roomsSection.querySelector('.rooms');
            if (roomsContainer) {
                roomsContainer.style.display = 'grid';
                roomsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
                roomsContainer.style.gap = '15px';
                roomsContainer.style.padding = '15px';
            }
            
            // Appliquer des styles aux cartes de salle
            const roomCards = roomsSection.querySelectorAll('.room-card');
            roomCards.forEach(card => {
                card.style.borderRadius = '10px';
                card.style.backgroundColor = 'rgba(50, 50, 50, 0.5)';
                card.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
                
                // Ajouter des effets hover
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-5px)';
                    this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.3)';
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = '';
                    this.style.boxShadow = '';
                });
            });
        }
    } catch (e) {
        console.error("Erreur lors de l'application de la grille des salles:", e);
    }
}

/**
 * Affiche un message de succès temporaire
 */
function showSuccessMessage(message) {
    let messageBox = document.getElementById('success-message');
    if (!messageBox) {
        messageBox = document.createElement('div');
        messageBox.id = 'success-message';
        messageBox.style.position = 'fixed';
        messageBox.style.top = '20px';
        messageBox.style.left = '50%';
        messageBox.style.transform = 'translateX(-50%)';
        messageBox.style.backgroundColor = 'rgba(76, 175, 80, 0.9)';
        messageBox.style.color = 'white';
        messageBox.style.padding = '10px 20px';
        messageBox.style.borderRadius = '5px';
        messageBox.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        messageBox.style.zIndex = '10000';
        messageBox.style.opacity = '0';
        messageBox.style.transition = 'opacity 0.3s ease';
        document.body.appendChild(messageBox);
    }
    
    messageBox.textContent = message;
    
    // Afficher avec animation
    setTimeout(() => {
        messageBox.style.opacity = '1';
        
        // Masquer après 3 secondes
        setTimeout(() => {
            messageBox.style.opacity = '0';
            
            // Supprimer après la transition
            setTimeout(() => {
                if (messageBox.parentNode) {
                    messageBox.parentNode.removeChild(messageBox);
                }
            }, 300);
        }, 3000);
    }, 100);
}

/**
 * Utilitaire pour ajouter une feuille de style au document
 */
function addStylesheet(css, id) {
    // Vérifier si le style existe déjà
    if (id && document.getElementById(id)) {
        document.getElementById(id).remove();
    }
    
    // Créer une nouvelle feuille de style
    const style = document.createElement('style');
    if (id) style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
}
