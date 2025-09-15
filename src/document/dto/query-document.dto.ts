import { ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

import { DocumentType } from '@/../generated/prisma';

export class QueryDocumentDto {
  @ApiPropertyOptional({ description: 'Filter by document type', enum: DocumentType })
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @ApiPropertyOptional({ description: 'Filter by legal domain' })
  @IsOptional()
  @IsString()
  legalDomain?: string;

  @ApiPropertyOptional({ description: 'Search in title or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Published after this date' })
  @IsOptional()
  @IsDateString()
  publishedAfter?: Date;

  @ApiPropertyOptional({ description: 'Published before this date' })
  @IsOptional()
  @IsDateString()
  publishedBefore?: Date;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  page: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @Type(() => Number)
  limit: number = 10;
}
