import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
