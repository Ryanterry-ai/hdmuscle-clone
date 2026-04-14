const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const themeDir = 'C:/Users/viren/Downloads/ai-website-cloner-template-master/ai-website-cloner-template-master/Website2-Shopify-Theme-Generate';
const outputZip = 'C:/Users/viren/Downloads/ai-website-cloner-template-master/ai-website-cloner-template-master/morphogen-nutrition-theme.zip';

console.log('Creating ZIP file...');

try {
  execSync(`cd "${themeDir}" && powershell -Command "Compress-Archive -Path '*' -DestinationPath '${outputZip}' -Force"`, {
    stdio: 'inherit'
  });
  console.log('ZIP created:', outputZip);
} catch (e) {
  console.log('Trying alternative method...');
}