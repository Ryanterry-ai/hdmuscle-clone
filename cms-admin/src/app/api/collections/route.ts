import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireSession, unauthorizedResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

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

function normalizeCollectionIds(raw: unknown) {
  if (!Array.isArray(raw)) return [] as string[];
  return raw.map((id) => String(id).trim()).filter(Boolean);
}

async function revalidateStorefront() {
  revalidatePath('/');
  revalidatePath('/collections');
  revalidatePath('/api/storefront/published');
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const collections = await prisma.collection.findMany({
      include: {
        products: {
          include: {
            product: true,
          },
        },
        _count: { select: { products: true } },
      },
      orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }],
    });

    return NextResponse.json({
      collections: collections.map((collection) => ({
        ...collection,
        products_count: collection._count.products,
        product_ids: collection.products.map((relation) => relation.product_id),
        products: collection.products.map((relation) => relation.product),
        _count: undefined,
      })),
      total: collections.length,
    });
  } catch (error) {
    console.error('Collections error:', error);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    const title = String(body.title || '').trim();
    const handle = toSlug(String(body.handle || title));
    const productIds = normalizeCollectionIds(body.product_ids ?? body.productIds);

    if (!title || !handle) {
      return NextResponse.json({ error: 'Title and handle are required' }, { status: 400 });
    }

    const collection = await prisma.collection.create({
      data: {
        title,
        handle,
        description: normalizeOptionalString(body.description),
        image: normalizeOptionalString(body.image),
        seo_title: normalizeOptionalString(body.seo_title),
        seo_description: normalizeOptionalString(body.seo_description),
        is_active: normalizeBoolean(body.is_active, true),
        sort_order: Number(body.sort_order) || 0,
        products: productIds.length
          ? {
              create: productIds.map((productId) => ({
                product: { connect: { id: productId } },
              })),
            }
          : undefined,
      },
      include: {
        products: { include: { product: true } },
      },
    });

    await revalidateStorefront();

    return NextResponse.json(collection);
  } catch (error) {
    console.error('Create collection error:', error);
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
  }
}

