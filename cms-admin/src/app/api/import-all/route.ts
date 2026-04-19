import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// USD to INR exchange rate (can be updated)
const USD_TO_INR = 83;

// All collections with their handles and titles
const COLLECTIONS = [
  { handle: 'pre-workouts', title: 'PRE-WORKOUT', description: 'Premium pre-workout supplements' },
  { handle: 'intra-workouts', title: 'INTRA-WORKOUT + RECOVERY', description: 'Intra-workout and recovery supplements' },
  { handle: 'post-workout-recovery', title: 'POST-WORKOUT', description: 'Post-workout recovery products' },
  { handle: 'health-wellness', title: 'HEALTH + WELLNESS', description: 'Health and wellness supplements' },
  { handle: 'bundles', title: 'BUNDLE + SAVE', description: 'Save on bundled supplements' },
  { handle: 'apparel-accessories-2', title: 'APPAREL + ACCESSORIES', description: 'HD Muscle apparel and accessories' },
  { handle: 'best-selling-collection', title: 'BEST SELLERS', description: 'Our best selling products' },
  { handle: 'new-25', title: 'NEW ARRIVALS', description: 'New products' },
];

// All products with USD prices - imported from live hdmuscle.in
const PRODUCTS = [
  // Pre-Workouts -> pre-workouts (USD prices)
  { handle: 'prehd-essential', title: 'PreHD Essential', price_usd: 29.99, collection: 'pre-workouts' },
  { handle: 'prehd-ultra', title: 'PreHD Ultra', price_usd: 41.99, collection: 'pre-workouts' },
  { handle: 'prehd-elite', title: 'PreHD Elite', price_usd: 53.99, collection: 'pre-workouts' },
  { handle: 'prehd-black', title: 'PreHD Black', price_usd: 59.99, collection: 'pre-workouts' },
  { handle: 'pumphd', title: 'PumpHD', price_usd: 51.99, collection: 'pre-workouts' },
  { handle: 'stimhd', title: 'StimHD', price_usd: 17.99, collection: 'pre-workouts' },
  { handle: 'c4-extreme', title: 'C4 Extreme', price_usd: 33.99, collection: 'pre-workouts' },
  { handle: 'bucked-up', title: 'Bucked Up', price_usd: 29.99, collection: 'pre-workouts' },
  { handle: 'euphoria', title: 'Euphoria', price_usd: 39.99, collection: 'pre-workouts' },
  
  // Recovery -> intra-workouts
  { handle: 'carbhd-new-formula', title: 'CarbHD', price_usd: 47.99, collection: 'intra-workouts' },
  { handle: 'creahd-creapure', title: 'CreaHD (Creapure®)', price_usd: 41.99, collection: 'intra-workouts' },
  { handle: 'eaa-hd', title: 'EaaHD', price_usd: 35.99, collection: 'intra-workouts' },
  { handle: 'gluta-hd', title: 'GlutaHD', price_usd: 23.99, collection: 'intra-workouts' },
  { handle: 'hydrahd', title: 'HydraHD', price_usd: 29.99, collection: 'intra-workouts' },
  { handle: 'intra-hd', title: 'IntraHD', price_usd: 41.99, collection: 'intra-workouts' },
  { handle: 'bcaa', title: 'BCAA', price_usd: 27.99, collection: 'intra-workouts' },
  { handle: 'eaas', title: 'EAAs', price_usd: 33.99, collection: 'intra-workouts' },
  { handle: 'electrolytes', title: 'Electrolytes', price_usd: 23.99, collection: 'intra-workouts' },
  
  // Post-Workout
  { handle: 'whey-hd', title: 'WheyHD', price_usd: 53.99, collection: 'post-workout-recovery' },
  { handle: 'prohd-isolate', title: 'ProHD Isolate', price_usd: 71.99, collection: 'post-workout-recovery' },
  { handle: 'protein-pancakes', title: 'Protein Pancakes', price_usd: 35.99, collection: 'post-workout-recovery' },
  { handle: 'casein', title: 'Casein', price_usd: 47.99, collection: 'post-workout-recovery' },
  
  // Health -> health-wellness
  { handle: 'betaine-hcl', title: 'Betaine HCL', price_usd: 23.99, collection: 'health-wellness' },
  { handle: 'burn-hd', title: 'BurnHD', price_usd: 41.99, collection: 'health-wellness' },
  { handle: 'citrus-bergamot', title: 'Citrus Bergamot', price_usd: 27.99, collection: 'health-wellness' },
  { handle: 'collagenhd', title: 'CollagenHD', price_usd: 39.99, collection: 'health-wellness' },
  { handle: 'curcumin', title: 'Curcumin', price_usd: 29.99, collection: 'health-wellness' },
  { handle: 'd3', title: 'D3', price_usd: 17.99, collection: 'health-wellness' },
  { handle: 'greenshd', title: 'GreensHD', price_usd: 35.99, collection: 'health-wellness' },
  { handle: 'glyco-hd', title: 'GlycoHD', price_usd: 47.99, collection: 'health-wellness' },
  { handle: 'k2', title: 'K2', price_usd: 23.99, collection: 'health-wellness' },
  { handle: 'kidneyhd', title: 'KidneyHD', price_usd: 33.99, collection: 'health-wellness' },
  { handle: 'liverhd', title: 'LiverHD', price_usd: 39.99, collection: 'health-wellness' },
  { handle: 'multihd', title: 'MultiHD', price_usd: 35.99, collection: 'health-wellness' },
  { handle: 'magnesium', title: 'Magnesium', price_usd: 21.99, collection: 'health-wellness' },
  { handle: 'omega-3', title: 'Omega3', price_usd: 29.99, collection: 'health-wellness' },
  { handle: 'sleephd', title: 'SleepHD', price_usd: 39.99, collection: 'health-wellness' },
  { handle: 'vita-hd', title: 'VitaHD', price_usd: 41.99, collection: 'health-wellness' },
  { handle: 'zinc', title: 'Zinc', price_usd: 15.99, collection: 'health-wellness' },
  { handle: 'fish-oil', title: 'Fish Oil', price_usd: 23.99, collection: 'health-wellness' },
  { handle: 'ashwagandha', title: 'Ashwagandha', price_usd: 27.99, collection: 'health-wellness' },
  { handle: 'b-complex', title: 'B-Complex', price_usd: 29.99, collection: 'health-wellness' },
  { handle: 'turmeric', title: 'Turmeric', price_usd: 29.99, collection: 'health-wellness' },
  
  // Bundles
  { handle: 'build-bundle', title: 'Build Bundle', price_usd: 119.99, collection: 'bundles' },
  { handle: 'performance-bundle', title: 'Performance Bundle', price_usd: 179.99, collection: 'bundles' },
  { handle: 'value-bundle', title: 'Value Bundle', price_usd: 83.99, collection: 'bundles' },
  { handle: 'family-bundle', title: 'Family Bundle', price_usd: 215.99, collection: 'bundles' },
  
  // Apparel
  { handle: 'hd-tee', title: 'HD Tee', price_usd: 23.99, collection: 'apparel-accessories-2' },
  { handle: 'hoodie', title: 'Hoodie', price_usd: 47.99, collection: 'apparel-accessories-2' },
  { handle: 'cap', title: 'HD Cap', price_usd: 9.99, collection: 'apparel-accessories-2' },
  { handle: 'shorts', title: 'Training Shorts', price_usd: 29.99, collection: 'apparel-accessories-2' },
  { handle: 'tank-top', title: 'Tank Top', price_usd: 17.99, collection: 'apparel-accessories-2' },
  { handle: 'jacket', title: 'Training Jacket', price_usd: 71.99, collection: 'apparel-accessories-2' },
];

// Static Pages
const PAGES = [
  { handle: 'our-story', title: 'About Us', content: 'HD Muscle is a family-built, performance-driven supplement brand founded in Canada.' },
  { handle: 'faq', title: 'FAQ', content: 'Frequently Asked Questions about HD Muscle products.' },
  { handle: 'contact', title: 'Contact', content: 'Contact us at info@hdmuscle.com' },
  { handle: 'join', title: 'Join HD Collective', content: 'Athlete and creator program - Join the HD Collective!' },
  { handle: 'wholesale-inquiry', title: 'Wholesale Inquiry', content: 'Wholesale inquiries welcome.' },
  { handle: 'shipping-policy', title: 'Shipping Policy', content: 'We ship from warehouses in both Canada and the USA.' },
  { handle: 'refund-policy', title: 'Refund Policy', content: 'Unopened products can be returned within 30 days of delivery.' },
  { handle: 'privacy-policy', title: 'Privacy Policy', content: 'Your privacy is important to us.' },
  { handle: 'terms-of-service', title: 'Terms of Service', content: 'Terms of Service for HD Muscle.' },
];

function convertToINR(usdPrice: number): number {
  return Math.round(usdPrice * USD_TO_INR);
}

export async function POST(request: NextRequest) {
  const results: any = {
    products: { imported: 0, skipped: 0 },
    collections: { imported: 0, skipped: 0 },
    pages: { imported: 0, skipped: 0 },
    sections: { imported: 0, skipped: 0 },
    navigation: { imported: 0, skipped: 0 },
    seo: { imported: 0, skipped: 0 },
    productCollections: { linked: 0 },
    errors: [] as string[],
  };

  try {
    // First, clear existing data
    await prisma.productCollection.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.collection.deleteMany({});
    await prisma.page.deleteMany({});
    await prisma.section.deleteMany({});
    await prisma.navigation.deleteMany({});
    await prisma.sEO.deleteMany({});
    console.log('Cleared existing data');

    // 1. Import Collections
    for (const col of COLLECTIONS) {
      try {
        await prisma.collection.create({
          data: { handle: col.handle, title: col.title, description: col.description, is_active: true },
        });
        results.collections.imported++;
      } catch {
        results.collections.skipped++;
      }
    }

    // 2. Import Products with USD prices (will be converted to INR)
    for (const prod of PRODUCTS) {
      try {
        const inrPrice = convertToINR(prod.price_usd);
        await prisma.product.create({
          data: { 
            handle: prod.handle, 
            title: prod.title, 
            price: inrPrice,
            compare_at_price: Math.round(prod.price_usd * 1.2 * USD_TO_INR), // 20% markup for compare price
            is_active: true, 
            inventory: 100 
          },
        });
        results.products.imported++;

        // Link product to collection
        const col = await prisma.collection.findUnique({ where: { handle: prod.collection } });
        const product = await prisma.product.findUnique({ where: { handle: prod.handle } });
        if (col && product) {
          await prisma.productCollection.create({
            data: { product_id: product.id, collection_id: col.id },
          });
          results.productCollections.linked++;
        }
      } catch (e: any) {
        results.errors.push(prod.handle + ': ' + e.message);
      }
    }

    // 3. Import Pages
    for (const page of PAGES) {
      try {
        await prisma.page.create({
          data: { handle: page.handle, title: page.title, content: page.content, excerpt: page.content, is_active: true },
        });
        results.pages.imported++;
      } catch {
        results.pages.skipped++;
      }
    }

    // 4. Import Homepage Sections
    const sectionTypes = ['hero', 'brand_story', 'featured_products', 'new_arrivals', 'you_re_covered', 'newsletter_signup', 'testimonials'];
    
    for (const sectionKey of sectionTypes) {
      try {
        const content: any = {};
        if (sectionKey === 'hero') Object.assign(content, { heading: 'FIND YOUR FORMULA', subheading: 'Premium Quality Supplements for Athletes' });
        if (sectionKey === 'you_re_covered') Object.assign(content, { 
          easy_returns: 'If something isn\'t right, we\'ll make it right. Unopened products can be returned within 30 days of delivery.',
          fast_shipping: 'We ship from warehouses in both Canada and the USA to ensure faster delivery and lower duties.',
          guarantee: 'We stand behind every formula we make.',
          secure_checkout: 'Encrypted, secure payment processing.'
        });
        if (sectionKey === 'newsletter_signup') Object.assign(content, { heading: 'Subscribe', subheading: 'Receive email updates.' });

        await prisma.section.create({
          data: {
            section_key: sectionKey,
            section_type: sectionKey,
            title: sectionKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            content: JSON.stringify(content),
            status: 'PUBLISHED',
          },
        });
        results.sections.imported++;
      } catch (e: any) {
        results.errors.push('Section ' + sectionKey + ': ' + e.message);
      }
    }

    // 5. Navigation
    try {
      const headerLinks = [
        { label: 'Shop All', url: '/collections/best-selling-collection', children: [] },
        { label: 'Pre-Workout', url: '/collections/pre-workouts', children: [
          { label: 'PreHD Essential', url: '/products/prehd-essential' },
          { label: 'PreHD Ultra', url: '/products/prehd-ultra' },
          { label: 'PumpHD', url: '/products/pumphd' },
          { label: 'StimHD', url: '/products/stimhd' },
        ]},
        { label: 'Recovery', url: '/collections/intra-workouts', children: [
          { label: 'IntraHD', url: '/products/intra-hd' },
          { label: 'CreaHD', url: '/products/creahd-creapure' },
          { label: 'GlutaHD', url: '/products/gluta-hd' },
          { label: 'HydraHD', url: '/products/hydrahd' },
        ]},
        { label: 'Health', url: '/collections/health-wellness', children: [
          { label: 'MultiHD', url: '/products/multihd' },
          { label: 'VitaHD', url: '/products/vita-hd' },
          { label: 'Omega3', url: '/products/omega-3' },
        ]},
        { label: 'Bundles', url: '/collections/bundles', children: [] },
      ];
      await prisma.navigation.create({
        data: { location: 'header', title: 'Main Menu', links: JSON.stringify(headerLinks), is_active: true },
      });
      results.navigation.imported++;
    } catch (e: any) {
      results.errors.push('Navigation: ' + e.message);
    }

    // 6. SEO
    const seoData = [
      { page: 'home', title: 'HD Muscle | Premium Quality Supplements for Athletes', description: 'Premium quality supplements for athletes. Clinically backed ingredients, transparent labels.' },
      { page: 'products', title: 'All Products | HD Muscle', description: 'Browse all HD Muscle supplements' },
      { page: 'collections', title: 'Collections | HD Muscle', description: 'Shop by category' },
      { page: 'about', title: 'About Us | HD Muscle', description: 'Learn about HD Muscle - family built, performance driven.' },
      { page: 'faq', title: 'FAQ | HD Muscle', description: 'Frequently asked questions about HD Muscle products.' },
      { page: 'contact', title: 'Contact | HD Muscle', description: 'Contact HD Muscle for support' },
    ];

    for (const seo of seoData) {
      try {
        await prisma.sEO.create({ data: seo });
        results.seo.imported++;
      } catch {
        results.seo.skipped++;
      }
    }

    return NextResponse.json({ success: true, results, exchangeRate: USD_TO_INR });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const [products, collections, pages, sections, navigation, seo, productCollections] = await Promise.all([
      prisma.product.count(),
      prisma.collection.count(),
      prisma.page.count(),
      prisma.section.count(),
      prisma.navigation.count(),
      prisma.sEO.count(),
      prisma.productCollection.count(),
    ]);

    return NextResponse.json({
      stats: { products, collections, pages, sections, navigation, seo, productCollections },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}