import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const razorpay = await prisma.setting.findUnique({ where: { key: 'razorpay_key_id' } });
    const razorpaySecret = await prisma.setting.findUnique({ where: { key: 'razorpay_key_secret' } });
    const currency = await prisma.setting.findUnique({ where: { key: 'currency' } });
    
    return NextResponse.json({
      razorpay_key_id: razorpay?.value || '',
      razorpay_key_secret: '',
      enabled: !!razorpay?.value,
      currency: currency?.value || 'USD',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { razorpay_key_id, razorpay_key_secret, currency, enabled } = body;

    if (razorpay_key_id !== undefined) {
      await prisma.setting.upsert({
        where: { key: 'razorpay_key_id' },
        update: { value: razorpay_key_id },
        create: { key: 'razorpay_key_id', value: razorpay_key_id },
      });
    }

    if (razorpay_key_secret !== undefined) {
      await prisma.setting.upsert({
        where: { key: 'razorpay_key_secret' },
        update: { value: razorpay_key_secret },
        create: { key: 'razorpay_key_secret', value: razorpay_key_secret },
      });
    }

    if (currency !== undefined) {
      await prisma.setting.upsert({
        where: { key: 'currency' },
        update: { value: currency },
        create: { key: 'currency', value: currency },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}