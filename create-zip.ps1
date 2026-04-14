$source = "C:\Users\viren\Downloads\ai-website-cloner-template-master\ai-website-cloner-template-master\Website2-Shopify-Theme-Generate"
$dest = "C:\Users\viren\Downloads\ai-website-cloner-template-master\ai-website-cloner-template-master\morphogen-theme.zip"

Compress-Archive -Path "$source\*" -DestinationPath "$dest" -Force

Write-Host "Theme ZIP created at: $dest"