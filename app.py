#!/usr/bin/env python3
import os
import sys
import subprocess
import time
import configparser
import requests
import json
import threading
import pytz
import re
from datetime import datetime, timedelta, timezone
from dateutil import parser  # Nécessite python-dateutil
from flask import Flask, render_template, jsonify, request, send_from_directory, abort, Response, redirect, url_for, flash, session
from werkzeug.middleware.proxy_fix import ProxyFix
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, login_required

def install_requirements():
    """
    Vérifie si le fichier requirements.txt existe et lance pip pour installer les dépendances.
    """
    requirements_file = os.path.join(os.path.dirname(__file__), 'requirements.txt')
    if os.path.exists(requirements_file):
        try:
            print("Installation des dépendances depuis requirements.txt…")
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', requirements_file])
        except subprocess.CalledProcessError as e:
            print("Erreur lors de l'installation des dépendances :", e)
    else:
        print("Fichier requirements.txt non trouvé.")

# Installation des dépendances avant d'importer les modules requis
install_requirements()

# Pour forcer l'utilisation du fuseau horaire de Paris (si supporté)
os.environ['TZ'] = 'Europe/Paris'
try:
    time.tzset()
except AttributeError:
    pass  # time.tzset() n'est pas disponible sous Windows

# Création de l'application Flask et configuration de ProxyFix
app = Flask(__name__, 
    static_folder='static',
    template_folder='templates')
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=2, x_proto=1, x_host=1, x_prefix=1)

# Configuration
MEETINGS_FILE = 'meetings.json'
SALLES = {}
config = configparser.ConfigParser()
config.read('config.ini')

# Configuration de l'application
app.config['SECRET_KEY'] = 'clé_secrète_temporaire_pour_tests'
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://qzcoppkg:pvsnlayypgkhcapvglem@alpha.europe.mkdb.sh:5432/magvgqar'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['ADMIN_GROUP_IDS'] = ['admin-group-id']  # ID du groupe admin dans Azure AD

# Initialisation de la base de données
db = SQLAlchemy(app)

# Initialisation du gestionnaire de login
login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Veuillez vous connecter pour accéder à cette page.'
login_manager.login_message_category = 'warning'

# Chargement de la configuration des salles
if config.has_section('SALLES'):
    SALLES = dict(config.items('SALLES'))

# --- FILTRAGE PAR ADRESSE IP ---
ALLOWED_IPS = []
if config.has_section('ALLOWED_IPS'):
    # On récupère toutes les valeurs et on enlève les espaces superflus
    ALLOWED_IPS = [ip.strip() for key, ip in config.items('ALLOWED_IPS') if ip.strip()]

# Définition du fuseau horaire de Paris
PARIS_TZ = pytz.timezone('Europe/Paris')

# Variables d'état et verrou pour les mises à jour
last_modified_check = {}
update_lock = threading.Lock()

# Mode debug pour les logs
DEBUG_MODE = True

# Modèle utilisateur pour Flask-Login
class User(UserMixin, db.Model):
    id = db.Column(db.String(36), primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)

def get_token():
    """Récupère le token Azure AD avec gestion d'erreur améliorée."""
    try:
        tenant_id = config['AZURE']['TenantID']
        client_id = config['AZURE']['ClientID']
        client_secret = config['AZURE']['ClientSecret']
        url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
        data = {
            'grant_type': 'client_credentials',
            'client_id': client_id,
            'client_secret': client_secret,
            'scope': 'https://graph.microsoft.com/.default'
        }
        response = requests.post(url, data=data, timeout=15)
        response.raise_for_status()
        token = response.json().get('access_token')
        if token:
            return token
        else:
            print("Erreur: Token non trouvé dans la réponse")
            return None
    except Exception as e:
        print(f"Erreur lors de la récupération du token: {e}")
        return None

# Routes d'authentification
@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        # Tentative d'authentification via Azure AD
        # Dans un environnement de production, cette fonction serait remplacée par
        # l'authentification réelle via Azure AD
        if email == 'admin@anecoop-france.com' and password == '87YS@we@jDf2y8H':
            user = User.query.filter_by(email=email).first()
            if not user:
                user = User(
                    id='admin-id',
                    email=email,
                    name='Administrateur',
                    is_admin=True
                )
                db.session.add(user)
                db.session.commit()
            login_user(user)
            next_page = request.args.get('next')
            return redirect(next_page or url_for('index'))
        elif email == 'user@anecoop-france.com' and password == '87YS@we@jDf2y8H':
            user = User.query.filter_by(email=email).first()
            if not user:
                user = User(
                    id='user-id',
                    email=email,
                    name='Utilisateur',
                    is_admin=False
                )
                db.session.add(user)
                db.session.commit()
            login_user(user)
            next_page = request.args.get('next')
            return redirect(next_page or url_for('index'))
        else:
            flash('Identifiants incorrects. Veuillez réessayer.', 'danger')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('login'))

# Route principale
@app.route('/')
@login_required
def index():
    return render_template('index.html')

# Importation des routes du module de prêt de matériel
from routes.equipment_loan import equipment_loan

# Enregistrement du blueprint
app.register_blueprint(equipment_loan)

# Création des tables de la base de données
with app.app_context():
    db.create_all()

# Point d'entrée de l'application
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
