/**
 * Optimisations améliorées pour l'application de réservation de salles
 * Version 2.0 - Résout les problèmes spécifiques avec:
 * 1. Format d'affichage des salles
 * 2. Redirection directe des réunions Teams
 * 3. Historique des ID de réunion
 * 4. Latence des interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Appliquer les optimisations et corrections
    fixRoomsDisplaySize();
    fixTeamsDirectJoin();
    improveIdHistory();
    reduceInteractionLatency();
});

/**
 * Corrige le format d'affichage des salles pour revenir à un style plus compact
 */
function fixRoomsDisplaySize() {
    // Remplacer les styles précédents qui rendaient l'affichage trop grand
    addGlobalStyles(`
        .rooms-section {
            position: absolute; /* Au lieu de fixed */
            z-index: 100;
            top: 80px; /* Position plus haute */
            left: 50%;
            transform: translateX(-50%);
            width: auto; /* Au lieu de max-width: 90% */
            max-width: 1200px; /* Limiter la largeur maximale */
            height: auto;
            max-height: 230px; /* Hauteur plus adaptée */
            overflow-y: auto;
            background: rgba(40, 40, 40, 0.9);
            backdrop-filter: blur(10px);
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
            display: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .rooms-section.visible {
            display: block;
            opacity: 1;
        }
        
        /* Style pour les cartes de salle en format plus compact */
        .rooms {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            justify-content: center;
        }
        
        .room-card {
            width: 120px;
            height: 80px;
            padding: 10px;
            background: rgba(50, 50, 50, 0.8);
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
            text-align: center;
        }
        
        .room-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
        }
        
        .room-name {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 0.9em;
        }
        
        .room-status {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 0.8em;
        }
        
        .status-icon {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            display: inline-block;
        }
        
        .status-icon.available {
            background-color: #4CAF50;
        }
        
        .status-icon.occupied {
            background-color: #F44336;
        }
        
        .status-icon.soon {
            background-color: #FFC107;
        }
    `);
    
    // Observer la mutation du DOM pour s'assurer que les styles sont appliqués
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (let node of mutation.addedNodes) {
                    if (node.classList && node.classList.contains('rooms-section')) {
                        applyRoomCardStyles(node);
                    }
                }
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Appliquer les styles aux cartes de salle existantes
    const roomsSection = document.querySelector('.rooms-section');
    if (roomsSection) {
        applyRoomCardStyles(roomsSection);
    }
    
    function applyRoomCardStyles(container) {
        const roomCards = container.querySelectorAll('.room-card');
        roomCards.forEach(card => {
            card.style.width = '120px';
            card.style.height = '80px';
            card.style.padding = '10px';
            card.style.margin = '0';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.justifyContent = 'center';
            card.style.alignItems = 'center';
            card.style.textAlign = 'center';
            
            // Assurer la visibilité du texte
            const roomName = card.querySelector('.room-name');
            if (roomName) {
                roomName.style.fontSize = '0.9em';
                roomName.style.fontWeight = 'bold';
                roomName.style.marginBottom = '5px';
            }
            
            const roomStatus = card.querySelector('.room-status');
            if (roomStatus) {
                roomStatus.style.fontSize = '0.8em';
                roomStatus.style.display = 'flex';
                roomStatus.style.alignItems = 'center';
                roomStatus.style.gap = '5px';
            }
        });
    }
}

/**
 * Optimise la fonction de jointure des réunions Teams pour rediriger directement
 * dans la réunion sans passer par l'écran de choix
 */
function fixTeamsDirectJoin() {
    // Capture la fonction originale JoinSystem.joinMeetingWithId si elle existe
    let originalJoinFunction = null;
    if (window.JoinSystem && typeof window.JoinSystem.joinMeetingWithId === 'function') {
        originalJoinFunction = window.JoinSystem.joinMeetingWithId;
    }
    
    // Fonction améliorée pour la redirection directe vers les réunions Teams
    function enhancedJoinMeetingWithId(providedId = null) {
        // Empêcher les déclenchements multiples
        if (window.joiningMeeting) {
            console.log("Jointure déjà en cours, ignorer ce clic");
            return;
        }
        window.joiningMeeting = true;
        
        const meetingIdField = document.getElementById('meeting-id') || document.getElementById('meetingIdInput');
        if (!meetingIdField && !providedId) {
            alert("Veuillez entrer l'ID de la réunion");
            window.joiningMeeting = false;
            return;
        }
        
        // Déterminer l'ID à utiliser
        let meetingId = providedId || meetingIdField.value.trim();
        
        if (!meetingId) {
            alert("Veuillez entrer l'ID de la réunion");
            window.joiningMeeting = false;
            return;
        }
        
        // Nettoyer l'ID pour qu'il soit utilisable
        meetingId = cleanMeetingId(meetingId);
        
        // Modification critique: Interface visuelle
        const joinButton = document.getElementById('joinMeetingBtn');
        if (joinButton) {
            joinButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            joinButton.disabled = true;
        }
        
        // Amélioration cruciale: essayer d'abord l'API lookupMeeting
        tryLookupMeeting(meetingId)
            .then(joinUrl => {
                if (joinUrl) {
                    // Construire une URL Teams optimisée pour la redirection directe
                    const enhancedUrl = enhanceTeamsUrl(joinUrl);
                    saveRecentId(meetingId);
                    
                    // Ouvrir dans un nouvel onglet avec les paramètres pour redirection directe
                    window.open(enhancedUrl, "_blank");
                    showSuccessMessage("Redirection vers la réunion Teams...");
                } else {
                    // Fallback: Construire une URL générique avec des paramètres directs
                    const fallbackUrl = buildDirectTeamsUrl(meetingId);
                    saveRecentId(meetingId);
                    
                    // Ouvrir dans un nouvel onglet
                    window.open(fallbackUrl, "_blank");
                    showWarningMessage("URL directe non trouvée, tentative avec ID...");
                }
            })
            .catch(error => {
                console.error("Erreur lors de la jointure:", error);
                showErrorMessage("Erreur: impossible de rejoindre la réunion");
            })
            .finally(() => {
                // Restaurer l'interface
                if (joinButton) {
                    joinButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Rejoindre';
                    joinButton.disabled = false;
                }
                window.joiningMeeting = false;
            });
    }
    
    // Tenter d'utiliser l'API lookupMeeting pour obtenir l'URL de jointure directe
    async function tryLookupMeeting(meetingId) {
        try {
            const response = await fetch(`/lookupMeeting?meetingId=${encodeURIComponent(meetingId)}`);
            if (!response.ok) {
                return null;
            }
            const data = await response.json();
            return data.joinUrl || null;
        } catch (error) {
            console.error("Erreur lors de la recherche de la réunion:", error);
            return null;
        }
    }
    
    // Construire une URL Teams optimisée pour la redirection directe
    function enhanceTeamsUrl(baseUrl) {
        try {
            const url = new URL(baseUrl);
            
            // Ajouter les paramètres pour redirection directe
            url.searchParams.set('directDl', 'true'); // Lancer directement
            url.searchParams.set('msLaunch', 'true'); // Lancer dans l'application
            url.searchParams.set('enableMobilePage', 'true'); // Support mobile
            url.searchParams.set('suppressPrompt', 'true'); // Supprimer les invites
            
            return url.toString();
        } catch (error) {
            console.error("Erreur lors de l'amélioration de l'URL:", error);
            return baseUrl; // En cas d'erreur, retourner l'URL d'origine
        }
    }
    
    // Construire une URL Teams directe à partir de l'ID
    function buildDirectTeamsUrl(meetingId) {
        // Construire l'URL avec tous les paramètres nécessaires pour une redirection directe
        return `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${meetingId}%40thread.v2/0?context=%7B%22Tid%22%3A%224dc0974a-7836-414e-8dda-347f31dac3eb%22%7D&directDl=true&msLaunch=true&enableMobilePage=true&suppressPrompt=true`;
    }
    
    // Nettoyer l'ID de réunion
    function cleanMeetingId(id) {
        // Si c'est une URL complète, extraire l'ID
        if (id.includes('teams.microsoft.com/l/meetup-join')) {
            const urlMatch = id.match(/19%3ameeting_([^%@]+)/i);
            if (urlMatch && urlMatch[1]) {
                return urlMatch[1];
            }
        }
        
        // Si c'est un ID numérique simple (comme dans l'exemple)
        if (/^\d+$/.test(id)) {
            return id; // Garder tel quel
        }
        
        // Nettoyage général
        return id.replace(/[^a-zA-Z0-9]/g, '');
    }
    
    // Sauvegarder l'ID récent
    function saveRecentId(id) {
        let recentIds = JSON.parse(localStorage.getItem('recentMeetingIds') || '[]');
        
        // Ajouter l'ID s'il n'existe pas déjà
        if (!recentIds.includes(id)) {
            recentIds.unshift(id);
            recentIds = recentIds.slice(0, 5); // Garder les 5 derniers
            localStorage.setItem('recentMeetingIds', JSON.stringify(recentIds));
        }
    }
    
    // Afficher un message de succès
    function showSuccessMessage(message) {
        showStatusMessage(message, 'success');
    }
    
    // Afficher un message d'avertissement
    function showWarningMessage(message) {
        showStatusMessage(message, 'warning');
    }
    
    // Afficher un message d'erreur
    function showErrorMessage(message) {
        showStatusMessage(message, 'error');
    }
    
    // Afficher un message de statut
    function showStatusMessage(message, type) {
        // Créer l'élément de message s'il n'existe pas
        let messageContainer = document.getElementById('join-status-message');
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.id = 'join-status-message';
            messageContainer.style.position = 'fixed';
            messageContainer.style.top = '20px';
            messageContainer.style.left = '50%';
            messageContainer.style.transform = 'translateX(-50%)';
            messageContainer.style.padding = '10px 20px';
            messageContainer.style.borderRadius = '5px';
            messageContainer.style.color = 'white';
            messageContainer.style.fontWeight = 'bold';
            messageContainer.style.zIndex = '9999';
            messageContainer.style.textAlign = 'center';
            messageContainer.style.display = 'none';
            document.body.appendChild(messageContainer);
        }
        
        // Définir le style en fonction du type
        switch (type) {
            case 'success':
                messageContainer.style.backgroundColor = '#4CAF50';
                break;
            case 'warning':
                messageContainer.style.backgroundColor = '#FF9800';
                break;
            case 'error':
                messageContainer.style.backgroundColor = '#F44336';
                break;
            default:
                messageContainer.style.backgroundColor = '#2196F3';
        }
        
        // Afficher le message
        messageContainer.textContent = message;
        messageContainer.style.display = 'block';
        
        // Cacher après 3 secondes
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 3000);
    }
    
    // Remplacer la fonction d'origine si elle existe
    if (window.JoinSystem) {
        window.JoinSystem.joinMeetingWithId = enhancedJoinMeetingWithId;
        
        // Remplacer également la fonction globale si elle existe
        if (window.joinMeetingWithId) {
            window.joinMeetingWithId = enhancedJoinMeetingWithId;
        }
    } else {
        // Créer un objet JoinSystem minimal si nécessaire
        window.JoinSystem = {
            joinMeetingWithId: enhancedJoinMeetingWithId
        };
        window.joinMeetingWithId = enhancedJoinMeetingWithId;
    }
    
    // Attacher la fonction au bouton de jointure
    const joinButton = document.getElementById('joinMeetingBtn');
    if (joinButton) {
        // Cloner pour supprimer les anciens écouteurs
        const newJoinButton = joinButton.cloneNode(true);
        joinButton.parentNode.replaceChild(newJoinButton, joinButton);
        
        // Attacher le nouvel écouteur
        newJoinButton.addEventListener('click', function(e) {
            e.preventDefault();
            enhancedJoinMeetingWithId();
        });
    }
    
    // Attacher à l'événement d'appui sur Entrée dans le champ d'ID
    const meetingIdField = document.getElementById('meeting-id') || document.getElementById('meetingIdInput');
    if (meetingIdField) {
        meetingIdField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                enhancedJoinMeetingWithId();
            }
        });
    }
}

/**
 * Améliore l'affichage de l'historique des ID récents
 */
function improveIdHistory() {
    // Styles améliorés pour l'historique des ID
    addGlobalStyles(`
        .recent-ids-container {
            position: absolute;
            background: rgba(40, 40, 40, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
            z-index: 1000;
            min-width: 200px;
            max-width: 300px;
            padding: 8px 0;
            margin-top: 5px;
            backdrop-filter: blur(5px);
        }
        
        .recent-ids-container h4 {
            margin: 0;
            padding: 10px 15px;
            font-size: 0.9rem;
            color: #ddd;
            border-bottom: 1px solid rgba(255, 255, 255, 0.15);
            background: rgba(0, 0, 0, 0.2);
        }
        
        .recent-id {
            padding: 10px 15px;
            cursor: pointer;
            transition: background 0.2s;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .recent-id:last-child {
            border-bottom: none;
        }
        
        .recent-id i {
            margin-right: 8px;
            color: rgba(255, 255, 255, 0.5);
        }
        
        .recent-id:hover {
            background: rgba(73, 109, 199, 0.3);
        }
        
        .recent-id:active {
            background: rgba(73, 109, 199, 0.5);
        }
    `);

    // Fonction pour afficher l'historique des ID récents
    function setupRecentIdsDisplay() {
        const meetingIdField = document.getElementById('meeting-id') || document.getElementById('meetingIdInput');
        if (!meetingIdField) return;
        
        // Créer ou récupérer le conteneur pour les IDs récents
        let recentIdsContainer = document.getElementById('recent-ids');
        if (!recentIdsContainer) {
            recentIdsContainer = document.createElement('div');
            recentIdsContainer.id = 'recent-ids';
            recentIdsContainer.className = 'recent-ids-container';
            document.body.appendChild(recentIdsContainer);
        }
        
        // Gérer le focus sur le champ ID
        meetingIdField.addEventListener('focus', function() {
            updateRecentIdsList(this, recentIdsContainer);
        });
        
        // Gérer le clic en dehors pour fermer la liste
        document.addEventListener('click', function(e) {
            if (e.target !== meetingIdField && !recentIdsContainer.contains(e.target)) {
                recentIdsContainer.style.display = 'none';
            }
        });
    }
    
    // Mettre à jour l'affichage de la liste des IDs récents
    function updateRecentIdsList(inputField, container) {
        const recentIds = JSON.parse(localStorage.getItem('recentMeetingIds') || '[]');
        
        if (recentIds.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        // Positionner la liste par rapport au champ de saisie
        const rect = inputField.getBoundingClientRect();
        container.style.top = (rect.bottom + window.scrollY) + 'px';
        container.style.left = (rect.left + window.scrollX) + 'px';
        container.style.width = rect.width + 'px';
        
        // Construire le contenu
        container.innerHTML = '<h4><i class="fas fa-history"></i> Récemment utilisés</h4>';
        
        recentIds.forEach(id => {
            const idItem = document.createElement('div');
            idItem.className = 'recent-id';
            idItem.innerHTML = `<i class="fas fa-id-card"></i> ${id}`;
            
            idItem.addEventListener('click', function() {
                inputField.value = id;
                container.style.display = 'none';
                
                // Tenter de rejoindre directement
                if (window.JoinSystem && typeof window.JoinSystem.joinMeetingWithId === 'function') {
                    window.JoinSystem.joinMeetingWithId(id);
                }
            });
            
            container.appendChild(idItem);
        });
        
        container.style.display = 'block';
    }
    
    // Initialiser l'affichage des IDs récents
    setupRecentIdsDisplay();
}

/**
 * Optimisations ciblées pour réduire la latence des interactions (INP)
 */
function reduceInteractionLatency() {
    // 1. Optimiser les interactions avec les boutons
    optimizeButtonInteractions();
    
    // 2. Optimiser les animations du DOM
    optimizeDomAnimations();
    
    // 3. Réduire la fréquence des timers
    reduceTimerFrequency();
    
    // 4. Débrancher les loggers de débogage
    disableDebugLogging();
}

/**
 * Optimise les interactions avec les boutons pour réduire la latence
 */
function optimizeButtonInteractions() {
    // Utiliser un seul écouteur avec délégation d'événements pour tous les boutons
    document.addEventListener('click', function(e) {
        const target = e.target.closest('button, .clickable, [data-action]');
        if (!target) return;
        
        // Garantir une réponse visuelle immédiate
        target.style.transform = 'scale(0.97)';
        setTimeout(() => {
            target.style.transform = '';
        }, 100);
    });
    
    // Optimiser spécifiquement les boutons de rafraîchissement
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        const newRefreshBtn = refreshBtn.cloneNode(true);
        refreshBtn.parentNode.replaceChild(newRefreshBtn, refreshBtn);
        
        newRefreshBtn.addEventListener('click', function() {
            // Effet visuel immédiat
            this.classList.add('spinning');
            
            // Utiliser requestIdleCallback pour le rafraîchissement
            if (window.requestIdleCallback) {
                window.requestIdleCallback(() => {
                    if (typeof window.fetchMeetings === 'function') {
                        window.fetchMeetings(true);
                    }
                    
                    // Supprimer l'effet après un délai
                    setTimeout(() => {
                        this.classList.remove('spinning');
                    }, 1000);
                });
            } else {
                // Fallback pour les navigateurs qui ne supportent pas requestIdleCallback
                setTimeout(() => {
                    if (typeof window.fetchMeetings === 'function') {
                        window.fetchMeetings(true);
                    }
                    
                    // Supprimer l'effet après un délai
                    setTimeout(() => {
                        this.classList.remove('spinning');
                    }, 1000);
                }, 0);
            }
        });
        
        // Ajouter un style pour l'animation de rotation
        addGlobalStyles(`
            .spinning i {
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `);
    }
}

/**
 * Optimise les animations du DOM pour réduire la latence
 */
function optimizeDomAnimations() {
    addGlobalStyles(`
        /* Utiliser transform et opacity pour les animations */
        .meeting-item, .room-card, button, .modal, .popup {
            will-change: transform, opacity;
            transform: translateZ(0);
            transition: transform 0.2s ease, opacity 0.2s ease, background-color 0.2s ease;
        }
        
        /* Éviter d'animer les propriétés coûteuses */
        .meeting-item:hover, .room-card:hover, button:hover {
            transform: translateY(-2px);
        }
        
        /* Optimiser les animations de la modale */
        .modal {
            will-change: opacity;
            transition: opacity 0.3s ease;
        }
        
        .modal-content {
            will-change: transform;
            transition: transform 0.3s ease;
        }
    `);
    
    // Observer les mutations DOM pour les optimiser
    const observer = new MutationObserver((mutations) => {
        let needsOptimization = false;
        
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                needsOptimization = true;
            }
        });
        
        if (needsOptimization) {
            for (const selector of ['.meeting-item', '.room-card', 'button', '.modal', '.popup']) {
                document.querySelectorAll(selector).forEach(el => {
                    if (!el.getAttribute('data-optimized')) {
                        el.style.willChange = 'transform, opacity';
                        el.style.transform = 'translateZ(0)';
                        el.setAttribute('data-optimized', 'true');
                    }
                });
            }
        }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Réduit la fréquence des timers pour diminuer la charge CPU
 */
function reduceTimerFrequency() {
    // Throttling de la fonction fetchMeetings
    if (typeof window.fetchMeetings === 'function' && !window.fetchMeetingsThrottled) {
        const originalFetchMeetings = window.fetchMeetings;
        
        window.fetchMeetingsThrottled = true;
        window.fetchMeetingsLastCall = 0;
        window.fetchMeetings = function(forceUpdate = false) {
            const now = Date.now();
            
            // Limiter les appels à 5 secondes d'intervalle minimum sauf si force=true
            if (!forceUpdate && (now - window.fetchMeetingsLastCall < 5000)) {
                return;
            }
            
            window.fetchMeetingsLastCall = now;
            return originalFetchMeetings(forceUpdate);
        };
    }
    
    // Optimiser updateMeetingTimers
    if (typeof window.updateMeetingTimers === 'function' && !window.updateMeetingTimersOptimized) {
        const originalUpdateMeetingTimers = window.updateMeetingTimers;
        
        window.updateMeetingTimersOptimized = true;
        window.updateMeetingTimers = function() {
            // Utiliser requestAnimationFrame pour synchroniser avec le cycle de rendu
            return requestAnimationFrame(() => {
                originalUpdateMeetingTimers();
            });
        };
    }
}

/**
 * Désactive les logs de débogage en production pour améliorer les performances
 */
function disableDebugLogging() {
    // Ne pas désactiver les logs en mode développement
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return;
    }
    
    // Créer des versions noop des fonctions de console
    const noop = () => {};
    
    // Sauvegarder la console originale au cas où
    window._originalConsole = {
        log: console.log,
        debug: console.debug,
        info: console.info
    };
    
    // Remplacer par des fonctions qui ne font rien
    console.log = noop;
    console.debug = noop;
    console.info = noop;
    
    // Conserver les fonctions d'erreur
    // console.error reste inchangé
    // console.warn reste inchangé
}

/**
 * Utilitaire pour ajouter des styles globaux
 */
function addGlobalStyles(cssText) {
    const hash = hashString(cssText);
    const styleId = `optimized-style-${hash}`;
    
    // Vérifier si ce style existe déjà
    if (!document.getElementById(styleId)) {
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = cssText;
        document.head.appendChild(styleElement);
    }
}

/**
 * Utilitaire pour calculer un hash simple d'une chaîne
 */
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convertir en entier 32-bit
    }
    return Math.abs(hash).toString(16);
}
