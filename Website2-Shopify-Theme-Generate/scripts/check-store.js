const { chromium } = require('playwright');

const URL = 'https://0h5kgk-cq.myshopify.com';

async function checkStore() {
  console.log('[CHECK] Checking new store...\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('=== Homepage ===');
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  console.log('Title:', await page.title());
  
  const products = await page.$$eval('a[href*="/products/"]', links => links.length);
  console.log('Product links:', products);
  
  const nav = await page.$$eval('nav a, .menu a', as => as.map(a => a.textContent).filter(t => t).slice(0, 15));
  console.log('Nav links:', nav.join(', '));
  
  console.log('\n=== All Collections ===');
  for (const coll of ['premiumsupplements', 'health-series', 'max-series', 'sport-series', 'wellness-series', 'lifestyle', 'stacks', 'new']) {
    await page.goto(URL + '/collections/' + coll, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);
    const title = await page.title();
    const prods = await page.$$eval('a[href*="/products/"]', links => links.length);
    console.log(`${coll}: ${title} (${prods} products)`);
  }
  
  await browser.close();
}

checkStore().catch(console.error);