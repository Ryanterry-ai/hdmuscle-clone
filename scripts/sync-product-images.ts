/**
 * Sync Product Images Script
 * Scans the product-images directory and syncs all product data files
 * to reflect actual local image paths.
 *
 * Usage: npm run sync:images
 */
import { program } from 'commander';
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, join, normalize, basename, extname } from 'path';
import { createLogger, format, transports } from 'winston';
import { stringify } from 'csv-stringify/sync';
import slugify from 'slugify';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [
    new transports.File({ filename: 'logs/sync-images.log' }),
    new transports.Console(),
  ],
});

program
  .option('-d, --dir <path>', 'Image directory root', 'public/product-images')
  .option('-p, --product-data <path>', 'Product data JSON', 'data/rewritten/products.json')
  .option('-o, --output <path>', 'Output directory for updated files', 'data/rewritten')
  .option('--exports <path>', 'Exports directory for updated CSVs', 'exports')
  .parse();

const opts = program.opts();

interface ImageFile {
  brandSlug: string;
  productHandle: string;
  filename: string;
  imageType: string;
  galleryIndex: number;
  fullPath: string;
  relativePath: string;
}

function scanImageDirectory(dir: string): ImageFile[] {
  const images: ImageFile[] = [];
  const imageRoot = resolve(dir);

  function scanFolder(folderPath: string) {
    const entries = readdirSync(folderPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(folderPath, entry.name);
      if (entry.isDirectory()) {
        scanFolder(fullPath);
      } else if (entry.isFile() && /\.(webp|png|jpg|jpeg)$/i.test(entry.name)) {
        const relativePath = fullPath.replace(imageRoot, '').replace(/\\/g, '/');
        const parts = relativePath.split('/').filter(Boolean);

        if (parts.length >= 3) {
          const brandSlug = parts[0];
          const productHandle = parts[1];
          const filename = parts[parts.length - 1];
          const nameWithoutExt = filename.replace(extname(filename), '');
          const relativePathWithPublic = `/public/product-images${relativePath}`;

          let imageType = 'main';
          let galleryIndex = 0;

          if (nameWithoutExt === 'main') {
            imageType = 'main';
          } else if (nameWithoutExt === 'label') {
            imageType = 'label';
          } else if (nameWithoutExt === 'nutrition') {
            imageType = 'nutrition';
          } else {
            const galleryMatch = nameWithoutExt.match(/gallery[-_]?(\d+)/);
            if (galleryMatch) {
              imageType = 'gallery';
              galleryIndex = parseInt(galleryMatch[1]);
            }
          }

          images.push({
            brandSlug,
            productHandle,
            filename,
            imageType,
            galleryIndex,
            fullPath,
            relativePath: relativePathWithPublic,
          });
        }
      }
    }
  }

  if (existsSync(imageRoot)) {
    scanFolder(imageRoot);
  }

  return images;
}

function syncProductImages(products: any[], images: ImageFile[]): any[] {
  const imageMap = new Map<string, ImageFile[]>();

  for (const img of images) {
    const key = `${img.brandSlug}__${img.productHandle}`;
    if (!imageMap.has(key)) imageMap.set(key, []);
    imageMap.get(key)!.push(img);
  }

  return products.map((product) => {
    const key = `${product.brand_slug}__${product.product_handle}`;
    const productImages = imageMap.get(key) || [];

    if (productImages.length === 0) return product;

    const updated = { ...product };

    // Sort images: main first, then gallery by index, then label, then nutrition
    const sorted = productImages.sort((a, b) => {
      const order = { main: 0, gallery: 1, label: 2, nutrition: 3 };
      const typeDiff = (order[a.imageType] || 0) - (order[b.imageType] || 0);
      if (typeDiff !== 0) return typeDiff;
      if (a.imageType === 'gallery') return a.galleryIndex - b.galleryIndex;
      return 0;
    });

    // Set main_image
    const mainImg = sorted.find((i) => i.imageType === 'main');
    if (mainImg) updated.main_image = mainImg.relativePath;

    // Set gallery_images
    const galleryImgs = sorted.filter((i) => i.imageType === 'gallery').sort((a, b) => a.galleryIndex - b.galleryIndex);
    if (galleryImgs.length > 0) {
      updated.gallery_images = galleryImgs.map((i) => i.relativePath).join(',');
    }

    // Set label_image
    const labelImg = sorted.find((i) => i.imageType === 'label');
    if (labelImg) updated.label_image = labelImg.relativePath;

    // Set nutrition_image
    const nutritionImg = sorted.find((i) => i.imageType === 'nutrition');
    if (nutritionImg) updated.nutrition_image = nutritionImg.relativePath;

    // Set product_images (all combined)
    const allPaths = sorted.map((i) => i.relativePath);
    updated.product_images = allPaths.join(',');

    return updated;
  });
}

function updateProductImagesCsv(products: any[], exportsDir: string) {
  const images: any[] = [];
  let idx = 0;

  for (const p of products) {
    const allPaths = (p.product_images || '').split(',').filter(Boolean);
    let sortOrder = 0;

    if (p.main_image) {
      images.push({
        id: `img-${idx}-main`,
        product_handle: p.product_handle,
        image_path: p.main_image,
        image_type: 'main',
        alt_text: `${p.product_title} - Main`,
        sort_order: sortOrder++,
      });
    }

    if (p.gallery_images) {
      p.gallery_images.split(',').filter(Boolean).forEach((img: string, i: number) => {
        images.push({
          id: `img-${idx}-gallery-${i}`,
          product_handle: p.product_handle,
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
        product_handle: p.product_handle,
        image_path: p.label_image,
        image_type: 'label',
        alt_text: `${p.product_title} - Label`,
        sort_order: sortOrder++,
      });
    }

    if (p.nutrition_image) {
      images.push({
        id: `img-${idx}-nutrition`,
        product_handle: p.product_handle,
        image_path: p.nutrition_image,
        image_type: 'nutrition',
        alt_text: `${p.product_title} - Nutrition`,
        sort_order: sortOrder++,
      });
    }

    idx++;
  }

  const csvPath = join(exportsDir, 'product_images.csv');
  const csv = stringify(images, { header: true });
  writeFileSync(csvPath, csv, 'utf-8');
  logger.info(`Updated product_images.csv: ${images.length} records`);
}

async function main() {
  logger.info('Starting image sync...');

  const imageDir = resolve(opts.dir);
  const images = scanImageDirectory(imageDir);
  logger.info(`Found ${images.length} local image files`);

  let products: any[];
  try {
    products = JSON.parse(readFileSync(resolve(opts.productData), 'utf-8'));
  } catch {
    logger.error(`Product data file not found: ${opts.productData}`);
    return;
  }

  logger.info(`Loaded ${products.length} products`);

  const synced = syncProductImages(products, images);

  // Count products that got updated
  let updatedCount = 0;
  synced.forEach((p, i) => {
    if (p.main_image && existsSync(resolve(p.main_image.replace('/public/', '')))) {
      updatedCount++;
    }
  });

  // Save synced product data
  const outputDir = resolve(opts.output);
  writeFileSync(join(outputDir, 'products.json'), JSON.stringify(synced, null, 2), 'utf-8');
  logger.info(`Saved synced product data: ${outputDir}/products.json`);
  logger.info(`Products with valid images: ${updatedCount}/${synced.length}`);

  // Update product_images.csv
  const exportsDir = resolve(opts.exports);
  if (existsSync(exportsDir)) {
    updateProductImagesCsv(synced, exportsDir);
  }

  // Summary
  const imageStats = new Map<string, number>();
  images.forEach((img) => {
    const key = `${img.imageType}`;
    imageStats.set(key, (imageStats.get(key) || 0) + 1);
  });

  logger.info('\n=== Image Sync Summary ===');
  logger.info(`Total images on disk: ${images.length}`);
  logger.info(`Products synced: ${updatedCount}/${synced.length}`);
  imageStats.forEach((count, type) => {
    logger.info(`  ${type}: ${count}`);
  });
}

main().catch(console.error);
