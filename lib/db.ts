import { PrismaClient } from '@prisma/client';

// Connection pool configuration for scaling
const POOL_CONFIG = {
  // Maximum number of connections in the pool
  connectionLimit: parseInt(process.env.DATABASE_CONNECTION_LIMIT || '10'),
  // Connection timeout in milliseconds
  connectTimeout: parseInt(process.env.DATABASE_CONNECT_TIMEOUT || '10000'),
  // Query timeout in milliseconds (30 seconds default)
  queryTimeout: parseInt(process.env.DATABASE_QUERY_TIMEOUT || '30000'),
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set. Database operations will fail.');
  }

  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'stdout' },
          { level: 'warn', emit: 'stdout' },
        ]
      : [{ level: 'error', emit: 'stdout' }],
    // Transaction configuration for better reliability
    transactionOptions: {
      maxWait: 5000, // Maximum time to wait for a transaction slot
      timeout: POOL_CONFIG.queryTimeout, // Transaction timeout
    },
  });

  // Log slow queries in development
  if (process.env.NODE_ENV === 'development') {
    (client.$on as (event: 'query', callback: (e: { duration: number; query: string }) => void) => void)(
      'query',
      (e) => {
        if (e.duration > 1000) {
          console.warn(`Slow query (${e.duration}ms):`, e.query);
        }
      }
    );
  }

  return client;
}

// Singleton pattern with lazy initialization
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

// Graceful shutdown helper
export async function disconnectDB(): Promise<void> {
  if (_db) {
    await _db.$disconnect();
    _db = undefined;
  }
}

// Health check for monitoring
export async function checkDBHealth(): Promise<{ ok: boolean; latency?: number; error?: string }> {
  const start = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return { ok: true, latency: Date.now() - start };
  } catch (error) {
    return {
      ok: false,
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Query wrapper with timeout for long-running queries
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = POOL_CONFIG.queryTimeout
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Query timeout after ${timeoutMs}ms`)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
}

// Export config for reference
export const dbConfig = POOL_CONFIG;
