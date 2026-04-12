export interface Product {
  id: number;
  name: string;
  handle: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  images: string[];
  category: string;
  status: string;
  flavors: string[];
  weight: string;
  servings: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: "PreHD Essential",
    handle: "prehd-essential",
    description: "Essential pre-workout for daily energy and focus. Balanced formula for consistent performance.",
    price: 29.99,
    compareAtPrice: null,
    image: "/images/downloaded/product-prehd-essential.png",
    images: [
      "/images/downloaded/product-prehd-essential.png",
      "/images/downloaded/product-prehd-essential-facts.png"
    ],
    category: "Pre-workouts",
    status: "active",
    flavors: ["Blue Raspberry", "Watermelon", "Pineapple"],
    weight: "30 servings",
    servings: "30",
  },
  {
    id: 2,
    name: "PreHD Ultra",
    handle: "pre-hd-ultra",
    description: "Elevated focus and endurance for intense training sessions.",
    price: 45.99,
    compareAtPrice: null,
    image: "https://hdmuscle.com/cdn/shop/files/Ultra_PeachRings_WhiteLid_1.png?v=1758833383&width=1280",
    images: [
      "https://hdmuscle.com/cdn/shop/files/Ultra_PeachRings_WhiteLid_1.png?v=1758833383&width=1280",
      "https://hdmuscle.com/cdn/shop/files/Ultra_PeachRings.jpg?v=1758833383&width=1280"
    ],
    category: "Pre-workouts",
    status: "active",
    flavors: ["Sour Gummies", "Peach Rings"],
    weight: "30 servings",
    servings: "30",
  },
  {
    id: 3,
    name: "PreHD Elite",
    handle: "pre-hd-elite",
    description: "Stim-free pre-workout for maximum pump and endurance without caffeine.",
    price: 45.99,
    compareAtPrice: null,
    image: "https://hdmuscle.com/cdn/shop/files/Non-Stim-ELITE-PL.png?v=1755483444&width=1280",
    images: [
      "https://hdmuscle.com/cdn/shop/files/Non-Stim-ELITE-PL.png?v=1755483444&width=1280",
      "https://hdmuscle.com/cdn/shop/files/Elite_PinkLemon.jpg?v=1762384547&width=1280"
    ],
    category: "Pre-workouts",
    status: "active",
    flavors: ["Tangerine", "Pink Lemonade", "Berry Blast"],
    weight: "30 servings",
    servings: "30",
  },
  {
    id: 4,
    name: "PreHD Black",
    handle: "pre-hd-black",
    description: "Harder-hitting, high-stim formula for maximum intensity.",
    price: 38.99,
    compareAtPrice: null,
    image: "https://hdmuscle.com/cdn/shop/files/SourGrape.png?v=1750958309&width=1280",
    images: [
      "https://hdmuscle.com/cdn/shop/files/SourGrape.png?v=1750958309&width=1280",
      "https://hdmuscle.com/cdn/shop/files/Black_SourGrape.jpg?v=1762384476&width=1280"
    ],
    category: "Pre-workouts",
    status: "sold-out",
    flavors: ["Strawberry Mango", "Sour Grape", "Lychee"],
    weight: "30 servings",
    servings: "30",
  },
  {
    id: 5,
    name: "PumpHD",
    handle: "pumphd",
    description: "Maximum pump, performance, and focus — with zero caffeine. Perfect for late-night training.",
    price: 59.99,
    compareAtPrice: null,
    image: "https://hdmuscle.com/cdn/shop/files/PumpHD-Rainbow-Strips.png?v=1757610060&width=1280",
    images: [
      "https://hdmuscle.com/cdn/shop/files/PumpHD-Rainbow-Strips.png?v=1757610060&width=1280",
      "https://hdmuscle.com/cdn/shop/files/PumpHD-Supp-Facts-Rainbow-Strips.png?v=1764211420&width=1280"
    ],
    category: "Pre-workouts",
    status: "sold-out",
    flavors: ["Rainbow Strips"],
    weight: "30 servings",
    servings: "30",
  },
  {
    id: 6,
    name: "StimHD",
    handle: "stimhd",
    description: "The caffeine add-on. Control your caffeine. Add to any stim-free pre-workout.",
    price: 16.49,
    compareAtPrice: null,
    image: "https://hdmuscle.com/cdn/shop/files/StimHD_9d7400de-4473-4af8-bd68-902c6689781d.png?v=1759273225&width=1280",
    images: [
      "https://hdmuscle.com/cdn/shop/files/StimHD_9d7400de-4473-4af8-bd68-902c6689781d.png?v=1759273225&width=1280",
      "https://hdmuscle.com/cdn/shop/files/StimHD-Supp-Facts.png?v=1759273225&width=1280"
    ],
    category: "Pre-workouts",
    status: "active",
    flavors: ["Default Title"],
    weight: "30 servings",
    servings: "30",
  },
  {
    id: 7,
    name: "IntraHD",
    handle: "intra-hd",
    description: "Intra-workout fuel for sustained energy and hydration during training.",
    price: 42.99,
    compareAtPrice: null,
    image: "https://hdmuscle.com/cdn/shop/files/IntraHD_Watermelon_f38c042d-708c-472a-a828-b329ac7baf6b.png?v=1742929990&width=1280",
    images: [
      "https://hdmuscle.com/cdn/shop/files/IntraHD_Watermelon_f38c042d-708c-472a-a828-b329ac7baf6b.png?v=1742929990&width=1280",
      "https://hdmuscle.com/cdn/shop/files/Intra_Watermelon.jpg?v=1758833409&width=1280"
    ],
    category: "Intra-workouts",
    status: "active",
    flavors: ["Grapefruit", "Watermelon", "Raspberry Lemonade"],
    weight: "30 servings",
    servings: "30",
  },
  {
    id: 8,
    name: "EaaHD",
    handle: "eaa-hd",
    description: "Essential Amino Acids for muscle recovery and hydration.",
    price: 38.99,
    compareAtPrice: null,
    image: "https://hdmuscle.com/cdn/shop/files/EaaHD_FRONT_Peach-Black-Lid.png?v=1751895371&width=1280",
    images: [
      "https://hdmuscle.com/cdn/shop/files/EaaHD_FRONT_Peach-Black-Lid.png?v=1751895371&width=1280",
      "https://hdmuscle.com/cdn/shop/files/EAA_Peach.jpg?v=1764211420&width=1280"
    ],
    category: "Intra-workouts",
    status: "active",
    flavors: ["Peach", "Unflavored"],
    weight: "30 servings",
    servings: "30",
  },
  {
    id: 9,
    name: "CreaHD (Creapure®)",
    handle: "creahd-creapure",
    description: "Ultra-pure creatine monohydrate from Creapure® for strength and power.",
    price: 42.99,
    compareAtPrice: null,
    image: "https://hdmuscle.com/cdn/shop/files/CreaHD_Transparent.png?v=1772313991&width=1280",
    images: [
      "https://hdmuscle.com/cdn/shop/files/CreaHD_Transparent.png?v=1772313991&width=1280",
      "https://hdmuscle.com/cdn/shop/files/CreaHD.jpg?v=1772313991&width=1280"
    ],
    category: "Intra-workouts",
    status: "sold-out",
    flavors: ["Unflavored"],
    weight: "300g",
    servings: "60",
  },
  {
    id: 10,
    name: "CarbHD",
    handle: "carbhd-new-formula",
    description: "Advanced carb complex for energy and glycogen replenishment.",
    price: 49.99,
    compareAtPrice: null,
    image: "https://hdmuscle.com/cdn/shop/files/CarbHD_StrawKiwi-2024.png?v=1744342576&width=1280",
    images: [
      "https://hdmuscle.com/cdn/shop/files/CarbHD_StrawKiwi-2024.png?v=1744342576&width=1280",
      "https://hdmuscle.com/cdn/shop/files/Carb_StrawKiwi.jpg?v=1762382894&width=1280"
    ],
    category: "Intra-workouts",
    status: "active",
    flavors: ["Strawberry Kiwi", "Unflavored", "Pineapple Breeze"],
    weight: "908g",
    servings: "30",
  },
  {
    id: 11,
    name: "HydraHD",
    handle: "hydrahd",
    description: "Electrolyte hydration formula for optimal performance.",
    price: 29.99,
    compareAtPrice: null,
    image: "https://hdmuscle.com/cdn/shop/files/HydraHD-Tangerine-US.png?v=1771000697&width=1280",
    images: [
      "https://hdmuscle.com/cdn/shop/files/HydraHD-Tangerine-US.png?v=1771000697&width=1280",
      "https://hdmuscle.com/cdn/shop/files/HydraHD-Supp-Facts-Tangerine.png?v=1771000697&width=1280"
    ],
    category: "Intra-workouts",
    status: "active",
    flavors: ["Tangerine", "Citrus"],
    weight: "30 servings",
    servings: "30",
  },
  {
    id: 12,
    name: "GlutaHD",
    handle: "gluta-hd",
    description: "Glutamine complex for recovery and immune support.",
    price: 22.99,
    compareAtPrice: null,
    image: "https://hdmuscle.com/cdn/shop/files/GlutaHD-FRONT-Black-Lid.jpg?v=1755223771&width=1280",
    images: [
      "https://hdmuscle.com/cdn/shop/files/GlutaHD-FRONT-Black-Lid.jpg?v=1755223771&width=1280",
      "https://hdmuscle.com/cdn/shop/products/Gluta_HD.jpg?v=1758833426&width=1280"
    ],
    category: "Intra-workouts",
    status: "active",
    flavors: ["Default Title"],
    weight: "30 servings",
    servings: "30",
  },
  {
    id: 13,
    name: "ProHD Isolate",
    handle: "prohd-isolate",
    description: "Premium isolate protein for muscle building and recovery.",
    price: 54.22,
    compareAtPrice: 99.99,
    image: "https://hdmuscle.com/cdn/shop/files/ProHD_Front_Transparent.png?v=1761919615&width=1280",
    images: [
      "https://hdmuscle.com/cdn/shop/files/ProHD_Front_Transparent.png?v=1761919615&width=1280"
    ],
    category: "Proteins",
    status: "active",
    flavors: ["Chocolate", "Vanilla", "Maple Waffle", "Sweet Cream Cold Brew", "Chocolate Peanut Butter", "Caramel Brownie"],
    weight: "4.4LB",
    servings: "31",
  },
  {
    id: 14,
    name: "SleepHD",
    handle: "sleephd",
    description: "Advanced sleep support for recovery and rest.",
    price: 34.99,
    compareAtPrice: null,
    image: "https://hdmuscle.com/cdn/shop/files/SleepHD_Web1.png?v=1695445093&width=1280",
    images: [
      "https://hdmuscle.com/cdn/shop/files/SleepHD_Web1.png?v=1695445093&width=1280"
    ],
    category: "Health + Wellness",
    status: "active",
    flavors: ["Default Title"],
    weight: "60 capsules",
    servings: "30",
  },
  {
    id: 15,
    name: "Omega3",
    handle: "omega-3",
    description: "Triple strength fish oil for heart and brain health.",
    price: 24.99,
    compareAtPrice: null,
    image: "https://hdmuscle.com/cdn/shop/files/Omega3_Front.png?v=1714392098&width=1280",
    images: [
      "https://hdmuscle.com/cdn/shop/files/Omega3_Front.png?v=1714392098&width=1280"
    ],
    category: "Health + Wellness",
    status: "active",
    flavors: ["Default Title"],
    weight: "90 softgels",
    servings: "30",
  },
  {
    id: 16,
    name: "D3",
    handle: "d3",
    description: "Vitamin D3 for bone health and immune support.",
    price: 14.99,
    compareAtPrice: null,
    image: "https://hdmuscle.com/cdn/shop/files/D3_Front.png?v=1714392098&width=1280",
    images: [
      "https://hdmuscle.com/cdn/shop/files/D3_Front.png?v=1714392098&width=1280"
    ],
    category: "Health + Wellness",
    status: "active",
    flavors: ["Default Title"],
    weight: "120 softgels",
    servings: "120",
  },
];

export const categories = [
  { name: "Pre-workouts", slug: "pre-workouts", image: "https://hdmuscle.com/cdn/shop/collections/Preworkout_Collection.jpg" },
  { name: "Intra-workouts", slug: "intra-workouts", image: "https://hdmuscle.com/cdn/shop/collections/Intra_Collection.jpg" },
  { name: "Post-workout", slug: "post-workout", image: "https://hdmuscle.com/cdn/shop/collections/Recovery_Collection.jpg" },
  { name: "Health + Wellness", slug: "health-wellness", image: "https://hdmuscle.com/cdn/shop/collections/Health_Collection.jpg" },
  { name: "Proteins", slug: "proteins", image: "https://hdmuscle.com/cdn/shop/collections/Protein_Collection.jpg" },
  { name: "Bundles", slug: "bundles", image: "https://hdmuscle.com/cdn/shop/collections/Bundles_Collection.jpg" },
];

export const navLinks = [
  { label: "Pre-workouts", href: "https://hdmuscle.com/collections/pre-workouts" },
  { label: "Intra-workouts", href: "https://hdmuscle.com/collections/intra-workouts" },
  { label: "Post-workout", href: "https://hdmuscle.com/collections/post-workout" },
  { label: "Proteins", href: "https://hdmuscle.com/products/prohd-isolate" },
  { label: "Health + Wellness", href: "https://hdmuscle.com/collections/health-wellness" },
  { label: "Bundles", href: "https://hdmuscle.com/collections/bundles" },
];

export const megaMenuCategories = [
  {
    name: "Pre-workout",
    products: [
      { name: "PreHD Essential", handle: "prehd-essential" },
      { name: "PreHD Ultra", handle: "pre-hd-ultra" },
      { name: "PreHD Elite", handle: "pre-hd-elite" },
      { name: "PreHD Black", handle: "pre-hd-black" },
      { name: "PumpHD", handle: "pumphd" },
      { name: "StimHD", handle: "stimhd" },
    ]
  },
  {
    name: "Intra-workout + Recovery",
    products: [
      { name: "CarbHD", handle: "carbhd-new-formula" },
      { name: "CreaHD", handle: "creahd-creapure" },
      { name: "EaaHD", handle: "eaa-hd" },
      { name: "GlutaHD", handle: "gluta-hd" },
      { name: "HydraHD", handle: "hydrahd" },
      { name: "IntraHD", handle: "intra-hd" },
    ]
  },
  {
    name: "Protein",
    products: [
      { name: "ProHD Isolate", handle: "prohd-isolate" },
    ]
  },
  {
    name: "Health + Wellness",
    products: [
      { name: "SleepHD", handle: "sleephd" },
      { name: "Omega3", handle: "omega-3" },
      { name: "D3", handle: "d3" },
      { name: "MultiHD", handle: "multihd" },
    ]
  },
];

export const footerLinks = {
  shop: [
    { label: "All Products", href: "https://hdmuscle.com/collections/all" },
    { label: "Pre-workouts", href: "https://hdmuscle.com/collections/pre-workouts" },
    { label: "Intra-workouts", href: "https://hdmuscle.com/collections/intra-workouts" },
    { label: "Post-workout", href: "https://hdmuscle.com/collections/post-workout" },
    { label: "Proteins", href: "https://hdmuscle.com/products/prohd-isolate" },
    { label: "Health + Wellness", href: "https://hdmuscle.com/collections/health-wellness" },
    { label: "Bundles", href: "https://hdmuscle.com/collections/bundles" },
  ],
  company: [
    { label: "About Us", href: "https://hdmuscle.com/pages/our-story" },
    { label: "Join HD Collective", href: "https://hdmuscle.com/pages/join" },
    { label: "FAQ", href: "https://hdmuscle.com/pages/faq" },
    { label: "Contact", href: "https://hdmuscle.com/pages/contact" },
  ],
  legal: [
    { label: "Shipping Policy", href: "https://hdmuscle.com/policies/shipping-policy" },
    { label: "Return Policy", href: "https://hdmuscle.com/policies/refund-policy" },
    { label: "Privacy Policy", href: "https://hdmuscle.com/policies/privacy-policy" },
    { label: "Terms of Service", href: "https://hdmuscle.com/policies/terms-of-service" },
  ],
};
