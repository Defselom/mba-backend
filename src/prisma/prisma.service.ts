import { Injectable, OnModuleDestroy } from '@nestjs/common';

import { PrismaClient } from '@/../generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  cleanDb() {
    return this.$transaction([this.userAccount.deleteMany()]);
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
