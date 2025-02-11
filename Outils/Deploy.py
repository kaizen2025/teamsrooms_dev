import os
import sys
import subprocess
import threading
import ctypes
import re
import time
import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import hashlib
from tkinter.font import Font

# --- Installation automatique des dépendances ---
try:
    import win32com.client
    import win32serviceutil
except ImportError:
    print("Installation des dépendances manquantes...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pywin32"])
    import win32com.client
    import win32serviceutil

# Configuration de l'encodage
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# --- Vérification des droits admin ---
def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

if not is_admin():
    ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, __file__, None, 1)
    sys.exit()

# --- Fonctions utilitaires ---
ansi_escape = re.compile(r'\x1B\[[0-?]*[ -/]*[@-~]')

def run_command(command, ignore_errors=False, log_widget=None):
    """
    Exécute une commande shell et redirige sa sortie dans un widget (si fourni)
    ou vers la sortie standard.
    """
    process = subprocess.Popen(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        shell=True,
        encoding='utf-8',
        errors='replace'
    )
    
    while True:
        output = process.stdout.readline()
        if output == '' and process.poll() is not None:
            break
        if output:
            clean_line = ansi_escape.sub('', output)
            if log_widget:
                log_widget.insert(tk.END, clean_line)
                log_widget.see(tk.END)
                log_widget.update_idletasks()
            else:
                print(clean_line, end='')
    return process.poll()

def wait_for_service(service_name, timeout=30):
    start_time = time.time()
    while time.time() - start_time < timeout:
        result = subprocess.run(f'sc query {service_name}', shell=True, capture_output=True, text=True)
        if "RUNNING" in result.stdout:
            return True
        time.sleep(1)
    return False

# =============================================================================
# Gestion du service Windows
# =============================================================================
class ServiceManager:
    SERVICE_NAME = "TeamsroomsService"
    DISPLAY_NAME = "Teamsrooms Web Service"
    DESCRIPTION = "Service pour l'application Teamsrooms en continu"
    
    @classmethod
    def create_service(cls):
        try:
            # Configuration du service
            python_exe = sys.executable
            script_path = r"C:\Teamsrooms\app.py"
            
            # Création via pywin32
            win32serviceutil.HandleCommandLine(
                cls.SERVICE_NAME,
                serviceClass=None,
                exeName=python_exe,
                startType='auto',
                displayName=cls.DISPLAY_NAME,
                description=cls.DESCRIPTION,
                modulePath=script_path
            )
            
            # Configuration supplémentaire
            subprocess.run(f'sc description {cls.SERVICE_NAME} "{cls.DESCRIPTION}"', shell=True)
            subprocess.run(f'sc failure {cls.SERVICE_NAME} reset=86400 actions=restart/5000', shell=True)
            
            # Démarrage du service
            win32serviceutil.StartService(cls.SERVICE_NAME)
            return True
        except Exception as e:
            messagebox.showerror("Erreur", f"Échec de la création du service : {str(e)}")
            return False

# =============================================================================
# Gestion des raccourcis Chrome
# =============================================================================
class ChromeManager:
    @staticmethod
    def get_chrome_path():
        paths = [
            r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
        ]
        return next((p for p in paths if os.path.exists(p)), None)

    @classmethod
    def create_kiosk_shortcut(cls, room, mode):
        chrome_path = cls.get_chrome_path()
        if not chrome_path:
            messagebox.showerror("Erreur", "Chrome non installé")
            return False

        url = f"http://{'localhost:5000' if mode == 'local' else 'teamsrooms-11a8c77873e7.herokuapp.com'}/{room.lower()}"
        
        flags = [
            '--kiosk',
            '--fullscreen',
            '--no-first-run',
            '--disable-infobars',
            '--disable-session-crashed-bubble',
            '--disable-features=TranslateUI',
            '--no-default-browser-check',
            url
        ]
        
        try:
            shell = win32com.client.Dispatch("WScript.Shell")
            shortcut_path = os.path.join(os.environ['USERPROFILE'], 'Desktop', f"Teamsrooms - {room} ({mode}).lnk")
            shortcut = shell.CreateShortCut(shortcut_path)
            shortcut.TargetPath = chrome_path
            shortcut.Arguments = ' '.join(flags)
            shortcut.WorkingDirectory = os.path.dirname(chrome_path)
            shortcut.IconLocation = chrome_path
            shortcut.save()
            return True
        except Exception as e:
            messagebox.showerror("Erreur", f"Création du raccourci échouée : {str(e)}")
            return False

# =============================================================================
# Interface Graphique Modernisée
# =============================================================================
APP_VERSION = "2.1.0"
COLOR_ACCENT = '#3F51B5'
STYLE_CONFIG = {
    'TButton': {'configure': {'anchor': 'center'}},
    'Accent.TButton': {'map': {'background': [('active', COLOR_ACCENT), ('!disabled', COLOR_ACCENT)]}},
    'Header.TLabel': {'configure': {'padding': 10}}
}

class Application(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Teamsrooms Manager PRO")
        self.geometry("1000x680")
        self.configure(bg="#f0f0f0")
        self.resizable(True, True)
        
        # Style moderne
        self.style = ttk.Style()
        self.style.theme_use('clam')
        self.style.configure('TNotebook.Tab', font=('Helvetica', 10, 'bold'), padding=[15, 5])
        self.style.configure('TButton', font=('Helvetica', 10), padding=6)
        self.style.configure('Accent.TButton', font=('Helvetica', 10, 'bold'), foreground='white', background=COLOR_ACCENT)
        self.style.configure('Header.TLabel', font=('Helvetica', 14, 'bold'), background=COLOR_ACCENT, foreground='white')
        
        # Variables d'état
        self.var_auto_start = tk.BooleanVar(value=True)
        self.selected_room = tk.StringVar(value="Tramontane")
        self.mode_var = tk.StringVar(value="local")
        self.commit_message = tk.StringVar()
        
        # Configuration de l'interface
        self.create_widgets()
        self.create_status_bar()
        
    def create_widgets(self):
        # Notebook (Onglets)
        notebook = ttk.Notebook(self)
        notebook.pack(fill='both', expand=True, padx=10, pady=10)
        
        # Onglet Service
        service_tab = ttk.Frame(notebook)
        self.build_service_tab(service_tab)
        notebook.add(service_tab, text='📦 Service Windows')
        
        # Onglet Navigateurs
        browser_tab = ttk.Frame(notebook)
        self.build_browser_tab(browser_tab)
        notebook.add(browser_tab, text='🌐 Configuration Navigateur')
        
        # Onglet Déploiement
        deploy_tab = ttk.Frame(notebook)
        self.build_deploy_tab(deploy_tab)
        notebook.add(deploy_tab, text='🚀 Déploiement Cloud')
        
    def build_service_tab(self, parent):
        frame = ttk.LabelFrame(parent, text="Gestion du Service", padding=(15, 10))
        frame.pack(fill='both', expand=True, padx=10, pady=5)
        
        ttk.Checkbutton(
            frame, 
            text="Démarrage automatique avec Windows",
            variable=self.var_auto_start,
            style='Toolbutton'
        ).pack(anchor='w', pady=5)
        
        ttk.Button(
            frame,
            text="🔧 Créer/Redémarrer le Service",
            command=self.handle_service,
            style='Accent.TButton'
        ).pack(pady=10)
        
        # Section Logs
        log_frame = ttk.LabelFrame(frame, text="Journal d'activité", padding=(10, 5))
        log_frame.pack(fill='both', expand=True)
        
        self.log_console = scrolledtext.ScrolledText(log_frame, height=12, wrap=tk.WORD)
        self.log_console.pack(fill='both', expand=True)
        
    def build_browser_tab(self, parent):
        frame = ttk.LabelFrame(parent, text="Raccourcis Kiosque", padding=(15, 10))
        frame.pack(fill='both', expand=True, padx=10, pady=5)
        
        # Sélection de la salle
        ttk.Label(frame, text="Salle de réunion:").grid(row=0, column=0, sticky='w', padx=5, pady=5)
        room_combo = ttk.Combobox(
            frame, textvariable=self.selected_room,
            values=list(meeting_rooms.keys()), width=25
        )
        room_combo.grid(row=0, column=1, sticky='ew', padx=5, pady=5)
        
        # Mode de connexion
        ttk.Label(frame, text="Mode de connexion:").grid(row=1, column=0, sticky='w', padx=5, pady=5)
        ttk.Radiobutton(frame, text="Local 🖥️", variable=self.mode_var, value="local")\
            .grid(row=1, column=1, sticky='w', padx=5)
        ttk.Radiobutton(frame, text="Cloud ☁️", variable=self.mode_var, value="web")\
            .grid(row=1, column=2, sticky='w', padx=5)
        
        # Bouton création du raccourci
        ttk.Button(
            frame, 
            text="🛠️ Créer le raccourci", 
            command=self.create_chrome_shortcut,
            style='Accent.TButton'
        ).grid(row=2, column=0, columnspan=3, pady=15)
        
        frame.columnconfigure(1, weight=1)
        
    def build_deploy_tab(self, parent):
        frame = ttk.LabelFrame(parent, text="Gestion des Déploiements", padding=(15, 10))
        frame.pack(fill='both', expand=True, padx=10, pady=5)
        
        # Section GitHub
        github_frame = ttk.Frame(frame)
        github_frame.pack(fill='x', pady=5)
        
        ttk.Button(
            github_frame,
            text="🔄 Synchroniser dépôt local",
            command=self.sync_local_repo,
            style='TButton'
        ).pack(side='left', padx=2)
                 
        ttk.Button(
            github_frame,
            text="⏫ Pousser vers GitHub",
            command=self.push_to_github,
            style='TButton'
        ).pack(side='left', padx=2)
                 
        # Section Heroku
        heroku_frame = ttk.Frame(frame)
        heroku_frame.pack(fill='x', pady=5)
        
        ttk.Button(
            heroku_frame,
            text="🚀 Déployer sur Heroku",
            command=self.deploy_to_heroku,
            style='TButton'
        ).pack(side='left', padx=2)
        
        # Message de commit
        ttk.Label(frame, text="Message de commit:").pack(anchor='w', pady=(10, 2))
        commit_entry = ttk.Entry(frame, textvariable=self.commit_message, width=50)
        commit_entry.pack(fill='x', pady=5)
        
    def create_status_bar(self):
        status_frame = ttk.Frame(self, relief='sunken')
        status_frame.pack(side='bottom', fill='x')
        
        self.status_label = ttk.Label(status_frame, text="Prêt", anchor='w')
        self.status_label.pack(side='left', padx=5)
        
        ttk.Label(
            status_frame, 
            text=f"v{APP_VERSION} | © 2024 ANECOOP France",
            anchor='e'
        ).pack(side='right', padx=5)
        
    def handle_service(self):
        def service_task():
            if ServiceManager.create_service():
                messagebox.showinfo("Succès", "Service configuré avec succès!")
        threading.Thread(target=service_task, daemon=True).start()
        
    def create_chrome_shortcut(self):
        success = ChromeManager.create_kiosk_shortcut(
            self.selected_room.get(),
            self.mode_var.get()
        )
        if success:
            messagebox.showinfo("Succès", "Raccourci Chrome créé avec les paramètres de kiosque!")
    
    def sync_local_repo(self):
        target_dir = r"C:\Teamsrooms"
        try:
            if os.path.exists(target_dir):
                run_command(f'cd /d "{target_dir}" && git pull', log_widget=self.log_console)
            else:
                run_command(f'git clone https://github.com/kaizen2025/teamsrooms.git "{target_dir}"', log_widget=self.log_console)
            
            # Installation des dépendances
            requirements = os.path.join(target_dir, "requirements.txt")
            if os.path.exists(requirements):
                run_command(f'cd /d "{target_dir}" && {sys.executable} -m pip install -r requirements.txt', log_widget=self.log_console)
        except Exception as e:
            messagebox.showerror("Erreur", f"Échec de la synchronisation : {str(e)}")
    
    def push_to_github(self):
        commit_msg = self.commit_message.get() or "Mise à jour depuis Teamsrooms Manager PRO"
        commands = [
            'git add .',
            f'git commit -m "{commit_msg}"',
            'git push'
        ]
        try:
            for cmd in commands:
                run_command(cmd, log_widget=self.log_console)
            messagebox.showinfo("Succès", "Modifications poussées vers GitHub!")
        except Exception as e:
            messagebox.showerror("Erreur", f"Échec du push vers GitHub : {str(e)}")
    
    def deploy_to_heroku(self):
        commit_msg = self.commit_message.get() or "Mise à jour pour déploiement"
        # Remplacez 'your-heroku-app-name' par le nom réel de votre application Heroku
        commands = [
            'heroku git:remote -a teamsrooms',
            'git add .',
            f'git commit -m "{commit_msg}"',
            'git push heroku master'
        ]
        try:
            for cmd in commands:
                run_command(cmd, log_widget=self.log_console)
            messagebox.showinfo("Succès", "Déploiement sur Heroku terminé!")
        except Exception as e:
            messagebox.showerror("Erreur", f"Échec du déploiement sur Heroku : {str(e)}")

# --- Mise à jour automatique de l'exécutable ---
def get_file_hash(file_path):
    hasher = hashlib.md5()
    with open(file_path, 'rb') as f:
        buf = f.read()
        hasher.update(buf)
    return hasher.hexdigest()

def check_for_updates():
    deploy_py_path = os.path.abspath(__file__)
    deploy_exe_path = os.path.join(os.path.dirname(deploy_py_path), 'dist', 'deploy.exe')
    
    if not os.path.exists(deploy_exe_path):
        return False
    
    return get_file_hash(deploy_py_path) != get_file_hash(deploy_exe_path)

def update_executable():
    if check_for_updates():
        response = messagebox.askyesno("Mise à jour", "Nouvelle version détectée. Mettre à jour l'exécutable ?")
        if response:
            try:
                subprocess.run(['pyinstaller', '--onefile', '--windowed', __file__], check=True)
                messagebox.showinfo("Succès", "Exécutable mis à jour!")
            except Exception as e:
                messagebox.showerror("Erreur", f"Échec de la mise à jour : {str(e)}")

# --- Données de configuration des salles ---
meeting_rooms = {
    "Canigou": {"email": "Sallecanigou@anecoop-france.com"},
    "Castillet": {"email": "Sallecastillet@anecoop-france.com"},
    "Florensud": {"email": "salleflorensud@florensud.fr"},
    "Mallorca": {"email": "Sallemallorca@anecoop-france.com"},
    "Mimosa": {"email": "Sallemimosa@florensud.fr"},
    "Pivoine": {"email": "SallePivoine@florensud.fr"},
    "Renoncule": {"email": "SalleRenoncule@florensud.fr"},
    "Tramontane": {"email": "Salletramontane@anecoop-france.com"},
}

if __name__ == "__main__":
    update_executable()
    app = Application()
    app.mainloop()
