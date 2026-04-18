import { Controller, Get, Post, Put, Delete, Body, Param, Ip } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FormsService } from './forms.service';

@ApiTags('Forms')
@Controller('forms')
export class FormsController {
  constructor(private formsService: FormsService) {}

  @Get() async findAll() { return this.formsService.findAll(); }
  @Get(':id') async findOne(@Param('id') id: string) { return this.formsService.findOne(id); }
  @Get(':id/submissions') async getSubmissions(@Param('id') id: string) { return this.formsService.getSubmissions(id); }
  @Post(':id/submit') async submit(@Param('id') id: string, @Body() data: any, @Ip() ip: string) { return this.formsService.submit(id, data, ip); }
  @Post() async create(@Body() data: any) { return this.formsService.create(data); }
  @Put(':id') async update(@Param('id') id: string, @Body() data: any) { return this.formsService.update(id, data); }
  @Delete(':id') async delete(@Param('id') id: string) { return this.formsService.delete(id); }
}
