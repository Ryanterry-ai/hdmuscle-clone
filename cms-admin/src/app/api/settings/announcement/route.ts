import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession, unauthorizedResponse } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const announcement = await prisma.announcementBar.findFirst({
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json({ announcement });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    
    // Delete old announcements and create new one
    await prisma.announcementBar.deleteMany({});
    
    const announcement = await prisma.announcementBar.create({
      data: {
        message: body.message || '',
        link: body.link || '',
        is_active: body.is_active ?? true,
        starts_at: body.starts_at ? new Date(body.starts_at) : null,
        expires_at: body.expires_at ? new Date(body.expires_at) : null,
      },
    });
    
    return NextResponse.json({ announcement });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
