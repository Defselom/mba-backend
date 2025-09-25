/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { SupportType, Prisma } from '@/../generated/prisma';
import { LoggedInUser } from '@/auth/dto';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateSupportDto, UpdateSupportDto, SupportQueryDto } from '@/support/dto';
import { UploadService } from '@/upload/upload.service';

// Interface pour la réponse paginée
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Type pour les données de support avec URL présignée
interface SupportWithPresignedUrl {
  id: string;
  title: string;
  file: string;
  type: SupportType;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class SupportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  /**
   * Create a new support document
   */
  async create(dto: CreateSupportDto, user: LoggedInUser): Promise<SupportWithPresignedUrl> {
    try {
      // find if webinar exists if webinarId is provided
      if (dto.webinarId) {
        const webinar = await this.prisma.webinar.findUnique({
          where: { id: dto.webinarId, isDeleted: false },
          select: { id: true },
        });

        if (!webinar) {
          throw new BadRequestException(`Webinar with ID ${dto.webinarId} does not exist`);
        }
      }

      const created = await this.prisma.support.create({
        data: {
          title: dto.title,
          file: dto.file,
          type: dto.type,
          webinarId: dto.webinarId,
          uploadedById: user.id,
        },
      });

      // Génère une URL présignée pour le fichier
      const presignedUrl = await this.uploadService.getPresignedUrlFromPublicUrl(
        created.file ?? '',
      );

      return { ...created, file: presignedUrl };
    } catch (error: unknown) {
      console.log(error);

      throw new BadRequestException((error as Error)?.message || 'Failed to create support');
    }
  }

  /**
   * Récupère tous les supports avec pagination et filtres
   */
  async findAll(queryDto: SupportQueryDto): Promise<PaginatedResponse<SupportWithPresignedUrl>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      type,
      from,
      to,
    } = queryDto;

    // Validate pagination parameters
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(100, Math.max(1, limit)); //  Max limit at 100

    // Construction of the where clause
    const where: Prisma.SupportWhereInput = {
      isDeleted: false,
    };

    if (type) {
      where.type = type;
    }

    if (search?.trim()) {
      where.title = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    // Filtres par date si fournis
    if (from || to) {
      const dateFilter: Prisma.DateTimeFilter = {};

      if (from) {
        try {
          dateFilter.gte = new Date(from);
        } catch (error) {
          throw new BadRequestException('Invalid "from" date format');
        }
      }

      if (to) {
        try {
          dateFilter.lte = new Date(to);
        } catch (error) {
          throw new BadRequestException('Invalid "to" date format');
        }
      }

      where.createdAt = dateFilter;
    }

    // Validation du champ de tri
    const validSortFields = ['createdAt', 'updatedAt', 'title', 'type'] as const;

    const finalSortBy = validSortFields.includes(sortBy as (typeof validSortFields)[number])
      ? sortBy
      : 'createdAt';

    const finalSortOrder = (['asc', 'desc'] as const).includes(sortOrder) ? sortOrder : 'desc';

    // Construction de l'orderBy avec typage Prisma
    const orderBy: Prisma.SupportOrderByWithRelationInput = {
      [finalSortBy]: finalSortOrder,
    };

    try {
      const [items, total] = await this.prisma.$transaction([
        this.prisma.support.findMany({
          where,
          skip: (validatedPage - 1) * validatedLimit,
          take: validatedLimit,
          orderBy,
        }),
        this.prisma.support.count({ where }),
      ]);

      // Generate presigned URLs for each support file
      const data: SupportWithPresignedUrl[] = await Promise.all(
        items.map(async item => {
          const presignedUrl = await this.uploadService.getPresignedUrlFromPublicUrl(
            item.file ?? '',
          );

          return { ...item, file: presignedUrl };
        }),
      );

      const totalPages = Math.ceil(total / validatedLimit);

      return {
        data,
        total,
        page: validatedPage,
        limit: validatedLimit,
        totalPages,
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch supports');
    }
  }

  /**
   *  Get a support by ID
   */
  async findOne(id: string): Promise<SupportWithPresignedUrl> {
    if (!id?.trim()) {
      throw new BadRequestException('ID cannot be empty');
    }

    try {
      const support = await this.prisma.support.findUnique({
        where: { id, isDeleted: false },
      });

      if (!support) {
        throw new NotFoundException(`Support with ID ${id} not found`);
      }

      // Génère une URL présignée pour le fichier
      const presignedUrl = await this.uploadService.getPresignedUrlFromPublicUrl(
        support.file ?? '',
      );

      return { ...support, file: presignedUrl };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException('Failed to fetch support');
    }
  }

  /**
   * Update a support
   */
  async update(id: string, dto: UpdateSupportDto): Promise<SupportWithPresignedUrl> {
    const existing = await this.prisma.support.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      throw new NotFoundException(`Support with ID ${id} not found`);
    }

    try {
      // Prépare les données à mettre à jour avec typage Prisma
      const updateData: Prisma.SupportUpdateInput = {};

      if (dto.title !== undefined) {
        updateData.title = dto.title.trim();
      }

      if (dto.file !== undefined) {
        updateData.file = dto.file.trim();
      }

      if (dto.type !== undefined) {
        updateData.type = dto.type;
      }

      const updated = await this.prisma.support.update({
        where: { id },
        data: updateData,
      });

      // Génère une URL présignée pour le fichier
      const presignedUrl = await this.uploadService.getPresignedUrlFromPublicUrl(
        updated.file ?? '',
      );

      return { ...updated, file: presignedUrl };
    } catch (error) {
      throw new BadRequestException('Failed to update support');
    }
  }

  /**
   * Soft delete a support document
   */
  async delete(id: string): Promise<{ message: string }> {
    try {
      const support = await this.prisma.support.findUnique({
        where: { id, isDeleted: false },
        select: { id: true, file: true },
      });

      if (!support) {
        throw new NotFoundException(`Support with ID ${id} not found`);
      }

      // Effectue un soft delete au lieu d'une suppression physique
      await this.prisma.support.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      // TODO: Optionnel - Supprimer le fichier du stockage après soft delete
      // if (support.file) {
      //   await this.uploadService.deleteFile(support.file);
      // }

      return { message: 'Support deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException('Failed to delete support');
    }
  }

  /**
   * Count supports grouped by type
   */
  async countByType(): Promise<Record<SupportType, number>> {
    try {
      const counts = await this.prisma.support.groupBy({
        by: ['type'],
        where: { isDeleted: false },
        _count: {
          type: true,
        },
      });

      const result: Record<string, number> = {};

      counts.forEach(count => {
        result[count.type] = count._count.type;
      });

      return result as Record<SupportType, number>;
    } catch (error) {
      throw new BadRequestException('Failed to count supports by type');
    }
  }
}
