# ================================
# AI Shopify Cloner - Setup Script
# ================================

Write-Host "Setting up AI Shopify Cloner..." -ForegroundColor Cyan

Set-Location "C:\Users\viren\ai-shopify-cloner"

if (Test-Path "node_modules") {
    Write-Host "Removing node_modules..."
    Remove-Item -Recurse -Force "node_modules"
}

if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
}

if (-not (Test-Path "package.json")) {
    Write-Host "Initializing package.json..."
    npm init -y
}

Write-Host "Installing core dependencies..."
npm install playwright axios cheerio fs-extra archiver jsdom node-fetch json2csv glob

Write-Host "Installing animation libraries..."
npm install gsap framer-motion

Write-Host "Installing dev tools..."
npm install chalk ora nodemon

Write-Host "Installing Playwright browsers..."
npx playwright install

Write-Host "Installing Shopify CLI..."
npm install -g @shopify/cli

Write-Host "Verifying setup..."
node -v
npm -v
npx playwright --version

try {
    shopify version
} catch {
    Write-Host "Shopify CLI not found or failed to install." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "Run: .\run.ps1 https://example.com"
