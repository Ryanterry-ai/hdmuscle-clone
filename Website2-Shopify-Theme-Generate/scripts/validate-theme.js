/**
 * Validate Theme - Check Shopify theme structure
 * Usage: node scripts/validate-theme.js <url>
 */

const fs = require('fs-extra');
const path = require('path');

const TARGET_URL = process.argv[2] || 'https://www.morphogennutrition.com';
const DOMAIN = new URL(TARGET_URL).hostname.replace('www.', '');
const THEME_NAME = DOMAIN.split('.')[0] + '-theme';
const THEME_DIR = path.join(__dirname, '..', 'output', THEME_NAME);

const REQUIRED = [
  'layout/theme.liquid',
  'sections/header.liquid',
  'sections/footer.liquid',
  'templates/index.json',
  'config/settings_data.json'
];

async function validateTheme() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  ✅ VALIDATE: Checking theme structure');
  console.log('═══════════════════════════════════════════════════════════════');
  
  let errors = [];
  let passed = 0;
  
  for (const file of REQUIRED) {
    const filePath = path.join(THEME_DIR, file);
    if (await fs.pathExists(filePath)) {
      console.log(`   ✓ ${file}`);
      passed++;
    } else {
      console.log(`   ✗ Missing: ${file}`);
      errors.push(file);
    }
  }
  
  // Check theme.liquid content
  const themePath = path.join(THEME_DIR, 'layout', 'theme.liquid');
  if (await fs.pathExists(themePath)) {
    const content = await fs.readFile(themePath, 'utf8');
    const checks = [
      { pattern: '{{ content_for_header }}', name: 'content_for_header' },
      { pattern: '{{ content_for_layout }}', name: 'content_for_layout' },
      { pattern: '{% section', name: 'section tags' }
    ];
    
    for (const check of checks) {
      if (content.includes(check.pattern)) {
        console.log(`   ✓ Has ${check.name}`);
      } else {
        console.log(`   ✗ Missing ${check.name}`);
        errors.push(`theme.liquid missing ${check.name}`);
      }
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  if (errors.length === 0) {
    console.log('  ✅ VALID - Theme is ready!');
    console.log('═══════════════════════════════════════════════════════════════');
  } else {
    console.log(`  ❌ ${errors.length} issues found`);
    console.log('═══════════════════════════════════════════════════════════════');
    errors.forEach(e => console.log(`   - ${e}`));
  }
  
  return { valid: errors.length === 0, errors };
}

validateTheme().catch(console.error);
