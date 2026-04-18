import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const seoRecords = await prisma.sEO.findMany({
      orderBy: { page: 'asc' },
    });
    return NextResponse.json({ seo: seoRecords });
  } catch (error) {
    console.error('Error fetching SEO:', error);
    return NextResponse.json({ error: 'Failed to fetch SEO' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { page } = body;
    
    const existing = await prisma.sEO.findUnique({ where: { page } });
    if (existing) {
      const seo = await prisma.sEO.update({
        where: { page },
        data: body,
      });
      return NextResponse.json(seo);
    }

    const seo = await prisma.sEO.create({ data: body });
    return NextResponse.json(seo);
  } catch (error) {
    console.error('Error saving SEO:', error);
    return NextResponse.json({ error: 'Failed to save SEO' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    if (page) {
      await prisma.sEO.delete({ where: { page } });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting SEO:', error);
    return NextResponse.json({ error: 'Failed to delete SEO' }, { status: 500 });
  }
}