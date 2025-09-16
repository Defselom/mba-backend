import { Module } from '@nestjs/common';

import { PartnerApplicationsController } from './partner-applications.controller';
import { PartnerApplicationsService } from './partner-applications.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PartnerApplicationsService],
  controllers: [PartnerApplicationsController],
})
export class PartnerApplicationsModule {}
