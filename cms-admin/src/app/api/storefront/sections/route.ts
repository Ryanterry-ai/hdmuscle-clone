import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sections = await prisma.section.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { position: 'asc' },
    });
    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching storefront sections:', error);
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
  }
}
