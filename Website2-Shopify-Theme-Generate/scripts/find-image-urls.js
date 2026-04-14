// Try to find actual image URLs from website
const fs = require('fs');
const https = require('https');

const baseUrl = 'https://www.morphogennutrition.com';

function fetchURL(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function findImages() {
  console.log('Fetching product page to find image URLs...\n');
  
  // Fetch a product page to see actual image URLs
  const html = await fetchURL(`${baseUrl}/products/creatine`);
  
  // Look for image patterns in the HTML
  const imagePatterns = [
    /cdn\.shopify\.com\/s\/files\/\d+:\d+\/[^"'>\s]+\.(jpg|jpeg|png|webp)/gi,
    /cdn\/shop\/files\/[^"'>\s]+\.(jpg|jpeg|png|webp)/gi,
  ];
  
  imagePatterns.forEach(pattern => {
    const matches = html.match(pattern);
    if (matches) {
      console.log(`Found ${matches.length} images with pattern`);
      matches.slice(0, 10).forEach(m => console.log(`  - ${m}`));
    }
  });
  
  // Also look for specific data attributes
  const srcSetMatch = html.match(/src="([^"]*cdn[^"]*)"/g);
  if (srcSetMatch) {
    console.log('\nFound src attributes:');
    srcSetMatch.slice(0, 5).forEach(m => console.log(`  ${m}`));
  }
}

findImages().catch(console.error);