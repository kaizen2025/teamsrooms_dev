// static/js/booking.js

// Initialisation du modal de réservation
function initBookingModal() {
    const modal = document.getElementById('bookingModal');
    const overlay = document.getElementById('bookingModalOverlay');
    const openButtons = document.querySelectorAll('#createMeetingTeamsBtnHeader, #createMeetingBtnFooter, #menu-reservation-salle');
    const closeButton = document.getElementById('closeBookingModalBtn');
    const cancelButton = document.getElementById('cancelBookingBtn');
    const form = document.getElementById('bookingForm');
    const roomSelect = document.getElementById('bookingRoomSelect');
    const dateInput = document.getElementById('bookingDate');
    const startTimeInput = document.getElementById('bookingStartTime');
    const endTimeInput = document.getElementById('bookingEndTime');
    const quickDurationBtnsContainer = document.getElementById('quickDurationBtns');
    const statusDiv = document.getElementById('bookingStatus');

    if (!modal || !overlay || !closeButton || !cancelButton || !form || !roomSelect || !dateInput || !startTimeInput || !endTimeInput || !quickDurationBtnsContainer) {
        console.error("Éléments du modal de réservation manquants.");
        return;
    }

    // --- Ouverture du Modal ---
    openButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            resetBookingForm(); // Réinitialiser le formulaire à chaque ouverture
            populateRoomSelect(); // Remplir la liste des salles
            setDefaultDateTime(); // Pré-remplir date/heure
            overlay.classList.add('visible');
            // Tenter de focus le premier champ
             setTimeout(() => document.getElementById('bookingTitle')?.focus(), 100);
        });
    });

    // --- Fermeture du Modal ---
    const closeModal = () => {
        overlay.classList.remove('visible');
    };
    closeButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) { // Fermer seulement si clic sur l'overlay direct
            closeModal();
        }
    });

    // --- Gestion du Formulaire ---
    form.addEventListener('submit', handleBookingSubmit);

    // --- Gestion des boutons de durée rapide ---
    quickDurationBtnsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('duration-button')) {
            const buttons = quickDurationBtnsContainer.querySelectorAll('.duration-button');
            buttons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            updateEndTimeFromDuration(parseInt(e.target.dataset.minutes, 10));
        }
    });

    // Mettre à jour l'heure de fin si l'heure de début change
    startTimeInput.addEventListener('change', () => {
        const activeButton = quickDurationBtnsContainer.querySelector('.duration-button.active');
        if (activeButton) {
            updateEndTimeFromDuration(parseInt(activeButton.dataset.minutes, 10));
        }
    });
     // Mettre à jour la durée active si l'heure de fin change manuellement
    endTimeInput.addEventListener('change', updateActiveDurationButton);

}

// Réinitialiser le formulaire
function resetBookingForm() {
    const form = document.getElementById('bookingForm');
    const statusDiv = document.getElementById('bookingStatus');
    if (form) form.reset();
    if (statusDiv) {
        statusDiv.textContent = '';
        statusDiv.className = 'form-status'; // Reset classes
    }
    // Réactiver le bouton de durée 30 min par défaut
    const quickDurationBtnsContainer = document.getElementById('quickDurationBtns');
    if(quickDurationBtnsContainer) {
        quickDurationBtnsContainer.querySelectorAll('.duration-button').forEach(btn => btn.classList.remove('active'));
        const defaultDurationBtn = quickDurationBtnsContainer.querySelector('[data-minutes="30"]');
        if (defaultDurationBtn) defaultDurationBtn.classList.add('active');
    }
}

// Remplir le select des salles
function populateRoomSelect() {
    const roomSelect = document.getElementById('bookingRoomSelect');
    if (!roomSelect) return;

    roomSelect.innerHTML = '<option value="" selected disabled>Chargement...</option>'; // Indicateur

    // Utiliser les salles de la config globale
    const salles = Object.keys(window.SALLES || {});
    if (salles.length > 0) {
        roomSelect.innerHTML = '<option value="" selected disabled>Sélectionnez une salle</option>'; // Reset
        salles.sort().forEach(salleName => {
            const option = document.createElement('option');
            option.value = salleName; // Utiliser le nom comme valeur
            option.textContent = salleName;
            roomSelect.appendChild(option);
        });
         // Pré-sélectionner la salle si on est sur une page de salle spécifique
        if (window.APP_CONTEXT && !window.APP_CONTEXT.isAllResources && window.APP_CONTEXT.resourceType === 'room') {
            const currentRoomOption = roomSelect.querySelector(`option[value="${window.APP_CONTEXT.resourceName}"]`);
             if (currentRoomOption) {
                currentRoomOption.selected = true;
            }
        }

    } else {
        roomSelect.innerHTML = '<option value="" selected disabled>Aucune salle configurée</option>';
    }
}

// Pré-remplir date et heure (au prochain créneau de 15 min)
function setDefaultDateTime() {
    const dateInput = document.getElementById('bookingDate');
    const startTimeInput = document.getElementById('bookingStartTime');
    const endTimeInput = document.getElementById('bookingEndTime');

    if (!dateInput || !startTimeInput || !endTimeInput) return;

    const now = new Date();
    const minutes = now.getMinutes();
    const nextQuarterHour = Math.ceil((minutes + 1) / 15) * 15; // +1 pour éviter l'heure actuelle pile

    const startDate = new Date(now);
    startDate.setMinutes(nextQuarterHour, 0, 0); // Arrondir au prochain 1/4h

    // Gérer le passage à l'heure ou au jour suivant
    if (nextQuarterHour >= 60) {
        startDate.setHours(startDate.getHours() + 1);
        startDate.setMinutes(0, 0, 0);
    }

    // Format YYYY-MM-DD
    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;

    // Format HH:MM
    const startHours = String(startDate.getHours()).padStart(2, '0');
    const startMinutes = String(startDate.getMinutes()).padStart(2, '0');
    startTimeInput.value = `${startHours}:${startMinutes}`;

    // Calculer l'heure de fin par défaut (30 min)
    updateEndTimeFromDuration(30);
}

// Mettre à jour l'heure de fin basée sur la durée sélectionnée
function updateEndTimeFromDuration(durationMinutes) {
    const startTimeInput = document.getElementById('bookingStartTime');
    const endTimeInput = document.getElementById('bookingEndTime');
    if (!startTimeInput || !endTimeInput || !startTimeInput.value) return;

    const startTime = startTimeInput.value.split(':');
    const startHour = parseInt(startTime[0], 10);
    const startMinute = parseInt(startTime[1], 10);

    if (isNaN(startHour) || isNaN(startMinute)) return;

    const startDate = new Date(); // Date fictive pour calcul
    startDate.setHours(startHour, startMinute, 0, 0);

    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

    const endHours = String(endDate.getHours()).padStart(2, '0');
    const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
    endTimeInput.value = `${endHours}:${endMinutes}`;
}

// Mettre à jour le bouton de durée actif si l'heure de fin change
function updateActiveDurationButton() {
    const startTimeInput = document.getElementById('bookingStartTime');
    const endTimeInput = document.getElementById('bookingEndTime');
    const quickDurationBtnsContainer = document.getElementById('quickDurationBtns');

     if (!startTimeInput || !endTimeInput || !quickDurationBtnsContainer || !startTimeInput.value || !endTimeInput.value) return;

    const startTime = startTimeInput.value.split(':');
    const endTime = endTimeInput.value.split(':');
    const startHour = parseInt(startTime[0], 10);
    const startMinute = parseInt(startTime[1], 10);
    const endHour = parseInt(endTime[0], 10);
    const endMinute = parseInt(endTime[1], 10);

     if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) return;

    const startDate = new Date(2000, 0, 1, startHour, startMinute); // Date arbitraire
    const endDate = new Date(2000, 0, 1, endHour, endMinute);

     // Gérer le cas où la fin est le jour suivant (ex: 23:00 - 01:00)
     if (endDate < startDate) {
         endDate.setDate(endDate.getDate() + 1);
     }

    const durationMinutes = Math.round((endDate - startDate) / 60000);

    const buttons = quickDurationBtnsContainer.querySelectorAll('.duration-button');
    let foundMatch = false;
    buttons.forEach(btn => {
        if (parseInt(btn.dataset.minutes, 10) === durationMinutes) {
            btn.classList.add('active');
            foundMatch = true;
        } else {
            btn.classList.remove('active');
        }
    });

     if (!foundMatch) {
        // Si aucune durée exacte ne correspond, désactiver tous les boutons
        buttons.forEach(btn => btn.classList.remove('active'));
    }
}


// Gérer la soumission du formulaire
async function handleBookingSubmit(event) {
    event.preventDefault(); // Empêcher la soumission HTML standard
    const form = event.target;
    const submitButton = document.getElementById('submitBookingBtn');
    const statusDiv = document.getElementById('bookingStatus');

    if (!submitButton || !statusDiv) return;

    // Afficher un état de chargement
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Création...';
    statusDiv.textContent = '';
    statusDiv.className = 'form-status';

    // Récupérer les données du formulaire
    const bookingData = {
        title: document.getElementById('bookingTitle').value.trim(),
        room: document.getElementById('bookingRoomSelect').value,
        date: document.getElementById('bookingDate').value,
        startTime: document.getElementById('bookingStartTime').value,
        endTime: document.getElementById('bookingEndTime').value,
        // Participants nettoyés (emails séparés par des points-virgules)
        participants: document.getElementById('bookingParticipants').value
                        .split(/[,;]+/) // Séparer par virgule ou point-virgule
                        .map(email => email.trim())
                        .filter(email => email.length > 0 && email.includes('@')), // Garder emails valides
        // Ajouter d'autres champs si nécessaire (ex: createTeamsMeeting)
        createTeamsMeeting: true // Par défaut pour une réunion Teams
    };

     // Validation simple (ajouter plus si nécessaire)
     if (!bookingData.title || !bookingData.room || !bookingData.date || !bookingData.startTime || !bookingData.endTime) {
         showBookingStatus("Veuillez remplir tous les champs obligatoires.", 'error');
         submitButton.disabled = false;
         submitButton.innerHTML = '<i class="fas fa-check"></i> Créer la réunion';
         return;
     }

     // Construire les dates/heures complètes pour l'API
     // Attention aux fuseaux horaires ici ! Supposons que l'API attend UTC ou gère la conversion.
     const startDateTime = `${bookingData.date}T${bookingData.startTime}:00`; // Format ISO simplifié
     const endDateTime = `${bookingData.date}T${bookingData.endTime}:00`;

     // Vérifier si l'heure de fin est après l'heure de début
     if (new Date(endDateTime) <= new Date(startDateTime)) {
        showBookingStatus("L'heure de fin doit être après l'heure de début.", 'error');
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-check"></i> Créer la réunion';
        return;
     }


    console.log("Envoi de la réservation:", {
        subject: bookingData.title,
        start: startDateTime, // Envoyer au format attendu par l'API
        end: endDateTime,     // Envoyer au format attendu par l'API
        location: bookingData.room, // Ou l'email de la salle si nécessaire
        attendees: bookingData.participants,
        // body: "Réunion réservée via l'application.", // Optionnel
        isOnlineMeeting: bookingData.createTeamsMeeting
    });


    try {
        // ***** SIMULATION D'APPEL API *****
        // Remplacer par votre appel fetch réel à window.API_URLS.CREATE_MEETING
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simuler délai réseau
        const success = Math.random() > 0.2; // Simuler succès/échec aléatoire
        if (!success) throw new Error("Erreur simulée du serveur.");
        // ***** FIN SIMULATION *****

        /* Exemple d'appel fetch réel (à adapter) :
        const response = await fetch(window.API_URLS.CREATE_MEETING, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Ajouter l'authentification si nécessaire (ex: Bearer token)
                // 'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                subject: bookingData.title,
                start: startDateTime,
                end: endDateTime,
                location: bookingData.room, // ou window.SALLES[bookingData.room] si l'API attend l'email
                attendees: bookingData.participants,
                isOnlineMeeting: bookingData.createTeamsMeeting
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `Erreur ${response.status}`);
        }
        const result = await response.json();
        console.log("Réponse API:", result);
        */

        showBookingStatus("Réunion créée avec succès !", 'success');
        // Fermer le modal après un court délai
        setTimeout(() => {
            document.getElementById('bookingModalOverlay').classList.remove('visible');
            fetchMeetings(true); // Rafraîchir la liste des réunions
        }, 2000);

    } catch (error) {
        console.error("Erreur lors de la création de la réunion:", error);
        showBookingStatus(`Erreur: ${error.message}`, 'error');
    } finally {
        // Réactiver le bouton
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-check"></i> Créer la réunion';
    }
}

// Afficher les messages de statut dans le modal
function showBookingStatus(message, type = 'info') { // type: 'info', 'success', 'error'
    const statusDiv = document.getElementById('bookingStatus');
    if (statusDiv) {
        statusDiv.textContent = message;
        statusDiv.className = `form-status ${type}`; // Appliquer la classe de style
    }
}


// Initialisation gérée par app.js
console.log("booking.js chargé.");
