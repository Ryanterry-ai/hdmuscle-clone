# Shopify Import via PowerShell
# Run this in PowerShell

$STORE = "0h5kgk-cq.myshopify.com"
$PRODUCTS_FILE = "output\export\products.json"

# Get token - you'll be prompted or set manually
if (-not $env:SHOPIFY_TOKEN) {
    Write-Host "==============================================="
    Write-Host "Set your Shopify Admin API token:"
    Write-Host '$env:SHOPIFY_TOKEN = "shpat_xxxxx..."'
    Write-Host "==============================================="
    $env:SHOPIFY_TOKEN = Read-Host "Enter Shopify token (shpat_...)"
}

$products = Get-Content $PRODUCTS_FILE | ConvertFrom-Json
Write-Host "Products to import:" $products.Count

$success = 0
$failed = 0

foreach ($p in $products) {
    Write-Host "[$($success + $failed + 1)/$($products.Count)]" $p.handle -NoNewline
    
    $body = @{
        product = @{
            title = $p.title
            body_html = $p.body_html.Substring(0, [Math]::Min(5000, $p.body_html.Length))
            vendor = $p.vendor
            product_type = $p.product_type
            tags = $p.tags
            handle = $p.handle
            variants = @(@{
                price = $p.price
                compare_at_price = $p.compare_at_price
                sku = $p.sku
            })
        }
    } | ConvertTo-Json -Depth 3

    try {
        $response = Invoke-RestMethod -Uri "https://$STORE/admin/api/2024-01/products.json" `
            -Method Post `
            -Headers @{
                "Content-Type" = "application/json"
                "X-Shopify-Access-Token" = $env:SHOPIFY_TOKEN
            } `
            -Body $body `
            -ErrorAction Stop

        Write-Host " ✓ Created"
        $success++
    } catch {
        Write-Host " ✗" $_.Exception.Message.Substring(0, 50)
        $failed++
    }
}

Write-Host ""
Write-Host "==============================================="
Write-Host "RESULT:" $success "success," $failed "failed"
Write-Host "==============================================="