import 'dotenv/config';
import { defineConfig } from 'prisma/config';

import { normalizePostgresConnectionString } from './src/prisma/normalize-connection-string';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: normalizePostgresConnectionString(process.env.DATABASE_URL),
  },
});
