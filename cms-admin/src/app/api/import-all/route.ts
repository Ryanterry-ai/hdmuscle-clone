import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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

// All products with their collection mappings
const PRODUCTS = [
  // Pre-Workouts -> pre-workouts
  { handle: 'prehd-essential', title: 'PreHD Essential', price: 29.99, collection: 'pre-workouts' },
  { handle: 'prehd-ultra', title: 'PreHD Ultra', price: 44.99, collection: 'pre-workouts' },
  { handle: 'prehd-elite', title: 'PreHD Elite', price: 59.99, collection: 'pre-workouts' },
  { handle: 'prehd-black', title: 'PreHD Black', price: 69.99, collection: 'pre-workouts' },
  { handle: 'pumphd', title: 'PumpHD', price: 59.99, collection: 'pre-workouts' },
  { handle: 'stimhd', title: 'StimHD', price: 16.49, collection: 'pre-workouts' },
  
  // Recovery -> intra-workouts
  { handle: 'carbhd-new-formula', title: 'CarbHD', price: 49.99, collection: 'intra-workouts' },
  { handle: 'creahd-creapure', title: 'CreaHD (Creapure®)', price: 42.99, collection: 'intra-workouts' },
  { handle: 'eaa-hd', title: 'EaaHD', price: 34.99, collection: 'intra-workouts' },
  { handle: 'gluta-hd', title: 'GlutaHD', price: 22.99, collection: 'intra-workouts' },
  { handle: 'hydrahd', title: 'HydraHD', price: 29.99, collection: 'intra-workouts' },
  { handle: 'intra-hd', title: 'IntraHD', price: 42.99, collection: 'intra-workouts' },
  { handle: 'prohd-isolate', title: 'ProHD', price: 79.99, collection: 'bundles' },
  
  // Health -> health-wellness
  { handle: 'betaine-hcl', title: 'Betaine HCL', price: 24.99, collection: 'health-wellness' },
  { handle: 'burn-hd', title: 'BurnHD', price: 44.99, collection: 'health-wellness' },
  { handle: 'citrus-bergamot', title: 'Citrus Bergamot', price: 27.99, collection: 'health-wellness' },
  { handle: 'collagenhd', title: 'CollagenHD', price: 39.99, collection: 'health-wellness' },
  { handle: 'curcumin', title: 'Curcumin', price: 32.99, collection: 'health-wellness' },
  { handle: 'd3', title: 'D3', price: 19.99, collection: 'health-wellness' },
  { handle: 'greenshd', title: 'GreensHD', price: 34.99, collection: 'health-wellness' },
  { handle: 'glyco-hd', title: 'GlycoHD', price: 49.99, collection: 'health-wellness' },
  { handle: 'k2', title: 'K2', price: 24.99, collection: 'health-wellness' },
  { handle: 'kidneyhd', title: 'KidneyHD', price: 34.99, collection: 'health-wellness' },
  { handle: 'liverhd', title: 'LiverHD', price: 39.99, collection: 'health-wellness' },
  { handle: 'multihd', title: 'MultiHD', price: 37.99, collection: 'health-wellness' },
  { handle: 'magnesium', title: 'Magnesium', price: 22.99, collection: 'health-wellness' },
  { handle: 'omega-3', title: 'Omega3', price: 34.99, collection: 'health-wellness' },
  { handle: 'sleephd', title: 'SleepHD', price: 39.99, collection: 'health-wellness' },
  { handle: 'vita-hd', title: 'VitaHD', price: 44.99, collection: 'health-wellness' },
  { handle: 'zinc', title: 'Zinc', price: 17.99, collection: 'health-wellness' },
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
    // 1. Import Collections
    for (const col of COLLECTIONS) {
      try {
        const existing = await prisma.collection.findUnique({ where: { handle: col.handle } });
        if (existing) {
          results.collections.skipped++;
        } else {
          await prisma.collection.create({
            data: { handle: col.handle, title: col.title, description: col.description, is_active: true },
          });
          results.collections.imported++;
        }
      } catch {
        results.collections.skipped++;
      }
    }

    // 2. Import Products and link to collections
    for (const prod of PRODUCTS) {
      try {
        const existing = await prisma.product.findUnique({ where: { handle: prod.handle } });
        if (existing) {
          results.products.skipped++;
        } else {
          await prisma.product.create({
            data: { handle: prod.handle, title: prod.title, price: prod.price, is_active: true, inventory: 100 },
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
        }
      } catch (e: any) {
        results.errors.push(prod.handle + ': ' + e.message);
      }
    }

    // 3. Import Pages
    for (const page of PAGES) {
      try {
        const existing = await prisma.page.findUnique({ where: { handle: page.handle } });
        if (existing) {
          results.pages.skipped++;
        } else {
          await prisma.page.create({
            data: { handle: page.handle, title: page.title, content: page.content, excerpt: page.content, is_active: true },
          });
          results.pages.imported++;
        }
      } catch {
        results.pages.skipped++;
      }
    }

    // 4. Import Homepage Sections
    const sectionTypes = [
      'hero', 'brand_story', 'featured_products', 'new_arrivals', 
      'you_re_covered', 'newsletter_signup', 'testimonials'
    ];
    
    for (const sectionKey of sectionTypes) {
      try {
        const navKey = { section_key: sectionKey };
        const existing = await prisma.section.findUnique({ where: navKey as any });
        if (existing) {
          results.sections.skipped++;
        } else {
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
        }
      } catch (e: any) {
        results.errors.push('Section ' + sectionKey + ': ' + e.message);
      }
    }

    // 5. Navigation
    try {
      const navLocation = { location: 'header' };
      const existingNav = await prisma.navigation.findUnique({ where: navLocation as any });
      if (existingNav) {
        results.navigation.skipped++;
      } else {
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
      }
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
        const existing = await prisma.sEO.findUnique({ where: { page: seo.page } });
        if (existing) {
          results.seo.skipped++;
        } else {
          await prisma.sEO.create({ data: seo });
          results.seo.imported++;
        }
      } catch {
        results.seo.skipped++;
      }
    }

    return NextResponse.json({ success: true, results });
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