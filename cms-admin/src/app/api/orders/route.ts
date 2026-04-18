import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('take') || '50');

    const where: any = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
        include: {
          items: {
            include: { product: true }
          }
        }
      }),
      prisma.order.count({ where })
    ]);

    return NextResponse.json({ orders, total, skip, take });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer, payment_id, subtotal, shipping, tax, total } = body;

    // Create order
    const order = await prisma.order.create({
      data: {
        order_number: `HDM-${Date.now()}`,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        shipping_address: customer.address,
        city: customer.city,
        state: customer.state,
        pincode: customer.pincode,
        country: customer.country || 'India',
        subtotal: subtotal,
        shipping_cost: shipping || 0,
        tax: tax || 0,
        total: total,
        status: payment_id ? 'PAID' : 'PENDING',
        payment_id: payment_id,
        payment_method: 'Razorpay',
        payment_status: payment_id ? 'COMPLETED' : 'PENDING',
      },
      include: {
        items: true
      }
    });

    // Create order items
    for (const item of items) {
      await prisma.orderItem.create({
        data: {
          order_id: order.id,
          product_id: item.product_id,
          product_title: item.title,
          product_price: item.price,
          quantity: item.quantity,
        }
      });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}