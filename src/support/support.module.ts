import { Module } from '@nestjs/common';

import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { PrismaService } from '@/prisma/prisma.service';
import { UploadService } from '@/upload/upload.service';

@Module({
  controllers: [SupportController],
  providers: [SupportService, PrismaService, UploadService],
})
export class SupportModule {}
