const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');

const SOURCE_URL = 'https://www.morphogennutrition.com/';
const TARGET_URL = 'https://0h5kgk-cq.myshopify.com/';
const OUTPUT_FILE = path.join(__dirname, '..', 'output', 'audit', 'comparison.json');

async function auditSites() {
  console.log('[AUDIT] Starting site comparison...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  const audit = {
    source: {},
    target: {},
    comparison: {}
  };
  
  console.log('[AUDIT] Loading source site...');
  await page.goto(SOURCE_URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(3000);
  
  audit.source = {
    title: await page.title(),
    url: SOURCE_URL,
    navigation: await page.$$eval('nav a, header a, .site-nav a', links => 
      links.map(l => ({ text: l.textContent?.trim(), href: l.href })).filter(l => l.textContent)
    ),
    sections: await page.$$eval('[class*="shopify-section"]', els => 
      els.map(el => el.id).filter(id => id)
    ),
    logo: await page.$eval('.site-header__logo-link img, .site-header__logo a', el => el.src || el.href).catch(() => null),
    colors: await page.evaluate(() => {
      const style = getComputedStyle(document.body);
      return {
        background: style.backgroundColor,
        color: style.color
      };
    })
  };
  
  console.log('[AUDIT] Source title:', audit.source.title);
  console.log('[AUDIT] Source nav:', audit.source.navigation?.length, 'links');
  
  console.log('[AUDIT] Loading target site...');
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(3000);
  
  audit.target = {
    title: await page.title(),
    url: TARGET_URL,
    navigation: await page.$$eval('nav a, header a, .site-nav a', links => 
      links.map(l => ({ text: l.textContent?.trim(), href: l.href })).filter(l => l.textContent)
    ),
    sections: await page.$$eval('[class*="shopify-section"]', els => 
      els.map(el => el.id).filter(id => id)
    ),
    logo: await page.$eval('.site-header__logo-link img, .site-header__logo a', el => el.src || el.href).catch(() => null),
    colors: await page.evaluate(() => {
      const style = getComputedStyle(document.body);
      return {
        background: style.backgroundColor,
        color: style.color
      };
    })
  };
  
  console.log('[AUDIT] Target title:', audit.target.title);
  console.log('[AUDIT] Target nav:', audit.target.navigation?.length, 'links');
  
  await browser.close();
  
  audit.comparison = {
    titleMatch: audit.source.title === audit.target.title,
    navMatch: audit.source.navigation?.length === audit.target.navigation?.length,
    navDiff: audit.source.navigation?.length - audit.target.navigation?.length
  };
  
  await fs.ensureDir(path.dirname(OUTPUT_FILE));
  await fs.writeJson(OUTPUT_FILE, audit, { spaces: 2 });
  
  console.log('\n=== AUDIT RESULTS ===');
  console.log('Title Match:', audit.comparison.titleMatch);
  console.log('Nav Links Match:', audit.comparison.navMatch, `(${audit.comparison.navDiff} diff)`);
  console.log('Saved to:', OUTPUT_FILE);
  
  return audit;
}

auditSites().catch(console.error);