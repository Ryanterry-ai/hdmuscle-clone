/**
 * Create Template Script
 * Generates the products_import_template.xlsx with all required sheets
 */
import ExcelJS from 'exceljs';
import { writeFile, mkdir } from 'fs-extra';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MASTER_COLUMNS = [
  'brand', 'brand_slug', 'product_title', 'product_handle', 'category',
  'subcategory', 'goal', 'product_type', 'flavor', 'size', 'variant_title',
  'variant_sku', 'barcode', 'mrp', 'sale_price', 'cost_price', 'wholesale_price',
  'distributor_price', 'currency', 'tax_rate', 'stock', 'stock_status',
  'min_order_quantity', 'case_pack_quantity', 'product_images', 'main_image',
  'gallery_images', 'label_image', 'nutrition_image', 'ingredients',
  'nutrition_facts', 'serving_size', 'servings_per_container', 'directions',
  'warnings', 'allergen_info', 'importer', 'manufacturer', 'country_of_origin',
  'batch_number', 'expiry_date', 'authenticity_message', 'short_description',
  'long_description', 'key_benefits', 'faq', 'who_should_use_it', 'how_to_use_it',
  'why_buy_from_upgraded', 'seo_title', 'seo_description', 'seo_keywords',
  'meta_canonical', 'source_website', 'source_product_url', 'source_image_urls',
  'data_confidence', 'needs_review', 'review_notes', 'created_at', 'updated_at'
];

const VALIDATION_COLUMNS = [
  'row_number', 'product_title', 'variant_sku', 'issue_type',
  'issue_description', 'severity', 'recommended_fix'
];

const DATA_DICTIONARY_COLUMNS = [
  'field_name', 'required', 'data_type', 'example', 'description', 'validation_rule'
];

const CATEGORY_MAPPING_COLUMNS = [
  'category', 'subcategory', 'goal', 'menu_group', 'is_active', 'notes'
];

const SAMPLE_PRODUCTS = [
  {
    brand: 'Upgraded Demo Nutrition',
    brand_slug: 'upgraded-demo-nutrition',
    product_title: 'Upgraded Demo Whey Protein Isolate',
    product_handle: 'upgraded-demo-whey-protein-isolate',
    category: 'Protein',
    subcategory: 'Whey Protein',
    goal: 'Muscle Building',
    product_type: 'Whey Protein Isolate',
    flavor: 'Chocolate',
    size: '1 kg',
    variant_title: 'Chocolate / 1 kg',
    variant_sku: 'UDN-WPI-CHOC-1KG',
    barcode: '8901234567001',
    mrp: 2499,
    sale_price: 1999,
    cost_price: 1200,
    wholesale_price: 1500,
    distributor_price: 1350,
    currency: 'INR',
    tax_rate: 18,
    stock: 150,
    stock_status: 'in_stock',
    min_order_quantity: 1,
    case_pack_quantity: 12,
    product_images: '/public/product-images/upgraded-demo-nutrition/upgraded-demo-whey-protein-isolate/main.webp,/public/product-images/upgraded-demo-nutrition/upgraded-demo-whey-protein-isolate/gallery-01.webp',
    main_image: '/public/product-images/upgraded-demo-nutrition/upgraded-demo-whey-protein-isolate/main.webp',
    gallery_images: '/public/product-images/upgraded-demo-nutrition/upgraded-demo-whey-protein-isolate/gallery-01.webp',
    label_image: '/public/product-images/upgraded-demo-nutrition/upgraded-demo-whey-protein-isolate/label.webp',
    nutrition_image: '/public/product-images/upgraded-demo-nutrition/upgraded-demo-whey-protein-isolate/nutrition.webp',
    ingredients: 'Whey Protein Isolate, Cocoa Powder, Natural & Artificial Flavors, Lecithin, Digestive Enzymes',
    nutrition_facts: 'Per 30g serving: Protein 27g, Carbs 1g, Fat 0.5g, Sugar 0.5g, Calories 120 kcal',
    serving_size: '30g (1 scoop)',
    servings_per_container: '33',
    directions: 'Mix 1 scoop with 200-250ml of water or milk. Consume post-workout or between meals.',
    warnings: 'Consult your physician before use if you are under 18, pregnant, or have any medical condition.',
    allergen_info: 'Contains milk and soy. Manufactured in a facility that processes nuts, wheat, and eggs.',
    importer: 'Upgraded Demo Nutrition Pvt Ltd, Mumbai, Maharashtra',
    manufacturer: 'Upgraded Demo Nutrition Pvt Ltd, Mumbai, Maharashtra',
    country_of_origin: 'India',
    batch_number: '',
    expiry_date: '',
    authenticity_message: '100% authentic product sourced directly from the manufacturer. Verified with batch-level tracking.',
    short_description: 'Premium whey protein isolate with 27g protein per serving for faster muscle recovery.',
    long_description: 'Upgraded Demo Whey Protein Isolate is crafted for athletes and fitness enthusiasts who demand the highest quality protein. Each serving delivers 27g of fast-absorbing whey protein isolate with minimal carbs and fat. Perfect for post-workout recovery and lean muscle development.',
    key_benefits: '27g protein per serving, Low carb and low fat, Fast absorption, Supports muscle recovery, Great taste, Easy to mix',
    faq: 'Q: When should I take it? A: Post-workout or between meals.\nQ: Can I take it with milk? A: Yes, mix with water or milk as preferred.',
    who_should_use_it: 'Athletes, bodybuilders, fitness enthusiasts, and anyone looking to increase their daily protein intake.',
    how_to_use_it: 'Mix one scoop with 200-250ml of water or milk. Take post-workout or between meals to meet daily protein goals.',
    why_buy_from_upgraded: 'Authentic products with batch-level verification, GST invoice, fast Pan-India delivery, and dedicated WhatsApp support.',
    seo_title: 'Whey Protein Isolate Chocolate 1kg | Upgraded.co.in',
    seo_description: 'Buy premium Whey Protein Isolate with 27g protein per serving. Authentic, lab-tested, fast delivery across India.',
    seo_keywords: 'whey protein isolate, protein powder, muscle building, post workout, chocolate protein',
    meta_canonical: 'https://upgraded.co.in/products/upgraded-demo-whey-protein-isolate',
    source_website: 'demo',
    source_product_url: '',
    source_image_urls: '',
    data_confidence: 'high',
    needs_review: 'no',
    review_notes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    brand: 'Demo Performance Labs',
    brand_slug: 'demo-performance-labs',
    product_title: 'Demo Performance Pre-Workout Energy',
    product_handle: 'demo-performance-pre-workout-energy',
    category: 'Pre-Workout',
    subcategory: 'Pre-Workout',
    goal: 'Energy & Endurance',
    product_type: 'Pre-Workout',
    flavor: 'Blue Raspberry',
    size: '300g',
    variant_title: 'Blue Raspberry / 300g',
    variant_sku: 'DPL-PWO-BLUE-300G',
    barcode: '8901234567002',
    mrp: 1899,
    sale_price: 1499,
    cost_price: 900,
    wholesale_price: 1100,
    distributor_price: 1000,
    currency: 'INR',
    tax_rate: 18,
    stock: 80,
    stock_status: 'in_stock',
    min_order_quantity: 1,
    case_pack_quantity: 20,
    product_images: '/public/product-images/demo-performance-labs/demo-performance-pre-workout-energy/main.webp,/public/product-images/demo-performance-labs/demo-performance-pre-workout-energy/gallery-01.webp',
    main_image: '/public/product-images/demo-performance-labs/demo-performance-pre-workout-energy/main.webp',
    gallery_images: '/public/product-images/demo-performance-labs/demo-performance-pre-workout-energy/gallery-01.webp',
    label_image: '/public/product-images/demo-performance-labs/demo-performance-pre-workout-energy/label.webp',
    nutrition_image: '/public/product-images/demo-performance-labs/demo-performance-pre-workout-energy/nutrition.webp',
    ingredients: 'Beta-Alanine, Citrulline Malate, Caffeine Anhydrous, Taurine, L-Arginine, Natural & Artificial Flavors, Citric Acid',
    nutrition_facts: 'Per 10g serving: Beta-Alanine 3.2g, Citrulline Malate 6g, Caffeine 200mg, Taurine 1g, L-Arginine 1g, Calories 5 kcal',
    serving_size: '10g (1 scoop)',
    servings_per_container: '30',
    directions: 'Mix 1 scoop with 250-300ml cold water. Consume 20-30 minutes before workout. Do not exceed 2 servings per day.',
    warnings: 'Contains caffeine. Not recommended for individuals sensitive to caffeine. Consult physician if pregnant or nursing.',
    allergen_info: 'Manufactured in a facility that processes milk, soy, wheat, nuts, and eggs.',
    importer: 'Demo Performance Labs India Pvt Ltd, Bangalore, Karnataka',
    manufacturer: 'Demo Performance Labs Inc.',
    country_of_origin: 'USA',
    batch_number: '',
    expiry_date: '',
    authenticity_message: 'Imported and verified through authorized channels. Every batch tracked for authenticity.',
    short_description: 'High-performance pre-workout with beta-alanine, citrulline, and 200mg caffeine for intense training.',
    long_description: 'Demo Performance Pre-Workout Energy is engineered for athletes who demand peak performance. Clinically dosed with beta-alanine, citrulline malate, and a focused caffeine blend to deliver sustained energy, explosive pumps, and razor-sharp focus during your toughest workouts.',
    key_benefits: '3.2g Beta-Alanine per serving, 6g Citrulline Malate, 200mg caffeine for energy, Sustained pump and focus, Zero sugar, 30 servings per tub',
    faq: 'Q: How much caffeine does it contain? A: 200mg per serving.\nQ: Can beginners use it? A: Start with half a scoop to assess tolerance.',
    who_should_use_it: 'Athletes, bodybuilders, CrossFit athletes, and anyone seeking an energy boost before training.',
    how_to_use_it: 'Mix one scoop with cold water 20-30 minutes before training. Start with half a scoop if new to pre-workouts.',
    why_buy_from_upgraded: 'Guaranteed authentic imports, proper FSSAI-compliant labeling, GST invoices, and Pan-India express delivery.',
    seo_title: 'Pre-Workout Energy Blue Raspberry 300g | Upgraded.co.in',
    seo_description: 'Buy high-performance pre-workout with clinically dosed ingredients. Authentic imports, fast delivery across India.',
    seo_keywords: 'pre workout, energy supplement, beta alanine, citrulline malate, gym supplement',
    meta_canonical: 'https://upgraded.co.in/products/demo-performance-pre-workout-energy',
    source_website: 'demo',
    source_product_url: '',
    source_image_urls: '',
    data_confidence: 'high',
    needs_review: 'no',
    review_notes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    brand: 'Sample Wellness Co',
    brand_slug: 'sample-wellness-co',
    product_title: 'Sample Wellness Creatine Monohydrate',
    product_handle: 'sample-wellness-creatine-monohydrate',
    category: 'Creatine',
    subcategory: 'Creatine',
    goal: 'Strength & Power',
    product_type: 'Creatine Monohydrate',
    flavor: 'Unflavored',
    size: '250g',
    variant_title: 'Unflavored / 250g',
    variant_sku: 'SWC-CRE-UNFL-250G',
    barcode: '8901234567003',
    mrp: 999,
    sale_price: 799,
    cost_price: 400,
    wholesale_price: 550,
    distributor_price: 480,
    currency: 'INR',
    tax_rate: 18,
    stock: 200,
    stock_status: 'in_stock',
    min_order_quantity: 1,
    case_pack_quantity: 24,
    product_images: '/public/product-images/sample-wellness-co/sample-wellness-creatine-monohydrate/main.webp,/public/product-images/sample-wellness-co/sample-wellness-creatine-monohydrate/gallery-01.webp',
    main_image: '/public/product-images/sample-wellness-co/sample-wellness-creatine-monohydrate/main.webp',
    gallery_images: '/public/product-images/sample-wellness-co/sample-wellness-creatine-monohydrate/gallery-01.webp',
    label_image: '/public/product-images/sample-wellness-co/sample-wellness-creatine-monohydrate/label.webp',
    nutrition_image: '/public/product-images/sample-wellness-co/sample-wellness-creatine-monohydrate/nutrition.webp',
    ingredients: 'Creatine Monohydrate (Micronized)',
    nutrition_facts: 'Per 5g serving: Creatine Monohydrate 5g, Calories 0 kcal',
    serving_size: '5g (1 scoop)',
    servings_per_container: '50',
    directions: 'Mix 1 scoop with 200ml water or juice. Consume daily, preferably post-workout or with a meal.',
    warnings: 'Stay hydrated while using creatine. Consult your physician if you have kidney conditions.',
    allergen_info: 'Free from major allergens. Manufactured in a GMP-certified facility.',
    importer: 'Sample Wellness Co India Pvt Ltd, New Delhi',
    manufacturer: 'Sample Wellness Co',
    country_of_origin: 'India',
    batch_number: '',
    expiry_date: '',
    authenticity_message: 'Lab-tested and verified pure creatine monohydrate. Sourced from trusted Indian manufacturers.',
    short_description: 'Pure micronized creatine monohydrate for strength, power, and muscle performance.',
    long_description: 'Sample Wellness Creatine Monohydrate delivers 5g of pure, micronized creatine per serving for optimal absorption. Creatine is one of the most researched sports supplements, proven to support strength, power output, and muscle performance during high-intensity training.',
    key_benefits: '5g pure creatine per serving, Micronized for better absorption, Supports strength and power, Zero calories, Unflavored and versatile, 50 servings per tub',
    faq: 'Q: Do I need a loading phase? A: No, 5g daily is sufficient.\nQ: Can I stack it with protein? A: Yes, it pairs well with any protein supplement.',
    who_should_use_it: 'Strength athletes, bodybuilders, sprinters, and anyone looking to improve high-intensity performance.',
    how_to_use_it: 'Mix one scoop with water or juice daily. Take post-workout or with any meal for consistent creatine saturation.',
    why_buy_from_upgraded: 'Lab-tested purity, Indian-made quality, GST invoices, competitive pricing, and reliable Pan-India delivery.',
    seo_title: 'Creatine Monohydrate Unflavored 250g | Upgraded.co.in',
    seo_description: 'Buy pure micronized creatine monohydrate for strength and power. Lab-tested, authentic, delivered across India.',
    seo_keywords: 'creatine monohydrate, creatine powder, strength supplement, muscle performance, micronized creatine',
    meta_canonical: 'https://upgraded.co.in/products/sample-wellness-creatine-monohydrate',
    source_website: 'demo',
    source_product_url: '',
    source_image_urls: '',
    data_confidence: 'high',
    needs_review: 'no',
    review_notes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const DATA_DICTIONARY_ROWS = [
  { field_name: 'brand', required: 'Yes', data_type: 'String', example: 'Upgraded Demo Nutrition', description: 'Brand name of the product', validation_rule: 'Must be a non-empty string' },
  { field_name: 'brand_slug', required: 'Yes', data_type: 'String', example: 'upgraded-demo-nutrition', description: 'URL-friendly brand slug', validation_rule: 'Lowercase, hyphenated, no spaces' },
  { field_name: 'product_title', required: 'Yes', data_type: 'String', example: 'Upgraded Demo Whey Protein Isolate', description: 'Full product title', validation_rule: 'Must be a non-empty string' },
  { field_name: 'product_handle', required: 'Yes', data_type: 'String', example: 'upgraded-demo-whey-protein-isolate', description: 'URL-friendly product handle', validation_rule: 'Lowercase, hyphenated, no spaces, unique per brand' },
  { field_name: 'category', required: 'Yes', data_type: 'String', example: 'Protein', description: 'Primary product category', validation_rule: 'Must match CategoryMapping sheet' },
  { field_name: 'subcategory', required: 'No', data_type: 'String', example: 'Whey Protein', description: 'Product subcategory', validation_rule: 'Must match CategoryMapping sheet if provided' },
  { field_name: 'goal', required: 'No', data_type: 'String', example: 'Muscle Building', description: 'Fitness goal this product supports', validation_rule: 'Must match CategoryMapping sheet if provided' },
  { field_name: 'product_type', required: 'No', data_type: 'String', example: 'Whey Protein Isolate', description: 'Specific product type classification', validation_rule: 'Non-empty string' },
  { field_name: 'flavor', required: 'No', data_type: 'String', example: 'Chocolate', description: 'Product flavor variant', validation_rule: 'Non-empty string if applicable' },
  { field_name: 'size', required: 'No', data_type: 'String', example: '1 kg', description: 'Product size/weight', validation_rule: 'Non-empty string if applicable' },
  { field_name: 'variant_title', required: 'No', data_type: 'String', example: 'Chocolate / 1 kg', description: 'Combined flavor and size title', validation_rule: 'Descriptive string' },
  { field_name: 'variant_sku', required: 'Yes', data_type: 'String', example: 'UDN-WPI-CHOC-1KG', description: 'Unique SKU for this variant', validation_rule: 'Must be unique across all rows' },
  { field_name: 'barcode', required: 'No', data_type: 'String', example: '8901234567001', description: 'EAN/UPC barcode number', validation_rule: 'Numeric string, 8-14 digits' },
  { field_name: 'mrp', required: 'Yes', data_type: 'Number', example: '2499', description: 'Maximum retail price in INR', validation_rule: 'Must be numeric and >= sale_price' },
  { field_name: 'sale_price', required: 'Yes', data_type: 'Number', example: '1999', description: 'Current selling price in INR', validation_rule: 'Must be numeric and <= mrp' },
  { field_name: 'cost_price', required: 'No', data_type: 'Number', example: '1200', description: 'Internal cost price', validation_rule: 'Must be numeric' },
  { field_name: 'wholesale_price', required: 'No', data_type: 'Number', example: '1500', description: 'Wholesale pricing tier', validation_rule: 'Must be numeric, between cost and MRP' },
  { field_name: 'distributor_price', required: 'No', data_type: 'Number', example: '1350', description: 'Distributor pricing tier', validation_rule: 'Must be numeric, between cost and wholesale' },
  { field_name: 'currency', required: 'Yes', data_type: 'String', example: 'INR', description: 'ISO currency code', validation_rule: 'Must be valid ISO 4217 code' },
  { field_name: 'tax_rate', required: 'No', data_type: 'Number', example: '18', description: 'GST tax rate percentage', validation_rule: 'Numeric, typically 0, 5, 12, 18, or 28' },
  { field_name: 'stock', required: 'Yes', data_type: 'Number', example: '150', description: 'Available inventory quantity', validation_rule: 'Must be numeric, >= 0' },
  { field_name: 'stock_status', required: 'Yes', data_type: 'String', example: 'in_stock', description: 'Inventory availability status', validation_rule: 'One of: in_stock, out_of_stock, low_stock, preorder' },
  { field_name: 'min_order_quantity', required: 'No', data_type: 'Number', example: '1', description: 'Minimum order quantity', validation_rule: 'Must be numeric, >= 1' },
  { field_name: 'case_pack_quantity', required: 'No', data_type: 'Number', example: '12', description: 'Units per wholesale case', validation_rule: 'Must be numeric, >= 1' },
  { field_name: 'product_images', required: 'No', data_type: 'String', example: '/public/product-images/.../main.webp,/public/product-images/.../gallery-01.webp', description: 'Comma-separated image paths', validation_rule: 'All paths must start with /public/product-images/' },
  { field_name: 'main_image', required: 'Yes', data_type: 'String', example: '/public/product-images/.../main.webp', description: 'Primary product image path', validation_rule: 'Must start with /public/product-images/' },
  { field_name: 'gallery_images', required: 'No', data_type: 'String', example: '/public/product-images/.../gallery-01.webp', description: 'Additional gallery images (comma-separated)', validation_rule: 'Paths must start with /public/product-images/' },
  { field_name: 'label_image', required: 'No', data_type: 'String', example: '/public/product-images/.../label.webp', description: 'Product label image path', validation_rule: 'Path must start with /public/product-images/' },
  { field_name: 'nutrition_image', required: 'No', data_type: 'String', example: '/public/product-images/.../nutrition.webp', description: 'Nutrition facts label image path', validation_rule: 'Path must start with /public/product-images/' },
  { field_name: 'ingredients', required: 'Yes', data_type: 'String', example: 'Whey Protein Isolate, Cocoa Powder...', description: 'Full ingredient list from label', validation_rule: 'Must match product label exactly' },
  { field_name: 'nutrition_facts', required: 'Yes', data_type: 'String', example: 'Per 30g serving: Protein 27g...', description: 'Nutritional information per serving', validation_rule: 'Must match product label exactly' },
  { field_name: 'serving_size', required: 'Yes', data_type: 'String', example: '30g (1 scoop)', description: 'Recommended serving size', validation_rule: 'Must match product label exactly' },
  { field_name: 'servings_per_container', required: 'Yes', data_type: 'String', example: '33', description: 'Number of servings per container', validation_rule: 'Must match product label exactly' },
  { field_name: 'directions', required: 'Yes', data_type: 'String', example: 'Mix 1 scoop with 200-250ml water...', description: 'Usage directions from label', validation_rule: 'Must match product label or manufacturer guidelines' },
  { field_name: 'warnings', required: 'No', data_type: 'String', example: 'Consult physician before use...', description: 'Safety warnings from label', validation_rule: 'Must match product label exactly' },
  { field_name: 'allergen_info', required: 'No', data_type: 'String', example: 'Contains milk and soy...', description: 'Allergen information from label', validation_rule: 'Must match product label exactly' },
  { field_name: 'importer', required: 'No', data_type: 'String', example: 'Upgraded Demo Nutrition Pvt Ltd...', description: 'Importer details with address', validation_rule: 'Must match invoice or FSSAI records' },
  { field_name: 'manufacturer', required: 'Yes', data_type: 'String', example: 'Upgraded Demo Nutrition Pvt Ltd', description: 'Manufacturer name and address', validation_rule: 'Must match product label' },
  { field_name: 'country_of_origin', required: 'Yes', data_type: 'String', example: 'India', description: 'Country where product was manufactured', validation_rule: 'Valid ISO country name' },
  { field_name: 'batch_number', required: 'No', data_type: 'String', example: '', description: 'Batch/lot number from warehouse', validation_rule: 'Only from warehouse, distributor, or stock records' },
  { field_name: 'expiry_date', required: 'No', data_type: 'String', example: '', description: 'Expiry date from warehouse', validation_rule: 'Only from warehouse, distributor, or stock records' },
  { field_name: 'authenticity_message', required: 'Yes', data_type: 'String', example: '100% authentic product...', description: 'Upgraded.co.in authenticity guarantee text', validation_rule: 'Must be rewritten, not copied from source' },
  { field_name: 'short_description', required: 'Yes', data_type: 'String', example: 'Premium whey protein isolate...', description: 'Brief marketing description', validation_rule: 'Must be rewritten for Upgraded.co.in, max 200 chars' },
  { field_name: 'long_description', required: 'Yes', data_type: 'String', example: 'Upgraded Demo Whey Protein Isolate...', description: 'Full marketing description', validation_rule: 'Must be rewritten for Upgraded.co.in tone' },
  { field_name: 'key_benefits', required: 'Yes', data_type: 'String', example: '27g protein per serving...', description: 'Bullet-point style key benefits', validation_rule: 'Must be rewritten, no medical claims' },
  { field_name: 'faq', required: 'No', data_type: 'String', example: 'Q: When should I take it?...', description: 'Frequently asked questions', validation_rule: 'Must be rewritten for Upgraded.co.in' },
  { field_name: 'who_should_use_it', required: 'No', data_type: 'String', example: 'Athletes, bodybuilders...', description: 'Target audience description', validation_rule: 'Must be rewritten, no medical claims' },
  { field_name: 'how_to_use_it', required: 'No', data_type: 'String', example: 'Mix one scoop with water...', description: 'Usage instructions in friendly tone', validation_rule: 'Must be rewritten for Upgraded.co.in' },
  { field_name: 'why_buy_from_upgraded', required: 'Yes', data_type: 'String', example: 'Authentic products with batch-level...', description: 'Upgraded.co.in value proposition', validation_rule: 'Must be rewritten for Upgraded.co.in brand voice' },
  { field_name: 'seo_title', required: 'Yes', data_type: 'String', example: 'Whey Protein Isolate Chocolate 1kg', description: 'SEO page title tag', validation_rule: 'Under 70 characters' },
  { field_name: 'seo_description', required: 'Yes', data_type: 'String', example: 'Buy premium Whey Protein Isolate...', description: 'SEO meta description', validation_rule: 'Under 160 characters' },
  { field_name: 'seo_keywords', required: 'No', data_type: 'String', example: 'whey protein isolate, protein powder...', description: 'SEO meta keywords (comma-separated)', validation_rule: '5-10 relevant keywords' },
  { field_name: 'meta_canonical', required: 'No', data_type: 'String', example: 'https://upgraded.co.in/products/...', description: 'Canonical URL for SEO', validation_rule: 'Valid URL format' },
  { field_name: 'source_website', required: 'No', data_type: 'String', example: 'demo', description: 'Source website data was extracted from', validation_rule: 'Non-empty string if sourced' },
  { field_name: 'source_product_url', required: 'No', data_type: 'String', example: '', description: 'Original product URL from source', validation_rule: 'Valid URL format if provided' },
  { field_name: 'source_image_urls', required: 'No', data_type: 'String', example: '', description: 'Original image URLs from source', validation_rule: 'Comma-separated valid URLs if provided' },
  { field_name: 'data_confidence', required: 'Yes', data_type: 'String', example: 'high', description: 'Confidence level in data accuracy', validation_rule: 'One of: high, medium, low' },
  { field_name: 'needs_review', required: 'Yes', data_type: 'String', example: 'no', description: 'Whether row needs manual review', validation_rule: 'Must be yes or no' },
  { field_name: 'review_notes', required: 'No', data_type: 'String', example: '', description: 'Notes for items flagged for review', validation_rule: 'Free text' },
  { field_name: 'created_at', required: 'Yes', data_type: 'DateTime', example: '2026-05-01T12:00:00Z', description: 'Record creation timestamp', validation_rule: 'ISO 8601 datetime format' },
  { field_name: 'updated_at', required: 'Yes', data_type: 'DateTime', example: '2026-05-01T12:00:00Z', description: 'Last update timestamp', validation_rule: 'ISO 8601 datetime format' },
];

const CATEGORY_MAPPING_ROWS = [
  { category: 'Protein', subcategory: 'Whey Protein', goal: 'Muscle Building', menu_group: 'Protein', is_active: 'Yes', notes: 'Standard whey protein concentrates' },
  { category: 'Protein', subcategory: 'Whey Isolate', goal: 'Muscle Building', menu_group: 'Protein', is_active: 'Yes', notes: 'Premium whey protein isolate' },
  { category: 'Protein', subcategory: 'Mass Gainer', goal: 'Weight Gain', menu_group: 'Protein', is_active: 'Yes', notes: 'High-calorie mass gainers' },
  { category: 'Protein', subcategory: 'Plant Protein', goal: 'Muscle Building', menu_group: 'Protein', is_active: 'Yes', notes: 'Vegan and plant-based proteins' },
  { category: 'Protein', subcategory: 'Casein', goal: 'Muscle Recovery', menu_group: 'Protein', is_active: 'Yes', notes: 'Slow-digesting casein protein' },
  { category: 'Pre-Workout', subcategory: 'Pre-Workout', goal: 'Energy & Endurance', menu_group: 'Pre-Workout', is_active: 'Yes', notes: 'Pre-workout energy formulas' },
  { category: 'Creatine', subcategory: 'Creatine', goal: 'Strength & Power', menu_group: 'Creatine', is_active: 'Yes', notes: 'Creatine monohydrate and variants' },
  { category: 'BCAA / EAA', subcategory: 'BCAA', goal: 'Recovery', menu_group: 'Recovery', is_active: 'Yes', notes: 'Branched-chain amino acids' },
  { category: 'BCAA / EAA', subcategory: 'EAA', goal: 'Recovery', menu_group: 'Recovery', is_active: 'Yes', notes: 'Essential amino acids' },
  { category: 'Fat Burners', subcategory: 'Fat Burners', goal: 'Weight Loss', menu_group: 'Weight Management', is_active: 'Yes', notes: 'Thermogenic and fat loss support' },
  { category: 'Vitamins', subcategory: 'Multivitamins', goal: 'General Health', menu_group: 'Wellness', is_active: 'Yes', notes: 'Daily multivitamin supplements' },
  { category: 'Vitamins', subcategory: 'Vitamin D', goal: 'General Health', menu_group: 'Wellness', is_active: 'Yes', notes: 'Vitamin D3 supplements' },
  { category: 'Vitamins', subcategory: 'Vitamin C', goal: 'Immunity', menu_group: 'Wellness', is_active: 'Yes', notes: 'Vitamin C and immune support' },
  { category: 'Omega / Fish Oil', subcategory: 'Fish Oil', goal: 'Heart Health', menu_group: 'Wellness', is_active: 'Yes', notes: 'Omega-3 fish oil supplements' },
  { category: 'Omega / Fish Oil', subcategory: 'Omega-3', goal: 'Heart Health', menu_group: 'Wellness', is_active: 'Yes', notes: 'Omega-3 fatty acid supplements' },
  { category: 'Wellness', subcategory: 'Probiotics', goal: 'Gut Health', menu_group: 'Wellness', is_active: 'Yes', notes: 'Digestive and gut health support' },
  { category: 'Wellness', subcategory: 'Collagen', goal: 'Skin & Joints', menu_group: 'Wellness', is_active: 'Yes', notes: 'Collagen peptides and support' },
  { category: 'Wellness', subcategory: 'ZMA', goal: 'Sleep & Recovery', menu_group: 'Wellness', is_active: 'Yes', notes: 'Zinc, magnesium, and B6 blends' },
  { category: 'Men\'s Health', subcategory: 'Testosterone Support', goal: 'Men\'s Health', menu_group: 'Men\'s Health', is_active: 'Yes', notes: 'Natural testosterone support' },
  { category: 'Women\'s Health', subcategory: 'Women\'s Multivitamin', goal: 'Women\'s Health', menu_group: 'Women\'s Health', is_active: 'Yes', notes: 'Women-specific formulations' },
  { category: 'Snacks & Bars', subcategory: 'Protein Bars', goal: 'On-the-Go Nutrition', menu_group: 'Snacks', is_active: 'Yes', notes: 'High-protein snack bars' },
  { category: 'Snacks & Bars', subcategory: 'Protein Cookies', goal: 'On-the-Go Nutrition', menu_group: 'Snacks', is_active: 'Yes', notes: 'High-protein cookies' },
  { category: 'Shakers & Accessories', subcategory: 'Shakers', goal: 'Accessories', menu_group: 'Accessories', is_active: 'Yes', notes: 'Protein shakers and bottles' },
  { category: 'Shakers & Accessories', subcategory: 'Accessories', goal: 'Accessories', menu_group: 'Accessories', is_active: 'Yes', notes: 'Gym accessories and tools' },
];

async function main() {
  console.log('Creating products_import_template.xlsx...');
  
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Upgraded.co.in';
  workbook.lastModifiedBy = 'Product Data Extraction System';
  workbook.created = new Date();

  // Sheet 1: MasterProducts
  const masterSheet = workbook.addWorksheet('MasterProducts', {
    properties: { tabColor: { argb: 'FF4472C4' } }
  });
  
  const masterHeaderRow = masterSheet.addRow(MASTER_COLUMNS);
  masterHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  masterHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };
  
  SAMPLE_PRODUCTS.forEach((product) => {
    masterSheet.addRow(Object.values(product));
  });

  // Auto-fit column widths
  MASTER_COLUMNS.forEach((col, i) => {
    masterSheet.getColumn(i + 1).width = 25;
  });

  // Sheet 2: ValidationReport
  const validationSheet = workbook.addWorksheet('ValidationReport', {
    properties: { tabColor: { argb: 'FFC00000' } }
  });
  
  const validationHeaderRow = validationSheet.addRow(VALIDATION_COLUMNS);
  validationHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  validationHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFC00000' }
  };
  
  VALIDATION_COLUMNS.forEach((col, i) => {
    validationSheet.getColumn(i + 1).width = 25;
  });

  // Sheet 3: DataDictionary
  const dataDictSheet = workbook.addWorksheet('DataDictionary', {
    properties: { tabColor: { argb: 'FF70AD47' } }
  });
  
  const dataDictHeaderRow = dataDictSheet.addRow(DATA_DICTIONARY_COLUMNS);
  dataDictHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  dataDictHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF70AD47' }
  };
  
  DATA_DICTIONARY_ROWS.forEach((row) => {
    dataDictSheet.addRow(Object.values(row));
  });
  
  DATA_DICTIONARY_COLUMNS.forEach((col, i) => {
    dataDictSheet.getColumn(i + 1).width = 30;
  });

  // Sheet 4: CategoryMapping
  const categorySheet = workbook.addWorksheet('CategoryMapping', {
    properties: { tabColor: { argb: 'FFFFC000' } }
  });
  
  const categoryHeaderRow = categorySheet.addRow(CATEGORY_MAPPING_COLUMNS);
  categoryHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  categoryHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFC000' }
  };
  
  CATEGORY_MAPPING_ROWS.forEach((row) => {
    categorySheet.addRow(Object.values(row));
  });
  
  CATEGORY_MAPPING_COLUMNS.forEach((col, i) => {
    categorySheet.getColumn(i + 1).width = 25;
  });

  // Sheet 5: ImportInstructions
  const importSheet = workbook.addWorksheet('ImportInstructions', {
    properties: { tabColor: { argb: 'FF5B9BD5' } }
  });
  
  const instructions = [
    'IMPORT INSTRUCTIONS FOR Upgraded.co.in',
    '',
    '1. One row = one product variant',
    '2. Same product with multiple flavors or sizes should have multiple rows',
    '3. variant_sku must be unique',
    '4. mrp and sale_price must be numeric',
    '5. mrp must be greater than or equal to sale_price',
    '6. Factual label data must not be invented',
    '7. Missing compliance fields must be marked needs_review = yes',
    '8. Product images must be local paths under /public/product-images/',
    '9. Competitor-hosted image URLs must not be used in production',
    '10. Batch number and expiry must only come from warehouse, distributor, invoice, or stock records',
    '',
    'NOTES:',
    '- All prices are in INR',
    '- Tax rate is the applicable GST percentage (0, 5, 12, 18, or 28)',
    '- stock_status options: in_stock, out_of_stock, low_stock, preorder',
    '- data_confidence options: high, medium, low',
    '- needs_review options: yes, no',
    '- Image paths format: /public/product-images/brand-slug/product-handle/main.webp',
    '- Do not copy competitor marketing descriptions',
    '- Do not invent medical claims',
    '- Use Upgraded.co.in tone: premium, trustworthy, fitness-focused, India-market ready, authenticity-first',
  ];
  
  instructions.forEach((line, i) => {
    const row = importSheet.addRow([line]);
    if (i === 0) {
      row.font = { bold: true, size: 14 };
    } else if (line.startsWith('NOTES:')) {
      row.font = { bold: true, size: 12 };
    }
  });
  
  importSheet.getColumn(1).width = 100;

  // Save workbook
  const outputPath = resolve(__dirname, '..', 'products_import_template.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log(`Template created: ${outputPath}`);
}

main().catch(console.error);
