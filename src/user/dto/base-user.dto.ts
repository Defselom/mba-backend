import { IsEmail, IsOptional, IsString, Validate, IsNotEmpty, MinLength } from 'class-validator';

import { EmailOrUsernameConstraint } from '@/auth/validation/emailOrUsername.validator';

export class BaseUserDto {
  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  username: string;

  @Validate(EmailOrUsernameConstraint)
  emailOrUsername: string; // Pour déclencher la validation personnalisée

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
