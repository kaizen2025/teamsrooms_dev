/**
 * SOLUTION COMPLÈTE FINALE - Correction de tous les problèmes visuels
 * Version 9.0 - Refonte visuelle harmonieuse:
 * 1. Connexion Teams directe (méthode éprouvée avec votre URL)
 * 2. Correction de l'espacement entre les blocs (plus de superposition)
 * 3. Suppression de la bannière du haut
 * 4. Réduction de la largeur de la bannière du bas
 * 5. Disposition harmonieuse des salles en grille centrée
 * 6. Espace vide sous le bloc d'ID pour voir l'arrière-plan
 * 7. Masquage des informations de synchronisation
 * 8. Fermeture automatique des menus au clic en dehors
 */

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
 */
function hideAllSyncInfo() {
    console.log("📌 Masquage agressif des informations de synchronisation");
    
    // Fonction pour vérifier si un élément contient un texte lié à la synchronisation
    function containsSyncText(element) {
        const text = element.textContent.toLowerCase();
        return text.includes('dernière') || 
               text.includes('synchro') || 
               text.includes('mise à jour') ||
               (text.includes(':') && (text.includes('11:') || text.includes('12:')));
    }
    
    // Parcourir tous les éléments du DOM pour trouver ceux contenant des textes de synchronisation
    function findAndHideSyncElements(root = document.body) {
        // Utiliser querySelectorAll pour les sélecteurs connus
        const syncSelectors = [
            '[id*="synchro"]', '[class*="synchro"]', '.sync-info', '.last-sync',
            'div[class*="derniere"]', 'span[class*="derniere"]'
        ];
        
        syncSelectors.forEach(selector => {
            try {
                const elements = root.querySelectorAll(selector);
                elements.forEach(element => {
                    hideElement(element);
                });
            } catch (e) {
                console.log("Erreur avec sélecteur:", selector, e);
            }
        });
        
        // Pour les éléments avec du texte spécifique, parcourir manuellement
        const allElements = root.querySelectorAll('*');
        allElements.forEach(element => {
            try {
                if (containsSyncText(element)) {
                    hideElement(element);
                }
            } catch (e) {
                // Ignorer les erreurs
            }
        });
    }
    
    // Masquer un élément et ses enfants
    function hideElement(element) {
        if (!element) return;
        
        element.style.display = 'none';
        element.style.visibility = 'hidden';
        element.style.height = '0';
        element.style.overflow = 'hidden';
        element.style.opacity = '0';
        element.style.position = 'absolute';
        element.style.pointerEvents = 'none';
        element.setAttribute('aria-hidden', 'true');
        
        // Masquer également tous les enfants
        const children = element.querySelectorAll('*');
        children.forEach(child => {
            child.style.display = 'none';
            child.style.visibility = 'hidden';
        });
    }
    
    // Exécuter la recherche et le masquage
    findAndHideSyncElements();
    
    // Exécuter à plusieurs reprises pour être sûr
    setTimeout(findAndHideSyncElements, 300);
    setTimeout(findAndHideSyncElements, 1000);
    setTimeout(findAndHideSyncElements, 2000);
}

/**
 * Configurer la fermeture des menus au clic en dehors
 */
function setupClickOutsideToClose() {
    console.log("📌 Configuration de la fermeture automatique des menus");
    
    // Éléments à fermer au clic en dehors
    const closeableElements = [
        {
            selector: '.side-menu, #tableau-de-bord, .dashboard-menu',
            isOpen: (el) => el.classList.contains('expanded') || el.classList.contains('open'),
            close: (el) => {
                el.classList.remove('expanded', 'open');
                const mainContainer = document.querySelector('.main-container');
                if (mainContainer) mainContainer.classList.remove('menu-expanded');
            }
        },
        {
            selector: '.rooms-section, .rooms-list, .available-rooms',
            isOpen: (el) => el.style.display !== 'none' && el.classList.contains('visible'),
            close: (el) => {
                el.classList.remove('visible');
                const overlay = document.querySelector('.rooms-overlay');
                if (overlay) overlay.classList.remove('visible');
                
                // Mise à jour du texte des boutons
                const buttons = document.querySelectorAll('#showRoomsBtn, .toggle-rooms-button');
                buttons.forEach(btn => {
                    if (btn.innerHTML.includes('Masquer')) {
                        btn.innerHTML = btn.innerHTML.replace('Masquer', 'Afficher').replace('fa-door-closed', 'fa-door-open');
                    }
                });
            }
        },
        {
            selector: '.user-dropdown',
            isOpen: (el) => el.classList.contains('active') || el.style.display === 'block',
            close: (el) => {
                el.classList.remove('active');
                el.style.display = 'none';
            }
        }
    ];
    
    // Écouter les clics sur le document
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
                    const toggleButtons = document.querySelectorAll('button[class*="toggle"], [id*="toggle"], [class*="Toggle"], [id*="show"], [class*="Show"]');
                    toggleButtons.forEach(button => {
                        if (button.contains(event.target)) {
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
    
    // Boutons d'ouverture du menu latéral
    const menuToggleButtons = document.querySelectorAll('.menu-toggle-visible, .menu-toggle, .hamburger-menu');
    menuToggleButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const sideMenu = document.querySelector('.side-menu');
            if (sideMenu) {
                sideMenu.classList.toggle('expanded');
                sideMenu.classList.toggle('open');
                const mainContainer = document.querySelector('.main-container');
                if (mainContainer) mainContainer.classList.toggle('menu-expanded');
            }
        });
    });
}

/**
 * Ajoute des correctifs spécifiques pour certains navigateurs
 */
function addSpecificBrowserFixes() {
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
                transform: translate(-50%, -50%) !important;
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
        `, 'browser-specific-fixes');
    }
}

/**
 * Implémente la jointure directe à Teams
 */
function implementDirectTeamsJoin() {
    console.log("📌 Implémentation de la jointure directe Teams");
    
    // Sélectionner le bouton de jointure et le champ d'ID
    const joinButton = document.getElementById('joinMeetingBtn');
    const meetingIdInput = document.getElementById('meeting-id');
    
    if (joinButton && meetingIdInput) {
        // Remplacer l'événement existant
        const newJoinButton = joinButton.cloneNode(true);
        joinButton.parentNode.replaceChild(newJoinButton, joinButton);
        
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
    
    // Améliorer également les boutons Rejoindre dans la liste des réunions
    const joinMeetingButtons = document.querySelectorAll('.meeting-join-btn');
    joinMeetingButtons.forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Obtenir l'URL ou l'ID
            const url = this.getAttribute('data-url');
            const id = this.getAttribute('data-id') || this.getAttribute('data-meeting-id');
            
            if (url) {
                window.open(url, "_blank");
            } else if (id) {
                const teamsUrl = `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${id}%40thread.v2/0`;
                window.open(teamsUrl, "_blank");
            }
        });
    });
}

/**
 * Corrige le premier clic du menu
 */
function fixMenuFirstClick() {
    console.log("📌 Correction du premier clic du menu");
    
    // Sélecteurs des menus et boutons
    const menuItems = document.querySelectorAll('.menu-item');
    const subMenuItems = document.querySelectorAll('.menu-submenu .menu-item');
    
    // Correction pour les éléments de menu principal
    menuItems.forEach(item => {
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        
        newItem.addEventListener('click', function(e) {
            // Uniquement si c'est un lien réel (pas un sous-menu)
            if (!this.querySelector('.menu-dropdown-icon')) {
                const menuItems = document.querySelectorAll('.menu-item');
                menuItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Correction pour les sous-menus
    const menuSubmenus = document.querySelectorAll('.menu-submenu');
    menuSubmenus.forEach(submenu => {
        if (submenu.parentElement.querySelector('.menu-dropdown-icon')) {
            submenu.parentElement.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const isExpanded = submenu.classList.contains('expanded');
                
                // Fermer tous les autres sous-menus
                document.querySelectorAll('.menu-submenu').forEach(s => {
                    if (s !== submenu) {
                        s.classList.remove('expanded');
                        const icon = s.parentElement.querySelector('.menu-dropdown-icon');
                        if (icon) icon.style.transform = 'rotate(0deg)';
                    }
                });
                
                // Basculer le sous-menu actuel
                submenu.classList.toggle('expanded');
                const icon = this.querySelector('.menu-dropdown-icon');
                if (icon) {
                    icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
                }
            });
        }
    });
}

/**
 * Supprime la bannière du haut et réduit la largeur de la bannière du bas
 * pour une interface plus propre et harmonieuse - Version renforcée
 */
function removeHeaderAndShrinkFooter() {
    console.log("📌 Application des modifications d'interface principales");
    
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
            overflow: hidden !important;
        }
        
        /* Masquer AGGRESSIVEMENT toutes les informations de synchronisation */
        [id*="synchro"], [class*="synchro"], .sync-info, .last-sync, 
        div:contains("Dernière"), div:contains("dernière"), div:contains("synchro"),
        span:contains("Dernière"), span:contains("dernière"), span:contains("synchro"),
        div:contains("mise à jour"), span:contains("mise à jour"),
        div:contains("12:"), div:contains("11:"), 
        div:has(> span:contains("Dernière")), div:has(> span:contains("dernière")),
        div:has(> div:contains("Dernière")), div:has(> div:contains("dernière")) {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            overflow: hidden !important;
            opacity: 0 !important;
            position: absolute !important;
            pointer-events: none !important;
            clip: rect(0, 0, 0, 0) !important;
        }
        
        /* Réduire la largeur de la bannière du bas - Version compacte stricte */
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
        
        /* Assurer que tout le contenu est bien visible */
        body {
            padding-top: 0 !important;
            margin-top: 0 !important;
        }
    `, 'header-footer-adjustment-enhanced-styles');
    
    // Application directe et agressive pour masquer les infos de synchro
    const syncElements = document.querySelectorAll('[id*="synchro"], [class*="synchro"], .sync-info, .last-sync, div:contains("Dernière"), div:contains("dernière"), div:contains("synchro"), span:contains("Dernière"), span:contains("dernière")');
    syncElements.forEach(element => {
        if (element) {
            console.log("📌 Masquage d'un élément de synchronisation:", element);
            element.style.display = 'none';
            element.style.visibility = 'hidden';
            element.style.height = '0';
            element.style.width = '0';
            element.style.overflow = 'hidden';
            element.style.opacity = '0';
            element.style.position = 'absolute';
            element.style.pointerEvents = 'none';
            element.setAttribute('aria-hidden', 'true');
            
            // Masquer également tous les enfants
            const children = element.querySelectorAll('*');
            children.forEach(child => {
                child.style.display = 'none';
                child.style.visibility = 'hidden';
            });
        }
    });
    
    // Application directe de la réduction de la bannière du bas
    const footerElements = document.querySelectorAll('.controls-container, .footer-banner, .app-footer, [class*="footer"], [class*="Footer"], [id*="footer"], [id*="Footer"]');
    footerElements.forEach(element => {
        if (element) {
            console.log("📌 Réduction de la bannière du bas:", element);
            element.style.width = '40%';
            element.style.maxWidth = '500px';
            element.style.minWidth = '400px';
            element.style.margin = '0 auto';
            element.style.left = '50%';
            element.style.transform = 'translateX(-50%)';
            element.style.borderRadius = '15px 15px 0 0';
            element.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
            element.style.backdropFilter = 'blur(10px)';
            element.style.boxShadow = '0 -5px 15px rgba(0, 0, 0, 0.1)';
            element.style.padding = '10px 15px';
            
            // Améliorer l'organisation des boutons
            const buttons = element.querySelectorAll('button');
            if (buttons.length > 0) {
                const container = document.createElement('div');
                container.className = 'control-buttons-container';
                container.style.display = 'flex';
                container.style.justifyContent = 'center';
                container.style.flexWrap = 'wrap';
                container.style.gap = '10px';
                
                buttons.forEach(button => {
                    container.appendChild(button.cloneNode(true));
                    button.style.display = 'none';
                });
                
                element.appendChild(container);
            }
        }
    });
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
            border-bottom: none !important;
            box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.1) !important;
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
        
        /* Éviter le débordement du menu latéral */
        .side-menu, .menu-sidebar {
            max-width: 280px !important;
            overscroll-behavior: contain !important;
        }
    `, 'spacing-fix-enhanced-styles');
    
    // Application directe à certains éléments pour garantir l'application
    applyDirectSpacingFixes();
    
    function applyDirectSpacingFixes() {
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
            meetingsList.style.scrollbarWidth = 'thin';
        }
        
        // Section d'entrée d'ID
        const idEntry = document.querySelector('.meeting-id-entry');
        if (idEntry) {
            idEntry.style.borderBottomLeftRadius = '15px';
            idEntry.style.borderBottomRightRadius = '15px';
            
            // Ajouter un espace vide après
            const spacer = document.createElement('div');
            spacer.style.height = '40px';
            spacer.style.width = '100%';
            spacer.style.marginBottom = '-40px';
            idEntry.appendChild(spacer);
        }
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
            transform: translate(-50%, -50%) scale(0.95) !important;
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
            display: none !important;
            opacity: 0 !important;
            transition: all 0.3s ease !important;
            overflow: auto !important;
            margin: 0 !important;
        }
        
        .rooms-section.visible, .rooms-container.visible, #roomsSection.visible, .rooms-popup.visible {
            display: block !important;
            opacity: 1 !important;
            transform: translate(-50%, -50%) scale(1) !important;
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
    `, 'rooms-grid-enhanced-styles');
    
    // Ajouter un overlay pour gérer les clics en dehors
    let roomsOverlay = document.querySelector('.rooms-overlay');
    if (!roomsOverlay) {
        roomsOverlay = document.createElement('div');
        roomsOverlay.className = 'rooms-overlay';
        document.body.appendChild(roomsOverlay);
        
        // Fermer au clic sur l'overlay
        roomsOverlay.addEventListener('click', function(e) {
            console.log("📌 Fermeture via overlay des salles");
            e.preventDefault();
            e.stopPropagation();
            
            const roomsSection = document.querySelector('.rooms-section');
            if (roomsSection) {
                roomsSection.classList.remove('visible');
                this.classList.remove('visible');
                updateRoomsButtonsText(false);
            }
        });
    }
    
    // Attacher aux boutons d'affichage
    setupRoomsButtons();
    
    // Créer la structure améliorée si nécessaire
    enhanceRoomsSection();
    
    // Observer les changements dans le DOM pour s'assurer que les fonctionnalités s'appliquent
    // même lorsque de nouveaux éléments sont ajoutés dynamiquement
    observeDOMChanges();
    
    /**
     * Améliore la section des salles pour une meilleure présentation
     */
    function enhanceRoomsSection() {
        // Trouver ou créer la section des salles
        let roomsSection = document.querySelector('.rooms-section');
        if (!roomsSection) {
            roomsSection = document.createElement('div');
            roomsSection.className = 'rooms-section';
            document.body.appendChild(roomsSection);
        }
        
        // Forcer le positionnement centré
        roomsSection.style.position = 'fixed';
        roomsSection.style.top = '50%';
        roomsSection.style.left = '50%';
        roomsSection.style.transform = 'translate(-50%, -50%)';
        roomsSection.style.width = '70%';
        roomsSection.style.maxWidth = '800px';
        roomsSection.style.margin = '0';
        
        // Ajouter un titre et un bouton de fermeture s'ils n'existent pas déjà
        const roomsContainer = roomsSection.querySelector('.rooms');
        if (roomsContainer && !roomsSection.querySelector('.rooms-section-title')) {
            // Ajouter le titre
            const title = document.createElement('h3');
            title.className = 'rooms-section-title';
            title.innerHTML = '<i class="fas fa-door-open"></i> Salles disponibles';
            
            // Ajouter le bouton de fermeture
            const closeButton = document.createElement('button');
            closeButton.className = 'rooms-section-close';
            closeButton.innerHTML = '&times;';
            closeButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                roomsSection.classList.remove('visible');
                document.querySelector('.rooms-overlay').classList.remove('visible');
                updateRoomsButtonsText(false);
            });
            
            // Insérer avant le conteneur des salles
            roomsSection.insertBefore(title, roomsContainer);
            roomsSection.insertBefore(closeButton, roomsContainer);
        }
        
        // Si pas de conteneur de salles, créer un exemple
        if (!roomsContainer) {
            const container = document.createElement('div');
            container.className = 'rooms';
            roomsSection.appendChild(container);
            
            // Copier les cartes de salle existantes si disponibles
            const existingCards = document.querySelectorAll('.room-card');
            if (existingCards.length > 0) {
                existingCards.forEach(card => {
                    container.appendChild(card.cloneNode(true));
                });
            }
        }
    }
    
    /**
     * Configure les boutons pour afficher les salles
     */
    function setupRoomsButtons() {
        const toggleButtons = document.querySelectorAll('.toggle-rooms-button, #toggleRoomsBtn, #showRoomsBtn, [id*="Room"], .rooms-toggle-button-floating, button[id*="salle"], [id*="Afficher"], [title*="salle"], button:contains("salles"), button:contains("Salles"), #showRooms, [id*="afficher"]');
        
        toggleButtons.forEach(button => {
            if (button && !button.hasAttribute('data-rooms-grid-handler')) {
                console.log("📌 Configuration du bouton d'affichage des salles:", button);
                
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
                    const roomsOverlay = document.querySelector('.rooms-overlay');
                    if (!roomsSection) return;
                    
                    const isVisible = roomsSection.classList.contains('visible');
                    
                    // Afficher ou masquer selon l'état actuel
                    if (!isVisible) {
                        console.log("📌 Affichage des salles");
                        roomsSection.classList.add('visible');
                        if (roomsOverlay) roomsOverlay.classList.add('visible');
                    } else {
                        console.log("📌 Masquage des salles");
                        roomsSection.classList.remove('visible');
                        if (roomsOverlay) roomsOverlay.classList.remove('visible');
                    }
                    
                    // Mettre à jour les textes des boutons
                    updateRoomsButtonsText(!isVisible);
                });
                
                // Marquer comme traité
                newButton.setAttribute('data-rooms-grid-handler', 'true');
            }
        });
    }
    
    /**
     * Mise à jour du texte des boutons d'affichage des salles
     */
    function updateRoomsButtonsText(isVisible) {
        const buttons = document.querySelectorAll('#showRoomsBtn, .toggle-rooms-button, #toggleRoomsBtn, .rooms-toggle-button-floating');
        
        buttons.forEach(button => {
            if (button) {
                if (isVisible) {
                    button.innerHTML = button.innerHTML.replace('Afficher', 'Masquer').replace('fa-door-open', 'fa-door-closed');
                } else {
                    button.innerHTML = button.innerHTML.replace('Masquer', 'Afficher').replace('fa-door-closed', 'fa-door-open');
                }
            }
        });
    }
    
    /**
     * Observe les changements du DOM pour appliquer les améliorations aux nouveaux éléments
     */
    function observeDOMChanges() {
        const observer = new MutationObserver(function(mutations) {
            let shouldReapply = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Vérifier si des éléments pertinents ont été ajoutés
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element node
                            if (node.classList && (
                                node.classList.contains('room-card') || 
                                node.classList.contains('rooms-section') || 
                                node.classList.contains('toggle-rooms-button')
                            )) {
                                shouldReapply = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldReapply) {
                console.log("📌 Changements DOM détectés, réapplication des optimisations pour les salles");
                setupRoomsButtons();
                enhanceRoomsSection();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
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
