let roomsStatusInterval;

// Fonction pour récupérer et afficher les salles et leur statut
async function fetchAndDisplayRooms() {
    const roomsListContainer = document.getElementById('roomsList');
    const loadingIndicator = document.getElementById('roomsLoading');

    if (!roomsListContainer || !loadingIndicator) {
        console.error("Éléments DOM manquants pour les salles.");
        return;
    }

    loadingIndicator.style.display = 'flex';
    // Optionnel: vider la liste avant de charger pour éviter doublons si appelé plusieurs fois
    // roomsListContainer.innerHTML = '';
    // roomsListContainer.appendChild(loadingIndicator);

    try {
        let roomsData = [];

        // Option 1: Utiliser la config globale si pas d'API
        if (!window.API_URLS.GET_ROOMS) {
            console.warn("API_URLS.GET_ROOMS non défini. Utilisation de window.SALLES.");
            roomsData = Object.keys(window.SALLES || {}).map(name => ({
                name: name,
                email: window.SALLES[name],
                // Statut par défaut ou à récupérer autrement si possible
                status: 'unknown', // 'available', 'occupied', 'soon'
                statusText: 'Statut inconnu',
                details: ''
            }));
            // !! Ici, il faudrait une logique pour déterminer le VRAI statut !!
            // Simuler un statut aléatoire pour la démo (à remplacer)
            roomsData.forEach(room => {
                const rand = Math.random();
                if (rand < 0.6) { room.status = 'available'; room.statusText = 'Disponible'; }
                else if (rand < 0.9) { room.status = 'occupied'; room.statusText = 'Occupée'; room.details = `Jusqu'à ${Math.floor(10 + Math.random() * 8)}:00`; }
                else { room.status = 'soon'; room.statusText = 'Bientôt'; room.details = `À ${Math.floor(10 + Math.random() * 8)}:30`;}
            });

        } else {
            // Option 2: Utiliser une API (MEILLEURE APPROCHE)
            console.log(`Fetching rooms status from ${window.API_URLS.GET_ROOMS}`);
            const response = await fetch(window.API_URLS.GET_ROOMS);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            roomsData = await response.json(); // S'attendre à un format [{name, status, statusText, details}, ...]
            console.log(`Statut des salles récupéré: ${roomsData.length}`);
        }


        // Construire le HTML
        let roomsHtml = '';
        if (roomsData && roomsData.length > 0) {
            // Trier par nom de salle
            roomsData.sort((a, b) => a.name.localeCompare(b.name));

            roomsData.forEach(room => {
                roomsHtml += buildRoomCardHtml(room);
            });
            roomsListContainer.innerHTML = roomsHtml;
        } else {
            roomsListContainer.innerHTML = '<p class="empty-message">Aucune salle trouvée.</p>';
        }

    } catch (error) {
        console.error("Erreur lors de la récupération du statut des salles:", error);
        roomsListContainer.innerHTML = `<p class="error-message">Impossible de charger les salles: ${error.message}</p>`;
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

function buildRoomCardHtml(room) {
    const status = room.status || 'unknown'; // available, occupied, soon, unknown
    const statusText = room.statusText || 'Indisponible';
    const details = room.details || '';

    let iconClass = 'fa-question-circle'; // Icon par défaut
    let statusIconHtml = `<span class="status-icon ${status}"></span>`; // Utiliser la classe CSS pour la couleur/forme

    if (status === 'available') iconClass = 'fa-check-circle';
    else if (status === 'occupied') iconClass = 'fa-times-circle';
    else if (status === 'soon') iconClass = 'fa-hourglass-start';


    return `
        <div class="room-card ${status}" data-room-name="${room.name.toLowerCase()}" title="Afficher les réunions pour ${room.name}">
            <div class="room-name">${room.name}</div>
            <div class="room-status">
                ${statusIconHtml} ${statusText}
            </div>
            ${details ? `<div class="room-time">${details}</div>` : ''}
        </div>`;
}

// Ajouter les écouteurs (utilisera la délégation dans app.js)
function addRoomCardEventListeners(container) {
     console.log("Écouteurs d'événements pour les cartes de salle seront gérés par délégation.");
    // La logique de clic sera dans app.js pour filtrer les réunions
}


// Démarrer/arrêter le rafraîchissement automatique
function startRoomStatusUpdates() {
    stopRoomStatusUpdates(); // Arrêter l'ancien intervalle
    if (window.APP_CONFIG.AUTO_REFRESH_ROOMS) {
        fetchAndDisplayRooms(); // Premier chargement
        roomsStatusInterval = setInterval(fetchAndDisplayRooms, window.REFRESH_INTERVALS.ROOM_STATUS || 60000);
        console.log("Rafraîchissement automatique du statut des salles démarré.");
    }
}

function stopRoomStatusUpdates() {
    if (roomsStatusInterval) {
        clearInterval(roomsStatusInterval);
        roomsStatusInterval = null;
        console.log("Rafraîchissement automatique du statut des salles arrêté.");
    }
}

// Initialisation gérée par app.js
console.log("rooms.js chargé.");
