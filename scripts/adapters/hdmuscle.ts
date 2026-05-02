/**
 * HDMuscle Adapter
 * Site-specific extraction selectors for hdmuscle.in (Next.js app)
 * Discovers collections, products, categories, and full product details.
 */
import * as cheerio from 'cheerio';

export interface CollectionInfo {
  name: string;
  url: string;
  slug: string;
}

export interface ProductListingItem {
  title: string;
  url: string;
  price: string;
  compareAtPrice: string;
  imageUrls: string[];
  flavor: string;
  category: string;
}

export interface ProductDetail {
  title: string;
  brand: string;
  price: string;
  compareAtPrice: string;
  description: string;
  ingredients: string;
  nutritionFacts: string;
  servingSize: string;
  servingsPerContainer: string;
  directions: string;
  warnings: string;
  allergenInfo: string;
  manufacturer: string;
  countryOfOrigin: string;
  imageUrls: string[];
  flavors: string[];
  sizes: string[];
  stock: string;
}

const COLLECTIONS = [
  { url: '/collections/pre-workouts/', category: 'Pre-workout' },
  { url: '/collections/intra-workouts/', category: 'Intra-workout' },
  { url: '/collections/post-workout-recovery/', category: 'Post-workout & Recovery' },
  { url: '/collections/health-wellness/', category: 'Health & Wellness' },
  { url: '/collections/bundles/', category: 'Bundles' },
  { url: '/collections/apparel-accessories-2/', category: 'Apparel & Accessories' },
];

export function discoverCollections($: cheerio.CheerioAPI, baseUrl: string): CollectionInfo[] {
  const collections: CollectionInfo[] = [];

  // Discover from category cards on homepage
  $('.category-card').each((_, el) => {
    const link = $(el).attr('href');
    const label = $(el).find('.category-card__label').first().text().trim();
    if (link && label) {
      const fullUrl = link.startsWith('http') ? link : new URL(link, baseUrl).href;
      collections.push({
        name: label,
        url: fullUrl,
        slug: link.replace(/\/collections\//, '').replace(/\//g, ''),
      });
    }
  });

  // Fallback: predefined collections
  if (collections.length === 0) {
    for (const col of COLLECTIONS) {
      const fullUrl = col.url.startsWith('http') ? col.url : new URL(col.url, baseUrl).href;
      collections.push({
        name: col.category,
        url: fullUrl,
        slug: col.url.replace(/\/collections\//, '').replace(/\//g, ''),
      });
    }
  }

  return collections;
}

export function extractProductListing($: cheerio.CheerioAPI, baseUrl: string, category: string): ProductListingItem[] {
  const products: ProductListingItem[] = [];

  $('article.catalog-card').each((_, el) => {
    const linkEl = $(el).find('a.catalog-card__image-link');
    const productUrl = linkEl.attr('href');
    if (!productUrl) return;

    const title = $(el).find('.catalog-card__meta h3').first().text().trim();
    const priceText = $(el).find('.catalog-card__meta p').first().text().trim();
    const price = priceText.replace(/[₹,]/g, '').replace('From', '').trim();
    const compareAt = '';

    const flavorSelect = $(el).find('select option[selected]');
    const flavor = flavorSelect.length ? flavorSelect.text().trim() : '';

    const images: string[] = [];
    const primaryImg = $(el).find('.catalog-card__primary');
    const secondaryImg = $(el).find('.catalog-card__secondary');
    if (primaryImg.length) {
      const src = primaryImg.attr('src') || primaryImg.attr('data-src') || '';
      if (src) images.push(new URL(src, baseUrl).href);
    }
    if (secondaryImg.length) {
      const src = secondaryImg.attr('src') || secondaryImg.attr('data-src') || '';
      if (src) images.push(new URL(src, baseUrl).href);
    }

    const fullUrl = productUrl.startsWith('http') ? productUrl : new URL(productUrl, baseUrl).href;

    products.push({
      title,
      url: fullUrl,
      price,
      compareAtPrice: compareAt,
      imageUrls: images,
      flavor,
      category,
    });
  });

  return products;
}

export function extractProductDetail($: cheerio.CheerioAPI, baseUrl: string): ProductDetail {
  const detail: ProductDetail = {
    title: '',
    brand: 'HD Muscle',
    price: '',
    compareAtPrice: '',
    description: '',
    ingredients: '',
    nutritionFacts: '',
    servingSize: '',
    servingsPerContainer: '',
    directions: '',
    warnings: '',
    allergenInfo: '',
    manufacturer: '',
    countryOfOrigin: 'India',
    imageUrls: [],
    flavors: [],
    sizes: [],
    stock: '100',
  };

  // Title
  const titleSelectors = ['h1.product-title', 'h1.product__title', 'h1[data-test="product-title"]', 'h1'];
  for (const sel of titleSelectors) {
    const el = $(sel).first();
    if (el.length && el.text().trim()) {
      detail.title = el.text().trim();
      break;
    }
  }

  // Brand
  const brandSelectors = ['.product-brand', '[itemprop="brand"]', '.brand-name', '.pdp-brand'];
  for (const sel of brandSelectors) {
    const el = $(sel).first();
    if (el.length) {
      detail.brand = el.text().trim();
      break;
    }
  }

  // Price
  const priceSelectors = [
    '.product-price__current',
    '.product-price',
    '[itemprop="price"]',
    '.price-current',
    '.pdp-price--current',
  ];
  for (const sel of priceSelectors) {
    const el = $(sel).first();
    if (el.length) {
      detail.price = el.text().trim().replace(/[₹$€£,]/g, '').trim();
      break;
    }
  }

  // Compare-at price (MRP/strikethrough)
  const compareSelectors = ['.product-price__compare', '.compare-price', '[itemprop="price"] ~ [style*="text-decoration"]'];
  for (const sel of compareSelectors) {
    const el = $(sel).first();
    if (el.length) {
      detail.compareAtPrice = el.text().trim().replace(/[₹$€£,]/g, '').trim();
      break;
    }
  }

  // Description
  const descSelectors = ['.product-description', '[itemprop="description"]', '.product-details', '.pdp-description'];
  for (const sel of descSelectors) {
    const el = $(sel).first();
    if (el.length) {
      detail.description = el.text().trim().replace(/\s+/g, ' ').trim();
      break;
    }
  }

  // Images
  const imageSelectors = [
    'img.product-image',
    'img[itemprop="image"]',
    '.product-gallery img',
    '.product-media img',
    '.pdp-image',
    'img[data-zoom-src]',
  ];
  const seenUrls = new Set<string>();
  for (const sel of imageSelectors) {
    $(sel).each((_, el) => {
      let src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-zoom-src') || '';
      if (src && !seenUrls.has(src)) {
        seenUrls.add(src);
        detail.imageUrls.push(new URL(src, baseUrl).href);
      }
    });
  }

  // Flavors from select options
  $('select option').each((_, el) => {
    const text = $(el).text().trim();
    if (text && !detail.flavors.includes(text)) {
      detail.flavors.push(text);
    }
  });

  // Full body text extraction for label data (fallback)
  const bodyText = $('body').text();

  // Ingredients
  if (!detail.ingredients) {
    const ingredientPatterns = [
      /(?:ingredients?|composition)[\s:]*([^\n]{10,1000})/i,
      /(?:other ingredients)[\s:]*([^\n]{10,1000})/i,
    ];
    for (const pattern of ingredientPatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        detail.ingredients = match[1].trim().substring(0, 2000);
        break;
      }
    }
  }

  // Nutrition facts
  if (!detail.nutritionFacts) {
    const nutritionPatterns = [
      /(?:supplement facts|nutrition facts|nutrition information)[\s:]*([^\n]{10,2000})/i,
      /(?:amount per serving)[\s:]*([^\n]{10,2000})/i,
    ];
    for (const pattern of nutritionPatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        detail.nutritionFacts = match[1].trim().substring(0, 2000);
        break;
      }
    }
  }

  // Serving size
  if (!detail.servingSize) {
    const servingMatch = bodyText.match(/(?:serving size)[\s:]*([^\n]{5,100})/i);
    if (servingMatch) {
      detail.servingSize = servingMatch[1].trim();
    }
  }

  // Servings per container
  if (!detail.servingsPerContainer) {
    const servingsMatch = bodyText.match(/(?:servings per container|servings per pack)[\s:]*([^\n]{5,50})/i);
    if (servingsMatch) {
      detail.servingsPerContainer = servingsMatch[1].trim();
    }
  }

  // Directions
  if (!detail.directions) {
    const directionPatterns = [
      /(?:directions?|suggested use|recommended use|how to use|usage)[\s:]*([^\n]{10,1000})/i,
      /(?:mix|take|consume)[\s:]*([^\n]{10,1000})/i,
    ];
    for (const pattern of directionPatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        detail.directions = match[1].trim().substring(0, 2000);
        break;
      }
    }
  }

  // Warnings
  if (!detail.warnings) {
    const warningPatterns = [
      /(?:warnings?|caution|disclaimer|notice)[\s:]*([^\n]{10,1000})/i,
    ];
    for (const pattern of warningPatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        detail.warnings = match[1].trim().substring(0, 2000);
        break;
      }
    }
  }

  // Stock status
  const stockSelectors = ['.stock-status', '.availability', '.product-stock', '[data-test="stock-status"]'];
  for (const sel of stockSelectors) {
    const el = $(sel).first();
    if (el.length) {
      const text = el.text().trim().toLowerCase();
      detail.stock = text.includes('out of stock') || text.includes('unavailable') || text.includes('sold out') ? '0' : '100';
      break;
    }
  }

  return detail;
}
