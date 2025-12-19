#!/usr/bin/env npx tsx
/**
 * WealthPro Platform CLI
 *
 * Interactive command-line interface for managing WealthPro instances.
 *
 * Commands:
 *   provision   - Create a new agent instance
 *   list        - List all provisioned instances
 *   info        - Get info about a specific instance
 *   delete      - Delete an instance (with confirmation)
 *
 * Usage:
 *   npx tsx scripts/cli.ts <command> [options]
 */

import * as readline from 'readline';
import { provisionAgentInstance } from './provision';
import { createVercelClient } from '../lib/vercel-api';
import { createRailwayClient } from '../lib/railway-api';

// Create readline interface for interactive prompts
function createReadline(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

// Prompt user for input
async function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Prompt with default value
async function promptWithDefault(
  rl: readline.Interface,
  question: string,
  defaultValue: string
): Promise<string> {
  const answer = await prompt(rl, `${question} (${defaultValue}): `);
  return answer || defaultValue;
}

// Confirm action
async function confirm(rl: readline.Interface, message: string): Promise<boolean> {
  const answer = await prompt(rl, `${message} (y/N): `);
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

/**
 * Interactive provision command
 */
async function interactiveProvision(): Promise<void> {
  const rl = createReadline();

  console.log('\n========================================');
  console.log('WealthPro Instance Provisioning');
  console.log('========================================\n');

  try {
    // Gather agent information
    const email = await prompt(rl, 'Agent email: ');
    if (!email || !email.includes('@')) {
      console.error('Invalid email address');
      rl.close();
      return;
    }

    const firstName = await prompt(rl, 'First name: ');
    if (!firstName) {
      console.error('First name is required');
      rl.close();
      return;
    }

    const lastName = await prompt(rl, 'Last name: ');
    if (!lastName) {
      console.error('Last name is required');
      rl.close();
      return;
    }

    // Generate default subdomain from name
    const defaultSubdomain = `${firstName}${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    const subdomain = await promptWithDefault(rl, 'Subdomain', defaultSubdomain);

    const defaultBrandName = `${firstName} ${lastName} Financial`;
    const brandName = await promptWithDefault(rl, 'Brand name', defaultBrandName);

    const brandColor = await promptWithDefault(rl, 'Brand color (hex)', '#10b981');

    const phone = await prompt(rl, 'Phone number (optional): ');

    // Confirm
    console.log('\n--- Review ---');
    console.log(`Email: ${email}`);
    console.log(`Name: ${firstName} ${lastName}`);
    console.log(`Subdomain: ${subdomain}.wealthpro.app`);
    console.log(`Brand: ${brandName}`);
    console.log(`Color: ${brandColor}`);
    if (phone) console.log(`Phone: ${phone}`);
    console.log('');

    const confirmed = await confirm(rl, 'Proceed with provisioning?');
    rl.close();

    if (!confirmed) {
      console.log('Provisioning cancelled.');
      return;
    }

    // Run provisioning
    await provisionAgentInstance({
      email,
      firstName,
      lastName,
      subdomain,
      brandName,
      brandColor,
      phone: phone || undefined,
    });
  } catch (error) {
    rl.close();
    throw error;
  }
}

/**
 * List all Vercel projects (WealthPro instances)
 */
async function listInstances(): Promise<void> {
  console.log('\n========================================');
  console.log('WealthPro Instances');
  console.log('========================================\n');

  try {
    const vercelClient = createVercelClient();
    const { projects } = await vercelClient.listProjects(100);

    // Filter to only WealthPro projects (prefix wp-)
    const wpProjects = projects.filter((p) => p.name.startsWith('wp-'));

    if (wpProjects.length === 0) {
      console.log('No WealthPro instances found.');
      return;
    }

    console.log(`Found ${wpProjects.length} instance(s):\n`);

    for (const project of wpProjects) {
      const createdAt = new Date(project.createdAt).toLocaleDateString();
      console.log(`  ${project.name}`);
      console.log(`    ID: ${project.id}`);
      console.log(`    Created: ${createdAt}`);
      if (project.link?.repo) {
        console.log(`    Repo: ${project.link.repo}`);
      }
      console.log('');
    }
  } catch (error) {
    console.error('Failed to list instances:', error instanceof Error ? error.message : error);
  }
}

/**
 * Get info about a specific instance
 */
async function getInstanceInfo(projectName: string): Promise<void> {
  console.log('\n========================================');
  console.log(`Instance Info: ${projectName}`);
  console.log('========================================\n');

  try {
    const vercelClient = createVercelClient();
    const { project, latestDeployment } = await vercelClient.getProjectWithLatestDeployment(
      projectName
    );

    console.log('Project Details:');
    console.log(`  Name: ${project.name}`);
    console.log(`  ID: ${project.id}`);
    console.log(`  Created: ${new Date(project.createdAt).toLocaleDateString()}`);
    console.log(`  Updated: ${new Date(project.updatedAt).toLocaleDateString()}`);

    if (project.link) {
      console.log(`\nGit Repository:`);
      console.log(`  Repo: ${project.link.repo}`);
      console.log(`  Branch: ${project.link.productionBranch}`);
    }

    if (latestDeployment) {
      console.log(`\nLatest Deployment:`);
      console.log(`  URL: https://${latestDeployment.url}`);
      console.log(`  State: ${latestDeployment.state}`);
      console.log(`  Created: ${new Date(latestDeployment.createdAt).toLocaleDateString()}`);
    }

    // Get domains
    const { domains } = await vercelClient.getDomains(project.id);
    if (domains.length > 0) {
      console.log(`\nDomains:`);
      for (const domain of domains) {
        const verified = domain.verified ? '✓' : '✗';
        console.log(`  ${verified} ${domain.name}`);
      }
    }

    // Get environment variables (names only, not values)
    const { envs } = await vercelClient.getEnvironmentVariables(project.id);
    if (envs.length > 0) {
      console.log(`\nEnvironment Variables:`);
      for (const env of envs) {
        console.log(`  - ${env.key} (${env.target.join(', ')})`);
      }
    }
  } catch (error) {
    console.error('Failed to get instance info:', error instanceof Error ? error.message : error);
  }
}

/**
 * Delete an instance
 */
async function deleteInstance(projectName: string): Promise<void> {
  const rl = createReadline();

  console.log('\n========================================');
  console.log(`Delete Instance: ${projectName}`);
  console.log('========================================\n');

  try {
    // Verify the project exists
    const vercelClient = createVercelClient();
    const project = await vercelClient.getProject(projectName);

    console.log('Project to delete:');
    console.log(`  Name: ${project.name}`);
    console.log(`  ID: ${project.id}`);
    console.log(`  Created: ${new Date(project.createdAt).toLocaleDateString()}`);
    console.log('');

    console.log('⚠️  WARNING: This will permanently delete:');
    console.log('  - The Vercel project and all deployments');
    console.log('  - All environment variables');
    console.log('  - All custom domains');
    console.log('');
    console.log('Note: The Railway database will NOT be deleted automatically.');
    console.log('');

    const confirmed = await confirm(rl, 'Are you sure you want to delete this instance?');

    if (!confirmed) {
      console.log('Deletion cancelled.');
      rl.close();
      return;
    }

    // Double confirmation for safety
    const doubleConfirm = await prompt(rl, `Type "${projectName}" to confirm deletion: `);
    rl.close();

    if (doubleConfirm !== projectName) {
      console.log('Project name does not match. Deletion cancelled.');
      return;
    }

    console.log('\nDeleting Vercel project...');
    await vercelClient.deleteProject(projectName);
    console.log('✓ Vercel project deleted');

    console.log('\n⚠️  Remember to manually delete the Railway database if no longer needed.');
    console.log('   Use: railway delete (from the Railway CLI)');
  } catch (error) {
    rl.close();
    console.error('Failed to delete instance:', error instanceof Error ? error.message : error);
  }
}

/**
 * Verify API connections
 */
async function verifyConnections(): Promise<void> {
  console.log('\n========================================');
  console.log('Verifying API Connections');
  console.log('========================================\n');

  // Check Vercel
  console.log('Vercel API:');
  try {
    if (!process.env.VERCEL_TOKEN) {
      console.log('  ✗ VERCEL_TOKEN not set');
    } else {
      const vercelClient = createVercelClient();
      const { user } = await vercelClient.getUser();
      console.log(`  ✓ Connected as: ${user.email}`);
    }
  } catch (error) {
    console.log(`  ✗ Connection failed: ${error instanceof Error ? error.message : error}`);
  }

  // Check Railway
  console.log('\nRailway API:');
  try {
    if (!process.env.RAILWAY_API_TOKEN) {
      console.log('  ✗ RAILWAY_API_TOKEN not set');
    } else {
      const railwayClient = createRailwayClient();
      const { me } = await railwayClient.getMe();
      console.log(`  ✓ Connected as: ${me.email}`);
    }
  } catch (error) {
    console.log(`  ✗ Connection failed: ${error instanceof Error ? error.message : error}`);
  }

  console.log('');
}

/**
 * Print help
 */
function printHelp(): void {
  console.log(`
WealthPro Platform CLI

Usage:
  npx tsx scripts/cli.ts <command> [options]

Commands:
  provision           Create a new agent instance (interactive)
  list                List all WealthPro instances
  info <project>      Get detailed info about an instance
  delete <project>    Delete an instance (with confirmation)
  verify              Verify API connections
  help                Show this help message

Examples:
  npx tsx scripts/cli.ts provision
  npx tsx scripts/cli.ts list
  npx tsx scripts/cli.ts info wp-johnsmith
  npx tsx scripts/cli.ts delete wp-johnsmith
  npx tsx scripts/cli.ts verify

Environment Variables Required:
  VERCEL_TOKEN          Vercel API token
  VERCEL_TEAM_ID        Vercel team ID (optional)
  RAILWAY_API_TOKEN     Railway API token
`);
}

// Main execution
async function main(): Promise<void> {
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'provision':
      await interactiveProvision();
      break;

    case 'list':
      await listInstances();
      break;

    case 'info':
      if (!arg) {
        console.error('Error: Project name required. Usage: cli.ts info <project-name>');
        process.exit(1);
      }
      await getInstanceInfo(arg);
      break;

    case 'delete':
      if (!arg) {
        console.error('Error: Project name required. Usage: cli.ts delete <project-name>');
        process.exit(1);
      }
      await deleteInstance(arg);
      break;

    case 'verify':
      await verifyConnections();
      break;

    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;

    default:
      if (command) {
        console.error(`Unknown command: ${command}`);
      }
      printHelp();
      process.exit(command ? 1 : 0);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
