/**
 * Fonctions de gestion de l'interface utilisateur
 */

// Système de gestion de l'interface utilisateur
const UISystem = {
  // État de l'interface
  menuExpanded: false,
  roomsVisible: false,
  darkMode: false,
  
  /**
   * Initialise le système d'interface utilisateur
   */
  init() {
    console.log("Initialisation du système d'interface utilisateur");
    
    // Initialiser le menu
    this.initMenu();
    
    // Initialiser le menu utilisateur
    this.initUserProfileMenu();
    
    // Initialiser le mode sombre/clair
    this.initThemeToggle();
    
    // Initialiser les événements généraux
    this.initGeneralEvents();
  },
  
  /**
   * Initialise le menu latéral
   */
  initMenu() {
    const menuToggle = document.querySelector('.menu-toggle-visible');
    const sideMenu = document.querySelector('.side-menu');
    const mainContainer = document.querySelector('.main-container');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    if (menuToggle && sideMenu && mainContainer) {
      menuToggle.addEventListener('click', () => {
        this.menuExpanded = !this.menuExpanded;
        
        sideMenu.classList.toggle('expanded', this.menuExpanded);
        mainContainer.classList.toggle('menu-expanded', this.menuExpanded);
        
        if (menuOverlay) {
          menuOverlay.classList.toggle('active', this.menuExpanded);
        }
      });
    }
    
    // Fermer le menu au clic sur l'overlay
    if (menuOverlay) {
      menuOverlay.addEventListener('click', () => {
        this.menuExpanded = false;
        sideMenu.classList.remove('expanded');
        mainContainer.classList.remove('menu-expanded');
        menuOverlay.classList.remove('active');
      });
    }
    
    // Gestionnaire pour les items du menu
    document.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', () => {
        // Ajouter ici la logique de navigation
        const target = item.getAttribute('data-target');
        if (target) {
          console.log(`Navigation vers ${target}`);
          
          // Si on est en mobile, fermer le menu après la navigation
          if (window.innerWidth < 768) {
            this.menuExpanded = false;
            sideMenu.classList.remove('expanded');
            mainContainer.classList.remove('menu-expanded');
            if (menuOverlay) menuOverlay.classList.remove('active');
          }
        }
      });
    });
  },
  
  /**
   * Initialise le menu utilisateur
   */
  initUserProfileMenu() {
    console.log("Initialisation du menu utilisateur");
    
    const userProfile = document.querySelector('.user-profile-button');
    const userDropdown = document.querySelector('.user-dropdown');
    
    if (userProfile && userDropdown) {
      console.log("Composants du menu utilisateur trouvés");
      
      // Gestion du clic sur le bouton de profil
      userProfile.addEventListener('click', function(e) {
        console.log("Clic sur le profil utilisateur");
        e.preventDefault();
        e.stopPropagation();
        userDropdown.classList.toggle('show');
      });
      
      // Fermer le menu au clic ailleurs
      document.addEventListener('click', function(e) {
        if (userDropdown.classList.contains('show') && !userProfile.contains(e.target)) {
          userDropdown.classList.remove('show');
        }
      });
      
      // Maintenir ouvert au survol
      userProfile.addEventListener('mouseenter', () => {
        userDropdown.classList.add('show');
      });
      
      let timeoutId;
      userProfile.addEventListener('mouseleave', () => {
        timeoutId = setTimeout(() => {
          if (!userDropdown.matches(':hover')) {
            userDropdown.classList.remove('show');
          }
        }, 300);
      });
      
      userDropdown.addEventListener('mouseenter', () => {
        clearTimeout(timeoutId);
      });
      
      userDropdown.addEventListener('mouseleave', () => {
        setTimeout(() => {
          if (!userProfile.matches(':hover')) {
            userDropdown.classList.remove('show');
          }
        }, 300);
      });
      
      // Gestionnaire pour les liens du menu
      userDropdown.querySelectorAll('.user-dropdown-link').forEach(link => {
        link.addEventListener('click', (e) => {
          const action = link.id;
          
          if (action === 'logoutBtn' && window.AuthSystem) {
            e.preventDefault();
            window.AuthSystem.logout();
          } else if (action === 'profileLink') {
            e.preventDefault();
            console.log("Affichage du profil utilisateur");
            // Ajouter la logique pour afficher le profil
          } else if (action === 'settingsLink') {
            e.preventDefault();
            console.log("Affichage des paramètres utilisateur");
            // Ajouter la logique pour afficher les paramètres
          }
        });
      });
    } else {
      console.warn("Composants du menu utilisateur non trouvés");
    }
  },
  
  /**
   * Initialise le basculement de thème (clair/sombre)
   */
  initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (themeToggle) {
      // Vérifier le thème sauvegardé
      const savedTheme = localStorage.getItem('theme');
      this.darkMode = savedTheme === 'dark';
      
      // Appliquer le thème initial
      document.body.classList.toggle('dark-mode', this.darkMode);
      themeToggle.innerHTML = this.darkMode 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
      
      // Gestionnaire d'événement
      themeToggle.addEventListener('click', () => {
        this.darkMode = !this.darkMode;
        document.body.classList.toggle('dark-mode', this.darkMode);
        
        themeToggle.innerHTML = this.darkMode 
          ? '<i class="fas fa-sun"></i>' 
          : '<i class="fas fa-moon"></i>';
        
        // Sauvegarder la préférence
        localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
      });
    }
  },
  
  /**
   * Initialise les événements généraux de l'interface
   */
  initGeneralEvents() {
    // Gestion du passage en plein écran
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => {
            console.error(`Erreur lors du passage en plein écran: ${err.message}`);
          });
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
        }
      });
      
      // Mettre à jour l'icône selon l'état du plein écran
      document.addEventListener('fullscreenchange', () => {
        fullscreenBtn.innerHTML = document.fullscreenElement
          ? '<i class="fas fa-compress"></i> Quitter le plein écran'
          : '<i class="fas fa-expand"></i> Plein écran';
      });
    }
    
    // Gestion de l'affichage des salles
    const roomsToggleBtn = document.getElementById('toggleRoomsBtn');
    const roomsSection = document.querySelector('.rooms-section');
    
    if (roomsToggleBtn && roomsSection) {
      roomsToggleBtn.addEventListener('click', () => {
        this.roomsVisible = !this.roomsVisible;
        roomsSection.classList.toggle('visible', this.roomsVisible);
        
        roomsToggleBtn.innerHTML = this.roomsVisible
          ? '<i class="fas fa-times"></i> Masquer les salles'
          : '<i class="fas fa-door-open"></i> Afficher les salles';
      });
    }
  },
  
  /**
   * Ajoute une notification temporaire
   */
  showNotification(message, type = 'info', duration = 5000) {
    const notificationContainer = document.getElementById('notificationContainer');
    
    if (!notificationContainer) {
      // Créer le conteneur s'il n'existe pas
      const container = document.createElement('div');
      container.id = 'notificationContainer';
      container.className = 'notification-container';
      document.body.appendChild(container);
    }
    
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${this.getIconForType(type)}"></i>
        <span>${message}</span>
      </div>
      <button class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    // Ajouter au conteneur
    notificationContainer.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Bouton de fermeture
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeNotification(notification);
      });
    }
    
    // Fermeture automatique après la durée spécifiée
    if (duration > 0) {
      setTimeout(() => {
        this.closeNotification(notification);
      }, duration);
    }
  },
  
  /**
   * Ferme une notification avec animation
   */
  closeNotification(notification) {
    notification.classList.remove('show');
    
    // Supprimer après l'animation
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  },
  
  /**
   * Obtient l'icône Font Awesome pour le type de notification
   */
  getIconForType(type) {
    switch (type) {
      case 'success':
        return 'fa-check-circle';
      case 'error':
        return 'fa-exclamation-circle';
      case 'warning':
        return 'fa-exclamation-triangle';
      case 'info':
      default:
        return 'fa-info-circle';
    }
  }
};

// Initialiser le système d'interface au chargement du document
document.addEventListener('DOMContentLoaded', () => {
  UISystem.init();
});

// Exporter pour utilisation dans d'autres modules
window.UISystem = UISystem;
