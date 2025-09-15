import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateDocumentDto } from './dto/create-document.dto';
import { QueryDocumentDto } from './dto/query-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Prisma } from '@/../generated/prisma';
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

  async findAll(query: QueryDocumentDto) {
    const { type, legalDomain, search, publishedAfter, publishedBefore, page, limit } = query;

    const where: Prisma.DocumentWhereInput = {
      type,
      legalDomain: legalDomain ? { contains: legalDomain, mode: 'insensitive' } : undefined,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      publicationDate: {
        gte: publishedAfter,
        lte: publishedBefore,
      },
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.document.findMany({
        where,
        orderBy: { publicationDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });

    if (!doc) throw new NotFoundException('Document not found');

    return doc;
  }

  async update(id: string, dto: UpdateDocumentDto) {
    return this.prisma.document.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.document.delete({ where: { id } });
  }
}
