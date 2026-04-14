// Step 3: Generate placeholder images with product names
// Run with: node generate-placeholders.js

const fs = require('fs');

// Products to generate placeholders for
const products = [
  'adaptogen-functional-mushrooms',
  'alphagen-max-preworkout',
  'biome-gut-digestion',
  'bolic-max-recovery',
  'brain',
  'burn',
  'calm',
  'carb-fuel',
  'collagen-multi-type-complex',
  'cortisol-control',
  'creatine',
  'd3-k2-vitamin',
  'enzymes-digestion',
  'glutamine',
  'health-series-stack',
  'heart-lipids',
  'heart-health',
  'heart-health-bp',
  'hydrate-sport-electrolytes',
  'joint-inflammation',
  'kidney-bloodpressure',
  'lean',
  'liver-tudca',
  'liver-health',
  'max-pre-workout-stack',
  'mens-health-libido',
  'mens-hormone-control-stack',
  'multi-vitamins-minerals',
  'nightcap',
  'nutrigreens',
  'omega-fishoil',
  'pms-support',
  'prime-total-health',
  'pump-max-blood-flow',
  'recovery-aminos',
  'stainless-steel-shaker',
  'test',
  'thermogen-max-fat-loss',
  'thyroid',
  'tudca',
  'volugen-max',
  'womens-health-libido',
  'womens-health-bundle',
  'shrooms',
  'vegagen',
];

const outputDir = './product-images';

function generatePlaceholderSVG(productName, productTitle) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="600" fill="#f5f5f5"/>
  <rect x="50" y="50" width="500" height="500" rx="10" fill="#ffffff" stroke="#e0e0e0" stroke-width="2"/>
  <text x="300" y="280" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#333333" text-anchor="middle">${productTitle}</text>
  <text x="300" y="330" font-family="Arial, sans-serif" font-size="18" fill="#666666" text-anchor="middle">Morphogen Nutrition</text>
  <rect x="225" y="380" width="150" height="40" rx="20" fill="#1c1d1d"/>
  <text x="300" y="405" font-family="Arial, sans-serif" font-size="14" fill="#ffffff" text-anchor="middle">VIEW PRODUCT</text>
</svg>`;
}

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Generating placeholder images...\n');

products.forEach((handle, index) => {
  // Create pretty title from handle
  const title = handle
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  const svg = generatePlaceholderSVG(handle, title);
  const filename = `${handle}.svg`;
  const filepath = `${outputDir}/${filename}`;
  
  fs.writeFileSync(filepath, svg);
  console.log(`✓ [${index + 1}/${products.length}] Created: ${filename}`);
});

console.log(`\n=== COMPLETE ===`);
console.log(`Generated ${products.length} placeholder images`);
console.log(`Location: ${outputDir}/`);

// List all files
const files = fs.readdirSync(outputDir);
console.log(`\nFiles created:`);
files.forEach(f => console.log(`  - ${f}`));