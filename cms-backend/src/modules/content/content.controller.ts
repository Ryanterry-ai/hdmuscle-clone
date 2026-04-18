import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContentService } from './content.service';

@ApiTags('Content')
@Controller('content')
export class ContentController {
  constructor(private contentService: ContentService) {}

  @Get('sections')
  async getAllSections() {
    return this.contentService.getAllSections();
  }

  @Get('sections/:id')
  async getSection(@Param('id') id: string) {
    return this.contentService.getSectionByKey(id);
  }

  @Post('sections')
  async createSection(@Body() data: any) {
    return this.contentService.create(data);
  }

  @Put('sections/:id')
  async updateSection(@Param('id') id: string, @Body() data: any) {
    return this.contentService.update(id, data);
  }

  @Delete('sections/:id')
  async deleteSection(@Param('id') id: string) {
    return this.contentService.delete(id);
  }

  @Post('sections/reorder')
  async reorderSections(@Body() sections: { id: string; position: number }[]) {
    return this.contentService.reorder(sections);
  }

  @Get('navigation/:location')
  async getNavigation(@Param('location') location: string) {
    return this.contentService.getNavigation(location);
  }

  @Put('navigation/:location')
  async updateNavigation(@Param('location') location: string, @Body() body: { items: any }) {
    return this.contentService.updateNavigation(location, body.items);
  }

  @Get('seo/:page')
  async getSEO(@Param('page') page: string) {
    return this.contentService.getSEO(page);
  }

  @Put('seo/:page')
  async updateSEO(@Param('page') page: string, @Body() data: any) {
    return this.contentService.updateSEO(page, data);
  }
}
