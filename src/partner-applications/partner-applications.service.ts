import { Injectable, NotFoundException } from '@nestjs/common';

import { CreatePartnerApplicationDto } from './dto/create-partner-application.dto';
import { ReviewPartnerApplicationDto } from './dto/review-partner-application.dto';
import { ApplicationStatus } from '@/../generated/prisma';
import { Prisma } from '@/../generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/shared/dto';

@Injectable()
export class PartnerApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePartnerApplicationDto) {
    return this.prisma.partnerApplication.create({
      data: {
        responsibleFirstName: dto.responsibleFirstName,
        responsibleLastName: dto.responsibleLastName,
        responsibleEmail: dto.responsibleEmail,
        phone: dto.phone,
        occupiedPosition: dto.occupiedPosition,
        structureName: dto.structureName,
        partnershipType: dto.partnershipType,
        providedExpertise: dto.providedExpertise,
        collaborationExperience: dto.collaborationExperience,
        status: ApplicationStatus.PENDING,
      },
    });
  }
  async findMany(paginationDto: PaginationDto, params?: { status?: ApplicationStatus }) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = paginationDto;

    const skip = (page - 1) * limit;

    const AND: Prisma.PartnerApplicationWhereInput[] = [{ isDeleted: false }];

    if (params?.status) {
      AND.push({ status: params.status });
    }

    if (search) {
      AND.push({
        OR: [
          { responsibleFirstName: { contains: search, mode: 'insensitive' } },
          { responsibleLastName: { contains: search, mode: 'insensitive' } },
          { responsibleEmail: { contains: search, mode: 'insensitive' } },
          { structureName: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.PartnerApplicationWhereInput = AND.length ? { AND } : {};

    const validSortFields = [
      'createdAt',
      'updatedAt',
      'responsibleFirstName',
      'structureName',
      'status',
    ] as const;

    const finalSortBy = validSortFields.includes(sortBy as (typeof validSortFields)[number])
      ? sortBy
      : 'createdAt';

    const orderBy: Prisma.PartnerApplicationOrderByWithRelationInput = {
      [finalSortBy]: sortOrder,
    };

    const [data, total] = await Promise.all([
      this.prisma.partnerApplication.findMany({ where, orderBy, skip, take: limit }),
      this.prisma.partnerApplication.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const app = await this.prisma.partnerApplication.findUnique({
      where: { id, isDeleted: false },
    });

    if (!app) throw new NotFoundException('Candidature not found');

    return app;
  }

  async review(id: string, body: ReviewPartnerApplicationDto) {
    const app = await this.findOne(id);

    const updated = await this.prisma.partnerApplication.update({
      where: { id: app.id },
      data: { status: body.status, adminComment: body.adminComment ?? null },
    });

    // Si acceptée : donner le rôle PARTNER (si pas déjà) + (option) créer/maj PartnerProfile
    /* if (body.status === ApplicationStatus.ACCEPTED) {
      await this.prisma.userAccount.update({
        where: { id: updated.userId },
        data: { role: 'PARTNER' }, // garde ton enum UserRole côté Prisma
      });
    }
 */
    return updated;
  }

  // Soft delete d'une candidature
  async delete(id: string) {
    const app = await this.findOne(id);

    return await this.prisma.partnerApplication.update({
      where: { id: app.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }
}
