from flask import Flask, send_file, jsonify
from apscheduler.schedulers.background import BackgroundScheduler
import time
import configparser
import requests
import json
import os
from datetime import datetime, timedelta
import threading

app = Flask(__name__)
config = configparser.ConfigParser()
config.read('config.ini')

# Mapper les salles
SALLES = dict(config.items('SALLES'))
MEETINGS_FILE = 'meetings.json'

def get_token():
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
    
    response = requests.post(url, data=data)
    return response.json().get('access_token')

def update_meetings(salle_email):
    token = get_token()
    headers = {'Authorization': f'Bearer {token}'}
    
    now = datetime.utcnow()
    start = (now - timedelta(hours=1)).isoformat() + 'Z'
    end = (now + timedelta(hours=2)).isoformat() + 'Z'
    
    url = f"https://graph.microsoft.com/v1.0/users/{salle_email}/calendarview?startDateTime={start}&endDateTime={end}"
    
    try:
        response = requests.get(url, headers=headers)
        meetings = response.json().get('value', [])
        
        # Traitement des réunions...
        processed = []
        for meeting in meetings:
            if meeting.get('isCancelled', False):
                continue
                
            processed.append({
                'Subject': meeting['subject'],
                'Start': meeting['start']['dateTime'],
                'End': meeting['end']['dateTime'],
                'IsOnline': meeting['isOnlineMeeting'],
                'JoinUrl': meeting.get('onlineMeeting', {}).get('joinUrl', ''),
                'Attendees': [a['emailAddress']['address'] for a in meeting.get('attendees', [])]
            })
        
        with open(MEETINGS_FILE, 'w') as f:
            json.dump(processed, f)
            
    except Exception as e:
        print(f"Erreur de mise à jour : {str(e)}")

def background_updater():
    while True:
        for salle, email in SALLES.items():
            update_meetings(email)
        time.sleep(10)

# Démarrer le thread de mise à jour
thread = threading.Thread(target=background_updater)
thread.daemon = True
thread.start()

@app.route('/')
def serve_index():
    return send_file('index.html')

@app.route('/<salle>')
def serve_salle(salle):
    return send_file('index.html')

@app.route('/meetings.json')
def get_meetings():
    with open(MEETINGS_FILE, 'r') as f:
        return jsonify(json.load(f))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))