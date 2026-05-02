/**
 * Map Uploaded Images Script
 * Maps incoming uploaded images to products based on filename patterns.
 *
 * Supported filename patterns:
 * - brand-slug__product-handle__main.webp
 * - brand-slug__product-handle__gallery-01.webp
 * - brand-slug__product-handle__label.webp
 * - brand-slug__product-handle__nutrition.webp
 * - variant-sku__main.webp
 * - variant-sku__gallery-01.webp
 * - product-handle__main.webp
 *
 * Mapping priority:
 * 1. Exact variant_sku match
 * 2. Exact brand_slug + product_handle match
 * 3. Exact product_handle match
 * 4. Fuzzy match only if confidence is high
 *
 * Usage: npm run map:images -- --dry-run
 *        npm run map:images -- --overwrite
 */
import { program } from 'commander';
import { readdirSync, statSync, copyFileSync, mkdirSync, existsSync, renameSync, readFileSync, writeFileSync } from 'fs';
import { resolve, join, basename, extname, dirname } from 'path';
import { createLogger, format, transports } from 'winston';
import sharp from 'sharp';
import slugify from 'slugify';
import { stringify } from 'csv-stringify/sync';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [
    new transports.File({ filename: 'logs/map-images.log' }),
    new transports.Console(),
  ],
});

program
  .option('-i, --incoming <path>', 'Incoming image folder', 'public/product-images/incoming')
  .option('-p, --product-data <path>', 'Product data JSON', 'data/rewritten/products.json')
  .option('-o, --output <path>', 'Output directory for reports', 'exports')
  .option('--dry-run', 'Preview mapping without moving files', false)
  .option('--overwrite', 'Overwrite existing images', false)
  .option('-c, --confidence <number>', 'Minimum confidence threshold (0-1)', '0.7')
  .parse();

const opts = program.opts();

interface ImageMapping {
  original_file: string;
  mapped_product_title: string;
  mapped_product_handle: string;
  mapped_brand_slug: string;
  mapped_variant_sku: string;
  detected_image_type: string;
  final_path: string;
  mapping_confidence: number;
  mapping_method: string;
  status: string;
  notes: string;
}

interface UnmappedImage {
  original_file: string;
  reason: string;
  suggested_product_matches: string;
  recommended_fix: string;
}

interface DuplicateImage {
  incoming_file: string;
  existing_file: string;
  product_handle: string;
  image_type: string;
  action_taken: string;
  notes: string;
}

interface ParsedFilename {
  brandSlug?: string;
  productHandle?: string;
  variantSku?: string;
  imageType: string;
  galleryIndex?: number;
  originalFilename: string;
}

const IMAGE_TYPE_PATTERNS = {
  main: /^main$/i,
  gallery: /^gallery[-_]?(\d{1,2})$/i,
  label: /^label$/i,
  nutrition: /^nutrition$/i,
};

function parseFilename(filename: string): ParsedFilename | null {
  const name = filename.replace(extname(filename), '');
  const parts = name.split('__');

  if (parts.length < 2) return null;

  const lastPart = parts[parts.length - 1].toLowerCase();
  let imageType = '';
  let galleryIndex: number | undefined;

  // Detect image type from last segment
  for (const [type, pattern] of Object.entries(IMAGE_TYPE_PATTERNS)) {
    const match = lastPart.match(pattern);
    if (match) {
      imageType = type;
      if (type === 'gallery' && match[1]) {
        galleryIndex = parseInt(match[1]);
      }
      break;
    }
  }

  if (!imageType) return null;

  const result: ParsedFilename = {
    originalFilename: filename,
    imageType,
    galleryIndex,
  };

  if (parts.length === 2) {
    // Could be: brand-slug__product-handle (no image type) - skip
    // or: variant-sku__main (2 parts with type)
    // or: product-handle__main (2 parts with type)
    const firstPart = parts[0];

    // Check if first part looks like a SKU (all caps with dashes)
    if (/^[A-Z0-9-]+$/.test(firstPart)) {
      result.variantSku = firstPart;
    } else {
      // Treat as product_handle
      result.productHandle = slugify(firstPart, { lower: true, strict: true });
    }
  } else if (parts.length >= 3) {
    // brand-slug__product-handle__image-type
    result.brandSlug = slugify(parts[0], { lower: true, strict: true });
    result.productHandle = slugify(parts[1], { lower: true, strict: true });
  }

  return result;
}

function findProductMapping(parsed: ParsedFilename, products: any[]): { product: any; confidence: number; method: string } | null {
  // Priority 1: Exact variant_sku match
  if (parsed.variantSku) {
    const match = products.find((p) => p.variant_sku === parsed.variantSku);
    if (match) return { product: match, confidence: 1.0, method: 'exact_sku_match' };
  }

  // Priority 2: Exact brand_slug + product_handle match
  if (parsed.brandSlug && parsed.productHandle) {
    const match = products.find(
      (p) => p.brand_slug === parsed.brandSlug && p.product_handle === parsed.productHandle
    );
    if (match) return { product: match, confidence: 1.0, method: 'exact_brand_handle_match' };
  }

  // Priority 3: Exact product_handle match
  if (parsed.productHandle) {
    const match = products.find((p) => p.product_handle === parsed.productHandle);
    if (match) return { product: match, confidence: 0.95, method: 'exact_handle_match' };
  }

  // Priority 4: Fuzzy match on title similarity
  if (parsed.productHandle) {
    const handleWords = parsed.productHandle.split('-').filter(Boolean);
    let bestMatch: any = null;
    let bestScore = 0;

    for (const product of products) {
      const title = (product.product_title || '').toLowerCase();
      const titleWords = title.split(/[\s-_]+/).filter(Boolean);

      let score = 0;
      for (const hw of handleWords) {
        if (titleWords.some((tw) => tw.includes(hw) || hw.includes(tw))) {
          score += 1;
        }
      }

      const normalizedScore = handleWords.length > 0 ? score / handleWords.length : 0;
      if (normalizedScore > bestScore && normalizedScore >= parseFloat(opts.confidence)) {
        bestScore = normalizedScore;
        bestMatch = product;
      }
    }

    if (bestMatch && bestScore >= parseFloat(opts.confidence)) {
      return { product: bestMatch, confidence: bestScore, method: 'fuzzy_title_match' };
    }
  }

  // Priority 5: Brand slug match from incoming path
  if (parsed.brandSlug) {
    const matches = products.filter((p) => p.brand_slug === parsed.brandSlug);
    if (matches.length === 1) {
      return { product: matches[0], confidence: 0.6, method: 'brand_only_match' };
    }
  }

  return null;
}

function getFinalPath(product: any, parsed: ParsedFilename): string {
  const brandSlug = product.brand_slug || 'unknown';
  const handle = product.product_handle || 'unknown';
  const baseDir = `/public/product-images/${brandSlug}/${handle}`;

  if (parsed.imageType === 'main') {
    return `${baseDir}/main.webp`;
  } else if (parsed.imageType === 'label') {
    return `${baseDir}/label.webp`;
  } else if (parsed.imageType === 'nutrition') {
    return `${baseDir}/nutrition.webp`;
  } else if (parsed.imageType === 'gallery') {
    const idx = parsed.galleryIndex || 1;
    return `${baseDir}/gallery-${String(idx).padStart(2, '0')}.webp`;
  }
  return `${baseDir}/main.webp`;
}

async function convertToWebp(inputPath: string, outputPath: string): Promise<void> {
  const ext = extname(inputPath).toLowerCase();
  const supported = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff'];
  if (!supported.includes(ext)) {
    throw new Error(`Unsupported image format: ${ext}`);
  }

  const dir = dirname(outputPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  await sharp(inputPath)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(outputPath);
}

async function main() {
  logger.info('Starting image mapping...');

  const incomingDir = resolve(opts.incoming);
  if (!existsSync(incomingDir)) {
    logger.warn(`Incoming directory not found: ${incomingDir}`);
    logger.info('Create the directory and place images to map.');
    return;
  }

  let products: any[];
  try {
    products = JSON.parse(readFileSync(resolve(opts.productData), 'utf-8'));
  } catch {
    logger.error(`Product data file not found: ${opts.productData}`);
    return;
  }

  logger.info(`Loaded ${products.length} products for mapping`);

  // Scan incoming directory
  const files = readdirSync(incomingDir).filter((f) => {
    const fullPath = join(incomingDir, f);
    return statSync(fullPath).isFile() && /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(f);
  });

  if (files.length === 0) {
    logger.info('No image files found in incoming directory.');
    return;
  }

  logger.info(`Found ${files.length} images to map`);

  const mappings: ImageMapping[] = [];
  const unmapped: UnmappedImage[] = [];
  const duplicates: DuplicateImage[] = [];

  for (const filename of files) {
    const parsed = parseFilename(filename);

    if (!parsed) {
      unmapped.push({
        original_file: filename,
        reason: 'Filename does not match supported pattern (need __ separator and image type)',
        suggested_product_matches: '',
        recommended_fix: 'Rename to: brand-slug__product-handle__main.webp or variant-sku__main.webp',
      });
      mappings.push({
        original_file: filename,
        mapped_product_title: '',
        mapped_product_handle: '',
        mapped_brand_slug: '',
        mapped_variant_sku: '',
        detected_image_type: 'unknown',
        final_path: '',
        mapping_confidence: 0,
        mapping_method: 'none',
        status: 'unmapped',
        notes: 'Filename pattern not recognized',
      });
      continue;
    }

    const matchResult = findProductMapping(parsed, products);

    if (!matchResult) {
      // Try to find close matches for suggestion
      const allHandles = products.map((p) => p.product_handle).filter(Boolean);
      const closeMatches = allHandles
        .filter((h) => h.includes(parsed.productHandle || '') || (parsed.productHandle || '').includes(h))
        .slice(0, 3);

      unmapped.push({
        original_file: filename,
        reason: `No product matched: brand=${parsed.brandSlug || 'n/a'}, handle=${parsed.productHandle || 'n/a'}, sku=${parsed.variantSku || 'n/a'}`,
        suggested_product_matches: closeMatches.join(', ') || 'none',
        recommended_fix: 'Verify product handle or brand slug in filename',
      });
      mappings.push({
        original_file: filename,
        mapped_product_title: '',
        mapped_product_handle: parsed.productHandle || '',
        mapped_brand_slug: parsed.brandSlug || '',
        mapped_variant_sku: parsed.variantSku || '',
        detected_image_type: parsed.imageType,
        final_path: '',
        mapping_confidence: 0,
        mapping_method: 'none',
        status: 'unmapped',
        notes: 'No matching product found',
      });
      continue;
    }

    const { product, confidence, method } = matchResult;
    const finalPath = getFinalPath(product, parsed);
    const finalFullPath = resolve(finalPath.replace('/public/', ''));

    // Check for existing file
    let status = 'mapped';
    let notes = '';
    let actionTaken = 'will_copy';

    if (existsSync(finalFullPath)) {
      if (opts.overwrite) {
        notes = 'Existing file will be overwritten';
        actionTaken = 'overwrite';
        duplicates.push({
          incoming_file: filename,
          existing_file: finalPath,
          product_handle: product.product_handle,
          image_type: parsed.imageType,
          action_taken: 'overwrite',
          notes: `Existing file replaced (--overwrite flag)`,
        });
      } else {
        status = 'skipped_duplicate';
        notes = 'File already exists, skipped (use --overwrite to replace)';
        actionTaken = 'skipped';
        duplicates.push({
          incoming_file: filename,
          existing_file: finalPath,
          product_handle: product.product_handle,
          image_type: parsed.imageType,
          action_taken: 'skipped',
          notes: 'Use --overwrite to replace existing file',
        });
      }
    }

    mappings.push({
      original_file: filename,
      mapped_product_title: product.product_title || '',
      mapped_product_handle: product.product_handle || '',
      mapped_brand_slug: product.brand_slug || '',
      mapped_variant_sku: product.variant_sku || '',
      detected_image_type: parsed.imageType,
      final_path: finalPath,
      mapping_confidence: confidence,
      mapping_method: method,
      status,
      notes,
    });

    // Actually move/convert the file (unless dry-run or skipped)
    if (!opts.dryRun && status === 'mapped') {
      try {
        const incomingPath = join(incomingDir, filename);
        await convertToWebp(incomingPath, finalFullPath);
        logger.info(`✓ ${filename} → ${finalPath} (${method}, ${confidence.toFixed(2)})`);
      } catch (err) {
        logger.error(`Failed to process ${filename}: ${err}`);
        mappings[mappings.length - 1].status = 'error';
        mappings[mappings.length - 1].notes = `Conversion failed: ${err}`;
      }
    } else if (opts.dryRun && status === 'mapped') {
      logger.info(`[DRY RUN] ${filename} → ${finalPath} (${method}, ${confidence.toFixed(2)})`);
    }
  }

  // Write reports
  const outputDir = resolve(opts.output);
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

  const mappingCsv = stringify(mappings, {
    header: true,
    columns: ['original_file', 'mapped_product_title', 'mapped_product_handle', 'mapped_brand_slug', 'mapped_variant_sku', 'detected_image_type', 'final_path', 'mapping_confidence', 'mapping_method', 'status', 'notes'],
  });
  writeFileSync(join(outputDir, 'image_mapping_report.csv'), mappingCsv, 'utf-8');

  const unmappedCsv = stringify(unmapped, {
    header: true,
    columns: ['original_file', 'reason', 'suggested_product_matches', 'recommended_fix'],
  });
  writeFileSync(join(outputDir, 'unmapped_images_report.csv'), unmappedCsv, 'utf-8');

  const duplicateCsv = stringify(duplicates, {
    header: true,
    columns: ['incoming_file', 'existing_file', 'product_handle', 'image_type', 'action_taken', 'notes'],
  });
  writeFileSync(join(outputDir, 'duplicate_images_report.csv'), duplicateCsv, 'utf-8');

  // Summary
  const mapped = mappings.filter((m) => m.status === 'mapped');
  const skipped = mappings.filter((m) => m.status === 'skipped_duplicate');
  const errors = mappings.filter((m) => m.status === 'error');

  logger.info('\n=== Image Mapping Summary ===');
  logger.info(`Total images scanned: ${files.length}`);
  logger.info(`Mapped: ${mapped.length}`);
  logger.info(`Skipped (duplicate): ${skipped.length}`);
  logger.info(`Unmapped: ${unmapped.length}`);
  logger.info(`Errors: ${errors.length}`);
  logger.info(`Reports: ${opts.output}/`);
  logger.info('  - image_mapping_report.csv');
  logger.info('  - unmapped_images_report.csv');
  logger.info('  - duplicate_images_report.csv');

  if (opts.dryRun) {
    logger.info('\n*** DRY RUN — no files were moved ***');
  }
}

main().catch(console.error);
