import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession, unauthorizedResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const [products, collections, orders, customers, sections, settings, totalRevenue, recentOrders] =
      await Promise.all([
        prisma.product.count({ where: { is_active: true } }),
        prisma.collection.count({ where: { is_active: true } }),
        prisma.order.count(),
        prisma.customer.count(),
        prisma.section.count({ where: { status: 'PUBLISHED' } }),
        prisma.setting.findMany({
          where: {
            key: {
              in: [
                'public_site_url',
                'seo_title',
                'seo_description',
                'announcement_text',
                'instagram_url',
                'facebook_url',
                'copyright_text',
              ],
            },
          },
        }),
        prisma.order.aggregate({
          _sum: { total: true },
          where: { payment_status: 'PAID' },
        }),
        prisma.order.findMany({
          take: 5,
          orderBy: { created_at: 'desc' },
          include: { customer: true },
        }),
      ]);

    const settingsMap = settings.reduce<Record<string, string>>((accumulator, setting) => {
      accumulator[setting.key] = setting.value;
      return accumulator;
    }, {});

    return NextResponse.json({
      stats: {
        totalRevenue: totalRevenue._sum.total ? Number(totalRevenue._sum.total) : 0,
        orders,
        customers,
        products,
        collections,
        sections,
      },
      siteStatus: {
        publicSiteUrl: settingsMap.public_site_url || null,
        seoReady: Boolean(settingsMap.seo_title && settingsMap.seo_description),
        announcementReady: Boolean(settingsMap.announcement_text),
        socialReady: Boolean(settingsMap.instagram_url || settingsMap.facebook_url),
        copyrightReady: Boolean(settingsMap.copyright_text),
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer?.first_name
          ? `${order.customer.first_name} ${order.customer.last_name || ''}`.trim()
          : order.first_name || 'Guest',
        total: Number(order.total),
        status: order.status,
        created_at: order.created_at,
      })),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}

