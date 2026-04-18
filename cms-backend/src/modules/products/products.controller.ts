import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'collection_handle', required: false, type: String })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('search') search?: string,
    @Query('collection_handle') collection_handle?: string,
    @Query('is_active') is_active?: string,
  ) {
    return this.productsService.findAll({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      search,
      collection_handle,
      is_active: is_active !== undefined ? is_active === 'true' : undefined,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.productsService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.productsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
