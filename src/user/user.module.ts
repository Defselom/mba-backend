import { Module } from '@nestjs/common';

import { EmailModule } from '@/email/email.module';
import { PrismaService } from '@/prisma/prisma.service';
import { UploadService } from '@/upload/upload.service';
import { UserController } from '@/user/user.controller';
import { UserService } from '@/user/user.service';

@Module({
  imports: [EmailModule],
  controllers: [UserController],
  providers: [UserService, PrismaService, UploadService],
})
export class UserModule {}
