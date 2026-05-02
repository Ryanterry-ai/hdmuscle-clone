/**
 * Extract Products Script
 * Uses Playwright + Cheerio to extract product data from approved source websites
 * Usage: npm run extract -- --source <url> --limit 5 --brand "HD Muscle" --output data/raw/hdmuscle-test-products.json
 * Full extraction: npm run extract -- --source https://hdmuscle.in --full --output data/raw/hdmuscle-products-full.json
 */
import { program } from 'commander';
import { chromium, Browser, Page } from 'playwright';
import * as cheerio from 'cheerio';
import { writeFileSync } from 'fs';
import { ensureDir } from 'fs-extra';
import { resolve } from 'path';
import { createLogger, format, transports } from 'winston';
import Robots from 'robots-parser';
import TurndownService from 'turndown';
import { convert } from 'html-to-text';
import sanitizeHtml from 'sanitize-html';
import { discoverCollections, extractProductListing, extractProductDetail } from './adapters/hdmuscle.js';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [
    new transports.File({ filename: 'logs/extract.log' }),
    new transports.Console(),
  ],
});

const turndown = new TurndownService({ headingStyle: 'atx' });

program
  .option('-s, --source <url>', 'Source website URL')
  .option('-o, --output <path>', 'Output file path', 'data/extracted-products.json')
  .option('-l, --limit <number>', 'Maximum products to extract per collection', '50')
  .option('-b, --brand <name>', 'Brand name to assign to extracted products')
  .option('-d, --delay <ms>', 'Delay between requests in ms', '1000')
  .option('--dry-run', 'Extract but do not save output', false)
  .option('--skip-images', 'Skip image URL extraction', false)
  .option('--respect-robots', 'Strictly obey robots.txt', true)
  .option('--full', 'Full site extraction: discover all collections and all products', false)
  .option('--headless', 'Run browser headless', 'true')
  .parse();

const opts = program.opts();

interface ExtractedProduct {
  brand: string;
  title: string;
  url: string;
  category: string;
  subcategory: string;
  price: string;
  salePrice: string;
  compareAtPrice: string;
  sku: string;
  barcode: string;
  description: string;
  ingredients: string;
  nutritionFacts: string;
  servingSize: string;
  servingsPerContainer: string;
  directions: string;
  warnings: string;
  allergenInfo: string;
  manufacturer: string;
  countryOfOrigin: string;
  images: string[];
  sourceWebsite: string;
  sourceUrl: string;
  sourceImageUrls: string;
  stock: string;
  casePack: string;
  goal: string;
  productType: string;
  flavor: string;
  size: string;
  flavors: string[];
}

async function checkRobotsTxt(baseUrl: string, page: Page): Promise<boolean> {
  try {
    const robotsUrl = new URL('/robots.txt', baseUrl).href;
    const response = await page.goto(robotsUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
    if (response && response.ok()) {
      const content = await page.content();
      const robots = new Robots(robotsUrl, content);
      return robots.isAllowed(baseUrl);
    }
  } catch {
    logger.warn('Could not check robots.txt, proceeding with caution');
  }
  return true;
}

function cleanHtml(html: string): string {
  const sanitized = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
  const text = convert(sanitized, { wordwrap: false, preserveNewLines: true });
  return text.trim().replace(/\s+/g, ' ');
}

async function extractHDMuscleProductPage(page: Page, productUrl: string, brand: string): Promise<Partial<ExtractedProduct>> {
  await page.goto(productUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);

  const html = await page.content();
  const $ = cheerio.load(html);
  const baseUrl = new URL(productUrl).origin;

  const detail = extractProductDetail($, baseUrl);
  const product: Partial<ExtractedProduct> = {
    brand: detail.brand || brand,
    sourceUrl: productUrl,
    sourceWebsite: 'hdmuscle.in',
    countryOfOrigin: detail.countryOfOrigin || 'India',
    stock: detail.stock || '100',
  };

  if (!product.brand) {
    const brandSelectors = ['.product-brand', '[itemprop="brand"]', '.brand-name'];
    for (const sel of brandSelectors) {
      const el = $(sel).first();
      if (el.length) { product.brand = el.text().trim(); break; }
    }
  }

  product.title = detail.title;
  product.price = detail.price;
  product.compareAtPrice = detail.compareAtPrice;
  product.description = detail.description;
  product.ingredients = detail.ingredients;
  product.nutritionFacts = detail.nutritionFacts;
  product.servingSize = detail.servingSize;
  product.servingsPerContainer = detail.servingsPerContainer;
  product.directions = detail.directions;
  product.warnings = detail.warnings;
  product.flavor = detail.flavors[0] || '';
  product.flavors = detail.flavors;

  if (!opts.skipImages) {
    product.images = detail.imageUrls.slice(0, 10);
    product.sourceImageUrls = detail.imageUrls.slice(0, 10).join(',');
  }

  return product;
}

async function extractHDMuscleFull(page: Page, brand: string): Promise<Partial<ExtractedProduct>[]> {
  const baseUrl = 'https://hdmuscle.in';
  logger.info('Full HDMuscle extraction: discovering collections...');

  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);

  const homeHtml = await page.content();
  const home$ = cheerio.load(homeHtml);

  const collections = discoverCollections(home$, baseUrl);
  logger.info(`Discovered ${collections.length} collections: ${collections.map(c => c.name).join(', ')}`);

  const allProducts: Partial<ExtractedProduct>[] = [];
  const seenUrls = new Set<string>();
  const delay = parseInt(opts.delay) || 1000;
  const limit = parseInt(opts.limit) || 50;

  for (const collection of collections) {
    logger.info(`\n── Collection: ${collection.name} (${collection.url}) ──`);
    await page.goto(collection.url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);

    const html = await page.content();
    const $ = cheerio.load(html);

    const listingItems = extractProductListing($, baseUrl, collection.name);
    logger.info(`Found ${listingItems.length} products in ${collection.name}`);

    const itemsToProcess = listingItems.slice(0, limit);

    for (const item of itemsToProcess) {
      if (seenUrls.has(item.url)) continue;
      seenUrls.add(item.url);

      const product: Partial<ExtractedProduct> = {
        brand,
        title: item.title,
        url: item.url,
        sourceUrl: item.url,
        sourceWebsite: 'hdmuscle.in',
        category: collection.name,
        price: item.price,
        salePrice: item.price,
        flavor: item.flavor,
        images: opts.skipImages ? [] : item.imageUrls,
        sourceImageUrls: opts.skipImages ? '' : item.imageUrls.join(','),
        stock: '100',
        countryOfOrigin: 'India',
        subcategory: '',
        compareAtPrice: item.compareAtPrice || '',
        sku: '',
        barcode: '',
        description: '',
        ingredients: '',
        nutritionFacts: '',
        servingSize: '',
        servingsPerContainer: '',
        directions: '',
        warnings: '',
        allergenInfo: '',
        manufacturer: '',
        casePack: '',
        goal: '',
        productType: '',
        size: '',
        flavors: item.flavor ? [item.flavor] : [],
      };

      logger.info(`  → ${item.title} — ₹${item.price} (${item.flavor || 'no variant'})`);
      allProducts.push(product);
    }

    await page.waitForTimeout(delay);
  }

  if (!opts.dryRun && allProducts.length > 0) {
    const productsToFetch = allProducts.slice(0, opts.full ? 100 : 3);
    logger.info(`\nFetching detail pages for ${productsToFetch.length} products...`);

    for (let i = 0; i < productsToFetch.length; i++) {
      const p = productsToFetch[i];
      if (!p.url) continue;
      try {
        logger.info(`  [${i + 1}/${productsToFetch.length}] ${p.title}`);
        const detail = await extractHDMuscleProductPage(page, p.url, brand);
        Object.assign(p, {
          description: detail.description || p.description,
          ingredients: detail.ingredients || p.ingredients,
          nutritionFacts: detail.nutritionFacts || p.nutritionFacts,
          servingSize: detail.servingSize || p.servingSize,
          servingsPerContainer: detail.servingsPerContainer || p.servingsPerContainer,
          directions: detail.directions || p.directions,
          warnings: detail.warnings || p.warnings,
          allergenInfo: detail.allergenInfo || p.allergenInfo,
          manufacturer: detail.manufacturer || p.manufacturer,
          flavor: detail.flavor || p.flavor,
          flavors: detail.flavors?.length ? detail.flavors : p.flavors,
          images: (detail.images && detail.images.length > 0) ? detail.images : p.images,
          sourceImageUrls: detail.sourceImageUrls || p.sourceImageUrls,
          price: detail.price || p.price,
          compareAtPrice: detail.compareAtPrice || p.compareAtPrice,
          stock: detail.stock || p.stock,
          countryOfOrigin: detail.countryOfOrigin || p.countryOfOrigin,
        });
      } catch (err) {
        logger.warn(`  Failed detail fetch for ${p.title}: ${err}`);
      }
      await page.waitForTimeout(delay);
    }
  }

  return allProducts;
}

async function main() {
  logger.info('Starting product extraction...');
  await ensureDir('data/raw');
  await ensureDir('logs');

  if (!opts.source) {
    logger.info('No source URL provided. Use --source <url>');
    return;
  }

  if (opts.dryRun) {
    logger.info('DRY RUN mode: will not save output file');
  }

  logger.info(`Source: ${opts.source}`);
  logger.info(`Full site: ${opts.full}`);
  logger.info(`Limit: ${opts.limit}`);
  logger.info(`Brand: ${opts.brand || '(auto-detected)'}`);
  logger.info(`Skip images: ${opts.skipImages}`);
  logger.info(`Respect robots: ${opts['respect-robots']}`);

  const browser: Browser = await chromium.launch({ headless: opts.headless !== 'false' });
  const page: Page = await browser.newPage();
  const products: ExtractedProduct[] = [];

  try {
    const baseUrl = opts.source.endsWith('/') ? opts.source : opts.source + '/';

    if (opts['respect-robots']) {
      const allowed = await checkRobotsTxt(baseUrl, page);
      if (!allowed) {
        logger.warn('robots.txt disallows this path. Respecting robots.txt - aborting.');
        return;
      }
    }

    const brand = opts.brand || 'HD Muscle';
    let extracted: Partial<ExtractedProduct>[] = [];

    if (opts.full && opts.source.includes('hdmuscle.in')) {
      extracted = await extractHDMuscleFull(page, brand);
    } else if (opts.source.includes('hdmuscle.in')) {
      await page.goto(opts.source, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(2000);
      const html = await page.content();
      const $ = cheerio.load(html);
      const base = new URL(opts.source).origin;

      const categoryMatch = opts.source.match(/\/collections\/([^\/]+)/);
      const categoryName = categoryMatch ? categoryMatch[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Products';

      const listingItems = extractProductListing($, base, categoryName);
      const limit = parseInt(opts.limit) || 50;

      for (const item of listingItems.slice(0, limit)) {
        extracted.push({
          brand,
          title: item.title,
          url: item.url,
          sourceUrl: item.url,
          sourceWebsite: 'hdmuscle.in',
          category: categoryName,
          price: item.price,
          salePrice: item.price,
          flavor: item.flavor,
          images: opts.skipImages ? [] : item.imageUrls,
          sourceImageUrls: opts.skipImages ? '' : item.imageUrls.join(','),
          stock: '100',
          countryOfOrigin: 'India',
          subcategory: '',
          compareAtPrice: item.compareAtPrice || '',
          sku: '',
          barcode: '',
          description: '',
          ingredients: '',
          nutritionFacts: '',
          servingSize: '',
          servingsPerContainer: '',
          directions: '',
          warnings: '',
          allergenInfo: '',
          manufacturer: '',
          casePack: '',
          goal: '',
          productType: '',
          size: '',
          flavors: item.flavor ? [item.flavor] : [],
        });
      }
    }

    for (const p of extracted) {
      products.push({
        brand: p.brand || '',
        title: p.title || '',
        url: p.url || '',
        category: p.category || '',
        subcategory: p.subcategory || '',
        price: p.price || '',
        salePrice: p.salePrice || '',
        compareAtPrice: p.compareAtPrice || '',
        sku: p.sku || '',
        barcode: p.barcode || '',
        description: p.description || '',
        ingredients: p.ingredients || '',
        nutritionFacts: p.nutritionFacts || '',
        servingSize: p.servingSize || '',
        servingsPerContainer: p.servingsPerContainer || '',
        directions: p.directions || '',
        warnings: p.warnings || '',
        allergenInfo: p.allergenInfo || '',
        manufacturer: p.manufacturer || '',
        countryOfOrigin: p.countryOfOrigin || '',
        images: p.images || [],
        sourceWebsite: p.sourceWebsite || '',
        sourceUrl: p.sourceUrl || '',
        sourceImageUrls: p.sourceImageUrls || '',
        stock: p.stock || '',
        casePack: p.casePack || '',
        goal: p.goal || '',
        productType: p.productType || '',
        flavor: p.flavor || '',
        size: p.size || '',
        flavors: p.flavors || [],
      });
    }

    const outputPath = resolve(opts.output);

    if (opts.dryRun) {
      logger.info(`DRY RUN: Would save ${products.length} products to ${outputPath}`);
      logger.info(JSON.stringify(products, null, 2).substring(0, 2000));
    } else {
      writeFileSync(outputPath, JSON.stringify(products, null, 2), 'utf-8');
      logger.info(`Extracted ${products.length} products -> ${outputPath}`);
    }
  } catch (error) {
    logger.error(`Extraction failed: ${error}`);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
