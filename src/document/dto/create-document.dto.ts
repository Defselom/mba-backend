import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { DocumentType } from '@/../generated/prisma';

export class CreateDocumentDto {
  @ApiProperty({ description: 'Document title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Type of document', enum: DocumentType })
  @IsEnum(DocumentType)
  type!: DocumentType;

  @ApiProperty({ description: 'File URL or storage key' })
  @IsString()
  file!: string;

  @ApiProperty({ description: 'Publication date', example: '2025-01-15T00:00:00Z' })
  @IsDateString()
  publicationDate!: Date;

  @ApiProperty({ description: 'Legal domain concerned', example: 'Droit OHADA' })
  @IsString()
  legalDomain!: string;

  @ApiPropertyOptional({ description: 'Optional description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'File size in bytes' })
  @IsInt()
  sizeBytes!: number; // Remove the ? to make it required
}
