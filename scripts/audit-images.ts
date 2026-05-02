/**
 * Audit Images Script
 * Validates that all referenced product images exist locally in the file system
 * Usage: npm run audit:images -- --input data/normalized-products.json
 */
import { program } from 'commander';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { ensureDirSync } from 'fs-extra';
import { resolve, join, normalize } from 'path';
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [
    new transports.File({ filename: 'logs/audit-images.log' }),
    new transports.Console(),
  ],
});

program
  .option('-i, --input <path>', 'Input product data JSON', 'data/normalized/products.json')
  .option('-d, --dir <path>', 'Image directory root', 'public/product-images')
  .option('-o, --output <path>', 'Audit report output path', 'exports/image_audit_report.json')
  .parse();

const opts = program.opts();

function getAllImageFiles(dir: string, baseDir: string): string[] {
  const files: string[] = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...getAllImageFiles(fullPath, baseDir));
      } else if (entry.isFile() && /\.(webp|png|jpg|jpeg)$/i.test(entry.name)) {
        const normalizedPath = normalize(fullPath);
        files.push(normalizedPath);
      }
    }
  } catch {
    // Directory may not exist yet
  }
  return files;
}

interface AuditIssue {
  row: number;
  product_handle: string;
  variant_sku: string;
  field: string;
  expected_path: string;
  exists: boolean;
}

async function main() {
  logger.info('Starting image audit...');
  ensureDirSync('exports');
  ensureDirSync('logs');

  let products: any[];
  try {
    products = JSON.parse(readFileSync(resolve(opts.input), 'utf-8'));
  } catch {
    logger.warn(`Input file not found: ${opts.input}. No products to audit.`);
    return;
  }

  if (products.length === 0) {
    logger.info('No products to audit.');
    return;
  }

  const imageRoot = resolve(opts.dir);
  const localFiles = getAllImageFiles(imageRoot, imageRoot);
  const localSet = new Set(localFiles.map((f) => normalize(f)));

  logger.info(`Found ${localFiles.length} local image files in ${imageRoot}`);

  let missing = 0;
  let found = 0;
  let skipped = 0;
  const issues: AuditIssue[] = [];

  const imageFields = ['main_image', 'gallery_images', 'label_image', 'nutrition_image'];

  products.forEach((p: any, idx: number) => {
    imageFields.forEach((field) => {
      const raw = p[field] || '';
      if (!raw || raw.trim() === '') {
        skipped++;
        return;
      }

      const paths = raw.split(',').map((s: string) => s.trim()).filter(Boolean);

      paths.forEach((imgPath: string) => {
        if (!imgPath.startsWith('/public/product-images/')) {
          skipped++;
          return;
        }

        const relativePath = imgPath.replace('/public/', '');
        const fullPath = normalize(resolve(relativePath));

        if (localSet.has(fullPath)) {
          found++;
        } else {
          missing++;
          issues.push({
            row: idx + 2,
            product_handle: p.product_handle || 'unknown',
            variant_sku: p.variant_sku || 'unknown',
            field,
            expected_path: imgPath,
            exists: false,
          });
        }
      });
    });
  });

  const report = {
    total_products: products.length,
    total_images_referenced: found + missing,
    found,
    missing,
    skipped_empty: skipped,
    issues,
    timestamp: new Date().toISOString(),
  };

  writeFileSync(resolve(opts.output), JSON.stringify(report, null, 2), 'utf-8');

  logger.info(`Audit complete: ${found} found, ${missing} missing, ${skipped} empty references`);

  if (missing > 0) {
    logger.warn(`Missing images (${missing} total):`);
    issues.forEach((i) => {
      logger.warn(`  Row ${i.row} (${i.product_handle}): ${i.field} -> ${i.expected_path}`);
    });
  } else {
    logger.info('All referenced images exist locally.');
  }
}

main().catch(console.error);
