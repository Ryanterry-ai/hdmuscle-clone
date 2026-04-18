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

    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      prisma.page.count({ where }),
    ]);

    return NextResponse.json({ pages, total, skip, take });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { handle } = body;
    
    const existing = await prisma.page.findUnique({ where: { handle } });
    if (existing) {
      return NextResponse.json({ error: 'Page handle already exists' }, { status: 400 });
    }

    const page = await prisma.page.create({ data: body });
    return NextResponse.json(page);
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}