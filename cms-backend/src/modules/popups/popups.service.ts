import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PopupsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.popup.findMany({ orderBy: { created_at: 'desc' } });
  }

  async findOne(id: string) {
    const popup = await this.prisma.popup.findUnique({ where: { id } });
    if (!popup) throw new NotFoundException('Popup not found');
    return popup;
  }

  async findActive() {
    const now = new Date();
    return this.prisma.popup.findFirst({
      where: {
        is_active: true,
        status: 'ACTIVE',
        OR: [
          { starts_at: null },
          { starts_at: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { expires_at: null },
              { expires_at: { gte: now } },
            ],
          },
        ],
      },
    });
  }

  async create(data: any) {
    return this.prisma.popup.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.popup.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.popup.delete({ where: { id } });
    return { success: true };
  }
}
