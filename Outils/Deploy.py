import os
import sys
import subprocess
import threading
import tkinter as tk
from tkinter import scrolledtext, messagebox

# Forcer l'encodage UTF-8
sys.stdout.reconfigure(encoding='utf-8')

def run_command(command):
    """Exécute une commande et affiche la sortie en temps réel."""
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
    for line in process.stdout:
        log_console.insert(tk.END, line + "\n")
        log_console.see(tk.END)
        root.update()
    
    for line in process.stderr:
        log_console.insert(tk.END, "ERREUR: " + line + "\n", "error")
        log_console.see(tk.END)
        root.update()

def install_heroku():
    log_console.insert(tk.END, "[INSTALL] Installation de Heroku CLI...\n")
    root.update()
    run_command("winget install -e --id Heroku.HerokuCLI")

def install_git():
    log_console.insert(tk.END, "[INSTALL] Installation de Git...\n")
    root.update()
    run_command("winget install -e --id Git.Git")

def check_git():
    log_console.insert(tk.END, "[1/6] Vérification de Git...\n")
    root.update()
    process = subprocess.run(["git", "--version"], capture_output=True, text=True)
    if process.returncode != 0:
        install_git()
        return False
    return True

def check_heroku():
    log_console.insert(tk.END, "[2/6] Vérification de Heroku CLI...\n")
    root.update()
    process = subprocess.run(["where", "heroku"], capture_output=True, text=True, shell=True)
    if process.returncode != 0:
        install_heroku()
        return False
    return True

def check_heroku_auth():
    log_console.insert(tk.END, "[3/6] Vérification de l'authentification Heroku...\n")
    root.update()
    process = subprocess.run(["heroku", "auth:whoami"], capture_output=True, text=True, shell=True)
    if process.returncode != 0:
        log_console.insert(tk.END, "Vous n'êtes pas connecté à Heroku. Démarrage de la connexion...\n", "error")
        root.update()
        subprocess.run("start cmd /k heroku login", shell=True)
        return False
    return True

def sync_github():
    log_console.insert(tk.END, "[4/6] Synchronisation avec GitHub...\n")
    root.update()
    run_command("git add --all && git commit -m \"Auto-deploy\" && git push origin main")

def deploy_heroku():
    log_console.insert(tk.END, "[5/6] Déploiement sur Heroku...\n")
    root.update()
    run_command("git push https://git.heroku.com/teamsrooms.git main")
    log_console.insert(tk.END, "Déploiement terminé avec succès!\n")

def start_deployment():
    def threaded_deployment():
        if check_git() and check_heroku():
            if not check_heroku_auth():
                return
            sync_github()
            deploy_heroku()
    
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

# Compilation en .exe avec PyInstaller
if __name__ == "__main__":
    try:
        import PyInstaller.__main__
    except ImportError:
        subprocess.run("pip install pyinstaller", shell=True)
    
    subprocess.run("pyinstaller --onefile --windowed --name DeployApp deploy_gui.py", shell=True)
