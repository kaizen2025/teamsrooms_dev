/**
 * Gestion de l'interface utilisateur et initialisation des composants
 * Centralise les fonctionnalités d'UI communes
 */

const UISystem = {
    /**
     * Initialise tous les composants UI nécessaires
     */
    init() {
        // Initialiser les composants principaux
        this.initTabs();
        this.initButtons();
        this.setupResourceSystem();
        this.setupNotifications();
        
        // Corriger les problèmes d'affichage
        this.fixDisplayIssues();
        
        console.log("Système UI initialisé avec succès");
    },
    
    /**
     * Initialise les onglets de navigation
     */
    initTabs() {
        // Vérifier si les onglets existent déjà
        if (!document.querySelector('.resource-tabs')) {
            // Créer le conteneur d'onglets pour les types de ressources
            const tabs = document.createElement('div');
            tabs.className = 'resource-tabs';
            tabs.innerHTML = `
                <div class="resource-tab active" data-resource="room">
                    <i class="fas fa-door-open"></i> Salles
                </div>
                <div class="resource-tab" data-resource="vehicle">
                    <i class="fas fa-car"></i> Véhicules
                </div>
                <div class="resource-tab" data-resource="equipment">
                    <i class="fas fa-laptop"></i> Matériel
                </div>
            `;
            
            // Insérer les onglets au début du contenu principal
            const contentArea = document.querySelector('.content');
            if (contentArea) {
                contentArea.insertBefore(tabs, contentArea.firstChild);
                
                // Attacher les événements aux onglets
                tabs.querySelectorAll('.resource-tab').forEach(tab => {
                    tab.addEventListener('click', () => {
                        // Retirer la classe active de tous les onglets
                        tabs.querySelectorAll('.resource-tab').forEach(t => t.classList.remove('active'));
                        
                        // Ajouter la classe active à l'onglet cliqué
                        tab.classList.add('active');
                        
                        // Changer de page ou charger le contenu approprié
                        const resourceType = tab.dataset.resource;
                        if (resourceType) {
                            this.switchToResource(resourceType);
                        }
                    });
                });
            }
        }
    },
    
    /**
     * Initialise les boutons d'action principaux
     */
    initButtons() {
        // Vérifier si la barre d'action existe déjà
        if (!document.querySelector('.action-bar')) {
            // Créer la barre d'action
            const actionBar = document.createElement('div');
            actionBar.className = 'action-bar';
            actionBar.innerHTML = `
                <button class="action-btn create-btn" id="createResourceBtn">
                    <i class="fas fa-plus"></i> Créer une réservation
                </button>
                <button class="action-btn refresh-btn" id="refreshResourcesBtn">
                    <i class="fas fa-sync-alt"></i> Actualiser
                </button>
                <button class="action-btn fullscreen-btn" id="fullscreenBtn">
                    <i class="fas fa-expand"></i> Plein écran
                </button>
            `;
            
            // Remplacer les contrôles existants par la nouvelle barre d'action
            const controlsContainer = document.querySelector('.controls-container');
            if (controlsContainer) {
                controlsContainer.innerHTML = '';
                controlsContainer.appendChild(actionBar);
                
                // Attacher les événements aux boutons
                const createBtn = document.getElementById('createResourceBtn');
                if (createBtn) {
                    createBtn.addEventListener('click', () => this.showCreateResourceModal());
                }
                
                const refreshBtn = document.getElementById('refreshResourcesBtn');
                if (refreshBtn) {
                    refreshBtn.addEventListener('click', () => this.refreshResources());
                }
                
                const fullscreenBtn = document.getElementById('fullscreenBtn');
                if (fullscreenBtn) {
                    fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
                }
            }
        }
        
        // S'assurer que le bouton "Créer une réunion Teams" est fonctionnel
        const createMeetingBtn = document.querySelector('.create-meeting-integrated, #createMeetingBtn');
        if (createMeetingBtn) {
            createMeetingBtn.addEventListener('click', () => {
                if (typeof BookingSystem !== 'undefined') {
                    BookingSystem.showBookingForm('room');
                } else if (typeof window.showBookingModal === 'function') {
                    window.showBookingModal();
                }
            });
        }
    },
    
    /**
     * Configure le système de gestion des ressources
     */
    setupResourceSystem() {
        // Initialiser le système de réservation s'il est disponible
        if (typeof ReservationSystem !== 'undefined') {
            ReservationSystem.init();
        }
        
        // Initialiser correctement le module de réservation existant
        if (typeof BookingSystem !== 'undefined') {
            BookingSystem.init();
        }
    },
    
    /**
     * Affiche le modal de création de ressource
     */
    showCreateResourceModal() {
        // Détecter le type de ressource actif
        const activeTab = document.querySelector('.resource-tab.active');
        const resourceType = activeTab ? activeTab.dataset.resource : 'room';
        
        // Afficher le formulaire approprié selon le type de ressource
        if (typeof ReservationSystem !== 'undefined') {
            ReservationSystem.showBookingForm(resourceType);
        } else if (typeof BookingSystem !== 'undefined') {
            BookingSystem.showBookingForm(resourceType);
        } else {
            // Fallback si les systèmes spécifiques ne sont pas disponibles
            if (resourceType === 'room') {
                if (typeof window.showBookingModal === 'function') {
                    window.showBookingModal();
                }
            } else {
                this.showNotification(`La réservation de ${resourceType === 'vehicle' ? 'véhicules' : 'matériel'} sera bientôt disponible`, 'info');
            }
        }
    },
    
    /**
     * Rafraîchit les ressources affichées
     */
    refreshResources() {
        // Recharger les réunions ou réservations selon le type de ressource actif
        const activeTab = document.querySelector('.resource-tab.active');
        const resourceType = activeTab ? activeTab.dataset.resource : 'room';
        
        if (resourceType === 'room' && typeof fetchMeetings === 'function') {
            fetchMeetings();
            this.showNotification('Liste des réunions actualisée', 'success');
        } else if (typeof ReservationSystem !== 'undefined') {
            ReservationSystem.loadResourceData(resourceType);
            this.showNotification(`Liste des ${resourceType === 'vehicle' ? 'véhicules' : 'équipements'} actualisée`, 'success');
        } else {
            // Recharger la page comme fallback
            location.reload();
        }
    },
    
    /**
     * Change vers un type de ressource spécifique
     */
    switchToResource(resourceType) {
        // Chercher si ce type de ressource a une URL spécifique
        let targetUrl = '';
        
        switch (resourceType) {
            case 'room':
                targetUrl = window.location.pathname.includes('/') ? '/' : '/';
                break;
            case 'vehicle':
                targetUrl = '/vehicules';
                break;
            case 'equipment':
                targetUrl = '/materiel';
                break;
        }
        
        // Si une URL est définie, y naviguer
        if (targetUrl) {
            // Vérifier si nous sommes déjà sur cette page
            if (window.location.pathname !== targetUrl) {
                window.location.href = targetUrl;
            } else {
                // Sinon, simplement rafraîchir les données
                this.refreshResources();
            }
        } else {
            // Afficher temporairement un message si le type de ressource n'est pas encore implémenté
            this.showNotification(`La réservation de ${resourceType === 'vehicle' ? 'véhicules' : 'matériel'} sera bientôt disponible`, 'info');
        }
    },
    
    /**
     * Affiche une notification à l'utilisateur
     */
    showNotification(message, type = 'info') {
        // Vérifier si le conteneur de notifications existe, sinon le créer
        let notifContainer = document.getElementById('notification-container');
        if (!notifContainer) {
            notifContainer = document.createElement('div');
            notifContainer.id = 'notification-container';
            notifContainer.style.position = 'fixed';
            notifContainer.style.top = '20px';
            notifContainer.style.right = '20px';
            notifContainer.style.zIndex = '9999';
            document.body.appendChild(notifContainer);
        }
        
        // Créer la notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Ajouter des styles à la notification
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.padding = '12px 16px';
        notification.style.marginBottom = '10px';
        notification.style.backgroundColor = type === 'success' ? 'rgba(40, 167, 69, 0.9)' : 
                                             type === 'error' ? 'rgba(220, 53, 69, 0.9)' : 
                                             'rgba(98, 100, 167, 0.9)';
        notification.style.color = 'white';
        notification.style.borderRadius = '6px';
        notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        notification.style.minWidth = '300px';
        notification.style.maxWidth = '400px';
        notification.style.animation = 'notification-slide-in 0.3s ease-out forwards';
        
        // Ajouter un style pour l'animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes notification-slide-in {
                from { transform: translateX(120%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes notification-slide-out {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(120%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        // Ajouter la notification au conteneur
        notifContainer.appendChild(notification);
        
        // Ajouter l'événement de fermeture
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'notification-slide-out 0.3s ease-in forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Fermer automatiquement après 5 secondes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'notification-slide-out 0.3s ease-in forwards';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    },
    
    /**
     * Configure le système de notifications
     */
    setupNotifications() {
        // Exposer la fonction de notification pour une utilisation globale
        window.showNotification = this.showNotification;
    },
    
    /**
     * Active/désactive le mode plein écran
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            // Entrer en mode plein écran
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            }
            
            // Changer l'icône du bouton
            const fullscreenBtn = document.getElementById('fullscreenBtn');
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i> Quitter';
            }
        } else {
            // Quitter le mode plein écran
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            
            // Changer l'icône du bouton
            const fullscreenBtn = document.getElementById('fullscreenBtn');
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i> Plein écran';
            }
        }
    },
    
    /**
     * Corrige les problèmes d'affichage connus
     */
    fixDisplayIssues() {
        // Correction de l'affichage du bouton de connexion pour qu'il soit rectangulaire
        const profileButton = document.querySelector('.user-profile-button');
        if (profileButton) {
            profileButton.style.borderRadius = '6px';
        }
        
        // S'assurer que le menu utilisateur est correctement positionné
        const dropdown = document.querySelector('.user-dropdown');
        if (dropdown) {
            dropdown.style.zIndex = '1001';
        }
        
        // Rendre le titre plus visible
        const title = document.querySelector('.title');
        if (title) {
            title.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            title.style.padding = '10px 20px';
            title.style.borderRadius = '6px';
            title.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        }
        
        // Améliorer la visibilité des éléments de navigation
        const menu = document.querySelector('.side-menu');
        if (menu) {
            menu.style.backgroundColor = 'rgba(35, 35, 35, 0.85)';
        }
    }
};

// Initialiser le système UI au chargement du document
document.addEventListener('DOMContentLoaded', () => {
    UISystem.init();
});

// Exposer l'objet pour une utilisation dans d'autres modules
window.UISystem = UISystem;
