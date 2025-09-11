import { ApiProperty } from '@nestjs/swagger';

export class WebinarRegistrationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  registrationDate: Date;

  @ApiProperty()
  status: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  webinarId: string;

  user?: any;
}
