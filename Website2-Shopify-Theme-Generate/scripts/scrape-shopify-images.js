const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');

const STORE_URL = 'https://0h5kgk-cq.myshopify.com';
const OUTPUT_DIR = path.join(__dirname, '..', 'output', 'shopify-images');

async function scrapeImages() {
  console.log('[1] Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const products = [];

  const collections = [
    '/collections/all',
    '/collections/health-series',
    '/collections/max-series',
    '/collections/sport-series',
    '/collections/wellness-series',
    '/collections/lifestyle',
    '/collections/stacks',
    '/collections/new'
  ];

  console.log('[2] Scraping product URLs from collections...');
  
  for (const collection of collections) {
    console.log(`    Checking ${collection}...`);
    try {
      await page.goto(`${STORE_URL}${collection}`, { timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      
      const productLinks = await page.$$eval('a[href*="/products/"]', links => 
        [...new Set(links.map(l => l.href.split('?')[0]))].filter(h => h.includes('/products/'))
      );
      
      for (const url of productLinks) {
        if (!products.find(p => p.url === url)) {
          products.push({ url, collection });
        }
      }
      console.log(`        Found ${productLinks.length} products`);
    } catch (e) {
      console.log(`        Error: ${e.message}`);
    }
  }

  console.log(`\n[3] Total unique products: ${products.length}`);

  await fs.ensureDir(OUTPUT_DIR);

  console.log('[4] Scraping images from each product...');
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`    [${i + 1}/${products.length}] ${product.url}`);
    
    try {
      await page.goto(product.url, { timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      
      const imageUrl = await page.$eval('img[src*="cdn.shopify.com"]', img => img.src).catch(() => null);
      
      if (imageUrl) {
        product.imageUrl = imageUrl;
        console.log(`        Image: ${imageUrl.substring(0, 80)}...`);
      } else {
        product.imageUrl = null;
        console.log(`        No image found`);
      }
      
      const title = await page.$eval('h1', el => el.textContent).catch(() => 'Unknown');
      product.title = title;
      
    } catch (e) {
      console.log(`        Error: ${e.message}`);
      product.imageUrl = null;
    }
  }

  console.log('\n[5] Saving results...');
  await fs.writeJson(path.join(OUTPUT_DIR, 'products-with-images.json'), products, { indent: 2 });
  
  const productsWithImages = products.filter(p => p.imageUrl);
  console.log(`    Saved ${productsWithImages.length} products with images`);

  console.log('\n[6] Downloading images...');
  
  const https = require('https');
  const http = require('http');
  const { pipeline } = require('stream');
  const { promisify } = require('util');
  const pipelineAsync = promisify(pipeline);

  let downloaded = 0;
  
  for (let i = 0; i < productsWithImages.length; i++) {
    const product = productsWithImages[i];
    const filename = `product_${i.toString().padStart(4, '0')}.jpg`;
    const filepath = path.join(OUTPUT_DIR, filename);
    
    console.log(`    [${i + 1}/${productsWithImages.length}] ${filename}`);
    
    try {
      const protocol = product.imageUrl.startsWith('https') ? https : http;
      
      await pipelineAsync(
        protocol.get(product.imageUrl),
        fs.createWriteStream(filepath)
      );
      
      product.localPath = filename;
      downloaded++;
      console.log(`        Saved: ${filename}`);
    } catch (e) {
      console.log(`        Failed: ${e.message}`);
    }
  }

  console.log('\n===============================================');
  console.log(`RESULT: ${downloaded} images downloaded`);
  console.log(`Saved to: ${OUTPUT_DIR}`);
  console.log('===============================================');

  await browser.close();
}

scrapeImages().catch(console.error);