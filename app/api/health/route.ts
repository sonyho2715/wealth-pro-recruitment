import { NextResponse } from 'next/server';
import { checkDBHealth, dbConfig } from '@/lib/db';
import { cache } from '@/lib/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: {
      status: 'up' | 'down';
      latency?: number;
      error?: string;
    };
    cache: {
      status: 'up';
      size: number;
      maxSize: number;
    };
  };
  config: {
    connectionLimit: number;
    queryTimeout: number;
  };
}

export async function GET(): Promise<NextResponse<HealthStatus>> {
  const dbHealth = await checkDBHealth();
  const cacheStats = cache.stats();

  const status: HealthStatus = {
    status: dbHealth.ok ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '2.0.0',
    checks: {
      database: {
        status: dbHealth.ok ? 'up' : 'down',
        latency: dbHealth.latency,
        error: dbHealth.error,
      },
      cache: {
        status: 'up',
        size: cacheStats.size,
        maxSize: cacheStats.maxSize,
      },
    },
    config: {
      connectionLimit: dbConfig.connectionLimit,
      queryTimeout: dbConfig.queryTimeout,
    },
  };

  const httpStatus = dbHealth.ok ? 200 : 503;

  return NextResponse.json(status, { status: httpStatus });
}
