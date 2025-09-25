import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { ModerationStatus, Prisma, Testimonial } from '@/../generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { QueryTestimonialDto } from '@/testimonial/dto';

@Injectable()
export class TestimonialService {
  constructor(private readonly prisma: PrismaService) {}

  async create(authorUserId: string, dto: CreateTestimonialDto): Promise<Testimonial> {
    // Optional: ensure webinar exists if provided
    if (dto.webinarId) {
      const webinar = await this.prisma.webinar.findUnique({
        where: { id: dto.webinarId, isDeleted: false },
      });

      if (!webinar) throw new BadRequestException('Related webinar not found');
    }

    return this.prisma.testimonial.create({
      data: {
        content: dto.content,
        rating: dto.rating,
        status: ModerationStatus.PENDING,
        user: { connect: { id: authorUserId } },
        webinar: dto.webinarId ? { connect: { id: dto.webinarId } } : undefined,
      },
    });
  }

  async findAll(queryDto: QueryTestimonialDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      userId,
      webinarId,
    } = queryDto;

    const where: Prisma.TestimonialWhereInput = {
      isDeleted: false,
      ...(status && { status }),
      ...(userId && { userId }),
      ...(webinarId && { webinarId }),
      ...(search ? { content: { contains: search, mode: Prisma.QueryMode.insensitive } } : {}),
    };

    const validSortFields = ['createdAt', 'updatedAt', 'rating'] as const;

    const finalSortBy = validSortFields.includes(sortBy as (typeof validSortFields)[number])
      ? sortBy
      : 'createdAt';

    const [items, total] = await this.prisma.$transaction([
      this.prisma.testimonial.findMany({
        where,
        orderBy: { [finalSortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, profileImage: true },
          },
          webinar: {
            select: { id: true, title: true, dateTime: true },
          },
        },
      }),
      this.prisma.testimonial.count({ where }),
    ]);

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const entity = await this.prisma.testimonial.findUnique({
      where: { id, isDeleted: false },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, profileImage: true } },
        webinar: { select: { id: true, title: true, dateTime: true } },
      },
    });

    if (!entity) throw new NotFoundException('Testimonial not found');

    return entity;
  }

  async updateAsAuthor(id: string, authorUserId: string, dto: UpdateTestimonialDto) {
    const entity = await this.prisma.testimonial.findUnique({
      where: { id, isDeleted: false },
    });

    if (!entity) throw new NotFoundException('Testimonial not found');

    if (entity.userId !== authorUserId) {
      throw new ForbiddenException('You can only update your own testimonial');
    }

    if (entity.status !== ModerationStatus.PENDING) {
      throw new BadRequestException('Only pending testimonials can be updated');
    }

    return this.prisma.testimonial.update({
      where: { id },
      data: {
        content: dto.content ?? entity.content,
        rating: dto.rating ?? entity.rating,
      },
    });
  }

  // Soft delete pour l'auteur
  async removeAsAuthor(id: string, authorUserId: string) {
    const entity = await this.prisma.testimonial.findUnique({
      where: { id, isDeleted: false },
    });

    if (!entity) throw new NotFoundException('Testimonial not found');

    if (entity.userId !== authorUserId) {
      throw new ForbiddenException('You can only delete your own testimonial');
    }

    // Optionally: only allow delete while pending
    if (entity.status !== ModerationStatus.PENDING) {
      throw new BadRequestException('Only pending testimonials can be deleted by the author');
    }

    await this.prisma.testimonial.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedById: authorUserId,
      },
    });

    return { success: true };
  }

  async approve(id: string) {
    const entity = await this.prisma.testimonial.findUnique({
      where: { id, isDeleted: false },
    });

    if (!entity) throw new NotFoundException('Testimonial not found');

    if (entity.status === ModerationStatus.APPROVED) return entity;

    return this.prisma.testimonial.update({
      where: { id },
      data: { status: ModerationStatus.APPROVED },
    });
  }

  async reject(id: string) {
    const entity = await this.prisma.testimonial.findUnique({
      where: { id, isDeleted: false },
    });

    if (!entity) throw new NotFoundException('Testimonial not found');

    if (entity.status === ModerationStatus.REJECTED) return entity;

    return this.prisma.testimonial.update({
      where: { id },
      data: { status: ModerationStatus.REJECTED },
    });
  }

  // Soft delete pour l'admin
  async removeAsAdmin(id: string) {
    const entity = await this.prisma.testimonial.findUnique({
      where: { id, isDeleted: false },
    });

    if (!entity) throw new NotFoundException('Testimonial not found');

    await this.prisma.testimonial.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return { success: true };
  }
}
