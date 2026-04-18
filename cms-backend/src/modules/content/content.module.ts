import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { StorefrontController } from './storefront.controller';

@Module({
  controllers: [ContentController, StorefrontController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
