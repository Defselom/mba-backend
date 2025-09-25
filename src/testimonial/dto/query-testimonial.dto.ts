import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsEnum, IsOptional, IsString } from 'class-validator';

import { ModerationStatus } from '@/../generated/prisma';
import { PaginationDto } from '@/shared/dto';

export class QueryTestimonialDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by moderation status', enum: ModerationStatus })
  @IsOptional()
  @IsEnum(ModerationStatus)
  status?: ModerationStatus;

  @ApiPropertyOptional({ description: 'Filter by author userId ' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by related webinarId ' })
  @IsOptional()
  @IsString()
  webinarId?: string;
}
