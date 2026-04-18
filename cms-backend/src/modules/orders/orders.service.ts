import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    status?: string;
    payment_status?: string;
    search?: string;
  }) {
    const { skip = 0, take = 50, status, payment_status, search } = params;

    const where: Prisma.OrderWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (payment_status) {
      where.payment_status = payment_status;
    }

    if (search) {
      const searchLower = search.toLowerCase();
      where.OR = [
        { order_number: { contains: searchLower } },
        { email: { contains: searchLower } },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        include: {
          items: { include: { product: { include: { images: true } } } },
          customer: true,
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { orders, total, skip, take };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: { include: { images: true } } } },
        customer: true,
        transactions: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async create(data: Prisma.OrderCreateInput) {
    return this.prisma.order.create({ data });
  }

  async update(id: string, data: Prisma.OrderUpdateInput) {
    return this.prisma.order.update({ where: { id }, data });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.order.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async getStats() {
    const [total, pending, processing, completed, revenue] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.count({ where: { status: 'PROCESSING' } }),
      this.prisma.order.count({ where: { status: 'DELIVERED' } }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { payment_status: 'COMPLETED' },
      }),
    ]);

    return {
      total,
      pending,
      processing,
      completed,
      revenue: revenue._sum.total || 0,
    };
  }
}
