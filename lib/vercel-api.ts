/**
 * Vercel API Client for Platform-as-a-Template Provisioning
 *
 * This module handles Vercel project creation, deployment, and configuration
 * for provisioning new agent instances.
 */

const VERCEL_API_BASE = 'https://api.vercel.com';

interface VercelProject {
  id: string;
  name: string;
  accountId: string;
  link?: {
    type: string;
    repo: string;
    repoId: number;
    org: string;
    gitCredentialId: string;
    productionBranch: string;
    createdAt: number;
    updatedAt: number;
    deployHooks: Array<{ id: string; name: string; ref: string; url: string }>;
  };
  createdAt: number;
  updatedAt: number;
}

interface VercelDeployment {
  id: string;
  url: string;
  name: string;
  state: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED';
  readyState: string;
  createdAt: number;
}

interface VercelDomain {
  name: string;
  apexName: string;
  projectId: string;
  verified: boolean;
  verification?: Array<{
    type: string;
    domain: string;
    value: string;
  }>;
}

interface CreateProjectOptions {
  name: string;
  gitRepository?: {
    type: 'github';
    repo: string; // format: "owner/repo"
  };
  framework?: 'nextjs' | 'remix' | 'astro' | 'nuxt' | null;
  buildCommand?: string;
  installCommand?: string;
  outputDirectory?: string;
  rootDirectory?: string;
}

interface EnvironmentVariable {
  key: string;
  value: string;
  target: ('production' | 'preview' | 'development')[];
  type?: 'plain' | 'secret' | 'encrypted';
}

/**
 * Vercel API Client
 */
export class VercelClient {
  private token: string;
  private teamId?: string;

  constructor(token: string, teamId?: string) {
    this.token = token;
    this.teamId = teamId;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = new URL(`${VERCEL_API_BASE}${endpoint}`);

    // Add team ID if provided
    if (this.teamId) {
      url.searchParams.set('teamId', this.teamId);
    }

    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error?.message || data.message || `Vercel API error: ${response.status}`
      );
    }

    return data;
  }

  /**
   * Get authenticated user info
   */
  async getUser(): Promise<{ user: { id: string; email: string; name: string; username: string } }> {
    return this.request('/v2/user');
  }

  /**
   * List all projects
   */
  async listProjects(limit = 20): Promise<{ projects: VercelProject[] }> {
    return this.request(`/v9/projects?limit=${limit}`);
  }

  /**
   * Get a specific project by name or ID
   */
  async getProject(nameOrId: string): Promise<VercelProject> {
    return this.request(`/v9/projects/${encodeURIComponent(nameOrId)}`);
  }

  /**
   * Create a new project
   */
  async createProject(options: CreateProjectOptions): Promise<VercelProject> {
    return this.request('/v10/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: options.name,
        gitRepository: options.gitRepository,
        framework: options.framework || 'nextjs',
        buildCommand: options.buildCommand,
        installCommand: options.installCommand,
        outputDirectory: options.outputDirectory,
        rootDirectory: options.rootDirectory,
      }),
    });
  }

  /**
   * Delete a project
   */
  async deleteProject(nameOrId: string): Promise<void> {
    await this.request(`/v9/projects/${encodeURIComponent(nameOrId)}`, {
      method: 'DELETE',
    });
  }

  /**
   * Add environment variables to a project
   */
  async addEnvironmentVariables(
    projectId: string,
    variables: EnvironmentVariable[]
  ): Promise<{ created: EnvironmentVariable[] }> {
    return this.request(`/v10/projects/${encodeURIComponent(projectId)}/env`, {
      method: 'POST',
      body: JSON.stringify(variables),
    });
  }

  /**
   * Get environment variables for a project
   */
  async getEnvironmentVariables(projectId: string): Promise<{ envs: EnvironmentVariable[] }> {
    return this.request(`/v9/projects/${encodeURIComponent(projectId)}/env`);
  }

  /**
   * Update an environment variable
   */
  async updateEnvironmentVariable(
    projectId: string,
    envId: string,
    updates: Partial<EnvironmentVariable>
  ): Promise<EnvironmentVariable> {
    return this.request(
      `/v9/projects/${encodeURIComponent(projectId)}/env/${envId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }
    );
  }

  /**
   * Delete an environment variable
   */
  async deleteEnvironmentVariable(projectId: string, envId: string): Promise<void> {
    await this.request(
      `/v9/projects/${encodeURIComponent(projectId)}/env/${envId}`,
      { method: 'DELETE' }
    );
  }

  /**
   * Add a domain to a project
   */
  async addDomain(projectId: string, domain: string): Promise<VercelDomain> {
    return this.request(`/v10/projects/${encodeURIComponent(projectId)}/domains`, {
      method: 'POST',
      body: JSON.stringify({ name: domain }),
    });
  }

  /**
   * Get domains for a project
   */
  async getDomains(projectId: string): Promise<{ domains: VercelDomain[] }> {
    return this.request(`/v9/projects/${encodeURIComponent(projectId)}/domains`);
  }

  /**
   * Remove a domain from a project
   */
  async removeDomain(projectId: string, domain: string): Promise<void> {
    await this.request(
      `/v9/projects/${encodeURIComponent(projectId)}/domains/${domain}`,
      { method: 'DELETE' }
    );
  }

  /**
   * Trigger a deployment (redeploy)
   */
  async createDeployment(
    projectId: string,
    options?: {
      target?: 'production' | 'preview';
      gitSource?: {
        type: 'github';
        ref: string;
        repoId: number;
      };
    }
  ): Promise<VercelDeployment> {
    return this.request('/v13/deployments', {
      method: 'POST',
      body: JSON.stringify({
        name: projectId,
        target: options?.target || 'production',
        gitSource: options?.gitSource,
      }),
    });
  }

  /**
   * Get deployment status
   */
  async getDeployment(deploymentId: string): Promise<VercelDeployment> {
    return this.request(`/v13/deployments/${deploymentId}`);
  }

  /**
   * List deployments for a project
   */
  async listDeployments(
    projectId: string,
    limit = 10
  ): Promise<{ deployments: VercelDeployment[] }> {
    return this.request(
      `/v6/deployments?projectId=${encodeURIComponent(projectId)}&limit=${limit}`
    );
  }

  /**
   * Wait for deployment to be ready
   */
  async waitForDeployment(
    deploymentId: string,
    timeoutMs = 300000, // 5 minutes
    pollIntervalMs = 5000
  ): Promise<VercelDeployment> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const deployment = await this.getDeployment(deploymentId);

      if (deployment.state === 'READY') {
        return deployment;
      }

      if (deployment.state === 'ERROR' || deployment.state === 'CANCELED') {
        throw new Error(`Deployment ${deployment.state}: ${deploymentId}`);
      }

      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }

    throw new Error(`Deployment timed out after ${timeoutMs}ms`);
  }

  /**
   * Get project with deployment info
   */
  async getProjectWithLatestDeployment(projectId: string): Promise<{
    project: VercelProject;
    latestDeployment: VercelDeployment | null;
  }> {
    const [project, deployments] = await Promise.all([
      this.getProject(projectId),
      this.listDeployments(projectId, 1),
    ]);

    return {
      project,
      latestDeployment: deployments.deployments[0] || null,
    };
  }
}

/**
 * Create a Vercel client from environment variables
 */
export function createVercelClient(): VercelClient {
  const token = process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token) {
    throw new Error('VERCEL_TOKEN environment variable is required');
  }

  return new VercelClient(token, teamId);
}

/**
 * Generate a unique project name from agent info
 */
export function generateProjectName(agentSlug: string, prefix = 'wp'): string {
  const sanitized = agentSlug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);

  return `${prefix}-${sanitized}`;
}

/**
 * Generate a subdomain from agent slug
 */
export function generateSubdomain(agentSlug: string, baseDomain = 'wealthpro.app'): string {
  const sanitized = agentSlug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 63);

  return `${sanitized}.${baseDomain}`;
}
