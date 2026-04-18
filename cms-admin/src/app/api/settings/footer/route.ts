import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let settings = await prisma.footerSettings.findFirst();
    if (!settings) {
      settings = await prisma.footerSettings.create({
        data: { id: 'default' }
      });
    }
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const settings = await prisma.footerSettings.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        description: body.description || '',
        show_newsletter: body.show_newsletter ?? true,
        columns: body.columns || '[]',
        copyright: body.copyright || '',
      },
      update: {
        description: body.description || '',
        show_newsletter: body.show_newsletter ?? true,
        columns: body.columns || '[]',
        copyright: body.copyright || '',
      },
    });
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}