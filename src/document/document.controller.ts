import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import type { Request } from 'express';

import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { QueryDocumentDto } from './dto/query-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

import { UserRole } from '@/../generated/prisma';
import { JwtGuard, RolesGuard } from '@/auth/guard';
import { Roles } from '@/decorator';
import { generateBaseUrl, ResponseUtil } from '@/shared/utils';

@ApiTags('Documents')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('documents')
export class DocumentController {
  constructor(private readonly service: DocumentService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List legal documents (paginated & filterable)' })
  @ApiResponse({
    status: 200,
    description: 'Documents retrieved successfully',
    type: [CreateDocumentDto],
    example: {
      status: 200,
      success: true,
      message: 'Document created successfully',
      data: {
        id: 'cmflra4dt0003w45mtqhm0xvy',
        title: 'string',
        type: 'LAW',
        file: 'string',
        publicationDate: '2025-01-15T00:00:00.000Z',
        legalDomain: 'Droit OHADA',
        description: 'string',
        sizeBytes: 0,
        createdAt: '2025-09-15T23:29:16.721Z',
        updatedAt: '2025-09-15T23:29:16.721Z',
      },
      timestamp: '2025-09-15T23:29:16.919Z',
    },
  })
  async findAll(@Query() query: QueryDocumentDto, @Req() request: Request) {
    const result = await this.service.findAll(query);

    const baseUrl = generateBaseUrl(request);

    return ResponseUtil.paginated({
      data: result.data,
      total: result.total,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      message: 'Documents retrieved successfully',
      baseUrl,
    });
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get document by id' })
  @ApiResponse({
    status: 200,
    description: 'Document retrieved successfully',
    type: CreateDocumentDto,
  })
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);

    return ResponseUtil.success({
      data,
      message: 'Document retrieved successfully',
    });
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new legal document ' })
  @ApiResponse({
    status: 201,
    description: 'Document created successfully',
    type: CreateDocumentDto,
  })
  async create(@Body() dto: CreateDocumentDto) {
    const document = await this.service.create(dto);

    return ResponseUtil.success({
      data: document,
      message: 'Document created successfully',
    });
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing legal document ' })
  @ApiResponse({
    status: 200,
    description: 'Document updated successfully',
    type: CreateDocumentDto,
  })
  async update(@Param('id') id: string, @Body() dto: UpdateDocumentDto) {
    const document = await this.service.update(id, dto);

    return ResponseUtil.success({
      data: document,
      message: 'Document updated successfully',
    });
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a legal document ' })
  @ApiResponse({
    status: 200,
    description: 'Document deleted successfully',
    example: {
      status: 200,
      success: true,
      message: 'Document deleted successfully',
      data: null,
      timestamp: '2025-09-15T23:29:36.407Z',
    },
  })
  async remove(@Param('id') id: string) {
    await this.service.remove(id);

    return ResponseUtil.success({
      data: null,
      message: 'Document deleted successfully',
    });
  }
}
