#!/usr/bin/env python
# -*- coding: utf-8 -*-

import ctypes
import sys
import os
import subprocess
import time
import hashlib
import json
import tempfile
import textwrap
import shutil
import stat
from datetime import datetime
from urllib.parse import quote  # Pour encoder l'e-mail

def is_admin():
    """
    Vérifie si le script est lancé en tant qu'administrateur sous Windows.
    """
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except Exception:
        return False

# ---------------------------------------------------------------------------
# GESTION DE L'ELEVATION (pour éviter les boucles en EXE)
# ---------------------------------------------------------------------------
if not is_admin():
    # Si on est déjà dans un exécutable "gelé" (PyInstaller), on ne relance pas pour éviter la boucle.
    if getattr(sys, 'frozen', False):
        pass
    elif "--elevated" not in sys.argv:
        # On relance en mode admin
        params = " ".join(sys.argv[1:]) + " --elevated"
        ctypes.windll.shell32.ShellExecuteW(
            None, "runas", sys.executable, f'"{sys.argv[0]}" {params}', None, 1
        )
        sys.exit()

# ---------------------------------------------------------------------------
# FONCTION pour forcer la suppression d'un dossier (y compris fichiers verrouillés)
# ---------------------------------------------------------------------------
def force_remove(path):
    def onerror(func, path, exc_info):
        try:
            os.chmod(path, stat.S_IWRITE)
            func(path)
        except Exception as e:
            print(f"Erreur lors de la modification des permissions pour {path}: {e}")
    shutil.rmtree(path, onerror=onerror)

# ---------------------------------------------------------------------------
# INSTALLATION AUTOMATIQUE DES MODULES MANQUANTS
# ---------------------------------------------------------------------------
NEEDED_MODULES = ["requests", "ttkbootstrap", "certbot", "cryptography", "pyOpenSSL"]
missing_modules = []
for mod in NEEDED_MODULES:
    try:
        __import__(mod)
    except ImportError:
        missing_modules.append(mod)

if missing_modules:
    print(f"Modules Python manquants : {missing_modules}")
    print("Tentative d'installation via pip...")
    pip_cmd = [sys.executable, "-m", "pip", "install"] + missing_modules
    try:
        subp = subprocess.run(pip_cmd, check=False, capture_output=True, text=True)
        print(subp.stdout)
        print(subp.stderr)
        if subp.returncode != 0:
            print("Échec de l'installation automatique. Veuillez installer ces modules manuellement.")
    except Exception as e:
        print("Impossible d'installer les modules manquants :", e)

# ---------------------------------------------------------------------------
# IMPORTS APRES INSTALLATION
# ---------------------------------------------------------------------------
try:
    import requests
    import ttkbootstrap as ttkb
    from ttkbootstrap.constants import *
    from ttkbootstrap.scrolled import ScrolledText
    from ttkbootstrap.tooltip import ToolTip
    from cryptography import x509
    from cryptography.hazmat.backends import default_backend
except ImportError as e:
    print("Certains modules sont toujours introuvables. Veuillez installer manuellement : requests, ttkbootstrap, certbot, cryptography, pyOpenSSL.")
    sys.exit(1)

# ---------------------------------------------------------------------------
# CONFIGURATION PAR DEFAUT
# ---------------------------------------------------------------------------
OVH_APP_KEY = "b60648acbb77fc66"
OVH_APP_SECRET = "59df49d4bf93e1631d2b58e425bd103c"
OVH_CONSUMERKEY = "0f03673124bf62ef48bede4d3addf175"

MAIN_DOMAIN = "salle.anecoop-france.com"
DEFAULT_HEROKU_APP = "teamsrooms"

MEETING_ROOMS = [
    "Canigou", "Castillet", "Florensud", "Mallorca",
    "Mimosa", "Pivoine", "Renoncule", "Tramontane"
]

# Chemin local par défaut vers le dépôt
DEFAULT_GITHUB_REPO = "https://github.com/kaizen2025/teamsrooms.git"
DEFAULT_LOCAL_PATH = r"C:\teamsrooms"  # Pour éviter d’avoir "C:\teamsrooms\teamsrooms"

OVH_ENDPOINT = "https://eu.api.ovh.com/1.0"

# Identifiants Heroku
HEROKU_EMAIL   = "kevin.bivia@gmail.com"
HEROKU_API_KEY = "HRKU-0292b207-4833-4251-a822-2f6b2fabbbe4"

# ---------------------------------------------------------------------------
# CLASSE PRINCIPALE DE L'APPLICATION
# ---------------------------------------------------------------------------
class AllInOneManager(ttkb.Window):
    def __init__(self):
        # On choisit un thème plus moderne (ex: flatly). Vous pouvez essayer: 'pulse', 'journal', 'litera', etc.
        super().__init__(themename="flatly")
        self.title("All-in-One Manager - OVH/Certbot/Heroku/Git/Kiosk")
        self.geometry("1200x800")

        # Variables OVH
        self.ovh_app_key       = ttkb.StringVar(value=OVH_APP_KEY)
        self.ovh_app_secret    = ttkb.StringVar(value=OVH_APP_SECRET)
        self.ovh_consumerkey   = ttkb.StringVar(value=OVH_CONSUMERKEY)
        # Laisser "votre_service" si vous n'utilisez pas l'API OVH pour les certificats
        self.ovh_hosting_service = ttkb.StringVar(value="votre_service")

        # Variables Kiosk / Salles
        self.selected_room = ttkb.StringVar(value="Tramontane")
        self.heroku_app_var = ttkb.StringVar(value=DEFAULT_HEROKU_APP)

        # Variables Git
        self.github_repo_url = ttkb.StringVar(value=DEFAULT_GITHUB_REPO)
        self.local_repo_path = ttkb.StringVar(value=DEFAULT_LOCAL_PATH)

        # Chemin Chrome
        self.chrome_path = ttkb.StringVar(value=r"C:\Program Files\Google\Chrome\Application\chrome.exe")
        self.kiosk_task_name = ttkb.StringVar(value="ChromeKiosk")

        # Domaine SSL
        self.ssl_domain = ttkb.StringVar(value=MAIN_DOMAIN)

        # Labels de statut
        self.certbot_status = "Inconnu"
        self.ssl_status = "N/A"

        # Création des onglets et widgets
        self.create_widgets()
        # Vérification de certbot après un court délai
        self.after(300, self.ensure_certbot_installed)

    # ----------------------------------------------------------------
    # Création de tous les onglets
    # ----------------------------------------------------------------
    def create_widgets(self):
        self.notebook = ttkb.Notebook(self, padding=10)
        self.notebook.pack(fill=BOTH, expand=YES)

        tab_dashboard = ttkb.Frame(self.notebook)
        tab_config = ttkb.Frame(self.notebook)
        tab_ssl = ttkb.Frame(self.notebook)
        tab_git = ttkb.Frame(self.notebook)
        tab_kiosk = ttkb.Frame(self.notebook)

        self.notebook.add(tab_dashboard, text="Dashboard")
        self.notebook.add(tab_config,    text="Configuration")
        self.notebook.add(tab_ssl,       text="SSL & Heroku")
        self.notebook.add(tab_git,       text="GitHub & Heroku")
        self.notebook.add(tab_kiosk,     text="Chrome Kiosk")

        # Onglets
        self.build_dashboard_tab(tab_dashboard)
        self.build_config_tab(tab_config)
        self.build_ssl_tab(tab_ssl)
        self.build_git_tab(tab_git)
        self.build_kiosk_tab(tab_kiosk)

        # Zone de logs en bas de la fenêtre
        self.log_box = ScrolledText(self, autohide=True, padding=10, height=8)
        self.log_box.pack(fill=BOTH, expand=YES, padx=10, pady=5)

    # ----------------------------------------------------------------
    # TAB : Dashboard (amélioré)
    # ----------------------------------------------------------------
    def build_dashboard_tab(self, parent):
        # Frame principal pour l'onglet
        main_frame = ttkb.Frame(parent)
        main_frame.pack(fill=BOTH, expand=YES)

        # Titre de la page
        lbl_title = ttkb.Label(
            main_frame,
            text="All-in-One Manager - Tableau de bord",
            bootstyle="inverse-primary",    # Couleur de fond (thème bootstrap)
            font="-size 16 -weight bold"
        )
        lbl_title.pack(fill=X, padx=10, pady=10)

        # ----------------------------------------------------------------
        # Frame du haut (regroupe le statut et les actions rapides côte à côte)
        # ----------------------------------------------------------------
        top_frame = ttkb.Frame(main_frame)
        top_frame.pack(fill=X, padx=10, pady=(0, 10))

        # ----------------------------------------------------------------
        # Section Statut actuel
        # ----------------------------------------------------------------
        status_frame = ttkb.Labelframe(top_frame, text="Statut actuel", padding=10, bootstyle="info")
        status_frame.pack(side=LEFT, fill=BOTH, expand=YES, padx=(0, 10))

        self.lbl_certbot_status = ttkb.Label(status_frame, text="Certbot : Inconnu", font="-size 10")
        self.lbl_certbot_status.pack(anchor="w", padx=5, pady=5)

        self.lbl_ssl_status = ttkb.Label(status_frame, text="SSL : N/A", font="-size 10")
        self.lbl_ssl_status.pack(anchor="w", padx=5, pady=5)

        # ----------------------------------------------------------------
        # Section Actions rapides (en grille)
        # ----------------------------------------------------------------
        actions_frame = ttkb.Labelframe(top_frame, text="Actions rapides", padding=10, bootstyle="secondary")
        actions_frame.pack(side=LEFT, fill=BOTH, expand=YES)

        # On place les boutons en grille pour un rendu plus propre
        btn_check_ssl = ttkb.Button(actions_frame, text="Vérifier SSL", command=self.check_expiration)
        btn_check_ssl.grid(row=0, column=0, padx=5, pady=5, sticky="ew")
        ToolTip(btn_check_ssl, text="Vérifie la date d'expiration du certificat (via OVH API ou SSL)")

        btn_renew_ssl = ttkb.Button(actions_frame, text="Renouveler SSL", command=self.run_renewal)
        btn_renew_ssl.grid(row=0, column=1, padx=5, pady=5, sticky="ew")
        ToolTip(btn_renew_ssl, text="Renouvelle le certificat Let’s Encrypt via DNS OVH")

        btn_deploy_heroku = ttkb.Button(actions_frame, text="Déployer Cert Heroku", command=self.deploy_heroku)
        btn_deploy_heroku.grid(row=1, column=0, padx=5, pady=5, sticky="ew")
        ToolTip(btn_deploy_heroku, text="Déploie le certificat sur une application Heroku")

        btn_pull = ttkb.Button(actions_frame, text="Git Pull", command=self.git_pull)
        btn_pull.grid(row=1, column=1, padx=5, pady=5, sticky="ew")
        ToolTip(btn_pull, text="Récupère les dernières modifications du dépôt Git local")

        btn_push = ttkb.Button(actions_frame, text="Git Push", command=self.git_push)
        btn_push.grid(row=2, column=0, padx=5, pady=5, sticky="ew")
        ToolTip(btn_push, text="Envoie les modifications locales vers GitHub et Heroku")

        btn_kiosk = ttkb.Button(actions_frame, text="Kiosk Task", command=self.create_kiosk_task)
        btn_kiosk.grid(row=2, column=1, padx=5, pady=5, sticky="ew")
        ToolTip(btn_kiosk, text="Crée ou met à jour la tâche planifiée pour le mode Kiosk Chrome")

        btn_start_server = ttkb.Button(actions_frame, text="Serveur Python", command=self.start_local_server)
        btn_start_server.grid(row=3, column=0, padx=5, pady=5, sticky="ew")
        ToolTip(btn_start_server, text="Lance 'app.py' dans le répertoire local")

        btn_open_page = ttkb.Button(actions_frame, text="Ouvrir Page Salle", command=self.open_local_page)
        btn_open_page.grid(row=3, column=1, padx=5, pady=5, sticky="ew")
        ToolTip(btn_open_page, text="Ouvre la salle sélectionnée (http://127.0.0.1:5000/<salle>)")

        # Permet d'étendre chaque colonne de manière égale
        actions_frame.grid_columnconfigure(0, weight=1)
        actions_frame.grid_columnconfigure(1, weight=1)

        # ----------------------------------------------------------------
        # Label d'information ou d'instructions
        # ----------------------------------------------------------------
        info_label = ttkb.Label(
            main_frame,
            text=(
                "Gérez OVH (DNS & Certbot), Heroku, GitHub & Heroku, et Chrome Kiosk.\n"
                "Utilisez les onglets ci-dessus pour plus de détails et de configuration."
            ),
            font="-size 10"
        )
        info_label.pack(fill=X, padx=10, pady=10)

    # ----------------------------------------------------------------
    # TAB : Configuration
    # ----------------------------------------------------------------
    def build_config_tab(self, parent):
        frame = ttkb.Frame(parent, padding=10)
        frame.pack(fill=BOTH, expand=YES)

        lbl = ttkb.Label(frame, text="Configuration OVH (DNS - Certbot)", font="-size 11 -weight bold")
        lbl.pack(anchor='w', pady=(5,2))

        ovh_frm = ttkb.Frame(frame)
        ovh_frm.pack(anchor='w', pady=5)
        ttkb.Label(ovh_frm, text="OVH App Key:").pack(side=LEFT, padx=5)
        ttkb.Entry(ovh_frm, textvariable=self.ovh_app_key, width=40).pack(side=LEFT, padx=5)

        ovh_frm2 = ttkb.Frame(frame)
        ovh_frm2.pack(anchor='w', pady=5)
        ttkb.Label(ovh_frm2, text="OVH App Secret:").pack(side=LEFT, padx=5)
        ttkb.Entry(ovh_frm2, textvariable=self.ovh_app_secret, width=40).pack(side=LEFT, padx=5)

        ovh_frm3 = ttkb.Frame(frame)
        ovh_frm3.pack(anchor='w', pady=5)
        ttkb.Label(ovh_frm3, text="OVH Consumer Key:").pack(side=LEFT, padx=5)
        ttkb.Entry(ovh_frm3, textvariable=self.ovh_consumerkey, width=40).pack(side=LEFT, padx=5)

        ovh_frm4 = ttkb.Frame(frame)
        ovh_frm4.pack(anchor='w', pady=5)
        ttkb.Label(ovh_frm4, text="OVH Hosting Service:").pack(side=LEFT, padx=5)
        ttkb.Entry(ovh_frm4, textvariable=self.ovh_hosting_service, width=40).pack(side=LEFT, padx=5)

        ttkb.Label(frame, text="Sélection de la salle:", font="-size 11 -weight bold").pack(anchor='w', pady=(10,2))
        combo = ttkb.Combobox(frame, textvariable=self.selected_room, values=MEETING_ROOMS, state="readonly")
        combo.pack(anchor='w', padx=10, pady=5)

        ttkb.Label(frame, text="Nom de l'application Heroku:", font="-size 11 -weight bold").pack(anchor='w', pady=(10,2))
        ttkb.Entry(frame, textvariable=self.heroku_app_var, width=30).pack(anchor='w', padx=10, pady=5)

    # ----------------------------------------------------------------
    # TAB : SSL & Heroku
    # ----------------------------------------------------------------
    def build_ssl_tab(self, parent):
        frame = ttkb.Frame(parent, padding=10)
        frame.pack(fill=BOTH, expand=YES)
        ttkb.Label(frame, text="Gestion du certificat Let’s Encrypt (DNS OVH) et déploiement sur Heroku", font="-size 11 -weight bold").pack(anchor='w', pady=5)

        ssl_frm = ttkb.Frame(frame)
        ssl_frm.pack(anchor='w', pady=5)
        ttkb.Label(ssl_frm, text="Domaine SSL:").pack(side=LEFT, padx=5)
        ttkb.Entry(ssl_frm, textvariable=self.ssl_domain, width=40).pack(side=LEFT, padx=5)

        ttkb.Button(frame, text="Vérifier Expiration SSL", command=self.check_expiration).pack(anchor='w', pady=5)
        ttkb.Button(frame, text="Renouveler Certificat (DNS-01)", command=self.run_renewal).pack(anchor='w', pady=5)
        ttkb.Button(frame, text="Déployer Cert sur Heroku", command=self.deploy_heroku).pack(anchor='w', pady=5)

    # ----------------------------------------------------------------
    # TAB : GitHub & Heroku
    # ----------------------------------------------------------------
    def build_git_tab(self, parent):
        frame = ttkb.Frame(parent, padding=10)
        frame.pack(fill=BOTH, expand=YES)
        ttkb.Label(frame, text="Gestion du dépôt GitHub et déploiement vers Heroku", font="-size 11 -weight bold").pack(anchor='w', pady=5)

        ttkb.Label(frame, text="URL du repo GitHub:").pack(anchor='w', pady=2)
        ttkb.Entry(frame, textvariable=self.github_repo_url, width=70).pack(anchor='w', padx=15, pady=2)

        ttkb.Label(frame, text="Dossier local pour GitHub/Heroku:").pack(anchor='w', pady=2)
        ttkb.Entry(frame, textvariable=self.local_repo_path, width=70).pack(anchor='w', padx=15, pady=2)

        ttkb.Label(frame, text=(
            "Clone: télécharge le dépôt GitHub pour la première fois\n"
            "Pull: récupère les dernières modifications distantes\n"
            "Push: envoie vos modifications locales vers GitHub et Heroku\n"
            "Clone Heroku: récupère le code de l'app Heroku en local"
        )).pack(anchor='w', pady=10)

        bf = ttkb.Frame(frame)
        bf.pack(anchor='w', pady=5)
        ttkb.Button(bf, text="Cloner Repo GitHub", command=self.git_clone).pack(side=LEFT, padx=5)
        ttkb.Button(bf, text="Pull (GitHub)", command=self.git_pull).pack(side=LEFT, padx=5)
        ttkb.Button(bf, text="Push (GitHub + Heroku)", command=self.git_push).pack(side=LEFT, padx=5)
        ttkb.Button(bf, text="Cloner Heroku", command=self.heroku_clone).pack(side=LEFT, padx=5)

    # ----------------------------------------------------------------
    # TAB : Chrome Kiosk
    # ----------------------------------------------------------------
    def build_kiosk_tab(self, parent):
        frame = ttkb.Frame(parent, padding=10)
        frame.pack(fill=BOTH, expand=YES)
        ttkb.Label(frame, text="Chrome Kiosk (Tâche planifiée)", font="-size 11 -weight bold").pack(anchor='w', pady=5)

        ttkb.Label(frame, text="Chemin Chrome (chrome.exe):").pack(anchor='w', pady=2)
        ttkb.Entry(frame, textvariable=self.chrome_path, width=70).pack(anchor='w', padx=15, pady=2)

        ttkb.Label(frame, text="Nom de la tâche:").pack(anchor='w', pady=2)
        ttkb.Entry(frame, textvariable=self.kiosk_task_name, width=30).pack(anchor='w', padx=15, pady=2)

        ttkb.Label(frame, text=(
            "Au logon, Chrome s'ouvrira en mode app (sans barre d'adresse ni onglets) et enverra la touche F11 pour passer en plein écran.\n"
            "Si le plein écran n'apparaît pas, vous pouvez augmenter le délai dans le script VBScript généré."
        )).pack(anchor='w', pady=10)

        ttkb.Button(frame, text="Créer Tâche Planifiée", command=self.create_kiosk_task).pack(anchor='w', padx=15, pady=5)

    # ----------------------------------------------------------------
    # LOG
    # ----------------------------------------------------------------
    def log(self, msg):
        self.log_box.insert("end", msg + "\n")
        self.log_box.see("end")
        self.log_box.update_idletasks()

    # ----------------------------------------------------------------
    # Vérification de certbot
    # ----------------------------------------------------------------
    def ensure_certbot_installed(self):
        self.log("Vérification de certbot...")
        cmd = ["certbot", "--version"]
        try:
            proc = subprocess.run(cmd, capture_output=True, text=True)
            if proc.returncode == 0:
                version_str = proc.stdout.strip()
                self.log(f"Certbot déjà présent : {version_str}")
                self.certbot_status = version_str
                self.lbl_certbot_status.configure(text=f"Certbot : {version_str}")
            else:
                self.log("Installation via pip (certbot)...")
                p2 = subprocess.run([sys.executable, "-m", "pip", "install", "certbot"], capture_output=True, text=True)
                self.log(p2.stdout)
                self.log(p2.stderr)
                self.certbot_status = "Installation terminée (vérifier logs)"
                self.lbl_certbot_status.configure(text="Certbot : installation en cours...")
        except FileNotFoundError:
            self.log("certbot introuvable, pip introuvable ? Installation manuelle requise.")
            self.certbot_status = "Introuvable"
            self.lbl_certbot_status.configure(text="Certbot : Introuvable")

    # ----------------------------------------------------------------
    # Requête signée OVH
    # ----------------------------------------------------------------
    def ovh_signed_request(self, method, path, body=None):
        ak = self.ovh_app_key.get().strip()
        asec = self.ovh_app_secret.get().strip()
        ckey = self.ovh_consumerkey.get().strip()
        if not (ak and asec and ckey):
            self.log("❌ Clés OVH incomplètes. Impossible de signer la requête.")
            return None

        body_str = json.dumps(body, separators=(',', ':')) if body else ""
        try:
            resp_time = requests.get(OVH_ENDPOINT + "/auth/time", timeout=5)
            server_time = int(resp_time.text.strip())
        except Exception:
            server_time = int(time.time())

        url = OVH_ENDPOINT + path
        to_sign = asec + "+" + ckey + "+" + method.upper() + "+" + url + "+" + body_str + "+" + str(server_time)
        sha = hashlib.sha1(to_sign.encode('utf-8')).hexdigest()
        signature = "$1$" + sha

        headers = {
            "X-Ovh-Application": ak,
            "X-Ovh-Consumer": ckey,
            "X-Ovh-Signature": signature,
            "X-Ovh-Timestamp": str(server_time),
            "Content-Type": "application/json"
        }

        try:
            if method.upper() == "GET":
                r = requests.get(url, headers=headers, timeout=10)
            elif method.upper() == "POST":
                r = requests.post(url, headers=headers, data=body_str, timeout=10)
            elif method.upper() == "DELETE":
                r = requests.delete(url, headers=headers, timeout=10)
            else:
                r = requests.request(method.upper(), url, headers=headers, data=body_str, timeout=10)
            return r
        except requests.RequestException as e:
            self.log(f"Erreur requête OVH signée: {e}")
            return None

    # ----------------------------------------------------------------
    # Vérification Expiration SSL
    # ----------------------------------------------------------------
    def check_expiration(self):
        domain = self.ssl_domain.get().strip()
        hosting_service = self.ovh_hosting_service.get().strip()

        if hosting_service == "votre_service" or hosting_service == "":
            self.log("Aucun service OVH configuré, utilisation de la vérification via SSL.")
            self.check_expiration_remote()
            return

        api_path = f"/hosting/web/{hosting_service}/ssl/domains/{domain}"
        self.log(f"Vérification du certificat pour {domain} via OVH API (Service: {hosting_service})")
        response = self.ovh_signed_request("GET", api_path)
        if response is None:
            self.log("❌ Erreur lors de l'appel OVH API.")
            self.ssl_status = "Erreur"
            self.lbl_ssl_status.configure(text="SSL : Erreur API")
            return
        if response.status_code != 200:
            self.log(f"❌ Erreur OVH API : Code {response.status_code}, {response.text}")
            self.ssl_status = "Erreur"
            self.lbl_ssl_status.configure(text=f"SSL : Erreur ({response.status_code})")
            return

        try:
            data = response.json()
            valid_until_str = data.get("certificateValidUntil")
            if not valid_until_str:
                self.log("❌ La date d'expiration n'est pas disponible dans la réponse OVH API.")
                self.ssl_status = "Erreur"
                self.lbl_ssl_status.configure(text="SSL : Date exp. manquante")
                return
            expiration_date = datetime.strptime(valid_until_str, "%Y-%m-%dT%H:%M:%S")
            days_remaining = (expiration_date - datetime.now()).days
            msg = f"✅ Certificat pour {domain} expire le {expiration_date.strftime('%Y-%m-%d %H:%M:%S')} ({days_remaining} jours restants)"
            self.log(msg)
            self.ssl_status = f"OK - {days_remaining} j restants"
            self.lbl_ssl_status.configure(text=f"SSL : {days_remaining} jours restant(s)")
        except Exception as e:
            self.log(f"❌ Erreur lors du traitement de la réponse OVH API : {e}")
            self.ssl_status = "Erreur"
            self.lbl_ssl_status.configure(text="SSL : Erreur de traitement")

    def check_expiration_remote(self):
        """
        Vérification de l'expiration SSL sans passer par l'API OVH
        (en se connectant directement au port 443 du domaine).
        """
        domain = self.ssl_domain.get().strip()
        self.log(f"Vérification du certificat pour {domain} en se connectant en SSL...")

        try:
            import ssl
            import socket
            context = ssl.create_default_context()
            with socket.create_connection((domain, 443)) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as ssock:
                    der_cert = ssock.getpeercert(True)
            pem_cert = ssl.DER_cert_to_PEM_cert(der_cert)

            from OpenSSL import crypto
            cert = crypto.load_certificate(crypto.FILETYPE_PEM, pem_cert)
            notAfter = cert.get_notAfter().decode('ascii')
            expiration_date = datetime.strptime(notAfter, '%Y%m%d%H%M%SZ')
            days_remaining = (expiration_date - datetime.now()).days
            msg = f"✅ Certificat pour {domain} expire le {expiration_date.strftime('%Y-%m-%d %H:%M:%S')} ({days_remaining} jours restants)"
            self.log(msg)
            self.ssl_status = f"OK - {days_remaining} j restants"
            self.lbl_ssl_status.configure(text=f"SSL : {days_remaining} jours restant(s)")
        except Exception as e:
            self.log(f"❌ Erreur lors de la récupération du certificat via SSL : {e}")
            self.ssl_status = "Erreur"
            self.lbl_ssl_status.configure(text="SSL : Erreur de connexion")

    # ----------------------------------------------------------------
    # Renouvellement Certificat via Certbot (DNS OVH)
    # ----------------------------------------------------------------
    def run_renewal(self):
        domain = self.ssl_domain.get().strip()
        self.log(f"Renouvellement Certbot DNS pour {domain}...")
        temp_dir = tempfile.mkdtemp(prefix="ovh_dns_")
        auth_file = os.path.join(temp_dir, "ovh_auth.py")
        clean_file = os.path.join(temp_dir, "ovh_clean.py")

        ak = self.ovh_app_key.get().strip()
        ck = self.ovh_consumerkey.get().strip()

        auth_script = textwrap.dedent(f"""
            #!/usr/bin/env python
            import os, requests, sys
            AK="{ak}"
            CK="{ck}"
            endpoint="https://eu.api.ovh.com/1.0"
            domain="{domain}"
            val = os.getenv("CERTBOT_VALIDATION")
            headers = {{
                "X-Ovh-Application": "{ak}",
                "X-Ovh-Consumer": CK
            }}
            b = {{
                "fieldType": "TXT",
                "subDomain": "_acme-challenge." + domain.split('.')[0],
                "target": val,
                "ttl": 600
            }}
            r = requests.post(f"{{endpoint}}/domain/zone/{{domain.split('.', 1)[1]}}/record", json=b, headers=headers)
            if r.status_code not in (200,201):
                print("Auth-Hook error:", r.status_code, r.text)
                sys.exit(1)
            rid = r.json()["id"]
            with open("ovh_dns_record_id.txt","w") as f:
                f.write(str(rid))
            requests.post(f"{{endpoint}}/domain/zone/{{domain.split('.', 1)[1]}}/refresh", headers=headers)
        """)

        clean_script = textwrap.dedent(f"""
            import os, requests
            AK="{ak}"
            CK="{ck}"
            endpoint="https://eu.api.ovh.com/1.0"
            domain="{domain}"
            headers = {{
                "X-Ovh-Application": "{ak}",
                "X-Ovh-Consumer": CK
            }}
            if os.path.exists("ovh_dns_record_id.txt"):
                rid = open("ovh_dns_record_id.txt").read().strip()
                requests.delete(f"{{endpoint}}/domain/zone/{{domain.split('.', 1)[1]}}/record/{{rid}}", headers=headers)
                requests.post(f"{{endpoint}}/domain/zone/{{domain.split('.', 1)[1]}}/refresh", headers=headers)
        """)

        with open(auth_file, "w", encoding="utf-8") as f:
            f.write(auth_script)
        with open(clean_file, "w", encoding="utf-8") as f:
            f.write(clean_script)

        cmd = [
            "certbot", "certonly",
            "--manual",
            "--manual-auth-hook", auth_file,
            "--manual-cleanup-hook", clean_file,
            "--preferred-challenges", "dns",
            "--agree-tos",
            "--non-interactive",
            "--manual-public-ip-logging-ok",
            "-d", domain
        ]

        self.log("Commande Certbot: " + " ".join(cmd))
        try:
            p = subprocess.run(cmd, capture_output=True, text=True)
            self.log(p.stdout)
            self.log(p.stderr)
            if p.returncode == 0:
                self.log("✅ Renouvellement OK")
            else:
                self.log(f"❌ Echec (code {p.returncode}).")
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

    # ----------------------------------------------------------------
    # Déploiement du certificat sur Heroku
    # ----------------------------------------------------------------
    def deploy_heroku(self):
        domain = self.ssl_domain.get().strip()
        cert_path = os.path.join(r"C:\Certbot\live", domain, "fullchain.pem")
        key_path = os.path.join(r"C:\Certbot\live", domain, "privkey.pem")

        if not os.path.exists(cert_path) or not os.path.exists(key_path):
            self.log("❌ Certificat introuvable. Faites le renouvellement ?")
            return

        app_name = self.heroku_app_var.get().strip()
        cmd = ["heroku", "certs:add", cert_path, key_path, "--app", app_name]
        self.log("Commande Heroku : " + " ".join(cmd))
        p = subprocess.run(cmd, capture_output=True, text=True)
        self.log(p.stdout)
        self.log(p.stderr)
        if p.returncode == 0:
            self.log("✅ Certificat déployé sur Heroku.")
        else:
            self.log(f"❌ Echec (code {p.returncode}).")

    # ----------------------------------------------------------------
    # GIT : clone / pull / push / heroku_clone
    # ----------------------------------------------------------------
    def git_clone(self):
        url = self.github_repo_url.get().strip()
        path = self.local_repo_path.get().strip()
        self.log(f"Cloner {url} => {path}")

        if not url or not path:
            self.log("❌ URL ou chemin vide.")
            return
        if os.path.exists(path) and os.listdir(path):
            self.log("❌ Dossier non vide, annulation clone.")
            return

        os.makedirs(path, exist_ok=True)
        cmd = ["git", "clone", url, path]
        p = subprocess.run(cmd, capture_output=True, text=True)
        self.log(p.stdout)
        self.log(p.stderr)
        if p.returncode == 0:
            self.log("✅ Clone GitHub OK.")
        else:
            self.log(f"❌ Echec clone (code {p.returncode}).")

    def git_pull(self):
        path = self.local_repo_path.get().strip()
        self.log(f"Git Pull dans {path}")

        if not os.path.isdir(path):
            self.log("❌ Dossier introuvable.")
            return

        cmd = ["git", "-C", path, "pull"]
        p = subprocess.run(cmd, capture_output=True, text=True)
        self.log(p.stdout)
        self.log(p.stderr)
        if p.returncode == 0:
            self.log("✅ Pull OK.")
        else:
            self.log(f"❌ Echec pull (code {p.returncode}).")

    def git_push(self):
        path = self.local_repo_path.get().strip()
        self.log(f"Git Push depuis {path}")

        if not os.path.isdir(path):
            self.log("❌ Dossier introuvable.")
            return

        # git add .
        cmds = [
            ["git", "-C", path, "add", "."],
            ["git", "-C", path, "commit", "-m", "Update from AllInOneManager"],
            ["git", "-C", path, "push", "origin", "main"]
        ]

        for c in cmds:
            p = subprocess.run(c, capture_output=True, text=True)
            self.log(p.stdout)
            self.log(p.stderr)
            if p.returncode != 0:
                self.log(f"❌ Echec (code {p.returncode}) sur {' '.join(c)}")
                return

        # Vérifier si le remote heroku existe
        p_remote = subprocess.run(["git", "-C", path, "remote"], capture_output=True, text=True)
        remotes = p_remote.stdout.strip().splitlines()

        if "heroku" not in remotes:
            heroku_remote_url = f"https://git.heroku.com/{self.heroku_app_var.get().strip()}.git"
            self.log(f"Ajout du remote heroku ({heroku_remote_url})")
            p_add = subprocess.run(["git", "-C", path, "remote", "add", "heroku", heroku_remote_url], capture_output=True, text=True)
            self.log(p_add.stdout)
            self.log(p_add.stderr)
            if p_add.returncode != 0:
                self.log("❌ Echec lors de l'ajout du remote heroku.")
                return

        p_push = subprocess.run(["git", "-C", path, "push", "heroku", "main"], capture_output=True, text=True)
        self.log(p_push.stdout)
        self.log(p_push.stderr)
        if p_push.returncode != 0:
            self.log(f"❌ Echec push vers heroku (code {p_push.returncode}).")
            return

        self.log("✅ Push et déploiement GitHub & Heroku réussis!")

    def heroku_clone(self):
        """
        Clonage du code Heroku dans le même dossier local (évite de créer un sous-dossier).
        """
        app_name = self.heroku_app_var.get().strip()
        base_path = self.local_repo_path.get().strip()

        # On clone directement dans base_path
        repo_path = base_path
        self.log(f"Cloner Heroku app '{app_name}' => {repo_path}")

        if not app_name:
            self.log("❌ Nom de l'application Heroku manquant.")
            return
        if not base_path:
            self.log("❌ Chemin local manquant.")
            return

        # Si le dossier existe déjà, on le supprime pour un clone complet
        if os.path.exists(repo_path):
            try:
                force_remove(repo_path)
                self.log(f"Le dossier '{repo_path}' existant a été supprimé pour permettre un clone complet.")
            except Exception as e:
                self.log(f"❌ Erreur lors de la suppression du dossier '{repo_path}' : {e}")
                return

        os.makedirs(repo_path, exist_ok=True)

        # Encoder l'e-mail pour l'URL
        encoded_email = quote(HEROKU_EMAIL)
        heroku_url = f"https://{encoded_email}:{HEROKU_API_KEY}@git.heroku.com/{app_name}.git"

        cmd = ["git", "clone", heroku_url, repo_path]
        p = subprocess.run(cmd, capture_output=True, text=True)
        self.log(p.stdout)
        self.log(p.stderr)
        if p.returncode == 0:
            self.log("✅ Clone Heroku OK.")
        else:
            self.log(f"❌ Echec clone Heroku (code {p.returncode}).")

    # ----------------------------------------------------------------
    # TASK : Création de la tâche planifiée Kiosk
    # ----------------------------------------------------------------
    def create_kiosk_task(self):
        room = self.selected_room.get().lower()
        url = f"https://{MAIN_DOMAIN}/{room}"

        vbs_content = f'''Set WshShell = CreateObject("WScript.Shell")
WshShell.Run """{self.chrome_path.get().strip()}"" --profile-directory=Default --app={url}", 0, True
' Attendre 5 secondes pour être certain que Chrome est bien chargé
WScript.Sleep 5000
' Tenter d'activer la fenêtre Chrome
WshShell.AppActivate "salle.anecoop-france.com"
WScript.Sleep 500
' Envoyer F11 pour passer en plein écran
WshShell.SendKeys "{{F11}}"
'''

        script_dir = os.path.dirname(os.path.abspath(__file__))
        vbs_path = os.path.join(script_dir, "launchChromeKiosk.vbs")

        try:
            with open(vbs_path, "w", encoding="utf-8") as f:
                f.write(vbs_content)
            self.log(f"VBScript créé : {vbs_path}")
        except Exception as e:
            self.log(f"Erreur lors de la création du VBScript : {e}")
            return

        task_name = self.kiosk_task_name.get().strip()
        tr_command = f'"wscript.exe" "{vbs_path}"'

        schtasks_cmd = [
            "schtasks", "/create",
            "/tn", task_name,
            "/sc", "onlogon",
            "/tr", tr_command,
            "/rl", "HIGHEST",
            "/f"
        ]

        self.log("Création Tâche Planifiée : " + " ".join(schtasks_cmd))
        p = subprocess.run(schtasks_cmd, capture_output=True, text=True)
        self.log(p.stdout)
        self.log(p.stderr)
        if p.returncode == 0:
            self.log("✅ Tâche planifiée OK.")
        else:
            self.log(f"❌ Echec (code {p.returncode}).")

    # ----------------------------------------------------------------
    # NOUVELLES FONCTIONS : Lancer le serveur local et ouvrir la page
    # ----------------------------------------------------------------
    def start_local_server(self):
        """
        Lance 'app.py' dans le dossier local (si présent).
        """
        path = self.local_repo_path.get().strip()
        app_path = os.path.join(path, "app.py")

        if not os.path.isfile(app_path):
            self.log(f"❌ 'app.py' introuvable dans {path}")
            return

        self.log(f"Lancement du serveur Python: {app_path}")
        try:
            # On lance en arrière-plan
            subprocess.Popen([sys.executable, app_path], cwd=path, shell=True)
            self.log("✅ Serveur lancé (vérifiez la console).")
        except Exception as e:
            self.log(f"❌ Erreur lors du lancement du serveur : {e}")

    def open_local_page(self):
        """
        Ouvre la page locale de la salle sélectionnée, ex: http://127.0.0.1:5000/tramontane
        """
        room = self.selected_room.get().lower()
        url = f"http://127.0.0.1:5000/{room}"
        self.log(f"Ouverture de la page: {url}")
        import webbrowser
        webbrowser.open(url)

# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------
def main():
    try:
        app = AllInOneManager()
        app.mainloop()
    except Exception as e:
        try:
            import tkinter as tk
            from tkinter import messagebox
            root = tk.Tk()
            root.withdraw()
            messagebox.showerror("Erreur", str(e))
        except Exception:
            print("Erreur:", e)
        input("Appuyez sur Entrée pour quitter...")

if __name__ == "__main__":
    main()
