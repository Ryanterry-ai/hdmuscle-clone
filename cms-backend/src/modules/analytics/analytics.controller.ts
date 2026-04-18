import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('track')
  async trackPageView(@Body() data: { path: string; referrer?: string; user_agent?: string; ip?: string }) {
    return this.analyticsService.trackPageView(data);
  }

  @Get('stats')
  async getStats(@Query('days') days?: number) {
    return this.analyticsService.getStats(days ? Number(days) : 30);
  }
}
