import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { section_keys } = body;

    // Publish specific sections
    if (section_keys && section_keys.length > 0) {
      for (const key of section_keys) {
        await prisma.section.updateMany({
          where: { section_key: key },
          data: { status: 'PUBLISHED', published_at: new Date() },
        });
      }
      return NextResponse.json({ success: true, message: `Published ${section_keys.length} sections` });
    }

    // Publish all sections
    const result = await prisma.section.updateMany({
      where: { status: { not: 'PUBLISHED' } },
      data: { status: 'PUBLISHED', published_at: new Date() },
    });

    // Publish pages
    await prisma.page.updateMany({
      where: { is_active: true },
      data: {},
    });

    // Publish navigation
    await prisma.navigation.updateMany({
      where: { is_active: true },
      data: {},
    });

    return NextResponse.json({ success: true, message: 'All content published' });
  } catch (error: any) {
    console.error('Publish error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const [draftSections, publishedSections] = await Promise.all([
      prisma.section.count({ where: { status: 'DRAFT' } }),
      prisma.section.count({ where: { status: 'PUBLISHED' } }),
    ]);

    return NextResponse.json({
      draft: draftSections,
      published: publishedSections,
      hasChanges: draftSections > 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}