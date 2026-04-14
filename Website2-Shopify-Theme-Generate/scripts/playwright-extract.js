// Step 1: Extract all product image URLs using Playwright
// Run with: npx playwright run extract-images.js

const { chromium } = require('playwright');
const fs = require('fs');

const outputDir = './product-images';
const urlsFile = './image-urls.json';

async function extractImages() {
  console.log('Starting browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const imageUrls = new Set();
  const productHandles = new Set();
  
  try {
    // Go to products page
    console.log('Fetching products page...');
    await page.goto('https://www.morphogennutrition.com/collections/all', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    // Get all product links
    const links = await page.$$eval('a[href*="/products/"]', links => 
      links.map(l => l.href).filter(h => h.includes('/products/'))
    );
    
    links.forEach(href => {
      const handle = href.split('/products/')[1]?.split('?')[0];
      if (handle) productHandles.add(handle);
    });
    
    console.log(`Found ${productHandles.size} product links`);
    
    // Get images from main collection page
    const collectionImages = await page.$$eval('img[src*="cdn.shopify.com"]', imgs => 
      imgs.map(img => img.src).filter(src => src.includes('files'))
    );
    
    collectionImages.forEach(url => {
      const cleanUrl = url.split('?')[0];
      if (cleanUrl) imageUrls.add(cleanUrl);
    });
    
    console.log(`Found ${imageUrls.size} images from collection page`);
    
    // Visit individual product pages
    const productsArray = Array.from(productHandles).slice(0, 30); // Limit to 30 for speed
    
    for (const handle of productsArray) {
      try {
        await page.goto(`https://www.morphogennutrition.com/products/${handle}`, {
          waitUntil: 'domcontentloaded',
          timeout: 60000
        });
        
        // Wait for images to load
        await page.waitForTimeout(2000);
        
        // Get product images
        const productImages = await page.$$eval('img[src*="cdn.shopify.com"]', imgs => 
          imgs.map(img => img.src).filter(src => src.includes('files'))
        );
        
        productImages.forEach(url => {
          const cleanUrl = url.split('?')[0];
          if (cleanUrl) imageUrls.add(cleanUrl);
        });
        
        console.log(`✓ ${handle}: ${productImages.length} images`);
      } catch (e) {
        console.log(`✗ ${handle}: ${e.message}`);
      }
    }
    
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  await browser.close();
  
  // Save URLs
  const urlsArray = Array.from(imageUrls);
  fs.writeFileSync(urlsFile, JSON.stringify(urlsArray, null, 2));
  
  console.log(`\n=== COMPLETE ===`);
  console.log(`Total image URLs: ${urlsArray.length}`);
  console.log(`Saved to: ${urlsFile}`);
  
  return urlsArray;
}

extractImages().catch(console.error);