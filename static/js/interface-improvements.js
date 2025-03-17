/**
 * TeamsRooms Interface Improvements - Comprehensive Update
 * Addresses all issues including menu organization, button functionality, and visual enhancements
 */

document.addEventListener('DOMContentLoaded', function() {
    // 1. REORGANIZE MENU STRUCTURE
    reorganizeMenu();
    
    // 2. FIX JOIN BUTTON FUNCTIONALITY
    fixJoinButtonsFunctionality();
    
    // 3. ENSURE MENU BEHAVIOR IS FUNCTIONAL
    initializeMenu();
    
    // 4. UPDATE BUTTONS AND LAYOUT
    updateButtonsAndLayout();
    
    // 5. IMPROVE TITLE CENTERING AND HEADER
    fixTitleCentering();
    improveDateTimeDisplay();
    
    // 6. IMPROVE MEETINGS DISPLAY FOR BETTER VISIBILITY
    enhanceMeetingsDisplay();
    
    // 7. FIX ROOM DISPLAY ANIMATION
    initializeRoomsDisplay();
    
    // 8. ADD FULLSCREEN BUTTON TO CENTER BOTTOM
    addFullscreenButton();
    
    console.log('Comprehensive interface improvements initialized');
});

/**
 * Reorganize the menu structure to be more logical
 */
function reorganizeMenu() {
    const sideMenu = document.querySelector('.side-menu .menu-items');
    if (!sideMenu) return;
    
    // Remove existing Teams item
    const teamsItem = sideMenu.querySelector('.menu-item:has(i.fa-users)');
    if (teamsItem) {
        teamsItem.remove();
    }
    
    // Find the Reservation menu item
    const reservationItem = sideMenu.querySelector('.menu-item:has(i.fa-calendar-alt)');
    if (reservationItem) {
        // Remove the existing link behavior
        reservationItem.removeAttribute('href');
        
        // Add a dropdown indicator
        const reservationText = reservationItem.querySelector('.menu-item-text');
        if (reservationText) {
            reservationText.innerHTML += ' <i class="fas fa-chevron-down"></i>';
        }
        
        // Create the submenu container
        const subMenu = document.createElement('div');
        subMenu.className = 'menu-submenu';
        subMenu.style.display = 'none';
        subMenu.style.paddingLeft = '20px';
        subMenu.style.marginTop = '5px';
        
        // Add submenu items
        subMenu.innerHTML = `
            <a href="/reservation-salle" class="menu-item">
                <i class="fas fa-door-open menu-item-icon"></i>
                <span class="menu-item-text">Réservation salle</span>
            </a>
            <a href="/reservation-vehicule" class="menu-item">
                <i class="fas fa-car menu-item-icon"></i>
                <span class="menu-item-text">Réservation véhicule</span>
            </a>
        `;
        
        // Insert submenu after the reservation item
        reservationItem.parentNode.insertBefore(subMenu, reservationItem.nextSibling);
        
        // Toggle submenu on click
        reservationItem.addEventListener('click', function(e) {
            e.preventDefault();
            const isVisible = subMenu.style.display !== 'none';
            subMenu.style.display = isVisible ? 'none' : 'block';
            
            // Update the chevron icon
            const chevron = reservationText.querySelector('i.fa-chevron-down, i.fa-chevron-up');
            if (chevron) {
                chevron.className = isVisible ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
            }
        });
    }
    
    // Remove duplicate "Afficher les salles" button in menu if there's already one at the bottom
    const toggleRoomsButtons = document.querySelectorAll('.toggle-rooms-button');
    if (toggleRoomsButtons.length > 1) {
        // Keep only the last one (in the menu-bottom)
        for (let i = 0; i < toggleRoomsButtons.length - 1; i++) {
            toggleRoomsButtons[i].style.display = 'none';
        }
    }
}

/**
 * Fix join button functionality
 */
function fixJoinButtonsFunctionality() {
    // Fix all meeting join buttons
    document.querySelectorAll('.meeting-join-btn').forEach(button => {
        // Remove any existing event listeners
        const newButton = button.cloneNode(true);
        if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);
        }
        
        // Add the new event listener
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Get the join URL - either from data attribute or from meeting ID
            const joinUrl = this.getAttribute('data-url');
            const meetingItem = this.closest('.meeting-item');
            const meetingId = meetingItem ? meetingItem.getAttribute('data-id') : null;
            
            if (joinUrl) {
                // Direct URL available, open it
                window.open(joinUrl, '_blank');
                console.log("Opening Teams meeting with URL:", joinUrl);
            } else if (meetingId) {
                // Use the join system with meeting ID
                if (window.JoinSystem) {
                    // Set the meeting ID in the input field
                    const meetingIdInput = document.getElementById('meeting-id') || 
                                          document.getElementById('meetingIdInput');
                    if (meetingIdInput) {
                        meetingIdInput.value = meetingId;
                        // Trigger join function
                        window.JoinSystem.joinMeetingWithId();
                        console.log("Joining Teams meeting with ID:", meetingId);
                    }
                } else {
                    // Fallback if JoinSystem not available
                    const teamsUrl = `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${meetingId}%40thread.v2/0`;
                    window.open(teamsUrl, '_blank');
                    console.log("Fallback: Opening Teams meeting with constructed URL");
                }
            } else {
                console.error("No join URL or meeting ID found");
                alert("Impossible de rejoindre la réunion : aucun lien ou ID trouvé.");
            }
        });
    });
    
    // Ensure the main join button works too
    const mainJoinButton = document.getElementById('joinMeetingBtn');
    if (mainJoinButton) {
        // Remove existing event listeners
        const newJoinButton = mainJoinButton.cloneNode(true);
        if (mainJoinButton.parentNode) {
            mainJoinButton.parentNode.replaceChild(newJoinButton, mainJoinButton);
        }
        
        // Add new event listener
        newJoinButton.addEventListener('click', function() {
            const meetingIdInput = document.getElementById('meeting-id') || 
                                   document.getElementById('meetingIdInput');
            if (meetingIdInput && meetingIdInput.value) {
                if (window.JoinSystem) {
                    console.log("Joining Teams meeting with ID:", meetingIdInput.value);
                    window.JoinSystem.joinMeetingWithId();
                } else {
                    // Basic fallback
                    const teamsUrl = `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${meetingIdInput.value}%40thread.v2/0`;
                    window.open(teamsUrl, '_blank');
                    console.log("Fallback: Opening Teams meeting with constructed URL");
                }
            } else {
                alert("Veuillez entrer l'ID de la réunion.");
            }
        });
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
        // Remove existing event listeners
        const newMenuToggleBtn = menuToggleBtn.cloneNode(true);
        if (menuToggleBtn.parentNode) {
            menuToggleBtn.parentNode.replaceChild(newMenuToggleBtn, menuToggleBtn);
        }
        
        // Add new event listener
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
            
            // Update title centering
            setTimeout(fixTitleCentering, 50);
        });
    }
    
    // Close menu when clicking overlay
    if (menuOverlay) {
        // Remove existing event listeners
        const newMenuOverlay = menuOverlay.cloneNode(true);
        if (menuOverlay.parentNode) {
            menuOverlay.parentNode.replaceChild(newMenuOverlay, menuOverlay);
        }
        
        // Add new event listener
        newMenuOverlay.addEventListener('click', function() {
            sideMenu.classList.remove('expanded');
            mainContainer.classList.remove('menu-expanded');
            newMenuOverlay.classList.remove('active');
            
            // Update title centering
            setTimeout(fixTitleCentering, 50);
        });
    }
    
    // Ensure menu items are interactive and close menu on mobile
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        // Skip items that are already handled (like the reservation dropdown)
        if (item.querySelector('.fa-chevron-down, .fa-chevron-up')) return;
        
        // Remove existing event listeners
        const newItem = item.cloneNode(true);
        if (item.parentNode) {
            item.parentNode.replaceChild(newItem, item);
        }
        
        // Add new event listener
        newItem.addEventListener('click', function(e) {
            // If it's a submenu item, don't remove active class from others
            if (!this.closest('.menu-submenu')) {
                // Remove active class from all top-level menu items
                menuItems.forEach(i => {
                    if (!i.closest('.menu-submenu')) {
                        i.classList.remove('active');
                    }
                });
                // Add active class to clicked item
                this.classList.add('active');
            }
            
            // Don't close menu if it's a dropdown toggle
            if (this.querySelector('.fa-chevron-down, .fa-chevron-up')) {
                e.preventDefault();
                return;
            }
            
            // On mobile, close the menu after selection
            if (window.innerWidth <= 768) {
                sideMenu.classList.remove('expanded');
                mainContainer.classList.remove('menu-expanded');
                if (menuOverlay) menuOverlay.classList.remove('active');
                
                // Update title centering
                setTimeout(fixTitleCentering, 50);
            }
        });
    });
}

/**
 * Update buttons text and layout
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
    
    // Ensure the "Créer une réunion Teams" button is consistently styled
    const createMeetingButtons = document.querySelectorAll('.create-meeting-integrated, #createMeetingBtn');
    createMeetingButtons.forEach(button => {
        button.style.background = 'linear-gradient(to right, var(--primary-color), var(--primary-color-light))';
        button.style.borderRadius = '8px';
        button.style.padding = '8px 15px';
        button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
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
        // Remove existing events
        const newRoomsToggleBtn = roomsToggleBtn.cloneNode(true);
        if (roomsToggleBtn.parentNode) {
            roomsToggleBtn.parentNode.replaceChild(newRoomsToggleBtn, roomsToggleBtn);
        }
        newRoomsToggleBtn.addEventListener('click', toggleRooms);
    }
    
    if (toggleRoomsButton) {
        // Remove existing events
        const newToggleRoomsButton = toggleRoomsButton.cloneNode(true);
        if (toggleRoomsButton.parentNode) {
            toggleRoomsButton.parentNode.replaceChild(newToggleRoomsButton, toggleRoomsButton);
        }
        newToggleRoomsButton.addEventListener('click', toggleRooms);
    }
    
    if (controlRoomsBtn) {
        // Remove existing events
        const newControlRoomsBtn = controlRoomsBtn.cloneNode(true);
        if (controlRoomsBtn.parentNode) {
            controlRoomsBtn.parentNode.replaceChild(newControlRoomsBtn, controlRoomsBtn);
        }
        newControlRoomsBtn.addEventListener('click', toggleRooms);
    }
    
    // Fix room cards if they exist
    const roomCards = document.querySelectorAll('.room-card');
    roomCards.forEach(card => {
        card.style.borderRadius = '10px';
        card.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
        card.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
        
        // Remove existing events
        const newCard = card.cloneNode(true);
        if (card.parentNode) {
            card.parentNode.replaceChild(newCard, card);
        }
        
        // Add hover effect
        newCard.addEventListener('mouseover', function() {
            this.style.transform = 'translateY(-3px)';
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.4)';
        });
        
        newCard.addEventListener('mouseout', function() {
            this.style.transform = '';
            this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
        });
        
        // Make sure room cards are clickable
        newCard.addEventListener('click', function() {
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

/**
 * Add a fullscreen button to the bottom center of the page
 */
function addFullscreenButton() {
    // Check if button already exists
    if (document.getElementById('centerFullscreenBtn')) return;
    
    // Create the button
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.id = 'centerFullscreenBtn';
    fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    fullscreenBtn.title = 'Plein écran';
    
    // Style the button
    fullscreenBtn.style.position = 'fixed';
    fullscreenBtn.style.bottom = '20px';
    fullscreenBtn.style.left = '50%';
    fullscreenBtn.style.transform = 'translateX(-50%)';
    fullscreenBtn.style.zIndex = '1000';
    fullscreenBtn.style.background = 'rgba(50, 50, 50, 0.8)';
    fullscreenBtn.style.color = 'white';
    fullscreenBtn.style.border = '1px solid rgba(255, 255, 255, 0.2)';
    fullscreenBtn.style.borderRadius = '50%';
    fullscreenBtn.style.width = '50px';
    fullscreenBtn.style.height = '50px';
    fullscreenBtn.style.display = 'flex';
    fullscreenBtn.style.alignItems = 'center';
    fullscreenBtn.style.justifyContent = 'center';
    fullscreenBtn.style.fontSize = '1.2rem';
    fullscreenBtn.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
    fullscreenBtn.style.cursor = 'pointer';
    fullscreenBtn.style.transition = 'all 0.2s ease';
    
    // Add hover effect
    fullscreenBtn.addEventListener('mouseover', function() {
        this.style.background = 'rgba(98, 100, 167, 0.9)';
        this.style.transform = 'translateX(-50%) scale(1.1)';
    });
    
    fullscreenBtn.addEventListener('mouseout', function() {
        this.style.background = 'rgba(50, 50, 50, 0.8)';
        this.style.transform = 'translateX(-50%) scale(1)';
    });
    
    // Add functionality
    fullscreenBtn.addEventListener('click', function() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Erreur lors du passage en plein écran: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });
    
    // Update icon based on fullscreen state
    document.addEventListener('fullscreenchange', function() {
        fullscreenBtn.innerHTML = document.fullscreenElement ? 
            '<i class="fas fa-compress"></i>' : 
            '<i class="fas fa-expand"></i>';
    });
    
    // Add button to the page
    document.body.appendChild(fullscreenBtn);
}
