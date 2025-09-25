import { ApiProperty } from '@nestjs/swagger';

import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: '0b9d9a6c-3e1d-4a2a-9a47-9f2a2c...' })
  @IsString()
  token!: string;

  @ApiProperty({ example: 'Strong#Pass123' })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
