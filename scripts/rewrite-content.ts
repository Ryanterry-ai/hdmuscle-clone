/**
 * Rewrite Content Script
 * Rewrites marketing fields for Upgraded.co.in brand voice
 * Preserves all factual label data exactly
 * Usage: npx tsx scripts/rewrite-content.ts --input data/normalized/products.json --output data/rewritten/products.json
 */
import { program } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { ensureDirSync } from 'fs-extra';
import { resolve } from 'path';
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [
    new transports.File({ filename: 'logs/rewrite-content.log' }),
    new transports.Console(),
  ],
});

const MARKETING_FIELDS = [
  'short_description',
  'long_description',
  'key_benefits',
  'faq',
  'who_should_use_it',
  'how_to_use_it',
  'why_buy_from_upgraded',
  'seo_title',
  'seo_description',
  'authenticity_message',
];

const FACTUAL_FIELDS = [
  'ingredients',
  'nutrition_facts',
  'serving_size',
  'servings_per_container',
  'directions',
  'warnings',
  'allergen_info',
  'manufacturer',
  'importer',
  'country_of_origin',
  'batch_number',
  'expiry_date',
];

program
  .option('-i, --input <path>', 'Input normalized JSON', 'data/normalized/products.json')
  .option('-o, --output <path>', 'Output rewritten JSON', 'data/rewritten/products.json')
  .option('--dry-run', 'Preview rewrites without saving', false)
  .option('-f, --force', 'Rewrite even if fields already have content', false)
  .parse();

const opts = program.opts();

const BRAND_VOICE = {
  tone: 'premium, trustworthy, fitness-focused, India-market ready, authenticity-first',
  marketplace: 'Upgraded.co.in',
  valueProps: [
    '100% authentic products',
    'Batch-level verification',
    'GST invoices',
    'Fast Pan-India delivery',
    'Dedicated WhatsApp support',
    'Lab-tested quality',
  ],
};

function generateAuthenticityMessage(product: any): string {
  const origin = product.country_of_origin || 'India';
  const isImport = origin !== 'India';
  if (isImport) {
    return `${product.brand} products are imported through authorized channels and verified for authenticity at every step. Each batch is tracked to ensure you receive genuine supplements on Upgraded.co.in.`;
  }
  return `100% authentic ${product.brand} products sourced directly from authorized distributors. Every batch is tracked and verified for quality assurance on Upgraded.co.in.`;
}

function generateShortDescription(product: any): string {
  const type = product.product_type || product.subcategory || product.category || 'supplement';
  const flavor = product.flavor ? ` ${product.flavor}` : '';
  const size = product.size ? ` (${product.size})` : '';
  const goal = product.goal ? ` for ${product.goal.toLowerCase()}` : '';
  return `Premium ${type}${flavor}${size} by ${product.brand}${goal}. Authentic, lab-tested, and delivered across India on Upgraded.co.in.`;
}

function generateLongDescription(product: any): string {
  const type = product.product_type || product.subcategory || product.category || 'supplement';
  const brand = product.brand || 'the brand';
  const goal = product.goal || 'your fitness goals';
  const serving = product.serving_size ? `Each serving delivers` : '';
  const nutrition = product.nutrition_facts ? ` ${product.nutrition_facts.split(':')[1]?.trim() || ''}` : '';

  return `${brand} ${product.product_title} is a premium ${type.toLowerCase()} designed for athletes and fitness enthusiasts who refuse to compromise on quality. ${serving}${nutrition}. Whether you are training for performance, building strength, or supporting your overall wellness, this product from ${brand} is formulated to help you achieve ${goal.toLowerCase()}.\n\nAvailable exclusively on Upgraded.co.in with guaranteed authenticity, GST invoices, and fast Pan-India delivery.`;
}

function generateKeyBenefits(product: any): string {
  const benefits: string[] = [];
  if (product.nutrition_facts) {
    const keyNutrient = product.nutrition_facts.split(':')[1]?.trim() || '';
    if (keyNutrient) benefits.push(keyNutrient.split(',')[0]?.trim() || '');
  }
  if (product.serving_size) benefits.push(`${product.serving_size} per serving`);
  if (product.servings_per_container) benefits.push(`${product.servings_per_container} servings per pack`);
  benefits.push('Authentic and lab-tested');
  benefits.push('Fast Pan-India delivery');
  benefits.push('GST invoice included');

  return benefits.join(', ');
}

function generateFAQ(product: any): string {
  const type = product.product_type || product.subcategory || product.category || 'supplement';
  const serving = product.serving_size || 'one serving';

  return `Q: How much should I take per serving?\nA: Refer to the directions on the product label. Typically ${serving} per serving.\n\nQ: Is this product authentic?\nA: Yes, all products on Upgraded.co.in are 100% authentic with batch-level verification.\n\nQ: Do you provide GST invoices?\nA: Yes, GST invoices are provided with every order on Upgraded.co.in.`;
}

function generateWhoShouldUseIt(product: any): string {
  const goal = product.goal || 'fitness';
  const type = product.product_type || product.subcategory || product.category || 'supplement';

  return `Anyone looking to support their ${goal.toLowerCase()} goals with a quality ${type.toLowerCase()}. Suitable for athletes, gym-goers, fitness enthusiasts, and health-conscious individuals. Always consult your healthcare provider before starting any supplement.`;
}

function generateHowToUseIt(product: any): string {
  return product.directions || `Follow the usage directions on the product label. Take consistently for best results. Store in a cool, dry place away from direct sunlight.`;
}

function generateWhyBuyFromUpgraded(): string {
  return `Shop with confidence on Upgraded.co.in. We guarantee 100% authentic products with batch-level verification, GST invoices on every order, fast Pan-India delivery, and dedicated WhatsApp support. Your fitness journey deserves a marketplace you can trust.`;
}

function generateSEOTitle(product: any): string {
  const type = product.product_type || product.subcategory || product.category || 'Supplement';
  const flavor = product.flavor ? ` ${product.flavor}` : '';
  const size = product.size ? ` ${product.size}` : '';
  const title = `Buy ${type}${flavor}${size} by ${product.brand} | Upgraded.co.in`;
  return title.length > 70 ? title.substring(0, 67) + '...' : title;
}

function generateSEODescription(product: any): string {
  const type = product.product_type || product.subcategory || product.category || 'supplement';
  const desc = `Buy ${type} by ${product.brand} on Upgraded.co.in. 100% authentic, lab-tested supplements with GST invoices and fast Pan-India delivery. Shop now.`;
  return desc.length > 160 ? desc.substring(0, 157) + '...' : desc;
}

function rewriteProduct(product: any): any {
  const rewritten = { ...product };
  const needsRewriting = opts.force || true;

  if (needsRewriting) {
    rewritten.authenticity_message = generateAuthenticityMessage(product);
    rewritten.short_description = generateShortDescription(product);
    rewritten.long_description = generateLongDescription(product);
    rewritten.key_benefits = generateKeyBenefits(product);
    rewritten.faq = generateFAQ(product);
    rewritten.who_should_use_it = generateWhoShouldUseIt(product);
    rewritten.how_to_use_it = generateHowToUseIt(product);
    rewritten.why_buy_from_upgraded = generateWhyBuyFromUpgraded();
    rewritten.seo_title = generateSEOTitle(product);
    rewritten.seo_description = generateSEODescription(product);
    rewritten.data_confidence = 'medium';
    rewritten.needs_review = 'yes';
    rewritten.review_notes = 'Marketing content auto-generated. Review and refine for brand voice alignment.';
    rewritten.updated_at = new Date().toISOString();
  }

  const factualCheck: string[] = [];
  FACTUAL_FIELDS.forEach((field) => {
    if (!product[field] || product[field].trim() === '') {
      factualCheck.push(field);
    }
  });

  if (factualCheck.length > 0) {
    rewritten.needs_review = 'yes';
    rewritten.review_notes = `Auto-rewritten. Missing factual fields: ${factualCheck.join(', ')}. Fill from product label.`;
  }

  return rewritten;
}

async function main() {
  logger.info('Starting content rewrite...');
  ensureDirSync('logs');

  let products: any[];
  try {
    products = JSON.parse(readFileSync(resolve(opts.input), 'utf-8'));
  } catch {
    logger.warn(`Input file not found: ${opts.input}. No products to rewrite.`);
    return;
  }

  if (products.length === 0) {
    logger.info('No products to rewrite.');
    return;
  }

  logger.info(`Rewriting ${products.length} products${opts.dryRun ? ' (dry run)' : ''}...`);

  const rewritten = products.map(rewriteProduct);

  if (opts.dryRun) {
    logger.info('--- DRY RUN PREVIEW ---');
    rewritten.forEach((p, i) => {
      logger.info(`\nProduct ${i + 1}: ${p.product_title}`);
      MARKETING_FIELDS.forEach((field) => {
        logger.info(`  ${field}: ${p[field]?.substring(0, 100)}${(p[field]?.length || 0) > 100 ? '...' : ''}`);
      });
    });
    logger.info('\n--- END DRY RUN ---');
  } else {
    ensureDirSync(resolve(opts.output, '..'));
    writeFileSync(resolve(opts.output), JSON.stringify(rewritten, null, 2), 'utf-8');
    logger.info(`Rewritten ${rewritten.length} products -> ${opts.output}`);
  }

  const summary = {
    total: rewritten.length,
    rewritten_fields: MARKETING_FIELDS,
    preserved_fields: FACTUAL_FIELDS,
    needs_review: rewritten.filter((p) => p.needs_review === 'yes').length,
    timestamp: new Date().toISOString(),
  };
  logger.info(`Rewrite summary: ${JSON.stringify(summary)}`);
}

main().catch(console.error);
