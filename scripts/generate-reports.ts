/**
 * Generate Reports Script
 * Creates missing data, source audit, and summary reports
 * Usage: npx tsx scripts/generate-reports.ts --input data/normalized/products.json
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
    new transports.File({ filename: 'logs/reports.log' }),
    new transports.Console(),
  ],
});

const MISSING_DATA_COLUMNS = [
  'row_number', 'product_title', 'variant_sku', 'missing_field',
  'field_category', 'severity', 'recommended_action',
];

const SOURCE_AUDIT_COLUMNS = [
  'product_title', 'variant_sku', 'source_website', 'source_product_url',
  'source_image_urls', 'data_confidence', 'has_source_url', 'has_source_images',
  'competitor_url_risk', 'notes',
];

const COMPETITOR_DOMAINS = [
  'bodybuilding.com', 'muscleandstrength.com', 'iherb.com',
  'healthkart.com', 'nutrabay.com', 'amazon.in', 'flipkart.com',
];

const REQUIRED_FIELDS = [
  'brand', 'product_title', 'product_handle', 'category', 'variant_sku',
  'mrp', 'sale_price', 'main_image', 'ingredients', 'nutrition_facts',
  'serving_size', 'servings_per_container', 'directions', 'manufacturer',
  'country_of_origin', 'seo_title', 'seo_description',
];

const COMPLIANCE_FIELDS = [
  'ingredients', 'nutrition_facts', 'serving_size', 'servings_per_container',
  'directions', 'warnings', 'allergen_info', 'manufacturer', 'importer',
];

const MARKETING_FIELDS = [
  'short_description', 'long_description', 'key_benefits', 'faq',
  'who_should_use_it', 'how_to_use_it', 'why_buy_from_upgraded',
];

program
  .option('-i, --input <path>', 'Input product data JSON', 'data/normalized/products.json')
  .option('-o, --output-dir <path>', 'Output directory for reports', 'exports')
  .option('-v, --verbose', 'Show detailed report output', false)
  .parse();

const opts = program.opts();

function classifyField(field: string): string {
  if (REQUIRED_FIELDS.includes(field)) return 'required';
  if (COMPLIANCE_FIELDS.includes(field)) return 'compliance';
  if (MARKETING_FIELDS.includes(field)) return 'marketing';
  return 'optional';
}

function getSeverity(category: string): string {
  if (category === 'required') return 'error';
  if (category === 'compliance') return 'warning';
  return 'info';
}

function checkCompetitorRisk(url: string): { risk: boolean; domain: string } {
  if (!url) return { risk: false, domain: '' };
  const lower = url.toLowerCase();
  for (const domain of COMPETITOR_DOMAINS) {
    if (lower.includes(domain)) {
      return { risk: true, domain };
    }
  }
  return { risk: false, domain: '' };
}

function generateMissingDataReport(products: any[]): any[] {
  const report: any[] = [];

  products.forEach((p: any, idx: number) => {
    const allFields = [...REQUIRED_FIELDS, ...COMPLIANCE_FIELDS, ...MARKETING_FIELDS, 'stock', 'stock_status', 'currency'];

    allFields.forEach((field) => {
      const value = p[field];
      if (value === undefined || value === null || value === '' || (typeof value === 'string' && value.trim() === '')) {
        const category = classifyField(field);
        const severity = getSeverity(category);
        report.push({
          row_number: idx + 2,
          product_title: p.product_title || 'Unknown',
          variant_sku: p.variant_sku || 'Unknown',
          missing_field: field,
          field_category: category,
          severity,
          recommended_action: category === 'required'
            ? `Fill ${field} before import`
            : category === 'compliance'
              ? `Fill ${field} from product label or mark needs_review = yes`
              : `Write ${field} for Upgraded.co.in brand voice`,
        });
      }
    });
  });

  return report;
}

function generateSourceAuditReport(products: any[]): any[] {
  const report: any[] = [];

  products.forEach((p: any) => {
    const sourceUrl = p.source_product_url || '';
    const sourceImages = p.source_image_urls || '';
    const urlRisk = checkCompetitorRisk(sourceUrl);
    const imgRisk = checkCompetitorRisk(sourceImages);
    const hasCompetitorRisk = urlRisk.risk || imgRisk.risk;

    const notes: string[] = [];
    if (!sourceUrl) notes.push('No source URL provided');
    if (!sourceImages) notes.push('No source images provided');
    if (hasCompetitorRisk) notes.push(`Competitor domain detected: ${urlRisk.domain || imgRisk.domain}`);
    if (p.data_confidence === 'low') notes.push('Low data confidence flagged');

    report.push({
      product_title: p.product_title || 'Unknown',
      variant_sku: p.variant_sku || 'Unknown',
      source_website: p.source_website || '',
      source_product_url: sourceUrl,
      source_image_urls: sourceImages,
      data_confidence: p.data_confidence || 'unknown',
      has_source_url: sourceUrl ? 'yes' : 'no',
      has_source_images: sourceImages ? 'yes' : 'no',
      competitor_url_risk: hasCompetitorRisk ? 'yes' : 'no',
      notes: notes.join('; ') || 'No issues',
    });
  });

  return report;
}

function generateSummary(products: any[], missingReport: any[], sourceReport: any[]): any {
  const totalFields = products.length * REQUIRED_FIELDS.length;
  const missingRequired = missingReport.filter((r) => r.field_category === 'required').length;
  const missingCompliance = missingReport.filter((r) => r.field_category === 'compliance').length;
  const missingMarketing = missingReport.filter((r) => r.field_category === 'marketing').length;

  const brands = new Set(products.map((p) => p.brand_slug).filter(Boolean));
  const categories = new Set(products.map((p) => p.category).filter(Boolean));
  const needsReview = products.filter((p) => p.needs_review === 'yes').length;
  const competitorRisk = sourceReport.filter((r) => r.competitor_url_risk === 'yes').length;

  return {
    total_products: products.length,
    unique_brands: brands.size,
    brands: Array.from(brands),
    unique_categories: categories.size,
    categories: Array.from(categories),
    data_completeness: {
      total_required_fields: totalFields,
      missing_required: missingRequired,
      missing_compliance: missingCompliance,
      missing_marketing: missingMarketing,
      completeness_percentage: totalFields > 0 ? (((totalFields - missingRequired) / totalFields) * 100).toFixed(1) : '0',
    },
    review_status: {
      needs_review: needsReview,
      approved: products.length - needsReview,
    },
    source_audit: {
      with_source_url: sourceReport.filter((r) => r.has_source_url === 'yes').length,
      with_source_images: sourceReport.filter((r) => r.has_source_images === 'yes').length,
      competitor_risk: competitorRisk,
    },
    timestamp: new Date().toISOString(),
  };
}

async function main() {
  logger.info('Starting report generation...');
  ensureDirSync(opts.outputDir);
  ensureDirSync('logs');

  let products: any[];
  try {
    products = JSON.parse(readFileSync(resolve(opts.input), 'utf-8'));
  } catch {
    logger.warn(`Input file not found: ${opts.input}. No data to report on.`);
    return;
  }

  if (products.length === 0) {
    logger.info('No products to generate reports for.');
    return;
  }

  logger.info(`Generating reports for ${products.length} products...`);

  const missingData = generateMissingDataReport(products);
  const sourceAudit = generateSourceAuditReport(products);
  const summary = generateSummary(products, missingData, sourceAudit);

  const missingDataCsv = stringify(missingData, { header: true, columns: MISSING_DATA_COLUMNS });
  writeFileSync(resolve(opts.outputDir, 'missing_data_report.csv'), missingDataCsv, 'utf-8');
  logger.info(`Missing data report: ${opts.outputDir}/missing_data_report.csv (${missingData.length} issues)`);

  const sourceAuditCsv = stringify(sourceAudit, { header: true, columns: SOURCE_AUDIT_COLUMNS });
  writeFileSync(resolve(opts.outputDir, 'source_audit_report.csv'), sourceAuditCsv, 'utf-8');
  logger.info(`Source audit report: ${opts.outputDir}/source_audit_report.csv`);

  writeFileSync(resolve(opts.outputDir, 'summary_report.json'), JSON.stringify(summary, null, 2), 'utf-8');
  logger.info(`Summary report: ${opts.outputDir}/summary_report.json`);

  if (opts.verbose) {
    logger.info('=== SUMMARY ===');
    logger.info(JSON.stringify(summary, null, 2));
  }
}

main().catch(console.error);
