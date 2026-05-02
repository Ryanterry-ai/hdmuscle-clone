/**
 * Normalize Products Script
 * Reads sample_product_data.csv, products_import_template.xlsx, or extracted JSON
 * Normalizes slugs, handles, categories, prices, stock, and image paths
 * Writes normalized output to /data/normalized/
 * Usage: npm run normalize -- --input sample_product_data.csv
 */
import { program } from 'commander';
import { createLogger, format, transports } from 'winston';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { ensureDirSync } from 'fs-extra';
import { resolve, extname } from 'path';
import slugify from 'slugify';
import { stringify } from 'csv-stringify/sync';
import { parse as parseCsv } from 'csv-parse/sync';
import ExcelJS from 'exceljs';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [
    new transports.File({ filename: 'logs/normalize.log' }),
    new transports.Console(),
  ],
});

const ALL_COLUMNS = [
  'brand', 'brand_slug', 'product_title', 'product_handle', 'category',
  'subcategory', 'goal', 'product_type', 'flavor', 'size', 'variant_title',
  'variant_sku', 'barcode', 'mrp', 'sale_price', 'cost_price', 'wholesale_price',
  'distributor_price', 'currency', 'tax_rate', 'stock', 'stock_status',
  'min_order_quantity', 'case_pack_quantity', 'product_images', 'main_image',
  'gallery_images', 'label_image', 'nutrition_image', 'ingredients',
  'nutrition_facts', 'serving_size', 'servings_per_container', 'directions',
  'warnings', 'allergen_info', 'importer', 'manufacturer', 'country_of_origin',
  'batch_number', 'expiry_date', 'authenticity_message', 'short_description',
  'long_description', 'key_benefits', 'faq', 'who_should_use_it', 'how_to_use_it',
  'why_buy_from_upgraded', 'seo_title', 'seo_description', 'seo_keywords',
  'meta_canonical', 'source_website', 'source_product_url', 'source_image_urls',
  'data_confidence', 'needs_review', 'review_notes', 'created_at', 'updated_at',
];

program
  .option('-i, --input <path>', 'Input file (CSV, XLSX, or JSON)', 'sample_product_data.csv')
  .option('-o, --output <path>', 'Output normalized JSON path', 'data/normalized/products.json')
  .option('-c, --csv <path>', 'Also export CSV to this path', 'data/normalized/products.csv')
  .option('--fix-paths', 'Auto-fix image paths to local format', false)
  .parse();

const opts = program.opts();

function normalizeString(val: any): string {
  if (val === undefined || val === null) return '';
  return String(val).trim();
}

function normalizeNumber(val: any): number {
  if (val === undefined || val === null || val === '') return 0;
  const n = parseFloat(String(val));
  return isNaN(n) ? 0 : n;
}

function fixImagePath(imgPath: string, brandSlug: string, handle: string): string {
  if (!imgPath || !imgPath.startsWith('/public/product-images/')) {
    return imgPath;
  }
  const parts = imgPath.split('/');
  const filename = parts[parts.length - 1];
  if (!filename) return imgPath;
  return `/public/product-images/${brandSlug}/${handle}/${filename}`;
}

function buildImagePaths(brand: string, handle: string, sourceImageUrls: string): { main_image: string; gallery_images: string; product_images: string; source_image_urls: string } {
  const brandSlug = slugify(brand || 'unknown', { lower: true, strict: true });
  const urls = (sourceImageUrls || '').split(',').filter(Boolean).map((s: string) => s.trim());
  const mainPath = `/public/product-images/${brandSlug}/${handle}/main.webp`;
  const galleryPaths = urls.slice(1, 5).map((_, i) => `/public/product-images/${brandSlug}/${handle}/gallery-${String(i + 1).padStart(2, '0')}.webp`);
  return {
    main_image: mainPath,
    gallery_images: galleryPaths.join(','),
    product_images: [mainPath, ...galleryPaths].join(','),
    source_image_urls: sourceImageUrls,
  };
}

function normalizeRow(raw: any): any {
  const brand = normalizeString(raw.brand);
  const title = normalizeString(raw.product_title || raw.title);
  const handle = normalizeString(raw.product_handle) || slugify(title || 'unknown-product', { lower: true, strict: true });
  const brandSlug = normalizeString(raw.brand_slug) || slugify(brand || 'unknown', { lower: true, strict: true });
  const flavor = normalizeString(raw.flavor);
  const size = normalizeString(raw.size);
  const skuParts = [brandSlug, handle, flavor, size].filter(Boolean);
  const sku = normalizeString(raw.variant_sku) || skuParts.join('-').toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/-+/g, '-').replace(/-$/, '');

  const sourceImageUrls = normalizeString(raw.source_image_urls || raw.sourceImageUrls);
  const mrpNum = normalizeNumber(raw.mrp || raw.price);
  const saleNum = normalizeNumber(raw.sale_price || raw.salePrice) || mrpNum;
  const stockNum = normalizeNumber(raw.stock);
  const images = opts.fixPaths ? buildImagePaths(brand, handle, sourceImageUrls) : {
    main_image: normalizeString(raw.main_image),
    gallery_images: normalizeString(raw.gallery_images),
    product_images: normalizeString(raw.product_images),
    source_image_urls: sourceImageUrls,
  };

  return {
    brand,
    brand_slug: brandSlug,
    product_title: title,
    product_handle: handle,
    category: normalizeString(raw.category),
    subcategory: normalizeString(raw.subcategory),
    goal: normalizeString(raw.goal),
    product_type: normalizeString(raw.product_type),
    flavor,
    size,
    variant_title: normalizeString(raw.variant_title) || [flavor, size].filter(Boolean).join(' / ') || title,
    variant_sku: sku,
    barcode: normalizeString(raw.barcode),
    mrp: mrpNum,
    sale_price: saleNum,
    cost_price: normalizeNumber(raw.cost_price),
    wholesale_price: normalizeNumber(raw.wholesale_price),
    distributor_price: normalizeNumber(raw.distributor_price),
    currency: normalizeString(raw.currency) || 'INR',
    tax_rate: normalizeNumber(raw.tax_rate) || 18,
    stock: stockNum,
    stock_status: normalizeString(raw.stock_status) || (stockNum > 0 ? 'in_stock' : 'out_of_stock'),
    min_order_quantity: normalizeNumber(raw.min_order_quantity) || 1,
    case_pack_quantity: normalizeNumber(raw.case_pack_quantity) || 12,
    product_images: images.product_images,
    main_image: images.main_image,
    gallery_images: images.gallery_images,
    label_image: normalizeString(raw.label_image) || `/public/product-images/${brandSlug}/${handle}/label.webp`,
    nutrition_image: normalizeString(raw.nutrition_image) || `/public/product-images/${brandSlug}/${handle}/nutrition.webp`,
    ingredients: normalizeString(raw.ingredients),
    nutrition_facts: normalizeString(raw.nutrition_facts),
    serving_size: normalizeString(raw.serving_size),
    servings_per_container: normalizeString(raw.servings_per_container),
    directions: normalizeString(raw.directions),
    warnings: normalizeString(raw.warnings),
    allergen_info: normalizeString(raw.allergen_info),
    importer: normalizeString(raw.importer),
    manufacturer: normalizeString(raw.manufacturer),
    country_of_origin: normalizeString(raw.country_of_origin) || 'India',
    batch_number: normalizeString(raw.batch_number),
    expiry_date: normalizeString(raw.expiry_date),
    authenticity_message: normalizeString(raw.authenticity_message),
    short_description: normalizeString(raw.short_description),
    long_description: normalizeString(raw.long_description),
    key_benefits: normalizeString(raw.key_benefits),
    faq: normalizeString(raw.faq),
    who_should_use_it: normalizeString(raw.who_should_use_it),
    how_to_use_it: normalizeString(raw.how_to_use_it),
    why_buy_from_upgraded: normalizeString(raw.why_buy_from_upgraded) || 'Authentic products with batch-level verification, GST invoice, fast Pan-India delivery, and dedicated WhatsApp support.',
    seo_title: normalizeString(raw.seo_title),
    seo_description: normalizeString(raw.seo_description),
    seo_keywords: normalizeString(raw.seo_keywords),
    meta_canonical: normalizeString(raw.meta_canonical),
    source_website: normalizeString(raw.source_website) || normalizeString(raw.sourceWebsite),
    source_product_url: normalizeString(raw.source_product_url) || normalizeString(raw.sourceUrl) || normalizeString(raw.url),
    source_image_urls: images.source_image_urls,
    data_confidence: normalizeString(raw.data_confidence) || 'medium',
    needs_review: normalizeString(raw.needs_review) || 'yes',
    review_notes: normalizeString(raw.review_notes) || 'Auto-normalized. Review and refine.',
    created_at: normalizeString(raw.created_at) || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function readCsvFile(filePath: string): Promise<any[]> {
  const content = readFileSync(filePath, 'utf-8');
  return parseCsv(content, { columns: true, skip_empty_lines: true, trim: true });
}

async function readXlsxFile(filePath: string): Promise<any[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.getWorksheet('MasterProducts') || workbook.getWorksheet(1);
  if (!sheet) return [];
  const headers: string[] = [];
  sheet.getRow(1).eachCell((cell, colNumber) => {
    headers[colNumber - 1] = normalizeString(cell.value);
  });
  const rows: any[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const obj: any = {};
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber - 1];
      if (header) obj[header] = cell.value;
    });
    rows.push(obj);
  });
  return rows;
}

async function readJsonFile(filePath: string): Promise<any[]> {
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

async function main() {
  logger.info('Starting normalization...');
  ensureDirSync('data/normalized');
  ensureDirSync('data/raw');
  ensureDirSync('data/rewritten');
  ensureDirSync('logs');

  const inputPath = resolve(opts.input);
  if (!existsSync(inputPath)) {
    logger.error(`Input file not found: ${inputPath}`);
    logger.info('Run npm run create:template first to generate sample_product_data.csv');
    return;
  }

  let rawData: any[] = [];
  const ext = extname(inputPath).toLowerCase();

  try {
    if (ext === '.csv') {
      logger.info(`Reading CSV: ${inputPath}`);
      rawData = await readCsvFile(inputPath);
    } else if (ext === '.xlsx') {
      logger.info(`Reading XLSX: ${inputPath}`);
      rawData = await readXlsxFile(inputPath);
    } else if (ext === '.json') {
      logger.info(`Reading JSON: ${inputPath}`);
      rawData = await readJsonFile(inputPath);
    } else {
      logger.error(`Unsupported file format: ${ext}. Use .csv, .xlsx, or .json`);
      return;
    }
  } catch (error) {
    logger.error(`Failed to read input file: ${error}`);
    return;
  }

  if (!Array.isArray(rawData) || rawData.length === 0) {
    logger.warn('No data rows found in input file');
    return;
  }

  const normalized = rawData.map(normalizeRow);

  writeFileSync(resolve(opts.output), JSON.stringify(normalized, null, 2), 'utf-8');
  logger.info(`Normalized ${normalized.length} products -> ${opts.output}`);

  if (opts.csv) {
    ensureDirSync(resolve(opts.csv, '..'));
    const csv = stringify(normalized, { header: true, columns: ALL_COLUMNS });
    writeFileSync(resolve(opts.csv), csv, 'utf-8');
    logger.info(`Exported CSV: ${opts.csv}`);
  }

  const summary = {
    total: normalized.length,
    brands: [...new Set(normalized.map((p: any) => p.brand_slug).filter(Boolean))],
    categories: [...new Set(normalized.map((p: any) => p.category).filter(Boolean))],
    needs_review: normalized.filter((p: any) => p.needs_review === 'yes').length,
    source: inputPath,
    timestamp: new Date().toISOString(),
  };
  writeFileSync('data/normalized/normalization-summary.json', JSON.stringify(summary, null, 2), 'utf-8');
  logger.info(`Summary: ${JSON.stringify(summary)}`);
}

main().catch(console.error);
