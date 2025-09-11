import { Module } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { WebinarController } from '@/webinaire/webinar.controller';
import { WebinarService } from '@/webinaire/webinar.service';

@Module({
  providers: [WebinarService, PrismaService],
  controllers: [WebinarController],
})
export class WebinarModule {}
