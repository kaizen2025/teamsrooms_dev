/**
 * TeamsRooms Interface Improvements - Enhanced JavaScript
 * Comprehensive update addressing all feedback including join button functionality,
 * menu organization, UI alignment, and animation improvements
 */

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
    
    console.log('Comprehensive interface improvements initialized');
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
 * Fix join button functionality - CRITICAL issue
 * Only show join button for Teams meetings
 */
function fixJoinButtonsFunctionality() {
    console.log("Fixing join button functionality");
    
    // Process all meeting items to properly display/hide join buttons
    const meetingItems = document.querySelectorAll('.meeting-item');
    meetingItems.forEach(meetingItem => {
        const isTeamsMeeting = meetingItem.hasAttribute('data-is-teams') ? 
                              meetingItem.getAttribute('data-is-teams') === 'true' : 
                              meetingItem.querySelector('.meeting-join-btn') !== null;
        
        // Get or create join button
        let joinButton = meetingItem.querySelector('.meeting-join-btn');
        
        // If it's not a Teams meeting, remove the join button
        if (!isTeamsMeeting) {
            if (joinButton) {
                joinButton.remove();
            }
            return;
        }
        
        // If the button doesn't exist but should, create it
        if (!joinButton && isTeamsMeeting) {
            joinButton = document.createElement('button');
            joinButton.className = 'meeting-join-btn';
            joinButton.innerHTML = '<i class="fas fa-video"></i> Rejoindre';
            meetingItem.appendChild(joinButton);
        }
        
        // Get the join URL
        const joinUrl = meetingItem.getAttribute('data-url');
        const meetingId = meetingItem.getAttribute('data-id');
        
        // Ensure the button has the proper data
        if (joinUrl) {
            joinButton.setAttribute('data-url', joinUrl);
        } else if (meetingId) {
            joinButton.setAttribute('data-meeting-id', meetingId);
        }
        
        // Add click event listener
        joinButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const buttonUrl = this.getAttribute('data-url');
            const buttonMeetingId = this.getAttribute('data-meeting-id') || 
                                    meetingItem.getAttribute('data-id');
            
            if (buttonUrl) {
                // Direct URL available, open it
                window.open(buttonUrl, '_blank');
                console.log("Opening Teams meeting URL:", buttonUrl);
            } else if (buttonMeetingId) {
                // Use the join system with meeting ID
                if (window.JoinSystem) {
                    console.log("Using JoinSystem with ID:", buttonMeetingId);
                    // Set the meeting ID in the input field
                    const meetingIdInput = document.getElementById('meeting-id') || 
                                          document.getElementById('meetingIdInput');
                    if (meetingIdInput) {
                        meetingIdInput.value = buttonMeetingId;
                        // Trigger join function
                        window.JoinSystem.joinMeetingWithId();
                    } else {
                        console.error("Meeting ID input field not found");
                        alert("Erreur: Champ d'ID de réunion introuvable.");
                    }
                } else {
                    // Fallback if JoinSystem not available
                    console.error("Join system not available, using fallback");
                    const teamsUrl = `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${buttonMeetingId}%40thread.v2/0`;
                    window.open(teamsUrl, '_blank');
                }
            } else {
                console.error("No join URL or meeting ID found");
                alert("Impossible de rejoindre cette réunion: URL ou ID manquant.");
            }
        });
    });
    
    // Also ensure the main join button works
    const mainJoinButton = document.getElementById('joinMeetingBtn');
    if (mainJoinButton) {
        mainJoinButton.addEventListener('click', function() {
            const meetingIdInput = document.getElementById('meeting-id') || 
                                  document.getElementById('meetingIdInput');
            if (meetingIdInput && meetingIdInput.value) {
                if (window.JoinSystem) {
                    window.JoinSystem.joinMeetingWithId();
                } else {
                    // Basic fallback
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
    // Get the menu items container
    const menuItems = document.querySelector('.menu-items');
    if (!menuItems) return;
    
    // Find the existing Réservation item
    const reservationItem = Array.from(menuItems.querySelectorAll('.menu-item')).find(
        item => item.textContent.trim().includes('Réservation')
    );
    
    // Find the existing "Demande de prêt" item
    const pretItem = Array.from(menuItems.querySelectorAll('.menu-item')).find(
        item => item.textContent.trim().includes('Demande de prêt')
    );
    
    // If both items exist, we can proceed
    if (reservationItem && pretItem) {
        // Remove the old pret item
        if (pretItem.parentNode) {
            pretItem.parentNode.removeChild(pretItem);
        }
        
        // Create a new submenu group for Reservation
        let reservationGroup = reservationItem.parentNode.querySelector('.menu-submenu');
        
        // If the submenu doesn't exist yet, create it
        if (!reservationGroup) {
            // Create a container for the main item and its submenu
            const reservationContainer = document.createElement('div');
            reservationContainer.className = 'menu-item-with-submenu';
            
            // Move the reservation item into this container
            reservationItem.parentNode.insertBefore(reservationContainer, reservationItem);
            reservationContainer.appendChild(reservationItem);
            
            // Add a dropdown indicator to the reservation item
            reservationItem.innerHTML += ' <i class="fas fa-chevron-down menu-dropdown-icon"></i>';
            
            // Create the submenu
            reservationGroup = document.createElement('div');
            reservationGroup.className = 'menu-submenu';
            reservationContainer.appendChild(reservationGroup);
            
            // Add click handler to toggle submenu
            reservationItem.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const submenu = this.parentNode.querySelector('.menu-submenu');
                if (submenu) {
                    submenu.classList.toggle('expanded');
                    
                    // Toggle the dropdown icon
                    const icon = this.querySelector('.menu-dropdown-icon');
                    if (icon) {
                        icon.classList.toggle('fa-chevron-down');
                        icon.classList.toggle('fa-chevron-up');
                    }
                }
            });
            
            // Add the CSS for submenus
            addSubmenuStyles();
        }
        
        // Create a new "Prêt matériel" menu item
        const newPretItem = document.createElement('a');
        newPretItem.href = '/prets';
        newPretItem.className = 'menu-subitem';
        newPretItem.innerHTML = '<i class="fas fa-boxes menu-item-icon"></i><span class="menu-item-text">Prêt matériel</span>';
        
        // Add click handler
        newPretItem.addEventListener('click', function(e) {
            e.stopPropagation(); // Don't trigger parent click
        });
        
        // Create a vehicles submenu item
        const vehiclesItem = document.createElement('a');
        vehiclesItem.href = '/vehicules';
        vehiclesItem.className = 'menu-subitem';
        vehiclesItem.innerHTML = '<i class="fas fa-car menu-item-icon"></i><span class="menu-item-text">Véhicules</span>';
        
        // Create a rooms submenu item
        const roomsItem = document.createElement('a');
        roomsItem.href = '/';
        roomsItem.className = 'menu-subitem';
        roomsItem.innerHTML = '<i class="fas fa-door-open menu-item-icon"></i><span class="menu-item-text">Salles</span>';
        
        // Add the new items to the submenu
        reservationGroup.appendChild(roomsItem);
        reservationGroup.appendChild(vehiclesItem);
        reservationGroup.appendChild(newPretItem);
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
 */
function initializeRoomsDisplay() {
    // Make sure the rooms toggle buttons work properly
    const roomsToggleBtn = document.querySelector('.rooms-toggle-button-floating');
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
    }
    
    // Define the toggle function
    const toggleRooms = function() {
        if (!roomsSection) return;
        
        const isVisible = roomsSection.classList.contains('visible');
        
        if (isVisible) {
            roomsSection.classList.remove('visible');
            setTimeout(() => {
                roomsSection.style.display = 'none';
            }, 300);
            
            // Update button text
            updateRoomsButtonText(false);
        } else {
            roomsSection.style.display = 'block';
            // Force reflow
            roomsSection.offsetHeight;
            roomsSection.classList.add('visible');
            
            // Update button text
            updateRoomsButtonText(true);
        }
    };
    
    // Attach event listeners to all buttons
    if (roomsToggleBtn) {
        roomsToggleBtn.addEventListener('click', toggleRooms);
    }
    
    if (toggleRoomsButton) {
        toggleRoomsButton.addEventListener('click', toggleRooms);
    }
    
    if (controlRoomsBtn) {
        controlRoomsBtn.addEventListener('click', toggleRooms);
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
        card.addEventListener('click', function() {
            const roomName = this.getAttribute('data-room');
            if (roomName) {
                window.location.href = '/' + roomName.toLowerCase();
            }
        });
    });
}

/**
 * Update button text for room toggle buttons
 */
function updateRoomsButtonText(isVisible) {
    const roomsToggleBtn = document.querySelector('.rooms-toggle-button-floating');
    const toggleRoomsButton = document.querySelector('.toggle-rooms-button');
    const controlRoomsBtn = document.getElementById('showRoomsBtn') || document.getElementById('toggleRoomsBtn');
    
    const showText = '<i class="fas fa-door-open"></i> Afficher les salles disponibles';
    const hideText = '<i class="fas fa-times"></i> Masquer les salles disponibles';
    
    const buttonText = isVisible ? hideText : showText;
    const menuButtonText = isVisible ? 
        '<i class="fas fa-times"></i> <span class="button-text">Masquer les salles disponibles</span>' : 
        '<i class="fas fa-door-open"></i> <span class="button-text">Afficher les salles disponibles</span>';
    
    if (roomsToggleBtn) {
        roomsToggleBtn.innerHTML = buttonText;
    }
    
    if (toggleRoomsButton) {
        toggleRoomsButton.innerHTML = menuButtonText;
    }
    
    if (controlRoomsBtn) {
        controlRoomsBtn.innerHTML = buttonText;
    }
}
