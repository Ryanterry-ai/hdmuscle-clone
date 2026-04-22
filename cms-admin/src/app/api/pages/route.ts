import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0', 10);
    const take = parseInt(searchParams.get('take') || '50', 10);
    const search = searchParams.get('search')?.trim();
    const isActive = searchParams.get('is_active');

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { handle: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive === 'true' || isActive === 'false') {
      where.is_active = isActive === 'true';
    }

    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        skip,
        take,
        orderBy: { updated_at: 'desc' },
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
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    const title = String(body.title || '').trim();
    const handle = toSlug(String(body.handle || title));

    if (!title || !handle) {
      return NextResponse.json({ error: 'Title and handle are required' }, { status: 400 });
    }

    const existing = await prisma.page.findUnique({ where: { handle } });
    if (existing) {
      return NextResponse.json({ error: 'Page handle already exists' }, { status: 400 });
    }

    const page = await prisma.page.create({
      data: {
        title,
        handle,
        excerpt: body.excerpt || null,
        content: body.content || null,
        featured_image: body.featured_image || null,
        template: body.template || 'default',
        is_active: body.is_active ?? true,
        is_featured: body.is_featured ?? false,
        meta_title: body.meta_title || null,
        meta_description: body.meta_description || null,
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}

