// static/js/app.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 DOM Chargé. Initialisation de l'application v2.0...");
    try {
        initApp();
        console.log("✅ Application initialisée avec succès.");
    } catch (error) {
        console.error("❌ Erreur critique lors de l'initialisation:", error);
        // Afficher un message d'erreur à l'utilisateur si l'app ne peut pas démarrer
        document.body.innerHTML = `<div style="padding: 20px; text-align: center; color: white; background-color: #dc3545;">
            <h1>Erreur d'initialisation</h1>
            <p>L'application n'a pas pu démarrer correctement. Veuillez réessayer plus tard.</p>
            <p><small>${error.message}</small></p>
            </div>`;
    }
});

// Fonction d'initialisation principale
function initApp() {
    // 0. Initialiser le contexte (salle/ressource actuelle)
    initializeResourceContext(); // Fonction de config.js

    // 1. Initialiser l'affichage Date/Heure
    initDateTime();

    // 2. Initialiser l'arrière-plan dynamique
    initBackground();

    // 3. Initialiser le menu latéral
    initSideMenu();

    // 4. Initialiser le panneau des salles (affichage/masquage)
    initRoomsPanel();

    // 5. Initialiser les modals (Réservation, Connexion, Aide)
    initModals();

    // 6. Initialiser la barre de contrôles du bas
    initControlsBar();

    // 7. Initialiser le chargement et l'affichage des réunions
    initMeetings();

     // 8. Initialiser le chargement et l'affichage des salles
    initRooms();

    // 9. Initialiser le système d'authentification (si nécessaire)
    initAuth(); // Fonction d'auth.js

    // 10. Appliquer les optimisations visuelles finales
    applyVisualOptimizations();

    // 11. Ajouter des écouteurs d'événements globaux (délégation)
    addGlobalEventListeners();

     // 12. Mettre à jour le titre de la page
     updatePageDisplayTitle();
}

// --- Modules d'Initialisation ---

function initDateTime() {
    const timeElement = document.getElementById('time-display');
    const dateElement = document.getElementById('date-display');

    function updateClock() {
        const now = new Date();
        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
        if (dateElement) {
            let formattedDate = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            dateElement.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
        }
    }

    updateClock(); // Appel initial
    setInterval(updateClock, window.REFRESH_INTERVALS.CLOCK || 1000);
    console.log("Date/Heure initialisé.");
}

function initBackground() {
    const bgContainer = document.getElementById('background-container');
    if (!bgContainer || !window.BACKGROUNDS || window.BACKGROUNDS.length === 0) {
         console.warn("Conteneur d'arrière-plan ou liste d'images manquante.");
         if (bgContainer) bgContainer.style.backgroundColor = '#333'; // Fond par défaut
        return;
    }

    let currentBgIndex = Math.floor(Math.random() * window.BACKGROUNDS.length);

    function changeBackground() {
        currentBgIndex = (currentBgIndex + 1) % window.BACKGROUNDS.length;
        // Précharger l'image suivante pour une transition plus douce
        const img = new Image();
        img.onload = () => {
             bgContainer.style.backgroundImage = `url('${window.BACKGROUNDS[currentBgIndex]}')`;
             console.log(`Arrière-plan changé: ${window.BACKGROUNDS[currentBgIndex]}`);
        }
        img.onerror = () => {
            console.error(`Impossible de charger l'arrière-plan: ${window.BACKGROUNDS[currentBgIndex]}`);
            // Essayer le suivant
            setTimeout(changeBackground, 500);
        }
        img.src = window.BACKGROUNDS[currentBgIndex];
    }

    changeBackground(); // Premier changement
    setInterval(changeBackground, window.REFRESH_INTERVALS.BACKGROUND || 3600000);
    console.log("Arrière-plan dynamique initialisé.");
}

function initSideMenu() {
    const menuToggleBtn = document.getElementById('menuToggleVisible');
    const sideMenu = document.getElementById('sideMenu');
    const mainContainer = document.querySelector('.main-container');
    const overlay = document.getElementById('pageOverlay'); // Overlay global

    if (!menuToggleBtn || !sideMenu || !mainContainer || !overlay) {
        console.error("Éléments du menu latéral manquants.");
        return;
    }

    const isMobile = () => window.innerWidth <= 768;

    const toggleMenu = (forceOpen = null) => {
        const isOpen = sideMenu.classList.contains('expanded');
        const shouldOpen = forceOpen !== null ? forceOpen : !isOpen;

        if (shouldOpen) {
            sideMenu.classList.add('expanded');
            mainContainer.classList.add('menu-expanded');
            if (isMobile()) {
                overlay.classList.add('visible');
            }
        } else {
            sideMenu.classList.remove('expanded');
            mainContainer.classList.remove('menu-expanded');
             if (isMobile()) {
                 overlay.classList.remove('visible');
             }
        }
         // Recalculer centrage titre après transition
         setTimeout(updatePageDisplayTitle, 350);
    };

    menuToggleBtn.addEventListener('click', () => toggleMenu());

    // Fermer menu au clic sur l'overlay (mobile) ou sur un item
    overlay.addEventListener('click', () => {
        if (isMobile() && sideMenu.classList.contains('expanded')) {
            toggleMenu(false);
        }
    });

    sideMenu.addEventListener('click', (e) => {
        // Fermer si clic sur un lien direct (pas un groupe ou autre)
        const menuItem = e.target.closest('a.menu-item');
        if (menuItem && !menuItem.href.endsWith('#')) { // Ne pas fermer pour les liens #
             if (isMobile()) {
                toggleMenu(false);
            }
             // Mettre à jour l'état actif
             sideMenu.querySelectorAll('.menu-item.active').forEach(item => item.classList.remove('active'));
             menuItem.classList.add('active');
        }
    });

    console.log("Menu latéral initialisé.");
}


function initRoomsPanel() {
    const roomsSection = document.getElementById('roomsSection');
    const openButtons = document.querySelectorAll('#toggleRoomsBtn, #menuToggleRoomsBtn'); // Boutons pour ouvrir
    const closeButton = document.getElementById('closeRoomsSectionBtn');
    const overlay = document.getElementById('pageOverlay'); // Overlay global

    if (!roomsSection || !closeButton || !overlay || openButtons.length === 0) {
        console.error("Éléments du panneau des salles manquants.");
        return;
    }

    const toggleRoomsPanel = (show) => {
        if (show) {
            fetchAndDisplayRooms(); // Charger les salles avant d'afficher
            roomsSection.classList.add('visible');
            overlay.classList.add('visible'); // Utiliser l'overlay global
            updateRoomsButtonText(true);
        } else {
            roomsSection.classList.remove('visible');
            overlay.classList.remove('visible');
            updateRoomsButtonText(false);
        }
    };

    openButtons.forEach(btn => {
        btn.addEventListener('click', () => toggleRoomsPanel(true));
    });

    closeButton.addEventListener('click', () => toggleRoomsPanel(false));

    overlay.addEventListener('click', () => {
        if (roomsSection.classList.contains('visible')) {
            toggleRoomsPanel(false);
        }
    });

     // Gérer clic sur une carte de salle (délégation)
     roomsSection.addEventListener('click', (e) => {
        const roomCard = e.target.closest('.room-card');
        if (roomCard) {
            const roomName = roomCard.dataset.roomName;
            if (roomName) {
                console.log(`Clic sur salle: ${roomName}`);
                // Option 1: Filtrer les réunions (si fonction existe)
                // filterMeetingsByRoom(roomName);
                // Option 2: Naviguer vers la page de la salle
                // window.location.href = `/${roomName}`;
                // Pour l'instant, on ferme le panel et met à jour le titre (comme si on naviguait)
                window.history.pushState({}, roomName, `/${roomName}`); // Change URL sans recharger
                initializeResourceContext(); // Met à jour APP_CONTEXT
                updatePageDisplayTitle(); // Met à jour le titre H1
                displayMeetings(); // Refiltre les réunions affichées
                toggleRoomsPanel(false); // Ferme le panel
            }
        }
    });


    console.log("Panneau des salles initialisé.");
}

// Met à jour le texte des boutons Afficher/Masquer Salles
function updateRoomsButtonText(isVisible) {
    const openButtons = document.querySelectorAll('#toggleRoomsBtn, #menuToggleRoomsBtn');
    const iconClass = isVisible ? 'fa-door-closed' : 'fa-door-open';
    const text = isVisible ? 'Masquer les salles' : 'Afficher les salles';

    openButtons.forEach(btn => {
        const textSpan = btn.querySelector('.btn-text, .button-text'); // Chercher span texte
        if (textSpan) {
            btn.innerHTML = `<i class="fas ${iconClass}"></i> <span class="${textSpan.className}">${text}</span>`;
        } else {
             // Si pas de span (ex: bouton menu réduit ou mobile)
             btn.innerHTML = `<i class="fas ${iconClass}"></i>`;
             btn.title = text; // Mettre en tooltip
        }
    });
}

function initModals() {
    // Initialisation spécifique à chaque modal
    initBookingModal(); // Fonction de booking.js
    // initLoginModal(); // Fonction d'auth.js (si elle existe)
    initHelpModal();

    console.log("Modals initialisés.");
}

function initHelpModal() {
    const helpBtn = document.getElementById('helpBtn');
    const overlay = document.getElementById('helpModalOverlay');
    const modal = document.getElementById('helpModal');
    const closeBtn = document.getElementById('closeHelpModalBtn');
    const body = document.getElementById('helpModalBody');

    if (!helpBtn || !overlay || !modal || !closeBtn || !body) {
        console.warn("Éléments du modal d'aide manquants.");
        return;
    }

    helpBtn.addEventListener('click', () => {
        // Charger le contenu de l'aide (peut être statique ou dynamique)
        body.innerHTML = `
            <h4 style="margin-top:0;">Gestion des Salles</h4>
            <p>Cliquez sur "Afficher les salles" pour voir leur disponibilité. Cliquez sur une salle pour voir ses réunions.</p>
            <h4>Réservation</h4>
            <p>Utilisez le bouton "Créer une réunion" (en haut à droite ou en bas) ou le menu latéral pour ouvrir le formulaire de réservation.</p>
            <h4>Rejoindre une Réunion</h4>
            <p>Cliquez sur "Rejoindre" à côté d'une réunion, ou entrez son ID en bas à droite et cliquez sur le bouton flèche.</p>
            <hr>
            <p><small>Version ${window.APP_CONFIG?.VERSION || 'N/A'}</small></p>
        `;
        overlay.classList.add('visible');
    });

    const closeHelp = () => overlay.classList.remove('visible');
    closeBtn.addEventListener('click', closeHelp);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeHelp();
    });
}


function initControlsBar() {
    const refreshBtn = document.getElementById('refreshBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');

    // Bouton Rafraîchir
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            console.log("Rafraîchissement manuel demandé.");
             // Animer l'icône
            const icon = refreshBtn.querySelector('i');
            if (icon) {
                icon.classList.add('fa-spin');
                setTimeout(() => icon.classList.remove('fa-spin'), 1000);
            }
            fetchMeetings(true); // Force refresh réunions
            if (typeof fetchAndDisplayRooms === 'function') { // Si rooms.js est chargé
                fetchAndDisplayRooms(); // Force refresh salles
            }
        });
    }

    // Bouton Plein Écran
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullScreen);
        document.addEventListener('fullscreenchange', updateFullscreenButton);
    }

    console.log("Barre de contrôles initialisée.");
}

function toggleFullScreen() {
    const btn = document.getElementById('fullscreenBtn');
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Erreur passage plein écran: ${err.message} (${err.name})`);
        });
        if(btn) btn.innerHTML = '<i class="fas fa-compress"></i> <span class="btn-text">Quitter Plein Écran</span>';
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        if(btn) btn.innerHTML = '<i class="fas fa-expand"></i> <span class="btn-text">Plein Écran</span>';
    }
}

function updateFullscreenButton() {
     const btn = document.getElementById('fullscreenBtn');
     if (!btn) return;
     const textSpan = btn.querySelector('.btn-text');
     const textClass = textSpan ? textSpan.className : 'btn-text'; // Conserver la classe si elle existe

    if (document.fullscreenElement) {
        btn.innerHTML = `<i class="fas fa-compress"></i> <span class="${textClass}">Quitter</span>`;
         btn.title = "Quitter le mode plein écran";
    } else {
        btn.innerHTML = `<i class="fas fa-expand"></i> <span class="${textClass}">Plein Écran</span>`;
         btn.title = "Passer en mode plein écran";
    }
}

function initMeetings() {
    // Assurer que fetchMeetings est défini
    if (typeof fetchMeetings !== 'function') {
        console.error("La fonction fetchMeetings n'est pas définie !");
        return;
    }

    fetchMeetings(true); // Premier chargement forcé

    // Démarrer le rafraîchissement automatique si configuré
    if (window.APP_CONFIG.AUTO_REFRESH_MEETINGS) {
        setInterval(() => fetchMeetings(false), window.REFRESH_INTERVALS.MEETINGS || 30000);
        console.log("Rafraîchissement automatique des réunions démarré.");
    }

     // Démarrer les timers de progression
     if (typeof startMeetingTimers === 'function') {
         startMeetingTimers();
     }

    // Initialiser le bouton de jointure par ID
    const joinByIdBtn = document.getElementById('joinMeetingByIdBtn');
    const meetingIdInput = document.getElementById('meetingIdInput');
    if (joinByIdBtn && meetingIdInput) {
        joinByIdBtn.addEventListener('click', () => {
            const meetingId = meetingIdInput.value.trim();
             if (meetingId) {
                 joinMeetingWithId(meetingId); // Utilise la fonction globale définie (potentiellement dans join.js ou ici)
             } else {
                 alert("Veuillez entrer un ID de réunion.");
                 meetingIdInput.focus();
            }
        });
         // Permettre de rejoindre avec Entrée
         meetingIdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                joinByIdBtn.click();
            }
        });
    }


    console.log("Module réunions initialisé.");
}

function initRooms() {
     // Assurer que la fonction est définie
     if (typeof fetchAndDisplayRooms !== 'function') {
        console.error("La fonction fetchAndDisplayRooms n'est pas définie !");
        return;
    }
     // Démarrer le chargement/rafraîchissement des salles
     if (typeof startRoomStatusUpdates === 'function') {
        startRoomStatusUpdates();
    } else {
         fetchAndDisplayRooms(); // Chargement unique si pas de refresh auto
     }
     console.log("Module salles initialisé.");
}


function applyVisualOptimizations() {
    // Masquer les informations de synchronisation (méthode propre via CSS)
    const syncInfoElement = document.getElementById('syncInfo');
    if (syncInfoElement) {
        // syncInfoElement.classList.add('sync-info-hidden'); // Masquer via CSS
         syncInfoElement.style.display = 'none'; // Ou masquer directement
    }

    // S'assurer que les styles de largeur réduite de la barre de contrôle sont appliqués (normalement géré par CSS)
    const controlsBar = document.getElementById('controlsBar');
    if (controlsBar) {
        // Le CSS devrait déjà le faire avec position:fixed et width/transform.
        // On pourrait forcer ici si le CSS ne s'applique pas correctement.
        console.log("Styles de la barre de contrôle gérés par CSS.");
    }

    console.log("Optimisations visuelles appliquées.");
}


// Fonction globale pour rejoindre une réunion (utilisée par meetings.js et le bouton ID)
function joinMeetingWithId(meetingId) {
    if (!meetingId) {
        alert("ID de réunion invalide.");
        return;
    }
    meetingId = meetingId.replace(/\s+/g, ''); // Nettoyer l'ID

    // Construire l'URL Teams directe (format standard)
    // Note: Le format exact peut varier légèrement. Celui-ci est courant.
    // Le `19:` indique un chat/canal, `%3A` est `:`, `meeting_` préfixe, `%40` est `@`
    const teamsUrl = `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${meetingId}%40thread.v2/0`;

    console.log(`Tentative de rejoindre Teams via URL: ${teamsUrl}`);
    window.open(teamsUrl, "_blank"); // Ouvre dans un nouvel onglet
}

// Mettre à jour le titre H1 et le titre de la page
function updatePageDisplayTitle() {
    const salleTitleSpan = document.getElementById('salle-title');
    const pageTitleElement = document.getElementById('pageTitle'); // Le H1 complet

    if (!salleTitleSpan || !pageTitleElement || !window.APP_CONTEXT) return;

    const type = window.APP_CONTEXT.resourceType;
    const name = window.APP_CONTEXT.resourceName;
    let displayTitle = '';

    if (type === 'room') {
        if (name === 'toutes les salles') {
            displayTitle = 'Toutes les salles';
            pageTitleElement.textContent = `Salles de Réunion`; // Titre principal simplifié
        } else {
            displayTitle = name.charAt(0).toUpperCase() + name.slice(1);
             pageTitleElement.textContent = `Salle de Réunion`;
        }
    } else {
        // Gérer autres types si nécessaire
        displayTitle = name.charAt(0).toUpperCase() + name.slice(1);
        pageTitleElement.textContent = `Réservation ${type}`;
    }

    salleTitleSpan.textContent = displayTitle;
    document.title = `${displayTitle} | Anecoop France`; // Mettre à jour le titre de l'onglet

    // Ajuster le centrage du titre après mise à jour
    // La logique de centrage dans le CSS via transform est généralement suffisante.
}


// Ajouter des écouteurs globaux pour la délégation
function addGlobalEventListeners() {
    const meetingsListContainer = document.getElementById('meetingsList');

    if (meetingsListContainer) {
        meetingsListContainer.addEventListener('click', (e) => {
            // Clic sur bouton "Rejoindre"
            const joinButton = e.target.closest('.meeting-join-btn');
            if (joinButton) {
                e.preventDefault(); // Empêcher comportement par défaut si c'est un lien
                handleJoinButtonClick(joinButton);
                return; // Arrêter la propagation pour ne pas déclencher d'autres clics
            }

            // Clic sur bouton "..." (Afficher plus de participants)
            const showMoreBtn = e.target.closest('.show-more-participants');
            if (showMoreBtn) {
                 e.preventDefault();
                 handleShowMoreParticipants(showMoreBtn);
                 return;
            }

             // Clic sur une réunion entière (pour détails futurs ?)
             const meetingItem = e.target.closest('.meeting-item');
             if (meetingItem && !joinButton && !showMoreBtn) { // S'assurer qu'on ne clique pas sur un bouton interne
                 console.log("Clic sur l'item de réunion:", meetingItem.dataset.id);
                 // Ajouter ici la logique pour afficher les détails de la réunion si nécessaire
             }

        });
    }
     // Gérer les clics sur les cartes de salle a été déplacé dans initRoomsPanel
}

// Gérer le clic sur un bouton Rejoindre (appelé par délégation)
function handleJoinButtonClick(button) {
    if (button.disabled) return; // Empêcher double clic

    const originalHtml = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    const joinUrl = button.dataset.url;
    const meetingId = button.dataset.meetingId;

    if (joinUrl) {
        console.log(`Ouverture URL directe: ${joinUrl}`);
        window.open(joinUrl, "_blank");
         // Réactiver après délai
         setTimeout(() => {
            button.disabled = false;
            button.innerHTML = originalHtml;
        }, 1500);
    } else if (meetingId) {
        console.log(`Jointure par ID: ${meetingId}`);
        joinMeetingWithId(meetingId); // Utilise la fonction globale
         // Réactiver après délai
        setTimeout(() => {
            button.disabled = false;
            button.innerHTML = originalHtml;
        }, 1500);
    } else {
        console.error("Aucune URL ou ID trouvé sur le bouton rejoindre.");
        alert("Impossible de rejoindre cette réunion (données manquantes).");
        button.disabled = false;
        button.innerHTML = originalHtml;
    }
}

// Gérer le clic sur "..." pour afficher plus de participants
function handleShowMoreParticipants(button) {
     const meetingId = button.dataset.meetingId;
     const meetingItem = button.closest('.meeting-item');
     const participantsContainer = meetingItem?.querySelector('.meeting-participants');

     if (!meetingId || !meetingItem || !participantsContainer) return;

     // Trouver la réunion correspondante dans les données
     const meeting = meetingsData.find(m => (m.id || m.title) === meetingId);
     if (!meeting || !meeting.participants) return;

     // Reconstruire la liste complète des participants
     let fullParticipantsHtml = '<i class="fas fa-users" title="Participants"></i>';
     meeting.participants.forEach(p => {
        fullParticipantsHtml += `<span class="participant-email" title="${p}">${p.split('@')[0]}</span>`;
     });

     // Remplacer le contenu et supprimer le bouton "..."
     participantsContainer.innerHTML = fullParticipantsHtml;
     console.log(`Affichage complet des participants pour ${meetingId}`);
}


console.log("app.js chargé et prêt.");
