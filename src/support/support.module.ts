import { Module } from '@nestjs/common';

import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { UploadModule } from '@/upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
