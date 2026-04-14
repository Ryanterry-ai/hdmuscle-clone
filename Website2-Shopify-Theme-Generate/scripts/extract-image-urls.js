// Step 1: Extract all product image URLs from Morphogen Nutrition website
// Run with: node extract-image-urls.js

const https = require('https');
const fs = require('fs');

const shopDomain = 'www.morphogennutrition.com';
const outputFile = './image-urls.json';

async function fetchPage(path) {
  return new Promise((resolve, reject) => {
    https.get(`https://${shopDomain}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function extractProductImages() {
  console.log('Fetching product collection pages...\n');
  
  const imageUrls = new Set();
  
  // Fetch main products page
  try {
    const html = await fetchPage('/collections/all');
    
    // Extract image URLs from the HTML
    const imgRegex = /https:\/\/www\.morphogennutrition\.com\/cdn\/shop\/files\/[^"'>\s]+\.(jpg|jpeg|png|webp)/gi;
    const matches = html.match(imgRegex);
    
    if (matches) {
      matches.forEach(url => {
        // Normalize URL
        const normalizedUrl = url.replace(/\?v=.*$/, '').split('?')[0];
        imageUrls.add(normalizedUrl);
      });
    }
    
    // Also try to extract from product links
    const productLinkRegex = /\/products\/([a-z0-9-]+)/gi;
    let productMatch;
    const products = new Set();
    
    while ((productMatch = productLinkRegex.exec(html)) !== null) {
      products.add(productMatch[1]);
    }
    
    console.log(`Found ${products.size} product links`);
    console.log(`Found ${imageUrls.size} unique images so far`);
    
    // Fetch a few product pages to get more images
    const productArray = Array.from(products).slice(0, 20); // Limit to avoid too many requests
    
    for (const productHandle of productArray) {
      try {
        const productHtml = await fetchPage(`/products/${productHandle}`);
        
        // Extract main product image
        const mainImgRegex = /https:\/\/www\.morphogennutrition\.com\/cdn\/shop\/files\/[^"'>\s]+\.(jpg|jpeg|png|webp)/gi;
        const mainMatches = productHtml.match(mainImgRegex);
        
        if (mainMatches) {
          mainMatches.forEach(url => {
            const normalizedUrl = url.replace(/\?v=.*$/, '').split('?')[0];
            imageUrls.add(normalizedUrl);
          });
        }
        
        console.log(`✓ Fetched: ${productHandle}`);
      } catch (e) {
        console.log(`✗ Error fetching ${productHandle}: ${e.message}`);
      }
    }
    
  } catch (e) {
    console.error('Error fetching main page:', e.message);
  }
  
  // Also add common/catalog images
  const commonImages = [
    'https://www.morphogennutrition.com/cdn/shop/files/LOGO_WEB_GRID.png',
    'https://www.morphogennutrition.com/cdn/shop/files/BRAND_NAME_LOGO.webp',
    'https://www.morphogennutrition.com/cdn/shop/files/BCAA.jpg',
    'https://www.morphogennutrition.com/cdn/shop/files/Creatine.jpg',
    'https://www.morphogennutrition.com/cdn/shop/files/PreWorkout.jpg',
    'https://www.morphogennutrition.com/cdn/shop/files/Whey.jpg',
    'https://www.morphogennutrition.com/cdn/shop/files/Casein.jpg',
    'https://www.morphogennutrition.com/cdn/shop/files/FatBurner.jpg',
    'https://www.morphogennutrition.com/cdn/shop/files/Multi.jpg',
    'https://www.morphogennutrition.com/cdn/shop/files/FishOil.jpg',
  ];
  
  commonImages.forEach(url => imageUrls.add(url));
  
  const urlsArray = Array.from(imageUrls);
  
  // Save to file
  fs.writeFileSync(outputFile, JSON.stringify(urlsArray, null, 2));
  
  console.log(`\n=== RESULT ===`);
  console.log(`Total unique image URLs: ${urlsArray.length}`);
  console.log(`Saved to: ${outputFile}`);
  
  return urlsArray;
}

extractProductImages();