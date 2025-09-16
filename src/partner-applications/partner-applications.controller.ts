// src/partner-application/partner-application.controller.ts
import { Body, Controller, Get, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreatePartnerApplicationDto } from './dto/create-partner-application.dto';
import { ReviewPartnerApplicationDto } from './dto/review-partner-application.dto';
import { PartnerApplicationsService } from './partner-applications.service';
import type { LoggedInUser } from '@/auth/dto'; // ton type user actuel
import { GetUser } from '@/decorator/get-user.decorator'; // ton décorateur existant
import { ResponseUtil } from '@/shared/utils';

@ApiTags('partner-applications')
@ApiBearerAuth()
@Controller('partner-applications')
export class PartnerApplicationsController {
  constructor(private readonly service: PartnerApplicationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Submit a new partner application',
    description: 'Allows a user to submit a new partner application.',
  })
  @ApiResponse({ status: 201, description: 'Application submitted successfully.' })
  async create(@Body() dto: CreatePartnerApplicationDto) {
    const application = await this.service.create(dto);

    return ResponseUtil.success(
      application,
      'Application submitted successfully',
      undefined,
      HttpStatus.CREATED,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List all partner applications',
    description: 'Allows an admin to list all partner applications.',
  })
  @ApiResponse({ status: 200, description: 'List of partner applications retrieved successfully.' })
  async list() {
    const applications = await this.service.findMany();

    return ResponseUtil.success(
      applications,
      'Partner applications retrieved successfully',
      undefined,
      HttpStatus.OK,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a partner application by ID',
    description: 'Allows an admin to retrieve a partner application by its ID.',
  })
  @ApiResponse({ status: 200, description: 'Partner application retrieved successfully.' })
  async get(@Param('id') id: string) {
    const application = await this.service.findOne(id);

    return ResponseUtil.success(
      application,
      'Partner application retrieved successfully',
      undefined,
      HttpStatus.OK,
    );
  }

  // route admin (RolesGuard/role ADMIN)
  @Patch(':id/review')
  @ApiOperation({
    summary: 'Review a partner application',
    description: 'Allows an admin to review a partner application.',
  })
  @ApiResponse({ status: 200, description: 'Partner application reviewed successfully.' })
  async review(
    @Param('id') id: string,
    @GetUser() admin: LoggedInUser,
    @Body() body: ReviewPartnerApplicationDto,
  ) {
    const reviewedApplication = await this.service.review(id, body);

    return ResponseUtil.success(
      reviewedApplication,
      'Partner application reviewed successfully',
      undefined,
      HttpStatus.OK,
    );
  }
}
