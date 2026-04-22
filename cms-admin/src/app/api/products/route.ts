import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireSession, unauthorizedResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

type ProductWriteInput = {
  title: string;
  handle: string;
  short_description?: string | null;
  description?: string | null;
  description_html?: string | null;
  badge?: string | null;
  category?: string | null;
  tags?: string | null;
  flavor_options?: string | null;
  size_options?: string | null;
  price: number;
  compare_at_price?: number | null;
  cost_per_item?: number | null;
  weight?: number | null;
  weight_unit?: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_taxable: boolean;
  tax_rate?: number | null;
  sku?: string | null;
  barcode?: string | null;
  inventory: number;
  track_inventory: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
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

function parseProductWriteInput(body: Record<string, unknown>): {
  data: ProductWriteInput;
  images: string[];
  collectionIds: string[];
} {
  const title = String(body.title || '').trim();
  const handle = String(body.handle || title).trim();
  const featuredImage = normalizeOptionalString(body.featured_image ?? body.featuredImage ?? body.image);

  const data: ProductWriteInput = {
    title,
    handle: toSlug(handle),
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

  return {
    data,
    images: normalizeImageUrls(body.images, featuredImage),
    collectionIds: normalizeCollectionIds(body.collection_ids ?? body.collectionIds),
  };
}

async function revalidateStorefront() {
  revalidatePath('/');
  revalidatePath('/api/products');
  revalidatePath('/products');
  revalidatePath('/collections');
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0', 10);
    const take = parseInt(searchParams.get('take') || '50', 10);
    const search = searchParams.get('search')?.trim();
    const isActive = searchParams.get('is_active');
    const collectionHandle = searchParams.get('collection_handle')?.trim();
    const category = searchParams.get('category')?.trim();

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { handle: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive === 'true' || isActive === 'false') {
      where.is_active = isActive === 'true';
    }

    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    if (collectionHandle) {
      where.collections = {
        some: {
          collection: { handle: collectionHandle },
        },
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        include: {
          images: { orderBy: { sort_order: 'asc' } },
          collections: { include: { collection: true } },
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({ products, total, skip, take });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const body = (await request.json()) as Record<string, unknown>;
    const { data, images, collectionIds } = parseProductWriteInput(body);

    if (!data.title || !data.handle) {
      return NextResponse.json({ error: 'Title and handle are required' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        ...data,
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

    await revalidateStorefront();

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const body = (await request.json()) as Record<string, unknown>;
    const id = String(body.id || '').trim();

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const { data, images, collectionIds } = parseProductWriteInput(body);

    const product = await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { product_id: id } });
      await tx.productCollection.deleteMany({ where: { product_id: id } });

      return tx.product.update({
        where: { id },
        data: {
          ...data,
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

export async function PATCH(request: NextRequest) {
  return PUT(request);
}
