/**
 * SOLUTION COMPLÈTE FINALE v9.0
 * Optimisations visuelles sans perturber les fonctionnalités existantes
 * 
 * Modifications apportées:
 * 1. Masquage ciblé des informations de synchronisation
 * 2. Réduction et centrage de la barre inférieure
 * 3. Amélioration de l'affichage des salles
 * 4. Support mobile optimisé
 */

// Exécuter le code lors du chargement du document
document.addEventListener('DOMContentLoaded', function() {
    console.log("🔹 Initialisation des optimisations visuelles v9.0");
    
    // Éviter les exécutions multiples
    if (window._interfaceOptimizerInitialized) {
        return;
    }
    window._interfaceOptimizerInitialized = true;
    
    // Appliquer les correctifs visuels
    setTimeout(function() {
        applyVisualFixes();
    }, 300);
    
    // Réappliquer périodiquement pour s'assurer que les correctifs restent appliqués
    setInterval(applyVisualFixes, 2000);
});

/**
 * Applique tous les correctifs visuels
 */
function applyVisualFixes() {
    try {
        // 1. Masquer les infos de synchronisation
        hideLastSyncInfo();
        
        // 2. Optimiser la barre de contrôle
        optimizeControlBar();
        
        // 3. Améliorer l'affichage des salles
        enhanceRoomsDisplay();
        
        // 4. Configuration de la fermeture au clic en dehors
        setupClickOutsideToClose();
    } catch (error) {
        console.log("⚠️ Erreur lors de l'application des correctifs:", error);
    }
}

/**
 * 1. Masque spécifiquement les informations de dernière synchronisation
 * sans toucher aux conteneurs principaux
 */
function hideLastSyncInfo() {
    // Masquer uniquement les éléments spécifiques contenant des infos de synchro
    try {
        // Liste des éléments à vérifier
        const elementsToCheck = document.querySelectorAll('div, span, p');
        
        elementsToCheck.forEach(function(element) {
            // Ne JAMAIS masquer les conteneurs principaux
            if (element.classList.contains('main-container') || 
                element.classList.contains('meetings-container') || 
                element.classList.contains('meetings') || 
                element.classList.contains('meetings-list') || 
                element.classList.contains('rooms-section') ||
                element.classList.contains('control-buttons')) {
                return;
            }
            
            // Vérifier le texte de l'élément
            if (element.textContent) {
                const text = element.textContent.toLowerCase();
                if ((text.includes('dernière') && text.includes('synchro')) || 
                    text.includes('dernière sync') || 
                    text.includes('mise à jour:')) {
                    
                    // Masquer uniquement cet élément
                    element.style.display = 'none';
                    element.style.visibility = 'hidden';
                }
            }
        });
        
        // Masquer spécifiquement l'élément avec l'ID "derniere-synchro"
        const syncElement = document.querySelector('[id*="synchro"], [class*="synchro"], .sync-info, .last-sync');
        if (syncElement && !isMainContainer(syncElement)) {
            syncElement.style.display = 'none';
        }
    } catch (error) {
        console.log("Erreur lors du masquage des infos de synchronisation:", error);
    }
}

/**
 * Vérifie si un élément est un conteneur principal à ne pas masquer
 */
function isMainContainer(element) {
    return element.classList.contains('main-container') || 
           element.classList.contains('meetings-container') || 
           element.classList.contains('meetings') || 
           element.classList.contains('meetings-list') ||
           element.classList.contains('rooms-section');
}

/**
 * 2. Optimise la barre de contrôle en bas de l'écran
 */
function optimizeControlBar() {
    try {
        // Cibler la barre de contrôle
        const controlsBar = document.querySelector('.controls-container');
        if (!controlsBar) return;
        
        // Appliquer les styles directement
        controlsBar.style.width = isMobile() ? '90%' : '40%';
        controlsBar.style.maxWidth = '500px';
        controlsBar.style.minWidth = isMobile() ? 'auto' : '400px';
        controlsBar.style.margin = '0 auto';
        controlsBar.style.left = '50%';
        controlsBar.style.transform = 'translateX(-50%)';
        controlsBar.style.borderRadius = '15px 15px 0 0';
        controlsBar.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
        controlsBar.style.position = 'fixed';
        controlsBar.style.bottom = '0';
        controlsBar.style.zIndex = '1000';
        
        // S'assurer que les boutons sont bien arrangés
        const buttonContainer = controlsBar.querySelector('.control-buttons');
        if (buttonContainer) {
            buttonContainer.style.display = 'flex';
            buttonContainer.style.justifyContent = 'center';
            buttonContainer.style.flexWrap = 'wrap';
            buttonContainer.style.gap = '10px';
            buttonContainer.style.padding = '10px';
        }
    } catch (error) {
        console.log("Erreur lors de l'optimisation de la barre de contrôle:", error);
    }
}

/**
 * 3. Améliore l'affichage des salles
 */
function enhanceRoomsDisplay() {
    try {
        // Cibler la section des salles
        const roomsSection = document.querySelector('.rooms-section');
        if (!roomsSection) return;
        
        // Appliquer les styles pour centrer la section des salles
        roomsSection.style.position = 'fixed';
        roomsSection.style.left = '50%';
        roomsSection.style.top = '50%';
        roomsSection.style.transform = 'translate(-50%, -50%)';
        roomsSection.style.width = isMobile() ? '90%' : '70%';
        roomsSection.style.maxWidth = '800px';
        roomsSection.style.borderRadius = '15px';
        roomsSection.style.backgroundColor = 'rgba(30, 30, 30, 0.85)';
        roomsSection.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.3)';
        roomsSection.style.zIndex = '9999';
        
        // Améliorer le conteneur des salles avec une grille
        const roomsContainer = roomsSection.querySelector('.rooms');
        if (roomsContainer) {
            roomsContainer.style.display = 'grid';
            roomsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
            roomsContainer.style.gap = '15px';
            roomsContainer.style.padding = '15px';
        }
        
        // Améliorer l'apparence des cartes de salle
        const roomCards = roomsSection.querySelectorAll('.room-card');
        roomCards.forEach(card => {
            card.style.borderRadius = '10px';
            card.style.backgroundColor = 'rgba(50, 50, 50, 0.5)';
            card.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
            
            // Ajouter des effets hover
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-3px)';
                this.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.2)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = '';
                this.style.boxShadow = '';
            });
        });
    } catch (error) {
        console.log("Erreur lors de l'amélioration de l'affichage des salles:", error);
    }
}

/**
 * 4. Configure la fermeture des menus au clic en dehors
 */
function setupClickOutsideToClose() {
    try {
        // Déjà configuré ? Ne pas dupliquer
        if (window._clickOutsideConfigured) return;
        window._clickOutsideConfigured = true;
        
        // Éléments à fermer au clic en dehors
        document.addEventListener('click', function(event) {
            // 1. Fermeture de la section des salles
            const roomsSection = document.querySelector('.rooms-section');
            if (roomsSection && roomsSection.style.display !== 'none' && isVisible(roomsSection)) {
                const roomsToggles = document.querySelectorAll('#showRoomsBtn, .toggle-rooms-button, .rooms-toggle-button-floating');
                
                let clickedOutside = true;
                // Vérifier si le clic est sur la section ou un bouton d'affichage
                if (roomsSection.contains(event.target)) {
                    clickedOutside = false;
                }
                
                roomsToggles.forEach(toggle => {
                    if (toggle.contains(event.target)) {
                        clickedOutside = false;
                    }
                });
                
                if (clickedOutside) {
                    roomsSection.style.display = 'none';
                    updateRoomsButtonText(false);
                }
            }
            
            // 2. Fermeture du menu latéral (sur mobile)
            if (isMobile()) {
                const sideMenu = document.querySelector('.side-menu');
                const menuToggle = document.querySelector('.menu-toggle-visible');
                
                if (sideMenu && isVisible(sideMenu) && 
                    !sideMenu.contains(event.target) && 
                    menuToggle && !menuToggle.contains(event.target)) {
                    
                    sideMenu.classList.remove('expanded');
                    sideMenu.classList.remove('open');
                    
                    const overlay = document.querySelector('.menu-overlay');
                    if (overlay) {
                        overlay.classList.remove('active');
                    }
                }
            }
        });
        
        // Configurer les boutons d'affichage des salles
        document.querySelectorAll('#showRoomsBtn, .toggle-rooms-button, .rooms-toggle-button-floating').forEach(button => {
            button.addEventListener('click', function() {
                const roomsSection = document.querySelector('.rooms-section');
                if (!roomsSection) return;
                
                const isCurrentlyVisible = isVisible(roomsSection);
                roomsSection.style.display = isCurrentlyVisible ? 'none' : 'block';
                
                updateRoomsButtonText(!isCurrentlyVisible);
            });
        });
    } catch (error) {
        console.log("Erreur lors de la configuration de la fermeture des menus:", error);
    }
}

/**
 * Met à jour le texte des boutons d'affichage des salles
 */
function updateRoomsButtonText(isVisible) {
    document.querySelectorAll('#showRoomsBtn, .toggle-rooms-button, .rooms-toggle-button-floating').forEach(button => {
        if (button) {
            const text = isVisible ? 'Masquer les salles' : 'Afficher les salles';
            const icon = isVisible ? 'fa-door-closed' : 'fa-door-open';
            
            // Conserver le texte court pour le bouton flottant mobile
            if (button.classList.contains('rooms-toggle-button-floating')) {
                button.innerHTML = `<i class="fas ${icon}"></i> Salles`;
            } else {
                button.innerHTML = `<i class="fas ${icon}"></i> ${text}`;
            }
        }
    });
}

/**
 * Vérifie si un élément est visible
 */
function isVisible(element) {
    return element.style.display !== 'none' && 
           element.style.visibility !== 'hidden' &&
           element.style.opacity !== '0';
}

/**
 * Détecte si le client est sur mobile
 */
function isMobile() {
    return window.innerWidth <= 768;
}

// Injecter les styles CSS nécessaires pour les optimisations
(function injectStyles() {
    // Éviter les doublons
    if (document.getElementById('performance-optimization-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'performance-optimization-styles';
    style.textContent = `
        /* Masquage des infos de synchronisation */
        [id*="synchro"]:not(.main-container):not(.meetings-container):not(.meetings):not(.meetings-list),
        [class*="synchro"]:not(.main-container):not(.meetings-container):not(.meetings):not(.meetings-list),
        .sync-info,
        .last-sync {
            display: none !important;
            visibility: hidden !important;
        }
        
        /* Optimisation de la barre de contrôle */
        .controls-container {
            width: 40% !important;
            max-width: 500px !important;
            min-width: 400px !important;
            margin: 0 auto !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            border-radius: 15px 15px 0 0 !important;
            position: fixed !important;
            bottom: 0 !important;
            z-index: 1000 !important;
            background-color: rgba(30, 30, 30, 0.7) !important;
            box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.1) !important;
        }
        
        /* Optimisation de l'affichage des salles */
        .rooms-section {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 70% !important;
            max-width: 800px !important;
            border-radius: 15px !important;
            background-color: rgba(30, 30, 30, 0.85) !important;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3) !important;
            z-index: 9999 !important;
        }
        
        .rooms {
            display: grid !important;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
            gap: 15px !important;
            padding: 15px !important;
        }
        
        .room-card {
            border-radius: 10px !important;
            background-color: rgba(50, 50, 50, 0.5) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        }
        
        .room-card:hover {
            transform: translateY(-3px) !important;
            box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2) !important;
        }
        
        /* Support mobile */
        @media (max-width: 768px) {
            .controls-container {
                width: 90% !important;
                min-width: auto !important;
            }
            
            .rooms-section {
                width: 90% !important;
            }
        }
    `;
    
    document.head.appendChild(style);
})();
