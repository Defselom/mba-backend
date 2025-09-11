import { ApiProperty } from '@nestjs/swagger';

export class WebinarDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  dateTime: Date;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  legalTopic: string;

  @ApiProperty()
  maxCapacity: number;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false })
  accessLink?: string;

  @ApiProperty({ required: false })
  animatedById?: string;

  @ApiProperty({ required: false })
  moderatedById?: string;
}
