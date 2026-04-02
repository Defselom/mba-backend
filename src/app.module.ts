import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { PrismaClientExceptionFilter } from './shared/filters/prisma-client-exception.filter';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DocumentModule } from './document/document.module';
import { EmailTestModule } from './email/email-test.module';
import { EmailModule } from './email/email.module';
import { PartnerApplicationsModule } from './partner-applications/partner-applications.module';
import { PrismaModule } from './prisma/prisma.module';
import { SupportModule } from './support/support.module';
import { TestimonialModule } from './testimonial/testimonial.module';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './user/user.module';
import { WebinarModule } from './webinaire/webinar.module';
import { HttpCacheInterceptor } from '@/shared/interceptors';
@Module({
  imports: [
    AuthModule,
    UserModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WebinarModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 50000,
    }),
    UploadModule,
    SupportModule,
    TestimonialModule,
    DocumentModule,
    PartnerApplicationsModule,
    EmailModule,
    ...(process.env.NODE_ENV === 'development' ? [EmailTestModule] : []),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpCacheInterceptor,
    },
  ],
})
export class AppModule {}
