const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '..', 'output', 'export', 'products.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'product-images');
const MAX_CONCURRENT = 3;

async function downloadProductImages() {
  console.log('[IMAGES] Downloading product images...\n');
  
  const products = await fs.readJson(PRODUCTS_FILE);
  await fs.ensureDir(OUTPUT_DIR);
  
  let downloaded = 0;
  let failed = 0;
  let skipped = 0;
  
  const allUrls = new Set();
  
  for (const product of products) {
    for (const url of product.images || []) {
      if (url && (url.includes('files') || url.includes('.jpg') || url.includes('.png'))) {
        allUrls.add({ url, handle: product.handle });
      }
    }
  }
  
  console.log(`[IMAGES] Found ${allUrls.size} unique images`);
  
  const imageArray = Array.from(allUrls);
  let current = 0;
  
  async function processBatch() {
    const batch = imageArray.slice(current, current + MAX_CONCURRENT);
    if (batch.length === 0) return;
    
    await Promise.allSettled(
      batch.map(async ({ url, handle }) => {
        try {
          const ext = path.extname(url.split('?')[0]) || '.png';
          const filename = `${handle}${ext}`;
          const filepath = path.join(OUTPUT_DIR, filename);
          
          if (await fs.pathExists(filepath)) {
            skipped++;
            return;
          }
          
          const response = await axios({
            method: 'get',
            url: url,
            responseType: 'arraybuffer',
            timeout: 30000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          
          await fs.writeFile(filepath, response.data);
          downloaded++;
          console.log(`[OK] ${filename}`);
          
        } catch (e) {
          failed++;
          console.log(`[FAIL] ${url.substring(0, 40)}: ${e.message}`);
        }
      })
    );
    
    current += MAX_CONCURRENT;
    
    if (current < imageArray.length) {
      await processBatch();
    }
  }
  
  await processBatch();
  
  console.log(`\n[IMAGES] Complete!`);
  console.log(`[IMAGES] Downloaded: ${downloaded}`);
  console.log(`[IMAGES] Skipped: ${skipped}`);
  console.log(`[IMAGES] Failed: ${failed}`);
  console.log(`[IMAGES] Saved to: ${OUTPUT_DIR}`);
  
  return { downloaded, failed, skipped };
}

downloadProductImages().catch(console.error);