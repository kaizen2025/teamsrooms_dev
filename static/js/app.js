// static/js/app.js

/**
 * Script principal de l'application Teams Rooms Dashboard
 * Gère l'initialisation, les interactions UI, et l'orchestration des modules.
 * Version 2.0.3 - Complet et Fonctionnel (Correction initApp)
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 DOM Chargé. Initialisation de l'application v2.0.3...");
    try {
        // --- Vérifications de dépendances critiques ---
        if (typeof window.SALLES === 'undefined' || typeof window.REFRESH_INTERVALS === 'undefined' || typeof window.API_URLS === 'undefined') {
            throw new Error("Fichier config.js manquant ou non chargé avant app.js.");
        }
        if (typeof initializeResourceContext !== 'function') throw new Error("initializeResourceContext (config.js) non trouvée.");
        if (typeof fetchMeetings !== 'function') throw new Error("fetchMeetings (meetings.js) non trouvée.");
        if (typeof displayMeetings !== 'function') throw new Error("displayMeetings (meetings.js) non trouvée."); // Ajouté
        if (typeof startMeetingTimers !== 'function') throw new Error("startMeetingTimers (meetings.js) non trouvée."); // Ajouté
        if (typeof fetchAndDisplayRooms !== 'function') throw new Error("fetchAndDisplayRooms (rooms.js) non trouvée.");
        if (typeof startRoomStatusUpdates === 'function') throw new Error("startRoomStatusUpdates (rooms.js) non trouvée."); // Ajouté
        if (typeof initBookingModal !== 'function') throw new Error("initBookingModal (booking.js) non trouvée.");

        // Authentification optionnelle
        if (typeof initAuth !== 'function') {
            console.warn("initAuth (auth.js) non trouvée. Le module d'authentification ne sera pas actif.");
        }
        // --- Fin Vérifications ---

        initApp(); // Lancer l'initialisation principale
        console.log("✅ Application initialisée avec succès.");

    } catch (error) {
        console.error("❌ Erreur critique lors de l'initialisation:", error);
        // Afficher un message d'erreur clair à l'utilisateur
        document.body.innerHTML = `<div style="padding: 20px; text-align: center; color: white; background-color: #ae2a38; font-family: sans-serif; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <div style="background: rgba(0,0,0,0.2); padding: 30px; border-radius: 8px; max-width: 600px;">
                <h1 style="color: white; margin-bottom: 15px; font-size: 1.8em;">Erreur d'initialisation</h1>
                <p style="font-size: 1.1em; margin-bottom: 20px;">L'application n'a pas pu démarrer correctement.<br>Vérifiez la console (F12) pour les détails techniques.</p>
                <p style="background-color: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; display: inline-block; font-family: monospace; color: #ffdddd; font-size: 0.9em; text-align: left; word-break: break-all;">${error.message}</p>
            </div>
            </div>`;
    }
});

// ==========================================================================
// FONCTION D'INITIALISATION PRINCIPALE
// ==========================================================================
function initApp() {
    console.log("initApp: Démarrage...");

    // 0. Initialiser le contexte (salle/ressource actuelle)
    initializeResourceContext(); // Fonction de config.js

    // 1. Initialiser l'affichage Date/Heure
    initDateTime();

    // 2. Initialiser l'arrière-plan dynamique
    initBackground();

    // 3. Initialiser le menu latéral interactif
    initSideMenu();

    // 4. Initialiser le panneau/modal des salles
    initRoomsPanel();

    // 5. Initialiser les différents modals (Réservation, Aide, Connexion)
    initModals();

    // 6. Initialiser la barre de contrôles du bas (footer)
    initControlsBar();

    // 7. Initialiser le chargement et le rafraîchissement des réunions
    fetchMeetings(true); // Premier chargement forcé des réunions
    if (window.APP_CONFIG?.AUTO_REFRESH_MEETINGS) {
        setInterval(() => fetchMeetings(false), window.REFRESH_INTERVALS.MEETINGS || 30000);
        console.log("Rafraîchissement auto réunions démarré.");
    }
    startMeetingTimers(); // Démarrer les timers pour la progression des réunions
    console.log("Module réunions initialisé.");

    // 8. Initialiser le chargement et le rafraîchissement des salles
    startRoomStatusUpdates(); // Lance le premier chargement et le refresh auto
    console.log("Module salles initialisé.");

    // 9. Initialiser le système d'authentification (si disponible)
    if (typeof initAuth === 'function') {
        initAuth();
    }

    // 10. Appliquer les optimisations visuelles finales
    applyVisualOptimizations();

    // 11. Ajouter des écouteurs d'événements globaux (délégation)
    addGlobalEventListeners();

    // 12. Mettre à jour le titre H1 et le titre de l'onglet initial
    updatePageDisplayTitle();

    console.log("initApp: Initialisation terminée.");
}

// ==========================================================================
// MODULES D'INITIALISATION SPÉCIFIQUES
// ==========================================================================

function initDateTime() {
    const timeElement = document.getElementById('time-display');
    const dateElement = document.getElementById('date-display');
    if (!timeElement || !dateElement) {
        console.warn("Éléments DOM #time-display ou #date-display non trouvés.");
        return;
    }
    function updateClock() {
        try {
            const now = new Date();
            timeElement.textContent = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            let formattedDate = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            dateElement.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
        } catch (e) { console.error("Erreur mise à jour horloge:", e); timeElement.textContent = "--:--:--"; dateElement.textContent = "Erreur date"; }
    }
    updateClock();
    setInterval(updateClock, window.REFRESH_INTERVALS.CLOCK || 1000);
    console.log("initDateTime: Module initialisé.");
}

function initBackground() {
    const bgContainer = document.getElementById('background-container');
    if (!bgContainer || !window.BACKGROUNDS || window.BACKGROUNDS.length === 0) {
        console.warn("Arrière-plan: Conteneur ou images manquantes. Utilisation couleur par défaut.");
        if (bgContainer) bgContainer.style.backgroundColor = '#202025'; return;
    }
    let currentBgIndex = Math.floor(Math.random() * window.BACKGROUNDS.length);
    function changeBackground() {
        currentBgIndex = (currentBgIndex + 1) % window.BACKGROUNDS.length;
        const nextImageUrl = window.BACKGROUNDS[currentBgIndex];
        const img = new Image();
        img.onload = () => { bgContainer.style.backgroundImage = `url('${nextImageUrl}')`; console.log(`BG changé: ${nextImageUrl}`); };
        img.onerror = () => { console.error(`Erreur chargement BG: ${nextImageUrl}. Essai suivant.`); setTimeout(changeBackground, 5000); };
        img.src = nextImageUrl;
    }
    const initialImageUrl = window.BACKGROUNDS[currentBgIndex];
    const initialImg = new Image();
    initialImg.onload = () => { bgContainer.style.backgroundImage = `url('${initialImageUrl}')`; };
    initialImg.onerror = () => { console.error(`Erreur chargement BG initial: ${initialImageUrl}`); bgContainer.style.backgroundColor = '#202025';}; // Fallback couleur si 1ere image échoue
    initialImg.src = initialImageUrl;
    setInterval(changeBackground, window.REFRESH_INTERVALS.BACKGROUND || 3600000);
    console.log("initBackground: Module initialisé.");
}

function initSideMenu() {
    const menuToggleBtn = document.getElementById('menuToggleVisible');
    const sideMenu = document.getElementById('sideMenu');
    const mainContainer = document.querySelector('.main-container');
    const overlay = document.getElementById('pageOverlay');
    if (!menuToggleBtn || !sideMenu || !mainContainer || !overlay) { console.error("Éléments DOM clés pour le menu latéral manquants."); return; }
    const isMobile = () => window.innerWidth <= 768;
    const toggleMenu = (forceOpen = null) => {
        const shouldBeOpen = forceOpen !== null ? forceOpen : !sideMenu.classList.contains('expanded');
        sideMenu.classList.toggle('expanded', shouldBeOpen);
        mainContainer.classList.toggle('menu-expanded', shouldBeOpen);
        if (isMobile()) { overlay.classList.toggle('visible', shouldBeOpen && !document.querySelector('.rooms-section.visible')); }
        else { overlay.classList.remove('visible'); }
        console.log(`Menu latéral ${shouldBeOpen ? 'ouvert' : 'fermé'}`);
        setTimeout(updatePageDisplayTitle, 350); // Ajuster titre après transition
    };
    menuToggleBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });
    overlay.addEventListener('click', () => { if (isMobile() && sideMenu.classList.contains('expanded')) { toggleMenu(false); } });
    document.addEventListener('click', (e) => {
        if (menuToggleBtn.contains(e.target)) return;
        const clickedInsideMenu = sideMenu.contains(e.target);
        const menuItemLink = e.target.closest('a.menu-item');
        if (sideMenu.classList.contains('expanded') && (!clickedInsideMenu || (menuItemLink && !menuItemLink.href.endsWith('#')))) {
             if (isMobile() || !clickedInsideMenu) { toggleMenu(false); }
            if (menuItemLink) {
                sideMenu.querySelectorAll('.menu-item.active').forEach(item => item.classList.remove('active'));
                menuItemLink.classList.add('active');
            }
        }
    });
    console.log("initSideMenu: Module initialisé.");
}

function initRoomsPanel() {
    const roomsSection = document.getElementById('roomsSection');
    const openButtons = document.querySelectorAll('#toggleRoomsBtn, #menuToggleRoomsBtn');
    const closeButton = document.getElementById('closeRoomsSectionBtn');
    const overlay = document.getElementById('pageOverlay');
    const roomsListContainer = document.getElementById('roomsList');
    if (!roomsSection || !closeButton || !overlay || openButtons.length === 0 || !roomsListContainer) { console.error("Éléments DOM clés pour le panneau des salles manquants."); return; }
    const toggleRoomsPanel = (show) => {
        if (show) {
            if (window.innerWidth <= 768 && document.getElementById('sideMenu')?.classList.contains('expanded')) { document.getElementById('menuToggleVisible')?.click(); }
            fetchAndDisplayRooms();
            roomsSection.classList.add('visible');
            overlay.classList.add('visible');
            updateRoomsButtonText(true);
            console.log("Panneau salles ouvert");
        } else {
            roomsSection.classList.remove('visible');
            if (!document.getElementById('sideMenu')?.classList.contains('expanded') || window.innerWidth > 768) { overlay.classList.remove('visible'); }
            updateRoomsButtonText(false);
            console.log("Panneau salles fermé");
        }
    };
    openButtons.forEach(btn => { btn.addEventListener('click', (e) => { e.stopPropagation(); toggleRoomsPanel(!roomsSection.classList.contains('visible')); }); });
    closeButton.addEventListener('click', () => toggleRoomsPanel(false));
    overlay.addEventListener('click', () => { if (roomsSection.classList.contains('visible')) { toggleRoomsPanel(false); } });
    roomsListContainer.addEventListener('click', (e) => { // Gérer clic sur carte salle
        const roomCard = e.target.closest('.room-card');
        if (roomCard) {
            const roomName = roomCard.dataset.roomName;
            if (roomName) {
                console.log(`Clic sur salle: ${roomName}, mise à jour contexte et affichage.`);
                window.history.pushState({ resource: roomName }, roomName, `/${roomName}`);
                initializeResourceContext();
                updatePageDisplayTitle();
                if(typeof displayMeetings === 'function') displayMeetings(); else console.error('displayMeetings non définie');
                toggleRoomsPanel(false);
            }
        }
    });
    console.log("initRoomsPanel: Module initialisé.");
}

function initModals() {
    // Booking Modal (fonction définie dans booking.js)
    if (typeof initBookingModal === 'function') { initBookingModal(); } else { console.error("initBookingModal (booking.js) non trouvée."); }
    // Help Modal (fonction définie ci-dessous dans app.js)
    initHelpModal();
    // Login Modal (logique d'ouverture/fermeture est dans initAuth() si auth.js est chargé)
    console.log("initModals: Initialisation des modals (Réservation, Aide).");
}

function initHelpModal() {
    const helpBtn = document.getElementById('helpBtn');
    let overlay = document.getElementById('helpModalOverlay');
    const modal = document.getElementById('helpModal');
    const closeBtn = document.getElementById('closeHelpModalBtn');
    const body = document.getElementById('helpModalBody');
    if (!helpBtn || !modal || !closeBtn || !body) { console.warn("Éléments du modal d'aide manquants."); return; }
    // Créer l'overlay si besoin (sécurité)
    if (!overlay) {
        console.warn("Création dynamique overlay pour modal aide.");
        overlay = document.createElement('div'); overlay.id = 'helpModalOverlay'; overlay.className = 'modal-overlay';
        document.body.appendChild(overlay); overlay.appendChild(modal);
    }
    helpBtn.addEventListener('click', () => {
        body.innerHTML = `
            <h4 style="margin-top:0; color: var(--primary-color-light);">Gestion des Salles</h4><p>Cliquez sur <strong>"Afficher les salles"</strong> (en bas ou dans le menu) pour voir leur disponibilité. Cliquez sur une carte de salle pour filtrer les réunions de cette salle spécifique.</p>
            <h4 style="color: var(--primary-color-light);">Réservation de Réunion</h4><p>Utilisez le bouton <strong>"Créer une réunion Teams"</strong> (en haut à droite) ou <strong>"Créer une réunion"</strong> (en bas) ou l'option <strong>"Salle de réunion"</strong> dans le menu latéral pour ouvrir le formulaire.</p>
            <h4 style="color: var(--primary-color-light);">Rejoindre une Réunion</h4><p>Cliquez sur le bouton <span class="btn btn-sm btn-primary" style="pointer-events:none;"><i class="fas fa-video"></i> Rejoindre</span> à côté d'une réunion listée.</p><p>Ou entrez l'ID complet de la réunion dans le champ en bas du panneau de droite et cliquez sur <span class="btn btn-sm btn-success" style="pointer-events:none;"><i class="fas fa-arrow-right"></i> Rejoindre</span>.</p>
            <h4 style="color: var(--primary-color-light);">Participants</h4><p>Cliquez sur les points de suspension <button class="show-more-participants" style="pointer-events:none; background:transparent; border:none; color: var(--primary-color-light); cursor:default;">...</button> à côté des participants pour afficher la liste complète.</p>
            <h4 style="color: var(--primary-color-light);">Rafraîchissement</h4><p>Les données se rafraîchissent automatiquement. Cliquez sur <span class="btn btn-sm"><i class="fas fa-sync-alt"></i> Rafraîchir</span> pour forcer une mise à jour immédiate.</p>
            <hr style="border-color: var(--border-color); margin: var(--spacing-md) 0;"><p><small>Version ${window.APP_CONFIG?.VERSION || 'N/A'}</small></p>`;
        overlay.classList.add('visible');
    });
    const closeHelp = () => overlay.classList.remove('visible');
    closeBtn.addEventListener('click', closeHelp);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeHelp(); });
    console.log("initHelpModal: Module initialisé.");
}

function initControlsBar() {
    const refreshBtn = document.getElementById('refreshBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const createMeetingBtnFooter = document.getElementById('createMeetingBtnFooter');
    const joinByIdBtn = document.getElementById('joinMeetingByIdBtn'); // Déplacé ici depuis initMeetings
    const meetingIdInput = document.getElementById('meetingIdInput'); // Déplacé ici

    if (refreshBtn) { refreshBtn.addEventListener('click', () => {
            console.log("Rafraîchissement manuel demandé.");
            const icon = refreshBtn.querySelector('i'); if (icon) { icon.classList.add('fa-spin'); setTimeout(() => icon.classList.remove('fa-spin'), 1000); }
            if (typeof fetchMeetings === 'function') fetchMeetings(true);
            if (typeof fetchAndDisplayRooms === 'function') fetchAndDisplayRooms();
        });
    } else console.warn("Bouton #refreshBtn non trouvé.");

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullScreen);
        document.addEventListener('fullscreenchange', updateFullscreenButton);
        updateFullscreenButton(); // État initial
    } else console.warn("Bouton #fullscreenBtn non trouvé.");

    if (createMeetingBtnFooter) { createMeetingBtnFooter.addEventListener('click', () => {
            document.getElementById('bookingModalOverlay')?.classList.add('visible');
            setTimeout(() => document.getElementById('bookingTitle')?.focus(), 100);
        });
    } else console.warn("Bouton #createMeetingBtnFooter non trouvé.");

    // Initialiser jointure par ID (précédemment dans initMeetings)
     if (joinByIdBtn && meetingIdInput) {
        joinByIdBtn.addEventListener('click', () => {
            const meetingId = meetingIdInput.value.trim();
             if (meetingId) { joinMeetingWithId(meetingId); }
             else { alert("Veuillez entrer un ID de réunion."); meetingIdInput.focus(); }
        });
         meetingIdInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { joinByIdBtn.click(); } });
    } else console.warn("Éléments pour rejoindre par ID (#joinMeetingByIdBtn, #meetingIdInput) non trouvés.");


    console.log("initControlsBar: Module initialisé.");
}

// ==========================================================================
// FONCTIONS UTILITAIRES ET HANDLERS
// ==========================================================================

function updateRoomsButtonText(isVisible) {
    const openButtons = document.querySelectorAll('#toggleRoomsBtn, #menuToggleRoomsBtn');
    const iconClass = isVisible ? 'fa-door-closed' : 'fa-door-open';
    const text = isVisible ? 'Masquer les salles' : 'Afficher les salles';
    openButtons.forEach(btn => {
        const textSpan = btn.querySelector('.btn-text, .button-text');
        if (textSpan && window.innerWidth > 768) { // Afficher texte seulement si span existe ET pas mobile
             btn.innerHTML = `<i class="fas ${iconClass}"></i> <span class="${textSpan.className}">${text}</span>`;
        } else { // Icône seulement sur mobile ou si pas de span
             btn.innerHTML = `<i class="fas ${iconClass}"></i>`;
             btn.title = text; // Tooltip important
        }
    });
}

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Erreur plein écran: ${err.message}`); alert("Impossible de passer en mode plein écran."); });
    } else { if (document.exitFullscreen) { document.exitFullscreen(); } }
}

function updateFullscreenButton() {
     const btn = document.getElementById('fullscreenBtn'); if (!btn) return;
     const textSpan = btn.querySelector('.btn-text');
     const textClass = textSpan ? textSpan.className : 'btn-text';
    if (document.fullscreenElement) { btn.innerHTML = `<i class="fas fa-compress"></i> <span class="${textClass}">Quitter</span>`; btn.title = "Quitter plein écran"; }
    else { btn.innerHTML = `<i class="fas fa-expand"></i> <span class="${textClass}">Plein Écran</span>`; btn.title = "Passer en plein écran"; }
     // Masquer texte sur mobile si besoin (pourrait être géré en CSS pur)
     if (window.innerWidth <= 768 && textSpan) textSpan.style.display = 'none';
     else if (textSpan) textSpan.style.display = '';
}

// Fonction globale pour rejoindre (appelée par délégation et bouton ID)
function joinMeetingWithId(meetingId) {
    if (!meetingId || typeof meetingId !== 'string' ) { console.error("Tentative de rejoindre avec ID invalide:", meetingId); alert("ID de réunion invalide fourni."); return; }
    meetingId = meetingId.replace(/\s+/g, '').trim();
    const teamsUrl = `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${meetingId}%40thread.v2/0`;
    console.log(`Tentative rejoindre Teams (${meetingId}) via URL: ${teamsUrl}`);
    const newWindow = window.open(teamsUrl, "_blank");
    if (!newWindow) { alert("Impossible d'ouvrir le lien Teams. Vérifiez votre bloqueur de popups."); }
}

function updatePageDisplayTitle() {
    const salleTitleSpan = document.getElementById('salle-title');
    const pageTitleElement = document.getElementById('pageTitle');
    if (!salleTitleSpan || !pageTitleElement || !window.APP_CONTEXT) { console.warn("Impossible MAJ titre."); return; }
    const type = window.APP_CONTEXT.resourceType;
    let name = window.APP_CONTEXT.resourceName;
    let displayTitle = ''; let mainTitle = 'Salles de Réunion';
    const formatName = (n) => n === 'toutes les salles' ? 'Toutes les salles' : n.charAt(0).toUpperCase() + n.slice(1);
    if (type === 'room') {
        displayTitle = formatName(name);
        if (name !== 'toutes les salles') { mainTitle = `Salle de Réunion`; }
    } else { displayTitle = formatName(name); mainTitle = `Réservation ${type}`; }
    if (pageTitleElement.firstChild && pageTitleElement.firstChild.nodeType === Node.TEXT_NODE) {
         pageTitleElement.firstChild.textContent = `${mainTitle} `; // MAJ partie fixe
     } else {
         pageTitleElement.textContent = `${mainTitle} ${displayTitle}`; // Fallback si structure change
     }
    salleTitleSpan.textContent = displayTitle; // MAJ span dynamique
    document.title = `${displayTitle} | Anecoop France`;
    console.log(`Titre MAJ: ${mainTitle} ${displayTitle}`);
}

function applyVisualOptimizations() {
    const syncInfoElement = document.getElementById('syncInfo');
    if (syncInfoElement) { syncInfoElement.style.display = 'none'; } // Masquer par défaut
    console.log("Optimisations visuelles appliquées.");
    // Ajouter ici d'autres ajustements CSS via JS si nécessaire
}

// --- Gestion Événements Globaux (Délégation) ---
function addGlobalEventListeners() {
    const meetingsListContainer = document.getElementById('meetingsList');
    if (meetingsListContainer) {
        meetingsListContainer.addEventListener('click', (e) => {
            const joinButton = e.target.closest('.meeting-join-btn');
            const showMoreBtn = e.target.closest('.show-more-participants');
            if (joinButton) { e.preventDefault(); handleJoinButtonClick(joinButton); }
            else if (showMoreBtn) { e.preventDefault(); handleShowMoreParticipants(showMoreBtn); }
        });
    } else console.warn("#meetingsList non trouvé pour délégation.");

    window.addEventListener('popstate', (event) => { // Gérer Précédent/Suivant navigateur
        console.log("Popstate event:", event.state);
        initializeResourceContext();
        updatePageDisplayTitle();
        if(typeof displayMeetings === 'function') displayMeetings(); else console.error('displayMeetings non définie');
        // Mettre à jour menu actif ?
    });
    console.log("Écouteurs globaux ajoutés.");
}

// --- Handlers pour Délégation ---
function handleJoinButtonClick(button) {
    if (button.disabled) return;
    const originalHtml = button.innerHTML;
    button.disabled = true; button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    const joinUrl = button.dataset.url; const meetingId = button.dataset.meetingId;
    const restoreButton = () => { setTimeout(() => { button.disabled = false; button.innerHTML = originalHtml; }, 1500); };
    if (joinUrl) { console.log(`Ouverture URL: ${joinUrl}`); window.open(joinUrl, "_blank"); restoreButton(); }
    else if (meetingId) { console.log(`Jointure par ID: ${meetingId}`); joinMeetingWithId(meetingId); restoreButton(); }
    else { console.error("Pas d'URL ou ID sur bouton rejoindre."); alert("Données manquantes pour rejoindre."); restoreButton(); }
}

function handleShowMoreParticipants(button) {
     const meetingItem = button.closest('.meeting-item');
     const meetingId = meetingItem?.dataset.id;
     const participantsContainer = meetingItem?.querySelector('.meeting-participants');
     if (!meetingId || !participantsContainer || typeof meetingsData === 'undefined') { console.error("Impossible d'afficher plus de participants (manque ID, conteneur ou meetingsData)."); return; }
     const meeting = meetingsData.find(m => (m.id || m.title) === meetingId);
     if (!meeting || !Array.isArray(meeting.participants)) { console.warn(`Pas de données participants pour ${meetingId}.`); button.style.display = 'none'; return; }
     let fullParticipantsHtml = '<i class="fas fa-users" title="Participants"></i>';
     meeting.participants.forEach(p => {
        const displayName = typeof p === 'string' ? p.split('@')[0] : 'Participant';
        const emailTitle = typeof p === 'string' ? p : 'Email inconnu';
        fullParticipantsHtml += `<span class="participant-email" title="${emailTitle}">${displayName}</span>`;
     });
     participantsContainer.innerHTML = fullParticipantsHtml;
     console.log(`Affichage complet participants pour ${meetingId}`);
}

// --- Fin du Script ---
console.log("app.js (complet) chargé et prêt.");
