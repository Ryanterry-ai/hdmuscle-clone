import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SeoService {
  constructor(private prisma: PrismaService) {}

  async get(page: string) {
    const seo = await this.prisma.sEO.findUnique({ where: { page } });
    return seo || { page, title: null, description: null, keywords: null, og_image: null };
  }

  async update(page: string, data: { title?: string; description?: string; keywords?: string; og_image?: string }) {
    return this.prisma.sEO.upsert({
      where: { page },
      create: { page, ...data },
      update: data,
    });
  }

  async getAll() {
    return this.prisma.sEO.findMany();
  }
}
