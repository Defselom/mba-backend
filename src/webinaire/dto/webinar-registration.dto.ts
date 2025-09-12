import { ApiProperty } from '@nestjs/swagger';

import { IsString } from 'class-validator';

export class WebinarRegistrationDto {
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
}
