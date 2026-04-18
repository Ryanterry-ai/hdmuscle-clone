import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DiscountsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.discount.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const discount = await this.prisma.discount.findUnique({ where: { id } });
    if (!discount) {
      throw new NotFoundException('Discount not found');
    }
    return discount;
  }

  async findByCode(code: string) {
    const discount = await this.prisma.discount.findUnique({ where: { code } });
    if (!discount) {
      throw new NotFoundException('Discount not found');
    }
    return discount;
  }

  async create(data: any) {
    return this.prisma.discount.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.discount.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.discount.delete({ where: { id } });
    return { success: true };
  }

  async validate(code: string, cartTotal: number) {
    const discount = await this.prisma.discount.findUnique({ where: { code } });

    if (!discount) {
      return { valid: false, message: 'Invalid discount code' };
    }

    if (discount.status !== 'ACTIVE') {
      return { valid: false, message: 'Discount is not active' };
    }

    if (discount.starts_at && new Date() < discount.starts_at) {
      return { valid: false, message: 'Discount has not started yet' };
    }

    if (discount.expires_at && new Date() > discount.expires_at) {
      return { valid: false, message: 'Discount has expired' };
    }

    if (discount.usage_limit && discount.used_count >= discount.usage_limit) {
      return { valid: false, message: 'Discount usage limit reached' };
    }

    if (discount.min_order_value && cartTotal < Number(discount.min_order_value)) {
      return { valid: false, message: `Minimum order value is ${discount.min_order_value}` };
    }

    let discountAmount = 0;
    if (discount.type === 'PERCENTAGE') {
      discountAmount = (cartTotal * Number(discount.value)) / 100;
      if (discount.max_discount && discountAmount > Number(discount.max_discount)) {
        discountAmount = Number(discount.max_discount);
      }
    } else if (discount.type === 'FIXED_AMOUNT') {
      discountAmount = Number(discount.value);
    }

    return { valid: true, discount, discountAmount };
  }

  async incrementUsage(id: string) {
    return this.prisma.discount.update({
      where: { id },
      data: { used_count: { increment: 1 } },
    });
  }
}
