/**
 * TeamsRooms Interface Improvements - JavaScript Enhancements
 * This script fixes the JavaScript functionality to support the restored layout
 */

document.addEventListener('DOMContentLoaded', function() {
    // 1. ENSURE LEFT MENU IS VISIBLE AND FUNCTIONAL
    initializeMenu();
    
    // 2. IMPROVE MEETINGS DISPLAY
    enhanceMeetingsDisplay();
    
    // 3. FIX ROOM DISPLAY
    initializeRoomsDisplay();
    
    console.log('Interface improvements initialized');
});

/**
 * Initialize and fix the left menu functionality
 */
function initializeMenu() {
    // Add expanded class to the main container to show the menu
    const mainContainer = document.querySelector('.main-container');
    if (mainContainer) {
        mainContainer.classList.add('menu-expanded');
    }
    
    // Fix the menu toggle button functionality
    const menuToggleBtn = document.querySelector('.menu-toggle-visible');
    const sideMenu = document.querySelector('.side-menu');
    
    if (menuToggleBtn && sideMenu) {
        // Ensure the menu starts expanded
        sideMenu.classList.add('expanded');
        
        menuToggleBtn.addEventListener('click', function() {
            if (sideMenu.classList.contains('expanded') && mainContainer.classList.contains('menu-expanded')) {
                // Hide menu
                sideMenu.classList.remove('expanded');
                mainContainer.classList.remove('menu-expanded');
            } else {
                // Show menu
                sideMenu.classList.add('expanded');
                mainContainer.classList.add('menu-expanded');
            }
        });
    }
    
    // Ensure the overlay behind the menu works on mobile
    const menuOverlay = document.querySelector('.menu-overlay');
    if (menuOverlay) {
        menuOverlay.addEventListener('click', function() {
            sideMenu.classList.remove('expanded');
            menuOverlay.classList.remove('active');
        });
    }
    
    // Ensure menu items are interactive
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            if (target) {
                // Remove active class from all menu items
                menuItems.forEach(i => i.classList.remove('active'));
                // Add active class to clicked item
                this.classList.add('active');
                
                // On mobile, close the menu after selection
                if (window.innerWidth <= 768) {
                    sideMenu.classList.remove('expanded');
                    if (menuOverlay) menuOverlay.classList.remove('active');
                }
            }
        });
    });
}

/**
 * Enhance the meetings display section
 */
function enhanceMeetingsDisplay() {
    // Check if meetings container exists
    const meetingsContainer = document.querySelector('.meetings-container');
    if (!meetingsContainer) return;
    
    // Make sure the meetings section is visible
    meetingsContainer.style.display = 'flex';
    
    // Add hover effect to meeting items
    const meetingItems = document.querySelectorAll('.meeting-item');
    meetingItems.forEach(item => {
        // Add mouseover and mouseout event listeners for subtle animation
        item.addEventListener('mouseover', function() {
            this.style.transform = 'translateY(-3px)';
            this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
        });
        
        item.addEventListener('mouseout', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
    
    // Add status badges to meetings based on time
    addMeetingStatusBadges();
    
    // Fix the create meeting button if it exists
    const createMeetingBtn = document.querySelector('.create-meeting-integrated');
    if (createMeetingBtn) {
        createMeetingBtn.addEventListener('click', function() {
            if (typeof BookingSystem !== 'undefined' && BookingSystem.openModal) {
                BookingSystem.openModal();
            } else {
                console.warn('BookingSystem not available');
            }
        });
    }
}

/**
 * Add status badges to meetings based on current time
 */
function addMeetingStatusBadges() {
    const meetings = document.querySelectorAll('.meeting-item');
    const now = new Date();
    
    meetings.forEach(meeting => {
        // Check if the meeting already has a status badge
        if (meeting.querySelector('.meeting-status-badge')) return;
        
        // Extract start and end times from data attributes or inner content
        let startTime = meeting.getAttribute('data-start');
        let endTime = meeting.getAttribute('data-end');
        
        // If not available as data attributes, try to find them in the content
        if (!startTime || !endTime) {
            const timeElements = meeting.querySelectorAll('.meeting-time');
            if (timeElements.length >= 2) {
                const timeTexts = Array.from(timeElements).map(el => el.textContent.trim());
                const timeMatch = timeTexts.join(' ').match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
                if (timeMatch) {
                    startTime = timeMatch[1];
                    endTime = timeMatch[2];
                }
            }
        }
        
        if (startTime && endTime) {
            // Convert to Date objects for comparison
            const today = new Date().toISOString().split('T')[0];
            const startDate = new Date(`${today}T${startTime}`);
            const endDate = new Date(`${today}T${endTime}`);
            
            // Add appropriate badge
            const meetingHeader = meeting.querySelector('h3') || meeting.firstElementChild;
            const badge = document.createElement('div');
            badge.className = 'meeting-status-badge';
            
            if (now >= startDate && now <= endDate) {
                badge.innerHTML = '<i class="fas fa-clock"></i> En cours';
                badge.style.background = 'linear-gradient(to right, var(--success-color), #43a047)';
                meeting.classList.add('current');
            } else if (now < startDate) {
                badge.innerHTML = '<i class="fas fa-hourglass-start"></i> À venir';
                badge.style.background = 'linear-gradient(to right, var(--primary-color), var(--primary-color-light))';
                meeting.classList.add('upcoming');
            } else {
                badge.innerHTML = '<i class="fas fa-check"></i> Terminée';
                badge.style.background = 'linear-gradient(to right, #777, #999)';
                badge.style.opacity = '0.8';
                meeting.classList.add('past');
                meeting.style.opacity = '0.7';
            }
            
            if (meetingHeader) {
                meetingHeader.parentNode.insertBefore(badge, meetingHeader);
            } else {
                meeting.insertBefore(badge, meeting.firstChild);
            }
        }
    });
}

/**
 * Initialize and fix the rooms display
 */
function initializeRoomsDisplay() {
    // Make sure the rooms toggle button works
    const roomsToggleBtn = document.querySelector('.rooms-toggle-button-floating');
    const roomsSection = document.querySelector('.rooms-section');
    
    if (roomsToggleBtn && roomsSection) {
        roomsToggleBtn.addEventListener('click', function() {
            roomsSection.classList.toggle('visible');
        });
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
