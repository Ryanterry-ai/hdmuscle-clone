// Combined script: Extract images using CDP (Chrome DevTools Protocol)
// Run with: node scripts/full-scrape.js

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const outputDir = './product-images';
const urlsFile = './image-urls.json';

async function scrapeAndDownload() {
  console.log('🚀 Starting image extraction from Morphogen Nutrition\n');
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Launch browser with more resources
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  const imageUrls = new Set();
  const productHandles = new Set();
  
  try {
    // Step 1: Get all products from collection page
    console.log('📄 Loading products page...');
    await page.goto('https://www.morphogennutrition.com/collections/all', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    // Wait for products to load
    await page.waitForTimeout(3000);
    
    // Get all product links
    const productLinks = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href*="/products/"]');
      return Array.from(links).map(a => a.href).filter(h => h.includes('/products/'));
    });
    
    productLinks.forEach(href => {
      const handle = href.split('/products/')[1]?.split('?')[0];
      if (handle && !handle.includes('?')) {
        productHandles.add(handle);
      }
    });
    
    console.log(`📦 Found ${productHandles.size} products`);
    
    // Get images from collection
    const collectionImages = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      return Array.from(imgs)
        .map(img => img.src || img.dataset?.src)
        .filter(src => src && src.includes('morphogennutrition.com') && src.includes('/files/'))
        .map(src => src.split('?')[0])
        .filter(src => src);
    });
    
    collectionImages.forEach(url => imageUrls.add(url));
    console.log(`🖼️  Found ${collectionImages.length} images from collection`);
    
    // Step 2: Visit individual products (limit to 40 for speed)
    const productsToVisit = Array.from(productHandles).slice(0, 40);
    console.log(`\n🔍 Scraping ${productsToVisit.length} individual products...\n`);
    
    for (let i = 0; i < productsToVisit.length; i++) {
      const handle = productsToVisit[i];
      
      try {
        await page.goto(`https://www.morphogennutrition.com/products/${handle}`, {
          waitUntil: 'domcontentloaded',
          timeout: 20000
        });
        
        await page.waitForTimeout(1000);
        
        // Get product images
        const productImages = await page.evaluate(() => {
          const imgs = document.querySelectorAll('[data-src], img[src]');
          return Array.from(imgs)
            .map(img => img.dataset?.src || img.src)
            .filter(src => src && (src.includes('/files/') || src.includes('cdn.shopify')))
            .map(src => src.split('?')[0])
            .filter(src => src && !src.includes('loading'));
        });
        
        productImages.forEach(url => imageUrls.add(url));
        
        console.log(`✓ [${i + 1}/${productsToVisit.length}] ${handle}: ${productImages.length} images`);
        
      } catch (e) {
        console.log(`✗ [${i + 1}/${productsToVisit.length}] ${handle}: ${e.message}`);
      }
    }
    
  } catch (e) {
    console.error('Main error:', e.message);
  }
  
  await browser.close();
  
  // Save URLs
  const urlsArray = Array.from(imageUrls).filter(url => url.includes('/files/'));
  fs.writeFileSync(urlsFile, JSON.stringify(urlsArray, null, 2));
  
  console.log(`\n📊 Total unique image URLs: ${urlsArray.length}`);
  console.log(`💾 URLs saved to: ${urlsFile}`);
  
  // Step 3: Download all images
  console.log(`\n⬇️  Downloading ${urlsArray.length} images...\n`);
  
  const downloadedFiles = [];
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < urlsArray.length; i++) {
    const url = urlsArray[i];
    const filename = path.basename(url.split('?')[0]);
    const filepath = path.join(outputDir, filename);
    
    // Skip existing
    if (fs.existsSync(filepath)) {
      downloadedFiles.push(filename);
      continue;
    }
    
    try {
      const response = await fetch(url);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(filepath, Buffer.from(buffer));
        downloadedFiles.push(filename);
        success++;
        console.log(`✓ [${i + 1}/${urlsArray.length}] ${filename}`);
      } else {
        failed++;
        console.log(`✗ [${i + 1}/${urlsArray.length}] Failed: ${filename}`);
      }
    } catch (e) {
      failed++;
      console.log(`✗ [${i + 1}/${urlsArray.length}] Error: ${e.message}`);
    }
    
    // Rate limit
    await new Promise(r => setTimeout(r, 100));
  }
  
  console.log(`\n=== ✅ COMPLETE ===`);
  console.log(`Total URLs found: ${urlsArray.length}`);
  console.log(`Images downloaded: ${success}`);
  console.log(`Failed: ${failed}`);
  console.log(`Saved to: ${outputDir}/`);
  
  // List files
  const files = fs.readdirSync(outputDir);
  console.log(`\n📁 Downloaded ${files.length} files:`);
  files.slice(0, 20).forEach(f => console.log(`  - ${f}`));
  if (files.length > 20) {
    console.log(`  ... and ${files.length - 20} more`);
  }
}

scrapeAndDownload().catch(console.error);