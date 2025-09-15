import { ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsDateString, IsInt, Min, Max } from 'class-validator';

import { SupportType } from '@/../generated/prisma';

export class SupportQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Number of items per page' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'createdAt', description: 'Field to sort by' })
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    example: 'desc',
    description: 'Sort order',
    enum: ['asc', 'desc'],
  })
  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Filter by support type',
    enum: SupportType,
  })
  @IsEnum(SupportType)
  @IsOptional()
  type?: SupportType;

  @ApiPropertyOptional({ example: 'search term', description: 'Search in title' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: '2024-01-01', description: 'Filter from date (ISO string)' })
  @IsDateString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'Filter to date (ISO string)' })
  @IsDateString()
  @IsOptional()
  to?: string;
}
