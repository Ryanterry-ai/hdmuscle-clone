import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DiscountsService } from './discounts.service';

@ApiTags('Discounts')
@Controller('discounts')
export class DiscountsController {
  constructor(private discountsService: DiscountsService) {}

  @Get()
  async findAll() {
    return this.discountsService.findAll();
  }

  @Get('validate')
  async validate(@Query('code') code: string, @Query('total') total: string) {
    return this.discountsService.validate(code, parseFloat(total || '0'));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.discountsService.findOne(id);
  }

  @Get('code/:code')
  async findByCode(@Param('code') code: string) {
    return this.discountsService.findByCode(code);
  }

  @Post()
  async create(@Body() data: any) {
    return this.discountsService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.discountsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.discountsService.delete(id);
  }
}
