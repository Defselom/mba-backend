import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { AssignActorsDto, CreateWebinarDto, UpdateWebinarDto } from '@/webinaire/dto/index.dto';
import { WebinarStatus } from 'generated/prisma';

@Injectable()
export class WebinarService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new webinar
  async create(data: CreateWebinarDto) {
    return await this.prisma.webinar.create({
      data: {
        ...data,
        status: 'SCHEDULED', // WebinarStatus (enum)
      },
    });
  }

  // Update an existing webinar (only if not canceled, ongoing or completed)
  async update(id: string, data: UpdateWebinarDto) {
    const webinar = await this.prisma.webinar.findUnique({ where: { id } });

    if (!webinar) throw new NotFoundException('Webinar not found');

    if (['CANCELED', 'ONGOING', 'COMPLETED'].includes(webinar.status)) {
      throw new BadRequestException('You cannot update a canceled/ongoing/completed webinar');
    }

    return await this.prisma.webinar.update({
      where: { id },
      data,
    });
  }

  // Handle webinar status (start, end, cancel)
  async handleStatus(id: string, status: WebinarStatus) {
    const webinar = await this.prisma.webinar.findUnique({ where: { id } });

    if (!webinar) throw new NotFoundException('Webinar not found');

    return await this.prisma.webinar.update({
      where: { id },
      data: { status },
    });
  }

  // Delete a webinar (if not ongoing/completed)
  async delete(id: string) {
    const webinar = await this.prisma.webinar.findUnique({ where: { id } });

    if (!webinar) throw new NotFoundException('Webinar not found');

    if (['ONGOING', 'COMPLETED'].includes(webinar.status)) {
      throw new BadRequestException('Cannot delete an ongoing or completed webinar');
    }

    return await this.prisma.webinar.delete({ where: { id } });
  }

  // List & paginate all webinars (admin)
  async findAll(pagination: { page?: number; limit?: number }) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.webinar.findMany({
        skip,
        take: limit,
        orderBy: { dateTime: 'desc' },
        include: {
          animatedBy: true,
          moderatedBy: true,
          collaborators: true,
          registrations: true,
        },
      }),
      this.prisma.webinar.count(),
    ]);

    return { data, total };
  }

  // Assign actors: animatedBy, moderatedBy, collaborators
  async assignActors(id: string, dto: AssignActorsDto) {
    const webinar = await this.prisma.webinar.findUnique({ where: { id } });

    if (!webinar) throw new NotFoundException('Webinar not found');

    // animatedById and moderatedById are userId (String)
    return await this.prisma.webinar.update({
      where: { id },
      data: {
        animatedById: dto.animatedById, // Main speaker
        moderatedById: dto.moderatedById, // Main moderator
        collaborators: {
          set: dto.collaboratorIds?.map(userId => ({ id: userId })) || [],
        },
      },
      include: { animatedBy: true, moderatedBy: true, collaborators: true },
    });
  }

  // Get registrations for a webinar (with user info)
  async getRegistrations(webinarId: string) {
    return await this.prisma.registration.findMany({
      where: { webinarId },
      include: {
        user: true, // Get UserAccount info for each registration
      },
    });
  }
}
