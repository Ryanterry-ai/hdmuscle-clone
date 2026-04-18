import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AffiliatesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.affiliate.findMany({ orderBy: { created_at: 'desc' } });
  }

  async findOne(id: string) {
    const affiliate = await this.prisma.affiliate.findUnique({ where: { id } });
    if (!affiliate) throw new NotFoundException('Affiliate not found');
    return affiliate;
  }

  async findByCode(code: string) {
    return this.prisma.affiliate.findUnique({ where: { code } });
  }

  async create(data: any) {
    return this.prisma.affiliate.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.affiliate.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.affiliate.delete({ where: { id } });
    return { success: true };
  }

  async recordOrder(affiliateId: string, orderId: string, commission: number) {
    const [affiliateOrder] = await Promise.all([
      this.prisma.affiliateOrder.create({
        data: { affiliate_id: affiliateId, order_id: orderId, commission },
      }),
      this.prisma.affiliate.update({
        where: { id: affiliateId },
        data: { 
          orders_count: { increment: 1 },
          total_earnings: { increment: commission },
        },
      }),
    ]);
    return affiliateOrder;
  }
}
