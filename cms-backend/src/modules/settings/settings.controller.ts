import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get() async getAll() { return this.settingsService.getAll(); }
  @Get(':key') async get(@Param('key') key: string) { return this.settingsService.get(key); }
  @Post() async set(@Body() body: { key: string; value: any; description?: string }) { return this.settingsService.set(body.key, body.value, body.description); }
  @Put(':key') async update(@Param('key') key: string, @Body() body: { value: any }) { return this.settingsService.set(key, body.value); }
  @Delete(':key') async delete(@Param('key') key: string) { return this.settingsService.delete(key); }
}
