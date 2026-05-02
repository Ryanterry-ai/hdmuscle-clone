/**
 * Convert Images Script
 * Batch converts existing images in /public/product-images/ to .webp format
 * with consistent quality, dimensions, and naming conventions
 * Usage: npm run convert -- or npx tsx scripts/convert-images.ts
 */
import { program } from 'commander';
import sharp from 'sharp';
import { readdirSync, statSync, existsSync, unlinkSync } from 'fs';
import { resolve, join, extname, basename, dirname } from 'path';
import { createLogger, format, transports } from 'winston';
import pLimit from 'p-limit';
import cliProgress from 'cli-progress';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [
    new transports.File({ filename: 'logs/convert-images.log' }),
    new transports.Console(),
  ],
});

program
  .option('-d, --dir <path>', 'Image directory to process', 'public/product-images')
  .option('-w, --width <number>', 'Max width', '1200')
  .option('-h, --height <number>', 'Max height', '1200')
  .option('-q, --quality <number>', 'WebP quality (0-100)', '85')
  .option('--remove-original', 'Remove original files after conversion', false)
  .option('-f, --force', 'Re-convert even if .webp already exists', false)
  .parse();

const opts = program.opts();

const SUPPORTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.tif', '.gif'];

function getAllImages(dir: string): string[] {
  const files: string[] = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...getAllImages(fullPath));
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        if (SUPPORTED_EXTENSIONS.includes(ext) || ext === '.webp') {
          files.push(fullPath);
        }
      }
    }
  } catch { /* ignore */ }
  return files;
}

async function convertImage(
  sourcePath: string,
  maxWidth: number,
  maxHeight: number,
  quality: number,
  removeOriginal: boolean,
  force: boolean
): Promise<{ success: boolean; source: string; output?: string; error?: string }> {
  try {
    const ext = extname(sourcePath).toLowerCase();
    const dir = dirname(sourcePath);
    const name = basename(sourcePath, ext);

    if (ext === '.webp' && !force) {
      return { success: true, source: sourcePath, output: sourcePath };
    }

    const outputPath = join(dir, `${name}.webp`);

    if (existsSync(outputPath) && !force) {
      return { success: true, source: sourcePath, output: outputPath };
    }

    const image = sharp(sourcePath);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      return { success: false, source: sourcePath, error: 'Could not read image metadata' };
    }

    await image
      .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality })
      .toFile(outputPath);

    const stats = statSync(outputPath);
    logger.info(`Converted: ${sourcePath} -> ${outputPath} (${(stats.size / 1024).toFixed(1)}KB)`);

    if (removeOriginal && ext !== '.webp') {
      unlinkSync(sourcePath);
      logger.info(`Removed original: ${sourcePath}`);
    }

    return { success: true, source: sourcePath, output: outputPath };
  } catch (error: any) {
    return { success: false, source: sourcePath, error: error.message };
  }
}

async function main() {
  logger.info('Starting image conversion...');
  const imageDir = resolve(opts.dir);

  if (!existsSync(imageDir)) {
    logger.error(`Directory not found: ${imageDir}`);
    return;
  }

  const files = getAllImages(imageDir);
  if (files.length === 0) {
    logger.info('No images found to convert.');
    return;
  }

  logger.info(`Found ${files.length} images to process`);

  const maxWidth = parseInt(opts.width) || 1200;
  const maxHeight = parseInt(opts.height) || 1200;
  const quality = parseInt(opts.quality) || 85;
  const removeOriginal = opts.removeOriginal === true;
  const force = opts.force === true;

  const limit = pLimit(4);
  let success = 0;
  let failed = 0;
  let skipped = 0;

  const progressBar = new cliProgress.SingleBar({
    format: 'Converting | {bar} | {percentage}% | {value}/{total} | ETA: {eta}s',
  });
  progressBar.start(files.length, 0);

  await Promise.all(
    files.map((file) =>
      limit(async () => {
        const result = await convertImage(file, maxWidth, maxHeight, quality, removeOriginal, force);
        if (result.success) {
          if (result.output === result.source) skipped++;
          else success++;
        } else {
          failed++;
          logger.warn(`Failed: ${result.source} - ${result.error}`);
        }
        progressBar.increment();
      })
    )
  );

  progressBar.stop();
  logger.info(`Done: ${success} converted, ${skipped} already webp, ${failed} failed`);
}

main().catch(console.error);
