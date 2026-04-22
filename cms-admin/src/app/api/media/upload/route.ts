import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession, unauthorizedResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: 'File too large. Please keep uploads under 8MB.' },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safeMimeType = file.type || 'application/octet-stream';
    const url = `data:${safeMimeType};base64,${buffer.toString('base64')}`;

    const media = await prisma.media.create({
      data: {
        url,
        filename: file.name,
        mime_type: file.type,
        size: file.size,
      },
    });

    return NextResponse.json({ success: true, url, media });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

