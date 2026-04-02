import { Module } from '@nestjs/common';

import { TestimonialController } from './testimonial.controller';
import { TestimonialService } from './testimonial.service';

@Module({
  providers: [TestimonialService],
  controllers: [TestimonialController],
})
export class TestimonialModule {}
