@echo off
setlocal enabledelayedexpansion

:: Configuration
set PROJECT_DIR=C:\TeamsRooms
set GIT_BRANCH=main
set LOG_FILE=%PROJECT_DIR%\update.log

:: Fonction de logging
:log
echo [%date% %time%] %* >> "%LOG_FILE%"
goto :eof

:: Début du script
cd /d "%PROJECT_DIR%"

echo Vérification des mises à jour...
call :log "Début de la vérification des mises à jour"

:: Vérifier les modifications distantes
git fetch origin %GIT_BRANCH% >> "%LOG_FILE%" 2>&1

git diff --name-only %GIT_BRANCH% origin/%GIT_BRANCH% >nul
if %errorlevel% equ 0 (
    echo Aucune mise à jour disponible
    call :log "Aucune mise à jour disponible"
    timeout /t 5
    exit /b 0
)

echo Mise à jour disponible! Installation...
call :log "Mise à jour détectée"

:: Stash des modifications locales
git stash >> "%LOG_FILE%" 2>&1

:: Pull des modifications
git pull origin %GIT_BRANCH% >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
    call :log "Erreur lors du pull"
    goto error
)

:: Mise à jour des dépendances
call venv\Scripts\activate
pip install -r requirements.txt >> "%LOG_FILE%" 2>&1

:: Restart applicatif
echo Redémarrage de l'application...
call :log "Redémarrage de l'application"
taskkill /IM python.exe /F >nul 2>&1
start "" python app.py

echo Mise à jour terminée avec succès!
call :log "Mise à jour réussie"
timeout /t 5
exit /b 0

:error
echo Erreur lors de la mise à jour! Voir %LOG_FILE%
call :log "Erreur critique"
pause
exit /b 1