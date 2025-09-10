import { IsOptional, IsString } from 'class-validator';

import { BaseUserDto } from './base-user.dto';

export class UserDto extends BaseUserDto {
  @IsString()
  @IsOptional()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName: string;
}
