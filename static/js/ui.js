/**
 * Fonctions de gestion de l'interface utilisateur
 * Version mise à jour pour barre de contrôle compacte et meilleure gestion des boutons.
 */

// Système de gestion de l'interface utilisateur
const UISystem = {
  // État de l'interface
  menuExpanded: false,
  roomsVisible: false,
  darkMode: false, // Gardé si tu comptes ajouter un thème sombre

  /**
   * Initialise le système d'interface utilisateur
   */
  init() {
    if (window.APP_CONFIG?.DEBUG) console.log("UI: Initialisation...");

    // Initialiser le menu latéral
    this.initMenu();

    // Initialiser le menu utilisateur (profile dropdown)
    this.initUserProfileMenu();

    // Initialiser le basculement de thème (si présent)
    this.initThemeToggle();

    // Initialiser les événements des boutons généraux et de la barre de contrôle
    this.initGeneralEvents();

    // Initialiser le comportement des boutons d'affichage des salles
    this.initRoomsToggle();
  },

  /**
   * Initialise le menu latéral avec une approche simplifiée
   */
  initMenu() {
    const menuToggle = document.querySelector('.menu-toggle-visible');
    const sideMenu = document.querySelector('.side-menu');
    const mainContainer = document.querySelector('.main-container');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    if (!menuToggle || !sideMenu || !mainContainer) {
      console.warn("UI: Composants essentiels du menu non trouvés");
      return;
    }
    
    // Gestionnaire d'événement pour le bouton de menu
    menuToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!this.menuExpanded) {
        // Ouvrir le menu
        this.menuExpanded = true;
        sideMenu.classList.add('expanded');
        mainContainer.classList.add('menu-expanded');
        if (menuOverlay) menuOverlay.classList.add('active');
        console.log("UI: Menu ouvert");
      } else {
        // Fermer le menu
        this.menuExpanded = false;
        sideMenu.classList.remove('expanded');
        mainContainer.classList.remove('menu-expanded');
        if (menuOverlay) menuOverlay.classList.remove('active');
        console.log("UI: Menu fermé");
      }
    });
    
    // Fermeture par clic sur l'overlay (mobile)
    if (menuOverlay) {
      menuOverlay.addEventListener('click', () => {
        this.menuExpanded = false;
        sideMenu.classList.remove('expanded');
        mainContainer.classList.remove('menu-expanded');
        menuOverlay.classList.remove('active');
      });
    }
    
    // Fermeture par clic extérieur
    document.addEventListener('click', (e) => {
      if (this.menuExpanded && !menuToggle.contains(e.target) && !sideMenu.contains(e.target)) {
        this.menuExpanded = false;
        sideMenu.classList.remove('expanded');
        mainContainer.classList.remove('menu-expanded');
        if (menuOverlay) menuOverlay.classList.remove('active');
      }
    });
    
    console.log("UI: Initialisation du menu terminée");
  },

  /**
   * Initialise le menu utilisateur (Dropdown Profile)
   */
   initUserProfileMenu() {
        const userProfileButton = document.getElementById('userProfileBtn');
        const userDropdown = document.querySelector('.user-dropdown');

        if (!userProfileButton || !userDropdown) {
            // Pas d'erreur si l'utilisateur n'est pas connecté
            return;
        }
        if (window.APP_CONFIG?.DEBUG) console.log("Initialisation du menu profil utilisateur");

        let hideTimeout;

        const showDropdown = () => {
            clearTimeout(hideTimeout);
            userDropdown.classList.add('show');
        };

        const hideDropdown = (immediate = false) => {
            clearTimeout(hideTimeout);
            if (immediate) {
                 userDropdown.classList.remove('show');
            } else {
                hideTimeout = setTimeout(() => {
                    if (!userProfileButton.matches(':hover') && !userDropdown.matches(':hover')) {
                        userDropdown.classList.remove('show');
                    }
                }, 250); // Délai avant fermeture
            }
        };

        // Afficher au clic ou au survol
        userProfileButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Empêche la fermeture immédiate par le listener document
            if (userDropdown.classList.contains('show')) {
                 hideDropdown(true); // Ferme immédiatement si déjà ouvert
            } else {
                 showDropdown();
            }
        });
        userProfileButton.addEventListener('mouseenter', showDropdown);

        // Masquer en quittant la zone bouton + dropdown
        userProfileButton.addEventListener('mouseleave', () => hideDropdown());
        userDropdown.addEventListener('mouseenter', showDropdown); // Garde ouvert si on entre dans le dropdown
        userDropdown.addEventListener('mouseleave', () => hideDropdown());

        // Fermer si on clique ailleurs
        document.addEventListener('click', (e) => {
            if (!userProfileButton.contains(e.target) && !userDropdown.contains(e.target)) {
                 hideDropdown(true); // Ferme immédiatement
            }
        });

      // Gestionnaire pour les liens du menu
      userDropdown.querySelectorAll('.user-dropdown-link').forEach(link => {
        link.addEventListener('click', (e) => {
          const action = link.id;
          hideDropdown(true); // Ferme le menu après clic sur une action

          if (action === 'logoutBtn' && window.AuthSystem) {
            e.preventDefault();
            if (window.APP_CONFIG?.DEBUG) console.log("Action: Déconnexion");
            window.AuthSystem.logout();
          } else if (action === 'profileLink') {
            e.preventDefault();
             if (window.APP_CONFIG?.DEBUG) console.log("Action: Afficher Profil (TODO)");
            // Ajouter la logique pour afficher le profil
          } else if (action === 'settingsLink') {
            e.preventDefault();
             if (window.APP_CONFIG?.DEBUG) console.log("Action: Afficher Paramètres (TODO)");
            // Ajouter la logique pour afficher les paramètres
          }
        });
      });
  },


  /**
   * Initialise le basculement de thème (clair/sombre) - Optionnel
   */
  initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle'); // Assurez-vous que cet ID existe si vous voulez cette fonction
    if (!themeToggle) return; // Ne rien faire si le bouton n'existe pas

     if (window.APP_CONFIG?.DEBUG) console.log("Initialisation du switch de thème");

    const savedTheme = localStorage.getItem('theme');
    this.darkMode = savedTheme === 'dark';

    const applyTheme = () => {
      document.body.classList.toggle('dark-mode', this.darkMode);
      document.body.classList.toggle('light-mode', !this.darkMode); // Optionnel : ajouter classe light-mode
      themeToggle.innerHTML = this.darkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
      themeToggle.title = this.darkMode ? 'Passer au thème clair' : 'Passer au thème sombre';
      if (window.APP_CONFIG?.DEBUG) console.log(`Thème appliqué: ${this.darkMode ? 'Sombre' : 'Clair'}`);
    };

    applyTheme(); // Appliquer le thème initial

    themeToggle.addEventListener('click', () => {
      this.darkMode = !this.darkMode;
      localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
      applyTheme();
    });
  },

  /**
   * Initialise les événements des boutons généraux (Refresh, Fullscreen, Help...)
   */
  initGeneralEvents() {
    // --- Bouton Rafraîchir ---
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        if (window.APP_CONFIG?.DEBUG) console.log("Clic sur Rafraîchir");
        if (typeof window.fetchMeetings === 'function') {
          // Ajoute une classe 'loading' pour feedback visuel
          const icon = refreshBtn.querySelector('i');
          if (icon) {
             icon.classList.add('fa-spin');
             refreshBtn.disabled = true;
          }
          // Appelle fetchMeetings et retire le spin une fois terminé (dans fetchMeetings ou via Promise)
          window.fetchMeetings(true) // true pour forcer
             .finally(() => {
                 if (icon) {
                    icon.classList.remove('fa-spin');
                    refreshBtn.disabled = false;
                 }
             });
        } else {
          console.warn("La fonction fetchMeetings n'est pas disponible.");
          // Peut-être juste recharger la page comme fallback ?
          // window.location.reload();
        }
      });
    }

    // --- Bouton Plein Écran ---
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const fullscreenIcon = fullscreenBtn ? fullscreenBtn.querySelector('i') : null;

    const updateFullscreenButton = () => {
        if (!fullscreenBtn || !fullscreenIcon) return;
        if (document.fullscreenElement) {
            fullscreenIcon.classList.remove('fa-expand');
            fullscreenIcon.classList.add('fa-compress');
            fullscreenBtn.title = "Quitter le plein écran";
        } else {
            fullscreenIcon.classList.remove('fa-compress');
            fullscreenIcon.classList.add('fa-expand');
            fullscreenBtn.title = "Passer en plein écran";
        }
    };

    if (fullscreenBtn && fullscreenIcon) {
        fullscreenBtn.addEventListener('click', (e) => {
            e.preventDefault();
            try {
                if (!document.fullscreenElement) {
                    const docEl = document.documentElement;
                    
                    if (docEl.requestFullscreen) {
                        docEl.requestFullscreen().catch(err => {
                            console.warn("Fullscreen API n'a pas pu être activée");
                        });
                    } else if (docEl.mozRequestFullScreen) {
                        docEl.mozRequestFullScreen();
                    } else if (docEl.webkitRequestFullscreen) {
                        docEl.webkitRequestFullscreen();
                    } else if (docEl.msRequestFullscreen) {
                        docEl.msRequestFullscreen();
                    }
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                }
            } catch (err) {
                console.warn("Fullscreen API error:", err);
            }
        });

        // Listeners pour tous les types de navigateurs
        document.addEventListener('fullscreenchange', updateFullscreenButton);
        document.addEventListener('mozfullscreenchange', updateFullscreenButton);
        document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
        document.addEventListener('MSFullscreenChange', updateFullscreenButton);
        
        updateFullscreenButton(); // État initial
    }

    // --- Bouton Créer Réunion (Barre de Contrôle) ---
    const createMeetingBtn = document.getElementById('createMeetingBtn');
    if (createMeetingBtn) {
        // Utiliser cloneNode pour éviter les listeners dupliqués (bonne pratique)
        const newCreateBtn = createMeetingBtn.cloneNode(true);
        if (createMeetingBtn.parentNode) {
            createMeetingBtn.parentNode.replaceChild(newCreateBtn, createMeetingBtn);
        }
        newCreateBtn.addEventListener('click', () => {
             if (window.APP_CONFIG?.DEBUG) console.log("Clic sur Créer réunion (barre contrôle)");
            // Logique pour ouvrir le modal de réservation
            if (window.BookingSystem && typeof window.BookingSystem.openModal === 'function') { // *** CORRECTION ICI ***
                window.BookingSystem.openModal(); // *** Appel correct ***
            } else {
                console.error("ERREUR: BookingSystem ou BookingSystem.openModal introuvable !");
                 // Optionnel: Afficher une notification utilisateur
                 if (typeof this.showNotification === 'function') {
                     this.showNotification("Impossible d'ouvrir le formulaire de réservation.", "error");
                 } else {
                     alert("Impossible d'ouvrir le formulaire de réservation.");
                 }
            }
        });
    } else {
         console.warn("UI: Bouton #createMeetingBtn non trouvé.");
    }

     // --- Bouton Aide ---
     const helpBtn = document.getElementById('helpBtn');
     if (helpBtn) {
         helpBtn.addEventListener('click', () => {
              if (window.APP_CONFIG?.DEBUG) console.log("Clic sur Aide (TODO)");
              this.showNotification("Fonctionnalité d'aide bientôt disponible.", "info");
             // Ajouter logique pour afficher l'aide (modal, lien, etc.)
         });
     }

     // --- Bouton Créer Réunion (Intégré au panneau Meetings) ---
     // Note: ce bouton n'est pas dans la barre de contrôle mais a une action similaire
     const createMeetingIntegratedBtn = document.querySelector('.create-meeting-integrated');
     if (createMeetingIntegratedBtn) {
        createMeetingIntegratedBtn.addEventListener('click', () => {
            if (window.APP_CONFIG?.DEBUG) console.log("Clic sur Créer réunion (panneau meetings)");
            if (window.BookingSystem && typeof window.BookingSystem.openModal === 'function') {
                window.BookingSystem.openModal();
            } else {
                console.warn("BookingSystem.openModal non trouvé.");
            }
        });
     }
  },

  /**
  * Initialise les boutons qui affichent/masquent la section des salles.
  */
  initRoomsToggle() {
    const roomsSection = document.querySelector('.rooms-section');
    if (!roomsSection) {
        console.warn("Section des salles (.rooms-section) non trouvée.");
        return;
    }

    // Liste des sélecteurs pour tous les boutons qui contrôlent l'affichage des salles
    const toggleButtonSelectors = [
        '#showRoomsBtn',                 // Bouton dans la barre de contrôle
        '.rooms-toggle-button-floating', // Bouton flottant (mobile)
        '.side-menu .toggle-rooms-button' // Bouton dans le menu latéral
    ];

    const toggleButtons = document.querySelectorAll(toggleButtonSelectors.join(', '));

    if (toggleButtons.length === 0) {
        console.warn("Aucun bouton pour afficher/masquer les salles trouvé.");
        return;
    }

    // Fonction pour mettre à jour l'état et l'apparence de tous les boutons et de la section
    const updateRoomsVisibility = (visible) => {
        this.roomsVisible = visible;
        roomsSection.classList.toggle('visible', this.roomsVisible);

        toggleButtons.forEach(btn => {
            const icon = btn.querySelector('i');
            if (!icon) return;

            if (this.roomsVisible) {
                // État : Visible (donc le bouton doit proposer de masquer)
                icon.classList.remove('fa-door-open');
                icon.classList.add('fa-times'); // Utiliser une icône de fermeture
                btn.title = "Masquer les salles";
                // Pour le bouton du menu latéral, on peut aussi changer le texte
                const textSpan = btn.querySelector('.button-text');
                if(textSpan) textSpan.textContent = "Masquer les salles";
                 btn.classList.add('active'); // Ajoute une classe active si besoin de style spécifique
            } else {
                // État : Caché (donc le bouton doit proposer d'afficher)
                icon.classList.remove('fa-times');
                icon.classList.add('fa-door-open');
                btn.title = "Afficher les salles disponibles";
                 const textSpan = btn.querySelector('.button-text');
                if(textSpan) textSpan.textContent = "Afficher les salles";
                 btn.classList.remove('active');
            }
        });
         if (window.APP_CONFIG?.DEBUG) console.log(`Visibilité des salles changée: ${this.roomsVisible}`);
    };

    // Attacher l'événement de clic à chaque bouton
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            updateRoomsVisibility(!this.roomsVisible); // Inverse l'état actuel

             // Si c'est le bouton du menu latéral et que le menu est ouvert sur mobile, on le ferme
             if (btn.closest('.side-menu') && window.innerWidth < 768 && this.menuExpanded) {
                  const sideMenu = document.querySelector('.side-menu');
                  const mainContainer = document.querySelector('.main-container');
                  const menuOverlay = document.querySelector('.menu-overlay');
                  if (sideMenu && mainContainer && menuOverlay) {
                       this.menuExpanded = false;
                       sideMenu.classList.remove('expanded');
                       mainContainer.classList.remove('menu-expanded');
                       menuOverlay.classList.remove('active');
                  }
             }
        });
    });

    // Initialiser l'état (commence caché par défaut)
    updateRoomsVisibility(this.roomsVisible);

     // Optionnel : fermer la section des salles si on clique en dehors
     document.addEventListener('click', (e) => {
         if (this.roomsVisible && !roomsSection.contains(e.target) && ![...toggleButtons].some(btn => btn.contains(e.target))) {
            updateRoomsVisibility(false);
         }
     });
  },


  /**
   * Ajoute une notification temporaire à l'écran.
   * @param {string} message Le message à afficher.
   * @param {string} type Type de notification ('info', 'success', 'warning', 'error').
   * @param {number} duration Durée en ms avant fermeture auto (0 pour manuel).
   */
  showNotification(message, type = 'info', duration = 5000) {
    let notificationContainer = document.getElementById('notificationContainer');

    // Créer le conteneur s'il n'existe pas déjà
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.id = 'notificationContainer';
      // Style basique pour le conteneur (peut être mis dans le CSS)
      notificationContainer.style.position = 'fixed';
      notificationContainer.style.top = '20px';
      notificationContainer.style.right = '20px';
      notificationContainer.style.zIndex = '1050'; // Au-dessus de la plupart des éléments
      notificationContainer.style.display = 'flex';
      notificationContainer.style.flexDirection = 'column';
      notificationContainer.style.gap = '10px';
      document.body.appendChild(notificationContainer);
    }

    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`; // Utiliser des classes pour le style
    // Style basique (à mettre dans le CSS idéalement)
    notification.style.backgroundColor = `var(--bg-medium, rgba(50, 50, 50, 0.9))`;
    notification.style.color = `var(--text-primary, white)`;
    notification.style.padding = '12px 18px';
    notification.style.borderRadius = `var(--border-radius-sm, 6px)`;
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.gap = '10px';
    notification.style.boxShadow = `var(--shadow-md, 0 4px 8px rgba(0,0,0,0.3))`;
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    notification.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    notification.style.minWidth = '250px';
    notification.style.maxWidth = '400px';

    notification.innerHTML = `
      <i class="fas ${this.getIconForType(type)}" style="font-size: 1.2em; margin-top: 2px;"></i>
      <span style="flex-grow: 1;">${message}</span>
      <button class="notification-close" style="background: none; border: none; color: inherit; font-size: 1.1em; cursor: pointer; padding: 0 5px; margin-left: 10px;">
        <i class="fas fa-times"></i>
      </button>
    `;

    // Ajouter au conteneur (en haut de la liste)
    notificationContainer.insertBefore(notification, notificationContainer.firstChild);

    // Animation d'entrée
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 10); // Léger délai pour que la transition s'applique

    const closeHandler = () => this.closeNotification(notification);

    // Bouton de fermeture
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeHandler);
    }

    // Fermeture automatique
    if (duration > 0) {
      const timerId = setTimeout(closeHandler, duration);
      // Annuler le timer si fermeture manuelle
      notification.addEventListener('closed', () => clearTimeout(timerId), { once: true });
    }
     if (window.APP_CONFIG?.DEBUG) console.log(`Notification affichée: [${type}] ${message}`);
  },

  /**
   * Ferme une notification spécifique avec animation.
   * @param {HTMLElement} notification L'élément de notification à fermer.
   */
  closeNotification(notification) {
    if (!notification || !notification.parentNode) return; // Déjà retirée

    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';

    // Supprimer l'élément du DOM après l'animation
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
        // Émettre un événement pour annuler le timer si nécessaire
        notification.dispatchEvent(new Event('closed'));
      }
    }, 300); // Doit correspondre à la durée de la transition CSS
  },

  /**
   * Obtient l'icône Font Awesome basée sur le type de notification.
   * @param {string} type Type de notification.
   * @returns {string} Classe de l'icône Font Awesome.
   */
  getIconForType(type) {
    switch (type) {
      case 'success': return 'fa-check-circle';
      case 'error':   return 'fa-exclamation-circle';
      case 'warning': return 'fa-exclamation-triangle';
      case 'info':
      default:        return 'fa-info-circle';
    }
  },

  /**
   * Met à jour les informations utilisateur dans l'interface (header)
   * @param {object|null} userData Données utilisateur ou null si déconnecté
   */
    updateUserDisplay(userData) {
        const userProfileButton = document.getElementById('userProfileBtn');
        const loginButton = document.getElementById('loginBtn');
        const userInitialsDiv = userProfileButton ? userProfileButton.querySelector('.user-initials') : null;
        const userNameSpan = userProfileButton ? userProfileButton.querySelector('.user-info span:first-child') : null;
        const userRoleSpan = userProfileButton ? userProfileButton.querySelector('.user-info .user-role') : null;
        const dropdownHeaderName = document.querySelector('.user-dropdown-header span:first-child');
        const dropdownHeaderRole = document.querySelector('.user-dropdown-header .user-role-full');

        if (userData) {
            // Utilisateur connecté
            if (loginButton) loginButton.style.display = 'none';
            if (userProfileButton) userProfileButton.style.display = 'flex';

            const initials = (userData.firstName?.[0] || '') + (userData.lastName?.[0] || '');
            const displayName = userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Utilisateur';
            const role = userData.role || 'Utilisateur'; // Default role if not provided
            const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1); // Capitalize role

            if (userInitialsDiv) userInitialsDiv.textContent = initials || '--';
            if (userNameSpan) userNameSpan.textContent = displayName;
            if (userRoleSpan) userRoleSpan.textContent = roleDisplay;

            // Mettre à jour le dropdown aussi
            if (dropdownHeaderName) dropdownHeaderName.textContent = displayName;
            if (dropdownHeaderRole) dropdownHeaderRole.textContent = roleDisplay; // Assumons que le rôle est déjà formaté

            // Gérer la visibilité des éléments basés sur le rôle (dans le menu latéral par ex.)
             this.updateRoleBasedVisibility(userData.role);


        } else {
            // Utilisateur déconnecté
            if (userProfileButton) userProfileButton.style.display = 'none';
            if (loginButton) loginButton.style.display = 'flex';

             // Réinitialiser les éléments de menu basés sur le rôle (afficher que le public)
             this.updateRoleBasedVisibility(null); // null ou 'guest' pour déconnecté
        }
         if (window.APP_CONFIG?.DEBUG) console.log("Affichage utilisateur mis à jour", userData);
    },

   /**
   * Met à jour la visibilité des éléments basés sur le rôle de l'utilisateur.
   * @param {string|null} userRole Le rôle de l'utilisateur ('administrator', 'manager', 'user', etc.) ou null/guest.
   */
    updateRoleBasedVisibility(userRole) {
        const allRestrictedElements = document.querySelectorAll('[data-role]');

        allRestrictedElements.forEach(element => {
            const requiredRoles = element.getAttribute('data-role').split(',').map(r => r.trim().toLowerCase());

            // Si l'utilisateur est connecté ET que son rôle est dans la liste des rôles requis
            if (userRole && requiredRoles.includes(userRole.toLowerCase())) {
                element.style.display = ''; // Afficher l'élément (ou la valeur par défaut du CSS)
            } else {
                 // Si l'élément est spécifiquement pour les invités/public et que l'user est déco
                 if (!userRole && requiredRoles.includes('guest')) {
                     element.style.display = '';
                 }
                 // Sinon, masquer l'élément
                 else {
                     element.style.display = 'none';
                 }
            }
        });
         if (window.APP_CONFIG?.DEBUG) console.log(`Visibilité basée sur le rôle "${userRole}" mise à jour.`);
    },

    /**
     * Ferme le menu latéral. Méthode publique pouvant être appelée depuis d'autres scripts.
     */
    closeSideMenu() {
        const sideMenu = document.querySelector('.side-menu');
        const mainContainer = document.querySelector('.main-container');
        const menuOverlay = document.querySelector('.menu-overlay');
        
        // Simplement fermer le menu sans conditions complexes
        this.menuExpanded = false;
        
        if (sideMenu) {
            sideMenu.classList.remove('expanded');
        }
        
        if (mainContainer) {
            mainContainer.classList.remove('menu-expanded');
        }
        
        if (menuOverlay) {
            menuOverlay.classList.remove('active');
        }
    }
};

// Exposer UISystem globalement pour pouvoir l'appeler depuis d'autres scripts (ex: AuthSystem)
window.UISystem = UISystem;