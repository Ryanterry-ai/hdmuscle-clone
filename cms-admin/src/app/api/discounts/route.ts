import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession, unauthorizedResponse } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const discounts = await prisma.discount.findMany({
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ discounts, total: discounts.length });
  } catch (error) {
    console.error('Discounts error:', error);
    return NextResponse.json({ error: 'Failed to fetch discounts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    const discount = await prisma.discount.create({
      data: {
        code: body.code,
        title: body.title,
        description: body.description,
        type: body.type,
        value: body.value,
        min_order_value: body.min_order_value,
        max_discount: body.max_discount,
        usage_limit: body.usage_limit,
        starts_at: body.starts_at ? new Date(body.starts_at) : null,
        expires_at: body.expires_at ? new Date(body.expires_at) : null,
        status: body.status ?? 'ACTIVE',
        is_auto_apply: body.is_auto_apply ?? false,
        product_ids: body.product_ids,
        collection_ids: body.collection_ids,
      },
    });
    return NextResponse.json(discount);
  } catch (error) {
    console.error('Create discount error:', error);
    return NextResponse.json({ error: 'Failed to create discount' }, { status: 500 });
  }
}
