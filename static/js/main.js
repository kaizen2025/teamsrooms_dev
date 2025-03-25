document.addEventListener('DOMContentLoaded', function() {
    // Gestion du menu latéral
    const menuToggle = document.getElementById('menu-toggle');
    const appMenu = document.getElementById('app-menu');
    
    if (menuToggle && appMenu) {
        menuToggle.addEventListener('click', function() {
            appMenu.classList.toggle('active');
        });
        
        // Fermer le menu en cliquant en dehors
        document.addEventListener('click', function(event) {
            if (!appMenu.contains(event.target) && !menuToggle.contains(event.target) && appMenu.classList.contains('active')) {
                appMenu.classList.remove('active');
            }
        });
    }
    
    // Gestion des alertes flash
    const flashMessages = document.querySelectorAll('.alert');
    flashMessages.forEach(function(message) {
        setTimeout(function() {
            message.style.opacity = '0';
            setTimeout(function() {
                message.style.display = 'none';
            }, 500);
        }, 5000);
    });
    
    // Initialisation des datepickers si présents
    const datepickers = document.querySelectorAll('input[type="date"]');
    datepickers.forEach(function(datepicker) {
        // Assurer que la date minimale est aujourd'hui pour les demandes de prêt
        if (datepicker.id === 'start_date' || datepicker.id === 'end_date') {
            const today = new Date().toISOString().split('T')[0];
            datepicker.setAttribute('min', today);
        }
    });
    
    // Validation des formulaires
    const loanForms = document.querySelectorAll('form.loan-form');
    loanForms.forEach(function(form) {
        form.addEventListener('submit', function(event) {
            const startDate = form.querySelector('#start_date');
            const endDate = form.querySelector('#end_date');
            const quantity = form.querySelector('#quantity');
            
            if (startDate && endDate) {
                if (new Date(startDate.value) > new Date(endDate.value)) {
                    event.preventDefault();
                    alert('La date de fin doit être postérieure à la date de début.');
                }
            }
            
            if (quantity) {
                const maxQuantity = parseInt(quantity.getAttribute('max'));
                if (parseInt(quantity.value) > maxQuantity) {
                    event.preventDefault();
                    alert(`La quantité demandée ne peut pas dépasser ${maxQuantity}.`);
                }
            }
        });
    });
});
