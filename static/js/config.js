/**
 * Configuration globale de l'application
 * Centralisé pour faciliter la maintenance
 */

// Assurer que l'objet window.SALLES existe même si le backend ne le fournit pas
window.SALLES = window.SALLES || {
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
window.VEHICULES = window.VEHICULES || {
  'Véhicules Anecoop': 'reservation_vehicule@anecoop-france.com',
  'Véhicules Florensud': 'FS_Reservation_vehicule@florensud.fr',
  'Vélos': 'reservation_velo@anecoop-france.com'
};

// Configuration du matériel avec son adresse email
window.MATERIEL = window.MATERIEL || {
  'Matériel': 'Reservationmateriel@anecoop-france.com'
};

// Arrière-plans disponibles - chemins corrigés
// S'assurer que ces chemins sont corrects par rapport à la racine du serveur web
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

// Intervalle de rafraîchissement (en millisecondes) - Augmentation pour meetings
window.REFRESH_INTERVALS = {
  CLOCK: 1000,             // Mise à jour de l'horloge: 1 seconde
  MEETINGS: 30000,         // Rafraîchir les réunions: 30 secondes (au lieu de 20)
  ROOM_STATUS: 45000,      // Statut des salles: 45 secondes (au lieu de 60)
  VEHICLE_STATUS: 60000,   // Statut des véhicules: 1 minute
  EQUIPMENT_STATUS: 60000, // Statut du matériel: 1 minute
  BACKGROUND: 3600000,     // Rotation des arrière-plans: 1 heure
  MEETING_TIMERS: 15000     // Mise à jour timers réunion (plus fréquent)
};

// URL de l'API pour les opérations CRUD (Exemples, à adapter)
window.API_URLS = {
  GET_MEETINGS: '/meetings.json', // Assurez-vous que ce endpoint existe
  CREATE_MEETING: '/api/create-meeting',
  GET_ROOMS: '/api/rooms', // Endpoint pour obtenir la liste des salles et leur statut
  // Ajoutez d'autres URLs API nécessaires
};

// Fonction pour initialiser le contexte (peut être appelée depuis app.js)
function initializeResourceContext() {
  const path = window.location.pathname.split('/')[1]?.trim().toLowerCase() || '';
  let resourceType = 'room';
  let resourceName = path;

  // Gérer les types de ressources (si plus que des salles)
  // Exemple: if (path.startsWith('vehicule')) { resourceType = 'vehicle'; ... }

  if (!resourceName || resourceName === '') {
    resourceName = 'toutes les salles';
  }

  window.APP_CONTEXT = {
    resourceType: resourceType,
    resourceName: resourceName,
    isAllResources: resourceName === 'toutes les salles', // Adaptez si d'autres types 'tous'
    rawPath: path // Garder le chemin brut si besoin
  };

  console.log(` contexte initialisé:`, window.APP_CONTEXT);
}

// Initialisation immédiate du contexte si nécessaire, sinon appeler depuis app.js
// initializeResourceContext();

// Configuration globale de l'application (pour debug, etc.)
window.APP_CONFIG = {
  DEBUG: true, // Mettre à false en production
  AUTO_REFRESH_MEETINGS: true,
  AUTO_REFRESH_ROOMS: true,
  VERSION: '2.0.0' // Nouvelle version après refonte
};

console.log("Config.js chargé.");
