const { chromium } = require('playwright');

const URL = 'https://www.morphogennutrition.com';

const COLLECTIONS = [
  '/collections/premiumsupplements',
  '/collections/health-series',
  '/collections/max-series',
  '/collections/sport-series',
  '/collections/wellness-series',
  '/collections/lifestyle',
  '/collections/stacks',
  '/collections/new'
];

async function checkCollections() {
  console.log('[CHECK] Checking original site collections...\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  for (const path of COLLECTIONS) {
    const handle = path.split('/collections/')[1];
    console.log(`=== ${handle} ===`);
    
    try {
      await page.goto(URL + path, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(2000);
      
      const title = await page.title();
      console.log(`Title: ${title}`);
      
      const products = await page.$$eval('a[href*="/products/"]', links => {
        const handles = new Set();
        links.forEach(l => {
          const h = l.href?.split('/products/')[1]?.split('?')[0];
          if (h) handles.add(h);
        });
        return handles.size;
      });
      console.log(`Products: ${products}`);
      
      const h1 = await page.$eval('h1', el => el.textContent).catch(() => 'No H1');
      console.log(`H1: ${h1}`);
      
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
    }
    
    console.log('');
  }
  
  await browser.close();
}

checkCollections().catch(console.error);