import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SeoService } from './seo.service';

@ApiTags('SEO')
@Controller('seo')
export class SeoController {
  constructor(private seoService: SeoService) {}

  @Get() async getAll() { return this.seoService.getAll(); }
  @Get(':page') async get(@Param('page') page: string) { return this.seoService.get(page); }
  @Put(':page') async update(@Param('page') page: string, @Body() data: { title?: string; description?: string; keywords?: string; og_image?: string }) { return this.seoService.update(page, data); }
}
