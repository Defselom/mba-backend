import { ApiProperty } from '@nestjs/swagger';

import { IsEnum } from 'class-validator';

import { UserRole } from '@/../generated/prisma';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: UserRole, example: UserRole.SPEAKER })
  @IsEnum(UserRole)
  role: UserRole;
}
