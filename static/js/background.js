/**
 * Gestion des arrière-plans dynamiques
 * Version optimisée pour une meilleure luminosité
 */

// Système de gestion des arrière-plans
const BackgroundSystem = {
  // État du système
  currentBackgroundIndex: 0,
  backgrounds: [],
  isInitialized: false,
  
  /**
   * Initialise le système d'arrière-plans
   */
  init() {
    // Récupérer les arrière-plans depuis la configuration
    this.backgrounds = window.BACKGROUNDS || [
      '/static/Images/iStock-1137376794.jpg',
      '/static/Images/iStock-1512013316.jpg',
      '/static/Images/iStock-2019872476.jpg',
      '/static/Images/iStock-2154828608.jpg',
      '/static/Images/iStock-2157915069.jpg',
      '/static/Images/iStock-2162113462.jpg',
      '/static/Images/iStock-2178301876.jpg',
      '/static/Images/iStock-2186748328.jpg',
      '/static/Images/iStock-2187797860.jpg',
      '/static/Images/iStock-2188982874.jpg'
    ];
    
    console.log(`Système d'arrière-plans initialisé avec ${this.backgrounds.length} images`);
    
    // Si aucun arrière-plan n'est disponible, quitter
    if (this.backgrounds.length === 0) {
      console.warn("Aucun arrière-plan disponible");
      return;
    }
    
    // Initialiser l'arrière-plan
    this.setupBackground();
    
    // Configurer la rotation automatique
    this.setupRotation();
    
    this.isInitialized = true;
  },
  
  /**
   * Configure l'élément d'arrière-plan
   */
  setupBackground() {
    // Trouver ou créer le conteneur d'arrière-plan
    let backgroundContainer = document.getElementById('background-container');
    
    if (!backgroundContainer) {
      console.log("Création du conteneur d'arrière-plan");
      backgroundContainer = document.createElement('div');
      backgroundContainer.id = 'background-container';
      document.body.insertBefore(backgroundContainer, document.body.firstChild);
    }
    
    // Choisir un arrière-plan aléatoire au premier chargement
    if (!this.isInitialized) {
      this.currentBackgroundIndex = Math.floor(Math.random() * this.backgrounds.length);
    }
    
    // Appliquer l'image
    this.setBackground(this.currentBackgroundIndex);
  },
  
  /**
   * Configure la rotation automatique des arrière-plans
   */
  setupRotation() {
    const interval = window.REFRESH_INTERVALS?.BACKGROUND || 3600000; // 1 heure par défaut
    console.log(`Rotation d'arrière-plan configurée toutes les ${interval/1000} secondes`);
    
    setInterval(() => {
      this.nextBackground();
    }, interval);
  },
  
  /**
   * Définit l'arrière-plan actuel
   */
  setBackground(index) {
    if (index < 0 || index >= this.backgrounds.length) {
      console.error(`Index d'arrière-plan invalide: ${index}`);
      return;
    }
    
    const backgroundContainer = document.getElementById('background-container');
    if (!backgroundContainer) {
      console.error("Conteneur d'arrière-plan introuvable");
      return;
    }
    
    const imagePath = this.backgrounds[index];
    console.log(`Application de l'arrière-plan: ${imagePath}`);
    
    // Créer un nouvel élément d'image pour le préchargement
    const img = new Image();
    
    img.onload = () => {
      // Une fois l'image chargée, l'appliquer comme arrière-plan
      backgroundContainer.style.backgroundImage = `url('${imagePath}')`;
      backgroundContainer.style.opacity = '1';
      this.currentBackgroundIndex = index;
      
      // Ajouter une classe pour indiquer que l'arrière-plan est chargé
      document.body.classList.add('background-loaded');
    };
    
    img.onerror = () => {
      console.error(`Erreur de chargement de l'image: ${imagePath}`);
      // Essayer l'image suivante en cas d'erreur
      this.nextBackground();
    };
    
    // Démarrer le chargement
    img.src = imagePath;
  },
  
  /**
   * Passe à l'arrière-plan suivant
   */
  nextBackground() {
    const nextIndex = (this.currentBackgroundIndex + 1) % this.backgrounds.length;
    this.setBackground(nextIndex);
  },
  
  /**
   * Passe à l'arrière-plan précédent
   */
  previousBackground() {
    const prevIndex = (this.currentBackgroundIndex - 1 + this.backgrounds.length) % this.backgrounds.length;
    this.setBackground(prevIndex);
  }
};

// Initialiser le système d'arrière-plans au chargement du document
document.addEventListener('DOMContentLoaded', () => {
  console.log("Chargement du système d'arrière-plans");
  BackgroundSystem.init();
});

// Exporter pour utilisation dans d'autres modules
window.BackgroundSystem = BackgroundSystem;
