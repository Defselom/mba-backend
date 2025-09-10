import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsOptional, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class BaseUserDto {
  @IsEmail()
  @IsOptional()
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    required: false,
  })
  email: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'User username',
    example: 'johndoe',
    required: false,
  })
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({
    description: 'User password',
    example: 'strongPassword123',
    minLength: 6,
  })
  password: string;
}
