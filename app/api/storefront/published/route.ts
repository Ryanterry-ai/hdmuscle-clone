import { NextResponse } from 'next/server';

const IMAGE_MAP: Record<string, string[]> = {
  'prohd-whey': ['/prohd_chocolate_front-1cca5974cf27.png'],
  'prehd-essential': ['/prehd-essential-blue-rasberry-eb39ae9ce7f5.png'],
  'pumphd': ['/pumphd-rainbow-strips-ead9f7c7e482.png'],
  'hydrahd': ['/hydrahd-tangerine-us-16303cf76229.png'],
  'stimhd': ['/stimhd_9d7400de-4473-4af8-bd68-902c6689781d-fdd59a2755d1.png'],
  'intrahd': ['/intrahd_watermelon_f38c042d-708c-472a-a828-b329ac7baf6b-ca4066edb12c.png'],
  'sleephd': ['/sleephd_web1-d6d6eabbf104.png'],
  'greenshd': ['/greenshd-citrus-us-b1d785092f3e.jpg'],
  'burnhd': ['/burnhd_front-b81b8d88cde6.png'],
  'creahd': ['/creahd-53c587c6f495.jpg'],
  'multihd': ['/multi-hd-us-web-11980b086482.jpg'],
  'glutahd': ['/glutahd-front-black-lid-0e6436cfe231.jpg'],
  'prehd-elite': ['/prehd-elite_tangerine-can-v2-15e1790f303a.jpg'],
  'eaahd': ['/eaahd_front_unflavored-black-lid-b9e66b2a11b7.png'],
  'collagenhd': ['/collagenhd_front_unflavored-us-6c934157a97a.jpg'],
  'hd-heritage-hoodie': ['/hd-heritage-hoodie-black-front-d19ea4b2ddab.jpg'],
  'hd-archive-hat': ['/hd-archive-hat-2026-black-199357851230.png'],
  'hd-jersey': ['/hd-jersey-black-front-15e6447e1daf.jpg'],
  'hd-gothic-tee': ['/hd-gothic-black-front-2b467fb27e06.png'],
  'hd-performa-shaker': ['/1800x1800-hd-performa-shaker-black-354aba4223e2.png'],
};

const INR_PRICES: Record<string, number> = {
  'prohd-whey': 6639,
  'prehd-essential': 3319,
  'pumphd': 4149,
  'hydrahd': 2489,
  'stimhd': 1493,
  'intrahd': 3485,
  'sleephd': 3319,
  'greenshd': 2987,
  'burnhd': 3485,
  'creahd': 3485,
  'multihd': 2987,
  'glutahd': 1991,
  'prehd-elite': 4979,
  'eaahd': 2987,
  'collagenhd': 3319,
  'hd-heritage-hoodie': 5809,
  'hd-archive-hat': 2904,
  'hd-jersey': 4564,
  'hd-gothic-tee': 3319,
  'hd-performa-shaker': 1244,
};

const PRODUCTS = [
  { id: "1", handle: "prohd-whey", title: "ProHD Whey Protein Isolate", price: 6639, badge: "Best Seller", category: "proteins", description: "Premium whey protein isolate for muscle building. 25g protein per serving." },
  { id: "2", handle: "prehd-essential", title: "PreHD Essential", price: 3319, category: "pre-workouts", description: "Essential pre-workout for energy and focus." },
  { id: "3", handle: "pumphd", title: "PumpHD", price: 4149, badge: "New", category: "pre-workouts", description: "Maximum pump and vascularity." },
  { id: "4", handle: "hydrahd", title: "HydraHD", price: 2489, category: "electrolytes", description: "Advanced hydration formula." },
  { id: "5", handle: "stimhd", title: "StimHD", price: 1493, category: "pre-workouts", description: "Maximum stimulant pre-workout." },
  { id: "6", handle: "intrahd", title: "IntraHD", price: 3485, category: "intra-workouts", description: "Intra-workout energy and endurance." },
  { id: "7", handle: "sleephd", title: "SleepHD", price: 3319, category: "health-wellness", description: "Deep sleep recovery formula." },
  { id: "8", handle: "greenshd", title: "GreensHD", price: 2987, category: "health-wellness", description: "Daily greens and superfoods." },
  { id: "9", handle: "burnhd", title: "BurnHD", price: 3485, category: "fat-burners", description: "Thermogenic fat burner." },
  { id: "10", handle: "creahd", title: "CreaHD", price: 3485, category: "creatine", description: "Creatine monohydrate for strength." },
  { id: "11", handle: "multihd", title: "MultiHD", price: 2987, category: "health-wellness", description: "Daily multivitamin." },
  { id: "12", handle: "glutahd", title: "GlutaHD", price: 1991, category: "recovery", description: "Glutamine for recovery." },
  { id: "13", handle: "prehd-elite", title: "PreHD Elite", price: 4979, badge: "New", category: "pre-workouts", description: "Elite pre-workout formula." },
  { id: "14", handle: "eaahd", title: "EAAHD", price: 2987, category: "bcaas", description: "Essential amino acids." },
  { id: "15", handle: "collagenhd", title: "CollagenHD", price: 3319, category: "health-wellness", description: "Collagen peptides for joints." },
  { id: "16", handle: "hd-heritage-hoodie", title: "HD Heritage Hoodie", price: 5809, badge: "New", category: "apparel", description: "Heavyweight oversized hoodie.", is_apparel: true },
  { id: "17", handle: "hd-archive-hat", title: "HD Archive Hat", price: 2904, category: "apparel", description: "Classic dad cap.", is_apparel: true },
  { id: "18", handle: "hd-jersey", title: "HD Jersey", price: 4564, category: "apparel", description: "Performance jersey.", is_apparel: true },
  { id: "19", handle: "hd-gothic-tee", title: "HD Gothic Tee", price: 3319, category: "apparel", description: "Premium cotton tee.", is_apparel: true },
  { id: "20", handle: "hd-performa-shaker", title: "HD Performa Shaker", price: 1244, category: "accessories", description: "BPA-free shaker bottle.", is_apparel: true },
];

const cmsData = {
  settings: {
    store_name: "HD MUSCLE",
    brand_name: "HD Muscle",
    public_site_url: "https://store.hdmuscle.in",
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
      instagram: "https://instagram.com/hd.muscle",
      facebook: "https://facebook.com/hdmuscle",
      youtube: "https://youtube.com/hdmuscle",
      tiktok: "https://tiktok.com/@hdmuscle"
    },
    footer: {
      copyright_text: "© 2024 HD MUSCLE. All rights reserved.",
      country_options: ["India", "United States", "Canada", "United Kingdom", "Australia"],
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
      subheading: "Premium supplements designed for athletes who demand more.",
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
        { text: "THIS ONE WORKS! Almost works too good! I have never had a sports supplement work so well on my ability to not only fall asleep but literally sleep like a rock.", author: "Whitney L.", stars: 5 },
        { text: "PreHD Ultra is my new gym bag essential, amazing pump, clean/non jittery energy, awesome taste, and properly dosed ingredients!", author: "Greg D.", stars: 5 },
        { text: "All the products are top quality, everything tastes AMAZING!", author: "Christina D.", stars: 5 }
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
        { question: "How long does shipping take?", answer: "Free shipping on orders over ₹9,999. Standard shipping takes 5-7 business days." },
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
  products: PRODUCTS.map(p => ({
    ...p,
    price: p.price.toString(),
    images: (IMAGE_MAP[p.handle] || ['/prohd_chocolate_front-1cca5974cf27.png']).map(url => ({ url })),
    compare_at_price: null,
    short_description: "",
    is_active: true,
    inventory: 100,
    tags: []
  })),
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
    { id: "10", handle: "creatine", title: "Creatine", description: "Creatine monohydrate products." }
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
