import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ContentModule } from './modules/content/content.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { DiscountsModule } from './modules/discounts/discounts.module';
import { AffiliatesModule } from './modules/affiliates/affiliates.module';
import { MediaModule } from './modules/media/media.module';
import { PopupsModule } from './modules/popups/popups.module';
import { FormsModule } from './modules/forms/forms.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SeoModule } from './modules/seo/seo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    ProductsModule,
    CollectionsModule,
    OrdersModule,
    CustomersModule,
    ContentModule,
    PaymentsModule,
    DiscountsModule,
    AffiliatesModule,
    MediaModule,
    PopupsModule,
    FormsModule,
    NewsletterModule,
    AnalyticsModule,
    SettingsModule,
    SeoModule,
  ],
})
export class AppModule {}
