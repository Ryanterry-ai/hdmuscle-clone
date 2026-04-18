import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NewsletterService } from './newsletter.service';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private newsletterService: NewsletterService) {}

  @Post('subscribe')
  async subscribe(@Body() body: { email: string; source?: string }) {
    return this.newsletterService.subscribe(body.email, body.source);
  }

  @Post('unsubscribe')
  async unsubscribe(@Body() body: { email: string }) {
    return this.newsletterService.unsubscribe(body.email);
  }

  @Get() async findAll() { return this.newsletterService.findAll(); }
  @Get('stats') async getStats() { return this.newsletterService.getStats(); }
}
