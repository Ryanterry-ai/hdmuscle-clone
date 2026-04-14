const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');

const SOURCE_URL = 'https://www.morphogennutrition.com/';
const OUTPUT_DIR = path.join(__dirname, '..', 'output', 'export');

const COLLECTIONS = [
  { handle: 'premiumsupplements', title: 'All Products', products: [] },
  { handle: 'health-series', title: 'Health Series', products: [] },
  { handle: 'max-series', title: 'Max Series', products: [] },
  { handle: 'sport-series', title: 'Sport Series', products: [] },
  { handle: 'wellness-series', title: 'Wellness Series', products: [] },
  { handle: 'lifestyle', title: 'Apparel', products: [] },
  { handle: 'stacks', title: 'Bundles', products: [] },
  { handle: 'new', title: 'New Products', products: [] }
];

async function extractProducts() {
  console.log('[CSV] Extracting products from Morphogen Nutrition...\n');
  
  await fs.ensureDir(OUTPUT_DIR);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  const allProducts = new Map();
  
  for (const coll of COLLECTIONS) {
    console.log(`[CSV] Collecting: ${coll.handle}...`);
    
    try {
      await page.goto(SOURCE_URL + 'collections/' + coll.handle, { 
        waitUntil: 'domcontentloaded', 
        timeout: 90000 
      });
      await page.waitForTimeout(3000);
      
      const productLinks = await page.$$eval('a[href*="/products/"]', links => {
        const products = [];
        links.forEach(link => {
          const handle = link.href?.split('/products/')[1]?.split('?')[0];
          if (handle && handle.length > 3) {
            const titleEl = link.querySelector('.grid-product__title, .product-card__title, [class*="product-title"]');
            const title = titleEl ? titleEl.textContent?.trim() : handle.replace(/-/g, ' ');
            products.push({ handle, title });
          }
        });
        return products;
      });
      
      productLinks.forEach(p => {
        if (!allProducts.has(p.handle)) {
          allProducts.set(p.handle, { ...p, collections: [coll.handle] });
        } else {
          const existing = allProducts.get(p.handle);
          if (!existing.collections.includes(coll.handle)) {
            existing.collections.push(coll.handle);
          }
        }
      });
      
      console.log(`[CSV]   Found ${productLinks.length} products`);
      
    } catch (e) {
      console.log(`[CSV]   Error: ${e.message}`);
    }
  }
  
  console.log(`\n[CSV] Getting product details from individual pages...`);
  
  const productsWithDetails = [];
  let count = 0;
  
  for (const [handle, product] of allProducts) {
    count++;
    console.log(`[CSV] ${count}/${allProducts.size}: ${handle}`);
    
    try {
      await page.goto(SOURCE_URL + 'products/' + handle, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });
      await page.waitForTimeout(1500);
      
      const details = await page.evaluate(() => {
        const getText = (sel) => document.querySelector(sel)?.textContent?.trim() || '';
        
        return {
          title: getText('h1, .product-title, [class*="title"]'),
          description: document.querySelector('.product-description, .description, [class*="description"]')?.innerHTML?.trim() || '',
          price: document.querySelector('.price, [class*="price"]')?.textContent?.replace(/[^0-9.]/g, '') || '0',
          comparePrice: document.querySelector('[class*="compare"], [class*="was"]')?.textContent?.replace(/[^0-9.]/g, '') || '',
          sku: document.querySelector('[class*="sku"]')?.textContent?.trim() || '',
          vendor: document.querySelector('[class*="vendor"], .brand')?.textContent?.trim() || 'Morphogen Nutrition',
          images: [...document.querySelectorAll('img[src*="files"], .product-slider img, [class*="product"] img')].map(img => img.src).filter(src => src && (src.includes('files') || src.includes('.jpg') || src.includes('.png'))).slice(0, 5)
        };
      });
      
      productsWithDetails.push({
        handle,
        title: details.title || handle.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        body_html: details.description.substring(0, 5000),
        vendor: details.vendor,
        product_type: product.collections[0] || '',
        tags: product.collections.join(','),
        price: details.price || '29.99',
        compare_at_price: details.comparePrice || '',
        sku: details.sku || handle.substring(0, 10).toUpperCase(),
        images: details.images
      });
      
    } catch (e) {
      productsWithDetails.push({
        handle,
        title: handle.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        body_html: '',
        vendor: 'Morphogen Nutrition',
        product_type: product.collections[0] || '',
        tags: product.collections.join(','),
        price: '29.99',
        compare_at_price: '',
        sku: handle.substring(0, 10).toUpperCase(),
        images: []
      });
    }
  }
  
  await browser.close();
  
  console.log(`\n[CSV] Generating CSV files...`);
  
  const productsCSV = [
    'Handle,Title,Body (HTML),Vendor,Product Type,Tags,Price,Compare At Price,SKU,Image Src,Variant Price,Variant SKU'
  ];
  
  for (const p of productsWithDetails) {
    const title = p.title.replace(/"/g, '""');
    const body = p.body_html.replace(/"/g, '""').replace(/\n/g, '');
    const image = p.images[0] || '';
    productsCSV.push(
      `${p.handle},"${title}","${body}","${p.vendor}","${p.product_type}","${p.tags}",${p.price},${p.compare_at_price},${p.sku},"${image}",${p.price},${p.sku}`
    );
  }
  
  await fs.writeFile(path.join(OUTPUT_DIR, 'products.csv'), productsCSV.join('\n'));
  console.log(`[CSV] Saved: products.csv (${productsWithDetails.length} products)`);
  
  await fs.writeJson(path.join(OUTPUT_DIR, 'products.json'), productsWithDetails, { spaces: 2 });
  console.log(`[CSV] Saved: products.json`);
  
  const collectionsCSV = [
    'Handle,Title,Body (HTML),Collections'
  ];
  
  for (const coll of COLLECTIONS) {
    const titles = allProducts.size;
    collectionsCSV.push(
      `${coll.handle},"${coll.title}","Premium quality supplements",""`
    );
  }
  
  await fs.writeFile(path.join(OUTPUT_DIR, 'collections.csv'), collectionsCSV.join('\n'));
  console.log(`[CSV] Saved: collections.csv`);
  
  console.log(`\n[CSV] DONE! Files in: ${OUTPUT_DIR}`);
  console.log(`[CSV] Total products: ${productsWithDetails.length}`);
  
  return productsWithDetails;
}

extractProducts().catch(console.error);