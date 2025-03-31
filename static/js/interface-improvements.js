/**
 * interface-improvements.js
 * Responsable des améliorations d'interface de base:
 * - Initialisation des composants UI
 * - Gestion des animations d'entrée/sortie
 * - Initialisation des événements d'interface
 */

// Configuration globale
const UI_CONFIG = {
  animationDuration: 300,
  menuSelectors: {
    sideMenu: '.side-menu, #tableau-de-bord, .dashboard-menu',
    roomsList: '.rooms-section, .rooms-list, .available-rooms',
    toggleButtons: '.menu-toggle, .hamburger-menu, .menu-button'
  },
  interface: {
    darkModeClass: 'dark-mode',
    fullscreenClass: 'fullscreen-mode'
  }
};

// Fonction d'initialisation principale de l'interface
function initializeUserInterface() {
  console.log('Initialisation des améliorations d\'interface...');
  
  // Initialisation des composants de base
  setupMenuToggles();
  setupButtonEffects();
  setupAnimations();
  initializeThemes();
  setupAccessibility();
  
  // Événement indiquant que l'interface est prête
  document.dispatchEvent(new CustomEvent('interface-ready'));
}

// Configuration des basculements de menu
function setupMenuToggles() {
  // Boutons d'ouverture/fermeture du menu latéral
  const toggleButtons = document.querySelectorAll(UI_CONFIG.menuSelectors.toggleButtons);
  toggleButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      toggleSideMenu();
    });
  });
  
  // Initialiser l'état des menus au chargement
  document.addEventListener('DOMContentLoaded', function() {
    // État initial des menus: fermés sur mobile, ouverts sur desktop
    if (window.innerWidth < 768) {
      closeSideMenu();
    }
  });
}

// Fonctions de gestion du menu latéral
function toggleSideMenu() {
  const sideMenuElements = document.querySelectorAll(UI_CONFIG.menuSelectors.sideMenu);
  sideMenuElements.forEach(menu => {
    menu.classList.toggle('open');
  });
}

function closeSideMenu() {
  const sideMenuElements = document.querySelectorAll(UI_CONFIG.menuSelectors.sideMenu);
  sideMenuElements.forEach(menu => {
    menu.classList.remove('open');
  });
}

// Mise en place des effets de boutons
function setupButtonEffects() {
  // Animation pour les boutons d'action
  const actionButtons = document.querySelectorAll('.action-button, button[class*="action"], .btn-primary');
  actionButtons.forEach(button => {
    button.addEventListener('mousedown', function() {
      this.classList.add('button-pressed');
    });
    
    button.addEventListener('mouseup mouseleave', function() {
      this.classList.remove('button-pressed');
    });
  });
}

// Configuration des animations d'interface
function setupAnimations() {
  // Animation des transitions de page
  const transitionableElements = document.querySelectorAll('.page-content, .main-view, .app-content');
  transitionableElements.forEach(element => {
    element.classList.add('with-transition');
  });
}

// Initialisation du thème (clair/sombre)
function initializeThemes() {
  // Vérification des préférences utilisateur
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme-preference');
  
  // Appliquer le thème approprié
  if (savedTheme === 'dark' || (savedTheme === null && prefersDarkMode)) {
    document.body.classList.add(UI_CONFIG.interface.darkModeClass);
  }
  
  // Configurer le bouton de basculement de thème s'il existe
  const themeToggle = document.querySelector('.theme-toggle, #theme-switcher');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      document.body.classList.toggle(UI_CONFIG.interface.darkModeClass);
      const newTheme = document.body.classList.contains(UI_CONFIG.interface.darkModeClass) ? 'dark' : 'light';
      localStorage.setItem('theme-preference', newTheme);
    });
  }
}

// Configuration de l'accessibilité
function setupAccessibility() {
  // Amélioration de la navigation au clavier
  const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  focusableElements.forEach(element => {
    element.addEventListener('focus', function() {
      this.classList.add('keyboard-focus');
    });
    
    element.addEventListener('blur', function() {
      this.classList.remove('keyboard-focus');
    });
  });
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
  initializeUserInterface();
});

// Exposition des fonctions publiques
window.UIControl = {
  toggleSideMenu,
  closeSideMenu,
  refresh: initializeUserInterface
};
