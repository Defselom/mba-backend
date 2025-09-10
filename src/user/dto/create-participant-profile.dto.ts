import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateParticipantProfileDto {
  @ApiPropertyOptional({ example: 'Master 2 Law' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  academicLevel?: string;

  @ApiPropertyOptional({ example: 'Through a friend' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  discoveryChannel?: string;

  @ApiPropertyOptional({ example: 'Interest in business law' })
  @IsOptional()
  @IsString()
  participationMotivation?: string;

  @ApiPropertyOptional({ example: 'OHADA Community, Jurist Network' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  otherPlatforms?: string;

  @ApiPropertyOptional({ example: '["Business Law", "Banking Law"]' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  wishedLegalThemes?: string; // JSON stringified array or string
}
