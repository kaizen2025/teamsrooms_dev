let currentUser = null; // { username: '...', role: '...' }

function initAuth() {
    const loginBtn = document.getElementById('loginBtn');
    const userProfileBtn = document.getElementById('userProfileBtn');
    const loginModalOverlay = document.getElementById('loginModalOverlay');
    const closeLoginBtn = document.getElementById('closeLoginModalBtn');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn'); // Dans le dropdown

    // Vérifier si l'utilisateur est déjà connecté (ex: via localStorage/sessionStorage)
    checkLoginStatus();

    // Ouvrir modal de connexion
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            if (loginModalOverlay) loginModalOverlay.classList.add('visible');
             // Focus username
             setTimeout(() => document.getElementById('loginUsername')?.focus(), 100);
        });
    }

    // Fermer modal de connexion
    if (closeLoginBtn) {
        closeLoginBtn.addEventListener('click', () => {
            if (loginModalOverlay) loginModalOverlay.classList.remove('visible');
        });
    }
    if (loginModalOverlay) {
        loginModalOverlay.addEventListener('click', (e) => {
            if (e.target === loginModalOverlay) loginModalOverlay.classList.remove('visible');
        });
    }

    // Gérer la soumission du formulaire de connexion
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    // Gérer le dropdown utilisateur
    if (userProfileBtn) {
        const dropdown = document.getElementById('userDropdownMenu');
        userProfileBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Empêche la fermeture immédiate par le listener document
            if (dropdown) dropdown.classList.toggle('visible');
        });
        // Fermer le dropdown si on clique ailleurs
         document.addEventListener('click', (e) => {
            if (dropdown && dropdown.classList.contains('visible') && !userProfileBtn.contains(e.target)) {
                dropdown.classList.remove('visible');
            }
        });
    }

    // Gérer la déconnexion
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    console.log("Module d'authentification initialisé.");
}

function updateLoginUI() {
    const loginBtn = document.getElementById('loginBtn');
    const userProfileBtn = document.getElementById('userProfileBtn');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userRoleDisplay = document.getElementById('userRoleDisplay');
    const userInitials = userProfileBtn?.querySelector('.user-initials');
    const adminMenuItems = document.querySelectorAll('.menu-group[data-role]');

    if (currentUser) {
        // Connecté
        if (loginBtn) loginBtn.style.display = 'none';
        if (userProfileBtn) userProfileBtn.style.display = 'flex';
        if (userNameDisplay) userNameDisplay.textContent = currentUser.username;
        if (userRoleDisplay) userRoleDisplay.textContent = currentUser.role || 'Utilisateur';
        if (userInitials) {
            userInitials.textContent = currentUser.username?.substring(0, 2).toUpperCase() || '--';
        }
         // Afficher/Masquer éléments selon rôle
         updateUIForRoles();

    } else {
        // Déconnecté
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (userProfileBtn) userProfileBtn.style.display = 'none';
         // Masquer éléments admin
         updateUIForRoles();
    }
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    const statusDiv = document.getElementById('loginStatus');
    const submitButton = event.target.querySelector('button[type="submit"]');

    if (!usernameInput || !passwordInput || !statusDiv || !submitButton) return;

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        statusDiv.textContent = "Veuillez entrer nom d'utilisateur et mot de passe.";
        statusDiv.className = 'form-status error';
        return;
    }

    statusDiv.textContent = "Connexion en cours...";
    statusDiv.className = 'form-status info';
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';

    try {
        // ***** SIMULATION CONNEXION *****
        // Remplacer par votre appel API d'authentification réel
        await new Promise(resolve => setTimeout(resolve, 1000));
        let role = 'user';
        if (username.toLowerCase() === 'admin') role = 'administrator';
        else if (username.toLowerCase() === 'manager') role = 'manager';

        currentUser = { username: username, role: role };
        // Stocker l'état de connexion (ex: localStorage)
        localStorage.setItem('userSession', JSON.stringify(currentUser));
        // ***** FIN SIMULATION *****

        /* Exemple appel API réel:
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!response.ok) {
             const errorData = await response.json().catch(() => ({ message: 'Erreur serveur' }));
             throw new Error(errorData.message || `Erreur ${response.status}`);
        }
        const userData = await response.json(); // ex: { username: '...', role: '...', token: '...' }
        currentUser = { username: userData.username, role: userData.role };
        localStorage.setItem('userSession', JSON.stringify(currentUser));
        // Stocker le token si nécessaire (localStorage ou sessionStorage)
        // localStorage.setItem('authToken', userData.token);
        */

        statusDiv.textContent = "Connexion réussie !";
        statusDiv.className = 'form-status success';
        updateLoginUI();
        setTimeout(() => {
            document.getElementById('loginModalOverlay')?.classList.remove('visible');
            loginForm.reset(); // Vider le formulaire
            statusDiv.textContent = '';
             statusDiv.className = 'form-status';
        }, 1000);

    } catch (error) {
        console.error("Erreur de connexion:", error);
        statusDiv.textContent = `Erreur: ${error.message}`;
        statusDiv.className = 'form-status error';
        currentUser = null; // Assurer déconnexion en cas d'erreur
        localStorage.removeItem('userSession');
         // localStorage.removeItem('authToken');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Connexion';
    }
}

function handleLogout() {
    console.log("Déconnexion demandée.");
    currentUser = null;
    localStorage.removeItem('userSession');
    // localStorage.removeItem('authToken');
    updateLoginUI();
    // Optionnel: Rediriger vers la page d'accueil ou de connexion
    // window.location.href = '/';
     // Fermer le dropdown si ouvert
     document.getElementById('userDropdownMenu')?.classList.remove('visible');
}

function checkLoginStatus() {
    const savedSession = localStorage.getItem('userSession');
    if (savedSession) {
        try {
            currentUser = JSON.parse(savedSession);
            console.log("Session utilisateur récupérée:", currentUser);
            // Optionnel: Vérifier la validité du token/session auprès du serveur ici
        } catch (e) {
            console.error("Erreur parsing session:", e);
            currentUser = null;
            localStorage.removeItem('userSession');
        }
    } else {
        currentUser = null;
    }
    updateLoginUI();
}

// Fonction pour obtenir le token (si utilisé)
function getAuthToken() {
    // return localStorage.getItem('authToken');
    return null; // Adapter selon votre stockage de token
}

// Afficher/Masquer éléments selon les rôles
function updateUIForRoles() {
    const userRole = currentUser?.role; // Peut être undefined si déconnecté

    document.querySelectorAll('[data-role]').forEach(element => {
        const requiredRoles = element.dataset.role.split(',').map(r => r.trim().toLowerCase());

         // Afficher si pas de rôle requis OU si l'utilisateur a un des rôles requis
         if (requiredRoles.length === 0 || (userRole && requiredRoles.includes(userRole.toLowerCase()))) {
             element.style.display = ''; // Ou 'block', 'flex', etc. selon l'élément
         } else {
             element.style.display = 'none';
         }
    });
}


console.log("auth.js chargé.");
