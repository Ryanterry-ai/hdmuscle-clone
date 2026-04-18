import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const media = await prisma.media.findMany({
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ media, total: media.length });
  } catch (error) {
    console.error('Media error:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const media = await prisma.media.create({
      data: {
        url: body.url,
        filename: body.filename,
        mime_type: body.mime_type,
        size: body.size,
        alt_text: body.alt_text,
      },
    });
    return NextResponse.json(media);
  } catch (error) {
    console.error('Create media error:', error);
    return NextResponse.json({ error: 'Failed to create media' }, { status: 500 });
  }
}
