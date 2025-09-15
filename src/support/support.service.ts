/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { SupportType, Prisma } from '@/../generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateSupportDto, UpdateSupportDto } from '@/support/dto';
import { UploadService } from '@/upload/upload.service';

// Interface pour la query de recherche
interface FindAllQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  type?: SupportType;
  search?: string;
  from?: string;
  to?: string;
}

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
   * Crée un nouveau support
   */
  async create(dto: CreateSupportDto): Promise<SupportWithPresignedUrl> {
    // Validation des données d'entrée
    if (!dto.title?.trim()) {
      throw new BadRequestException('Title cannot be empty');
    }

    if (!dto.file?.trim()) {
      throw new BadRequestException('File cannot be empty');
    }

    try {
      const created = await this.prisma.support.create({
        data: {
          title: dto.title.trim(),
          file: dto.file.trim(),
          type: dto.type,
        },
      });

      // Génère une URL présignée pour le fichier
      const presignedUrl = await this.uploadService.getPresignedUrlFromPublicUrl(
        created.file ?? '',
      );

      return { ...created, file: presignedUrl };
    } catch (error: unknown) {
      throw new BadRequestException('Failed to create support');
    }
  }

  /**
   * Récupère tous les supports avec pagination et filtres
   */
  async findAll(query: FindAllQuery): Promise<PaginatedResponse<SupportWithPresignedUrl>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      type,
      search,
      from,
      to,
    } = query;

    // Validation des paramètres de pagination
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(100, Math.max(1, limit)); // Limite max de 100

    // Construction des filtres avec typage Prisma
    const where: Prisma.SupportWhereInput = {};

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

      // Génère des URLs présignées pour tous les fichiers
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
   * Récupère un support par son ID
   */
  async findOne(id: string): Promise<SupportWithPresignedUrl> {
    if (!id?.trim()) {
      throw new BadRequestException('ID cannot be empty');
    }

    try {
      const support = await this.prisma.support.findUnique({
        where: { id },
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
   * Met à jour un support existant
   */
  async update(id: string, dto: UpdateSupportDto): Promise<SupportWithPresignedUrl> {
    if (!id?.trim()) {
      throw new BadRequestException('ID cannot be empty');
    }

    // Vérifie si le support existe
    const existing = await this.prisma.support.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Support with ID ${id} not found`);
    }

    // Validation des données optionnelles
    if (dto.title !== undefined && !dto.title.trim()) {
      throw new BadRequestException('Title cannot be empty');
    }

    if (dto.file !== undefined && !dto.file.trim()) {
      throw new BadRequestException('File cannot be empty');
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
   * Supprime un support
   */
  async delete(id: string): Promise<{ message: string }> {
    if (!id?.trim()) {
      throw new BadRequestException('ID cannot be empty');
    }

    try {
      const support = await this.prisma.support.findUnique({
        where: { id },
        select: { id: true, file: true },
      });

      if (!support) {
        throw new NotFoundException(`Support with ID ${id} not found`);
      }

      // Supprime le support de la base de données
      await this.prisma.support.delete({ where: { id } });

      // TODO: Optionnel - Supprimer le fichier du stockage
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
   * Récupère les supports par type
   */
  async findByType(
    type: SupportType,
    query?: Omit<FindAllQuery, 'type'>,
  ): Promise<PaginatedResponse<SupportWithPresignedUrl>> {
    return this.findAll({ ...query, type });
  }

  /**
   * Compte le nombre total de supports
   */
  async count(): Promise<number> {
    try {
      return await this.prisma.support.count();
    } catch (error) {
      throw new BadRequestException('Failed to count supports');
    }
  }

  /**
   * Compte les supports par type
   */
  async countByType(): Promise<Record<SupportType, number>> {
    try {
      const counts = await this.prisma.support.groupBy({
        by: ['type'],
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
