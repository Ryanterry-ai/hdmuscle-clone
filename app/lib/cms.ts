export interface CMSData {
  settings: Settings;
  navigation: Navigation;
  homepage: Homepage;
  products: Product[];
  collections: Collection[];
  pages: Page[];
}

export interface Settings {
  store_name: string;
  brand_name: string;
  currency: string;
  locale: string;
  symbol: string;
  logo_text: string;
  announcement_bar: AnnouncementBar;
  social_links: SocialLinks;
  footer: Footer;
  contact: Contact;
}

export interface AnnouncementBar {
  enabled: boolean;
  text: string;
  link: string;
  link_text: string;
}

export interface SocialLinks {
  instagram: string;
  facebook: string;
  youtube: string;
  tiktok: string;
}

export interface Footer {
  copyright_text: string;
  country_options: string[];
}

export interface Contact {
  email: string;
  phone: string;
}

export interface Navigation {
  header_main: HeaderNavItem[];
  footer_main: FooterNavSection[];
}

export interface HeaderNavItem {
  id: number;
  title: string;
  type: string;
  link: string;
  children?: MegaMenuGroup[];
}

export interface MegaMenuGroup {
  title: string;
  items: { title: string; link: string }[];
}

export interface FooterNavSection {
  title: string;
  links: { title: string; link: string }[];
}

export interface Homepage {
  hero: HeroSection;
  quality_badges: QualityBadgesSection;
  category_tiles: CategoryTilesSection;
  best_sellers: ProductSection;
  new_products: ProductSection;
  brand_story: BrandStorySection;
  testimonials: TestimonialsSection;
  apparel: ProductSection;
  faq: FAQSection;
  guarantee: GuaranteeSection;
  newsletter: NewsletterSection;
}

export interface HeroSection {
  enabled: boolean;
  heading: string;
  subheading: string;
  cta_primary: { text: string; link: string };
  cta_secondary: { text: string; link: string };
  background_image: string;
  overlay_opacity: number;
}

export interface QualityBadgesSection {
  enabled: boolean;
  badges: { icon: string; text: string }[];
}

export interface CategoryTilesSection {
  enabled: boolean;
  categories: { title: string; image: string; link: string }[];
}

export interface ProductSection {
  enabled: boolean;
  title: string;
  link: string;
  product_handles: string[];
}

export interface BrandStorySection {
  enabled: boolean;
  label: string;
  heading: string;
  content: string;
  quote: string;
  image: string;
}

export interface TestimonialsSection {
  enabled: boolean;
  title: string;
  subtitle: string;
  reviews: { text: string; author: string; stars: number }[];
}

export interface FAQSection {
  enabled: boolean;
  title: string;
  questions: { question: string; answer: string }[];
}

export interface GuaranteeSection {
  enabled: boolean;
  heading: string;
  text: string;
  link: string;
}

export interface NewsletterSection {
  enabled: boolean;
  heading: string;
  text: string;
  placeholder: string;
  button: string;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  price: string;
  compare_at_price: string | null;
  description: string;
  short_description: string;
  images: { url: string }[];
  badge: string | null;
  is_active: boolean;
  inventory: number;
  category: string;
  tags: string[];
  is_apparel?: boolean;
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
}

export interface Page {
  id: string;
  handle: string;
  title: string;
  content: string;
}

let cachedData: CMSData | null = null;

export async function fetchStorefrontPayload(): Promise<CMSData> {
  if (cachedData) {
    return cachedData;
  }

  try {
    const res = await fetch('/api/storefront/published', {
      next: { revalidate: 0 }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch CMS data');
    }
    
    cachedData = await res.json();
    return cachedData!;
  } catch (error) {
    console.error('CMS fetch error:', error);
    throw error;
  }
}

export function getSettings(data: CMSData) {
  return data?.settings || {
    store_name: 'HD MUSCLE',
    brand_name: 'HD Muscle',
    currency: 'USD',
    locale: 'en-US',
    symbol: '$',
    logo_text: 'HD MUSCLE',
    announcement_bar: { enabled: false },
    social_links: {},
    footer: { copyright_text: '© 2024 HD MUSCLE. All rights reserved.' },
    contact: {}
  };
}

export function getNavigation(data: CMSData) {
  return data?.navigation || { header_main: [], footer_main: [] };
}

export function getHomepage(data: CMSData) {
  return data?.homepage || null;
}

export function getProducts(data: CMSData): Product[] {
  return data?.products || [];
}

export function getProductByHandle(data: CMSData, handle: string): Product | undefined {
  return getProducts(data).find(p => p.handle === handle);
}

export function getCollections(data: CMSData): Collection[] {
  return data?.collections || [];
}

export function getCollectionByHandle(data: CMSData, handle: string): Collection | undefined {
  return getCollections(data).find(c => c.handle === handle);
}

export function getProductsByHandles(data: CMSData, handles: string[]): Product[] {
  const allProducts = getProducts(data);
  return handles
    .map(handle => allProducts.find(p => p.handle === handle))
    .filter((p): p is Product => p !== undefined);
}

export function getCollectionProducts(data: CMSData, category: string): Product[] {
  return getProducts(data).filter(p => 
    p.category === category || 
    p.tags?.includes(category) ||
    (p.is_apparel && category === 'apparel')
  );
}

export function getPages(data: CMSData): Page[] {
  return data?.pages || [];
}

export function getPageByHandle(data: CMSData, handle: string): Page | undefined {
  return getPages(data).find(p => p.handle === handle);
}

export function formatCurrency(amount: number, currency: string = 'USD', locale: string = 'en-US'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

export function getBestSellers(data: CMSData): Product[] {
  if (!data?.homepage?.best_sellers?.enabled) return [];
  return getProductsByHandles(data, data.homepage.best_sellers.product_handles);
}

export function getNewProducts(data: CMSData): Product[] {
  if (!data?.homepage?.new_products?.enabled) return [];
  return getProductsByHandles(data, data.homepage.new_products.product_handles);
}

export function getApparelProducts(data: CMSData): Product[] {
  if (!data?.homepage?.apparel?.enabled) return [];
  return getProductsByHandles(data, data.homepage.apparel.product_handles);
}
