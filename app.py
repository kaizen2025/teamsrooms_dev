#!/usr/bin/env python3
import os
import sys
import subprocess

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

import time
import configparser
import requests
import json
import threading
import pytz
import re
from datetime import datetime, timedelta, timezone
from dateutil import parser  # Nécessite python-dateutil
from flask import Flask, render_template, jsonify, request, send_from_directory, abort
from werkzeug.middleware.proxy_fix import ProxyFix

# Pour forcer l'utilisation du fuseau horaire de Paris (si supporté)
os.environ['TZ'] = 'Europe/Paris'
try:
    time.tzset()
except AttributeError:
    # time.tzset() n'est pas disponible sous Windows
    pass

# Création de l'application Flask et configuration de ProxyFix
app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

# Configuration
MEETINGS_FILE = 'meetings.json'
SALLES = {}
config = configparser.ConfigParser()
config.read('config.ini')

# Chargement de la configuration des salles
if config.has_section('SALLES'):
    SALLES = dict(config.items('SALLES'))

# --- FILTRAGE PAR ADRESSE IP ---
# Les adresses IP autorisées seront définies dans le fichier config.ini dans la section [ALLOWED_IPS]
ALLOWED_IPS = []
if config.has_section('ALLOWED_IPS'):
    # On récupère toutes les valeurs de la section et on supprime les éventuels espaces superflus
    ALLOWED_IPS = [ip.strip() for key, ip in config.items('ALLOWED_IPS') if ip.strip()]

# Définition du fuseau horaire de Paris
PARIS_TZ = pytz.timezone('Europe/Paris')

# Variables d'état et verrou pour les mises à jour
last_modified_check = {}
update_lock = threading.Lock()

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
        response = requests.post(url, data=data, timeout=10)
        response.raise_for_status()
        return response.json().get('access_token')
    except Exception as e:
        print(f"Erreur d'authentification: {str(e)}")
        return None

def convert_to_paris_time(iso_str):
    """
    Convertit une chaîne ISO en heure de Paris.
    Par exemple, "2025-02-10T00:30:00Z" devient "2025-02-10T01:30:00+01:00" si c'est bien l'heure de Paris.
    """
    try:
        dt = parser.isoparse(iso_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        dt_paris = dt.astimezone(PARIS_TZ)
        return dt_paris.isoformat(timespec='seconds')
    except Exception as e:
        print(f"Erreur conversion date {iso_str}: {str(e)}")
        return iso_str

def extract_join_url(meeting):
    """
    Extrait l'URL de réunion Teams depuis 'onlineMeeting.joinUrl'.
    Sinon, cherche dans le corps (body.content) une URL Teams et la renvoie.
    """
    join_url = (meeting.get('onlineMeeting') or {}).get('joinUrl', '')
    if join_url:
        return join_url
    body_content = meeting.get('body', {}).get('content', '')
    pattern = r'https:\/\/teams\.microsoft\.com\/l\/meetup-join\/[^\s\'"]+'
    match = re.search(pattern, body_content)
    if match:
        return match.group(0)
    return ''

def update_meetings(salle_email, salle_name):
    """
    Récupère les réunions pour une salle donnée via l'API Graph.
    La plage horaire est calculée en fonction de l'heure de Paris.
    """
    token = get_token()
    if not token:
        return []
    
    headers = {'Authorization': f'Bearer {token}'}
    now_utc = datetime.now(timezone.utc)
    now_paris = now_utc.astimezone(PARIS_TZ)
    start = (now_paris - timedelta(hours=2)).isoformat()
    end = (now_paris + timedelta(hours=24)).isoformat()
    
    try:
        response = requests.get(
            f"https://graph.microsoft.com/v1.0/users/{salle_email}/calendarview",
            headers=headers,
            params={
                'startDateTime': start,
                'endDateTime': end,
                '$orderby': 'start/dateTime',
                '$select': 'id,subject,start,end,isOnlineMeeting,onlineMeeting,attendees,isCancelled,body'
            },
            timeout=15
        )
        response.raise_for_status()
        return process_meetings(response.json().get('value', []), salle_name)
    except Exception as e:
        print(f"Erreur API {salle_name}: {str(e)}")
        return []

def process_meetings(meetings, salle_name):
    """
    Filtre les réunions annulées et convertit les dates en heure de Paris.
    """
    processed = []
    for m in meetings:
        if m.get('isCancelled'):
            continue
        processed.append({
            'id': f"{salle_name}_{m.get('id', '')}",
            'subject': m.get('subject', 'Sans titre'),
            'start': convert_to_paris_time(m.get('start', {}).get('dateTime', '')),
            'end': convert_to_paris_time(m.get('end', {}).get('dateTime', '')),
            'isOnline': m.get('isOnlineMeeting', False),
            'joinUrl': extract_join_url(m),
            'attendees': [a.get('emailAddress', {}).get('address', '') for a in m.get('attendees', [])],
            'salle': salle_name,
            'lastUpdated': datetime.now(timezone.utc).astimezone(PARIS_TZ).isoformat(timespec='seconds')
        })
    return processed

def check_for_changes():
    """
    Détecte les changements via une requête delta sur l'API Graph.
    """
    global last_modified_check
    changes = False
    for salle, email in SALLES.items():
        try:
            token = get_token()
            if not token:
                continue
            response = requests.get(
                f"https://graph.microsoft.com/v1.0/users/{email}/calendarView/delta",
                headers={'Authorization': f'Bearer {token}'},
                params={
                    '$select': 'lastModifiedDateTime',
                    '$top': 1,
                    '$orderby': 'lastModifiedDateTime desc'
                },
                timeout=10
            )
            if response.status_code == 200:
                current_last_modified = response.json().get('value', [{}])[0].get('lastModifiedDateTime')
                if last_modified_check.get(email) != current_last_modified:
                    changes = True
                    last_modified_check[email] = current_last_modified
        except Exception as e:
            print(f"Erreur vérification changements {salle}: {str(e)}")
    return changes

def update_all_meetings():
    """
    Récupère toutes les réunions et recrée le fichier JSON.
    """
    all_meetings = []
    for salle, email in SALLES.items():
        all_meetings.extend(update_meetings(email, salle))
    try:
        with open(MEETINGS_FILE, 'w', encoding='utf-8') as f:
            json.dump(all_meetings, f)
        print(f"Mise à jour réussie à {datetime.now(timezone.utc).astimezone(PARIS_TZ).isoformat(timespec='seconds')} ({len(all_meetings)} réunions)")
    except Exception as e:
        print(f"Erreur d'écriture: {str(e)}")

def background_updater():
    """
    Le thread d'arrière-plan effectue :
      - Une mise à jour complète toutes les 30 secondes.
      - Une vérification des changements toutes les 5 secondes.
    """
    last_full_update = datetime.now(timezone.utc)
    while True:
        try:
            now = datetime.now(timezone.utc)
            if (now - last_full_update).total_seconds() > 30:
                with update_lock:
                    update_all_meetings()
                    last_full_update = now
                    print("Mise à jour complète effectuée")
            elif check_for_changes():
                with update_lock:
                    update_all_meetings()
                    print("Mise à jour partielle déclenchée")
            time.sleep(5)
        except Exception as e:
            print(f"Erreur critique du thread: {str(e)}")
            time.sleep(5)

# --- Filtrage par adresse IP ---
@app.before_request
def limit_remote_addr():
    """
    Filtre les requêtes selon l'adresse IP du client.
    Si la liste ALLOWED_IPS n'est pas vide, seule une IP autorisée pourra accéder aux endpoints.
    """
    # Récupération de l'IP client via l'en-tête X-Forwarded-For (déployé derrière un proxy) ou remote_addr
    ip = request.headers.get('X-Forwarded-For', request.remote_addr)
    if ip:
        ip = ip.split(',')[0].strip()  # Si plusieurs IP sont présentes, on prend la première
    if ALLOWED_IPS and ip not in ALLOWED_IPS:
        return jsonify({"error": "Accès refusé depuis cette adresse IP."}), 403

# --- Nouvelle route pour interroger Graph et récupérer le lien de réunion via son ID ---
@app.route('/lookupMeeting')
def lookup_meeting():
    """
    Interroge Microsoft Graph pour récupérer l'URL de connexion (joinUrl)
    d'une réunion Teams à partir de son identifiant.
    """
    meeting_id = request.args.get('meetingId')
    if not meeting_id:
        return jsonify({'error': "Le paramètre 'meetingId' est requis."}), 400

    token = get_token()
    if not token:
        return jsonify({'error': "Erreur d'authentification."}), 500

    # Utilisation de l'endpoint beta pour récupérer la réunion par son ID
    url = f"https://graph.microsoft.com/beta/communications/onlineMeetings/{meeting_id}"
    headers = {"Authorization": f"Bearer {token}"}

    try:
        response = requests.get(url, headers=headers, timeout=15)
    except Exception as e:
        return jsonify({'error': f"Erreur lors de l'appel à Graph: {str(e)}"}), 500

    if response.status_code == 200:
        data = response.json()
        joinUrl = data.get("joinUrl")
        if joinUrl:
            return jsonify({"joinUrl": joinUrl})
        else:
            return jsonify({'error': "Join URL non disponible pour cette réunion."}), 404
    else:
        return jsonify({'error': "Réunion non trouvée sur Graph."}), 404

# --- Routes Flask ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/meetings.json')
def get_meetings():
    """
    Avant de servir le fichier, vérifie si sa dernière mise à jour date de plus de 10 secondes.
    Si c'est le cas, force une mise à jour immédiate.
    """
    if not os.path.exists(MEETINGS_FILE):
        return jsonify({"error": "Aucune réunion disponible"}), 404
    if time.time() - os.path.getmtime(MEETINGS_FILE) > 10:
        with update_lock:
            update_all_meetings()
    return send_from_directory('.', MEETINGS_FILE)

@app.route('/<salle_name>')
def salle(salle_name):
    """Affiche les réunions pour une salle spécifique."""
    salle_name = salle_name.lower()
    if salle_name not in SALLES:
        return f"Salle '{salle_name}' non trouvée", 404

    if not os.path.exists(MEETINGS_FILE):
        return jsonify({"error": "Aucune réunion disponible"}), 404

    try:
        with open(MEETINGS_FILE, 'r', encoding='utf-8') as f:
            all_meetings = json.load(f)
    except Exception as e:
        return jsonify({"error": f"Erreur de lecture du fichier JSON: {str(e)}"}), 500

    salle_meetings = [meeting for meeting in all_meetings if meeting.get('salle', '').lower() == salle_name]
    return render_template('index.html', salle_name=salle_name, meetings=salle_meetings)

# --- Exécution principale ---
if __name__ == '__main__':
    # Lancement du thread d'arrière-plan pour mettre à jour les réunions
    updater_thread = threading.Thread(target=background_updater, daemon=True)
    updater_thread.start()
    # Récupérer le port depuis la variable d'environnement (par défaut 5000)
    port = int(os.environ.get('PORT', 5000))
    # Démarrage du serveur Flask
    app.run(host='0.0.0.0', port=port)
