import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import {
  buildPublishedStorefrontPayload,
  buildStorefrontCorsHeaders,
} from '@/lib/storefront-payload';

export const dynamic = 'force-dynamic';

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: buildStorefrontCorsHeaders(request.headers.get('origin')),
  });
}

export async function GET(request: NextRequest) {
  try {
    const [settings, sections, products, collections] = await Promise.all([
      prisma.setting.findMany(),
      prisma.section.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { position: 'asc' },
      }),
      prisma.product.findMany({
        where: { is_active: true },
        include: { collections: { include: { collection: true } } },
        orderBy: { created_at: 'desc' },
        take: 50,
      }),
      prisma.collection.findMany({
        where: { is_active: true },
        orderBy: { sort_order: 'asc' },
        take: 20,
      }),
    ]);

    const payload = buildPublishedStorefrontPayload(settings, sections, products, collections);

    return NextResponse.json(payload, {
      headers: buildStorefrontCorsHeaders(request.headers.get('origin')),
    });
  } catch (error) {
    console.error('Published storefront payload error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch published storefront content' },
      {
        status: 500,
        headers: buildStorefrontCorsHeaders(request.headers.get('origin')),
      },
    );
  }
}
