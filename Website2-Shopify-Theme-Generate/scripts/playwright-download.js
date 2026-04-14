// Step 2: Download images using Playwright
// Run with: npx playwright run download-images-playwright.js

const { chromium } = require('playwright');
const fs = require('fs');
constpath = require('path');

const outputDir = './product-images';
const urlsFile = './image-urls.json';

async function downloadImages() {
  // Read URLs
  if (!fs.existsSync(urlsFile)) {
    console.error(`Error: ${urlsFile} not found! Run extract script first.`);
    process.exit(1);
  }
  
  const urls = JSON.parse(fs.readFileSync(urlsFile, 'utf8'));
  
  // Create directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log(`Found ${urls.length} images to download\n`);
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const filename = path.basename(url.split('?')[0]);
    const filepath = path.join(outputDir, filename);
    
    // Skip existing
    if (fs.existsSync(filepath)) {
      console.log(`⏭  Skipped: ${filename}`);
      success++;
      continue;
    }
    
    try {
      const response = await page.goto(url, { timeout: 30000 });
      
      if (response.ok()) {
        const buffer = await response.body();
        fs.writeFileSync(filepath, buffer);
        console.log(`✓ [${i + 1}/${urls.length}] Downloaded: ${filename}`);
        success++;
      } else {
        console.log(`✗ [${i + 1}/${urls.length}] Failed (${response.status()}): ${filename}`);
        failed++;
      }
    } catch (e) {
      console.log(`✗ [${i + 1}/${urls.length}] Error: ${filename} - ${e.message}`);
      failed++;
    }
    
    // Small delay to avoid rate limiting
    await page.waitForTimeout(200);
  }
  
  await browser.close();
  
  console.log(`\n=== COMPLETE ===`);
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);
  console.log(`Saved to: ${outputDir}/`);
  
  // List files
  const files = fs.readdirSync(outputDir);
  console.log(`\nTotal images: ${files.length}`);
}

downloadImages().catch(console.error);