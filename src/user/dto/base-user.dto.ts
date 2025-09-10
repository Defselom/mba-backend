import { IsEmail, IsOptional, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class BaseUserDto {
  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
