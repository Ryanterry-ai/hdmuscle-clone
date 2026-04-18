import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const is_active = searchParams.get('is_active');

    const where: any = {};
    if (is_active !== null && is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    const affiliates = await prisma.affiliate.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    const stats = {
      total: affiliates.length,
      active: affiliates.filter(a => a.is_active).length,
      totalOrders: affiliates.reduce((sum, a) => sum + a.orders_count, 0),
      totalEarnings: affiliates.reduce((sum, a) => sum + Number(a.total_earnings), 0),
    };

    return NextResponse.json({ affiliates, stats });
  } catch (error) {
    console.error('Error fetching affiliates:', error);
    return NextResponse.json({ error: 'Failed to fetch affiliates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;
    
    const existing = await prisma.affiliate.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: 'Affiliate code already exists' }, { status: 400 });
    }

    const affiliate = await prisma.affiliate.create({ data: body });
    return NextResponse.json(affiliate);
  } catch (error) {
    console.error('Error creating affiliate:', error);
    return NextResponse.json({ error: 'Failed to create affiliate' }, { status: 500 });
  }
}