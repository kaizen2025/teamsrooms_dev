/**
 * Configuration globale de l'application
 * Centralisé pour faciliter la maintenance
 */

// Configuration des salles avec leurs adresses email
window.SALLES = {
  'Canigou': 'Sallecanigou@anecoop-france.com',
  'Castillet': 'Sallecastillet@anecoop-france.com',
  'Florensud': 'salleflorensud@florensud.fr',
  'Mallorca': 'Sallemallorca@anecoop-france.com',
  'Mimosa': 'Sallemimosa@florensud.fr',
  'Pivoine': 'SallePivoine@florensud.fr',
  'Renoncule': 'SalleRenoncule@florensud.fr',
  'Tramontane': 'Salletramontane@anecoop-france.com',
  'Massane': 'Sallemassane@anecoop-france.com'
};

// Configuration des véhicules avec leurs adresses email
window.VEHICULES = {
  'Véhicules Anecoop': 'reservation_vehicule@anecoop-france.com',
  'Véhicules Florensud': 'FS_Reservation_vehicule@florensud.fr',
  'Vélos': 'reservation_velo@anecoop-france.com'
};

// Configuration du matériel avec son adresse email
window.MATERIEL = {
  'Matériel': 'Reservationmateriel@anecoop-france.com'
};

// Arrière-plans disponibles
window.BACKGROUNDS = [
  '/static/Images/iStock-1137376794.jpg',
  '/static/Images/iStock-1512013316.jpg',
  '/static/Images/iStock-2019872476.jpg',
  '/static/Images/iStock-2154828608.jpg',
  '/static/Images/iStock-2157915069.jpg',
  '/static/Images/iStock-2162113462.jpg',
  '/static/Images/iStock-2178301876.jpg',
  '/static/Images/iStock-2186748328.jpg',
  '/static/Images/iStock-2187797860.jpg',
  '/static/Images/iStock-2188982874.jpg'
];

// Intervalle de rafraîchissement (en millisecondes)
window.REFRESH_INTERVALS = {
  CLOCK: 1000,             // Mise à jour de l'horloge: 1 seconde
  MEETINGS: 20000,         // Rafraîchir les réunions: 20 secondes
  ROOM_STATUS: 60000,      // Statut des salles: 1 minute
  VEHICLE_STATUS: 60000,   // Statut des véhicules: 1 minute
  EQUIPMENT_STATUS: 60000, // Statut du matériel: 1 minute
  MEETING_TIMERS: 60000,   // Chronomètres des réunions: 1 minute
  BACKGROUND: 3600000      // Rotation des arrière-plans: 1 heure
};

// URL de l'API pour les opérations CRUD
window.API_URLS = {
  GET_MEETINGS: '/meetings.json',
  CREATE_MEETING: '/api/create-meeting',
  GET_VEHICLE_BOOKINGS: '/api/vehicle-bookings',
  CREATE_VEHICLE_BOOKING: '/api/create-vehicle-booking',
  GET_EQUIPMENT_BOOKINGS: '/api/equipment-bookings',
  CREATE_EQUIPMENT_BOOKING: '/api/create-equipment-booking'
};

// Récupérer le contexte depuis l'URL et initialiser les variables
const initResourceContext = () => {
  // Extraire le chemin depuis l'URL
  const path = window.location.pathname.split('/')[1] || '';
  let resourceType = 'room'; // Par défaut: salle
  let resourceName = path.trim().toLowerCase();
  
  // Déterminer si c'est une page de salle, véhicule ou matériel
  if (path.startsWith('vehicule') || path.startsWith('velos')) {
    resourceType = 'vehicle';
    resourceName = path.replace('vehicule-', '').replace('velos-', '');
  } else if (path.startsWith('materiel')) {
    resourceType = 'equipment';
    resourceName = path.replace('materiel-', '');
  } else {
    // Si c'est une salle ou la page d'accueil
    if (!resourceName) resourceName = 'toutes les salles';
  }
  
  // Initialiser les variables globales
  window.resourceType = resourceType;
  window.resourceName = resourceName;
  window.isAllResources = (resourceName === 'toutes les salles' || 
                           resourceName === 'tous les vehicules' || 
                           resourceName === 'tout le materiel');
  
  // Mettre à jour le titre de la page
  updatePageTitle(resourceType, resourceName);
};

// Mise à jour du titre de la page selon le type de ressource
const updatePageTitle = (type, name) => {
  const titleElement = document.getElementById('salle-title');
  if (!titleElement) return;
  
  let title = '';
  switch (type) {
    case 'vehicle':
      title = `Réservation ${name === 'velos' ? 'Vélos' : 'Véhicule'} ${name !== 'velos' ? name : ''}`;
      break;
    case 'equipment':
      title = `Réservation Matériel ${name !== 'tout le materiel' ? name : ''}`;
      break;
    default: // salle
      title = `Salle ${name.charAt(0).toUpperCase() + name.slice(1)}`;
  }
  
  titleElement.textContent = title;
};

// Initialiser la configuration au chargement du script
document.addEventListener('DOMContentLoaded', initResourceContext);
