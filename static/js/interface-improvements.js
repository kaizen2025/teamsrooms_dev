/**
 * TeamsRooms Interface Improvements - Enhanced JavaScript
 * Comprehensive update addressing all feedback including join button functionality,
 * menu organization, UI alignment, and animation improvements
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Initialisation des améliorations d'interface v2.0");
    
    // Séquence d'initialisation principale
    setTimeout(() => {
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
        fixHeaderAlignment();
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
        
        // 12. HIDE SYNC INFO
        hideAllSyncInfo();
        
        // 13. REDUCE FOOTER WIDTH
        reduceFooterWidth();
        
        // 14. INCREASE TRANSPARENCY
        increaseTransparency();
        
        // 15. SETUP OUTSIDE CLICK HANDLERS
        setupOutsideClickHandlers();
        
        console.log('✅ Comprehensive interface improvements initialized');
    }, 100);
});

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
 * Version optimisée de la fonction fixJoinButtonsFunctionality
 * Élimine les problèmes de tremblements et de clics multiples
 * AMÉLIORATION: Intègre le lien Teams direct
 */
function fixJoinButtonsFunctionality() {
  console.log("Fixing join button functionality");
  
  // Supprimer les gestionnaires d'événements existants de tous les boutons
  document.querySelectorAll('.meeting-join-btn').forEach(btn => {
    const newBtn = btn.cloneNode(true);
    if (btn.parentNode) {
      btn.parentNode.replaceChild(newBtn, btn);
    }
  });
  
  // Ajouter gestionnaire unique et robuste
  document.addEventListener('click', function(e) {
    // Utiliser la délégation d'événements au lieu de multiples écouteurs
    if (e.target.closest('.meeting-join-btn')) {
      e.preventDefault();
      e.stopPropagation();
      
      const button = e.target.closest('.meeting-join-btn');
      
      // Éviter les clics multiples
      if (button.disabled) return;
      button.disabled = true;
      
      // Ajouter un indicateur visuel
      const originalText = button.innerHTML;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      
      // Obtenir l'URL ou l'ID de réunion
      const meetingItem = button.closest('.meeting-item');
      const joinUrl = button.getAttribute('data-url') || 
                      (meetingItem ? meetingItem.getAttribute('data-url') : null);
      const meetingId = button.getAttribute('data-meeting-id') || 
                       (meetingItem ? meetingItem.getAttribute('data-id') : null);
      
      if (joinUrl) {
        // URL directe disponible, l'ouvrir immédiatement
        window.open(joinUrl, "_blank");
        
        // Réactiver le bouton après un court délai
        setTimeout(() => {
          button.disabled = false;
          button.innerHTML = originalText;
        }, 1000);
      } 
      else if (meetingId) {
        // Utiliser le système de jointure avec l'ID
        const meetingIdInput = document.getElementById('meeting-id');
        if (meetingIdInput) {
          meetingIdInput.value = meetingId;
          
          // Appeler directement la fonction au lieu d'utiliser un objet intermédiaire
          try {
            joinMeetingWithId(meetingId);
          } catch(e) {
            console.error("Erreur lors de la jointure:", e);
            alert("Impossible de rejoindre la réunion. Veuillez réessayer.");
          }
          
          // Réactiver le bouton après un court délai
          setTimeout(() => {
            button.disabled = false;
            button.innerHTML = originalText;
          }, 1000);
        }
      }
      else {
        console.error("Aucune URL ou ID de réunion trouvé");
        button.disabled = false;
        button.innerHTML = originalText;
      }
    }
  });
  
  // Fonction globale pour rejoindre avec ID (avec URL Teams directe)
  window.joinMeetingWithId = joinMeetingWithId;
  
  function joinMeetingWithId(meetingId) {
    if (!meetingId) {
      const input = document.getElementById('meeting-id');
      if (input) meetingId = input.value.trim();
    }
    
    if (!meetingId) {
      alert("Veuillez entrer l'ID de la réunion");
      return;
    }
    
    // Nettoyer l'ID en retirant les espaces
    meetingId = meetingId.replace(/\s+/g, '');
    
    // Construire l'URL Teams standard directe
    const teamsUrl = `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${meetingId}%40thread.v2/0`;
    window.open(teamsUrl, "_blank");
  }
  
  // Améliorer le style du bouton pour éviter les tremblements
  const style = document.createElement('style');
  style.textContent = `
    .meeting-join-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 90px;
      height: 36px;
      background: linear-gradient(to right, #6264A7, #7B83EB);
      border: none;
      border-radius: 4px;
      color: white;
      font-weight: 500;
      cursor: pointer;
      transition: transform 0.1s ease, box-shadow 0.1s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      will-change: transform;
      transform: translateZ(0);
    }
    
    .meeting-join-btn:hover {
      transform: translateY(-1px) translateZ(0);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    .meeting-join-btn:active {
      transform: translateY(1px) translateZ(0);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
    
    .meeting-join-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(style);
  
  // Appliquer également au bouton de jointure par ID en bas
  const joinMeetingBtn = document.getElementById('joinMeetingBtn');
  if (joinMeetingBtn) {
    joinMeetingBtn.onclick = function(e) {
      e.preventDefault();
      window.joinMeetingWithId();
    };
  }
}

/**
 * Set up a mutation observer to watch for new meeting items
 * This ensures newly loaded meetings also get join buttons properly setup
 */
function setupMeetingsObserver() {
    const meetingsContainer = document.getElementById('meetingsContainer') || 
                             document.querySelector('.meetings-list');
    
    if (!meetingsContainer) return;
    
    // Create a mutation observer to watch for changes
    const observer = new MutationObserver(function(mutations) {
        let shouldReprocess = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                shouldReprocess = true;
            }
        });
        
        if (shouldReprocess) {
            // Reprocess join buttons when new meetings are added
            setTimeout(fixJoinButtonsFunctionality, 100);
        }
    });
    
    // Start observing
    observer.observe(meetingsContainer, { childList: true, subtree: true });
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
 */
function initializeMenu() {
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
    
    // Menu toggle button functionality
    if (menuToggleBtn && sideMenu && mainContainer) {
        menuToggleBtn.addEventListener('click', function() {
            sideMenu.classList.toggle('expanded');
            mainContainer.classList.toggle('menu-expanded');
            
            // Activate overlay on mobile
            if (window.innerWidth <= 768 && menuOverlay) {
                if (sideMenu.classList.contains('expanded')) {
                    menuOverlay.classList.add('active');
                } else {
                    menuOverlay.classList.remove('active');
                }
            }
            
            // Update title centering
            setTimeout(fixTitleCentering, 50);
        });
    }
    
    // Close menu when clicking overlay
    if (menuOverlay) {
        menuOverlay.addEventListener('click', function() {
            sideMenu.classList.remove('expanded');
            mainContainer.classList.remove('menu-expanded');
            menuOverlay.classList.remove('active');
            
            // Update title centering
            setTimeout(fixTitleCentering, 50);
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
                    setTimeout(fixTitleCentering, 50);
                }
            }
        });
    });
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
 * Corrige l'alignement de l'en-tête pour éviter les superpositions
 * NOUVELLE FONCTION
 */
function fixHeaderAlignment() {
    console.log("📐 Correction de l'alignement de l'en-tête");
    
    // Ajouter des styles pour corriger l'alignement
    const style = document.createElement('style');
    style.id = 'header-alignment-styles';
    style.textContent = `
        /* Amélioration de l'alignement de l'en-tête */
        .header {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 10px 15px !important;
            background-color: rgba(30, 30, 30, 0.7) !important;
            backdrop-filter: blur(10px) !important;
        }
        
        /* Décaler l'horloge pour éviter le chevauchement avec le menu */
        .datetime {
            margin-left: 70px !important;
            background-color: rgba(40, 40, 40, 0.7) !important;
            padding: 8px 15px !important;
            border-radius: 12px !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        
        /* Améliorer l'apparence du bouton de menu */
        .menu-toggle-visible {
            background-color: rgba(50, 50, 50, 0.8) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 8px !important;
            width: 40px !important;
            height: 40px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 1000 !important;
            position: relative !important;
        }
    `;
    document.head.appendChild(style);
    
    // Application directe aux éléments
    const datetimeEl = document.querySelector('.datetime');
    const menuToggle = document.querySelector('.menu-toggle-visible');
    
    if (datetimeEl) {
        datetimeEl.style.marginLeft = '70px';
        datetimeEl.style.backgroundColor = 'rgba(40, 40, 40, 0.7)';
        datetimeEl.style.padding = '8px 15px';
        datetimeEl.style.borderRadius = '12px';
    }
    
    if (menuToggle) {
        menuToggle.style.backgroundColor = 'rgba(50, 50, 50, 0.8)';
        menuToggle.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        menuToggle.style.borderRadius = '8px';
        menuToggle.style.width = '40px';
        menuToggle.style.height = '40px';
        menuToggle.style.display = 'flex';
        menuToggle.style.alignItems = 'center';
        menuToggle.style.justifyContent = 'center';
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
 * AMÉLIORATION: Implémentation de l'affichage centré des salles en grille
 */
function initializeRoomsDisplay() {
  console.log("🏢 Amélioration de l'affichage des salles");

  // Styles pour la section des salles
  const roomsStyle = document.createElement('style');
  roomsStyle.id = 'rooms-display-styles';
  roomsStyle.textContent = `
    /* Styles optimisés pour la section des salles */
    .rooms-section {
        position: fixed !important;
        left: 50% !important;
        top: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 70% !important;
        max-width: 800px !important;
        max-height: 80vh !important;
        background-color: rgba(30, 30, 30, 0.85) !important;
        backdrop-filter: blur(15px) !important;
        border-radius: 15px !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
        z-index: 9999 !important;
        padding: 20px !important;
        display: none !important;
        opacity: 0 !important;
        transition: opacity 0.3s ease, transform 0.3s ease !important;
        overflow: auto !important;
    }
    
    /* Classe pour afficher la section des salles */
    .rooms-section.visible {
        display: block !important;
        opacity: 1 !important;
        transform: translate(-50%, -50%) scale(1) !important;
    }
    
    /* Overlay pour fermer au clic en dehors */
    .rooms-overlay {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background-color: rgba(0, 0, 0, 0.5) !important;
        backdrop-filter: blur(3px) !important;
        z-index: 9998 !important;
        display: none !important;
        opacity: 0 !important;
        transition: opacity 0.3s ease !important;
    }
    
    /* Classe pour afficher l'overlay */
    .rooms-overlay.visible {
        display: block !important;
        opacity: 1 !important;
    }
    
    /* Disposition en grille pour les salles */
    .rooms {
        display: grid !important;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
        grid-gap: 15px !important;
        padding: 10px !important;
    }
    
    /* Style des cartes de salle */
    .room-card {
        background-color: rgba(50, 50, 50, 0.5) !important;
        backdrop-filter: blur(5px) !important;
        border-radius: 10px !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        padding: 15px !important;
        height: 120px !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important;
        align-items: center !important;
        transition: all 0.2s ease !important;
        cursor: pointer !important;
        text-align: center !important;
    }
    
    /* Effet de survol des cartes */
    .room-card:hover {
        transform: translateY(-5px) !important;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2) !important;
        background-color: rgba(60, 60, 60, 0.7) !important;
        border-color: rgba(255, 255, 255, 0.2) !important;
    }
    
    /* Titre de la section des salles */
    .rooms-section-title {
        color: white !important;
        text-align: center !important;
        margin-top: 0 !important;
        margin-bottom: 15px !important;
        padding-bottom: 10px !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
    }
    
    /* Bouton de fermeture */
    .rooms-section-close {
        position: absolute !important;
        top: 15px !important;
        right: 15px !important;
        background-color: rgba(255, 255, 255, 0.1) !important;
        border: none !important;
        color: white !important;
        width: 30px !important;
        height: 30px !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        font-size: 18px !important;
        transition: background-color 0.2s ease !important;
    }
    
    .rooms-section-close:hover {
        background-color: rgba(255, 255, 255, 0.2) !important;
    }
  `;
  document.head.appendChild(roomsStyle);
  
  // Vérifier si l'overlay existe déjà
  let roomsOverlay = document.querySelector('.rooms-overlay');
  if (!roomsOverlay) {
    roomsOverlay = document.createElement('div');
    roomsOverlay.className = 'rooms-overlay';
    document.body.appendChild(roomsOverlay);
  }
  
  // Supprimer le bouton flottant (en double)
  const floatingButton = document.querySelector('.rooms-toggle-button-floating');
  if (floatingButton) {
    floatingButton.style.display = 'none'; // Cacher plutôt que supprimer pour éviter les erreurs
  }
  
  // Récupérer la section des salles ou la créer si nécessaire
  let roomsSection = document.querySelector('.rooms-section');
  if (roomsSection) {
    // S'assurer que la section a les bonnes propriétés CSS
    roomsSection.style.position = 'fixed';
    roomsSection.style.left = '50%';
    roomsSection.style.top = '50%';
    roomsSection.style.transform = 'translate(-50%, -50%)';
    roomsSection.style.width = '70%';
    roomsSection.style.maxWidth = '800px';
    
    // Vérifier si le titre existe
    if (!roomsSection.querySelector('.rooms-section-title')) {
      const title = document.createElement('h3');
      title.className = 'rooms-section-title';
      title.innerHTML = '<i class="fas fa-door-open"></i> Salles disponibles';
      roomsSection.insertBefore(title, roomsSection.firstChild);
    }
    
    // Vérifier si le bouton de fermeture existe
    if (!roomsSection.querySelector('.rooms-section-close')) {
      const closeButton = document.createElement('button');
      closeButton.className = 'rooms-section-close';
      closeButton.innerHTML = '&times;';
      closeButton.addEventListener('click', function() {
        roomsSection.classList.remove('visible');
        roomsOverlay.classList.remove('visible');
        updateRoomsButtonText(false);
      });
      roomsSection.appendChild(closeButton);
    }
  }
  
  // Make sure the rooms toggle buttons work properly
  const toggleRoomsButton = document.querySelector('.toggle-rooms-button');
  const controlRoomsBtn = document.getElementById('showRoomsBtn') || document.getElementById('toggleRoomsBtn');
  
  // Define the toggle function
  const toggleRooms = function() {
    if (!roomsSection) return;
    
    const isVisible = roomsSection.classList.contains('visible');
    
    if (isVisible) {
      roomsSection.classList.remove('visible');
      roomsOverlay.classList.remove('visible');
      
      // Update button text
      updateRoomsButtonText(false);
    } else {
      roomsSection.classList.add('visible');
      roomsOverlay.classList.add('visible');
      
      // Update button text
      updateRoomsButtonText(true);
    }
  };
  
  // Attach the toggle function
  if (toggleRoomsButton && !toggleRoomsButton._hasRoomsHandler) {
    toggleRoomsButton.addEventListener('click', toggleRooms);
    toggleRoomsButton._hasRoomsHandler = true;
  }
  
  if (controlRoomsBtn && !controlRoomsBtn._hasRoomsHandler) {
    controlRoomsBtn.addEventListener('click', toggleRooms);
    controlRoomsBtn._hasRoomsHandler = true;
  }
  
  // Close when clicking the overlay
  roomsOverlay.addEventListener('click', function() {
    if (roomsSection) {
      roomsSection.classList.remove('visible');
      roomsOverlay.classList.remove('visible');
      updateRoomsButtonText(false);
    }
  });
  
  // Fix room cards
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
    card.addEventListener('click', function() {
      const roomName = this.getAttribute('data-room');
      if (roomName) {
        window.location.href = '/' + roomName.toLowerCase();
      }
    });
  });
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
 * Masque aggressivement toutes les informations de synchronisation
 * NOUVELLE FONCTION
 */
function hideAllSyncInfo() {
    console.log("🙈 Masquage des informations de synchronisation");
    
    // Styles pour masquer les infos de synchro
    const style = document.createElement('style');
    style.id = 'hide-sync-info-styles';
    style.textContent = `
        /* Masquage des informations de synchronisation */
        [id*="synchro"], 
        [class*="synchro"], 
        .sync-info, 
        .last-sync, 
        .datetime-info,
        [data-sync-info],
        div:has(> [id*="synchro"]),
        div:has(> [class*="synchro"]),
        div:has(span:contains("Dernière")),
        div:has(span:contains("dernière")),
        div:has(span:contains("synchro")),
        div:has(span:contains("Synchro")),
        div:has(span:contains("mise à jour")),
        span:contains("Dernière"),
        span:contains("dernière"),
        span:contains("synchro"),
        span:contains("Synchro"),
        span:contains("mise à jour") {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            overflow: hidden !important;
            position: absolute !important;
            pointer-events: none !important;
            opacity: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
        }
    `;
    document.head.appendChild(style);
    
    // Masquer directement tous les éléments potentiels
    const syncElements = document.querySelectorAll('[id*="synchro"], [class*="synchro"], .sync-info, .last-sync');
    syncElements.forEach(element => {
        if (element) {
            element.style.display = 'none';
            element.style.visibility = 'hidden';
            element.style.height = '0';
            element.style.width = '0';
            element.style.overflow = 'hidden';
            element.style.opacity = '0';
            element.style.position = 'absolute';
            element.style.pointerEvents = 'none';
        }
    });
    
    // Rechercher par texte
    document.querySelectorAll('*').forEach(element => {
        try {
            const text = element.textContent.toLowerCase();
            if (text.includes('dernière') || 
                text.includes('synchro') || 
                text.includes('mise à jour')) {
                element.style.display = 'none';
            }
        } catch (e) {}
    });
}

/**
 * Réduit la largeur de la bannière du bas
 * NOUVELLE FONCTION
 */
function reduceFooterWidth() {
    console.log("📏 Réduction de la largeur de la bannière du bas");
    
    // Styles pour réduire la largeur
    const style = document.createElement('style');
    style.id = 'reduced-footer-styles';
    style.textContent = `
        /* Réduction de la largeur de la bannière du bas */
        .controls-container, 
        .footer-banner, 
        .app-footer,
        .bottom-controls {
            width: 40% !important;
            max-width: 500px !important;
            min-width: 400px !important;
            margin: 0 auto !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            border-radius: 15px 15px 0 0 !important;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1) !important;
            background-color: rgba(30, 30, 30, 0.7) !important;
            backdrop-filter: blur(10px) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            padding: 10px !important;
            display: flex !important;
            justify-content: center !important;
            flex-wrap: wrap !important;
            gap: 10px !important;
            position: fixed !important;
            bottom: 0 !important;
            z-index: 1000 !important;
        }
        
        /* Ajustement pour mobile */
        @media (max-width: 768px) {
            .controls-container, 
            .footer-banner, 
            .app-footer,
            .bottom-controls {
                width: 100% !important;
                min-width: unset !important;
                border-radius: 0 !important;
            }
        }
        
        /* Améliorer l'apparence des boutons */
        .controls-container button,
        .footer-banner button,
        .app-footer button,
        .bottom-controls button {
            background-color: rgba(50, 50, 50, 0.8) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 8px !important;
            padding: 8px 12px !important;
            color: white !important;
            font-size: 14px !important;
            transition: all 0.2s ease !important;
            margin: 0 5px !important;
        }
        
        .controls-container button:hover,
        .footer-banner button:hover,
        .app-footer button:hover,
        .bottom-controls button:hover {
            background-color: rgba(60, 60, 60, 0.9) !important;
            transform: translateY(-2px) !important;
        }
    `;
    document.head.appendChild(style);
    
    // Application directe
    const footerElements = document.querySelectorAll('.controls-container, .footer-banner, .app-footer, .bottom-controls');
    footerElements.forEach(element => {
        if (element) {
            element.style.width = '40%';
            element.style.maxWidth = '500px';
            element.style.minWidth = '400px';
            element.style.margin = '0 auto';
            element.style.left = '50%';
            element.style.transform = 'translateX(-50%)';
            element.style.borderRadius = '15px 15px 0 0';
            element.style.backgroundColor = 'rgba(30, 30, 30, 0.7)';
            element.style.backdropFilter = 'blur(10px)';
        }
    });
}

/**
 * Augmente la transparence des éléments
 * NOUVELLE FONCTION
 */
function increaseTransparency() {
    console.log("🔍 Augmentation de la transparence des éléments");
    
    // Styles pour la transparence
    const style = document.createElement('style');
    style.id = 'transparency-styles';
    style.textContent = `
        /* Augmentation de la transparence */
        .header {
            background-color: rgba(30, 30, 30, 0.7) !important;
            backdrop-filter: blur(10px) !important;
        }
        
        .meetings-container {
            background-color: rgba(30, 30, 30, 0.6) !important;
            backdrop-filter: blur(10px) !important;
            border-radius: 15px !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            overflow: hidden !important;
        }
        
        .meetings-title-bar {
            background-color: rgba(40, 40, 40, 0.7) !important;
            backdrop-filter: blur(5px) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        
        .meeting-item {
            background-color: rgba(45, 45, 45, 0.7) !important;
            backdrop-filter: blur(5px) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 10px !important;
            margin-bottom: 10px !important;
            transition: all 0.2s ease !important;
        }
        
        .meeting-item:hover {
            background-color: rgba(55, 55, 55, 0.8) !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1) !important;
        }
        
        .meeting-id-entry {
            background-color: rgba(40, 40, 40, 0.7) !important;
            backdrop-filter: blur(5px) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
            padding: 15px !important;
        }
        
        .side-menu {
            background-color: rgba(25, 25, 25, 0.85) !important;
            backdrop-filter: blur(15px) !important;
            border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Configure les gestionnaires pour fermer au clic en dehors
 * NOUVELLE FONCTION
 */
function setupOutsideClickHandlers() {
    console.log("👆 Configuration des gestionnaires de clic extérieur");
    
    // Pour le menu latéral
    document.addEventListener('click', function(e) {
        const sideMenu = document.querySelector('.side-menu');
        const menuToggle = document.querySelector('.menu-toggle-visible');
        const menuOverlay = document.querySelector('.menu-overlay');
        
        if (sideMenu && 
            sideMenu.classList.contains('expanded') && 
            !sideMenu.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            
            sideMenu.classList.remove('expanded');
            document.querySelector('.main-container')?.classList.remove('menu-expanded');
            if (menuOverlay) menuOverlay.classList.remove('active');
        }
    });
    
    // L'overlay des salles est déjà configuré dans initializeRoomsDisplay()
}
