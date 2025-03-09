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
      
      // Mettre à jour l'interface en fonction de l'état d'authentification
      this.updateUI();
    });
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
      } else {
        this.showLoginError(loginResult.message || 'Identifiants incorrects.');
      }
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      this.showLoginError('Une erreur est survenue lors de la connexion.');
    }
  },
  
  /**
   * Simule une authentification avec le serveur
   * À remplacer par un vrai appel API
   */
  async authenticateUser(username, password) {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      // Récupérer les données utilisateurs (normalement fait côté serveur)
      const response = await fetch('/static/data/users.json');
      const data = await response.json();
      
      // Rechercher l'utilisateur
      const user = data.users.find(u => u.username === username);
      
      if (!user) {
        return {
          success: false,
          message: 'Identifiants incorrects.'
        };
      }
      
      // Vérifier le mot de passe (normalement fait côté serveur)
      // Note: En production, utilisez toujours bcrypt ou un autre algorithme sécurisé
      const passwordHash = await this.sha256(password);
      
      if (passwordHash !== user.passwordHash) {
        return {
          success: false,
          message: 'Identifiants incorrects.'
        };
      }
      
      // Générer un token JWT (simulé)
      const now = Date.now();
      const exp = now + this.TOKEN_EXPIRY;
      const tokenPayload = {
        sub: user.id,
        username: user.username,
        role: user.role,
        iat: now,
        exp: exp
      };
      
      // Dans une vraie implémentation, ceci serait signé avec une clé secrète
      const token = btoa(JSON.stringify(tokenPayload));
      
      // Créer une copie sans le mot de passe pour le stockage côté client
      const userCopy = { ...user };
      delete userCopy.passwordHash;
      
      // Mise à jour de la dernière connexion (normalement côté serveur)
      userCopy.lastLogin = new Date().toISOString();
      
      return {
        success: true,
        token: token,
        user: userCopy
      };
    } catch (error) {
      console.error('Erreur lors de l\'authentification:', error);
      return {
        success: false,
        message: 'Erreur du serveur. Veuillez réessayer.'
      };
    }
  },
  
  /**
   * Déconnecte l'utilisateur
   */
  logout(showConfirmation = true) {
    if (showConfirmation && !confirm('Voulez-vous vraiment vous déconnecter?')) {
      return;
    }
    
    // Supprimer les données d'authentification
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    // Réinitialiser l'état
    this.currentUser = null;
    this.isAuthenticated = false;
    
    // Rediriger vers la page d'accueil
    window.location.href = '/';
  },
  
  /**
   * Enregistre les données d'authentification dans le stockage local
   */
  setAuthData(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },
  
  /**
   * Décode un token JWT
   */
  decodeToken(token) {
    try {
      const decoded = JSON.parse(atob(token));
      return decoded;
    } catch (e) {
      console.error('Erreur de décodage du token:', e);
      return null;
    }
  },
  
  /**
   * Applique le rôle utilisateur à l'interface
   */
  applyUserRole(role) {
    document.body.dataset.userRole = role;
    
    // Modifier la classe du conteneur principal
    const mainContainer = document.querySelector('.main-container');
    if (mainContainer) {
      // Supprimer les anciennes classes de rôle
      const roleClasses = ['layout-admin', 'layout-manager', 'layout-user', 'layout-room'];
      mainContainer.classList.remove(...roleClasses);
      
      // Ajouter la classe correspondant au rôle
      mainContainer.classList.add(`layout-${role}`);
    }
    
    // Charger la configuration du rôle et mettre à jour le menu
    this.loadRoleConfig(role).then(roleConfig => {
      if (roleConfig) {
        this.updateMenuForRole(roleConfig);
      }
    });
  },
  
  /**
   * Charge la configuration du rôle depuis users.json
   */
  async loadRoleConfig(role) {
    try {
      const response = await fetch('/static/data/users.json');
      const data = await response.json();
      
      return data.roles[role] || null;
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration du rôle:', error);
      return null;
    }
  },
  
  /**
   * Met à jour le menu en fonction des droits du rôle
   */
  updateMenuForRole(roleConfig) {
    const { menuItems = [] } = roleConfig;
    
    // Masquer tous les éléments de menu
    document.querySelectorAll('.menu-item').forEach(item => {
      const itemId = item.dataset.menuId;
      if (itemId) {
        item.style.display = menuItems.includes(itemId) ? 'flex' : 'none';
      }
    });
    
    // Afficher/masquer les éléments spécifiques à l'administrateur
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(el => {
      el.style.display = roleConfig.displayName === 'Administrateur' ? 'block' : 'none';
    });
  },
  
  /**
   * Met à jour l'interface en fonction de l'état d'authentification
   */
  updateUI() {
    const isAuth = this.isAuthenticated;
    const user = this.currentUser;
    
    // Éléments à afficher quand connecté
    document.querySelectorAll('.auth-required').forEach(el => {
      el.style.display = isAuth ? 'block' : 'none';
    });
    
    // Éléments à masquer quand connecté
    document.querySelectorAll('.auth-hidden').forEach(el => {
      el.style.display = isAuth ? 'none' : 'block';
    });
    
    // Mise à jour du profil utilisateur
    const userDisplayName = document.getElementById('userDisplayName');
    const userRole = document.getElementById('userRole');
    
    if (userDisplayName && user) {
      userDisplayName.textContent = user.displayName;
    }
    
    if (userRole && user) {
      userRole.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    }
    
    // Mode salle Teams
    if (user && user.role === 'teams_room') {
      document.body.classList.add('tv-mode');
    } else {
      document.body.classList.remove('tv-mode');
    }
  },
  
  /**
   * Affiche un message d'erreur dans le formulaire de connexion
   */
  showLoginError(message) {
    const loginStatus = document.getElementById('login-status');
    if (loginStatus) {
      loginStatus.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
      loginStatus.className = 'login-status error';
    }
  },
  
  /**
   * Fonction utilitaire pour calculer un hash SHA-256
   */
  async sha256(message) {
    // Encoder en UTF-8
    const msgBuffer = new TextEncoder().encode(message);
    
    // Hacher le message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    
    // Convertir en chaîne hexadécimale
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },
  
  /**
   * Vérifie si l'utilisateur actuel a une permission donnée
   */
  hasPermission(permission) {
    if (!this.isAuthenticated || !this.currentUser) return false;
    
    const { permissions = [] } = this.currentUser;
    
    // 'all' donne accès à tout
    if (permissions.includes('all')) return true;
    
    return permissions.includes(permission);
  }
};

// Initialiser le système d'authentification
document.addEventListener('DOMContentLoaded', () => {
  AuthSystem.init();
});

// Exporter l'objet pour une utilisation dans d'autres modules
window.AuthSystem = AuthSystem;
