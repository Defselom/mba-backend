import { Module } from '@nestjs/common';

import { TestimonialController } from './testimonial.controller';
import { TestimonialService } from './testimonial.service';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  providers: [TestimonialService, PrismaService],
  controllers: [TestimonialController],
})
export class TestimonialModule {}
