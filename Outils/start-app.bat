@echo off
setlocal

:: Configuration
set URL_PATH=/tramontane  :: À modifier selon la salle
set BROWSER="C:\Program Files\Google\Chrome\Application\chrome.exe"

:: Démarrer le serveur Flask
start "" python app.py

:: Attendre que le serveur soit prêt
timeout /t 5 >nul

:: Ouvrir le navigateur en plein écran
start %BROWSER% --start-fullscreen http://localhost:5000%URL_PATH%

exit