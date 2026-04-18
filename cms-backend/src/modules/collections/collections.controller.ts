import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';

@ApiTags('Collections')
@Controller('collections')
export class CollectionsController {
  constructor(private collectionsService: CollectionsService) {}

  @Get()
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('search') search?: string,
  ) {
    return this.collectionsService.findAll({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      search,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.collectionsService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.collectionsService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.collectionsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.collectionsService.delete(id);
  }
}
