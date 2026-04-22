import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession, unauthorizedResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const googleAnalytics = await prisma.setting.findUnique({ where: { key: 'google_analytics_id' } });
    const googleTagManager = await prisma.setting.findUnique({ where: { key: 'google_tag_manager_id' } });
    const facebookPixel = await prisma.setting.findUnique({ where: { key: 'facebook_pixel_id' } });
    const shopifyAnalytics = await prisma.setting.findUnique({ where: { key: 'shopify_analytics' } });

    return NextResponse.json({
      google_analytics_id: googleAnalytics?.value || '',
      google_tag_manager_id: googleTagManager?.value || '',
      facebook_pixel_id: facebookPixel?.value || '',
      shopify_analytics: shopifyAnalytics?.value === 'true',
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    const settings = [
      { key: 'google_analytics_id', value: body.google_analytics_id },
      { key: 'google_tag_manager_id', value: body.google_tag_manager_id },
      { key: 'facebook_pixel_id', value: body.facebook_pixel_id },
      { key: 'shopify_analytics', value: body.shopify_analytics ? 'true' : 'false' },
    ];

    for (const setting of settings) {
      await prisma.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving analytics:', error);
    return NextResponse.json({ error: 'Failed to save analytics' }, { status: 500 });
  }
}
