import { ApiProperty } from '@nestjs/swagger';

import { IsOptional, IsString } from 'class-validator';

export class RefreshUserTokenDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Refresh token',
    required: false,
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWZkeHEzbjMwMDAwdzRzNTdteGozNTg3IiwidXNlcm5hbWUiOiJwYXJ0aWNpcGFudDQyIiwiZW1haWwiOiJwYXJ0aWNpcGFudDQyQGV4YW1wbGUuY29tIiwicm9sZSI6IlBBUlRJQ0lQQU5UIiwiaWF0IjoxNzU3NTE3MTkwLCJleHAiOjIzNjIzMTcxOTB9.2-80a79SKhhZyYCYIJL97KT1f7jdz7TcX',
  })
  refreshToken: string;
}
