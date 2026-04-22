import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession, unauthorizedResponse } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    let settings = await prisma.cartDrawerSettings.findFirst();
    if (!settings) {
      settings = await prisma.cartDrawerSettings.create({
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
    const settings = await prisma.cartDrawerSettings.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        promo_headline: body.promo_headline || '',
        promo_message: body.promo_message || '',
        promo_image: body.promo_image || '',
        show_promo: body.show_promo ?? true,
        upsell_products: body.upsell_products || '[]',
      },
      update: {
        promo_headline: body.promo_headline || '',
        promo_message: body.promo_message || '',
        promo_image: body.promo_image || '',
        show_promo: body.show_promo ?? true,
        upsell_products: body.upsell_products || '[]',
      },
    });
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
