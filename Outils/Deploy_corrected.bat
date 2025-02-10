@echo off
setlocal enabledelayedexpansion

:: Configuration
set PROJECT_DIR=C:\TeamsRooms
set GIT_BRANCH=main
set HEROKU_APP=teamsrooms
set GIT_REPO=https://github.com/kaizen2025/teamsrooms.git

:: Vérification de l'encodage UTF-8 corrigé
chcp 65001 >nul

:: Vérification du dossier projet
echo [1/6] Vérification du dossier projet...
if not exist "%PROJECT_DIR%" (
    echo ERREUR: Dossier projet introuvable!
    pause
    exit /b 1
)
cd /d "%PROJECT_DIR%"

:: Vérification de Git
echo [2/6] Vérification de Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Git n'est pas installé. Installez-le avant de continuer.
    pause
    exit /b 1
)

:: Synchronisation avec GitHub
echo [3/6] Synchronisation avec GitHub...
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    git remote add origin %GIT_REPO%
)

:: Ajout des modifications
git add --all
git commit -m "Auto-deploy: %date% %time%" 2>nul

:: Envoi vers GitHub
echo [4/6] Envoi vers GitHub...
git push -u origin %GIT_BRANCH%
if %errorlevel% neq 0 (
    echo ERREUR: Échec de l'envoi sur GitHub.
    pause
    exit /b 1
)

:: Vérification de Heroku CLI
echo [5/6] Vérification de Heroku CLI...
where heroku >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Heroku CLI n'est pas installé. Installez-le via:
    echo winget install -e --id Heroku.HerokuCLI
    pause
    exit /b 1
)

:: Vérification de l'authentification Heroku
echo [6/6] Vérification de la connexion Heroku...
heroku auth:whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Vous n'êtes pas connecté à Heroku. Connectez-vous avec:
    echo heroku login
    pause
    exit /b 1
)

:: Déploiement Heroku
echo [7/7] Déploiement Heroku...
git push https://git.heroku.com/%HEROKU_APP%.git %GIT_BRANCH%:main
if %errorlevel% neq 0 (
    echo ERREUR: Échec du déploiement Heroku.
    pause
    exit /b 1
)

echo Déploiement terminé avec succès!
pause
