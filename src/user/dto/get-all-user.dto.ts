import { ApiProperty } from '@nestjs/swagger';

import { IsString, IsDateString, IsOptional } from 'class-validator';

export class GetAllUserDto {
  @ApiProperty()
  @IsString()
  id: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  username: string;
  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  birthDay?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  profilImage?: string;

  @ApiProperty()
  @IsDateString()
  createdAt: Date;

  @ApiProperty()
  @IsDateString()
  updatedAt: Date;
}
