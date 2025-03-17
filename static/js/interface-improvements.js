/**
 * TeamsRooms - Améliorations de l'interface
 * Version optimisée résolvant les problèmes d'affichage, de navigation et d'interactivité
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Initialisation des améliorations d'interface");
    
    // 1. CORRECTION CRITIQUE - FONCTIONNALITÉ DES BOUTONS REJOINDRE
    fixJoinButtonsFunctionality();
    
    // 2. RÉORGANISATION ET AMÉLIORATION DU MENU
    improveMenuStructure();
    
    // 3. CORRECTION DE L'AFFICHAGE ET DU COMPORTEMENT DES SALLES
    improveRoomsSection();
    
    // 4. SYNCHRONISATION ET MISE À JOUR DES RÉUNIONS 
    improveReunionsDisplay();
    
    // 5. CORRECTION DES BOUTONS ET DE LA NAVIGATION
    fixButtonsAndNavigation();
    
    // Mettre en place une vérification périodique pour les nouveaux éléments
    setupMutationObservers();
    
    console.log("Toutes les améliorations d'interface ont été initialisées");
});

/**
 * Corrige la fonctionnalité des boutons "Rejoindre" des réunions Teams
 * Problème critique: les boutons ne fonctionnaient pas correctement
 */
function fixJoinButtonsFunctionality() {
    console.log("🔄 Correction des boutons de réunion Teams");
    
    // Fonction pour traiter un bouton Rejoindre
    function processJoinButton(button, parentItem) {
        // Vérifier si le bouton existe déjà et a des gestionnaires d'événements
        if (button && button._hasEventListener) return;
        
        // Si le bouton existe mais n'a pas de gestionnaire, le remplacer
        if (button) {
            const newButton = button.cloneNode(true);
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
            }
            button = newButton;
        }
        // Si le bouton n'existe pas, en créer un nouveau
        else if (parentItem) {
            button = document.createElement('button');
            button.className = 'meeting-join-btn';
            button.innerHTML = '<i class="fas fa-video"></i> Rejoindre';
            parentItem.appendChild(button);
        }
        
        if (!button) return; // Sécurité supplémentaire
        
        // Extraire les données de la réunion
        const meetingId = parentItem.getAttribute('data-id') || '';
        const joinUrl = parentItem.getAttribute('data-url') || '';
        
        // Stocker ces informations dans le bouton lui-même
        if (joinUrl) button.setAttribute('data-url', joinUrl);
        if (meetingId) button.setAttribute('data-id', meetingId);
        
        // Attacher le gestionnaire d'événements
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Récupérer les données du bouton ou de l'élément parent
            const url = this.getAttribute('data-url') || parentItem.getAttribute('data-url');
            const id = this.getAttribute('data-id') || parentItem.getAttribute('data-id');
            
            console.log("🚀 Tentative de rejoindre une réunion Teams:", { url, id });
            
            if (url) {
                // URL directe disponible
                console.log("✅ Ouverture de l'URL directe:", url);
                window.open(url, '_blank');
            } 
            else if (id) {
                // Utiliser l'API pour chercher l'URL à partir de l'ID
                if (window.JoinSystem) {
                    console.log("🔍 Recherche de l'URL via ID:", id);
                    
                    // Définir l'ID dans le champ approprié
                    const meetingIdInput = document.getElementById('meetingIdInput') || 
                                          document.getElementById('meeting-id');
                    
                    if (meetingIdInput) {
                        // Enregistrer la valeur précédente
                        const previousValue = meetingIdInput.value;
                        
                        // Définir la nouvelle valeur
                        meetingIdInput.value = id;
                        
                        // Utiliser le système de jointure
                        window.JoinSystem.joinMeetingWithId();
                        
                        // Rétablir la valeur précédente après un délai
                        setTimeout(() => {
                            meetingIdInput.value = previousValue;
                        }, 500);
                    } else {
                        console.error("⚠️ Champ d'ID de réunion introuvable");
                        notifyUser("Erreur: Champ d'ID de réunion introuvable", "error");
                    }
                } else {
                    // Fallback direct avec formatage standard de l'URL Teams
                    const teamsUrl = `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${id}%40thread.v2/0`;
                    console.log("ℹ️ Utilisation de l'URL fallback:", teamsUrl);
                    window.open(teamsUrl, '_blank');
                }
            } else {
                console.error("❌ Aucune URL ou ID trouvé pour cette réunion");
                notifyUser("Impossible de rejoindre cette réunion: URL ou ID manquant", "error");
            }
        });
        
        // Marquer le bouton comme traité
        button._hasEventListener = true;
        
        return button;
    }
    
    // Traiter tous les éléments de réunion
    function processAllMeetingItems() {
        const meetingItems = document.querySelectorAll('.meeting-item');
        let counter = 0;
        
        meetingItems.forEach(meetingItem => {
            // Déterminer si c'est une réunion Teams
            let isTeamsMeeting = false;
            
            // Vérifier différentes sources d'information pour déterminer si c'est une réunion Teams
            if (meetingItem.hasAttribute('data-is-teams')) {
                isTeamsMeeting = meetingItem.getAttribute('data-is-teams') === 'true';
            } 
            else if (meetingItem.hasAttribute('data-url')) {
                const url = meetingItem.getAttribute('data-url');
                isTeamsMeeting = url && url.includes('teams.microsoft.com');
            }
            // Recherche dans le contenu HTML pour des indices
            else {
                const html = meetingItem.innerHTML.toLowerCase();
                isTeamsMeeting = html.includes('teams') || 
                                html.includes('en ligne') || 
                                html.includes('online') || 
                                html.includes('visio');
            }
            
            // Obtenir le bouton existant
            let joinButton = meetingItem.querySelector('.meeting-join-btn');
            
            // Si c'est une réunion Teams, s'assurer que le bouton existe et fonctionne
            if (isTeamsMeeting) {
                joinButton = processJoinButton(joinButton, meetingItem);
                counter++;
            } 
            // Si ce n'est pas une réunion Teams mais qu'il y a un bouton, le supprimer
            else if (joinButton) {
                joinButton.remove();
            }
        });
        
        console.log(`✅ ${counter} boutons "Rejoindre" de réunions Teams traités`);
    }
    
    // Traiter tous les boutons immédiatement
    processAllMeetingItems();
    
    // Configurer une vérification périodique pour les nouveaux éléments
    setInterval(processAllMeetingItems, 2000);
    
    // Configurer le bouton rejoindre principal
    const mainJoinButton = document.getElementById('joinMeetingBtn');
    if (mainJoinButton) {
        mainJoinButton.addEventListener('click', function() {
            const meetingIdInput = document.getElementById('meetingIdInput') || 
                                  document.getElementById('meeting-id');
            
            if (meetingIdInput && meetingIdInput.value) {
                if (window.JoinSystem) {
                    window.JoinSystem.joinMeetingWithId();
                } else {
                    // Fallback basique
                    const teamsUrl = `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${meetingIdInput.value}%40thread.v2/0`;
                    window.open(teamsUrl, '_blank');
                }
            } else {
                notifyUser("Veuillez entrer l'ID de la réunion", "warning");
            }
        });
    }
}

/**
 * Améliore la structure et l'organisation du menu principal
 */
function improveMenuStructure() {
    console.log("🔄 Amélioration de la structure du menu");
    
    // Restructurer le menu en catégories logiques
    const menuItems = document.querySelector('.menu-items');
    if (!menuItems) return;
    
    // 1. Créer une structure de menu cohérente
    
    // Définir les catégories principales
    const menuCategories = [
        {
            id: 'spaces',
            title: 'Espaces',
            icon: 'door-open',
            items: [
                { name: 'Accueil', icon: 'home', url: '/', active: true },
                { name: 'Salles', icon: 'door-open', url: '/salles' },
                { name: 'Véhicules', icon: 'car', url: '/vehicules' },
                { name: 'Matériel', icon: 'laptop', url: '/materiel' }
            ]
        },
        {
            id: 'communication',
            title: 'Communication',
            icon: 'comments',
            items: [
                { name: 'Teams', icon: 'users', url: 'https://teams.microsoft.com', external: true },
                { name: 'Réunions', icon: 'calendar-alt', url: '/reunions' },
                { name: 'Visioconférence', icon: 'video', url: '/visio' }
            ]
        },
        {
            id: 'apps',
            title: 'Applications',
            icon: 'th-large',
            items: [
                { name: 'SAGE', icon: 'calculator', url: 'https://sage.anecoop-france.com', external: true },
                { name: 'AnecoopPulse', icon: 'chart-line', url: '/pulse' },
                { name: 'Mistral AI', icon: 'robot', url: '/mistral' }
            ]
        },
        {
            id: 'admin',
            title: 'Administration',
            icon: 'cog',
            role: 'administrator,manager',
            items: [
                { name: 'Paramètres', icon: 'cog', url: '/admin' },
                { name: 'Utilisateurs', icon: 'user-cog', url: '/admin/users' }
            ]
        }
    ];
    
    // Supprimer les éléments de menu existants pour reconstruire
    menuItems.innerHTML = '';
    
    // Créer les nouvelles catégories et éléments
    menuCategories.forEach((category, index) => {
        // Créer la section de groupe
        const menuGroup = document.createElement('div');
        menuGroup.className = 'menu-group';
        if (category.role) {
            menuGroup.setAttribute('data-role', category.role);
        }
        
        // Ajouter le titre de la catégorie
        const groupTitle = document.createElement('div');
        groupTitle.className = 'menu-group-title';
        groupTitle.innerHTML = `<i class="fas fa-${category.icon}"></i> ${category.title}`;
        menuGroup.appendChild(groupTitle);
        
        // Ajouter les éléments de menu
        category.items.forEach(item => {
            const menuItem = document.createElement('a');
            menuItem.href = item.url;
            menuItem.className = 'menu-item';
            if (item.active) menuItem.classList.add('active');
            if (item.external) menuItem.setAttribute('target', '_blank');
            
            menuItem.innerHTML = `
                <i class="fas fa-${item.icon} menu-item-icon"></i>
                <span class="menu-item-text">${item.name}</span>
                ${item.external ? '<i class="fas fa-external-link-alt" style="font-size: 0.7em; margin-left: 5px;"></i>' : ''}
            `;
            
            menuGroup.appendChild(menuItem);
        });
        
        // Ajouter le groupe au menu
        menuItems.appendChild(menuGroup);
        
        // Ajouter un séparateur entre les groupes (sauf après le dernier)
        if (index < menuCategories.length - 1) {
            const separator = document.createElement('div');
            separator.className = 'menu-separator';
            menuItems.appendChild(separator);
        }
    });
    
    // 2. Optimiser le comportement du menu
    initializeMenu();
    
    console.log("✅ Menu restructuré avec succès");
}

/**
 * Initialise le comportement du menu principal
 */
function initializeMenu() {
    const menuToggleBtn = document.querySelector('.menu-toggle-visible');
    const sideMenu = document.querySelector('.side-menu');
    const mainContainer = document.querySelector('.main-container');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    // S'assurer que le menu est initialement fermé
    if (sideMenu && mainContainer) {
        sideMenu.classList.remove('expanded');
        mainContainer.classList.remove('menu-expanded');
    }
    
    // Menu toggle button
    if (menuToggleBtn && sideMenu && mainContainer) {
        menuToggleBtn.addEventListener('click', function() {
            sideMenu.classList.toggle('expanded');
            mainContainer.classList.toggle('menu-expanded');
            
            // Ajouter/enlever l'overlay sur mobile
            if (window.innerWidth <= 768 && menuOverlay) {
                menuOverlay.classList.toggle('active', sideMenu.classList.contains('expanded'));
            }
            
            // Animation du bouton
            this.classList.toggle('rotated');
            if (this.classList.contains('rotated')) {
                this.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                this.innerHTML = '<i class="fas fa-bars"></i>';
            }
            
            // Mettre à jour la position du titre
            setTimeout(fixTitlePosition, 50);
        });
        
        // Ajouter un style pour l'animation du bouton
        const style = document.createElement('style');
        style.textContent = `
            .menu-toggle-visible.rotated {
                transform: rotate(90deg);
                background: rgba(220, 53, 69, 0.8);
            }
            .menu-toggle-visible {
                transition: transform 0.3s ease, background 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Fermer le menu au clic sur l'overlay
    if (menuOverlay) {
        menuOverlay.addEventListener('click', function() {
            sideMenu.classList.remove('expanded');
            mainContainer.classList.remove('menu-expanded');
            this.classList.remove('active');
            
            // Réinitialiser le bouton
            if (menuToggleBtn) {
                menuToggleBtn.classList.remove('rotated');
                menuToggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
            
            // Mettre à jour la position du titre
            setTimeout(fixTitlePosition, 50);
        });
    }
    
    // Comportement des liens du menu
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            // Mettre à jour l'élément actif
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Sur mobile, fermer le menu après sélection
            if (window.innerWidth <= 768 && sideMenu) {
                sideMenu.classList.remove('expanded');
                mainContainer.classList.remove('menu-expanded');
                if (menuOverlay) menuOverlay.classList.remove('active');
                
                // Réinitialiser le bouton
                if (menuToggleBtn) {
                    menuToggleBtn.classList.remove('rotated');
                    menuToggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        });
    });
}

/**
 * Améliore la section d'affichage des salles
 * Résout les problèmes de positionnement et d'animation
 */
function improveRoomsSection() {
    console.log("🔄 Amélioration de l'affichage des salles");
    
    // 1. AJOUT DE STYLES CSS OPTIMISÉS
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Optimisation de la section des salles */
        .rooms-section {
            position: fixed;
            left: 20px;
            bottom: 90px;
            z-index: 9999;
            background: rgba(40, 40, 40, 0.85);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            border: 1px solid rgba(98, 100, 167, 0.5);
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5);
            padding: 15px;
            width: auto;
            max-width: 650px;
            transform: translateY(20px);
            opacity: 0;
            visibility: hidden;
            transition: transform 0.3s ease, opacity 0.3s ease, visibility 0s linear 0.3s;
        }
        
        .rooms-section.visible {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
            transition: transform 0.3s ease, opacity 0.3s ease, visibility 0s linear;
        }
        
        /* Optimisation du bouton flottant */
        .rooms-toggle-button-floating {
            position: fixed;
            bottom: 20px;
            right: 20px; /* Déplacé à droite */
            background: linear-gradient(to right, var(--primary-color), var(--primary-color-light));
            color: white;
            border: none;
            border-radius: 50px;
            padding: 10px 20px;
            font-size: 0.9rem;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 9999;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .rooms-toggle-button-floating:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
        }
        
        .rooms-toggle-button-floating.active {
            background: linear-gradient(to right, #dc3545, #ff6b6b);
        }
        
        /* Amélioration des cartes de salles */
        .room-card {
            background: rgba(45, 45, 45, 0.8);
            border-radius: 10px;
            padding: 10px;
            border: 1px solid rgba(60, 60, 60, 0.8);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        
        .room-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
            border-color: var(--primary-color);
        }
        
        /* Animation pour le status des salles */
        .status-icon.occupied {
            animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); }
            70% { box-shadow: 0 0 0 6px rgba(220, 53, 69, 0); }
            100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
        }
    `;
    document.head.appendChild(styleElement);
    
    // 2. OPTIMISATION DU BOUTON FLOTTANT ET DES INTERACTIONS
    
    // Récupérer ou créer le bouton flottant
    let floatingButton = document.querySelector('.rooms-toggle-button-floating');
    if (!floatingButton) {
        floatingButton = document.createElement('button');
        floatingButton.className = 'rooms-toggle-button-floating';
        document.body.appendChild(floatingButton);
    }
    
    // S'assurer que le bouton a le bon contenu
    floatingButton.innerHTML = '<i class="fas fa-door-open"></i> Voir les salles disponibles';
    
    // Nettoyer les gestionnaires d'événements existants
    const newFloatingButton = floatingButton.cloneNode(true);
    if (floatingButton.parentNode) {
        floatingButton.parentNode.replaceChild(newFloatingButton, floatingButton);
    }
    floatingButton = newFloatingButton;
    
    // Récupérer ou créer la section des salles
    let roomsSection = document.querySelector('.rooms-section');
    if (!roomsSection) {
        roomsSection = document.createElement('div');
        roomsSection.className = 'rooms-section';
        roomsSection.innerHTML = `
            <div class="rooms-container">
                <div class="rooms">
                    <!-- Les cartes de salles seront ajoutées ici -->
                </div>
            </div>
        `;
        document.body.appendChild(roomsSection);
    }
    
    // État de visibilité
    let isRoomsSectionVisible = false;
    
    // Fonction pour basculer la visibilité
    function toggleRoomsSection() {
        isRoomsSectionVisible = !isRoomsSectionVisible;
        
        if (isRoomsSectionVisible) {
            // Afficher avec animation
            roomsSection.style.display = 'block';
            setTimeout(() => {
                roomsSection.classList.add('visible');
            }, 10);
            
            // Mettre à jour le texte du bouton
            floatingButton.innerHTML = '<i class="fas fa-times"></i> Masquer les salles';
            floatingButton.classList.add('active');
            
            // Forcer la mise à jour du statut des salles
            if (window.RoomsSystem && typeof window.RoomsSystem.updateRoomStatus === 'function') {
                window.RoomsSystem.updateRoomStatus();
            }
        } else {
            // Masquer avec animation
            roomsSection.classList.remove('visible');
            setTimeout(() => {
                roomsSection.style.display = 'none';
            }, 300);
            
            // Mettre à jour le texte du bouton
            floatingButton.innerHTML = '<i class="fas fa-door-open"></i> Voir les salles disponibles';
            floatingButton.classList.remove('active');
        }
    }
    
    // Attacher l'événement au bouton flottant
    floatingButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleRoomsSection();
    });
    
    // Mettre à jour les autres boutons qui peuvent contrôler l'affichage des salles
    const allRoomButtons = document.querySelectorAll('#showRoomsBtn, #toggleRoomsBtn, .toggle-rooms-button');
    allRoomButtons.forEach(button => {
        const newButton = button.cloneNode(true);
        if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);
        }
        
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleRoomsSection();
        });
    });
    
    // Fermer au clic en dehors
    document.addEventListener('click', function(e) {
        if (isRoomsSectionVisible && 
            !roomsSection.contains(e.target) && 
            !floatingButton.contains(e.target) &&
            !e.target.closest('#showRoomsBtn') && 
            !e.target.closest('#toggleRoomsBtn') && 
            !e.target.closest('.toggle-rooms-button')) {
            
            toggleRoomsSection();
        }
    });
    
    // 3. AMÉLIORATION DES INTERACTIONS AVEC LES CARTES DE SALLES
    
    // S'assurer que les cartes de salles sont cliquables
    function makeRoomCardsInteractive() {
        const roomCards = document.querySelectorAll('.room-card');
        roomCards.forEach(card => {
            // Nettoyer les gestionnaires d'événements existants
            const newCard = card.cloneNode(true);
            if (card.parentNode) {
                card.parentNode.replaceChild(newCard, card);
            }
            
            // Ajouter le nouveau gestionnaire d'événements
            newCard.addEventListener('click', function() {
                const roomName = this.getAttribute('data-room');
                if (roomName) {
                    window.location.href = '/' + roomName.toLowerCase();
                }
            });
        });
    }
    
    // Appliquer immédiatement et configurer une vérification périodique
    makeRoomCardsInteractive();
    setInterval(makeRoomCardsInteractive, 2000);
    
    console.log("✅ Section des salles améliorée avec succès");
}

/**
 * Améliore l'affichage et le rafraîchissement des réunions
 */
function improveReunionsDisplay() {
    console.log("🔄 Optimisation de l'affichage des réunions");
    
    // 1. FORCER LE RAFRAÎCHISSEMENT INITIAL DES RÉUNIONS
    if (window.fetchMeetings && typeof window.fetchMeetings === 'function') {
        // Forcer un premier chargement avec rafraîchissement visible
        setTimeout(() => {
            console.log("🔄 Forçage du chargement initial des réunions");
            window.fetchMeetings(true);
        }, 500);
        
        // Configurer un rafraîchissement périodique plus fréquent
        const refreshInterval = 15000; // 15 secondes
        setInterval(() => {
            window.fetchMeetings(false);
        }, refreshInterval);
    }
    
    // 2. AMÉLIORER LE STYLE ET L'INTERACTION DES RÉUNIONS
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Amélioration du panneau de réunions */
        .meetings-container {
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
        }
        
        .meetings-title-bar {
            background: linear-gradient(to right, rgba(40, 40, 40, 0.8), rgba(50, 50, 50, 0.8));
            padding: 15px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        /* Amélioration des items de réunions */
        .meeting-item {
            position: relative;
            overflow: hidden;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .meeting-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
            z-index: 1;
        }
        
        .meeting-item::before {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
        }
        
        .meeting-item.current::before {
            background: var(--success-color);
            animation: pulse-border 2s infinite;
        }
        
        .meeting-item.upcoming::before {
            background: var(--primary-color);
        }
        
        .meeting-item.past::before {
            background: #777;
        }
        
        @keyframes pulse-border {
            0% { opacity: 0.5; }
            50% { opacity: 1; }
            100% { opacity: 0.5; }
        }
        
        /* Amélioration du bouton Rejoindre */
        .meeting-join-btn {
            margin-top: 8px;
            padding: 6px 12px;
            border-radius: 4px;
            background: linear-gradient(to right, var(--primary-color), var(--primary-color-light));
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            align-self: flex-end;
        }
        
        .meeting-join-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
        }
        
        /* Animations pour les mises à jour */
        @keyframes highlight {
            0% { background-color: rgba(var(--primary-color-rgb), 0.3); }
            100% { background-color: transparent; }
        }
        
        .meeting-item.updated {
            animation: highlight 2s ease-out;
        }
    `;
    document.head.appendChild(styleElement);
    
    // 3. OPTIMISER L'ENTRÉE D'ID DE RÉUNION
    const meetingIdEntry = document.querySelector('.meeting-id-entry');
    if (meetingIdEntry) {
        const input = meetingIdEntry.querySelector('input');
        const button = meetingIdEntry.querySelector('button');
        
        if (input) {
            // S'assurer que l'ID est correct
            input.id = 'meetingIdInput';
            
            // Ajouter la fonctionnalité de soumission par Entrée
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && window.JoinSystem) {
                    window.JoinSystem.joinMeetingWithId();
                }
            });
            
            // Améliorer le style
            input.style.padding = '8px 12px';
            input.style.borderRadius = '4px 0 0 4px';
        }
        
        if (button) {
            // Améliorer le style
            button.style.padding = '8px 15px';
            button.style.borderRadius = '0 4px 4px 0';
            button.style.background = 'linear-gradient(to right, var(--success-color), var(--success-color-light))';
        }
    }
    
    // 4. SYNCHRONISER LES RÉUNIONS AVEC LE CALENDRIER ACTUEL
    // S'assurer que la date actuelle est bien affichée
    updateDateTimeDisplay();
    
    console.log("✅ Affichage des réunions optimisé");
}

/**
 * Corrige les boutons et la navigation
 */
function fixButtonsAndNavigation() {
    console.log("🔄 Correction des boutons et de la navigation");
    
    // 1. RESTAURER LE BOUTON PLEIN ÉCRAN
    const controlsContainer = document.querySelector('.control-buttons');
    if (controlsContainer) {
        // Vérifier si le bouton existe déjà
        let fullscreenBtn = document.getElementById('fullscreenBtn');
        
        if (!fullscreenBtn) {
            fullscreenBtn = document.createElement('button');
            fullscreenBtn.id = 'fullscreenBtn';
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i> Plein écran';
            controlsContainer.appendChild(fullscreenBtn);
        }
        
        // S'assurer que le bouton est visible
        fullscreenBtn.style.display = 'flex';
        
        // Nettoyer et réattacher le gestionnaire d'événements
        const newFullscreenBtn = fullscreenBtn.cloneNode(true);
        if (fullscreenBtn.parentNode) {
            fullscreenBtn.parentNode.replaceChild(newFullscreenBtn, fullscreenBtn);
        }
        fullscreenBtn = newFullscreenBtn;
        
        // Ajouter le gestionnaire d'événements
        fullscreenBtn.addEventListener('click', function() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.error(`Erreur lors du passage en plein écran: ${err.message}`);
                    notifyUser("Impossible de passer en plein écran", "error");
                });
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        });
        
        // Mettre à jour l'icône selon l'état du plein écran
        document.addEventListener('fullscreenchange', () => {
            fullscreenBtn.innerHTML = document.fullscreenElement
                ? '<i class="fas fa-compress"></i> Quitter le plein écran'
                : '<i class="fas fa-expand"></i> Plein écran';
        });
    }
    
    // 2. AMÉLIORER LES AUTRES BOUTONS DE CONTRÔLE
    
    // Bouton de rafraîchissement
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        // Nettoyer et réattacher le gestionnaire d'événements
        const newRefreshBtn = refreshBtn.cloneNode(true);
        if (refreshBtn.parentNode) {
            refreshBtn.parentNode.replaceChild(newRefreshBtn, refreshBtn);
        }
        
        // Ajouter une animation de rotation lors du clic
        newRefreshBtn.addEventListener('click', function() {
            this.querySelector('i').classList.add('fa-spin');
            
            // Forcer le rafraîchissement des réunions
            if (window.fetchMeetings) {
                window.fetchMeetings(true);
            }
            
            // Arrêter l'animation après 1 seconde
            setTimeout(() => {
                this.querySelector('i').classList.remove('fa-spin');
            }, 1000);
            
            // Notification de rafraîchissement
            notifyUser("Données rafraîchies", "success");
        });
    }
    
    // Bouton de création de réunion
    const createMeetingBtns = document.querySelectorAll('#createMeetingBtn, .create-meeting-integrated');
    createMeetingBtns.forEach(btn => {
        // Nettoyer et réattacher le gestionnaire d'événements
        const newBtn = btn.cloneNode(true);
        if (btn.parentNode) {
            btn.parentNode.replaceChild(newBtn, btn);
        }
        
        // Ajouter le gestionnaire d'événements
        newBtn.addEventListener('click', function() {
            // Tenter d'ouvrir le modal de réservation via BookingSystem
            if (window.BookingSystem && typeof window.BookingSystem.openModal === 'function') {
                window.BookingSystem.openModal();
            } else {
                // Fallback: ouvrir le modal manuellement
                const bookingModal = document.getElementById('bookingModal');
                if (bookingModal) {
                    bookingModal.style.display = 'flex';
                } else {
                    notifyUser("Impossible d'ouvrir le formulaire de réservation", "error");
                }
            }
        });
    });
    
    // Bouton d'aide
    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
        // Nettoyer et réattacher le gestionnaire d'événements
        const newHelpBtn = helpBtn.cloneNode(true);
        if (helpBtn.parentNode) {
            helpBtn.parentNode.replaceChild(newHelpBtn, helpBtn);
        }
        
        // Ajouter le gestionnaire d'événements
        newHelpBtn.addEventListener('click', function() {
            // Afficher une aide simple
            showHelpOverlay();
        });
    }
    
    // 3. AMÉLIORER LA BARRE DE CONTRÔLE
    const controlsBar = document.querySelector('.controls-container');
    if (controlsBar) {
        controlsBar.style.background = 'rgba(40, 40, 40, 0.8)';
        controlsBar.style.backdropFilter = 'blur(10px)';
        controlsBar.style.boxShadow = '0 -5px 15px rgba(0, 0, 0, 0.2)';
        controlsBar.style.borderTop = '1px solid rgba(255, 255, 255, 0.1)';
    }
    
    console.log("✅ Boutons et navigation corrigés");
}

/**
 * Configure les observateurs de mutations pour gérer les nouveaux éléments
 */
function setupMutationObservers() {
    // Observer les changements dans le conteneur de réunions
    const meetingsContainer = document.querySelector('.meetings-list') || document.getElementById('meetingsContainer');
    if (meetingsContainer) {
        const observer = new MutationObserver(function(mutations) {
            let hasNewMeetings = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    hasNewMeetings = true;
                }
            });
            
            if (hasNewMeetings) {
                // Traiter les nouveaux boutons "Rejoindre"
                setTimeout(fixJoinButtonsFunctionality, 100);
            }
        });
        
        observer.observe(meetingsContainer, { childList: true, subtree: true });
    }
}

/**
 * Corrige la position du titre en fonction de l'état du menu
 */
function fixTitlePosition() {
    const titleContainer = document.querySelector('.title-container');
    const mainContainer = document.querySelector('.main-container');
    
    if (!titleContainer || !mainContainer) return;
    
    // Fixer le positionnement du titre selon l'état du menu
    if (mainContainer.classList.contains('menu-expanded')) {
        titleContainer.style.width = 'calc(100% - 250px)';
        titleContainer.style.left = '250px';
    } else {
        titleContainer.style.width = '100%';
        titleContainer.style.left = '0';
    }
}

/**
 * Met à jour l'affichage de la date et de l'heure
 */
function updateDateTimeDisplay() {
    const datetimeElement = document.querySelector('.datetime');
    if (!datetimeElement) return;
    
    const now = new Date();
    
    // Formatage de la date en français avec majuscule initiale
    const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    let formattedDate = now.toLocaleDateString('fr-FR', dateOptions);
    formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    
    // Formatage de l'heure avec zéros de tête
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}:${seconds}`;
    
    // Mise à jour de l'affichage
    const dateElement = datetimeElement.querySelector('p:first-child');
    const timeElement = datetimeElement.querySelector('p:last-child');
    
    if (dateElement) dateElement.textContent = formattedDate;
    if (timeElement) timeElement.textContent = formattedTime;
}

/**
 * Affiche une notification à l'utilisateur
 */
function notifyUser(message, type = 'info') {
    // Créer le conteneur de notifications s'il n'existe pas
    let notificationContainer = document.getElementById('notificationContainer');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notificationContainer';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '9999';
        notificationContainer.style.display = 'flex';
        notificationContainer.style.flexDirection = 'column';
        notificationContainer.style.gap = '10px';
        document.body.appendChild(notificationContainer);
    }
    
    // Créer la notification
    const notification = document.createElement('div');
    notification.style.padding = '10px 15px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.3)';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.gap = '10px';
    notification.style.minWidth = '250px';
    notification.style.transform = 'translateX(120%)';
    notification.style.transition = 'transform 0.3s ease';
    
    // Définir l'apparence selon le type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = 'rgba(40, 167, 69, 0.9)';
            notification.innerHTML = '<i class="fas fa-check-circle"></i> ' + message;
            break;
        case 'error':
            notification.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
            notification.innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + message;
            break;
        case 'warning':
            notification.style.backgroundColor = 'rgba(255, 193, 7, 0.9)';
            notification.style.color = '#212529';
            notification.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ' + message;
            break;
        default:
            notification.style.backgroundColor = 'rgba(23, 162, 184, 0.9)';
            notification.innerHTML = '<i class="fas fa-info-circle"></i> ' + message;
    }
    
    // Ajouter au conteneur
    notificationContainer.appendChild(notification);
    
    // Animer l'entrée
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Retirer après 5 secondes
    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        
        // Supprimer de la DOM après l'animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

/**
 * Affiche une aide concernant les fonctionnalités principales
 */
function showHelpOverlay() {
    // Créer la structure de l'aide
    let helpOverlay = document.getElementById('helpOverlay');
    
    if (!helpOverlay) {
        helpOverlay = document.createElement('div');
        helpOverlay.id = 'helpOverlay';
        helpOverlay.style.position = 'fixed';
        helpOverlay.style.top = '0';
        helpOverlay.style.left = '0';
        helpOverlay.style.width = '100%';
        helpOverlay.style.height = '100%';
        helpOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        helpOverlay.style.backdropFilter = 'blur(5px)';
        helpOverlay.style.zIndex = '9999';
        helpOverlay.style.display = 'flex';
        helpOverlay.style.justifyContent = 'center';
        helpOverlay.style.alignItems = 'center';
        
        // Contenu de l'aide
        helpOverlay.innerHTML = `
            <div style="background: rgba(40, 40, 40, 0.95); padding: 30px; border-radius: 10px; max-width: 600px; max-height: 80vh; overflow-y: auto; box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; color: white;">Aide - Réservation de salles</h2>
                    <button id="closeHelpBtn" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                
                <div style="line-height: 1.6;">
                    <h3 style="color: var(--primary-color); margin-top: 0;">Vue d'ensemble</h3>
                    <p>Cette application vous permet de gérer et de consulter les réservations de salles et de rejoindre les réunions Teams.</p>
                    
                    <h3 style="color: var(--primary-color);">Réunions</h3>
                    <p>Les réunions du jour sont affichées dans le panneau latéral à droite:</p>
                    <ul>
                        <li>Les réunions <b>en cours</b> s'affichent en premier avec une barre de progression</li>
                        <li>Les réunions <b>à venir</b> sont ensuite listées</li>
                        <li>Les réunions <b>passées</b> apparaissent en dernier avec une opacité réduite</li>
                    </ul>
                    <p>Pour <b>rejoindre une réunion Teams</b>, cliquez sur le bouton "Rejoindre" associé à la réunion.</p>
                    
                    <h3 style="color: var(--primary-color);">Salles</h3>
                    <p>Pour voir toutes les salles disponibles, cliquez sur le bouton <b>"Voir les salles disponibles"</b> en bas à droite de l'écran.</p>
                    <p>Les couleurs indiquent le statut des salles:</p>
                    <ul>
                        <li><span style="color: var(--success-color);"><i class="fas fa-circle"></i></span> <b>Vert</b>: Salle disponible</li>
                        <li><span style="color: var(--danger-color);"><i class="fas fa-circle"></i></span> <b>Rouge</b>: Salle occupée</li>
                        <li><span style="color: var(--warning-color);"><i class="fas fa-circle"></i></span> <b>Orange</b>: Réunion prévue prochainement</li>
                    </ul>
                    
                    <h3 style="color: var(--primary-color);">Créer une réunion</h3>
                    <p>Pour créer une nouvelle réunion:</p>
                    <ol>
                        <li>Cliquez sur le bouton <b>"Créer une réunion"</b> dans la barre de contrôle ou en haut du panneau des réunions</li>
                        <li>Remplissez les détails dans le formulaire qui s'affiche</li>
                        <li>Cliquez sur <b>"Créer la réunion"</b> pour confirmer</li>
                    </ol>
                    
                    <h3 style="color: var(--primary-color);">Raccourcis et astuces</h3>
                    <ul>
                        <li>Utilisez le bouton <b>Rafraîchir</b> pour mettre à jour les données manuellement</li>
                        <li>Le bouton <b>Plein écran</b> permet d'optimiser l'affichage</li>
                        <li>Pour rejoindre une réunion par son ID, utilisez le champ en bas du panneau des réunions</li>
                    </ul>
                </div>
            </div>
        `;
        
        document.body.appendChild(helpOverlay);
        
        // Gestionnaire pour fermer l'aide
        document.getElementById('closeHelpBtn').addEventListener('click', function() {
            helpOverlay.style.opacity = '0';
            setTimeout(() => {
                if (helpOverlay.parentNode) {
                    helpOverlay.parentNode.removeChild(helpOverlay);
                }
            }, 300);
        });
        
        // Animation d'entrée
        helpOverlay.style.opacity = '0';
        setTimeout(() => {
            helpOverlay.style.opacity = '1';
            helpOverlay.style.transition = 'opacity 0.3s ease';
        }, 10);
    }
}
