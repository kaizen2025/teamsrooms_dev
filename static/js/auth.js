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
    // Vérifier si un token est déjà présent
    this.checkAuthState();
    
    // Ajouter les écouteurs d'événements
    document.addEventListener('DOMContentLoaded', () => {
      // Formulaire de connexion
      const loginForm = document.getElementById('loginForm');
      if (loginForm) {
        loginForm.addEventListener('submit', this.handleLogin.bind(this));
      }
      
      // Bouton de déconnexion
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', this.logout.bind(this));
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
    const userProfile = document.querySelector('.user-profile');
    const userDropdown = document.querySelector('.user-dropdown');
    
    if (userProfile && userDropdown) {
      // Au clic, alterne l'affichage du menu
      userProfile.addEventListener('click', (e) => {
        e.stopPropagation();
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
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
          loginModal.style.display = 'none';
        }
        
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
  
  // Le reste du fichier reste inchangé...

  // Code existant...
};

// Initialiser le système d'authentification
document.addEventListener('DOMContentLoaded', () => {
  AuthSystem.init();
});

// Exporter l'objet pour une utilisation dans d'autres modules
window.AuthSystem = AuthSystem;
