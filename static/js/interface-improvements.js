/**
 * TeamsRooms Interface Improvements - Enhanced JavaScript
 * Comprehensive update addressing all feedback including join button functionality,
 * menu organization, UI alignment, and animation improvements
 * Version 10.0
 */

// Solution simple pour masquer l'élément "Dernière synchro" - appliquée immédiatement
(function() {
    // Créer et appliquer le style CSS immédiatement
    const style = document.createElement('style');
    style.textContent = `
        /* Masquer spécifiquement l'élément de dernière synchro dans la barre inférieure */
        .controls-container > div:not(.control-buttons):not(#showRoomsBtn):not(#refreshBtn):not(#createMeetingBtn):not(#fullscreenBtn):not(#helpBtn),
        [title*="synchro"], [title*="Dernière"], 
        .controls-container div:empty,
        div:has(> span:contains("synchro")),
        div:has(> span:contains("Dernière")) {
            display: none !important;
            visibility: hidden !important;
            width: 0 !important;
            height: 0 !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
        }
    `;
    document.head.appendChild(style);
    
    // Vérifier et masquer l'élément après un court délai pour s'assurer que le DOM est chargé
    setTimeout(function() {
        // Cibler directement les éléments dans la barre de contrôle
        document.querySelectorAll('.controls-container > div').forEach(function(el) {
            if (el.className !== 'control-buttons' && !el.id) {
                el.style.display = 'none';
            }
        });
    }, 100);
})();

document.addEventListener('DOMContentLoaded', function() {
    // 1. FIX JOIN BUTTON FUNCTIONALITY - MOST CRITICAL
    fixJoinButtonsFunctionality();
    
    // 2. REORGANIZE MENU STRUCTURE 
    reorganizeMenu();
    
    // 3. ENSURE MENU STARTS COLLAPSED AND IS FUNCTIONAL
    initializeMenu();
    
    // 4. UPDATE BUTTONS TEXT AND REMOVE DUPLICATES
    updateButtonsAndLayout();
    
    // 5. IMPROVE TITLE CENTERING AND HEADER
    fixTitleCentering();
    improveDateTimeDisplay();
    
    // 6. IMPROVE MEETINGS DISPLAY FOR BETTER VISIBILITY
    enhanceMeetingsDisplay();
    
    // 7. FIX ROOM DISPLAY ANIMATION
    initializeRoomsDisplay();
    
    // 8. FIX BUTTON OVERLAP ISSUES
    fixButtonOverlap();

    // 9. ENSURE CONSISTENT MEETING DATA LOADING
    ensureMeetingsLoading();
    
    // 10. INITIALIZE HELP FUNCTION
    initializeHelpFunction();
    
    // 11. ENHANCE UI PERFORMANCE
    enhanceUIPerformance();
    
    // 12. MASQUER TOUTES LES INFOS DE SYNCHRONISATION
    hideAllSynchronizationInfo();
    
    console.log('Comprehensive interface improvements initialized');
    
    // Appliquer à nouveau le masquage des informations de synchronisation après un délai
    // et répéter toutes les 5 secondes pour assurer la persistance
    setInterval(hideAllSynchronizationInfo, 5000);
    
    // Appliquer le masquage directement à l'élément qui apparaît dans la barre inférieure
    setTimeout(() => {
        // Ciblage direct et agressif
        const footerSyncElements = document.querySelectorAll('.controls-container > div');
        footerSyncElements.forEach(el => {
            if (el && el.textContent && 
                (el.textContent.includes('synchro') || 
                 el.textContent.includes('Dernière') ||
                 el.textContent.match(/\d{2}:\d{2}:\d{2}/))) {
                
                // Supprimer complètement l'élément
                el.remove();
                console.log("Élément de synchronisation supprimé de la barre de contrôle");
            }
        });
    }, 1000);
});

/**
 * Masque spécifiquement les informations de synchronisation de la barre inférieure
 * Version améliorée pour cibler très précisément l'élément récalcitrant
 */
function hideAllSynchronizationInfo() {
    try {
        // Créer un style global pour masquer tous les éléments contenant "synchro"
        const style = document.createElement('style');
        style.textContent = `
            /* Masquer les éléments de synchronisation - priorité maximale !important */
            [id*="synchro"], [class*="synchro"], .sync-info, .last-sync,
            [id*="derniere"], [class*="derniere"], 
            *[id*="mise-a-jour"], *[class*="mise-a-jour"],
            
            /* Ciblage spécifique pour l'élément dans la barre inférieure */
            .controls-container *:contains("synchro"),
            .controls-container *:contains("Dernière"),
            .controls-container *:contains("dernière"),
            
            /* Cibler également par le format de l'horodatage */
            *:has(> span:contains("23:")),
            *:has(> div:contains("23:")),
            *:has(> span:contains("Dernière")),
            *:has(> div:contains("Dernière")) {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                width: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
                opacity: 0 !important;
                position: absolute !important;
                pointer-events: none !important;
                z-index: -9999 !important;
            }
            
            /* Ciblage ultra-précis pour l'élément de la barre de synchro */
            div:has(> *:contains("synchro")),
            div:has(> *:contains("Dernière")),
            div:has(> *:contains("dernière")),
            div[class*="refresh"], div[id*="refresh"],
            div[class*="synchro"], div[id*="synchro"],
            div[class*="update"], div[id*="update"] {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                width: 0 !important;
                opacity: 0 !important;
            }
        `;
        document.head.appendChild(style);
        
        // Approche directe et ciblée pour trouver l'élément exact et le masquer
        function masquerElementsSynchroSpecifiques() {
            // 1. Cibler l'élément de la barre inférieure par son contenu
            document.querySelectorAll('div, span').forEach(el => {
                if (!el) return;
                
                try {
                    const texte = el.textContent || '';
                    // Vérifier si le texte contient les termes de synchronisation ou un format d'heure
                    if (texte.includes('Dernière synchro') || 
                        texte.includes('dernière synchro') ||
                        texte.includes('synchro') ||
                        texte.match(/\d{2}:\d{2}:\d{2}/)) {
                        
                        // Masquer l'élément
                        el.style.display = 'none';
                        el.style.visibility = 'hidden';
                        el.style.opacity = '0';
                        el.style.height = '0';
                        el.style.width = '0';
                        el.style.overflow = 'hidden';
                        el.style.position = 'absolute';
                        el.style.zIndex = '-9999';
                        
                        // Masquer aussi le parent si c'est probablement un conteneur
                        if (el.parentElement && !el.parentElement.classList.contains('controls-container')) {
                            el.parentElement.style.display = 'none';
                        }
                        
                        console.log("Élément masqué:", texte);
                    }
                } catch (err) {
                    // Ignorer les erreurs individuelles
                }
            });
            
            // 2. Ciblage ultra-spécifique pour la barre de contrôle en bas
            const controlsContainer = document.querySelector('.controls-container');
            if (controlsContainer) {
                // Parcourir tous les enfants de la barre de contrôle
                Array.from(controlsContainer.children).forEach(enfant => {
                    try {
                        const texte = enfant.textContent || '';
                        if (texte.includes('synchro') || 
                            texte.includes('Dernière') || 
                            texte.includes('dernière') ||
                            texte.match(/\d{2}:\d{2}:\d{2}/)) {
                            
                            // Supprimer complètement l'élément de la barre
                            enfant.remove();
                            console.log("Élément supprimé de la barre de contrôle:", texte);
                        }
                    } catch (err) {
                        // Ignorer les erreurs individuelles
                    }
                });
            }
            
            // 3. Ciblage par attribut style et classes partielles
            document.querySelectorAll('[style*="display: inline-block"]').forEach(el => {
                try {
                    const texte = el.textContent || '';
                    if (texte.includes('synchro') || texte.includes('Dernière') || texte.match(/\d{2}:\d{2}/)) {
                        el.style.display = 'none !important';
                        el.style.visibility = 'hidden !important';
                    }
                } catch (err) {
                    // Ignorer les erreurs individuelles
                }
            });
            
            // 4. Ciblage direct de l'élément contenant l'heure de synchronisation
            const syncElements = document.querySelectorAll('[class*="sync"], [class*="refresh"], [id*="sync"], [id*="refresh"]');
            syncElements.forEach(el => el.remove());
        }
        
        // Exécuter immédiatement
        masquerElementsSynchroSpecifiques();
        
        // Configurer un MutationObserver pour continuer à masquer les éléments dynamiques
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    setTimeout(masquerElementsSynchroSpecifiques, 10);
                }
            });
        });
        
        // Observer tout le document
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Masquer également les éléments après un délai
        setTimeout(masquerElementsSynchroSpecifiques, 500);
        setTimeout(masquerElementsSynchroSpecifiques, 1000);
        setTimeout(masquerElementsSynchroSpecifiques, 2000);
        
        // Masquer spécifiquement l'élément "Dernière synchro: HH:MM:SS"
        setTimeout(() => {
            // Approche brutale - supprimer tous les éléments contenant "synchro"
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
                try {
                    if (el && el.textContent && 
                        (el.textContent.includes('synchro') || 
                         el.textContent.includes('Dernière') ||
                         el.textContent.match(/\d{2}:\d{2}:\d{2}/))) {
                        
                        if (el.parentElement && !isElementVital(el.parentElement)) {
                            el.parentElement.style.display = 'none';
                        } else {
                            el.style.display = 'none';
                        }
                    }
                } catch (err) {}
            });
            
            // Tenter aussi de sélectionner directement par XPath pour plus de précision
            try {
                const xpath = "//div[contains(text(), 'Dernière synchro')]";
                const xpathResult = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
                let node = xpathResult.iterateNext();
                while (node) {
                    node.style.display = 'none';
                    node.style.visibility = 'hidden';
                    node = xpathResult.iterateNext();
                }
            } catch (err) {}
            
        }, 1500);
        
        // Fonction pour vérifier si un élément est vital (à ne pas cacher)
        function isElementVital(el) {
            const vitalSelectors = [
                '.controls-container', 
                '.control-buttons',
                '#showRoomsBtn',
                '#refreshBtn',
                '#createMeetingBtn',
                '#fullscreenBtn',
                '#helpBtn'
            ];
            
            return vitalSelectors.some(selector => {
                try {
                    return el.matches(selector) || el.querySelector(selector);
                } catch (err) {
                    return false;
                }
            });
        }
        
        // Ajouter un gestionnaire d'événements pour le bouton de rafraîchissement
        const refreshButton = document.querySelector('#refreshBtn, button[id*="refresh"], button:has(i.fa-sync-alt)');
        if (refreshButton) {
            const oldHandler = refreshButton.onclick;
            refreshButton.onclick = function(e) {
                // Appeler le gestionnaire d'origine
                if (oldHandler) oldHandler.call(this, e);
                
                // Masquer à nouveau les éléments après le rafraîchissement
                setTimeout(masquerElementsSynchroSpecifiques, 300);
                setTimeout(masquerElementsSynchroSpecifiques, 600);
                setTimeout(masquerElementsSynchroSpecifiques, 1000);
            };
        }
        
        console.log("Masquage agressif des informations de synchronisation appliqué");
    } catch (error) {
        console.log("Erreur lors du masquage des infos de synchronisation:", error);
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
    
    // Masquer les informations de synchronisation après le chargement des réunions
    setTimeout(hideAllSynchronizationInfo, 1000);
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
 */
function updateRoomsButtonText(isVisible) {
    const toggleRoomsButton = document.querySelector('.toggle-rooms-button');
    const controlRoomsBtn = document.getElementById('showRoomsBtn') || document.getElementById('toggleRoomsBtn');
    const floatingButton = document.querySelector('.rooms-toggle-button-floating');
    
    const newText = isVisible ? 
        '<i class="fas fa-door-closed"></i> Masquer les salles disponibles' : 
        '<i class="fas fa-door-open"></i> Afficher les salles disponibles';
    
    const newTextShort = isVisible ? 
        '<i class="fas fa-door-closed"></i>' : 
        '<i class="fas fa-door-open"></i>';
    
    if (toggleRoomsButton) {
        if (window.innerWidth <= 768) {
            toggleRoomsButton.innerHTML = newTextShort;
        } else {
            toggleRoomsButton.innerHTML = newText;
        }
    }
    
    if (controlRoomsBtn) {
        controlRoomsBtn.innerHTML = newText;
    }
    
    if (floatingButton) {
        floatingButton.innerHTML = newText;
    }
}

/**
 * Reorganize the menu with submenu structure
 * Create "Réservation" submenu and move "Prêt matériel" under it
 */
function reorganizeMenu() {
  // Get the menu items container
  const menuItems = document.querySelector('.menu-items');
  if (!menuItems) return;
  
  // Réorganiser le menu selon l'image fournie
  menuItems.innerHTML = `
    <div class="menu-group">
      <div class="menu-group-title">TABLEAU DE BORD</div>
      <a href="/" class="menu-item">
        <i class="fas fa-home menu-item-icon"></i>
        <span class="menu-item-text">Accueil</span>
      </a>
    </div>
    
    <div class="menu-group">
      <div class="menu-group-title">RÉSERVATIONS</div>
      <a href="#" class="menu-item" id="menu-reservation-salle">
        <i class="fas fa-calendar-alt menu-item-icon"></i>
        <span class="menu-item-text">Salle de réunion</span>
      </a>
      <a href="/reservation-voiture" class="menu-item">
        <i class="fas fa-car menu-item-icon"></i>
        <span class="menu-item-text">Réservation voiture</span>
      </a>
      <a href="/prets" class="menu-item">
        <i class="fas fa-laptop menu-item-icon"></i>
        <span class="menu-item-text">Prêt de matériel</span>
      </a>
    </div>
    
    <div class="menu-group">
      <div class="menu-group-title">APPLICATIONS</div>
      <a href="https://teams.microsoft.com" target="_blank" class="menu-item">
        <i class="fas fa-users menu-item-icon"></i>
        <span class="menu-item-text">Teams</span>
      </a>
      <a href="https://sage.anecoop-france.com" target="_blank" class="menu-item">
        <i class="fas fa-calculator menu-item-icon"></i>
        <span class="menu-item-text">SAGE</span>
      </a>
      <a href="tel:3cx" class="menu-item">
        <i class="fas fa-phone menu-item-icon"></i>
        <span class="menu-item-text">3CX</span>
      </a>
      <a href="/pulse" class="menu-item">
        <i class="fas fa-chart-line menu-item-icon"></i>
        <span class="menu-item-text">AnecoopPulse</span>
      </a>
    </div>
    
    <div class="menu-group" data-role="administrator,manager">
      <div class="menu-group-title">ADMINISTRATION</div>
      <a href="/admin" class="menu-item">
        <i class="fas fa-cog menu-item-icon"></i>
        <span class="menu-item-text">Paramètres</span>
      </a>
      <a href="/admin/users" class="menu-item">
        <i class="fas fa-user-cog menu-item-icon"></i>
        <span class="menu-item-text">Utilisateurs</span>
      </a>
    </div>
  `;
  
  // Associer la fonction de création de réunion à l'élément "Salle de réunion"
  const salleMenuItem = document.getElementById('menu-reservation-salle');
  if (salleMenuItem) {
    salleMenuItem.addEventListener('click', function(e) {
      e.preventDefault();
      // Utiliser le système de réservation s'il est disponible
      if (window.BookingSystem) {
        window.BookingSystem.openModal();
      } else {
        // Fallback vers le modal standard
        const modal = document.getElementById('bookingModal');
        if (modal) modal.style.display = 'flex';
      }
    });
  }
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
 * Enhance the meetings display section
 */
function enhanceMeetingsDisplay() {
    // Check if meetings container exists
    const meetingsContainer = document.querySelector('.meetings-container');
    if (!meetingsContainer) return;
    
    // Make sure the meetings section is visible and properly styled
    meetingsContainer.style.display = 'flex';
    
    // Improve the title bar
    const titleBar = document.querySelector('.meetings-title-bar');
    if (titleBar) {
        titleBar.style.background = 'rgba(50, 50, 50, 0.7)';
        titleBar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        titleBar.style.borderRadius = '15px 15px 0 0';
    }
    
    // Improve meetings list
    const meetingsList = document.querySelector('.meetings-list');
    if (meetingsList) {
        meetingsList.style.padding = '10px 15px';
    }
    
    // Optimize meeting items for more compact display
    const meetingItems = document.querySelectorAll('.meeting-item');
    meetingItems.forEach(item => {
        // Reduce margins and padding for more compact display
        item.style.margin = '8px 0';
        item.style.padding = '10px 12px';
        item.style.borderRadius = '10px';
        item.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
        item.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        
        // Add hover effect
        item.addEventListener('mouseover', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        });
        
        item.addEventListener('mouseout', function() {
            this.style.transform = '';
            this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
        });
    });
    
    // Improve ID input area
    const idEntry = document.querySelector('.meeting-id-entry');
    if (idEntry) {
        idEntry.style.padding = '12px 15px';
        idEntry.style.background = 'rgba(40, 40, 40, 0.7)';
        idEntry.style.borderTop = '1px solid rgba(255, 255, 255, 0.1)';
        idEntry.style.borderRadius = '0 0 15px 15px';
        
        const input = idEntry.querySelector('input');
        const button = idEntry.querySelector('button');
        
        if (input) {
            input.style.padding = '8px 12px';
            input.style.borderRadius = '8px 0 0 8px';
            input.style.border = '1px solid rgba(255, 255, 255, 0.2)';
            input.id = 'meeting-id'; // Ensure ID consistency for the join system
        }
        
        if (button) {
            button.style.padding = '8px 15px';
            button.style.borderRadius = '0 8px 8px 0';
            button.style.background = 'linear-gradient(to right, var(--success-color), var(--success-color-light))';
        }
    }
    
    // Add refresh button to meetings header
    const createMeetingButton = document.querySelector('.create-meeting-integrated');
    if (createMeetingButton && meetingsContainer) {
        const refreshButton = document.createElement('button');
        refreshButton.className = 'refresh-meetings-btn';
        refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i>';
        refreshButton.title = "Rafraîchir les réunions";
        refreshButton.style.cssText = `
            position: absolute;
            right: 10px;
            top: 10px;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        refreshButton.addEventListener('mouseover', function() {
            this.style.background = 'rgba(255, 255, 255, 0.2)';
            this.style.transform = 'rotate(30deg)';
        });
        
        refreshButton.addEventListener('mouseout', function() {
            this.style.background = 'rgba(255, 255, 255, 0.1)';
            this.style.transform = 'rotate(0)';
        });
        
        refreshButton.addEventListener('click', function() {
            this.style.transform = 'rotate(360deg)';
            // Add a spinning animation
            this.querySelector('i').classList.add('fa-spin');
            
            // Force refresh of meetings
            if (typeof window.fetchMeetings === 'function') {
                window.fetchMeetings(true);
                
                // Remove spinning after 2 seconds
                setTimeout(() => {
                    this.querySelector('i').classList.remove('fa-spin');
                }, 2000);
            }
        });
        
        const titleBar = document.querySelector('.meetings-title-bar');
        if (titleBar) {
            titleBar.style.position = 'relative';
            titleBar.appendChild(refreshButton);
        }
    }
}

/**
 * Initialize and fix the rooms display
 * avec fermeture en cliquant n'importe où en dehors de la liste des salles
 */
function initializeRoomsDisplay() {
  try {
    // Supprimer le bouton flottant (en double)
    const floatingButton = document.querySelector('.rooms-toggle-button-floating');
    if (floatingButton) {
      floatingButton.style.display = 'none'; // Cacher plutôt que supprimer pour éviter les erreurs
    }
    
    // Make sure the rooms toggle buttons work properly
    const toggleRoomsButton = document.querySelector('.toggle-rooms-button');
    const controlRoomsBtn = document.getElementById('showRoomsBtn') || document.getElementById('toggleRoomsBtn');
    const roomsSection = document.querySelector('.rooms-section');
    
    // Improve room section styling for smoother animations
    if (roomsSection) {
        roomsSection.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        roomsSection.style.background = 'rgba(40, 40, 40, 0.85)';
        roomsSection.style.backdropFilter = 'blur(10px)';
        roomsSection.style.borderRadius = '15px';
        roomsSection.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.4)';
        roomsSection.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        roomsSection.style.padding = '15px';
        
        // Add styles for animation
        document.head.insertAdjacentHTML('beforeend', `
            <style>
                .rooms-section {
                    opacity: 0;
                    transform: translateY(10px);
                    display: none;
                }
                .rooms-section.visible {
                    opacity: 1;
                    transform: translateY(0);
                    display: block;
                }
            </style>
        `);
        
        // Empêcher la propagation des clics depuis la liste des salles
        roomsSection.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Créer un overlay simple pour la détection des clics en dehors
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
            // Fermer la liste des salles si ouverte
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
            
            // Fermer aussi le menu latéral s'il est ouvert
            const sideMenu = document.querySelector('.side-menu');
            const mainContainer = document.querySelector('.main-container');
            if (sideMenu && sideMenu.classList.contains('expanded')) {
                sideMenu.classList.remove('expanded');
                if (mainContainer) mainContainer.classList.remove('menu-expanded');
            }
            
            // Cacher l'overlay
            this.style.display = 'none';
        });
    }
    
    // Define the toggle function
    function toggleRooms(e) {
        if (e) e.preventDefault();
        if (!roomsSection) return;
        
        const isVisible = roomsSection.classList.contains('visible');
        
        if (isVisible) {
            roomsSection.classList.remove('visible');
            setTimeout(() => {
                roomsSection.style.display = 'none';
            }, 300);
            
            // Update button text
            if (typeof updateRoomsButtonText === 'function') {
                updateRoomsButtonText(false);
            }
            
            // Cacher l'overlay
            if (clickOverlay) clickOverlay.style.display = 'none';
        } else {
            roomsSection.style.display = 'block';
            // Force reflow
            roomsSection.offsetHeight;
            roomsSection.classList.add('visible');
            
            // Update button text
            if (typeof updateRoomsButtonText === 'function') {
                updateRoomsButtonText(true);
            }
            
            // Afficher l'overlay
            if (clickOverlay) clickOverlay.style.display = 'block';
        }
    }
    
    // Attacher la fonction aux boutons
    if (toggleRoomsButton) {
        // Remplacer le gestionnaire existant
        const newToggleButton = toggleRoomsButton.cloneNode(true);
        if (toggleRoomsButton.parentNode) {
            toggleRoomsButton.parentNode.replaceChild(newToggleButton, toggleRoomsButton);
            newToggleButton.addEventListener('click', toggleRooms);
        }
    }
    
    if (controlRoomsBtn) {
        // Remplacer le gestionnaire existant
        const newControlBtn = controlRoomsBtn.cloneNode(true);
        if (controlRoomsBtn.parentNode) {
            controlRoomsBtn.parentNode.replaceChild(newControlBtn, controlRoomsBtn);
            newControlBtn.addEventListener('click', toggleRooms);
        }
    }
    
    // Fix room cards if they exist
    const roomCards = document.querySelectorAll('.room-card');
    roomCards.forEach(card => {
        card.style.borderRadius = '10px';
        card.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
        card.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
        
        card.addEventListener('mouseover', function() {
            this.style.transform = 'translateY(-3px)';
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.4)';
        });
        
        card.addEventListener('mouseout', function() {
            this.style.transform = '';
            this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
        });
        
        // Make sure room cards are clickable
        card.addEventListener('click', function(e) {
            e.stopPropagation(); // Empêcher la fermeture immédiate
            const roomName = this.getAttribute('data-room');
            if (roomName) {
                window.location.href = '/' + roomName.toLowerCase();
            }
        });
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
