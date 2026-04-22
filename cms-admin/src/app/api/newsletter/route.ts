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

    const subscribers = await prisma.newsletter.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    const stats = {
      total: subscribers.length,
      active: subscribers.filter(s => s.is_active).length,
      bySource: subscribers.reduce((acc, s) => {
        const source = s.source || 'unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({ subscribers, stats });
  } catch (error) {
    console.error('Error fetching newsletter:', error);
    return NextResponse.json({ error: 'Failed to fetch newsletter' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source } = body;

    const existing = await prisma.newsletter.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already subscribed' }, { status: 400 });
    }

    const subscriber = await prisma.newsletter.create({
      data: { email, source: source || 'manual', is_active: true },
    });
    return NextResponse.json(subscriber);
  } catch (error) {
    console.error('Error subscribing:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}