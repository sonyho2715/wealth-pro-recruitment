/**
 * Simple in-memory cache with TTL support
 * Can be replaced with Redis for production scaling
 *
 * Usage:
 *   import { cache } from '@/lib/cache';
 *
 *   // Set with 5 minute TTL
 *   cache.set('user:123', userData, 300);
 *
 *   // Get (returns null if expired or not found)
 *   const user = cache.get<User>('user:123');
 *
 *   // Delete
 *   cache.delete('user:123');
 *
 *   // Get or set pattern
 *   const data = await cache.getOrSet('key', async () => fetchData(), 300);
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  // Default TTL: 5 minutes
  private defaultTTL = 300;

  // Maximum cache size to prevent memory issues
  private maxSize = parseInt(process.env.CACHE_MAX_SIZE || '10000');

  constructor() {
    // Run cleanup every minute
    if (typeof window === 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    }
  }

  /**
   * Set a value in cache with optional TTL (in seconds)
   */
  set<T>(key: string, value: T, ttlSeconds?: number): void {
    // Enforce max size
    if (this.store.size >= this.maxSize) {
      this.evictOldest();
    }

    const ttl = ttlSeconds ?? this.defaultTTL;
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl * 1000,
    });
  }

  /**
   * Get a value from cache (returns null if not found or expired)
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Get or set pattern - useful for caching async operations
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttlSeconds);
    return value;
  }

  /**
   * Delete a key from cache
   */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Delete all keys matching a prefix
   */
  deleteByPrefix(prefix: string): number {
    let count = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; maxSize: number } {
    return {
      size: this.store.size,
      maxSize: this.maxSize,
    };
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Evict oldest entries when cache is full
   */
  private evictOldest(): void {
    // Remove 10% of entries (oldest first by expiration)
    const entries = Array.from(this.store.entries())
      .sort((a, b) => a[1].expiresAt - b[1].expiresAt);

    const toRemove = Math.ceil(this.maxSize * 0.1);
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      this.store.delete(entries[i][0]);
    }
  }

  /**
   * Stop cleanup interval (for graceful shutdown)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Singleton instance
const globalForCache = globalThis as unknown as {
  cache: MemoryCache | undefined;
};

export const cache = globalForCache.cache ?? new MemoryCache();

if (process.env.NODE_ENV !== 'production') {
  globalForCache.cache = cache;
}

// Cache key generators for consistent naming
export const cacheKeys = {
  // Organization cache
  organization: (id: string) => `org:${id}`,
  organizationBySlug: (slug: string) => `org:slug:${slug}`,

  // Agent cache
  agent: (id: string) => `agent:${id}`,
  agentByEmail: (email: string) => `agent:email:${email}`,
  agentsByOrg: (orgId: string) => `agents:org:${orgId}`,

  // Session cache
  session: (sessionId: string) => `session:${sessionId}`,

  // Dashboard stats cache
  dashboardStats: (agentId: string) => `dashboard:${agentId}`,
  orgStats: (orgId: string) => `orgstats:${orgId}`,

  // Leaderboard cache
  leaderboard: (orgId: string, period: string) => `leaderboard:${orgId}:${period}`,
};

// Cache TTL presets (in seconds)
export const cacheTTL = {
  short: 60,           // 1 minute - for frequently changing data
  medium: 300,         // 5 minutes - default
  long: 900,           // 15 minutes - for stable data
  session: 3600,       // 1 hour - for session data
  static: 86400,       // 24 hours - for rarely changing data
};
