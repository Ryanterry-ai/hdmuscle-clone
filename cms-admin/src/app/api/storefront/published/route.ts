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
    const [settings, sections] = await Promise.all([
      prisma.setting.findMany(),
      prisma.section.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { position: 'asc' },
      }),
    ]);

    const payload = buildPublishedStorefrontPayload(settings, sections);

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
