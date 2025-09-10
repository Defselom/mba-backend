import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateModeratorProfileDto {
  @ApiPropertyOptional({ example: 'Lawyer at DroitFirm' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  currentJob?: string;

  @ApiPropertyOptional({ example: 'PhD' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  academicLevel?: string;

  @ApiPropertyOptional({ example: '3 years of experience' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  moderationExperience?: string;

  @ApiPropertyOptional({ example: 'Available for 1 hour/week' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  coordinationAvailability?: string;

  @ApiPropertyOptional({ example: 'https://example.com/photo.png' })
  @IsOptional()
  @IsString()
  professionalPhoto?: string;

  @ApiPropertyOptional({ example: 'Expert in insurance law' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  biography?: string;

  @ApiPropertyOptional({ example: '["Banking Law", "Insurance Law"]' })
  @IsOptional()
  @IsString()
  comfortDomains?: string; // JSON stringified array or string
}
