import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession, unauthorizedResponse } from '@/lib/api-auth';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const { id } = await context.params;
    await prisma.media.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete media error:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const { id } = await context.params;
    const body = await request.json();

    const media = await prisma.media.update({
      where: { id },
      data: {
        alt_text: typeof body.alt_text === 'string' ? body.alt_text : null,
        filename: typeof body.filename === 'string' && body.filename.trim() ? body.filename.trim() : undefined,
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error('Update media error:', error);
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 });
  }
}

