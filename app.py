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
from dateutil import parser # Nécessite python-dateutil dans requirements.txt
from flask import Flask, render_template, jsonify, request, send_from_directory, abort, Response
from werkzeug.middleware.proxy_fix import ProxyFix

# --- Installation initiale des dépendances ---
def install_requirements():
    """Installe les dépendances depuis requirements.txt si nécessaire."""
    requirements_file = os.path.join(os.path.dirname(__file__), 'requirements.txt')
    if os.path.exists(requirements_file):
        try:
            print("Installation/Vérification des dépendances depuis requirements.txt…")
            # Utiliser --upgrade pour s'assurer d'avoir les bonnes versions
            # Utiliser --quiet pour moins de logs sauf en cas d'erreur
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', '--upgrade', '-r', requirements_file, '--quiet'])
            print("Dépendances vérifiées/installées.")
        except subprocess.CalledProcessError as e:
            print(f"ERREUR: Impossible d'installer les dépendances: {e}", file=sys.stderr)
            sys.exit(1) # Arrêter si l'installation échoue
        except FileNotFoundError:
             print("ERREUR: La commande 'pip' est introuvable. Assurez-vous que Python et pip sont correctement installés.", file=sys.stderr)
             sys.exit(1)
    else:
        print("ATTENTION: Fichier requirements.txt non trouvé. Les dépendances pourraient manquer.")

install_requirements()
# --- Fin Installation ---

# --- Configuration Globale ---
CONFIG_FILE = 'config.ini'
MEETINGS_FILE = 'meetings.json' # Fichier où stocker les réunions
DEBUG_MODE = True # Mettre à False en production pour moins de logs

# Charger la configuration
config = configparser.ConfigParser()
if not os.path.exists(CONFIG_FILE):
    print(f"ERREUR: Fichier de configuration '{CONFIG_FILE}' introuvable.", file=sys.stderr)
    sys.exit(1)
config.read(CONFIG_FILE)

# Charger les paramètres essentiels (avec valeurs par défaut et gestion d'erreur)
try:
    AZURE_CONFIG = {
        'TenantID': config.get('AZURE', 'TenantID'),
        'ClientID': config.get('AZURE', 'ClientID'),
        'ClientSecret': config.get('AZURE', 'ClientSecret'),
        # AJOUT: Compte organisateur pour la création de réunion (IMPORTANT)
        'OrganizerUser': config.get('AZURE', 'OrganizerUser', fallback=None)
    }
    SALLES = dict(config.items('SALLES')) if config.has_section('SALLES') else {}
    ALLOWED_IPS = [ip.strip() for _, ip in config.items('ALLOWED_IPS')] if config.has_section('ALLOWED_IPS') else []

    if not all(AZURE_CONFIG.values()):
         # Vérifier si OrganizerUser est manquant (si nécessaire pour la création)
         if not AZURE_CONFIG['OrganizerUser']:
             print("ATTENTION: 'OrganizerUser' non défini dans [AZURE] dans config.ini. La création de réunions pourrait échouer si vous n'avez pas d'autre logique pour l'organisateur.")
         else:
            raise ValueError("Paramètres AZURE manquants dans config.ini")

    if not SALLES:
        print("ATTENTION: Aucune salle définie dans la section [SALLES] de config.ini.")

    if not AZURE_CONFIG['OrganizerUser']:
         # Utiliser la première salle comme fallback SEULEMENT si pas d'organisateur défini
         AZURE_CONFIG['OrganizerUser'] = next(iter(SALLES.values()), None)
         if AZURE_CONFIG['OrganizerUser']:
             print(f"ATTENTION: Utilisation de la première salle ({AZURE_CONFIG['OrganizerUser']}) comme organisateur par défaut.")
         else:
              print("ERREUR: Impossible de déterminer un organisateur pour créer des réunions. Définissez 'OrganizerUser' dans [AZURE] ou ajoutez des salles dans [SALLES].")
              # Ne pas quitter, mais la création échouera probablement

except (configparser.NoSectionError, configparser.NoOptionError, ValueError) as e:
    print(f"ERREUR de configuration dans '{CONFIG_FILE}': {e}", file=sys.stderr)
    sys.exit(1)

# Fuseau horaire
PARIS_TZ = pytz.timezone('Europe/Paris')
try:
    os.environ['TZ'] = 'Europe/Paris'
    time.tzset()
except AttributeError:
    pass # Non disponible sur Windows, pytz gérera

# État global pour la mise à jour
last_modified_check = {}
update_lock = threading.Lock()
# --- Fin Configuration Globale ---

# --- Initialisation Flask ---
app = Flask(__name__,
            static_folder='static', # Assure que Flask cherche ici
            template_folder='templates')
# Configurer ProxyFix pour les déploiements derrière un proxy (ex: Render, Nginx)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)
# --- Fin Initialisation Flask ---

# --- Fonctions Microsoft Graph ---
def get_token():
    """Récupère un token d'accès Azure AD."""
    try:
        url = f"https://login.microsoftonline.com/{AZURE_CONFIG['TenantID']}/oauth2/v2.0/token"
        data = {
            'grant_type': 'client_credentials',
            'client_id': AZURE_CONFIG['ClientID'],
            'client_secret': AZURE_CONFIG['ClientSecret'],
            'scope': 'https://graph.microsoft.com/.default'
        }
        response = requests.post(url, data=data, timeout=10) # Timeout réduit
        response.raise_for_status() # Lève une exception pour les codes 4xx/5xx
        token_data = response.json()
        token = token_data.get('access_token')
        if not token:
            print(f"Erreur Auth: Token non trouvé dans la réponse. Réponse: {token_data}")
            return None
        if DEBUG_MODE: print("Token récupéré avec succès.")
        return token
    except requests.exceptions.RequestException as e:
        print(f"Erreur réseau Auth: {e}")
    except Exception as e:
        print(f"Erreur inattendue Auth: {e}")
    return None

def convert_to_paris_time(iso_str):
    """Convertit une chaîne ISO UTC ou sans TZ en ISO avec TZ Paris."""
    if not iso_str: return None
    try:
        dt = parser.isoparse(iso_str)
        # Si pas de fuseau horaire, supposer UTC (comportement courant de Graph)
        if dt.tzinfo is None or dt.tzinfo.utcoffset(dt) is None:
            dt = dt.replace(tzinfo=timezone.utc)
        dt_paris = dt.astimezone(PARIS_TZ)
        return dt_paris.isoformat(timespec='seconds') # Format YYYY-MM-DDTHH:MM:SS+HH:MM
    except Exception as e:
        print(f"Erreur conversion date '{iso_str}': {e}")
        return None # Retourner None en cas d'erreur

def extract_join_url(meeting):
    """Extrait l'URL de jointure Teams de manière robuste."""
    if not meeting: return ''

    # 1. Essayer onlineMeeting.joinUrl (le plus fiable)
    join_url = (meeting.get('onlineMeeting') or {}).get('joinUrl', '')
    if join_url:
        if DEBUG_MODE: print(f"Join URL via onlineMeeting: {join_url[:35]}...")
        return join_url

    # 2. Essayer de parser le corps HTML/texte
    body_content = meeting.get('body', {}).get('content', '')
    if body_content:
        # Regex améliorée pour capturer différentes formes d'URL Teams
        patterns = [
            r'https://teams\.microsoft\.com/l/meetup-join/[^\s"\'<>]+', # Standard
            r'https://teams\.microsoft\.com/l/meeting/[^\s"\'<>]+',     # Autre format
            r'https://teams\.live\.com/meet/[^\s"\'<>]+'               # Live events?
        ]
        for pattern in patterns:
            match = re.search(pattern, body_content)
            if match:
                url = match.group(0).strip() # Nettoyer espaces potentiels
                if DEBUG_MODE: print(f"Join URL via regex body: {url[:35]}...")
                return url

    # 3. Fallback: Construire une URL à partir de l'ID (si disponible)
    # Ceci est une supposition et pourrait ne pas toujours fonctionner
    meeting_id_graph = meeting.get('id')
    if meeting_id_graph:
         # L'ID Graph est souvent long et complexe, on ne peut pas juste le mettre dans l'URL
         # L'URL /lookupMeeting est une meilleure approche si on n'a que l'ID.
         # On ne retourne RIEN ici pour forcer l'utilisation de /lookupMeeting si besoin.
         if DEBUG_MODE: print(f"Join URL non trouvée pour {meeting.get('subject')}, ID Graph: {meeting_id_graph[:15]}...")
         # return f"fallback_id:{meeting_id_graph}" # On pourrait retourner un indicateur?
         return '' # Préférable de retourner vide

    if DEBUG_MODE: print(f"Aucune Join URL trouvée pour {meeting.get('subject')}")
    return ''

def update_meetings_for_room(salle_email, salle_name):
    """Récupère et traite les réunions pour UNE salle."""
    token = get_token()
    if not token:
        print(f"Update Room {salle_name}: Échec récupération token.")
        return []

    headers = {'Authorization': f'Bearer {token}', 'Prefer': f'outlook.timezone="{PARIS_TZ.zone}"'}
    now_paris = datetime.now(PARIS_TZ)
    # Période de récupération: du début de la journée actuelle jusqu'à la fin du lendemain
    start_of_today = now_paris.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_tomorrow = start_of_today + timedelta(days=2) - timedelta(seconds=1)

    start_iso = start_of_today.isoformat()
    end_iso = end_of_tomorrow.isoformat()

    if DEBUG_MODE: print(f"Update Room {salle_name}: Récupération de {start_iso} à {end_iso}")

    try:
        response = requests.get(
            f"https://graph.microsoft.com/v1.0/users/{salle_email}/calendarView",
            headers=headers,
            params={
                'startDateTime': start_iso,
                'endDateTime': end_iso,
                '$orderby': 'start/dateTime',
                '$select': 'id,subject,start,end,isOnlineMeeting,onlineMeeting,attendees,isCancelled,body,location', # location ajouté
                '$top': 100 # Limite haute
            },
            timeout=15
        )
        response.raise_for_status()
        results = response.json().get('value', [])
        if DEBUG_MODE: print(f"Update Room {salle_name}: {len(results)} événements bruts reçus.")

        processed = []
        for m in results:
            if m.get('isCancelled'): continue # Ignorer annulés

            start_time = convert_to_paris_time(m.get('start', {}).get('dateTime', ''))
            end_time = convert_to_paris_time(m.get('end', {}).get('dateTime', ''))
            if not start_time or not end_time: continue # Ignorer si dates invalides

            join_url = extract_join_url(m)
            is_online = m.get('isOnlineMeeting', False) or bool(join_url)

            attendees = [a.get('emailAddress', {}).get('address', '')
                         for a in m.get('attendees', []) if a.get('emailAddress', {}).get('address')]

            meeting_id = m.get('id', '') # ID Graph original

            processed.append({
                # Utiliser l'ID Graph pour référence future si nécessaire
                'graph_id': meeting_id,
                # Créer un ID plus simple pour le front-end (évite caractères spéciaux)
                'id': f"{salle_name.lower()}_{meeting_id[:8]}", # Ex: canigou_AAMkAD...
                'subject': m.get('subject', 'Réunion sans titre'),
                'start': start_time,
                'end': end_time,
                'isOnline': is_online,
                'joinUrl': join_url,
                'attendees': attendees,
                'salle': salle_name, # Ajouter le nom de la salle
                 # Utiliser le displayName de location si disponible
                'locationDisplay': m.get('location', {}).get('displayName', salle_name),
                'lastUpdated': datetime.now(PARIS_TZ).isoformat(timespec='seconds')
            })
        if DEBUG_MODE: print(f"Update Room {salle_name}: {len(processed)} réunions traitées.")
        return processed

    except requests.exceptions.RequestException as e:
        print(f"Update Room {salle_name}: Erreur réseau API: {e}")
    except Exception as e:
        print(f"Update Room {salle_name}: Erreur inattendue: {e}")
    return [] # Retourner liste vide en cas d'erreur

def update_all_meetings_file():
    """Met à jour le fichier JSON avec les réunions de toutes les salles."""
    if not SALLES:
        print("Mise à jour annulée: Aucune salle configurée.")
        return

    print("Début de la mise à jour du fichier meetings.json...")
    all_meetings = []
    failed_rooms = []

    # Utiliser des threads pour paralléliser la récupération (si beaucoup de salles)
    threads = []
    results = {}

    def fetch_room_data(email, name):
        results[name] = update_meetings_for_room(email, name)

    for salle_name, salle_email in SALLES.items():
        thread = threading.Thread(target=fetch_room_data, args=(salle_email, salle_name))
        threads.append(thread)
        thread.start()

    for thread in threads:
        thread.join() # Attendre la fin de tous les threads

    # Collecter les résultats
    for salle_name, meetings in results.items():
        if meetings is None: # Gérer le cas où l'update a échoué
             failed_rooms.append(salle_name)
        else:
             all_meetings.extend(meetings)


    if failed_rooms:
        print(f"Échec partiel de la mise à jour pour: {', '.join(failed_rooms)}")

    try:
        # Créer une sauvegarde avant d'écraser
        if os.path.exists(MEETINGS_FILE):
            backup_file = f"{MEETINGS_FILE}.{int(time.time())}.bak"
            try:
                os.rename(MEETINGS_FILE, backup_file)
                if DEBUG_MODE: print(f"Sauvegarde créée: {backup_file}")
            except Exception as e:
                print(f"Erreur sauvegarde: {e}")

        # Écrire le nouveau fichier
        with open(MEETINGS_FILE, 'w', encoding='utf-8') as f:
            json.dump(all_meetings, f, ensure_ascii=False, indent=2) # Indent pour lisibilité

        update_time_paris = datetime.now(PARIS_TZ).isoformat(timespec='seconds')
        print(f"Mise à jour meetings.json terminée à {update_time_paris} ({len(all_meetings)} réunions)")

    except Exception as e:
        print(f"ERREUR lors de l'écriture de {MEETINGS_FILE}: {e}")

def background_updater():
    """Thread d'arrière-plan pour les mises à jour."""
    print("Thread d'arrière-plan démarré.")
    # Attendre un peu avant la première mise à jour complète
    time.sleep(5)
    while True:
        try:
             # Mise à jour complète toutes les 60 secondes (moins agressif)
             print(f"[{datetime.now(PARIS_TZ):%H:%M:%S}] Lancement mise à jour complète...")
             with update_lock: # Verrouiller pendant l'écriture du fichier
                 update_all_meetings_file()
             print(f"[{datetime.now(PARIS_TZ):%H:%M:%S}] Mise à jour terminée. Prochaine dans 60s.")
             time.sleep(60) # Intervalle entre les mises à jour complètes

        except Exception as e:
            print(f"ERREUR CRITIQUE du thread d'arrière-plan: {e}")
            print("Redémarrage de la boucle dans 30 secondes...")
            time.sleep(30)
# --- Fin Fonctions Microsoft Graph & Background ---


# --- Gestionnaire de Filtrage IP ---
@app.before_request
def limit_remote_addr():
    """Filtre les requêtes par IP en utilisant ProxyFix."""
    if request.path == '/ip-check': return None # Autoriser diagnostic

    # ProxyFix devrait avoir mis la bonne IP dans request.remote_addr
    client_ip = request.remote_addr

    if DEBUG_MODE:
        print(f"IP détectée par Flask (après ProxyFix): {client_ip}")
        print(f"Headers reçus: {dict(request.headers)}")


    if client_ip and ALLOWED_IPS: # Si liste non vide
        if 'ALL' in ALLOWED_IPS or '*' in ALLOWED_IPS: # Autoriser tout si 'ALL' ou '*'
             if DEBUG_MODE: print(f"Accès autorisé pour {client_ip} (via ALL/*)")
             return None
        if client_ip in ALLOWED_IPS:
             if DEBUG_MODE: print(f"Accès autorisé pour {client_ip} (IP listée)")
             return None
        else:
            print(f"Accès REFUSÉ pour l'IP: {client_ip}. Non listée dans ALLOWED_IPS.")
            # Retourner une erreur 403 Forbidden
            # Utiliser abort(403) est plus standard
            abort(403, description=f"Accès refusé depuis l'adresse IP {client_ip}.")
            # return jsonify({"error": f"Accès refusé depuis l'adresse IP {client_ip}."}), 403

    # Si ALLOWED_IPS est vide, autoriser tout le monde (comportement par défaut)
    elif not ALLOWED_IPS:
         if DEBUG_MODE: print(f"Accès autorisé pour {client_ip} (ALLOWED_IPS vide)")
         return None
    # Si pas d'IP détectée (très rare avec ProxyFix), refuser par sécurité ?
    elif not client_ip:
        print("Accès REFUSÉ: Impossible de déterminer l'adresse IP du client.")
        abort(403, description="Impossible de déterminer l'adresse IP du client.")

    # Cas par défaut (ne devrait pas être atteint si la logique ci-dessus est complète)
    return None
# --- Fin Filtrage IP ---

# --- Routes Flask ---
@app.route('/')
@app.route('/<path:subpath>') # Capture tout chemin (ex: /canigou, /autre/page)
def index(subpath=None):
    """Sert la page HTML principale pour toutes les routes non API."""
    # Le JavaScript (`app.js`) lira l'URL (`window.location.pathname`)
    # pour déterminer le contexte (salle spécifique ou toutes).
    return render_template('index.html')

@app.route('/meetings.json')
def get_meetings_json():
    """Sert le fichier JSON des réunions avec cache-busting."""
    if not os.path.exists(MEETINGS_FILE):
        print(f"Fichier {MEETINGS_FILE} non trouvé lors de la requête.")
        # Générer une mise à jour immédiate peut être trop long pour une requête
        # Il est préférable de retourner 404 et laisser le front gérer
        return jsonify({"error": "Le fichier des réunions n'est pas encore généré."}), 404

    # Vérifier si le fichier est très récent, sinon attendre le thread ou forcer?
    # Pour simplifier, on sert ce qui est disponible. Le thread met à jour en arrière-plan.

    try:
        response = send_from_directory(
            os.path.dirname(__file__), # Cherche dans le dossier courant du script .py
            MEETINGS_FILE,
            mimetype='application/json'
        )
        # Headers pour désactiver le cache navigateur
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        return response
    except FileNotFoundError:
         print(f"Erreur interne: {MEETINGS_FILE} non trouvé par send_from_directory.")
         return jsonify({"error": "Fichier des réunions introuvable."}), 404

# API pour créer une réunion
@app.route('/api/create-meeting', methods=['POST'])
def api_create_meeting():
    """Crée un événement dans le calendrier Graph API."""
    data = request.json
    if not data: return jsonify({'error': "Données JSON manquantes"}), 400

    required = ['title', 'start', 'end', 'room'] # 'room' est le nom de la salle
    if not all(field in data and data[field] for field in required):
        return jsonify({'error': f"Champs requis manquants: {', '.join(required)}"}), 400

    room_name = data['room']
    room_email = SALLES.get(room_name) # Trouver l'email correspondant au nom
    if not room_email:
         # Essayer une recherche insensible à la casse
         for name, email in SALLES.items():
             if name.lower() == room_name.lower():
                 room_email = email
                 break
         if not room_email:
            return jsonify({'error': f"Salle '{room_name}' inconnue ou non configurable."}), 400

    organizer = AZURE_CONFIG.get('OrganizerUser')
    if not organizer:
         return jsonify({'error': "Organisateur de réunion non configuré sur le serveur."}), 500

    token = get_token()
    if not token: return jsonify({'error': "Erreur d'authentification serveur."}), 500

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # Participants: la salle + ceux fournis
    attendees = []
    attendees.append({"emailAddress": {"address": room_email}, "type": "resource"})

    participants_input = data.get('participants', [])
    salle_emails_lower = [email.lower() for email in SALLES.values()]
    for email_str in participants_input:
        email_clean = email_str.strip().lower()
        if email_clean and '@' in email_clean and email_clean != room_email.lower() and email_clean not in salle_emails_lower:
            attendees.append({"emailAddress": {"address": email_clean}, "type": "required"})

    event_payload = {
        "subject": data['title'],
        "start": {"dateTime": data['start'], "timeZone": "Europe/Paris"},
        "end": {"dateTime": data['end'], "timeZone": "Europe/Paris"},
        "location": {"displayName": room_name}, # Nom de la salle pour l'affichage
        "attendees": attendees,
        "isOnlineMeeting": True,
        "onlineMeetingProvider": "teamsForBusiness",
        "allowNewTimeProposals": False # Désactiver suggestion nouvelle heure
    }

    if DEBUG_MODE: print(f"Payload création réunion: {json.dumps(event_payload, indent=2)}")

    try:
        # Créer l'événement dans le calendrier de l'ORGANISATEUR configuré
        url = f"https://graph.microsoft.com/v1.0/users/{organizer}/calendar/events"
        response = requests.post(url, headers=headers, json=event_payload, timeout=20)

        if response.status_code >= 400:
            error_details = response.text
            print(f"Erreur API Graph ({response.status_code}): {error_details}")
            # Essayer de parser l'erreur pour un message plus clair
            try:
                error_json = response.json()
                message = error_json.get('error', {}).get('message', error_details)
            except json.JSONDecodeError:
                message = error_details
            return jsonify({'error': f"Erreur création via API: {message}"}), response.status_code

        created_event = response.json()
        join_url = extract_join_url(created_event) # Ré-extraire l'URL

        # Forcer une mise à jour pour que la nouvelle réunion apparaisse rapidement
        threading.Thread(target=lambda: (time.sleep(2), update_all_meetings_file())).start()


        return jsonify({
            'success': True,
            'meetingId': created_event.get('id'),
            'joinUrl': join_url,
            'subject': created_event.get('subject'),
            'start': created_event.get('start', {}).get('dateTime'),
            'end': created_event.get('end', {}).get('dateTime'),
            'room': room_name
        }), 201 # Status 201 Created

    except requests.exceptions.RequestException as e:
        print(f"Erreur réseau lors création réunion: {e}")
        return jsonify({'error': f"Erreur réseau: {e}"}), 500
    except Exception as e:
        print(f"Erreur inattendue lors création réunion: {e}")
        return jsonify({'error': f"Erreur serveur inattendue: {e}"}), 500


# Route de diagnostic IP (inchangée, très utile)
@app.route('/ip-check')
def ip_check():
    client_ip = request.remote_addr
    headers = dict(request.headers)
    html = f"""
    <!DOCTYPE html><html><head><title>Diagnostic IP</title><style>body{{font-family: sans-serif;}} pre{{background:#eee; padding:10px;}} .ip{{color:red; font-weight:bold;}}</style></head><body>
    <h1>Diagnostic IP</h1><p>Votre IP détectée par le serveur (après ProxyFix) : <strong class="ip">{client_ip}</strong></p>
    <p>Si cette IP n'est pas correcte, vérifiez la configuration de ProxyFix et les headers transmis par votre proxy/load balancer.</p>
    <h2>Configuration ALLOWED_IPS actuelle :</h2><pre>{json.dumps(ALLOWED_IPS, indent=2)}</pre>
    <h2>Headers HTTP Reçus :</h2><pre>{json.dumps(headers, indent=2)}</pre>
    </body></html>
    """
    return Response(html, mimetype='text/html')
# --- Fin Routes Flask ---

# --- Exécution Principale ---
if __name__ == '__main__':
    # Lancer le thread de mise à jour en arrière-plan
    print("Démarrage du thread de mise à jour en arrière-plan...")
    updater_thread = threading.Thread(target=background_updater, daemon=True)
    updater_thread.start()

    # Déterminer le port (pour Render ou local)
    port = int(os.environ.get('PORT', 5000)) # 5000 par défaut pour le local
    print(f"Lancement de l'application Flask sur host=0.0.0.0, port={port}")

    # Lancer l'application Flask
    # Mettre debug=False pour la production
    app.run(host='0.0.0.0', port=port, debug=False)
# --- Fin Exécution ---
