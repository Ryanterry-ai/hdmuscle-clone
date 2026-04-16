param(
    [string]$url
)

if (-not $url) {
    Write-Host "Missing URL"
    Write-Host "Usage: .\run.ps1 https://example.com"
    exit 1
}

Write-Host "Running AI Shopify Cloner..." -ForegroundColor Cyan
Write-Host "Target: $url"

Set-Location "C:\Users\viren\ai-shopify-cloner"

# Clean output
if (Test-Path "output") {
    Write-Host "Cleaning old output..."
    Remove-Item -Recurse -Force "output"
}

Write-Host ""
Write-Host ">> Full Pipeline" -ForegroundColor Yellow
node "scripts/crawl-site.js" $url

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed running full pipeline" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Pipeline Completed Successfully!" -ForegroundColor Green
Write-Host "Check output folder for theme.zip and public.zip"
