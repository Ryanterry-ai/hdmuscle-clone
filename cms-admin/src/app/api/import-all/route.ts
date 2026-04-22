import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession, unauthorizedResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

const RESET_CONFIRM_TOKEN = 'RESET IMPORT CMS';
const DEFAULT_IMPORT_SOURCE_URL = 'https://hdmuscle.in/api/storefront/published/';
const RUPEE_SYMBOL = String.fromCharCode(8377);

type JsonRecord = Record<string, unknown>;
type JsonArray = unknown[];

type ImportResults = {
  products: { imported: number; skipped: number };
  collections: { imported: number; skipped: number };
  pages: { imported: number; skipped: number };
  sections: { imported: number; skipped: number };
  navigation: { imported: number; skipped: number };
  seo: { imported: number; skipped: number };
  productCollections: { linked: number };
  errors: string[];
};

function asObject(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function asArray(value: unknown): JsonArray {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback;
  const normalized = String(value).trim();
  return normalized.length ? normalized : fallback;
}

function asOptionalString(value: unknown): string | null {
  const normalized = asString(value);
  return normalized.length ? normalized : null;
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function asDate(value: unknown): Date | null {
  if (!value) return null;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function parseJsonIfString(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const normalized = value.trim();
  if (!normalized) return [];
  try {
    return JSON.parse(normalized);
  } catch {
    return [];
  }
}

function normalizeLinkTree(raw: unknown): JsonRecord[] {
  const parsed = parseJsonIfString(raw);
  const links = asArray(parsed);

  return links
    .map((item) => {
      const record = asObject(item);
      const label = asString(record.label);
      const url = asString(record.url, '/');
      if (!label && !url) return null;

      const children = normalizeLinkTree(record.children);
      return {
        label: label || url,
        url,
        ...(children.length > 0 ? { children } : {}),
      } as JsonRecord;
    })
    .filter(Boolean) as JsonRecord[];
}

function dedupeStrings(values: string[]): string[] {
  const unique = new Set<string>();
  for (const value of values) {
    const normalized = value.trim();
    if (!normalized) continue;
    unique.add(normalized);
  }
  return Array.from(unique);
}

function getImportSourceUrl(body: JsonRecord): string {
  const fromBody = asString(body.sourceUrl);
  if (fromBody) return fromBody;
  const fromEnv = asString(process.env.CMS_IMPORT_SOURCE_URL);
  if (fromEnv) return fromEnv;
  return DEFAULT_IMPORT_SOURCE_URL;
}

async function fetchSourcePayload(sourceUrl: string) {
  const response = await fetch(sourceUrl, {
    method: 'GET',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Import source request failed (${response.status}).`);
  }

  return (await response.json()) as JsonRecord;
}

async function clearExistingContent() {
  await prisma.productCollection.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.collection.deleteMany({});
  await prisma.page.deleteMany({});
  await prisma.section.deleteMany({});
  await prisma.navigation.deleteMany({});
  await prisma.sEO.deleteMany({});
  await prisma.announcementBar.deleteMany({});
  await prisma.setting.deleteMany({});
  await prisma.globalSettings.deleteMany({});
}

async function importSettings(payload: JsonRecord) {
  const settings = asObject(payload.settings);
  const site = asObject(payload.site);

  const merged = {
    store_name: asString(settings.store_name || site.name, 'HD MUSCLE'),
    store_email: asString(settings.store_email || site.supportEmail),
    store_phone: asString(settings.store_phone || site.supportPhone),
    store_address: asString(settings.store_address || site.address),
    timezone: asString(settings.timezone || site.timezone, 'Asia/Kolkata'),
    logo: asString(settings.logo),
    favicon: asString(settings.favicon),
    primary_color: asString(settings.primary_color, '#f59e0b'),
    accent_color: asString(settings.accent_color, '#ea580c'),
    locale: asString(settings.locale, 'en-IN'),
    symbol: asString(settings.symbol, RUPEE_SYMBOL),
    seo_title: asString(settings.seo_title || site.seoTitle),
    seo_description: asString(settings.seo_description || site.seoDescription),
    announcement_text: asString(settings.announcement_text || site.announcementText, `FREE SHIPPING OVER ${RUPEE_SYMBOL}9,999`),
    announcement_link: asString(settings.announcement_link || site.announcementLink),
    instagram_url: asString(settings.instagram_url || site.instagramUrl),
    facebook_url: asString(settings.facebook_url || site.facebookUrl),
    youtube_url: asString(settings.youtube_url || site.youtubeUrl),
    tiktok_url: asString(settings.tiktok_url || site.tiktokUrl),
    copyright_text: asString(settings.copyright_text || site.copyrightText),
    public_site_url: asString(settings.public_site_url || site.publicSiteUrl, 'https://hdmuscle.in'),
  };

  await prisma.globalSettings.create({
    data: {
      id: 'default',
      store_name: merged.store_name,
      store_email: merged.store_email || null,
      store_phone: merged.store_phone || null,
      store_address: merged.store_address || null,
      currency: 'INR',
      timezone: merged.timezone,
      logo: merged.logo || null,
      favicon: merged.favicon || null,
      primary_color: merged.primary_color,
      accent_color: merged.accent_color,
    },
  });

  const settingPairs: Array<[string, string]> = [
    ['store_name', merged.store_name],
    ['store_email', merged.store_email],
    ['store_phone', merged.store_phone],
    ['store_address', merged.store_address],
    ['currency', 'INR'],
    ['locale', merged.locale],
    ['symbol', merged.symbol || RUPEE_SYMBOL],
    ['timezone', merged.timezone],
    ['logo', merged.logo],
    ['favicon', merged.favicon],
    ['primary_color', merged.primary_color],
    ['accent_color', merged.accent_color],
    ['seo_title', merged.seo_title],
    ['seo_description', merged.seo_description],
    ['announcement_text', merged.announcement_text],
    ['announcement_link', merged.announcement_link],
    ['instagram_url', merged.instagram_url],
    ['facebook_url', merged.facebook_url],
    ['youtube_url', merged.youtube_url],
    ['tiktok_url', merged.tiktok_url],
    ['copyright_text', merged.copyright_text],
    ['public_site_url', merged.public_site_url],
  ];

  for (const [key, value] of settingPairs) {
    await prisma.setting.create({
      data: {
        key,
        value,
      },
    });
  }

  await prisma.announcementBar.create({
    data: {
      message: merged.announcement_text,
      link: merged.announcement_link || null,
      is_active: true,
    },
  });

  return merged;
}

function toSectionKey(item: JsonRecord, index: number, existing: Set<string>): string {
  const rawKey =
    asString(item.key) ||
    asString(item.section_key) ||
    asString(item.title) ||
    `section-${index + 1}`;
  let candidate = toSlug(rawKey) || `section-${index + 1}`;
  while (existing.has(candidate)) {
    candidate = `${candidate}-${index + 1}`;
  }
  existing.add(candidate);
  return candidate;
}

export async function POST(request: NextRequest) {
  const results: ImportResults = {
    products: { imported: 0, skipped: 0 },
    collections: { imported: 0, skipped: 0 },
    pages: { imported: 0, skipped: 0 },
    sections: { imported: 0, skipped: 0 },
    navigation: { imported: 0, skipped: 0 },
    seo: { imported: 0, skipped: 0 },
    productCollections: { linked: 0 },
    errors: [],
  };

  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const body = (await request.json().catch(() => ({}))) as JsonRecord;
    const confirmToken = asString(body.confirmToken);
    const acknowledgeReset = body.acknowledgeReset === true;

    if (!acknowledgeReset || confirmToken !== RESET_CONFIRM_TOKEN) {
      return NextResponse.json(
        {
          error:
            'Destructive import blocked. Confirm the reset warning and enter the exact confirmation phrase.',
          requiredConfirmToken: RESET_CONFIRM_TOKEN,
        },
        { status: 400 },
      );
    }

    const sourceUrl = getImportSourceUrl(body);
    const payload = await fetchSourcePayload(sourceUrl);

    await clearExistingContent();
    const importedSettings = await importSettings(payload);

    const collectionByHandle = new Map<string, string>();
    const collectionByLegacyId = new Map<string, string>();
    const productByHandle = new Map<string, string>();
    const productByLegacyId = new Map<string, string>();
    const linkedPairs = new Set<string>();

    const rawCollections = asArray(payload.collections).map((item) => asObject(item));
    for (const rawCollection of rawCollections) {
      const handle = toSlug(asString(rawCollection.handle || rawCollection.id));
      const title = asString(rawCollection.title, handle.toUpperCase());

      if (!handle || !title) {
        results.collections.skipped += 1;
        continue;
      }

      try {
        const created = await prisma.collection.create({
          data: {
            handle,
            title,
            description: asOptionalString(rawCollection.description),
            image: asOptionalString(rawCollection.image),
            seo_title: asOptionalString(rawCollection.seo_title),
            seo_description: asOptionalString(rawCollection.seo_description),
            sort_order: Math.max(0, Math.floor(asNumber(rawCollection.sort_order, 0))),
            is_active: asBoolean(rawCollection.is_active, true),
          },
        });

        collectionByHandle.set(handle, created.id);
        const legacyId = asString(rawCollection.id);
        if (legacyId) collectionByLegacyId.set(legacyId, created.id);
        results.collections.imported += 1;
      } catch (error) {
        results.collections.skipped += 1;
        results.errors.push(`Collection ${handle}: ${String(error)}`);
      }
    }

    const rawProducts = asArray(payload.products).map((item) => asObject(item));
    for (const rawProduct of rawProducts) {
      const handle = toSlug(asString(rawProduct.handle || rawProduct.id));
      const title = asString(rawProduct.title, handle.toUpperCase());
      if (!handle || !title) {
        results.products.skipped += 1;
        continue;
      }

      const imageCandidates = dedupeStrings([
        ...asArray(parseJsonIfString(rawProduct.images)).map((image) => asString(image)).filter(Boolean),
        asString(rawProduct.featured_image),
        ...asArray(parseJsonIfString(rawProduct.gallery_images)).map((image) => asString(image)).filter(Boolean),
      ]);

      try {
        const created = await prisma.product.create({
          data: {
            handle,
            title,
            short_description: asOptionalString(rawProduct.short_description),
            description: asOptionalString(rawProduct.description),
            description_html: asOptionalString(rawProduct.description_html),
            badge: asOptionalString(rawProduct.badge),
            category: asOptionalString(rawProduct.category),
            tags: asOptionalString(rawProduct.tags),
            flavor_options: asOptionalString(rawProduct.flavor_options),
            size_options: asOptionalString(rawProduct.size_options),
            price: asNumber(rawProduct.price, 0),
            compare_at_price: asNullableNumber(rawProduct.compare_at_price),
            sku: asOptionalString(rawProduct.sku),
            inventory: Math.max(0, Math.floor(asNumber(rawProduct.inventory, 0))),
            is_active: asBoolean(rawProduct.is_active, true),
            is_featured: asBoolean(rawProduct.is_featured, false),
            is_taxable: true,
            track_inventory: true,
            seo_title: asOptionalString(rawProduct.seo_title),
            seo_description: asOptionalString(rawProduct.seo_description),
            images: imageCandidates.length
              ? {
                  create: imageCandidates.map((url, index) => ({
                    url,
                    sort_order: index,
                  })),
                }
              : undefined,
          },
        });

        productByHandle.set(handle, created.id);
        const legacyId = asString(rawProduct.id);
        if (legacyId) productByLegacyId.set(legacyId, created.id);
        results.products.imported += 1;
      } catch (error) {
        results.products.skipped += 1;
        results.errors.push(`Product ${handle}: ${String(error)}`);
      }
    }

    for (const rawProduct of rawProducts) {
      const productId = productByHandle.get(toSlug(asString(rawProduct.handle || rawProduct.id)));
      if (!productId) continue;

      const handlesFromPayload = asArray(parseJsonIfString(rawProduct.collection_handles))
        .map((item) => toSlug(asString(item)))
        .filter(Boolean);

      const idsFromPayload = asArray(parseJsonIfString(rawProduct.collection_ids))
        .map((item) => asString(item))
        .filter(Boolean);

      const targetCollectionIds = dedupeStrings([
        ...handlesFromPayload.map((handle) => collectionByHandle.get(handle) || '').filter(Boolean),
        ...idsFromPayload.map((id) => collectionByLegacyId.get(id) || '').filter(Boolean),
      ]);

      for (const collectionId of targetCollectionIds) {
        const pairKey = `${productId}:${collectionId}`;
        if (linkedPairs.has(pairKey)) continue;
        linkedPairs.add(pairKey);

        try {
          await prisma.productCollection.create({
            data: {
              product_id: productId,
              collection_id: collectionId,
            },
          });
          results.productCollections.linked += 1;
        } catch {
          // Skip duplicate links gracefully.
        }
      }
    }

    for (const rawCollection of rawCollections) {
      const collectionId =
        collectionByHandle.get(toSlug(asString(rawCollection.handle || rawCollection.id))) || null;
      if (!collectionId) continue;

      const productIds = asArray(parseJsonIfString(rawCollection.product_ids))
        .map((item) => asString(item))
        .filter(Boolean);

      for (const legacyProductId of productIds) {
        const productId = productByLegacyId.get(legacyProductId);
        if (!productId) continue;
        const pairKey = `${productId}:${collectionId}`;
        if (linkedPairs.has(pairKey)) continue;
        linkedPairs.add(pairKey);

        try {
          await prisma.productCollection.create({
            data: {
              product_id: productId,
              collection_id: collectionId,
            },
          });
          results.productCollections.linked += 1;
        } catch {
          // Skip duplicate links gracefully.
        }
      }
    }

    const rawPages = asArray(payload.pages).map((item) => asObject(item));
    for (const rawPage of rawPages) {
      const handle = toSlug(asString(rawPage.handle || rawPage.title || rawPage.id));
      const title = asString(rawPage.title, handle.toUpperCase());

      if (!handle || !title) {
        results.pages.skipped += 1;
        continue;
      }

      try {
        await prisma.page.create({
          data: {
            handle,
            title,
            excerpt: asOptionalString(rawPage.excerpt),
            content: asOptionalString(rawPage.content),
            featured_image: asOptionalString(rawPage.featured_image),
            template: asString(rawPage.template, 'default'),
            is_active: asBoolean(rawPage.is_active, true),
            is_featured: asBoolean(rawPage.is_featured, false),
            meta_title: asOptionalString(rawPage.meta_title),
            meta_description: asOptionalString(rawPage.meta_description),
          },
        });
        results.pages.imported += 1;
      } catch (error) {
        results.pages.skipped += 1;
        results.errors.push(`Page ${handle}: ${String(error)}`);
      }
    }

    const seenSectionKeys = new Set<string>();
    const rawSections = asArray(payload.sections).map((item) => asObject(item));
    for (let index = 0; index < rawSections.length; index += 1) {
      const rawSection = rawSections[index];
      const sectionKey = toSectionKey(rawSection, index, seenSectionKeys);

      try {
        await prisma.section.create({
          data: {
            section_key: sectionKey,
            section_type: asString(rawSection.type || rawSection.section_type, 'custom'),
            title: asOptionalString(rawSection.title),
            content:
              typeof rawSection.content === 'string'
                ? rawSection.content
                : JSON.stringify(asObject(rawSection.content)),
            styling:
              typeof rawSection.styling === 'string'
                ? rawSection.styling
                : JSON.stringify(asObject(rawSection.styling)),
            position: Math.max(0, Math.floor(asNumber(rawSection.position, index))),
            status: asString(rawSection.status, 'PUBLISHED').toUpperCase() === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
            published_at: asDate(rawSection.published_at),
          },
        });
        results.sections.imported += 1;
      } catch (error) {
        results.sections.skipped += 1;
        results.errors.push(`Section ${sectionKey}: ${String(error)}`);
      }
    }

    const navigation = asObject(payload.navigation);
    const navigationSources: Array<{ location: string; title: string; links: unknown }> = [
      { location: 'header', title: 'Header Navigation', links: navigation.header_main },
      { location: 'footer', title: 'Footer Navigation', links: navigation.footer_main },
      { location: 'mobile', title: 'Mobile Navigation', links: navigation.mobile },
    ];

    for (const source of navigationSources) {
      const links = normalizeLinkTree(source.links);
      try {
        await prisma.navigation.create({
          data: {
            location: source.location,
            title: source.title,
            links: JSON.stringify(links),
            is_active: true,
          },
        });
        results.navigation.imported += 1;
      } catch (error) {
        results.navigation.skipped += 1;
        results.errors.push(`Navigation ${source.location}: ${String(error)}`);
      }
    }

    const seoRecords = new Map<string, { title: string; description: string }>();
    const rawSeo = asArray(payload.seo).map((item) => asObject(item));
    for (const record of rawSeo) {
      const page = toSlug(asString(record.page || record.handle || record.id));
      if (!page) continue;
      seoRecords.set(page, {
        title: asString(record.title || record.seo_title),
        description: asString(record.description || record.seo_description),
      });
    }

    if (!seoRecords.has('home')) {
      seoRecords.set('home', {
        title: asString(payload.settings && asObject(payload.settings).seo_title),
        description: asString(payload.settings && asObject(payload.settings).seo_description),
      });
    }

    for (const page of rawPages) {
      const handle = toSlug(asString(page.handle));
      if (!handle || seoRecords.has(handle)) continue;
      seoRecords.set(handle, {
        title: asString(page.meta_title),
        description: asString(page.meta_description),
      });
    }

    for (const [page, seo] of Array.from(seoRecords.entries())) {
      if (!seo.title && !seo.description) continue;
      try {
        await prisma.sEO.create({
          data: {
            page,
            title: seo.title || null,
            description: seo.description || null,
          },
        });
        results.seo.imported += 1;
      } catch (error) {
        results.seo.skipped += 1;
        results.errors.push(`SEO ${page}: ${String(error)}`);
      }
    }

    return NextResponse.json({
      success: true,
      sourceUrl,
      generatedAt: asString(payload.generatedAt, new Date().toISOString()),
      currency: importedSettings ? 'INR' : 'INR',
      results,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const [products, collections, pages, sections, navigation, seo, productCollections] = await Promise.all([
      prisma.product.count(),
      prisma.collection.count(),
      prisma.page.count(),
      prisma.section.count(),
      prisma.navigation.count(),
      prisma.sEO.count(),
      prisma.productCollection.count(),
    ]);

    return NextResponse.json({
      sourceUrl: process.env.CMS_IMPORT_SOURCE_URL || DEFAULT_IMPORT_SOURCE_URL,
      requiredConfirmToken: RESET_CONFIRM_TOKEN,
      stats: { products, collections, pages, sections, navigation, seo, productCollections },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
