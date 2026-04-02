import { Module } from '@nestjs/common';

import { WebinarController } from '@/webinaire/webinar.controller';
import { WebinarService } from '@/webinaire/webinar.service';

@Module({
  providers: [WebinarService],
  controllers: [WebinarController],
})
export class WebinarModule {}
