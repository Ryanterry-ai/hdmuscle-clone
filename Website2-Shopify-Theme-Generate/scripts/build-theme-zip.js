/**
 * Build Theme ZIP - Package theme for Shopify upload
 * Usage: node scripts/build-theme-zip.js <url>
 */

const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

const TARGET_URL = process.argv[2] || 'https://www.morphogennutrition.com';
const DOMAIN = new URL(TARGET_URL).hostname.replace('www.', '');
const THEME_NAME = DOMAIN.split('.')[0] + '-theme';

const THEME_DIR = path.join(__dirname, '..', 'output', THEME_NAME);
const OUTPUT_ZIP = path.join(__dirname, '..', 'output', `${THEME_NAME}.zip`);

async function buildZip() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  📦 BUILD: Creating Shopify theme ZIP');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\n📦 Theme: ${THEME_NAME}`);
  
  if (await fs.pathExists(OUTPUT_ZIP)) {
    await fs.remove(OUTPUT_ZIP);
  }
  
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(OUTPUT_ZIP);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => {
      console.log('\n═══════════════════════════════════════════════════════════════');
      console.log('  ✅ BUILD Complete!');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log(`\n📦 ZIP: ${OUTPUT_ZIP}`);
      console.log(`   Size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
      console.log(`\n🚀 Upload: npx shopify theme push --path output/${THEME_NAME} --store your-store.myshopify.com`);
      resolve(OUTPUT_ZIP);
    });
    
    archive.on('error', reject);
    archive.pipe(output);
    archive.glob('**/*', { cwd: THEME_DIR });
    archive.finalize();
  });
}

buildZip().catch(console.error);
