const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');
const https = require('https');
const http = require('http');
const { pipeline } = require('stream');
const { promisify } = require('util');

const STORE_URL = 'https://www.morphogennutrition.com';
const OUTPUT_DIR = path.join(__dirname, '..', 'output', 'original-images');

const pipelineAsync = promisify(pipeline);

async function scrapeImages() {
  console.log('[1] Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('[2] Going to products page...');
  await page.goto(`${STORE_URL}/collections/all`, { timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 30000 });

  const products = [];
  
  const productLinks = await page.$$eval('a[href*="/products/"]', links => 
    [...new Set(links.map(l => l.href.split('?')[0]))].filter(h => h.includes('/products/'))
  );
  
  console.log(`    Found ${productLinks.length} product URLs`);
  
  for (const url of productLinks.slice(0, 80)) {
    if (!products.find(p => p.url === url)) {
      products.push({ url });
    }
  }

  console.log(`\n[3] Total unique products: ${products.length}`);

  await fs.ensureDir(OUTPUT_DIR);

  console.log('[4] Scraping images from each product...\n');
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const productName = product.url.split('/products/')[1];
    console.log(`[${i + 1}/${products.length}] ${productName}`);
    
    try {
      await page.goto(product.url, { timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      
      const images = await page.$$eval('img[src*="cdn.shopify.com"]', imgs => 
        imgs.map(img => img.src).filter(src => src.includes('/files/') || src.includes('/products/'))
      );
      
      if (images.length > 0) {
        product.imageUrl = images[0];
        console.log(`    Image: ${images[0].substring(0, 100)}...`);
      } else {
        console.log(`    No image found`);
      }
      
    } catch (e) {
      console.log(`    Error: ${e.message}`);
    }
  }

  const productsWithImages = products.filter(p => p.imageUrl);
  console.log(`\n[5] Found ${productsWithImages.length} products with images`);

  console.log('\n[6] Downloading images...\n');
  
  let downloaded = 0;
  
  for (let i = 0; i < productsWithImages.length; i++) {
    const product = productsWithImages[i];
    const ext = product.imageUrl.includes('.png') ? 'png' : 'jpg';
    const filename = `product_${i.toString().padStart(4, '0')}.${ext}`;
    const filepath = path.join(OUTPUT_DIR, filename);
    
    console.log(`[${i + 1}/${productsWithImages.length}] Downloading ${filename}...`);
    
    try {
      const protocol = product.imageUrl.startsWith('https') ? https : http;
      
      await pipelineAsync(
        protocol.get(product.imageUrl),
        fs.createWriteStream(filepath)
      );
      
      product.localPath = filename;
      downloaded++;
      console.log(`    Saved: ${filename}`);
    } catch (e) {
      console.log(`    Failed: ${e.message}`);
    }
  }

  console.log('\n===============================================');
  console.log(`RESULT: ${downloaded} images downloaded`);
  console.log(`Saved to: ${OUTPUT_DIR}`);
  console.log('===============================================');

  await fs.writeJson(path.join(OUTPUT_DIR, 'products-with-images.json'), productsWithImages, { indent: 2 });

  await browser.close();
}

scrapeImages().catch(console.error);