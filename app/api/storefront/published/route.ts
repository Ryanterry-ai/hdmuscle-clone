import { NextResponse } from 'next/server';

const CMS_API = process.env.CMS_API || 'https://cms.hdmuscle.in/api';

const IMAGE_MAP: Record<string, string[]> = {
  'prohd-isolate': ['/prohd_chocolate_front-1cca5974cf27.png', '/prohd_vanilla_front.png'],
  'prehd-essential': ['/prehd-essential-blue-rasberry-eb39ae9ce7f5.png'],
  'pumphd': ['/pumphd-rainbow-strips-ead9f7c7e482.png'],
  'hydrahd': ['/hydrahd-tangerine-us-16303cf76229.png'],
  'stimhd': ['/stimhd_9d7400de-4473-4af8-bd68-902c6689781d-fdd59a2755d1.png'],
  'intra-hd': ['/intrahd_watermelon_f38c042d-708c-472a-a828-b329ac7baf6b-ca4066edb12c.png'],
  'gluta-hd': ['/glutahd-front-black-lid-0e6436cfe231.jpg'],
  'creahd-creapure': ['/creahd-53c587c6f495.jpg'],
  'sleephd': ['/sleephd_web1-d6d6eabbf104.png'],
  'greenshd': ['/greenshd-citrus-us-b1d785092f3e.jpg'],
  'burn-hd': ['/burnhd_front-b81b8d88cde6.png'],
  'multihd': ['/multi-hd-us-web-11980b086482.jpg'],
  'collagenhd': ['/collagenhd_front_unflavored-us-6c934157a97a.jpg'],
  'vita-hd': ['/vita-hd.png'],
  'd3': ['/d3.png'],
  'omega-3': ['/omega-3.png'],
  'zinc': ['/zinc.png'],
  'magnesium': ['/magnesium.png'],
  'fish-oil': ['/fish-oil.png'],
  'b-complex': ['/b-complex.png'],
  'turmeric': ['/turmeric.png'],
  'ashwagandha': ['/ashwagandha.png'],
  'curcumin': ['/curcumin.png'],
  'citrus-bergamot': ['/citrusbergamot.png'],
  'betaine-hcl': ['/betainehcl.png'],
  'glyco-hd': ['/glycohd_front.png'],
  'liverhd': ['/liverhd.png'],
  'kidneyhd': ['/kidneyhd.png'],
  'electrolytes': ['/electrolytes.png'],
  'eaas': ['/eaas.png'],
  'bcaa': ['/bcaa.png'],
  'carbhd-new-formula': ['/carbhd_strawkiwi-2024-4d9de7e58660.png'],
  'eaa-hd': ['/eaahd_front_unflavored-black-lid-b9e66b2a11b7.png'],
  'euphoria': ['/euphoria.png'],
  'bucked-up': ['/bucked-up.png'],
  'c4-extreme': ['/c4-extreme.png'],
  'prehd-black': ['/prehd-black.png'],
  'whey-hd': ['/whey-hd.png'],
  'casein': ['/casein.png'],
  'protein-pancakes': ['/protein-pancakes.png'],
  'build-bundle': ['/bundle-build.png'],
  'performance-bundle': ['/bundle-performance.png'],
  'value-bundle': ['/bundle-value.png'],
  'family-bundle': ['/bundle-family.png'],
  'hoodie': ['/hd-heritage-hoodie-black-front-d19ea4b2ddab.jpg'],
  'hd-tee': ['/hd-gothic-black-front-2b467fb27e06.png'],
  'cap': ['/hd-archive-hat-2026-black-199357851230.png'],
  'shorts': ['/shorts.png'],
  'tank-top': ['/tank-top.png'],
  'jacket': ['/jacket.png'],
};

function transformToInternalFormat(settingsData: any, productsData: any) {
  const ext = settingsData;
  const products = (productsData?.products || []).map((p: any) => {
    const handle = p.handle || '';
    const cmsImages = p.images && p.images.length > 0 ? p.images : [];
    const fallbackImages = IMAGE_MAP[handle] || [];
    
    return {
      id: p.id?.toString() || '1',
      handle,
      title: p.title || '',
      price: p.price?.toString() || '0',
      compare_at_price: p.compare_at_price?.toString() || null,
      description: p.description || '',
      short_description: p.short_description || '',
      images: cmsImages.length > 0 ? cmsImages : fallbackImages.map(url => ({ url })),
      badge: p.is_featured ? 'Best Seller' : null,
      is_active: p.is_active ?? true,
      inventory: p.inventory ?? 100,
      category: p.collections?.[0]?.collection?.handle || 'supplements',
      tags: [],
      is_apparel: (p.collections?.[0]?.collection?.handle || '').includes('apparel')
    };
  });

  return {
    settings: {
      store_name: ext.site?.name || "HD MUSCLE",
      brand_name: ext.site?.name || "HD Muscle",
      currency: "INR",
      locale: "en-IN",
      symbol: "₹",
      logo_text: "HD MUSCLE",
      announcement_bar: {
        enabled: true,
        text: "FREE SHIPPING ON ORDERS OVER ₹9,999 • 30-DAY MONEY BACK GUARANTEE •",
        link: "/collections/best-selling-collection",
        link_text: "SHOP NOW"
      },
      social_links: {
        instagram: ext.site?.instagramUrl || "https://instagram.com/hd.muscle",
        facebook: ext.site?.facebookUrl || "https://facebook.com/hdmuscle",
        youtube: "https://youtube.com/hdmuscle",
        tiktok: "https://tiktok.com/@hdmuscle"
      },
      footer: {
        copyright_text: ext.site?.copyrightText || "© 2024 HD MUSCLE. All rights reserved.",
        country_options: ["India"],
        default_country: "India"
      },
      contact: {
        email: ext.site?.supportEmail || "support@hdmuscle.com",
        phone: ext.site?.supportPhone || "+91-XXX-XXX-XXXX"
      }
    },
    navigation: {
      header_main: [
        { id: 1, title: "Shop by Goal", type: "megamenu", link: "#", children: [
          { title: "Build Muscle", items: [
            { title: "Protein", link: "/collections/proteins" },
            { title: "Mass Gainers", link: "/collections/mass-gainers" },
            { title: "Creatine", link: "/collections/creatine" },
            { title: "BCAAs", link: "/collections/bcaas" }
          ]},
          { title: "Lose Fat", items: [
            { title: "Fat Burners", link: "/collections/fat-burners" },
            { title: "Thermogenics", link: "/collections/thermogenics" },
            { title: "L-Carnitine", link: "/collections/l-carnitine" }
          ]},
          { title: "Performance", items: [
            { title: "Pre-Workout", link: "/collections/pre-workouts" },
            { title: "Intra-Workout", link: "/collections/intra-workouts" },
            { title: "Electrolytes", link: "/collections/electrolytes" }
          ]}
        ]},
        { id: 2, title: "Supplements", type: "link", link: "/collections/supplements" },
        { id: 3, title: "Bundles", type: "link", link: "/collections/bundles" },
        { id: 4, title: "Apparel", type: "link", link: "/collections/apparel" },
        { id: 5, title: "New", type: "link", link: "/collections/new" }
      ],
      footer_main: [
        { title: "Shop", links: [
          { title: "All Products", link: "/collections/all" },
          { title: "Pre-Workout", link: "/collections/pre-workouts" },
          { title: "Protein", link: "/collections/proteins" },
          { title: "Bundles", link: "/collections/bundles" },
          { title: "Apparel", link: "/collections/apparel" }
        ]},
        { title: "Support", links: [
          { title: "FAQ", link: "/pages/faq" },
          { title: "Shipping Policy", link: "/pages/shipping-policy" },
          { title: "Refund Policy", link: "/pages/refund-policy" },
          { title: "Privacy Policy", link: "/pages/privacy-policy" },
          { title: "Contact Us", link: "/pages/contact" }
        ]},
        { title: "Company", links: [
          { title: "Our Story", link: "/pages/our-story" },
          { title: "Wholesale", link: "/pages/wholesale" },
          { title: "Careers", link: "/pages/careers" },
          { title: "Press", link: "/pages/press" }
        ]}
      ]
    },
    homepage: {
      hero: {
        enabled: true,
        heading: ext.sections?.hero?.heading || "FIND YOUR FORMULA",
        subheading: ext.sections?.hero?.subheading || "Premium supplements designed for athletes who demand more.",
        cta_primary: { text: "Shop Now", link: "#products" },
        cta_secondary: { text: "Learn More", link: "#about" },
        background_image: ext.sections?.hero?.imageUrl || "/hdmuscle72-1775078686011-5c8049f904ea.webp",
        overlay_opacity: 60
      },
      quality_badges: {
        enabled: true,
        badges: [
          { icon: "🧪", text: "Heavy Metals Tested" },
          { icon: "🎨", text: "No Artificial Dyes" },
          { icon: "✅", text: "3rd Party Tested" },
          { icon: "💊", text: "Properly Dosed" },
          { icon: "🏭", text: "FDA Registered Facility" }
        ]
      },
      category_tiles: {
        enabled: true,
        categories: [
          { title: "Health + Wellness", image: "/greenshd-citrus-us-b1d785092f3e.jpg", link: "/collections/health-wellness" },
          { title: "Pre-Workout", image: "/pumphd-rainbow-strips-ead9f7c7e482.png", link: "/collections/pre-workouts" },
          { title: "Intra-Workout", image: "/intrahd_watermelon_f38c042d-708c-472a-a828-b329ac7baf6b-ca4066edb12c.png", link: "/collections/intra-workouts" },
          { title: "Post-Workout", image: "/creahd-53c587c6f495.jpg", link: "/collections/post-workout" }
        ]
      },
      best_sellers: {
        enabled: true,
        title: "Shop Our Best Sellers",
        link: "/collections/best-selling-collection",
        product_handles: ["prohd-whey", "prehd-essential", "pumphd", "hydrahd", "stimhd", "intrahd", "sleephd", "greenshd", "burnhd", "creahd"]
      },
      new_products: {
        enabled: true,
        title: "New + Noteworthy",
        link: "/collections/new-featured",
        product_handles: ["hydrahd", "prehd-essential", "greenshd", "pumphd"]
      },
      brand_story: {
        enabled: true,
        label: "Our Mission",
        heading: "Built By Athletes, For Athletes",
        content: "At HD Muscle, we believe in the power of integrity. Every product we create is designed with one goal in mind: to help you reach your full potential. Integrity is everything.",
        quote: "— The HD Muscle Team",
        image: "/hdmusclebrand2-1775078638960-180ba2bc3e7b.webp"
      },
      testimonials: {
        enabled: true,
        title: "Real People, Real Reviews",
        subtitle: "See what our customers are saying",
        reviews: [
          { text: "THIS ONE WORKS! Almost works too good! I have never had a sports supplement work so well on my ability to not only fall asleep but literally sleep like a complete rock.", author: "Whitney L.", stars: 5 },
          { text: "PreHD Ultra is my new gym bag essential, amazing pump, clean/non jittery energy, awesome taste, and properly dosed ingredients!", author: "Greg D.", stars: 5 },
          { text: "All the products are top quality, everything tastes AMAZING! Your health is an investment, and if you invest in quality products your body will thank you!", author: "Christina D.", stars: 5 }
        ]
      },
      apparel: {
        enabled: true,
        title: "New Arrivals — Apparel + Accessories",
        link: "/collections/apparel",
        product_handles: ["hd-heritage-hoodie", "hd-archive-hat", "hd-jersey", "hd-gothic-tee", "hd-performa-shaker"]
      },
      faq: {
        enabled: true,
        title: "Frequently Asked Questions",
        questions: [
          { question: "How long does shipping take?", answer: "Free shipping on orders over ₹9999. Standard shipping takes 5-7 business days." },
          { question: "What's your return policy?", answer: "We offer a 30-day money-back guarantee on all products." },
          { question: "Are your products GMP certified?", answer: "Yes, all our products are manufactured in FDA-registered GMP certified facilities." },
          { question: "Do you ship internationally?", answer: "Yes, we ship to over 50 countries worldwide." }
        ]
      },
      guarantee: {
        enabled: true,
        heading: "You're Covered",
        text: "30-Day Money Back Guarantee on all orders",
        link: "/pages/shipping-policy"
      },
      newsletter: {
        enabled: true,
        heading: "Stay Updated",
        text: "Subscribe for exclusive offers and new product launches",
        placeholder: "Enter your email",
        button: "Subscribe"
      }
    },
    products,
    collections: [
      { id: "1", handle: "all", title: "All Products", description: "Browse our complete selection." },
      { id: "2", handle: "best-selling-collection", title: "Best Sellers", description: "Our most popular products." },
      { id: "3", handle: "pre-workouts", title: "Pre-Workout", description: "Boost your energy before training." },
      { id: "4", handle: "proteins", title: "Protein", description: "Premium protein supplements." },
      { id: "5", handle: "apparel", title: "Apparel + Accessories", description: "HD Muscle branded apparel." },
      { id: "6", handle: "bundles", title: "Bundles", description: "Save with our product bundles." },
      { id: "7", handle: "health-wellness", title: "Health + Wellness", description: "Daily health supplements." },
      { id: "8", handle: "intra-workouts", title: "Intra-Workout", description: "During workout formulas." },
      { id: "9", handle: "fat-burners", title: "Fat Burners", description: "Thermogenic fat burning supplements." },
      { id: "10", handle: "creatine", title: "Creatine", description: "Creatine monohydrate products." },
      { id: "11", handle: "bcaas", title: "BCAAs", description: "Branched chain amino acids." },
      { id: "12", handle: "new", title: "New Products", description: "New arrivals." }
    ],
    pages: [
      { id: "1", handle: "faq", title: "FAQ", content: "Frequently asked questions about HD Muscle products." },
      { id: "2", handle: "shipping-policy", title: "Shipping Policy", content: "Shipping information and delivery times." },
      { id: "3", handle: "refund-policy", title: "Refund Policy", content: "Our return and refund policy." },
      { id: "4", handle: "privacy-policy", title: "Privacy Policy", content: "How we handle your data." },
      { id: "5", handle: "contact", title: "Contact Us", content: "Get in touch with our team." },
      { id: "6", handle: "our-story", title: "Our Story", content: "The HD Muscle story." }
    ]
  };
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [settingsRes, productsRes] = await Promise.all([
      fetch(`${CMS_API}/storefront/published`, {
        headers: { 'Content-Type': 'application/json', 'Cookie': 'md_session=public' }
      }),
      fetch(`${CMS_API}/products`, {
        headers: { 'Content-Type': 'application/json', 'Cookie': 'md_session=public' }
      })
    ]);
    
    if (!settingsRes.ok || !productsRes.ok) throw new Error('CMS fetch failed');
    
    const settingsData = await settingsRes.json();
    const productsData = await productsRes.json();
    
    return NextResponse.json(transformToInternalFormat(settingsData, productsData));
  } catch {
    return NextResponse.json({ error: 'Failed to fetch CMS' }, { status: 502 });
  }
}
    logo_text: "HD MUSCLE",
    announcement_bar: {
      enabled: true,
      text: "FREE SHIPPING ON ORDERS OVER ₹9999 • 30-DAY MONEY BACK GUARANTEE •",
      link: "/collections/best-selling-collection",
      link_text: "SHOP NOW"
    },
    social_links: {
      instagram: "https://instagram.com/hd.muscle",
      facebook: "https://facebook.com/hdmuscle",
      youtube: "https://youtube.com/hdmuscle",
      tiktok: "https://tiktok.com/@hdmuscle"
    },
    footer: {
      copyright_text: "© 2024 HD MUSCLE. All rights reserved. Integrity is everything.",
      country_options: ["India"],
      default_country: "India"
    },
    contact: {
      email: "support@hdmuscle.com",
      phone: "+91-XXX-XXX-XXXX"
    }
  },
  
  navigation: {
    header_main: [
      { id: 1, title: "Shop by Goal", type: "megamenu", link: "#", children: [
        { title: "Build Muscle", items: [
          { title: "Protein", link: "/collections/proteins" },
          { title: "Mass Gainers", link: "/collections/mass-gainers" },
          { title: "Creatine", link: "/collections/creatine" },
          { title: "BCAAs", link: "/collections/bcaas" }
        ]},
        { title: "Lose Fat", items: [
          { title: "Fat Burners", link: "/collections/fat-burners" },
          { title: "Thermogenics", link: "/collections/thermogenics" },
          { title: "L-Carnitine", link: "/collections/l-carnitine" }
        ]},
        { title: "Performance", items: [
          { title: "Pre-Workout", link: "/collections/pre-workouts" },
          { title: "Intra-Workout", link: "/collections/intra-workouts" },
          { title: "Electrolytes", link: "/collections/electrolytes" }
        ]}
      ]},
      { id: 2, title: "Supplements", type: "link", link: "/collections/supplements" },
      { id: 3, title: "Bundles", type: "link", link: "/collections/bundles" },
      { id: 4, title: "Apparel", type: "link", link: "/collections/apparel" },
      { id: 5, title: "New", type: "link", link: "/collections/new" }
    ],
    footer_main: [
      { title: "Shop", links: [
        { title: "All Products", link: "/collections/all" },
        { title: "Pre-Workout", link: "/collections/pre-workouts" },
        { title: "Protein", link: "/collections/proteins" },
        { title: "Bundles", link: "/collections/bundles" },
        { title: "Apparel", link: "/collections/apparel" }
      ]},
      { title: "Support", links: [
        { title: "FAQ", link: "/pages/faq" },
        { title: "Shipping Policy", link: "/pages/shipping-policy" },
        { title: "Refund Policy", link: "/pages/refund-policy" },
        { title: "Privacy Policy", link: "/pages/privacy-policy" },
        { title: "Contact Us", link: "/pages/contact" }
      ]},
      { title: "Company", links: [
        { title: "Our Story", link: "/pages/our-story" },
        { title: "Wholesale", link: "/pages/wholesale" },
        { title: "Careers", link: "/pages/careers" },
        { title: "Press", link: "/pages/press" }
      ]}
    ]
  },

  homepage: {
    hero: {
      enabled: true,
      heading: "FIND YOUR FORMULA",
      subheading: "Premium Quality Supplements for Athletes",
      cta_primary: { text: "Shop Now", link: "#products" },
      cta_secondary: { text: "Learn More", link: "#about" },
      background_image: "/hdmuscle72-1775078686011-5c8049f904ea.webp",
      overlay_opacity: 60
    },
    quality_badges: {
      enabled: true,
      badges: [
        { icon: "🧪", text: "Heavy Metals Tested" },
        { icon: "🎨", text: "No Artificial Dyes" },
        { icon: "✅", text: "3rd Party Tested" },
        { icon: "💊", text: "Properly Dosed" },
        { icon: "🏭", text: "FDA Registered Facility" }
      ]
    },
    category_tiles: {
      enabled: true,
      categories: [
        { title: "Health + Wellness", image: "/greenshd-citrus-us-b1d785092f3e.jpg", link: "/collections/health-wellness" },
        { title: "Pre-Workout", image: "/pumphd-rainbow-strips-ead9f7c7e482.png", link: "/collections/pre-workouts" },
        { title: "Intra-Workout", image: "/intrahd_watermelon_f38c042d-708c-472a-a828-b329ac7baf6b-ca4066edb12c.png", link: "/collections/intra-workouts" },
        { title: "Post-Workout", image: "/creahd-53c587c6f495.jpg", link: "/collections/post-workout" }
      ]
    },
    best_sellers: {
      enabled: true,
      title: "Shop Our Best Sellers",
      link: "/collections/best-selling-collection",
      product_handles: ["prohd-whey", "prehd-essential", "pumphd", "hydrahd", "stimhd", "intrahd", "sleephd", "greenshd", "burnhd", "creahd"]
    },
    new_products: {
      enabled: true,
      title: "New + Noteworthy",
      link: "/collections/new-featured",
      product_handles: ["prehd-elite", "eaahd", "collagenhd", "multihd", "glutahd"]
    },
    brand_story: {
      enabled: true,
      label: "Our Mission",
      heading: "Built By Athletes, For Athletes",
      content: "At HD Muscle, we believe in the power of integrity. Every product we create is designed with one goal in mind: to help you reach your full potential. Integrity is everything.",
      quote: "— The HD Muscle Team",
      image: "/hdmusclebrand2-1775078638960-180ba2bc3e7b.webp"
    },
    testimonials: {
      enabled: true,
      title: "Real People, Real Reviews",
      subtitle: "See what our customers are saying",
      reviews: [
        { text: "THIS ONE WORKS! Almost works too good! I have never had a sports supplement work so well on my ability to not only fall asleep but literally sleep like a complete rock.", author: "Whitney L.", stars: 5 },
        { text: "PreHD Ultra is my new gym bag essential, amazing pump, clean/non jittery energy, awesome taste, and properly dosed ingredients!", author: "Greg D.", stars: 5 },
        { text: "All the products are top quality, everything tastes AMAZING! Your health is an investment, and if you invest in quality products your body will thank you!", author: "Christina D.", stars: 5 }
      ]
    },
    apparel: {
      enabled: true,
      title: "New Arrivals — Apparel + Accessories",
      link: "/collections/apparel",
      product_handles: ["hd-heritage-hoodie", "hd-archive-hat", "hd-jersey", "hd-gothic-tee", "hd-performa-shaker"]
    },
    faq: {
      enabled: true,
      title: "Frequently Asked Questions",
      questions: [
        { question: "How long does shipping take?", answer: "Free shipping on orders over ₹9999. Standard shipping takes 5-7 business days." },
        { question: "What's your return policy?", answer: "We offer a 30-day money-back guarantee on all products." },
        { question: "Are your products GMP certified?", answer: "Yes, all our products are manufactured in FDA-registered GMP certified facilities." },
        { question: "Do you ship internationally?", answer: "Yes, we ship to over 50 countries worldwide." }
      ]
    },
    guarantee: {
      enabled: true,
      heading: "You're Covered",
      text: "30-Day Money Back Guarantee on all orders",
      link: "/pages/shipping-policy"
    },
    newsletter: {
      enabled: true,
      heading: "Stay Updated",
      text: "Subscribe for exclusive offers and new product launches",
      placeholder: "Enter your email",
      button: "Subscribe"
    }
  },

  products: [
    { id: "1", handle: "prohd-whey", title: "ProHD Whey Protein Isolate", price: "6639", compare_at_price: null, description: "Premium whey protein isolate for muscle building. 25g protein per serving.", short_description: "25g Protein per serving", images: [{ url: "/prohd_chocolate_front-1cca5974cf27.png" }], badge: "Best Seller", is_active: true, inventory: 100, category: "proteins", tags: ["protein", "whey", "muscle-building"] },
    { id: "2", handle: "prehd-essential", title: "PreHD Essential", price: "3319", compare_at_price: null, description: "Essential pre-workout for energy and focus.", short_description: "Energy & Focus", images: [{ url: "/prehd-essential-blue-rasberry-eb39ae9ce7f5.png" }], badge: null, is_active: true, inventory: 100, category: "pre-workouts", tags: ["pre-workout", "energy"] },
    { id: "3", handle: "pumphd", title: "PumpHD", price: "4149", compare_at_price: null, description: "Maximum pump and vascularity.", short_description: "Maximum Pump", images: [{ url: "/pumphd-rainbow-strips-ead9f7c7e482.png" }], badge: "New", is_active: true, inventory: 100, category: "pre-workouts", tags: ["pre-workout", "pump"] },
    { id: "4", handle: "hydrahd", title: "HydraHD", price: "3739", compare_at_price: null, description: "Advanced hydration formula.", short_description: "Advanced Hydration", images: [{ url: "/hydrahd-tangerine-us-16303cf76229.png" }], badge: null, is_active: true, inventory: 100, category: "electrolytes", tags: ["electrolytes", "hydration"] },
    { id: "5", handle: "stimhd", title: "StimHD", price: "4569", compare_at_price: null, description: "Maximum stimulant pre-workout.", short_description: "Maximum Stimulant", images: [{ url: "/stimhd_9d7400de-4473-4af8-bd68-902c6689781d-fdd59a2755d1.png" }], badge: null, is_active: true, inventory: 0, category: "pre-workouts", tags: ["pre-workout", "stimulant"] },
    { id: "6", handle: "intrahd", title: "IntraHD", price: "3319", compare_at_price: null, description: "Intra-workout energy and endurance.", short_description: "Energy & Endurance", images: [{ url: "/intrahd_watermelon_f38c042d-708c-472a-a828-b329ac7baf6b-ca4066edb12c.png" }], badge: null, is_active: true, inventory: 100, category: "intra-workouts", tags: ["intra-workout", "endurance"] },
    { id: "7", handle: "sleephd", title: "SleepHD", price: "4149", compare_at_price: null, description: "Deep sleep recovery formula.", short_description: "Deep Sleep Recovery", images: [{ url: "/sleephd_web1-d6d6eabbf104.png" }], badge: null, is_active: true, inventory: 100, category: "health-wellness", tags: ["sleep", "recovery"] },
    { id: "8", handle: "greenshd", title: "GreensHD", price: "4979", compare_at_price: null, description: "Daily greens and superfoods.", short_description: "Daily Greens", images: [{ url: "/greenshd-citrus-us-b1d785092f3e.jpg" }], badge: null, is_active: true, inventory: 100, category: "health-wellness", tags: ["greens", "superfood"] },
    { id: "9", handle: "burnhd", title: "BurnHD", price: "4149", compare_at_price: null, description: "Thermogenic fat burner.", short_description: "Fat Burner", images: [{ url: "/burnhd_front-b81b8d88cde6.png" }], badge: null, is_active: true, inventory: 100, category: "fat-burners", tags: ["fat-burner", "thermogenic"] },
    { id: "10", handle: "creahd", title: "CreaHD", price: "2904", compare_at_price: null, description: "Creatine monohydrate for strength.", short_description: "Creatine Monohydrate", images: [{ url: "/creahd-53c587c6f495.jpg" }], badge: null, is_active: true, inventory: 100, category: "creatine", tags: ["creatine", "strength"] },
    { id: "11", handle: "multihd", title: "MultiHD", price: "4569", compare_at_price: null, description: "Daily multivitamin.", short_description: "Daily Multivitamin", images: [{ url: "/multi-hd-us-web-11980b086482.jpg" }], badge: null, is_active: true, inventory: 100, category: "health-wellness", tags: ["multivitamin", "daily"] },
    { id: "12", handle: "glutahd", title: "GlutaHD", price: "3739", compare_at_price: null, description: "Glutamine for recovery.", short_description: "Glutamine Recovery", images: [{ url: "/glutahd-front-black-lid-0e6436cfe231.jpg" }], badge: null, is_active: true, inventory: 100, category: "recovery", tags: ["glutamine", "recovery"] },
    { id: "13", handle: "prehd-elite", title: "PreHD Elite", price: "5394", compare_at_price: null, description: "Elite pre-workout formula.", short_description: "Elite Formula", images: [{ url: "/prehd-elite_tangerine-can-v2-15e1790f303a.jpg" }], badge: "New", is_active: true, inventory: 100, category: "pre-workouts", tags: ["pre-workout", "elite"] },
    { id: "14", handle: "eaahd", title: "EAAHD", price: "3739", compare_at_price: null, description: "Essential amino acids.", short_description: "Essential Amino Acids", images: [{ url: "/eaahd_front_unflavored-black-lid-b9e66b2a11b7.png" }], badge: null, is_active: true, inventory: 100, category: "bcaas", tags: ["eaa", "amino acids"] },
    { id: "15", handle: "collagenhd", title: "CollagenHD", price: "4149", compare_at_price: null, description: "Collagen peptides for joints.", short_description: "Joint Support", images: [{ url: "/collagenhd_front_unflavored-us-6c934157a97a.jpg" }], badge: null, is_active: true, inventory: 100, category: "health-wellness", tags: ["collagen", "joints"] },
    { id: "16", handle: "hd-heritage-hoodie", title: "HD Heritage Hoodie", price: "5809", compare_at_price: null, description: "Heavyweight oversized hoodie.", short_description: "Heavyweight Oversized", images: [{ url: "/hd-heritage-hoodie-black-front-d19ea4b2ddab.jpg" }], badge: "New", is_active: true, inventory: 100, category: "apparel", tags: ["hoodie", "apparel"], is_apparel: true },
    { id: "17", handle: "hd-archive-hat", title: "HD Archive Hat", price: "2904", compare_at_price: null, description: "Classic dad cap.", short_description: "Classic Dad Cap", images: [{ url: "/hd-archive-hat-2026-black-199357851230.png" }], badge: null, is_active: true, inventory: 100, category: "apparel", tags: ["hat", "apparel"], is_apparel: true },
    { id: "18", handle: "hd-jersey", title: "HD Jersey", price: "4564", compare_at_price: null, description: "Performance jersey.", short_description: "Performance Jersey", images: [{ url: "/hd-jersey-black-front-15e6447e1daf.jpg" }], badge: null, is_active: true, inventory: 100, category: "apparel", tags: ["jersey", "apparel"], is_apparel: true },
    { id: "19", handle: "hd-gothic-tee", title: "HD Gothic Tee", price: "3319", compare_at_price: null, description: "Premium cotton tee.", short_description: "Premium Cotton", images: [{ url: "/hd-gothic-black-front-2b467fb27e06.png" }], badge: null, is_active: true, inventory: 100, category: "apparel", tags: ["tee", "apparel"], is_apparel: true },
    { id: "20", handle: "hd-performa-shaker", title: "HD Performa Shaker", price: "1244", compare_at_price: null, description: "BPA-free shaker bottle.", short_description: "BPA-Free", images: [{ url: "/1800x1800-hd-performa-shaker-black-354aba4223e2.png" }], badge: null, is_active: true, inventory: 100, category: "accessories", tags: ["shaker", "accessories"], is_apparel: true }
  ],

  collections: [
    { id: "1", handle: "all", title: "All Products", description: "Browse our complete selection of premium supplements." },
    { id: "2", handle: "best-selling-collection", title: "Best Sellers", description: "Our most popular products." },
    { id: "3", handle: "pre-workouts", title: "Pre-Workout", description: "Boost your energy before training." },
    { id: "4", handle: "proteins", title: "Protein", description: "Premium protein supplements." },
    { id: "5", handle: "apparel", title: "Apparel + Accessories", description: "HD Muscle branded apparel." },
    { id: "6", handle: "bundles", title: "Bundles", description: "Save with our product bundles." },
    { id: "7", handle: "health-wellness", title: "Health + Wellness", description: "Daily health supplements." },
    { id: "8", handle: "intra-workouts", title: "Intra-Workout", description: "During workout formulas." },
    { id: "9", handle: "fat-burners", title: "Fat Burners", description: "Thermogenic fat burning supplements." },
    { id: "10", handle: "creatine", title: "Creatine", description: "Creatine monohydrate products." },
    { id: "11", handle: "bcaas", title: "BCAAs", description: "Branched chain amino acids." },
    { id: "12", handle: "new", title: "New Products", description: "New arrivals." },
    { id: "13", handle: "supplements", title: "Supplements", description: "All supplements." },
    { id: "14", handle: "accessories", title: "Accessories", description: "Workout accessories." }
  ],

  pages: [
    { id: "1", handle: "faq", title: "FAQ", content: "Frequently asked questions about HD Muscle products." },
    { id: "2", handle: "shipping-policy", title: "Shipping Policy", content: "Shipping information and delivery times." },
    { id: "3", handle: "refund-policy", title: "Refund Policy", content: "Our return and refund policy." },
    { id: "4", handle: "privacy-policy", title: "Privacy Policy", content: "How we handle your data." },
    { id: "5", handle: "contact", title: "Contact Us", content: "Get in touch with our team." },
    { id: "6", handle: "our-story", title: "Our Story", content: "The HD Muscle story." }
  ]
};

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(cmsData);
}
