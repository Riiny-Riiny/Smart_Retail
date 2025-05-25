import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const config = {
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};

const prisma = global.prisma || new PrismaClient(config);

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma; 