/**
 * TeamsRooms Interface Improvements - Enhanced JavaScript
 * Comprehensive update addressing all feedback including join button functionality,
 * menu organization, UI alignment, and animation improvements
 */

document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si les améliorations avancées sont déjà initialisées
    if (window._interfaceInitialized) {
        console.log("Les améliorations avancées sont déjà initialisées");
        return;
    }
    
    // 1. FIX JOIN BUTTON FUNCTIONALITY - MOST CRITICAL
    fixJoinButtonsFunctionality();
    
    // 2. REORGANIZE MENU STRUCTURE 
    reorganizeMenu();
    
    // 3. ENSURE MENU STARTS COLLAPSED AND IS FUNCTIONAL
    initializeMenu();
    
    // 4. UPDATE BUTTONS TEXT AND REMOVE DUPLICATES
    updateButtonsAndLayout();
    
    // 5. IMPROVE MEETINGS DISPLAY FOR BETTER VISIBILITY
    enhanceMeetingsDisplay();
    
    // 6. INITIALIZE HELP FUNCTION
    initializeHelpFunction();
    
    // 7. ENHANCE UI PERFORMANCE
    enhanceUIPerformance();
    
    // 8. SETUP OBSERVER FOR FUTURE ELEMENTS
    setupMeetingsObserver();
    
    console.log('Interface improvements initialized');
    
    // Signaler que les améliorations de base sont prêtes
    document.dispatchEvent(new CustomEvent('interface-improvements-ready'));
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
  
  // Fonction globale pour rejoindre avec ID (remplace dépendance à window.JoinSystem)
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
    
    // Construire l'URL Teams standard
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
 * Reorganize the menu with submenu structure
 * Create "Réservation" submenu and move "Prêt matériel" under it
 */
function reorganizeMenu() {
  // Éviter de réorganiser si le fichier performance-optimizations s'en occupe
  if (window._interfaceInitialized) return;
  
  // Get the menu items container
  const menuItems = document.querySelector('.menu-items');
  if (!menuItems) return;
  
  // Vérifier si la réorganisation a déjà été effectuée
  if (menuItems.getAttribute('data-reorganized') === 'true') return;
  
  console.log("Reorganizing menu structure");
  
  // Ne pas réorganiser si le menu est déjà bien structuré
  if (menuItems.querySelectorAll('.menu-group-title').length >= 3) {
    menuItems.setAttribute('data-reorganized', 'true');
    return;
  }
  
  // Enregistrer les anciennes entrées de menu pour les restaurer si nécessaire
  const oldMenuHTML = menuItems.innerHTML;
  
  try {
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
    
    // Marquer comme réorganisé
    menuItems.setAttribute('data-reorganized', 'true');
    
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
  } catch (error) {
    console.error("Erreur lors de la réorganisation du menu:", error);
    // Restaurer l'ancien menu en cas d'erreur
    menuItems.innerHTML = oldMenuHTML;
  }
}

/**
 * Initialize and fix the left menu functionality
 */
function initializeMenu() {
  // Skip if the advanced optimizations handle this
  if (window._interfaceInitialized) return;
  
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
    // Remove existing event listeners
    const newMenuToggleBtn = menuToggleBtn.cloneNode(true);
    if (menuToggleBtn.parentNode) {
      menuToggleBtn.parentNode.replaceChild(newMenuToggleBtn, menuToggleBtn);
    }
    
    newMenuToggleBtn.addEventListener('click', function() {
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
    });
  }
  
  // Close menu when clicking overlay
  if (menuOverlay) {
    // Remove existing event listeners
    const newMenuOverlay = menuOverlay.cloneNode(true);
    if (menuOverlay.parentNode) {
      menuOverlay.parentNode.replaceChild(newMenuOverlay, menuOverlay);
    }
    
    newMenuOverlay.addEventListener('click', function() {
      sideMenu.classList.remove('expanded');
      mainContainer.classList.remove('menu-expanded');
      newMenuOverlay.classList.remove('active');
    });
  }
}

/**
 * Update buttons text and remove duplicates
 */
function updateButtonsAndLayout() {
  // Skip if the advanced optimizations handle this
  if (window._interfaceInitialized) return;
  
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
}

/**
 * Improve the meetings display section
 */
function enhanceMeetingsDisplay() {
  // Skip if the advanced optimizations handle this
  if (window._interfaceInitialized) return;
  
  // Check if meetings container exists
  const meetingsContainer = document.querySelector('.meetings-container');
  if (!meetingsContainer) return;
  
  // Make sure the meetings section is visible
  meetingsContainer.style.display = 'flex';
  
  // Add refresh button to meetings header if it doesn't exist
  const meetingsTitle = document.querySelector('.meetings-title-bar');
  if (meetingsTitle && !meetingsTitle.querySelector('.refresh-meetings-btn')) {
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
      this.querySelector('i').classList.add('fa-spin');
      
      if (typeof window.fetchMeetings === 'function') {
        window.fetchMeetings(true);
        
        setTimeout(() => {
          this.querySelector('i').classList.remove('fa-spin');
        }, 2000);
      }
    });
    
    meetingsTitle.style.position = 'relative';
    meetingsTitle.appendChild(refreshButton);
  }
}

/**
 * Initialize the help function
 */
function initializeHelpFunction() {
  const helpBtn = document.getElementById('helpBtn');
  
  // Vérifier si le bouton existe ET s'il n'a pas déjà un gestionnaire d'événements
  if (helpBtn && !helpBtn._hasHelpHandler) {
    // Supprimer les gestionnaires existants
    const newHelpBtn = helpBtn.cloneNode(true);
    if (helpBtn.parentNode) {
      helpBtn.parentNode.replaceChild(newHelpBtn, helpBtn);
    }
    
    newHelpBtn.addEventListener('click', showHelpModal);
    // Marquer le bouton comme ayant un gestionnaire
    newHelpBtn._hasHelpHandler = true;
  }
}

/**
 * Affiche un modal d'aide synthétique
 */
function showHelpModal() {
  // Vérifier si le modal existe déjà
  if (document.querySelector('.help-modal')) {
    return;
  }
  
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
