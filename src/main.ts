import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import cookieParser from 'cookie-parser';

import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? ['https://mba-frontend-3gl7.vercel.app', 'http://localhost:3000', 'http://127.0.0.1:3000']
      : [
          'http://localhost:3000',
          'http://127.0.0.1:3000',
          'http://192.168.1.83:3000',
          'http://192.168.1.87:3000',
          'https://mba-frontend-3gl7.vercel.app/',
        ];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400,
  });

  app.use(helmet());

  app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.use(cookieParser(process.env.JWT_SECRET));

  const config = new DocumentBuilder()
    .setTitle('MBA API')
    .setDescription('The MBA API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
