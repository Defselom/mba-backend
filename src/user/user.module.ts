import { Module } from '@nestjs/common';

import { EmailModule } from '@/email/email.module';
import { UploadModule } from '@/upload/upload.module';
import { UserController } from '@/user/user.controller';
import { UserService } from '@/user/user.service';

@Module({
  imports: [EmailModule, UploadModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
