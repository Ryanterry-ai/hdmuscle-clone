// Generate placeholder images with product names as SVG files
const fs = require('fs');
const path = require('path');

const outputDir = 'C:/Users/viren/Downloads/ai-website-cloner-template-master/ai-website-cloner-template-master/Website2-Shopify-Theme-Generate/product-images';

const products = [
  { filename: 'creatine.jpg', title: 'Creatine Monohydrate' },
  { filename: 'alphagen-max.jpg', title: 'AlphaGen Max Pre-Workout' },
  { filename: 'brain.jpg', title: 'Brain - Cognitive Support' },
  { filename: 'burn.jpg', title: 'Burn - Thermogenic Fat Burner' },
  { filename: 'calm.jpg', title: 'Calm - Stress Support' },
  { filename: 'creatine.jpg', title: 'Creatine' },
  { filename: 'd3-k2.jpg', title: 'D3 & K2 Vitamins' },
  { filename: 'glutamine.jpg', title: 'L-Glutamine' },
  { filename: 'heart-health.jpg', title: 'Heart Health' },
  { filename: 'joint.jpg', title: 'Joint Support' },
  { filename: 'liver-tudca.jpg', title: 'TUDCA Liver Support' },
  { filename: 'multi.jpg', title: 'Multi-Vitamins' },
  { filename: 'nightcap.jpg', title: 'NightCap Sleep Support' },
  { filename: 'nutrigreens.jpg', title: 'NutriGreens Superfood' },
  { filename: 'fish-oil.jpg', title: 'Omega Fish Oil' },
  { filename: 'pump-max.jpg', title: 'Pump Max Blood Flow' },
  { filename: 'recovery-aminos.jpg', title: 'Recovery Aminos' },
  { filename: 'thermogen.jpg', title: 'Thermogen Max' },
  { filename: 'volugen.jpg', title: 'Volugen Pre-Workout' },
  { filename: 'shrooms.jpg', title: 'Functional Mushrooms' },
  { filename: 'vegagen.jpg', title: 'VegaGen Vegan Protein' },
  { filename: 'thyroid.jpg', title: 'Thyroid Support' },
  { filename: 'biome.jpg', title: 'Biome Gut Support' },
  { filename: 'bolic-max.jpg', title: 'Bolic Max Recovery' },
  { filename: 'carb-fuel.jpg', title: 'Carb Fuel' },
  { filename: 'collagen.jpg', title: 'Collagen Complex' },
  { filename: 'cortisol.jpg', title: 'Cortisol Control' },
  { filename: 'hydrate.jpg', title: 'Hydrate Electrolytes' },
  { filename: 'kidney.jpg', title: 'Kidney Support' },
  { filename: 'lean.jpg', title: 'Lean Weight Management' },
  { filename: 'mens-libido.jpg', title: 'Mens Libido Support' },
  { filename: 'prime-health.jpg', title: 'Prime Total Health' },
  { filename: 'pms.jpg', title: 'PMS Support' },
  { filename: 'womens-libido.jpg', title: 'Womens Libido Support' },
  { filename: 'logo.png', title: 'Morphogen Nutrition' },
];

// Create SVG content
function createSVG(title) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="600" fill="#f5f5f5"/>
  <rect x="50" y="50" width="500" height="500" rx="8" fill="#ffffff" stroke="#e0e0e0" stroke-width="2"/>
  <text x="300" y="250" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#1c1d1d" text-anchor="middle">${title}</text>
  <text x="300" y="300" font-family="Arial, sans-serif" font-size="16" fill="#666666" text-anchor="middle">Morphogen Nutrition</text>
  <rect x="200" y="350" width="200" height="50" rx="25" fill="#1c1d1d"/>
  <text x="300" y="382" font-family="Arial, sans-serif" font-size="14" fill="#ffffff" text-anchor="middle">SHOP NOW</text>
</svg>`;
}

// Create directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Creating placeholder images...\n');

products.forEach((p, i) => {
  const svg = createSVG(p.title);
  const filepath = path.join(outputDir, p.filename);
  
  // Save as .svg since we can't generate real JPEGs
  const svgPath = filepath.replace('.jpg', '.svg');
  fs.writeFileSync(svgPath, svg);
  
  console.log(`✓ [${i + 1}/${products.length}] Created: ${p.filename.replace('.jpg', '.svg')}`);
});

console.log(`\n=== COMPLETE ===`);
console.log(`Created ${products.length} placeholder images`);
console.log(`Location: ${outputDir}/`);

const files = fs.readdirSync(outputDir);
console.log(`\nFiles created:`);
files.forEach(f => console.log(`  - ${f}`));