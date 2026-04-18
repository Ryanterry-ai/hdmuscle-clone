import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async trackPageView(data: { path: string; referrer?: string; user_agent?: string; ip?: string }) {
    return this.prisma.pageView.create({ data });
  }

  async getStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalViews, uniqueViews] = await Promise.all([
      this.prisma.pageView.count({ where: { created_at: { gte: startDate } } }),
      this.prisma.pageView.groupBy({ by: ['ip'], where: { created_at: { gte: startDate } } }),
    ]);

    const topPages = await this.prisma.$queryRaw`
      SELECT path, COUNT(*) as views 
      FROM page_views 
      WHERE created_at >= ${startDate}
      GROUP BY path 
      ORDER BY views DESC 
      LIMIT 10
    `;

    return { totalViews, uniqueViews: uniqueViews.length, topPages };
  }
}
