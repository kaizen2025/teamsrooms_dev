/**
 * Optimisations de performance pour l'application de réservation de salles
 * Ce fichier contient des améliorations ciblées pour résoudre les problèmes de fluidité
 */

document.addEventListener('DOMContentLoaded', function() {
    // Application des optimisations
    optimizeMenuToggle();
    optimizeRoomsDisplay();
    applyGlobalOptimizations();
});

/**
 * Optimise le comportement du toggle du menu principal
 * - Utilise transform au lieu de margin/width pour l'animation
 * - Élimine les requêtes forcées de layout
 * - Réduit les manipulations DOM répétées
 */
function optimizeMenuToggle() {
    const menuToggle = document.querySelector('.menu-toggle-visible');
    const sideMenu = document.querySelector('.side-menu');
    const mainContainer = document.querySelector('.main-container');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    if (!menuToggle || !sideMenu || !mainContainer) return;
    
    // Supprimer tous les écouteurs existants pour éviter les doublons
    const newMenuToggle = menuToggle.cloneNode(true);
    menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);
    
    // Ajouter les styles de performance
    addGlobalStyles(`
        .side-menu {
            will-change: transform;
            transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            transform: translateX(-100%);
        }
        
        .side-menu.expanded {
            transform: translateX(0);
        }
        
        .main-container {
            will-change: transform;
            transition: padding-left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                        transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .menu-overlay {
            transition: opacity 0.3s ease, visibility 0.3s ease;
            opacity: 0;
            visibility: hidden;
            will-change: opacity;
        }
        
        .menu-overlay.active {
            opacity: 1;
            visibility: visible;
        }
    `);
    
    // Optimiser le menu en déléguant les écouteurs d'événements
    let isMenuExpanded = false;
    newMenuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Utiliser requestAnimationFrame pour optimiser les modifications DOM
        requestAnimationFrame(() => {
            isMenuExpanded = !isMenuExpanded;
            
            // Appliquer toutes les modifications en une seule passe
            sideMenu.classList.toggle('expanded', isMenuExpanded);
            mainContainer.classList.toggle('menu-expanded', isMenuExpanded);
            
            if (menuOverlay) {
                menuOverlay.classList.toggle('active', isMenuExpanded);
            }
        });
    });
    
    // Optimiser la fermeture du menu via l'overlay
    if (menuOverlay) {
        const newMenuOverlay = menuOverlay.cloneNode(true);
        menuOverlay.parentNode.replaceChild(newMenuOverlay, menuOverlay);
        
        newMenuOverlay.addEventListener('click', function() {
            requestAnimationFrame(() => {
                isMenuExpanded = false;
                sideMenu.classList.remove('expanded');
                mainContainer.classList.remove('menu-expanded');
                newMenuOverlay.classList.remove('active');
            });
        });
    }
}

/**
 * Optimise l'affichage et la performance des salles
 * - Précharge les données des salles
 * - Améliore les transitions avec will-change
 * - Évite les calculs répétés inutiles
 */
function optimizeRoomsDisplay() {
    const roomsSection = document.querySelector('.rooms-section');
    const toggleButtons = document.querySelectorAll('.toggle-rooms-button, #toggleRoomsBtn, .rooms-toggle-button-floating');
    
    if (!roomsSection || toggleButtons.length === 0) return;
    
    // Ajouter les styles optimisés pour l'affichage des salles
    addGlobalStyles(`
        .rooms-section {
            will-change: transform, opacity;
            transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                        opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            transform: translateY(20px);
            opacity: 0;
            pointer-events: none;
            position: fixed;
            z-index: 100;
            top: 20%;
            left: 0;
            right: 0;
            margin: 0 auto;
            max-width: 90%;
            max-height: 70vh;
            overflow-y: auto;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
            background: rgba(40, 40, 40, 0.95);
            backdrop-filter: blur(10px);
            padding: 20px;
        }
        
        .rooms-section.visible {
            transform: translateY(0);
            opacity: 1;
            pointer-events: auto;
        }
        
        .room-card {
            will-change: transform;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .room-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
    `);
    
    // Pré-rendre les cartes de salle pour éviter les calculs coûteux lors de l'affichage
    preRenderRoomCards();
    
    // Flag pour suivre l'état visible/masqué
    let isRoomsVisible = false;
    
    // Utiliser la délégation d'événements pour tous les boutons
    document.addEventListener('click', function(e) {
        const toggleButton = e.target.closest('.toggle-rooms-button, #toggleRoomsBtn, .rooms-toggle-button-floating');
        
        if (toggleButton) {
            e.preventDefault();
            
            // Utiliser requestAnimationFrame pour améliorer la performance
            requestAnimationFrame(() => {
                isRoomsVisible = !isRoomsVisible;
                roomsSection.classList.toggle('visible', isRoomsVisible);
                
                // Mettre à jour le texte de tous les boutons en une seule fois
                updateRoomButtonsText(isRoomsVisible);
            });
        }
        
        // Fermer au clic en dehors
        if (isRoomsVisible && !roomsSection.contains(e.target) && !e.target.closest('.toggle-rooms-button, #toggleRoomsBtn, .rooms-toggle-button-floating')) {
            requestAnimationFrame(() => {
                isRoomsVisible = false;
                roomsSection.classList.remove('visible');
                updateRoomButtonsText(false);
            });
        }
    });
    
    // Précharger les données de salles une seule fois
    function preRenderRoomCards() {
        if (!window.SALLES || Object.keys(window.SALLES).length === 0) return;
        
        const roomsContainer = roomsSection.querySelector('.rooms');
        if (!roomsContainer) return;
        
        // Mémoriser le contenu initial
        const originalContent = roomsContainer.innerHTML;
        const hasRoomCards = roomsContainer.querySelector('.room-card') !== null;
        
        // Ne pas re-rendre si des cartes existent déjà
        if (hasRoomCards) return;
        
        // Créer un fragment pour éviter les reflows multiples
        const fragment = document.createDocumentFragment();
        
        for (const [roomName, roomEmail] of Object.entries(window.SALLES)) {
            const card = document.createElement('div');
            card.className = 'room-card available';
            card.dataset.room = roomName.toLowerCase();
            
            card.innerHTML = `
                <div class="room-name">${roomName}</div>
                <div class="room-status">
                    <span class="status-icon available"></span> Disponible
                </div>
            `;
            
            // Ajouter au fragment
            fragment.appendChild(card);
        }
        
        // Ajouter le fragment au DOM une seule fois
        roomsContainer.innerHTML = '';
        roomsContainer.appendChild(fragment);
    }
    
    // Mettre à jour le texte des boutons de manière optimisée
    function updateRoomButtonsText(isVisible) {
        const showText = '<i class="fas fa-door-open"></i> Afficher les salles';
        const hideText = '<i class="fas fa-times"></i> Masquer les salles';
        
        toggleButtons.forEach(button => {
            if (button) button.innerHTML = isVisible ? hideText : showText;
        });
    }
}

/**
 * Applique des optimisations globales à l'application
 * - Améliore la performance des scrolls et animations
 * - Optimise l'utilisation des ressources
 * - Réduit les calculs inutiles
 */
function applyGlobalOptimizations() {
    // 1. Optimiser les animations de rendu
    optimizeRendering();
    
    // 2. Réduire la fréquence des mises à jour des réunions
    optimizeMeetingsRefresh();
    
    // 3. Améliorer la gestion des images d'arrière-plan
    optimizeBackgroundImages();
    
    // 4. Optimiser le bouton Rejoindre pour une meilleure réactivité
    optimizeJoinButton();
}

/**
 * Ajoute des styles globaux d'optimisation au document
 */
function addGlobalStyles(cssText) {
    // Vérifier si un style avec le même contenu existe déjà
    const existingStyles = document.querySelectorAll('style');
    for (const style of existingStyles) {
        if (style.textContent === cssText) return;
    }
    
    const styleElement = document.createElement('style');
    styleElement.textContent = cssText;
    document.head.appendChild(styleElement);
}

/**
 * Optimise le rendu et les animations
 */
function optimizeRendering() {
    addGlobalStyles(`
        /* Prévention de layout thrashing */
        .main-container, .header, .meetings-container, .controls-container {
            will-change: transform;
            transform: translateZ(0);
            backface-visibility: hidden;
        }
        
        /* Optimisation des animations */
        .meeting-item, .room-card, .popup, .modal, button {
            will-change: transform, opacity;
            backface-visibility: hidden;
        }
        
        /* Prévention des reflows sur hover */
        button:hover, .menu-item:hover, .meeting-item:hover {
            will-change: transform, background-color;
        }
        
        /* Faciliter le travail du GPU */
        #background-container {
            will-change: opacity;
            transform: translateZ(0);
        }
    `);
    
    // Éviter les mises à jour DOM inutiles pendant le défilement
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) return;
        
        scrollTimeout = setTimeout(function() {
            scrollTimeout = null;
        }, 100);
    }, { passive: true });
}

/**
 * Optimise la fréquence des mises à jour des réunions
 */
function optimizeMeetingsRefresh() {
    // Si une fonction de rafraîchissement existe, réduire sa fréquence
    if (typeof window.fetchMeetings === 'function') {
        // Remplacer par une version optimisée
        const originalFetchMeetings = window.fetchMeetings;
        
        window.fetchMeetings = function(forceVisibleUpdate = false) {
            // Si un rafraîchissement est déjà en cours, ne pas en lancer un autre
            if (window.isLoadingMeetings) return;
            
            // Limiter la fréquence des mises à jour forcées
            const now = Date.now();
            if (!forceVisibleUpdate && (now - window.lastRefreshTime) < 5000) {
                return;
            }
            
            // Appeler la fonction d'origine
            originalFetchMeetings(forceVisibleUpdate);
        };
    }
    
    // Optimiser les mises à jour des chronomètres
    const originalUpdateMeetingTimers = window.updateMeetingTimers;
    if (typeof originalUpdateMeetingTimers === 'function') {
        window.updateMeetingTimers = function() {
            // Utiliser requestAnimationFrame pour synchroniser avec les rafraîchissements d'écran
            requestAnimationFrame(() => {
                originalUpdateMeetingTimers();
            });
        };
    }
}

/**
 * Optimise le chargement et l'affichage des images d'arrière-plan
 */
function optimizeBackgroundImages() {
    const backgroundContainer = document.getElementById('background-container');
    if (!backgroundContainer) return;
    
    // Ajouter des styles d'optimisation
    addGlobalStyles(`
        #background-container {
            will-change: background-image;
            transform: translateZ(0);
            transition: opacity 0.5s ease;
        }
    `);
    
    // Précharger la prochaine image en arrière-plan
    if (window.BackgroundSystem && window.BACKGROUNDS && window.BACKGROUNDS.length > 0) {
        // Précharger la première image si ce n'est pas déjà fait
        if (!backgroundContainer.style.backgroundImage) {
            const firstImage = window.BACKGROUNDS[0];
            const img = new Image();
            img.onload = () => {
                backgroundContainer.style.backgroundImage = `url('${firstImage}')`;
            };
            img.src = firstImage;
        }
        
        // Optimiser la fonction de rotation d'arrière-plan
        const originalNextBackground = window.BackgroundSystem.nextBackground;
        if (typeof originalNextBackground === 'function') {
            window.BackgroundSystem.nextBackground = function() {
                const nextIndex = (this.currentBackgroundIndex + 1) % this.backgrounds.length;
                const nextImage = this.backgrounds[nextIndex];
                
                // Précharger l'image avant de l'afficher
                const img = new Image();
                img.onload = () => {
                    originalNextBackground.call(window.BackgroundSystem);
                };
                img.src = nextImage;
            };
        }
    }
}

/**
 * Optimise le comportement du bouton Rejoindre
 */
function optimizeJoinButton() {
    // Utiliser la délégation d'événements pour tous les boutons de jointure
    document.addEventListener('click', function(e) {
        const joinButton = e.target.closest('.meeting-join-btn');
        if (!joinButton) return;
        
        e.preventDefault();
        
        // Empêcher les clics multiples
        if (joinButton.dataset.joining === 'true') return;
        joinButton.dataset.joining = 'true';
        
        // Effet visuel immédiat
        const originalText = joinButton.innerHTML;
        joinButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        // Récupérer l'URL ou l'ID
        const url = joinButton.dataset.url;
        
        setTimeout(() => {
            // Ouvrir l'URL si disponible
            if (url) {
                window.open(url, '_blank');
            }
            
            // Restaurer le bouton après un court délai
            setTimeout(() => {
                joinButton.innerHTML = originalText;
                joinButton.dataset.joining = 'false';
            }, 500);
        }, 10);
    });
}
