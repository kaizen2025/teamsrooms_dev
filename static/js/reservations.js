// À ajouter dans un nouveau fichier static/js/reservations.js

/**
 * Système complet de gestion des réservations (salles, véhicules, matériels)
 */
const ReservationSystem = {
    // État du système
    state: {
        rooms: [],
        vehicles: [],
        equipment: [],
        activeTab: 'room-booking',
        selectedResource: null,
        currentDate: new Date()
    },
    
    /**
     * Initialise le système de réservation
     */
    init() {
        // Charger les données
        this.loadRooms();
        this.loadVehicles();
        this.loadEquipment();
        
        // Initialiser les onglets
        this.initTabs();
        
        // Initialiser les filtres
        this.initFilters();
        
        console.log("Système de réservation initialisé");
    },
    
    /**
     * Initialise les onglets de réservation
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
                
                // Afficher le contenu correspondant
                const tabId = tab.dataset.tab;
                this.state.activeTab = tabId;
                
                document.querySelectorAll('.reservation-tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });
    },
    
    /**
     * Initialise les filtres de ressources
     */
    initFilters() {
        // Filtre des salles
        const roomFilter = document.getElementById('roomFilter');
        if (roomFilter) {
            roomFilter.addEventListener('input', () => {
                this.filterRooms(roomFilter.value, document.getElementById('roomCapacityFilter').value);
            });
        }
        
        const roomCapacityFilter = document.getElementById('roomCapacityFilter');
        if (roomCapacityFilter) {
            roomCapacityFilter.addEventListener('change', () => {
                this.filterRooms(roomFilter.value, roomCapacityFilter.value);
            });
        }
        
        // Filtre des véhicules
        const vehicleFilter = document.getElementById('vehicleFilter');
        if (vehicleFilter) {
            vehicleFilter.addEventListener('input', () => {
                this.filterVehicles(vehicleFilter.value, document.getElementById('vehicleTypeFilter').value);
            });
        }
        
        const vehicleTypeFilter = document.getElementById('vehicleTypeFilter');
        if (vehicleTypeFilter) {
            vehicleTypeFilter.addEventListener('change', () => {
                this.filterVehicles(vehicleFilter.value, vehicleTypeFilter.value);
            });
        }
        
        // Filtre des équipements
        const equipmentFilter = document.getElementById('equipmentFilter');
        if (equipmentFilter) {
            equipmentFilter.addEventListener('input', () => {
                this.filterEquipment(equipmentFilter.value, document.getElementById('equipmentTypeFilter').value);
            });
        }
        
        const equipmentTypeFilter = document.getElementById('equipmentTypeFilter');
        if (equipmentTypeFilter) {
            equipmentTypeFilter.addEventListener('change', () => {
                this.filterEquipment(equipmentFilter.value, equipmentTypeFilter.value);
            });
        }
    },
    
    /**
     * Charge les salles disponibles
     */
    async loadRooms() {
        try {
            // Dans une version réelle, ces données viendraient d'une API ou d'un fichier JSON
            // Ici, nous simulons avec des données statiques
            this.state.rooms = [
                {
                    id: 'canigou',
                    name: 'Canigou',
                    email: 'Sallecanigou@anecoop-france.com',
                    capacity: 12,
                    floor: 'RDC',
                    equipment: ['Vidéoprojecteur', 'Visioconférence', 'Tableau blanc'],
                    status: 'available',
                    description: 'Grande salle de réunion avec vue sur l\'extérieur'
                },
                {
                    id: 'castillet',
                    name: 'Castillet',
                    email: 'Sallecastillet@anecoop-france.com',
                    capacity: 8,
                    floor: '1er étage',
                    equipment: ['Écran tactile', 'Visioconférence'],
                    status: 'occupied',
                    description: 'Salle de réunion moyenne équipée pour la visioconférence'
                },
                {
                    id: 'tramontane',
                    name: 'Tramontane',
                    email: 'Salletramontane@anecoop-france.com',
                    capacity: 6,
                    floor: '2ème étage',
                    equipment: ['Tableau blanc', 'Téléphone'],
                    status: 'available',
                    description: 'Salle de réunion moyenne pour réunions internes'
                },
                {
                    id: 'massane',
                    name: 'Massane',
                    email: 'Sallemassane@anecoop-france.com',
                    capacity: 4,
                    floor: '2ème étage',
                    equipment: ['Écran', 'Téléphone'],
                    status: 'maintenance',
                    description: 'Petite salle pour réunions restreintes'
                }
            ];
            
            // Afficher les salles
            this.displayRooms();
        } catch (error) {
            console.error('Erreur lors du chargement des salles:', error);
        }
    },
    
    /**
     * Affiche les salles dans la grille
     */
    displayRooms(filtered = null) {
        const roomsGrid = document.getElementById('roomsGrid');
        if (!roomsGrid) return;
        
        // Utiliser les salles filtrées ou toutes les salles
        const rooms = filtered || this.state.rooms;
        
        // Vider la grille
        roomsGrid.innerHTML = '';
        
        if (rooms.length === 0) {
            roomsGrid.innerHTML = '<p class="empty-message">Aucune salle ne correspond aux critères.</p>';
            return;
        }
        
        // Créer la carte pour chaque salle
        rooms.forEach(room => {
            const card = document.createElement('div');
            card.className = 'resource-card';
            card.dataset.id = room.id;
            
            // Ajouter la classe active si cette salle est sélectionnée
            if (this.state.selectedResource?.id === room.id && this.state.activeTab === 'room-booking') {
                card.classList.add('active');
            }
            
            let statusText = '';
            let statusClass = '';
            
            switch (room.status) {
                case 'available':
                    statusText = 'Disponible';
                    statusClass = 'available';
                    break;
                case 'occupied':
                    statusText = 'Occupée';
                    statusClass = 'occupied';
                    break;
                case 'maintenance':
                    statusText = 'En maintenance';
                    statusClass = 'maintenance';
                    break;
                default:
                    statusText = 'Statut inconnu';
            }
            
            card.innerHTML = `
                <h4>${room.name}</h4>
                <p>${room.capacity} personnes - ${room.floor}</p>
                <div class="resource-status ${statusClass}">
                    <i class="fas ${statusClass === 'available' ? 'fa-check-circle' : statusClass === 'occupied' ? 'fa-clock' : 'fa-tools'}"></i>
                    ${statusText}
                </div>
            `;
            
            // Ajouter l'événement de clic
            card.addEventListener('click', () => {
                this.selectRoom(room);
            });
            
            roomsGrid.appendChild(card);
        });
    },
    
    /**
     * Filtre les salles selon les critères
     */
    filterRooms(searchText, capacityFilter) {
        const filtered = this.state.rooms.filter(room => {
            // Filtre par texte
            const matchesText = searchText === '' || 
                room.name.toLowerCase().includes(searchText.toLowerCase()) || 
                room.description.toLowerCase().includes(searchText.toLowerCase());
            
            // Filtre par capacité
            let matchesCapacity = true;
            if (capacityFilter !== 'all') {
                switch (capacityFilter) {
                    case 'small':
                        matchesCapacity = room.capacity <= 4;
                        break;
                    case 'medium':
                        matchesCapacity = room.capacity > 4 && room.capacity <= 10;
                        break;
                    case 'large':
                        matchesCapacity = room.capacity > 10;
                        break;
                }
            }
            
            return matchesText && matchesCapacity;
        });
        
        this.displayRooms(filtered);
    },
    
    /**
     * Sélectionne une salle et affiche ses détails
     */
    selectRoom(room) {
        this.state.selectedResource = room;
        
        // Mettre à jour la classe active des cartes
        document.querySelectorAll('#roomsGrid .resource-card').forEach(card => {
            card.classList.remove('active');
            if (card.dataset.id === room.id) {
                card.classList.add('active');
            }
        });
        
        // Afficher les détails
        const detailsSection = document.getElementById('roomDetails');
        if (!detailsSection) return;
        
        let statusText = '';
        let statusClass = '';
        
        switch (room.status) {
            case 'available':
                statusText = 'Disponible';
                statusClass = 'available';
                break;
            case 'occupied':
                statusText = 'Occupée';
                statusClass = 'occupied';
                break;
            case 'maintenance':
                statusText = 'En maintenance';
                statusClass = 'maintenance';
                break;
            default:
                statusText = 'Statut inconnu';
        }
        
        detailsSection.innerHTML = `
            <div class="resource-detail-header">
                <div class="resource-detail-title">
                    <h3>${room.name}</h3>
                    <p class="resource-status ${statusClass}">
                        <i class="fas ${statusClass === 'available' ? 'fa-check-circle' : statusClass === 'occupied' ? 'fa-clock' : 'fa-tools'}"></i>
                        ${statusText}
                    </p>
                </div>
                
                <div class="resource-detail-actions">
                    <button class="btn-primary" onclick="ReservationSystem.showBookRoomForm('${room.id}')">
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
                            <span>Étage</span>
                            <span>${room.floor}</span>
                        </div>
                        <div class="resource-detail-item">
                            <span>Email</span>
                            <span>${room.email}</span>
                        </div>
                    </div>
                </div>
                
                <div class="resource-detail-section">
                    <h4><i class="fas fa-tools"></i> Équipements</h4>
                    <ul>
                        ${room.equipment.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="resource-detail-section">
                    <h4><i class="fas fa-calendar-alt"></i> Disponibilité</h4>
                    <div class="availability-calendar">
                        <div class="calendar-header">
                            <h5>Mars 2025</h5>
                            <div class="calendar-navigation">
                                <button><i class="fas fa-chevron-left"></i></button>
                                <button><i class="fas fa-chevron-right"></i></button>
                            </div>
                        </div>
                        
                        <div class="calendar-days">
                            <div class="calendar-day-header">L</div>
                            <div class="calendar-day-header">M</div>
                            <div class="calendar-day-header">M</div>
                            <div class="calendar-day-header">J</div>
                            <div class="calendar-day-header">V</div>
                            <div class="calendar-day-header">S</div>
                            <div class="calendar-day-header">D</div>
                            
                            <!-- Jours d'exemple (à générer dynamiquement) -->
                            ${this.generateCalendarDays()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * Génère les jours du calendrier pour le mois en cours
     */
    generateCalendarDays() {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        // Premier jour du mois
        const firstDay = new Date(currentYear, currentMonth, 1);
        // Dernier jour du mois
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        
        // Jour de la semaine du premier jour (0 = dimanche, 1 = lundi, ..., 6 = samedi)
        let startingDay = firstDay.getDay() - 1;
        if (startingDay < 0) startingDay = 6; // Ajustement pour commencer par lundi
        
        // Nombre total de jours dans le mois
        const totalDays = lastDay.getDate();
        
        let html = '';
        
        // Jours vides pour commencer
        for (let i = 0; i < startingDay; i++) {
            html += `<div class="calendar-day disabled"></div>`;
        }
        
        // Générer tous les jours du mois
        for (let day = 1; day <= totalDays; day++) {
            const isToday = day === currentDate.getDate();
            const hasEvents = Math.random() > 0.6; // Simuler des événements
            const isDisabled = day < currentDate.getDate(); // Jours passés
            
            html += `
                <div class="calendar-day ${isToday ? 'active' : ''} ${isDisabled ? 'disabled' : ''} ${hasEvents ? 'has-events' : ''}">
                    <span class="calendar-day-number">${day}</span>
                </div>
            `;
        }
        
        return html;
    },
    
    /**
     * Affiche le formulaire de réservation de salle
     */
    showBookRoomForm(roomId) {
        const room = this.state.rooms.find(r => r.id === roomId);
        if (!room) return;
        
        // Créer le modal
        const modal = document.createElement('div');
        modal.className = 'booking-modal';
        modal.id = 'resourceBookingModal';
        
        // Récupérer date et heure courantes
        const now = new Date();
        const currentDate = now.toISOString().substr(0, 10);
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
        
        modal.innerHTML = `
            <div class="booking-modal-content">
                <div class="booking-modal-header">
                    <h2><i class="fas fa-calendar-plus"></i> Réserver ${room.name}</h2>
                    <button class="modal-close" id="closeBookingModalBtn">&times;</button>
                </div>
                
                <div class="booking-modal-body">
                    <form class="booking-form" id="roomBookingForm">
                        <input type="hidden" id="booking-room-id" value="${room.id}">
                        
                        <div class="form-group">
                            <label for="booking-title">Titre de la réservation</label>
                            <div class="input-with-icon">
                                <input type="text" id="booking-title" placeholder="Entrez le titre de la réunion" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="booking-date">Date</label>
                                <div class="input-with-icon">
                                    <input type="date" id="booking-date" value="${currentDate}" min="${currentDate}" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="booking-organizer">Organisateur</label>
                                <div class="input-with-icon">
                                    <input type="text" id="booking-organizer" value="Votre nom" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="booking-start">Heure de début</label>
                                <div class="input-with-icon">
                                    <input type="time" id="booking-start" value="${startTime}" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="booking-end">Heure de fin</label>
                                <div class="input-with-icon">
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
                                <input type="text" id="booking-participants" placeholder="exemple@anecoop-france.com, ...">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="booking-description">Description / Notes</label>
                            <textarea id="booking-description" rows="3" placeholder="Description de la réunion..."></textarea>
                        </div>
                        
                        <div class="room-availability" id="room-availability">
                            <!-- Message de disponibilité rempli dynamiquement -->
                        </div>
                    </form>
                </div>
                
                <div class="booking-modal-footer">
                    <button class="cancel-button" id="cancelRoomBookingBtn">
                        <i class="fas fa-times"></i> Annuler
                    </button>
                    <button class="create-button" id="confirmRoomBookingBtn">
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
        document.getElementById('closeBookingModalBtn').addEventListener('click', () => {
            this.closeBookingModal();
        });
        
        document.getElementById('cancelRoomBookingBtn').addEventListener('click', () => {
            this.closeBookingModal();
        });
        
        document.getElementById('confirmRoomBookingBtn').addEventListener('click', () => {
            this.bookRoom();
        });
        
        // Gestion des boutons de durée
        document.querySelectorAll('.duration-button').forEach(button => {
            button.addEventListener('click', () => {
                // Désactiver tous les boutons
                document.querySelectorAll('.duration-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Activer le bouton cliqué
                button.classList.add('active');
                
                // Mettre à jour l'heure de fin
                const minutes = parseInt(button.dataset.minutes);
                this.updateEndTimeFromDuration(minutes);
            });
        });
        
        // Fermer le modal si on clique en dehors
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeBookingModal();
            }
        });
    },
    
    /**
     * Ferme le modal de réservation
     */
    closeBookingModal() {
        const modal = document.getElementById('resourceBookingModal');
        if (modal) {
            modal.remove();
        }
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
    },
    
    /**
     * Effectue la réservation de la salle
     */
    async bookRoom() {
        const formData = {
            roomId: document.getElementById('booking-room-id').value,
            title: document.getElementById('booking-title').value,
            date: document.getElementById('booking-date').value,
            startTime: document.getElementById('booking-start').value,
            endTime: document.getElementById('booking-end').value,
            organizer: document.getElementById('booking-organizer').value,
            participants: document.getElementById('booking-participants').value.split(',').map(p => p.trim()),
            description: document.getElementById('booking-description').value
        };
        
        // Validation simple
        if (!formData.title || !formData.date || !formData.startTime || !formData.endTime) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        
        try {
            // Simuler un appel API
            console.log('Réservation de salle:', formData);
            
            // Dans une version réelle, on enverrait ces données à une API
            // await fetch('/api/book-room', { method: 'POST', body: JSON.stringify(formData) });
            
            // Pour la démo, simuler un délai
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Fermer le modal
            this.closeBookingModal();
            
            // Afficher un message de succès
            if (typeof UISystem !== 'undefined' && UISystem.showNotification) {
                UISystem.showNotification('Réservation effectuée avec succès', 'success');
            } else {
                alert('Réservation effectuée avec succès !');
            }
            
            // Rafraîchir l'affichage
            // Dans un cas réel, on rechargerait les données depuis le serveur
            const room = this.state.rooms.find(r => r.id === formData.roomId);
            if (room) {
                room.status = 'occupied';
                this.displayRooms();
                
                // Si la salle est toujours sélectionnée, mettre à jour l'affichage détaillé
                if (this.state.selectedResource?.id === formData.roomId) {
                    this.selectRoom(room);
                }
            }
        } catch (error) {
            console.error('Erreur lors de la réservation:', error);
            alert('Une erreur est survenue lors de la réservation. Veuillez réessayer.');
        }
    },
    
    /**
     * Charge les véhicules disponibles
     */
    async loadVehicles() {
        try {
            // Dans une version réelle, ces données viendraient d'une API ou d'un fichier JSON
            this.state.vehicles = [
                {
                    id: 'car1',
                    name: 'Renault Clio',
                    type: 'car',
                    registration: 'AB-123-CD',
                    seats: 5,
                    features: ['GPS', 'Climatisation'],
                    status: 'available',
                    location: 'Parking principal',
                    description: 'Véhicule compact pour déplacements urbains'
                },
                {
                    id: 'car2',
                    name: 'Peugeot 3008',
                    type: 'car',
                    registration: 'EF-456-GH',
                    seats: 5,
                    features: ['GPS', 'Climatisation', 'Bluetooth'],
                    status: 'occupied',
                    location: 'Parking externe',
                    description: 'SUV pour déplacements longue distance'
                },
                {
                    id: 'van1',
                    name: 'Renault Trafic',
                    type: 'van',
                    registration: 'IJ-789-KL',
                    seats: 3,
                    features: ['GPS', 'Climatisation', 'Bluetooth'],
                    status: 'available',
                    location: 'Parking principal',
                    description: 'Utilitaire pour transport de marchandises'
                }
            ];
            
            // Afficher les véhicules
            this.displayVehicles();
        } catch (error) {
            console.error('Erreur lors du chargement des véhicules:', error);
        }
    },
    
    /**
     * Affiche les véhicules dans la grille
     */
    displayVehicles(filtered = null) {
        const vehiclesGrid = document.getElementById('vehiclesGrid');
        if (!vehiclesGrid) return;
        
        // Utiliser les véhicules filtrés ou tous les véhicules
        const vehicles = filtered || this.state.vehicles;
        
        // Vider la grille
        vehiclesGrid.innerHTML = '';
        
        if (vehicles.length === 0) {
            vehiclesGrid.innerHTML = '<p class="empty-message">Aucun véhicule ne correspond aux critères.</p>';
            return;
        }
        
        // Créer la carte pour chaque véhicule
        vehicles.forEach(vehicle => {
            const card = document.createElement('div');
            card.className = 'resource-card';
            card.dataset.id = vehicle.id;
            
            // Ajouter la classe active si ce véhicule est sélectionné
            if (this.state.selectedResource?.id === vehicle.id && this.state.activeTab === 'vehicle-booking') {
                card.classList.add('active');
            }
            
            let statusText = '';
            let statusClass = '';
            
            switch (vehicle.status) {
                case 'available':
                    statusText = 'Disponible';
                    statusClass = 'available';
                    break;
                case 'occupied':
                    statusText = 'En utilisation';
                    statusClass = 'occupied';
                    break;
                case 'maintenance':
                    statusText = 'En maintenance';
                    statusClass = 'maintenance';
                    break;
                default:
                    statusText = 'Statut inconnu';
            }
            
            card.innerHTML = `
                <h4>${vehicle.name}</h4>
                <p>${vehicle.type === 'car' ? 'Voiture' : 'Utilitaire'} - ${vehicle.seats} places</p>
                <div class="resource-status ${statusClass}">
                    <i class="fas ${statusClass === 'available' ? 'fa-check-circle' : statusClass === 'occupied' ? 'fa-clock' : 'fa-tools'}"></i>
                    ${statusText}
                </div>
            `;
            
            // Ajouter l'événement de clic
            card.addEventListener('click', () => {
                this.selectVehicle(vehicle);
            });
            
            vehiclesGrid.appendChild(card);
        });
    },
    
    /**
     * Filtre les véhicules selon les critères
     */
    filterVehicles(searchText, typeFilter) {
        const filtered = this.state.vehicles.filter(vehicle => {
            // Filtre par texte
            const matchesText = searchText === '' || 
                vehicle.name.toLowerCase().includes(searchText.toLowerCase()) || 
                vehicle.description.toLowerCase().includes(searchText.toLowerCase());
            
            // Filtre par type
            const matchesType = typeFilter === 'all' || vehicle.type === typeFilter;
            
            return matchesText && matchesType;
        });
        
        this.displayVehicles(filtered);
    },
    
    /**
     * Sélectionne un véhicule et affiche ses détails
     */
    selectVehicle(vehicle) {
        this.state.selectedResource = vehicle;
        
        // Mettre à jour la classe active des cartes
        document.querySelectorAll('#vehiclesGrid .resource-card').forEach(card => {
            card.classList.remove('active');
            if (card.dataset.id === vehicle.id) {
                card.classList.add('active');
            }
        });
        
        // Afficher les détails
        const detailsSection = document.getElementById('vehicleDetails');
        if (!detailsSection) return;
        
        let statusText = '';
        let statusClass = '';
        
        switch (vehicle.status) {
            case 'available':
                statusText = 'Disponible';
                statusClass = 'available';
                break;
            case 'occupied':
                statusText = 'En utilisation';
                statusClass = 'occupied';
                break;
            case 'maintenance':
                statusText = 'En maintenance';
                statusClass = 'maintenance';
                break;
            default:
                statusText = 'Statut inconnu';
        }
        
        detailsSection.innerHTML = `
            <div class="resource-detail-header">
                <div class="resource-detail-title">
                    <h3>${vehicle.name}</h3>
                    <p class="resource-status ${statusClass}">
                        <i class="fas ${statusClass === 'available' ? 'fa-check-circle' : statusClass === 'occupied' ? 'fa-clock' : 'fa-tools'}"></i>
                        ${statusText}
                    </p>
                </div>
                
                <div class="resource-detail-actions">
                    <button class="btn-primary" onclick="ReservationSystem.showBookVehicleForm('${vehicle.id}')">
                        <i class="fas fa-calendar-plus"></i> Réserver
                    </button>
                </div>
            </div>
            
            <div class="resource-detail-content">
                <div class="resource-detail-section">
                    <h4><i class="fas fa-info-circle"></i> Informations</h4>
                    <div class="resource-detail-grid">
                        <div class="resource-detail-item">
                            <span>Type</span>
                            <span>${vehicle.type === 'car' ? 'Voiture' : 'Utilitaire'}</span>
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
                    <h4><i class="fas fa-list-ul"></i> Caractéristiques</h4>
                    <ul>
                        ${vehicle.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="resource-detail-section">
                    <h4><i class="fas fa-calendar-alt"></i> Disponibilité</h4>
                    <div class="availability-calendar">
                        <div class="calendar-header">
                            <h5>Mars 2025</h5>
                            <div class="calendar-navigation">
                                <button><i class="fas fa-chevron-left"></i></button>
                                <button><i class="fas fa-chevron-right"></i></button>
                            </div>
                        </div>
                        
                        <div class="calendar-days">
                            <div class="calendar-day-header">L</div>
                            <div class="calendar-day-header">M</div>
                            <div class="calendar-day-header">M</div>
                            <div class="calendar-day-header">J</div>
                            <div class="calendar-day-header">V</div>
                            <div class="calendar-day-header">S</div>
                            <div class="calendar-day-header">D</div>
                            
                            <!-- Jours d'exemple (à générer dynamiquement) -->
                            ${this.generateCalendarDays()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * Affiche le formulaire de réservation de véhicule
     */
    showBookVehicleForm(vehicleId) {
        const vehicle = this.state.vehicles.find(v => v.id === vehicleId);
        if (!vehicle) return;
        
        // Créer le modal
        const modal = document.createElement('div');
        modal.className = 'booking-modal';
        modal.id = 'resourceBookingModal';
        
        // Récupérer date et heure courantes
        const now = new Date();
        const currentDate = now.toISOString().substr(0, 10);
        
        modal.innerHTML = `
            <div class="booking-modal-content">
                <div class="booking-modal-header">
                    <h2><i class="fas fa-car"></i> Réserver ${vehicle.name}</h2>
                    <button class="modal-close" id="closeBookingModalBtn">&times;</button>
                </div>
                
                <div class="booking-modal-body">
                    <form class="booking-form" id="vehicleBookingForm">
                        <input type="hidden" id="booking-vehicle-id" value="${vehicle.id}">
                        
                        <div class="form-group">
                            <label for="booking-purpose">Motif de déplacement</label>
                            <div class="input-with-icon">
                                <input type="text" id="booking-purpose" placeholder="Motif du déplacement" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="booking-driver">Conducteur</label>
                                <div class="input-with-icon">
                                    <input type="text" id="booking-driver" value="Votre nom" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="booking-service">Service</label>
                                <div class="input-with-icon">
                                    <select id="booking-service" required>
                                        <option value="">Sélectionnez un service</option>
                                        <option value="commercial">Commercial</option>
                                        <option value="logistique">Logistique</option>
                                        <option value="administratif">Administratif</option>
                                        <option value="direction">Direction</option>
                                        <option value="it">Informatique</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="booking-start-date">Date de départ</label>
                                <div class="input-with-icon">
                                    <input type="date" id="booking-start-date" value="${currentDate}" min="${currentDate}" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="booking-start-time">Heure de départ</label>
                                <div class="input-with-icon">
                                    <input type="time" id="booking-start-time" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="booking-end-date">Date de retour</label>
                                <div class="input-with-icon">
                                    <input type="date" id="booking-end-date" value="${currentDate}" min="${currentDate}" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="booking-end-time">Heure de retour</label>
                                <div class="input-with-icon">
                                    <input type="time" id="booking-end-time" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="booking-destination">Destination</label>
                            <div class="input-with-icon">
                                <input type="text" id="booking-destination" placeholder="Lieu de destination" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="booking-estimated-km">Kilométrage estimé</label>
                            <div class="input-with-icon">
                                <input type="number" id="booking-estimated-km" placeholder="Distance en km" min="1">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="booking-passengers">Passagers</label>
                            <div class="input-with-icon">
                                <input type="text" id="booking-passengers" placeholder="Noms des passagers">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="booking-notes">Notes</label>
                            <textarea id="booking-notes" rows="3" placeholder="Informations complémentaires..."></textarea>
                        </div>
                    </form>
                </div>
                
                <div class="booking-modal-footer">
                    <button class="cancel-button" id="cancelVehicleBookingBtn">
                        <i class="fas fa-times"></i> Annuler
                    </button>
                    <button class="create-button" id="confirmVehicleBookingBtn">
                        <i class="fas fa-check"></i> Confirmer la réservation
                    </button>
                </div>
            </div>
        `;
        
        // Ajouter le modal au document
        document.body.appendChild(modal);
        
        // Afficher le modal
        modal.style.display = 'flex';
        
        // Initialiser l'heure actuelle
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
        
        // Calculer l'heure de retour par défaut (2h plus tard)
        now.setHours(now.getHours() + 2);
        const endTime = `${String(now.getHours()).padStart(2, '0')}:${String(roundedMinute).padStart(2, '0')}`;
        
        document.getElementById('booking-start-time').value = startTime;
        document.getElementById('booking-end-time').value = endTime;
        
        // Gestion des événements du modal
        document.getElementById('closeBookingModalBtn').addEventListener('click', () => {
            this.closeBookingModal();
        });
        
        document.getElementById('cancelVehicleBookingBtn').addEventListener('click', () => {
            this.closeBookingModal();
        });
        
        document.getElementById('confirmVehicleBookingBtn').addEventListener('click', () => {
            this.bookVehicle();
        });
        
        // Fermer le modal si on clique en dehors
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeBookingModal();
            }
        });
    },
    
    /**
     * Effectue la réservation du véhicule
     */
    async bookVehicle() {
        const formData = {
            vehicleId: document.getElementById('booking-vehicle-id').value,
            purpose: document.getElementById('booking-purpose').value,
            driver: document.getElementById('booking-driver').value,
            service: document.getElementById('booking-service').value,
            startDate: document.getElementById('booking-start-date').value,
            startTime: document.getElementById('booking-start-time').value,
            endDate: document.getElementById('booking-end-date').value,
            endTime: document.getElementById('booking-end-time').value,
            destination: document.getElementById('booking-destination').value,
            estimatedKm: document.getElementById('booking-estimated-km').value,
            passengers: document.getElementById('booking-passengers').value,
            notes: document.getElementById('booking-notes').value
        };
        
        // Validation simple
        if (!formData.purpose || !formData.driver || !formData.service || 
            !formData.startDate || !formData.startTime || !formData.endDate || 
            !formData.endTime || !formData.destination) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        
        try {
            // Simuler un appel API
            console.log('Réservation de véhicule:', formData);
            
            // Dans une version réelle, on enverrait ces données à une API
            // await fetch('/api/book-vehicle', { method: 'POST', body: JSON.stringify(formData) });
            
            // Pour la démo, simuler un délai
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Fermer le modal
            this.closeBookingModal();
            
            // Afficher un message de succès
            if (typeof UISystem !== 'undefined' && UISystem.showNotification) {
                UISystem.showNotification('Réservation de véhicule effectuée avec succès', 'success');
            } else {
                alert('Réservation de véhicule effectuée avec succès !');
            }
            
            // Rafraîchir l'affichage
            const vehicle = this.state.vehicles.find(v => v.id === formData.vehicleId);
            if (vehicle) {
                vehicle.status = 'occupied';
                this.displayVehicles();
                
                // Si le véhicule est toujours sélectionné, mettre à jour l'affichage détaillé
                if (this.state.selectedResource?.id === formData.vehicleId) {
                    this.selectVehicle(vehicle);
                }
            }
        } catch (error) {
            console.error('Erreur lors de la réservation du véhicule:', error);
            alert('Une erreur est survenue lors de la réservation. Veuillez réessayer.');
        }
    },
    
    /**
     * Charge les équipements disponibles
     */
    async loadEquipment() {
        try {
            // Dans une version réelle, ces données viendraient d'une API ou d'un fichier JSON
            this.state.equipment = [
                {
                    id: 'laptop1',
                    name: 'Ordinateur portable Dell XPS',
                    type: 'computer',
                    serialNumber: 'XPS-1234-5678',
                    location: 'Bureau IT',
                    features: ['Windows 11', '16GB RAM', '512GB SSD'],
                    status: 'available',
                    lastMaintenance: '2025-01-15',
                    description: 'Ordinateur portable haut de gamme pour présentations'
                },
                {
                    id: 'projector1',
                    name: 'Vidéoprojecteur Epson',
                    type: 'projector',
                    serialNumber: 'EP-9876-5432',
                    location: 'Placard IT',
                    features: ['4K', 'HDMI', 'WiFi'],
                    status: 'available',
                    lastMaintenance: '2025-02-01',
                    description: 'Vidéoprojecteur pour présentations en haute définition'
                },
                {
                    id: 'phone1',
                    name: 'Téléphone de conférence Polycom',
                    type: 'phone',
                    serialNumber: 'PC-5555-7777',
                    location: 'Bureau direction',
                    features: ['Bluetooth', 'Micro omnidirectionnel'],
                    status: 'occupied',
                    lastMaintenance: '2024-12-10',
                    description: 'Téléphone de conférence haute qualité pour réunions à distance'
                },
                {
                    id: 'laptop2',
                    name: 'MacBook Pro',
                    type: 'computer',
                    serialNumber: 'MBP-2345-6789',
                    location: 'Bureau IT',
                    features: ['macOS', '16GB RAM', '1TB SSD'],
                    status: 'maintenance',
                    lastMaintenance: '2025-02-20',
                    description: 'Ordinateur Apple pour le service graphique'
                }
            ];
            
            // Afficher les équipements
            this.displayEquipment();
        } catch (error) {
            console.error('Erreur lors du chargement des équipements:', error);
        }
    },
    
    /**
     * Affiche les équipements dans la grille
     */
    displayEquipment(filtered = null) {
        const equipmentGrid = document.getElementById('equipmentGrid');
        if (!equipmentGrid) return;
        
        // Utiliser les équipements filtrés ou tous les équipements
        const equipment = filtered || this.state.equipment;
        
        // Vider la grille
        equipmentGrid.innerHTML = '';
        
        if (equipment.length === 0) {
            equipmentGrid.innerHTML = '<p class="empty-message">Aucun équipement ne correspond aux critères.</p>';
            return;
        }
        
        // Créer la carte pour chaque équipement
        equipment.forEach(item => {
            const card = document.createElement('div');
            card.className = 'resource-card';
            card.dataset.id = item.id;
            
            // Ajouter la classe active si cet équipement est sélectionné
            if (this.state.selectedResource?.id === item.id && this.state.activeTab === 'equipment-booking') {
                card.classList.add('active');
            }
            
            let statusText = '';
            let statusClass = '';
            
            switch (item.status) {
                case 'available':
                    statusText = 'Disponible';
                    statusClass = 'available';
                    break;
                case 'occupied':
                    statusText = 'En prêt';
                    statusClass = 'occupied';
                    break;
                case 'maintenance':
                    statusText = 'En maintenance';
                    statusClass = 'maintenance';
                    break;
                default:
                    statusText = 'Statut inconnu';
            }
            
            card.innerHTML = `
                <h4>${item.name}</h4>
                <p>${this.formatEquipmentType(item.type)}</p>
                <div class="resource-status ${statusClass}">
                    <i class="fas ${statusClass === 'available' ? 'fa-check-circle' : statusClass === 'occupied' ? 'fa-clock' : 'fa-tools'}"></i>
                    ${statusText}
                </div>
            `;
            
            // Ajouter l'événement de clic
            card.addEventListener('click', () => {
                this.selectEquipment(item);
            });
            
            equipmentGrid.appendChild(card);
        });
    },
    
    /**
     * Formate le type d'équipement pour l'affichage
     */
    formatEquipmentType(type) {
        switch (type) {
            case 'computer':
                return 'Ordinateur';
            case 'projector':
                return 'Vidéoprojecteur';
            case 'phone':
                return 'Téléphone';
            case 'misc':
                return 'Équipement divers';
            default:
                return type;
        }
    },
    
    /**
     * Filtre les équipements selon les critères
     */
    filterEquipment(searchText, typeFilter) {
        const filtered = this.state.equipment.filter(item => {
            // Filtre par texte
            const matchesText = searchText === '' || 
                item.name.toLowerCase().includes(searchText.toLowerCase()) || 
                item.description.toLowerCase().includes(searchText.toLowerCase());
            
            // Filtre par type
            const matchesType = typeFilter === 'all' || item.type === typeFilter;
            
            return matchesText && matchesType;
        });
        
        this.displayEquipment(filtered);
    },
    
    /**
     * Sélectionne un équipement et affiche ses détails
     */
    selectEquipment(equipment) {
        this.state.selectedResource = equipment;
        
        // Mettre à jour la classe active des cartes
        document.querySelectorAll('#equipmentGrid .resource-card').forEach(card => {
            card.classList.remove('active');
            if (card.dataset.id === equipment.id) {
                card.classList.add('active');
            }
        });
        
        // Afficher les détails
        const detailsSection = document.getElementById('equipmentDetails');
        if (!detailsSection) return;
        
        let statusText = '';
        let statusClass = '';
        
        switch (equipment.status) {
            case 'available':
                statusText = 'Disponible';
                statusClass = 'available';
                break;
            case 'occupied':
                statusText = 'En prêt';
                statusClass = 'occupied';
                break;
            case 'maintenance':
                statusText = 'En maintenance';
                statusClass = 'maintenance';
                break;
            default:
                statusText = 'Statut inconnu';
        }
        
        detailsSection.innerHTML = `
            <div class="resource-detail-header">
                <div class="resource-detail-title">
                    <h3>${equipment.name}</h3>
                    <p class="resource-status ${statusClass}">
                        <i class="fas ${statusClass === 'available' ? 'fa-check-circle' : statusClass === 'occupied' ? 'fa-clock' : 'fa-tools'}"></i>
                        ${statusText}
                    </p>
                </div>
                
                <div class="resource-detail-actions">
                    <button class="btn-primary" onclick="ReservationSystem.showBookEquipmentForm('${equipment.id}')">
                        <i class="fas fa-calendar-plus"></i> Réserver
                    </button>
                </div>
            </div>
            
            <div class="resource-detail-content">
                <div class="resource-detail-section">
                    <h4><i class="fas fa-info-circle"></i> Informations</h4>
                    <div class="resource-detail-grid">
                        <div class="resource-detail-item">
                            <span>Type</span>
                            <span>${this.formatEquipmentType(equipment.type)}</span>
                        </div>
                        <div class="resource-detail-item">
                            <span>N° de série</span>
                            <span>${equipment.serialNumber}</span>
                        </div>
                        <div class="resource-detail-item">
                            <span>Emplacement</span>
                            <span>${equipment.location}</span>
                        </div>
                        <div class="resource-detail-item">
                            <span>Dernière maintenance</span>
                            <span>${new Date(equipment.lastMaintenance).toLocaleDateString('fr-FR')}</span>
                        </div>
                    </div>
                </div>
                
                <div class="resource-detail-section">
                    <h4><i class="fas fa-list-ul"></i> Caractéristiques</h4>
                    <ul>
                        ${equipment.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="resource-detail-section">
                    <h4><i class="fas fa-calendar-alt"></i> Disponibilité</h4>
                    <div class="availability-calendar">
                        <div class="calendar-header">
                            <h5>Mars 2025</h5>
                            <div class="calendar-navigation">
                                <button><i class="fas fa-chevron-left"></i></button>
                                <button><i class="fas fa-chevron-right"></i></button>
                            </div>
                        </div>
                        
                        <div class="calendar-days">
                            <div class="calendar-day-header">L</div>
                            <div class="calendar-day-header">M</div>
                            <div class="calendar-day-header">M</div>
                            <div class="calendar-day-header">J</div>
                            <div class="calendar-day-header">V</div>
                            <div class="calendar-day-header">S</div>
                            <div class="calendar-day-header">D</div>
                            
                            <!-- Jours d'exemple (à générer dynamiquement) -->
                            ${this.generateCalendarDays()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * Affiche le formulaire de prêt d'équipement
     */
    showBookEquipmentForm(equipmentId) {
        const equipment = this.state.equipment.find(e => e.id === equipmentId);
        if (!equipment) return;
        
        // Créer le modal
        const modal = document.createElement('div');
        modal.className = 'booking-modal';
        modal.id = 'resourceBookingModal';
        
        // Récupérer date et heure courantes
        const now = new Date();
        const currentDate = now.toISOString().substr(0, 10);
        
        // Date de retour par défaut (dans 1 semaine)
        const returnDate = new Date(now);
        returnDate.setDate(returnDate.getDate() + 7);
        const defaultReturnDate = returnDate.toISOString().substr(0, 10);
        
        modal.innerHTML = `
            <div class="booking-modal-content">
                <div class="booking-modal-header">
                    <h2><i class="fas fa-laptop"></i> Prêt de ${equipment.name}</h2>
                    <button class="modal-close" id="closeBookingModalBtn">&times;</button>
                </div>
                
                <div class="booking-modal-body">
                    <form class="booking-form" id="equipmentBookingForm">
                        <input type="hidden" id="booking-equipment-id" value="${equipment.id}">
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="booking-borrower">Emprunteur</label>
                                <div class="input-with-icon">
                                    <input type="text" id="booking-borrower" value="Votre nom" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="booking-service">Service</label>
                                <div class="input-with-icon">
                                    <select id="booking-service" required>
                                        <option value="">Sélectionnez un service</option>
                                        <option value="commercial">Commercial</option>
                                        <option value="logistique">Logistique</option>
                                        <option value="administratif">Administratif</option>
                                        <option value="direction">Direction</option>
                                        <option value="it">Informatique</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="booking-purpose">Motif du prêt</label>
                            <div class="input-with-icon">
                                <input type="text" id="booking-purpose" placeholder="Raison du prêt" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="booking-borrow-date">Date d'emprunt</label>
                                <div class="input-with-icon">
                                    <input type="date" id="booking-borrow-date" value="${currentDate}" min="${currentDate}" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="booking-return-date">Date de retour prévue</label>
                                <div class="input-with-icon">
                                    <input type="date" id="booking-return-date" value="${defaultReturnDate}" min="${currentDate}" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Durée du prêt</label>
                            <div class="quick-duration-buttons">
                                <div class="duration-button" data-days="1">1 jour</div>
                                <div class="duration-button" data-days="2">2 jours</div>
                                <div class="duration-button active" data-days="7">1 semaine</div>
                                <div class="duration-button" data-days="14">2 semaines</div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="booking-location">Lieu d'utilisation</label>
                            <div class="input-with-icon">
                                <input type="text" id="booking-location" placeholder="Où l'équipement sera-t-il utilisé?" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="booking-accessories">Accessoires</label>
                            <div class="input-with-icon">
                                <input type="text" id="booking-accessories" placeholder="Accessoires empruntés avec l'équipement">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="booking-notes">Commentaires</label>
                            <textarea id="booking-notes" rows="3" placeholder="Informations complémentaires..."></textarea>
                        </div>
                    </form>
                </div>
                
                <div class="booking-modal-footer">
                    <button class="cancel-button" id="cancelEquipmentBookingBtn">
                        <i class="fas fa-times"></i> Annuler
                    </button>
                    <button class="create-button" id="confirmEquipmentBookingBtn">
                        <i class="fas fa-check"></i> Confirmer le prêt
                    </button>
                </div>
            </div>
        `;
        
        // Ajouter le modal au document
        document.body.appendChild(modal);
        
        // Afficher le modal
        modal.style.display = 'flex';
        
        // Gestion des événements du modal
        document.getElementById('closeBookingModalBtn').addEventListener('click', () => {
            this.closeBookingModal();
        });
        
        document.getElementById('cancelEquipmentBookingBtn').addEventListener('click', () => {
            this.closeBookingModal();
        });
        
        document.getElementById('confirmEquipmentBookingBtn').addEventListener('click', () => {
            this.bookEquipment();
        });
        
        // Gestion des boutons de durée
        document.querySelectorAll('.duration-button').forEach(button => {
            button.addEventListener('click', () => {
                // Désactiver tous les boutons
                document.querySelectorAll('.duration-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Activer le bouton cliqué
                button.classList.add('active');
                
                // Mettre à jour la date de retour
                const days = parseInt(button.dataset.days);
                this.updateReturnDate(days);
            });
        });
        
        // Fermer le modal si on clique en dehors
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeBookingModal();
            }
        });
    },
    
    /**
     * Met à jour la date de retour en fonction de la durée
     */
    updateReturnDate(days) {
        const borrowDateInput = document.getElementById('booking-borrow-date');
        const returnDateInput = document.getElementById('booking-return-date');
        
        if (!borrowDateInput || !returnDateInput || !borrowDateInput.value) return;
        
        const borrowDate = new Date(borrowDateInput.value);
        const returnDate = new Date(borrowDate);
        returnDate.setDate(returnDate.getDate() + days);
        
        returnDateInput.value = returnDate.toISOString().substr(0, 10);
    },
    
    /**
     * Effectue la réservation de l'équipement
     */
    async bookEquipment() {
        const formData = {
            equipmentId: document.getElementById('booking-equipment-id').value,
            borrower: document.getElementById('booking-borrower').value,
            service: document.getElementById('booking-service').value,
            purpose: document.getElementById('booking-purpose').value,
            borrowDate: document.getElementById('booking-borrow-date').value,
            returnDate: document.getElementById('booking-return-date').value,
            location: document.getElementById('booking-location').value,
            accessories: document.getElementById('booking-accessories').value,
            notes: document.getElementById('booking-notes').value
        };
        
        // Validation simple
        if (!formData.borrower || !formData.service || !formData.purpose || 
            !formData.borrowDate || !formData.returnDate || !formData.location) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        
        try {
            // Simuler un appel API
            console.log('Prêt d\'équipement:', formData);
            
            // Dans une version réelle, on enverrait ces données à une API
            // await fetch('/api/book-equipment', { method: 'POST', body: JSON.stringify(formData) });
            
            // Pour la démo, simuler un délai
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Fermer le modal
            this.closeBookingModal();
            
            // Afficher un message de succès
            if (typeof UISystem !== 'undefined' && UISystem.showNotification) {
                UISystem.showNotification('Prêt d\'équipement enregistré avec succès', 'success');
            } else {
                alert('Prêt d\'équipement enregistré avec succès !');
            }
            
            // Rafraîchir l'affichage
            const equipment = this.state.equipment.find(e => e.id === formData.equipmentId);
            if (equipment) {
                equipment.status = 'occupied';
                this.displayEquipment();
                
                // Si l'équipement est toujours sélectionné, mettre à jour l'affichage détaillé
                if (this.state.selectedResource?.id === formData.equipmentId) {
                    this.selectEquipment(equipment);
                }
            }
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement du prêt:', error);
            alert('Une erreur est survenue lors de l\'enregistrement du prêt. Veuillez réessayer.');
        }
    }
};

// Initialiser le système de réservation au chargement
document.addEventListener('DOMContentLoaded', () => {
    ReservationSystem.init();
});

// Exporter pour utilisation dans d'autres modules
window.ReservationSystem = ReservationSystem;
