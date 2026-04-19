const CMS_API = process.env.CMS_API || 'https://cms.hdmuscle.in/api';

interface CMSPayload {
  generatedAt: string;
  site: {
    name: string;
    seoTitle: string;
    seoDescription: string;
    publicSiteUrl: string;
    announcementText: string;
    announcementLink: string;
    instagramUrl: string;
    facebookUrl: string;
    copyrightText: string;
    supportEmail: string;
    supportPhone: string;
    currency: string;
    timezone: string;
    address: string;
  };
  sections: {
    hero: any;
    announcementBar: any;
    brandStory: any;
    faq: any;
    footerNewsletter: any;
    featuredProducts: any;
    collectionSpotlight: any;
  };
  publishedSections: any[];
  products: any[];
  collections: any[];
  navigation: any[];
}

export async function fetchStorefrontPayload(): Promise<CMSPayload | null> {
  try {
    const res = await fetch(`${CMS_API}/storefront/published`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      console.error('CMS fetch failed:', res.status);
      return null;
    }
    
    return await res.json();
  } catch (error) {
    console.error('CMS fetch error:', error);
    return null;
  }
}

export function getSettings(payload: CMSPayload | null) {
  if (!payload?.site) {
    return {
      currency: 'INR',
      locale: 'en-IN',
      symbol: '₹',
      timezone: 'Asia/Kolkata',
      store_name: 'HD MUSCLE',
      store_email: '',
      store_phone: ''
    };
  }
  
  return {
    currency: payload.site.currency || 'INR',
    locale: payload.site.currency === 'USD' ? 'en-US' : 'en-IN',
    symbol: payload.site.currency === 'USD' ? '$' : '₹',
    timezone: payload.site.timezone || 'Asia/Kolkata',
    store_name: payload.site.name || 'HD MUSCLE',
    store_email: payload.site.supportEmail || '',
    store_phone: payload.site.supportPhone || '',
    announcement_text: payload.site.announcementText || '',
    announcement_link: payload.site.announcementLink || '',
    instagram_url: payload.site.instagramUrl || '',
    facebook_url: payload.site.facebookUrl || '',
    copyright_text: payload.site.copyrightText || ''
  };
}

export function getProducts(payload: CMSPayload | null) {
  return payload?.products || [];
}

export function getCollections(payload: CMSPayload | null) {
  return payload?.collections || [];
}

export function getNavigation(payload: CMSPayload | null) {
  return payload?.navigation || [];
}

export function getHeroSection(payload: CMSPayload | null) {
  return payload?.sections?.hero || null;
}

export function formatCurrency(amount: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}