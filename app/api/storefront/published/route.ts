import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const PRODUCTS = [
  {
    id: '1',
    handle: 'prohd-whey',
    title: 'ProHD Whey Protein Isolate',
    subtitle: '25g protein per serving',
    price: '6639',
    compareAtPrice: '7469',
    featuredImageUrl: '/prohd_chocolate_front-1cca5974cf27.png',
    badge: 'Best Seller',
    category: 'proteins',
    isActive: true,
    inventory: 18,
  },
  {
    id: '2',
    handle: 'prehd-essential',
    title: 'PreHD Essential',
    subtitle: 'Clean energy + focus',
    price: '3319',
    compareAtPrice: null,
    featuredImageUrl: '/prehd-essential-blue-rasberry-eb39ae9ce7f5.png',
    badge: null,
    category: 'pre-workouts',
    isActive: true,
    inventory: 14,
  },
  {
    id: '3',
    handle: 'pumphd',
    title: 'PumpHD',
    subtitle: 'Maximum pump + performance',
    price: '4149',
    compareAtPrice: null,
    featuredImageUrl: '/pumphd-rainbow-strips-ead9f7c7e482.png',
    badge: 'New',
    category: 'pre-workouts',
    isActive: true,
    inventory: 20,
  },
  {
    id: '4',
    handle: 'hydrahd',
    title: 'HydraHD',
    subtitle: 'Performance hydration',
    price: '2489',
    compareAtPrice: null,
    featuredImageUrl: '/hydrahd-tangerine-us-16303cf76229.png',
    badge: null,
    category: 'electrolytes',
    isActive: true,
    inventory: 21,
  },
  {
    id: '5',
    handle: 'intrahd',
    title: 'IntraHD',
    subtitle: 'Intra-workout endurance',
    price: '3485',
    compareAtPrice: null,
    featuredImageUrl: '/intrahd_watermelon_f38c042d-708c-472a-a828-b329ac7baf6b-ca4066edb12c.png',
    badge: null,
    category: 'intra-workouts',
    isActive: true,
    inventory: 10,
  },
  {
    id: '6',
    handle: 'greenshd',
    title: 'GreensHD',
    subtitle: 'Daily greens + wellness',
    price: '2987',
    compareAtPrice: null,
    featuredImageUrl: '/greenshd-citrus-us-b1d785092f3e.jpg',
    badge: null,
    category: 'health-wellness',
    isActive: true,
    inventory: 12,
  },
  {
    id: '7',
    handle: 'prehd-elite',
    title: 'PreHD Elite',
    subtitle: 'Elite pre-workout formula',
    price: '4979',
    compareAtPrice: null,
    featuredImageUrl: '/prehd-elite_tangerine-can-v2-15e1790f303a.jpg',
    badge: 'New',
    category: 'pre-workouts',
    isActive: true,
    inventory: 17,
  },
  {
    id: '8',
    handle: 'hd-heritage-hoodie',
    title: 'HD Heritage Hoodie',
    subtitle: 'Heavyweight oversized fit',
    price: '5809',
    compareAtPrice: null,
    featuredImageUrl: '/hd-heritage-hoodie-black-front-d19ea4b2ddab.jpg',
    badge: 'New',
    category: 'apparel',
    isActive: true,
    inventory: 9,
  },
  {
    id: '9',
    handle: 'hd-archive-hat',
    title: 'HD Archive Hat',
    subtitle: 'Classic dad cap',
    price: '2904',
    compareAtPrice: null,
    featuredImageUrl: '/hd-archive-hat-2026-black-199357851230.png',
    badge: null,
    category: 'apparel',
    isActive: true,
    inventory: 15,
  },
  {
    id: '10',
    handle: 'hd-gothic-tee',
    title: 'HD Gothic Tee',
    subtitle: 'Premium everyday cotton tee',
    price: '3319',
    compareAtPrice: null,
    featuredImageUrl: '/hd-gothic-black-front-2b467fb27e06.png',
    badge: null,
    category: 'apparel',
    isActive: true,
    inventory: 13,
  },
];

const COLLECTIONS = [
  {
    id: 'c1',
    handle: 'health-wellness',
    title: 'Health + Wellness',
    description: 'Support daily performance, recovery, and long-term wellness.',
    image: '/greenshd-citrus-us-b1d785092f3e.jpg',
  },
  {
    id: 'c2',
    handle: 'pre-workouts',
    title: 'Pre-Workout',
    description: 'Energy, focus, and intensity for every training session.',
    image: '/pumphd-rainbow-strips-ead9f7c7e482.png',
  },
  {
    id: 'c3',
    handle: 'intra-workouts',
    title: 'Intra-Workout',
    description: 'Hydration, endurance, and performance support during training.',
    image: '/intrahd_watermelon_f38c042d-708c-472a-a828-b329ac7baf6b-ca4066edb12c.png',
  },
  {
    id: 'c4',
    handle: 'post-workout',
    title: 'Post-Workout',
    description: 'Recovery-focused formulas to help you perform again tomorrow.',
    image: '/creahd-53c587c6f495.jpg',
  },
  {
    id: 'c5',
    handle: 'apparel',
    title: 'Apparel',
    description: 'Premium HD Muscle apparel and accessories.',
    image: '/hd-heritage-hoodie-black-front-d19ea4b2ddab.jpg',
  },
];

const PAGES = [
  { id: 'p1', handle: 'faq', title: 'FAQ', content: 'Frequently asked questions.' },
  { id: 'p2', handle: 'our-story', title: 'Our Story', content: 'The HD Muscle mission.' },
  { id: 'p3', handle: 'shipping-policy', title: 'Shipping Policy', content: 'Shipping information.' },
  { id: 'p4', handle: 'privacy-policy', title: 'Privacy Policy', content: 'Privacy policy content.' },
  { id: 'p5', handle: 'contact', title: 'Contact', content: 'Contact us.' },
];

const payload = {
  settings: {
    store_name: 'HD MUSCLE',
    brand_name: 'HD Muscle',
    public_site_url: 'https://store.hdmuscle.in',
    currency: 'INR',
    locale: 'en-IN',
    symbol: '₹',
    logo_text: 'HD MUSCLE',
    announcement_bar: {
      enabled: true,
      text: 'FREE SHIPPING ON ORDERS OVER ₹9,999',
      link: '/collections/best-selling-collection',
      link_text: 'SHOP NOW',
    },
    search_suggestions: [
      { label: 'Pre-Workout', link: '/collections/pre-workouts' },
      { label: 'Protein', link: '/collections/proteins' },
      { label: 'Hydration', link: '/collections/electrolytes' },
      { label: 'Best Sellers', link: '/collections/best-selling-collection' },
      { label: 'Apparel', link: '/collections/apparel' },
    ],
    social_links: {
      instagram: 'https://instagram.com/hd.muscle',
      facebook: 'https://facebook.com/hdmuscle',
      youtube: 'https://youtube.com/hdmuscle',
      tiktok: 'https://tiktok.com/@hdmuscle',
    },
    footer: {
      copyright_text: '© 2024 HD MUSCLE. All rights reserved.',
      country_options: ['India', 'United States', 'Canada', 'United Kingdom', 'Australia'],
      default_country: 'India',
      payment_icons: ['Visa', 'Mastercard', 'Amex', 'PayPal'],
    },
    contact: {
      email: 'support@hdmuscle.com',
      phone: '+91-XXX-XXX-XXXX',
    },
  },

  navigation: {
    header_main: [
      {
        id: 1,
        title: 'Shop by Goal',
        type: 'megamenu',
        link: '#',
        promoCard: {
          title: 'Find Your Formula',
          subtitle: 'Premium supplements for every goal.',
          image: '/hdmuscle72-1775078686011-5c8049f904ea.webp',
          link: '/collections/best-selling-collection',
        },
        children: [
          {
            title: 'Build Muscle',
            items: [
              { title: 'Protein', link: '/collections/proteins' },
              { title: 'Mass Gainers', link: '/collections/mass-gainers' },
              { title: 'Creatine', link: '/collections/creatine' },
              { title: 'BCAAs', link: '/collections/bcaas' },
            ],
          },
          {
            title: 'Lose Fat',
            items: [
              { title: 'Fat Burners', link: '/collections/fat-burners' },
              { title: 'Thermogenics', link: '/collections/thermogenics' },
              { title: 'L-Carnitine', link: '/collections/l-carnitine' },
            ],
          },
          {
            title: 'Performance',
            items: [
              { title: 'Pre-Workout', link: '/collections/pre-workouts' },
              { title: 'Intra-Workout', link: '/collections/intra-workouts' },
              { title: 'Electrolytes', link: '/collections/electrolytes' },
            ],
          },
        ],
      },
      { id: 2, title: 'Supplements', type: 'link', link: '/collections/supplements' },
      { id: 3, title: 'Bundles', type: 'link', link: '/collections/bundles' },
      { id: 4, title: 'Apparel', type: 'link', link: '/collections/apparel' },
      { id: 5, title: 'New', type: 'link', link: '/collections/new-featured' },
    ],
    utility_links: [
      { title: 'About', link: '/pages/our-story' },
      { title: 'Join HD Collective', link: '/pages/join' },
      { title: 'FAQ', link: '/pages/faq' },
      { title: 'Log in', link: '/auth' },
    ],
    footer_main: [
      {
        title: 'Shop',
        links: [
          { title: 'All Products', link: '/collections/all' },
          { title: 'Pre-Workout', link: '/collections/pre-workouts' },
          { title: 'Protein', link: '/collections/proteins' },
          { title: 'Bundles', link: '/collections/bundles' },
          { title: 'Apparel', link: '/collections/apparel' },
        ],
      },
      {
        title: 'Support',
        links: [
          { title: 'FAQ', link: '/pages/faq' },
          { title: 'Shipping Policy', link: '/pages/shipping-policy' },
          { title: 'Refund Policy', link: '/pages/refund-policy' },
          { title: 'Privacy Policy', link: '/pages/privacy-policy' },
          { title: 'Contact Us', link: '/pages/contact' },
        ],
      },
      {
        title: 'Company',
        links: [
          { title: 'Our Story', link: '/pages/our-story' },
          { title: 'Wholesale', link: '/pages/wholesale' },
          { title: 'Careers', link: '/pages/careers' },
          { title: 'Press', link: '/pages/press' },
        ],
      },
      {
        title: 'Legal',
        links: [
          { title: 'Terms of Service', link: '/pages/terms-of-service' },
          { title: 'Privacy Policy', link: '/pages/privacy-policy' },
        ],
      },
    ],
  },

  homepage: {
    sections: [
      {
        type: 'hero',
        id: 'hero-1',
        heading: 'FIND YOUR FORMULA',
        subheading: 'Premium supplements designed for athletes who demand more.',
        ctaLabel: 'Shop All — Supplements',
        ctaUrl: '/collections/best-selling-collection',
        backgroundImage: '/hdmuscle72-1775078686011-5c8049f904ea.webp',
      },
      {
        type: 'quality_badges',
        id: 'quality-1',
        badges: [
          { icon: '🧪', text: 'Heavy Metals Tested' },
          { icon: '🎨', text: 'No Artificial Dyes' },
          { icon: '✅', text: '3rd Party Tested' },
          { icon: '💊', text: 'Properly Dosed' },
          { icon: '🏭', text: 'FDA Registered Facility' },
        ],
      },
      {
        type: 'category_tiles',
        id: 'categories-1',
        title: 'Shop by Goal',
        items: [
          { title: 'Health + Wellness', image: '/greenshd-citrus-us-b1d785092f3e.jpg', url: '/collections/health-wellness' },
          { title: 'Pre-Workout', image: '/pumphd-rainbow-strips-ead9f7c7e482.png', url: '/collections/pre-workouts' },
          { title: 'Intra-Workout', image: '/intrahd_watermelon_f38c042d-708c-472a-a828-b329ac7baf6b-ca4066edb12c.png', url: '/collections/intra-workouts' },
          { title: 'Post-Workout', image: '/creahd-53c587c6f495.jpg', url: '/collections/post-workout' },
        ],
      },
      {
        type: 'featured_products',
        id: 'best-sellers-1',
        title: 'Shop Our Best Sellers',
        productHandles: ['prohd-whey', 'prehd-essential', 'pumphd', 'hydrahd', 'intrahd', 'greenshd'],
      },
      {
        type: 'featured_products',
        id: 'new-products-1',
        title: 'New + Noteworthy',
        productHandles: ['prehd-elite', 'hd-heritage-hoodie', 'hd-archive-hat', 'hd-gothic-tee'],
      },
      {
        type: 'brand_story',
        id: 'brand-story-1',
        heading: 'Built By Athletes, For Athletes',
        body: 'At HD Muscle, we believe in the power of integrity. Every product we create is designed with one goal in mind: to help you reach your full potential.',
        quote: '— The HD Muscle Team',
        image: '/hdmusclebrand2-1775078638960-180ba2bc3e7b.webp',
      },
      {
        type: 'testimonials',
        id: 'testimonials-1',
        title: 'Real People, Real Reviews',
        subtitle: 'See what our customers are saying',
        items: [
          { text: 'THIS ONE WORKS! I have never had a sports supplement work so well on my ability to sleep like a rock.', author: 'Whitney L.', stars: 5 },
          { text: 'PreHD Ultra is my new gym bag essential. Amazing pump, clean energy, awesome taste.', author: 'Greg D.', stars: 5 },
          { text: 'All the products are top quality. Everything tastes amazing.', author: 'Christina D.', stars: 5 },
        ],
      },
      {
        type: 'featured_products',
        id: 'apparel-1',
        title: 'New Arrivals — Apparel + Accessories',
        productHandles: ['hd-heritage-hoodie', 'hd-archive-hat', 'hd-gothic-tee'],
      },
      {
        type: 'faq',
        id: 'faq-1',
        title: 'Frequently Asked Questions',
        questions: [
          { question: 'How long does shipping take?', answer: 'Free shipping on orders over ₹9,999. Standard shipping takes 5-7 business days.' },
          { question: "What's your return policy?", answer: 'We offer a 30-day money-back guarantee on all products.' },
          { question: 'Are your products GMP certified?', answer: 'Yes, all products are manufactured in FDA-registered GMP-certified facilities.' },
        ],
      },
      {
        type: 'guarantee',
        id: 'guarantee-1',
        heading: "You're Covered",
        text: '30-Day Money Back Guarantee on all orders.',
        link: '/pages/shipping-policy',
      },
      {
        type: 'newsletter',
        id: 'newsletter-1',
        heading: 'Stay Updated',
        text: 'Subscribe for exclusive offers and new product launches.',
        placeholder: 'Enter your email',
        button: 'Subscribe',
      },
    ],
  },

  productContent: [
    {
      handle: 'prohd-whey',
      blocks: [
        {
          type: 'benefits',
          title: 'Why ProHD Whey',
          items: [
            '25g isolate protein per serving',
            'Fast-digesting recovery support',
            'Built for lean muscle growth',
          ],
        },
        {
          type: 'stats',
          items: [
            { label: 'Protein', value: '25g' },
            { label: 'Sugar', value: '0g' },
            { label: 'BCAAs', value: '5.5g' },
            { label: 'Servings', value: '30' },
          ],
        },
        {
          type: 'story',
          title: 'Behind the Formula',
          body: 'Built to deliver premium isolate protein with a clean profile, great taste, and high-performance recovery support.',
          image: '/prohd_chocolate_front-1cca5974cf27.png',
        },
      ],
    },
  ],

  products: PRODUCTS,
  collections: COLLECTIONS,
  pages: PAGES,
};

export async function GET() {
  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}