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
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import type { Request } from 'express';

import { UserRole, SupportType } from '@/../generated/prisma';
import { JwtGuard, RolesGuard } from '@/auth/guard';
import { Roles } from '@/decorator';
import type { ApiResponse as IApiResponse } from '@/shared/interfaces';
import { generateBaseUrl, ResponseUtil } from '@/shared/utils';
import {
  CreateSupportDto,
  UpdateSupportDto,
  GetAllSupportDto,
  SupportQueryDto,
} from '@/support/dto';
import { SupportService } from '@/support/support.service';

@ApiTags('Support')
@Controller('supports')
@UseGuards(JwtGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new support document' })
  @ApiResponse({
    status: 201,
    description: 'Support created successfully',
    type: CreateSupportDto,
  })
  async create(@Body() createSupportDto: CreateSupportDto): Promise<IApiResponse<any>> {
    const support = await this.supportService.create(createSupportDto);

    return ResponseUtil.success(support, 'Support created successfully');
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all support documents with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Supports retrieved successfully',
    type: [GetAllSupportDto],
    isArray: true,
  })
  async findAll(
    @Query() query: SupportQueryDto,
    @Req() request: Request,
  ): Promise<IApiResponse<any[]>> {
    const result = await this.supportService.findAll(query);

    const baseUrl = generateBaseUrl(request);

    return ResponseUtil.paginated(
      result.data,
      result.total,
      result.page,
      result.limit,
      'Supports retrieved successfully',
      baseUrl,
    );
  }

  @Get('types')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all available support types' })
  @ApiResponse({
    status: 200,
    description: 'Support types retrieved successfully',
  })
  getSupportTypes(): IApiResponse<SupportType[]> {
    const types = Object.values(SupportType);

    return ResponseUtil.success(types, 'Support types retrieved successfully');
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get support statistics by type' })
  @ApiResponse({
    status: 200,
    description: 'Support statistics retrieved successfully',
  })
  async getStatistics(): Promise<IApiResponse<Record<SupportType, number>>> {
    const stats = await this.supportService.countByType();

    return ResponseUtil.success(stats, 'Support statistics retrieved successfully');
  }

  @Get('count')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get total count of supports' })
  @ApiResponse({
    status: 200,
    description: 'Support count retrieved successfully',
  })
  async getCount(): Promise<IApiResponse<{ count: number }>> {
    const count = await this.supportService.count();

    return ResponseUtil.success({ count }, 'Support count retrieved successfully');
  }

  @Get('type/:type')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get supports by type' })
  @ApiResponse({
    status: 200,
    description: 'Supports by type retrieved successfully',
    type: [GetAllSupportDto],
    isArray: true,
  })
  async findByType(
    @Param('type') type: string,
    @Query() query: Omit<SupportQueryDto, 'type'>,
    @Req() request: Request,
  ): Promise<IApiResponse<any[]>> {
    // Validate the type parameter
    if (!Object.values(SupportType).includes(type as SupportType)) {
      throw new Error(`Invalid support type: ${type}`);
    }

    const result = await this.supportService.findByType(type as SupportType, query);

    const baseUrl = generateBaseUrl(request);

    return ResponseUtil.paginated(
      result.data,
      result.total,
      result.page,
      result.limit,
      `Supports of type ${type} retrieved successfully`,
      baseUrl,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a support document by ID' })
  @ApiResponse({
    status: 200,
    description: 'Support retrieved successfully',
  })
  async findOne(@Param('id') id: string): Promise<IApiResponse<any>> {
    const support = await this.supportService.findOne(id);

    return ResponseUtil.success(support, 'Support retrieved successfully');
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a support document' })
  @ApiResponse({
    status: 200,
    description: 'Support updated successfully',
    type: UpdateSupportDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateSupportDto: UpdateSupportDto,
  ): Promise<IApiResponse<any>> {
    const support = await this.supportService.update(id, updateSupportDto);

    return ResponseUtil.success(support, 'Support updated successfully');
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a support document' })
  @ApiResponse({
    status: 200,
    description: 'Support deleted successfully',
  })
  async remove(@Param('id') id: string): Promise<IApiResponse<void>> {
    await this.supportService.delete(id);

    return ResponseUtil.success(undefined, 'Support deleted successfully');
  }
}
