import os
import time
# Pour forcer l'utilisation du fuseau horaire de Paris au niveau système (si supporté)
os.environ['TZ'] = 'Europe/Paris'
try:
    time.tzset()
except AttributeError:
    # time.tzset() n'est pas disponible sous Windows
    pass

from flask import Flask, render_template, jsonify, request, send_from_directory  
import configparser
import requests
import json
import threading
import pytz
import re
from datetime import datetime, timedelta, timezone
from dateutil import parser  # Nécessite python-dateutil
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

# Configuration
MEETINGS_FILE = 'meetings.json'
SALLES = {}
config = configparser.ConfigParser()
config.read('config.ini')

if config.has_section('SALLES'):
    SALLES = dict(config.items('SALLES'))

# Définition du fuseau horaire de Paris
PARIS_TZ = pytz.timezone('Europe/Paris')

# Variables d'état
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
    Cette fonction utilise dateutil pour une analyse fiable.
    Par exemple, une date "2025-02-10T00:30:00Z" sera convertie en "2025-02-10T01:30:00+01:00"
    si c'est bien l'heure de Paris.
    """
    try:
        dt = parser.isoparse(iso_str)  # Analyse la date en tenant compte de l'offset s'il est présent
        # Si l'objet est naïf, on suppose qu'il est en UTC
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
    # Utilisation d'un objet timezone-aware pour l'heure actuelle en UTC puis conversion en Paris
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
    Cette fonction est appelée immédiatement au démarrage pour forcer l'update.
    """
    all_meetings = []
    for salle, email in SALLES.items():
        all_meetings.extend(update_meetings(email, salle))
    try:
        with open(MEETINGS_FILE, 'w') as f:
            json.dump(all_meetings, f)
        print(f"Mise à jour réussie à {datetime.now(timezone.utc).astimezone(PARIS_TZ).isoformat(timespec='seconds')} ({len(all_meetings)} réunions)")
    except Exception as e:
        print(f"Erreur d'écriture: {str(e)}")

def background_updater():
    """
    Le thread d'arrière-plan effectue :
      - Une mise à jour complète toutes les 30 secondes.
      - Une vérification des changements toutes les 5 secondes.
    Ainsi, les réunions seront mises à jour au plus tard quelques secondes après un changement.
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

# --- Routes ---
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
# --- Démarrage ---
if __name__ == '__main__':
    # Forcer immédiatement une mise à jour pour obtenir les dernières données
    update_all_meetings()
    updater = threading.Thread(target=background_updater)
    updater.daemon = True
    updater.start()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False, use_reloader=False)
else:
    update_all_meetings()
    updater = threading.Thread(target=background_updater)
    updater.daemon = True
    updater.start()
