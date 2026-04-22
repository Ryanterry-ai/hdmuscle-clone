import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession, unauthorizedResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('take') || '50');
    const search = searchParams.get('search');

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { first_name: { contains: search } },
        { last_name: { contains: search } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: { select: { orders: true, addresses: true } },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take,
      }),
      prisma.customer.count({ where }),
    ]);

    return NextResponse.json({
      customers: customers.map(c => ({
        ...c,
        orders_count: c._count.orders,
        addresses_count: c._count.addresses,
        _count: undefined,
      })),
      total,
      skip,
      take,
    });
  } catch (error) {
    console.error('Customers error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
