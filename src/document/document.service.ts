import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateDocumentDto } from './dto/create-document.dto';
import { QueryDocumentDto } from './dto/query-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Prisma, DocumentType } from '@/../generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DocumentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDocumentDto) {
    return this.prisma.document.create({
      data: {
        ...dto,
      },
    });
  }

  async findAll(queryDto: QueryDocumentDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'publicationDate',
      sortOrder = 'desc',
      type,
      legalDomain,
      publishedAfter,
      publishedBefore,
    } = queryDto;

    const where: Prisma.DocumentWhereInput = {
      isDeleted: false,
      ...(type && { type }),
      ...(legalDomain && {
        legalDomain: { contains: legalDomain, mode: 'insensitive' },
      }),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(publishedAfter || publishedBefore
        ? {
            publicationDate: {
              ...(publishedAfter && { gte: publishedAfter }),
              ...(publishedBefore && { lte: publishedBefore }),
            },
          }
        : {}),
    };

    const validSortFields = ['publicationDate', 'createdAt', 'updatedAt', 'title'] as const;

    const finalSortBy = validSortFields.includes(sortBy as (typeof validSortFields)[number])
      ? sortBy
      : 'publicationDate';

    const [items, total] = await this.prisma.$transaction([
      this.prisma.document.findMany({
        where,
        orderBy: { [finalSortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.document.count({ where }),
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
    const doc = await this.prisma.document.findUnique({
      where: { id, isDeleted: false },
    });

    if (!doc) throw new NotFoundException('Document not found');

    return doc;
  }

  async update(id: string, dto: UpdateDocumentDto) {
    // Vérifier que le document existe et n'est pas supprimé
    const existingDoc = await this.prisma.document.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existingDoc) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.document.update({ where: { id }, data: dto });
  }

  // Soft delete
  async remove(id: string) {
    const existingDoc = await this.prisma.document.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existingDoc) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.document.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }
}
