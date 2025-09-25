import { ApiProperty } from '@nestjs/swagger';

import { IsOptional, IsString, IsPhoneNumber, IsEmail } from 'class-validator';

export class CreatePartnerApplicationDto {
  @ApiProperty()
  @IsString()
  responsibleFirstName: string;

  @ApiProperty()
  @IsString()
  responsibleLastName: string;

  @ApiProperty()
  @IsEmail()
  responsibleEmail: string;

  @ApiProperty()
  @IsString()
  structureName: string;

  @ApiProperty()
  @IsString()
  occupiedPosition: string;

  @ApiProperty()
  @IsString()
  partnershipType: string;

  @ApiProperty()
  @IsString()
  providedExpertise: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  collaborationExperience?: string;

  @ApiProperty()
  @IsPhoneNumber()
  phone: string;
}
