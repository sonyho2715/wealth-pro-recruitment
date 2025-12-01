import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // Check if DATABASE_URL is available
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set. Database operations will fail.');
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

// Use getter to ensure lazy initialization
let _db: PrismaClient | undefined;

export const db = (() => {
  if (!_db) {
    _db = globalForPrisma.prisma ?? createPrismaClient();
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = _db;
    }
  }
  return _db;
})();
