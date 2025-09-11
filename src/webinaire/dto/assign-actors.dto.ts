import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class AssignActorsDto {
  @ApiPropertyOptional({
    example: 'clv1id2ze0000o1h2sd3g6f8e',
    description: 'UserId of the main speaker',
  })
  animatedById?: string;

  @ApiPropertyOptional({
    example: 'clv1id2ze0000o1h2sd3g6f8e',
    description: 'UserId of the main moderator',
  })
  moderatedById?: string;

  @ApiProperty({
    example: ['clv1id2ze0000o1h2sd3g6f8e'],
    description: 'Array of UserIds for collaborators',
    required: false,
  })
  collaboratorIds?: string[];
}
