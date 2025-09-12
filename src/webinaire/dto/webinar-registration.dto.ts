import { ApiProperty } from '@nestjs/swagger';

import { IsString } from 'class-validator';

export class WebinarRegistrationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  registrationDate: Date;

  @ApiProperty()
  status: string;

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  webinarId: string;

  user?: any;
}
