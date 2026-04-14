# Generate placeholder images using .NET System.Drawing
# Save as: generate-images.ps1
# Run with: powershell -ExecutionPolicy Bypass -File generate-images.ps1

Add-Type -AssemblyName System.Drawing

$outputDir = "C:\Users\viren\Downloads\ai-website-cloner-template-master\ai-website-cloner-template-master\Website2-Shopify-Theme-Generate\product-images"

if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force
}

$products = @(
    @{Filename="creatine.jpg"; Title="Creatine"; Price="$24.99"},
    @{Filename="alphagen-max.jpg"; Title="AlphaGen Max"; Price="$54.99"},
    @{Filename="brain.jpg"; Title="Brain"; Price="$49.99"},
    @{Filename="burn.jpg"; Title="Burn Fat Burner"; Price="$56.99"},
    @{Filename="calm.jpg"; Title="Calm"; Price="$56.99"},
    @{Filename="d3-k2.jpg"; Title="D3 K2 Vitamins"; Price="$18.00"},
    @{Filename="glutamine.jpg"; Title="Glutamine"; Price="$27.99"},
    @{Filename="heart.jpg"; Title="Heart Health"; Price="$52.99"},
    @{Filename="joint.jpg"; Title="Joint Support"; Price="$52.99"},
    @{Filename="liver.jpg"; Title="Liver Support"; Price="$52.99"},
    @{Filename="multi.jpg"; Title="Multi Vitamins"; Price="$51.99"},
    @{Filename="nightcap.jpg"; Title="NightCap"; Price="$52.99"},
    @{Filename="nutrigreens.jpg"; Title="NutriGreens"; Price="$52.99"},
    @{Filename="fishoil.jpg"; Title="Omega Fish Oil"; Price="$48.99"},
    @{Filename="pump-max.jpg"; Title="Pump Max"; Price="$49.99"},
    @{Filename="recovery.jpg"; Title="Recovery Aminos"; Price="$51.99"},
    @{Filename="thermogen.jpg"; Title="Thermogen"; Price="$48.99"},
    @{Filename="volugen.jpg"; Title="Volugen"; Price="$55.99"},
    @{Filename="shrooms.jpg"; Title="Mushrooms"; Price="$36.00"},
    @{Filename="vegagen.jpg"; Title="VegaGen"; Price="$36.00"},
    @{Filename="thyroid.jpg"; Title="Thyroid"; Price="$32.00"},
    @{Filename="biome.jpg"; Title="Biome Gut"; Price="$52.99"},
    @{Filename="bolic.jpg"; Title="Bolic Max"; Price="$51.99"},
    @{Filename="collagen.jpg"; Title="Collagen"; Price="$36.99"},
    @{Filename="cortisol.jpg"; Title="Cortisol"; Price="$48.99"},
    @{Filename="hydrate.jpg"; Title="Hydrate"; Price="$44.99"},
    @{Filename="kidney.jpg"; Title="Kidney"; Price="$59.99"},
    @{Filename="lean.jpg"; Title="Lean"; Price="$48.00"},
    @{Filename="mens-libido.jpg"; Title="Mens Libido"; Price="$51.99"},
    @{Filename="prime.jpg"; Title="Prime Health"; Price="$57.99"},
    @{Filename="pms.jpg"; Title="PMS Support"; Price="$35.99"},
    @{Filename="womens.jpg"; Title="Womens Health"; Price="$51.99"},
    @{Filename="adaptogen.jpg"; Title="Adaptogen"; Price="$52.99"}
)

Write-Host "Generating product placeholder images..." -ForegroundColor Cyan
Write-Host ""

foreach ($p in $products) {
    $bitmap = New-Object System.Drawing.Bitmap(600, 600)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Background
    $graphics.Clear([System.Drawing.Color]::FromArgb(245, 245, 245))
    
    # White card
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $graphics.FillRectangle($whiteBrush, 50, 50, 500, 420)
    
    # Border
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(224, 224, 224), 1)
    $graphics.DrawRectangle($pen, 50, 50, 500, 420)
    
    # Circle with M
    $darkBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(28, 29, 29))
    $graphics.FillEllipse($darkBrush, 220, 130, 160, 160)
    
    $fontTitle = New-Object System.Drawing.Font("Arial", 48, [System.Drawing.FontStyle]::Bold)
    $whiteBrush2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $graphics.DrawString("M", $fontTitle, $whiteBrush2, (New-Object System.Drawing.RectangleF(220, 130, 160, 160)), $sf)
    
    # Bottom bar
    $graphics.FillRectangle($darkBrush, 50, 480, 500, 70)
    
    # Product name
    $fontName = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
    $graphics.DrawString($p.Title, $fontName, $whiteBrush2, 300, 510, $sf)
    
    # Price
    $fontPrice = New-Object System.Drawing.Font("Arial", 14)
    $graphics.DrawString($p.Price, $fontPrice, $whiteBrush2, 300, 535, $sf)
    
    # Brand
    $fontSmall = New-Object System.Drawing.Font("Arial", 10)
    $grayBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(136, 136, 136))
    $graphics.DrawString("Morphogen Nutrition", $fontSmall, $grayBrush, 550, 30)
    
    # Save
    $filepath = Join-Path $outputDir $p.Filename
    $bitmap.Save($filepath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    
    $graphics.Dispose()
    $bitmap.Dispose()
    
    Write-Host "[+] Created: $($p.Filename)" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== COMPLETE ===" -ForegroundColor Cyan
Write-Host "Created $($products.Count) images"
Write-Host "Location: $outputDir"

# List files
Get-ChildItem $outputDir | ForEach-Object { Write-Host "  - $($_.Name)" }