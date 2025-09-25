// src/partner-application/partner-application.controller.ts
import { Body, Controller, Get, HttpStatus, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import type { Request } from 'express';

import { CreatePartnerApplicationDto } from './dto/create-partner-application.dto';
import { ReviewPartnerApplicationDto } from './dto/review-partner-application.dto';
import { PartnerApplicationsService } from './partner-applications.service';
import type { LoggedInUser } from '@/auth/dto'; // ton type user actuel
import { GetUser } from '@/decorator/get-user.decorator'; // ton décorateur existant
import { PaginationDto } from '@/shared/dto';
import { generateBaseUrl, ResponseUtil } from '@/shared/utils';

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

    return ResponseUtil.success({
      data: application,
      message: 'Application submitted successfully',
      status: HttpStatus.CREATED,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'List all partner applications',
    description: 'Allows an admin to list all partner applications.',
  })
  @ApiResponse({ status: 200, description: 'List of partner applications retrieved successfully.' })
  async list(@Query() query: PaginationDto, @Req() request: Request) {
    const result = await this.service.findMany({
      page: query.page,
      limit: query.limit,
    });

    const baseUrl = generateBaseUrl(request);

    return ResponseUtil.paginated({
      data: result.data,
      total: result.total,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      message: 'Partner applications retrieved successfully',
      baseUrl,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a partner application by ID',
    description: 'Allows an admin to retrieve a partner application by its ID.',
  })
  @ApiResponse({ status: 200, description: 'Partner application retrieved successfully.' })
  async get(@Param('id') id: string) {
    const application = await this.service.findOne(id);

    return ResponseUtil.success({
      data: application,
      message: 'Partner application retrieved successfully',
    });
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

    return ResponseUtil.success({
      data: reviewedApplication,
      message: 'Partner application reviewed successfully',
    });
  }
}
