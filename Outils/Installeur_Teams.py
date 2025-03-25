#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Gestionnaire All-in-One pour Render/GitHub/Kiosk
Permet de gérer les déploiements, synchroniser avec GitHub et configurer le mode kiosk.
"""

import ctypes
import sys
import os
import subprocess
import time
import tempfile
import textwrap
import shutil
import stat
import json
import re
import webbrowser
from datetime import datetime

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
    if getattr(sys, 'frozen', False):
        pass
    elif "--elevated" not in sys.argv:
        params = " ".join(sys.argv[1:]) + " --elevated"
        ctypes.windll.shell32.ShellExecuteW(
            None, "runas", sys.executable, f'"{sys.argv[0]}" {params}', None, 1
        )
        sys.exit()

# ---------------------------------------------------------------------------
# FONCTION pour forcer la suppression d'un dossier (y compris fichiers verrouillés)
# ---------------------------------------------------------------------------
def force_remove(path):
    """Force la suppression d'un dossier même avec des fichiers verrouillés."""
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
NEEDED_MODULES = ["requests", "ttkbootstrap"]
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
except ImportError as e:
    print("Certains modules sont toujours introuvables. Veuillez installer manuellement : requests, ttkbootstrap.")
    sys.exit(1)

# ---------------------------------------------------------------------------
# CONFIGURATION PAR DEFAUT
# ---------------------------------------------------------------------------
MAIN_DOMAIN = "salle.anecoop-france.com"
DEFAULT_RENDER_APP = "teamsrooms"

MEETING_ROOMS = [
    "Canigou", "Castillet", "Florensud", "Mallorca",
    "Mimosa", "Pivoine", "Renoncule", "Tramontane", "Massane"
]

DEFAULT_GITHUB_REPO = "https://github.com/kaizen2025/teamsrooms.git"
DEFAULT_LOCAL_PATH = r"C:\teamsrooms"

# ID de service de Render pour le Web Service
RENDER_SERVICE_ID = "cv4djpggph6c738uugh0"

# ---------------------------------------------------------------------------
# CLASSE PRINCIPALE DE L'APPLICATION
# ---------------------------------------------------------------------------
class AllInOneManager(ttkb.Window):
    def __init__(self):
        super().__init__(themename="flatly")
        self.title("All-in-One Manager - Render/Git/Kiosk")
        self.geometry("1200x800")

        self.selected_room = ttkb.StringVar(value="Tramontane")
        self.render_app_var = ttkb.StringVar(value=DEFAULT_RENDER_APP)
        self.render_service_id = ttkb.StringVar(value=RENDER_SERVICE_ID)

        self.github_repo_url = ttkb.StringVar(value=DEFAULT_GITHUB_REPO)
        self.local_repo_path = ttkb.StringVar(value=DEFAULT_LOCAL_PATH)

        self.chrome_path = ttkb.StringVar(value=r"C:\Program Files\Google\Chrome\Application\chrome.exe")
        self.kiosk_task_name = ttkb.StringVar(value="ChromeKiosk")

        self.create_widgets()

    # ----------------------------------------------------------------
    # Création de tous les onglets
    # ----------------------------------------------------------------
    def create_widgets(self):
        self.notebook = ttkb.Notebook(self, padding=10)
        self.notebook.pack(fill=BOTH, expand=YES)

        tab_dashboard = ttkb.Frame(self.notebook)
        tab_config = ttkb.Frame(self.notebook)
        tab_git = ttkb.Frame(self.notebook)
        tab_kiosk = ttkb.Frame(self.notebook)

        self.notebook.add(tab_dashboard, text="Dashboard")
        self.notebook.add(tab_config, text="Configuration")
        self.notebook.add(tab_git, text="GitHub & Render")
        self.notebook.add(tab_kiosk, text="Chrome Kiosk")

        self.build_dashboard_tab(tab_dashboard)
        self.build_config_tab(tab_config)
        self.build_git_tab(tab_git)
        self.build_kiosk_tab(tab_kiosk)

        self.log_box = ScrolledText(self, autohide=True, padding=10, height=8)
        self.log_box.pack(fill=BOTH, expand=YES, padx=10, pady=5)

    # ----------------------------------------------------------------
    # TAB : Dashboard
    # ----------------------------------------------------------------
    def build_dashboard_tab(self, parent):
        main_frame = ttkb.Frame(parent)
        main_frame.pack(fill=BOTH, expand=YES)

        lbl_title = ttkb.Label(
            main_frame,
            text="All-in-One Manager - Tableau de bord",
            bootstyle="inverse-primary",
            font="-size 16 -weight bold"
        )
        lbl_title.pack(fill=X, padx=10, pady=10)

        top_frame = ttkb.Frame(main_frame)
        top_frame.pack(fill=X, padx=10, pady=(0, 10))

        status_frame = ttkb.Labelframe(top_frame, text="Statut actuel", padding=10, bootstyle="info")
        status_frame.pack(side=LEFT, fill=BOTH, expand=YES, padx=(0, 10))

        self.lbl_render_status = ttkb.Label(status_frame, text="Render : Non vérifié", font="-size 10")
        self.lbl_render_status.pack(anchor="w", padx=5, pady=5)

        self.lbl_git_status = ttkb.Label(status_frame, text="Git : Non vérifié", font="-size 10")
        self.lbl_git_status.pack(anchor="w", padx=5, pady=5)

        actions_frame = ttkb.Labelframe(top_frame, text="Actions rapides", padding=10, bootstyle="secondary")
        actions_frame.pack(side=LEFT, fill=BOTH, expand=YES)

        btn_check_render = ttkb.Button(actions_frame, text="Vérifier Render", command=self.check_render_status)
        btn_check_render.grid(row=0, column=0, padx=5, pady=5, sticky="ew")
        ToolTip(btn_check_render, text="Vérifie le statut de l'application sur Render")

        btn_deploy_render = ttkb.Button(actions_frame, text="Déployer sur Render", command=self.deploy_to_render)
        btn_deploy_render.grid(row=0, column=1, padx=5, pady=5, sticky="ew")
        ToolTip(btn_deploy_render, text="Déclenche un nouveau déploiement sur Render")

        btn_pull = ttkb.Button(actions_frame, text="Git Pull", command=self.git_pull)
        btn_pull.grid(row=1, column=0, padx=5, pady=5, sticky="ew")
        ToolTip(btn_pull, text="Récupère les dernières modifications du dépôt Git local")

        btn_push = ttkb.Button(actions_frame, text="Git Push", command=self.git_push)
        btn_push.grid(row=1, column=1, padx=5, pady=5, sticky="ew")
        ToolTip(btn_push, text="Envoie les modifications locales vers GitHub (déclenche auto-déploiement sur Render)")

        btn_kiosk = ttkb.Button(actions_frame, text="Kiosk Task", command=self.create_kiosk_task)
        btn_kiosk.grid(row=2, column=0, padx=5, pady=5, sticky="ew")
        ToolTip(btn_kiosk, text="Crée ou met à jour la tâche planifiée pour le mode Kiosk Chrome")

        btn_start_server = ttkb.Button(actions_frame, text="Serveur Python", command=self.start_local_server)
        btn_start_server.grid(row=2, column=1, padx=5, pady=5, sticky="ew")
        ToolTip(btn_start_server, text="Lance 'app.py' dans le répertoire local")

        btn_open_page = ttkb.Button(actions_frame, text="Ouvrir Page Locale", command=self.open_local_page)
        btn_open_page.grid(row=3, column=0, padx=5, pady=5, sticky="ew")
        ToolTip(btn_open_page, text="Ouvre la salle sélectionnée en local (http://127.0.0.1:5000/<salle>)")

        btn_open_render = ttkb.Button(actions_frame, text="Ouvrir Page Render", command=self.open_render_page)
        btn_open_render.grid(row=3, column=1, padx=5, pady=5, sticky="ew")
        ToolTip(btn_open_render, text="Ouvre la salle sélectionnée sur Render (https://salle.anecoop-france.com/<salle>)")

        actions_frame.grid_columnconfigure(0, weight=1)
        actions_frame.grid_columnconfigure(1, weight=1)

        info_label = ttkb.Label(
            main_frame,
            text=("Gérez vos déploiements Render, GitHub et le mode Chrome Kiosk.\n"
                  "Utilisez les onglets ci-dessus pour plus de détails et de configuration."),
            font="-size 10"
        )
        info_label.pack(fill=X, padx=10, pady=10)

    # ----------------------------------------------------------------
    # TAB : Configuration
    # ----------------------------------------------------------------
    def build_config_tab(self, parent):
        frame = ttkb.Frame(parent, padding=10)
        frame.pack(fill=BOTH, expand=YES)

        ttkb.Label(frame, text="Configuration de l'application", 
                  font="-size 11 -weight bold").pack(anchor='w', pady=(5,10))

        # Render Configuration
        render_frame = ttkb.Labelframe(frame, text="Configuration Render", padding=10)
        render_frame.pack(fill=X, pady=10)

        render_frm1 = ttkb.Frame(render_frame)
        render_frm1.pack(anchor='w', fill=X, pady=5)
        ttkb.Label(render_frm1, text="Nom de l'application Render:").pack(side=LEFT, padx=5)
        ttkb.Entry(render_frm1, textvariable=self.render_app_var, width=30).pack(side=LEFT, padx=5)

        render_frm2 = ttkb.Frame(render_frame)
        render_frm2.pack(anchor='w', fill=X, pady=5)
        ttkb.Label(render_frm2, text="ID du service Render:").pack(side=LEFT, padx=5)
        ttkb.Entry(render_frm2, textvariable=self.render_service_id, width=30).pack(side=LEFT, padx=5)
        
        # Room Selection
        room_frame = ttkb.Labelframe(frame, text="Sélection de la salle", padding=10)
        room_frame.pack(fill=X, pady=10)
        
        room_frm = ttkb.Frame(room_frame)
        room_frm.pack(anchor='w', fill=X, pady=5)
        ttkb.Label(room_frm, text="Salle active:").pack(side=LEFT, padx=5)
        combo = ttkb.Combobox(room_frm, textvariable=self.selected_room, 
                             values=MEETING_ROOMS, state="readonly", width=30)
        combo.pack(side=LEFT, padx=5)

        # Paths Configuration
        paths_frame = ttkb.Labelframe(frame, text="Chemins", padding=10)
        paths_frame.pack(fill=X, pady=10)
        
        paths_frm1 = ttkb.Frame(paths_frame)
        paths_frm1.pack(anchor='w', fill=X, pady=5)
        ttkb.Label(paths_frm1, text="URL du repo GitHub:").pack(side=LEFT, padx=5)
        ttkb.Entry(paths_frm1, textvariable=self.github_repo_url, width=60).pack(side=LEFT, padx=5)
        
        paths_frm2 = ttkb.Frame(paths_frame)
        paths_frm2.pack(anchor='w', fill=X, pady=5)
        ttkb.Label(paths_frm2, text="Dossier local pour GitHub:").pack(side=LEFT, padx=5)
        ttkb.Entry(paths_frm2, textvariable=self.local_repo_path, width=60).pack(side=LEFT, padx=5)
        
        paths_frm3 = ttkb.Frame(paths_frame)
        paths_frm3.pack(anchor='w', fill=X, pady=5)
        ttkb.Label(paths_frm3, text="Chemin Chrome (chrome.exe):").pack(side=LEFT, padx=5)
        ttkb.Entry(paths_frm3, textvariable=self.chrome_path, width=60).pack(side=LEFT, padx=5)

    # ----------------------------------------------------------------
    # TAB : GitHub & Render
    # ----------------------------------------------------------------
    def build_git_tab(self, parent):
        frame = ttkb.Frame(parent, padding=10)
        frame.pack(fill=BOTH, expand=YES)
        
        header_frame = ttkb.Frame(frame)
        header_frame.pack(fill=X, pady=10)
        
        ttkb.Label(header_frame, 
                  text="Gestion du dépôt GitHub et déploiement sur Render", 
                  font="-size 12 -weight bold").pack(side=LEFT)
        
        # GitHub Section
        github_frame = ttkb.Labelframe(frame, text="GitHub", padding=10, bootstyle="info")
        github_frame.pack(fill=X, pady=10)
        
        info_text = (
            "• Clone: Télécharge le dépôt GitHub pour la première fois\n"
            "• Pull: Récupère les dernières modifications distantes\n"
            "• Commit: Enregistre les modifications locales\n"
            "• Push: Envoie vos modifications locales vers GitHub"
        )
        
        ttkb.Label(github_frame, text=info_text, justify="left").pack(anchor='w', pady=10)
        
        git_buttons_frame = ttkb.Frame(github_frame)
        git_buttons_frame.pack(fill=X, pady=5)
        
        ttkb.Button(git_buttons_frame, text="Cloner Repo GitHub", 
                   command=self.git_clone, bootstyle="info").pack(side=LEFT, padx=5)
        ttkb.Button(git_buttons_frame, text="Pull (GitHub)", 
                   command=self.git_pull, bootstyle="info").pack(side=LEFT, padx=5)
        ttkb.Button(git_buttons_frame, text="Commit Changes",
                   command=self.git_commit, bootstyle="info").pack(side=LEFT, padx=5)
        ttkb.Button(git_buttons_frame, text="Push (GitHub)", 
                   command=self.git_push, bootstyle="info").pack(side=LEFT, padx=5)
        
        # Render Section
        render_frame = ttkb.Labelframe(frame, text="Render", padding=10, bootstyle="success")
        render_frame.pack(fill=X, pady=10)
        
        render_info = (
            "Render est configuré pour se déployer automatiquement depuis GitHub.\n"
            "Un push vers GitHub déclenchera automatiquement un nouveau déploiement."
        )
        
        ttkb.Label(render_frame, text=render_info, justify="left").pack(anchor='w', pady=10)
        
        render_buttons_frame = ttkb.Frame(render_frame)
        render_buttons_frame.pack(fill=X, pady=5)
        
        ttkb.Button(render_buttons_frame, text="Vérifier Statut Render", 
                   command=self.check_render_status, bootstyle="success").pack(side=LEFT, padx=5)
        ttkb.Button(render_buttons_frame, text="Déclencher Déploiement", 
                   command=self.deploy_to_render, bootstyle="success").pack(side=LEFT, padx=5)
        ttkb.Button(render_buttons_frame, text="Ouvrir Dashboard Render", 
                   command=self.open_render_dashboard, bootstyle="success").pack(side=LEFT, padx=5)
        
        # Local Development Section
        local_frame = ttkb.Labelframe(frame, text="Développement Local", padding=10, bootstyle="warning")
        local_frame.pack(fill=X, pady=10)
        
        local_buttons_frame = ttkb.Frame(local_frame)
        local_buttons_frame.pack(fill=X, pady=5)
        
        ttkb.Button(local_buttons_frame, text="Lancer Serveur Python",
                   command=self.start_local_server, bootstyle="warning").pack(side=LEFT, padx=5)
        ttkb.Button(local_buttons_frame, text="Ouvrir Page Locale",
                   command=self.open_local_page, bootstyle="warning").pack(side=LEFT, padx=5)

    # ----------------------------------------------------------------
    # TAB : Chrome Kiosk
    # ----------------------------------------------------------------
    def build_kiosk_tab(self, parent):
        frame = ttkb.Frame(parent, padding=10)
        frame.pack(fill=BOTH, expand=YES)
        
        header_frame = ttkb.Frame(frame)
        header_frame.pack(fill=X, pady=10)
        
        ttkb.Label(header_frame, 
                  text="Configuration du Mode Kiosk Chrome", 
                  font="-size 12 -weight bold").pack(side=LEFT)
        
        # Configuration Section
        config_frame = ttkb.Labelframe(frame, text="Configuration", padding=10)
        config_frame.pack(fill=X, pady=10)
        
        kiosk_frm1 = ttkb.Frame(config_frame)
        kiosk_frm1.pack(anchor='w', fill=X, pady=5)
        ttkb.Label(kiosk_frm1, text="Chemin Chrome (chrome.exe):").pack(side=LEFT, padx=5)
        ttkb.Entry(kiosk_frm1, textvariable=self.chrome_path, width=60).pack(side=LEFT, padx=5)
        
        kiosk_frm2 = ttkb.Frame(config_frame)
        kiosk_frm2.pack(anchor='w', fill=X, pady=5)
        ttkb.Label(kiosk_frm2, text="Nom de la tâche planifiée:").pack(side=LEFT, padx=5)
        ttkb.Entry(kiosk_frm2, textvariable=self.kiosk_task_name, width=30).pack(side=LEFT, padx=5)
        
        kiosk_frm3 = ttkb.Frame(config_frame)
        kiosk_frm3.pack(anchor='w', fill=X, pady=5)
        ttkb.Label(kiosk_frm3, text="Salle à afficher:").pack(side=LEFT, padx=5)
        room_combo = ttkb.Combobox(kiosk_frm3, textvariable=self.selected_room, 
                                  values=MEETING_ROOMS, state="readonly", width=30)
        room_combo.pack(side=LEFT, padx=5)
        
        # Instructions Section
        info_frame = ttkb.Labelframe(frame, text="Instructions", padding=10, bootstyle="info")
        info_frame.pack(fill=X, pady=10)
        
        kiosk_info = (
            "Au démarrage de Windows, Chrome s'ouvrira en mode app (sans barre d'adresse ni onglets)\n"
            "et enverra la touche F11 pour passer en plein écran.\n\n"
            "Si le plein écran n'apparaît pas automatiquement, vous pouvez :\n"
            "1. Augmenter le délai dans le script VBScript généré (actuellement 5 secondes)\n"
            "2. Appuyer manuellement sur F11 la première fois\n"
            "3. Vérifier que Chrome est bien configuré pour mémoriser le mode plein écran"
        )
        
        ttkb.Label(info_frame, text=kiosk_info, justify="left").pack(anchor='w', pady=10)
        
        # Action Buttons
        buttons_frame = ttkb.Frame(frame)
        buttons_frame.pack(fill=X, pady=10)
        
        ttkb.Button(buttons_frame, text="Créer Tâche Planifiée", 
                   command=self.create_kiosk_task, 
                   bootstyle="success").pack(side=LEFT, padx=5)
        
        ttkb.Button(buttons_frame, text="Tester Mode Kiosk", 
                   command=self.test_kiosk_mode,
                   bootstyle="info").pack(side=LEFT, padx=5)
        
        ttkb.Button(buttons_frame, text="Supprimer Tâche Planifiée", 
                   command=self.delete_kiosk_task,
                   bootstyle="danger").pack(side=LEFT, padx=5)

    # ----------------------------------------------------------------
    # LOG
    # ----------------------------------------------------------------
    def log(self, msg):
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.log_box.insert("end", f"[{timestamp}] {msg}\n")
        self.log_box.see("end")
        self.log_box.update_idletasks()

    # ----------------------------------------------------------------
    # GitHub : clone / pull / commit / push
    # ----------------------------------------------------------------
    def git_clone(self):
        url = self.github_repo_url.get().strip()
        path = self.local_repo_path.get().strip()
        self.log(f"Clonage du dépôt {url} => {path}")

        if not url or not path:
            self.log("❌ URL ou chemin vide.")
            return
        if os.path.exists(path) and os.listdir(path):
            self.log("❌ Dossier non vide, annulation du clonage.")
            return

        os.makedirs(path, exist_ok=True)
        cmd = ["git", "clone", url, path]
        p = subprocess.run(cmd, capture_output=True, text=True)
        self.log(p.stdout)
        self.log(p.stderr)
        if p.returncode == 0:
            self.log("✅ Clone GitHub réussi.")
            self.update_git_status()
        else:
            self.log(f"❌ Échec du clonage (code {p.returncode}).")

    def git_pull(self):
        path = self.local_repo_path.get().strip()
        self.log(f"Récupération des modifications depuis GitHub dans {path}")

        if not os.path.isdir(path):
            self.log("❌ Dossier local introuvable.")
            return

        cmd = ["git", "-C", path, "pull"]
        p = subprocess.run(cmd, capture_output=True, text=True)
        self.log(p.stdout)
        self.log(p.stderr)
        if p.returncode == 0:
            self.log("✅ Pull GitHub réussi.")
            self.update_git_status()
        else:
            self.log(f"❌ Échec du pull (code {p.returncode}).")

    def git_commit(self):
        path = self.local_repo_path.get().strip()
        self.log(f"Commit des modifications locales dans {path}")

        if not os.path.isdir(path):
            self.log("❌ Dossier local introuvable.")
            return

        # Vérifier s'il y a des modifications à commiter
        status_cmd = ["git", "-C", path, "status", "--porcelain"]
        status_result = subprocess.run(status_cmd, capture_output=True, text=True)
        
        if not status_result.stdout.strip():
            self.log("ℹ️ Aucune modification à commiter.")
            return

        # Ajouter toutes les modifications
        add_cmd = ["git", "-C", path, "add", "."]
        add_result = subprocess.run(add_cmd, capture_output=True, text=True)
        
        if add_result.returncode != 0:
            self.log(f"❌ Échec de l'ajout des fichiers (code {add_result.returncode}).")
            self.log(add_result.stderr)
            return

        # Créer le commit
        commit_msg = f"Mise à jour depuis All-in-One Manager - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        commit_cmd = ["git", "-C", path, "commit", "-m", commit_msg]
        commit_result = subprocess.run(commit_cmd, capture_output=True, text=True)
        
        self.log(commit_result.stdout)
        self.log(commit_result.stderr)
        
        if commit_result.returncode == 0:
            self.log("✅ Commit des modifications réussi.")
            self.update_git_status()
        else:
            self.log(f"❌ Échec du commit (code {commit_result.returncode}).")

    def git_push(self):
        path = self.local_repo_path.get().strip()
        self.log(f"Push des modifications vers GitHub depuis {path}")

        if not os.path.isdir(path):
            self.log("❌ Dossier local introuvable.")
            return

        # Vérifier s'il y a des commits à pousser
        cmd = ["git", "-C", path, "push", "origin", "main"]
        p = subprocess.run(cmd, capture_output=True, text=True)
        self.log(p.stdout)
        self.log(p.stderr)
        
        if p.returncode == 0:
            self.log("✅ Push GitHub réussi.")
            self.log("ℹ️ Un déploiement automatique sur Render devrait être déclenché.")
            self.update_git_status()
        else:
            self.log(f"❌ Échec du push (code {p.returncode}).")

    def update_git_status(self):
        path = self.local_repo_path.get().strip()
        if not os.path.isdir(path) or not os.path.isdir(os.path.join(path, ".git")):
            self.lbl_git_status.configure(text="Git : Dépôt non initialisé")
            return

        try:
            # Obtenir la branche actuelle
            branch_cmd = ["git", "-C", path, "rev-parse", "--abbrev-ref", "HEAD"]
            branch_result = subprocess.run(branch_cmd, capture_output=True, text=True)
            branch = branch_result.stdout.strip() if branch_result.returncode == 0 else "?"

            # Obtenir le dernier commit
            commit_cmd = ["git", "-C", path, "log", "-1", "--oneline"]
            commit_result = subprocess.run(commit_cmd, capture_output=True, text=True)
            last_commit = commit_result.stdout.strip() if commit_result.returncode == 0 else "Aucun commit"

            # Vérifier s'il y a des modifications non commitées
            status_cmd = ["git", "-C", path, "status", "--porcelain"]
            status_result = subprocess.run(status_cmd, capture_output=True, text=True)
            has_changes = len(status_result.stdout.strip()) > 0

            status_text = f"Git : {branch} - {last_commit[:30]}"
            if has_changes:
                status_text += " (modifications non commitées)"

            self.lbl_git_status.configure(text=status_text)
        except Exception as e:
            self.log(f"Erreur lors de la mise à jour du statut Git : {e}")
            self.lbl_git_status.configure(text="Git : Erreur de statut")

    # ----------------------------------------------------------------
    # Render Deployment & Status
    # ----------------------------------------------------------------
    def check_render_status(self):
        service_id = self.render_service_id.get().strip()
        self.log(f"Vérification du statut du service Render (ID: {service_id})")
        
        # Ouverture du dashboard dans le navigateur
        dashboard_url = f"https://dashboard.render.com/web/srv-{service_id}"
        webbrowser.open(dashboard_url)
        
        self.log("✅ Dashboard Render ouvert dans le navigateur.")
        self.lbl_render_status.configure(text="Render : Dashboard ouvert")

    def deploy_to_render(self):
        service_id = self.render_service_id.get().strip()
        self.log(f"Déclenchement d'un déploiement manuel sur Render (ID: {service_id})")
        
        # Ouvrir la page de déploiement manuel
        deploy_url = f"https://dashboard.render.com/web/srv-{service_id}/deploys"
        webbrowser.open(deploy_url)
        
        self.log("✅ Page de déploiement Render ouverte.")
        self.log("ℹ️ Cliquez sur 'Manual Deploy' puis 'Clear build cache & deploy' pour un déploiement complet.")

    def open_render_dashboard(self):
        service_id = self.render_service_id.get().strip()
        dashboard_url = f"https://dashboard.render.com/web/srv-{service_id}"
        webbrowser.open(dashboard_url)
        self.log(f"✅ Dashboard Render ouvert : {dashboard_url}")

    def open_render_page(self):
        room = self.selected_room.get().lower()
        url = f"https://{MAIN_DOMAIN}/{room}"
        webbrowser.open(url)
        self.log(f"✅ Page ouverte : {url}")

    # ----------------------------------------------------------------
    # Chrome Kiosk Mode
    # ----------------------------------------------------------------
    def create_kiosk_task(self):
        room = self.selected_room.get().lower()
        url = f"https://{MAIN_DOMAIN}/{room}"
        chrome_path = self.chrome_path.get().strip()
        
        if not os.path.exists(chrome_path):
            self.log(f"❌ Chrome introuvable : {chrome_path}")
            return
            
        vbs_content = f'''Set WshShell = CreateObject("WScript.Shell")
WshShell.Run """{chrome_path}"" --profile-directory=Default --app={url}", 0, True
' Attendre 5 secondes pour être certain que Chrome est bien chargé
WScript.Sleep 5000
' Tenter d'activer la fenêtre Chrome
WshShell.AppActivate "{MAIN_DOMAIN}"
WScript.Sleep 500
' Envoyer F11 pour passer en plein écran
WshShell.SendKeys "{{F11}}"
'''
        script_dir = os.path.dirname(os.path.abspath(__file__))
        vbs_path = os.path.join(script_dir, "launchChromeKiosk.vbs")
        try:
            with open(vbs_path, "w", encoding="utf-8") as f:
                f.write(vbs_content)
            self.log(f"✅ VBScript créé : {vbs_path}")
        except Exception as e:
            self.log(f"❌ Erreur lors de la création du VBScript : {e}")
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
        self.log("Création de la tâche planifiée : " + " ".join(schtasks_cmd))
        p = subprocess.run(schtasks_cmd, capture_output=True, text=True)
        self.log(p.stdout)
        self.log(p.stderr)
        if p.returncode == 0:
            self.log("✅ Tâche planifiée créée avec succès.")
        else:
            self.log(f"❌ Échec de création de la tâche (code {p.returncode}).")

    def test_kiosk_mode(self):
        room = self.selected_room.get().lower()
        url = f"https://{MAIN_DOMAIN}/{room}"
        chrome_path = self.chrome_path.get().strip()
        
        if not os.path.exists(chrome_path):
            self.log(f"❌ Chrome introuvable : {chrome_path}")
            return
            
        self.log(f"Test du mode kiosk pour {url}")
        cmd = [chrome_path, "--profile-directory=Default", f"--app={url}"]
        try:
            subprocess.Popen(cmd)
            self.log("✅ Chrome lancé en mode app. Appuyez sur F11 pour activer le plein écran.")
        except Exception as e:
            self.log(f"❌ Erreur lors du lancement de Chrome : {e}")

    def delete_kiosk_task(self):
        task_name = self.kiosk_task_name.get().strip()
        cmd = ["schtasks", "/delete", "/tn", task_name, "/f"]
        self.log(f"Suppression de la tâche planifiée : {task_name}")
        
        p = subprocess.run(cmd, capture_output=True, text=True)
        self.log(p.stdout)
        self.log(p.stderr)
        
        if p.returncode == 0:
            self.log("✅ Tâche planifiée supprimée avec succès.")
        else:
            self.log(f"❌ Échec de suppression de la tâche (code {p.returncode}).")

    # ----------------------------------------------------------------
    # Local Development Server
    # ----------------------------------------------------------------
    def start_local_server(self):
        path = self.local_repo_path.get().strip()
        app_path = os.path.join(path, "app.py")
        
        if not os.path.isfile(app_path):
            self.log(f"❌ 'app.py' introuvable dans {path}")
            return
            
        self.log(f"Lancement du serveur Python : {app_path}")
        try:
            subprocess.Popen([sys.executable, app_path], cwd=path, shell=True)
            self.log("✅ Serveur local lancé sur http://127.0.0.1:5000/")
        except Exception as e:
            self.log(f"❌ Erreur lors du lancement du serveur : {e}")

    def open_local_page(self):
        room = self.selected_room.get().lower()
        url = f"http://127.0.0.1:5000/{room}"
        webbrowser.open(url)
        self.log(f"✅ Page locale ouverte : {url}")

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