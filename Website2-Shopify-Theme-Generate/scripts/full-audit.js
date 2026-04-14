const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');

const SOURCE_URL = 'https://www.morphogennutrition.com/';
const OUTPUT_FILE = path.join(__dirname, '..', 'output', 'audit', 'full-audit.json');

async function fullAudit() {
  console.log('[AUDIT] Running full site audit...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  const audit = {};
  
  console.log('[AUDIT] Loading main page...');
  await page.goto(SOURCE_URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(3000);
  
  audit.title = await page.title();
  
  audit.logo = {
    src: await page.$eval('.site-header__logo-link img', img => img.src).catch(() => ''),
    alt: await page.$eval('.site-header__logo-link img', img => img.alt).catch(() => '')
  };
  
  const navItems = await page.$$eval('nav a, .site-nav a', links => 
    links.map(l => ({ text: l.textContent?.trim(), href: l.href })).filter(l => l.textContent)
  );
  audit.navigation = navItems.slice(0, 30);
  
  console.log('[AUDIT] Loading products page...');
  await page.goto(SOURCE_URL + 'collections/premiumsupplements', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(3000);
  
  const allProducts = await page.$$eval('a[href*="/products/"]', links => 
    links.map(l => l.href?.split('/products/')[1]?.split('?')[0]).filter(h => h)
  );
  audit.products = [...new Set(allProducts)];
  
  console.log('[AUDIT] Getting styles...');
  audit.styles = await page.evaluate(() => {
    const style = getComputedStyle(document.body);
    return { bodyBg: style.backgroundColor, bodyColor: style.color };
  });
  
  await browser.close();
  
  await fs.ensureDir(path.dirname(OUTPUT_FILE));
  await fs.writeJson(OUTPUT_FILE, audit, { spaces: 2 });
  
  console.log('\n=== RESULTS ===');
  console.log('Title:', audit.title);
  console.log('Nav:', audit.navigation?.length, 'items');
  console.log('Products:', audit.products?.length);
  console.log('Logo:', audit.logo.src?.substring(0, 50));
  console.log('Saved:', OUTPUT_FILE);
  
  return audit;
}

fullAudit().catch(console.error);