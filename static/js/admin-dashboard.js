// À ajouter dans un nouveau fichier static/js/admin-dashboard.js

/**
 * Système de gestion du tableau de bord d'administration
 */
const AdminDashboard = {
    // État global
    state: {
        isExpanded: false,
        activeSection: 'overview',
        resourceTypes: ['rooms', 'vehicles', 'equipment'],
        loans: [],
        returnReminders: [],
        overdue: [],
        resources: {
            rooms: [],
            vehicles: [],
            equipment: []
        }
    },
    
    /**
     * Initialise le tableau de bord d'administration
     */
    init() {
        // Charger les données
        this.loadAllResources();
        this.loadLoans();
        
        // Initialiser les événements UI
        this.initUIEvents();
        
        console.log("Tableau de bord d'administration initialisé");
    },
    
    /**
     * Initialise les événements d'interface
     */
    initUIEvents() {
        // Gestion du bouton d'expansion
        const expandBtn = document.getElementById('adminExpandBtn');
        if (expandBtn) {
            expandBtn.addEventListener('click', () => this.toggleExpand());
        }
        
        // Gestion du bouton de fermeture
        const closeBtn = document.getElementById('adminCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeAdminPanel());
        }
        
        // Gestion de la navigation entre sections
        document.querySelectorAll('.admin-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.switchAdminSection(section);
            });
        });
        
        // Initialiser les filtres et tris
        this.initFiltersAndSorts();
    },
    
    /**
     * Ouvre le tableau de bord
     */
    openAdminPanel() {
        const adminSection = document.getElementById('adminDashboard');
        if (!adminSection) return;
        
        adminSection.style.display = 'flex';
        
        // Masquer les autres contenus principaux
        document.querySelectorAll('.content > div:not(#adminDashboard)').forEach(el => {
            el.style.display = 'none';
        });
        
        // Afficher la vue par défaut
        this.switchAdminSection('overview');
        
        // Animation d'entrée
        setTimeout(() => {
            adminSection.style.opacity = '1';
        }, 50);
    },
    
    /**
     * Ferme le tableau de bord
     */
    closeAdminPanel() {
        const adminSection = document.getElementById('adminDashboard');
        if (!adminSection) return;
        
        // Animation de sortie
        adminSection.style.opacity = '0';
        
        setTimeout(() => {
            adminSection.style.display = 'none';
            
            // Réafficher le contenu principal
            const mainContent = document.querySelector('.content > div:first-child');
            if (mainContent && mainContent.id !== 'adminDashboard') {
                mainContent.style.display = 'block';
            }
        }, 300);
    },
    
    /**
     * Bascule entre mode plein écran et mode normal
     */
    toggleExpand() {
        const adminSection = document.getElementById('adminDashboard');
        if (!adminSection) return;
        
        const expandBtn = document.getElementById('adminExpandBtn');
        
        this.state.isExpanded = !this.state.isExpanded;
        
        if (this.state.isExpanded) {
            adminSection.classList.add('expanded');
            if (expandBtn) {
                expandBtn.innerHTML = '<i class="fas fa-compress"></i>';
                expandBtn.title = 'Réduire';
            }
            
            // Masquer le panneau des réunions
            const meetingsContainer = document.querySelector('.meetings-container');
            if (meetingsContainer) {
                meetingsContainer.style.display = 'none';
            }
        } else {
            adminSection.classList.remove('expanded');
            if (expandBtn) {
                expandBtn.innerHTML = '<i class="fas fa-expand"></i>';
                expandBtn.title = 'Agrandir';
            }
            
            // Réafficher le panneau des réunions
            const meetingsContainer = document.querySelector('.meetings-container');
            if (meetingsContainer) {
                meetingsContainer.style.display = 'flex';
            }
        }
    },
    
    /**
     * Change de section administrative
     */
    switchAdminSection(section) {
        // Mettre à jour l'état
        this.state.activeSection = section;
        
        // Mettre à jour les onglets actifs
        document.querySelectorAll('.admin-nav-item').forEach(item => {
            if (item.dataset.section === section) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Afficher la section correspondante
        document.querySelectorAll('.admin-dashboard-section').forEach(sectionEl => {
            if (sectionEl.id === `admin-${section}-section`) {
                sectionEl.style.display = 'block';
            } else {
                sectionEl.style.display = 'none';
            }
        });
        
        // Mettre à jour les données spécifiques à la section
        switch (section) {
            case 'overview':
                this.updateOverview();
                break;
            case 'loans':
                this.updateLoans();
                break;
            case 'rooms':
                this.updateRooms();
                break;
