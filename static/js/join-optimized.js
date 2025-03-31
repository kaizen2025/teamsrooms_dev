/**
 * join-optimized.js
 * Système optimisé de jointure de réunions Microsoft Teams
 * Compatible avec interface-unified.js
 */

// Système optimisé de jointure de réunions
const JoinSystemOptimized = {
    // Configuration
    debug: false,
    maxRetries: 2,
    retryDelay: 1000,
    isJoining: false,
    isInitialized: false,
    
    /**
     * Initialise le système de jointure
     */
    init() {
        if (this.isInitialized) {
            if (this.debug) console.log("Système de jointure déjà initialisé");
            return;
        }
        
        if (this.debug) console.log("Initialisation du système de jointure optimisé");
        
        // Associer le bouton "Rejoindre" uniquement s'il n'est pas déjà géré par l'InterfaceSystem
        const joinButton = document.getElementById('joinMeetingBtn');
        if (joinButton && !joinButton.hasAttribute('data-join-handler')) {
            joinButton.setAttribute('data-join-handler', 'true');
            
            joinButton.addEventListener('click', () => this.joinMeetingWithId());
        }
        
        // Associer l'événement Enter au champ d'ID
        const meetingIdField = document.getElementById('meeting-id') || document.getElementById('meetingIdInput');
        if (meetingIdField) {
            meetingIdField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.joinMeetingWithId();
                }
            });
            
            // Afficher la liste des IDs récents lors du focus
            meetingIdField.addEventListener('focus', () => {
                this.updateRecentIdsList();
            });
        }
        
        // Créer le conteneur pour les IDs récents s'il n'existe pas
        this.createRecentIdsContainer();
        
        // Initialiser les gestionnaires de boutons de jointure des éléments
        this.initJoinButtons();
        
        // Cacher la liste lorsque l'utilisateur clique ailleurs
        document.addEventListener('click', (e) => {
            const meetingIdField = document.getElementById('meeting-id') || document.getElementById('meetingIdInput');
            const recentIdsContainer = document.getElementById('recent-ids');
            
            if (meetingIdField && recentIdsContainer && e.target !== meetingIdField && !recentIdsContainer.contains(e.target)) {
                recentIdsContainer.style.display = 'none';
            }
        });
        
        // Marquer comme initialisé
        this.isInitialized = true;
    },
    
    /**
     * Crée le conteneur pour les IDs récents
     */
    createRecentIdsContainer() {
        if (!document.getElementById('recent-ids')) {
            const recentIdsContainer = document.createElement('div');
            recentIdsContainer.id = 'recent-ids';
            recentIdsContainer.className = 'recent-ids-container';
            recentIdsContainer.style.cssText = `
                position: absolute;
                background: rgba(40, 40, 40, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                min-width: 200px;
                max-width: 300px;
                display: none;
                padding: 8px 0;
            `;
            
            document.body.appendChild(recentIdsContainer);
            
            // Ajouter les styles CSS pour les items récents si nécessaire
            if (!document.getElementById('recent-ids-styles')) {
                const style = document.createElement('style');
                style.id = 'recent-ids-styles';
                style.textContent = `
                    .recent-ids-container h4 {
                        margin: 0;
                        padding: 8px 12px;
                        font-size: 0.9rem;
                        color: #ddd;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    }
                    .recent-id {
                        padding: 8px 12px;
                        cursor: pointer;
                        transition: background 0.2s;
                        font-size: 0.9rem;
                        color: white;
                    }
                    .recent-id:hover {
                        background: rgba(255, 255, 255, 0.1);
                    }
                    .join-error, .join-success, .join-warning {
                        background: rgba(30, 30, 30, 0.9);
                        border-radius: 8px;
                        padding: 10px 15px;
                        margin-top: 10px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        font-size: 0.9rem;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                        animation: fadeIn 0.3s ease;
                        max-width: 90%;
                        color: white;
                    }
                    .join-error {
                        border-left: 4px solid #e74c3c;
                        color: #e74c3c;
                    }
                    .join-success {
                        border-left: 4px solid #2ecc71;
                        color: #2ecc71;
                    }
                    .join-warning {
                        border-left: 4px solid #f39c12;
                        color: #f39c12;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(-10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `;
                document.head.appendChild(style);
            }
        }
    },
    
    /**
     * Initialise les boutons de jointure sur les items de réunion
     */
    initJoinButtons() {
        const meetingItems = document.querySelectorAll('.meeting-item');
        
        meetingItems.forEach(item => {
            const joinButton = item.querySelector('.meeting-join-btn');
            
            // Traiter uniquement les boutons non encore initialisés
            if (joinButton && !joinButton.hasAttribute('data-join-handler')) {
                joinButton.setAttribute('data-join-handler', 'true');
                
                joinButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Éviter les clics multiples
                    if (this.isJoining) {
                        if (this.debug) console.log("Jointure déjà en cours, ignorer ce clic");
                        return;
                    }
                    
                    // Récupérer l'URL ou l'ID
                    const joinUrl = joinButton.getAttribute('data-url') || item.getAttribute('data-url');
                    const meetingId = joinButton.getAttribute('data-meeting-id') || item.getAttribute('data-id');
                    
                    if (joinUrl) {
                        this.joinWithUrl(joinUrl, joinButton);
                    } else if (meetingId) {
                        this.joinWithId(meetingId, joinButton);
                    } else {
                        this.showError("Impossible de rejoindre cette réunion: URL ou ID manquant.");
                    }
                });
            }
        });
    },
    
    /**
     * Rejoindre directement avec une URL
     */
    joinWithUrl(url, button = null) {
        if (this.debug) console.log("Jointure avec URL:", url);
        
        this.isJoining = true;
        
        // Désactiver le bouton si fourni
        if (button) button.disabled = true;
        
        // Ouvrir l'URL dans un nouvel onglet
        window.open(url, '_blank');
        
        // Montrer un message de succès
        this.showSuccess("Connexion réussie! Redirection vers Teams...");
        
        // Réinitialiser l'état après un délai
        setTimeout(() => {
            this.isJoining = false;
            if (button) button.disabled = false;
        }, 2000);
    },
    
    /**
     * Rejoindre avec un ID via le champ
     */
    joinWithId(id, button = null) {
        if (this.debug) console.log("Jointure avec ID:", id);
        
        // Mettre l'ID dans le champ
        const meetingIdInput = document.getElementById('meeting-id') || document.getElementById('meetingIdInput');
        
        if (meetingIdInput) {
            meetingIdInput.value = id;
            this.joinMeetingWithId(null, button);
        } else {
            // Fallback: utiliser directement l'ID
            this.joinMeetingWithId(id, button);
        }
    },
    
    /**
     * Rejoindre une réunion Teams avec l'ID fourni ou depuis le champ
     */
    async joinMeetingWithId(providedId = null, sourceButton = null) {
        // Empêcher les déclenchements multiples
        if (this.isJoining) {
            if (this.debug) console.log("Jointure déjà en cours, ignorer cette demande");
            return;
        }
        
        this.isJoining = true;
        
        // Obtenir l'ID via le champ ou directement
        const meetingIdField = document.getElementById('meeting-id') || document.getElementById('meetingIdInput');
        let meetingId = providedId;
        
        if (!meetingId && meetingIdField) {
            meetingId = meetingIdField.value.trim();
        }
        
        if (!meetingId) {
            this.showError("Veuillez entrer l'ID de la réunion");
            this.isJoining = false;
            return;
        }
        
        // Nettoyer l'ID pour qu'il soit utilisable
        const cleanedId = this.cleanMeetingId(meetingId);
        
        // Référence au bouton principal de jointure
        const joinButton = sourceButton || document.getElementById('joinMeetingBtn');
        const originalText = joinButton ? joinButton.innerHTML : '';
        
        try {
            // Désactiver les contrôles pendant la recherche
            if (meetingIdField) meetingIdField.disabled = true;
            if (joinButton) {
                joinButton.disabled = true;
                joinButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
            }
            
            // Sauvegarder l'ID dans l'historique
            this.saveRecentMeetingId(meetingId);
            
            // D'abord essayer d'utiliser l'API de lookup
            try {
                const apiUrl = '/lookupMeeting';
                const response = await fetch(`${apiUrl}?meetingId=${encodeURIComponent(cleanedId)}`);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data && data.joinUrl) {
                        // URL trouvée, l'utiliser
                        const joinUrl = data.joinUrl;
                        
                        this.showSuccess("Connexion réussie! Redirection vers Teams...");
                        
                        // Ouvrir l'URL après un court délai
                        setTimeout(() => {
                            window.open(joinUrl, '_blank');
                        }, 500);
                        
                        // Réinitialiser les contrôles après un délai
                        setTimeout(() => {
                            if (meetingIdField) meetingIdField.disabled = false;
                            if (joinButton) {
                                joinButton.disabled = false;
                                joinButton.innerHTML = originalText;
                            }
                            this.isJoining = false;
                        }, 2000);
                        
                        return;
                    }
                }
            } catch (error) {
                if (this.debug) console.warn("Erreur avec l'API de lookup:", error);
                // Continuer avec l'URL générique
            }
            
            // Fallback: utiliser l'URL générique
            const teamsUrl = `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${cleanedId}%40thread.v2/0`;
            
            this.showWarning("Utilisation de l'URL générique Teams...");
            
            // Ouvrir l'URL après un court délai
            setTimeout(() => {
                window.open(teamsUrl, '_blank');
            }, 500);
            
            // Réinitialiser les contrôles après un délai plus long
            setTimeout(() => {
                if (meetingIdField) meetingIdField.disabled = false;
                if (joinButton) {
                    joinButton.disabled = false;
                    joinButton.innerHTML = originalText;
                }
                this.isJoining = false;
            }, 2000);
            
        } catch (error) {
            if (this.debug) console.error("Erreur lors de la jointure:", error);
            
            this.showError(`Erreur lors de la connexion: ${error.message}`);
            
            // Réinitialiser les contrôles
            if (meetingIdField) meetingIdField.disabled = false;
            if (joinButton) {
                joinButton.disabled = false;
                joinButton.innerHTML = originalText;
            }
            this.isJoining = false;
        }
    },
    
    /**
     * Nettoie l'ID de réunion selon différentes règles
     */
    cleanMeetingId(id) {
        // Si l'ID ressemble à un UUID, l'utiliser tel quel
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            return id;
        }
        
        // Si l'ID contient un '@thread.v2', extraire la partie pertinente
        const threadMatch = id.match(/meeting_([^@]+)@thread\.v2/i);
        if (threadMatch && threadMatch[1]) {
            return threadMatch[1];
        }
        
        // Si c'est une URL complète, extraire l'ID
        if (id.includes('teams.microsoft.com/l/meetup-join')) {
            const urlMatch = id.match(/19%3ameeting_([^%@]+)/i);
            if (urlMatch && urlMatch[1]) {
                return urlMatch[1];
            }
        }
        
        // Sinon, enlever tous les caractères non alphanumériques
        return id.replace(/[^a-zA-Z0-9]/g, '');
    },
    
    /**
     * Sauvegarde l'ID de réunion dans l'historique récent
     */
    saveRecentMeetingId(id) {
        if (!id) return;
        
        let recentIds = [];
        try {
            recentIds = JSON.parse(localStorage.getItem('recentMeetingIds') || '[]');
        } catch (e) {
            recentIds = [];
        }
        
        // Ajouter l'ID s'il n'existe pas déjà
        if (!recentIds.includes(id)) {
            recentIds.unshift(id);
            recentIds = recentIds.slice(0, 5); // Garder les 5 derniers
            localStorage.setItem('recentMeetingIds', JSON.stringify(recentIds));
        }
        
        this.updateRecentIdsList();
    },
    
    /**
     * Met à jour l'affichage de la liste des IDs récents
     */
    updateRecentIdsList() {
        // Trouver le conteneur
        const container = document.getElementById('recent-ids');
        if (!container) return;
        
        let recentIds = [];
        try {
            recentIds = JSON.parse(localStorage.getItem('recentMeetingIds') || '[]');
        } catch (e) {
            recentIds = [];
        }
        
        if (recentIds.length > 0) {
            // Positionner la liste près du champ de saisie
            const inputField = document.getElementById('meeting-id') || document.getElementById('meetingIdInput');
            if (inputField) {
                const rect = inputField.getBoundingClientRect();
                container.style.position = 'absolute';
                container.style.top = (rect.bottom + 5) + 'px';
                container.style.left = rect.left + 'px';
                container.style.width = rect.width + 'px';
            }
            
            // Génération du contenu
            container.innerHTML = '<h4>Récemment utilisés</h4>';
            
            recentIds.forEach(id => {
                const idItem = document.createElement('div');
                idItem.className = 'recent-id';
                idItem.textContent = id;
                idItem.addEventListener('click', () => this.selectRecentId(id));
                container.appendChild(idItem);
            });
            
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
    },
    
    /**
     * Sélectionne un ID récent et le place dans le champ
     */
    selectRecentId(id) {
        const inputField = document.getElementById('meeting-id') || document.getElementById('meetingIdInput');
        if (inputField) {
            inputField.value = id;
            
            // Masquer la liste
            const container = document.getElementById('recent-ids');
            if (container) {
                container.style.display = 'none';
            }
            
            // Rejoindre automatiquement
            this.joinMeetingWithId();
        }
    },
    
    /**
     * Affiche un message d'erreur
     */
    showError(message) {
        this.showMessage(message, 'error');
    },
    
    /**
     * Affiche un message de succès
     */
    showSuccess(message) {
        this.showMessage(message, 'success');
    },
    
    /**
     * Affiche un message d'avertissement
     */
    showWarning(message) {
        this.showMessage(message, 'warning');
    },
    
    /**
     * Affiche un message de type spécifié
     */
    showMessage(message, type = 'info') {
        // Supprimer les messages précédents
        this.removeMessages();
        
        // Mettre à jour le message dans l'interface s'il y a un système centralisé
        if (window.InterfaceSystem && typeof window.InterfaceSystem.showToast === 'function') {
            window.InterfaceSystem.showToast(message, type);
            return;
        }
        
        // Sinon, utiliser notre propre méthode d'affichage
        const meetingEntry = document.querySelector('.meeting-id-entry');
        if (!meetingEntry) return;
        
        // Créer le message
        const messageDiv = document.createElement('div');
        messageDiv.className = `join-${type}`;
        
        // Ajouter l'icône selon le type
        let icon;
        switch (type) {
            case 'success':
                icon = 'check-circle';
                break;
            case 'error':
                icon = 'exclamation-circle';
                break;
            case 'warning':
                icon = 'exclamation-triangle';
                break;
            default:
                icon = 'info-circle';
        }
        
        messageDiv.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
        
        // Ajouter le message après le champ de saisie
        meetingEntry.appendChild(messageDiv);
        
        // Supprimer après un délai
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    },
    
    /**
     * Supprime tous les messages d'erreur/succès/avertissement
     */
    removeMessages() {
        document.querySelectorAll('.join-error, .join-success, .join-warning').forEach(el => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
    }
};

// Initialiser le système au chargement du document
document.addEventListener('DOMContentLoaded', function() {
    // Différer légèrement l'initialisation pour permettre au système d'interface de s'initialiser d'abord
    setTimeout(function() {
        JoinSystemOptimized.init();
    }, 250);
});

// Exposer pour utilisation globale - conserver la compatibilité avec l'ancien nom
window.JoinSystem = JoinSystemOptimized;
window.JoinSystemOptimized = JoinSystemOptimized;
