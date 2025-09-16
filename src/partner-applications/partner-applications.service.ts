import { Injectable, NotFoundException } from '@nestjs/common';

import { CreatePartnerApplicationDto } from './dto/create-partner-application.dto';
import { ReviewPartnerApplicationDto } from './dto/review-partner-application.dto';
import { ApplicationStatus } from '@/../generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';

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

  async findMany(params?: { status?: ApplicationStatus }) {
    return this.prisma.partnerApplication.findMany({
      where: { status: params?.status },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const app = await this.prisma.partnerApplication.findUnique({ where: { id } });

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
}
