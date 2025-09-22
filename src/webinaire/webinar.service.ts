import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { Prisma, RegistrationStatus, WebinarStatus } from '@/../generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { AssignActorsDto, CreateWebinarDto, UpdateWebinarDto } from '@/webinaire/dto/index.dto';
import { normalizeTags, slugify } from '@/webinaire/utils';

@Injectable()
export class WebinarService {
  constructor(private readonly prisma: PrismaService) {}

  private buildConnectOrCreate(tags: string[]) {
    return normalizeTags(tags).map(name => {
      const slug = slugify(name);

      return {
        where: { slug }, // unique
        create: { name, slug }, // if absent, create it
      };
    });
  }

  private buildUpdateData(dto: UpdateWebinarDto): Prisma.WebinarUpdateInput {
    const { tags, ...webinarData } = dto;

    const updateData: Prisma.WebinarUpdateInput = {
      ...webinarData,
    };

    // Gérer les tags si ils sont fournis
    if (tags !== undefined) {
      if (tags.length > 0) {
        updateData.tags = {
          set: [], // Déconnecter tous les tags existants
          connectOrCreate: this.buildConnectOrCreate(tags), // Connecter/créer les nouveaux
        };
      } else {
        updateData.tags = { set: [] };
      }
    }

    return updateData;
  }

  // Create a new webinar
  async create(dto: CreateWebinarDto) {
    const tagOps = dto.tags?.length
      ? { connectOrCreate: this.buildConnectOrCreate(dto.tags) }
      : undefined;

    return this.prisma.webinar.create({
      data: {
        ...dto,
        tags: tagOps,
      },
      include: { tags: true },
    });
  }

  // Update an existing webinar (only if not canceled, ongoing or completed)
  async update(id: string, data: UpdateWebinarDto) {
    const webinar = await this.prisma.webinar.findUnique({ where: { id } });

    if (!webinar) throw new NotFoundException('Webinar not found');

    /*   if (['CANCELED', 'ONGOING', 'COMPLETED'].includes(webinar.status)) {
      throw new BadRequestException('You cannot update a canceled/ongoing/completed webinar');
    }
 */
    const updateData = this.buildUpdateData(data);

    return await this.prisma.webinar.update({
      where: { id },
      data: updateData,
      include: { tags: true },
    });
  }

  // get specific webinar by id
  async findOne(id: string) {
    const webinar = await this.prisma.webinar.findUnique({
      where: { id },
      include: {
        animatedBy: true,
        moderatedBy: true,
        collaborators: true,
        registrations: true,
        supports: true,
      },
    });

    if (!webinar) throw new NotFoundException('Webinar not found');

    return webinar;
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

    /*   if (['ONGOING', 'COMPLETED'].includes(webinar.status)) {
      throw new BadRequestException('Cannot delete an ongoing or completed webinar');
    } */

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

  // Get registrations for a webinar
  async getAllRegistrations() {
    return await this.prisma.registration.findMany({
      include: {
        user: true,
      },
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

  // Register a user for a webinar
  async registerUser(webinarId: string, userId: string) {
    const webinar = await this.prisma.webinar.findUnique({
      where: { id: webinarId },
      include: { registrations: true },
    });

    if (!webinar) throw new NotFoundException('Webinar not found');

    if (webinar.status !== WebinarStatus.SCHEDULED) {
      throw new BadRequestException('Cannot register for a webinar that is not scheduled');
    }

    if (webinar.registrations.length >= webinar.maxCapacity) {
      throw new BadRequestException('Webinar has reached its maximum capacity');
    }

    const existingRegistration = await this.prisma.registration.findUnique({
      where: {
        webinarId_userId: {
          webinarId: webinarId,
          userId: userId,
        },
      },
    });

    if (existingRegistration) {
      throw new BadRequestException('User is already registered for this webinar');
    }

    return await this.prisma.registration.create({
      data: {
        webinarId,
        userId,
        status: RegistrationStatus.CONFIRMED,
      },
    });
  }

  // Unregister a user from a webinar
  async unregisterUser(webinarId: string, userId: string) {
    const registration = await this.prisma.registration.findUnique({
      where: {
        webinarId_userId: {
          webinarId,
          userId,
        },
      },
      include: { webinar: true },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found for this user and webinar');
    }

    if (registration.status === RegistrationStatus.CANCELED) {
      throw new BadRequestException('Registration is already canceled');
    }

    if (!registration.webinar) {
      throw new NotFoundException('Associated webinar not found');
    }

    return await this.prisma.registration.update({
      where: {
        id: registration.id,
      },
      data: { status: RegistrationStatus.CANCELED },
    });
  }

  // Get webinar support files
  async getWebinarSupports(webinarId: string) {
    const webinar = await this.prisma.webinar.findUnique({
      where: { id: webinarId },
      include: { supports: true },
    });

    if (!webinar) throw new NotFoundException('Webinar not found');

    return webinar.supports;
  }
}
