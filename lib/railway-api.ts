/**
 * Railway API Client for Platform-as-a-Template Provisioning
 *
 * This module handles Railway project and PostgreSQL database provisioning
 * for creating isolated database instances for each agent.
 */

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

  constructor(token: string) {
    this.token = token;
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
    return this.graphql(
      `
      mutation CreateProject($name: String!, $description: String) {
        projectCreate(input: { name: $name, description: $description }) {
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
      { name, description }
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
   * Create a PostgreSQL database service in a project
   */
  async createPostgresService(
    projectId: string,
    environmentId: string
  ): Promise<{ serviceCreate: RailwayService }> {
    // First, create the service with the official PostgreSQL template
    const result = await this.graphql<{ templateDeploy: { projectId: string; workflowId: string } }>(
      `
      mutation DeployPostgres($projectId: String!, $environmentId: String!) {
        templateDeploy(
          input: {
            projectId: $projectId
            environmentId: $environmentId
            services: [
              {
                hasDomain: false
                isPrivate: true
                name: "postgres"
                owner: "railwayapp-templates"
                template: "postgres"
              }
            ]
          }
        ) {
          projectId
          workflowId
        }
      }
    `,
      { projectId, environmentId }
    );

    // Wait for the deployment to complete
    await this.waitForWorkflow(result.templateDeploy.workflowId);

    // Get the service ID
    const services = await this.getProjectServices(projectId);
    const postgresService = services.project.services.edges.find(
      (s: { node: RailwayService }) => s.node.name.toLowerCase().includes('postgres')
    );

    if (!postgresService) {
      throw new Error('PostgreSQL service not found after creation');
    }

    return { serviceCreate: postgresService.node };
  }

  /**
   * Wait for a workflow to complete
   */
  private async waitForWorkflow(
    workflowId: string,
    timeoutMs = 120000,
    pollIntervalMs = 3000
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      // For now, just wait a reasonable time for the database to provision
      // Railway's workflow API is limited, so we'll poll for the database URL
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

      // After initial wait, check if we can proceed
      if (Date.now() - startTime > 15000) {
        return;
      }
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
   * Get the DATABASE_URL from a PostgreSQL service
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

        // Railway provides DATABASE_URL directly
        if (variables.DATABASE_URL) {
          return variables.DATABASE_URL;
        }

        // Or construct from individual components
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
   * Get the public DATABASE_URL (with external host)
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

        // Railway provides DATABASE_PUBLIC_URL for external access
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

  if (!token) {
    throw new Error('RAILWAY_API_TOKEN environment variable is required');
  }

  return new RailwayClient(token);
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
