import { Injectable } from '@nestjs/common';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@/generated/prisma';
import { normalizePostgresConnectionString } from '@/prisma/normalize-connection-string';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: normalizePostgresConnectionString(process.env.DATABASE_URL),
    });

    super({
      adapter,
    });
  }

  cleanDb() {
    return this.$transaction([this.userAccount.deleteMany()]);
  }
}
