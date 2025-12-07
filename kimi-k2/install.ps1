Write-Host "🌊 Installation d'Écho des Vagues sur Windows"
Write-Host "📁 Création de la structure..."

# Structure complète
 = @("frontend\src", "frontend\public", "backend\src", "backend\models", "admin\src", "docs", "scripts")
foreach ( in ) {
    New-Item -ItemType Directory -Path  -Force
}

Write-Host "✅ Structure créée!"

# Créer package.json de base pour le backend
@'
{
  "name": "echo-des-vagues-backend",
  "version": "1.0.0",
  "description": "Backend API pour Écho des Vagues",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
'@ | Out-File -FilePath "backend\package.json" -Encoding UTF8

Write-Host "🎉 Installation de base terminée!"
Write-Host "📖 Prochaines étapes:"
Write-Host "   1. Installez Node.js depuis nodejs.org"
Write-Host "   2. Ouvrez un nouveau PowerShell dans ce dossier"
Write-Host "   3. Exécutez : npm install"
