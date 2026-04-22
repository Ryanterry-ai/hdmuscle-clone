import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Razorpay from 'razorpay';

export const dynamic = 'force-dynamic';

async function getRazorpay() {
  const keyId = await prisma.setting.findUnique({ where: { key: 'razorpay_key_id' } });
  const keySecret = await prisma.setting.findUnique({ where: { key: 'razorpay_key_secret' } });

  if (!keyId?.value || !keySecret?.value) {
    throw new Error('Razorpay not configured');
  }

  return new Razorpay({
    key_id: keyId.value,
    key_secret: keySecret.value,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer, subtotal, shipping = 0, tax = 0 } = body;

    const total = subtotal + shipping + tax;
    const amountInPaise = Math.round(total * 100);

    const razorpay = await getRazorpay();

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'USD',
      receipt: `HDM-${Date.now()}`,
      notes: {
        customer_name: customer.name,
        customer_email: customer.email,
      }
    });

    const keyId = await prisma.setting.findUnique({ where: { key: 'razorpay_key_id' } });

    return NextResponse.json({
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: keyId?.value || ''
    });
  } catch (error: any) {
    console.error('Razorpay error:', error);
    return NextResponse.json({ 
      error: error.message || 'Payment initialization failed'
    }, { status: 500 });
  }
}