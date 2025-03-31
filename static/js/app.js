// static/js/app.js

/**
 * Script principal de l'application Teams Rooms Dashboard
 * Gère l'initialisation, les interactions UI, et l'orchestration des modules.
 * Version 2.0.1 - Complète et Consolidée
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 DOM Chargé. Initialisation de l'application v2.0.1...");
    try {
        // Vérifier que les objets de configuration sont présents
        if (typeof window.SALLES === 'undefined' || typeof window.REFRESH_INTERVALS === 'undefined' || typeof window.API_URLS === 'undefined') {
            throw new Error("Fichier config.js manquant ou non chargé avant app.js.");
        }
        initApp();
        console.log("✅ Application initialisée avec succès.");
    } catch (error) {
        console.error("❌ Erreur critique lors de l'initialisation:", error);
        document.body.innerHTML = `<div style="padding: 20px; text-align: center; color: white; background-color: #dc3545;">
            <h1>Erreur d'initialisation</h1>
            <p>L'application n'a pas pu démarrer correctement. Vérifiez la console (F12) pour les détails.</p>
            <p><small>${error.message}</small></p>
            </div>`;
    }
});

// Fonction d'initialisation principale
function initApp() {
    // 0. Initialiser le contexte (depuis config.js)
    if (typeof initializeResourceContext !== 'function') throw new Error("initializeResourceContext (config.js) non trouvée.");
    initializeResourceContext();

    // 1. Initialiser l'affichage Date/Heure
    initDateTime();

    // 2. Initialiser l'arrière-plan dynamique
    initBackground();

    // 3. Initialiser le menu latéral (doit être appelé avant d'autres éléments qui en dépendent)
    initSideMenu();

    // 4. Initialiser le panneau des salles (création, affichage/masquage)
    initRoomsPanel();

    // 5. Initialiser les modals (Réservation, Connexion, Aide)
    initModals();

    // 6. Initialiser la barre de contrôles du bas
    initControlsBar();

    // 7. Initialiser le chargement et l'affichage des réunions
    // Vérifier que la fonction fetchMeetings est définie (depuis meetings.js)
    if (typeof fetchMeetings !== 'function') throw new Error("fetchMeetings (meetings.js) non trouvée.");
    initMeetings();

     // 8. Initialiser le chargement et l'affichage des salles
     // Vérifier que la fonction fetchAndDisplayRooms est définie (depuis rooms.js)
    if (typeof fetchAndDisplayRooms !== 'function') throw new Error("fetchAndDisplayRooms (rooms.js) non trouvée.");
    initRooms();

    // 9. Initialiser le système d'authentification (depuis auth.js)
    if (typeof initAuth !== 'function') {
        console.warn("initAuth (auth.js) non trouvée. Le module d'authentification ne sera pas actif.");
    } else {
        initAuth();
    }

    // 10. Appliquer les optimisations visuelles finales
    applyVisualOptimizations();

    // 11. Ajouter des écouteurs d'événements globaux (délégation)
    addGlobalEventListeners();

    // 12. Mettre à jour le titre H1 et le titre de l'onglet
    updatePageDisplayTitle();

     // 13. Démarrer les timers pour les réunions en cours (depuis meetings.js)
     if (typeof startMeetingTimers === 'function') {
        startMeetingTimers();
    }
}

// --- Modules d'Initialisation ---

function initDateTime() {
    const timeElement = document.getElementById('time-display');
    const dateElement = document.getElementById('date-display');
    if (!timeElement || !dateElement) {
        console.warn("Éléments date/heure non trouvés.");
        return;
    }

    function updateClock() {
        try {
            const now = new Date();
            timeElement.textContent = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            let formattedDate = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            dateElement.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
        } catch (e) {
            console.error("Erreur mise à jour horloge:", e);
            timeElement.textContent = "--:--:--";
            dateElement.textContent = "Erreur chargement date";
             // Arrêter l'intervalle en cas d'erreur répétée ?
        }
    }
    updateClock();
    setInterval(updateClock, window.REFRESH_INTERVALS.CLOCK || 1000);
    console.log("Date/Heure initialisé.");
}

function initBackground() {
    const bgContainer = document.getElementById('background-container');
    if (!bgContainer || !window.BACKGROUNDS || window.BACKGROUNDS.length === 0) {
        console.warn("Arrière-plan: Conteneur ou images manquantes. Utilisation couleur par défaut.");
        if (bgContainer) bgContainer.style.backgroundColor = '#202025';
        return;
    }

    let currentBgIndex = Math.floor(Math.random() * window.BACKGROUNDS.length);

    function changeBackground() {
        currentBgIndex = (currentBgIndex + 1) % window.BACKGROUNDS.length;
        const nextImageUrl = window.BACKGROUNDS[currentBgIndex];
        console.log(`Tentative chargement arrière-plan: ${nextImageUrl}`);

        const img = new Image();
        img.onload = () => {
            bgContainer.style.backgroundImage = `url('${nextImageUrl}')`;
            console.log(`Arrière-plan changé: ${nextImageUrl}`);
        };
        img.onerror = () => {
            console.error(`Impossible de charger l'arrière-plan: ${nextImageUrl}. Essai suivant.`);
            // Peut-être retirer l'image de la liste ou réessayer plus tard
            setTimeout(changeBackground, 5000); // Réessayer après 5s en cas d'erreur
        };
        img.src = nextImageUrl;
    }

    // Charger immédiatement le premier arrière-plan
     const initialImageUrl = window.BACKGROUNDS[currentBgIndex];
     const initialImg = new Image();
     initialImg.onload = () => { bgContainer.style.backgroundImage = `url('${initialImageUrl}')`; };
     initialImg.onerror = () => { console.error(`Impossible de charger l'arrière-plan initial: ${initialImageUrl}`); };
     initialImg.src = initialImageUrl;

    setInterval(changeBackground, window.REFRESH_INTERVALS.BACKGROUND || 3600000);
    console.log("Arrière-plan dynamique initialisé.");
}

function initSideMenu() {
    const menuToggleBtn = document.getElementById('menuToggleVisible');
    const sideMenu = document.getElementById('sideMenu');
    const mainContainer = document.querySelector('.main-container');
    const overlay = document.getElementById('pageOverlay');

    if (!menuToggleBtn || !sideMenu || !mainContainer || !overlay) {
        console.error("Éléments DOM clés pour le menu latéral manquants.");
        return;
    }

    const isMobile = () => window.innerWidth <= 768;

    const toggleMenu = (forceOpen = null) => {
        const shouldBeOpen = forceOpen !== null ? forceOpen : !sideMenu.classList.contains('expanded');

        sideMenu.classList.toggle('expanded', shouldBeOpen);
        mainContainer.classList.toggle('menu-expanded', shouldBeOpen);

        // Gérer l'overlay seulement sur mobile
        if (isMobile()) {
            overlay.classList.toggle('visible', shouldBeOpen && !document.querySelector('.rooms-section.visible')); // N'active l'overlay que si le panel rooms n'est pas visible
        } else {
             overlay.classList.remove('visible'); // Assurer que l'overlay n'est pas actif sur desktop
        }

        console.log(`Menu latéral ${shouldBeOpen ? 'ouvert' : 'fermé'}`);
        // Recalculer centrage titre après transition CSS
        setTimeout(updatePageDisplayTitle, 350);
    };

    menuToggleBtn.addEventListener('click', (e) => {
         e.stopPropagation(); // Eviter que le clic ne ferme le menu via le listener document
         toggleMenu();
    });

    // Fermer menu au clic sur l'overlay (mobile uniquement)
    overlay.addEventListener('click', () => {
        if (isMobile() && sideMenu.classList.contains('expanded')) {
            toggleMenu(false);
        }
    });

    // Fermer le menu si on clique en dehors sur desktop/mobile, ou sur un item
    document.addEventListener('click', (e) => {
        // Ne pas fermer si on clique sur le bouton toggle lui-même
        if (menuToggleBtn.contains(e.target)) return;

        const clickedInsideMenu = sideMenu.contains(e.target);
        const menuItemLink = e.target.closest('a.menu-item');

        // Si le menu est ouvert ET (clic en dehors OU clic sur un lien interne non-#)
        if (sideMenu.classList.contains('expanded') && (!clickedInsideMenu || (menuItemLink && !menuItemLink.href.endsWith('#')))) {
             if (isMobile() || !clickedInsideMenu) { // Fermer si mobile OU clic en dehors sur desktop
                toggleMenu(false);
             }
            if (menuItemLink) {
                // Gérer l'état actif
                 sideMenu.querySelectorAll('.menu-item.active').forEach(item => item.classList.remove('active'));
                 menuItemLink.classList.add('active');
            }
        }
    });

    console.log("Menu latéral initialisé.");
}

function initRoomsPanel() {
    const roomsSection = document.getElementById('roomsSection');
    const openButtons = document.querySelectorAll('#toggleRoomsBtn, #menuToggleRoomsBtn');
    const closeButton = document.getElementById('closeRoomsSectionBtn');
    const overlay = document.getElementById('pageOverlay');
    const roomsListContainer = document.getElementById('roomsList'); // Container pour les cartes

    if (!roomsSection || !closeButton || !overlay || openButtons.length === 0 || !roomsListContainer) {
        console.error("Éléments DOM clés pour le panneau des salles manquants.");
        return;
    }

    const toggleRoomsPanel = (show) => {
        if (show) {
            // S'assurer que le menu latéral est fermé sur mobile avant d'ouvrir le panel
            if (window.innerWidth <= 768 && document.getElementById('sideMenu')?.classList.contains('expanded')) {
                 document.getElementById('menuToggleVisible')?.click(); // Simuler clic pour fermer menu
            }
            fetchAndDisplayRooms(); // Recharger les salles à chaque ouverture
            roomsSection.classList.add('visible');
            overlay.classList.add('visible');
            updateRoomsButtonText(true);
            console.log("Panneau des salles ouvert");
        } else {
            roomsSection.classList.remove('visible');
            // Ne masquer l'overlay que si le menu mobile n'est pas ouvert non plus
             if (!document.getElementById('sideMenu')?.classList.contains('expanded') || window.innerWidth > 768) {
                overlay.classList.remove('visible');
            }
            updateRoomsButtonText(false);
            console.log("Panneau des salles fermé");
        }
    };

    openButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
             e.stopPropagation(); // Eviter propagation au document
             toggleRoomsPanel(!roomsSection.classList.contains('visible')); // Toggle state
        });
    });

    closeButton.addEventListener('click', () => toggleRoomsPanel(false));

    // Fermer si clic sur l'overlay (et que le panel est visible)
    overlay.addEventListener('click', () => {
        if (roomsSection.classList.contains('visible')) {
            toggleRoomsPanel(false);
        }
    });

     // Gérer clic sur une carte de salle (délégation sur le conteneur)
     roomsListContainer.addEventListener('click', (e) => {
        const roomCard = e.target.closest('.room-card');
        if (roomCard) {
            const roomName = roomCard.dataset.roomName;
            if (roomName) {
                console.log(`Clic sur salle: ${roomName}`);
                // Changer l'URL et le contexte sans recharger la page
                window.history.pushState({ resource: roomName }, roomName, `/${roomName}`);
                initializeResourceContext(); // Met à jour APP_CONTEXT basé sur la nouvelle URL
                updatePageDisplayTitle(); // Met à jour le titre H1 et document.title
                displayMeetings(); // Rafraîchit l'affichage des réunions pour la salle sélectionnée
                toggleRoomsPanel(false); // Ferme le panel des salles
            }
        }
    });

    console.log("Panneau des salles initialisé.");
}


function initModals() {
    // Initialisation Modal Réservation (depuis booking.js)
    if (typeof initBookingModal === 'function') {
        initBookingModal();
    } else {
        console.error("initBookingModal (booking.js) non trouvée.");
    }

    // Initialisation Modal Connexion (depuis auth.js)
    // La logique d'ouverture/fermeture est déjà dans initAuth()

    // Initialisation Modal Aide
    initHelpModal(); // La fonction est définie dans ce fichier app.js

    console.log("Modals initialisés.");
}

function initHelpModal() {
    const helpBtn = document.getElementById('helpBtn');
    const overlay = document.getElementById('helpModalOverlay'); // Assurez-vous que cet ID existe dans le HTML
    const modal = document.getElementById('helpModal');
    const closeBtn = document.getElementById('closeHelpModalBtn');
    const body = document.getElementById('helpModalBody');

    if (!helpBtn || !overlay || !modal || !closeBtn || !body) {
        console.warn("Éléments du modal d'aide manquants. Le bouton Aide ne fonctionnera pas.");
        return;
    }

    // Créer l'overlay s'il n'existe pas (sécurité)
    if (!overlay) {
        console.warn("Création dynamique de l'overlay pour le modal d'aide.");
        overlay = document.createElement('div');
        overlay.id = 'helpModalOverlay';
        overlay.className = 'modal-overlay'; // Utiliser la classe CSS standard
        document.body.appendChild(overlay);
        overlay.appendChild(modal); // Mettre le modal dans l'overlay
    }


    helpBtn.addEventListener('click', () => {
        // Contenu de l'aide
        body.innerHTML = `
            <h4 style="margin-top:0; color: var(--primary-color-light);">Gestion des Salles</h4>
            <p>Cliquez sur <strong>"Afficher les salles"</strong> (en bas ou dans le menu) pour voir leur disponibilité. Cliquez sur une carte de salle pour filtrer les réunions de cette salle spécifique.</p>
            <h4 style="color: var(--primary-color-light);">Réservation de Réunion</h4>
            <p>Utilisez le bouton <strong>"Créer une réunion Teams"</strong> (en haut à droite) ou <strong>"Créer une réunion"</strong> (en bas) ou l'option <strong>"Salle de réunion"</strong> dans le menu latéral pour ouvrir le formulaire.</p>
            <h4 style="color: var(--primary-color-light);">Rejoindre une Réunion</h4>
            <p>Cliquez sur le bouton <span class="btn btn-sm btn-primary" style="pointer-events:none;"><i class="fas fa-video"></i> Rejoindre</span> à côté d'une réunion listée.</p>
            <p>Ou entrez l'ID complet de la réunion dans le champ en bas du panneau de droite et cliquez sur <span class="btn btn-sm btn-success" style="pointer-events:none;"><i class="fas fa-arrow-right"></i> Rejoindre</span>.</p>
             <h4 style="color: var(--primary-color-light);">Participants</h4>
             <p>Cliquez sur les points de suspension <button class="show-more-participants" style="pointer-events:none; background:transparent; border:none; color: var(--primary-color-light); cursor:default;">...</button> à côté des participants pour afficher la liste complète.</p>
             <h4 style="color: var(--primary-color-light);">Rafraîchissement</h4>
            <p>Les données se rafraîchissent automatiquement. Cliquez sur <span class="btn btn-sm"><i class="fas fa-sync-alt"></i> Rafraîchir</span> pour forcer une mise à jour immédiate.</p>
            <hr style="border-color: var(--border-color); margin: var(--spacing-md) 0;">
            <p><small>Version ${window.APP_CONFIG?.VERSION || 'N/A'}</small></p>
        `;
        overlay.classList.add('visible');
    });

    const closeHelp = () => overlay.classList.remove('visible');
    closeBtn.addEventListener('click', closeHelp);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeHelp(); // Ferme si clic sur l'arrière-plan
    });
    console.log("Modal d'aide initialisé.");
}

function initControlsBar() {
    const refreshBtn = document.getElementById('refreshBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const createMeetingBtnFooter = document.getElementById('createMeetingBtnFooter'); // Bouton spécifique du footer

    if (!refreshBtn || !fullscreenBtn || !createMeetingBtnFooter) {
        console.warn("Certains boutons de la barre de contrôle sont manquants.");
    }

    // Bouton Rafraîchir
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            console.log("Rafraîchissement manuel demandé.");
            const icon = refreshBtn.querySelector('i');
            if (icon) { icon.classList.add('fa-spin'); setTimeout(() => icon.classList.remove('fa-spin'), 1000); }
            if (typeof fetchMeetings === 'function') fetchMeetings(true);
            if (typeof fetchAndDisplayRooms === 'function') fetchAndDisplayRooms();
        });
    }

    // Bouton Plein Écran
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullScreen);
        document.addEventListener('fullscreenchange', updateFullscreenButton);
        updateFullscreenButton(); // Mettre à jour l'état initial
    }

     // Bouton Créer Réunion (Footer) - Ouvre le modal de réservation
     if (createMeetingBtnFooter) {
        createMeetingBtnFooter.addEventListener('click', () => {
            document.getElementById('bookingModalOverlay')?.classList.add('visible');
             // Tenter de focus le premier champ
             setTimeout(() => document.getElementById('bookingTitle')?.focus(), 100);
        });
    }

    console.log("Barre de contrôles initialisée.");
}

// --- Fonctions Utilitaires ---

// Basculer le mode plein écran
function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Erreur passage plein écran: ${err.message} (${err.name})`);
            alert("Impossible de passer en mode plein écran.");
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
    // L'état du bouton est mis à jour par l'event listener 'fullscreenchange'
}

// Mettre à jour l'icône et le texte du bouton plein écran
function updateFullscreenButton() {
     const btn = document.getElementById('fullscreenBtn');
     if (!btn) return;
     const textSpan = btn.querySelector('.btn-text');
     const textClass = textSpan ? textSpan.className : 'btn-text';

    if (document.fullscreenElement) {
        btn.innerHTML = `<i class="fas fa-compress"></i> <span class="${textClass}">Quitter</span>`;
        btn.title = "Quitter le mode plein écran";
    } else {
        btn.innerHTML = `<i class="fas fa-expand"></i> <span class="${textClass}">Plein Écran</span>`;
        btn.title = "Passer en mode plein écran";
    }
}

// Fonction globale pour rejoindre une réunion via ID ou URL
// S'assure qu'elle est définie pour être appelée depuis meetings.js ou les listeners
function joinMeetingWithId(meetingId) {
    if (!meetingId || typeof meetingId !== 'string' ) {
        console.error("Tentative de rejoindre avec ID invalide:", meetingId);
        alert("ID de réunion invalide fourni.");
        return;
    }
    meetingId = meetingId.replace(/\s+/g, '').trim(); // Nettoyer l'ID

    // Logique pour construire l'URL Teams (peut nécessiter ajustement selon format ID réel)
    // Format standard: 19:meeting_GENERATED_ID@thread.v2
    // Si l'ID fourni n'a pas ce format, l'URL pourrait ne pas fonctionner.
    const teamsUrl = `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${meetingId}%40thread.v2/0`;

    console.log(`Tentative de rejoindre Teams (${meetingId}) via URL: ${teamsUrl}`);
    // Ouvrir dans un nouvel onglet
    const newWindow = window.open(teamsUrl, "_blank");
     if (!newWindow || newWindow.closed || typeof newWindow.closed=='undefined') {
        // Le popup blocker a peut-être interféré
         alert("Impossible d'ouvrir le lien Teams. Veuillez vérifier votre bloqueur de popups.");
    }
}

// Mettre à jour le titre H1 et le titre de l'onglet
function updatePageDisplayTitle() {
    const salleTitleSpan = document.getElementById('salle-title');
    const pageTitleElement = document.getElementById('pageTitle'); // Le H1

    if (!salleTitleSpan || !pageTitleElement || !window.APP_CONTEXT) {
         console.warn("Impossible de mettre à jour le titre, éléments manquants.");
         return;
     }

    const type = window.APP_CONTEXT.resourceType;
    let name = window.APP_CONTEXT.resourceName;
    let displayTitle = '';
    let mainTitle = 'Salles de Réunion'; // Titre H1 par défaut

    // Formater le nom pour affichage (Majuscule initiale)
    const formatName = (n) => n === 'toutes les salles' ? 'Toutes les salles' : n.charAt(0).toUpperCase() + n.slice(1);

    if (type === 'room') {
        displayTitle = formatName(name);
        if (name !== 'toutes les salles') {
            mainTitle = `Salle de Réunion`; // Garder le H1 générique
        }
    } else {
        // Adapter pour d'autres types si nécessaire
        displayTitle = formatName(name);
        mainTitle = `Réservation ${type}`;
    }

    pageTitleElement.firstChild.textContent = `${mainTitle} `; // Met à jour la partie fixe du H1
    salleTitleSpan.textContent = displayTitle; // Met à jour le span dynamique
    document.title = `${displayTitle} | Anecoop France`;

    console.log(`Titre mis à jour: ${mainTitle} ${displayTitle}`);
}

// Optimisations Visuelles (Ex: Masquer Sync Info)
function applyVisualOptimizations() {
    const syncInfoElement = document.getElementById('syncInfo');
    if (syncInfoElement) {
         // Masquer l'info de synchro par défaut
         syncInfoElement.style.display = 'none';
         console.log("Info de synchronisation masquée.");
    }
    // Ajouter d'autres optimisations si nécessaire
}

// --- Gestion des Événements Globaux (Délégation) ---

function addGlobalEventListeners() {
    const meetingsListContainer = document.getElementById('meetingsList');
    const roomsListContainer = document.getElementById('roomsList'); // Ajouté pour les cartes salle

    // Délégation pour les éléments dans la liste des réunions
    if (meetingsListContainer) {
        meetingsListContainer.addEventListener('click', (e) => {
            const joinButton = e.target.closest('.meeting-join-btn');
            const showMoreBtn = e.target.closest('.show-more-participants');

            if (joinButton) {
                e.preventDefault();
                handleJoinButtonClick(joinButton);
            } else if (showMoreBtn) {
                 e.preventDefault();
                 handleShowMoreParticipants(showMoreBtn);
            }
             // Ajouter d'autres actions si nécessaire (clic sur l'item entier?)
        });
    } else {
        console.warn("Conteneur #meetingsList non trouvé pour la délégation d'événements.");
    }

    // La délégation pour les cartes de salle est gérée dans initRoomsPanel() car elle a besoin de fermer le panel.

    // Gérer le changement d'URL via Précédent/Suivant du navigateur
    window.addEventListener('popstate', (event) => {
        console.log("Popstate event:", event.state);
        initializeResourceContext(); // Réinitialiser le contexte basé sur la nouvelle URL
        updatePageDisplayTitle();
        displayMeetings(); // Re-filtrer les réunions
        // Mettre à jour l'état actif du menu si nécessaire
    });

    console.log("Écouteurs d'événements globaux ajoutés.");
}

// --- Fonctions Handler pour la Délégation ---

function handleJoinButtonClick(button) {
    if (button.disabled) return;

    const originalHtml = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    const joinUrl = button.dataset.url;
    const meetingId = button.dataset.meetingId;

    const restoreButton = () => {
        setTimeout(() => {
            button.disabled = false;
            button.innerHTML = originalHtml;
        }, 1500); // Délai pour que l'utilisateur voie le spinner
    };

    if (joinUrl) {
        console.log(`Ouverture URL directe: ${joinUrl}`);
        window.open(joinUrl, "_blank");
        restoreButton();
    } else if (meetingId) {
        console.log(`Jointure par ID: ${meetingId}`);
        joinMeetingWithId(meetingId); // Utilise la fonction globale
        restoreButton();
    } else {
        console.error("Aucune URL ou ID trouvé sur le bouton rejoindre.");
        alert("Impossible de rejoindre cette réunion (données manquantes).");
        restoreButton(); // Restaurer même en cas d'erreur
    }
}

function handleShowMoreParticipants(button) {
     const meetingItem = button.closest('.meeting-item');
     const meetingId = meetingItem?.dataset.id; // Utiliser l'ID stocké sur l'item
     const participantsContainer = meetingItem?.querySelector('.meeting-participants');

     if (!meetingId || !participantsContainer) {
         console.error("Impossible de trouver l'ID de réunion ou le conteneur de participants.");
         return;
     }

     // Trouver la réunion correspondante dans les données globales `meetingsData` (définies dans meetings.js)
     if (typeof meetingsData === 'undefined') {
          console.error("Variable globale meetingsData non trouvée.");
          return;
     }
     const meeting = meetingsData.find(m => (m.id || m.title) === meetingId); // Comparer ID ou titre

     if (!meeting || !Array.isArray(meeting.participants)) {
         console.warn(`Aucune donnée de participants trouvée pour la réunion ${meetingId}.`);
         // Optionnel: Masquer le bouton si pas de participants à afficher
         button.style.display = 'none';
         return;
     }

     // Reconstruire la liste complète des participants
     let fullParticipantsHtml = '<i class="fas fa-users" title="Participants"></i>';
     meeting.participants.forEach(p => {
        // Afficher l'email complet dans le title, et une version courte comme texte
        const displayName = typeof p === 'string' ? p.split('@')[0] : 'Participant';
        const emailTitle = typeof p === 'string' ? p : 'Email inconnu';
        fullParticipantsHtml += `<span class="participant-email" title="${emailTitle}">${displayName}</span>`;
     });

     // Remplacer le contenu et supprimer le bouton "..."
     participantsContainer.innerHTML = fullParticipantsHtml;
     console.log(`Affichage complet des participants pour ${meetingId}`);
}


// --- FIN ---
console.log("app.js chargé et prêt.");
