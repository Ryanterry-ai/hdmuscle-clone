const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'images');
const IMAGES_FILE = path.join(__dirname, '..', 'output', 'extracted', 'images.json');

async function downloadImages() {
  console.log('[DOWNLOAD] Starting image downloads...');
  
  const images = await fs.readJson(IMAGES_FILE);
  await fs.ensureDir(OUTPUT_DIR);
  
  let downloaded = 0;
  let failed = 0;
  let skipped = 0;
  
  for (let i = 0; i < images.length; i++) {
    const url = images[i];
    try {
      const ext = path.extname(url.split('?')[0]) || '.jpg';
      const filename = `product_${String(i).padStart(4, '0')}${ext}`;
      const filepath = path.join(OUTPUT_DIR, filename);
      
      if (await fs.pathExists(filepath)) {
        skipped++;
        continue;
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
      console.log(`[FAIL] ${url.substring(0, 50)}: ${e.message}`);
    }
  }
  
  console.log(`[DOWNLOAD] Complete! Downloaded: ${downloaded}, Skipped: ${skipped}, Failed: ${failed}`);
  console.log(`[DOWNLOAD] Images saved to ${OUTPUT_DIR}`);
  
  return { downloaded, failed, skipped };
}

downloadImages().catch(console.error);