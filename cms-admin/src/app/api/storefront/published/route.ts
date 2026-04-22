import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildStorefrontCorsHeaders } from '@/lib/storefront-payload';
import { getDefaultPublicSiteUrl } from '@/lib/domains';

export const dynamic = 'force-dynamic';

type JsonRecord = Record<string, unknown>;

function parseJson(value: string | null | undefined): JsonRecord {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? (parsed as JsonRecord) : {};
  } catch {
    return {};
  }
}

function parseJsonArray<T>(value: string | null | undefined, fallback: T[] = []): T[] {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeNavigationLinks(raw: unknown) {
  if (typeof raw === 'string') {
    return parseJsonArray(raw);
  }

  if (Array.isArray(raw)) {
    return raw;
  }

  return [];
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: buildStorefrontCorsHeaders(request.headers.get('origin')),
  });
}

export async function GET(request: NextRequest) {
  try {
    const [
      globalSettings,
      settings,
      announcementBar,
      navigations,
      sections,
      pages,
      products,
      collections,
    ] = await Promise.all([
      prisma.globalSettings.findFirst({
        orderBy: { updated_at: 'desc' },
      }),
      prisma.setting.findMany(),
      prisma.announcementBar.findFirst({
        where: { is_active: true },
        orderBy: { created_at: 'desc' },
      }),
      prisma.navigation.findMany({
        where: { is_active: true },
      }),
      prisma.section.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { position: 'asc' },
      }),
      prisma.page.findMany({
        where: { is_active: true },
        orderBy: { updated_at: 'desc' },
      }),
      prisma.product.findMany({
        where: { is_active: true },
        include: {
          images: {
            orderBy: { sort_order: 'asc' },
          },
          collections: {
            include: {
              collection: true,
            },
          },
        },
        orderBy: { updated_at: 'desc' },
      }),
      prisma.collection.findMany({
        where: { is_active: true },
        include: {
          products: true,
        },
        orderBy: [{ sort_order: 'asc' }, { updated_at: 'desc' }],
      }),
    ]);

    const settingsMap = settings.reduce<Record<string, string>>((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    const navigationByLocation = navigations.reduce<Record<string, unknown[]>>((acc, item) => {
      acc[item.location] = normalizeNavigationLinks(item.links);
      return acc;
    }, {});

    const payloadSections = sections.map((section) => ({
      id: section.id,
      key: section.section_key,
      type: section.section_type,
      title: section.title,
      position: section.position,
      status: section.status,
      styling: parseJson(section.styling || '{}'),
      content: parseJson(section.content),
      published_at: section.published_at,
      updated_at: section.updated_at,
    }));

    const payloadProducts = products.map((product) => ({
      id: product.id,
      handle: product.handle,
      title: product.title,
      short_description: product.short_description,
      description: product.description,
      description_html: product.description_html,
      badge: product.badge,
      category: product.category,
      tags: product.tags,
      flavor_options: product.flavor_options,
      size_options: product.size_options,
      price: Number(product.price),
      compare_at_price: product.compare_at_price !== null ? Number(product.compare_at_price) : null,
      sku: product.sku,
      inventory: product.inventory,
      is_active: product.is_active,
      is_featured: product.is_featured,
      seo_title: product.seo_title,
      seo_description: product.seo_description,
      images: product.images.map((image) => image.url),
      featured_image: product.images[0]?.url || null,
      gallery_images: product.images.slice(1).map((image) => image.url),
      collection_ids: product.collections.map((relation) => relation.collection_id),
      collection_handles: product.collections.map((relation) => relation.collection.handle),
      updated_at: product.updated_at,
    }));

    const payloadCollections = collections.map((collection) => ({
      id: collection.id,
      handle: collection.handle,
      title: collection.title,
      description: collection.description,
      image: collection.image,
      seo_title: collection.seo_title,
      seo_description: collection.seo_description,
      sort_order: collection.sort_order,
      is_active: collection.is_active,
      product_ids: collection.products.map((relation) => relation.product_id),
      products_count: collection.products.length,
      updated_at: collection.updated_at,
    }));

    const payloadPages = pages.map((page) => ({
      id: page.id,
      title: page.title,
      handle: page.handle,
      content: page.content,
      excerpt: page.excerpt,
      featured_image: page.featured_image,
      template: page.template,
      meta_title: page.meta_title,
      meta_description: page.meta_description,
      is_featured: page.is_featured,
      updated_at: page.updated_at,
    }));

    const settingsPayload = {
      store_name: globalSettings?.store_name || settingsMap.store_name || 'HD MUSCLE',
      store_email: globalSettings?.store_email || settingsMap.store_email || '',
      store_phone: globalSettings?.store_phone || settingsMap.store_phone || '',
      store_address: globalSettings?.store_address || settingsMap.store_address || '',
      currency: globalSettings?.currency || settingsMap.currency || 'INR',
      locale: settingsMap.locale || 'en-IN',
      symbol: settingsMap.symbol || '₹',
      timezone: globalSettings?.timezone || settingsMap.timezone || 'Asia/Kolkata',
      logo: globalSettings?.logo || settingsMap.logo || '',
      favicon: globalSettings?.favicon || settingsMap.favicon || '',
      primary_color: globalSettings?.primary_color || settingsMap.primary_color || '#f59e0b',
      accent_color: globalSettings?.accent_color || settingsMap.accent_color || '#ea580c',
      seo_title: settingsMap.seo_title || '',
      seo_description: settingsMap.seo_description || '',
      announcement_text:
        announcementBar?.message ||
        settingsMap.announcement_text ||
        'FREE SHIPPING ON ORDERS OVER ₹9,999',
      announcement_link: announcementBar?.link || settingsMap.announcement_link || '',
      instagram_url: settingsMap.instagram_url || '',
      facebook_url: settingsMap.facebook_url || '',
      youtube_url: settingsMap.youtube_url || '',
      tiktok_url: settingsMap.tiktok_url || '',
      copyright_text: settingsMap.copyright_text || '',
      public_site_url: settingsMap.public_site_url || getDefaultPublicSiteUrl(),
    };

    const payload = {
      generatedAt: new Date().toISOString(),
      settings: settingsPayload,
      navigation: {
        header_main: navigationByLocation.header || [],
        footer_main: navigationByLocation.footer || [],
        mobile: navigationByLocation.mobile || [],
      },
      sections: payloadSections,
      pages: payloadPages,
      products: payloadProducts,
      collections: payloadCollections,
      site: {
        name: settingsPayload.store_name,
        seoTitle: settingsPayload.seo_title || null,
        seoDescription: settingsPayload.seo_description || null,
        publicSiteUrl: settingsPayload.public_site_url,
        announcementText: settingsPayload.announcement_text,
        announcementLink: settingsPayload.announcement_link || null,
        instagramUrl: settingsPayload.instagram_url || null,
        facebookUrl: settingsPayload.facebook_url || null,
        copyrightText: settingsPayload.copyright_text || null,
        supportEmail: settingsPayload.store_email || null,
        supportPhone: settingsPayload.store_phone || null,
        currency: settingsPayload.currency,
        timezone: settingsPayload.timezone,
        address: settingsPayload.store_address || null,
      },
      publishedSections: payloadSections,
    };

    return NextResponse.json(payload, {
      headers: buildStorefrontCorsHeaders(request.headers.get('origin')),
    });
  } catch (error) {
    console.error('Published storefront payload error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch published storefront content' },
      {
        status: 500,
        headers: buildStorefrontCorsHeaders(request.headers.get('origin')),
      },
    );
  }
}
