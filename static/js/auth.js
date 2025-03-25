/**
 * Système d'authentification pour l'application de réservation de salles
 * Utilise le stockage local et les cookies sécurisés
 */

// Système de gestion d'authentification
const AuthSystem = {
  // État de l'authentification
  currentUser: null,
  isAuthenticated: false,
  
  // Constantes
  TOKEN_KEY: 'teams_rooms_auth_token',
  USER_KEY: 'teams_rooms_user',
  TOKEN_EXPIRY: 8 * 60 * 60 * 1000, // 8 heures en millisecondes
  
  /**
   * Initialise le système d'authentification
   */
  init() {
    console.log("Initialisation du système d'authentification");
    
    // Vérifier si un token est déjà présent
    this.checkAuthState();
    
    // Ajouter les écouteurs d'événements
    document.addEventListener('DOMContentLoaded', () => {
      // Gestion de l'affichage du modal de connexion
      console.log("Recherche du bouton de connexion");
      const loginBtn = document.querySelector('#loginBtn, .auth-hidden[id="loginBtn"]');
      if (loginBtn) {
        console.log("Bouton de connexion trouvé, ajout du gestionnaire d'événements");
        loginBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("Clic sur le bouton de connexion");
          this.showLoginModal();
        });
      } else {
        console.warn("Bouton de connexion non trouvé");
      }
      
      // Formulaire de connexion
      const loginForm = document.getElementById('loginForm');
      if (loginForm) {
        loginForm.addEventListener('submit', (e) => this.handleLogin(e));
      }
      
      // Bouton de déconnexion
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => this.logout());
      }
      
      // Correction du menu utilisateur pour éviter qu'il ne disparaisse
      this.initUserProfileMenu();
      
      // Mettre à jour l'interface en fonction de l'état d'authentification
      this.updateUI();
    });
  },
  
  /**
   * Initialise le menu du profil utilisateur avec des interactions améliorées
   */
  initUserProfileMenu() {
    const userProfile = document.querySelector('.user-profile-button');
    const userDropdown = document.querySelector('.user-dropdown');
    
    if (userProfile && userDropdown) {
      console.log("Composants du menu utilisateur trouvés");
      
      // Au clic, alterne l'affichage du menu
      userProfile.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log("Clic sur le profil utilisateur");
        userDropdown.classList.toggle('show');
      });
      
      // Éviter la fermeture en cliquant sur le menu
      userDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      
      // Cacher au clic en dehors
      document.addEventListener('click', () => {
        userDropdown.classList.remove('show');
      });
      
      // Maintenir ouvert au survol
      userProfile.addEventListener('mouseenter', () => {
        userDropdown.classList.add('show');
      });
      
      // Délai avant fermeture pour éviter fermeture prématurée
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
    } else {
      console.warn("Composants du menu utilisateur non trouvés");
    }
  },
  
  /**
   * Vérifie l'état d'authentification au chargement
   */
  checkAuthState() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userJson = localStorage.getItem(this.USER_KEY);
    
    if (token && userJson) {
      try {
        // Décoder et vérifier le token
        const payload = this.decodeToken(token);
        const user = JSON.parse(userJson);
        
        // Vérifier si le token est expiré
        if (payload && payload.exp > Date.now()) {
          this.currentUser = user;
          this.isAuthenticated = true;
          
          // Appliquer les permissions et le rôle
          this.applyUserRole(user.role);
          
          console.log('Authentification restaurée pour', user.displayName);
        } else {
          console.log('Token expiré, déconnexion nécessaire');
          this.logout(false);
        }
      } catch (e) {
        console.error('Erreur lors de la vérification du token:', e);
        this.logout(false);
      }
    } else {
      // Pas de token ou d'information utilisateur
      this.isAuthenticated = false;
      this.currentUser = null;
    }
  },
  
  /**
   * Affiche le modal de connexion
   */
  showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
      console.log("Affichage du modal de connexion");
      loginModal.style.display = 'flex';
      
      // Animation d'entrée
      setTimeout(() => {
        const modalContent = loginModal.querySelector('.auth-modal-content');
        if (modalContent) {
          modalContent.style.opacity = '1';
          modalContent.style.transform = 'translateY(0)';
        }
      }, 50);
      
      // Focus sur le champ d'utilisateur
      const usernameField = document.getElementById('login-username');
      if (usernameField) {
        setTimeout(() => usernameField.focus(), 300);
      }
    } else {
      console.error("Modal de connexion non trouvé");
    }
  },
  
  /**
   * Masque le modal de connexion
   */
  hideLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
      // Animation de sortie
      const modalContent = loginModal.querySelector('.auth-modal-content');
      if (modalContent) {
        modalContent.style.opacity = '0';
        modalContent.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
          loginModal.style.display = 'none';
        }, 300);
      } else {
        loginModal.style.display = 'none';
      }
    }
  },
  
  /**
   * Gère la soumission du formulaire de connexion
   */
  async handleLogin(event) {
    if (event) event.preventDefault();
    
    const usernameField = document.getElementById('login-username');
    const passwordField = document.getElementById('login-password');
    const loginStatus = document.getElementById('login-status');
    
    if (!usernameField || !passwordField) return;
    
    const username = usernameField.value.trim();
    const password = passwordField.value;
    
    if (!username || !password) {
      this.showLoginError('Veuillez saisir un nom d\'utilisateur et un mot de passe.');
      return;
    }
    
    try {
      // Afficher un indicateur de chargement
      if (loginStatus) {
        loginStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authentification en cours...';
        loginStatus.className = 'login-status info';
        loginStatus.style.display = 'flex';
      }
      
      // Appel au service d'authentification
      const loginResult = await this.authenticateUser(username, password);
      
      if (loginResult.success) {
        // Stocker les informations d'authentification
        this.setAuthData(loginResult.token, loginResult.user);
        
        // Mettre à jour l'interface
        this.currentUser = loginResult.user;
        this.isAuthenticated = true;
        this.applyUserRole(loginResult.user.role);
        
        // Masquer la modal de connexion
        this.hideLoginModal();
        
        // Mettre à jour l'interface
        this.updateUI();
        
        // Afficher un message de succès
        if (loginStatus) {
          loginStatus.innerHTML = '<i class="fas fa-check-circle"></i> Connecté avec succès!';
          loginStatus.className = 'login-status success';
        }
        
        // Recharger la page après un court délai
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        this.showLoginError(loginResult.message || 'Identifiants incorrects.');
      }
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      this.showLoginError('Une erreur est survenue lors de la connexion.');
    }
  },
  
  /**
   * Authentifie un utilisateur avec les identifiants fournis
   * Pour la démonstration, simule une requête d'authentification
   */
  async authenticateUser(username, password) {
    // Dans un environnement réel, on ferait une requête à un serveur d'authentification
    // Ici, on simule une authentification avec le fichier JSON des utilisateurs
    
    // Simuler un délai de requête
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      // Essayer de charger les utilisateurs depuis le fichier JSON
      const response = await fetch('/static/data/users.json');
      const data = await response.json();
      
      // Trouver l'utilisateur par son nom d'utilisateur
      const user = (data.users || []).find(u => u.username === username);
      
      // Vérifier si l'utilisateur existe et si le mot de passe correspond
      // Note: Dans un système réel, les mots de passe seraient hachés
      if (user) {
        // Simuler une vérification de mot de passe (en production, utiliser bcrypt ou similaire)
        // Pour cet exemple, on accepte "password" pour tous les utilisateurs
        if (password === 'password') {
          // Générer un token
          const token = this.generateToken(user);
          
          return {
            success: true,
            token,
            user: {
              id: user.id,
              username: user.username,
              displayName: user.displayName,
              email: user.email,
              role: user.role,
              permissions: user.permissions
            }
          };
        }
      }
      
      // Identifiants incorrects
      return {
        success: false,
        message: 'Nom d\'utilisateur ou mot de passe incorrect.'
      };
    } catch (error) {
      console.error('Erreur lors de la requête d\'authentification:', error);
      return {
        success: false,
        message: 'Erreur de connexion au service d\'authentification.'
      };
    }
  },
  
  /**
   * Génère un token JWT simulé
   */
  generateToken(user) {
    // Dans un système réel, on générerait un vrai JWT signé
    // Ici, on simule un token simple pour la démonstration
    
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    
    const now = Date.now();
    const exp = now + this.TOKEN_EXPIRY;
    
    const payload = {
      sub: user.id,
      name: user.displayName,
      email: user.email,
      role: user.role,
      iat: Math.floor(now / 1000),
      exp: Math.floor(exp / 1000)
    };
    
    // Encoder en base64
    const headerB64 = btoa(JSON.stringify(header));
    const payloadB64 = btoa(JSON.stringify(payload));
    
    // Simuler une signature (dans un système réel, ce serait une vraie signature cryptographique)
    const signature = btoa(`${headerB64}.${payloadB64}`);
    
    return `${headerB64}.${payloadB64}.${signature}`;
  },
  
  /**
   * Décode un token
   */
  decodeToken(token) {
    try {
      // Diviser le token en ses parties
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Format de token invalide');
      
      // Décoder la partie du payload
      const payload = JSON.parse(atob(parts[1]));
      
      return payload;
    } catch (e) {
      console.error('Erreur lors du décodage du token:', e);
      return null;
    }
  },
  
  /**
   * Stocke les données d'authentification
   */
  setAuthData(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },
  
  /**
   * Supprime les données d'authentification
   */
  clearAuthData() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  },
  
  /**
   * Déconnecte l'utilisateur
   */
  logout(reload = true) {
    // Supprimer les données d'authentification
    this.clearAuthData();
    
    // Réinitialiser l'état
    this.currentUser = null;
    this.isAuthenticated = false;
    
    // Mettre à jour l'interface
    this.updateUI();
    
    console.log('Déconnexion réussie');
    
    // Recharger la page pour réinitialiser l'état de l'application
    if (reload) {
      window.location.reload();
    }
  },
  
  /**
   * Applique les permissions et configurations spécifiques au rôle
   */
  applyUserRole(role) {
    // Appliquer les classes CSS spécifiques au rôle
    document.body.classList.remove('role-administrator', 'role-manager', 'role-user', 'role-teams_room');
    document.body.classList.add(`role-${role}`);
    
    // Appliquer la configuration de mise en page spécifique au rôle
    const layoutClasses = document.querySelector('.main-container')?.classList;
    if (layoutClasses) {
      layoutClasses.remove('layout-administrator', 'layout-manager', 'layout-user', 'layout-teams_room');
      layoutClasses.add(`layout-${role}`);
    }
    
    // Afficher/masquer les éléments en fonction du rôle
    document.querySelectorAll('[data-role]').forEach(element => {
      const allowedRoles = element.dataset.role.split(',');
      if (allowedRoles.includes(role) || allowedRoles.includes('all')) {
        element.style.display = '';
      } else {
        element.style.display = 'none';
      }
    });
  },
  
  /**
   * Met à jour l'interface utilisateur en fonction de l'état d'authentification
   */
  updateUI() {
    // Section utilisateur en haut à droite
    const userProfileSection = document.querySelector('.user-profile');
    const loginBtn = document.getElementById('loginBtn');
    
    if (this.isAuthenticated && this.currentUser) {
      // Utilisateur connecté
      if (userProfileSection) {
        // Afficher les informations de l'utilisateur
        userProfileSection.innerHTML = `
          <button class="user-profile-button">
            <div class="user-initials">${this.getUserInitials()}</div>
            <div class="user-info">
              <span>${this.currentUser.displayName}</span>
              <span class="user-role">${this.formatRoleName(this.currentUser.role)}</span>
            </div>
            <i class="fas fa-chevron-down"></i>
          </button>
          <div class="user-dropdown">
            <div class="user-dropdown-header">
              <span>${this.currentUser.displayName}</span>
              <span class="user-role-full">${this.formatRoleName(this.currentUser.role)}</span>
            </div>
            <div class="user-dropdown-links">
              <a href="#" class="user-dropdown-link" id="profileLink">
                <i class="fas fa-user"></i> Profil
              </a>
              <a href="#" class="user-dropdown-link" id="settingsLink">
                <i class="fas fa-cog"></i> Paramètres
              </a>
              <a href="#" class="user-dropdown-link" id="logoutBtn">
                <i class="fas fa-sign-out-alt"></i> Déconnexion
              </a>
            </div>
          </div>
        `;
        userProfileSection.style.display = 'block';
        
        // Reconnecter les événements du menu utilisateur
        this.initUserProfileMenu();
        
        // Reconnecter le bouton de déconnexion
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', () => this.logout());
        }
      }
      
      // Masquer le bouton de connexion
      if (loginBtn) loginBtn.style.display = 'none';
      
    } else {
      // Utilisateur non connecté
      if (userProfileSection) {
        userProfileSection.innerHTML = '';
        userProfileSection.style.display = 'none';
      }
      
      // Afficher le bouton de connexion
      if (loginBtn) loginBtn.style.display = 'block';
    }
  },
  
  /**
   * Obtient les initiales de l'utilisateur pour l'affichage
   */
  getUserInitials() {
    if (!this.currentUser || !this.currentUser.displayName) return '??';
    
    const names = this.currentUser.displayName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    } else {
      return names[0].substr(0, 2).toUpperCase();
    }
  },
  
  /**
   * Formate le nom du rôle pour l'affichage
   */
  formatRoleName(role) {
    const roleNames = {
      administrator: 'Administrateur',
      manager: 'Manager',
      user: 'Utilisateur',
      teams_room: 'Salle Teams'
    };
    
    return roleNames[role] || role;
  },
  
  /**
   * Affiche un message d'erreur dans le modal de connexion
   */
  showLoginError(message) {
    const loginStatus = document.getElementById('login-status');
    if (loginStatus) {
      loginStatus.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
      loginStatus.className = 'login-status error';
      loginStatus.style.display = 'flex';
    }
  }
};

// Initialiser le système d'authentification
document.addEventListener('DOMContentLoaded', () => {
  AuthSystem.init();
});

// Exporter l'objet pour une utilisation dans d'autres modules
window.AuthSystem = AuthSystem;
