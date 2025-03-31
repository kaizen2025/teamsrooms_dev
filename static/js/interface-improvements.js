/**
 * SOLUTION COMPLÈTE - Correction de tous les problèmes visuels et fonctionnels
 * Version 10.0 - Refonte visuelle et fonctionnelle harmonieuse
 * 
 * Corrections apportées :
 * 1. Alignement de l'heure et du menu pour éviter les superpositions
 * 2. Centrage et positionnement optimal de la liste des salles
 * 3. Fermeture automatique au clic dans le vide
 * 4. Suppression des infos de synchronisation
 * 5. Réduction de la largeur de la bannière du bas
 * 6. Augmentation de la transparence des éléments
 * 7. Optimisation de l'affichage des salles en grille
 * 8. Connexion directe aux réunions Teams
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Initialisation de la solution complète v10.0");
    
    // Éviter les doubles initialisations
    if (window._completeSolutionInitialized) {
        console.log("⚠️ Solution déjà initialisée, abandon");
        return;
    }
    
    // Marquer comme initialisé
    window._completeSolutionInitialized = true;
    
    // Appliquer toutes les améliorations
    setTimeout(() => {
        try {
            // 1. Aligner correctement l'heure et le menu
            fixHeaderAlignment();
            
            // 2. Optimiser l'affichage des salles
            enhanceRoomsDisplay();
            
            // 3. Masquer les informations de synchronisation
            hideAllSyncInfo();
            
            // 4. Réduire la largeur de la bannière du bas
            reduceFooterWidth();
            
            // 5. Augmenter la transparence des éléments
            increaseTransparency();
            
            // 6. Améliorer la fonctionnalité de jointure des réunions Teams
            improveTeamsJoin();
            
            // 7. Fermeture au clic en dehors des menus et des salles
            setupOutsideClickHandlers();
            
            console.log("✅ Améliorations appliquées avec succès");
            
            // Ajouter un message de succès temporaire
            showSuccessMessage("Interface optimisée avec succès");
        } catch (error) {
            console.error("❌ Erreur lors de l'application des améliorations:", error);
            
            // Réessayer après un court délai
            setTimeout(() => {
                console.log("🔄 Nouvelle tentative...");
                fixHeaderAlignment();
                enhanceRoomsDisplay();
                hideAllSyncInfo();
                reduceFooterWidth();
                increaseTransparency();
                improveTeamsJoin();
                setupOutsideClickHandlers();
            }, 500);
        }
    }, 200);
});

/**
 * Corrige l'alignement de l'en-tête pour éviter les superpositions
 */
function fixHeaderAlignment() {
    console.log("📐 Correction de l'alignement de l'en-tête");
    
    // Ajouter des styles pour corriger l'alignement
    addStylesheet(`
        /* Amélioration de l'alignement de l'en-tête */
        .header {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 10px 15px !important;
            background-color: rgba(30, 30, 30, 0.7) !important;
            backdrop-filter: blur(10px) !important;
        }
        
        /* Décaler l'horloge pour éviter le chevauchement avec le menu */
        .datetime {
            margin-left: 70px !important;
            background-color: rgba(40, 40, 40, 0.7) !important;
            padding: 8px 15px !important;
            border-radius: 12px !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        
        /* Améliorer l'apparence du bouton de menu */
        .menu-toggle-visible {
            background-color: rgba(50, 50, 50, 0.8) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 8px !important;
            width: 40px !important;
            height: 40px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 1000 !important;
            position: relative !important;
        }
        
        /* Améliorer l'espacement du titre */
        .title-container {
            position: absolute !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            text-align: center !important;
        }
        
        /* Assurer que le titre est visible et bien centré */
        .title {
            background-color: rgba(40, 40, 40, 0.7) !important;
            padding: 8px 20px !important;
            border-radius: 12px !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            white-space: nowrap !important;
        }
    `, 'header-alignment-styles');
    
    // Application directe aux éléments
    const datetimeEl = document.querySelector('.datetime');
    const menuToggle = document.querySelector('.menu-toggle-visible');
    
    if (datetimeEl) {
        datetimeEl.style.marginLeft = '70px';
        datetimeEl.style.backgroundColor = 'rgba(40, 40, 40, 0.7)';
        datetimeEl.style.padding = '8px 15px';
        datetimeEl.style.borderRadius = '12px';
    }
    
    if (menuToggle) {
        menuToggle.style.backgroundColor = 'rgba(50, 50, 50, 0.8)';
        menuToggle.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        menuToggle.style.borderRadius = '8px';
        menuToggle.style.width = '40px';
        menuToggle.style.height = '40px';
        menuToggle.style.display = 'flex';
        menuToggle.style.alignItems = 'center';
        menuToggle.style.justifyContent = 'center';
    }
}

/**
 * Améliore l'affichage de la section des salles
 */
function enhanceRoomsDisplay() {
    console.log("🏢 Amélioration de l'affichage des salles");
    
    // Styles pour la section des salles
    addStylesheet(`
        /* Styles optimisés pour la section des salles */
        .rooms-section {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 70% !important;
            max-width: 800px !important;
            max-height: 80vh !important;
            background-color: rgba(30, 30, 30, 0.85) !important;
            backdrop-filter: blur(15px) !important;
            border-radius: 15px !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
            z-index: 9999 !important;
            padding: 20px !important;
            display: none !important;
            opacity: 0 !important;
            transition: opacity 0.3s ease, transform 0.3s ease !important;
            overflow: auto !important;
        }
        
        /* Classe pour afficher la section des salles */
        .rooms-section.visible {
            display: block !important;
            opacity: 1 !important;
            transform: translate(-50%, -50%) scale(1) !important;
        }
        
        /* Overlay pour fermer au clic en dehors */
        .rooms-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            background-color: rgba(0, 0, 0, 0.5) !important;
            backdrop-filter: blur(3px) !important;
            z-index: 9998 !important;
            display: none !important;
            opacity: 0 !important;
            transition: opacity 0.3s ease !important;
        }
        
        /* Classe pour afficher l'overlay */
        .rooms-overlay.visible {
            display: block !important;
            opacity: 1 !important;
        }
        
        /* Disposition en grille pour les salles */
        .rooms {
            display: grid !important;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
            grid-gap: 15px !important;
            padding: 10px !important;
        }
        
        /* Style des cartes de salle */
        .room-card {
            background-color: rgba(50, 50, 50, 0.5) !important;
            backdrop-filter: blur(5px) !important;
            border-radius: 10px !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            padding: 15px !important;
            height: 120px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            align-items: center !important;
            transition: all 0.2s ease !important;
            cursor: pointer !important;
            text-align: center !important;
        }
        
        /* Effet de survol des cartes */
        .room-card:hover {
            transform: translateY(-5px) !important;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2) !important;
            background-color: rgba(60, 60, 60, 0.7) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
        }
        
        /* Titre de la section des salles */
        .rooms-section-title {
            color: white !important;
            text-align: center !important;
            margin-top: 0 !important;
            margin-bottom: 15px !important;
            padding-bottom: 10px !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        
        /* Bouton de fermeture */
        .rooms-section-close {
            position: absolute !important;
            top: 15px !important;
            right: 15px !important;
            background-color: rgba(255, 255, 255, 0.1) !important;
            border: none !important;
            color: white !important;
            width: 30px !important;
            height: 30px !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            font-size: 18px !important;
            transition: background-color 0.2s ease !important;
        }
        
        .rooms-section-close:hover {
            background-color: rgba(255, 255, 255, 0.2) !important;
        }
    `, 'rooms-display-styles');
    
    // Vérifier si l'overlay existe déjà
    let roomsOverlay = document.querySelector('.rooms-overlay');
    if (!roomsOverlay) {
        roomsOverlay = document.createElement('div');
        roomsOverlay.className = 'rooms-overlay';
        document.body.appendChild(roomsOverlay);
    }
    
    // S'assurer que la section des salles a un titre et un bouton de fermeture
    let roomsSection = document.querySelector('.rooms-section');
    if (roomsSection) {
        // Vérifier si le titre existe
        if (!roomsSection.querySelector('.rooms-section-title')) {
            const title = document.createElement('h3');
            title.className = 'rooms-section-title';
            title.innerHTML = '<i class="fas fa-door-open"></i> Salles disponibles';
            roomsSection.insertBefore(title, roomsSection.firstChild);
        }
        
        // Vérifier si le bouton de fermeture existe
        if (!roomsSection.querySelector('.rooms-section-close')) {
            const closeButton = document.createElement('button');
            closeButton.className = 'rooms-section-close';
            closeButton.innerHTML = '&times;';
            closeButton.addEventListener('click', function() {
                roomsSection.classList.remove('visible');
                roomsOverlay.classList.remove('visible');
                updateRoomsButtonText(false);
            });
            roomsSection.appendChild(closeButton);
        }
    }
    
    // Mettre à jour les gestionnaires d'événements pour les boutons d'affichage des salles
    const roomButtons = document.querySelectorAll('.toggle-rooms-button, #showRoomsBtn, button[id*="Room"], .rooms-toggle-button-floating');
    roomButtons.forEach(button => {
        if (button && !button._hasRoomsHandler) {
            // Supprimer les gestionnaires existants
            const newButton = button.cloneNode(true);
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
            }
            
            // Ajouter le nouveau gestionnaire
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (roomsSection) {
                    const isVisible = roomsSection.classList.contains('visible');
                    
                    if (!isVisible) {
                        roomsSection.classList.add('visible');
                        roomsOverlay.classList.add('visible');
                        updateRoomsButtonText(true);
                    } else {
                        roomsSection.classList.remove('visible');
                        roomsOverlay.classList.remove('visible');
                        updateRoomsButtonText(false);
                    }
                }
            });
            
            // Marquer comme traité
            newButton._hasRoomsHandler = true;
        }
    });
    
    // Fermer au clic sur l'overlay
    roomsOverlay.addEventListener('click', function() {
        if (roomsSection) {
            roomsSection.classList.remove('visible');
            roomsOverlay.classList.remove('visible');
            updateRoomsButtonText(false);
        }
    });
}

/**
 * Masque aggressivement toutes les informations de synchronisation
 */
function hideAllSyncInfo() {
    console.log("🙈 Masquage des informations de synchronisation");
    
    // Styles pour masquer les infos de synchro
    addStylesheet(`
        /* Masquage des informations de synchronisation */
        [id*="synchro"], 
        [class*="synchro"], 
        .sync-info, 
        .last-sync, 
        .datetime-info,
        [data-sync-info],
        div:has(> [id*="synchro"]),
        div:has(> [class*="synchro"]),
        div:has(span:contains("Dernière")),
        div:has(span:contains("dernière")),
        div:has(span:contains("synchro")),
        div:has(span:contains("Synchro")),
        div:has(span:contains("mise à jour")),
        span:contains("Dernière"),
        span:contains("dernière"),
        span:contains("synchro"),
        span:contains("Synchro"),
        span:contains("mise à jour") {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            overflow: hidden !important;
            position: absolute !important;
            pointer-events: none !important;
            opacity: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
        }
    `, 'hide-sync-info-styles');
    
    // Masquer directement tous les éléments potentiels
    const syncElements = document.querySelectorAll('[id*="synchro"], [class*="synchro"], .sync-info, .last-sync');
    syncElements.forEach(element => {
        if (element) {
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
    
    // Rechercher par texte
    document.querySelectorAll('*').forEach(element => {
        try {
            const text = element.textContent.toLowerCase();
            if (text.includes('dernière') || 
                text.includes('synchro') || 
                text.includes('mise à jour')) {
                element.style.display = 'none';
            }
        } catch (e) {}
    });
}

/**
 * Réduit la largeur de la bannière du bas
 */
function reduceFooterWidth() {
    console.log("📏 Réduction de la largeur de la bannière du bas");
    
    // Styles pour réduire la largeur
    addStylesheet(`
        /* Réduction de la largeur de la bannière du bas */
        .controls-container, 
        .footer-banner, 
        .app-footer,
        .bottom-controls {
            width: 40% !important;
            max-width: 500px !important;
            min-width: 400px !important;
            margin: 0 auto !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            border-radius: 15px 15px 0 0 !important;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1) !important;
            background-color: rgba(30, 30, 30, 0.7) !important;
            backdrop-filter: blur(10px) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            padding: 10px !important;
            display: flex !important;
            justify-content: center !important;
            flex-wrap: wrap !important;
            gap: 10px !important;
            position: fixed !important;
            bottom: 0 !important;
            z-index: 1000 !important;
        }
        
        /* Ajustement pour mobile */
        @media (max-width: 768px) {
            .controls-container, 
            .footer-banner, 
            .app-footer,
            .bottom-controls {
                width: 100% !important;
                min-width: unset !important;
                border-radius: 0 !important;
            }
        }
        
        /* Améliorer l'apparence des boutons */
        .controls-container button,
        .footer-banner button,
        .app-footer button,
        .bottom-controls button {
            background-color: rgba(50, 50, 50, 0.8) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 8px !important;
            padding: 8px 12px !important;
            color: white !important;
            font-size: 14px !important;
            transition: all 0.2s ease !important;
            margin: 0 5px !important;
        }
        
        .controls-container button:hover,
        .footer-banner button:hover,
        .app-footer button:hover,
        .bottom-controls button:hover {
            background-color: rgba(60, 60, 60, 0.9) !important;
            transform: translateY(-2px) !important;
        }
    `, 'reduced-footer-styles');
    
    // Application directe
    const footerElements = document.querySelectorAll('.controls-container, .footer-banner, .app-footer, .bottom-controls');
    footerElements.forEach(element => {
        if (element) {
            element.style.width = '40%';
            element.style.maxWidth = '500px';
            element.style.minWidth = '400px';
            element.style.margin = '0 auto';
            element.style.left = '50%';
            element.style.transform = 'translateX(-50%)';
            element.style.borderRadius = '15px 15px 0 0';
            element.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
            element.style.backdropFilter = 'blur(10px)';
        }
    });
}

/**
 * Augmente la transparence des éléments
 */
function increaseTransparency() {
    console.log("🔍 Augmentation de la transparence des éléments");
    
    // Styles pour la transparence
    addStylesheet(`
        /* Augmentation de la transparence */
        .header {
            background-color: rgba(30, 30, 30, 0.7) !important;
            backdrop-filter: blur(10px) !important;
        }
        
        .meetings-container {
            background-color: rgba(30, 30, 30, 0.6) !important;
            backdrop-filter: blur(10px) !important;
            border-radius: 15px !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            overflow: hidden !important;
        }
        
        .meetings-title-bar {
            background-color: rgba(40, 40, 40, 0.7) !important;
            backdrop-filter: blur(5px) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        
        .meeting-item {
            background-color: rgba(45, 45, 45, 0.7) !important;
            backdrop-filter: blur(5px) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 10px !important;
            margin-bottom: 10px !important;
            transition: all 0.2s ease !important;
        }
        
        .meeting-item:hover {
            background-color: rgba(55, 55, 55, 0.8) !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1) !important;
        }
        
        .meeting-id-entry {
            background-color: rgba(40, 40, 40, 0.7) !important;
            backdrop-filter: blur(5px) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
            padding: 15px !important;
        }
        
        .side-menu {
            background-color: rgba(25, 25, 25, 0.85) !important;
            backdrop-filter: blur(15px) !important;
            border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
    `, 'transparency-styles');
}

/**
 * Améliore la fonctionnalité de jointure des réunions Teams
 */
function improveTeamsJoin() {
    console.log("🔄 Amélioration de la jointure Teams");
    
    // Remplacer la fonction de jointure Teams
    window.joinMeetingWithId = function(meetingId) {
        if (!meetingId) {
            const input = document.getElementById('meeting-id');
            if (input) meetingId = input.value.trim();
        }
        
        if (!meetingId) {
            alert("Veuillez entrer l'ID de la réunion");
            return;
        }
        
        // Supprimer les espaces dans l'ID
        meetingId = meetingId.replace(/\s+/g, '');
        
        // Construire l'URL directe de Teams
        const teamsUrl = `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${meetingId}%40thread.v2/0`;
        
        // Ouvrir dans un nouvel onglet
        window.open(teamsUrl, "_blank");
    };
    
    // Attacher la fonction au bouton de jointure
    const joinButton = document.getElementById('joinMeetingBtn');
    if (joinButton) {
        joinButton.onclick = function(e) {
            e.preventDefault();
            window.joinMeetingWithId();
        };
    }
    
    // Améliorer également la fonctionnalité pour les boutons de jointure des réunions listées
    document.querySelectorAll('.meeting-join-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const meetingId = this.getAttribute('data-meeting-id') || 
                              this.closest('.meeting-item')?.getAttribute('data-id');
            
            if (meetingId) {
                window.joinMeetingWithId(meetingId);
            } else {
                const url = this.getAttribute('data-url') || 
                            this.closest('.meeting-item')?.getAttribute('data-url');
                if (url) {
                    window.open(url, "_blank");
                }
            }
        });
    });
}

/**
 * Configure les gestionnaires pour fermer au clic en dehors
 */
function setupOutsideClickHandlers() {
    console.log("👆 Configuration des gestionnaires de clic extérieur");
    
    // Pour le menu latéral
    document.addEventListener('click', function(e) {
        const sideMenu = document.querySelector('.side-menu');
        const menuToggle = document.querySelector('.menu-toggle-visible');
        const menuOverlay = document.querySelector('.menu-overlay');
        
        if (sideMenu && 
            sideMenu.classList.contains('expanded') && 
            !sideMenu.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            
            sideMenu.classList.remove('expanded');
            document.querySelector('.main-container')?.classList.remove('menu-expanded');
            if (menuOverlay) menuOverlay.classList.remove('active');
        }
    });
    
    // L'overlay des salles est déjà configuré dans enhanceRoomsDisplay()
}

/**
 * Met à jour le texte des boutons d'affichage des salles
 */
function updateRoomsButtonText(isVisible) {
    const toggleButtons = document.querySelectorAll('.toggle-rooms-button, #showRoomsBtn, button[id*="Room"], .rooms-toggle-button-floating');
    
    const newTextLong = isVisible ? 
        '<i class="fas fa-door-closed"></i> Masquer les salles disponibles' : 
        '<i class="fas fa-door-open"></i> Afficher les salles disponibles';
    
    const newTextShort = isVisible ? 
        '<i class="fas fa-door-closed"></i> Masquer les salles' : 
        '<i class="fas fa-door-open"></i> Afficher les salles';
    
    toggleButtons.forEach(button => {
        if (button) {
            // Version longue ou courte selon la taille du bouton/écran
            button.innerHTML = window.innerWidth <= 768 ? newTextShort : newTextLong;
        }
    });
}

/**
 * Ajoute une feuille de style à la page
 */
function addStylesheet(cssText, id) {
    // Vérifier si la feuille de style existe déjà
    let styleElement = id ? document.getElementById(id) : null;
    
    if (!styleElement) {
        styleElement = document.createElement('style');
        if (id) styleElement.id = id;
        document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = cssText;
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
