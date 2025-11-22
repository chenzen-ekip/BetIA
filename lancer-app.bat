@echo off
echo ========================================
echo   BetIA - Assistant Paris Sportifs
echo ========================================
echo.
echo Demarrage du serveur de developpement...
echo.

REM Vérifier si Node.js est installé
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: Node.js n'est pas installe ou n'est pas dans le PATH
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

REM Vérifier si les dépendances sont installées
if not exist "node_modules" (
    echo Installation des dependances...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERREUR: Echec de l'installation des dependances
        pause
        exit /b 1
    )
)

REM Vérifier si .env.local existe
if not exist ".env.local" (
    echo.
    echo ATTENTION: Le fichier .env.local n'existe pas!
    echo Veuillez creer ce fichier avec votre clé API OpenAI:
    echo OPENAI_API_KEY=sk-votre-cle-api-ici
    echo.
    pause
)

REM Attendre 3 secondes puis ouvrir le navigateur
start "" "http://localhost:3000"

REM Lancer le serveur de développement
echo.
echo Le serveur demarre sur http://localhost:3000
echo Le navigateur va s'ouvrir automatiquement...
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.

call npm run dev


