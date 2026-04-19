import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('take') || '50');
    const search = searchParams.get('search')?.toLowerCase();
    const is_active = searchParams.get('is_active');
    const collection_handle = searchParams.get('collection_handle');

    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { handle: { contains: search } },
      ];
    }

    // Only filter by is_active if explicitly passed
    if (is_active !== null && is_active !== undefined && is_active !== '' && is_active !== 'any') {
      where.is_active = is_active === 'true';
    }

    // Build include for collections if filtering by collection_handle
    const include: any = { images: true, collections: { include: { collection: true } } };
    
    // If filtering by collection handle, we need to use collections filter
    if (collection_handle) {
      include.collections = {
        some: {
          collection: { handle: collection_handle }
        }
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        include,
        orderBy: { created_at: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({ products, total, skip, take });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products', details: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Only save valid product fields
    const { id, images, collections, image, ...productData } = body;
    const product = await prisma.product.create({ data: productData });
    
    // Revalidate cache
    revalidatePath('/api/products');
    revalidatePath('/');
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { id, images, collections, image, ...productData } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: productData,
    });
    
    // Revalidate cache
    revalidatePath('/api/products');
    revalidatePath('/');
    
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  return PUT(request);
}
