import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

import { BaseUserDto } from '@/user/dto';

export class RegisterDto extends BaseUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }: { value: string }) => value || new Date().toISOString().split('T')[0]) // ← Date actuelle
  birthDay?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }: { value: string }) => value || 'https://default-avatar.com/avatar.png')
  profilImage?: string;
}
