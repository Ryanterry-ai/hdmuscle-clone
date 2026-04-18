import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async createOrder(data: any) {
    const order = await this.prisma.order.create({
      data: {
        order_number: `ORD-${Date.now()}`,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        address1: data.address1,
        address2: data.address2,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country || 'India',
        subtotal: data.subtotal,
        shipping: data.shipping || 0,
        tax: data.tax || 0,
        discount: data.discount || 0,
        total: data.total,
        items: {
          create: data.items.map((item: any) => ({
            product_id: item.product_id,
            variant_id: item.variant_id,
            title: item.title,
            variant_title: item.variant_title,
            sku: item.sku,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
          })),
        },
      },
      include: { items: true },
    });

    return order;
  }

  async verifyPayment(razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string) {
    const crypto = require('crypto');
    const razorpaySecret = this.configService.get('RAZORPAY_SECRET') || 'secret';
    
    const generated_signature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    return generated_signature === razorpay_signature;
  }

  async confirmPayment(orderId: string, razorpayId: string, data: any) {
    return this.prisma.paymentTransaction.create({
      data: {
        order_id: orderId,
        razorpay_id: razorpayId,
        amount: data.amount,
        status: 'COMPLETED',
        method: data.method,
      },
    });
  }

  async getTransaction(razorpayId: string) {
    return this.prisma.paymentTransaction.findUnique({
      where: { razorpay_id: razorpayId },
      include: { order: true },
    });
  }
}
