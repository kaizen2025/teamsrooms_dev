/**
 * TeamsRooms Interface Improvements - Enhanced JavaScript
 * Comprehensive update addressing all feedback including join button functionality,
 * menu organization, UI alignment, and animation improvements
 * Version 10.0 - Optimisée pour la stabilité
 */

document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si déjà initialisé
    if (window._interfaceImprovementsInitialized) {
        console.warn("interface-improvements.js: Initialisation déjà effectuée, ignorée.");
        return;
    }
    window._interfaceImprovementsInitialized = true;
    console.log("interface-improvements.js: Initialisation v3 (Restauration Visuelle)...");

    // Ordre d'initialisation: Structure HTML, puis listeners, puis styles/display
    reorganizeMenu(); // **CORRIGÉ** (HTML menu)
    
    // S'assurer que UISystem est initialisé APRÈS la création du menu
    if (window.UISystem && typeof window.UISystem.init === 'function' && !window.UISystem._initialized) {
        console.log("Interface: Appel explicite de UISystem.init()");
        UISystem.init();
        window.UISystem._initialized = true; // Marquer comme initialisé
    } else if (!window.UISystem) {
        console.error("Interface: UISystem n'est pas chargé/défini !");
    }
    
    // --- SUPPRIMÉ : enhanceMeetingsDisplay() ne doit plus modifier les styles/positions ---
    initializeRoomsDisplay(); // **VÉRIFIÉ** (Gestion boutons/overlay)
    fixJoinButtonsFunctionality(); // Assure le fonctionnement des boutons rejoindre (important)
    ensureMeetingsLoading(); // Vérifie le chargement initial
    initializeHelpFunction(); // Bouton d'aide
    enhanceUIPerformance(); // Optimisations mineures
    hideFloatingRoomButtonOnDesktop(); // **VÉRIFIÉ**
    synchronizeRefreshButtons(); // **VÉRIFIÉ et AMÉLIORÉ**

    // Ajustements CSS finaux
    fixTitleCentering();
    improveDateTimeDisplay();
    
    // Initialisation du texte des boutons de salles
    updateRoomsButtonText(false); // Appel initial pour texte bouton salles
    
    // --- NOUVEAU : Listener pour s'assurer que le bouton refresh est bien positionné ---
    // Cela peut être nécessaire si le CSS original met du temps à s'appliquer
    // ou si d'autres scripts interfèrent.
    setTimeout(ensureRefreshButtonPosition, 500); // Vérifier après un court délai
    
    // 12. MASQUER L'ÉLÉMENT DE SYNCHRONISATION (solution minimaliste)
    try {
        // Cacher l'élément "Dernière synchro" par sélecteur CSS simple
        const style = document.createElement('style');
        style.innerHTML = '.controls-container > div:not(.control-buttons):not([id]) { display: none !important; }';
        document.head.appendChild(style);
    } catch (e) {
        console.log("Erreur lors du masquage de la synchro:", e);
    }
    
    console.log('interface-improvements.js: Initialisation complète v5 - Menu Logic.');
});

/**
 * --- NOUVEAU : Fonction pour vérifier/corriger position refresh ---
 * Assure que le bouton refresh est correctement positionné
 */
function ensureRefreshButtonPosition() {
    const titleBar = document.querySelector('.meetings-title-bar');
    const refreshButton = titleBar ? titleBar.querySelector('.refresh-meetings-btn') : null;
    if (titleBar && refreshButton) {
         // Vérifier si le positionnement absolu est appliqué (attendu par CSS original)
         const style = window.getComputedStyle(refreshButton);
         if (style.position !== 'absolute') {
              console.warn("JS: Forçage position:absolute sur bouton refresh.");
              refreshButton.style.position = 'absolute';
              refreshButton.style.top = '15px'; // Valeurs par défaut du CSS original
              refreshButton.style.right = '15px';
         }
          // S'assurer que le parent est relatif
         if (window.getComputedStyle(titleBar).position === 'static') {
              console.warn("JS: Forçage position:relative sur .meetings-title-bar.");
              titleBar.style.position = 'relative';
         }
    }
}

/**
 * Ensure that meetings are loading properly
 */
function ensureMeetingsLoading() {
    // Check if there's any meeting content
    const meetingsContainer = document.querySelector('.meetings-list');
    if (!meetingsContainer) return;

    // If meetings list is empty or contains only placeholder content
    const hasMeetings = meetingsContainer.querySelector('.meeting-item');
    const emptyMessage = meetingsContainer.querySelector('.empty-meetings-message');
    const loadingIndicator = meetingsContainer.querySelector('.loading-indicator');
    
    if (!hasMeetings && !emptyMessage && !loadingIndicator) {
        console.log("No meetings found, triggering fetch...");
        
        // Create a temporary loading indicator
        const tempLoader = document.createElement('div');
        tempLoader.className = 'loading-indicator';
        tempLoader.innerHTML = `
            <i class="fas fa-circle-notch fa-spin"></i>
            <span>Chargement des réunions...</span>
            <p class="loading-detail">Initialisation...</p>
        `;
        meetingsContainer.appendChild(tempLoader);
        
        // Trigger meetings fetch if window.fetchMeetings exists
        if (typeof window.fetchMeetings === 'function') {
            // Force a refresh with true parameter
            window.fetchMeetings(true);
            
            // Also set up a timer to check again in 10 seconds if no meetings appear
            setTimeout(() => {
                const updatedHasMeetings = meetingsContainer.querySelector('.meeting-item');
                if (!updatedHasMeetings) {
                    console.log("Still no meetings after initial fetch, retrying...");
                    window.fetchMeetings(true);
                }
            }, 10000);
        } else {
            console.error("fetchMeetings function not found");
            tempLoader.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <span>Impossible de charger les réunions</span>
                <p>La fonction de chargement n'est pas disponible</p>
            `;
        }
    }
}

/**
 * Fix join button functionality - CRITICAL issue
 * Only show join button for Teams meetings
 * CORRECTION: Ajout d'un système de drapeaux pour éviter les initialisations multiples
 */
function fixJoinButtonsFunctionality() {
    console.log("Fixing join button functionality");
    
    // CORRECTION: Vérifier si les boutons ont déjà été initialisés
    if (window._joinButtonsFixed) {
        console.log("Les boutons de jointure sont déjà initialisés, ignoré");
        return;
    }
    
    // CORRECTION: Marquer comme initialisé
    window._joinButtonsFixed = true;
  
    // Traiter tous les éléments de réunion pour afficher/masquer correctement les boutons
    const meetingItems = document.querySelectorAll('.meeting-item');
    meetingItems.forEach(meetingItem => {
        const isTeamsMeeting = meetingItem.hasAttribute('data-is-teams') ? 
                            meetingItem.getAttribute('data-is-teams') === 'true' : 
                            meetingItem.querySelector('.meeting-join-btn') !== null;
    
        // Obtenir ou créer un bouton de jointure
        let joinButton = meetingItem.querySelector('.meeting-join-btn');
    
        // Si ce n'est pas une réunion Teams, supprimer le bouton
        if (!isTeamsMeeting) {
            if (joinButton) {
                joinButton.remove();
            }
            return;
        }
    
        // Si le bouton n'existe pas mais devrait exister, le créer
        if (!joinButton && isTeamsMeeting) {
            joinButton = document.createElement('button');
            joinButton.className = 'meeting-join-btn';
            joinButton.innerHTML = '<i class="fas fa-video"></i> Rejoindre';
            meetingItem.appendChild(joinButton);
        }
    
        // Obtenir l'URL de jointure
        const joinUrl = meetingItem.getAttribute('data-url');
        const meetingId = meetingItem.getAttribute('data-id');
    
        // S'assurer que le bouton a les données appropriées
        if (joinUrl) {
            joinButton.setAttribute('data-url', joinUrl);
        } else if (meetingId) {
            joinButton.setAttribute('data-meeting-id', meetingId);
        }
    
        // CORRECTION: Vérifier si le gestionnaire est déjà attaché
        if (joinButton.hasAttribute('data-handler-attached')) {
            return; // Ignorer si déjà traité
        }
        
        // CORRECTION: Marquer comme traité
        joinButton.setAttribute('data-handler-attached', 'true');
    
        // Ajouter un gestionnaire d'événements une seule fois
        joinButton.addEventListener('click', joinMeetingHandler);
    });
  
    // S'assurer également que le bouton principal fonctionne
    const mainJoinButton = document.getElementById('joinMeetingBtn');
    if (mainJoinButton && !mainJoinButton.hasAttribute('data-handler-attached')) {
        // CORRECTION: Marquer comme traité
        mainJoinButton.setAttribute('data-handler-attached', 'true');
        
        mainJoinButton.addEventListener('click', function() {
            const meetingIdInput = document.getElementById('meeting-id') || 
                                document.getElementById('meetingIdInput');
            if (meetingIdInput && meetingIdInput.value) {
                if (window.JoinSystem) {
                    window.JoinSystem.joinMeetingWithId();
                } else {
                    // Fallback basique
                    const teamsUrl = `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${meetingIdInput.value}%40thread.v2/0`;
                    window.open(teamsUrl, '_blank');
                }
            } else {
                alert("Veuillez entrer l'ID de la réunion.");
            }
        });
    }
  
    // Set up a mutation observer to watch for new meeting items
    setupMeetingsObserver();
}

// Fonction de gestionnaire d'événements séparée pour éviter les duplications
function joinMeetingHandler(e) {
    e.preventDefault();
    e.stopPropagation();
  
    // Vérifier si le processus de jointure est déjà en cours
    if (window.JoinSystem && window.JoinSystem.isJoining) {
        console.log("Jointure déjà en cours, ignorer ce clic");
        return;
    }
  
    // Désactiver temporairement le bouton pour éviter les clics multiples
    this.disabled = true;
  
    // Récupérer l'URL depuis le bouton ou le parent
    const buttonUrl = this.getAttribute('data-url');
    const buttonMeetingId = this.getAttribute('data-meeting-id') || 
                        this.parentElement.getAttribute('data-id');
  
    if (buttonUrl) {
        // URL directe disponible, l'ouvrir
        console.log("Opening Teams meeting URL:", buttonUrl);
        window.open(buttonUrl, '_blank');
    
        // Réactiver le bouton après un délai
        setTimeout(() => {
            this.disabled = false;
        }, 2000);
    } else if (buttonMeetingId) {
        // Utiliser le système de jointure avec l'ID
        if (window.JoinSystem) {
            console.log("Using JoinSystem with ID:", buttonMeetingId);
            // Définir l'ID dans le champ d'entrée
            const meetingIdInput = document.getElementById('meeting-id') || 
                              document.getElementById('meetingIdInput');
            if (meetingIdInput) {
                meetingIdInput.value = buttonMeetingId;
            
                // Déclencher la fonction de jointure
                window.JoinSystem.joinMeetingWithId();
            
                // Le JoinSystem gère sa propre réactivation
            } else {
                console.error("Meeting ID input field not found");
                alert("Erreur: Champ d'ID de réunion introuvable.");
                this.disabled = false;
            }
        } else {
            // Fallback si JoinSystem n'est pas disponible
            console.error("Join system not available, using fallback");
            const teamsUrl = `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${buttonMeetingId}%40thread.v2/0`;
            window.open(teamsUrl, '_blank');
          
            // Réactiver le bouton après un délai
            setTimeout(() => {
                this.disabled = false;
            }, 2000);
        }
    } else {
        console.error("No join URL or meeting ID found");
        alert("Impossible de rejoindre cette réunion: URL ou ID manquant.");
        this.disabled = false;
    }
}

/**
 * Set up a mutation observer to watch for new meeting items
 * This ensures newly loaded meetings also get join buttons properly setup
 * CORRECTION: Amélioration pour éviter les initialisations multiples
 */
function setupMeetingsObserver() {
    // CORRECTION: Ne configurer l'observateur qu'une seule fois
    if (window._meetingsObserverSetup) return;
    window._meetingsObserverSetup = true;
    
    const meetingsContainer = document.getElementById('meetingsContainer') || 
                             document.querySelector('.meetings-list');
    
    if (!meetingsContainer) return;
    
    // Create a mutation observer to watch for changes
    const observer = new MutationObserver(function(mutations) {
        let shouldReprocess = false;
        let newMeetingItems = [];
        
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // CORRECTION: Vérifier si des éléments de réunion ont été ajoutés
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Node.ELEMENT_NODE
                        if (node.classList && node.classList.contains('meeting-item')) {
                            newMeetingItems.push(node);
                        } else {
                            // Vérifier si le nœud contient des éléments de réunion
                            const containedItems = node.querySelectorAll('.meeting-item');
                            if (containedItems.length > 0) {
                                containedItems.forEach(item => newMeetingItems.push(item));
                            }
                        }
                    }
                });
                
                if (newMeetingItems.length > 0) {
                    shouldReprocess = true;
                }
            }
        });
        
        if (shouldReprocess) {
            // CORRECTION: Traiter seulement les nouveaux éléments au lieu de tout retraiter
            console.log("Nouveaux éléments de réunion détectés, traitement...", newMeetingItems.length);
            
            newMeetingItems.forEach(meetingItem => {
                const isTeamsMeeting = meetingItem.hasAttribute('data-is-teams') ? 
                                    meetingItem.getAttribute('data-is-teams') === 'true' : 
                                    meetingItem.querySelector('.meeting-join-btn') !== null;
                
                // Obtenir ou créer un bouton de jointure
                let joinButton = meetingItem.querySelector('.meeting-join-btn');
                
                // Si ce n'est pas une réunion Teams, supprimer le bouton
                if (!isTeamsMeeting) {
                    if (joinButton) {
                        joinButton.remove();
                    }
                    return;
                }
                
                // Si le bouton n'existe pas mais devrait exister, le créer
                if (!joinButton && isTeamsMeeting) {
                    joinButton = document.createElement('button');
                    joinButton.className = 'meeting-join-btn';
                    joinButton.innerHTML = '<i class="fas fa-video"></i> Rejoindre';
                    meetingItem.appendChild(joinButton);
                }
                
                // Obtenir l'URL de jointure
                const joinUrl = meetingItem.getAttribute('data-url');
                const meetingId = meetingItem.getAttribute('data-id');
                
                // S'assurer que le bouton a les données appropriées
                if (joinUrl) {
                    joinButton.setAttribute('data-url', joinUrl);
                } else if (meetingId) {
                    joinButton.setAttribute('data-meeting-id', meetingId);
                }
                
                // Vérifier si le gestionnaire est déjà attaché
                if (joinButton.hasAttribute('data-handler-attached')) {
                    return; // Ignorer si déjà traité
                }
                
                // Marquer comme traité
                joinButton.setAttribute('data-handler-attached', 'true');
                
                // Ajouter un gestionnaire d'événements une seule fois
                joinButton.addEventListener('click', joinMeetingHandler);
            });
        }
    });
    
    // Options pour l'observateur: observer les changements dans le contenu et la sous-arborescence
    const observerOptions = {
        childList: true,
        subtree: true
    };
    
    // Start observing
    observer.observe(meetingsContainer, observerOptions);
    console.log("Observateur de réunions configuré");
}

/**
 * Function to update the text on the rooms buttons
 * **RESTAURÉ : Texte complet pour le bouton de la barre de contrôle**
 */
function updateRoomsButtonText(isVisible) {
    const controlRoomsBtn = document.getElementById('showRoomsBtn'); // ID du bouton dans la barre du bas
    const floatingButton = document.querySelector('.rooms-toggle-button-floating');

    // Texte pour le bouton de la barre de contrôle (complet)
    const controlText = isVisible ?
        '<i class="fas fa-times"></i> Masquer les salles' :
        '<i class="fas fa-door-open"></i> Afficher les salles disponibles'; // Texte complet ici

    // Texte pour le bouton flottant (icône seule)
    const floatingText = isVisible ?
        '<i class="fas fa-times"></i>' :
        '<i class="fas fa-door-open"></i>';

    if (controlRoomsBtn) {
        controlRoomsBtn.innerHTML = controlText; // Appliquer le texte complet
        controlRoomsBtn.classList.toggle('active', isVisible);
        controlRoomsBtn.title = isVisible ? "Masquer les salles" : "Afficher les salles disponibles";
        console.log("DEBUG: Texte bouton contrôle MAJ:", controlRoomsBtn.innerText);
    } else {
        // Essayer de trouver via une classe plus générique si l'ID échoue
        const genericControlBtn = document.querySelector('.controls-container .compact-btn[title*="salles"]');
        if(genericControlBtn) {
            genericControlBtn.innerHTML = controlText;
            genericControlBtn.classList.toggle('active', isVisible);
            genericControlBtn.title = isVisible ? "Masquer les salles" : "Afficher les salles disponibles";
            console.warn("DEBUG: Bouton #showRoomsBtn non trouvé, utilisé sélecteur générique.");
        } else {
             console.error("ERREUR: Bouton de contrôle des salles non trouvé.");
        }
    }

    if (floatingButton) {
        floatingButton.innerHTML = floatingText;
        floatingButton.classList.toggle('active', isVisible);
        floatingButton.title = isVisible ? "Masquer les salles" : "Afficher les salles disponibles";
    }
}

/**
 * Reorganize the menu with submenu structure
 * REMOVED the "Afficher les salles" button from the menu bottom
 * REMOVED the Logo div
 * ADDED ID to "Salle de réunion" item
 */
function reorganizeMenu() {
  const menuItemsContainer = document.querySelector('.side-menu .menu-items');
  if (!menuItemsContainer) {
    console.error("Conteneur '.side-menu .menu-items' non trouvé.");
    return;
  }
  console.log("Interface: Réorganisation du menu...");

  // Générer le HTML du menu (SANS logo, SANS bouton "Afficher Salles" en bas)
  menuItemsContainer.innerHTML = `
    <div class="menu-group">
      <div class="menu-group-title">TABLEAU DE BORD</div>
      <a href="/" class="menu-item" data-nav-type="standard">
        <i class="fas fa-home menu-item-icon"></i>
        <span class="menu-item-text">Accueil</span>
      </a>
    </div>
    <div class="menu-group">
      <div class="menu-group-title">RÉSERVATIONS</div>
      <a href="#" class="menu-item" id="menu-reservation-salle" data-nav-type="action">
        <i class="fas fa-calendar-alt menu-item-icon"></i>
        <span class="menu-item-text">Salle de réunion</span>
      </a>
      <a href="/reservation-voiture" class="menu-item" data-nav-type="standard">
        <i class="fas fa-car menu-item-icon"></i>
        <span class="menu-item-text">Réservation voiture</span>
      </a>
      <a href="/prets" class="menu-item" data-nav-type="standard">
        <i class="fas fa-laptop menu-item-icon"></i>
        <span class="menu-item-text">Prêt de matériel</span>
      </a>
    </div>
    <div class="menu-group">
      <div class="menu-group-title">APPLICATIONS</div>
      <a href="https://teams.microsoft.com" target="_blank" class="menu-item" data-nav-type="external">
        <i class="fas fa-users menu-item-icon"></i>
        <span class="menu-item-text">Teams</span>
      </a>
      <a href="https://sage.anecoop-france.com" target="_blank" class="menu-item" data-nav-type="external">
        <i class="fas fa-calculator menu-item-icon"></i>
        <span class="menu-item-text">SAGE</span>
      </a>
      <a href="tel:3cx" class="menu-item" data-nav-type="external">
        <i class="fas fa-phone menu-item-icon"></i>
        <span class="menu-item-text">3CX</span>
      </a>
      <a href="/pulse" class="menu-item" data-nav-type="standard">
        <i class="fas fa-chart-line menu-item-icon"></i>
        <span class="menu-item-text">AnecoopPulse</span>
      </a>
    </div>
    <div class="menu-group" data-role="administrator,manager">
      <div class="menu-group-title">ADMINISTRATION</div>
      <a href="/admin" class="menu-item" data-nav-type="standard">
        <i class="fas fa-cog menu-item-icon"></i>
        <span class="menu-item-text">Paramètres</span>
      </a>
      <a href="/admin/users" class="menu-item" data-nav-type="standard">
        <i class="fas fa-user-cog menu-item-icon"></i>
        <span class="menu-item-text">Utilisateurs</span>
      </a>
    </div>
  `;

  // --- Listeners Spécifiques aux Items du Menu ---

  // 1. Listener pour le lien "Salle de réunion" (Action spécifique)
  const salleMenuItem = menuItemsContainer.querySelector('#menu-reservation-salle');
  if (salleMenuItem) {
    // Utiliser cloneNode pour être sûr de ne pas avoir de vieux listeners
    const newSalleMenuItem = salleMenuItem.cloneNode(true);
    salleMenuItem.parentNode.replaceChild(newSalleMenuItem, salleMenuItem);

    newSalleMenuItem.addEventListener('click', function (e) {
      e.preventDefault(); // Empêche le href="#"
      e.stopPropagation(); // ESSENTIEL: Empêche le document listener de fermer le menu
      console.log("Interface: Clic intercepté sur 'Salle de réunion'");

      if (window.BookingSystem && typeof window.BookingSystem.openModal === 'function') {
        console.log("Interface: Appel de BookingSystem.openModal()");
        window.BookingSystem.openModal(); // Ouvre le modal

        // Fermer le menu sur mobile SEULEMENT
        if (window.innerWidth <= 768 && window.UISystem && typeof window.UISystem.closeSideMenu === 'function') {
             setTimeout(() => window.UISystem.closeSideMenu("booking_action_mobile"), 50); // Léger délai
             console.log("Interface: Fermeture menu mobile demandée après action");
        }
      } else {
        console.error("ERREUR: BookingSystem ou BookingSystem.openModal introuvable !");
        alert("Fonctionnalité de réservation indisponible.");
      }
    });
    console.log("Interface: Listener ajouté à #menu-reservation-salle");
  } else {
    console.error("ERREUR: Élément #menu-reservation-salle non trouvé.");
  }

  // 2. Listener pour les liens de navigation standard (pour fermeture mobile)
  menuItemsContainer.querySelectorAll('a.menu-item[data-nav-type="standard"]').forEach(link => {
       // Utiliser cloneNode pour la propreté
      const newLink = link.cloneNode(true);
      link.parentNode.replaceChild(newLink, link);

      newLink.addEventListener('click', function(e) {
           // PAS de preventDefault() ici, on veut que la navigation se fasse
           // PAS de stopPropagation() ici en général, SAUF si on ferme sur mobile
           console.log(`Interface: Clic sur lien standard: ${this.href}`);

           if (window.innerWidth <= 768 && window.UISystem && typeof window.UISystem.closeSideMenu === 'function') {
               // Fermer après un délai pour laisser la navigation commencer
               console.log("Interface: Fermeture menu mobile différée pour navigation standard.");
               setTimeout(() => window.UISystem.closeSideMenu("standard_nav_mobile"), 150);
               // On pourrait stopper la propagation *seulement ici* si ça cause problème, mais normalement pas besoin.
               // e.stopPropagation();
           }
      });
  });

   // 3. Liens externes (data-nav-type="external") et Action (comme réservation)
   // n'ont PAS besoin de listener ici car leur comportement est géré
   // soit par le navigateur (target="_blank"), soit par leur listener spécifique (réservation).

   console.log("Interface: Listeners spécifiques du menu ajoutés.");
}

/**
 * Add CSS styles for submenu functionality
 */
function addSubmenuStyles() {
    // Create a style element
    const style = document.createElement('style');
    style.textContent = `
        .menu-item-with-submenu {
            position: relative;
        }
        
        .menu-submenu {
            overflow: hidden;
            max-height: 0;
            transition: max-height 0.3s ease;
            padding-left: 25px;
        }
        
        .menu-submenu.expanded {
            max-height: 200px; /* Adjust based on content */
        }
        
        .menu-subitem {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
            padding: 8px 16px;
            margin-bottom: 1px;
            margin-top: 2px;
            border-radius: var(--border-radius-md);
            cursor: pointer;
            transition: var(--transition-fast);
            color: #e0e0e0;
            text-decoration: none;
            white-space: nowrap;
            position: relative;
            overflow: hidden;
            font-size: 0.9rem;
        }
        
        .menu-subitem:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateX(3px);
        }
        
        .menu-dropdown-icon {
            font-size: 0.7rem;
            margin-left: 5px;
            transition: transform 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Fix overlapping buttons issue
 */
function fixButtonOverlap() {
    // Get all room toggle buttons
    const floatingButton = document.querySelector('.rooms-toggle-button-floating');
    const sideMenuButton = document.querySelector('.side-menu .toggle-rooms-button');
    const controlButton = document.getElementById('showRoomsBtn') || document.getElementById('toggleRoomsBtn');
    
    // Make sure we don't have duplicate buttons in the bottom menu
    const controlsContainer = document.querySelector('.controls-container');
    if (controlsContainer) {
        const roomsButtons = controlsContainer.querySelectorAll('button[id*="Room"]');
        if (roomsButtons.length > 1) {
            // Keep only the first one
            for (let i = 1; i < roomsButtons.length; i++) {
                roomsButtons[i].style.display = 'none';
            }
        }
    }
    
    // Fix floating button position to avoid overlap
    if (floatingButton) {
        floatingButton.style.bottom = '80px'; // Move up above the controls
        floatingButton.style.zIndex = '100'; // Ensure it's above other elements
    }
    
    // Remove any hidden duplicate buttons from the DOM
    document.querySelectorAll('.toggle-rooms-button.hidden, .toggle-rooms-button[style*="display: none"]').forEach(btn => {
        if (btn.parentNode) {
            btn.parentNode.removeChild(btn);
        }
    });
}

/**
 * Update buttons text and remove duplicates
 */
function updateButtonsAndLayout() {
    // Update floating button text
    const floatingButton = document.querySelector('.rooms-toggle-button-floating');
    if (floatingButton) {
        floatingButton.innerHTML = '<i class="fas fa-door-open"></i> Afficher les salles disponibles';
        // Add more padding for better appearance
        floatingButton.style.padding = '10px 15px';
        floatingButton.style.borderRadius = '10px';
    }
    
    // Update side menu button text
    const sideMenuButton = document.querySelector('.side-menu .toggle-rooms-button');
    if (sideMenuButton) {
        sideMenuButton.innerHTML = '<i class="fas fa-door-open"></i> <span class="button-text">Afficher les salles disponibles</span>';
    }
    
    // Update text for control button
    const controlButton = document.getElementById('showRoomsBtn') || document.getElementById('toggleRoomsBtn');
    if (controlButton) {
        controlButton.innerHTML = '<i class="fas fa-door-open"></i> Afficher les salles disponibles';
    }
    
    // Remove the logo
    const menuLogo = document.querySelector('.menu-logo');
    if (menuLogo) {
        menuLogo.style.display = 'none';
    }
    
    // Improve the header banner - remove black blur
    const header = document.querySelector('.header');
    if (header) {
        header.style.background = 'rgba(50, 50, 50, 0.6)';
        header.style.backdropFilter = 'blur(5px)';
        header.style.borderRadius = '0 0 15px 15px';
        header.style.margin = '0 10px';
        header.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    }
    
    // Add spacing to the main container
    const mainContainer = document.querySelector('.main-container');
    if (mainContainer) {
        mainContainer.style.padding = '0 10px';
    }
    
    // Make controls bar more rounded and spaced
    const controlsContainer = document.querySelector('.controls-container');
    if (controlsContainer) {
        controlsContainer.style.borderRadius = '15px';
        controlsContainer.style.margin = '10px';
        controlsContainer.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    }
    
    // Improve meetings container
    const meetingsContainer = document.querySelector('.meetings-container');
    if (meetingsContainer) {
        meetingsContainer.style.borderRadius = '15px';
        meetingsContainer.style.margin = '5px 10px';
        meetingsContainer.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    }
}

/**
 * Initialize and fix the left menu functionality
 * avec fermeture en cliquant n'importe où en dehors du menu
 */
function initializeMenu() {
    try {
        const menuToggleBtn = document.querySelector('.menu-toggle-visible');
        const sideMenu = document.querySelector('.side-menu');
        const mainContainer = document.querySelector('.main-container');
        const menuOverlay = document.querySelector('.menu-overlay');
        
        // Ensure menu starts collapsed by default
        if (sideMenu && mainContainer) {
            // Ensure menu starts collapsed
            sideMenu.classList.remove('expanded');
            mainContainer.classList.remove('menu-expanded');
        }
        
        // Utiliser l'overlay partagé
        let clickOverlay = document.getElementById('click-outside-overlay');
        if (!clickOverlay) {
            clickOverlay = document.createElement('div');
            clickOverlay.id = 'click-outside-overlay';
            clickOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: transparent;
                z-index: 500;
                display: none;
            `;
            document.body.appendChild(clickOverlay);
            
            // Gestionnaire pour fermer les menus lors d'un clic sur l'overlay
            clickOverlay.addEventListener('click', function() {
                // Fermer le menu latéral
                if (sideMenu && sideMenu.classList.contains('expanded')) {
                    sideMenu.classList.remove('expanded');
                    if (mainContainer) mainContainer.classList.remove('menu-expanded');
                }
                
                // Fermer aussi la liste des salles si elle est ouverte
                const roomsSection = document.querySelector('.rooms-section');
                if (roomsSection && roomsSection.classList.contains('visible')) {
                    roomsSection.classList.remove('visible');
                    setTimeout(() => {
                        roomsSection.style.display = 'none';
                    }, 300);
                    
                    // Mise à jour du texte des boutons
                    if (typeof updateRoomsButtonText === 'function') {
                        updateRoomsButtonText(false);
                    }
                }
                
                // Cacher l'overlay
                this.style.display = 'none';
                
                // Update title centering
                if (typeof fixTitleCentering === 'function') {
                    setTimeout(fixTitleCentering, 50);
                }
            });
        }
        
        // Remplacer le gestionnaire du menu pour éviter les doublons
        if (menuToggleBtn && sideMenu && mainContainer) {
            // Cloner pour supprimer les gestionnaires existants
            const newMenuToggleBtn = menuToggleBtn.cloneNode(true);
            if (menuToggleBtn.parentNode) {
                menuToggleBtn.parentNode.replaceChild(newMenuToggleBtn, menuToggleBtn);
            }
            
            newMenuToggleBtn.addEventListener('click', function(e) {
                if (e) e.preventDefault();
                
                const isExpanded = sideMenu.classList.contains('expanded');
                
                if (!isExpanded) {
                    // Ouvrir le menu
                    sideMenu.classList.add('expanded');
                    mainContainer.classList.add('menu-expanded');
                    
                    // Afficher l'overlay de détection des clics
                    if (clickOverlay) clickOverlay.style.display = 'block';
                } else {
                    // Fermer le menu
                    sideMenu.classList.remove('expanded');
                    mainContainer.classList.remove('menu-expanded');
                    
                    // Cacher l'overlay
                    if (clickOverlay) clickOverlay.style.display = 'none';
                }
                
                // Gestion de l'overlay mobile existant
                if (window.innerWidth <= 768 && menuOverlay) {
                    if (sideMenu.classList.contains('expanded')) {
                        menuOverlay.classList.add('active');
                    } else {
                        menuOverlay.classList.remove('active');
                    }
                }
                
                // Update title centering
                if (typeof fixTitleCentering === 'function') {
                    setTimeout(fixTitleCentering, 50);
                }
            });
        }
        
        // Empêcher la propagation des clics depuis le menu
        if (sideMenu) {
            sideMenu.addEventListener('click', function(e) {
                if (e) e.stopPropagation();
            });
        }
        
        // Close menu when clicking overlay
        if (menuOverlay) {
            menuOverlay.addEventListener('click', function() {
                sideMenu.classList.remove('expanded');
                mainContainer.classList.remove('menu-expanded');
                menuOverlay.classList.remove('active');
                
                // Update title centering
                if (typeof fixTitleCentering === 'function') {
                    setTimeout(fixTitleCentering, 50);
                }
            });
        }
        
        // Ensure menu items are interactive and close menu on mobile
        const menuItems = document.querySelectorAll('.menu-item:not(.menu-item-with-submenu .menu-item)');
        menuItems.forEach(item => {
            item.addEventListener('click', function(e) {
                // Only handle clicks for items that don't have submenus
                if (!this.querySelector('.menu-dropdown-icon')) {
                    // Remove active class from all menu items
                    menuItems.forEach(i => i.classList.remove('active'));
                    // Add active class to clicked item
                    this.classList.add('active');
                    
                    // On mobile, close the menu after selection
                    if (window.innerWidth <= 768) {
                        sideMenu.classList.remove('expanded');
                        mainContainer.classList.remove('menu-expanded');
                        if (menuOverlay) menuOverlay.classList.remove('active');
                        
                        // Update title centering
                        if (typeof fixTitleCentering === 'function') {
                            setTimeout(fixTitleCentering, 50);
                        }
                    }
                }
            });
        });
    } catch (error) {
        console.log("Erreur dans initializeMenu:", error);
    }
}

/**
 * Fix title centering for both menu states (open/closed)
 */
function fixTitleCentering() {
    const mainContainer = document.querySelector('.main-container');
    const titleContainer = document.querySelector('.title-container');
    const title = document.querySelector('.title');
    
    if (!mainContainer || !titleContainer || !title) return;
    
    // Improve title appearance
    title.style.background = 'rgba(40, 40, 40, 0.7)';
    title.style.padding = '8px 20px';
    title.style.borderRadius = '12px';
    title.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
    
    // Check if on mobile
    if (window.innerWidth <= 768) {
        titleContainer.style.width = '100%';
        titleContainer.style.left = '0';
        titleContainer.style.position = 'relative';
        titleContainer.style.display = 'flex';
        titleContainer.style.justifyContent = 'center';
        titleContainer.style.margin = '10px 0';
        return;
    }
    
    // On desktop, adjust based on menu state
    if (mainContainer.classList.contains('menu-expanded')) {
        // Menu is open
        titleContainer.style.width = 'calc(100% - 250px)';
        titleContainer.style.left = '250px';
    } else {
        // Menu is closed
        titleContainer.style.width = '100%';
        titleContainer.style.left = '0';
    }
}

/**
 * Improve date and time display in the header
 */
function improveDateTimeDisplay() {
    const datetimeElement = document.querySelector('.datetime');
    if (!datetimeElement) return;
    
    // Improve styling
    datetimeElement.style.background = 'rgba(40, 40, 40, 0.7)';
    datetimeElement.style.borderRadius = '12px';
    datetimeElement.style.padding = '8px 15px';
    datetimeElement.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
    datetimeElement.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    datetimeElement.style.margin = '0 10px';
    
    // Ensure proper capitalization of date
    updateDateTimeDisplay();
    
    // Set interval to keep updating
    setInterval(updateDateTimeDisplay, 1000);
}

/**
 * Updates the datetime display with proper capitalization
 */
function updateDateTimeDisplay() {
    const datetimeElement = document.querySelector('.datetime');
    if (!datetimeElement) return;
    
    const now = new Date();
    
    // Format the date in French locale with proper capitalization
    const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    let formattedDate = now.toLocaleDateString('fr-FR', dateOptions);
    // Capitalize first letter
    formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    
    // Format the time with leading zeros
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}:${seconds}`;
    
    // Update the display
    const dateElement = datetimeElement.querySelector('p:first-child');
    const timeElement = datetimeElement.querySelector('p:last-child');
    
    if (dateElement) dateElement.textContent = formattedDate;
    if (timeElement) timeElement.textContent = formattedTime;
}

/**
 * Initialize the rooms display
 * **VÉRIFIÉ** (Gestion boutons/overlay)
 */
function initializeRoomsDisplay() {
  try {
    const roomsSection = document.querySelector('.rooms-section');
    const controlRoomsBtn = document.getElementById('showRoomsBtn') || document.getElementById('toggleRoomsBtn');
    const floatingButton = document.querySelector('.rooms-toggle-button-floating'); // Garder la référence

    if (!roomsSection) {
         console.warn("Section des salles (.rooms-section) non trouvée pour initialisation.");
         // Cacher les boutons si la section n'existe pas
         if(controlRoomsBtn) controlRoomsBtn.style.display = 'none';
         if(floatingButton) floatingButton.style.display = 'none';
         return;
    }

    // S'assurer que la section est initialement cachée
    roomsSection.classList.remove('visible');
    roomsSection.style.display = 'none';

    // Utiliser l'overlay partagé pour fermer au clic extérieur
    let clickOverlay = document.getElementById('click-outside-overlay');
    if (!clickOverlay) {
        clickOverlay = document.createElement('div');
        clickOverlay.id = 'click-outside-overlay';
        clickOverlay.className = 'rooms-overlay'; // Utiliser la classe définie en CSS
        document.body.appendChild(clickOverlay);
    }

    // Fonction pour basculer la visibilité
    const toggleRoomsVisibility = (show) => {
        const currentlyVisible = roomsSection.classList.contains('visible');
        const newState = (typeof show === 'boolean') ? show : !currentlyVisible; // Si show n'est pas défini, inverser

        if (newState === currentlyVisible) return; // Pas de changement

        if (newState) {
            console.log("DEBUG: Affichage des salles demandé");
            roomsSection.style.display = 'block';
            clickOverlay.style.display = 'block'; // Afficher l'overlay
            // Forcer reflow
            roomsSection.offsetHeight;
            // Ajouter classe pour animation
            roomsSection.classList.add('visible');
            clickOverlay.classList.add('visible'); // Animer l'overlay aussi
        } else {
             console.log("DEBUG: Masquage des salles demandé");
            roomsSection.classList.remove('visible');
            clickOverlay.classList.remove('visible'); // Animer l'overlay aussi
            // Masquer après l'animation
            setTimeout(() => {
                if (!roomsSection.classList.contains('visible')) { // Double vérification
                    roomsSection.style.display = 'none';
                    clickOverlay.style.display = 'none';
                }
            }, 300); // Doit correspondre à la durée de transition CSS
        }
        updateRoomsButtonText(newState); // Mettre à jour les boutons
    };

    // Attacher aux boutons (Contrôle et Flottant)
    const allToggleButtons = [controlRoomsBtn, floatingButton].filter(Boolean);
    allToggleButtons.forEach(button => {
        if (!button.hasAttribute('data-rooms-handler-added')) {
             const newButton = button.cloneNode(true);
             if (button.parentNode) {
                  button.parentNode.replaceChild(newButton, button);
                  newButton.addEventListener('click', (e) => {
                      e.preventDefault();
                      e.stopPropagation(); // Empêche de déclencher l'overlay immédiatement
                      toggleRoomsVisibility(); // Basculer
                  });
                  newButton.setAttribute('data-rooms-handler-added', 'true');
             }
        }
    });

    // Attacher à l'overlay pour fermer
     if (!clickOverlay.hasAttribute('data-rooms-handler-added')) {
        clickOverlay.addEventListener('click', (e) => {
             e.preventDefault();
             toggleRoomsVisibility(false); // Forcer la fermeture
        });
        clickOverlay.setAttribute('data-rooms-handler-added', 'true');
     }

     // Empêcher la fermeture si on clique DANS la section des salles
     roomsSection.addEventListener('click', (e) => {
          e.stopPropagation(); // Ne propage pas le clic à l'overlay
     });

    // Fix room cards if they exist
    const roomCards = roomsSection.querySelectorAll('.room-card'); // Cibler DANS la section
    roomCards.forEach(card => {
        if (!card.hasAttribute('data-room-card-handler')) {
            card.addEventListener('click', function(e) {
                const roomName = this.getAttribute('data-room');
                if (roomName) {
                    // Rediriger vers la page de la salle
                     console.log(`DEBUG: Redirection vers la salle: ${roomName}`);
                     window.location.href = '/' + roomName.toLowerCase(); // Assumer structure URL simple
                }
            });
            card.setAttribute('data-room-card-handler', 'true');
        }
    });

  } catch (error) {
    console.log("Erreur dans initializeRoomsDisplay:", error);
  }
}

/**
 * Initialize the help function
 */
function initializeHelpFunction() {
  const helpBtn = document.getElementById('helpBtn');
  
  // Vérifier si le bouton existe ET s'il n'a pas déjà un gestionnaire d'événements
  if (helpBtn && !helpBtn._hasHelpHandler) {
    helpBtn.addEventListener('click', showHelpModal);
    // Marquer le bouton comme ayant un gestionnaire
    helpBtn._hasHelpHandler = true;
  }
  // Ne PAS créer de nouveau bouton d'aide flottant
}

/**
 * Affiche un modal d'aide synthétique
 */
function showHelpModal() {
  // Création du modal d'aide
  const helpModal = document.createElement('div');
  helpModal.className = 'help-modal';
  helpModal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999;
  `;
  
  // Contenu du modal
  helpModal.innerHTML = `
    <div class="help-modal-content" style="
      width: 80%;
      max-width: 800px;
      max-height: 80vh;
      overflow-y: auto;
      background-color: #2c2c2c;
      border-radius: 15px;
      padding: 20px;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
    ">
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <h2 style="color: white; margin: 0;"><i class="fas fa-question-circle"></i> Guide d'utilisation</h2>
        <button id="closeHelpBtn" style="
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
        ">&times;</button>
      </div>
      
      <div style="color: #ddd; line-height: 1.6;">
        <h3 style="color: white; border-bottom: 1px solid rgba(255, 255, 255, 0.2); padding-bottom: 10px;">
          <i class="fas fa-door-open"></i> Gestion des salles
        </h3>
        <p>
          <strong>Consulter les salles</strong> : Cliquez sur le bouton <strong>"Afficher les salles disponibles"</strong> en bas 
          pour voir toutes les salles et leur statut.
        </p>
        <p>
          <strong>Filtrer par salle</strong> : Cliquez sur une salle dans la liste pour voir uniquement les 
          réunions de cette salle.
        </p>
        
        <h3 style="color: white; border-bottom: 1px solid rgba(255, 255, 255, 0.2); padding-bottom: 10px;">
          <i class="fas fa-calendar-plus"></i> Création de réunions
        </h3>
        <p>
          <strong>Réserver une salle</strong> : Cliquez sur le bouton <strong>"Créer une réunion Teams"</strong> en haut 
          du panneau des réunions, ou utilisez le menu <strong>"Salle de réunion"</strong> dans la section Réservations.
        </p>
        
        <h3 style="color: white; border-bottom: 1px solid rgba(255, 255, 255, 0.2); padding-bottom: 10px;">
          <i class="fas fa-video"></i> Rejoindre une réunion
        </h3>
        <p>
          <strong>Méthode 1</strong> : Cliquez sur le bouton <strong>"Rejoindre"</strong> à côté d'une réunion en cours ou à venir.
        </p>
        <p>
          <strong>Méthode 2</strong> : Entrez l'ID de la réunion dans le champ en bas de la liste des réunions et cliquez sur <strong>"Rejoindre"</strong>.
        </p>
        
        <h3 style="color: white; border-bottom: 1px solid rgba(255, 255, 255, 0.2); padding-bottom: 10px;">
          <i class="fas fa-users"></i> Gestion des participants
        </h3>
        <p>
          Pour voir tous les participants d'une réunion, cliquez sur les <strong>trois points</strong> (...) à côté de la liste des participants.
        </p>
        
        <h3 style="color: white; border-bottom: 1px solid rgba(255, 255, 255, 0.2); padding-bottom: 10px;">
          <i class="fas fa-sync-alt"></i> Actualisation
        </h3>
        <p>
          Les réunions se rafraîchissent automatiquement toutes les 10 secondes.
          Pour forcer une actualisation, cliquez sur le bouton <strong>"Rafraîchir"</strong> en bas.
        </p>
      </div>
    </div>
  `;
  
  // Ajouter le modal au document
  document.body.appendChild(helpModal);
  
  // Gérer la fermeture du modal
  document.getElementById('closeHelpBtn').addEventListener('click', () => {
    document.body.removeChild(helpModal);
  });
  
  // Fermer en cliquant en dehors du contenu
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
      document.body.removeChild(helpModal);
    }
  });
}

/**
 * Amélioration globale des performances et de la fluidité
 */
function enhanceUIPerformance() {
  // Optimiser toutes les animations
  document.querySelectorAll('.meeting-item, button, .popup, .modal').forEach(element => {
    element.style.willChange = 'transform, opacity';
    element.style.transition = 'all 0.2s ease-out';
  });

  // Améliorer la précision des zones de clic
  document.querySelectorAll('button, .clickable, [data-action]').forEach(element => {
    if (element.classList.contains('show-more-participants')) {
      element.style.width = '26px';
      element.style.height = '26px';
      element.style.padding = '0';
      element.style.display = 'flex';
      element.style.alignItems = 'center';
      element.style.justifyContent = 'center';
      element.style.zIndex = '5';
    }
  });
}

/**
 * Synchronize refresh buttons functionality
 * **VÉRIFIÉ et AMÉLIORÉ**
 */
function synchronizeRefreshButtons() {
    const controlRefreshBtn = document.getElementById('refreshBtn'); // Barre de contrôle
    const panelRefreshBtn = document.querySelector('.meetings-title-bar .refresh-meetings-btn'); // Panneau meetings

    const handleRefreshClick = (buttonClicked, event) => {
        if (event) event.preventDefault();
        console.log(`DEBUG: Clic sur Rafraîchir (${buttonClicked?.id || 'panel-btn'})`);

        // Sélectionne les DEUX boutons pour gérer leur état
        const buttonsToManage = [controlRefreshBtn, panelRefreshBtn].filter(Boolean); // Filtre au cas où un bouton n'existerait pas

        // Vérifier si un rafraîchissement est déjà en cours (basé sur l'état disabled)
        if (buttonsToManage.some(btn => btn.disabled)) {
            console.log("DEBUG: Rafraîchissement déjà en cours, ignoré.");
            return;
        }

        // Appliquer l'état "loading" aux deux boutons
        buttonsToManage.forEach(button => {
            const icon = button.querySelector('i');
            if (icon) icon.classList.add('fa-spin');
            button.disabled = true;
        });


        if (typeof window.fetchMeetings === 'function') {
            console.log("DEBUG: Appel de window.fetchMeetings(true)");
            window.fetchMeetings(true) // Toujours forcer une mise à jour visible pour un clic manuel
                .catch(error => {
                    console.error("Erreur lors du rafraîchissement manuel:", error);
                    // Afficher une notification d'erreur à l'utilisateur si UISystem existe
                    if (window.UISystem && typeof window.UISystem.showNotification === 'function') {
                        window.UISystem.showNotification("Erreur lors du rafraîchissement.", "error");
                    }
                })
                .finally(() => {
                    // Retirer l'état "loading" après un délai (même en cas d'erreur)
                    setTimeout(() => {
                        buttonsToManage.forEach(button => {
                             const icon = button.querySelector('i');
                             if (icon) icon.classList.remove('fa-spin');
                             button.disabled = false;
                        });
                         console.log("DEBUG: Fin du rafraîchissement manuel.");
                    }, 500); // Délai pour visibilité du spin
                });
        } else {
            console.error("Fonction fetchMeetings non trouvée.");
             // Retirer immédiatement l'état loading si la fonction n'existe pas
             buttonsToManage.forEach(button => {
                 const icon = button.querySelector('i');
                 if (icon) icon.classList.remove('fa-spin');
                 button.disabled = false;
            });
        }
    };

    // Attacher les listeners s'ils n'existent pas
    if (controlRefreshBtn && !controlRefreshBtn.hasAttribute('data-sync-refresh-handler')) {
        controlRefreshBtn.addEventListener('click', (e) => handleRefreshClick(controlRefreshBtn, e));
        controlRefreshBtn.setAttribute('data-sync-refresh-handler', 'true');
        console.log("Listener SYNC ajouté au bouton refresh de contrôle");
    } else if (!controlRefreshBtn) {
         console.warn("Bouton refresh de contrôle (#refreshBtn) non trouvé pour listener SYNC.");
    }

    if (panelRefreshBtn && !panelRefreshBtn.hasAttribute('data-sync-refresh-handler')) {
        panelRefreshBtn.addEventListener('click', (e) => handleRefreshClick(panelRefreshBtn, e));
        panelRefreshBtn.setAttribute('data-sync-refresh-handler', 'true');
        console.log("Listener SYNC ajouté au bouton refresh du panneau");
    } else if (!panelRefreshBtn) {
         console.warn("Bouton refresh panneau (.refresh-meetings-btn) non trouvé pour listener SYNC.");
    }
}

/**
 * Masquer le bouton flottant sur Desktop
 * **VÉRIFIÉ**
 */
function hideFloatingRoomButtonOnDesktop() {
    const floatingButton = document.querySelector('.rooms-toggle-button-floating');
    if (floatingButton) {
        const checkVisibility = () => {
            if (window.innerWidth >= 769) { // Même breakpoint que le CSS
                floatingButton.style.display = 'none';
            } else {
                floatingButton.style.display = 'flex'; // Ou 'inline-flex' selon le style de base
            }
        };
        checkVisibility(); // Vérifier au chargement
        window.addEventListener('resize', checkVisibility); // Vérifier au redimensionnement
    }
}