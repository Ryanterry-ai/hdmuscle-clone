/**
 * AI Website → Shopify Theme Generator
 * Main orchestrator script
 * 
 * Usage: node run.js <target-url>
 * Example: node run.js https://www.example.com
 */

const { execSync } = require('child_process');

const TARGET_URL = process.argv[2];

if (!TARGET_URL) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🤖 AI Website → Shopify Theme Generator');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\nUsage: node run.js <url>');
  console.log('Example: node run.js https://www.morphogennutrition.com');
  process.exit(1);
}

const DOMAIN = new URL(TARGET_URL).hostname.replace('www.', '');
const THEME_NAME = DOMAIN.split('.')[0] + '-theme';

console.log('═══════════════════════════════════════════════════════════════');
console.log('  🤖 AI Website → Shopify Theme Generator');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`\n Target: ${TARGET_URL}`);
console.log(` Theme: ${THEME_NAME}\n`);

const scripts = [
  { name: 'Crawl Website', script: 'crawl-site.js', desc: 'Extract pages, products, navigation' },
  { name: 'Extract Products', script: 'extract-products.js', desc: 'Get products & collections' },
  { name: 'Extract Images', script: 'extract-images.js', desc: 'Find all product images' },
  { name: 'Download Assets', script: 'download-images.js', desc: 'Download images, CSS, fonts' },
  { name: 'Generate Theme', script: 'generate-shopify-theme.js', desc: 'Create Liquid templates' },
  { name: 'Validate Theme', script: 'validate-theme.js', desc: 'Check for errors' },
  { name: 'Build ZIP', script: 'build-theme-zip.js', desc: 'Package for Shopify upload' },
];

let step = 1;
for (const s of scripts) {
  console.log(`  ${step}. ${s.name} - ${s.desc}`);
  step++;
}

console.log('\n═══════════════════════════════════════════════════════════════\n');

async function runScript(script) {
  console.log(`\n▶ Running: ${script.name}`);
  try {
    const scriptPath = __dirname + '/' + script.script;
    execSync(`node "${scriptPath}" "${TARGET_URL}"`, {
      stdio: 'inherit'
    });
  } catch (e) {
    console.error(`\n⚠️  ${script.script} had issues, continuing...`);
  }
}

async function main() {
  for (const s of scripts) {
    await runScript(s);
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  ✅ Pipeline Complete!');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\n📦 Theme ZIP: output/${THEME_NAME}.zip`);
  console.log(`📁 Theme: output/${THEME_NAME}/`);
  console.log(`\n🚀 Upload: npx shopify theme push --path output/${THEME_NAME} --store your-store.myshopify.com`);
}

main().catch(console.error);
