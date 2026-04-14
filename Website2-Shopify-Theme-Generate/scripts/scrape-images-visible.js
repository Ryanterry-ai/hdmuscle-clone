const { chromium } = require('playwright');

async function scrapeImages() {
  console.log('[1] Launching browser (non-headless)...');
  const browser = await chromium.launch({ 
    headless: false,
    channel: 'chrome'
  });
  const page = await browser.newPage();

  console.log('[2] Opening store...');
  await page.goto('https://0h5kgk-cq.myshopify.com/collections/all');
  await page.waitForTimeout(5000);

  const products = await page.$$eval('a[href*="/products/"]', links => 
    [...new Set(links.map(l => l.href.split('?')[0]))].filter(h => h.includes('/products/')).slice(0, 60)
  );

  console.log(`[3] Found ${products.length} products\n`);

  const results = [];

  for (let i = 0; i < products.length; i++) {
    const url = products[i];
    const handle = url.split('/products/')[1];
    console.log(`[${i + 1}/${products.length}] ${handle}`);
    
    try {
      await page.goto(url, { timeout: 8000 });
      await page.waitForTimeout(1200);
      
      // Get first large image
      const imageSrc = await page.$eval('img', img => img.src).catch(() => null);
      
      if (imageSrc) {
        const filename = `product_${i.toString().padStart(4, '0')}`;
        console.log(`    → ${filename}`);
        results.push({ index: i, handle, imageUrl: imageSrc, filename });
      }
    } catch (e) {
      console.log(`    Error: ${e.message}`);
    }
  }

  console.log(`\n[4] Found ${results.length} images`);
  
  const fs = require('fs');
  fs.writeFileSync('output/shopify-product-images.json', JSON.stringify(results, null, 2));
  console.log('Saved to output/shopify-product-images.json');

  // Keep browser open for debugging
  console.log('\nBrowser will stay open. Close it when done.');
  // await browser.close();
}

scrapeImages().catch(console.error);