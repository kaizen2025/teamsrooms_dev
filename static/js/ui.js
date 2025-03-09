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
  
  // Mettre à jour la visibilité des boutons d'affichage des salles
  updateToggleButtonsVisibility();
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
 * Active et désactive les éléments de menu
 */
function setActiveMenuItem(element) {
  // Désactiver tous les éléments de menu actifs
  document.querySelectorAll('.menu-item.active').forEach(item => {
    item.classList.remove('active');
  });
  
  // Activer le nouvel élément
  if (element) {
    element.classList.add('active');
  }
}

/**
 * Configure les boutons d'affichage des salles pour éviter les conflits
 */
function setupRoomsToggleButtons() {
  // Récupérer le bouton dans le menu latéral
  const menuButton = document.querySelector('.toggle-rooms-button');
  
  // Définir un texte standard pour les deux boutons
  const buttonText = "Afficher les salles disponibles";
  
  // Récupérer ou créer le bouton flottant
  let floatingButton = document.querySelector('.rooms-toggle-button-floating');
  
  // Si le bouton flottant n'existe pas, le créer
  if (!floatingButton) {
    floatingButton = document.createElement('button');
    floatingButton.className = 'rooms-toggle-button-floating';
    floatingButton.id = 'toggleRoomsBtn';
    floatingButton.innerHTML = `<i class="fas fa-eye"></i> ${buttonText}`;
    document.body.appendChild(floatingButton);
    
    // Attacher l'événement
    floatingButton.addEventListener('click', toggleRoomsVisibility);
  }
  
  // Si le bouton du menu existe, mettre à jour son texte et attacher l'événement
  if (menuButton) {
    const menuButtonText = menuButton.querySelector('.button-text');
    if (menuButtonText) {
      menuButtonText.textContent = buttonText;
    }
    menuButton.addEventListener('click', toggleRoomsVisibility);
  }
  
  // Configurer l'affichage en fonction de l'état du menu
  updateToggleButtonsVisibility();
}

/**
 * Met à jour la visibilité des boutons en fonction de l'état du menu
 */
function updateToggleButtonsVisibility() {
  const sideMenu = document.getElementById('sideMenu');
  const floatingButton = document.querySelector('.rooms-toggle-button-floating');
  
  if (!sideMenu || !floatingButton) return;
  
  if (sideMenu.classList.contains('expanded')) {
    // Si le menu est ouvert, cacher le bouton flottant
    floatingButton.style.display = 'none';
  } else {
    // Si le menu est fermé, afficher le bouton flottant
    floatingButton.style.display = 'flex';
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
  
  // Gestion des boutons d'affichage des salles
  setupRoomsToggleButtons();
  
  // Associer le bouton de réservation de salle au modal
  const roomReservationBtn = document.getElementById('roomReservationBtn');
  if (roomReservationBtn) {
    roomReservationBtn.addEventListener('click', function(e) {
      e.preventDefault();
      openBookingModal();
      setActiveMenuItem(this);
    });
  }
  
  // Ajouter des écouteurs d'événements à tous les éléments de menu
  document.querySelectorAll('.menu-item').forEach(menuItem => {
    menuItem.addEventListener('click', function() {
      // Ne pas modifier le comportement par défaut pour les liens externes
      if (this.getAttribute('target') === '_blank') return;
      
      // Vérifier les droits d'accès si AuthSystem est disponible
      if (window.AuthSystem && this.classList.contains('admin-only') && 
          (!AuthSystem.isAuthenticated || AuthSystem.currentUser.role !== 'administrator')) {
        alert("Vous n'avez pas les droits d'accès à cette fonctionnalité.");
        return;
      }
      
      // Sinon, activer l'élément du menu
      setActiveMenuItem(this);
      
      // Gérer les actions spéciales (administration, etc.)
      handleSpecialMenuActions(this);
    });
  });
  
  // Rafraîchir la page au clic sur Accueil
  const homeMenuItem = document.querySelector('.menu-item[href="#"]:first-child');
  if (homeMenuItem) {
    homeMenuItem.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.reload();
    });
  }
  
  // Initialiser le système de thèmes
  initThemeSystem();
}

/**
 * Gère les actions spéciales pour certains éléments de menu
 */
function handleSpecialMenuActions(menuItem) {
  // Identifier l'élément sélectionné
  const menuId = menuItem.dataset.menuId;
  
  if (menuId === 'admin') {
    // Afficher le panneau d'administration
    showAdminPanel();
  } else {
    // Masquer le panneau d'administration pour les autres sections
    const adminSection = document.getElementById('adminSection');
    if (adminSection) {
      adminSection.style.display = 'none';
    }
  }
}

/**
 * Affiche le panneau d'administration
 */
function showAdminPanel() {
  // Masquer les autres contenus de la zone centrale
  document.querySelectorAll('.content > div').forEach(el => {
    if (el.id !== 'adminSection') {
      el.style.display = 'none';
    }
  });
  
  // Afficher la section d'administration
  const adminSection = document.getElementById('adminSection');
  if (adminSection) {
    adminSection.style.display = 'flex';
  }
}

/**
 * Initialise le système de thèmes
 */
function initThemeSystem() {
  // Boutons de changement de thème
  const themeSelector = document.querySelector('.user-dropdown-link:nth-child(3)');
  if (themeSelector) {
    themeSelector.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Rotation des thèmes
      const themes = ['default', 'light', 'dark', 'custom'];
      const htmlEl = document.documentElement;
      const currentTheme = htmlEl.getAttribute('data-theme') || 'default';
      
      // Trouver l'index actuel et passer au suivant
      const currentIndex = themes.indexOf(currentTheme);
      const nextIndex = (currentIndex + 1) % themes.length;
      const nextTheme = themes[nextIndex];
      
      // Appliquer le nouveau thème
      htmlEl.setAttribute('data-theme', nextTheme);
      
      // Enregistrer la préférence
      localStorage.setItem('preferred-theme', nextTheme);
      
      // Notification
      alert(`Thème ${formatThemeName(nextTheme)} appliqué.`);
    });
  }
  
  // Appliquer le thème sauvegardé au chargement
  const savedTheme = localStorage.getItem('preferred-theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
}

/**
 * Formate le nom d'un thème pour affichage
 */
function formatThemeName(themeKey) {
  const themeNames = {
    'default': 'Par défaut',
    'light': 'Clair',
    'dark': 'Sombre',
    'custom': 'Personnalisé'
  };
  
  return themeNames[themeKey] || themeKey;
}

/**
 * Met à jour l'interface pour l'utilisateur actuellement connecté
 */
function updateUIForCurrentUser() {
  if (window.AuthSystem) {
    const user = AuthSystem.currentUser;
    const isAuth = AuthSystem.isAuthenticated;
    
    // Mettre à jour le composant de profil utilisateur
    const userDisplayName = document.getElementById('userDisplayName');
    const userRole = document.getElementById('userRole');
    const userDisplayNameFull = document.getElementById('userDisplayNameFull');
    const userRoleFull = document.getElementById('userRoleFull');
    const userInitials = document.querySelector('.user-initials');
    
    if (isAuth && user) {
      // Nom et rôle
      if (userDisplayName) userDisplayName.textContent = user.displayName || 'Utilisateur';
      if (userRole) userRole.textContent = formatRoleName(user.role) || 'Invité';
      if (userDisplayNameFull) userDisplayNameFull.textContent = user.displayName || 'Utilisateur';
      if (userRoleFull) userRoleFull.textContent = formatRoleName(user.role) || 'Invité';
      
      // Initiales
      if (userInitials && user.displayName) {
        const initials = getInitials(user.displayName);
        userInitials.textContent = initials;
      }
      
      // Classes de rôle sur le corps
      document.body.dataset.userRole = user.role;
      
      // Classe principale du conteneur
      const mainContainer = document.querySelector('.main-container');
      if (mainContainer) {
        // Retirer les anciennes classes
        mainContainer.classList.remove('layout-administrator', 'layout-manager', 'layout-user', 'layout-teams_room');
        // Ajouter la nouvelle classe
        mainContainer.classList.add(`layout-${user.role}`);
      }
      
      // Éléments visibles uniquement pour les administrateurs
      const adminOnlyElements = document.querySelectorAll('.admin-only');
      adminOnlyElements.forEach(el => {
        el.style.display = user.role === 'administrator' ? '' : 'none';
      });
    } else {
      // Valeurs par défaut pour utilisateur non connecté
      if (userDisplayName) userDisplayName.textContent = 'Invité';
      if (userRole) userRole.textContent = 'Non connecté';
      if (userDisplayNameFull) userDisplayNameFull.textContent = 'Invité';
      if (userRoleFull) userRoleFull.textContent = 'Non connecté';
      if (userInitials) userInitials.textContent = 'IN';
      
      // Réinitialiser les classes
      document.body.dataset.userRole = '';
      
      // Masquer les éléments admin-only
      const adminOnlyElements = document.querySelectorAll('.admin-only');
      adminOnlyElements.forEach(el => {
        el.style.display = 'none';
      });
    }
    
    // Éléments à afficher uniquement quand connecté
    document.querySelectorAll('.auth-required').forEach(el => {
      el.style.display = isAuth ? '' : 'none';
    });
    
    // Éléments à masquer quand connecté
    document.querySelectorAll('.auth-hidden').forEach(el => {
      el.style.display = isAuth ? 'none' : '';
    });
  }
}

/**
 * Récupère les initiales d'un nom
 */
function getInitials(name) {
  if (!name) return '??';
  
  const parts = name.split(' ');
  if (parts.length === 1) {
    return name.substring(0, 2).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Formate un nom de rôle pour l'affichage
 */
function formatRoleName(roleKey) {
  const roleNames = {
    'administrator': 'Administrateur',
    'manager': 'Manager',
    'user': 'Utilisateur',
    'teams_room': 'Salle Teams'
  };
  
  return roleNames[roleKey] || roleKey;
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
  
  // Mise à jour de l'interface pour l'utilisateur courant
  if (window.AuthSystem) {
    // Première mise à jour
    updateUIForCurrentUser();
    
    // Écouter les changements d'état d'authentification
    document.addEventListener('authStateChanged', updateUIForCurrentUser);
  }
});