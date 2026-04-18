import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { skip?: number; take?: number; search?: string }) {
    const { skip = 0, take = 50, search } = params;
    const where = search ? { original_name: { contains: search, mode: 'insensitive' as const } } : {};
    
    const [media, total] = await Promise.all([
      this.prisma.media.findMany({ where, skip, take, orderBy: { created_at: 'desc' } }),
      this.prisma.media.count({ where }),
    ]);
    
    return { media, total, skip, take };
  }

  async findOne(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    return media;
  }

  async create(data: any) {
    return this.prisma.media.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.media.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.media.delete({ where: { id } });
    return { success: true };
  }
}
