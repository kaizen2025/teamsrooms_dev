/**
 * SOLUTION COMPLÈTE FINALE - Correction de tous les problèmes visuels
 * Version 9.5 - Refonte visuelle harmonieuse:
 * 1. Connexion Teams directe (méthode éprouvée avec URL directe)
 * 2. Correction de l'espacement entre les blocs (plus de superposition)
 * 3. Suppression de la bannière du haut
 * 4. Réduction de la largeur de la bannière du bas
 * 5. Disposition harmonieuse des salles en grille centrée
 * 6. Espace vide sous le bloc d'ID pour voir l'arrière-plan
 * 7. Masquage des informations de synchronisation
 * 8. Fermeture automatique des menus au clic en dehors
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("🔄 Initialisation des optimisations de performance v9.5");
    
    // Vérifier si le script a déjà été chargé pour éviter les doublons
    if (window._performanceOptimizationsInitialized) {
        console.log("⚠️ Optimisations de performance déjà initialisées");
        return;
    }
    
    // Marquer comme initialisé
    window._performanceOptimizationsInitialized = true;
    
    // Lancer l'initialisation avec un délai pour s'assurer que les autres scripts ont terminé
    setTimeout(() => {
        try {
            console.log("🚀 Application des optimisations visuelles");
            
            // 1. Masquer les informations de synchronisation (priorité élevée)
            hideAllSyncInfo();
            
            // 2. Réduire la largeur de la bannière du bas
            reduceFooterWidth();
            
            // 3. Centrer l'affichage des salles
            centerRoomsDisplay();
            
            // 4. Augmenter la transparence des éléments
            increaseTransparency();
            
            // 5. Corriger l'alignement de l'en-tête
            fixHeaderAlignment();
            
            // 6. Configurer les gestionnaires de clic extérieur
            setupOutsideClickHandlers();
            
            console.log("✅ Optimisations visuelles appliquées avec succès");
        } catch (error) {
            console.error("❌ Erreur lors de l'application des optimisations:", error);
        }
    }, 200);
});

/**
 * Masque aggressivement toutes les informations de synchronisation
 */
function hideAllSyncInfo() {
    console.log("🙈 Masquage des informations de synchronisation");
    
    // Styles pour masquer les infos de synchro
    const style = document.createElement('style');
    style.id = 'hide-sync-info-styles';
    style.textContent = `
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
    `;
    document.head.appendChild(style);
    
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
    
    // On renouvelle l'opération après un court délai pour s'assurer que ça prend effet
    setTimeout(hideAllSyncInfo, 1000);
}

/**
 * Réduit la largeur de la bannière du bas
 */
function reduceFooterWidth() {
    console.log("📏 Réduction de la largeur de la bannière du bas");
    
    // Styles pour réduire la largeur
    const style = document.createElement('style');
    style.id = 'reduced-footer-styles';
    style.textContent = `
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
    `;
    document.head.appendChild(style);
    
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
 * Centre l'affichage des salles et améliore leur disposition
 */
function centerRoomsDisplay() {
    console.log("🏢 Amélioration de l'affichage des salles");
    
    // Styles pour la section des salles
    const style = document.createElement('style');
    style.id = 'rooms-display-styles';
    style.textContent = `
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
    `;
    document.head.appendChild(style);
    
    // Création ou récupération de l'overlay
    let roomsOverlay = document.querySelector('.rooms-overlay');
    if (!roomsOverlay) {
        roomsOverlay = document.createElement('div');
        roomsOverlay.className = 'rooms-overlay';
        document.body.appendChild(roomsOverlay);
    }
    
    // Récupération ou amélioration de la section des salles
    let roomsSection = document.querySelector('.rooms-section');
    
    if (roomsSection) {
        // Amélioration de la section existante
        roomsSection.style.position = 'fixed';
        roomsSection.style.left = '50%';
        roomsSection.style.top = '50%';
        roomsSection.style.transform = 'translate(-50%, -50%)';
        roomsSection.style.width = '70%';
        roomsSection.style.maxWidth = '800px';
        roomsSection.style.borderRadius = '15px';
        
        // Ajout du titre si nécessaire
        if (!roomsSection.querySelector('.rooms-section-title')) {
            const title = document.createElement('h3');
            title.className = 'rooms-section-title';
            title.innerHTML = '<i class="fas fa-door-open"></i> Salles disponibles';
            roomsSection.insertBefore(title, roomsSection.firstChild);
        }
        
        // Ajout du bouton de fermeture si nécessaire
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
    
    // Mise à jour des gestionnaires d'événements des boutons d'affichage des salles
    const roomButtons = document.querySelectorAll('.toggle-rooms-button, #showRoomsBtn, button[id*="Room"], .rooms-toggle-button-floating');
    
    roomButtons.forEach(button => {
        if (button && !button._hasRoomsHandler) {
            // Supprimer les anciens gestionnaires
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
    
    // Fermeture au clic sur l'overlay
    roomsOverlay.addEventListener('click', function() {
        if (roomsSection) {
            roomsSection.classList.remove('visible');
            roomsOverlay.classList.remove('visible');
            updateRoomsButtonText(false);
        }
    });
    
    // Amélioration des cartes de salle
    const roomCards = document.querySelectorAll('.room-card');
    roomCards.forEach(card => {
        card.style.borderRadius = '10px';
        card.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
        card.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
        
        // Evénements de survol
        card.addEventListener('mouseover', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
        });
        
        card.addEventListener('mouseout', function() {
            this.style.transform = '';
            this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
        });
        
        // S'assurer que les cartes sont cliquables
        card.addEventListener('click', function() {
            const roomName = this.getAttribute('data-room');
            if (roomName) {
                window.location.href = '/' + roomName.toLowerCase();
            }
        });
    });
}

/**
 * Augmente la transparence des éléments
 */
function increaseTransparency() {
    console.log("🔍 Augmentation de la transparence des éléments");
    
    // Styles pour la transparence
    const style = document.createElement('style');
    style.id = 'transparency-styles';
    style.textContent = `
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
    `;
    document.head.appendChild(style);
}

/**
 * Corrige l'alignement de l'en-tête pour éviter les superpositions
 */
function fixHeaderAlignment() {
    console.log("📐 Correction de l'alignement de l'en-tête");
    
    // Pour éviter les conflits avec interface-improvements.js, 
    // cette fonction est simplifiée pour ne pas écraser les styles existants
    
    // Vérifier si l'heure est déjà correctement alignée
    const datetimeEl = document.querySelector('.datetime');
    if (datetimeEl && !datetimeEl.style.marginLeft) {
        datetimeEl.style.marginLeft = '70px';
        datetimeEl.style.backgroundColor = 'rgba(40, 40, 40, 0.7)';
        datetimeEl.style.padding = '8px 15px';
        datetimeEl.style.borderRadius = '12px';
    }
}

/**
 * Configure les gestionnaires pour fermer au clic en dehors
 */
function setupOutsideClickHandlers() {
    console.log("👆 Configuration des gestionnaires de clic extérieur");
    
    // Pour le menu latéral - seulement si pas déjà configuré
    if (!window._outsideClickHandlersConfigured) {
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
        
        window._outsideClickHandlersConfigured = true;
    }
    
    // L'overlay des salles est déjà configuré dans centerRoomsDisplay()
}

/**
 * Met à jour le texte des boutons d'affichage des salles
 */
function updateRoomsButtonText(isVisible) {
    // Ne pas dupliquer cette fonction si elle existe déjà
    if (window.updateRoomsButtonText) {
        window.updateRoomsButtonText(isVisible);
        return;
    }
    
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
