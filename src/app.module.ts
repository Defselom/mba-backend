import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DocumentModule } from './document/document.module';
import { PrismaModule } from './prisma/prisma.module';
import { SupportModule } from './support/support.module';
import { TestimonialModule } from './testimonial/testimonial.module';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './user/user.module';
import { WebinarModule } from './webinaire/webinar.module';
import { HttpCacheInterceptor } from '@/shared/interceptors';
import { UserController } from '@/user/user.controller';
import { UserService } from '@/user/user.service';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PrismaModule,
    UserModule,
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
  ],
  controllers: [AppController, UserController],
  providers: [
    AppService,
    UserService,
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
