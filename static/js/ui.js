/**
 * Système de gestion de l'interface utilisateur
 * Gérer les menus, l'affichage modal et les éléments interactifs
 */

const UISystem = {
  // État de l'interface
  isMenuExpanded: false,
  isFullscreen: false,
  currentTheme: 'default',
  
  /**
   * Initialise le système d'interface utilisateur
   */
  init() {
    // Initialiser les différents éléments d'interface
    this.initMenu();
    this.initModals();
    this.initToggles();
    this.initDropdowns();
    this.initBackgroundImage();
    
    // Gérer le mode plein écran
    this.initFullscreenMode();
    
    console.log('UI System initialized');
  },
  
  /**
   * Initialise le menu latéral
   */
  initMenu() {
    // Bouton d'ouverture/fermeture du menu
    const menuToggleBtn = document.querySelector('.menu-toggle-visible');
    const sideMenu = document.querySelector('.side-menu');
    const mainContainer = document.querySelector('.main-container');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    if (menuToggleBtn && sideMenu) {
      // Gestionnaire de clic pour le bouton de menu
      menuToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.isMenuExpanded = !this.isMenuExpanded;
        
        // Mettre à jour les classes
        sideMenu.classList.toggle('expanded', this.isMenuExpanded);
        if (mainContainer) {
          mainContainer.classList.toggle('menu-expanded', this.isMenuExpanded);
        }
        
        // Activer l'overlay sur mobile
        if (menuOverlay && window.innerWidth <= 768) {
          menuOverlay.classList.toggle('active', this.isMenuExpanded);
        }
        
        // Animation du bouton
        menuToggleBtn.classList.toggle('active');
      });
      
      // Fermer le menu si on clique en dehors (sur mobile)
      if (menuOverlay) {
        menuOverlay.addEventListener('click', () => {
          this.closeMenu();
        });
      }
      
      // Fermer le menu lors du redimensionnement de la fenêtre (si on passe de mobile à desktop)
      window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && menuOverlay && menuOverlay.classList.contains('active')) {
          this.closeMenu();
        }
      });
    }
    
    // Initialiser les éléments de menu
    this.initMenuItems();
  },
  
  /**
   * Ferme le menu latéral
   */
  closeMenu() {
    const sideMenu = document.querySelector('.side-menu');
    const mainContainer = document.querySelector('.main-container');
    const menuOverlay = document.querySelector('.menu-overlay');
    const menuToggleBtn = document.querySelector('.menu-toggle-visible');
    
    if (sideMenu) sideMenu.classList.remove('expanded');
    if (mainContainer) mainContainer.classList.remove('menu-expanded');
    if (menuOverlay) menuOverlay.classList.remove('active');
    if (menuToggleBtn) menuToggleBtn.classList.remove('active');
    
    this.isMenuExpanded = false;
  },
  
  /**
   * Initialise les éléments du menu
   */
  initMenuItems() {
    // Gérer les liens actifs du menu
    const menuItems = document.querySelectorAll('.menu-item');
    if (menuItems.length > 0) {
      // Obtenir le chemin courant
      const currentPath = window.location.pathname;
      
      menuItems.forEach(item => {
        const link = item.getAttribute('href') || '';
        
        // Marquer comme actif si le chemin correspond
        if (link && currentPath.includes(link)) {
          item.classList.add('active');
        }
        
        // Éviter de fermer le menu sur les clics de sous-menu
        item.addEventListener('click', (e) => {
          // Si c'est un lien avec sous-menu
          if (item.classList.contains('has-submenu')) {
            e.preventDefault();
            item.classList.toggle('expanded');
          }
        });
      });
    }
    
    // Gestion du bouton d'affichage des salles
    const roomsToggleBtn = document.querySelector('.toggle-rooms-button');
    if (roomsToggleBtn) {
      roomsToggleBtn.addEventListener('click', () => {
        this.toggleRoomsSection();
      });
    }
  },
  
  /**
   * Affiche/masque la section des salles
   */
  toggleRoomsSection() {
    const roomsSection = document.querySelector('.rooms-section');
    if (roomsSection) {
      roomsSection.classList.toggle('visible');
    }
  },
  
  /**
   * Initialise les fenêtres modales
   */
  initModals() {
    // Trouver tous les boutons qui ouvrent des modals
    const modalTriggers = document.querySelectorAll('[data-modal]');
    
    modalTriggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const modalId = trigger.getAttribute('data-modal');
        this.openModal(modalId);
      });
    });
    
    // Trouver tous les boutons de fermeture
    const closeButtons = document.querySelectorAll('.modal-close, [data-close-modal]');
    
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        if (modal) {
          this.closeModal(modal.id);
        }
      });
    });
    
    // Fermer les modals en cliquant en dehors du contenu
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal.id);
        }
      });
    });
  },
  
  /**
   * Ouvre une fenêtre modale
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // Empêcher le défilement de la page
      
      // Animer l'entrée
      setTimeout(() => {
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
          modalContent.style.opacity = '1';
          modalContent.style.transform = 'translateY(0)';
        }
      }, 50);
    }
  },
  
  /**
   * Ferme une fenêtre modale
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      // Animer la sortie
      const modalContent = modal.querySelector('.modal-content');
      if (modalContent) {
        modalContent.style.opacity = '0';
        modalContent.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
          modal.style.display = 'none';
          document.body.style.overflow = ''; // Rétablir le défilement
        }, 300);
      } else {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    }
  },
  
  /**
   * Initialise les toggles et switches
   */
  initToggles() {
    const toggleButtons = document.querySelectorAll('.toggle-button');
    
    toggleButtons.forEach(button => {
      button.addEventListener('click', () => {
        button.classList.toggle('active');
        
        // Exécuter l'action associée au toggle
        const action = button.getAttribute('data-action');
        if (action && typeof this[action] === 'function') {
          this[action]();
        }
      });
    });
  },
  
  /**
   * Initialise les menus déroulants
   */
  initDropdowns() {
    const dropdownTriggers = document.querySelectorAll('.dropdown-trigger');
    
    dropdownTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        
        const dropdown = trigger.nextElementSibling;
        if (dropdown && dropdown.classList.contains('dropdown-menu')) {
          dropdown.classList.toggle('show');
          
          // Fermer les autres dropdowns
          dropdownTriggers.forEach(otherTrigger => {
            if (otherTrigger !== trigger) {
              const otherDropdown = otherTrigger.nextElementSibling;
              if (otherDropdown && otherDropdown.classList.contains('dropdown-menu')) {
                otherDropdown.classList.remove('show');
              }
            }
          });
        }
      });
    });
    
    // Fermer les dropdowns en cliquant ailleurs
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        menu.classList.remove('show');
      });
    });
  },
  
  /**
   * Initialise la gestion du mode plein écran
   */
  initFullscreenMode() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        this.toggleFullscreen();
      });
    }
    
    // Détecter les changements d'état du plein écran
    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen = !!document.fullscreenElement;
      if (fullscreenBtn) {
        fullscreenBtn.innerHTML = this.isFullscreen
          ? '<i class="fas fa-compress"></i> Quitter'
          : '<i class="fas fa-expand"></i> Plein écran';
      }
    });
  },
  
  /**
   * Bascule le mode plein écran
   */
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      // Passer en plein écran
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Erreur lors du passage en plein écran: ${err.message}`);
      });
    } else {
      // Quitter le plein écran
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  },
  
  /**
   * Initialise l'image d'arrière-plan
   */
  initBackgroundImage() {
    const bgContainer = document.getElementById('background-container');
    if (!bgContainer) return;
    
    // Vérifier si BACKGROUNDS est défini
    if (!window.BACKGROUNDS || window.BACKGROUNDS.length === 0) {
      // Définir un tableau par défaut
      window.BACKGROUNDS = [
        '/static/Images/iStock-1137376794.jpg',
        '/static/Images/iStock-1512013316.jpg',
        '/static/Images/iStock-2019872476.jpg',
        '/static/Images/iStock-2154828608.jpg',
        '/static/Images/iStock-2157915069.jpg',
        '/static/Images/iStock-2162113462.jpg'
      ];
    }
    
    // Sélectionner une image aléatoire
    const randomIndex = Math.floor(Math.random() * window.BACKGROUNDS.length);
    const imagePath = window.BACKGROUNDS[randomIndex];
    
    // Définir l'image de fond
    bgContainer.style.backgroundImage = `url('${imagePath}')`;
    
    // Rotation périodique si configuré
    if (window.REFRESH_INTERVALS && window.REFRESH_INTERVALS.BACKGROUND) {
      setInterval(() => {
        const newIndex = Math.floor(Math.random() * window.BACKGROUNDS.length);
        const newImage = window.BACKGROUNDS[newIndex];
        
        // Animation de transition
        bgContainer.style.opacity = '0';
        setTimeout(() => {
          bgContainer.style.backgroundImage = `url('${newImage}')`;
          bgContainer.style.opacity = '1';
        }, 500);
      }, window.REFRESH_INTERVALS.BACKGROUND);
    }
  }
};

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  UISystem.init();
});

// Exposer le système pour utilisation dans d'autres modules
window.UISystem = UISystem;
