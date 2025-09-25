import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

import { DocumentType } from '@/../generated/prisma';
import { PaginationDto } from '@/shared/dto';

export class QueryDocumentDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by document type', enum: DocumentType })
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @ApiPropertyOptional({ description: 'Filter by legal domain' })
  @IsOptional()
  @IsString()
  legalDomain?: string;

  @ApiPropertyOptional({ description: 'Published after this date' })
  @IsOptional()
  @IsDateString()
  publishedAfter?: Date;

  @ApiPropertyOptional({ description: 'Published before this date' })
  @IsOptional()
  @IsDateString()
  publishedBefore?: Date;
}
