/**
 * Extract Products - Get all products from collections
 * Usage: node scripts/extract-products.js <url>
 */

const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');

const TARGET_URL = process.argv[2] || 'https://www.morphogennutrition.com/';
const BASE_URL = TARGET_URL.replace(/\/$/, '');

const DOMAIN = new URL(TARGET_URL).hostname.replace('www.', '');
const THEME_NAME = DOMAIN.split('.')[0] + '-theme';
const OUTPUT_DIR = path.join(__dirname, '..', 'output', THEME_NAME, 'extracted');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'products.json');

async function extractProducts() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  📦 EXTRACT: Getting products');
  console.log('═══════════════════════════════════════════════════════════════');
  
  await fs.ensureDir(OUTPUT_DIR);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  
  console.log(`\n🔗 Target: ${TARGET_URL}`);
  
  // Get all collections
  console.log('\n📁 Finding collections...');
  await page.goto(BASE_URL + '/collections/all', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(3000);
  
  const collections = await page.$$eval('a[href*="/collections/"]', links => {
    const seen = new Set();
    return links.map(l => l.href).filter(h => {
      const handle = h.split('/collections/')[1]?.split('?')[0];
      if (handle && !seen.has(handle)) {
        seen.add(handle);
        return true;
      }
      return false;
    }).slice(0, 20);
  });
  
  console.log(`   Found ${collections.length} collections`);
  
  const allProducts = new Map();
  
  // Process each collection
  for (const collectionUrl of collections) {
    const handle = collectionUrl.split('/collections/')[1]?.split('?')[0];
    console.log(`\n📂 Processing: ${handle}`);
    
    try {
      await page.goto(collectionUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForTimeout(2000);
      
      // Scroll to load lazy products
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(1000);
      
      const products = await page.$$eval('a[href*="/products/"]', links => {
        return links.map(l => ({
          handle: l.href.split('/products/')[1]?.split('?')[0],
          text: l.textContent?.trim()
        })).filter(p => p.handle && p.handle.length > 2);
      });
      
      products.forEach(p => {
        if (!allProducts.has(p.handle)) {
          allProducts.set(p.handle, { handle: p.handle, title: p.text, collections: [handle] });
        } else {
          const existing = allProducts.get(p.handle);
          if (!existing.collections.includes(handle)) {
            existing.collections.push(handle);
          }
        }
      });
      
      console.log(`   Found ${products.length} products`);
      
    } catch (e) {
      console.log(`   Error: ${e.message}`);
    }
  }
  
  // Get individual product details
  console.log('\n📝 Getting product details...');
  const productArray = Array.from(allProducts.values()).slice(0, 50);
  
  for (let i = 0; i < productArray.length; i++) {
    const product = productArray[i];
    console.log(`   [${i + 1}/${productArray.length}] ${product.handle}`);
    
    try {
      await page.goto(BASE_URL + '/products/' + product.handle, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });
      await page.waitForTimeout(1500);
      
      const details = await page.evaluate(() => {
        const getText = (sel) => document.querySelector(sel)?.textContent?.trim() || '';
        return {
          title: getText('h1, [class*="title"]'),
          price: document.querySelector('[class*="price"]')?.textContent?.replace(/[^0-9.]/g, '') || '29.99',
          description: document.querySelector('[class*="description"], .product-description')?.innerHTML?.substring(0, 3000) || '',
          images: [...document.querySelectorAll('img[src*="cdn.shopify"], img[src*="/files/"]')]
            .map(img => img.src?.split('?')[0])
            .filter(src => src && (src.includes('/files/') || src.includes('.jpg') || src.includes('.png')))
            .slice(0, 5)
        };
      });
      
      product.title = details.title || product.handle.replace(/-/g, ' ');
      product.price = details.price;
      product.body_html = details.description;
      product.images = details.images;
      
    } catch (e) {
      console.log(`   Error: ${e.message}`);
    }
  }
  
  await browser.close();
  
  const products = Array.from(allProducts.values());
  await fs.writeJson(OUTPUT_FILE, products, { spaces: 2 });
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  ✅ EXTRACT Complete!');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\n📊 Total products: ${products.length}`);
  console.log(`💾 Saved: ${OUTPUT_FILE}`);
  
  return products;
}

extractProducts().catch(console.error);
