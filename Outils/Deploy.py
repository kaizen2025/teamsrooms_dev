import os
import sys
import subprocess
import threading
import ctypes
import tkinter as tk
from tkinter import scrolledtext, messagebox

# Vérifier si le script s'exécute en mode administrateur
def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

# Redémarrer en mode administrateur si nécessaire
if not is_admin():
    ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, " " + __file__, None, 1)
    sys.exit()

# Forcer l'encodage UTF-8
sys.stdout.reconfigure(encoding='utf-8')

def run_command(command, ignore_warnings=False):
    """Exécute une commande et affiche la sortie en temps réel."""
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    for line in process.stdout:
        log_console.insert(tk.END, line + "\n")
        log_console.see(tk.END)
        root.update()
    
    for line in process.stderr:
        if ignore_warnings and "Warning" in line:
            continue
        log_console.insert(tk.END, "ERREUR: " + line + "\n", "error")
        log_console.see(tk.END)
        root.update()

def update_heroku():
    log_console.insert(tk.END, "[UPDATE] Vérification et mise à jour de Heroku CLI...\n")
    root.update()
    run_command("heroku update")

def check_gh_auth():
    log_console.insert(tk.END, "[AUTH] Vérification de l'authentification GitHub...\n")
    root.update()
    
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
    
    log_console.insert(tk.END, "❌ Non connecté à Heroku. Tentative de connexion...\n", "error")
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

# Interface graphique
root = tk.Tk()
root.title("Déploiement GitHub & Heroku")
root.geometry("600x400")

log_console = scrolledtext.ScrolledText(root, height=15, width=70)
log_console.pack(pady=10)
log_console.tag_config("error", foreground="red")

btn_start = tk.Button(root, text="Démarrer le déploiement", command=start_deployment)
btn_start.pack(pady=10)

root.mainloop()
