import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { requireSession, unauthorizedResponse } from '@/lib/api-auth';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const { id } = await context.params;
    const section = await prisma.section.findUnique({ where: { id } });

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    return NextResponse.json(section);
  } catch (error) {
    console.error('Error fetching section:', error);
    return NextResponse.json({ error: 'Failed to fetch section' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const { id } = await context.params;
    const body = await request.json();

    const status = typeof body.status === 'string' ? body.status : undefined;
    const publishedAt =
      status === 'PUBLISHED'
        ? body.published_at
          ? new Date(body.published_at)
          : new Date()
        : status
          ? null
          : undefined;

    const section = await prisma.section.update({
      where: { id },
      data: {
        section_key: body.section_key,
        section_type: body.section_type,
        title: body.title,
        content: body.content,
        position: body.position,
        status,
        styling: body.styling,
        published_at: publishedAt,
        version: { increment: 1 },
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const { id } = await context.params;
    await prisma.section.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting section:', error);
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 });
  }
}

