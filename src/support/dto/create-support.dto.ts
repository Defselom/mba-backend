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

  @ApiProperty({
    enum: SupportType,
    enumName: 'SupportType',
    example: SupportType.PRESENTATION,
    type: () => String,
  })
  @IsEnum(SupportType)
  type: SupportType;
}
