import { ApiProperty } from '@nestjs/swagger';

import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'Old#Pass123' })
  @IsString()
  oldPassword!: string;

  @ApiProperty({ example: 'Strong#Pass123' })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
