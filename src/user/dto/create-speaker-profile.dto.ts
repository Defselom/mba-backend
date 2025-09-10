import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSpeakerProfileDto {
  @ApiPropertyOptional({ example: 'PhD' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  academicLevel?: string;

  @ApiPropertyOptional({ example: 'Legal Advisor' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  currentPosition?: string;

  @ApiPropertyOptional({ example: 'Share expertise' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivation?: string;

  @ApiPropertyOptional({ example: '["Banking Law"]' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  legalDomains?: string;

  @ApiPropertyOptional({ example: 'https://example.com/photo.png' })
  @IsOptional()
  @IsString()
  professionalPhoto?: string;

  @ApiPropertyOptional({ example: '15 years in legal education' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  biography?: string;

  @ApiPropertyOptional({ example: 'Evenings, weekends' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  scheduleConstraints?: string;

  @ApiPropertyOptional({ example: '10+ web conferences' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  animationExperience?: string;
}
