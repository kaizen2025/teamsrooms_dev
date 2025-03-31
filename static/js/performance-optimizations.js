/**
 * performance-optimizations.js - version 9.0
 * 
 * Optimisations avancées pour l'interface utilisateur:
 * - Masquage agressif des informations de synchronisation
 * - Redimensionnement et centrage de la barre inférieure
 * - Centrage de la liste des salles
 * - Fermeture automatique des menus
 * - Observateur DOM pour maintenir les styles
 */

// Configuration des optimisations
const OPTIMIZATIONS_CONFIG = {
  syncInfoSelectors: [
    '[id*="synchro"]', 
    '[class*="synchro"]', 
    '.sync-info', 
    '.last-sync',
    '.datetime-info',
    '[data-sync-info]'
  ],
  syncTextPatterns: [
    'dernière', 
    'synchro', 
    'mise à jour',
    'synchronisation'
  ],
  footerSelectors: [
    '.controls-container', 
    '.footer-banner', 
    '.app-footer',
    '.bottom-controls'
  ],
  roomsListSelectors: [
    '.rooms-section', 
    '.rooms-list', 
    '.available-rooms'
  ],
  clickOutsideCloseables: [
    { selector: UI_CONFIG.menuSelectors.sideMenu, closeFunction: closeSideMenu },
    { selector: UI_CONFIG.menuSelectors.roomsList, closeFunction: closeRoomsList }
  ]
};

// Fonction d'initialisation principale des optimisations
function initializeOptimizations() {
  console.log('Application des optimisations de performance v9.0...');
  
  // Appliquer les optimisations principales
  hideAllSyncInfo();
  optimizeFooterBar();
  centerRoomsList();
  setupClickOutsideToClose();
  
  // Mettre en place l'observateur DOM pour maintenir les optimisations
  setupDOMObserver();
  
  // Signal que les optimisations sont appliquées
  document.dispatchEvent(new CustomEvent('optimizations-applied'));
}

// Fonction pour masquer toutes les informations de synchronisation
function hideAllSyncInfo() {
  // Méthode 1: Masquer par sélecteurs CSS
  OPTIMIZATIONS_CONFIG.syncInfoSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.style.display = 'none';
      el.style.visibility = 'hidden';
      el.style.height = '0';
      el.style.width = '0';
      el.setAttribute('aria-hidden', 'true');
    });
  });

  // Méthode 2: Masquer par analyse de contenu textuel
  document.querySelectorAll('div, span').forEach(el => {
    const text = el.textContent.toLowerCase();
    if (OPTIMIZATIONS_CONFIG.syncTextPatterns.some(pattern => text.includes(pattern))) {
      el.style.display = 'none';
      el.style.visibility = 'hidden';
      el.setAttribute('aria-hidden', 'true');
    }
  });
  
  // Méthode 3: Masquer les conteneurs parents des éléments de synchronisation
  document.querySelectorAll('[id*="synchro"], [class*="synchro"]').forEach(el => {
    if (el.parentElement) {
      el.parentElement.style.display = 'none';
    }
  });
  
  // Méthode 4: Injection CSS pour masquer dynamiquement
  injectSyncInfoCSS();
}

// Fonction pour injecter du CSS spécifique pour masquer les infos de synchronisation
function injectSyncInfoCSS() {
  const style = document.createElement('style');
  style.textContent = `
    /* Masquage avancé de toutes les informations de synchronisation */
    [id*="synchro"], [class*="synchro"], .sync-info, .last-sync, 
    div:has(> [id*="synchro"]), div:has(> [class*="synchro"]),
    .datetime-info, [data-sync-info] {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      width: 0 !important;
      overflow: hidden !important;
      position: absolute !important;
      pointer-events: none !important;
    }
  `;
  document.head.appendChild(style);
}

// Fonction pour optimiser la barre inférieure
function optimizeFooterBar() {
  OPTIMIZATIONS_CONFIG.footerSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      // Réduire la largeur à 40%
      el.style.width = '40%';
      el.style.maxWidth = '600px';
      
      // Centrer la barre
      el.style.margin = '0 auto';
      el.style.left = '50%';
      el.style.transform = 'translateX(-50%)';
      
      // Ajouter des coins arrondis
      el.style.borderRadius = '15px 15px 0 0';
    });
  });
}

// Fonction pour centrer la liste des salles
function centerRoomsList() {
  OPTIMIZATIONS_CONFIG.roomsListSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      // Centrer la liste des salles
      el.style.left = '50%';
      el.style.top = '50%';
      el.style.transform = 'translate(-50%, -50%)';
      el.style.maxWidth = '800px';
      el.style.width = '70%';
      
      // Ajouter une animation fluide
      el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    });
  });
}

// Fonction pour fermer la liste des salles
function closeRoomsList() {
  OPTIMIZATIONS_CONFIG.roomsListSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.classList.remove('open', 'visible', 'active', 'show');
      // Appliquer les classes de fermeture selon le système utilisé
      el.classList.add('closed', 'hidden');
    });
  });
}

// Configuration de la fermeture au clic en dehors
function setupClickOutsideToClose() {
  document.addEventListener('click', function(event) {
    OPTIMIZATIONS_CONFIG.clickOutsideCloseables.forEach(item => {
      const elements = document.querySelectorAll(item.selector);
      let shouldClose = true;
      
      // Vérifier si le clic est en dehors de tous les éléments cibles
      elements.forEach(el => {
        if (el.contains(event.target) || !el.classList.contains('open')) {
          shouldClose = false;
        }
      });
      
      // Vérifier aussi si le clic n'est pas sur un bouton d'ouverture
      const toggleButtons = document.querySelectorAll(UI_CONFIG.menuSelectors.toggleButtons);
      toggleButtons.forEach(button => {
        if (button.contains(event.target)) {
          shouldClose = false;
        }
      });
      
      // Fermer si le clic est en dehors
      if (shouldClose) {
        item.closeFunction();
      }
    });
  });
}

// Mettre en place l'observateur DOM pour maintenir les optimisations
function setupDOMObserver() {
  // Créer un observateur qui surveille les modifications du DOM
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Réappliquer les optimisations aux nouveaux éléments
        hideAllSyncInfo();
        optimizeFooterBar();
        centerRoomsList();
      }
    });
  });
  
  // Démarrer l'observation avec les options appropriées
  observer.observe(document.body, {
    childList: true, // Observer les ajouts/suppressions directs d'enfants
    subtree: true    // Observer tous les descendants
  });
}

// Attendre que les améliorations d'interface de base soient appliquées
document.addEventListener('interface-ready', function() {
  // Initialiser les optimisations après les améliorations d'interface
  initializeOptimizations();
});

// Initialisation au chargement si l'événement 'interface-ready' n'est pas déclenché
document.addEventListener('DOMContentLoaded', function() {
  // Vérifier si les optimisations ont déjà été initialisées
  setTimeout(function() {
    if (!document.querySelector('[aria-hidden="true"][id*="synchro"]')) {
      initializeOptimizations();
    }
  }, 500); // Délai court pour laisser interface-improvements.js s'initialiser
});

// Exposition des fonctions publiques
window.PerformanceOptimizations = {
  reapply: initializeOptimizations,
  hideSync: hideAllSyncInfo,
  optimizeFooter: optimizeFooterBar,
  centerRooms: centerRoomsList
};
