import { Controller, Get, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { CustomersService } from './customers.service';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Get()
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('search') search?: string,
  ) {
    return this.customersService.findAll({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      search,
    });
  }

  @Get('stats')
  async getStats() {
    return this.customersService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.customersService.update(id, data);
  }
}
