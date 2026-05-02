/**
 * Run All Script
 * Orchestrates the complete product data extraction pipeline
 * Usage: npm run run:all
 */
import { execSync } from 'child_process';
import { createLogger, format, transports } from 'winston';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [
    new transports.File({ filename: 'logs/run-all.log' }),
    new transports.Console(),
  ],
});

interface Step {
  name: string;
  command: string;
  required: boolean;
  description: string;
}

const projectRoot = resolve(__dirname, '..');

const steps: Step[] = [
  { name: 'Create Template', command: `npx tsx scripts/create-template.ts`, required: true, description: 'Generate Excel template and sample CSV' },
  { name: 'Normalize', command: `npx tsx scripts/normalize-products.ts --input sample_product_data.csv --output data/normalized/products.json --csv data/normalized/products.csv`, required: false, description: 'Normalize sample data into import format' },
  { name: 'Rewrite Content', command: `npx tsx scripts/rewrite-content.ts --input data/normalized/products.json --output data/rewritten/products.json`, required: false, description: 'Rewrite marketing fields for Upgraded.co.in brand voice' },
  { name: 'Download Images', command: `npx tsx scripts/download-images.ts`, required: false, description: 'Download and convert product images to local .webp' },
  { name: 'Validate Import', command: `npx tsx scripts/validate-import.ts`, required: true, description: 'Validate data against Zod schemas' },
  { name: 'Export Tables', command: `npx tsx scripts/export-tables.ts`, required: false, description: 'Split into 10 backend-ready CSV files' },
  { name: 'Audit Images', command: `npx tsx scripts/audit-images.ts`, required: false, description: 'Verify local image files exist and meet requirements' },
  { name: 'Generate Reports', command: `npx tsx scripts/generate-reports.ts`, required: false, description: 'Create missing data, source audit, and summary reports' },
];

async function runStep(step: Step): Promise<boolean> {
  logger.info(`▶ ${step.name}: ${step.description}`);
  logger.info(`  Command: ${step.command}`);

  try {
    execSync(step.command, {
      cwd: projectRoot,
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' },
    });
    logger.info(`✓ ${step.name}: completed`);
    return true;
  } catch (error: any) {
    if (step.required) {
      logger.error(`✗ ${step.name}: failed (exit code ${error.status})`);
      return false;
    } else {
      logger.warn(`⚠ ${step.name}: skipped or failed (exit code ${error.status})`);
      return true;
    }
  }
}

async function main() {
  logger.info('═══════════════════════════════════════════════════════');
  logger.info('  Upgraded.co.in Product Data Extraction Pipeline');
  logger.info('═══════════════════════════════════════════════════════');
  logger.info('');

  const startTime = Date.now();
  let failed = false;

  for (const step of steps) {
    const success = await runStep(step);
    if (!success) {
      failed = true;
      logger.error(`Pipeline stopped at: ${step.name}`);
      break;
    }
    logger.info('───────────────────────────────────────────────────────');
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  logger.info('');
  if (failed) {
    logger.error(`Pipeline failed after ${elapsed}s`);
    process.exit(1);
  } else {
    logger.info(`Pipeline completed successfully in ${elapsed}s`);
    logger.info('═══════════════════════════════════════════════════════');
  }
}

main().catch((err) => {
  logger.error(`Pipeline error: ${err.message}`);
  process.exit(1);
});
