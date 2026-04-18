import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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
    const body = await request.json();
    const section = await prisma.section.create({ data: body });
    return NextResponse.json(section);
  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
  }
}
