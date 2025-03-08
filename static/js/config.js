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
  CLOCK: 1000,          // Mise à jour de l'horloge: 1 seconde
  MEETINGS: 20000,      // Rafraîchir les réunions: 20 secondes
  ROOM_STATUS: 60000,   // Statut des salles: 1 minute
  MEETING_TIMERS: 60000,// Chronomètres des réunions: 1 minute
  BACKGROUND: 3600000   // Rotation des arrière-plans: 1 heure
};

// URL de l'API pour les opérations CRUD
window.API_URLS = {
  GET_MEETINGS: '/meetings.json',
  CREATE_MEETING: '/api/create-meeting'
};

// Récupérer le nom de la salle depuis l'URL et initialiser les variables
const initSalleContext = () => {
  let salleName = (window.location.pathname.split('/')[1] || '').trim().toLowerCase();
  if (!salleName) salleName = 'toutes les salles';
  
  window.salleName = salleName;
  window.isAllRooms = (salleName === 'toutes les salles');
  
  // Mettre à jour le titre avec le nom de la salle
  const salleTitle = document.getElementById('salle-title');
  if (salleTitle) {
    salleTitle.textContent = "Salle de Réunion " + salleName.charAt(0).toUpperCase() + salleName.slice(1);
  }
};

// Initialiser la configuration au chargement du script
initSalleContext();
