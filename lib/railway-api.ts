/**
 * Railway API Client for Platform-as-a-Template Provisioning
 *
 * This module handles Railway project and PostgreSQL database provisioning
 * for creating isolated database instances for each agent.
 */

import crypto from 'crypto';

const RAILWAY_API_BASE = 'https://backboard.railway.app/graphql/v2';

interface RailwayProject {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  environments: Array<{
    id: string;
    name: string;
  }>;
}

interface RailwayService {
  id: string;
  name: string;
  projectId: string;
}

interface RailwayVariable {
  name: string;
  value: string;
}

interface RailwayDatabaseCredentials {
  databaseUrl: string;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

/**
 * Railway API Client using GraphQL
 */
export class RailwayClient {
  private token: string;
  private teamId?: string;

  constructor(token: string, teamId?: string) {
    this.token = token;
    this.teamId = teamId;
  }

  private async graphql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const response = await fetch(RAILWAY_API_BASE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();

    if (data.errors) {
      throw new Error(data.errors[0]?.message || 'Railway API error');
    }

    return data.data;
  }

  /**
   * Get current user info
   */
  async getMe(): Promise<{ me: { id: string; email: string; name: string } }> {
    return this.graphql(`
      query {
        me {
          id
          email
          name
        }
      }
    `);
  }

  /**
   * List all projects
   */
  async listProjects(): Promise<{ projects: { edges: Array<{ node: RailwayProject }> } }> {
    return this.graphql(`
      query {
        projects {
          edges {
            node {
              id
              name
              description
              createdAt
              updatedAt
              environments {
                edges {
                  node {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
    `);
  }

  /**
   * Create a new project
   */
  async createProject(name: string, description?: string): Promise<{ projectCreate: RailwayProject }> {
    const input: Record<string, unknown> = { name, description };

    // Add workspaceId for Pro Workspace accounts
    if (this.teamId) {
      input.workspaceId = this.teamId;
    }

    return this.graphql(
      `
      mutation CreateProject($input: ProjectCreateInput!) {
        projectCreate(input: $input) {
          id
          name
          description
          createdAt
          environments {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    `,
      { input }
    );
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<void> {
    await this.graphql(
      `
      mutation DeleteProject($projectId: String!) {
        projectDelete(id: $projectId)
      }
    `,
      { projectId }
    );
  }

  /**
   * Get a project by ID
   */
  async getProject(projectId: string): Promise<{ project: RailwayProject }> {
    return this.graphql(
      `
      query GetProject($projectId: String!) {
        project(id: $projectId) {
          id
          name
          description
          createdAt
          updatedAt
          environments {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    `,
      { projectId }
    );
  }

  /**
   * Create a PostgreSQL database service in a project using Docker image
   */
  async createPostgresService(
    projectId: string,
    environmentId: string
  ): Promise<{ serviceCreate: RailwayService }> {
    // Generate secure password
    const password = crypto.randomBytes(16).toString('hex');

    // Step 1: Create service
    const serviceResult = await this.graphql<{ serviceCreate: RailwayService }>(
      `
      mutation CreateService($input: ServiceCreateInput!) {
        serviceCreate(input: $input) {
          id
          name
        }
      }
    `,
      { input: { projectId, name: 'PostgreSQL' } }
    );

    const service = serviceResult.serviceCreate;

    // Step 2: Connect Docker image
    await this.graphql(
      `
      mutation ServiceConnect($id: String!, $input: ServiceConnectInput!) {
        serviceConnect(id: $id, input: $input) {
          id
        }
      }
    `,
      { id: service.id, input: { image: 'postgres:16' } }
    );

    // Step 3: Set environment variables
    await this.graphql(
      `
      mutation SetVariables($projectId: String!, $environmentId: String!, $serviceId: String!, $variables: EnvironmentVariables!) {
        variableCollectionUpsert(
          input: {
            projectId: $projectId
            environmentId: $environmentId
            serviceId: $serviceId
            variables: $variables
          }
        )
      }
    `,
      {
        projectId,
        environmentId,
        serviceId: service.id,
        variables: {
          POSTGRES_USER: 'postgres',
          POSTGRES_PASSWORD: password,
          POSTGRES_DB: 'railway',
        },
      }
    );

    // Step 4: Trigger deployment
    await this.graphql(
      `
      mutation Deploy($serviceId: String!, $environmentId: String!) {
        serviceInstanceRedeploy(serviceId: $serviceId, environmentId: $environmentId)
      }
    `,
      { serviceId: service.id, environmentId }
    );

    // Step 5: Create TCP proxy for external access
    const proxyResult = await this.graphql<{
      tcpProxyCreate: { id: string; domain: string; proxyPort: number };
    }>(
      `
      mutation CreateTCPProxy($input: TCPProxyCreateInput!) {
        tcpProxyCreate(input: $input) {
          id
          domain
          proxyPort
        }
      }
    `,
      {
        input: {
          serviceId: service.id,
          environmentId,
          applicationPort: 5432,
        },
      }
    );

    // Store TCP proxy info in service for later retrieval
    const tcpProxy = proxyResult.tcpProxyCreate;
    console.log(`  TCP Proxy: ${tcpProxy.domain}:${tcpProxy.proxyPort}`);

    // Wait for database to be ready
    await this.waitForDeployment(service.id, environmentId);

    return { serviceCreate: service };
  }

  /**
   * Wait for deployment to be ready
   */
  private async waitForDeployment(
    serviceId: string,
    environmentId: string,
    timeoutMs = 60000,
    pollIntervalMs = 5000
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const result = await this.graphql<{
          deployments: { edges: Array<{ node: { status: string } }> };
        }>(
          `
          query GetDeployments($serviceId: String!) {
            deployments(first: 1, input: { serviceId: $serviceId }) {
              edges {
                node {
                  status
                }
              }
            }
          }
        `,
          { serviceId }
        );

        const deployment = result.deployments.edges[0]?.node;
        if (deployment?.status === 'SUCCESS') {
          return;
        }
      } catch {
        // Continue polling
      }

      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }
  }

  /**
   * Get all services in a project
   */
  async getProjectServices(
    projectId: string
  ): Promise<{ project: { services: { edges: Array<{ node: RailwayService }> } } }> {
    return this.graphql(
      `
      query GetServices($projectId: String!) {
        project(id: $projectId) {
          services {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    `,
      { projectId }
    );
  }

  /**
   * Get environment variables for a service
   */
  async getServiceVariables(
    projectId: string,
    environmentId: string,
    serviceId: string
  ): Promise<Record<string, string>> {
    const result = await this.graphql<{
      variables: Record<string, string>;
    }>(
      `
      query GetVariables($projectId: String!, $environmentId: String!, $serviceId: String!) {
        variables(
          projectId: $projectId
          environmentId: $environmentId
          serviceId: $serviceId
        )
      }
    `,
      { projectId, environmentId, serviceId }
    );

    return result.variables || {};
  }

  /**
   * Get the DATABASE_URL from a PostgreSQL service (internal)
   */
  async getDatabaseUrl(
    projectId: string,
    environmentId: string,
    serviceId: string,
    maxRetries = 10,
    retryDelayMs = 5000
  ): Promise<string> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const variables = await this.getServiceVariables(projectId, environmentId, serviceId);

        // For Docker-based postgres, construct from POSTGRES_* variables with internal domain
        if (variables.POSTGRES_USER && variables.POSTGRES_PASSWORD && variables.POSTGRES_DB) {
          const host = variables.RAILWAY_PRIVATE_DOMAIN || 'localhost';
          return `postgresql://${variables.POSTGRES_USER}:${variables.POSTGRES_PASSWORD}@${host}:5432/${variables.POSTGRES_DB}`;
        }

        // Legacy: Railway provides DATABASE_URL directly
        if (variables.DATABASE_URL) {
          return variables.DATABASE_URL;
        }

        // Legacy: Construct from PG* components
        if (variables.PGHOST && variables.PGUSER && variables.PGPASSWORD && variables.PGDATABASE) {
          const port = variables.PGPORT || '5432';
          return `postgresql://${variables.PGUSER}:${variables.PGPASSWORD}@${variables.PGHOST}:${port}/${variables.PGDATABASE}?sslmode=require`;
        }
      } catch {
        // Continue retrying
      }

      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }

    throw new Error('Database URL not available after maximum retries');
  }

  /**
   * Get the public DATABASE_URL (with external host via TCP proxy)
   */
  async getPublicDatabaseUrl(
    projectId: string,
    environmentId: string,
    serviceId: string,
    maxRetries = 10,
    retryDelayMs = 5000
  ): Promise<string> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const variables = await this.getServiceVariables(projectId, environmentId, serviceId);

        // For Docker-based postgres, construct from POSTGRES_* and RAILWAY_TCP_PROXY_* variables
        if (
          variables.POSTGRES_USER &&
          variables.POSTGRES_PASSWORD &&
          variables.POSTGRES_DB &&
          variables.RAILWAY_TCP_PROXY_DOMAIN &&
          variables.RAILWAY_TCP_PROXY_PORT
        ) {
          return `postgresql://${variables.POSTGRES_USER}:${variables.POSTGRES_PASSWORD}@${variables.RAILWAY_TCP_PROXY_DOMAIN}:${variables.RAILWAY_TCP_PROXY_PORT}/${variables.POSTGRES_DB}?sslmode=disable`;
        }

        // Legacy: Railway provides DATABASE_PUBLIC_URL for external access
        if (variables.DATABASE_PUBLIC_URL) {
          return variables.DATABASE_PUBLIC_URL;
        }

        // Fallback to regular DATABASE_URL if public not available
        if (variables.DATABASE_URL) {
          return variables.DATABASE_URL;
        }
      } catch {
        // Continue retrying
      }

      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }

    throw new Error('Public database URL not available after maximum retries');
  }

  /**
   * Set environment variables for a service
   */
  async setServiceVariables(
    projectId: string,
    environmentId: string,
    serviceId: string,
    variables: Record<string, string>
  ): Promise<void> {
    await this.graphql(
      `
      mutation SetVariables($projectId: String!, $environmentId: String!, $serviceId: String!, $variables: EnvironmentVariables!) {
        variableCollectionUpsert(
          input: {
            projectId: $projectId
            environmentId: $environmentId
            serviceId: $serviceId
            variables: $variables
          }
        )
      }
    `,
      { projectId, environmentId, serviceId, variables }
    );
  }

  /**
   * Get the production environment ID for a project
   */
  async getProductionEnvironmentId(projectId: string): Promise<string> {
    const result = await this.graphql<{
      project: {
        environments: {
          edges: Array<{ node: { id: string; name: string } }>;
        };
      };
    }>(
      `
      query GetEnvironments($projectId: String!) {
        project(id: $projectId) {
          environments {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    `,
      { projectId }
    );

    const prodEnv = result.project.environments.edges.find(
      (e) => e.node.name.toLowerCase() === 'production'
    );

    if (!prodEnv) {
      // Return the first environment if no production environment exists
      const firstEnv = result.project.environments.edges[0];
      if (!firstEnv) {
        throw new Error('No environments found in project');
      }
      return firstEnv.node.id;
    }

    return prodEnv.node.id;
  }
}

/**
 * Create a Railway client from environment variables
 */
export function createRailwayClient(): RailwayClient {
  const token = process.env.RAILWAY_API_TOKEN;
  const teamId = process.env.RAILWAY_TEAM_ID;

  if (!token) {
    throw new Error('RAILWAY_API_TOKEN environment variable is required');
  }

  return new RailwayClient(token, teamId);
}

/**
 * Generate a unique Railway project name from agent info
 */
export function generateRailwayProjectName(agentSlug: string, prefix = 'wp-db'): string {
  const sanitized = agentSlug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);

  return `${prefix}-${sanitized}`;
}

/**
 * Provision a complete PostgreSQL database for an agent
 */
export async function provisionDatabase(
  client: RailwayClient,
  agentSlug: string
): Promise<{
  projectId: string;
  serviceId: string;
  environmentId: string;
  databaseUrl: string;
  publicDatabaseUrl: string;
}> {
  const projectName = generateRailwayProjectName(agentSlug);

  console.log(`Creating Railway project: ${projectName}`);

  // Create the project
  const { projectCreate } = await client.createProject(
    projectName,
    `Database for WealthPro agent: ${agentSlug}`
  );

  const projectId = projectCreate.id;
  console.log(`Project created: ${projectId}`);

  // Get the production environment ID
  const environmentId = await client.getProductionEnvironmentId(projectId);
  console.log(`Environment ID: ${environmentId}`);

  // Create PostgreSQL service
  console.log('Provisioning PostgreSQL database...');
  const { serviceCreate } = await client.createPostgresService(projectId, environmentId);
  const serviceId = serviceCreate.id;
  console.log(`PostgreSQL service created: ${serviceId}`);

  // Wait for database to be ready and get URLs
  console.log('Waiting for database to be ready...');
  const databaseUrl = await client.getDatabaseUrl(projectId, environmentId, serviceId);
  const publicDatabaseUrl = await client.getPublicDatabaseUrl(projectId, environmentId, serviceId);

  console.log('Database provisioned successfully!');

  return {
    projectId,
    serviceId,
    environmentId,
    databaseUrl,
    publicDatabaseUrl,
  };
}
