/**
 * Gestion de l'interface d'administration
 */

// Module d'administration
const AdminSystem = {
  // État
  users: [],
  rooms: [],
  settings: {},
  currentPage: 1,
  itemsPerPage: 10,
  
  /**
   * Initialise le module d'administration
   */
  init() {
    // Vérifier si l'utilisateur est administrateur
    if (!this.checkAdminAccess()) {
      console.log('Accès non autorisé à l\'administration');
      return;
    }
    
    // Charger les données
    this.loadUsers();
    this.loadRooms();
    this.loadSettings();
    
    // Initialiser les onglets
    this.initTabs();
    
    // Initialiser les actions utilisateur
    this.initUserActions();
    
    // Initialiser les actions de salle
    this.initRoomActions();
    
    // Initialiser les actions de paramètres
    this.initSettingsActions();
  },
  
  /**
   * Vérifie si l'utilisateur actuel a des droits d'administration
   */
  checkAdminAccess() {
    // Si AuthSystem est disponible, vérifier les droits
    if (window.AuthSystem) {
      return AuthSystem.isAuthenticated && 
             AuthSystem.currentUser && 
             AuthSystem.currentUser.role === 'administrator';
    }
    
    return true; // Pour le développement, à modifier en production
  },
  
  /**
   * Initialise les onglets de l'administration
   */
  initTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Désactiver tous les onglets
        tabs.forEach(t => t.classList.remove('active'));
        
        // Masquer tous les contenus
        document.querySelectorAll('.admin-tab-content').forEach(content => {
          content.classList.remove('active');
        });
        
        // Activer l'onglet cliqué
        tab.classList.add('active');
        
        // Afficher le contenu correspondant
        const tabId = tab.dataset.tab;
        const content = document.getElementById(`${tabId}-tab`);
        if (content) {
          content.classList.add('active');
        }
      });
    });
  },
  
  /**
   * Charge les utilisateurs depuis le fichier JSON
   */
  async loadUsers() {
    try {
      const response = await fetch('/static/data/users.json');
      const data = await response.json();
      
      this.users = data.users || [];
      this.displayUsers();
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      // Afficher un message d'erreur
      const tableBody = document.getElementById('users-table-body');
      if (tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" class="error-message">
              <i class="fas fa-exclamation-triangle"></i> 
              Impossible de charger les utilisateurs.
            </td>
          </tr>
        `;
      }
    }
  },
  
  /**
   * Affiche la liste des utilisateurs dans le tableau
   */
  displayUsers() {
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;
    
    // Pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const displayedUsers = this.users.slice(startIndex, endIndex);
    
    // Vider le tableau
    tableBody.innerHTML = '';
    
    // Pas d'utilisateurs
    if (displayedUsers.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="no-data-message">
            <i class="fas fa-users-slash"></i> 
            Aucun utilisateur disponible.
          </td>
        </tr>
      `;
      return;
    }
    
    // Ajouter les utilisateurs
    displayedUsers.forEach(user => {
      const row = document.createElement('tr');
      
      // Formatage de la date de dernière connexion
      let lastLoginText = 'Jamais';
      if (user.lastLogin) {
        const lastLogin = new Date(user.lastLogin);
        lastLoginText = lastLogin.toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      row.innerHTML = `
        <td>${user.username}</td>
        <td>${user.displayName}</td>
        <td>${user.email}</td>
        <td><span class="role-label ${user.role}">${this.formatRoleName(user.role)}</span></td>
        <td>${lastLoginText}</td>
        <td class="user-actions">
          <button class="edit-btn" data-user-id="${user.id}" title="Modifier">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-btn" data-user-id="${user.id}" title="Supprimer">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;
      
      // Ajouter la ligne au tableau
      tableBody.appendChild(row);
    });
    
    // Mettre à jour les boutons de pagination
    this.updatePagination();
    
    // Attacher les événements
    this.attachUserActionEvents();
  },
  
  /**
   * Met à jour les informations de pagination
   */
  updatePagination() {
    const paginationInfo = document.querySelector('.pagination-info');
    const prevButton = document.querySelector('.pagination-btn:first-child');
    const nextButton = document.querySelector('.pagination-btn:last-child');
    
    if (!paginationInfo || !prevButton || !nextButton) return;
    
    // Calculer le nombre total de pages
    const totalPages = Math.ceil(this.users.length / this.itemsPerPage) || 1;
    
    // Mettre à jour l'affichage
    paginationInfo.textContent = `Page ${this.currentPage} sur ${totalPages}`;
    
    // Activer/désactiver les boutons
    prevButton.disabled = this.currentPage <= 1;
    nextButton.disabled = this.currentPage >= totalPages;
    
    // Attacher les événements
    prevButton.onclick = () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.displayUsers();
      }
    };
    
    nextButton.onclick = () => {
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.displayUsers();
      }
    };
  },
  
  /**
   * Attache les événements aux boutons d'action des utilisateurs
   */
  attachUserActionEvents() {
    // Boutons d'édition
    document.querySelectorAll('.edit-btn').forEach(button => {
      button.addEventListener('click', () => {
        const userId = button.dataset.userId;
        this.editUser(userId);
      });
    });
    
    // Boutons de suppression
    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', () => {
        const userId = button.dataset.userId;
        this.deleteUser(userId);
      });
    });
  },
  
  /**
   * Initialise les actions utilisateur (ajouter, rechercher)
   */
  initUserActions() {
    // Bouton d'ajout d'utilisateur
    const addUserBtn = document.getElementById('addUserBtn');
    if (addUserBtn) {
      addUserBtn.addEventListener('click', () => this.showUserModal());
    }
    
    // Champ de recherche
    const userSearch = document.getElementById('user-search');
    if (userSearch) {
      userSearch.addEventListener('input', () => this.searchUsers(userSearch.value));
    }
    
    // Modal utilisateur
    const closeUserModalBtn = document.getElementById('closeUserModalBtn');
    const cancelUserBtn = document.getElementById('cancelUserBtn');
    const saveUserBtn = document.getElementById('saveUserBtn');
    
    if (closeUserModalBtn) {
      closeUserModalBtn.addEventListener('click', () => this.hideUserModal());
    }
    
    if (cancelUserBtn) {
      cancelUserBtn.addEventListener('click', () => this.hideUserModal());
    }
    
    if (saveUserBtn) {
      saveUserBtn.addEventListener('click', () => this.saveUser());
    }
    
    // Cliquer en dehors du modal pour le fermer
    const userModal = document.getElementById('userModal');
    if (userModal) {
      userModal.addEventListener('click', (e) => {
        if (e.target === userModal) {
          this.hideUserModal();
        }
      });
    }
  },
  
  /**
   * Recherche des utilisateurs
   */
  searchUsers(query) {
    // Réinitialiser la pagination
    this.currentPage = 1;
    
    if (!query) {
      // Réinitialiser l'affichage
      this.loadUsers();
      return;
    }
    
    // Recherche insensible à la casse
    query = query.toLowerCase();
    
    // Filtrer les utilisateurs
    fetch('/static/data/users.json')
      .then(response => response.json())
      .then(data => {
        const allUsers = data.users || [];
        
        this.users = allUsers.filter(user => 
          user.username.toLowerCase().includes(query) ||
          user.displayName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          this.formatRoleName(user.role).toLowerCase().includes(query)
        );
        
        this.displayUsers();
      })
      .catch(error => {
        console.error('Erreur lors de la recherche:', error);
      });
  },
  
  /**
   * Affiche le modal utilisateur pour ajout ou édition
   */
  showUserModal(userId = null) {
    const modal = document.getElementById('userModal');
    const form = document.getElementById('userForm');
    const title = document.getElementById('userModalTitle');
    
    if (!modal || !form) return;
    
    // Réinitialiser le formulaire
    form.reset();
    document.getElementById('user-id').value = '';
    
    if (userId) {
      // Mode édition
      title.textContent = 'Modifier l\'utilisateur';
      
      // Trouver l'utilisateur
      const user = this.users.find(u => u.id === userId);
      if (user) {
        document.getElementById('user-id').value = user.id;
        document.getElementById('user-username').value = user.username;
        document.getElementById('user-displayname').value = user.displayName;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-role').value = user.role;
        
        // Masquer les champs de mot de passe en mode édition
        document.getElementById('user-password').parentNode.style.display = 'none';
        document.getElementById('user-password-confirm').parentNode.style.display = 'none';
      }
    } else {
      // Mode ajout
      title.textContent = 'Nouvel utilisateur';
      
      // Afficher les champs de mot de passe
      document.getElementById('user-password').parentNode.style.display = 'block';
      document.getElementById('user-password-confirm').parentNode.style.display = 'block';
    }
    
    // Afficher le modal
    modal.style.display = 'flex';
  },
  
  /**
   * Masque le modal utilisateur
   */
  hideUserModal() {
    const modal = document.getElementById('userModal');
    if (modal) {
      modal.style.display = 'none';
    }
  },
  
  /**
   * Édite un utilisateur existant
   */
  editUser(userId) {
    this.showUserModal(userId);
  },
  
  /**
   * Supprime un utilisateur
   */
  deleteUser(userId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }
    
    // Dans une version réelle, appel API pour supprimer l'utilisateur
    // Ici, simulation avec les données en mémoire
    this.users = this.users.filter(user => user.id !== userId);
    
    // Mettre à jour l'affichage
    this.displayUsers();
    
    // Afficher un message de confirmation
    alert('Utilisateur supprimé avec succès.');
    
    // Note : Dans une version réelle, il faudrait enregistrer les modifications
    // dans le fichier JSON via une API backend
  },
  
  /**
   * Enregistre un utilisateur (nouveau ou modifié)
   */
  saveUser() {
    const form = document.getElementById('userForm');
    const userId = document.getElementById('user-id').value;
    const username = document.getElementById('user-username').value;
    const displayName = document.getElementById('user-displayname').value;
    const email = document.getElementById('user-email').value;
    const role = document.getElementById('user-role').value;
    const password = document.getElementById('user-password').value;
    const passwordConfirm = document.getElementById('user-password-confirm').value;
    
    // Validation de base
    if (!username || !displayName || !email || !role) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    
    if (!userId && (!password || password !== passwordConfirm)) {
      alert('Les mots de passe ne correspondent pas ou sont manquants.');
      return;
    }
    
    // Dans une version réelle, appel API pour enregistrer l'utilisateur
    // Ici, simulation avec les données en mémoire
    
    if (userId) {
      // Mise à jour
      const index = this.users.findIndex(user => user.id === userId);
      if (index !== -1) {
        // Mettre à jour les propriétés
        this.users[index] = {
          ...this.users[index],
          username,
          displayName,
          email,
          role,
          // Le mot de passe ne change que s'il est fourni
          ...(password ? { passwordHash: 'nouveau_hash_simulé' } : {})
        };
      }
    } else {
      // Création
      const newUser = {
        id: `usr${Date.now()}`, // Générer un ID unique
        username,
        displayName,
        email,
        role,
        passwordHash: 'hash_simulé', // Simulation de hachage
        created: new Date().toISOString(),
        lastLogin: null,
        permissions: this.getDefaultPermissionsForRole(role)
      };
      
      this.users.push(newUser);
    }
    
    // Mettre à jour l'affichage
    this.displayUsers();
    
    // Fermer le modal
    this.hideUserModal();
    
    // Afficher un message de confirmation
    alert(`Utilisateur ${userId ? 'modifié' : 'créé'} avec succès.`);
    
    // Note : Dans une version réelle, il faudrait enregistrer les modifications
    // dans le fichier JSON via une API backend
  },
  
  /**
   * Charge la liste des salles
   */
  async loadRooms() {
    // Dans une version réelle, charger depuis un fichier ou une API
    // Ici, utilisation de la configuration existante
    try {
      const roomsContainer = document.getElementById('rooms-management-grid');
      if (!roomsContainer) return;
      
      // Utiliser la configuration globale des salles
      const rooms = window.SALLES || {};
      this.rooms = Object.entries(rooms).map(([name, email]) => ({
        id: name.toLowerCase(),
        name,
        email,
        capacity: Math.floor(Math.random() * 10) + 5, // Simulé
        equipment: ['Vidéoprojecteur', 'Visioconférence'].filter(() => Math.random() > 0.5), // Simulé
        status: Math.random() > 0.2 ? 'active' : 'maintenance' // Simulé
      }));
      
      this.displayRooms();
    } catch (error) {
      console.error('Erreur lors du chargement des salles:', error);
    }
  },
  
  /**
   * Affiche la liste des salles
   */
  displayRooms() {
    const roomsContainer = document.getElementById('rooms-management-grid');
    if (!roomsContainer) return;
    
    // Vider le conteneur
    roomsContainer.innerHTML = '';
    
    // Pas de salles
    if (this.rooms.length === 0) {
      roomsContainer.innerHTML = `
        <div class="no-data-message">
          <i class="fas fa-door-closed"></i> 
          Aucune salle disponible.
        </div>
      `;
      return;
    }
    
    // Ajouter les salles
    this.rooms.forEach(room => {
      const card = document.createElement('div');
      card.className = 'room-management-card';
      
      // Équipement formaté
      const equipmentText = room.equipment && room.equipment.length > 0 
        ? room.equipment.join(', ') 
        : 'Aucun';
      
      card.innerHTML = `
        <div class="room-management-header">
          <h3>${room.name}</h3>
        </div>
        <div class="room-management-body">
          <p><span>Email:</span> <span>${room.email}</span></p>
          <p><span>Capacité:</span> <span>${room.capacity} pers.</span></p>
          <p><span>Équipement:</span> <span>${equipmentText}</span></p>
          <p><span>Statut:</span> <span class="room-status ${room.status}">${room.status === 'active' ? 'Actif' : 'Maintenance'}</span></p>
        </div>
        <div class="room-management-footer">
          <button class="room-edit" data-room-id="${room.id}" title="Modifier">
            <i class="fas fa-edit"></i>
          </button>
          <button class="room-toggle" data-room-id="${room.id}" title="${room.status === 'active' ? 'Désactiver' : 'Activer'}">
            <i class="fas ${room.status === 'active' ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
          </button>
          <button class="room-delete" data-room-id="${room.id}" title="Supprimer">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      `;
      
      roomsContainer.appendChild(card);
    });
    
    // Attacher les événements
    this.attachRoomActionEvents();
  },
  
  /**
   * Initialise les actions pour les salles
   */
  initRoomActions() {
    // Bouton d'ajout de salle
    const addRoomBtn = document.getElementById('addRoomBtn');
    if (addRoomBtn) {
      addRoomBtn.addEventListener('click', () => {
        alert('Fonctionnalité d\'ajout de salle à implémenter');
      });
    }
    
    // Champ de recherche
    const roomSearch = document.getElementById('room-search');
    if (roomSearch) {
      roomSearch.addEventListener('input', () => {
        // Filtrer les salles par nom
        const query = roomSearch.value.toLowerCase();
        
        if (!query) {
          this.loadRooms();
          return;
        }
        
        const filteredRooms = this.rooms.filter(room => 
          room.name.toLowerCase().includes(query) || 
          room.email.toLowerCase().includes(query)
        );
        
        // Mise à jour temporaire pour affichage
        const originalRooms = [...this.rooms];
        this.rooms = filteredRooms;
        this.displayRooms();
        this.rooms = originalRooms; // Restaurer la liste complète
      });
    }
  },
  
  /**
   * Attache les événements aux boutons d'action des salles
   */
  attachRoomActionEvents() {
    // Boutons d'édition
    document.querySelectorAll('.room-edit').forEach(button => {
      button.addEventListener('click', () => {
        const roomId = button.dataset.roomId;
        alert(`Édition de la salle ${roomId} - Fonctionnalité à implémenter`);
      });
    });
    
    // Boutons de changement d'état
    document.querySelectorAll('.room-toggle').forEach(button => {
      button.addEventListener('click', () => {
        const roomId = button.dataset.roomId;
        this.toggleRoomStatus(roomId);
      });
    });
    
    // Boutons de suppression
    document.querySelectorAll('.room-delete').forEach(button => {
      button.addEventListener('click', () => {
        const roomId = button.dataset.roomId;
        if (confirm(`Êtes-vous sûr de vouloir supprimer la salle ${roomId} ?`)) {
          alert(`Suppression de la salle ${roomId} - Fonctionnalité à implémenter`);
        }
      });
    });
  },
  
  /**
   * Change le statut d'une salle (actif/maintenance)
   */
  toggleRoomStatus(roomId) {
    // Trouver la salle
    const roomIndex = this.rooms.findIndex(r => r.id === roomId);
    if (roomIndex === -1) return;
    
    // Basculer le statut
    const currentStatus = this.rooms[roomIndex].status;
    const newStatus = currentStatus === 'active' ? 'maintenance' : 'active';
    
    // Mettre à jour
    this.rooms[roomIndex].status = newStatus;
    
    // Rafraîchir l'affichage
    this.displayRooms();
    
    // Message
    alert(`La salle ${this.rooms[roomIndex].name} est maintenant ${newStatus === 'active' ? 'active' : 'en maintenance'}.`);
  },
  
  /**
   * Charge les paramètres du système
   */
  loadSettings() {
    // Dans une version réelle, charger depuis un fichier ou une API
    // Ici, simulation avec des valeurs par défaut
    this.settings = {
      title: 'Salle de Réunion',
      refreshInterval: 20,
      theme: 'default',
      sessionDuration: 8,
      enforceAuth: true
    };
    
    this.displaySettings();
  },
  
  /**
   * Affiche les paramètres du système
   */
  displaySettings() {
    // Afficher les valeurs dans les champs
    const titleField = document.getElementById('setting-title');
    const refreshField = document.getElementById('setting-refresh');
    const sessionField = document.getElementById('setting-session');
    const enforceAuthField = document.getElementById('setting-enforceAuth');
    
    if (titleField) titleField.value = this.settings.title;
    if (refreshField) refreshField.value = this.settings.refreshInterval;
    if (sessionField) sessionField.value = this.settings.sessionDuration;
    if (enforceAuthField) enforceAuthField.checked = this.settings.enforceAuth;
    
    // Thème
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
      option.classList.remove('active');
      if (option.dataset.theme === this.settings.theme) {
        option.classList.add('active');
      }
    });
  },
  
  /**
   * Initialise les actions pour les paramètres
   */
  initSettingsActions() {
    // Thèmes
    document.querySelectorAll('.theme-option').forEach(option => {
      option.addEventListener('click', () => {
        // Désactiver tous les thèmes
        document.querySelectorAll('.theme-option').forEach(opt => {
          opt.classList.remove('active');
        });
        
        // Activer le thème sélectionné
        option.classList.add('active');
        
        // Mettre à jour le paramètre
        this.settings.theme = option.dataset.theme;
      });
    });
    
    // Bouton d'enregistrement
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', () => this.saveSettings());
    }
    
    // Bouton de réinitialisation
    const resetSettingsBtn = document.getElementById('resetSettingsBtn');
    if (resetSettingsBtn) {
      resetSettingsBtn.addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser les paramètres ?')) {
          this.loadSettings(); // Recharger les paramètres par défaut
        }
      });
    }
  },
  
  /**
   * Enregistre les paramètres du système
   */
  saveSettings() {
    // Récupérer les valeurs des champs
    const titleField = document.getElementById('setting-title');
    const refreshField = document.getElementById('setting-refresh');
    const sessionField = document.getElementById('setting-session');
    const enforceAuthField = document.getElementById('setting-enforceAuth');
    const activeTheme = document.querySelector('.theme-option.active');
    
    // Mettre à jour les paramètres
    if (titleField) this.settings.title = titleField.value;
    if (refreshField) this.settings.refreshInterval = parseInt(refreshField.value, 10);
    if (sessionField) this.settings.sessionDuration = parseInt(sessionField.value, 10);
    if (enforceAuthField) this.settings.enforceAuth = enforceAuthField.checked;
    if (activeTheme) this.settings.theme = activeTheme.dataset.theme;
    
    // Dans une version réelle, enregistrer via une API
    // Ici, simulation
    
    // Appliquer certains paramètres immédiatement
    if (titleField) {
      const salleTitle = document.getElementById('salle-title');
      if (salleTitle) {
        salleTitle.textContent = titleField.value;
      }
    }
    
    // Message de confirmation
    alert('Paramètres enregistrés avec succès.');
  },
  
  /**
   * Retourne les permissions par défaut pour un rôle donné
   */
  getDefaultPermissionsForRole(role) {
    switch (role) {
      case 'administrator':
        return ['all'];
      case 'manager':
        return ['view_meetings', 'create_meetings', 'view_rooms', 'book_rooms'];
      case 'user':
        return ['view_meetings', 'join_meetings'];
      case 'teams_room':
        return ['view_meetings', 'display_room_status'];
      default:
        return [];
    }
  },
  
  /**
   * Formate un nom de rôle pour l'affichage
   */
  formatRoleName(roleKey) {
    const roleNames = {
      administrator: 'Administrateur',
      manager: 'Manager',
      user: 'Utilisateur',
      teams_room: 'Salle Teams'
    };
    
    return roleNames[roleKey] || roleKey;
  }
};

// Initialiser le système d'administration
document.addEventListener('DOMContentLoaded', () => {
  // Vérifier si la section d'administration est présente
  const adminSection = document.getElementById('adminSection');
  if (adminSection) {
    AdminSystem.init();
  }
});

// Exporter pour utilisation dans d'autres modules
window.AdminSystem = AdminSystem;
