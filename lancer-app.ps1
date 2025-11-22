# Script PowerShell pour lancer BetIA
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BetIA - Assistant Paris Sportifs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Node.js est installé
try {
    $null = Get-Command node -ErrorAction Stop
} catch {
    Write-Host "ERREUR: Node.js n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    Write-Host "Veuillez installer Node.js depuis https://nodejs.org/" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

# Vérifier si les dépendances sont installées
if (-not (Test-Path "node_modules")) {
    Write-Host "Installation des dépendances..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERREUR: Échec de l'installation des dépendances" -ForegroundColor Red
        Read-Host "Appuyez sur Entrée pour quitter"
        exit 1
    }
}

# Vérifier si .env.local existe
if (-not (Test-Path ".env.local")) {
    Write-Host ""
    Write-Host "ATTENTION: Le fichier .env.local n'existe pas!" -ForegroundColor Yellow
    Write-Host "Veuillez créer ce fichier avec votre clé API OpenAI:" -ForegroundColor Yellow
    Write-Host "OPENAI_API_KEY=sk-votre-cle-api-ici" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Appuyez sur Entrée pour continuer quand même"
}

# Attendre 3 secondes puis ouvrir le navigateur
Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"

# Lancer le serveur de développement
Write-Host ""
Write-Host "Le serveur démarre sur http://localhost:3000" -ForegroundColor Green
Write-Host "Le navigateur va s'ouvrir automatiquement..." -ForegroundColor Green
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arrêter le serveur" -ForegroundColor Yellow
Write-Host ""

npm run dev


