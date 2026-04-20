export interface CMSData {
  settings: Settings;
  navigation: Navigation;
  homepage: Homepage;
  products: Product[];
  collections: Collection[];
  pages: Page[];
  productContent?: ProductContent[];
}

export interface Settings {
  store_name: string;
  brand_name: string;
  public_site_url: string;
  currency: string;
  locale: string;
  symbol: string;
  logo_text: string;
  announcement_bar: AnnouncementBar;
  search_suggestions?: LinkItem[];
  social_links: SocialLinks;
  footer: Footer;
  contact: Contact;
}

export interface LinkItem {
  title?: string;
  label?: string;
  link?: string;
  url?: string;
}

export interface AnnouncementBar {
  enabled: boolean;
  text: string;
  link: string;
  link_text: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
}

export interface Footer {
  copyright_text: string;
  country_options: string[];
  default_country?: string;
  payment_icons?: string[];
}

export interface Contact {
  email?: string;
  phone?: string;
}

export interface Navigation {
  header_main: HeaderNavItem[];
  utility_links?: SimpleNavItem[];
  footer_main: FooterNavSection[];
}

export interface SimpleNavItem {
  title: string;
  link: string;
}

export interface HeaderNavItem {
  id: number;
  title: string;
  type: 'link' | 'megamenu';
  link: string;
  promoCard?: {
    title: string;
    subtitle?: string;
    image: string;
    link: string;
  };
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
  sections: HomepageSection[];
}

export type HomepageSection =
  | {
      type: 'hero';
      id: string;
      heading: string;
      subheading: string;
      ctaLabel: string;
      ctaUrl: string;
      backgroundImage: string;
    }
  | {
      type: 'quality_badges';
      id: string;
      badges: { icon: string; text: string }[];
    }
  | {
      type: 'category_tiles';
      id: string;
      title: string;
      items: { title: string; image: string; url: string }[];
    }
  | {
      type: 'featured_products';
      id: string;
      title: string;
      productHandles: string[];
    }
  | {
      type: 'brand_story';
      id: string;
      heading: string;
      body: string;
      quote?: string;
      image?: string;
    }
  | {
      type: 'testimonials';
      id: string;
      title: string;
      subtitle?: string;
      items: { text: string; author: string; stars: number }[];
    }
  | {
      type: 'faq';
      id: string;
      title: string;
      questions: { question: string; answer: string }[];
    }
  | {
      type: 'guarantee';
      id: string;
      heading: string;
      text: string;
      link: string;
    }
  | {
      type: 'newsletter';
      id: string;
      heading: string;
      text: string;
      placeholder: string;
      button: string;
    };

export interface Product {
  id: string;
  handle: string;
  title: string;
  subtitle?: string;
  price: string;
  compareAtPrice: string | null;
  featuredImageUrl?: string;
  description?: string;
  shortDescription?: string;
  badge?: string | null;
  isActive: boolean;
  inventory: number;
  category?: string;
  tags?: string[];
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image?: string;
}

export interface Page {
  id: string;
  handle: string;
  title: string;
  content: string;
}

export interface ProductContent {
  handle: string;
  blocks: ProductBlock[];
}

export type ProductBlock =
  | { type: 'benefits'; title: string; items: string[] }
  | { type: 'stats'; items: { label: string; value: string }[] }
  | { type: 'story'; title: string; body: string; image?: string };

let cache: CMSData | null = null;

export async function fetchStorefrontPayload(force = false): Promise<CMSData> {
  if (cache && !force) return cache;

  const res = await fetch('/api/storefront/published', {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch storefront payload');
  }

  cache = await res.json();
  return cache!;
}

export function getSettings(data: CMSData): Settings {
  return (
    data?.settings || {
      store_name: 'HD MUSCLE',
      brand_name: 'HD Muscle',
      public_site_url: 'https://store.hdmuscle.in',
      currency: 'INR',
      locale: 'en-IN',
      symbol: '₹',
      logo_text: 'HD MUSCLE',
      announcement_bar: { enabled: false, text: '', link: '', link_text: '' },
      social_links: {},
      footer: { copyright_text: '© 2024 HD MUSCLE. All rights reserved.', country_options: ['India'] },
      contact: {},
    }
  );
}

export function getNavigation(data: CMSData): Navigation {
  return data?.navigation || { header_main: [], utility_links: [], footer_main: [] };
}

export function getHomepage(data: CMSData): Homepage {
  return data?.homepage || { sections: [] };
}

export function getProducts(data: CMSData): Product[] {
  return data?.products || [];
}

export function getCollections(data: CMSData): Collection[] {
  return data?.collections || [];
}

export function getProductByHandle(data: CMSData, handle: string): Product | undefined {
  return getProducts(data).find((p) => p.handle === handle);
}

export function getCollectionByHandle(data: CMSData, handle: string): Collection | undefined {
  return getCollections(data).find((c) => c.handle === handle);
}

export function getProductContent(data: CMSData, handle: string): ProductContent | undefined {
  return data?.productContent?.find((item) => item.handle === handle);
}

export function formatMoney(value: string | number, currency = 'INR', locale = 'en-IN') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}