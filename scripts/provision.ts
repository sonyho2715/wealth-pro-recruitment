#!/usr/bin/env npx tsx
/**
 * Platform-as-a-Template Provisioning Script
 *
 * This script provisions a complete WealthPro instance for a new agent:
 * 1. Creates a Railway PostgreSQL database
 * 2. Creates a Vercel project from the template repository
 * 3. Configures environment variables
 * 4. Adds custom domain
 * 5. Triggers deployment and runs migrations
 *
 * Usage:
 *   npx tsx scripts/provision.ts \
 *     --email agent@example.com \
 *     --firstName "John" \
 *     --lastName "Smith" \
 *     --subdomain johnsmith \
 *     --brandName "Smith Financial"
 */

import { createRailwayClient, provisionDatabase } from '../lib/railway-api';
import {
  createVercelClient,
  generateProjectName,
  generateSubdomain,
} from '../lib/vercel-api';
import crypto from 'crypto';

// Configuration
const GITHUB_TEMPLATE_REPO = 'sonyho2715/wealth-pro-template'; // Format: owner/repo
const BASE_DOMAIN = 'wealthpro.app';
const DEFAULT_BRAND_COLOR = '#10b981'; // Emerald

interface ProvisioningOptions {
  email: string;
  firstName: string;
  lastName: string;
  subdomain: string;
  brandName?: string;
  brandColor?: string;
  phone?: string;
}

interface ProvisioningResult {
  success: boolean;
  projectUrl?: string;
  customDomain?: string;
  vercelProjectId?: string;
  railwayProjectId?: string;
  databaseUrl?: string;
  error?: string;
}

/**
 * Generate a secure random string for session secrets
 */
function generateSessionSecret(): string {
  return crypto.randomBytes(32).toString('base64');
}

/**
 * Provision a complete WealthPro instance for an agent
 */
export async function provisionAgentInstance(
  options: ProvisioningOptions
): Promise<ProvisioningResult> {
  const {
    email,
    firstName,
    lastName,
    subdomain,
    brandName = `${firstName} ${lastName} Financial`,
    brandColor = DEFAULT_BRAND_COLOR,
    phone,
  } = options;

  const agentSlug = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const projectName = generateProjectName(agentSlug);
  const customDomain = generateSubdomain(agentSlug, BASE_DOMAIN);

  console.log('\n========================================');
  console.log('WealthPro Platform Provisioning');
  console.log('========================================\n');
  console.log(`Agent: ${firstName} ${lastName} (${email})`);
  console.log(`Project: ${projectName}`);
  console.log(`Domain: ${customDomain}`);
  console.log('');

  try {
    // Step 1: Provision Railway PostgreSQL database
    console.log('Step 1/5: Provisioning Railway PostgreSQL database...');
    const railwayClient = createRailwayClient();
    const dbResult = await provisionDatabase(railwayClient, agentSlug);
    console.log(`  ✓ Database created: ${dbResult.projectId}`);
    console.log(`  ✓ Service ID: ${dbResult.serviceId}`);

    // Step 2: Create Vercel project
    console.log('\nStep 2/5: Creating Vercel project...');
    const vercelClient = createVercelClient();

    const vercelProject = await vercelClient.createProject({
      name: projectName,
      gitRepository: {
        type: 'github',
        repo: GITHUB_TEMPLATE_REPO,
      },
      framework: 'nextjs',
    });
    console.log(`  ✓ Vercel project created: ${vercelProject.id}`);

    // Step 3: Configure environment variables
    console.log('\nStep 3/5: Configuring environment variables...');
    const sessionSecret = generateSessionSecret();

    await vercelClient.addEnvironmentVariables(vercelProject.id, [
      {
        key: 'DATABASE_URL',
        value: dbResult.publicDatabaseUrl,
        target: ['production', 'preview'],
        type: 'encrypted',
      },
      {
        key: 'SESSION_SECRET',
        value: sessionSecret,
        target: ['production', 'preview', 'development'],
        type: 'encrypted',
      },
      {
        key: 'AGENT_EMAIL',
        value: email,
        target: ['production', 'preview', 'development'],
        type: 'plain',
      },
      {
        key: 'AGENT_FIRST_NAME',
        value: firstName,
        target: ['production', 'preview', 'development'],
        type: 'plain',
      },
      {
        key: 'AGENT_LAST_NAME',
        value: lastName,
        target: ['production', 'preview', 'development'],
        type: 'plain',
      },
      {
        key: 'BRAND_NAME',
        value: brandName,
        target: ['production', 'preview', 'development'],
        type: 'plain',
      },
      {
        key: 'BRAND_PRIMARY_COLOR',
        value: brandColor,
        target: ['production', 'preview', 'development'],
        type: 'plain',
      },
      ...(phone
        ? [
            {
              key: 'AGENT_PHONE',
              value: phone,
              target: ['production', 'preview', 'development'] as ('production' | 'preview' | 'development')[],
              type: 'plain' as const,
            },
          ]
        : []),
    ]);
    console.log('  ✓ Environment variables configured');

    // Step 4: Add custom domain
    console.log('\nStep 4/5: Adding custom domain...');
    try {
      await vercelClient.addDomain(vercelProject.id, customDomain);
      console.log(`  ✓ Domain added: ${customDomain}`);
    } catch (domainError) {
      console.log(`  ⚠ Domain setup may require DNS configuration: ${customDomain}`);
      // Don't fail the whole process for domain issues
    }

    // Step 5: Trigger deployment
    console.log('\nStep 5/5: Triggering deployment...');
    const deployments = await vercelClient.listDeployments(vercelProject.id, 1);

    let deploymentUrl = '';
    if (deployments.deployments.length > 0) {
      const deployment = deployments.deployments[0];
      console.log(`  ✓ Deployment queued: ${deployment.id}`);
      console.log('  Waiting for deployment to complete...');

      try {
        const readyDeployment = await vercelClient.waitForDeployment(deployment.id, 180000);
        deploymentUrl = `https://${readyDeployment.url}`;
        console.log(`  ✓ Deployment ready: ${deploymentUrl}`);
      } catch {
        console.log('  ⚠ Deployment still in progress. Check Vercel dashboard for status.');
        deploymentUrl = `https://${projectName}.vercel.app`;
      }
    } else {
      deploymentUrl = `https://${projectName}.vercel.app`;
      console.log(`  ✓ Project URL: ${deploymentUrl}`);
    }

    // Success summary
    console.log('\n========================================');
    console.log('Provisioning Complete!');
    console.log('========================================\n');
    console.log('Instance Details:');
    console.log(`  Project URL: ${deploymentUrl}`);
    console.log(`  Custom Domain: https://${customDomain}`);
    console.log(`  Vercel Project ID: ${vercelProject.id}`);
    console.log(`  Railway Project ID: ${dbResult.projectId}`);
    console.log('');
    console.log('Next Steps:');
    console.log('  1. Configure DNS for custom domain (if using)');
    console.log('  2. Run database migrations: npx prisma migrate deploy');
    console.log('  3. Seed the agent data');
    console.log('  4. Share login credentials with the agent');
    console.log('');

    return {
      success: true,
      projectUrl: deploymentUrl,
      customDomain: `https://${customDomain}`,
      vercelProjectId: vercelProject.id,
      railwayProjectId: dbResult.projectId,
      databaseUrl: dbResult.publicDatabaseUrl,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('\n❌ Provisioning failed:', errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(): ProvisioningOptions | null {
  const args = process.argv.slice(2);
  const options: Partial<ProvisioningOptions> = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, '');
    const value = args[i + 1];

    if (!key || !value) continue;

    switch (key) {
      case 'email':
        options.email = value;
        break;
      case 'firstName':
        options.firstName = value;
        break;
      case 'lastName':
        options.lastName = value;
        break;
      case 'subdomain':
        options.subdomain = value;
        break;
      case 'brandName':
        options.brandName = value;
        break;
      case 'brandColor':
        options.brandColor = value;
        break;
      case 'phone':
        options.phone = value;
        break;
    }
  }

  // Validate required fields
  if (!options.email || !options.firstName || !options.lastName || !options.subdomain) {
    return null;
  }

  return options as ProvisioningOptions;
}

/**
 * Print usage information
 */
function printUsage(): void {
  console.log(`
WealthPro Platform Provisioning Script

Usage:
  npx tsx scripts/provision.ts [options]

Required Options:
  --email <email>         Agent's email address
  --firstName <name>      Agent's first name
  --lastName <name>       Agent's last name
  --subdomain <slug>      Subdomain for the instance (e.g., "johnsmith")

Optional Options:
  --brandName <name>      Brand name (default: "<firstName> <lastName> Financial")
  --brandColor <hex>      Brand color in hex (default: "#10b981")
  --phone <phone>         Agent's phone number

Examples:
  npx tsx scripts/provision.ts \\
    --email john@example.com \\
    --firstName John \\
    --lastName Smith \\
    --subdomain johnsmith

  npx tsx scripts/provision.ts \\
    --email jane@example.com \\
    --firstName Jane \\
    --lastName Doe \\
    --subdomain janedoe \\
    --brandName "Doe Wealth Management" \\
    --brandColor "#3b82f6"

Environment Variables Required:
  VERCEL_TOKEN          Vercel API token
  VERCEL_TEAM_ID        Vercel team ID (optional)
  RAILWAY_API_TOKEN     Railway API token
`);
}

// Main execution
async function main(): Promise<void> {
  const options = parseArgs();

  if (!options) {
    printUsage();
    process.exit(1);
  }

  // Verify required environment variables
  if (!process.env.VERCEL_TOKEN) {
    console.error('Error: VERCEL_TOKEN environment variable is required');
    process.exit(1);
  }

  if (!process.env.RAILWAY_API_TOKEN) {
    console.error('Error: RAILWAY_API_TOKEN environment variable is required');
    process.exit(1);
  }

  const result = await provisionAgentInstance(options);

  if (!result.success) {
    process.exit(1);
  }
}

// Run if executed directly
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
