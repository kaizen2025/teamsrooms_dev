"""
Utilitaires d'authentification pour le module de prêt de matériel.
Ce module définit les décorateurs et fonctions nécessaires pour l'authentification.
"""

from functools import wraps
from flask import session, redirect, url_for, flash, request, current_app
import requests
from datetime import datetime, timedelta

def login_required(f):
    """
    Décorateur pour vérifier si l'utilisateur est authentifié.
    Redirige vers la page de connexion si l'utilisateur n'est pas authentifié.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Vérification si l'utilisateur est authentifié
        if 'user_id' not in session:
            flash('Veuillez vous connecter pour accéder à cette page.', 'warning')
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    """
    Décorateur pour vérifier si l'utilisateur est administrateur.
    Redirige vers la page d'accueil si l'utilisateur n'est pas administrateur.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Vérification si l'utilisateur est authentifié
        if 'user_id' not in session:
            flash('Veuillez vous connecter pour accéder à cette page.', 'warning')
            return redirect(url_for('login', next=request.url))
        
        # Vérification si l'utilisateur est administrateur
        if not session.get('is_admin', False):
            flash('Vous n\'avez pas les droits nécessaires pour accéder à cette page.', 'danger')
            return redirect(url_for('equipment_loan.equipment_loan_home'))
        
        return f(*args, **kwargs)
    return decorated_function

def get_current_user():
    """
    Récupère les informations de l'utilisateur actuellement connecté.
    Retourne None si l'utilisateur n'est pas connecté.
    """
    if 'user_id' not in session:
        return None
    
    return {
        'id': session.get('user_id'),
        'name': session.get('user_name'),
        'email': session.get('user_email'),
        'is_admin': session.get('is_admin', False)
    }

def check_admin_role(user_id, token):
    """
    Vérifie si l'utilisateur a un rôle administrateur dans Azure AD.
    Retourne True si l'utilisateur est administrateur, False sinon.
    """
    try:
        # Récupération des groupes de l'utilisateur via Microsoft Graph API
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        # URL pour récupérer les groupes de l'utilisateur
        url = f'https://graph.microsoft.com/v1.0/users/{user_id}/memberOf'
        
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        groups = response.json().get('value', [])
        
        # Vérification si l'utilisateur appartient à un groupe d'administrateurs
        admin_group_ids = current_app.config.get('ADMIN_GROUP_IDS', [])
        
        for group in groups:
            if group.get('id') in admin_group_ids:
                return True
        
        return False
    except Exception as e:
        current_app.logger.error(f"Erreur lors de la vérification du rôle administrateur: {str(e)}")
        return False
