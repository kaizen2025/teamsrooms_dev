/**
 * TeamsRooms Interface Improvements - Updated JavaScript
 * Addresses all feedback including menu behavior and visibility adjustments
 */

document.addEventListener('DOMContentLoaded', function() {
    // 1. ENSURE MENU STARTS COLLAPSED AND IS FUNCTIONAL
    initializeMenu();
    
    // 2. IMPROVE TITLE CENTERING
    fixTitleCentering();
    
    // 3. IMPROVE MEETINGS DISPLAY FOR BETTER VISIBILITY
    enhanceMeetingsDisplay();
    
    // 4. FIX ROOM DISPLAY
    initializeRoomsDisplay();
    
    console.log('Updated interface improvements initialized');
});

/**
 * Initialize and fix the left menu functionality
 * - Menu starts collapsed by default
 * - Menu expands when clicking the toggle button
 */
function initializeMenu() {
    const menuToggleBtn = document.querySelector('.menu-toggle-visible');
    const sideMenu = document.querySelector('.side-menu');
    const mainContainer = document.querySelector('.main-container');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    // Menu starts collapsed by default
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
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
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
        });
    });
    
    // Handle toggle rooms button in menu
    const toggleRoomsButton = document.querySelector('.toggle-rooms-button');
    const roomsSection = document.querySelector('.rooms-section');
    
    if (toggleRoomsButton && roomsSection) {
        toggleRoomsButton.addEventListener('click', function() {
            roomsSection.classList.toggle('visible');
        });
    }
}

/**
 * Fix title centering for both menu states (open/closed)
 */
function fixTitleCentering() {
    const mainContainer = document.querySelector('.main-container');
    const titleContainer = document.querySelector('.title-container');
    
    if (!mainContainer || !titleContainer) return;
    
    // Check if on mobile
    if (window.innerWidth <= 768) {
        titleContainer.style.width = '100%';
        titleContainer.style.left = '0';
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
 * Enhance the meetings display section
 * - Optimize for showing more meetings without scrolling
 * - Add proper status indicators
 */
function enhanceMeetingsDisplay() {
    // Check if meetings container exists
    const meetingsContainer = document.querySelector('.meetings-container');
    if (!meetingsContainer) return;
    
    // Make sure the meetings section is visible and properly sized
    meetingsContainer.style.display = 'flex';
    
    // Optimize meeting items for more compact display
    const meetingItems = document.querySelectorAll('.meeting-item');
    meetingItems.forEach(item => {
        // Reduce margins and padding for more compact display
        item.style.margin = '5px 0';
        item.style.padding = '8px 10px';
        
        // Add hover effect
        item.addEventListener('mouseover', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.3)';
        });
        
        item.addEventListener('mouseout', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
    
    // Ensure all progress bars are properly sized
    updateMeetingProgressBars();
    
    // Make sure section headers are compact
    const sectionHeaders = document.querySelectorAll('.status-section');
    sectionHeaders.forEach(header => {
        header.style.padding = '3px 5px';
        header.style.marginTop = '3px';
    });
    
    // Set up auto-refresh for meetings
    setInterval(updateMeetingProgressBars, 60000); // Update every minute
}

/**
 * Update progress bars for in-progress meetings
 */
function updateMeetingProgressBars() {
    const now = new Date();
    const currentMeetings = document.querySelectorAll('.meeting-item.current');
    
    currentMeetings.forEach(meeting => {
        const progressBar = meeting.querySelector('.meeting-progress-bar');
        const timeRemaining = meeting.querySelector('.time-remaining');
        
        if (!progressBar || !timeRemaining) return;
        
        // Extract start and end times
        const startTimeStr = meeting.dataset.start;
        const endTimeStr = meeting.dataset.end;
        
        if (!startTimeStr || !endTimeStr) return;
        
        const today = new Date().toISOString().split('T')[0];
        const startTime = new Date(`${today}T${startTimeStr}`);
        const endTime = new Date(`${today}T${endTimeStr}`);
        
        // Calculate progress percentage
        const totalDuration = endTime - startTime;
        const elapsed = now - startTime;
        const percentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
        
        // Update progress bar
        progressBar.style.width = `${percentage}%`;
        
        // Calculate and update remaining time
        const remaining = endTime - now;
        const remainingMinutes = Math.max(0, Math.floor(remaining / 60000));
        timeRemaining.innerHTML = `<i class="far fa-hourglass"></i> ${remainingMinutes} min restantes`;
    });
}

/**
 * Initialize and fix the rooms display
 */
function initializeRoomsDisplay() {
    // Make sure the rooms toggle buttons work
    const roomsToggleBtn = document.querySelector('.rooms-toggle-button-floating');
    const toggleRoomsButton = document.querySelector('.toggle-rooms-button');
    const roomsSection = document.querySelector('.rooms-section');
    
    const toggleRooms = () => {
        if (roomsSection) {
            roomsSection.classList.toggle('visible');
        }
    };
    
    if (roomsToggleBtn) {
        roomsToggleBtn.addEventListener('click', toggleRooms);
    }
    
    if (toggleRoomsButton) {
        toggleRoomsButton.addEventListener('click', toggleRooms);
    }
    
    // Fix room cards if they exist
    const roomCards = document.querySelectorAll('.room-card');
    roomCards.forEach(card => {
        card.addEventListener('click', function() {
            const roomName = this.getAttribute('data-room') || this.querySelector('.room-name').textContent;
            if (roomName) {
                // Navigate to the room page
                window.location.href = '/' + roomName.toLowerCase();
            }
        });
    });
}

/**
 * Updates the datetime display in the header
 */
function updateDateTimeDisplay() {
    const datetimeElement = document.querySelector('.datetime');
    if (!datetimeElement) return;
    
    const now = new Date();
    
    // Format the date in French locale
    const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = now.toLocaleDateString('fr-FR', dateOptions);
    
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

// Update the clock every second
setInterval(updateDateTimeDisplay, 1000);
updateDateTimeDisplay(); // Initial update

// Listen for window resize to adjust title centering
window.addEventListener('resize', fixTitleCentering);
