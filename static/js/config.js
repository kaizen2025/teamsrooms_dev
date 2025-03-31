/**
 * Configuration globale de l'application
 * Centralisé pour faciliter la maintenance
 * VERSION RESTAURÉE
 */

// Configuration des salles avec leurs adresses email (basé sur l'original)
window.SALLES = window.SALLES || {
  'Canigou': 'Sallecanigou@anecoop-france.com',
  'Castillet': 'Sallecastillet@anecoop-france.com',
  'Florensud': 'salleflorensud@florensud.fr', // Email spécifique Florensud
  'Mallorca': 'Sallemallorca@anecoop-france.com',
  'Mimosa': 'Sallemimosa@florensud.fr',       // Email spécifique Florensud
  'Pivoine': 'SallePivoine@florensud.fr',      // Email spécifique Florensud
  'Renoncule': 'SalleRenoncule@florensud.fr',  // Email spécifique Florensud
  'Tramontane': 'Salletramontane@anecoop-france.com',
  'Massane': 'Sallemassane@anecoop-france.com'
};

// Configuration des véhicules avec leurs adresses email (basé sur l'original)
window.VEHICULES = window.VEHICULES || {
  'Véhicules Anecoop': 'reservation_vehicule@anecoop-france.com',
  'Véhicules Florensud': 'FS_Reservation_vehicule@florensud.fr',
  'Vélos': 'reservation_velo@anecoop-france.com'
};

// Configuration du matériel avec son adresse email (basé sur l'original)
window.MATERIEL = window.MATERIEL || {
  'Matériel': 'Reservationmateriel@anecoop-france.com'
};

// Arrière-plans disponibles - chemins basés sur l'original
// Vérifiez que ces chemins sont corrects depuis la racine de votre serveur web.
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

// Intervalle de rafraîchissement (en millisecondes) - Ajustés pour l'équilibre
window.REFRESH_INTERVALS = {
  CLOCK: 1000,             // Horloge: 1 seconde
  MEETINGS: 30000,         // Réunions: 30 secondes
  ROOM_STATUS: 45000,      // Statut Salles: 45 secondes
  VEHICLE_STATUS: 60000,   // Véhicules: 1 minute (si implémenté)
  EQUIPMENT_STATUS: 60000, // Matériel: 1 minute (si implémenté)
  BACKGROUND: 3600000,     // Arrière-plans: 1 heure
  MEETING_TIMERS: 15000     // Timers Réunion: 15 secondes
};

// URL de l'API pour les opérations CRUD (Exemples, à adapter à VOTRE backend)
window.API_URLS = {
  GET_MEETINGS: '/meetings.json',        // Endpoint pour lire les réunions (ex: fichier JSON)
  CREATE_MEETING: '/api/create-meeting', // Endpoint pour créer une réunion
  GET_ROOMS: '/api/rooms',             // Endpoint pour obtenir la liste/statut des salles (IMPORTANT)
  // GET_VEHICLE_BOOKINGS: '/api/vehicle-bookings', // Si implémenté
  // CREATE_VEHICLE_BOOKING: '/api/create-vehicle-booking', // Si implémenté
  // GET_EQUIPMENT_BOOKINGS: '/api/equipment-bookings', // Si implémenté
  // CREATE_EQUIPMENT_BOOKING: '/api/create-equipment-booking' // Si implémenté
};

// Fonction pour initialiser le contexte (appelée depuis app.js)
function initializeResourceContext() {
  // Extrait le premier segment du chemin (ex: 'canigou' depuis '/canigou')
  const path = window.location.pathname.split('/')[1]?.trim().toLowerCase() || '';
  let resourceType = 'room'; // Par défaut
  let resourceName = path;

  // Déterminer si c'est une page de salle, véhicule, matériel, etc. (Adapter si besoin)
  if (Object.keys(window.VEHICULES || {}).map(k => k.toLowerCase().replace(/ /g, '-')).includes(path)) {
    resourceType = 'vehicle';
  } else if (Object.keys(window.MATERIEL || {}).map(k => k.toLowerCase().replace(/ /g, '-')).includes(path)) {
    resourceType = 'equipment';
  }
  // Si le path ne correspond à aucune salle/véhicule/matériel connu, ou est vide, on est sur "toutes les salles"
  else if (path === '' || !window.SALLES || !Object.keys(window.SALLES).map(k => k.toLowerCase()).includes(path)) {
     resourceName = 'toutes les salles';
  }
  // Sinon, c'est une salle spécifique
  else {
      resourceType = 'room';
      resourceName = path; // Garder le nom de la salle tel quel (lowercase)
  }


  window.APP_CONTEXT = {
    resourceType: resourceType,
    // Normaliser le nom pour affichage mais garder la version "clé" pour logique
    resourceName: resourceName, // Nom utilisé pour logique/filtrage (ex: 'canigou', 'toutes les salles')
    isAllResources: resourceName === 'toutes les salles', // Ajuster si d'autres types 'tous'
    rawPath: window.location.pathname.split('/')[1] || '' // Chemin brut original
  };

  console.log(`Contexte initialisé:`, window.APP_CONTEXT);
}

// Configuration globale de l'application (pour debug, etc.)
window.APP_CONFIG = {
  DEBUG: true, // Mettre à false en production
  AUTO_REFRESH_MEETINGS: true,
  AUTO_REFRESH_ROOMS: true,
  VERSION: '2.0.1' // Version après restauration/complétion
};

console.log("config.js (restauré) chargé.");
