import { Module } from '@nestjs/common';

import { EmailTestController } from '@/email/email-test.controller';
import { EmailModule } from '@/email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [EmailTestController],
})
export class EmailTestModule {}
