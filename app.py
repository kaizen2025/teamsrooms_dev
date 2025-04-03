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
import re # Assuré importé
from datetime import datetime, timedelta, timezone
from dateutil import parser
from flask import Flask, render_template, jsonify, request, send_from_directory, abort, Response # Assuré importé
from werkzeug.middleware.proxy_fix import ProxyFix
from functools import wraps
from concurrent.futures import ThreadPoolExecutor, as_completed
import traceback # Pour afficher les erreurs complètes

# --- Installation des dépendances ---
def install_requirements():
    requirements_file = os.path.join(os.path.dirname(__file__), 'requirements.txt')
    if os.path.exists(requirements_file):
        print(f"Vérification/Installation dépendances depuis {requirements_file}...")
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', '--upgrade', '--no-cache-dir', '-r', requirements_file])
            print("Dépendances OK.")
        except subprocess.CalledProcessError as e:
            print(f"ERREUR FATALE: Échec installation dépendances (Code: {e.returncode}). Arrêt.")
            sys.exit(1)
        except Exception as ex:
             print(f"ERREUR FATALE inattendue installation dépendances: {ex}. Arrêt.")
             sys.exit(1)
    else:
        print(f"AVERTISSEMENT: {requirements_file} non trouvé. Assurez-vous que les paquets sont installés.")

install_requirements()

# --- Configuration Globale et Initialisation ---
CONFIG_FILE = 'config.ini'
MEETINGS_FILE = 'meetings.json'
SALLES = {}
ALLOWED_IPS = []
AZURE_CONFIG = {}
DEBUG_MODE = False
PARIS_TZ = None

def load_config():
    global SALLES, ALLOWED_IPS, DEBUG_MODE, AZURE_CONFIG, PARIS_TZ
    print(f"Chargement config: '{CONFIG_FILE}'...")
    if not os.path.exists(CONFIG_FILE): print(f"ERREUR FATALE: '{CONFIG_FILE}' non trouvé."); sys.exit(1)
    config = configparser.ConfigParser(interpolation=None)
    try:
        config.read(CONFIG_FILE, encoding='utf-8')
        # Fuseau horaire
        try: PARIS_TZ = pytz.timezone('Europe/Paris'); print(f"Fuseau horaire OK: Europe/Paris")
        except pytz.exceptions.UnknownTimeZoneError: print("ERREUR FATALE: Fuseau 'Europe/Paris' inconnu."); sys.exit(1)
        # Salles
        if config.has_section('SALLES'): SALLES = dict(config.items('SALLES')); print(f"Salles OK: {list(SALLES.keys())}")
        else: print("AVERTISSEMENT: Section [SALLES] manquante.")
        # IPs
        ALLOWED_IPS = []
        if config.has_section('ALLOWED_IPS'):
            items = [ip.strip() for _, ip in config.items('ALLOWED_IPS') if ip.strip()]
            ALLOWED_IPS = [i.upper() if i.upper() == 'ALL' else i for i in items]; print(f"IPs OK: {ALLOWED_IPS if ALLOWED_IPS else 'Toutes'}")
        else: print("AVERTISSEMENT: Section [ALLOWED_IPS] manquante. Toutes IPs autorisées.")
        # Azure Config (insensible à la casse)
        AZURE_CONFIG = {}
        if config.has_section('AZURE'):
            items_lower = {k.lower(): v for k, v in config.items('AZURE')}; AZURE_CONFIG = items_lower
            req = ['tenantid', 'clientid', 'clientsecret']; missing = [r for r in req if r not in AZURE_CONFIG or not AZURE_CONFIG[r]]
            if missing: print(f"ERREUR FATALE: Clés Azure manquantes/vides: {', '.join(missing)}"); sys.exit(1)
            else: print("Config Azure OK.")
        else: print(f"ERREUR FATALE: Section [AZURE] manquante."); sys.exit(1)
        # Debug Mode
        try: DEBUG_MODE = config.getboolean('SETTINGS', 'DebugMode', fallback=False)
        except ValueError: DEBUG_MODE = False; print("AVERTISSEMENT: Valeur DebugMode invalide.")
        print(f"Mode Debug: {'Activé' if DEBUG_MODE else 'Désactivé'}")
    except Exception as e: print(f"ERREUR FATALE chargement config: {e}"); traceback.print_exc(); sys.exit(1)

# --- Application Flask ---
app = Flask(__name__, static_folder='static', template_folder='templates')
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)
load_config()
update_lock = threading.Lock()

# --- Fonctions Utilitaires ---
def retry(tries=3, delay=2, backoff=2, allowed_exceptions=(requests.exceptions.RequestException,)):
    def deco_retry(f):
        @wraps(f)
        def f_retry(*args, **kwargs):
            mtries, mdelay = tries, delay
            while mtries > 1:
                try:
                    return f(*args, **kwargs)
                except allowed_exceptions as e:
                    print(f"Erreur {f.__name__} ({type(e).__name__}): {e}. Retry {mdelay}s ({tries-mtries+1}/{tries})...")
                    time.sleep(mdelay)
                    mtries -= 1
                    mdelay *= backoff
            # Dernière tentative
            return f(*args, **kwargs)
        return f_retry
    return deco_retry

def convert_to_paris_time(iso_str):
    if not iso_str or not isinstance(iso_str, str): return None
    try:
        dt = parser.isoparse(iso_str)
        # Si naive, rendre aware en UTC (standard Graph)
        if dt.tzinfo is None or dt.tzinfo.utcoffset(dt) is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(PARIS_TZ).isoformat(timespec='seconds')
    except Exception as e:
        print(f"ERREUR Conversion Date '{iso_str}': {e}")
        return None

def extract_join_url(meeting_data):
    if not meeting_data or not isinstance(meeting_data, dict): return ''
    # 1. onlineMeeting.joinUrl
    online_info = meeting_data.get('onlineMeeting')
    join_url = online_info.get('joinUrl') if isinstance(online_info, dict) else None
    if join_url and isinstance(join_url, str) and 'teams.microsoft.com' in join_url:
        return join_url
    # 2. body.content
    body_info = meeting_data.get('body')
    content = body_info.get('content', '') if isinstance(body_info, dict) else ''
    if content and isinstance(content, str):
        patterns = [r'https://teams\.microsoft\.com/l/(?:meetup-join|meeting)/[a-zA-Z0-9%/:\-\._~\?#\[\]@!$&\'\(\)\*\+,;=]+']
        for p in patterns:
            match = re.search(p, content, re.IGNORECASE)
            if match:
                # Nettoyer la fin de l'URL trouvée
                return match.group(0).split('<')[0].split('"')[0].split("'")[0].strip()
    return ''

# --- Logique Métier (Token, Réunions) ---

@retry(tries=4, delay=3, allowed_exceptions=(requests.exceptions.RequestException,))
def get_token():
    tenant_id = AZURE_CONFIG.get('tenantid')
    client_id = AZURE_CONFIG.get('clientid')
    client_secret = AZURE_CONFIG.get('clientsecret')
    if not all([tenant_id, client_id, client_secret]):
        print("ERREUR INTERNE: Config Azure manquante pour get_token.")
        return None
    url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
    data = {'grant_type': 'client_credentials', 'client_id': client_id, 'client_secret': client_secret, 'scope': 'https://graph.microsoft.com/.default'}
    response = requests.post(url, data=data, timeout=20)
    response.raise_for_status() # Le décorateur retry gère les erreurs HTTP ici
    token_response = response.json()
    token = token_response.get('access_token')
    if token:
        return token
    else:
        # Devrait être rare si raise_for_status est passé
        print(f"ERREUR Token: Réponse API sans token: {response.text}")
        return None

def process_meetings(meetings_data, salle_name, current_time_paris):
    processed = []
    for m in meetings_data:
        if m.get('isCancelled'): continue
        start_str = convert_to_paris_time(m.get('start', {}).get('dateTime'))
        end_str = convert_to_paris_time(m.get('end', {}).get('dateTime'))
        if start_str is None or end_str is None:
             if DEBUG_MODE: print(f"AVERTISSEMENT: Réunion '{m.get('subject', 'N/A')}' {salle_name} ignorée (date invalide).")
             continue
        try:
            start_dt = parser.isoparse(start_str)
            end_dt = parser.isoparse(end_str)
        except Exception as e:
            print(f"ERREUR parsing date après conversion pour '{m.get('subject')}': {e}")
            continue # Ignorer si le parsing échoue même après conversion
        status = "À venir"
        if end_dt < current_time_paris: status = "Passée"
        elif start_dt <= current_time_paris < end_dt: status = "En cours"
        join_url = extract_join_url(m)
        is_online = m.get('isOnlineMeeting', False) or bool(join_url)
        attendees = sorted(list(set(
            a.get('emailAddress', {}).get('address', '').lower()
            for a in m.get('attendees', []) if a.get('emailAddress',{}).get('address')
        )))
        loc = m.get('location', {}).get('displayName', '').strip()
        loc_display = loc if loc else salle_name
        processed.append({
            'id': f"{salle_name.lower().replace(' ', '_')}_{m.get('id', '')}",
            'subject': m.get('subject', 'Réunion sans titre'), # Utiliser un fallback plus clair
            'start': start_str, 'end': end_str, 'status': status, 'isOnline': is_online,
            'joinUrl': join_url, 'attendees': attendees, 'salle': salle_name,
            'location': loc_display,
            'lastUpdated': current_time_paris.isoformat(timespec='seconds')
        })
    return processed

@retry(tries=2, delay=5, allowed_exceptions=(requests.exceptions.RequestException,))
def update_meetings(salle_email, salle_name):
    token = get_token()
    if not token: return [] # Échec token géré
    now_paris = datetime.now(PARIS_TZ)
    headers = {'Authorization': f'Bearer {token}', 'Prefer': f'outlook.timezone="{PARIS_TZ.zone}"'}
    start_t = (now_paris - timedelta(hours=6)).isoformat()
    end_t = (now_paris + timedelta(hours=36)).isoformat()
    url = f"https://graph.microsoft.com/v1.0/users/{salle_email}/calendarView"
    params = {'startDateTime': start_t, 'endDateTime': end_t, '$orderby': 'start/dateTime',
              '$select': 'id,subject,start,end,isOnlineMeeting,onlineMeeting,attendees,isCancelled,body,location', '$top': 75}
    response = requests.get(url, headers=headers, params=params, timeout=30)
    # Gérer erreurs client non récupérables (ne pas retry 401, 403, 404...)
    if 400 <= response.status_code < 500 and response.status_code != 429: # 429 peut être retried
        print(f"ERREUR CLIENT {response.status_code} API pour {salle_name}: {response.text[:100]}...")
        return [] # Retourner liste vide, pas d'exception pour retry
    response.raise_for_status() # Gère 5xx et 429 pour retry
    results = response.json().get('value', [])
    return process_meetings(results, salle_name, now_paris)

def update_all_meetings():
    if not SALLES: print("Màj annulée: Pas de salles."); return
    start_t = time.monotonic()
    print(f"[{datetime.now(PARIS_TZ).strftime('%H:%M:%S')}] Début màj réunions...")
    all_data, failed = [], []
    max_w = min(len(SALLES), 8) # Limiter parallélisme
    with ThreadPoolExecutor(max_workers=max_w) as executor:
        f_to_room = {executor.submit(update_meetings, email, name): name for name, email in SALLES.items()}
        for f in as_completed(f_to_room):
            room = f_to_room[f]
            try:
                all_data.extend(f.result()) # f.result() lève l'exception si échec final
            except Exception as exc:
                print(f"ÉCHEC FINAL récupération pour {room}: {type(exc).__name__} - {exc}")
                failed.append(room)
    # Trier avant d'écrire
    all_data.sort(key=lambda x: parser.isoparse(x['start']))
    # Écriture atomique
    tmp = f"{MEETINGS_FILE}.{os.getpid()}.tmp"
    try:
        with open(tmp, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2 if DEBUG_MODE else None)
        os.replace(tmp, MEETINGS_FILE) # Renommage atomique
        d = time.monotonic() - start_t
        print(f"[{datetime.now(PARIS_TZ).strftime('%H:%M:%S')}] Màj finie ({d:.2f}s). {len(all_data)} réunions écrites.")
        if failed: print(f"  -> Échec pour: {', '.join(failed)}")
    except Exception as e: # Erreur large ici car peut être IOError ou autre
        print(f"ERREUR CRITIQUE écriture {MEETINGS_FILE}: {e}")
        # Nettoyage du fichier temporaire en cas d'erreur d'écriture/remplacement
        if os.path.exists(tmp):
            try:
                os.remove(tmp)
                print(f"  -> Fichier temporaire {tmp} supprimé après erreur.")
            except OSError as ose:
                 print(f"  -> AVERTISSEMENT: Impossible de supprimer {tmp}: {ose}")

def background_updater():
    print("Thread background_updater démarré."); interval = 60; print(f"Intervalle màj: {interval}s.")
    time.sleep(5) # Attente initiale
    while True:
        try:
            # Essayer d'acquérir le verrou sans attendre
            if update_lock.acquire(blocking=False):
                try:
                    # Exécuter la mise à jour
                    update_all_meetings()
                finally:
                    # Toujours libérer le verrou
                    update_lock.release()
            # else: # Optionnel: log si màj sautée car déjà en cours
            #     if DEBUG_MODE: print("Màj déjà en cours, sautée par thread périodique.")
            # Attendre avant la prochaine tentative
            time.sleep(interval)
        except Exception as e:
            # Logguer l'erreur mais ne pas arrêter le thread
            print(f"ERREUR MAJEURE thread background: {e}")
            traceback.print_exc()
            print("Le thread redémarre après pause...")
            time.sleep(60) # Pause plus longue en cas d'erreur

# --- Middleware et Routes Flask ---

@app.before_request
def before_request_middleware():
    path = request.path
    # Ne pas appliquer aux fichiers statiques et à la page de diag IP
    if not path.startswith('/static/') and path != '/ip-check':
        # Filtrage IP
        if ALLOWED_IPS and 'ALL' not in ALLOWED_IPS:
            ip = request.remote_addr # Devrait être la bonne IP via ProxyFix
            if ip not in ALLOWED_IPS:
                print(f"Accès REFUSÉ IP: {ip} (Path: {path})")
                return jsonify({"error": f"IP ({ip}) non autorisée."}), 403 # 403 Forbidden
        # Logging des requêtes si Debug activé
        if DEBUG_MODE:
            print(f"Requête: {request.method} {path} (IP: {request.remote_addr})")

@app.route('/')
def index():
    # Passer les noms de salle (triés) au template pour le menu/filtres
    return render_template('index.html', room_names=sorted(list(SALLES.keys())))

@app.route('/meetings.json')
def get_meetings_json():
    # Vérifier si le fichier existe, sinon tenter une màj
    if not os.path.exists(MEETINGS_FILE):
        print(f"'{MEETINGS_FILE}' non trouvé, tentative màj immédiate...")
        # Utiliser le verrou pour la màj manuelle aussi
        with update_lock:
            update_all_meetings()
        # Re-vérifier si le fichier a été créé
        if not os.path.exists(MEETINGS_FILE):
            # Si toujours pas là, renvoyer une erreur avec une liste vide
            return jsonify({"error": "Données indisponibles.", "meetings": []}), 404
    # Servir le fichier avec headers anti-cache
    try:
        resp = send_from_directory('.', MEETINGS_FILE, mimetype='application/json')
        resp.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        resp.headers['Pragma'] = 'no-cache'
        resp.headers['Expires'] = '0'
        return resp
    except FileNotFoundError:
        # Sécurité si le fichier disparaît entre le check et send_from_directory
        return jsonify({"error": "Fichier meetings.json introuvable.", "meetings": []}), 404

# *** Fonction lookup_meeting (Version Cache + API) ***
@app.route('/lookupMeeting')
def lookup_meeting():
    meeting_id_raw = request.args.get('meetingId', '').strip()
    if not meeting_id_raw: return jsonify({'error': "Le paramètre 'meetingId' est requis."}), 400
    if DEBUG_MODE: print(f"\n--- LOOKUP: Recherche ID brut: '{meeting_id_raw}' ---")

    is_numeric_id = bool(re.fullmatch(r'^[\d\s]+$', meeting_id_raw))
    cleaned_id_api = ''
    if is_numeric_id:
        cleaned_id_api = meeting_id_raw.replace(' ', '')
        if len(cleaned_id_api) < 9: return jsonify({'error': "ID numérique fourni trop court."}), 400
    else: cleaned_id_api = ''.join(c for c in meeting_id_raw if c.isalnum() or c in ['-', '_', '='])
    if not cleaned_id_api: return jsonify({'error': "ID fourni invalide après nettoyage."}), 400
    if DEBUG_MODE: print(f"  ID nettoyé API: '{cleaned_id_api}', Numérique: {is_numeric_id}")

    # 1. Recherche cache local
    try:
        if os.path.exists(MEETINGS_FILE):
            with open(MEETINGS_FILE, 'r', encoding='utf-8') as f: all_meetings = json.load(f)
            if DEBUG_MODE: print(f"  Recherche cache ({len(all_meetings)} réunions)...")
            for meeting in all_meetings:
                criteria = [meeting.get('id', ''), meeting.get('subject', '').lower(), meeting.get('joinUrl', '')]
                # Comparaison insensible à la casse pour raw et nettoyé
                if any(cleaned_id_api.lower() in c.lower() for c in criteria if c) or \
                   any(meeting_id_raw.lower() in c.lower() for c in criteria if c):
                    if meeting.get('joinUrl'):
                        if DEBUG_MODE: print(f"  -> TROUVÉ cache: '{meeting.get('subject')}'")
                        return jsonify({"joinUrl": meeting['joinUrl']}) # *** Trouvé cache ***
            if DEBUG_MODE: print("  Non trouvé cache.")
    except Exception as e: print(f"  Erreur cache: {e}")

    # 2. Recherche API Graph
    if DEBUG_MODE: print("  Interrogation API Graph...")
    token = get_token();
    if not token: return jsonify({'error': "Erreur interne recherche."}), 500
    headers = {"Authorization": f"Bearer {token}", "ConsistencyLevel": "eventual"}
    filters = [f"joinMeetingIdSettings/joinMeetingId eq '{cleaned_id_api}'", f"videoTeleconferenceId eq '{cleaned_id_api}'"]
    filter_query = " or ".join(filters)
    urls = [f"https://graph.microsoft.com/v1.0/communications/onlineMeetings?$filter={filter_query}&$select=joinUrl"]
    found_url_api = None
    for url in urls:
        if found_url_api: break
        try:
            endpoint = url.split('/')[3]
            if DEBUG_MODE:
                print(f"  Essai API {endpoint}...")
            response = requests.get(url, headers=headers, timeout=15)
            if response.status_code == 200:
                data = response.json().get('value', [])
                if data and data[0].get("joinUrl"):
                    found_url_api = data[0]["joinUrl"]
                    if DEBUG_MODE: print(f"  -> TROUVÉ API {endpoint}: {found_url_api[:40]}...")
            elif response.status_code == 404:
                if DEBUG_MODE:
                    print(f"  Non trouvé API {endpoint} (404).")
            elif response.status_code in [401, 403]:
                print(f"  ERREUR Auth/Perms ({response.status_code}) API {endpoint}. Arrêt.")
                break # Arrêter la boucle si erreur d'auth/perms
            else:
                print(f"  Avertissement API {endpoint}: Statut {response.status_code} - {response.text[:100]}...")
        except requests.exceptions.Timeout:
            print(f"  Timeout API {endpoint}.")
        except Exception as e:
            print(f"  Erreur API {endpoint}: {type(e).__name__} - {e}")

    # 3. Retour résultat
    if found_url_api: return jsonify({"joinUrl": found_url_api}) # *** Trouvé API ***
    else:
        if DEBUG_MODE: print("  Non trouvé API.")
        if is_numeric_id:
             if DEBUG_MODE: print("  -> ÉCHEC FINAL ID numérique. 404.")
             return jsonify({'error': f"Réunion introuvable ID numérique '{meeting_id_raw}'."}), 404
        else:
             if DEBUG_MODE: print("  -> ÉCHEC FINAL ID non-numérique. 404.")
             return jsonify({'error': f"Réunion introuvable ID '{meeting_id_raw}'."}), 404

@app.route('/ip-check')
def ip_check():
    ip = request.remote_addr
    headers = dict(request.headers)
    data = {'ip_detectee': ip, 'ips_autorisees_config': ALLOWED_IPS, 'headers': headers}
    if 'application/json' in request.headers.get('Accept', ''):
        return jsonify(data)
    else:
        html = f"""<!DOCTYPE html><html><head><title>Diag IP</title><style>body{{font-family:sans-serif}} pre{{background:#eee;padding:10px;border:1px solid #ccc; overflow-x:auto;}}</style></head><body>
                 <h1>Diag IP</h1><p><strong>IP Détectée:</strong> <strong style='color:blue; font-size:1.1em'>{ip}</strong></p>
                 <p><strong>IPs Autorisées:</strong> {json.dumps(ALLOWED_IPS)}</p>
                 <h2>Headers HTTP:</h2><pre>{json.dumps(headers, indent=2)}</pre></body></html>"""
        return Response(html, mimetype='text/html')

@app.route('/api/create-meeting', methods=['POST'])
def create_meeting():
    data = request.json
    if not data: return jsonify({'error': "Données manquantes"}), 400
    log.debug(f"API: Données reçues pour création: {data}") # Log les données reçues

    # Valider champs requis (y compris heure et date séparées si envoyées comme ça)
    # Supposons que le frontend envoie 'date', 'startTime', 'endTime' comme strings
    required_fields = ['title', 'date', 'startTime', 'endTime', 'roomEmail']
    if not all(data.get(f) for f in required_fields):
         log.error(f"API: Champs manquants pour création: { {f: data.get(f) for f in required_fields} }")
         return jsonify({'error': "Champs requis manquants (title, date, startTime, endTime, roomEmail)"}), 400

    token = get_token()
    if not token: return jsonify({'error': "Erreur Auth Graph."}), 500

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # *** CORRECTION FUSEAU HORAIRE ***
    try:
        # 1. Lire date et heures depuis la requête
        date_str = data['date'] # ex: "2025-04-03"
        start_time_str = data['startTime'] # ex: "01:45"
        end_time_str = data['endTime'] # ex: "02:15"

        # 2. Combiner date et heure en objets datetime NAIFS
        naive_start_dt = datetime.strptime(f"{date_str} {start_time_str}", '%Y-%m-%d %H:%M')
        naive_end_dt = datetime.strptime(f"{date_str} {end_time_str}", '%Y-%m-%d %H:%M')

        # 3. Localiser ces datetimes naifs dans le fuseau de Paris -> objets AWARE
        paris_start_dt = PARIS_TZ.localize(naive_start_dt)
        paris_end_dt = PARIS_TZ.localize(naive_end_dt)

        # 4. Convertir les datetimes AWARE en chaînes ISO 8601 pour l'API Graph
        #    isoformat() sur un datetime aware inclut l'offset (+02:00)
        start_iso_for_graph = paris_start_dt.isoformat()
        end_iso_for_graph = paris_end_dt.isoformat()

        log.debug(f"API: Dates converties pour Graph: Start='{start_iso_for_graph}', End='{end_iso_for_graph}'")

    except ValueError as e:
        log.error(f"API: Erreur de format date/heure reçue: {e}. Reçu: date='{data.get('date')}', start='{data.get('startTime')}', end='{data.get('endTime')}'")
        return jsonify({'error': "Format de date ou d'heure invalide."}), 400
    except Exception as e:
         log.error(f"API: Erreur localisation date/heure: {e}")
         return jsonify({'error': "Erreur interne traitement date/heure."}), 500
    # *** FIN CORRECTION FUSEAU HORAIRE ***

    # Construction des participants (inchangée)
    room_email = data['roomEmail']
    participants_emails = data.get('participants', [])
    salle_emails_lower = [email.lower() for email in SALLES.values()]
    attendees_list = [{"emailAddress": {"address": room_email}, "type": "resource"}]
    for email in participants_emails:
        if email and '@' in email and email.lower() not in salle_emails_lower:
            attendees_list.append({"emailAddress": {"address": email}, "type": "required"})

    # Construction du corps de la requête avec les dates ISO localisées
    event_data = {
        "subject": data['title'],
        "start": {
            "dateTime": start_iso_for_graph, # Utiliser la date/heure ISO localisée Paris
            "timeZone": "Europe/Paris"       # Garder pour clarté API
        },
        "end": {
            "dateTime": end_iso_for_graph,   # Utiliser la date/heure ISO localisée Paris
            "timeZone": "Europe/Paris"         # Garder pour clarté API
        },
        "location": {
            "displayName": data.get('room', room_email.split('@')[0])
        },
        "attendees": attendees_list,
        "isOnlineMeeting": True,
        "onlineMeetingProvider": "teamsForBusiness"
    }

    log.info(f"API: Tentative création réunion '{data['title']}' pour '{data['room']}'")
    if DEBUG_MODE:
        log.debug(f"API: Données envoyées à Graph: {json.dumps(event_data, indent=2)}")

    try:
        # Utiliser un compte organisateur (ici email de salle par simplicité, à revoir)
        organizer_email = room_email
        url = f"https://graph.microsoft.com/v1.0/users/{organizer_email}/calendar/events"
        response = requests.post(url, headers=headers, json=event_data, timeout=20)

        if response.status_code >= 400:
            log.error(f"API: Erreur Graph {response.status_code} création réunion: {response.text}")
            return jsonify({'error': f"Erreur Graph API: {response.text}"}), response.status_code

        meeting_data = response.json()
        join_url = extract_join_url(meeting_data)

        log.info(f"API: Réunion '{meeting_data.get('subject')}' créée avec succès (ID Graph: {meeting_data.get('id')}).")

        # Forcer MAJ cache (optionnel)
        # threading.Thread(target=update_all_meetings).start() # Lancer en thread pour ne pas bloquer

        return jsonify({
            'success': True,
            # ... (autres données retournées) ...
             'start': meeting_data.get('start', {}).get('dateTime'), # Retourner date Graph pour confirmation
             'end': meeting_data.get('end', {}).get('dateTime')
        }), 201

    except Exception as e:
        log.error(f"API: Erreur lors de la création réunion: {e}", exc_info=DEBUG_MODE)
        return jsonify({'error': f"Erreur serveur interne: {e}"}), 500

# --- Exécution Principale ---
if __name__ == '__main__':
    print("-" * 60); print(" >>> Démarrage Serveur Salles Teams <<<"); print("-" * 60)
    updater = threading.Thread(target=background_updater, name="BackgroundUpdater", daemon=True)
    updater.start()
    server_port = int(os.environ.get('PORT', 5001))
    print(f"Serveur prêt et écoute sur http://0.0.0.0:{server_port}")
    print(f"Mode Debug: {DEBUG_MODE}, IPs Autorisées: {ALLOWED_IPS}, Salles: {list(SALLES.keys())}")
    print("-" * 60)
    try:
        from waitress import serve
        print(f"Utilisation de Waitress (prod-like server)...")
        serve(app, host='0.0.0.0', port=server_port, threads=10)
    except ImportError:
        print("(!) Waitress non trouvé. Utilisation serveur dev Flask (NON PROD).")
        print("Pour installer Waitress: pip install waitress")
        app.run(host='0.0.0.0', port=server_port, debug=False)
    except Exception as e:
        print(f"\n!!! ERREUR FATALE Démarrage Serveur: {e} !!!")
        traceback.print_exc()
        sys.exit(1)
    print("Serveur arrêté.")