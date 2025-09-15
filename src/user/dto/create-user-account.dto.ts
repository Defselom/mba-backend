import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsDateString,
  IsIn,
} from 'class-validator';

import { UserRole } from '@/../generated/prisma';
import { getRawUrl, isPresignedUrl } from '@/upload/utils';

export class CreateUserAccountDto {
  @ApiProperty({ example: 'johndoe', maxLength: 50 })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({ example: 'john@example.com', maxLength: 150 })
  @IsEmail()
  @MaxLength(150)
  email: string;

  @ApiProperty({ example: 'Password123*', minLength: 6, maxLength: 255, required: false })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(255)
  password?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.PARTICIPANT })
  @IsIn([UserRole.ADMIN, UserRole.SPEAKER, UserRole.MODERATOR, UserRole.PARTICIPANT])
  role: UserRole;

  @ApiProperty({ example: 'John', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiPropertyOptional({ example: 'Doe', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ example: '2001-08-05' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ example: '+22890011234', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.png', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }: { value: string | undefined }) =>
    isPresignedUrl(value) ? getRawUrl(value) : value,
  )
  profileImage?: string;
}
