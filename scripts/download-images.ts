/**
 * Download Images Script
 * Downloads product images from source URLs and converts to local .webp format
 * Uses Playwright for JS-rendered pages and native fetch for direct image URLs
 * Usage: npm run download:images -- --input data/normalized-products.json
 */
import { program } from 'commander';
import { chromium, Browser } from 'playwright';
import sharp from 'sharp';
import { ensureDir } from 'fs-extra';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { createLogger, format, transports } from 'winston';
import pLimit from 'p-limit';
import slugify from 'slugify';
import cliProgress from 'cli-progress';
import * as https from 'https';
import * as http from 'http';

const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)),
  transports: [new transports.File({ filename: 'logs/download-images.log' }), new transports.Console()],
});

program
  .option('-i, --input <path>', 'Input JSON with product data', 'data/normalized/products.json')
  .option('-o, --output <path>', 'Output image directory', 'public/product-images')
  .option('-c, --concurrency <number>', 'Download concurrency', '5')
  .parse();

const opts = program.opts();

const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY = 85;

function fetchBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: 30000 }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        if (res.headers.location) {
          fetchBuffer(res.headers.location).then(resolve).catch(reject);
          return;
        }
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout for ${url}`)); });
  });
}

async function downloadImage(url: string, destPath: string): Promise<boolean> {
  try {
    if (!url || url.trim() === '') return false;
    url = url.trim();

    if (url.startsWith('data:')) return false;
    if (url.startsWith('blob:')) return false;

    if (existsSync(destPath)) {
      logger.info(`Already exists: ${destPath}`);
      return true;
    }

    await ensureDir(dirname(destPath));

    let buffer: Buffer;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      buffer = await fetchBuffer(url);
    } else {
      logger.warn(`Skipping non-HTTP URL: ${url}`);
      return false;
    }

    if (buffer.length < 100) {
      logger.warn(`Image too small (${buffer.length} bytes): ${url}`);
      return false;
    }

    await sharp(buffer)
      .resize(MAX_WIDTH, MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(destPath);

    return true;
  } catch (error) {
    logger.warn(`Failed ${url}: ${error}`);
    return false;
  }
}

interface ImageTask {
  url: string;
  destPath: string;
  productHandle: string;
  imageType: string;
}

async function main() {
  logger.info('Starting image download...');
  await ensureDir(opts.output);
  await ensureDir('logs');

  let products: any[];
  try {
    products = JSON.parse(readFileSync(resolve(opts.input), 'utf-8'));
  } catch {
    logger.warn(`Input file not found: ${opts.input}. Skipping download.`);
    return;
  }

  if (products.length === 0) {
    logger.info('No products to process. Skipping download.');
    return;
  }

  const tasks: ImageTask[] = [];

  products.forEach((p: any) => {
    const brandSlug = slugify(p.brand || 'unknown', { lower: true, strict: true });
    const handle = p.product_handle || 'unknown';
    const baseDir = join(opts.output, brandSlug, handle);

    const sourceUrls = (p.sourceImageUrls || p.source_image_urls || '').split(',').filter(Boolean).map((s: string) => s.trim());
    const imageTypes = ['main'];
    for (let i = 1; i < sourceUrls.length; i++) {
      imageTypes.push(`gallery-${String(i).padStart(2, '0')}`);
    }

    if (sourceUrls.length > 0) {
      sourceUrls.forEach((url: string, idx: number) => {
        const type = idx === 0 ? 'main' : `gallery-${String(idx).padStart(2, '0')}`;
        tasks.push({ url, destPath: join(baseDir, `${type}.webp`), productHandle: handle, imageType: type });
      });
    }

    if (p.label_image && p.label_image.startsWith('/public/product-images/')) {
      tasks.push({ url: '', destPath: resolve(p.label_image.replace('/public/', '')), productHandle: handle, imageType: 'label' });
    }
    if (p.nutrition_image && p.nutrition_image.startsWith('/public/product-images/')) {
      tasks.push({ url: '', destPath: resolve(p.nutrition_image.replace('/public/', '')), productHandle: handle, imageType: 'nutrition' });
    }
  });

  if (tasks.length === 0) {
    logger.info('No image URLs found. Skipping download.');
    return;
  }

  logger.info(`Found ${tasks.length} images to download for ${products.length} products`);

  const limit = pLimit(parseInt(opts.concurrency) || 5);
  let success = 0;
  let failed = 0;
  let skipped = 0;

  const progressBar = new cliProgress.SingleBar({
    format: 'Downloading | {bar} | {percentage}% | {value}/{total} | ETA: {eta}s',
  });
  progressBar.start(tasks.length, 0);

  const results = await Promise.all(
    tasks.map((task) =>
      limit(async () => {
        if (!task.url) {
          skipped++;
          progressBar.increment();
          return;
        }
        const ok = await downloadImage(task.url, task.destPath);
        if (ok) success++;
        else failed++;
        progressBar.increment();
      })
    )
  );

  progressBar.stop();
  logger.info(`Done: ${success} downloaded, ${skipped} skipped (local paths), ${failed} failed`);

  const report = {
    total: tasks.length,
    downloaded: success,
    skipped,
    failed,
    timestamp: new Date().toISOString(),
  };
  writeFileSync(resolve('exports', 'image-download-report.json'), JSON.stringify(report, null, 2), 'utf-8');
}

main().catch(console.error);
