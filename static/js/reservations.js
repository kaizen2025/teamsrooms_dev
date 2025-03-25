/**
 * Système complet de gestion des réservations (salles, véhicules, matériels)
 * Version unifiée permettant de gérer tous les types de ressources
 */
const ReservationSystem = {
    // État du système
    state: {
        activeResourceType: 'room', // 'room', 'vehicle', 'equipment'
        resources: {
            rooms: [],
            vehicles: [],
            equipment: []
        },
        selectedResource: null,
        bookings: {
            rooms: [],
            vehicles: [],
            equipment: []
        },
        currentDate: new Date(),
        loading: false,
        error: null
    },
    
    /**
     * Initialise le système de réservation
     */
    init() {
        // Déterminer le type de ressource actif depuis l'URL ou le contexte
        this.state.activeResourceType = window.resourceType || 'room';
        
        // Charger les données des ressources
        this.loadAllResources();
        
        // Initialiser les onglets
        this.initTabs();
        
        // Initialiser les filtres
        this.initFilters();
        
        // Initialiser les éléments spécifiques au type de ressource
        this.initResourceSpecificElements();
        
        console.log(`Système de réservation initialisé pour: ${this.state.activeResourceType}`);
    },
    
    /**
     * Initialise les onglets de réservation et la navigation
     */
    initTabs() {
        document.querySelectorAll('.reservation-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Désactiver tous les onglets
                document.querySelectorAll('.reservation-tab').forEach(t => {
                    t.classList.remove('active');
                });
                
                // Activer l'onglet cliqué
                tab.classList.add('active');
                
                // Récupérer le type de ressource et mettre à jour l'état
                const resourceType = tab.dataset.resourceType;
                if (resourceType) {
                    this.state.activeResourceType = resourceType;
                    
                    // Afficher le contenu correspondant
                    this.showResourceContent(resourceType);
                    
                    // Charger ou rafraîchir les données de ce type de ressource
                    this.loadResourceData(resourceType);
                }
            });
        });
        
        // Activer l'onglet correspondant au type de ressource actif
        const activeTab = document.querySelector(`.reservation-tab[data-resource-type="${this.state.activeResourceType}"]`);
        if (activeTab) {
            activeTab.click();
        }
    },
    
    /**
     * Affiche le contenu correspondant au type de ressource
     */
    showResourceContent(resourceType) {
        // Masquer tous les contenus
        document.querySelectorAll('.reservation-content-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Afficher le contenu du type de ressource sélectionné
        const contentSection = document.getElementById(`${resourceType}-reservation-content`);
        if (contentSection) {
            contentSection.style.display = 'block';
        }
    },
    
    /**
     * Initialise les filtres pour chaque type de ressource
     */
    initFilters() {
        // Filtres pour les salles
        const roomFilter = document.getElementById('room-filter');
        const roomCapacityFilter = document.getElementById('room-capacity-filter');
        
        if (roomFilter) {
            roomFilter.addEventListener('input', () => {
                this.filterRooms(
                    roomFilter.value, 
                    roomCapacityFilter ? roomCapacityFilter.value : 'all'
                );
            });
        }
        
        if (roomCapacityFilter) {
            roomCapacityFilter.addEventListener('change', () => {
                this.filterRooms(
                    roomFilter ? roomFilter.value : '', 
                    roomCapacityFilter.value
                );
            });
        }
        
        // Filtres pour les véhicules
        const vehicleFilter = document.getElementById('vehicle-filter');
        const vehicleTypeFilter = document.getElementById('vehicle-type-filter');
        
        if (vehicleFilter) {
            vehicleFilter.addEventListener('input', () => {
                this.filterVehicles(
                    vehicleFilter.value, 
                    vehicleTypeFilter ? vehicleTypeFilter.value : 'all'
                );
            });
        }
        
        if (vehicleTypeFilter) {
            vehicleTypeFilter.addEventListener('change', () => {
                this.filterVehicles(
                    vehicleFilter ? vehicleFilter.value : '', 
                    vehicleTypeFilter.value
                );
            });
        }
        
        // Filtres pour le matériel
        const equipmentFilter = document.getElementById('equipment-filter');
        const equipmentTypeFilter = document.getElementById('equipment-type-filter');
        
        if (equipmentFilter) {
            equipmentFilter.addEventListener('input', () => {
                this.filterEquipment(
                    equipmentFilter.value, 
                    equipmentTypeFilter ? equipmentTypeFilter.value : 'all'
                );
            });
        }
        
        if (equipmentTypeFilter) {
            equipmentTypeFilter.addEventListener('change', () => {
                this.filterEquipment(
                    equipmentFilter ? equipmentFilter.value : '', 
                    equipmentTypeFilter.value
                );
            });
        }
    },
    
    /**
     * Initialise les éléments spécifiques au type de ressource actif
     */
    initResourceSpecificElements() {
        switch (this.state.activeResourceType) {
            case 'room':
                // Attacher des événements spécifiques aux salles
                const createRoomBookingBtn = document.getElementById('create-room-booking-btn');
                if (createRoomBookingBtn) {
                    createRoomBookingBtn.addEventListener('click', () => {
                        this.showBookingForm('room');
                    });
                }
                break;
                
            case 'vehicle':
                // Attacher des événements spécifiques aux véhicules
                const createVehicleBookingBtn = document.getElementById('create-vehicle-booking-btn');
                if (createVehicleBookingBtn) {
                    createVehicleBookingBtn.addEventListener('click', () => {
                        this.showBookingForm('vehicle');
                    });
                }
                break;
                
            case 'equipment':
                // Attacher des événements spécifiques au matériel
                const createEquipmentBookingBtn = document.getElementById('create-equipment-booking-btn');
                if (createEquipmentBookingBtn) {
                    createEquipmentBookingBtn.addEventListener('click', () => {
                        this.showBookingForm('equipment');
                    });
                }
                break;
        }
    },
    
    /**
     * Charge les données pour tous les types de ressources
     */
    loadAllResources() {
        this.loadResourceData('room');
        this.loadResourceData('vehicle');
        this.loadResourceData('equipment');
    },
    
    /**
     * Charge les données pour un type de ressource spécifique
     */
    loadResourceData(resourceType) {
        this.showLoading(true, resourceType);
        
        switch (resourceType) {
            case 'room':
                this.loadRooms();
                break;
                
            case 'vehicle':
                this.loadVehicles();
                break;
                
            case 'equipment':
                this.loadEquipment();
                break;
        }
    },
    
    /**
     * Charge les données des salles
     */
    async loadRooms() {
        try {
            // Utiliser la configuration globale des salles
            if (window.SALLES) {
                const rooms = [];
                for (const [name, email] of Object.entries(window.SALLES)) {
                    // Créer un objet salle à partir des données disponibles
                    rooms.push({
                        id: name.toLowerCase(),
                        name: name,
                        type: 'room',
                        email: email,
                        capacity: this.getRandomCapacity(4, 20), // Simulé pour l'exemple
                        location: this.getRandomLocation(), // Simulé pour l'exemple
                        features: this.getRandomFeatures(), // Simulé pour l'exemple
                        status: this.getRandomStatus() // Simulé pour l'exemple
                    });
                }
                
                this.state.resources.rooms = rooms;
                this.displayRooms();
                await this.loadRoomBookings();
            }
        } catch (error) {
            console.error('Erreur lors du chargement des salles:', error);
            this.showError('Impossible de charger les salles.', 'room');
        } finally {
            this.showLoading(false, 'room');
        }
    },
    
    /**
     * Charge les données des véhicules
     */
    async loadVehicles() {
        try {
            // Utiliser la configuration globale des véhicules
            if (window.VEHICULES) {
                const vehicles = [];
                
                // Ajouter des véhicules pour chaque catégorie
                for (const [category, email] of Object.entries(window.VEHICULES)) {
                    // Déterminer le nombre de véhicules par catégorie
                    let count = 4; // Par défaut
                    
                    if (category.includes('Vélos')) {
                        // Pour les vélos, créer plusieurs vélos individuels
                        for (let i = 1; i <= count; i++) {
                            vehicles.push({
                                id: `velo-${i}`,
                                name: `Vélo ${i}`,
                                type: 'vehicle',
                                category: 'Vélo',
                                email: email,
                                registration: `VELO-${i}`,
                                seats: 1,
                                location: 'Parking vélos',
                                features: ['Casque', 'Antivol'],
                                status: this.getRandomStatus()
                            });
                        }
                    } else {
                        // Pour les véhicules standard
                        const vehicleTypes = [
                            { type: 'Citadine', models: ['Renault Clio', 'Peugeot 208', 'Citroën C3', 'Toyota Yaris'] },
                            { type: 'Berline', models: ['Peugeot 508', 'Renault Talisman'] },
                            { type: 'SUV', models: ['Peugeot 3008', 'Renault Kadjar'] },
                            { type: 'Utilitaire', models: ['Renault Kangoo', 'Citroën Berlingo'] }
                        ];
                        
                        vehicleTypes.forEach((vehicleType, typeIndex) => {
                            vehicleType.models.forEach((model, modelIndex) => {
                                // Générer un identifiant unique
                                const id = `${category.toLowerCase().replace(/\s+/g, '-')}-${typeIndex}-${modelIndex}`;
                                
                                vehicles.push({
                                    id: id,
                                    name: model,
                                    type: 'vehicle',
                                    category: vehicleType.type,
                                    email: email,
                                    registration: `AA-${100 + typeIndex * 10 + modelIndex}-BB`,
                                    seats: vehicleType.type === 'Utilitaire' ? 3 : vehicleType.type === 'SUV' ? 5 : 5,
                                    location: category.includes('Florensud') ? 'Parking Florensud' : 'Parking Anecoop',
                                    features: this.getRandomVehicleFeatures(vehicleType.type),
                                    status: this.getRandomStatus()
                                });
                            });
                        });
                    }
                }
                
                this.state.resources.vehicles = vehicles;
                this.displayVehicles();
                await this.loadVehicleBookings();
            }
        } catch (error) {
            console.error('Erreur lors du chargement des véhicules:', error);
            this.showError('Impossible de charger les véhicules.', 'vehicle');
        } finally {
            this.showLoading(false, 'vehicle');
        }
    },
    
    /**
     * Charge les données du matériel
     */
    async loadEquipment() {
        try {
            // Utiliser la configuration globale du matériel
            if (window.MATERIEL) {
                const equipment = [];
                
                // Liste de matériel possible par catégorie
                const equipmentTypes = [
                    { 
                        category: 'Informatique', 
                        items: [
                            { name: 'Ordinateur portable HP', features: ['Windows 11', 'Office 365'] },
                            { name: 'Ordinateur portable Dell', features: ['Windows 11', 'Office 365'] },
                            { name: 'Tablette Samsung', features: ['Android', 'Étui de protection'] },
                            { name: 'iPad Pro', features: ['iOS', 'Apple Pencil'] }
                        ]
                    },
                    {
                        category: 'Audiovisuel',
                        items: [
                            { name: 'Vidéoprojecteur Epson', features: ['HDMI', 'VGA', 'Télécommande'] },
                            { name: 'Écran portable', features: ['Écran 70"', 'Trépied'] },
                            { name: 'Système de visioconférence', features: ['Caméra HD', 'Microphone 360°'] }
                        ]
                    },
                    {
                        category: 'Téléphonie',
                        items: [
                            { name: 'Téléphone de conférence', features: ['Bluetooth', 'Batterie longue durée'] },
                            { name: 'Casque sans fil', features: ['Bluetooth', 'Réduction de bruit'] }
                        ]
                    }
                ];
                
                // Pour chaque email de réservation de matériel
                for (const [category, email] of Object.entries(window.MATERIEL)) {
                    // Ajouter chaque type d'équipement
                    equipmentTypes.forEach((type, typeIndex) => {
                        type.items.forEach((item, itemIndex) => {
                            // Créer plusieurs instances de chaque élément
                            const count = 1 + Math.floor(Math.random() * 3); // 1 à 3 exemplaires
                            
                            for (let i = 1; i <= count; i++) {
                                equipment.push({
                                    id: `${type.category.toLowerCase()}-${itemIndex}-${i}`,
                                    name: item.name,
                                    type: 'equipment',
                                    category: type.category,
                                    email: email,
                                    serialNumber: `${type.category.substr(0, 3).toUpperCase()}${typeIndex}${itemIndex}${i}-${Math.floor(Math.random() * 10000)}`,
                                    location: this.getRandomLocation(),
                                    features: item.features,
                                    status: this.getRandomStatus(),
                                    notes: ''
                                });
                            }
                        });
                    });
                }
                
                this.state.resources.equipment = equipment;
                this.displayEquipment();
                await this.loadEquipmentBookings();
            }
        } catch (error) {
            console.error('Erreur lors du chargement du matériel:', error);
            this.showError('Impossible de charger le matériel.', 'equipment');
        } finally {
            this.showLoading(false, 'equipment');
        }
    },
    
    /**
     * Charge les réservations des salles
     */
    async loadRoomBookings() {
        try {
            // Dans un système réel, appeler l'API pour obtenir les réservations
            // Ici, utiliser les réunions disponibles
            const response = await fetch(`${window.API_URLS.GET_MEETINGS}?t=${Date.now()}`);
            let meetings = await response.json();
            
            // Convertir les réunions en format de réservation
            const bookings = meetings.map(meeting => ({
                id: meeting.id,
                resourceId: meeting.salle ? meeting.salle.toLowerCase() : '',
                resourceName: meeting.salle || '',
                resourceType: 'room',
                subject: meeting.subject,
                startTime: meeting.start,
                endTime: meeting.end,
                organizer: (meeting.attendees && meeting.attendees.length > 0) ? meeting.attendees[0] : '',
                attendees: meeting.attendees || [],
                joinUrl: meeting.joinUrl || '',
                isOnlineMeeting: meeting.isOnline || false
            }));
            
            this.state.bookings.rooms = bookings;
            this.updateRoomAvailability();
        } catch (error) {
            console.error('Erreur lors du chargement des réservations de salles:', error);
        }
    },
    
    /**
     * Charge les réservations des véhicules
     */
    async loadVehicleBookings() {
        try {
            // Dans un système réel, appeler l'API pour obtenir les réservations
            // Ici, simuler des données de réservation
            const today = new Date();
            const tomorrow = new Date();
            tomorrow.setDate(today.getDate() + 1);
            
            // Réservations simulées
            const bookings = [
                {
                    id: 'veh-booking-1',
                    resourceId: this.state.resources.vehicles.length > 0 ? this.state.resources.vehicles[0].id : 'veh-1',
                    resourceName: this.state.resources.vehicles.length > 0 ? this.state.resources.vehicles[0].name : 'Véhicule 1',
                    resourceType: 'vehicle',
                    subject: 'Visite client Perpignan',
                    startTime: new Date(today.setHours(9, 0, 0, 0)).toISOString(),
                    endTime: new Date(today.setHours(17, 0, 0, 0)).toISOString(),
                    organizer: 'Jean Dupont',
                    driver: 'Jean Dupont',
                    destination: 'Perpignan',
                    distance: 150,
                    purpose: 'Visite commerciale'
                },
                {
                    id: 'veh-booking-2',
                    resourceId: this.state.resources.vehicles.length > 1 ? this.state.resources.vehicles[1].id : 'veh-2',
                    resourceName: this.state.resources.vehicles.length > 1 ? this.state.resources.vehicles[1].name : 'Véhicule 2',
                    resourceType: 'vehicle',
                    subject: 'Livraison documents',
                    startTime: new Date(tomorrow.setHours(10, 0, 0, 0)).toISOString(),
                    endTime: new Date(tomorrow.setHours(12, 0, 0, 0)).toISOString(),
                    organizer: 'Marie Martin',
                    driver: 'Marie Martin',
                    destination: 'Montpellier',
                    distance: 200,
                    purpose: 'Livraison documents urgents'
                }
            ];
            
            this.state.bookings.vehicles = bookings;
            this.updateVehicleAvailability();
        } catch (error) {
            console.error('Erreur lors du chargement des réservations de véhicules:', error);
        }
    },
    
    /**
     * Charge les réservations du matériel
     */
    async loadEquipmentBookings() {
        try {
            // Simuler des données de réservation
            const today = new Date();
            const nextWeek = new Date();
            nextWeek.setDate(today.getDate() + 7);
            
            // Réservations simulées
            const bookings = [
                {
                    id: 'equip-booking-1',
                    resourceId: this.state.resources.equipment.length > 0 ? this.state.resources.equipment[0].id : 'equip-1',
                    resourceName: this.state.resources.equipment.length > 0 ? this.state.resources.equipment[0].name : 'Vidéoprojecteur',
                    resourceType: 'equipment',
                    subject: 'Présentation client',
                    startTime: new Date(today.setHours(14, 0, 0, 0)).toISOString(),
                    endTime: new Date(today.setHours(17, 0, 0, 0)).toISOString(),
                    organizer: 'Sophie Durand',
                    purpose: 'Présentation commerciale'
                },
                {
                    id: 'equip-booking-2',
                    resourceId: this.state.resources.equipment.length > 1 ? this.state.resources.equipment[1].id : 'equip-2',
                    resourceName: this.state.resources.equipment.length > 1 ? this.state.resources.equipment[1].name : 'Ordinateur portable',
                    resourceType: 'equipment',
                    subject: 'Formation interne',
                    startTime: new Date(nextWeek.setHours(9, 0, 0, 0)).toISOString(),
                    endTime: new Date(nextWeek.setHours(17, 0, 0, 0)).toISOString(),
                    organizer: 'Paul Martin',
                    purpose: 'Formation Excel avancé'
                }
            ];
            
            this.state.bookings.equipment = bookings;
            this.updateEquipmentAvailability();
        } catch (error) {
            console.error('Erreur lors du chargement des réservations de matériel:', error);
        }
    },
    
    /**
     * Affiche les salles disponibles
     */
    displayRooms(filtered = null) {
        const roomsContainer = document.getElementById('rooms-list');
        if (!roomsContainer) return;
        
        // Utiliser les salles filtrées ou toutes les salles
        const rooms = filtered || this.state.resources.rooms;
        
        // Vider le conteneur
        roomsContainer.innerHTML = '';
        
        if (rooms.length === 0) {
            roomsContainer.innerHTML = '<div class="no-resources-message"><i class="fas fa-info-circle"></i> Aucune salle disponible.</div>';
            return;
        }
        
        // Créer la liste des salles
        rooms.forEach(room => {
            const card = this.createResourceCard(room);
            roomsContainer.appendChild(card);
        });
    },
    
    /**
     * Affiche les véhicules disponibles
     */
    displayVehicles(filtered = null) {
        const vehiclesContainer = document.getElementById('vehicles-list');
        if (!vehiclesContainer) return;
        
        // Utiliser les véhicules filtrés ou tous les véhicules
        const vehicles = filtered || this.state.resources.vehicles;
        
        // Vider le conteneur
        vehiclesContainer.innerHTML = '';
        
        if (vehicles.length === 0) {
            vehiclesContainer.innerHTML = '<div class="no-resources-message"><i class="fas fa-info-circle"></i> Aucun véhicule disponible.</div>';
            return;
        }
        
        // Créer la liste des véhicules
        vehicles.forEach(vehicle => {
            const card = this.createResourceCard(vehicle);
            vehiclesContainer.appendChild(card);
        });
    },
    
    /**
     * Affiche le matériel disponible
     */
    displayEquipment(filtered = null) {
        const equipmentContainer = document.getElementById('equipment-list');
        if (!equipmentContainer) return;
        
        // Utiliser le matériel filtré ou tout le matériel
        const equipment = filtered || this.state.resources.equipment;
        
        // Vider le conteneur
        equipmentContainer.innerHTML = '';
        
        if (equipment.length === 0) {
            equipmentContainer.innerHTML = '<div class="no-resources-message"><i class="fas fa-info-circle"></i> Aucun matériel disponible.</div>';
            return;
        }
        
        // Créer la liste du matériel
        equipment.forEach(equip => {
            const card = this.createResourceCard(equip);
            equipmentContainer.appendChild(card);
        });
    },
    
    /**
     * Crée une carte pour une ressource (salle, véhicule ou matériel)
     */
    createResourceCard(resource) {
        const card = document.createElement('div');
        card.className = `resource-card ${resource.status}`;
        card.dataset.id = resource.id;
        card.dataset.type = resource.type;
        
        let statusText = '';
        let statusClass = '';
        let statusIcon = '';
        
        switch (resource.status) {
            case 'available':
                statusText = 'Disponible';
                statusClass = 'available';
                statusIcon = 'check-circle';
                break;
            case 'occupied':
                statusText = resource.type === 'vehicle' ? 'En utilisation' : (resource.type === 'equipment' ? 'Emprunté' : 'Occupée');
                statusClass = 'occupied';
                statusIcon = 'clock';
                break;
            case 'maintenance':
                statusText = 'En maintenance';
                statusClass = 'maintenance';
                statusIcon = 'tools';
                break;
            default:
                statusText = 'Statut inconnu';
                statusClass = 'unknown';
                statusIcon = 'question-circle';
        }
        
        // Déterminer l'icône et les attributs spécifiques au type de ressource
        let resourceIcon = '';
        let resourceDetails = '';
        
        switch (resource.type) {
            case 'room':
                resourceIcon = '<i class="fas fa-door-open"></i>';
                resourceDetails = `<p>${resource.capacity} personnes - ${resource.location}</p>`;
                break;
            case 'vehicle':
                resourceIcon = resource.category === 'Vélo' ? '<i class="fas fa-bicycle"></i>' : '<i class="fas fa-car"></i>';
                resourceDetails = `<p>${resource.category} - ${resource.seats} places</p>`;
                break;
            case 'equipment':
                resourceIcon = '<i class="fas fa-laptop"></i>';
                resourceDetails = `<p>${resource.category}</p>`;
                break;
        }
        
        // Créer le contenu de la carte
        card.innerHTML = `
            <div class="resource-card-header">
                ${resourceIcon} <h4>${resource.name}</h4>
            </div>
            ${resourceDetails}
            <div class="resource-status ${statusClass}">
                <i class="fas fa-${statusIcon}"></i>
                ${statusText}
            </div>
        `;
        
        // Ajouter l'événement de clic
        card.addEventListener('click', () => {
            this.selectResource(resource);
        });
        
        return card;
    },
    
    /**
     * Sélectionne une ressource et affiche ses détails
     */
    selectResource(resource) {
        this.state.selectedResource = resource;
        
        // Mettre à jour la classe active des cartes
        document.querySelectorAll(`.resource-card[data-type="${resource.type}"]`).forEach(card => {
            card.classList.remove('active');
            if (card.dataset.id === resource.id) {
                card.classList.add('active');
            }
        });
        
        // Afficher les détails selon le type de ressource
        switch (resource.type) {
            case 'room':
                this.displayRoomDetails(resource);
                break;
            case 'vehicle':
                this.displayVehicleDetails(resource);
                break;
            case 'equipment':
                this.displayEquipmentDetails(resource);
                break;
        }
    },
    
    /**
     * Affiche les détails d'une salle
     */
    displayRoomDetails(room) {
        const detailsContainer = document.getElementById('room-details');
        if (!detailsContainer) return;
        
        let statusClass = '';
        let statusText = '';
        let statusIcon = '';
        
        switch (room.status) {
            case 'available':
                statusText = 'Disponible';
                statusClass = 'available';
                statusIcon = 'check-circle';
                break;
            case 'occupied':
                statusText = 'Occupée';
                statusClass = 'occupied';
                statusIcon = 'clock';
                break;
            case 'maintenance':
                statusText = 'En maintenance';
                statusClass = 'maintenance';
                statusIcon = 'tools';
                break;
            default:
                statusText = 'Statut inconnu';
                statusClass = 'unknown';
                statusIcon = 'question-circle';
        }
        
        // Récupérer les réservations pour cette salle
        const roomBookings = this.state.bookings.rooms.filter(booking => 
            booking.resourceId === room.id
        );
        
        detailsContainer.innerHTML = `
            <div class="resource-detail-header">
                <div class="resource-detail-title">
                    <h3><i class="fas fa-door-open"></i> ${room.name}</h3>
                    <p class="resource-status ${statusClass}">
                        <i class="fas fa-${statusIcon}"></i> ${statusText}
                    </p>
                </div>
                
                <div class="resource-detail-actions">
                    <button class="book-resource-btn" data-id="${room.id}" data-type="room">
                        <i class="fas fa-calendar-plus"></i> Réserver
                    </button>
                </div>
            </div>
            
            <div class="resource-detail-content">
                <div class="resource-detail-section">
                    <h4><i class="fas fa-info-circle"></i> Informations</h4>
                    <div class="resource-detail-grid">
                        <div class="resource-detail-item">
                            <span>Capacité</span>
                            <span>${room.capacity} personnes</span>
                        </div>
                        <div class="resource-detail-item">
                            <span>Emplacement</span>
                            <span>${room.location}</span>
                        </div>
                        <div class="resource-detail-item">
                            <span>Email</span>
                            <span>${room.email}</span>
                        </div>
                    </div>
                </div>
                
                <div class="resource-detail-section">
                    <h4><i class="fas fa-clipboard-list"></i> Équipements</h4>
                    <ul class="features-list">
                        ${room.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="resource-detail-section">
                    <h4><i class="fas fa-calendar-alt"></i> Réservations</h4>
                    ${this.generateBookingsListHTML(roomBookings)}
                </div>
            </div>
        `;
        
        // Attacher l'événement de réservation
        const bookButton = detailsContainer.querySelector('.book-resource-btn');
        if (bookButton) {
            bookButton.addEventListener('click', () => {
                this.showBookingForm('room', room);
            });
        }
    },
    
    /**
     * Affiche les détails d'un véhicule
     */
    displayVehicleDetails(vehicle) {
        const detailsContainer = document.getElementById('vehicle-details');
        if (!detailsContainer) return;
        
        let statusClass = '';
        let statusText = '';
        let statusIcon = '';
        
        switch (vehicle.status) {
            case 'available':
                statusText = 'Disponible';
                statusClass = 'available';
                statusIcon = 'check-circle';
                break;
            case 'occupied':
                statusText = 'En utilisation';
                statusClass = 'occupied';
                statusIcon = 'clock';
                break;
            case 'maintenance':
                statusText = 'En maintenance';
                statusClass = 'maintenance';
                statusIcon = 'tools';
                break;
            default:
                statusText = 'Statut inconnu';
                statusClass = 'unknown';
                statusIcon = 'question-circle';
        }
        
        // Récupérer les réservations pour ce véhicule
        const vehicleBookings = this.state.bookings.vehicles.filter(booking => 
            booking.resourceId === vehicle.id
        );
        
        // Déterminer l'icône selon la catégorie
        let vehicleIcon = vehicle.category === 'Vélo' ? 'bicycle' : 'car';
        
        detailsContainer.innerHTML = `
            <div class="resource-detail-header">
                <div class="resource-detail-title">
                    <h3><i class="fas fa-${vehicleIcon}"></i> ${vehicle.name}</h3>
                    <p class="resource-status ${statusClass}">
                        <i class="fas fa-${statusIcon}"></i> ${statusText}
                    </p>
                </div>
                
                <div class="resource-detail-actions">
                    <button class="book-resource-btn" data-id="${vehicle.id}" data-type="vehicle">
                        <i class="fas fa-calendar-plus"></i> Réserver
                    </button>
                </div>
            </div>
            
            <div class="resource-detail-content">
                <div class="resource-detail-section">
                    <h4><i class="fas fa-info-circle"></i> Informations</h4>
                    <div class="resource-detail-grid">
                        <div class="resource-detail-item">
                            <span>Catégorie</span>
                            <span>${vehicle.category}</span>
                        </div>
                        <div class="resource-detail-item">
                            <span>Immatriculation</span>
                            <span>${vehicle.registration}</span>
                        </div>
                        <div class="resource-detail-item">
                            <span>Places</span>
                            <span>${vehicle.seats}</span>
                        </div>
                        <div class="resource-detail-item">
                            <span>Emplacement</span>
                            <span>${vehicle.location}</span>
                        </div>
                    </div>
                </div>
                
                <div class="resource-detail-section">
                    <h4><i class="fas fa-clipboard-list"></i> Équipements</h4>
                    <ul class="features-list">
                        ${vehicle.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="resource-detail-section">
                    <h4><i class="fas fa-calendar-alt"></i> Réservations</h4>
                    ${this.generateBookingsListHTML(vehicleBookings)}
                </div>
            </div>
        `;
        
        // Attacher l'événement de réservation
        const bookButton = detailsContainer.querySelector('.book-resource-btn');
        if (bookButton) {
            bookButton.addEventListener('click', () => {
                this.showBookingForm('vehicle', vehicle);
            });
        }
    },
    
    /**
     * Affiche les détails d'un équipement
     */
    displayEquipmentDetails(equipment) {
        const detailsContainer = document.getElementById('equipment-details');
        if (!detailsContainer) return;
        
        let statusClass = '';
        let statusText = '';
        let statusIcon = '';
        
        switch (equipment.status) {
            case 'available':
                statusText = 'Disponible';
                statusClass = 'available';
                statusIcon = 'check-circle';
                break;
            case 'occupied':
                statusText = 'Emprunté';
                statusClass = 'occupied';
                statusIcon = 'clock';
                break;
            case 'maintenance':
                statusText = 'En maintenance';
                statusClass = 'maintenance';
                statusIcon = 'tools';
                break;
            default:
                statusText = 'Statut inconnu';
                statusClass = 'unknown';
                statusIcon = 'question-circle';
        }
        
        // Récupérer les réservations pour cet équipement
        const equipmentBookings = this.state.bookings.equipment.filter(booking => 
            booking.resourceId === equipment.id
        );
        
        // Déterminer l'icône selon la catégorie
        let equipmentIcon = 'laptop';
        if (equipment.category === 'Audiovisuel') equipmentIcon = 'video';
        if (equipment.category === 'Téléphonie') equipmentIcon = 'phone';
        
        detailsContainer.innerHTML = `
            <div class="resource-detail-header">
                <div class="resource-detail-title">
                    <h3><i class="fas fa-${equipmentIcon}"></i> ${equipment.name}</h3>
                    <p class="resource-status ${statusClass}">
                        <i class="fas fa-${statusIcon}"></i> ${statusText}
                    </p>
                </div>
                
                <div class="resource-detail-actions">
                    <button class="book-resource-btn" data-id="${equipment.id}" data-type="equipment">
                        <i class="fas fa-calendar-plus"></i> Réserver
                    </button>
                </div>
            </div>
            
            <div class="resource-detail-content">
                <div class="resource-detail-section">
                    <h4><i class="fas fa-info-circle"></i> Informations</h4>
                    <div class="resource-detail-grid">
                        <div class="resource-detail-item">
                            <span>Catégorie</span>
                            <span>${equipment.category}</span>
                        </div>
                        <div class="resource-detail-item">
                            <span>Numéro de série</span>
                            <span>${equipment.serialNumber}</span>
                        </div>
                        <div class="resource-detail-item">
                            <span>Emplacement</span>
                            <span>${equipment.location}</span>
                        </div>
                    </div>
                </div>
                
                <div class="resource-detail-section">
                    <h4><i class="fas fa-clipboard-list"></i> Caractéristiques</h4>
                    <ul class="features-list">
                        ${equipment.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="resource-detail-section">
                    <h4><i class="fas fa-calendar-alt"></i> Réservations</h4>
                    ${this.generateBookingsListHTML(equipmentBookings)}
                </div>
            </div>
        `;
        
        // Attacher l'événement de réservation
        const bookButton = detailsContainer.querySelector('.book-resource-btn');
        if (bookButton) {
            bookButton.addEventListener('click', () => {
                this.showBookingForm('equipment', equipment);
            });
        }
    },
    
    /**
     * Génère le HTML pour la liste des réservations
     */
    generateBookingsListHTML(bookings) {
        if (bookings.length === 0) {
            return '<p class="no-data">Aucune réservation pour le moment.</p>';
        }
        
        let html = '<div class="bookings-list">';
        
        // Trier les réservations par date
        bookings.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        
        bookings.forEach(booking => {
            const startDate = new Date(booking.startTime);
            const endDate = new Date(booking.endTime);
            
            const formattedStart = startDate.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const formattedEnd = endDate.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const now = new Date();
            let statusClass = '';
            let statusText = '';
            
            if (now < startDate) {
                statusClass = 'upcoming';
                statusText = 'À venir';
            } else if (now >= startDate && now <= endDate) {
                statusClass = 'current';
                statusText = 'En cours';
            } else {
                statusClass = 'past';
                statusText = 'Terminée';
            }
            
            html += `
                <div class="booking-item ${statusClass}">
                    <div class="booking-header">
                        <h5>${booking.subject}</h5>
                        <span class="booking-status">${statusText}</span>
                    </div>
                    <div class="booking-details">
                        <p><i class="far fa-clock"></i> ${formattedStart} - ${formattedEnd}</p>
                        <p><i class="far fa-user"></i> ${booking.organizer}</p>
                    </div>
                    ${booking.joinUrl ? `
                        <div class="booking-actions">
                            <a href="${booking.joinUrl}" target="_blank" class="join-meeting-btn">
                                <i class="fas fa-video"></i> Rejoindre la réunion
                            </a>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    },
    
    /**
     * Filtre les salles selon les critères
     */
    filterRooms(searchText, capacityFilter) {
        const filtered = this.state.resources.rooms.filter(room => {
            // Filtre par texte
            const matchesText = searchText === '' || 
                room.name.toLowerCase().includes(searchText.toLowerCase()) || 
                room.location.toLowerCase().includes(searchText.toLowerCase());
            
            // Filtre par capacité
            let matchesCapacity = true;
            if (capacityFilter !== 'all') {
                const capacity = parseInt(capacityFilter, 10);
                matchesCapacity = room.capacity >= capacity;
            }
            
            return matchesText && matchesCapacity;
        });
        
        this.displayRooms(filtered);
    },
    
    /**
     * Filtre les véhicules selon les critères
     */
    filterVehicles(searchText, typeFilter) {
        const filtered = this.state.resources.vehicles.filter(vehicle => {
            // Filtre par texte
            const matchesText = searchText === '' || 
                vehicle.name.toLowerCase().includes(searchText.toLowerCase()) || 
                vehicle.registration.toLowerCase().includes(searchText.toLowerCase());
            
            // Filtre par type
            const matchesType = typeFilter === 'all' || vehicle.category.toLowerCase() === typeFilter.toLowerCase();
            
            return matchesText && matchesType;
        });
        
        this.displayVehicles(filtered);
    },
    
    /**
     * Filtre le matériel selon les critères
     */
    filterEquipment(searchText, typeFilter) {
        const filtered = this.state.resources.equipment.filter(equipment => {
            // Filtre par texte
            const matchesText = searchText === '' || 
                equipment.name.toLowerCase().includes(searchText.toLowerCase()) || 
                equipment.serialNumber.toLowerCase().includes(searchText.toLowerCase());
            
            // Filtre par type
            const matchesType = typeFilter === 'all' || equipment.category.toLowerCase() === typeFilter.toLowerCase();
            
            return matchesText && matchesType;
        });
        
        this.displayEquipment(filtered);
    },
    
    /**
     * Met à jour la disponibilité des salles en fonction des réservations
     */
    updateRoomAvailability() {
        const now = new Date();
        
        // Parcourir toutes les salles
        this.state.resources.rooms.forEach(room => {
            // Par défaut, disponible
            room.status = 'available';
            
            // Vérifier si la salle est occupée actuellement
            const currentBooking = this.state.bookings.rooms.find(booking => 
                booking.resourceId === room.id &&
                new Date(booking.startTime) <= now &&
                new Date(booking.endTime) >= now
            );
            
            if (currentBooking) {
                room.status = 'occupied';
                room.currentBooking = currentBooking;
            } else {
                delete room.currentBooking;
            }
        });
        
        // Mettre à jour l'affichage
        this.displayRooms();
    },
    
    /**
     * Met à jour la disponibilité des véhicules en fonction des réservations
     */
    updateVehicleAvailability() {
        const now = new Date();
        
        // Parcourir tous les véhicules
        this.state.resources.vehicles.forEach(vehicle => {
            // Par défaut, disponible
            vehicle.status = 'available';
            
            // Vérifier si le véhicule est utilisé actuellement
            const currentBooking = this.state.bookings.vehicles.find(booking => 
                booking.resourceId === vehicle.id &&
                new Date(booking.startTime) <= now &&
                new Date(booking.endTime) >= now
            );
            
            if (currentBooking) {
                vehicle.status = 'occupied';
                vehicle.currentBooking = currentBooking;
            } else {
                delete vehicle.currentBooking;
            }
        });
        
        // Mettre à jour l'affichage
        this.displayVehicles();
    },
    
    /**
     * Met à jour la disponibilité du matériel en fonction des réservations
     */
    updateEquipmentAvailability() {
        const now = new Date();
        
        // Parcourir tout le matériel
        this.state.resources.equipment.forEach(equipment => {
            // Par défaut, disponible
            equipment.status = 'available';
            
            // Vérifier si le matériel est emprunté actuellement
            const currentBooking = this.state.bookings.equipment.find(booking => 
                booking.resourceId === equipment.id &&
                new Date(booking.startTime) <= now &&
                new Date(booking.endTime) >= now
            );
            
            if (currentBooking) {
                equipment.status = 'occupied';
                equipment.currentBooking = currentBooking;
            } else {
                delete equipment.currentBooking;
            }
        });
        
        // Mettre à jour l'affichage
        this.displayEquipment();
    },
    
    /**
     * Affiche le formulaire de réservation approprié
     */
    showBookingForm(resourceType, resource = null) {
        // Créer le modal
        const modal = document.createElement('div');
        modal.className = 'booking-modal';
        modal.id = 'booking-modal';
        
        let formHtml = '';
        
        // Récupérer le titre et le contenu en fonction du type de ressource
        let title = '';
        let resourceId = resource ? resource.id : '';
        let resourceName = resource ? resource.name : '';
        
        switch (resourceType) {
            case 'room':
                title = `Réserver ${resource ? resource.name : 'une salle'}`;
                formHtml = this.generateRoomBookingForm(resource);
                break;
            case 'vehicle':
                title = `Réserver ${resource ? resource.name : 'un véhicule'}`;
                formHtml = this.generateVehicleBookingForm(resource);
                break;
            case 'equipment':
                title = `Réserver ${resource ? resource.name : 'du matériel'}`;
                formHtml = this.generateEquipmentBookingForm(resource);
                break;
        }
        
        modal.innerHTML = `
            <div class="booking-modal-content">
                <div class="booking-modal-header">
                    <h2><i class="fas fa-calendar-plus"></i> ${title}</h2>
                    <button class="modal-close" id="close-booking-modal">&times;</button>
                </div>
                
                <div class="booking-modal-body">
                    <form id="${resourceType}-booking-form" class="booking-form">
                        <input type="hidden" id="booking-resource-id" value="${resourceId}">
                        <input type="hidden" id="booking-resource-type" value="${resourceType}">
                        ${formHtml}
                    </form>
                </div>
                
                <div class="booking-modal-footer">
                    <button class="cancel-button" id="cancel-booking-btn">
                        <i class="fas fa-times"></i> Annuler
                    </button>
                    <button class="create-button" id="confirm-booking-btn">
                        <i class="fas fa-check"></i> Confirmer la réservation
                    </button>
                </div>
            </div>
        `;
        
        // Ajouter le modal au document
        document.body.appendChild(modal);
        
        // Afficher le modal
        modal.style.display = 'flex';
        
        // Gestion des événements du modal
        document.getElementById('close-booking-modal').addEventListener('click', () => {
            this.closeBookingModal();
        });
        
        document.getElementById('cancel-booking-btn').addEventListener('click', () => {
            this.closeBookingModal();
        });
        
        document.getElementById('confirm-booking-btn').addEventListener('click', () => {
            this.processBooking(resourceType);
        });
        
        // Fermer le modal si on clique en dehors
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeBookingModal();
            }
        });
        
        // Initialiser les éléments spécifiques au formulaire
        this.initBookingFormElements(resourceType);
    },
    
    /**
     * Génère le HTML pour le formulaire de réservation de salle
     */
    generateRoomBookingForm(room) {
        // Récupérer date et heure courantes
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // Arrondir à la prochaine demi-heure
        let roundedMinute = 0;
        if (currentMinute < 30) {
            roundedMinute = 30;
        } else {
            roundedMinute = 0;
            now.setHours(currentHour + 1);
        }
        
        const startTime = `${String(now.getHours()).padStart(2, '0')}:${String(roundedMinute).padStart(2, '0')}`;
        
        // Calculer l'heure de fin par défaut (1h plus tard)
        now.setHours(now.getHours() + 1);
        const endTime = `${String(now.getHours()).padStart(2, '0')}:${String(roundedMinute).padStart(2, '0')}`;
        
        // Générer les options pour la liste des salles
        let roomOptions = '<option value="">Sélectionnez une salle</option>';
        this.state.resources.rooms.forEach(r => {
            if (r.status !== 'maintenance') {
                roomOptions += `<option value="${r.id}" ${room && r.id === room.id ? 'selected' : ''}>${r.name} (${r.capacity} personnes)</option>`;
            }
        });
        
        return `
            <div class="form-group">
                <label for="booking-title">Titre de la réunion</label>
                <div class="input-with-icon">
                    <i class="fas fa-heading"></i>
                    <input type="text" id="booking-title" placeholder="Entrez le titre de la réunion" required>
                </div>
            </div>
            
            <div class="form-group ${room ? 'hidden' : ''}">
                <label for="booking-room-select">Salle</label>
                <div class="input-with-icon">
                    <i class="fas fa-door-open"></i>
                    <select id="booking-room-select" ${room ? 'disabled' : 'required'}>
                        ${roomOptions}
                    </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="booking-date">Date</label>
                    <div class="input-with-icon">
                        <i class="fas fa-calendar-day"></i>
                        <input type="date" id="booking-date" value="${currentDate}" min="${currentDate}" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="booking-organizer">Organisateur</label>
                    <div class="input-with-icon">
                        <i class="fas fa-user"></i>
                        <input type="text" id="booking-organizer" value="${this.getUserName()}" required>
                    </div>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="booking-start">Heure de début</label>
                    <div class="input-with-icon">
                        <i class="fas fa-clock"></i>
                        <input type="time" id="booking-start" value="${startTime}" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="booking-end">Heure de fin</label>
                    <div class="input-with-icon">
                        <i class="fas fa-clock"></i>
                        <input type="time" id="booking-end" value="${endTime}" required>
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label>Durée</label>
                <div class="quick-duration-buttons">
                    <div class="duration-button" data-minutes="30">30 min</div>
                    <div class="duration-button active" data-minutes="60">1 heure</div>
                    <div class="duration-button" data-minutes="90">1h30</div>
                    <div class="duration-button" data-minutes="120">2 heures</div>
                </div>
            </div>
            
            <div class="form-group">
                <label for="booking-participants">Participants (emails séparés par des virgules)</label>
                <div class="input-with-icon">
                    <i class="fas fa-users"></i>
                    <input type="text" id="booking-participants" placeholder="exemple@anecoop-france.com, ...">
                </div>
            </div>
            
            <div class="form-group">
                <label for="booking-online-meeting">
                    <input type="checkbox" id="booking-online-meeting" checked>
                    Créer une réunion Teams en ligne
                </label>
            </div>
            
            <div class="form-group">
                <label for="booking-description">Description / Notes</label>
                <textarea id="booking-description" rows="3" placeholder="Description de la réunion..."></textarea>
            </div>
            
            <div class="room-availability" id="room-availability">
                <!-- Message de disponibilité rempli dynamiquement -->
            </div>
        `;
    },
    
    /**
     * Génère le HTML pour le formulaire de réservation de véhicule
     */
    generateVehicleBookingForm(vehicle) {
        // Récupérer date et heure courantes
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        
        // Générer les options pour la liste des véhicules
        let vehicleOptions = '<option value="">Sélectionnez un véhicule</option>';
        
        // Regrouper les véhicules par catégorie
        const vehiclesByCategory = {};
        this.state.resources.vehicles.forEach(v => {
            if (v.status !== 'maintenance') {
                if (!vehiclesByCategory[v.category]) {
                    vehiclesByCategory[v.category] = [];
                }
                vehiclesByCategory[v.category].push(v);
            }
        });
        
        // Créer les options avec des groupes
        Object.keys(vehiclesByCategory).sort().forEach(category => {
            vehicleOptions += `<optgroup label="${category}">`;
            vehiclesByCategory[category].forEach(v => {
                vehicleOptions += `<option value="${v.id}" ${vehicle && v.id === vehicle.id ? 'selected' : ''}>${v.name} (${v.seats} places)</option>`;
            });
            vehicleOptions += `</optgroup>`;
        });
        
        return `
            <div class="form-group">
                <label for="booking-purpose">Motif du déplacement</label>
                <div class="input-with-icon">
                    <i class="fas fa-briefcase"></i>
                    <input type="text" id="booking-purpose" placeholder="Motif du déplacement" required>
                </div>
            </div>
            
            <div class="form-group ${vehicle ? 'hidden' : ''}">
                <label for="booking-vehicle-select">Véhicule</label>
                <div class="input-with-icon">
                    <i class="fas fa-car"></i>
                    <select id="booking-vehicle-select" ${vehicle ? 'disabled' : 'required'}>
                        ${vehicleOptions}
                    </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="booking-driver">Conducteur</label>
                    <div class="input-with-icon">
                        <i class="fas fa-user"></i>
                        <input type="text" id="booking-driver" value="${this.getUserName()}" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="booking-service">Service</label>
                    <div class="input-with-icon">
                        <i class="fas fa-building"></i>
                        <select id="booking-service" required>
                            <option value="">Sélectionnez un service</option>
                            <option value="commercial">Commercial</option>
                            <option value="logistique">Logistique</option>
                            <option value="administratif">Administratif</option>
                            <option value="direction">Direction</option>
                            <option value="informatique">Informatique</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="booking-start-date">Date de départ</label>
                    <div class="input-with-icon">
                        <i class="fas fa-calendar-day"></i>
                        <input type="date" id="booking-start-date" value="${currentDate}" min="${currentDate}" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="booking-start-time">Heure de départ</label>
                    <div class="input-with-icon">
                        <i class="fas fa-clock"></i>
                        <input type="time" id="booking-start-time" required>
                    </div>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="booking-end-date">Date de retour</label>
                    <div class="input-with-icon">
                        <i class="fas fa-calendar-day"></i>
                        <input type="date" id="booking-end-date" value="${currentDate}" min="${currentDate}" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="booking-end-time">Heure de retour</label>
                    <div class="input-with-icon">
                        <i class="fas fa-clock"></i>
                        <input type="time" id="booking-end-time" required>
                    </div>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="booking-destination">Destination</label>
                    <div class="input-with-icon">
                        <i class="fas fa-map-marker-alt"></i>
                        <input type="text" id="booking-destination" placeholder="Lieu de destination" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="booking-distance">Distance estimée (km)</label>
                    <div class="input-with-icon">
                        <i class="fas fa-route"></i>
                        <input type="number" id="booking-distance" placeholder="Distance en km" min="1">
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label for="booking-passengers">Passagers</label>
                <div class="input-with-icon">
                    <i class="fas fa-users"></i>
                    <input type="text" id="booking-passengers" placeholder="Noms des passagers">
                </div>
            </div>
            
            <div class="form-group">
                <label for="booking-notes">Notes</label>
                <textarea id="booking-notes" rows="3" placeholder="Informations complémentaires..."></textarea>
            </div>
            
            <div class="vehicle-availability" id="vehicle-availability">
                <!-- Message de disponibilité rempli dynamiquement -->
            </div>
        `;
    },
    
    /**
     * Génère le HTML pour le formulaire de réservation de matériel
     */
    generateEquipmentBookingForm(equipment) {
        // Récupérer date et heure courantes
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        
        // Générer les options pour la liste du matériel
        let equipmentOptions = '<option value="">Sélectionnez un équipement</option>';
        
        // Regrouper le matériel par catégorie
        const equipmentByCategory = {};
        this.state.resources.equipment.forEach(e => {
            if (e.status !== 'maintenance') {
                if (!equipmentByCategory[e.category]) {
                    equipmentByCategory[e.category] = [];
                }
                equipmentByCategory[e.category].push(e);
            }
        });
        
        // Créer les options avec des groupes
        Object.keys(equipmentByCategory).sort().forEach(category => {
            equipmentOptions += `<optgroup label="${category}">`;
            equipmentByCategory[category].forEach(e => {
                equipmentOptions += `<option value="${e.id}" ${equipment && e.id === equipment.id ? 'selected' : ''}>${e.name} (${e.serialNumber})</option>`;
            });
            equipmentOptions += `</optgroup>`;
        });
        
        return `
            <div class="form-group">
                <label for="booking-purpose">Motif d'emprunt</label>
                <div class="input-with-icon">
                    <i class="fas fa-clipboard"></i>
                    <input type="text" id="booking-purpose" placeholder="Motif d'emprunt" required>
                </div>
            </div>
            
            <div class="form-group ${equipment ? 'hidden' : ''}">
                <label for="booking-equipment-select">Équipement</label>
                <div class="input-with-icon">
                    <i class="fas fa-laptop"></i>
                    <select id="booking-equipment-select" ${equipment ? 'disabled' : 'required'}>
                        ${equipmentOptions}
                    </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="booking-borrower">Emprunteur</label>
                    <div class="input-with-icon">
                        <i class="fas fa-user"></i>
                        <input type="text" id="booking-borrower" value="${this.getUserName()}" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="booking-service">Service</label>
                    <div class="input-with-icon">
                        <i class="fas fa-building"></i>
                        <select id="booking-service" required>
                            <option value="">Sélectionnez un service</option>
                            <option value="commercial">Commercial</option>
                            <option value="logistique">Logistique</option>
                            <option value="administratif">Administratif</option>
                            <option value="direction">Direction</option>
                            <option value="informatique">Informatique</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="booking-start-date">Date d'emprunt</label>
                    <div class="input-with-icon">
                        <i class="fas fa-calendar-day"></i>
                        <input type="date" id="booking-start-date" value="${currentDate}" min="${currentDate}" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="booking-start-time">Heure d'emprunt</label>
                    <div class="input-with-icon">
                        <i class="fas fa-clock"></i>
                        <input type="time" id="booking-start-time" required>
                    </div>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="booking-end-date">Date de retour</label>
                    <div class="input-with-icon">
                        <i class="fas fa-calendar-day"></i>
                        <input type="date" id="booking-end-date" value="${currentDate}" min="${currentDate}" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="booking-end-time">Heure de retour</label>
                    <div class="input-with-icon">
                        <i class="fas fa-clock"></i>
                        <input type="time" id="booking-end-time" required>
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label for="booking-usage-location">Lieu d'utilisation</label>
                <div class="input-with-icon">
                    <i class="fas fa-map-marker-alt"></i>
                    <input type="text" id="booking-usage-location" placeholder="Lieu d'utilisation du matériel" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="booking-notes">Notes</label>
                <textarea id="booking-notes" rows="3" placeholder="Informations complémentaires..."></textarea>
            </div>
            
            <div class="equipment-availability" id="equipment-availability">
                <!-- Message de disponibilité rempli dynamiquement -->
            </div>
        `;
    },
    
    /**
     * Initialise les éléments spécifiques au formulaire de réservation
     */
    initBookingFormElements(resourceType) {
        // Initialiser l'heure actuelle
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // Arrondir à la prochaine demi-heure
        let roundedMinute = 0;
        if (currentMinute < 30) {
            roundedMinute = 30;
        } else {
            roundedMinute = 0;
            now.setHours(currentHour + 1);
        }
        
        const startTime = `${String(now.getHours()).padStart(2, '0')}:${String(roundedMinute).padStart(2, '0')}`;
        
        // Calculer l'heure de fin par défaut (2h plus tard pour véhicules et matériel, 1h pour salles)
        const defaultDuration = resourceType === 'room' ? 1 : 2;
        now.setHours(now.getHours() + defaultDuration);
        const endTime = `${String(now.getHours()).padStart(2, '0')}:${String(roundedMinute).padStart(2, '0')}`;
        
        // Appliquer les heures par défaut
        const startTimeInput = document.getElementById('booking-start-time') || document.getElementById('booking-start');
        const endTimeInput = document.getElementById('booking-end-time') || document.getElementById('booking-end');
        
        if (startTimeInput) startTimeInput.value = startTime;
        if (endTimeInput) endTimeInput.value = endTime;
        
        // Gérer les boutons de durée pour les salles
        if (resourceType === 'room') {
            const durationButtons = document.querySelectorAll('.duration-button');
            durationButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Désactiver tous les boutons
                    durationButtons.forEach(btn => btn.classList.remove('active'));
                    
                    // Activer le bouton cliqué
                    button.classList.add('active');
                    
                    // Mettre à jour l'heure de fin
                    const minutes = parseInt(button.dataset.minutes);
                    this.updateEndTimeFromDuration(minutes);
                });
            });
        }
        
        // Gérer les changements de sélection de ressource
        switch (resourceType) {
            case 'room':
                const roomSelect = document.getElementById('booking-room-select');
                if (roomSelect) {
                    roomSelect.addEventListener('change', () => {
                        this.updateRoomAvailabilityMessage();
                    });
                }
                break;
                
            case 'vehicle':
                const vehicleSelect = document.getElementById('booking-vehicle-select');
                if (vehicleSelect) {
                    vehicleSelect.addEventListener('change', () => {
                        this.updateVehicleAvailabilityMessage();
                    });
                }
                break;
                
            case 'equipment':
                const equipmentSelect = document.getElementById('booking-equipment-select');
                if (equipmentSelect) {
                    equipmentSelect.addEventListener('change', () => {
                        this.updateEquipmentAvailabilityMessage();
                    });
                }
                break;
        }
        
        // Gérer les changements de date et d'heure pour vérifier la disponibilité
        const dateInputs = document.querySelectorAll('input[type="date"]');
        const timeInputs = document.querySelectorAll('input[type="time"]');
        
        dateInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateAvailabilityMessage(resourceType);
            });
        });
        
        timeInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateAvailabilityMessage(resourceType);
            });
        });
        
        // Vérifier la disponibilité initiale
        setTimeout(() => {
            this.updateAvailabilityMessage(resourceType);
        }, 300);
    },
    
    /**
     * Met à jour l'heure de fin en fonction de la durée
     */
    updateEndTimeFromDuration(durationMinutes) {
        const startTimeInput = document.getElementById('booking-start');
        const endTimeInput = document.getElementById('booking-end');
        const dateInput = document.getElementById('booking-date');
        
        if (!startTimeInput || !endTimeInput || !dateInput || !startTimeInput.value) return;
        
        const selectedDate = dateInput.value;
        const [startHours, startMinutes] = startTimeInput.value.split(':').map(Number);
        
        const startDateTime = new Date(selectedDate);
        startDateTime.setHours(startHours, startMinutes);
        
        const endDateTime = new Date(startDateTime);
        endDateTime.setMinutes(endDateTime.getMinutes() + durationMinutes);
        
        endTimeInput.value = `${String(endDateTime.getHours()).padStart(2, '0')}:${String(endDateTime.getMinutes()).padStart(2, '0')}`;
        
        // Vérifier la disponibilité
        this.updateRoomAvailabilityMessage();
    },
    
    /**
     * Met à jour le message de disponibilité selon le type de ressource
     */
    updateAvailabilityMessage(resourceType) {
        switch (resourceType) {
            case 'room':
                this.updateRoomAvailabilityMessage();
                break;
            case 'vehicle':
                this.updateVehicleAvailabilityMessage();
                break;
            case 'equipment':
                this.updateEquipmentAvailabilityMessage();
                break;
        }
    },
    
    /**
     * Met à jour le message de disponibilité d'une salle
     */
    updateRoomAvailabilityMessage() {
        const roomSelect = document.getElementById('booking-room-select');
        const availabilityDiv = document.getElementById('room-availability');
        const startTimeInput = document.getElementById('booking-start');
        const endTimeInput = document.getElementById('booking-end');
        const dateInput = document.getElementById('booking-date');
        
        if (!availabilityDiv) return;
        
        // Déterminer la salle sélectionnée
        let roomId = document.getElementById('booking-resource-id').value;
        if (!roomId && roomSelect) {
            roomId = roomSelect.value;
        }
        
        if (!roomId || !dateInput || !startTimeInput || !endTimeInput) {
            availabilityDiv.innerHTML = '';
            return;
        }
        
        const selectedDate = dateInput.value;
        const startTime = startTimeInput.value;
        const endTime = endTimeInput.value;
        
        if (!selectedDate || !startTime || !endTime) {
            availabilityDiv.innerHTML = '';
            return;
        }
        
        // Afficher un indicateur de chargement
        availabilityDiv.innerHTML = '<div class="modal-loading"><i class="fas fa-circle-notch fa-spin"></i> Vérification de la disponibilité...</div>';
        
        // Convertir en objets Date
        const startDateTime = new Date(`${selectedDate}T${startTime}`);
        const endDateTime = new Date(`${selectedDate}T${endTime}`);
        
        // Vérifier que l'heure de fin est après l'heure de début
        if (endDateTime <= startDateTime) {
            availabilityDiv.innerHTML = `
                <div class="occupied">
                    <i class="fas fa-exclamation-triangle"></i>
                    L'heure de fin doit être après l'heure de début.
                </div>
            `;
            return;
        }
        
        // Vérifier les conflits
        let isAvailable = true;
        let conflictingBooking = null;
        
        // Filtrer les réservations de la même salle
        const roomBookings = this.state.bookings.rooms.filter(booking => 
            booking.resourceId === roomId
        );
        
        // Vérifier chaque réservation pour un conflit
        for (const booking of roomBookings) {
            const bookingStart = new Date(booking.startTime);
            const bookingEnd = new Date(booking.endTime);
            
            // Vérifier si les plages horaires se chevauchent
            if ((startDateTime >= bookingStart && startDateTime < bookingEnd) || 
                (endDateTime > bookingStart && endDateTime <= bookingEnd) ||
                (startDateTime <= bookingStart && endDateTime >= bookingEnd)) {
                isAvailable = false;
                conflictingBooking = booking;
                break;
            }
        }
        
        // Afficher le résultat
        if (isAvailable) {
            availabilityDiv.innerHTML = `
                <div class="available">
                    <i class="fas fa-check-circle"></i> 
                    Salle disponible pour cette période
                </div>
            `;
        } else {
            const conflictStart = new Date(conflictingBooking.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            const conflictEnd = new Date(conflictingBooking.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            availabilityDiv.innerHTML = `
                <div class="occupied">
                    <i class="fas fa-times-circle"></i> 
                    Salle déjà réservée (${conflictStart} - ${conflictEnd} : ${conflictingBooking.subject})
                </div>
            `;
        }
    },
    
    /**
     * Met à jour le message de disponibilité d'un véhicule
     */
    updateVehicleAvailabilityMessage() {
        const vehicleSelect = document.getElementById('booking-vehicle-select');
        const availabilityDiv = document.getElementById('vehicle-availability');
        const startDateInput = document.getElementById('booking-start-date');
        const startTimeInput = document.getElementById('booking-start-time');
        const endDateInput = document.getElementById('booking-end-date');
        const endTimeInput = document.getElementById('booking-end-time');
        
        if (!availabilityDiv) return;
        
        // Déterminer le véhicule sélectionné
        let vehicleId = document.getElementById('booking-resource-id').value;
        if (!vehicleId && vehicleSelect) {
            vehicleId = vehicleSelect.value;
        }
        
        if (!vehicleId || !startDateInput || !startTimeInput || !endDateInput || !endTimeInput) {
            availabilityDiv.innerHTML = '';
            return;
        }
        
        const startDate = startDateInput.value;
        const startTime = startTimeInput.value;
        const endDate = endDateInput.value;
        const endTime = endTimeInput.value;
        
        if (!startDate || !startTime || !endDate || !endTime) {
            availabilityDiv.innerHTML = '';
            return;
        }
        
        // Afficher un indicateur de chargement
        availabilityDiv.innerHTML = '<div class="modal-loading"><i class="fas fa-circle-notch fa-spin"></i> Vérification de la disponibilité...</div>';
        
        // Convertir en objets Date
        const startDateTime = new Date(`${startDate}T${startTime}`);
        const endDateTime = new Date(`${endDate}T${endTime}`);
        
        // Vérifier que l'heure de fin est après l'heure de début
        if (endDateTime <= startDateTime) {
            availabilityDiv.innerHTML = `
                <div class="occupied">
                    <i class="fas fa-exclamation-triangle"></i>
                    L'heure de retour doit être après l'heure de départ.
                </div>
            `;
            return;
        }
        
        // Vérifier les conflits
        let isAvailable = true;
        let conflictingBooking = null;
        
        // Filtrer les réservations du même véhicule
        const vehicleBookings = this.state.bookings.vehicles.filter(booking => 
            booking.resourceId === vehicleId
        );
        
        // Vérifier chaque réservation pour un conflit
        for (const booking of vehicleBookings) {
            const bookingStart = new Date(booking.startTime);
            const bookingEnd = new Date(booking.endTime);
            
            // Vérifier si les plages horaires se chevauchent
            if ((startDateTime >= bookingStart && startDateTime < bookingEnd) || 
                (endDateTime > bookingStart && endDateTime <= bookingEnd) ||
                (startDateTime <= bookingStart && endDateTime >= bookingEnd)) {
                isAvailable = false;
                conflictingBooking = booking;
                break;
            }
        }
        
        // Afficher le résultat
        if (isAvailable) {
            availabilityDiv.innerHTML = `
                <div class="available">
                    <i class="fas fa-check-circle"></i> 
                    Véhicule disponible pour cette période
                </div>
            `;
        } else {
            const conflictStart = new Date(conflictingBooking.startTime).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const conflictEnd = new Date(conflictingBooking.endTime).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            availabilityDiv.innerHTML = `
                <div class="occupied">
                    <i class="fas fa-times-circle"></i> 
                    Véhicule déjà réservé (${conflictStart} - ${conflictEnd} : ${conflictingBooking.subject})
                </div>
            `;
        }
    },
    
    /**
     * Met à jour le message de disponibilité d'un équipement
     */
    updateEquipmentAvailabilityMessage() {
        const equipmentSelect = document.getElementById('booking-equipment-select');
        const availabilityDiv = document.getElementById('equipment-availability');
        const startDateInput = document.getElementById('booking-start-date');
        const startTimeInput = document.getElementById('booking-start-time');
        const endDateInput = document.getElementById('booking-end-date');
        const endTimeInput = document.getElementById('booking-end-time');
        
        if (!availabilityDiv) return;
        
        // Déterminer l'équipement sélectionné
        let equipmentId = document.getElementById('booking-resource-id').value;
        if (!equipmentId && equipmentSelect) {
            equipmentId = equipmentSelect.value;
        }
        
        if (!equipmentId || !startDateInput || !startTimeInput || !endDateInput || !endTimeInput) {
            availabilityDiv.innerHTML = '';
            return;
        }
        
        const startDate = startDateInput.value;
        const startTime = startTimeInput.value;
        const endDate = endDateInput.value;
        const endTime = endTimeInput.value;
        
        if (!startDate || !startTime || !endDate || !endTime) {
            availabilityDiv.innerHTML = '';
            return;
        }
        
        // Afficher un indicateur de chargement
        availabilityDiv.innerHTML = '<div class="modal-loading"><i class="fas fa-circle-notch fa-spin"></i> Vérification de la disponibilité...</div>';
        
        // Convertir en objets Date
        const startDateTime = new Date(`${startDate}T${startTime}`);
        const endDateTime = new Date(`${endDate}T${endTime}`);
        
        // Vérifier que l'heure de fin est après l'heure de début
        if (endDateTime <= startDateTime) {
            availabilityDiv.innerHTML = `
                <div class="occupied">
                    <i class="fas fa-exclamation-triangle"></i>
                    L'heure de retour doit être après l'heure d'emprunt.
                </div>
            `;
            return;
        }
        
        // Vérifier les conflits
        let isAvailable = true;
        let conflictingBooking = null;
        
        // Filtrer les réservations du même équipement
        const equipmentBookings = this.state.bookings.equipment.filter(booking => 
            booking.resourceId === equipmentId
        );
        
        // Vérifier chaque réservation pour un conflit
        for (const booking of equipmentBookings) {
            const bookingStart = new Date(booking.startTime);
            const bookingEnd = new Date(booking.endTime);
            
            // Vérifier si les plages horaires se chevauchent
            if ((startDateTime >= bookingStart && startDateTime < bookingEnd) || 
                (endDateTime > bookingStart && endDateTime <= bookingEnd) ||
                (startDateTime <= bookingStart && endDateTime >= bookingEnd)) {
                isAvailable = false;
                conflictingBooking = booking;
                break;
            }
        }
