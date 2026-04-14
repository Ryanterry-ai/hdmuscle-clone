/**
 * Crawl Site - Extract all website data
 * Usage: node scripts/crawl-site.js <url>
 */

const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');

const TARGET_URL = process.argv[2] || 'https://www.morphogennutrition.com/';
const BASE_URL = new URL(TARGET_URL).origin;
const DOMAIN = new URL(TARGET_URL).hostname.replace('www.', '');
const THEME_NAME = DOMAIN.split('.')[0] + '-theme';
const OUTPUT_DIR = path.join(__dirname, '..', 'output', THEME_NAME, 'crawled');
const DATA_FILE = path.join(OUTPUT_DIR, 'site-data.json');

async function crawlSite() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🕷️  CRAWL: Extracting website data');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\n🔗 Target: ${TARGET_URL}`);
  
  await fs.ensureDir(OUTPUT_DIR);
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  const siteData = {
    url: TARGET_URL,
    baseUrl: BASE_URL,
    domain: DOMAIN,
    themeName: THEME_NAME,
    timestamp: new Date().toISOString(),
    pages: [],
    products: [],
    collections: [],
    images: [],
    navigation: [],
    sections: [],
    styles: {}
  };
  
  try {
    console.log('\n📄 Loading homepage...');
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(3000);
    
    const pageTitle = await page.title();
    console.log(`   Title: ${pageTitle}`);
    siteData.pages.push({ url: TARGET_URL, title: pageTitle, type: 'home' });
    
    console.log('\n🧭 Extracting navigation...');
    const navLinks = await page.$$eval('nav a, header a, .menu a, [class*="nav"] a', links => 
      links.map(l => ({ text: l.textContent?.trim(), href: l.href })).filter(l => l.href && l.href.startsWith('http'))
    );
    siteData.navigation = navLinks.slice(0, 50);
    console.log(`   Found ${navLinks.length} nav links`);
    
    console.log('\n📦 Extracting product links...');
    const productLinks = await page.$$eval('a[href*="/products/"]', links => 
      links.map(l => ({ text: l.textContent?.trim(), href: l.href })).filter(l => l.href && l.href.includes(BASE_URL))
    );
    siteData.products = [...new Map(productLinks.map(p => [p.href, p])).values()].slice(0, 200);
    console.log(`   Found ${siteData.products.length} products`);
    
    console.log('\n📁 Extracting collection links...');
    const collectionLinks = await page.$$eval('a[href*="/collections/"]', links => 
      links.map(l => ({ text: l.textContent?.trim(), href: l.href })).filter(l => l.href && l.href.includes(BASE_URL))
    );
    siteData.collections = [...new Map(collectionLinks.map(c => [c.href, c])).values()].slice(0, 50);
    console.log(`   Found ${siteData.collections.length} collections`);
    
    console.log('\n🖼️  Extracting images...');
    const images = await page.$$eval('img[src]', imgs => 
      imgs.map(img => ({ src: img.src, alt: img.alt || '', width: img.naturalWidth || 0, height: img.naturalHeight || 0 }))
      .filter(img => img.src && (img.src.startsWith('http') || img.src.startsWith('/')))
    );
    siteData.images = images.slice(0, 150);
    console.log(`   Found ${images.length} images`);
    
    console.log('\n🎨 Extracting sections...');
    const sections = await page.$$eval('[class*="section"], [class*="hero"], [class*="banner"], [class*="product"], [class*="footer"], [class*="header"]', els => 
      els.map(el => ({ tag: el.tagName.toLowerCase(), class: el.className?.split(' ').slice(0, 3).join(' '), id: el.id, childCount: el.children.length })).slice(0, 60)
    );
    siteData.sections = sections;
    console.log(`   Found ${sections.length} sections`);
    
    siteData.styles = await page.evaluate(() => {
      const body = getComputedStyle(document.body);
      return { background: body.backgroundColor, color: body.color, fontFamily: body.fontFamily };
    });
    
    const html = await page.content();
    siteData.html = html.substring(0, 80000);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    siteData.error = error.message;
  }
  
  await browser.close();
  await fs.writeJson(DATA_FILE, siteData, { spaces: 2 });
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  ✅ CRAWL Complete!');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\n📊 Found: ${siteData.products.length} products, ${siteData.images.length} images`);
  console.log(`💾 Saved: ${DATA_FILE}`);
  
  return siteData;
}

crawlSite().catch(console.error);
