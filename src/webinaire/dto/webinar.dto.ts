import { ApiProperty } from '@nestjs/swagger';

import { IsUrl } from 'class-validator';

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

  @ApiProperty()
  @IsUrl()
  thumbnail: string;

  @ApiProperty({ isArray: true, type: String })
  tags: string[];

  @ApiProperty({ required: false })
  accessLink?: string;

  @ApiProperty({ required: false })
  totalSubscribers?: number;

  @ApiProperty({ required: false })
  animatedById?: string;

  @ApiProperty({ required: false })
  moderatedById?: string;
}
