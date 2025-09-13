import { ApiProperty } from '@nestjs/swagger';

import { IsDateString, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

import { RegistrationStatus, type UserAccount } from '@/../generated/prisma';

export class GetWebinarRegistrationDto {
  @ApiProperty({
    description: 'Unique identifier for the registration',
    example: 'cmfh19ron0001w4ynb6nfongv',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Date and time when the registration was created',
    example: '2025-09-12T16:10:05.542Z',
  })
  @IsDateString()
  registrationDate: Date;

  @ApiProperty({
    description: 'Current status of the registration',
    enum: RegistrationStatus,
    example: RegistrationStatus.CONFIRMED,
  })
  @IsEnum(RegistrationStatus)
  status: RegistrationStatus;

  @ApiProperty({
    description: 'ID of the user who registered',
    example: 'cmfgsx1kj0006w42o6nsntiul',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'ID of the webinar',
    example: 'cmfgvpnvi0000w4sk5e0l66wm',
  })
  @IsString()
  webinarId: string;

  @ApiProperty({
    description: 'User account information (included when requested)',
    required: false,
    example: {
      id: 'cmfgsx1kj0006w42o6nsntiul',
      username: 'Hillary_Considine',
      password: '$2b$10$f9rCaZY.yLpPwywJYCDPiuRnkbSpKikbvDbx/q4zpZkuIGesZuM56',
      email: 'Kirk2@yahoo.com',
      role: 'SPEAKER',
      status: 'PENDING_VALIDATION',
      firstName: 'Demetris',
      lastName: 'Torphy',
      birthDate: '1991-08-14T00:00:00.000Z',
      phone: '1-602-982-4882 x4611',
      profileImage: 'https://avatars.githubusercontent.com/u/24406391',
      lastLogin: null,
      createdAt: '2025-09-12T12:16:14.899Z',
      updatedAt: '2025-09-12T12:16:14.899Z',
    },
  })
  @IsOptional()
  @IsObject()
  user?: UserAccount;
}
