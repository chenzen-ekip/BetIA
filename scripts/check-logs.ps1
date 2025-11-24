# Script pour vérifier les logs récents de l'application
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Analyse des Logs BetIA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Next.js tourne
$nextProcess = Get-Process | Where-Object {$_.ProcessName -eq "node"} | Select-Object -First 1

if ($nextProcess) {
    Write-Host "✅ Serveur Next.js détecté (PID: $($nextProcess.Id))" -ForegroundColor Green
    Write-Host ""
    Write-Host "Les logs s'affichent dans le terminal où vous avez lancé 'npm run dev'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Points à vérifier dans les logs :" -ForegroundColor Cyan
    Write-Host "  1. 🔍 Détection d'équipe" -ForegroundColor White
    Write-Host "  2. 📡 Appel API-Football" -ForegroundColor White
    Write-Host "  3. ✅ Données récupérées" -ForegroundColor White
    Write-Host "  4. 🔍 Recherche web (si déclenchée)" -ForegroundColor White
    Write-Host "  5. ❌ Erreurs éventuelles" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "⚠️ Aucun processus Node.js détecté" -ForegroundColor Yellow
    Write-Host "Le serveur Next.js ne semble pas tourner" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Pour analyser les logs, copiez-collez les lignes du terminal ici." -ForegroundColor Cyan
Write-Host ""

