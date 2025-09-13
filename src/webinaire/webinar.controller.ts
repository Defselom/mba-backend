import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

import type { Request } from 'express';

import { JwtGuard, RolesGuard } from '@/auth/guard';
import { Roles } from '@/decorator';
import { PaginationDto } from '@/shared/dto';
import { ApiResponse as IApiResponse } from '@/shared/interfaces';
import { ResponseUtil } from '@/shared/utils';
import {
  addRegistrationDoc,
  getAllRegistrationDoc,
  getAllWebinarsDoc,
} from '@/webinaire/doc/index.doc';
import {
  AssignActorsDto,
  CreateWebinarDto,
  UpdateWebinarDto,
  UpdateWebinarStatusDto,
  WebinarDto,
  WebinarRegistrationDto,
} from '@/webinaire/dto/index.dto';
import { WebinarService } from '@/webinaire/webinar.service';
import { UserRole } from '@/../generated/prisma';
@Controller('webinars')
@UseGuards(JwtGuard, RolesGuard)
@ApiBearerAuth()
export class WebinarController {
  constructor(private readonly webinarService: WebinarService) {}

  // [ADMIN] Create a webinar
  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a webinar' })
  @ApiResponse({ status: 201, description: 'Webinar created', type: WebinarDto })
  async create(@Body() dto: CreateWebinarDto) {
    const webinar = await this.webinarService.create(dto);

    return ResponseUtil.success(
      webinar,
      'Webinar created successfully',
      undefined,
      HttpStatus.CREATED,
    );
  }

  // [ADMIN] Update a webinar (if not STARTED/ENDED/CANCELLED)
  @Put(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a webinar' })
  @ApiResponse({ status: 200, description: 'Webinar updated', type: UpdateWebinarDto })
  async update(@Param('id') id: string, @Body() dto: UpdateWebinarDto) {
    const webinar = await this.webinarService.update(id, dto);

    return ResponseUtil.success(webinar, 'Webinar updated successfully');
  }

  @Patch(':id/handle-status')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle webinar status' })
  @ApiResponse({ status: 200, description: 'Webinar status handled' })
  async handleStatus(@Param('id') id: string, @Body() dto: UpdateWebinarStatusDto) {
    await this.webinarService.handleStatus(id, dto.status);

    return ResponseUtil.success(null, 'Webinar status handled successfully');
  }

  // [ADMIN] Delete a webinar (out of history/statistics)
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a webinar' })
  @ApiResponse({ status: 200, description: 'Webinar deleted' })
  async delete(@Param('id') id: string): Promise<IApiResponse<null>> {
    await this.webinarService.delete(id);

    return ResponseUtil.success(null, 'Webinar deleted successfully');
  }

  // [ADMIN] List/paginate all webinars (for management)
  @Get()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all webinars' })
  @ApiResponse({
    status: 200,
    description: 'List of webinars',
    type: [WebinarDto],
    isArray: true,
    example: getAllWebinarsDoc,
  })
  async findAll(@Query() pagination: PaginationDto) {
    const { data, total } = await this.webinarService.findAll(pagination);

    return ResponseUtil.success(data, 'Webinars retrieved successfully', {
      total,
      page: pagination.page || 1,
      limit: pagination.limit || 10,
    });
  }

  // [ADMIN] Assign speakers/moderators to a webinar
  @Patch(':id/assign')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign speakers/moderators to a webinar' })
  @ApiResponse({ status: 200, description: 'Assignment completed', type: WebinarDto })
  async assignActors(
    @Param('id') id: string,
    @Body() dto: AssignActorsDto, // contains user IDs by role
  ) {
    const webinar = await this.webinarService.assignActors(id, dto);

    return ResponseUtil.success(webinar, 'Assignment completed successfully');
  }

  // [ADMIN] View registrations for a webinar
  @Get('registrations')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get All registrations ' })
  @ApiResponse({
    status: 200,
    description: 'List of registrations',
    example: getAllRegistrationDoc,
  })
  async getAllRegistrations(): Promise<IApiResponse<WebinarRegistrationDto[]>> {
    const registrations = await this.webinarService.getAllRegistrations();

    return ResponseUtil.success(registrations, 'Registrations retrieved successfully');
  }

  // [ADMIN] View registrations for a webinar
  @Get(':id/registrations')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get All registrations for a webinar' })
  @ApiResponse({
    status: 200,
    description: 'List of registrations for the webinar',
    example: getAllRegistrationDoc,
  })
  async getRegistrations(@Param('id') id: string): Promise<IApiResponse<WebinarRegistrationDto[]>> {
    const registrations = await this.webinarService.getRegistrations(id);

    return ResponseUtil.success(registrations, 'Registrations retrieved successfully');
  }

  // [USER] Register for a webinar (if SCHEDULED and not full)
  @Post('/register')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register for a webinar' })
  @ApiResponse({
    status: 201,
    description: 'Registration successful',
    example: addRegistrationDoc,
  })
  async register(
    @Body() dto: WebinarRegistrationDto,
  ): Promise<IApiResponse<WebinarRegistrationDto>> {
    const registration = await this.webinarService.registerUser(dto.webinarId, dto.userId);

    return ResponseUtil.success(
      registration,
      'Registration successful',
      undefined,
      HttpStatus.CREATED,
    );
  }

  // [USER] Cancel registration for a webinar (if SCHEDULED)
  @Patch('cancel-registration')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel registration for a webinar' })
  @ApiResponse({
    status: 200,
    description: 'Cancellation successful',
    example: addRegistrationDoc,
  })
  async cancelRegistration(
    @Body() dto: WebinarRegistrationDto,
  ): Promise<IApiResponse<WebinarRegistrationDto>> {
    const registration = await this.webinarService.unregisterUser(dto.webinarId, dto.userId);

    return ResponseUtil.success(registration, 'Cancellation successful');
  }
}
