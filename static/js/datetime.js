/**
 * Fonctions de gestion de la date et de l'heure
 */

// Mise à jour de l'affichage de la date et de l'heure
function updateDateTime() {
  const now = new Date();
  
  // Date: format long avec majuscule (ex. Samedi 8 mars 2025)
  const dateElement = document.getElementById('current-date');
  if (dateElement) {
    let dateStr = now.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    // Première lettre en majuscule
    dateElement.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  }
  
  // Heure: format HH:MM:SS
  const timeElement = document.getElementById('current-time');
  if (timeElement) {
    timeElement.textContent = now.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  }
}

// Obtenir l'heure courante au format HH:MM pour les inputs de type time
function getCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

// Formater un temps restant en minutes en chaîne lisible
function formatRemainingTime(remainingMinutes) {
  const remainingHours = Math.floor(remainingMinutes / 60);
  const remainingMins = remainingMinutes % 60;
  
  if (remainingHours > 0) {
    return `${remainingHours}h ${remainingMins}min`;
  } else {
    return `${remainingMins}min`;
  }
}

// Convertir une heure au format HH:MM en Date
function timeStringToDate(timeString) {
  const today = new Date().toISOString().split('T')[0];
  const [hours, minutes] = timeString.split(':');
  return new Date(`${today}T${hours}:${minutes}:00`);
}

// Démarrer la mise à jour de l'horloge
function initClock() {
  updateDateTime(); // Première mise à jour immédiate
  setInterval(updateDateTime, window.REFRESH_INTERVALS.CLOCK);
}

// Initialiser l'horloge au chargement
document.addEventListener('DOMContentLoaded', initClock);
