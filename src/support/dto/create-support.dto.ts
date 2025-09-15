import { ApiProperty } from '@nestjs/swagger';

import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { SupportType } from '@/../generated/prisma';

export class CreateSupportDto {
  @ApiProperty({ example: 'Support Document Title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'https://example.com/file.pdf' })
  @IsString()
  @IsNotEmpty()
  file: string;

  @ApiProperty({ example: 'cmfgvpnvi0000w4sk5e0l66wm' })
  @IsString()
  @IsNotEmpty()
  webinarId?: string;

  @ApiProperty({
    enum: SupportType,
    example: SupportType.PRESENTATION,
  })
  @IsEnum(SupportType)
  type: SupportType;
}
