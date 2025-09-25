import { ApiProperty } from '@nestjs/swagger';

import { SupportType } from '@/../generated/prisma';

export class GetAllSupportDto {
  @ApiProperty({ example: 'uuid-123', description: 'Support ID' })
  id: string;

  @ApiProperty({ example: 'Support Document Title', description: 'Support title' })
  title: string;

  @ApiProperty({
    example: 'https://example.com/file.pdf',
    description: 'File URL or presigned URL',
  })
  file: string;

  @ApiProperty({
    description: 'Support type',
    enum: SupportType,
    example: SupportType.PRESENTATION,
  })
  type: SupportType;

  @ApiProperty({ example: '2024-01-15T10:30:00Z', description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z', description: 'Last update date' })
  updatedAt: Date;
}
