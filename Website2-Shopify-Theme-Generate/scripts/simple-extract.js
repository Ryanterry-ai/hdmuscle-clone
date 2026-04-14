// Simple image URL extractor using fetch (no Playwright needed)
// Run with: node scripts/simple-extract.js

const fs = require('fs');
const https = require('https');

const outputDir = './product-images';
const urlsFile = './image-urls.json';

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

async function extractAndDownload() {
  console.log('🔍 Starting image extraction...\n');
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Try to get product data from Shopify Storefront API
  const shopUrl = 'www.morphogennutrition.com';
  
  // Common product images based on website analysis
  // These are the main product images we found earlier
  const knownProductImages = [
    { handle: 'adaptogen-functional-mushrooms', filename: 'adaptogen.jpg' },
    { handle: 'alphagen-max-preworkout', filename: 'alphagen-max.jpg' },
    { handle: 'bolic-max-recovery', filename: 'bolic-max.jpg' },
    { handle: 'brain', filename: 'brain.jpg' },
    { handle: 'burn', filename: 'burn.jpg' },
    { handle: 'calm', filename: 'calm.jpg' },
    { handle: 'creatine', filename: 'creatine.jpg' },
    { handle: 'd3-k2-vitamin-fortification', filename: 'd3-k2.jpg' },
    { handle: 'glutamine', filename: 'glutamine.jpg' },
    { handle: 'heart-lipids', filename: 'heart-lipids.jpg' },
    { handle: 'heart-health', filename: 'heart-health.jpg' },
    { handle: 'joint-inflammation', filename: 'joint.jpg' },
    { handle: 'liver-tudca', filename: 'tudca.jpg' },
    { handle: 'liver-health', filename: 'liver-health.jpg' },
    { handle: 'multi-vitamins-minerals', filename: 'multi.jpg' },
    { handle: 'nightcap', filename: 'nightcap.jpg' },
    { handle: 'nutrigreens', filename: 'nutrigreens.jpg' },
    { handle: 'omega-fishoil-vitaminsupport', filename: 'fish-oil.jpg' },
    { handle: 'pump-max-blood-flow', filename: 'pump-max.jpg' },
    { handle: 'recovery-aminos', filename: 'recovery-aminos.jpg' },
    { handle: 'stainless-steel-shaker', filename: 'shaker.jpg' },
    { handle: 'thermogen-max-fat-loss', filename: 'thermogen.jpg' },
    { handle: 'thyroid', filename: 'thyroid.jpg' },
    { handle: 'volugen-max-nonstim-preworkout', filename: 'volugen.jpg' },
    { handle: 'womens-health-plus-libido', filename: 'womens-libido.jpg' },
    { handle: 'vegagen', filename: 'vegagen.jpg' },
    { handle: 'shrooms', filename: 'shrooms.jpg' },
  ];
  
  // Base URL for images
  const imageBaseUrl = `https://${shopUrl}/cdn/shop/files/`;
  
  const urls = [];
  const success = [];
  const failed = [];
  
  console.log(`📥 Attempting to download ${knownProductImages.length} product images...\n`);
  
  for (let i = 0; i < knownProductImages.length; i++) {
    const product = knownProductImages[i];
    const url = `${imageBaseUrl}${product.filename}`;
    const filepath = `${outputDir}/${product.filename}`;
    
    try {
      const response = await new Promise((resolve, reject) => {
        https.get(url, (res) => {
          if (res.statusCode === 200) {
            let data = [];
            res.on('data', chunk => data.push(chunk));
            res.on('end', () => {
              fs.writeFileSync(filepath, Buffer.concat(data));
              resolve('success');
            });
          } else {
            resolve('failed');
          }
        }).on('error', () => resolve('failed'));
      });
      
      if (response === 'success') {
        console.log(`✓ [${i + 1}/${knownProductImages.length}] Downloaded: ${product.filename}`);
        success.push(product.filename);
        urls.push(url);
      } else {
        console.log(`✗ [${i + 1}/${knownProductImages.length}] Not found: ${product.filename}`);
        failed.push(product.filename);
      }
    } catch (e) {
      console.log(`✗ [${i + 1}/${knownProductImages.length}] Error: ${product.filename}`);
      failed.push(product.filename);
    }
    
    await new Promise(r => setTimeout(r, 200));
  }
  
  // Try common image names as fallback
  const commonImages = [
    'BCAA', 'Creatine', 'PreWorkout', 'Whey', 'Casein', 
    'FatBurner', 'Multi', 'FishOil', 'Logo', 'BRAND'
  ];
  
  console.log(`\n🔄 Trying common image names...`);
  
  for (const name of commonImages) {
    const url = `${imageBaseUrl}${name}.jpg`;
    const filepath = `${outputDir}/${name}.jpg`;
    
    try {
      const response = await new Promise((resolve, reject) => {
        https.get(url, (res) => {
          if (res.statusCode === 200) {
            let data = [];
            res.on('data', chunk => data.push(chunk));
            res.on('end', () => {
              fs.writeFileSync(filepath, Buffer.concat(data));
              resolve('success');
            });
          } else {
            resolve('failed');
          }
        }).on('error', () => resolve('failed'));
      });
      
      if (response === 'success') {
        console.log(`✓ Downloaded: ${name}.jpg`);
        success.push(`${name}.jpg`);
        urls.push(url);
      }
    } catch (e) {}
  }
  
  // Save URLs
  fs.writeFileSync(urlsFile, JSON.stringify(urls, null, 2));
  
  console.log(`\n=== ✅ COMPLETE ===`);
  console.log(`Successfully downloaded: ${success.length}`);
  console.log(`Failed: ${failed.length}`);
  console.log(`Images saved to: ${outputDir}/`);
  
  const files = fs.readdirSync(outputDir);
  console.log(`\n📁 Total files in folder: ${files.length}`);
}

extractAndDownload().catch(console.error);