import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MediaService } from './media.service';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Get()
  async findAll(@Query('skip') skip?: number, @Query('take') take?: number, @Query('search') search?: string) {
    return this.mediaService.findAll({ skip: skip ? Number(skip) : undefined, take: take ? Number(take) : undefined, search });
  }

  @Get(':id') async findOne(@Param('id') id: string) { return this.mediaService.findOne(id); }
  @Post() async create(@Body() data: any) { return this.mediaService.create(data); }
  @Put(':id') async update(@Param('id') id: string, @Body() data: any) { return this.mediaService.update(id, data); }
  @Delete(':id') async delete(@Param('id') id: string) { return this.mediaService.delete(id); }
}
