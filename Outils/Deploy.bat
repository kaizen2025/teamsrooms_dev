@echo off
setlocal enabledelayedexpansion

:: Configuration
set PROJECT_DIR=C:\TeamsRooms
set GIT_BRANCH=main
set HEROKU_APP=teamsrooms
set GIT_REPO=https://github.com/kaizen2025/teamsrooms.git

:: Couleurs (supprimer si problèmes d'affichage)
set RED=[91m
set GREEN=[92m
set RESET=[0m

echo %GREEN%[1/6]%RESET% Vérification du dossier projet...
if not exist "%PROJECT_DIR%" (
    echo %RED%ERREUR: Dossier projet introuvable!%RESET%
    pause
    exit /b 1
)

cd /D "%PROJECT_DIR%"

echo %GREEN%[2/6]%RESET% Synchronisation avec GitHub...
git remote add origin %GIT_REPO% 2>nul

echo %GREEN%[3/6]%RESET% Ajout des modifications...
git add --all || goto error

echo %GREEN%[4/6]%RESET% Création du commit...
set "timestamp=%date:~-4%-%date:~3,2%-%date:~0,2%_%time:~0,2%-%time:~3,2%"
git commit -m "Auto-deploy: !timestamp!" || goto error

echo %GREEN%[5/6]%RESET% Envoi vers GitHub...
git push -u origin %GIT_BRANCH% || goto error

echo %GREEN%[6/6]%RESET% Déploiement Heroku...
git push https://git.heroku.com/%HEROKU_APP%.git %GIT_BRANCH%:main || goto error

echo.
echo %GREEN%[SUCCÈS] Déploiement complet!%RESET%
echo.
timeout /t 5
exit /b 0

:error
echo.
echo %RED%[ERREUR] Échec du déploiement!%RESET%
echo.
pause
exit /b 1