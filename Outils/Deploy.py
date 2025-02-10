import os
import sys
import subprocess
import threading
import ctypes
import re
import time
import tkinter as tk
from tkinter import scrolledtext, messagebox

# --- Installation automatique de pywin32 si nécessaire ---
try:
    import win32com.client
except ImportError:
    print("pywin32 non installé, installation en cours...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pywin32"])
    except Exception as e:
        messagebox.showerror("Erreur", "Impossible d'installer pywin32. Veuillez l'installer manuellement.")
        sys.exit(1)
    try:
        import win32com.client
    except ImportError:
        messagebox.showerror("Erreur", "Installation de pywin32 échouée. Veuillez l'installer manuellement.")
        sys.exit(1)

# Expression régulière pour supprimer les séquences ANSI (ex: [G[1A[J)
ansi_escape = re.compile(r'\x1B\[[0-?]*[ -/]*[@-~]')

# --- Vérification des droits administrateur ---
def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except Exception:
        return False

if not is_admin():
    ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, " " + __file__, None, 1)
    sys.exit()

# Forcer l'encodage UTF-8 pour la sortie
sys.stdout.reconfigure(encoding='utf-8')

# --- Fonction d'exécution de commande ---
def run_command(command, ignore_warnings=False):
    """
    Exécute une commande et affiche sa sortie en temps réel dans le log.
    Les séquences ANSI indésirables sont supprimées.
    """
    process = subprocess.Popen(command,
                               stdout=subprocess.PIPE,
                               stderr=subprocess.STDOUT,
                               text=True,
                               shell=True)
    for line in iter(process.stdout.readline, ''):
        line = ansi_escape.sub('', line)
        if ignore_warnings and "Warning" in line:
            continue
        log_console.insert(tk.END, line)
        log_console.see(tk.END)
        root.update()
    process.stdout.close()
    process.wait()

# --- Fonction pour attendre qu'un service soit en état RUNNING ---
def wait_for_service(service_name, timeout=30):
    start_time = time.time()
    while time.time() - start_time < timeout:
        result = subprocess.run(f'sc query {service_name}', shell=True, capture_output=True, text=True)
        if "RUNNING" in result.stdout:
            return True
        time.sleep(1)
    return False

# =============================================================================
# OPTION 1 : Déployer vers Git & Heroku
# =============================================================================
def update_heroku():
    log_console.insert(tk.END, "[UPDATE] Vérification et mise à jour de Heroku CLI...\n")
    root.update()
    run_command("heroku update")

def check_gh_auth():
    log_console.insert(tk.END, "[AUTH] Vérification de l'authentification GitHub...\n")
    root.update()
    # Exemple de token GitHub (à adapter et sécuriser)
    GITHUB_PAT = "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"
    run_command("git config --global credential.helper store", ignore_warnings=True)
    with open(os.path.expanduser("~/.git-credentials"), "w") as cred_file:
        cred_file.write(f"https://{GITHUB_PAT}@github.com\n")
    run_command("git config --global user.name 'AutoDeploy'", ignore_warnings=True)
    run_command("git config --global user.email 'autodeploy@example.com'", ignore_warnings=True)
    run_command("git config --global push.default simple", ignore_warnings=True)
    log_console.insert(tk.END, "✅ Authentification GitHub configurée avec succès !\n")
    return True

def sync_github():
    log_console.insert(tk.END, "[4/6] Synchronisation avec GitHub...\n")
    root.update()
    if check_gh_auth():
        status = subprocess.run("git status --porcelain", capture_output=True, text=True, shell=True)
        if not status.stdout.strip():
            log_console.insert(tk.END, "ℹ️ Aucun changement détecté, pas de commit nécessaire.\n")
        else:
            run_command("git add --all && git commit -m \"Auto-deploy\" && git push origin main", ignore_warnings=True)

def check_git():
    log_console.insert(tk.END, "[1/6] Vérification de Git...\n")
    root.update()
    return subprocess.run(["git", "--version"], capture_output=True, text=True).returncode == 0

def check_heroku():
    log_console.insert(tk.END, "[2/6] Vérification de Heroku CLI...\n")
    root.update()
    return subprocess.run(["where", "heroku"], capture_output=True, text=True, shell=True).returncode == 0

def check_heroku_auth():
    log_console.insert(tk.END, "[3/6] Vérification de l'authentification Heroku...\n")
    root.update()
    if subprocess.run(["heroku", "auth:whoami"], capture_output=True, text=True, shell=True).returncode == 0:
        log_console.insert(tk.END, "✅ Connecté à Heroku\n")
        return True
    log_console.insert(tk.END, "❌ Non connecté à Heroku. Tentative de connexion...\n")
    root.update()
    run_command("heroku login")
    return subprocess.run(["heroku", "auth:whoami"], capture_output=True, text=True, shell=True).returncode == 0

def check_heroku_project():
    log_console.insert(tk.END, "[CHECK] Vérification du projet Heroku...\n")
    root.update()
    if subprocess.run("heroku apps:info --json", capture_output=True, text=True, shell=True).returncode != 0:
        log_console.insert(tk.END, "⚠️ Projet Heroku introuvable. Tentative de création...\n")
        root.update()
        run_command("heroku create teamsrooms")
        if subprocess.run("heroku apps:info --json", capture_output=True, text=True, shell=True).returncode != 0:
            messagebox.showerror("Erreur", "Impossible de trouver ou créer le projet Heroku. Vérifiez votre compte Heroku.")
            return False
    run_command("heroku git:remote -a teamsrooms")
    log_console.insert(tk.END, "✅ Projet Heroku détecté et lié !\n")
    return True

def start_deployment():
    def threaded_deployment():
        update_heroku()
        if check_git() and check_heroku():
            if not check_heroku_auth():
                return
            if not check_heroku_project():
                return
            sync_github()
            log_console.insert(tk.END, "🚀 Déploiement terminé avec succès !\n")
    threading.Thread(target=threaded_deployment, daemon=True).start()

# =============================================================================
# OPTION 2 : Cloner/Mise à jour du dépôt Teamsrooms (C:\Teamsrooms)
# =============================================================================
def sync_local_repo():
    target_dir = r"C:\Teamsrooms"
    if os.path.exists(target_dir):
        log_console.insert(tk.END, "ℹ️ Le répertoire existe déjà. Mise à jour (git pull)...\n")
        root.update()
        run_command(f'cd /d "{target_dir}" && git pull')
    else:
        log_console.insert(tk.END, "ℹ️ Répertoire introuvable. Clonage du repository Teamsrooms...\n")
        root.update()
        run_command(f'git clone https://github.com/kaizen2025/teamsrooms.git "{target_dir}"')

# =============================================================================
# OPTION 3 : Créer un raccourci Chrome pour ouvrir une salle de réunion en plein écran
# =============================================================================
def get_chrome_path():
    possible_paths = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
    ]
    for path in possible_paths:
        if os.path.exists(path):
            return path
    return None

def create_chrome_shortcut():
    room = selected_room.get()
    mode = mode_var.get()  # "local" ou "web"
    if not room:
        messagebox.showerror("Erreur", "Veuillez sélectionner une salle de réunion.")
        return
    if mode == "local":
        url = f"http://localhost:5000/{room.lower()}"
    else:
        url = f"https://teamsrooms-11a8c77873e7.herokuapp.com/{room.lower()}"
    chrome_path = get_chrome_path()
    if chrome_path is None:
        messagebox.showerror("Erreur", "Google Chrome n'a pas été trouvé.")
        return
    desktop = os.path.join(os.environ['USERPROFILE'], 'Desktop')
    shortcut_name = f"Ouvrir {room} ({'Local' if mode=='local' else 'Web'}).lnk"
    shortcut_path = os.path.join(desktop, shortcut_name)
    shell = win32com.client.Dispatch("WScript.Shell")
    shortcut = shell.CreateShortCut(shortcut_path)
    shortcut.Targetpath = chrome_path
    # L'argument --kiosk force Chrome à s'ouvrir en plein écran (mode kiosque)
    shortcut.Arguments = f'--kiosk "{url}"'
    shortcut.WorkingDirectory = os.path.dirname(chrome_path)
    shortcut.IconLocation = chrome_path
    shortcut.WindowStyle = 1
    shortcut.save()
    log_console.insert(tk.END, f"✅ Raccourci Chrome pour {room} ({mode}) créé avec succès !\n")
    root.update()

# =============================================================================
# OPTION 4 : Créer/Démarrer le service Windows pour Teamsrooms
# =============================================================================
def create_service():
    # Pour cet exemple, le service lancera app.py situé dans C:\Teamsrooms
    app_path = r"C:\Teamsrooms\app.py"
    if not os.path.exists(app_path):
        messagebox.showerror("Erreur", f"Le fichier {app_path} est introuvable.")
        return
    if "python.exe" in sys.executable.lower():
        pythonw_path = sys.executable.lower().replace("python.exe", "pythonw.exe")
    else:
        pythonw_path = sys.executable
    binPath_str = f'"{pythonw_path}" "{app_path}"'
    query = subprocess.run('sc query TeamsroomsService', shell=True, capture_output=True, text=True)
    if "SERVICE_NAME" in query.stdout:
        answer = messagebox.askyesno("Service existant", "Le service TeamsroomsService existe déjà. Voulez-vous le redémarrer ?")
        if answer:
            run_command("sc stop TeamsroomsService")
            run_command("sc start TeamsroomsService")
            if wait_for_service("TeamsroomsService"):
                messagebox.showinfo("Succès", "Service redémarré avec succès.")
            else:
                messagebox.showerror("Erreur", "Le service n'a pas répondu assez rapidement après le redémarrage.")
        return
    create_cmd = f'sc create TeamsroomsService binPath= "{binPath_str}" start= auto'
    run_command(create_cmd)
    run_command("sc start TeamsroomsService")
    if wait_for_service("TeamsroomsService"):
        messagebox.showinfo("Succès", "Service TeamsroomsService créé et démarré avec succès.")
    else:
        messagebox.showerror("Erreur", "Le service n'a pas répondu assez rapidement après le démarrage.")

# =============================================================================
# Exécution des tâches sélectionnées selon les cases cochées
# =============================================================================
def run_selected_tasks():
    def task_thread():
        if var_deploy.get():
            start_deployment()
        if var_sync_repo.get():
            sync_local_repo()
        if var_create_chrome.get():
            create_chrome_shortcut()
        if var_create_service.get():
            create_service()
        log_console.insert(tk.END, "\nToutes les installations sélectionnées sont terminées.\n")
        root.update()
    threading.Thread(target=task_thread, daemon=True).start()

# =============================================================================
# Interface Graphique Tkinter
# =============================================================================
root = tk.Tk()
root.title("Installation et Configuration Teamsrooms")
root.geometry("800x700")

# Zone de log pour afficher la sortie des commandes
log_console = scrolledtext.ScrolledText(root, height=15, width=100)
log_console.pack(pady=10)

# Cadre pour sélectionner les options à installer
options_frame = tk.LabelFrame(root, text="Sélectionnez les options à installer", padx=10, pady=10)
options_frame.pack(padx=10, pady=10, fill="x")

var_deploy = tk.BooleanVar(value=False)
var_sync_repo = tk.BooleanVar(value=False)
var_create_chrome = tk.BooleanVar(value=False)
var_create_service = tk.BooleanVar(value=False)

chk_deploy = tk.Checkbutton(options_frame, text="1. Déployer vers Git & Heroku", variable=var_deploy)
chk_deploy.pack(anchor="w")
chk_sync_repo = tk.Checkbutton(options_frame, text="2. Cloner/Mise à jour du repo Teamsrooms", variable=var_sync_repo)
chk_sync_repo.pack(anchor="w")
chk_create_chrome = tk.Checkbutton(options_frame, text="3. Créer raccourci Chrome pour salle de réunion", variable=var_create_chrome)
chk_create_chrome.pack(anchor="w")
chk_create_service = tk.Checkbutton(options_frame, text="4. Créer/Démarrer le service Teamsrooms", variable=var_create_service)
chk_create_service.pack(anchor="w")

# Cadre pour la configuration du raccourci Chrome (Option 3)
meeting_frame = tk.LabelFrame(root, text="Configuration du raccourci Chrome", padx=10, pady=10)
meeting_frame.pack(padx=10, pady=10, fill="x")

# Liste des salles de réunion (pour information)
meeting_rooms = {
    "Canigou": "Sallecanigou@anecoop-france.com",
    "Castillet": "Sallecastillet@anecoop-france.com",
    "Florensud": "salleflorensud@florensud.fr",
    "Mallorca": "Sallemallorca@anecoop-france.com",
    "Mimosa": "Sallemimosa@florensud.fr",
    "Pivoine": "SallePivoine@florensud.fr",
    "Renoncule": "SalleRenoncule@florensud.fr",
    "Tramontane": "Salletramontane@anecoop-france.com",
    "SupportAlma": "Servicesupportalma@anecoop-france.com"
}
selected_room = tk.StringVar(value="Tramontane")
room_label = tk.Label(meeting_frame, text="Salle de réunion:")
room_label.grid(row=0, column=0, padx=5, pady=5, sticky="w")
room_menu = tk.OptionMenu(meeting_frame, selected_room, *meeting_rooms.keys())
room_menu.grid(row=0, column=1, padx=5, pady=5, sticky="w")

mode_var = tk.StringVar(value="local")
mode_label = tk.Label(meeting_frame, text="Mode:")
mode_label.grid(row=1, column=0, padx=5, pady=5, sticky="w")
radio_local = tk.Radiobutton(meeting_frame, text="Local", variable=mode_var, value="local")
radio_local.grid(row=1, column=1, padx=5, pady=5, sticky="w")
radio_web = tk.Radiobutton(meeting_frame, text="Web", variable=mode_var, value="web")
radio_web.grid(row=1, column=2, padx=5, pady=5, sticky="w")

# Cadre pour les boutons d'action
buttons_frame = tk.Frame(root)
buttons_frame.pack(pady=10)

btn_run = tk.Button(buttons_frame, text="Lancer l'installation", command=run_selected_tasks, width=30)
btn_run.grid(row=0, column=0, padx=5, pady=5)
btn_quit = tk.Button(buttons_frame, text="Quitter", command=root.destroy, width=30)
btn_quit.grid(row=0, column=1, padx=5, pady=5)

root.mainloop()
