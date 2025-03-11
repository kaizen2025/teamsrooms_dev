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
                // Continuation du switch statement pour les différentes sections
            case 'vehicles':
                this.updateVehicles();
                break;
            case 'equipment':
                this.updateEquipment();
                break;
            case 'users':
                this.updateUsers();
                break;
            case 'settings':
                this.updateSettings();
                break;
            default:
                console.log(`Section inconnue: ${section}`);
        }
    },
    
    /**
     * Initialise les filtres et tris pour les tableaux
     */
    initFiltersAndSorts() {
        // Recherche pour la section des prêts
        const loanSearch = document.getElementById('loan-search');
        if (loanSearch) {
            loanSearch.addEventListener('input', (e) => {
                this.filterLoans(e.target.value);
            });
        }
        
        // Sélecteur de période pour les prêts
        const loanPeriod = document.getElementById('loan-period');
        if (loanPeriod) {
            loanPeriod.addEventListener('change', (e) => {
                this.filterLoansByPeriod(e.target.value);
            });
        }
        
        // Recherche pour les ressources
        this.state.resourceTypes.forEach(type => {
            const searchInput = document.getElementById(`${type}-search`);
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.filterResources(type, e.target.value);
                });
            }
            
            // Trier les ressources
            const sortSelect = document.getElementById(`${type}-sort`);
            if (sortSelect) {
                sortSelect.addEventListener('change', (e) => {
                    this.sortResources(type, e.target.value);
                });
            }
        });
    },
    
    /**
     * Charge les données de toutes les ressources
     */
    async loadAllResources() {
        try {
            // Dans un système réel, ces données viendraient d'une API
            await Promise.all([
                this.loadRoomsData(),
                this.loadVehiclesData(),
                this.loadEquipmentData()
            ]);
            
            console.log("Toutes les données des ressources ont été chargées");
        } catch (error) {
            console.error("Erreur lors du chargement des ressources:", error);
        }
    },
    
    /**
     * Charge les données des salles
     */
    async loadRoomsData() {
        // Simuler un appel API
        this.state.resources.rooms = [
            {
                id: 'room1',
                name: 'Canigou',
                type: 'salle',
                capacity: 12,
                location: 'RDC',
                email: 'Sallecanigou@anecoop-france.com',
                status: 'available',
                features: ['Vidéoprojecteur', 'Visioconférence', 'WiFi'],
                lastMaintenance: '2025-01-15',
                nextMaintenance: '2025-07-15'
            },
            {
                id: 'room2',
                name: 'Tramontane',
                type: 'salle',
                capacity: 8,
                location: '1er étage',
                email: 'Salletramontane@anecoop-france.com',
                status: 'occupied',
                features: ['Écran', 'Téléphone', 'WiFi'],
                lastMaintenance: '2024-11-05',
                nextMaintenance: '2025-05-05'
            },
            {
                id: 'room3',
                name: 'Castillet',
                type: 'salle',
                capacity: 6,
                location: '2ème étage',
                email: 'Sallecastillet@anecoop-france.com',
                status: 'maintenance',
                features: ['Tableau blanc', 'Téléphone'],
                lastMaintenance: '2025-03-01',
                nextMaintenance: '2025-09-01'
            }
        ];
    },
    
    /**
     * Charge les données des véhicules
     */
    async loadVehiclesData() {
        // Simuler un appel API
        this.state.resources.vehicles = [
            {
                id: 'veh1',
                name: 'Renault Clio',
                type: 'véhicule',
                category: 'citadine',
                registration: 'AB-123-CD',
                status: 'available',
                location: 'Parking A',
                lastService: '2025-01-10',
                nextService: '2025-04-10',
                mileage: 34500
            },
            {
                id: 'veh2',
                name: 'Peugeot 3008',
                type: 'véhicule',
                category: 'SUV',
                registration: 'EF-456-GH',
                status: 'occupied',
                location: 'Parking B',
                lastService: '2024-12-05',
                nextService: '2025-03-05',
                mileage: 56200
            },
            {
                id: 'veh3',
                name: 'Renault Trafic',
                type: 'véhicule',
                category: 'utilitaire',
                registration: 'IJ-789-KL',
                status: 'maintenance',
                location: 'Garage',
                lastService: '2025-02-20',
                nextService: '2025-05-20',
                mileage: 89300
            }
        ];
    },
    
    /**
     * Charge les données des équipements
     */
    async loadEquipmentData() {
        // Simuler un appel API
        this.state.resources.equipment = [
            {
                id: 'equip1',
                name: 'Ordinateur portable HP',
                type: 'équipement',
                category: 'informatique',
                serialNumber: 'HP12345678',
                status: 'available',
                location: 'Stock IT',
                lastCheck: '2025-02-01',
                nextCheck: '2025-05-01',
                purchaseDate: '2023-10-15'
            },
            {
                id: 'equip2',
                name: 'Vidéoprojecteur Epson',
                type: 'équipement',
                category: 'audiovisuel',
                serialNumber: 'EP87654321',
                status: 'occupied',
                location: 'Salle Canigou',
                lastCheck: '2025-01-15',
                nextCheck: '2025-04-15',
                purchaseDate: '2024-03-10'
            },
            {
                id: 'equip3',
                name: 'Téléphone de conférence',
                type: 'équipement',
                category: 'téléphonie',
                serialNumber: 'TC54321',
                status: 'maintenance',
                location: 'Service IT',
                lastCheck: '2025-02-28',
                nextCheck: '2025-05-28',
                purchaseDate: '2024-06-05'
            }
        ];
    },
    
    /**
     * Charge les prêts actifs et l'historique
     */
    async loadLoans() {
        try {
            // Simuler un appel API pour les prêts actifs
            this.state.loans = [
                {
                    id: 'loan1',
                    resourceId: 'veh2',
                    resourceName: 'Peugeot 3008',
                    resourceType: 'véhicule',
                    borrowerId: 'usr2',
                    borrowerName: 'Marie Martin',
                    startDate: '2025-03-10T09:00:00',
                    endDate: '2025-03-14T18:00:00',
                    status: 'active',
                    notes: 'Déplacement client Perpignan'
                },
                {
                    id: 'loan2',
                    resourceId: 'equip2',
                    resourceName: 'Vidéoprojecteur Epson',
                    resourceType: 'équipement',
                    borrowerId: 'usr3',
                    borrowerName: 'Paul Dupont',
                    startDate: '2025-03-11T08:30:00',
                    endDate: '2025-03-12T17:30:00',
                    status: 'active',
                    notes: 'Présentation client'
                },
                {
                    id: 'loan3',
                    resourceId: 'room2',
                    resourceName: 'Tramontane',
                    resourceType: 'salle',
                    borrowerId: 'usr4',
                    borrowerName: 'Sophie Dubois',
                    startDate: '2025-03-12T14:00:00',
                    endDate: '2025-03-12T16:00:00',
                    status: 'active',
                    notes: 'Réunion RH'
                }
            ];
            
            // Simuler un appel API pour les rappels de retour
            this.state.returnReminders = [
                {
                    id: 'reminder1',
                    loanId: 'loan1',
                    resourceName: 'Peugeot 3008',
                    borrowerName: 'Marie Martin',
                    returnDate: '2025-03-14T18:00:00',
                    daysRemaining: 2,
                    status: 'pending'
                },
                {
                    id: 'reminder2',
                    loanId: 'loan2',
                    resourceName: 'Vidéoprojecteur Epson',
                    borrowerName: 'Paul Dupont',
                    returnDate: '2025-03-12T17:30:00',
                    daysRemaining: 0,
                    status: 'urgent'
                }
            ];
            
            // Simuler un appel API pour les prêts en retard
            this.state.overdue = [
                {
                    id: 'overdue1',
                    loanId: 'loan4',
                    resourceName: 'Ordinateur portable Dell',
                    borrowerName: 'Thomas Renard',
                    returnDate: '2025-03-10T17:00:00',
                    daysOverdue: 2,
                    status: 'overdue'
                }
            ];
            
            console.log("Données des prêts chargées avec succès");
        } catch (error) {
            console.error("Erreur lors du chargement des prêts:", error);
        }
    },
    
    /**
     * Met à jour la section vue d'ensemble
     */
    updateOverview() {
        const overviewSection = document.getElementById('admin-overview-section');
        if (!overviewSection) return;
        
        // Calculer les statistiques
        const totalResources = 
            this.state.resources.rooms.length + 
            this.state.resources.vehicles.length + 
            this.state.resources.equipment.length;
        
        const availableResources = 
            this.state.resources.rooms.filter(r => r.status === 'available').length +
            this.state.resources.vehicles.filter(v => v.status === 'available').length +
            this.state.resources.equipment.filter(e => e.status === 'available').length;
        
        const inMaintenanceResources = 
            this.state.resources.rooms.filter(r => r.status === 'maintenance').length +
            this.state.resources.vehicles.filter(v => v.status === 'maintenance').length +
            this.state.resources.equipment.filter(e => e.status === 'maintenance').length;
        
        const activeLoans = this.state.loans.length;
        const overdueLoans = this.state.overdue.length;
        
        // Créer un tableau de statistiques générales
        overviewSection.innerHTML = `
            <div class="overview-header">
                <h2><i class="fas fa-tachometer-alt"></i> Tableau de bord</h2>
                <button id="refreshDashboardBtn" class="refresh-btn">
                    <i class="fas fa-sync-alt"></i> Actualiser
                </button>
            </div>
            
            <div class="overview-stats">
                <div class="stats-card total-resources">
                    <div class="stats-icon">
                        <i class="fas fa-cubes"></i>
                    </div>
                    <div class="stats-content">
                        <div class="stats-value">${totalResources}</div>
                        <div class="stats-label">Total des ressources</div>
                    </div>
                </div>
                
                <div class="stats-card available-resources">
                    <div class="stats-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stats-content">
                        <div class="stats-value">${availableResources}</div>
                        <div class="stats-label">Ressources disponibles</div>
                    </div>
                </div>
                
                <div class="stats-card maintenance-resources">
                    <div class="stats-icon">
                        <i class="fas fa-tools"></i>
                    </div>
                    <div class="stats-content">
                        <div class="stats-value">${inMaintenanceResources}</div>
                        <div class="stats-label">En maintenance</div>
                    </div>
                </div>
                
                <div class="stats-card active-loans">
                    <div class="stats-icon">
                        <i class="fas fa-exchange-alt"></i>
                    </div>
                    <div class="stats-content">
                        <div class="stats-value">${activeLoans}</div>
                        <div class="stats-label">Prêts actifs</div>
                    </div>
                </div>
                
                <div class="stats-card overdue-loans">
                    <div class="stats-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="stats-content">
                        <div class="stats-value">${overdueLoans}</div>
                        <div class="stats-label">Prêts en retard</div>
                    </div>
                </div>
            </div>
            
            <div class="overview-sections">
                <div class="overview-section">
                    <h3><i class="fas fa-bell"></i> Rappels de retour</h3>
                    <div class="overview-content">
                        ${this.generateReturnRemindersHTML()}
                    </div>
                </div>
                
                <div class="overview-section">
                    <h3><i class="fas fa-exclamation-circle"></i> Retards</h3>
                    <div class="overview-content">
                        ${this.generateOverdueHTML()}
                    </div>
                </div>
            </div>
            
            <div class="overview-sections">
                <div class="overview-section">
                    <h3><i class="fas fa-door-open"></i> Statut des salles</h3>
                    <div class="overview-content">
                        ${this.generateRoomsStatusHTML()}
                    </div>
                </div>
                
                <div class="overview-section">
                    <h3><i class="fas fa-car"></i> Statut des véhicules</h3>
                    <div class="overview-content">
                        ${this.generateVehiclesStatusHTML()}
                    </div>
                </div>
            </div>
        `;
        
        // Attacher l'événement de rafraîchissement
        const refreshBtn = document.getElementById('refreshDashboardBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                // Recharger toutes les données
                this.loadAllResources();
                this.loadLoans();
                
                // Mettre à jour l'affichage
                this.updateOverview();
            });
        }
    },
    
    /**
     * Génère le HTML pour les rappels de retour
     */
    generateReturnRemindersHTML() {
        if (this.state.returnReminders.length === 0) {
            return '<p class="no-data">Aucun rappel de retour pour le moment.</p>';
        }
        
        let html = '<div class="reminders-list">';
        
        this.state.returnReminders.forEach(reminder => {
            const statusClass = reminder.daysRemaining === 0 ? 'urgent' : 'normal';
            const formattedDate = new Date(reminder.returnDate).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            html += `
                <div class="reminder-item ${statusClass}">
                    <div class="reminder-resource">
                        <span class="resource-name">${reminder.resourceName}</span>
                        <span class="return-date">Retour: ${formattedDate}</span>
                    </div>
                    <div class="reminder-user">
                        <span class="user-name">${reminder.borrowerName}</span>
                        <span class="days-remaining">${reminder.daysRemaining === 0 ? 'Aujourd\'hui' : `${reminder.daysRemaining} jour(s)`}</span>
                    </div>
                    <div class="reminder-actions">
                        <button class="notify-btn" data-id="${reminder.id}">
                            <i class="fas fa-envelope"></i>
                        </button>
                        <button class="extend-btn" data-id="${reminder.id}">
                            <i class="fas fa-calendar-plus"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    },
    
    /**
     * Génère le HTML pour les prêts en retard
     */
    generateOverdueHTML() {
        if (this.state.overdue.length === 0) {
            return '<p class="no-data">Aucun prêt en retard pour le moment.</p>';
        }
        
        let html = '<div class="overdue-list">';
        
        this.state.overdue.forEach(item => {
            const formattedDate = new Date(item.returnDate).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            html += `
                <div class="overdue-item">
                    <div class="overdue-resource">
                        <span class="resource-name">${item.resourceName}</span>
                        <span class="return-date">Retour prévu: ${formattedDate}</span>
                    </div>
                    <div class="overdue-user">
                        <span class="user-name">${item.borrowerName}</span>
                        <span class="days-overdue">${item.daysOverdue} jour(s) de retard</span>
                    </div>
                    <div class="overdue-actions">
                        <button class="notify-btn" data-id="${item.id}">
                            <i class="fas fa-exclamation-circle"></i> Notifier
                        </button>
                        <button class="resolve-btn" data-id="${item.id}">
                            <i class="fas fa-check"></i> Résoudre
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    },
    
    /**
     * Génère le HTML pour le statut des salles
     */
    generateRoomsStatusHTML() {
        const rooms = this.state.resources.rooms;
        if (rooms.length === 0) {
            return '<p class="no-data">Aucune salle configurée.</p>';
        }
        
        let html = '<div class="rooms-status-grid">';
        
        rooms.forEach(room => {
            let statusClass = '';
            let statusText = '';
            let statusIcon = '';
            
            switch (room.status) {
                case 'available':
                    statusClass = 'available';
                    statusText = 'Disponible';
                    statusIcon = 'check-circle';
                    break;
                case 'occupied':
                    statusClass = 'occupied';
                    statusText = 'Occupée';
                    statusIcon = 'clock';
                    break;
                case 'maintenance':
                    statusClass = 'maintenance';
                    statusText = 'Maintenance';
                    statusIcon = 'tools';
                    break;
                default:
                    statusClass = 'unknown';
                    statusText = 'Inconnu';
                    statusIcon = 'question-circle';
            }
            
            html += `
                <div class="room-status-card ${statusClass}">
                    <div class="room-name">${room.name}</div>
                    <div class="room-capacity"><i class="fas fa-users"></i> ${room.capacity} pers.</div>
                    <div class="room-status">
                        <i class="fas fa-${statusIcon}"></i> ${statusText}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    },
    
    /**
     * Génère le HTML pour le statut des véhicules
     */
    generateVehiclesStatusHTML() {
        const vehicles = this.state.resources.vehicles;
        if (vehicles.length === 0) {
            return '<p class="no-data">Aucun véhicule configuré.</p>';
        }
        
        let html = '<div class="vehicles-status-grid">';
        
        vehicles.forEach(vehicle => {
            let statusClass = '';
            let statusText = '';
            let statusIcon = '';
            
            switch (vehicle.status) {
                case 'available':
                    statusClass = 'available';
                    statusText = 'Disponible';
                    statusIcon = 'check-circle';
                    break;
                case 'occupied':
                    statusClass = 'occupied';
                    statusText = 'En utilisation';
                    statusIcon = 'clock';
                    break;
                case 'maintenance':
                    statusClass = 'maintenance';
                    statusText = 'Maintenance';
                    statusIcon = 'tools';
                    break;
                default:
                    statusClass = 'unknown';
                    statusText = 'Inconnu';
                    statusIcon = 'question-circle';
            }
            
            html += `
                <div class="vehicle-status-card ${statusClass}">
                    <div class="vehicle-name">${vehicle.name}</div>
                    <div class="vehicle-registration">${vehicle.registration}</div>
                    <div class="vehicle-status">
                        <i class="fas fa-${statusIcon}"></i> ${statusText}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    },
    
    /**
     * Met à jour la section des prêts
     */
    updateLoans() {
        const loansSection = document.getElementById('admin-loans-section');
        if (!loansSection) return;
        
        loansSection.innerHTML = `
            <div class="loans-header">
                <h2><i class="fas fa-exchange-alt"></i> Gestion des prêts</h2>
                <div class="loans-actions">
                    <button id="addLoanBtn" class="add-loan-btn">
                        <i class="fas fa-plus"></i> Nouveau prêt
                    </button>
                </div>
            </div>
            
            <div class="loans-filters">
                <div class="search-box">
                    <input type="text" id="loan-search" placeholder="Rechercher un prêt...">
                    <button><i class="fas fa-search"></i></button>
                </div>
                <div class="filter-group">
                    <label for="loan-period">Période:</label>
                    <select id="loan-period">
                        <option value="all">Tous</option>
                        <option value="today" selected>Aujourd'hui</option>
                        <option value="week">Cette semaine</option>
                        <option value="month">Ce mois</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="loan-status">Statut:</label>
                    <select id="loan-status">
                        <option value="all" selected>Tous</option>
                        <option value="active">Actifs</option>
                        <option value="pending">En attente</option>
                        <option value="returned">Retournés</option>
                        <option value="overdue">En retard</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="loan-type">Type:</label>
                    <select id="loan-type">
                        <option value="all" selected>Tous</option>
                        <option value="room">Salles</option>
                        <option value="vehicle">Véhicules</option>
                        <option value="equipment">Équipements</option>
                    </select>
                </div>
            </div>
            
            <div class="loans-table-container">
                <table class="loans-table">
                    <thead>
                        <tr>
                            <th>Ressource</th>
                            <th>Type</th>
                            <th>Emprunteur</th>
                            <th>Début</th>
                            <th>Fin</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.generateLoansTableHTML()}
                    </tbody>
                </table>
            </div>
            
            <div class="loans-pagination">
                <button class="pagination-btn" disabled>
                    <i class="fas fa-chevron-left"></i>
                </button>
                <span class="pagination-info">Page 1 sur 1</span>
                <button class="pagination-btn" disabled>
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
        
        // Attacher les événements
        const addLoanBtn = document.getElementById('addLoanBtn');
        if (addLoanBtn) {
            addLoanBtn.addEventListener('click', () => {
                this.showNewLoanForm();
            });
        }
        
        // Attacher les événements aux boutons d'action des prêts
        document.querySelectorAll('.loan-return-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const loanId = e.currentTarget.dataset.id;
                this.returnLoan(loanId);
            });
        });
        
        document.querySelectorAll('.loan-extend-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const loanId = e.currentTarget.dataset.id;
                this.extendLoan(loanId);
            });
        });
        
        document.querySelectorAll('.loan-cancel-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const loanId = e.currentTarget.dataset.id;
                this.cancelLoan(loanId);
            });
        });
    },
    
    /**
     * Génère le HTML pour le tableau des prêts
     */
    generateLoansTableHTML() {
        if (this.state.loans.length === 0) {
            return `
                <tr>
                    <td colspan="7" class="no-data">
                        <i class="fas fa-info-circle"></i> Aucun prêt à afficher.
                    </td>
                </tr>
            `;
        }
        
        let html = '';
        
        this.state.loans.forEach(loan => {
            const startDate = new Date(loan.startDate).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const endDate = new Date(loan.endDate).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            let statusClass = '';
            let statusText = '';
            
            switch (loan.status) {
                case 'active':
                    statusClass = 'status-active';
                    statusText = 'Actif';
                    break;
                case 'pending':
                    statusClass = 'status-pending';
                    statusText = 'En attente';
                    break;
                case 'returned':
                    statusClass = 'status-returned';
                    statusText = 'Retourné';
                    break;
                case 'overdue':
                    statusClass = 'status-overdue';
                    statusText = 'En retard';
                    break;
                default:
                    statusClass = 'status-unknown';
                    statusText = 'Inconnu';
            }
            
            html += `
                <tr>
                    <td>${loan.resourceName}</td>
                    <td>${loan.resourceType}</td>
                    <td>${loan.borrowerName}</td>
                    <td>${startDate}</td>
                    <td>${endDate}</td>
                    <td><span class="loan-status ${statusClass}">${statusText}</span></td>
                    <td class="loan-actions">
                        <button class="loan-return-btn" data-id="${loan.id}" title="Retourner">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="loan-extend-btn" data-id="${loan.id}" title="Prolonger">
                            <i class="fas fa-calendar-plus"></i>
                        </button>
                        <button class="loan-cancel-btn" data-id="${loan.id}" title="Annuler">
                            <i class="fas fa-times"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        return html;
    },
    
    /**
     * Filtre les prêts par texte de recherche
     */
    filterLoans(searchText) {
        console.log("Filtrage des prêts par:", searchText);
        // Implémentation à venir
    },
    
    /**
     * Filtre les prêts par période
     */
    filterLoansByPeriod(period) {
        console.log("Filtrage des prêts par période:", period);
        // Implémentation à venir
    },
    
    /**
     * Affiche le formulaire de nouveau prêt
     */
    showNewLoanForm() {
        console.log("Formulaire de nouveau prêt");
        // Implémentation à venir
    },
    
    /**
     * Marque un prêt comme retourné
     */
    returnLoan(loanId) {
        console.log("Retour du prêt:", loanId);
        // Implémentation à venir
    },
    
    /**
     * Prolonge un prêt
     */
    extendLoan(loanId) {
        console.log("Prolongation du prêt:", loanId);
        // Implémentation à venir
    },
    
    /**
     * Annule un prêt
     */
    cancelLoan(loanId) {
        console.log("Annulation du prêt:", loanId);
        // Implémentation à venir
    },
    
    /**
     * Met à jour la section des salles
     */
    updateRooms() {
        const roomsSection = document.getElementById('admin-rooms-section');
        if (!roomsSection) return;
        
        roomsSection.innerHTML = `
            <div class="rooms-header">
                <h2><i class="fas fa-door-open"></i> Gestion des salles</h2>
                <div class="rooms-actions">
                    <button id="addRoomBtn" class="add-room-btn">
                        <i class="fas fa-plus"></i> Ajouter une salle
                    </button>
                </div>
            </div>
            
            <div class="rooms-filters">
                <div class="search-box">
                    <input type="text" id="room-search" placeholder="Rechercher une salle...">
                    <button><i class="fas fa-search"></i></button>
                </div>
                <div class="filter-group">
                    <label for="room-status">Statut:</label>
                    <select id="room-status">
                        <option value="all" selected>Tous</option>
                        <option value="available">Disponible</option>
                        <option value="occupied">Occupée</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="room-sort">Trier par:</label>
                    <select id="room-sort">
                        <option value="name" selected>Nom</option>
                        <option value="capacity">Capacité</option>
                        <option value="status">Statut</option>
                    </select>
                </div>
            </div>
            
            <div class="rooms-grid-container">
                ${this.generateRoomsGridHTML()}
            </div>
        `;
        
        // Attacher les événements
        const addRoomBtn = document.getElementById('addRoomBtn');
        if (addRoomBtn) {
            addRoomBtn.addEventListener('click', () => {
                this.showAddRoomModal();
            });
        }
        
        // Attacher les événements aux cartes de salles
        document.querySelectorAll('.room-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Empêcher le déclenchement du clic sur la carte
                const roomId = e.currentTarget.dataset.id;
                this.editRoom(roomId);
            });
        });
        
        document.querySelectorAll('.room-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Empêcher le déclenchement du clic sur la carte
                const roomId = e.currentTarget.dataset.id;
                this.deleteRoom(roomId);
            });
        });
        
        document.querySelectorAll('.room-toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Empêcher le déclenchement du clic sur la carte
                const roomId = e.currentTarget.dataset.id;
                this.toggleRoomStatus(roomId);
            });
        });
        
        document.querySelectorAll('.room-card').forEach(card => {
            card.addEventListener('click', () => {
                const roomId = card.dataset.id;
                this.showRoomDetails(roomId);
            });
        });
    },
    
    /**
     * Génère le HTML pour la grille des salles
     */
    generateRoomsGridHTML() {
        const rooms = this.state.resources.rooms;
        if (rooms.length === 0) {
            return '<p class="no-data"><i class="fas fa-info-circle"></i> Aucune salle configurée.</p>';
        }
        
        let html = '<div class="rooms-grid">';
        
        rooms.forEach(room => {
            let statusClass = '';
            let statusText = '';
            let statusIcon = '';
            
            switch (room.status) {
                case 'available':
                    statusClass = 'available';
                    statusText = 'Disponible';
                    statusIcon = 'check-circle';
                    break;
                case 'occupied':
                    statusClass = 'occupied';
                    statusText = 'Occupée';
                    statusIcon = 'clock';
                    break;
                case 'maintenance':
                    statusClass = 'maintenance';
                    statusText = 'Maintenance';
                    statusIcon = 'tools';
                    break;
                default:
                    statusClass = 'unknown';
                    statusText = 'Inconnu';
                    statusIcon = 'question-circle';
            }
            
            html += `
                <div class="room-card ${statusClass}" data-id="${room.id}">
                    <div class="room-card-header">
                        <h3>${room.name}</h3>
                        <span class="room-status">
                            <i class="fas fa-${statusIcon}"></i> ${statusText}
                        </span>
                    </div>
                    <div class="room-card-body">
                        <div class="room-info">
                            <p><i class="fas fa-users"></i> <strong>Capacité:</strong> ${room.capacity} personnes</p>
                            <p><i class="fas fa-map-marker-alt"></i> <strong>Emplacement:</strong> ${room.location}</p>
                            <p><i class="fas fa-at"></i> <strong>Email:</strong> ${room.email}</p>
                        </div>
                        <div class="room-features">
                            <p><strong>Équipements:</strong></p>
                            <div class="feature-tags">
                                ${room.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="room-card-footer">
                        <button class="room-edit-btn" data-id="${room.id}" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="room-toggle-btn" data-id="${room.id}" title="${room.status === 'maintenance' ? 'Activer' : 'Mettre en maintenance'}">
                            <i class="fas fa-power-off"></i>
                        </button>
                        <button class="room-delete-btn" data-id="${room.id}" title="Supprimer">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    },
    
    /**
     * Met à jour la section des véhicules
     */
    updateVehicles() {
        const vehiclesSection = document.getElementById('admin-vehicles-section');
        if (!vehiclesSection) return;
        
        // Contenu similaire à updateRooms mais pour les véhicules
        vehiclesSection.innerHTML = `
            <div class="vehicles-header">
                <h2><i class="fas fa-car"></i> Gestion des véhicules</h2>
                <div class="vehicles-actions">
                    <button id="addVehicleBtn" class="add-vehicle-btn">
                        <i class="fas fa-plus"></i> Ajouter un véhicule
                    </button>
                </div>
            </div>
            
            <div class="vehicles-filters">
                <!-- Filtres similaires aux salles -->
            </div>
            
            <div class="vehicles-grid-container">
                <!-- Grille des véhicules similaire à celle des salles -->
            </div>
        `;
    },
    
    /**
     * Met à jour la section des équipements
     */
    updateEquipment() {
        const equipmentSection = document.getElementById('admin-equipment-section');
        if (!equipmentSection) return;
        
        // Contenu similaire à updateRooms mais pour les équipements
        equipmentSection.innerHTML = `
            <div class="equipment-header">
                <h2><i class="fas fa-laptop"></i> Gestion des équipements</h2>
                <div class="equipment-actions">
                    <button id="addEquipmentBtn" class="add-equipment-btn">
                        <i class="fas fa-plus"></i> Ajouter un équipement
                    </button>
                </div>
            </div>
            
            <div class="equipment-filters">
                <!-- Filtres similaires aux salles -->
            </div>
            
            <div class="equipment-grid-container">
                <!-- Grille des équipements similaire à celle des salles -->
            </div>
        `;
    },
    
    /**
     * Met à jour la section des utilisateurs
     */
    updateUsers() {
        const usersSection = document.getElementById('admin-users-section');
        if (!usersSection) return;
        
        usersSection.innerHTML = `
            <div class="users-header">
                <h2><i class="fas fa-users"></i> Gestion des utilisateurs</h2>
                <div class="users-actions">
                    <button id="addUserBtn" class="add-user-btn">
                        <i class="fas fa-user-plus"></i> Ajouter un utilisateur
                    </button>
                </div>
            </div>
            
            <div class="users-filters">
                <!-- Filtres pour les utilisateurs -->
            </div>
            
            <div class="users-table-container">
                <!-- Tableau des utilisateurs -->
            </div>
        `;
    },
    
    /**
     * Met à jour la section des paramètres
     */
    updateSettings() {
        const settingsSection = document.getElementById('admin-settings-section');
        if (!settingsSection) return;
        
        settingsSection.innerHTML = `
            <div class="settings-header">
                <h2><i class="fas fa-cogs"></i> Paramètres du système</h2>
            </div>
            
            <div class="settings-form-container">
                <!-- Formulaire des paramètres -->
            </div>
        `;
    }
};

// Initialisation du tableau de bord administratif
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si l'élément de tableau de bord existe
    const adminDashboard = document.getElementById('adminDashboard');
    if (adminDashboard) {
        AdminDashboard.init();
    }
});

// Exportation pour utilisation dans d'autres modules
window.AdminDashboard = AdminDashboard;
