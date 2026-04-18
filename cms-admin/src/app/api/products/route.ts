import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('take') || '50');
    const search = searchParams.get('search')?.toLowerCase();
    const is_active = searchParams.get('is_active');

    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { handle: { contains: search } },
      ];
    }

    if (is_active !== null && is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        include: { images: true, collections: { include: { collection: true } } },
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
    const body = await request.json();
    const product = await prisma.product.create({ data: body });
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
