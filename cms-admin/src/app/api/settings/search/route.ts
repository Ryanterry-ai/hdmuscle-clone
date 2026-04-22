import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession, unauthorizedResponse } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    let settings = await prisma.searchSettings.findFirst();
    if (!settings) {
      settings = await prisma.searchSettings.create({
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
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    let trendingTerms = body.trending_terms;
    if (typeof trendingTerms === 'string') {
      trendingTerms = JSON.parse(trendingTerms);
    }
    
    const settings = await prisma.searchSettings.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        placeholder: body.placeholder || 'Search products...',
        show_trending: body.show_trending ?? true,
        trending_terms: JSON.stringify(trendingTerms || []),
      },
      update: {
        placeholder: body.placeholder || 'Search products...',
        show_trending: body.show_trending ?? true,
        trending_terms: JSON.stringify(trendingTerms || []),
      },
    });
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
