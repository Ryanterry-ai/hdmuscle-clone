import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { ContentService } from './content.service';

@ApiTags('Storefront')
@Controller('storefront')
export class StorefrontController {
  constructor(private contentService: ContentService) {}

  @Get('sections')
  async getSections(@Query('active') active?: string) {
    return this.contentService.getAllSections(active === 'true');
  }

  @Get('sections/:sectionKey')
  async getSectionByKey(@Param('sectionKey') sectionKey: string) {
    return this.contentService.getSectionByKey(sectionKey);
  }

  @Get('sections/type/:sectionType')
  @ApiQuery({ name: 'active', required: false, type: String })
  async getSectionsByType(
    @Param('sectionType') sectionType: string,
    @Query('active') active?: string,
  ) {
    return this.contentService.getSectionsByType(sectionType, active !== 'false');
  }

  @Get('navigation/:location')
  async getNavigation(@Param('location') location: string) {
    return this.contentService.getNavigation(location);
  }
}
