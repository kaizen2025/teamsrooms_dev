"""
Routes pour le module de prêt de matériel.
Ce module définit les routes Flask pour la gestion des prêts de matériel.
"""

from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, current_app
from flask_login import login_required, current_user
from datetime import datetime, timedelta
from sqlalchemy import or_, and_
from models.equipment_loan import Material, LoanRequest, Loan, Notification, LoanStatus
from models.common.database import db

# Création du Blueprint pour le module de prêt de matériel
equipment_loan = Blueprint('equipment_loan', __name__)

# Routes pour les utilisateurs standard
@equipment_loan.route('/pret-materiel')
@login_required
def equipment_loan_home():
    """Page d'accueil du module de prêt de matériel."""
    return render_template('equipment_loan/home.html')

@equipment_loan.route('/pret-materiel/catalogue')
@login_required
def equipment_catalog():
    """Affiche le catalogue de matériel disponible pour le prêt."""
    materials = Material.query.filter_by(is_active=True).all()
    return render_template('equipment_loan/catalog.html', materials=materials)

@equipment_loan.route('/pret-materiel/demande/<int:material_id>', methods=['GET', 'POST'])
@login_required
def request_loan(material_id):
    """Formulaire de demande de prêt pour un matériel spécifique."""
    material = Material.query.get_or_404(material_id)
    
    if request.method == 'POST':
        # Récupération des données du formulaire
        start_date = datetime.strptime(request.form['start_date'], '%Y-%m-%d')
        end_date = datetime.strptime(request.form['end_date'], '%Y-%m-%d')
        quantity = int(request.form['quantity'])
        comment = request.form.get('comment', '')
        
        # Validation des données
        if start_date < datetime.now().replace(hour=0, minute=0, second=0, microsecond=0):
            flash('La date de début doit être dans le futur.', 'danger')
            return render_template('equipment_loan/request_form.html', material=material)
        
        if end_date < start_date:
            flash('La date de fin doit être postérieure à la date de début.', 'danger')
            return render_template('equipment_loan/request_form.html', material=material)
        
        if quantity <= 0 or quantity > material.quantity_available:
            flash(f'La quantité demandée doit être entre 1 et {material.quantity_available}.', 'danger')
            return render_template('equipment_loan/request_form.html', material=material)
        
        # Création de la demande de prêt
        loan_request = LoanRequest(
            user_id=current_user.id,
            user_email=current_user.email,
            user_name=current_user.name,
            material_id=material.id,
            quantity=quantity,
            start_date=start_date,
            end_date=end_date,
            comment=comment,
            status=LoanStatus.PENDING
        )
        
        db.session.add(loan_request)
        
        # Création d'une notification pour les administrateurs
        admin_notification = Notification(
            user_id='admin',  # ID spécial pour les administrateurs
            user_email='admin@anecoop-france.com',
            message=f'Nouvelle demande de prêt de {material.name} par {current_user.name}',
            loan_request_id=loan_request.id
        )
        
        db.session.add(admin_notification)
        db.session.commit()
        
        flash('Votre demande de prêt a été soumise avec succès.', 'success')
        return redirect(url_for('equipment_loan.my_requests'))
    
    return render_template('equipment_loan/request_form.html', material=material)

@equipment_loan.route('/pret-materiel/mes-demandes')
@login_required
def my_requests():
    """Affiche les demandes de prêt de l'utilisateur courant."""
    loan_requests = LoanRequest.query.filter_by(user_id=current_user.id).order_by(LoanRequest.created_at.desc()).all()
    return render_template('equipment_loan/my_requests.html', loan_requests=loan_requests)

@equipment_loan.route('/pret-materiel/annuler/<int:request_id>', methods=['POST'])
@login_required
def cancel_request(request_id):
    """Annule une demande de prêt."""
    loan_request = LoanRequest.query.get_or_404(request_id)
    
    # Vérification que l'utilisateur est bien le propriétaire de la demande
    if loan_request.user_id != current_user.id:
        flash('Vous n\'êtes pas autorisé à annuler cette demande.', 'danger')
        return redirect(url_for('equipment_loan.my_requests'))
    
    # Vérification que la demande est en attente
    if loan_request.status != LoanStatus.PENDING:
        flash('Seules les demandes en attente peuvent être annulées.', 'danger')
        return redirect(url_for('equipment_loan.my_requests'))
    
    # Annulation de la demande
    loan_request.status = LoanStatus.CANCELLED
    db.session.commit()
    
    flash('Votre demande a été annulée avec succès.', 'success')
    return redirect(url_for('equipment_loan.my_requests'))

# Routes pour les administrateurs
@equipment_loan.route('/pret-materiel/admin')
@login_required
def admin_dashboard():
    """Tableau de bord administrateur pour la gestion des prêts."""
    # Vérification que l'utilisateur est un administrateur
    if not current_user.is_admin:
        flash('Accès non autorisé.', 'danger')
        return redirect(url_for('equipment_loan.equipment_loan_home'))
    
    # Récupération des statistiques
    pending_requests = LoanRequest.query.filter_by(status=LoanStatus.PENDING).count()
    active_loans = LoanRequest.query.filter_by(status=LoanStatus.ACTIVE).count()
    late_returns = LoanRequest.query.filter_by(status=LoanStatus.LATE).count()
    
    return render_template('equipment_loan/admin/dashboard.html', 
                          pending_requests=pending_requests,
                          active_loans=active_loans,
                          late_returns=late_returns)

@equipment_loan.route('/pret-materiel/admin/materiels')
@login_required
def admin_materials():
    """Gestion des matériels disponibles pour le prêt."""
    # Vérification que l'utilisateur est un administrateur
    if not current_user.is_admin:
        flash('Accès non autorisé.', 'danger')
        return redirect(url_for('equipment_loan.equipment_loan_home'))
    
    materials = Material.query.all()
    return render_template('equipment_loan/admin/materials.html', materials=materials)

@equipment_loan.route('/pret-materiel/admin/materiel/ajouter', methods=['GET', 'POST'])
@login_required
def add_material():
    """Ajoute un nouveau matériel."""
    # Vérification que l'utilisateur est un administrateur
    if not current_user.is_admin:
        flash('Accès non autorisé.', 'danger')
        return redirect(url_for('equipment_loan.equipment_loan_home'))
    
    if request.method == 'POST':
        # Récupération des données du formulaire
        name = request.form['name']
        description = request.form.get('description', '')
        image_url = request.form.get('image_url', '')
        quantity = int(request.form['quantity'])
        
        # Validation des données
        if not name:
            flash('Le nom du matériel est obligatoire.', 'danger')
            return render_template('equipment_loan/admin/material_form.html')
        
        if quantity <= 0:
            flash('La quantité doit être supérieure à 0.', 'danger')
            return render_template('equipment_loan/admin/material_form.html')
        
        # Création du matériel
        material = Material(
            name=name,
            description=description,
            image_url=image_url,
            quantity_total=quantity,
            quantity_available=quantity
        )
        
        db.session.add(material)
        db.session.commit()
        
        flash('Le matériel a été ajouté avec succès.', 'success')
        return redirect(url_for('equipment_loan.admin_materials'))
    
    return render_template('equipment_loan/admin/material_form.html')

@equipment_loan.route('/pret-materiel/admin/materiel/modifier/<int:material_id>', methods=['GET', 'POST'])
@login_required
def edit_material(material_id):
    """Modifie un matériel existant."""
    # Vérification que l'utilisateur est un administrateur
    if not current_user.is_admin:
        flash('Accès non autorisé.', 'danger')
        return redirect(url_for('equipment_loan.equipment_loan_home'))
    
    material = Material.query.get_or_404(material_id)
    
    if request.method == 'POST':
        # Récupération des données du formulaire
        name = request.form['name']
        description = request.form.get('description', '')
        image_url = request.form.get('image_url', '')
        quantity_total = int(request.form['quantity_total'])
        is_active = 'is_active' in request.form
        
        # Validation des données
        if not name:
            flash('Le nom du matériel est obligatoire.', 'danger')
            return render_template('equipment_loan/admin/material_form.html', material=material)
        
        if quantity_total <= 0:
            flash('La quantité totale doit être supérieure à 0.', 'danger')
            return render_template('equipment_loan/admin/material_form.html', material=material)
        
        # Mise à jour du matériel
        material.name = name
        material.description = description
        material.image_url = image_url
        
        # Calcul de la quantité disponible en fonction de la nouvelle quantité totale
        loaned_quantity = material.quantity_total - material.quantity_available
        material.quantity_total = quantity_total
        material.quantity_available = max(0, quantity_total - loaned_quantity)
        
        material.is_active = is_active
        material.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        flash('Le matériel a été mis à jour avec succès.', 'success')
        return redirect(url_for('equipment_loan.admin_materials'))
    
    return render_template('equipment_loan/admin/material_form.html', material=material)

@equipment_loan.route('/pret-materiel/admin/demandes')
@login_required
def admin_requests():
    """Gestion des demandes de prêt."""
    # Vérification que l'utilisateur est un administrateur
    if not current_user.is_admin:
        flash('Accès non autorisé.', 'danger')
        return redirect(url_for('equipment_loan.equipment_loan_home'))
    
    # Filtrage des demandes
    status_filter = request.args.get('status', 'all')
    
    if status_filter == 'pending':
        loan_requests = LoanRequest.query.filter_by(status=LoanStatus.PENDING).order_by(LoanRequest.created_at.desc()).all()
    elif status_filter == 'approved':
        loan_requests = LoanRequest.query.filter_by(status=LoanStatus.APPROVED).order_by(LoanRequest.created_at.desc()).all()
    elif status_filter == 'active':
        loan_requests = LoanRequest.query.filter_by(status=LoanStatus.ACTIVE).order_by(LoanRequest.created_at.desc()).all()
    elif status_filter == 'returned':
        loan_requests = LoanRequest.query.filter_by(status=LoanStatus.RETURNED).order_by(LoanRequest.created_at.desc()).all()
    elif status_filter == 'late':
        loan_requests = LoanRequest.query.filter_by(status=LoanStatus.LATE).order_by(LoanRequest.created_at.desc()).all()
    else:
        loan_requests = LoanRequest.query.order_by(LoanRequest.created_at.desc()).all()
    
    return render_template('equipment_loan/admin/requests.html', loan_requests=loan_requests, status_filter=status_filter)

@equipment_loan.route('/pret-materiel/admin/demande/<int:request_id>', methods=['GET', 'POST'])
@login_required
def admin_request_detail(request_id):
    """Détail d'une demande de prêt avec possibilité de validation/refus."""
    # Vérification que l'utilisateur est un administrateur
    if not current_user.is_admin:
        flash('Accès non autorisé.', 'danger')
        return redirect(url_for('equipment_loan.equipment_loan_home'))
    
    loan_request = LoanRequest.query.get_or_404(request_id)
    
    if request.method == 'POST':
        action = request.form.get('action')
        admin_comment = request.form.get('admin_comment', '')
        
        if action == 'approve':
            # Vérification de la disponibilité du matériel
            material = Material.query.get(loan_request.material_id)
            if material.quantity_available < loan_request.quantity:
                flash('Quantité insuffisante de matériel disponible.', 'danger')
                return redirect(url_for('equipment_loan.admin_request_detail', request_id=request_id))
            
            # Approbation de la demande
            loan_request.status = LoanStatus.APPROVED
            loan_request.admin_comment = admin_comment
            
            # Mise à jour de la quantité disponible
            material.quantity_available -= loan_request.quantity
            
            # Création d'une notification pour l'utilisateur
            user_notification = Notification(
                user_id=loan_request.user_id,
                user_email=loan_request.user_email,
                message=f'Votre demande de prêt de {material.name} a été approuvée.',
                loan_request_id=loan_request.id
            )
            
            db.session.add(user_notification)
            db.session.commit()
            
            flash('La demande a été approuvée avec succès.', 'success')
            
        elif action == 'reject':
            # Refus de la demande
            loan_request.status = LoanStatus.REJECTED
            loan_request.admin_comment = admin_comment
            
            # Création d'une notification pour l'utilisateur
            material = Material.query.get(loan_request.material_id)
            user_notification = Notification(
                user_id=loan_request.user_id,
                user_email=loan_request.user_email,
                message=f'Votre demande de prêt de {material.name} a été refusée.',
                loan_request_id=loan_request.id
            )
            
            db.session.add(user_notification)
            db.session.commit()
            
            flash('La demande a été refusée.', 'success')
            
        elif action == 'checkout':
            # Vérification que la demande est approuvée
            if loan_request.status != LoanStatus.APPROVED:
                flash('Seules les demandes approuvées peuvent être remises.', 'danger')
                return redirect(url_for('equipment_loan.admin_request_detail', request_id=request_id))
            
            # Remise du matériel
            loan_request.status = LoanStatus.ACTIVE
            
            # Création du prêt
            loan = Loan(
                loan_request_id=loan_request.id,
                checkout_date=datetime.utcnow(),
                expected_return_date=loan_request.end_date
            )
            
            db.session.add(loan)
            
            # Création d'une notification pour l'utilisateur
            material = Material.query.get(loan_request.material_id)
            user_notification = Notification(
                user_id=loan_request.user_id,
                user_email=loan_request.user_email,
                message=f'Votre prêt de {material.name} a été activé. Date de retour prévue: {loan_request.end_date.strftime("%d/%m/%Y")}',
                loan_request_id=loan_request.id
            )
            
            db.session.add(user_notification)
            db.session.commit()
            
            flash('Le prêt a été activé avec succès.', 'success')
            
        elif action == 'return':
            # Vérification que la demande est active
            if loan_request.status != LoanStatus.ACTIVE and loan_request.status != LoanStatus.LATE:
                flash('Seuls les prêts actifs ou en retard peuvent être retournés.', 'danger')
                return redirect(url_for('equipment_loan.admin_request_detail', request_id=request_id))
            
            # Retour du matériel
            loan_request.status = LoanStatus.RETURNED
            
            # Mise à jour du prêt
            loan = Loan.query.filter_by(loan_request_id=loan_request.id).first()
            if loan:
                loan.actual_return_date = datetime.utcnow()
                loan.is_returned = True
                loan.return_condition = request.form.get('return_condition', '')
            
            # Mise à jour de la quantité disponible
            material = Material.query.get(loan_request.material_id)
            material.quantity_available += loan_request.quantity
            
            # Création d'une notification pour l'utilisateur
            user_notification = Notification(
                user_id=loan_request.user_id,
                user_email=loan_request.user_email,
                message=f'Votre retour de {material.name} a été enregistré.',
                loan_request_id=loan_request.id
            )
            
            db.session.add(user_notification)
            db.session.commit()
            
            flash('Le retour a été enregistré avec succès.', 'success')
        
        return redirect(url_for('equipment_loan.admin_requests'))
    
    return render_template('equipment_loan/admin/request_detail.html', loan_request=loan_request)

@equipment_loan.route('/pret-materiel/admin/historique')
@login_required
def admin_history():
    """Historique des prêts."""
    # Vérification que l'utilisateur est un administrateur
    if not current_user.is_admin:
        flash('Accès non autorisé.', 'danger')
        return redirect(url_for('equipment_loan.equipment_loan_home'))
    
    # Filtrage des demandes
    user_filter = request.args.get('user', '')
    material_filter = request.args.get('material', '')
    status_filter = request.args.get('status', '')
    date_from = request.args.get('date_from', '')
    date_to = request.args.get('date_to', '')
    
    # Construction de la requête
    query = LoanRequest.query
    
    if user_filter:
        query = query.filter(or_(
            LoanRequest.user_name.ilike(f'%{user_filter}%'),
            LoanRequest.user_email.ilike(f'%{user_filter}%')
        ))
    
    if material_filter:
        query = query.join(Material).filter(Material.name.ilike(f'%{material_filter}%'))
    
    if status_filter:
        query = query.filter(LoanRequest.status == LoanStatus(status_filter))
    
    if date_from:
        date_from = datetime.strptime(date_from, '%Y-%m-%d')
        query = query.filter(LoanRequest.created_at >= date_from)
    
    if date_to:
        date_to = datetime.strptime(date_to, '%Y-%m-%d')
        query = query.filter(LoanRequest.created_at <= date_to)
    
    loan_requests = query.order_by(LoanRequest.created_at.desc()).all()
    
    return render_template('equipment_loan/admin/history.html', 
                          loan_requests=loan_requests,
                          user_filter=user_filter,
                          material_filter=material_filter,
                          status_filter=status_filter,
                          date_from=date_from,
                          date_to=date_to)

@equipment_loan.route('/pret-materiel/admin/export-csv')
@login_required
def export_csv():
    """Exporte l'historique des prêts au format CSV."""
    # Vérification que l'utilisateur est un administrateur
    if not current_user.is_admin:
        flash('Accès non autorisé.', 'danger')
        return redirect(url_for('equipment_loan.equipment_loan_home'))
    
    # Filtrage des demandes (mêmes filtres que pour l'historique)
    user_filter = request.args.get('user', '')
    material_filter = request.args.get('material', '')
    status_filter = request.args.get('status', '')
    date_from = request.args.get('date_from', '')
    date_to = request.args.get('date_to', '')
    
    # Construction de la requête
    query = LoanRequest.query
    
    if user_filter:
        query = query.filter(or_(
            LoanRequest.user_name.ilike(f'%{user_filter}%'),
            LoanRequest.user_email.ilike(f'%{user_filter}%')
        ))
    
    if material_filter:
        query = query.join(Material).filter(Material.name.ilike(f'%{material_filter}%'))
    
    if status_filter:
        query = query.filter(LoanRequest.status == LoanStatus(status_filter))
    
    if date_from:
        date_from = datetime.strptime(date_from, '%Y-%m-%d')
        query = query.filter(LoanRequest.created_at >= date_from)
    
    if date_to:
        date_to = datetime.strptime(date_to, '%Y-%m-%d')
        query = query.filter(LoanRequest.created_at <= date_to)
    
    loan_requests = query.order_by(LoanRequest.created_at.desc()).all()
    
    # Génération du CSV
    import csv
    from io import StringIO
    
    output = StringIO()
    writer = csv.writer(output)
    
    # En-têtes
    writer.writerow(['ID', 'Utilisateur', 'Email', 'Matériel', 'Quantité', 'Date de début', 'Date de fin', 'Statut', 'Date de création'])
    
    # Données
    for lr in loan_requests:
        material = Material.query.get(lr.material_id)
        writer.writerow([
            lr.id,
            lr.user_name,
            lr.user_email,
            material.name if material else 'Inconnu',
            lr.quantity,
            lr.start_date.strftime('%d/%m/%Y'),
            lr.end_date.strftime('%d/%m/%Y'),
            lr.status.value,
            lr.created_at.strftime('%d/%m/%Y %H:%M')
        ])
    
    # Préparation de la réponse
    output.seek(0)
    from flask import Response
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=historique_prets.csv"}
    )

# Tâches planifiées (à exécuter via un job cron)
def check_late_returns():
    """Vérifie les retours en retard et envoie des notifications."""
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Prêts actifs dont la date de retour est dépassée
    late_loans = LoanRequest.query.filter(
        LoanRequest.status == LoanStatus.ACTIVE,
        LoanRequest.end_date < today
    ).all()
    
    for loan_request in late_loans:
        # Mise à jour du statut
        loan_request.status = LoanStatus.LATE
        
        # Création d'une notification pour l'utilisateur
        material = Material.query.get(loan_request.material_id)
        user_notification = Notification(
            user_id=loan_request.user_id,
            user_email=loan_request.user_email,
            message=f'Votre prêt de {material.name} est en retard. Veuillez le retourner dès que possible.',
            loan_request_id=loan_request.id
        )
        
        db.session.add(user_notification)
    
    # Prêts à venir dans les 2 jours
    tomorrow = today + timedelta(days=1)
    day_after_tomorrow = today + timedelta(days=2)
    
    upcoming_returns = LoanRequest.query.filter(
        LoanRequest.status == LoanStatus.ACTIVE,
        and_(
            LoanRequest.end_date >= tomorrow,
            LoanRequest.end_date <= day_after_tomorrow
        )
    ).all()
    
    for loan_request in upcoming_returns:
        # Création d'une notification pour l'utilisateur
        material = Material.query.get(loan_request.material_id)
        user_notification = Notification(
            user_id=loan_request.user_id,
            user_email=loan_request.user_email,
            message=f'Rappel: votre prêt de {material.name} doit être retourné le {loan_request.end_date.strftime("%d/%m/%Y")}.',
            loan_request_id=loan_request.id
        )
        
        db.session.add(user_notification)
    
    db.session.commit()

# API pour les notifications
@equipment_loan.route('/api/notifications')
@login_required
def get_notifications():
    """Récupère les notifications non lues de l'utilisateur."""
    notifications = Notification.query.filter_by(
        user_id=current_user.id,
        is_read=False
    ).order_by(Notification.created_at.desc()).all()
    
    result = []
    for notification in notifications:
        result.append({
            'id': notification.id,
            'message': notification.message,
            'created_at': notification.created_at.strftime('%d/%m/%Y %H:%M')
        })
    
    return jsonify(result)

@equipment_loan.route('/api/notifications/mark-read/<int:notification_id>', methods=['POST'])
@login_required
def mark_notification_read(notification_id):
    """Marque une notification comme lue."""
    notification = Notification.query.get_or_404(notification_id)
    
    # Vérification que l'utilisateur est bien le destinataire de la notification
    if notification.user_id != current_user.id:
        return jsonify({'success': False, 'message': 'Accès non autorisé'}), 403
    
    notification.is_read = True
    db.session.commit()
    
    return jsonify({'success': True})
