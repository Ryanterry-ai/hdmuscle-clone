/**
 * Validate Import Script
 * Validates normalized product data against Zod schemas and generates a validation report
 * Usage: npm run validate -- --input data/normalized-products.json
 */
import { program } from 'commander';
import { z } from 'zod';
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
    new transports.File({ filename: 'logs/validate.log' }),
    new transports.Console(),
  ],
});

const VALIDATION_COLUMNS = [
  'row_number', 'product_title', 'variant_sku', 'issue_type',
  'issue_description', 'severity', 'recommended_fix',
];

const VALID_SEVERITIES = ['error', 'warning', 'info'] as const;

const ProductSchema = z.object({
  brand: z.string().min(1, 'brand is required'),
  product_title: z.string().min(1, 'product_title is required'),
  product_handle: z.string().min(1, 'product_handle is required'),
  category: z.string().min(1, 'category is required'),
  variant_sku: z.string().min(1, 'variant_sku is required'),
  mrp: z.union([z.number(), z.string()]).transform((val) => {
    const n = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(n)) throw new Error('mrp must be numeric');
    return n;
  }),
  sale_price: z.union([z.number(), z.string()]).transform((val) => {
    const n = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(n)) throw new Error('sale_price must be numeric');
    return n;
  }),
  stock: z.union([z.number(), z.string()]).transform((val) => {
    const n = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(n)) throw new Error('stock must be numeric');
    return n;
  }),
  main_image: z.string().startsWith('/public/product-images/', 'main_image must start with /public/product-images/'),
  needs_review: z.enum(['yes', 'no']),
  data_confidence: z.enum(['high', 'medium', 'low']),
  seo_title: z.string().max(70, 'seo_title should be under 70 characters').optional().or(z.literal('')),
  seo_description: z.string().max(160, 'seo_description should be under 160 characters').optional().or(z.literal('')),
  stock_status: z.enum(['in_stock', 'out_of_stock', 'low_stock', 'preorder']).optional(),
  currency: z.string().min(1, 'currency is required').optional(),
});

program
  .option('-i, --input <path>', 'Input JSON path', 'data/normalized/products.json')
  .option('-o, --output <path>', 'Validation report JSON path', 'exports/validation_report.json')
  .option('-c, --csv <path>', 'Also export validation report CSV', 'exports/validation_report.csv')
  .option('-v, --verbose', 'Log individual product validation results', false)
  .parse();

interface ValidationResult {
  row_number: number;
  product_title: string;
  variant_sku: string;
  issue_type: string;
  issue_description: string;
  severity: 'error' | 'warning' | 'info';
  recommended_fix: string;
}

function checkMrpSalePrice(product: any, idx: number): ValidationResult[] {
  const issues: ValidationResult[] = [];
  const mrp = typeof product.mrp === 'string' ? parseFloat(product.mrp) : product.mrp;
  const sale = typeof product.sale_price === 'string' ? parseFloat(product.sale_price) : product.sale_price;

  if (isNaN(mrp)) {
    issues.push({
      row_number: idx + 2,
      product_title: product.product_title || 'Unknown',
      variant_sku: product.variant_sku || 'Unknown',
      issue_type: 'invalid_mrp',
      issue_description: 'mrp is not a valid number',
      severity: 'error',
      recommended_fix: 'Set a valid numeric mrp value',
    });
  }
  if (isNaN(sale)) {
    issues.push({
      row_number: idx + 2,
      product_title: product.product_title || 'Unknown',
      variant_sku: product.variant_sku || 'Unknown',
      issue_type: 'invalid_sale_price',
      issue_description: 'sale_price is not a valid number',
      severity: 'error',
      recommended_fix: 'Set a valid numeric sale_price value',
    });
  }
  if (!isNaN(mrp) && !isNaN(sale) && mrp < sale) {
    issues.push({
      row_number: idx + 2,
      product_title: product.product_title || 'Unknown',
      variant_sku: product.variant_sku || 'Unknown',
      issue_type: 'pricing_error',
      issue_description: `mrp (${mrp}) must be >= sale_price (${sale})`,
      severity: 'error',
      recommended_fix: 'Set mrp >= sale_price',
    });
  }
  return issues;
}

function checkCompliance(product: any, idx: number): ValidationResult[] {
  const issues: ValidationResult[] = [];
  const requiredCompliance = ['ingredients', 'nutrition_facts', 'serving_size', 'servings_per_container', 'directions', 'manufacturer'];

  requiredCompliance.forEach((field) => {
    if (!product[field] || product[field].trim() === '') {
      issues.push({
        row_number: idx + 2,
        product_title: product.product_title || 'Unknown',
        variant_sku: product.variant_sku || 'Unknown',
        issue_type: 'missing_compliance',
        issue_description: `Missing required compliance field: ${field}`,
        severity: 'warning',
        recommended_fix: `Fill ${field} from product label`,
      });
    }
  });
  return issues;
}

function checkMarketingContent(product: any, idx: number): ValidationResult[] {
  const issues: ValidationResult[] = [];
  const marketingFields = ['short_description', 'long_description', 'key_benefits', 'seo_title', 'seo_description'];

  marketingFields.forEach((field) => {
    if (!product[field] || product[field].trim() === '') {
      issues.push({
        row_number: idx + 2,
        product_title: product.product_title || 'Unknown',
        variant_sku: product.variant_sku || 'Unknown',
        issue_type: 'missing_marketing',
        issue_description: `Missing marketing content: ${field}`,
        severity: 'warning',
        recommended_fix: `Write ${field} for Upgraded.co.in brand voice`,
      });
    }
  });
  return issues;
}

function checkImagePaths(product: any, idx: number): ValidationResult[] {
  const issues: ValidationResult[] = [];
  const imageFields = ['main_image', 'gallery_images', 'label_image', 'nutrition_image'];

  imageFields.forEach((field) => {
    const value = product[field];
    if (value && value.trim() !== '' && !value.startsWith('/public/product-images/')) {
      issues.push({
        row_number: idx + 2,
        product_title: product.product_title || 'Unknown',
        variant_sku: product.variant_sku || 'Unknown',
        issue_type: 'invalid_image_path',
        issue_description: `${field} must start with /public/product-images/`,
        severity: 'error',
        recommended_fix: `Update ${field} to local path under /public/product-images/`,
      });
    }
  });
  return issues;
}

async function main() {
  logger.info('Starting validation...');
  const opts = program.opts();
  ensureDirSync('exports');
  ensureDirSync('logs');
  const results: ValidationResult[] = [];

  try {
    const products = JSON.parse(readFileSync(resolve(opts.input), 'utf-8'));
    if (!Array.isArray(products) || products.length === 0) {
      logger.warn('No products found in input file');
      return;
    }

    const skus = new Map<string, number>();

    products.forEach((p: any, idx: number) => {
      const rowResults: ValidationResult[] = [];

      const schemaResult = ProductSchema.safeParse(p);
      if (!schemaResult.success) {
        schemaResult.error.issues.forEach((issue) => {
          rowResults.push({
            row_number: idx + 2,
            product_title: p.product_title || 'Unknown',
            variant_sku: p.variant_sku || 'Unknown',
            issue_type: 'schema_validation',
            issue_description: `${issue.path.join('.')}: ${issue.message}`,
            severity: 'error',
            recommended_fix: `Fix ${issue.path.join('.')}: ${issue.message}`,
          });
        });
      }

      if (p.variant_sku) {
        if (skus.has(p.variant_sku)) {
          rowResults.push({
            row_number: idx + 2,
            product_title: p.product_title || 'Unknown',
            variant_sku: p.variant_sku,
            issue_type: 'duplicate_sku',
            issue_description: `Duplicate SKU: ${p.variant_sku} (first seen at row ${skus.get(p.variant_sku)})`,
            severity: 'error',
            recommended_fix: 'Assign a unique variant_sku',
          });
        } else {
          skus.set(p.variant_sku, idx + 2);
        }
      }

      rowResults.push(...checkMrpSalePrice(p, idx));
      rowResults.push(...checkCompliance(p, idx));
      rowResults.push(...checkMarketingContent(p, idx));
      rowResults.push(...checkImagePaths(p, idx));

      if (opts.verbose && rowResults.length === 0) {
        logger.info(`Row ${idx + 2} (${p.product_title || p.variant_sku}): PASS`);
      }

      results.push(...rowResults);
    });

    const errorCount = results.filter((r) => r.severity === 'error').length;
    const warningCount = results.filter((r) => r.severity === 'warning').length;

    const report = {
      total_products: products.length,
      total_issues: results.length,
      errors: errorCount,
      warnings: warningCount,
      unique_skus: skus.size,
      duplicate_skus: products.length - skus.size,
      report: results,
      timestamp: new Date().toISOString(),
    };

    writeFileSync(resolve(opts.output), JSON.stringify(report, null, 2), 'utf-8');
    logger.info(`Validation complete: ${results.length} issues (${errorCount} errors, ${warningCount} warnings)`);
    logger.info(`Report: ${opts.output}`);

    if (opts.csv) {
      ensureDirSync(resolve(opts.csv, '..'));
      const csv = stringify(results, { header: true, columns: VALIDATION_COLUMNS });
      writeFileSync(resolve(opts.csv), csv, 'utf-8');
      logger.info(`CSV report: ${opts.csv}`);
    }
  } catch (error) {
    logger.error(`Validation failed: ${error}`);
  }
}

main().catch(console.error);
