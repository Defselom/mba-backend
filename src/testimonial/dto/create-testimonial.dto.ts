import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateTestimonialDto {
  @ApiProperty({
    description: 'Testimonial content',
    minLength: 10,
    example: 'This is an amazing webinar that provided great insights!',
  })
  @IsString()
  content!: string;

  @ApiPropertyOptional({ description: 'Optional rating from 1 to 5', minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ description: 'Optional associated webinar ID', example: 'uuid-123' })
  @IsOptional()
  @IsString()
  webinarId?: string;
}
