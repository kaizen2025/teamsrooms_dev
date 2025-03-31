/**
 * interface-fix.js
 * Solution minimaliste qui corrige uniquement les problèmes spécifiques
 * sans remplacer ou altérer l'interface existante
 */

(function() {
    // Configuration
    const config = {
        debug: false,            // Activer les logs de debugging
        fixTimeout: 1000,        // Délai avant application des correctifs (ms)
        waitForDOM: true,        // Attendre le chargement complet du DOM
        preserveSync: true,      // Préserver les informations de synchronisation
        preserveControls: true   // Préserver la barre de contrôle du bas
    };
    
    // Fonction principale d'initialisation
    function initFixedInterface() {
        console.log("🔧 Application des correctifs minimaux...");
        
        // Laisser le DOM se charger complètement avant d'appliquer les correctifs
        setTimeout(() => {
            // 1. Correction du problème des boutons de salles en double
            fixRoomsButtons();
            
            // 2. Correction du modal de création de réunion
            fixCreateMeetingModal();
            
            // 3. Correction des boutons de jointure de réunion Teams
            fixTeamsJoinButtons();
            
            // 4. Restaurer les contrôles du bas si nécessaire
            if (config.preserveControls) {
                restoreBottomControls();
            }
            
            // 5. Configuration d'une observation continue pour maintenir les correctifs
            observeChanges();
            
            console.log("✅ Correctifs minimaux appliqués avec succès");
        }, config.fixTimeout);
    }
    
    /**
     * Corrige le problème des boutons d'affichage des salles en double
     */
    function fixRoomsButtons() {
        try {
            // Rechercher tous les boutons d'affichage des salles
            const roomsButtons = document.querySelectorAll('[id*="RoomsBtn"], .toggle-rooms-button, .rooms-toggle-button-floating, button:contains("Afficher les salles")');
            
            // Vérifier s'il y a plus d'un bouton visible
            let visibleCount = 0;
            let mainButton = null;
            
            roomsButtons.forEach(button => {
                // Considérer seulement les boutons visibles
                if (window.getComputedStyle(button).display !== 'none') {
                    visibleCount++;
                    if (!mainButton) mainButton = button;
                }
            });
            
            // S'il y a plusieurs boutons visibles, ne garder que le premier
            if (visibleCount > 1) {
                roomsButtons.forEach(button => {
                    if (button !== mainButton) {
                        // Masquer simplement le bouton sans le supprimer
                        button.style.display = 'none';
                    }
                });
            }
            
            // S'assurer que le bouton principal fonctionne correctement
            if (mainButton && !mainButton.hasAttribute('data-fixed')) {
                // Préserver le texte original
                const originalHTML = mainButton.innerHTML;
                
                // Remplacer le gestionnaire d'événements tout en préservant l'apparence
                mainButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Appeler la fonction originale
                    if (typeof window.afficherSalles === 'function') {
                        window.afficherSalles();
                    } else if (window.RoomsSystem) {
                        window.RoomsSystem.forceShowRooms();
                    }
                    
                    // Conserver le texte original
                    setTimeout(() => {
                        mainButton.innerHTML = originalHTML;
                    }, 100);
                    
                    return false;
                });
                
                // Marquer comme corrigé
                mainButton.setAttribute('data-fixed', 'true');
            }
            
            if (config.debug) console.log(`Boutons de salles corrigés (${visibleCount} boutons visibles)`);
        } catch (error) {
            console.error("Erreur lors de la correction des boutons de salles:", error);
        }
    }
    
    /**
     * Corrige le problème du modal de création de réunion
     */
    function fixCreateMeetingModal() {
        try {
            // Trouver le modal
            const bookingModal = document.getElementById('bookingModal');
            if (!bookingModal) return;
            
            // Corriger les boutons d'annulation qui ne ferment pas correctement le modal
            const cancelButtons = bookingModal.querySelectorAll('.cancel-button, [data-dismiss="modal"]');
            cancelButtons.forEach(button => {
                // Ne corrige qu'une seule fois
                if (!button.hasAttribute('data-fixed')) {
                    // Conserver le gestionnaire d'origine et ajouter une fermeture garantie
                    button.addEventListener('click', function(e) {
                        // Fermer le modal de manière sûre
                        bookingModal.style.display = 'none';
                        
                        // Rafraîchir les réunions après fermeture
                        setTimeout(() => {
                            if (typeof window.fetchMeetings === 'function') {
                                window.fetchMeetings(true);
                            }
                        }, 500);
                    });
                    
                    // Marquer comme corrigé
                    button.setAttribute('data-fixed', 'true');
                }
            });
            
            // Corriger le bouton de création de réunion
            const createMeetingButtons = document.querySelectorAll('.create-meeting-integrated, #createMeetingBtn');
            createMeetingButtons.forEach(button => {
                if (!button.hasAttribute('data-fixed')) {
                    button.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Utiliser les fonctions existantes ou basculer manuellement
                        if (window.BookingSystem && typeof window.BookingSystem.openModal === 'function') {
                            window.BookingSystem.openModal();
                        } else {
                            // Afficher directement
                            bookingModal.style.display = 'flex';
                        }
                    });
                    
                    // Marquer comme corrigé
                    button.setAttribute('data-fixed', 'true');
                }
            });
            
            if (config.debug) console.log("Modal de création de réunion corrigé");
        } catch (error) {
            console.error("Erreur lors de la correction du modal de création:", error);
        }
    }
    
    /**
     * Corrige les boutons de jointure aux réunions Teams
     */
    function fixTeamsJoinButtons() {
        try {
            // Sélectionner tous les boutons de jointure
            const joinButtons = document.querySelectorAll('.meeting-join-btn');
            
            joinButtons.forEach(button => {
                if (!button.hasAttribute('data-fixed')) {
                    // Préserver l'apparence originale
                    const originalHTML = button.innerHTML;
                    
                    // Ajouter un gestionnaire sûr
                    button.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Désactiver temporairement pour éviter les clics multiples
                        this.disabled = true;
                        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
                        
                        // Obtenir l'URL ou l'ID
                        const url = this.getAttribute('data-url') || 
                                   this.parentElement.getAttribute('data-url');
                        const id = this.getAttribute('data-meeting-id') || 
                                  this.parentElement.getAttribute('data-id');
                        
                        if (url) {
                            // URL directe disponible
                            setTimeout(() => {
                                window.open(url, '_blank');
                            }, 500);
                        } else if (id && window.JoinSystem) {
                            // Utiliser le système existant
                            window.JoinSystem.joinMeetingWithId(id);
                        } else if (id) {
                            // Fallback simple
                            const cleanId = id.replace(/[^a-zA-Z0-9]/g, '');
                            const teamsUrl = `https://teams.microsoft.com/l/meetup-join/19%3Ameeting_${cleanId}%40thread.v2/0`;
                            setTimeout(() => {
                                window.open(teamsUrl, '_blank');
                            }, 500);
                        }
                        
                        // Réactiver après un délai
                        setTimeout(() => {
                            this.disabled = false;
                            this.innerHTML = originalHTML;
                        }, 2000);
                    });
                    
                    // Marquer comme corrigé
                    button.setAttribute('data-fixed', 'true');
                }
            });
            
            // Corriger également le bouton principal de jointure
            const mainJoinButton = document.getElementById('joinMeetingBtn');
            if (mainJoinButton && !mainJoinButton.hasAttribute('data-fixed')) {
                mainJoinButton.addEventListener('click', function(e) {
                    // Laisser les gestionnaires existants fonctionner mais assurer la jointure
                    setTimeout(() => {
                        const meetingIdField = document.getElementById('meeting-id') || 
                                             document.getElementById('meetingIdInput');
                        
                        if (meetingIdField && meetingIdField.value && 
                            window.getComputedStyle(this).display !== 'none') {
                            // Si le bouton est encore visible après 300ms, déclencher manuellement
                            if (window.JoinSystem && typeof window.JoinSystem.joinMeetingWithId === 'function') {
                                window.JoinSystem.joinMeetingWithId();
                            }
                        }
                    }, 300);
                });
                
                // Marquer comme corrigé
                mainJoinButton.setAttribute('data-fixed', 'true');
            }
            
            if (config.debug) console.log(`Boutons de jointure corrigés (${joinButtons.length} boutons)`);
        } catch (error) {
            console.error("Erreur lors de la correction des boutons de jointure:", error);
        }
    }
    
    /**
     * Restaure les contrôles du bas s'ils ont été supprimés
     */
    function restoreBottomControls() {
        try {
            const controlsContainer = document.querySelector('.controls-container');
            
            // Vérifier si les contrôles sont présents et visibles
            if (!controlsContainer || window.getComputedStyle(controlsContainer).display === 'none') {
                // Créer ou afficher les contrôles
                if (controlsContainer) {
                    // Assurer la visibilité
                    controlsContainer.style.display = 'flex';
                } else {
                    // Recréer si manquant
                    const newControls = document.createElement('div');
                    newControls.className = 'controls-container';
                    newControls.innerHTML = `
                        <div class="control-buttons">
                            <button id="refreshBtn"><i class="fas fa-sync-alt"></i> Rafraîchir</button>
                            <button id="toggleRoomsBtn"><i class="fas fa-door-open"></i> Afficher les salles</button>
                            <button id="createMeetingBtn"><i class="fas fa-plus-circle"></i> Créer une réunion</button>
                            <button id="helpBtn"><i class="fas fa-question-circle"></i> Aide</button>
                            <button id="fullscreenBtn"><i class="fas fa-expand"></i> Plein écran</button>
                        </div>
                    `;
                    
                    // Positionner de manière absolue pour ne pas perturber la mise en page
                    newControls.style.cssText = `
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        background: rgba(40, 40, 40, 0.7);
                        backdrop-filter: blur(10px);
                        z-index: 9999;
                        padding: 8px 15px;
                        display: flex;
                        justify-content: center;
                    `;
                    
                    document.body.appendChild(newControls);
                    
                    // Configurer les boutons après création
                    setTimeout(() => {
                        // Rafraîchir
                        const refreshBtn = document.getElementById('refreshBtn');
                        if (refreshBtn) {
                            refreshBtn.addEventListener('click', () => {
                                if (typeof window.fetchMeetings === 'function') {
                                    window.fetchMeetings(true);
                                }
                                // Animation de rotation
                                const icon = refreshBtn.querySelector('i');
                                if (icon) {
                                    icon.classList.add('fa-spin');
                                    setTimeout(() => {
                                        icon.classList.remove('fa-spin');
                                    }, 1000);
                                }
                            });
                        }
                        
                        // Salles
                        const toggleRoomsBtn = document.getElementById('toggleRoomsBtn');
                        if (toggleRoomsBtn) {
                            toggleRoomsBtn.addEventListener('click', () => {
                                if (typeof window.afficherSalles === 'function') {
                                    window.afficherSalles();
                                } else if (window.RoomsSystem) {
                                    window.RoomsSystem.forceShowRooms();
                                }
                            });
                        }
                        
                        // Création
                        const createMeetingBtn = document.getElementById('createMeetingBtn');
                        if (createMeetingBtn) {
                            createMeetingBtn.addEventListener('click', () => {
                                const bookingModal = document.getElementById('bookingModal');
                                if (bookingModal) {
                                    bookingModal.style.display = 'flex';
                                }
                            });
                        }
                        
                        // Plein écran
                        const fullscreenBtn = document.getElementById('fullscreenBtn');
                        if (fullscreenBtn) {
                            fullscreenBtn.addEventListener('click', () => {
                                if (!document.fullscreenElement) {
                                    document.documentElement.requestFullscreen().catch(err => {
                                        console.error("Erreur de passage en plein écran:", err);
                                    });
                                    fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i> Quitter';
                                } else {
                                    if (document.exitFullscreen) {
                                        document.exitFullscreen();
                                        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i> Plein écran';
                                    }
                                }
                            });
                        }
                    }, 100);
                }
            }
            
            if (config.debug) console.log("Contrôles restaurés");
        } catch (error) {
            console.error("Erreur lors de la restauration des contrôles:", error);
        }
    }
    
    /**
     * Observe les changements du DOM pour maintenir les correctifs
     */
    function observeChanges() {
        // Créer un observer qui détecte les changements significatifs
        const observer = new MutationObserver(function(mutations) {
            let shouldReapply = false;
            
            mutations.forEach(function(mutation) {
                // Si des nœuds ont été ajoutés ou supprimés
                if (mutation.type === 'childList' && 
                    (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
                    shouldReapply = true;
                }
            });
            
            if (shouldReapply) {
                if (config.debug) console.log("Changements détectés, réapplication des correctifs...");
                // Réappliquer avec un délai pour laisser le DOM se stabiliser
                setTimeout(() => {
                    fixRoomsButtons();
                    fixTeamsJoinButtons();
                    if (config.preserveControls) {
                        restoreBottomControls();
                    }
                }, 500);
            }
        });
        
        // Observer le document entier
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false
        });
        
        if (config.debug) console.log("Observation des changements configurée");
    }
    
    // Initialisation au chargement de la page
    if (config.waitForDOM) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initFixedInterface);
        } else {
            initFixedInterface();
        }
    } else {
        initFixedInterface();
    }
})();
