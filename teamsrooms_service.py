import win32serviceutil
import win32service
import win32event
import servicemanager
import socket
import subprocess
import sys
import time
import os

class TeamsroomsService(win32serviceutil.ServiceFramework):
    _svc_name_ = "TeamsroomsService"
    _svc_display_name_ = "Teamsrooms Service"
    _svc_description_ = "Service pour Teamsrooms - Lance app.py pour démarrer le serveur web."

    def __init__(self, args):
        win32serviceutil.ServiceFramework.__init__(self, args)
        # Crée un objet d'événement pour signaler l'arrêt du service.
        self.hWaitStop = win32event.CreateEvent(None, 0, 0, None)
        socket.setdefaulttimeout(60)
        self.is_running = True
        self.proc = None
        self.log_file = r"C:\Teamsrooms\service_debug_log.txt"
        self.log("Service initialisé.")

    def log(self, message):
        """Enregistre un message dans le log (à la fois dans l'Event Log et dans un fichier)."""
        servicemanager.LogInfoMsg(message)
        try:
            with open(self.log_file, "a") as f:
                f.write(f"{time.ctime()} - {message}\n")
        except Exception:
            pass

    def SvcStop(self):
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        self.is_running = False
        win32event.SetEvent(self.hWaitStop)
        if self.proc:
            try:
                self.log("Tentative d'arrêt de app.py...")
                self.proc.terminate()
                self.proc.wait(timeout=10)
                self.log("Processus app.py arrêté.")
            except Exception as e:
                self.log("Erreur lors de l'arrêt de app.py: " + str(e))

    def SvcDoRun(self):
        self.ReportServiceStatus(win32service.SERVICE_START_PENDING)
        time.sleep(1)  # courte pause d'initialisation
        self.ReportServiceStatus(win32service.SERVICE_RUNNING)
        self.main()

    def main(self):
        # Chemin vers app.py et répertoire de travail
        app_path = r"C:\Teamsrooms\app.py"
        working_dir = r"C:\Teamsrooms"
        if not os.path.exists(app_path):
            self.log("Erreur : app.py introuvable à " + app_path)
            return

        # Pour le débogage, utiliser python.exe (affiche la console d'erreur)
        python_exe = sys.executable
        if "pythonw" in python_exe.lower():
            python_exe = python_exe.replace("pythonw.exe", "python.exe")
        self.log("Utilisation de l'exécutable Python : " + python_exe)

        try:
            # Lancement de app.py en tant que sous-processus
            self.proc = subprocess.Popen([python_exe, app_path], cwd=working_dir)
            self.log(f"Lancement de app.py réussi, PID = {self.proc.pid}")
        except Exception as e:
            self.log("Erreur lors du lancement de app.py: " + str(e))
            return

        # Boucle principale du service
        while self.is_running:
            # Vérifier toutes les 5 secondes que le processus est toujours actif
            if self.proc.poll() is not None:
                self.log("Le processus app.py s'est terminé de manière inattendue avec le code " + str(self.proc.returncode))
                break
            time.sleep(5)

        self.log("Sortie de la boucle principale du service.")

if __name__ == '__main__':
    win32serviceutil.HandleCommandLine(TeamsroomsService)
