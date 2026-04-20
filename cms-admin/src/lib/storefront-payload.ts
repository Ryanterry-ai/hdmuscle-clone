import type { Section, Setting } from '@prisma/client';

type SettingRecord = Pick<Setting, 'key' | 'value'>;
type SectionRecord = Pick<
  Section,
  | 'id'
  | 'section_key'
  | 'section_type'
  | 'title'
  | 'content'
  | 'position'
  | 'status'
  | 'updated_at'
  | 'published_at'
>;

type ParsedSection = {
  id: string;
  key: string;
  type: string;
  title: string | null;
  position: number;
  status: string;
  updatedAt: Date;
  publishedAt: Date | null;
  content: Record<string, unknown>;
};

function parseSectionContent(content: string) {
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, unknown>;
    }
    return { body: parsed };
  } catch {
    return { body: content };
  }
}

function readString(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function readArray(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return Array.isArray(value) ? value : [];
}

function normalizeHeroContent(content: Record<string, unknown>) {
  return {
    heading: readString(content, 'heading', 'title'),
    subheading: readString(content, 'subheading', 'body', 'subtitle'),
    ctaText: readString(content, 'cta_text', 'primary_label', 'button_text'),
    ctaLink: readString(content, 'cta_link', 'primary_link', 'button_link'),
    secondaryCtaText: readString(content, 'secondary_cta_text', 'secondary_label'),
    secondaryCtaLink: readString(content, 'secondary_cta_link', 'secondary_link'),
    imageUrl: readString(content, 'image_url', 'image'),
  };
}

function normalizeAnnouncementContent(content: Record<string, unknown>) {
  return {
    text: readString(content, 'text', 'heading', 'title'),
    link: readString(content, 'link', 'cta_link', 'button_link'),
  };
}

function normalizeBrandStoryContent(content: Record<string, unknown>) {
  return {
    heading: readString(content, 'heading', 'title'),
    body: readString(content, 'body', 'content', 'description'),
  };
}

function normalizeFaqContent(content: Record<string, unknown>) {
  const items = readArray(content, 'items')
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const record = item as Record<string, unknown>;
      const question = readString(record, 'question', 'title');
      const answer = readString(record, 'answer', 'body', 'content');

      if (!question || !answer) {
        return null;
      }

      return { question, answer };
    })
    .filter(Boolean);

  return {
    heading: readString(content, 'heading', 'title'),
    items,
  };
}

function normalizeFooterNewsletterContent(content: Record<string, unknown>) {
  return {
    body: readString(content, 'body', 'content', 'description'),
    buttonText: readString(content, 'button_text', 'cta_text', 'submit_label'),
    placeholder: readString(content, 'placeholder', 'input_placeholder'),
  };
}

function normalizeFeaturedProductsContent(content: Record<string, unknown>) {
  return {
    heading: readString(content, 'heading', 'title'),
    ctaText: readString(content, 'cta_text', 'button_text', 'cta_label'),
    ctaLink: readString(content, 'cta_link', 'button_link'),
  };
}

function normalizeCollectionSpotlightContent(content: Record<string, unknown>) {
  const source = readArray(content, 'items').length ? readArray(content, 'items') : readArray(content, 'collections');
  const items = source
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const record = item as Record<string, unknown>;
      const title = readString(record, 'title', 'heading', 'name');
      const link = readString(record, 'link', 'cta_link', 'url');
      const imageUrl = readString(record, 'image_url', 'image', 'imageUrl');

      if (!title && !link && !imageUrl) {
        return null;
      }

      return {
        title,
        link,
        imageUrl,
      };
    })
    .filter(Boolean);

  return {
    heading: readString(content, 'heading', 'title'),
    subtitle: readString(content, 'subtitle', 'body', 'description'),
    items,
  };
}

function findFirstSection(sections: ParsedSection[], type: string) {
  return sections.find((section) => section.type === type) || null;
}

export function buildSettingsMap(settings: SettingRecord[]) {
  return settings.reduce<Record<string, string>>((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});
}

export function buildStorefrontCorsHeaders(origin?: string | null) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store',
  };
}

export function buildPublishedStorefrontPayload(
  settings: SettingRecord[], 
  sections: SectionRecord[],
  products: any[] = [],
  collections: any[] = []
) {
  const settingsMap = buildSettingsMap(settings);
  const parsedSections: ParsedSection[] = sections.map((section) => ({
    id: section.id,
    key: section.section_key,
    type: section.section_type,
    title: section.title,
    position: section.position,
    status: section.status,
    updatedAt: section.updated_at,
    publishedAt: section.published_at,
    content: parseSectionContent(section.content),
  }));

  const heroSection = findFirstSection(parsedSections, 'hero');
  const announcementSection = findFirstSection(parsedSections, 'announcement_bar');
  const brandStorySection = findFirstSection(parsedSections, 'brand_story');
  const faqSection = findFirstSection(parsedSections, 'faq');
  const footerNewsletterSection = findFirstSection(parsedSections, 'footer_newsletter');
  const featuredProductsSection = findFirstSection(parsedSections, 'featured_products');
  const collectionSpotlightSection = findFirstSection(parsedSections, 'collection_spotlight');

  return {
    generatedAt: new Date().toISOString(),
    site: {
      name: settingsMap.store_name || 'HD MUSCLE',
      seoTitle: settingsMap.seo_title || null,
      seoDescription: settingsMap.seo_description || null,
      publicSiteUrl: settingsMap.public_site_url || 'https://store.hdmuscle.in',
      announcementText: settingsMap.announcement_text || null,
      announcementLink: settingsMap.announcement_link || null,
      instagramUrl: settingsMap.instagram_url || 'https://www.instagram.com/hd.muscle/',
      facebookUrl: settingsMap.facebook_url || 'https://www.facebook.com/hd.muscle.supps/',
      copyrightText: settingsMap.copyright_text || null,
      supportEmail: settingsMap.store_email || null,
      supportPhone: settingsMap.store_phone || null,
      currency: settingsMap.currency || 'INR',
      timezone: settingsMap.timezone || 'Asia/Kolkata',
      address: settingsMap.store_address || null,
    },
    sections: {
      hero: heroSection ? normalizeHeroContent(heroSection.content) : null,
      announcementBar: announcementSection ? normalizeAnnouncementContent(announcementSection.content) : null,
      brandStory: brandStorySection ? normalizeBrandStoryContent(brandStorySection.content) : null,
      faq: faqSection ? normalizeFaqContent(faqSection.content) : null,
      footerNewsletter: footerNewsletterSection
        ? normalizeFooterNewsletterContent(footerNewsletterSection.content)
        : null,
      featuredProducts: featuredProductsSection
        ? normalizeFeaturedProductsContent(featuredProductsSection.content)
        : null,
      collectionSpotlight: collectionSpotlightSection
        ? normalizeCollectionSpotlightContent(collectionSpotlightSection.content)
        : null,
    },
    publishedSections: parsedSections,
    products: products.map((p: any) => ({
      id: p.id,
      handle: p.handle,
      title: p.title,
      description: p.description,
      description_html: p.description_html,
      price: p.price,
      compare_at_price: p.compare_at_price,
      cost_per_item: p.cost_per_item,
      weight: p.weight,
      weight_unit: p.weight_unit,
      is_active: p.is_active,
      is_featured: p.is_featured,
      is_taxable: p.is_taxable,
      tax_rate: p.tax_rate,
      sku: p.sku,
      barcode: p.barcode,
      inventory: p.inventory,
      track_inventory: p.track_inventory,
      seo_title: p.seo_title,
      seo_description: p.seo_description,
      created_at: p.created_at,
      updated_at: p.updated_at,
      images: p.images,
      collections: p.collections,
    })),
    collections: collections.map((c: any) => ({
      id: c.id,
      handle: c.handle,
      title: c.title,
      description: c.description,
      image: c.image,
      parent_id: c.parent_id,
      sort_order: c.sort_order,
      is_active: c.is_active,
      created_at: c.created_at,
      updated_at: c.updated_at,
      products_count: c.products?.length || 0,
    })),
  };
}
