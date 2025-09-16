// src/partner-application/dto/review-partner-application.dto.ts
import { ApiProperty } from '@nestjs/swagger';

import { IsEnum, IsString } from 'class-validator';

import { ApplicationStatus } from '@/../generated/prisma';

export class ReviewPartnerApplicationDto {
  @ApiProperty({ enum: ApplicationStatus, example: ApplicationStatus.ACCEPTED })
  @IsEnum(ApplicationStatus, { message: 'Invalid application status' })
  status: ApplicationStatus;

  @ApiProperty({ required: true })
  @IsString()
  adminComment: string;
}
