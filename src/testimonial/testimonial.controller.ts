import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { QueryTestimonialDto } from './dto/query-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { TestimonialService } from './testimonial.service';

import { UserRole } from '@/../generated/prisma';
import { JwtGuard } from '@/auth/guard';
import { RolesGuard } from '@/auth/guard';
import { Roles } from '@/decorator';
import { GetUser } from '@/decorator/get-user.decorator';
import { ResponseUtil } from '@/shared/utils';

@ApiTags('Testimonials')
@ApiBearerAuth()
@Controller('testimonials')
export class TestimonialController {
  constructor(private readonly service: TestimonialService) {}

  /** Public list (typically you’ll want only APPROVED for public UI; keep admin filters protected in admin routes) */
  @Get()
  @ApiOperation({
    summary: 'List testimonials (filterable, paginated)',
    description:
      ' this endpoint allows filtering by status for admin/moderator use cases.  for filter by author userId',
  })
  @ApiResponse({ status: 200, description: 'List of testimonials', type: CreateTestimonialDto })
  async findAll(@Query() query: QueryTestimonialDto) {
    const result = await this.service.findAll(query);

    return ResponseUtil.paginated({
      data: result.items,
      total: result.meta.total,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      message: 'Testimonials retrieved successfully',
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a testimonial by id' })
  @ApiResponse({ status: 200, description: 'The testimonial', type: CreateTestimonialDto })
  async findOne(@Param('id') id: string) {
    const testimonial = await this.service.findOne(id);

    return ResponseUtil.success({
      data: testimonial,
      message: 'Testimonial retrieved successfully',
    });
  }

  /** Authenticated Participant: create testimonial */
  @UseGuards(JwtGuard)
  @Post()
  @ApiOperation({ summary: 'Create a testimonial (authenticated user)' })
  @ApiResponse({
    status: 201,
    description: 'Testimonial created (PENDING)',
    type: CreateTestimonialDto,
  })
  async create(@GetUser('id') userId: string, @Body() dto: CreateTestimonialDto) {
    const testimonial = await this.service.create(userId, dto);

    return ResponseUtil.success({
      data: testimonial,
      message: 'Testimonial created successfully',
      status: HttpStatus.CREATED,
    });
  }

  /** Author can update their pending testimonial */
  @UseGuards(JwtGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update own testimonial if PENDING' })
  @ApiResponse({ status: 200, description: 'Updated testimonial', type: CreateTestimonialDto })
  async update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateTestimonialDto,
  ) {
    const testimonial = await this.service.updateAsAuthor(id, userId, dto);

    return ResponseUtil.success({
      data: testimonial,
      message: 'Testimonial updated successfully',
    });
  }

  /** Author can delete their pending testimonial */
  @UseGuards(JwtGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete own testimonial if PENDING' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  async remove(@Param('id') id: string, @GetUser('id') userId: string) {
    await this.service.removeAsAuthor(id, userId);

    return ResponseUtil.success({
      data: null,
      message: 'Testimonial deleted successfully',
    });
  }

  /** Admin/Moderator moderation endpoints */
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a testimonial (Admin/Moderator)' })
  async approve(@Param('id') id: string) {
    await this.service.approve(id);

    return ResponseUtil.success({
      data: null,
      message: 'Testimonial approved successfully',
    });
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a testimonial (Admin/Moderator)' })
  async reject(@Param('id') id: string) {
    await this.service.reject(id);

    return ResponseUtil.success({
      data: null,
      message: 'Testimonial rejected successfully',
    });
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Delete(':id/admin')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Delete a testimonial (Admin/Moderator)' })
  async adminRemove(@Param('id') id: string) {
    await this.service.removeAsAdmin(id);

    return ResponseUtil.success({
      data: null,
      message: 'Testimonial deleted successfully',
    });
  }
}
