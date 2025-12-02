import { z } from 'zod';

/**
 * Environment variable validation schema
 * This ensures all required environment variables are present and valid
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Session
  SESSION_SECRET: z
    .string()
    .min(32, 'SESSION_SECRET must be at least 32 characters'),

  // Optional: App URL for absolute URLs
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Validated environment variables
 * Uses lazy validation to avoid build-time errors
 */
let cachedEnv: z.infer<typeof envSchema> | null = null;

export function getEnv(): z.infer<typeof envSchema> {
  // Return cached value if already validated
  if (cachedEnv) {
    return cachedEnv;
  }

  // Only validate on server side at runtime
  if (typeof window !== 'undefined') {
    return {
      DATABASE_URL: '',
      SESSION_SECRET: '',
      NEXT_PUBLIC_APP_URL: undefined,
      NODE_ENV: 'development' as const,
    };
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);

    // In development, warn but continue with defaults
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Continuing with potentially missing environment variables...');
      cachedEnv = {
        DATABASE_URL: process.env.DATABASE_URL || '',
        SESSION_SECRET: process.env.SESSION_SECRET || 'dev-secret-min-32-chars-for-development',
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
      };
      return cachedEnv;
    }

    throw new Error('Invalid environment variables. Check server logs for details.');
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

// For backwards compatibility - lazy getter
export const env = new Proxy({} as z.infer<typeof envSchema>, {
  get(_, prop: string) {
    return getEnv()[prop as keyof z.infer<typeof envSchema>];
  },
});

// Type-safe environment access
export type Env = z.infer<typeof envSchema>;
