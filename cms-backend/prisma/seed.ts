import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hdmuscle.in' },
    update: {},
    create: {
      email: 'admin@hdmuscle.in',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });
  console.log('Created admin user:', admin.email);

  // Create sample products
  const products = [
    {
      handle: 'whey-protein-isolate',
      title: 'Whey Protein Isolate',
      description: 'Premium quality whey protein isolate for muscle building',
      price: 2999,
      compare_at_price: 3499,
      sku: 'WPI-001',
      inventory: 100,
      is_active: true,
      is_featured: true,
    },
    {
      handle: 'creatine-monohydrate',
      title: 'Creatine Monohydrate',
      description: 'Pure creatine monohydrate for strength gains',
      price: 999,
      compare_at_price: 1299,
      sku: 'CRE-001',
      inventory: 200,
      is_active: true,
      is_featured: true,
    },
    {
      handle: 'pre-workout-booster',
      title: 'Pre-Workout Booster',
      description: 'High-caffeine pre-workout for intense workouts',
      price: 1499,
      compare_at_price: 1799,
      sku: 'PWB-001',
      inventory: 150,
      is_active: true,
      is_featured: true,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { handle: product.handle },
      update: {},
      create: product,
    });
  }
  console.log('Created sample products');

  // Create collections
  const collections = [
    { handle: 'proteins', title: 'Proteins', description: 'Protein supplements', is_active: true },
    { handle: 'pre-workouts', title: 'Pre-Workouts', description: 'Pre-workout supplements', is_active: true },
    { handle: 'fat-burners', title: 'Fat Burners', description: 'Fat burning supplements', is_active: true },
    { handle: 'new-arrivals', title: 'New Arrivals', description: 'Latest products', is_active: true },
  ];

  for (const collection of collections) {
    await prisma.collection.upsert({
      where: { handle: collection.handle },
      update: {},
      create: collection,
    });
  }
  console.log('Created sample collections');

  // Create homepage sections
  const sections = [
    {
      section_key: 'hero',
      section_type: 'hero',
      title: 'Hero Banner',
      content: JSON.stringify({
        heading: 'Transform Your Body',
        subheading: 'Premium supplements for serious athletes',
        cta_text: 'Shop Now',
        cta_link: '/collections/all',
        background_image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
      }),
      position: 1,
      status: 'PUBLISHED',
    },
    {
      section_key: 'featured_products',
      section_type: 'featured_products',
      title: 'Featured Products',
      content: JSON.stringify({
        heading: 'Best Sellers',
        subtitle: 'Our most popular products',
        product_handles: ['whey-protein-isolate', 'creatine-monohydrate', 'pre-workout-booster'],
      }),
      position: 2,
      status: 'PUBLISHED',
    },
    {
      section_key: 'newsletter',
      section_type: 'newsletter',
      title: 'Newsletter Signup',
      content: JSON.stringify({
        heading: 'Stay Updated',
        subtitle: 'Subscribe for exclusive deals and fitness tips',
        button_text: 'Subscribe',
      }),
      position: 3,
      status: 'PUBLISHED',
    },
  ];

  for (const section of sections) {
    await prisma.section.upsert({
      where: { section_key: section.section_key },
      update: {},
      create: section,
    });
  }
  console.log('Created homepage sections');

  // Create settings
  const settings = [
    { key: 'store_name', value: 'HD Muscle', description: 'Store name' },
    { key: 'store_email', value: 'support@hdmuscle.in', description: 'Contact email' },
    { key: 'store_phone', value: '+91 98765 43210', description: 'Contact phone' },
    { key: 'store_address', value: 'Mumbai, India', description: 'Store address' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log('Created settings');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
