import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NewsletterService {
  constructor(private prisma: PrismaService) {}

  async subscribe(email: string, source?: string) {
    const existing = await this.prisma.newsletter.findUnique({ where: { email } });
    if (existing) {
      if (!existing.is_active) {
        return this.prisma.newsletter.update({ where: { email }, data: { is_active: true } });
      }
      throw new ConflictException('Email already subscribed');
    }
    return this.prisma.newsletter.create({ data: { email, source } });
  }

  async unsubscribe(email: string) {
    return this.prisma.newsletter.update({ where: { email }, data: { is_active: false } });
  }

  async findAll() {
    return this.prisma.newsletter.findMany({ where: { is_active: true }, orderBy: { created_at: 'desc' } });
  }

  async getStats() {
    const [total, thisMonth] = await Promise.all([
      this.prisma.newsletter.count({ where: { is_active: true } }),
      this.prisma.newsletter.count({ where: { is_active: true, created_at: { gte: new Date(new Date().setDate(1)) } } }),
    ]);
    return { total, thisMonth };
  }
}
