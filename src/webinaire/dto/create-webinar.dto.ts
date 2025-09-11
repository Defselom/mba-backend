import { ApiProperty } from '@nestjs/swagger';

import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsUrl,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateWebinarDto {
  @ApiProperty({ example: 'Introduction to Banking Law' })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(100, { message: 'Title cannot exceed 100 characters' })
  title: string;

  @ApiProperty({ example: 'A detailed webinar on the basics of banking law.' })
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description: string;

  @ApiProperty({ example: '2025-09-15T18:00:00Z' })
  @IsDateString({}, { message: 'Date and time must be in ISO 8601 format' })
  @IsNotEmpty({ message: 'Date and time are required' })
  dateTime: Date;

  @ApiProperty({ example: 120, description: 'Duration in minutes' })
  @IsInt({ message: 'Duration must be an integer' })
  @Min(15, { message: 'Minimum duration is 15 minutes' })
  @Max(480, { message: 'Maximum duration is 8 hours (480 minutes)' })
  duration: number;

  @ApiProperty({ example: 'Banking Law' })
  @IsString({ message: 'Legal topic must be a string' })
  @IsNotEmpty({ message: 'Legal topic is required' })
  @MinLength(2, { message: 'Legal topic must be at least 2 characters long' })
  @MaxLength(50, { message: 'Legal topic cannot exceed 50 characters' })
  legalTopic: string;

  @ApiProperty({ example: 100 })
  @IsInt({ message: 'Maximum capacity must be an integer' })
  @Min(1, { message: 'Minimum capacity is 1 participant' })
  @Max(1000, { message: 'Maximum capacity is 1000 participants' })
  maxCapacity: number;

  @ApiProperty({ example: 'https://zoom.us/xxxx' })
  @IsOptional()
  @IsUrl({}, { message: 'Access link must be a valid URL' })
  accessLink?: string;
}
