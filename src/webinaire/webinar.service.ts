import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { Prisma, RegistrationStatus, Support, WebinarStatus } from '@/../generated/prisma';
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

  // private methods to count total subscribers
  private async countSubscribers(webinarId: string): Promise<number> {
    return this.prisma.registration.count({
      where: {
        webinarId,
        status: RegistrationStatus.CONFIRMED,
        isDeleted: false,
      },
    });
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
    const webinar = await this.prisma.webinar.findUnique({
      where: { id, isDeleted: false },
    });

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
      where: { id, isDeleted: false },
      include: {
        animatedBy: true,
        moderatedBy: true,
        collaborators: true,
        registrations: {
          where: { isDeleted: false },
        },
        supports: {
          where: { isDeleted: false },
        },
      },
    });

    if (!webinar) throw new NotFoundException('Webinar not found');

    return webinar;
  }

  // Handle webinar status (start, end, cancel)
  async handleStatus(id: string, status: WebinarStatus) {
    const webinar = await this.prisma.webinar.findUnique({
      where: { id, isDeleted: false },
    });

    if (!webinar) throw new NotFoundException('Webinar not found');

    return await this.prisma.webinar.update({
      where: { id },
      data: { status },
    });
  }

  // Soft delete a webinar (if not ongoing/completed)
  async delete(id: string) {
    const webinar = await this.prisma.webinar.findUnique({
      where: { id, isDeleted: false },
    });

    if (!webinar) throw new NotFoundException('Webinar not found');

    /*   if (['ONGOING', 'COMPLETED'].includes(webinar.status)) {
      throw new BadRequestException('Cannot delete an ongoing or completed webinar');
    } */

    return await this.prisma.webinar.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  // List & paginate all webinars (admin)
  async findAll(pagination: { page?: number; limit?: number }) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.webinar.findMany({
        where: { isDeleted: false },
        skip,
        take: limit,
        orderBy: { dateTime: 'desc' },
        include: {
          animatedBy: true,
          moderatedBy: true,
          collaborators: true,
        },
      }),
      this.prisma.webinar.count({
        where: { isDeleted: false },
      }),
    ]);

    const dataWithSubscribers = await Promise.all(
      data.map(async webinar => {
        const totalSubscribers = await this.countSubscribers(webinar.id);

        return {
          ...webinar,
          totalSubscribers: totalSubscribers,
        };
      }),
    );

    console.log('Webinars with Subscriber Counts:');

    console.log({ dataWithSubscribers, total });

    return { data: dataWithSubscribers, total };
  }

  // Assign actors: animatedBy, moderatedBy, collaborators
  async assignActors(id: string, dto: AssignActorsDto) {
    const webinar = await this.prisma.webinar.findUnique({
      where: { id, isDeleted: false },
    });

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
      where: { isDeleted: false },
      include: {
        user: true,
      },
    });
  }

  // Get registrations for a webinar (with user info)
  async getRegistrations(webinarId: string): Promise<{ registrations: any[]; total: number }> {
    const [registrations, total] = await Promise.all([
      this.prisma.registration.findMany({
        where: { webinarId, isDeleted: false },
        include: {
          user: true, // Get UserAccount info for each registration
        },
      }),

      this.prisma.registration.count({
        where: { webinarId, isDeleted: false },
      }),
    ]);

    return { registrations, total };
  }

  // Register a user for a webinar
  async registerUser(webinarId: string, userId: string) {
    const webinar = await this.prisma.webinar.findUnique({
      where: { id: webinarId, isDeleted: false },
      include: {
        registrations: {
          where: { isDeleted: false },
        },
      },
    });

    if (!webinar) throw new NotFoundException('Webinar not found');

    if (webinar.status !== WebinarStatus.SCHEDULED) {
      throw new BadRequestException('Cannot register for a webinar that is not scheduled');
    }

    if ((webinar.registrations as []).length >= webinar.maxCapacity) {
      throw new BadRequestException('Webinar has reached its maximum capacity');
    }

    const existingRegistration = await this.prisma.registration.findFirst({
      where: {
        webinarId: webinarId,
        userId: userId,
        isDeleted: false,
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

  // Unregister a user from a webinar (soft delete registration)
  async unregisterUser(webinarId: string, userId: string) {
    const registration = await this.prisma.registration.findFirst({
      where: {
        webinarId,
        userId,
        isDeleted: false,
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
      data: {
        status: RegistrationStatus.CANCELED,
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  // Get webinar support files
  async getWebinarSupports(
    webinarId: string,
  ): Promise<{ webinarSupports: Support[]; total: number }> {
    const [webinar, total] = await Promise.all([
      this.prisma.webinar.findUnique({
        where: { id: webinarId, isDeleted: false },
        include: {
          supports: {
            where: { isDeleted: false },
          },
        },
      }),
      this.prisma.webinar.count({
        where: {
          id: webinarId,
          isDeleted: false,
        },
      }),
    ]);

    if (!webinar) throw new NotFoundException('Webinar not found');

    return { webinarSupports: webinar?.supports, total };
  }
}
