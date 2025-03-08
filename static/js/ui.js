/**
 * Gestion de l'interface utilisateur et interactions
 */

/**
 * Bascule l'état du menu latéral
 */
function toggleSideMenu() {
  const sideMenu = document.getElementById('sideMenu');
  const mainContainer = document.querySelector('.main-container');
  
  if (!sideMenu || !mainContainer) return;
  
  // Basculer l'expansion du menu
  sideMenu.classList.toggle('expanded');
  
  // Mettre à jour la grille du conteneur principal
  if (sideMenu.classList.contains('expanded')) {
    mainContainer.classList.add('menu-expanded');
  } else {
    mainContainer.classList.remove('menu-expanded');
  }
}

/**
 * Basculer l'affichage du menu pour les mobiles
 */
function toggleMobileMenu() {
  const sideMenu = document.getElementById('sideMenu');
  if (!sideMenu) return;
  
  sideMenu.classList.toggle('visible');
}

/**
 * Vérifier si on est en mobile pour ajuster l'interface
 */
function checkMobileView() {
  const menuToggle = document.querySelector('.menu-toggle-mobile');
  const sideMenu = document.getElementById('sideMenu');
  
  if (window.innerWidth <= 768) {
    if (menuToggle) menuToggle.style.display = 'flex';
    
    // S'assurer que le menu n'est pas étendu sur mobile
    if (sideMenu && sideMenu.classList.contains('expanded')) {
      toggleSideMenu();
    }
  } else {
    if (menuToggle) menuToggle.style.display = 'none';
    
    // S'assurer que le menu n'est pas visible comme un overlay
    if (sideMenu) {
      sideMenu.classList.remove('visible');
    }
  }
}

/**
 * Change l'image d'arrière-plan aléatoirement
 */
function changeBackground() {
  const backgroundContainer = document.getElementById('background-container');
  if (!backgroundContainer) return;
  
  const randomIndex = Math.floor(Math.random() * window.BACKGROUNDS.length);
  const randomImage = window.BACKGROUNDS[randomIndex];
  
  backgroundContainer.style.backgroundImage = `url('${randomImage}')`;
}

/**
 * Passe en mode plein écran
 */
function enterFullscreen() {
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  } else if (document.documentElement.webkitRequestFullscreen) {
    document.documentElement.webkitRequestFullscreen();
  } else if (document.documentElement.msRequestFullscreen) {
    document.documentElement.msRequestFullscreen();
  }
}

/**
 * Quitte le mode plein écran
 */
function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

/**
 * Initialise tous les événements d'interface
 */
function initUIEvents() {
  // Menu principal
  const menuToggleBtn = document.getElementById('menuToggleBtn');
  if (menuToggleBtn) {
    menuToggleBtn.addEventListener('click', toggleSideMenu);
  }
  
  // Plein écran
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', enterFullscreen);
  }
  
  // Quitter plein écran
  const exitFullscreenBtn = document.getElementById('exitFullscreenBtn');
  if (exitFullscreenBtn) {
    exitFullscreenBtn.addEventListener('click', exitFullscreen);
  }
  
  // Adaptation mobile
  window.addEventListener('resize', checkMobileView);
  
  // Supprimer le bouton d'affichage des salles du menu
  const menuButton = document.querySelector('.toggle-rooms-button');
  if (menuButton) {
    menuButton.remove();
  }
  
  // Créer le nouveau bouton en position fixe
  const newButton = document.createElement('button');
  newButton.className = 'rooms-toggle-button';
  newButton.id = 'toggleRoomsBtn';
  newButton.innerHTML = '<i class="fas fa-eye"></i> Afficher salles';
  document.body.appendChild(newButton);
  
  // Réattacher l'événement au nouveau bouton
  newButton.addEventListener('click', toggleRoomsVisibility);
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  // Initialiser l'arrière-plan
  changeBackground();
  
  // Initialiser les événements d'interface
  initUIEvents();
  
  // Vérifier la vue mobile
  checkMobileView();
  
  // Mise en place des rotations d'arrière-plan
  setInterval(changeBackground, window.REFRESH_INTERVALS.BACKGROUND);
});
