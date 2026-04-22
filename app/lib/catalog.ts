export type Product = {
  id: string
  handle: string
  title: string
  price: number
  compareAtPrice?: number
  image: string
  secondaryImage?: string
  collection: string
  badge?: string
  variantLabel?: string
  variantOptions?: string[]
  sizeOptions?: string[]
  reviewCount?: number
}

export type Collection = {
  handle: string
  title: string
  description: string
  image: string
}

export const collections: Collection[] = [
  {
    handle: 'health-wellness',
    title: 'Health + Wellness',
    description: 'Daily support formulas designed to improve sleep, wellness, and recovery.',
    image: '/img_4801-62368a701296.jpg',
  },
  {
    handle: 'pre-workouts',
    title: 'Pre-workout',
    description: 'Clean energy, focus, and pump formulas for every training day.',
    image: '/untitled_design_32-a97760a5a7fa.png',
  },
  {
    handle: 'protein',
    title: 'Protein',
    description: 'Premium protein formulas built for recovery and lean muscle support.',
    image: '/prohd_chocolate_front-1cca5974cf27.png',
  },
  {
    handle: 'intra-workouts',
    title: 'Intra-Workout',
    description: 'Hydration and endurance support to keep performance high during workouts.',
    image: '/max09367-79d461f0e988.jpg',
  },
  {
    handle: 'post-workout-recovery',
    title: 'Post-Workout',
    description: 'Recovery formulas to support muscle repair and next-day performance.',
    image: '/untitled_design_28-aaf3dbf0accf.png',
  },
  {
    handle: 'bundles',
    title: 'Bundles',
    description: 'Save more with curated stacks built around your training goals.',
    image: '/hdmuscle72-1775078686011-5c8049f904ea.webp',
  },
  {
    handle: 'apparel-accessories-2',
    title: 'Apparel + Accessories',
    description: 'Performance apparel and lifestyle essentials from HD Muscle.',
    image: '/000020660025-2-900274261fbb.jpg',
  },
]

export const products: Product[] = [
  {
    id: 'p1',
    handle: 'prohd',
    title: 'PROHD',
    price: 4999,
    compareAtPrice: 5499,
    image: '/chocolate-6fe084500cd7.png',
    secondaryImage: '/chocolate_4.4-bbdf4d506093.jpg',
    collection: 'protein',
    variantLabel: 'Chocolate / 2.2LB',
    variantOptions: ['Chocolate', 'Vanilla', 'Sweet Cream Cold Brew', 'Chocolate Peanut Butter'],
    sizeOptions: ['2.2LB', '4.4LB'],
    reviewCount: 284,
  },
  {
    id: 'p2',
    handle: 'prehd-essential',
    title: 'PREHD ESSENTIAL',
    price: 2499,
    image: '/prehd-essential-blue-rasberry-eb39ae9ce7f5.png',
    secondaryImage: '/prehd-essential-suppfacts-blue-raspberry_us-051572b1552e.png',
    collection: 'pre-workouts',
    variantLabel: 'Blue Raspberry',
    variantOptions: ['Blue Raspberry', 'Pineapple', 'Watermelon'],
    reviewCount: 96,
  },
  {
    id: 'p3',
    handle: 'intrahd',
    title: 'INTRAHD',
    price: 3499,
    image: '/intrahd_watermelon_f38c042d-708c-472a-a828-b329ac7baf6b-ca4066edb12c.png',
    secondaryImage: '/intra_watermelon-05a8cc27871f.jpg',
    collection: 'intra-workouts',
    variantLabel: 'Grapefruit',
    variantOptions: ['Grapefruit', 'Raspberry Lemonade', 'Watermelon'],
    reviewCount: 61,
  },
  {
    id: 'p4',
    handle: 'creahd',
    title: 'CREAHD',
    price: 1999,
    image: '/creahd_transparent-e088b481899b.png',
    secondaryImage: '/creahd-53c587c6f495.jpg',
    collection: 'post-workout-recovery',
    variantLabel: 'Unflavored',
  },
  {
    id: 'p5',
    handle: 'hydrahd',
    title: 'HYDRAHD',
    price: 1999,
    image: '/hydrahd-tangerine-us-16303cf76229.png',
    secondaryImage: '/hydrahd-supp-facts-tangerine-df0a07b645d4.png',
    collection: 'intra-workouts',
    variantLabel: 'Tangerine',
    variantOptions: ['Tangerine', 'Pink Lemonade', 'Berry Blast - Sold out'],
    reviewCount: 58,
  },
  {
    id: 'p6',
    handle: 'greenshd',
    title: 'GREENSHD',
    price: 2799,
    image: '/greenshd-citrus-us_92d08dad-4bb8-407d-924a-25b91d9b49d0-2aee1aa60f8c.jpg',
    secondaryImage: '/greenshd-citrus-us_3_e2243ca8-713f-42e5-8095-3ca4d28721c9-685b95d866a9.png',
    collection: 'health-wellness',
    variantLabel: 'Citrus',
    variantOptions: ['Citrus', 'Pineapple Mango'],
    reviewCount: 87,
  },
  {
    id: 'p7',
    handle: 'glutahd',
    title: 'GLUTAHD',
    price: 1799,
    image: '/glutahd-front-black-lid-0e6436cfe231.jpg',
    secondaryImage: '/glutahd-front-black-lid-ba21e88593f0.jpg',
    collection: 'health-wellness',
    variantLabel: 'Unflavored',
    variantOptions: ['Unflavored'],
    reviewCount: 52,
  },
  {
    id: 'p8',
    handle: 'multihd',
    title: 'MULTIHD',
    price: 1499,
    image: '/multi-hd-us-web-11980b086482.jpg',
    secondaryImage: '/multihd-suppfacts-4a8be796bde8.png',
    collection: 'health-wellness',
    variantLabel: 'One Size',
  },
  {
    id: 'p9',
    handle: 'pumphd',
    title: 'PUMPHD',
    price: 2799,
    image: '/pumphd-rainbow-strips-ead9f7c7e482.png',
    secondaryImage: '/pumphd-supp-facts-rainbow-strips-9cae0df1b395.png',
    collection: 'pre-workouts',
    variantLabel: 'Rainbow Strips',
    variantOptions: ['Rainbow Strips', 'Cherry Slushie'],
    reviewCount: 12,
  },
  {
    id: 'p10',
    handle: 'prehd-ultra',
    title: 'PREHD ULTRA',
    price: 3199,
    image: '/ultra_sourgummies-f20633a13a95.png',
    secondaryImage: '/ultra_sourgummies-7918db0b2cb4.jpg',
    collection: 'pre-workouts',
    variantLabel: 'Sour Gummies',
    variantOptions: ['Sour Gummies', 'Peach Rings'],
    reviewCount: 73,
  },
  {
    id: 'p15',
    handle: 'prehd-black',
    title: 'PREHD BLACK',
    price: 3299,
    image: '/black_strawmango-db4d1e80b173.jpg',
    secondaryImage: '/black_sourgrape-1c3f3fabbce4.jpg',
    collection: 'pre-workouts',
    variantLabel: 'Strawberry Mango',
    variantOptions: ['Strawberry Mango', 'Sour Grape', 'Lychee'],
    reviewCount: 118,
  },
  {
    id: 'p16',
    handle: 'prehd-elite',
    title: 'PREHD ELITE',
    price: 3899,
    image: '/prehd-elite_tangerine-can-v2-15e1790f303a.jpg',
    secondaryImage: '/elite_pinklemon-b475a5ed9e0f.jpg',
    collection: 'pre-workouts',
    variantLabel: 'Tangerine',
    variantOptions: ['Tangerine', 'Pink Lemonade', 'Berry Blast'],
    reviewCount: 82,
  },
  {
    id: 'p17',
    handle: 'stimhd',
    title: 'STIMHD',
    price: 1399,
    image: '/stimhd_9d7400de-4473-4af8-bd68-902c6689781d-fdd59a2755d1.png',
    secondaryImage: '/stimhd-supp-facts-0d5d1ec4e693.png',
    collection: 'pre-workouts',
    variantLabel: 'Default Title',
    variantOptions: ['Default Title'],
    reviewCount: 44,
  },
  {
    id: 'p11',
    handle: 'varsity-baseball-jersey-navy-blue',
    title: 'VARSITY BASEBALL JERSEY - NAVY BLUE',
    price: 3999,
    image: '/hd-jersey-navy-front-2c752149576d.jpg',
    secondaryImage: '/000029680012-2_496138d1-921b-46f5-8ca7-64088514da0c-234dd1713c27.jpg',
    collection: 'apparel-accessories-2',
    variantLabel: 'Medium',
  },
  {
    id: 'p12',
    handle: 'varsity-baseball-jersey-black',
    title: 'VARSITY BASEBALL JERSEY - BLACK',
    price: 3999,
    image: '/hd-jersey-black-front-15e6447e1daf.jpg',
    secondaryImage: '/mr401760-34087c91e356.jpg',
    collection: 'apparel-accessories-2',
    variantLabel: 'X-Large',
  },
  {
    id: 'p13',
    handle: 'chrome-script-t-shirt-black-onyx',
    title: 'CHROME SCRIPT T-SHIRT - BLACK ONYX',
    price: 3499,
    image: '/hd-tribal-chrome-black-front-0c1b661ad9cc.png',
    secondaryImage: '/dsc02516-0ff695b3a749.jpg',
    collection: 'apparel-accessories-2',
    variantLabel: 'Medium',
  },
  {
    id: 'p14',
    handle: 'weight-man-t-shirt-bright-white',
    title: 'WEIGHT MAN T-SHIRT - BRIGHT WHITE',
    price: 3499,
    image: '/hd-weightplateman-white-back-a9a54dc5f581.png',
    secondaryImage: '/dsc02674_f4e0858e-1523-44e6-b8b2-e063712296f6-db3fe4b87852.jpg',
    collection: 'apparel-accessories-2',
    variantLabel: 'Medium',
  },
]

export const bestSellerHandles = ['prohd', 'prehd-essential', 'intrahd', 'creahd', 'glutahd', 'multihd', 'pumphd', 'prehd-ultra']
export const newNoteworthyHandles = ['hydrahd', 'greenshd', 'prehd-elite', 'pumphd', 'prehd-essential', 'prehd-ultra', 'prehd-black', 'stimhd']
export const apparelHandles = [
  'varsity-baseball-jersey-navy-blue',
  'varsity-baseball-jersey-black',
  'chrome-script-t-shirt-black-onyx',
  'weight-man-t-shirt-bright-white',
]

export const heroCategoryTiles = [
  {
    title: 'HEALTH + WELLNESS',
    href: '/collections/health-wellness',
    image: '/img_4801-62368a701296.jpg',
  },
  {
    title: 'PRE-WORKOUT',
    href: '/collections/pre-workouts',
    image: '/untitled_design_32-a97760a5a7fa.png',
  },
  {
    title: 'INTRA-WORKOUT',
    href: '/collections/intra-workouts',
    image: '/max09367-79d461f0e988.jpg',
  },
  {
    title: 'POST-WORKOUT',
    href: '/collections/post-workout-recovery',
    image: '/untitled_design_28-aaf3dbf0accf.png',
  },
]

export const trustIcons = [
  { label: 'TESTED FOR HEAVY METALS', image: '/heavymetals-6d70a25b79b6.jpg' },
  { label: 'NO ARTIFICIAL COLORS OR DYES', image: '/nodyes-c2baabd41f37.jpg' },
  { label: '3RD PARTY TESTED', image: '/3rdparty-c55028aede9a.jpg' },
  { label: 'PROPERLY DOSED INGREDIENTS', image: '/properlydosed-6a27d6ff87b9.jpg' },
  { label: 'REGISTERED TRADEMARK INGREDIENTS', image: '/registered-5d856e63c54e.jpg' },
]

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getProduct(handle: string) {
  return products.find((product) => product.handle === handle)
}

export function getCollection(handle: string) {
  return collections.find((collection) => collection.handle === handle)
}

export function getProductsByHandles(handles: string[]) {
  return handles.map((handle) => getProduct(handle)).filter(Boolean) as Product[]
}

export function getProductsByCollection(handle: string) {
  if (handle === 'all') return products
  return products.filter((product) => product.collection === handle)
}
