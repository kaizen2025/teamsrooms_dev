#!/usr/bin/env python3
import os
import configparser
from flask import Flask, render_template, redirect, url_for, flash, session, request
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, login_required
from datetime import datetime, timedelta
import pytz

# Initialisation de l'application Flask
app = Flask(__name__, 
    static_folder='static',
    template_folder='templates')

# Configuration de l'application
app.config['SECRET_KEY'] = 'clé_secrète_temporaire_pour_tests'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///teamsrooms.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['ADMIN_GROUP_IDS'] = ['admin-group-id']  # ID du groupe admin dans Azure AD

# Initialisation de la base de données
db = SQLAlchemy(app)

# Initialisation du gestionnaire de login
login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Veuillez vous connecter pour accéder à cette page.'
login_manager.login_message_category = 'warning'

# Définition du fuseau horaire de Paris
PARIS_TZ = pytz.timezone('Europe/Paris')

# Modèle utilisateur pour Flask-Login
class User(UserMixin, db.Model):
    id = db.Column(db.String(36), primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)

# Fonction pour simuler l'authentification Azure AD (pour les tests)
def mock_azure_ad_auth(email, password):
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
        return user
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
        return user
    return None

# Routes d'authentification
@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        user = mock_azure_ad_auth(email, password)
        
        if user:
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
