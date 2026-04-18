import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PopupsService } from './popups.service';

@ApiTags('Popups')
@Controller('popups')
export class PopupsController {
  constructor(private popupsService: PopupsService) {}

  @Get() async findAll() { return this.popupsService.findAll(); }
  @Get('active') async findActive() { return this.popupsService.findActive(); }
  @Get(':id') async findOne(@Param('id') id: string) { return this.popupsService.findOne(id); }
  @Post() async create(@Body() data: any) { return this.popupsService.create(data); }
  @Put(':id') async update(@Param('id') id: string, @Body() data: any) { return this.popupsService.update(id, data); }
  @Delete(':id') async delete(@Param('id') id: string) { return this.popupsService.delete(id); }
}
