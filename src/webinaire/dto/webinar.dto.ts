import { ApiProperty } from '@nestjs/swagger';

import { IsUrl } from 'class-validator';

export class WebinarDto {
  @ApiProperty({
    description: 'Unique identifier of the webinar',
    example: 'webinar_123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'Title of the webinar',
    example: 'Introduction to Business Law',
    minLength: 5,
    maxLength: 200,
    type: String,
  })
  title: string;

  @ApiProperty({
    description: 'Detailed description of the webinar',
    example:
      'A comprehensive webinar covering the fundamentals of business law, including contracts, business formation, and legal obligations.',
    maxLength: 2000,
    type: String,
  })
  description: string;

  @ApiProperty({
    description: 'Start date and time of the webinar (ISO 8601)',
    example: '2024-10-15T14:30:00.000Z',
    type: Date,
  })
  dateTime: Date;

  @ApiProperty({
    description: 'Duration of the webinar in minutes',
    example: 90,
    minimum: 15,
    maximum: 480,
    type: Number,
  })
  duration: number;

  @ApiProperty({
    description: 'Main legal topic of the webinar',
    example: 'Commercial Law',
    enum: [
      'Commercial Law',
      'Civil Law',
      'Criminal Law',
      'Labor Law',
      'Tax Law',
      'Real Estate Law',
      'Family Law',
      'International Law',
    ],
    type: String,
  })
  legalTopic: string;

  @ApiProperty({
    description: 'Maximum number of allowed participants',
    example: 100,
    minimum: 1,
    maximum: 1000,
    type: Number,
  })
  maxCapacity: number;

  @ApiProperty({
    description: 'Current status of the webinar',
    example: 'SCHEDULED',
    enum: ['DRAFT', 'SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED'],
    type: String,
  })
  status: string;

  @ApiProperty({
    description: 'URL of the webinar thumbnail/cover image',
    example: 'https://storage.example.com/webinars/thumbnails/webinar-123.jpg',
    format: 'url',
    type: String,
  })
  @IsUrl()
  thumbnail: string;

  @ApiProperty({
    description: 'List of keywords/tags associated with the webinar',
    example: ['business-law', 'contracts', 'corporate', 'training'],
    isArray: true,
    type: String,
    items: {
      type: 'string',
      example: 'business-law',
    },
  })
  tags: string[];

  @ApiProperty({
    description: 'Access link to join the webinar (dynamically generated)',
    example: 'https://meet.example.com/webinar/abc-def-123',
    required: false,
    format: 'url',
    type: String,
  })
  accessLink?: string;

  @ApiProperty({
    description: 'Total number of webinar subscribers',
    example: 45,
    minimum: 0,
    required: false,
    type: Number,
  })
  totalSubscribers?: number;

  @ApiProperty({
    description: 'Identifier of the main webinar presenter',
    example: 'user_987fcdeb-51a2-43e1-b456-123456789abc',
    required: false,
    type: String,
  })
  animatedById?: string;

  @ApiProperty({
    description: 'Identifier of the webinar moderator',
    example: 'user_456789ab-cdef-1234-5678-90abcdef1234',
    required: false,
    type: String,
  })
  moderatedById?: string;
}
