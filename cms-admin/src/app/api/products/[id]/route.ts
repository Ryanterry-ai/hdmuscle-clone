import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireSession, unauthorizedResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function normalizeOptionalString(value: unknown) {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  return normalized.length ? normalized : null;
}

function normalizeBoolean(value: unknown, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }
  return fallback;
}

function normalizeNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeImageUrls(raw: unknown, featuredImage?: string | null) {
  const urls: string[] = [];

  if (featuredImage && featuredImage.trim()) {
    urls.push(featuredImage.trim());
  }

  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item === 'string' && item.trim()) {
        urls.push(item.trim());
      } else if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>;
        if (typeof record.url === 'string' && record.url.trim()) {
          urls.push(record.url.trim());
        }
      }
    }
  }

  return Array.from(new Set(urls));
}

function normalizeCollectionIds(raw: unknown) {
  if (!Array.isArray(raw)) return [] as string[];
  return raw.map((id) => String(id).trim()).filter(Boolean);
}

async function revalidateStorefront() {
  revalidatePath('/');
  revalidatePath('/api/products');
  revalidatePath('/products');
  revalidatePath('/collections');
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sort_order: 'asc' } },
        collections: { include: { collection: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;

    const featuredImage = normalizeOptionalString(body.featured_image ?? body.featuredImage ?? body.image);
    const images = normalizeImageUrls(body.images, featuredImage);
    const collectionIds = normalizeCollectionIds(body.collection_ids ?? body.collectionIds);

    const updateData = {
      title: String(body.title || '').trim(),
      handle: toSlug(String(body.handle || body.title || '').trim()),
      short_description: normalizeOptionalString(body.short_description),
      description: normalizeOptionalString(body.description),
      description_html: normalizeOptionalString(body.description_html),
      badge: normalizeOptionalString(body.badge),
      category: normalizeOptionalString(body.category),
      tags: Array.isArray(body.tags)
        ? (body.tags as unknown[]).map((tag) => String(tag).trim()).filter(Boolean).join(',')
        : normalizeOptionalString(body.tags),
      flavor_options: Array.isArray(body.flavor_options)
        ? (body.flavor_options as unknown[]).map((value) => String(value).trim()).filter(Boolean).join(',')
        : normalizeOptionalString(body.flavor_options),
      size_options: Array.isArray(body.size_options)
        ? (body.size_options as unknown[]).map((value) => String(value).trim()).filter(Boolean).join(',')
        : normalizeOptionalString(body.size_options),
      price: normalizeNumber(body.price, 0),
      compare_at_price: normalizeNullableNumber(body.compare_at_price ?? body.compareAtPrice),
      cost_per_item: normalizeNullableNumber(body.cost_per_item),
      weight: normalizeNullableNumber(body.weight),
      weight_unit: normalizeOptionalString(body.weight_unit),
      is_active: normalizeBoolean(body.is_active, true),
      is_featured: normalizeBoolean(body.is_featured, false),
      is_taxable: normalizeBoolean(body.is_taxable, true),
      tax_rate: normalizeNullableNumber(body.tax_rate),
      sku: normalizeOptionalString(body.sku),
      barcode: normalizeOptionalString(body.barcode),
      inventory: Math.max(0, Math.floor(normalizeNumber(body.inventory, 0))),
      track_inventory: normalizeBoolean(body.track_inventory, true),
      seo_title: normalizeOptionalString(body.seo_title),
      seo_description: normalizeOptionalString(body.seo_description),
    };

    const product = await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { product_id: id } });
      await tx.productCollection.deleteMany({ where: { product_id: id } });

      return tx.product.update({
        where: { id },
        data: {
          ...updateData,
          images: images.length
            ? {
                create: images.map((url, index) => ({
                  url,
                  sort_order: index,
                })),
              }
            : undefined,
          collections: collectionIds.length
            ? {
                create: collectionIds.map((collectionId) => ({
                  collection: { connect: { id: collectionId } },
                })),
              }
            : undefined,
        },
        include: {
          images: { orderBy: { sort_order: 'asc' } },
          collections: { include: { collection: true } },
        },
      });
    });

    await revalidateStorefront();

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return PATCH(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const { id } = await context.params;
    await prisma.product.delete({ where: { id } });

    await revalidateStorefront();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

