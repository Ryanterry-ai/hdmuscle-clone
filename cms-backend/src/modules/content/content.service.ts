import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async getAllSections(activeOnly = false) {
    const where: Prisma.SectionWhereInput = activeOnly 
      ? { status: 'ACTIVE' } 
      : {};

    const sections = await this.prisma.section.findMany({
      where,
      orderBy: { position: 'asc' },
    });

    return { sections, count: sections.length };
  }

  async getSectionByKey(sectionKey: string) {
    const section = await this.prisma.section.findUnique({
      where: { section_key: sectionKey },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    return { section };
  }

  async getSectionsByType(sectionType: string, activeOnly = true) {
    const where: Prisma.SectionWhereInput = {
      section_type: sectionType,
      ...(activeOnly ? { status: 'ACTIVE' } : {}),
    };

    const sections = await this.prisma.section.findMany({
      where,
      orderBy: { position: 'asc' },
    });

    return { sections, count: sections.length };
  }

  async create(data: Prisma.SectionCreateInput) {
    return this.prisma.section.create({ data });
  }

  async update(id: string, data: Prisma.SectionUpdateInput) {
    return this.prisma.section.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.section.delete({ where: { id } });
    return { success: true };
  }

  async reorder(sections: { id: string; position: number }[]) {
    await Promise.all(
      sections.map(({ id, position }) =>
        this.prisma.section.update({
          where: { id },
          data: { position },
        })
      )
    );
    return { success: true };
  }

  async getNavigation(location: string) {
    const navigation = await this.prisma.navigation.findUnique({
      where: { location },
    });

    return { navigation: navigation || { location, items: [] } };
  }

  async updateNavigation(location: string, items: any) {
    const navigation = await this.prisma.navigation.upsert({
      where: { location },
      create: { location, items },
      update: { items },
    });

    return navigation;
  }

  async getSEO(page: string) {
    const seo = await this.prisma.sEO.findUnique({
      where: { page },
    });

    return seo || { page, title: null, description: null, keywords: null };
  }

  async updateSEO(page: string, data: { title?: string; description?: string; keywords?: string; og_image?: string }) {
    const seo = await this.prisma.sEO.upsert({
      where: { page },
      create: { page, ...data },
      update: data,
    });

    return seo;
  }
}
