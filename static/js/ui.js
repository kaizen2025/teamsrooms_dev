/**
 * Gestion de l'interface utilisateur et interactions
 * Version améliorée avec animation, gestion d'événements et thèmes
 */

// Système de gestion de l'interface utilisateur
const UISystem = {
  // Configuration
  config: {
    menuExpanded: false,
    currentTheme: 'default',
    roomsVisible: false,
    activeSection: 'home',
    isMobile: false,
    isFullscreen: false,
    backgroundIndex: 0
  },
  
  /**
   * Initialise le système d'interface utilisateur
   */
  init() {
    // Vérifier les préférences sauvegardées
    this.loadPreferences();
    
    // Initialiser le menu selon les préférences
    this.setupMenu();
    
    // Vérifier la vue mobile
    this.checkMobileView();
    
    // Appliquer le thème
    this.applyTheme(this.config.currentTheme);
    
    // Initialiser l'arrière-plan
    this.initBackground();
    
    // Initialiser tous les événements d'interface
    this.initEvents();
    
    // Vérifier et configurer le mode salle
    this.checkRoomMode();
    
    console.log("Système d'interface initialisé");
  },
  
  /**
   * Charge les préférences utilisateur depuis le stockage local
   */
  loadPreferences() {
    // Menu
    const menuExpanded = localStorage.getItem('ui-menu-expanded');
    if (menuExpanded !== null) {
      this.config.menuExpanded = menuExpanded === 'true';
    }
    
    // Thème
    const savedTheme = localStorage.getItem('ui-theme');
    if (savedTheme) {
      this.config.currentTheme = savedTheme;
    }
    
    // Visibilité des salles
    const roomsVisible = localStorage.getItem('ui-rooms-visible');
    if (roomsVisible !== null) {
      this.config.roomsVisible = roomsVisible === 'true';
    }
  },
  
  /**
   * Enregistre les préférences utilisateur dans le stockage local
   */
  savePreferences() {
    localStorage.setItem('ui-menu-expanded', this.config.menuExpanded);
    localStorage.setItem('ui-theme', this.config.currentTheme);
    localStorage.setItem('ui-rooms-visible', this.config.roomsVisible);
  },
  
  /**
   * Initialise le menu latéral
   */
  setupMenu() {
    const sideMenu = document.getElementById('sideMenu');
    const mainContainer = document.querySelector('.main-container');
    
    if (!sideMenu || !mainContainer) return;
    
    // Appliquer l'état sauvegardé du menu
    if (this.config.menuExpanded) {
      sideMenu.classList.add('expanded');
      mainContainer.classList.add('menu-expanded');
    } else {
      sideMenu.classList.remove('expanded');
      mainContainer.classList.remove('menu-expanded');
    }
  },
  
  /**
   * Bascule l'état du menu
   */
  toggleMenu() {
    const sideMenu = document.getElementById('sideMenu');
    const mainContainer = document.querySelector('.main-container');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    if (!sideMenu || !mainContainer) return;
    
    // Basculer l'état
    this.config.menuExpanded = !this.config.menuExpanded;
    
    // Appliquer la classe
    if (this.config.menuExpanded) {
      sideMenu.classList.add('expanded');
      mainContainer.classList.add('menu-expanded');
      if (menuOverlay) menuOverlay.classList.add('active');
      
      // Animation des éléments du menu
      this.animateMenuItems(true);
    } else {
      sideMenu.classList.remove('expanded');
      mainContainer.classList.remove('menu-expanded');
      if (menuOverlay) menuOverlay.classList.remove('active');
      
      // Animation des éléments du menu
      this.animateMenuItems(false);
    }
    
    // Mettre à jour la visibilité des boutons d'affichage des salles
    this.updateToggleButtonsVisibility();
    
    // Enregistrer la préférence
    this.savePreferences();
  },
  
  /**
   * Anime les éléments du menu avec un léger délai
   */
  animateMenuItems(entering) {
    const menuItems = document.querySelectorAll('.menu-item');
    const delay = entering ? 30 : 0;
    
    menuItems.forEach((item, index) => {
      if (entering) {
        item.style.transition = `all 0.3s ease ${index * delay}ms`;
        item.style.transform = 'translateX(0)';
        item.style.opacity = '1';
      } else {
        item.style.transition = 'all 0.2s ease';
        item.style.transform = '';
        item.style.opacity = '';
      }
    });
  },
  
  /**
   * Vérifie si l'application est en vue mobile
   */
  checkMobileView() {
    const isMobile = window.innerWidth <= 768;
    this.config.isMobile = isMobile;
    
    // Gestion de l'overlay pour mobile
    if (isMobile) {
      // Créer un overlay pour le menu mobile s'il n'existe pas déjà
      if (!document.querySelector('.menu-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        overlay.addEventListener('click', () => this.toggleMenu());
        document.body.appendChild(overlay);
      }
      
      // S'assurer que le menu n'est pas étendu par défaut sur mobile
      if (this.config.menuExpanded && !document.querySelector('.menu-overlay.active')) {
        this.toggleMenu();
      }
    }
    
    // Adaptation des éléments d'interface
    this.updateResponsiveElements();
  },
  
  /**
   * Met à jour les éléments selon la taille de l'écran
   */
  updateResponsiveElements() {
    // Adaptations selon la taille de l'écran
    if (this.config.isMobile) {
      // Réduire les labels des boutons
      document.querySelectorAll('.control-buttons button span').forEach(span => {
        span.dataset.fullText = span.textContent;
        if (window.innerWidth < 400) {
          span.textContent = ''; // Masquer le texte, garder seulement l'icône
        }
      });
    } else {
      // Restaurer les labels
      document.querySelectorAll('.control-buttons button span').forEach(span => {
        if (span.dataset.fullText) {
          span.textContent = span.dataset.fullText;
        }
      });
    }
  },
  
  /**
   * Initialise l'arrière-plan
   */
  initBackground() {
    const backgroundContainer = document.getElementById('background-container');
    if (!backgroundContainer) return;
    
    // Sélectionner une image aléatoire
    if (window.BACKGROUNDS && window.BACKGROUNDS.length > 0) {
      const randomIndex = Math.floor(Math.random() * window.BACKGROUNDS.length);
      this.config.backgroundIndex = randomIndex;
      const randomImage = window.BACKGROUNDS[randomIndex];
      backgroundContainer.style.backgroundImage = `url('${randomImage}')`;
      
      // Mettre en place la rotation d'arrière-plan
      setInterval(() => this.changeBackground(), window.REFRESH_INTERVALS?.BACKGROUND || 3600000);
    }
  },
  
  /**
   * Change l'image d'arrière-plan aléatoirement
   */
  changeBackground() {
    const backgroundContainer = document.getElementById('background-container');
    if (!backgroundContainer || !window.BACKGROUNDS || !window.BACKGROUNDS.length) return;
    
    // Sélectionner une image différente
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * window.BACKGROUNDS.length);
    } while (newIndex === this.config.backgroundIndex && window.BACKGROUNDS.length > 1);
    
    this.config.backgroundIndex = newIndex;
    const newImage = window.BACKGROUNDS[newIndex];
    
    // Transition douce
    backgroundContainer.style.opacity = '0';
    setTimeout(() => {
      backgroundContainer.style.backgroundImage = `url('${newImage}')`;
      backgroundContainer.style.opacity = '1';
    }, 500);
  },
  
  /**
   * Passe en mode plein écran
   */
  enterFullscreen() {
    const element = document.documentElement;
    
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
    
    this.config.isFullscreen = true;
    this.updateFullscreenButton();
  },
  
  /**
   * Quitte le mode plein écran
   */
  exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    
    this.config.isFullscreen = false;
    this.updateFullscreenButton();
  },
  
  /**
   * Met à jour l'apparence du bouton de plein écran
   */
  updateFullscreenButton() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (!fullscreenBtn) return;
    
    if (this.config.isFullscreen) {
      fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i> <span>Quitter</span>';
      fullscreenBtn.onclick = () => this.exitFullscreen();
    } else {
      fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i> <span>Plein écran</span>';
      fullscreenBtn.onclick = () => this.enterFullscreen();
    }
  },
  
  /**
   * Surveille les changements de mode plein écran
   */
  handleFullscreenChange() {
    this.config.isFullscreen = !!(document.fullscreenElement || 
                                document.webkitFullscreenElement || 
                                document.mozFullScreenElement || 
                                document.msFullscreenElement);
    this.updateFullscreenButton();
  },
  
  /**
   * Bascule la visibilité de la section des salles
   */
  toggleRoomsVisibility() {
    const roomsSection = document.getElementById('roomsSection');
    if (!roomsSection) return;
    
    // Basculer l'état
    this.config.roomsVisible = !this.config.roomsVisible;
    
    // Appliquer la classe
    roomsSection.classList.toggle('visible', this.config.roomsVisible);
    
    // Mettre à jour l'apparence des boutons
    this.updateRoomsToggleButtons();
    
    // Enregistrer la préférence
    this.savePreferences();
    
    // Rafraîchir le statut des salles si affiché
    if (this.config.roomsVisible && typeof updateRoomStatus === 'function') {
      updateRoomStatus();
    }
  },
  
  /**
   * Met à jour l'apparence des boutons d'affichage des salles
   */
  updateRoomsToggleButtons() {
    // Bouton dans le menu
    const menuButton = document.querySelector('.toggle-rooms-button');
    if (menuButton) {
      const icon = menuButton.querySelector('i');
      const buttonText = menuButton.querySelector('.button-text');
      
      if (this.config.roomsVisible) {
        icon.className = 'fas fa-eye-slash';
        if (buttonText) buttonText.textContent = 'Masquer salles';
      } else {
        icon.className = 'fas fa-eye';
        if (buttonText) buttonText.textContent = 'Afficher salles';
      }
    }
    
    // Bouton flottant
    const floatingButton = document.querySelector('.rooms-toggle-button-floating');
    if (floatingButton) {
      const icon = floatingButton.querySelector('i');
      
      if (this.config.roomsVisible) {
        icon.className = 'fas fa-eye-slash';
        floatingButton.innerHTML = `<i class="fas fa-eye-slash"></i> Masquer salles`;
      } else {
        icon.className = 'fas fa-eye';
        floatingButton.innerHTML = `<i class="fas fa-eye"></i> Afficher salles`;
      }
    }
  },
  
  /**
   * Configure les boutons d'affichage des salles
   */
  setupRoomsToggleButtons() {
    // Bouton dans le menu
    const menuButton = document.querySelector('.toggle-rooms-button');
    
    // Bouton flottant
    let floatingButton = document.querySelector('.rooms-toggle-button-floating');
    
    // Si le bouton flottant n'existe pas, le créer
    if (!floatingButton) {
      floatingButton = document.createElement('button');
      floatingButton.className = 'rooms-toggle-button-floating';
      floatingButton.id = 'toggleRoomsFloatingBtn';
      floatingButton.innerHTML = `<i class="fas fa-eye"></i> Afficher salles`;
      document.body.appendChild(floatingButton);
      
      // Attacher l'événement
      floatingButton.addEventListener('click', () => this.toggleRoomsVisibility());
    }
    
    // Si le bouton du menu existe, attacher l'événement
    if (menuButton) {
      menuButton.addEventListener('click', () => this.toggleRoomsVisibility());
    }
    
    // Configurer l'affichage en fonction de l'état des salles
    this.updateRoomsToggleButtons();
    
    // Mettre à jour la visibilité des boutons selon l'état du menu
    this.updateToggleButtonsVisibility();
  },
  
  /**
   * Met à jour la visibilité des boutons en fonction de l'état du menu
   */
  updateToggleButtonsVisibility() {
    const floatingButton = document.querySelector('.rooms-toggle-button-floating');
    
    if (!floatingButton) return;
    
    if (this.config.menuExpanded && !this.config.isMobile) {
      // Si le menu est ouvert, cacher le bouton flottant
      floatingButton.style.display = 'none';
    } else {
      // Si le menu est fermé, afficher le bouton flottant
      floatingButton.style.display = 'flex';
    }
  },
  
  /**
   * Vérifie si nous sommes en mode salle et adapte l'interface
   */
  checkRoomMode() {
    // Vérifier si un rôle de salle est défini dans le système d'authentification
    if (window.AuthSystem && AuthSystem.currentUser && AuthSystem.currentUser.role === 'teams_room') {
      // Activer le mode TV
      document.body.classList.add('tv-mode');
      
      // Enregistrer les préférences spécifiques
      this.config.menuExpanded = false;
      this.savePreferences();
      
      // Adapter l'interface
      this.enterFullscreen();
      
      // Masquer certains éléments
      document.querySelectorAll('.hide-in-room-mode').forEach(el => {
        el.style.display = 'none';
      });
      
      // Agrandir la zone des réunions
      const meetingsContainer = document.querySelector('.meetings-container');
      if (meetingsContainer) {
        meetingsContainer.style.maxWidth = '100%';
      }
    }
  },
  
  /**
   * Active et désactive les éléments de menu
   */
  setActiveMenuItem(element) {
    // Mémoriser la section active
    if (element && element.dataset && element.dataset.menuId) {
      this.config.activeSection = element.dataset.menuId;
    }
    
    // Désactiver tous les éléments de menu actifs
    document.querySelectorAll('.menu-item.active').forEach(item => {
      item.classList.remove('active');
    });
    
    // Activer le nouvel élément
    if (element) {
      element.classList.add('active');
    }
    
    // Sur mobile, fermer le menu après la sélection
    if (this.config.isMobile && this.config.menuExpanded) {
      setTimeout(() => this.toggleMenu(), 300);
    }
  },
  
  /**
   * Applique un thème à l'interface
   */
  applyTheme(themeName) {
    // Vérifier que le thème est valide
    const validThemes = ['default', 'light', 'dark', 'custom'];
    if (!validThemes.includes(themeName)) {
      themeName = 'default';
    }
    
    // Appliquer le thème à l'élément html
    document.documentElement.setAttribute('data-theme', themeName);
    
    // Mémoriser le thème actuel
    this.config.currentTheme = themeName;
    this.savePreferences();
  },
  
  /**
   * Passe au thème suivant dans la rotation
   */
  cycleTheme() {
    const themes = ['default', 'light', 'dark', 'custom'];
    const currentIndex = themes.indexOf(this.config.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    this.applyTheme(nextTheme);
    
    // Afficher une notification
    this.showNotification(`Thème ${this.formatThemeName(nextTheme)} appliqué`, 'info');
  },
  
  /**
   * Affiche une notification temporaire
   */
  showNotification(message, type = 'info') {
    // Créer la notification si elle n'existe pas
    let notification = document.getElementById('ui-notification');
    
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'ui-notification';
      notification.className = 'ui-notification';
      document.body.appendChild(notification);
      
      // Styles CSS de base
      notification.style.position = 'fixed';
      notification.style.bottom = '20px';
      notification.style.right = '20px';
      notification.style.padding = '10px 20px';
      notification.style.borderRadius = '5px';
      notification.style.color = 'white';
      notification.style.zIndex = '9999';
      notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(20px)';
      notification.style.transition = 'all 0.3s ease';
    }
    
    // Définir le style selon le type
    switch (type) {
      case 'success':
        notification.style.background = 'linear-gradient(to right, #28a745, #43a047)';
        break;
      case 'error':
        notification.style.background = 'linear-gradient(to right, #dc3545, #e53935)';
        break;
      case 'warning':
        notification.style.background = 'linear-gradient(to right, #ffc107, #ffb300)';
        notification.style.color = '#333';
        break;
      default: // info
        notification.style.background = 'linear-gradient(to right, #6264A7, #7B7DC6)';
    }
    
    // Mettre à jour le message et montrer la notification
    notification.textContent = message;
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
    
    // Masquer après un délai
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(20px)';
      
      // Supprimer du DOM après la transition
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  },
  
  /**
   * Formate le nom d'un thème pour affichage
   */
  formatThemeName(themeKey) {
    const themeNames = {
      'default': 'Par défaut',
      'light': 'Clair',
      'dark': 'Sombre',
      'custom': 'Personnalisé'
    };
    
    return themeNames[themeKey] || themeKey;
  },
  
  /**
   * Initialise tous les événements d'interface
   */
  initEvents() {
    // Événement de redimensionnement de fenêtre
    window.addEventListener('resize', () => {
      this.checkMobileView();
      this.updateToggleButtonsVisibility();
    });
    
    // Événement de changement de mode plein écran
    document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
    document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
    document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
    document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());
    
    // Bouton menu principal
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    if (menuToggleBtn) {
      menuToggleBtn.addEventListener('click', () => this.toggleMenu());
    }
    
    // Plein écran
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
      this.updateFullscreenButton(); // Initialiser l'état
    }
    
    // Bouton de changement de thème
    const themeBtn = document.querySelector('.user-dropdown-link:nth-child(3)');
    if (themeBtn) {
      themeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.cycleTheme();
      });
    }
    
    // Initialiser les boutons d'affichage des salles
    this.setupRoomsToggleButtons();
    
    // Gérer les éléments de menu
    document.querySelectorAll('.menu-item').forEach(menuItem => {
      menuItem.addEventListener('click', () => {
        // Ne pas modifier le comportement par défaut pour les liens externes
        if (menuItem.getAttribute('target') === '_blank') return;
        
        // Vérifier les droits d'accès si AuthSystem est disponible
        if (window.AuthSystem && menuItem.classList.contains('admin-only') && 
            (!AuthSystem.isAuthenticated || AuthSystem.currentUser.role !== 'administrator')) {
          this.showNotification("Vous n'avez pas les droits d'accès à cette fonctionnalité.", 'error');
          return;
        }
        
        // Activer l'élément du menu
        this.setActiveMenuItem(menuItem);
        
        // Gérer les actions spéciales
        this.handleSpecialMenuActions(menuItem);
      });
    });
    
    // Gérer les fermetures de modaux par Echap
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Fermer les modaux ouverts
        document.querySelectorAll('.booking-modal, .admin-modal, .auth-modal').forEach(modal => {
          if (modal.style.display === 'flex') {
            // Déclencher l'événement de fermeture
            const closeBtn = modal.querySelector('.modal-close, .auth-modal-close, .admin-modal-close');
            if (closeBtn) closeBtn.click();
          }
        });
        
        // Quitter le plein écran
        if (this.config.isFullscreen) {
          this.exitFullscreen();
        }
      }
    });
  },
  
  /**
   * Gère les actions spéciales pour certains éléments de menu
   */
  handleSpecialMenuActions(menuItem) {
    // Identifier l'élément sélectionné
    const menuId = menuItem.dataset.menuId;
    
    if (menuId === 'admin') {
      // Afficher le panneau d'administration
      this.showAdminPanel();
    } else {
      // Masquer le panneau d'administration pour les autres sections
      const adminSection = document.getElementById('adminSection');
      if (adminSection) {
        adminSection.style.display = 'none';
      }
    }
  },
  
  /**
   * Affiche le panneau d'administration
   */
  showAdminPanel() {
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
      
      // Initialiser le système d'administration si disponible
      if (window.AdminSystem && typeof AdminSystem.init === 'function') {
        AdminSystem.init();
      }
    }
  },
  
  /**
   * Rafraîchit toutes les données de l'application
   */
  refreshAllData() {
    // Réunions
    if (typeof fetchMeetings === 'function') {
      fetchMeetings();
    }
    
    // Statut des salles
    if (typeof updateRoomStatus === 'function') {
      updateRoomStatus();
    }
    
    // Afficher une notification
    this.showNotification('Données rafraîchies', 'success');
  }
};

// Initialiser le système d'interface utilisateur au chargement
document.addEventListener('DOMContentLoaded', () => {
  UISystem.init();
  
  // Associer le bouton de rafraîchissement
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => UISystem.refreshAllData());
  }
});

// Exporter pour utilisation dans d'autres modules
window.UISystem = UISystem;
