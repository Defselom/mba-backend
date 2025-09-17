import { ApiProperty } from '@nestjs/swagger';

import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendTestEmailDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  to: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  subject: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  html?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  text?: string;
}

export class SendWelcomeEmailDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  to: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  userName: string;
}

export class SendPasswordResetEmailDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  to: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  resetToken: string;
}

export class SendNotificationEmailDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  to: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  message: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  userName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  actionUrl?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  actionText?: string;
}

export class SendTemplatedEmailDto {
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  template: string;

  @IsOptional()
  context?: Record<string, any>;
}

export class SendCredentialsEmailDto {
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class SendAccountValidationEmailDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  to: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  userName: string;

  @IsBoolean()
  @ApiProperty()
  isApproved: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty()
  rejectionReason?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  additionalNotes?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  canReapply?: boolean;
}
