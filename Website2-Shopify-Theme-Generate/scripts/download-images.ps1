# PowerShell Image Download Script
# Save as: download-images.ps1
# Run with: powershell -ExecutionPolicy Bypass -File download-images.ps1

$outputDir = "C:\Users\viren\Downloads\ai-website-cloner-template-master\ai-website-cloner-template-master\Website2-Shopify-Theme-Generate\product-images"

# Create output directory if not exists
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force
}

# Product images to try (based on website analysis)
$images = @(
    "https://www.morphogennutrition.com/cdn/shop/files/BCAA.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/Creatine.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/PreWorkout.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/Whey.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/Casein.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/FatBurner.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/Multi.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/FishOil.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/TUDCA.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/Glutamine.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/Collagen.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/Adaptogen.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/AlphaGen.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/Brain.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/Burn.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/Calm.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/Liver.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/Heart.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/Joint.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/Thyroid.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/Greens.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/Pump.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/Recovery.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/Volugen.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/Nightcap.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/VegaGen.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/Shrooms.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/Omega.jpg",
    "https://www.morphogennutrition.com/cdn/shop/files/LOGO_WEB_GRID.png",
    "https://www.morphogennutrition.com/cdn/shop/files/BRAND_NAME_LOGO.webp"
)

$success = 0
$failed = 0

Write-Host "Downloading images from Morphogen Nutrition..." -ForegroundColor Cyan
Write-Host ""

foreach ($url in $images) {
    $filename = [System.IO.Path]::GetFileName($url)
    $filepath = Join-Path $outputDir $filename
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $filepath -TimeoutSec 30 -ErrorAction Stop
        Write-Host "[+] Downloaded: $filename" -ForegroundColor Green
        $success++
    }
    catch {
        Write-Host "[-] Failed: $filename" -ForegroundColor Yellow
        $failed++
    }
    
    Start-Sleep -Milliseconds 200
}

Write-Host ""
Write-Host "=== COMPLETE ===" -ForegroundColor Cyan
Write-Host "Success: $success" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Yellow
Write-Host "Saved to: $outputDir"

# List files
Write-Host ""
Write-Host "Files downloaded:" -ForegroundColor Cyan
Get-ChildItem $outputDir | ForEach-Object { Write-Host "  - $($_.Name)" }