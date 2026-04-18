import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get(key: string) {
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    return setting?.value || null;
  }

  async set(key: string, value: any, description?: string) {
    return this.prisma.setting.upsert({
      where: { key },
      create: { key, value, description },
      update: { value },
    });
  }

  async getAll() {
    const settings = await this.prisma.setting.findMany();
    return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
  }

  async delete(key: string) {
    await this.prisma.setting.delete({ where: { key } });
    return { success: true };
  }
}
