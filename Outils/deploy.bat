@echo off
setlocal enabledelayedexpansion

:: Définition du message de commit automatique
set COMMIT_MESSAGE="Auto-deploy"

echo [1/4] Vérification de Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git non installé ! Installez-le d'abord.
    pause
    exit /b
)

echo [2/4] Vérification des modifications locales...
git status --porcelain > temp.txt
set /p STATUS= < temp.txt
del temp.txt

if "!STATUS!"=="" (
    echo ✅ Aucun changement à pousser.
) else (
    echo [3/4] Ajout et commit des modifications...
    git add --all
    git commit -m %COMMIT_MESSAGE%
)

echo [4/4] Poussée vers GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ❌ Échec du push GitHub !
    pause
    exit /b
)

echo [5/4] Poussée vers Heroku...
git push heroku main
if %errorlevel% neq 0 (
    echo ❌ Échec du push Heroku !
    pause
    exit /b
)

echo 🚀 Déploiement terminé avec succès !
pause
