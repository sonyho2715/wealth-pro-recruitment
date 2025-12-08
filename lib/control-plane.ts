/**
 * Control Plane for Database-Per-Organization Multi-Tenancy
 *
 * This module manages the mapping between organizations and their dedicated databases.
 * Used for white-label/resell scenarios where each client gets their own database.
 *
 * Architecture:
 * - Control Plane DB: Stores org → database URL mappings
 * - Tenant DBs: Each white-label client has their own PostgreSQL database
 */

import { PrismaClient } from '@prisma/client';

// Control plane database client (the main/master database)
const globalForControlPlane = globalThis as unknown as {
  controlPlanePrisma: PrismaClient | undefined;
};

export const controlPlane = globalForControlPlane.controlPlanePrisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForControlPlane.controlPlanePrisma = controlPlane;
}

// Cache for tenant database connections (connection pooling)
const tenantConnections = new Map<string, PrismaClient>();

// Tenant database URL storage (in production, this would be in the control plane DB)
// For now, we'll store this in the Organization model
interface TenantConfig {
  organizationId: string;
  databaseUrl: string;
  isProvisioned: boolean;
  provisionedAt: Date | null;
}

/**
 * Get a Prisma client for a specific organization's database
 */
export async function getTenantClient(organizationId: string): Promise<PrismaClient> {
  // Check cache first
  if (tenantConnections.has(organizationId)) {
    return tenantConnections.get(organizationId)!;
  }

  // Get database URL from control plane
  const org = await controlPlane.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      tenantDatabaseUrl: true,
      tenantDatabaseProvisioned: true,
    },
  });

  if (!org) {
    throw new Error(`Organization ${organizationId} not found`);
  }

  // If no dedicated database, use the shared database
  if (!org.tenantDatabaseUrl || !org.tenantDatabaseProvisioned) {
    return controlPlane; // Fall back to shared database
  }

  // Create new connection for tenant
  const tenantClient = new PrismaClient({
    datasources: {
      db: {
        url: org.tenantDatabaseUrl,
      },
    },
    log: ['error'],
  });

  // Cache the connection
  tenantConnections.set(organizationId, tenantClient);

  return tenantClient;
}

/**
 * Provision a new database for an organization (white-label setup)
 * This integrates with Railway API to create a new PostgreSQL instance
 */
export async function provisionTenantDatabase(organizationId: string): Promise<{
  success: boolean;
  databaseUrl?: string;
  error?: string;
}> {
  const railwayToken = process.env.RAILWAY_API_TOKEN;

  if (!railwayToken) {
    return {
      success: false,
      error: 'Railway API token not configured. Set RAILWAY_API_TOKEN environment variable.',
    };
  }

  try {
    // Get organization info
    const org = await controlPlane.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, slug: true, name: true },
    });

    if (!org) {
      return { success: false, error: 'Organization not found' };
    }

    // Create new Railway project and PostgreSQL service
    // Using Railway's GraphQL API
    const projectName = `wp-tenant-${org.slug}`;

    const createProjectResponse = await fetch('https://backboard.railway.app/graphql/v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${railwayToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation CreateProject($name: String!) {
            projectCreate(input: { name: $name }) {
              id
              name
            }
          }
        `,
        variables: { name: projectName },
      }),
    });

    const projectData = await createProjectResponse.json();

    if (projectData.errors) {
      return { success: false, error: projectData.errors[0].message };
    }

    const projectId = projectData.data.projectCreate.id;

    // Add PostgreSQL plugin to the project
    const addPostgresResponse = await fetch('https://backboard.railway.app/graphql/v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${railwayToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation AddPostgres($projectId: String!) {
            serviceCreate(input: {
              projectId: $projectId,
              name: "postgres",
              source: { image: "postgres:15" }
            }) {
              id
            }
          }
        `,
        variables: { projectId },
      }),
    });

    const postgresData = await addPostgresResponse.json();

    if (postgresData.errors) {
      return { success: false, error: postgresData.errors[0].message };
    }

    // Wait a moment for the database to be ready
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Get the database URL from Railway
    const getUrlResponse = await fetch('https://backboard.railway.app/graphql/v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${railwayToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query GetDatabaseUrl($projectId: String!) {
            project(id: $projectId) {
              services {
                edges {
                  node {
                    id
                    name
                    serviceInstances {
                      edges {
                        node {
                          environmentVariables {
                            edges {
                              node {
                                name
                                value
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: { projectId },
      }),
    });

    const urlData = await getUrlResponse.json();

    // Extract DATABASE_URL from response
    let databaseUrl: string | null = null;

    const services = urlData.data?.project?.services?.edges || [];
    for (const service of services) {
      const instances = service.node?.serviceInstances?.edges || [];
      for (const instance of instances) {
        const envVars = instance.node?.environmentVariables?.edges || [];
        for (const envVar of envVars) {
          if (envVar.node?.name === 'DATABASE_URL') {
            databaseUrl = envVar.node.value;
            break;
          }
        }
      }
    }

    if (!databaseUrl) {
      return {
        success: false,
        error: 'Database created but URL not yet available. Please try again in a few minutes.'
      };
    }

    // Update organization with the new database URL
    await controlPlane.organization.update({
      where: { id: organizationId },
      data: {
        tenantDatabaseUrl: databaseUrl,
        tenantDatabaseProvisioned: true,
        tenantDatabaseProvisionedAt: new Date(),
        tenantRailwayProjectId: projectId,
      },
    });

    // Run migrations on the new database
    await runMigrationsOnTenant(databaseUrl);

    return { success: true, databaseUrl };
  } catch (error) {
    console.error('Error provisioning tenant database:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to provision database'
    };
  }
}

/**
 * Run Prisma migrations on a tenant database
 */
async function runMigrationsOnTenant(databaseUrl: string): Promise<void> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  try {
    // Run prisma db push to sync schema (in production, use migrate deploy)
    await execAsync(`DATABASE_URL="${databaseUrl}" npx prisma db push --skip-generate`, {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: databaseUrl },
    });
  } catch (error) {
    console.error('Migration error:', error);
    throw new Error('Failed to run migrations on tenant database');
  }
}

/**
 * Close a tenant database connection
 */
export async function closeTenantConnection(organizationId: string): Promise<void> {
  const client = tenantConnections.get(organizationId);
  if (client) {
    await client.$disconnect();
    tenantConnections.delete(organizationId);
  }
}

/**
 * Close all tenant connections (for graceful shutdown)
 */
export async function closeAllTenantConnections(): Promise<void> {
  for (const [orgId, client] of tenantConnections) {
    await client.$disconnect();
  }
  tenantConnections.clear();
}

/**
 * Check if an organization has a dedicated database
 */
export async function hasDedicatedDatabase(organizationId: string): Promise<boolean> {
  const org = await controlPlane.organization.findUnique({
    where: { id: organizationId },
    select: { tenantDatabaseProvisioned: true },
  });
  return org?.tenantDatabaseProvisioned ?? false;
}

/**
 * Get database info for an organization
 */
export async function getTenantDatabaseInfo(organizationId: string): Promise<{
  hasDedicatedDb: boolean;
  provisionedAt: Date | null;
  railwayProjectId: string | null;
}> {
  const org = await controlPlane.organization.findUnique({
    where: { id: organizationId },
    select: {
      tenantDatabaseProvisioned: true,
      tenantDatabaseProvisionedAt: true,
      tenantRailwayProjectId: true,
    },
  });

  return {
    hasDedicatedDb: org?.tenantDatabaseProvisioned ?? false,
    provisionedAt: org?.tenantDatabaseProvisionedAt ?? null,
    railwayProjectId: org?.tenantRailwayProjectId ?? null,
  };
}
