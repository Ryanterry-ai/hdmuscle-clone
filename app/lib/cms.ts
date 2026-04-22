export type CMSData = {
  settings: any;
  navigation: {
    header_main: any[];
    utility_links: any[];
    footer_main: any[];
  };
  homepage: {
    sections: any[];
  };
  products: any[];
  collections: any[];
};

const FALLBACK_DATA: CMSData = {
  settings: {
    logo_text: 'HDMUSCLE',
    currency: 'INR',
    locale: 'en-IN',
    announcement_bar: {
      enabled: true,
      text: 'FREE SHIPPING ON ORDERS ABOVE ₹1999',
      link: '/collections/all',
      link_text: 'Shop Now',
    },
    social_links: {
      instagram: 'https://www.instagram.com/',
      facebook: 'https://www.facebook.com/',
      youtube: 'https://www.youtube.com/',
      tiktok: '',
    },
    footer: {
      default_country: 'India',
      country_options: ['India'],
      payment_icons: ['VISA', 'MASTERCARD', 'UPI'],
      copyright_text: '© 2026 HD MUSCLE. All rights reserved.',
    },
  },

  navigation: {
    utility_links: [
      { title: 'Authentic Products', link: '/' },
      { title: 'Fast Delivery', link: '/' },
      { title: 'Premium Quality', link: '/' },
    ],
    header_main: [
      {
        id: 'shop-by-goal',
        title: 'Shop by Goal',
        link: '/collections/shop-by-goal',
        type: 'megamenu',
        children: [
          {
            title: 'Goals',
            items: [
              { title: 'Muscle Gain', link: '/collections/muscle-gain' },
              { title: 'Fat Loss', link: '/collections/fat-loss' },
              { title: 'Strength', link: '/collections/strength' },
              { title: 'Recovery', link: '/collections/recovery' },
            ],
          },
          {
            title: 'Popular',
            items: [
              { title: 'Whey Protein', link: '/collections/whey-protein' },
              { title: 'Pre Workout', link: '/collections/pre-workout' },
              { title: 'Creatine', link: '/collections/creatine' },
            ],
          },
        ],
        promoCard: {
          title: 'Build Muscle Faster',
          subtitle: 'Shop best sellers',
          link: '/collections/all',
          image:
            'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
        },
      },
      {
        id: 'supplements',
        title: 'Supplements',
        link: '/collections/supplements',
        type: 'megamenu',
        children: [
          {
            title: 'Categories',
            items: [
              { title: 'Protein', link: '/collections/protein' },
              { title: 'Mass Gainers', link: '/collections/mass-gainers' },
              { title: 'Pre Workout', link: '/collections/pre-workout' },
              { title: 'Amino Acids', link: '/collections/amino-acids' },
            ],
          },
        ],
      },
      {
        id: 'bundles',
        title: 'Bundles',
        link: '/collections/bundles',
        type: 'link',
      },
      {
        id: 'apparel',
        title: 'Apparel',
        link: '/collections/apparel',
        type: 'link',
      },
      {
        id: 'new',
        title: 'New',
        link: '/collections/new',
        type: 'link',
      },
    ],
    footer_main: [
      {
        title: 'Shop',
        links: [
          { title: 'All Products', link: '/collections/all' },
          { title: 'Best Sellers', link: '/collections/best-sellers' },
          { title: 'New Arrivals', link: '/collections/new' },
        ],
      },
      {
        title: 'Support',
        links: [
          { title: 'Contact Us', link: '/pages/contact' },
          { title: 'Shipping Policy', link: '/pages/shipping-policy' },
          { title: 'Refund Policy', link: '/pages/refund-policy' },
        ],
      },
      {
        title: 'Company',
        links: [
          { title: 'About Us', link: '/pages/about' },
          { title: 'Privacy Policy', link: '/pages/privacy-policy' },
          { title: 'Terms of Service', link: '/pages/terms' },
        ],
      },
    ],
  },

  homepage: {
    sections: [
      {
        id: 'hero-1',
        type: 'hero',
        eyebrow: 'Premium Quality Supplements',
        heading: 'HD MUSCLE',
        subheading:
          'Trusted sports nutrition for muscle gain, strength, endurance, and recovery.',
        ctaLabel: 'Shop Now',
        ctaUrl: '/collections/all',
        backgroundImage:
          'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80',
      },
      {
        id: 'badges-1',
        type: 'quality_badges',
        badges: [
          { icon: '✓', text: 'Authentic Products' },
          { icon: '✓', text: 'Fast Shipping' },
          { icon: '✓', text: 'Premium Quality' },
          { icon: '✓', text: 'Trusted By Athletes' },
        ],
      },
      {
        id: 'categories-1',
        type: 'category_tiles',
        title: 'Shop By Category',
        items: [
          {
            title: 'Whey Protein',
            url: '/collections/whey-protein',
            image:
              'https://images.unsplash.com/photo-1579722821273-0f6c0b6f6f3d?auto=format&fit=crop&w=1200&q=80',
          },
          {
            title: 'Pre Workout',
            url: '/collections/pre-workout',
            image:
              'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
          },
          {
            title: 'Mass Gainers',
            url: '/collections/mass-gainers',
            image:
              'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=1200&q=80',
          },
          {
            title: 'Creatine',
            url: '/collections/creatine',
            image:
              'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&w=1200&q=80',
          },
        ],
      },
      {
        id: 'products-1',
        type: 'featured_products',
        title: 'Best Sellers',
        productHandles: [
          'whey-protein',
          'pre-workout',
          'mass-gainer',
          'creatine-monohydrate',
        ],
      },
      {
        id: 'story-1',
        type: 'brand_story',
        heading: 'Built for serious performance',
        body:
          'HD Muscle delivers premium supplements designed to support strength, performance, and recovery for athletes and fitness enthusiasts.',
        quote: 'Premium quality. Real performance.',
        image:
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1400&q=80',
      },
      {
        id: 'testimonials-1',
        type: 'testimonials',
        title: 'Customer Reviews',
        subtitle: 'What athletes are saying',
        items: [
          { author: 'Rahul', text: 'Great quality and fast recovery support.', stars: 5 },
          { author: 'Aman', text: 'Best pre-workout I have used so far.', stars: 5 },
          { author: 'Vikram', text: 'Solid results and good taste.', stars: 5 },
        ],
      },
      {
        id: 'faq-1',
        type: 'faq',
        title: 'Frequently Asked Questions',
        questions: [
          {
            question: 'Are HD Muscle products authentic?',
            answer: 'Yes, all products are quality checked and sold through trusted channels.',
          },
          {
            question: 'How long does shipping take?',
            answer: 'Shipping timelines vary by location, but most orders are delivered quickly.',
          },
          {
            question: 'Which supplement should I start with?',
            answer: 'That depends on your goal. Protein, creatine, and pre-workout are common starting points.',
          },
        ],
      },
      {
        id: 'guarantee-1',
        type: 'guarantee',
        heading: 'Results you can trust',
        text:
          'Premium ingredients, consistent quality, and supplements designed for serious athletes.',
        link: '/pages/about',
      },
      {
        id: 'newsletter-1',
        type: 'newsletter',
        heading: 'Join our newsletter',
        text: 'Get product drops, offers, and training updates.',
        placeholder: 'Enter your email',
        button: 'Subscribe',
      },
    ],
  },

  products: [
    {
      id: 'prod-1',
      handle: 'whey-protein',
      title: 'Whey Protein',
      category: 'Protein',
      shortDescription: 'High-quality whey protein for lean muscle support.',
      description:
        'High-quality whey protein for lean muscle support with premium ingredients and strong recovery performance.',
      price: 2499,
      compareAtPrice: 2999,
      badge: 'Best Seller',
      featuredImageUrl:
        'https://images.unsplash.com/photo-1579722821273-0f6c0b6f6f3d?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1579722821273-0f6c0b6f6f3d?auto=format&fit=crop&w=1200&q=80',
      ],
      content: {
        overview: 'Premium whey isolate formula designed for strength and lean muscle goals.',
        benefits: [
          'Supports muscle recovery',
          'High protein per serving',
          'Low sugar formula',
        ],
        usage: 'Mix one scoop with water or milk after workout.',
      },
    },
    {
      id: 'prod-2',
      handle: 'pre-workout',
      title: 'Pre Workout',
      category: 'Performance',
      shortDescription: 'Energy, focus, and pump for intense training sessions.',
      description:
        'A pre-workout blend built for energy, performance, focus, and stronger training intensity.',
      price: 1899,
      compareAtPrice: 2199,
      badge: 'Popular',
      featuredImageUrl:
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
      ],
      content: {
        overview: 'Stim-focused formula for explosive workouts and sharper concentration.',
        benefits: [
          'Boosts energy',
          'Improves focus',
          'Supports workout performance',
        ],
        usage: 'Take one serving 20–30 minutes before exercise.',
      },
    },
    {
      id: 'prod-3',
      handle: 'mass-gainer',
      title: 'Mass Gainer',
      category: 'Muscle Gain',
      shortDescription: 'Calorie-dense formula for size and strength goals.',
      description:
        'Calorie-rich mass gainer designed for serious size, strength, and recovery support.',
      price: 3299,
      compareAtPrice: 3699,
      badge: 'Top Rated',
      featuredImageUrl:
        'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=1200&q=80',
      ],
      content: {
        overview: 'High-calorie formula created for lean mass and faster recovery.',
        benefits: [
          'Supports bulking',
          'High calorie intake',
          'Aids recovery',
        ],
        usage: 'Use between meals or post-workout.',
      },
    },
    {
      id: 'prod-4',
      handle: 'creatine-monohydrate',
      title: 'Creatine Monohydrate',
      category: 'Strength',
      shortDescription: 'Pure creatine support for strength and power output.',
      description:
        'Pure creatine monohydrate for strength, power, and repeated high-intensity performance.',
      price: 999,
      compareAtPrice: 1299,
      badge: 'Essential',
      featuredImageUrl:
        'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&w=1200&q=80',
      ],
      content: {
        overview: 'Classic creatine support for power, ATP production, and gym performance.',
        benefits: [
          'Supports strength',
          'Improves power output',
          'Well-researched ingredient',
        ],
        usage: 'Take daily with water.',
      },
    },
  ],

  collections: [
    {
      id: 'col-1',
      handle: 'whey-protein',
      title: 'Whey Protein',
      image:
        'https://images.unsplash.com/photo-1579722821273-0f6c0b6f6f3d?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'col-2',
      handle: 'pre-workout',
      title: 'Pre Workout',
      image:
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'col-3',
      handle: 'mass-gainers',
      title: 'Mass Gainers',
      image:
        'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'col-4',
      handle: 'creatine',
      title: 'Creatine',
      image:
        'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&w=1200&q=80',
    },
  ],
};

function isObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeCmsData(base: CMSData, incoming: Partial<CMSData> | null | undefined): CMSData {
  if (!incoming || !isObject(incoming)) return base;

  return {
    settings: isObject(incoming.settings) ? { ...base.settings, ...incoming.settings } : base.settings,
    navigation: {
      header_main: Array.isArray(incoming.navigation?.header_main)
        ? incoming.navigation!.header_main
        : base.navigation.header_main,
      utility_links: Array.isArray(incoming.navigation?.utility_links)
        ? incoming.navigation!.utility_links
        : base.navigation.utility_links,
      footer_main: Array.isArray(incoming.navigation?.footer_main)
        ? incoming.navigation!.footer_main
        : base.navigation.footer_main,
    },
    homepage: {
      sections: Array.isArray(incoming.homepage?.sections)
        ? incoming.homepage!.sections
        : base.homepage.sections,
    },
    products: Array.isArray(incoming.products) ? incoming.products : base.products,
    collections: Array.isArray(incoming.collections) ? incoming.collections : base.collections,
  };
}

async function tryFetchJson(url: string): Promise<any | null> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchStorefrontPayload(_forceFresh = false): Promise<CMSData> {
  const candidates = [
    '/api/storefront',
    '/api/cms',
    '/api/storefront-payload',
    '/data/storefront.json',
  ];

  for (const url of candidates) {
    const result = await tryFetchJson(url);
    if (result) {
      return mergeCmsData(FALLBACK_DATA, result);
    }
  }

  return FALLBACK_DATA;
}

export function getHomepage(data: CMSData) {
  return data?.homepage || { sections: [] };
}

export function getProducts(data: CMSData) {
  return Array.isArray(data?.products) ? data.products : [];
}

export function getCollections(data: CMSData) {
  return Array.isArray(data?.collections) ? data.collections : [];
}

export function getSettings(data: CMSData) {
  return data?.settings || FALLBACK_DATA.settings;
}

export function getProductByHandle(data: CMSData, handle: string) {
  const products = getProducts(data);
  return products.find((product: any) => product?.handle === handle) || null;
}

export function getProductContent(data: CMSData, handle: string) {
  const product = getProductByHandle(data, handle);
  return product?.content || null;
}

export function formatMoney(
  amount: number | string,
  currency = 'INR',
  locale = 'en-IN'
) {
  const numericAmount =
    typeof amount === 'number' ? amount : Number(amount || 0);

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(numericAmount);
  } catch {
    return `₹${numericAmount}`;
  }
}