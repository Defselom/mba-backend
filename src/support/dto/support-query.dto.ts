import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsEnum, IsOptional, IsDateString } from 'class-validator';

import { SupportType } from '@/../generated/prisma';
import { PaginationDto } from '@/shared/dto';

export class SupportQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by support type',
    enum: SupportType,
  })
  @IsEnum(SupportType)
  @IsOptional()
  type?: SupportType;

  @ApiPropertyOptional({ example: '2024-01-01', description: 'Filter from date (ISO string)' })
  @IsDateString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'Filter to date (ISO string)' })
  @IsDateString()
  @IsOptional()
  to?: string;
}
