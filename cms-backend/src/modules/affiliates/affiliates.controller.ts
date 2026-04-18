import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AffiliatesService } from './affiliates.service';

@ApiTags('Affiliates')
@Controller('affiliates')
export class AffiliatesController {
  constructor(private affiliatesService: AffiliatesService) {}

  @Get() async findAll() { return this.affiliatesService.findAll(); }
  @Get(':id') async findOne(@Param('id') id: string) { return this.affiliatesService.findOne(id); }
  @Get('code/:code') async findByCode(@Param('code') code: string) { return this.affiliatesService.findByCode(code); }
  @Post() async create(@Body() data: any) { return this.affiliatesService.create(data); }
  @Put(':id') async update(@Param('id') id: string, @Body() data: any) { return this.affiliatesService.update(id, data); }
  @Delete(':id') async delete(@Param('id') id: string) { return this.affiliatesService.delete(id); }
  @Post('record-order') async recordOrder(@Body() data: { affiliateId: string; orderId: string; commission: number }) {
    return this.affiliatesService.recordOrder(data.affiliateId, data.orderId, data.commission);
  }
}
