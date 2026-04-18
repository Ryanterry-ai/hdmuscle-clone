import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { skip?: number; take?: number; search?: string }) {
    const { skip = 0, take = 50, search } = params;

    const where: Prisma.CustomerWhereInput = {};

    if (search) {
      const searchLower = search.toLowerCase();
      where.OR = [
        { email: { contains: searchLower } },
        { first_name: { contains: searchLower } },
        { last_name: { contains: searchLower } },
      ];
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take,
        include: {
          addresses: true,
          _count: { select: { orders: true } },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return { customers, total, skip, take };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: true,
        orders: { orderBy: { created_at: 'desc' } },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async create(data: Prisma.CustomerCreateInput) {
    return this.prisma.customer.create({ data });
  }

  async update(id: string, data: Prisma.CustomerUpdateInput) {
    return this.prisma.customer.update({ where: { id }, data });
  }

  async getStats() {
    const [total, newThisMonth] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.customer.count({
        where: {
          created_at: {
            gte: new Date(new Date().setDate(1)),
          },
        },
      }),
    ]);

    return { total, newThisMonth };
  }
}
