import { ApiProperty } from '@nestjs/swagger';

import { IsEnum } from 'class-validator';

import { WebinarStatus } from '@/../generated/prisma';

export class UpdateWebinarStatusDto {
  @ApiProperty({ enum: WebinarStatus, example: WebinarStatus.SCHEDULED })
  @IsEnum(WebinarStatus)
  status: WebinarStatus;
}
