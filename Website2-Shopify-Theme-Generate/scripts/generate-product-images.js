// Generate SVG placeholder images for all products
const fs = require('fs');
const path = require('path');

const outputDir = 'C:/Users/viren/Downloads/ai-website-cloner-template-master/ai-website-cloner-template-master/Website2-Shopify-Theme-Generate/product-images';

// Create directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Products from original store
const products = [
  { filename: 'creatine-monohydrate.svg', title: 'Creatine Monohydrate', price: '$24.99' },
  { filename: 'alphagen-max-preworkout.svg', title: 'AlphaGen Max Pre-Workout', price: '$54.99' },
  { filename: 'brain-cognitive.svg', title: 'Brain - Cognitive Support', price: '$49.99' },
  { filename: 'burn-fat-burner.svg', title: 'Burn - Thermogenic Fat Burner', price: '$56.99' },
  { filename: 'calm-stress-support.svg', title: 'Calm - Stress & Anxiety', price: '$56.99' },
  { filename: 'd3-k2-vitamin.svg', title: 'D3 & K2 Vitamins', price: '$18.00' },
  { filename: 'glutamine.svg', title: 'L-Glutamine', price: '$27.99' },
  { filename: 'heart-health.svg', title: 'Heart Health Support', price: '$52.99' },
  { filename: 'joint-inflammation.svg', title: 'Joint & Inflammation', price: '$52.99' },
  { filename: 'liver-tudca.svg', title: 'TUDCA Liver Support', price: '$52.99' },
  { filename: 'multi-vitamins.svg', title: 'Multi-Vitamins & Minerals', price: '$51.99' },
  { filename: 'nightcap-sleep.svg', title: 'NightCap - Sleep Support', price: '$52.99' },
  { filename: 'nutrigreens-superfood.svg', title: 'NutriGreens Superfood', price: '$52.99' },
  { filename: 'omega-fishoil.svg', title: 'Omega Fish Oil', price: '$48.99' },
  { filename: 'pump-max.svg', title: 'Pump Max Blood Flow', price: '$49.99' },
  { filename: 'recovery-aminos.svg', title: 'Recovery Aminos', price: '$51.99' },
  { filename: 'thermogen-max.svg', title: 'Thermogen Max Fat Loss', price: '$48.99' },
  { filename: 'volugen-preworkout.svg', title: 'Volugen Non-Stim Pre-Workout', price: '$55.99' },
  { filename: 'shrooms-functional.svg', title: 'Functional Mushrooms', price: '$36.00' },
  { filename: 'vegagen-protein.svg', title: 'VegaGen Plant Protein', price: '$36.00' },
  { filename: 'thyroid-support.svg', title: 'Thyroid Support', price: '$32.00' },
  { filename: 'biome-gut.svg', title: 'Biome Gut Digestion', price: '$52.99' },
  { filename: 'bolic-max.svg', title: 'Bolic Max Recovery', price: '$51.99' },
  { filename: 'carb-fuel.svg', title: 'Carb Fuel', price: '$51.99' },
  { filename: 'collagen-complex.svg', title: 'Collagen Multi-Type', price: '$36.99' },
  { filename: 'cortisol-control.svg', title: 'Cortisol Control', price: '$48.99' },
  { filename: 'hydrate-electrolytes.svg', title: 'Hydrate Sport Electrolytes', price: '$44.99' },
  { filename: 'kidney-support.svg', title: 'Kidney & Blood Pressure', price: '$59.99' },
  { filename: 'lean-weight.svg', title: 'Lean Weight Management', price: '$48.00' },
  { filename: 'mens-libido.svg', title: 'Mens Health Libido', price: '$51.99' },
  { filename: 'prime-health.svg', title: 'Prime Total Health', price: '$57.99' },
  { filename: 'pms-support.svg', title: 'PMS Support', price: '$35.99' },
  { filename: 'womens-libido.svg', title: 'Womens Health Libido', price: '$51.99' },
  { filename: 'adaptogen-mushrooms.svg', title: 'Adaptogen Mushrooms', price: '$52.99' },
  { filename: 'liver-health.svg', title: 'Liver Health Complete', price: '$105.43' },
  { filename: 'health-stack.svg', title: 'Health Series Stack', price: '$313.44' },
];

function createProductSVG(product) {
  return `<svg width="600" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f5f5f5"/>
      <stop offset="100%" style="stop-color:#e8e8e8"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <rect x="50" y="50" width="500" height="420" rx="8" fill="#ffffff" stroke="#e0e0e0" stroke-width="1"/>
  <circle cx="300" cy="200" r="80" fill="#1c1d1d"/>
  <text x="300" y="210" font-family="Arial" font-size="60" font-weight="bold" fill="#ffffff" text-anchor="middle">M</text>
  <rect x="50" y="480" width="500" height="70" fill="#1c1d1d"/>
  <text x="300" y="520" font-family="Arial" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">${product.title}</text>
  <text x="300" y="545" font-family="Arial" font-size="16" fill="#aaaaaa" text-anchor="middle">${product.price}</text>
  <text x="550" y="40" font-family="Arial" font-size="10" fill="#888888" text-anchor="end">Morphogen Nutrition</text>
</svg>`;
}

console.log('Generating product placeholder images...\n');

products.forEach((p, i) => {
  const svg = createProductSVG(p);
  const filepath = path.join(outputDir, p.filename);
  fs.writeFileSync(filepath, svg);
  console.log(`✓ [${i + 1}/${products.length}] ${p.filename}`);
});

console.log(`\n=== COMPLETE ===`);
console.log(`Created ${products.length} placeholder images`);
console.log(`Location: ${outputDir}/`);

const files = fs.readdirSync(outputDir);
console.log(`\nTotal files: ${files.length}`);