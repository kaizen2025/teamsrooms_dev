/* =============================
   Panneau des réunions
   ============================= */

/* Conteneur principal */
.meetings-container {
  grid-area: meetings;
  overflow: hidden;
  width: 98%;
  height: 98%;
  padding: var(--spacing-xs) var(--spacing-sm) var(--spacing-sm) var(--spacing-sm);
  margin: var(--spacing-md) auto;
  justify-self: center;
}

.meetings {
  width: 100%;
  height: 100%;
  background: rgba(30, 30, 30, 0.4);
  backdrop-filter: blur(8px);
  border-radius: var(--border-radius-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-md);
  color: white;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 100px);
}

/* En-tête avec titre et bouton */
.meetings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: var(--spacing-sm);
}

.meetings h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Liste des réunions */
.meetings-list {
  flex: 1;
  overflow-y: auto;
  padding-right: var(--spacing-sm);
  max-height: calc(100vh - 160px);
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.meetings-list::-webkit-scrollbar {
  width: 5px;
}
.meetings-list::-webkit-scrollbar-track {
  background: transparent;
}
.meetings-list::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
}

/* Bouton de création */
.create-meeting-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 0.95rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.create-meeting-button:hover {
  background-color: var(--primary-color-light);
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.create-meeting-button i {
  font-size: 1rem;
}

/* Message vide */
.empty-meetings-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  margin: var(--spacing-xl) 0;
}

.empty-meetings-message p {
  font-size: 1.1rem;
  color: #ccc;
}

/* Section de status - Suppression de la redondance "Aujourd'hui" */
.status-section {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: var(--spacing-sm) 0 var(--spacing-md) 0;
}

/* Suppression de l'affichage du texte redondant "Aujourd'hui" */
.status-section h4:first-child {
  display: none;
}

.status-current {
  padding: var(--spacing-xs) var(--spacing-md);
  display: inline-block;
  border-radius: var(--border-radius-md);
  font-size: 1.1rem;
  font-weight: bold;
  background-color: var(--success-color);
  color: white;
  animation: blink 1.5s infinite alternate;
  margin: 0;
}

@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

/* ===== Items de réunions ===== */
.meeting-item {
  background-color: rgba(40, 40, 40, 0.85);
  border-radius: var(--border-radius-md);
  margin: 0 0 var(--spacing-md) 0;
  padding: var(--spacing-md);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: var(--shadow-sm);
  min-height: 130px;
}

.meeting-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.meeting-item h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: bold;
  color: #f8f8f8;
}

.meeting-item p {
  font-size: 0.95rem;
  margin: 5px 0;
  color: #ddd;
}

.meeting-item.past {
  opacity: 0.75;
  color: #bbb;
  background-color: rgba(30, 30, 30, 0.6);
}

/* Badge "En cours" */
.meeting-status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  background-color: var(--success-color);
  color: white;
  font-weight: bold;
  font-size: 0.85rem;
  margin-bottom: var(--spacing-sm);
  align-self: flex-start;
}

/* Info salle */
.meeting-salle {
  font-weight: bold;
  margin: 4px 0;
  color: #ddd;
}

/* Bouton rejoindre */
.meeting-item button {
  align-self: flex-end;
  background-color: var(--primary-color);
  border: none;
  border-radius: var(--border-radius-sm);
  color: white;
  padding: var(--spacing-sm) var(--spacing-lg);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: var(--transition-fast);
  margin-top: var(--spacing-sm);
  box-shadow: var(--shadow-sm);
}

.meeting-item button:hover {
  background-color: var(--primary-color-light);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Barre de progression */
.meeting-progress-container {
  width: 100%;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  margin: var(--spacing-sm) 0;
  overflow: hidden;
}

.meeting-progress-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 1s linear;
  background-color: #e05667;
}

/* Informations de progression */
.meeting-progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 5px 0;
  font-size: 0.9rem;
}

.time-info {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 0.85rem;
  color: #ddd;
  margin-top: 5px;
}

.time-remaining {
  font-weight: bold;
  color: white;
  display: flex;
  align-items: center;
  gap: 5px;
}
