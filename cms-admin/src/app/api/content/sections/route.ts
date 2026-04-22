import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession, unauthorizedResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const sections = await prisma.section.findMany({
      orderBy: { position: 'asc' },
    });
    return NextResponse.json({ sections, count: sections.length });
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    const section = await prisma.section.upsert({
      where: { section_key: body.section_key },
      create: body,
      update: {
        section_type: body.section_type,
        title: body.title,
        content: body.content,
        position: body.position ?? 0,
        status: body.status ?? 'DRAFT',
        styling: body.styling,
        published_at: body.status === 'PUBLISHED' ? new Date() : null,
        version: { increment: 1 },
      },
    });
    return NextResponse.json(section);
  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
  }
}

