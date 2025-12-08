/**
 * Tenant Database Helper
 *
 * Use this instead of importing db directly when you need
 * organization-aware database access (for white-label support).
 *
 * Usage:
 *   import { getDb } from '@/lib/tenant-db';
 *
 *   // In a server action or API route:
 *   const db = await getDb(organizationId);
 *   const contacts = await db.contact.findMany({ ... });
 */

import { PrismaClient } from '@prisma/client';
import { db } from './db';
import { getTenantClient, hasDedicatedDatabase } from './control-plane';

/**
 * Get the appropriate database client for an organization
 *
 * - If the organization has a dedicated database, returns a client connected to it
 * - Otherwise, returns the shared database client
 *
 * @param organizationId - The organization ID to get the database for
 * @returns PrismaClient connected to the appropriate database
 */
export async function getDb(organizationId?: string | null): Promise<PrismaClient> {
  // If no organization ID, use shared database
  if (!organizationId) {
    return db;
  }

  // Check if this organization has a dedicated database
  const hasDedicated = await hasDedicatedDatabase(organizationId);

  if (hasDedicated) {
    // Return tenant-specific database client
    return getTenantClient(organizationId);
  }

  // Fall back to shared database
  return db;
}

/**
 * Get database client from session context
 * Convenience function for server actions
 */
export async function getDbFromSession(session: {
  agentId?: string;
  organizationId?: string;
}): Promise<PrismaClient> {
  // If session has organizationId, use it directly
  if (session.organizationId) {
    return getDb(session.organizationId);
  }

  // Otherwise, look up the agent's organization
  if (session.agentId) {
    const agent = await db.agent.findUnique({
      where: { id: session.agentId },
      select: { organizationId: true },
    });

    if (agent?.organizationId) {
      return getDb(agent.organizationId);
    }
  }

  // Fall back to shared database
  return db;
}

/**
 * Type-safe database transaction helper for tenant databases
 */
export async function withTenantTransaction<T>(
  organizationId: string,
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  const tenantDb = await getDb(organizationId);
  return tenantDb.$transaction(async (tx) => {
    return callback(tx as unknown as PrismaClient);
  });
}
