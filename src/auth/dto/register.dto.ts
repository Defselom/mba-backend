import { ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { Validate, ValidateIf, ValidateNested } from 'class-validator';

import { RoleProfileRegisterConstraint } from '@/auth/validation';
import {
  CreateModeratorProfileDto,
  CreateParticipantProfileDto,
  CreateSpeakerProfileDto,
  CreateUserAccountDto,
} from '@/user/dto';
import { UserRole } from 'generated/prisma';

export class RegisterDto extends CreateUserAccountDto {
  // Validation for participant
  @ValidateIf((o: RegisterDto) => o.role === UserRole.PARTICIPANT)
  @ValidateNested()
  @Type(() => CreateParticipantProfileDto)
  @ApiPropertyOptional({ type: CreateParticipantProfileDto })
  participantProfile?: CreateParticipantProfileDto;

  // Validation for speaker
  @ValidateIf((o: RegisterDto) => o.role === UserRole.SPEAKER)
  @ValidateNested()
  @Type(() => CreateSpeakerProfileDto)
  @ApiPropertyOptional({ type: CreateSpeakerProfileDto })
  speakerProfile?: CreateSpeakerProfileDto;

  // Validation for moderator
  @ValidateIf((o: RegisterDto) => o.role === UserRole.MODERATOR)
  @ValidateNested()
  @Type(() => CreateModeratorProfileDto)
  @ApiPropertyOptional({ type: CreateModeratorProfileDto })
  moderatorProfile?: CreateModeratorProfileDto;

  @Validate(RoleProfileRegisterConstraint)
  checkrole: string;
}
