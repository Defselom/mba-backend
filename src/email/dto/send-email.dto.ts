import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SendEmailDto {
  @IsEmail() to!: string;
  @IsString() subject!: string;
  @IsOptional() @IsString() template?: string; // ex: "welcome"
  @IsOptional() context?: Record<string, unknown>;
  @IsOptional() @IsString() html?: string; // bypass template
}
