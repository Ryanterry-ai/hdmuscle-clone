import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession, unauthorizedResponse } from '@/lib/api-auth';

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

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const { id } = await context.params;
    const page = await prisma.page.findUnique({ where: { id } });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const { id } = await context.params;
    const body = await request.json();

    const title = String(body.title || '').trim();
    const handle = toSlug(String(body.handle || title));

    if (!title || !handle) {
      return NextResponse.json({ error: 'Title and handle are required' }, { status: 400 });
    }

    const existing = await prisma.page.findUnique({ where: { handle } });
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: 'Page handle already exists' }, { status: 400 });
    }

    const page = await prisma.page.update({
      where: { id },
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
    console.error('Error updating page:', error);
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return PUT(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const { id } = await context.params;
    await prisma.page.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}

