/**
 * Export Tables Script
 * Exports validated product data into separate import files for all 10 backend entities
 * Usage: npm run export -- --input data/normalized-products.json --output exports
 */
import { program } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { ensureDirSync } from 'fs-extra';
import { resolve } from 'path';
import { createLogger, format, transports } from 'winston';
import { stringify } from 'csv-stringify/sync';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [
    new transports.File({ filename: 'logs/export.log' }),
    new transports.Console(),
  ],
});

program
  .option('-i, --input <path>', 'Input validated JSON', 'data/normalized/products.json')
  .option('-o, --output <path>', 'Output directory', 'exports')
  .option('-f, --format <type>', 'Output format: json or csv', 'csv')
  .parse();

const opts = program.opts();

function writeFile(name: string, data: any[], ext: string) {
  const path = resolve(opts.output, `${name}.${ext}`);
  const content = ext === 'csv'
    ? stringify(data, { header: true })
    : JSON.stringify(data, null, 2);
  writeFileSync(path, content, 'utf-8');
  logger.info(`Exported ${name}: ${data.length} records -> ${path}`);
}

function extractBrands(products: any[]) {
  const brandMap = new Map<string, any>();
  products.forEach((p: any) => {
    if (!brandMap.has(p.brand_slug)) {
      brandMap.set(p.brand_slug, {
        name: p.brand,
        slug: p.brand_slug,
        description: '',
        logo: `/public/brand-logos/${p.brand_slug}.webp`,
        is_active: true,
        country_of_origin: p.country_of_origin || '',
        created_at: p.created_at,
      });
    }
  });
  return Array.from(brandMap.values());
}

function extractCategories(products: any[]) {
  const catMap = new Map<string, any>();
  products.forEach((p: any) => {
    if (!p.category) return;
    const key = `${p.category}/${p.subcategory || ''}`;
    if (!catMap.has(key)) {
      catMap.set(key, {
        name: p.category,
        subcategory: p.subcategory || '',
        slug: `${p.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}${p.subcategory ? '/' + p.subcategory.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''}`,
        goal: p.goal || '',
        menu_group: p.category,
        is_active: true,
      });
    }
  });
  return Array.from(catMap.values());
}

function extractProducts(products: any[]) {
  const productMap = new Map<string, any>();
  products.forEach((p: any) => {
    if (!productMap.has(p.product_handle)) {
      productMap.set(p.product_handle, {
        handle: p.product_handle,
        title: p.product_title,
        brand_slug: p.brand_slug,
        category: p.category,
        subcategory: p.subcategory,
        product_type: p.product_type,
        short_description: p.short_description,
        long_description: p.long_description,
        source_website: p.source_website,
        source_product_url: p.source_product_url,
        created_at: p.created_at,
        updated_at: p.updated_at,
      });
    }
  });
  return Array.from(productMap.values());
}

function extractVariants(products: any[]) {
  return products.map((p: any) => ({
    sku: p.variant_sku,
    product_handle: p.product_handle,
    flavor: p.flavor,
    size: p.size,
    variant_title: p.variant_title,
    barcode: p.barcode,
    mrp: p.mrp,
    sale_price: p.sale_price,
    cost_price: p.cost_price,
    wholesale_price: p.wholesale_price,
    distributor_price: p.distributor_price,
    currency: p.currency,
    tax_rate: p.tax_rate,
    created_at: p.created_at,
  }));
}

function extractProductImages(products: any[]) {
  const images: any[] = [];
  products.forEach((p: any, idx: number) => {
    const brandSlug = p.brand_slug;
    const handle = p.product_handle;
    let sortOrder = 0;

    if (p.main_image) {
      images.push({
        id: `img-${idx}-main`,
        product_handle: handle,
        image_path: p.main_image,
        image_type: 'main',
        alt_text: `${p.product_title} - ${p.variant_title}`,
        sort_order: sortOrder++,
      });
    }

    if (p.gallery_images) {
      p.gallery_images.split(',').filter(Boolean).forEach((img: string, i: number) => {
        images.push({
          id: `img-${idx}-gallery-${i}`,
          product_handle: handle,
          image_path: img.trim(),
          image_type: 'gallery',
          alt_text: `${p.product_title} - Gallery ${i + 1}`,
          sort_order: sortOrder++,
        });
      });
    }

    if (p.label_image) {
      images.push({
        id: `img-${idx}-label`,
        product_handle: handle,
        image_path: p.label_image,
        image_type: 'label',
        alt_text: `${p.product_title} - Label`,
        sort_order: sortOrder++,
      });
    }

    if (p.nutrition_image) {
      images.push({
        id: `img-${idx}-nutrition`,
        product_handle: handle,
        image_path: p.nutrition_image,
        image_type: 'nutrition',
        alt_text: `${p.product_title} - Nutrition`,
        sort_order: sortOrder++,
      });
    }
  });
  return images;
}

function extractInventory(products: any[]) {
  return products.map((p: any) => ({
    sku: p.variant_sku,
    product_handle: p.product_handle,
    stock: p.stock,
    stock_status: p.stock_status,
    min_order_quantity: p.min_order_quantity,
    case_pack_quantity: p.case_pack_quantity,
    batch_number: p.batch_number,
    expiry_date: p.expiry_date,
    warehouse_location: '',
    last_counted_at: '',
    updated_at: p.updated_at,
  }));
}

function extractSEO(products: any[]) {
  return products.map((p: any) => ({
    product_handle: p.product_handle,
    variant_sku: p.variant_sku,
    seo_title: p.seo_title,
    seo_description: p.seo_description,
    seo_keywords: p.seo_keywords,
    meta_canonical: p.meta_canonical,
    og_image: p.main_image,
  }));
}

function extractComplianceData(products: any[]) {
  return products.map((p: any) => ({
    product_handle: p.product_handle,
    variant_sku: p.variant_sku,
    ingredients: p.ingredients,
    nutrition_facts: p.nutrition_facts,
    serving_size: p.serving_size,
    servings_per_container: p.servings_per_container,
    directions: p.directions,
    warnings: p.warnings,
    allergen_info: p.allergen_info,
    manufacturer: p.manufacturer,
    importer: p.importer,
    country_of_origin: p.country_of_origin,
    fssai_license: '',
    import_license: '',
    needs_review: p.needs_review,
  }));
}

function extractWholesalePricing(products: any[]) {
  return products.map((p: any) => ({
    sku: p.variant_sku,
    product_handle: p.product_handle,
    cost_price: p.cost_price,
    wholesale_price: p.wholesale_price,
    distributor_price: p.distributor_price,
    mrp: p.mrp,
    sale_price: p.sale_price,
    min_order_quantity: p.min_order_quantity,
    case_pack_quantity: p.case_pack_quantity,
    tier_gym_owner: p.wholesale_price,
    tier_retailer: p.wholesale_price * 0.97 || p.wholesale_price,
    tier_wholesaler: p.distributor_price,
    tier_distributor: p.distributor_price * 0.96 || p.distributor_price,
    currency: p.currency,
  }));
}

function extractBrandPartnerData(products: any[]) {
  const brandMap = new Map<string, any>();
  products.forEach((p: any) => {
    if (!brandMap.has(p.brand_slug)) {
      brandMap.set(p.brand_slug, {
        brand_slug: p.brand_slug,
        brand_name: p.brand,
        authenticity_message: p.authenticity_message,
        why_buy_from_upgraded: p.why_buy_from_upgraded,
        key_benefits: p.key_benefits,
        faq: p.faq,
        who_should_use_it: p.who_should_use_it,
        how_to_use_it: p.how_to_use_it,
        updated_at: p.updated_at,
      });
    }
  });
  return Array.from(brandMap.values());
}

async function main() {
  logger.info('Starting export...');
  ensureDirSync(opts.output);
  ensureDirSync('logs');

  try {
    const products = JSON.parse(readFileSync(resolve(opts.input), 'utf-8'));
    if (!Array.isArray(products) || products.length === 0) {
      logger.warn('No products found in input file');
      return;
    }

    const ext = opts.format === 'csv' ? 'csv' : 'json';

    const exports = [
      { name: 'brands', data: extractBrands(products) },
      { name: 'categories', data: extractCategories(products) },
      { name: 'products', data: extractProducts(products) },
      { name: 'product_variants', data: extractVariants(products) },
      { name: 'product_images', data: extractProductImages(products) },
      { name: 'inventory', data: extractInventory(products) },
      { name: 'seo', data: extractSEO(products) },
      { name: 'compliance_data', data: extractComplianceData(products) },
      { name: 'wholesale_pricing', data: extractWholesalePricing(products) },
      { name: 'brand_partner_data', data: extractBrandPartnerData(products) },
    ];

    exports.forEach(({ name, data }) => writeFile(name, data, ext));

    const exportSummary = {
      entities: exports.length,
      total_records: exports.reduce((sum, e) => sum + e.data.length, 0),
      format: ext,
      timestamp: new Date().toISOString(),
    };
    writeFileSync(resolve(opts.output, 'export-summary.json'), JSON.stringify(exportSummary, null, 2), 'utf-8');
    logger.info(`Export complete: ${exportSummary.total_records} total records across ${exportSummary.entities} entities`);
  } catch (error) {
    logger.error(`Export failed: ${error}`);
  }
}

main().catch(console.error);
