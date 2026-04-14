const { chromium } = require('playwright');

async function scrapeProductImages() {
  console.log('[1] Connecting to Chrome via CDP...');
  
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages()[0] || await context.newPage();

  console.log('[2] Opening store...');
  await page.goto('https://0h5kgk-cq.myshopify.com/collections/all');
  await page.waitForTimeout(3000);

  console.log('[3] Getting product list...');
  
  const products = await page.$$eval('a[href*="/products/"]', links => 
    [...new Set(links.map(l => l.href.split('?')[0]))].filter(h => h.includes('/products/')).slice(0, 60)
  );

  console.log(`    Found ${products.length} products`);

  const results = [];

  console.log('[4] Scraping images...\n');
  
  for (let i = 0; i < products.length; i++) {
    const url = products[i];
    const handle = url.split('/products/')[1];
    
    console.log(`[${i + 1}/${products.length}] ${handle}`);
    
    try {
      await page.goto(url, { timeout: 10000 });
      await page.waitForTimeout(1500);
      
      // Try multiple selectors for product images
      let imageSrc = null;
      
      // Try main product image
      try {
        imageSrc = await page.$eval('[data-product-image], .product-image img, #MainProduct img, .product-featured-image', el => el.src);
      } catch (e) {}
      
      // Try any large image on page
      if (!imageSrc) {
        const imgs = await page.$$eval('img', imgs => 
          imgs.filter(img => img.naturalWidth > 300).map(img => img.src)
        );
        imageSrc = imgs[0] || null;
      }
      
      if (imageSrc) {
        const filename = `product_${i.toString().padStart(4, '0')}.png`;
        console.log(`    → ${filename}`);
        results.push({ index: i, handle, imageUrl: imageSrc, filename });
      } else {
        console.log(`    → No image found`);
      }
      
    } catch (e) {
      console.log(`    Error: ${e.message}`);
    }
  }

  console.log('\n[5] Results:');
  results.forEach(r => console.log(`  ${r.filename}: ${r.imageUrl.substring(0, 80)}...`));

  const fs = require('fs');
  fs.writeFileSync('output/shopify-product-images.json', JSON.stringify(results, null, 2));

  console.log('\nSaved to output/shopify-product-images.json');
  
  await browser.close();
}

scrapeProductImages().catch(console.error);