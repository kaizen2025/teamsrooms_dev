/* static/css/style.css */

/* =============================
   1. Variables & Reset
   ============================= */
:root {
  /* Palette de couleurs principale */
  --primary-color: #6264A7;
  --primary-color-dark: #4F5199;
  --primary-color-light: #7B7DC6;

  /* Couleurs sémantiques */
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  --info-color: #17a2b8;

  /* Couleurs d'interface */
  --bg-body: #1a1a1a; /* Fond légèrement plus clair */
  --bg-dark: rgba(30, 30, 30, 0.8);
  --bg-medium: rgba(45, 45, 45, 0.85);
  --bg-light: rgba(60, 60, 60, 0.9);
  --bg-overlay: rgba(0, 0, 0, 0.6); /* Overlay plus sombre */
  --bg-modal-overlay: rgba(0, 0, 0, 0.75);

  /* Couleurs de texte */
  --text-primary: #f0f0f0;
  --text-secondary: #c0c0c0;
  --text-muted: #909090;
  --text-on-primary: #ffffff;
  --text-on-dark-bg: #ffffff;

  /* Ombres */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.4);

  /* Espacements */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Bordures */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  --border-radius-full: 50%;
  --border-color: rgba(255, 255, 255, 0.1);
  --border-color-strong: rgba(255, 255, 255, 0.2);

  /* Transitions */
  --transition-fast: all 0.2s ease-in-out;
  --transition-normal: all 0.3s ease-in-out;

  /* Z-index */
  --z-index-background: -1;
  --z-index-base: 1;
  --z-index-content: 10;
  --z-index-header-footer: 50;
  --z-index-menu: 100;
  --z-index-rooms-panel: 150;
  --z-index-overlay: 999;
  --z-index-modal: 1000;
  --z-index-menu-toggle: 1001; /* Bouton menu au-dessus de tout */


  /* Dimensions */
  --header-height: 70px;
  --controls-bar-height: 55px;
  --sidebar-width-collapsed: 0px; /* Initialement caché */
  --sidebar-width-expanded: 260px;
  --meetings-panel-width: 450px;
  --meetings-panel-width-lg: 500px;
}

/* Reset simple */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  overflow: hidden; /* Empêche le scroll global */
  font-family: 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--bg-body);
  color: var(--text-primary);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Style de scrollbar global */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}
::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

/* =============================
   2. Layout Structure (Grid)
   ============================= */
.main-container {
  display: grid;
  height: 100vh;
  grid-template-columns: var(--sidebar-width-collapsed) 1fr var(--meetings-panel-width);
  grid-template-rows: var(--header-height) 1fr var(--controls-bar-height);
  grid-template-areas:
    "menu header header"
    "menu content meetings"
    "menu controls meetings"; /* Controls et Meetings partagent la dernière ligne */
  transition: grid-template-columns var(--transition-normal);
}

.main-container.menu-expanded {
  grid-template-columns: var(--sidebar-width-expanded) 1fr var(--meetings-panel-width);
}

.header { grid-area: header; }
.side-menu { grid-area: menu; }
.content { grid-area: content; overflow-y: auto; padding: var(--spacing-md);} /* Permet le scroll si nécessaire */
.meetings-panel { grid-area: meetings; }
.controls-bar { grid-area: controls; }

/* Responsive Layout Adjustments */
@media (max-width: 1200px) {
  :root { --meetings-panel-width: 400px; }
}

@media (max-width: 992px) {
  :root { --meetings-panel-width: 350px; }
  .main-container {
    grid-template-columns: var(--sidebar-width-collapsed) 1fr; /* Masquer meetings panel */
     grid-template-rows: var(--header-height) 1fr var(--controls-bar-height);
     grid-template-areas:
        "menu header"
        "menu content"
        "menu controls";
  }
   .main-container.menu-expanded {
     grid-template-columns: var(--sidebar-width-expanded) 1fr;
   }
  .meetings-panel {
    /* Pourrait être un modal ou un onglet sur mobile */
     position: fixed;
     top: 0;
     right: -100%; /* Caché hors écran */
     width: 80%;
     max-width: 400px;
     height: 100%;
     z-index: var(--z-index-modal);
     transition: right var(--transition-normal);
     box-shadow: -5px 0 15px rgba(0,0,0,0.3);
  }
   .meetings-panel.visible {
     right: 0;
   }
    /* Ajouter un bouton pour ouvrir/fermer le panel meetings sur mobile */
}

@media (max-width: 768px) {
    /* Stack layout */
   .main-container {
       grid-template-columns: 1fr;
       grid-template-rows: auto 1fr auto auto; /* Header, Content, Controls, Meetings */
       grid-template-areas:
           "header"
           "content"
           "controls"
           "meetings"; /* Meetings en bas */
        height: auto; /* Permettre au contenu de définir la hauteur */
        min-height: 100vh;
   }
    .main-container.menu-expanded {
       grid-template-columns: 1fr; /* Le menu latéral sera un overlay */
   }
    .side-menu {
       position: fixed;
       left: -100%; /* Caché */
       top: 0;
       width: 280px; /* Largeur fixe sur mobile */
       height: 100%;
       z-index: var(--z-index-menu);
       transition: left var(--transition-normal);
       box-shadow: 3px 0 10px rgba(0,0,0,0.2);
   }
    .side-menu.expanded {
       left: 0;
   }
    .meetings-panel { /* Le panel meetings reste en bas */
        position: relative;
        width: 100%;
        right: auto;
        height: auto; /* Hauteur auto */
        max-height: 50vh; /* Limite hauteur */
        box-shadow: none;
        border-top: 1px solid var(--border-color);
        margin-top: var(--spacing-sm);
   }
}


/* =============================
   3. Background & Overlay
   ============================= */
#background-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: var(--z-index-background);
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  filter: brightness(0.6); /* Assombrir un peu l'arrière-plan */
  transition: background-image 1s ease-in-out;
  animation: zoomBackground 45s infinite alternate ease-in-out;
}

@keyframes zoomBackground {
  0%   { transform: scale(1); }
  100% { transform: scale(1.08); }
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--bg-modal-overlay);
  z-index: var(--z-index-overlay);
  opacity: 0;
  visibility: hidden;
  transition: opacity var(--transition-normal), visibility var(--transition-normal);
  backdrop-filter: blur(3px);
}

.overlay.visible {
  opacity: 1;
  visibility: visible;
}

/* =============================
   4. Header
   ============================= */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--spacing-md);
  background-color: var(--bg-dark);
  border-bottom: 1px solid var(--border-color);
  z-index: var(--z-index-header-footer);
  position: relative; /* Pour z-index */
}

.datetime {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: rgba(0, 0, 0, 0.3);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius-md);
  margin-left: 60px; /* Espace pour le bouton menu */
  user-select: none;
}

.datetime p {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
}
.datetime p#time-display {
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--text-primary);
}

.title-container {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    pointer-events: none; /* Ne bloque pas les clics */
    width: calc(100% - 350px); /* Ajuster selon largeur date + user */
    transition: left var(--transition-normal), width var(--transition-normal);
}

.main-container.menu-expanded .title-container {
    width: calc(100% - var(--sidebar-width-expanded) - 350px);
    left: calc(var(--sidebar-width-expanded) + (100% - var(--sidebar-width-expanded)) / 2);
}


.title {
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--text-primary);
  background: rgba(0, 0, 0, 0.3);
  padding: var(--spacing-xs) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  display: inline-block; /* Permet le padding */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  pointer-events: auto; /* Réactiver les events pour le titre lui-même */
}

.user-profile {
  position: relative; /* Pour le dropdown */
}

.user-profile .btn { /* Style pour le bouton connexion/profil */
    padding: var(--spacing-sm) var(--spacing-md);
}

/* Styles pour .user-profile-button et .user-dropdown (venant de auth.css probable) */


@media (max-width: 768px) {
    .header {
        padding: var(--spacing-sm) var(--spacing-md);
        padding-left: 60px; /* Espace pour bouton menu */
        height: auto; /* Hauteur auto */
        flex-wrap: wrap; /* Permettre le retour à la ligne */
    }
    .datetime {
        margin-left: 0;
        order: 2; /* Date/heure après le titre */
        width: 100%;
        align-items: center;
        margin-top: var(--spacing-sm);
        padding: var(--spacing-xs) var(--spacing-sm);
    }
    .title-container {
        position: relative; /* Reset position */
        transform: none;
        left: auto; top: auto;
        width: 100%;
        order: 1; /* Titre en premier */
        margin-bottom: var(--spacing-xs);
    }
     .title {
        font-size: 1.3rem;
    }
    .user-profile {
        position: absolute; /* Replacer en haut à droite */
        right: var(--spacing-md);
        top: var(--spacing-sm);
        order: 3;
    }
}


/* =============================
   5. Side Menu
   ============================= */
.side-menu {
  background: var(--bg-dark);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  color: var(--text-primary);
  height: 100vh;
  position: relative; /* Change from sticky */
  z-index: var(--z-index-menu);
  overflow-x: hidden; /* Cache le contenu quand fermé */
  overflow-y: auto; /* Permet le scroll vertical */
  width: var(--sidebar-width-expanded); /* Largeur fixe */
  transition: width var(--transition-normal), transform var(--transition-normal), left var(--transition-normal);
  transform: translateX(-100%); /* Initialement caché hors écran */
}

.side-menu.expanded {
    transform: translateX(0);
}

/* Bouton de toggle principal (rond, en haut à gauche) */
.menu-toggle-visible {
  position: fixed; /* Fixé par rapport à la fenêtre */
  left: 15px;
  top: 15px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark));
  border: none;
  border-radius: var(--border-radius-full);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-on-primary);
  cursor: pointer;
  z-index: var(--z-index-menu-toggle);
  box-shadow: var(--shadow-md);
  font-size: 1.2rem;
  transition: var(--transition-fast);
}

.menu-toggle-visible:hover {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 0 15px rgba(98, 100, 167, 0.5);
}

/* Contenu du menu (pour padding et scroll) */
.side-menu .menu-content {
    padding: var(--spacing-lg) 0;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}

.menu-items {
    flex-grow: 1; /* Prend l'espace restant */
    overflow-y: auto; /* Scroll si besoin */
    padding: 0 var(--spacing-sm);
    margin-bottom: var(--spacing-md);
}

.menu-group {
  margin-bottom: var(--spacing-sm);
}

.menu-group-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: var(--spacing-sm) var(--spacing-md);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: 10px 16px; /* Augmenter padding vertical */
  margin: 2px 0; /* Espace entre items */
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--text-secondary);
  text-decoration: none;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.menu-item.active {
  background: var(--primary-color);
  color: var(--text-on-primary);
  font-weight: 600;
}

.menu-item-icon {
  font-size: 1.1rem;
  width: 24px;
  text-align: center;
  color: var(--primary-color-light);
  transition: var(--transition-fast);
}

.menu-item.active .menu-item-icon {
  color: var(--text-on-primary);
}

.menu-item-text {
  font-size: 0.95rem;
  opacity: 1; /* Toujours visible */
  transition: var(--transition-fast);
}

/* Bas du menu */
.menu-bottom {
    padding: var(--spacing-md);
    border-top: 1px solid var(--border-color);
}

.toggle-rooms-button {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
}


/* Ajustements pour le menu caché et sur mobile */
@media (min-width: 769px) { /* Non-mobile */
     .side-menu {
        transform: translateX(0); /* Toujours à gauche */
        width: var(--sidebar-width-collapsed); /* Commence fermé */
     }
    .side-menu.expanded {
        width: var(--sidebar-width-expanded);
    }
     .menu-toggle-visible { /* Le bouton contrôle l'expansion */
         /* Style reste le même */
     }
     .side-menu:not(.expanded) .menu-item-text,
     .side-menu:not(.expanded) .menu-group-title,
     .side-menu:not(.expanded) .menu-bottom .button-text,
     .side-menu:not(.expanded) .menu-title {
         opacity: 0;
         width: 0;
         overflow: hidden;
         margin-left: -10px; /* Pour cacher proprement */
     }
    .side-menu:not(.expanded) .menu-item {
        justify-content: center; /* Centrer icône quand fermé */
        padding: 10px 0;
    }
    .side-menu:not(.expanded) .menu-bottom {
        padding: var(--spacing-md) var(--spacing-sm);
    }
     .side-menu:not(.expanded) .toggle-rooms-button {
        width: auto; /* Ajuster largeur au contenu (icône) */
    }
}

@media (max-width: 768px) { /* Mobile */
     .side-menu {
        /* Déjà configuré pour être hors écran et glisser */
     }
     .menu-toggle-visible {
        /* Style reste le même */
     }
     .main-container:not(.menu-expanded) {
        /* Assure que le contenu principal prend toute la largeur */
        grid-template-columns: 1fr;
     }
}


/* =============================
   6. Meetings Panel
   ============================= */
.meetings-panel {
  background-color: var(--bg-medium);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 100%; /* Prend toute la hauteur de sa cellule grid */
  overflow: hidden; /* Gère le scroll à l'intérieur */
}

.meetings-title-bar {
  background-color: var(--bg-light);
  padding: var(--spacing-sm) var(--spacing-md); /* Padding réduit */
  display: flex;
  flex-direction: column; /* Empiler titre et bouton */
  align-items: center;
  gap: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
  position: relative; /* Pour le bouton refresh */
}

.meetings-title-bar h2 {
  margin: 0;
  font-size: 1.2rem; /* Taille réduite */
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-primary);
}

.create-meeting-integrated, /* Bouton dans l'en-tête */
#createMeetingBtnFooter /* Bouton dans les contrôles */
{
  width: auto; /* Ajuster à la largeur du texte */
  padding: var(--spacing-xs) var(--spacing-md); /* Padding réduit */
  font-size: 0.9rem;
}

.refresh-meetings-btn {
  position: absolute;
  top: 50%;
  right: var(--spacing-md);
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.1rem;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-full);
  transition: color var(--transition-fast), transform var(--transition-fast);
}
.refresh-meetings-btn:hover {
  color: var(--text-primary);
  transform: translateY(-50%) rotate(90deg);
}
.refresh-meetings-btn i.fa-spin {
    animation: spin 1s linear infinite;
}
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }


.meetings {
  flex: 1; /* Prend l'espace restant */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Empêche le débordement */
}

.meetings-list {
  flex: 1; /* Prend l'espace pour la liste */
  overflow-y: auto; /* Scroll interne */
  padding: var(--spacing-sm) var(--spacing-md);
}

/* Styles pour meeting-item, status-section, etc. (à reprendre de meetings.css et nettoyer) */
.meeting-item {
  background: var(--bg-dark);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  transition: var(--transition-fast);
  position: relative;
  overflow: hidden;
}
.meeting-item:hover {
    background: var(--bg-light);
    border-color: var(--border-color-strong);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
}
.meeting-item::before { /* Indicateur statut */
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 4px;
    background-color: var(--info-color); /* Default: upcoming */
    border-radius: var(--border-radius-md) 0 0 var(--border-radius-md);
}
.meeting-item.status-current::before { background-color: var(--success-color); }
.meeting-item.status-past::before { background-color: var(--text-muted); }
.meeting-item.status-past { opacity: 0.7; }

.meeting-item h3 {
    font-size: 1.1rem;
    margin-bottom: var(--spacing-xs);
    color: var(--text-primary);
}
.meeting-details p, .meeting-details div {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xs);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}
.meeting-details i {
    color: var(--primary-color-light);
    width: 14px; /* Alignement icônes */
    text-align: center;
}
.meeting-participants {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    flex-wrap: wrap; /* Pour gérer beaucoup de participants */
}
.participant-email {
    background: rgba(255,255,255,0.1);
    padding: 2px 6px;
    border-radius: var(--border-radius-sm);
    font-size: 0.8rem;
}
.show-more-participants {
    background: transparent;
    border: none;
    color: var(--primary-color-light);
    cursor: pointer;
    font-size: 0.8rem;
    padding: 0; margin-left: 5px;
}

.meeting-actions {
    margin-top: var(--spacing-sm);
    text-align: right;
}
.meeting-join-btn { /* Style unifié pour les boutons rejoindre */
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: 0.9rem;
}


/* Barre de jointure par ID */
.meeting-id-entry {
  display: flex;
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-light);
}

.meeting-id-entry input {
  flex: 1;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-color-strong);
  background-color: rgba(255, 255, 255, 0.9); /* Fond clair pour contraste */
  color: #333;
  border-radius: var(--border-radius-md) 0 0 var(--border-radius-md);
  outline: none;
}
.meeting-id-entry input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(98, 100, 167, 0.3);
}

.meeting-id-entry button {
  border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0;
  padding: var(--spacing-sm) var(--spacing-md);
  white-space: nowrap; /* Empêche le retour à la ligne */
}

/* Indicateur de chargement / Vide */
.loading-indicator, .empty-meetings-message {
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--text-muted);
}
.loading-indicator i, .empty-meetings-message i {
    font-size: 2rem;
    margin-bottom: var(--spacing-md);
    display: block;
    color: var(--primary-color);
}

/* =============================
   7. Rooms Panel (Modal Centré)
   ============================= */
.rooms-section {
  position: fixed !important; /* Force la position */
  left: 50% !important;
  top: 50% !important;
  transform: translate(-50%, -50%) scale(0.95); /* Commence légèrement réduit */
  width: 80% !important;
  max-width: 900px !important; /* Largeur max */
  max-height: 85vh !important; /* Hauteur max */
  background-color: var(--bg-medium) !important;
  backdrop-filter: blur(10px) !important;
  border-radius: var(--border-radius-lg) !important;
  border: 1px solid var(--border-color-strong) !important;
  box-shadow: var(--shadow-lg) !important;
  z-index: var(--z-index-rooms-panel) !important;
  padding: 0 !important; /* Géré par les enfants */
  display: flex !important; /* Utiliser flex pour structure */
  flex-direction: column !important;
  opacity: 0 !important;
  visibility: hidden !important;
  transition: opacity var(--transition-normal), transform var(--transition-normal), visibility var(--transition-normal) !important;
  overflow: hidden; /* Empêche le contenu de déborder avant scroll */
}

.rooms-section.visible {
  opacity: 1 !important;
  visibility: visible !important;
  transform: translate(-50%, -50%) scale(1) !important; /* Animation d'apparition */
}

.rooms-section-title {
  color: var(--text-primary);
  text-align: center;
  font-size: 1.3rem;
  font-weight: 600;
  padding: var(--spacing-md);
  margin: 0;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0; /* Ne rétrécit pas */
}
.rooms-section-title i { margin-right: var(--spacing-sm); }

.rooms-section-close {
  position: absolute !important;
  top: 10px !important;
  right: 10px !important;
  background: rgba(255, 255, 255, 0.1) !important;
  border: none !important;
  color: white !important;
  width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  font-size: 20px !important;
  line-height: 1;
  transition: background-color 0.2s ease !important;
  z-index: 10; /* Au dessus du contenu */
}
.rooms-section-close:hover {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

.rooms-container {
  overflow-y: auto; /* Scroll interne pour les cartes */
  padding: var(--spacing-md);
  flex-grow: 1; /* Prend l'espace restant */
}

.rooms {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); /* Grille adaptative */
  gap: var(--spacing-md);
}

.room-card {
  background: var(--bg-dark);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-sm);
  height: 90px; /* Hauteur fixe pour alignement */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: var(--transition-fast);
  cursor: pointer;
  border: 1px solid transparent; /* Pour l'effet de survol */
  box-shadow: var(--shadow-sm);
}

.room-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color-light);
}

/* Indicateur couleur en haut */
.room-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: var(--text-muted); /* Gris par défaut */
}
.room-card.available::before { background-color: var(--success-color); }
.room-card.occupied::before { background-color: var(--danger-color); }
.room-card.soon::before { background-color: var(--warning-color); }

.room-name {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: var(--spacing-xs);
  color: var(--text-primary);
  margin-top: 4px; /* Espace après barre de couleur */
}

.room-status {
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  color: var(--text-secondary);
}

.status-icon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.status-icon.available { background-color: var(--success-color); box-shadow: 0 0 4px var(--success-color); }
.status-icon.occupied { background-color: var(--danger-color); box-shadow: 0 0 4px var(--danger-color); }
.status-icon.soon { background-color: var(--warning-color); box-shadow: 0 0 4px var(--warning-color); }

.room-time {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: var(--spacing-xs);
}

/* Animation pour salles occupées */
.room-card.occupied {
  animation: pulseBorder 2s infinite ease-in-out;
}
@keyframes pulseBorder {
  0% { border-color: transparent; }
  50% { border-color: var(--danger-color); }
  100% { border-color: transparent; }
}

/* =============================
   8. Controls Bar (Footer)
   ============================= */
.controls-bar {
  display: flex;
  justify-content: center; /* Centrer les boutons par défaut */
  align-items: center;
  padding: 0 var(--spacing-md);
  background-color: var(--bg-dark);
  border-top: 1px solid var(--border-color);
  z-index: var(--z-index-header-footer);
  height: var(--controls-bar-height);

  /* Styles optimisés de performance-optimizations.css */
  width: 45% !important; /* Largeur réduite */
  min-width: 450px; /* Largeur minimale */
  max-width: 600px !important;
  margin: 0 auto !important; /* Centrage horizontal */
  position: fixed !important; /* Position fixe en bas */
  bottom: 0 !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0 !important;
  box-shadow: 0 -3px 10px rgba(0, 0, 0, 0.3) !important;
  backdrop-filter: blur(5px);
}

.control-buttons {
  display: flex;
  gap: var(--spacing-sm); /* Espace réduit entre boutons */
  flex-wrap: nowrap; /* Empêche le retour à la ligne */
  overflow-x: auto; /* Permet le scroll si trop de boutons */
}

.control-buttons .btn {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 0.9rem;
  white-space: nowrap;
  background-color: var(--bg-light);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}
.control-buttons .btn:hover {
    background-color: var(--bg-medium);
    color: var(--text-primary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
}
.control-buttons .btn i { margin-right: var(--spacing-sm); }

/* Cacher texte sur petit écran si désiré */
@media (max-width: 992px) {
    .controls-bar {
        width: 60% !important;
        min-width: 400px;
    }
}
@media (max-width: 768px) {
     .controls-bar {
        width: 100% !important; /* Toute la largeur sur mobile */
        min-width: unset;
        border-radius: 0 !important; /* Pas d'arrondi sur mobile */
        padding: 0 var(--spacing-sm); /* Moins de padding */
        height: auto; /* Hauteur auto */
        padding-bottom: var(--spacing-xs); /* Petit espace en bas */
    }
     .control-buttons {
        justify-content: space-around; /* Mieux répartir */
        width: 100%;
    }
    .control-buttons .btn .btn-text { /* Masquer le texte */
        display: none;
    }
    .control-buttons .btn i { margin-right: 0; }
    .control-buttons .btn { padding: var(--spacing-sm); } /* Padding carré */
}


.sync-info {
    font-size: 0.8rem;
    color: var(--text-muted);
    position: absolute;
    right: var(--spacing-md);
    bottom: var(--spacing-xs);
    display: none; /* Masqué par défaut, géré par JS si besoin */
}

/* =============================
   9. Modals (Booking, Login, Help)
   ============================= */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--bg-modal-overlay);
  z-index: var(--z-index-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: opacity var(--transition-normal), visibility var(--transition-normal);
  backdrop-filter: blur(5px);
  padding: var(--spacing-md); /* Espace pour ne pas coller aux bords */
}

.modal-overlay.visible {
  opacity: 1;
  visibility: visible;
}

.modal-content {
  background-color: var(--bg-light);
  color: var(--text-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 550px; /* Largeur standard */
  max-height: 90vh; /* Hauteur max */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Empêche le contenu de déborder */
  border: 1px solid var(--border-color-strong);
  transform: scale(0.95);
  transition: transform var(--transition-normal);
}

.modal-overlay.visible .modal-content {
    transform: scale(1);
}

.modal-header {
  padding: var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(to right, rgba(98, 100, 167, 0.3), rgba(75, 76, 126, 0.3));
  flex-shrink: 0; /* Ne rétrécit pas */
}

.modal-header h2, .modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
.modal-header i { color: var(--primary-color-light); }

.modal-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.8rem; /* Plus gros */
  cursor: pointer;
  transition: var(--transition-fast);
  line-height: 1;
  padding: 0 var(--spacing-xs); /* Zone de clic */
}
.modal-close:hover {
  color: var(--text-primary);
  transform: scale(1.1);
}

.modal-body {
  padding: var(--spacing-lg);
  overflow-y: auto; /* Scroll si contenu dépasse */
  flex-grow: 1; /* Prend l'espace */
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-dark);
  flex-shrink: 0; /* Ne rétrécit pas */
}

/* Formulaires dans les modals */
.booking-form .form-group, .auth-form .form-group {
  margin-bottom: var(--spacing-md);
}
.booking-form label, .auth-form label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.9rem;
}
.booking-form input[type="text"],
.booking-form input[type="date"],
.booking-form input[type="time"],
.booking-form select,
.booking-form textarea,
.auth-form input[type="text"],
.auth-form input[type="password"] {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-color-strong);
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius-sm);
  font-size: 1rem;
  color: var(--text-primary);
  outline: none;
  transition: var(--transition-fast);
}
.booking-form input:focus,
.booking-form select:focus,
.booking-form textarea:focus,
.auth-form input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(98, 100, 167, 0.25);
  background-color: rgba(255, 255, 255, 0.15);
}
.booking-form select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23c0c0c0' class='bi bi-chevron-down' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right var(--spacing-sm) center;
    padding-right: var(--spacing-xl); /* Espace pour flèche */
}
.quick-duration-buttons {
    display: flex;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-xs);
}
.duration-button {
    flex: 1;
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid var(--border-color);
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 0.85rem;
    transition: var(--transition-fast);
}
.duration-button.active {
    background-color: var(--primary-color);
    border-color: var(--primary-color-dark);
    color: var(--text-on-primary);
}
.form-status {
    margin-top: var(--spacing-md);
    padding: var(--spacing-sm);
    border-radius: var(--border-radius-sm);
    font-size: 0.9rem;
    text-align: center;
}
.form-status.error { background-color: rgba(220, 53, 69, 0.2); color: var(--danger-color); border: 1px solid var(--danger-color);}
.form-status.success { background-color: rgba(40, 167, 69, 0.2); color: var(--success-color); border: 1px solid var(--success-color);}


/* =============================
   10. Buttons & Common Elements
   ============================= */
.btn {
  cursor: pointer;
  border: none;
  font-family: inherit;
  font-weight: 500;
  transition: var(--transition-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  color: var(--text-on-dark-bg);
  background: var(--bg-light);
  box-shadow: var(--shadow-sm);
  text-decoration: none; /* Pour les liens stylés en boutons */
  line-height: 1.5; /* Assurer hauteur correcte */
  border: 1px solid var(--border-color);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  filter: brightness(1.1);
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(98, 100, 167, 0.25);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  filter: brightness(0.8);
}

/* Variantes de boutons */
.btn-primary {
  background: linear-gradient(to right, var(--primary-color-dark), var(--primary-color));
  border-color: var(--primary-color-dark);
  color: var(--text-on-primary);
}
.btn-primary:hover { filter: brightness(1.15); }

.btn-success {
  background: linear-gradient(to right, #218838, var(--success-color));
  border-color: #218838;
  color: var(--text-on-primary);
}
.btn-success:hover { filter: brightness(1.15); }

.btn-danger {
  background: linear-gradient(to right, #c82333, var(--danger-color));
  border-color: #c82333;
  color: var(--text-on-primary);
}
.btn-danger:hover { filter: brightness(1.15); }

.btn-secondary,
.cancel-button {
  background: var(--bg-medium);
  border-color: var(--border-color-strong);
  color: var(--text-secondary);
}
.btn-secondary:hover,
.cancel-button:hover {
  background: var(--bg-light);
  color: var(--text-primary);
}

.btn-sm {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: 0.85rem;
    border-radius: var(--border-radius-sm);
}

/* Icônes dans les boutons */
.btn i {
  /* margin-right: var(--spacing-sm); */ /* Géré par gap */
  line-height: 1; /* Empêche décalage vertical */
}


/* =============================
   11. Utilities & Helpers
   ============================= */
.hidden {
  display: none !important;
  visibility: hidden !important;
}

/* Classe pour masquer les infos de synchro spécifiquement */
.sync-info-hidden {
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
