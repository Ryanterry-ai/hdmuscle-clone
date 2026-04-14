const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { pipeline } = require('stream');
const { promisify } = require('util');

const pipelineAsync = promisify(pipeline);

async function scrapeImages() {
  console.log('[1] Launching browser...');
  const browser = await chromium.launch({ 
    headless: false,
    channel: 'chrome'
  });
  const page = await browser.newPage();

  console.log('[2] Opening original store...');
  await page.goto('https://www.morphogennutrition.com/collections/all');
  await page.waitForTimeout(5000);

  const products = await page.$$eval('a[href*="/products/"]', links => 
    [...new Set(links.map(l => l.href.split('?')[0]))].filter(h => h.includes('/products/')).slice(0, 60)
  );

  console.log(`[3] Found ${products.length} products\n`);

  const outputDir = path.join(__dirname, '..', 'output', 'morphogen-images');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (let i = 0; i < products.length; i++) {
    const url = products[i];
    const handle = url.split('/products/')[1];
    console.log(`[${i + 1}/${products.length}] ${handle}`);
    
    try {
      await page.goto(url, { timeout: 10000 });
      await page.waitForTimeout(2000);
      
      // Get all product images
      const images = await page.$$eval('img', imgs => 
        imgs
          .filter(img => img.naturalWidth > 400 && (img.src.includes('cdn.shopify') || img.src.includes('morphogennutrition')))
          .map(img => img.src)
      );
      
      // Filter out logos and icons
      const productImages = images.filter(src => 
        !src.includes('wordmark') && 
        !src.includes('logo') &&
        !src.includes('icon')
      );
      
      if (productImages.length > 0) {
        const filename = `product_${i.toString().padStart(4, '0')}.jpg`;
        const filepath = path.join(outputDir, filename);
        
        console.log(`    Downloading: ${filename}`);
        
        try {
          // Download using axios
          const axios = require('axios');
          const response = await axios({
            url: productImages[0],
            method: 'GET',
            responseType: 'stream'
          });
          
          await new Promise((resolve, reject) => {
            response.data.pipe(fs.createWriteStream(filepath));
            response.data.on('end', resolve);
            response.data.on('error', reject);
          });
          
          console.log(`    Saved: ${filename}`);
        } catch (e) {
          console.log(`    Download failed: ${e.message}`);
        }
      } else {
        console.log(`    No product images found`);
      }
    } catch (e) {
      console.log(`    Error: ${e.message}`);
    }
  }

  console.log('\n===============================================');
  console.log(`Done! Images saved to: ${outputDir}`);
  console.log('===============================================');

  // await browser.close();
}

scrapeImages().catch(console.error);