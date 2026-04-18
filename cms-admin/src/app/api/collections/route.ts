import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const collections = await prisma.collection.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({
      collections: collections.map(c => ({
        ...c,
        products_count: c._count.products,
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
    const body = await request.json();
    const collection = await prisma.collection.create({
      data: {
        handle: body.handle || body.title.toLowerCase().replace(/\s+/g, '-'),
        title: body.title,
        description: body.description,
        image: body.image,
        is_active: body.is_active ?? true,
        sort_order: body.sort_order ?? 0,
      },
    });
    return NextResponse.json(collection);
  } catch (error) {
    console.error('Create collection error:', error);
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
  }
}
