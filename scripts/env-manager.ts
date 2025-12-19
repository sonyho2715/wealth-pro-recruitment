#!/usr/bin/env npx tsx
/**
 * Environment Variable Manager for WealthPro Instances
 *
 * Manages environment variables across all WealthPro instances.
 *
 * Commands:
 *   list <project>     - List all env vars for a project
 *   get <project> <key> - Get a specific env var value
 *   set <project> <key> <value> - Set an env var
 *   delete <project> <key> - Delete an env var
 *   sync <project>     - Sync env vars from .env.template
 *   batch-update <key> <value> - Update an env var across all wp- projects
 *
 * Usage:
 *   npx tsx scripts/env-manager.ts <command> [args]
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { createVercelClient } from '../lib/vercel-api';

// Create readline interface
function createReadline(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

// Confirm action
async function confirm(rl: readline.Interface, message: string): Promise<boolean> {
  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * List environment variables for a project
 */
async function listEnvVars(projectName: string): Promise<void> {
  console.log(`\nEnvironment variables for ${projectName}:\n`);

  try {
    const client = createVercelClient();
    const { envs } = await client.getEnvironmentVariables(projectName);

    if (envs.length === 0) {
      console.log('No environment variables found.');
      return;
    }

    // Group by target
    const byTarget: Record<string, typeof envs> = {
      production: [],
      preview: [],
      development: [],
    };

    for (const env of envs) {
      for (const target of env.target) {
        if (byTarget[target]) {
          byTarget[target].push(env);
        }
      }
    }

    console.log('All Variables:');
    for (const env of envs) {
      const targets = env.target.join(', ');
      const type = env.type || 'plain';
      console.log(`  ${env.key}`);
      console.log(`    Targets: ${targets}`);
      console.log(`    Type: ${type}`);
      console.log('');
    }
  } catch (error) {
    console.error('Failed to list env vars:', error instanceof Error ? error.message : error);
  }
}

/**
 * Get a specific environment variable
 */
async function getEnvVar(projectName: string, key: string): Promise<void> {
  try {
    const client = createVercelClient();
    const { envs } = await client.getEnvironmentVariables(projectName);

    const env = envs.find((e) => e.key === key);

    if (!env) {
      console.log(`Variable "${key}" not found in ${projectName}`);
      return;
    }

    console.log(`\n${key}:`);
    console.log(`  Value: ${env.value}`);
    console.log(`  Targets: ${env.target.join(', ')}`);
    console.log(`  Type: ${env.type || 'plain'}`);
  } catch (error) {
    console.error('Failed to get env var:', error instanceof Error ? error.message : error);
  }
}

/**
 * Set an environment variable
 */
async function setEnvVar(
  projectName: string,
  key: string,
  value: string,
  targets: ('production' | 'preview' | 'development')[] = ['production', 'preview', 'development'],
  type: 'plain' | 'encrypted' = 'plain'
): Promise<void> {
  try {
    const client = createVercelClient();

    // Check if variable exists
    const { envs } = await client.getEnvironmentVariables(projectName);
    const existing = envs.find((e) => e.key === key);

    if (existing) {
      console.log(`Updating existing variable "${key}"...`);
      // For updates, we need to delete and recreate
      // Vercel API requires the env ID for updates
      const envId = (existing as unknown as { id: string }).id;
      if (envId) {
        await client.deleteEnvironmentVariable(projectName, envId);
      }
    }

    await client.addEnvironmentVariables(projectName, [
      {
        key,
        value,
        target: targets,
        type,
      },
    ]);

    console.log(`✓ Set ${key} on ${projectName}`);
  } catch (error) {
    console.error('Failed to set env var:', error instanceof Error ? error.message : error);
  }
}

/**
 * Delete an environment variable
 */
async function deleteEnvVar(projectName: string, key: string): Promise<void> {
  const rl = createReadline();

  try {
    const client = createVercelClient();
    const { envs } = await client.getEnvironmentVariables(projectName);

    const env = envs.find((e) => e.key === key);

    if (!env) {
      console.log(`Variable "${key}" not found in ${projectName}`);
      rl.close();
      return;
    }

    const confirmed = await confirm(rl, `Delete ${key} from ${projectName}?`);
    rl.close();

    if (!confirmed) {
      console.log('Deletion cancelled.');
      return;
    }

    const envId = (env as unknown as { id: string }).id;
    if (envId) {
      await client.deleteEnvironmentVariable(projectName, envId);
      console.log(`✓ Deleted ${key} from ${projectName}`);
    } else {
      console.error('Could not find environment variable ID');
    }
  } catch (error) {
    rl.close();
    console.error('Failed to delete env var:', error instanceof Error ? error.message : error);
  }
}

/**
 * Sync environment variables from a template file
 */
async function syncFromTemplate(projectName: string, templatePath?: string): Promise<void> {
  const rl = createReadline();

  try {
    const defaultTemplate = path.join(process.cwd(), '.env.template');
    const filePath = templatePath || defaultTemplate;

    if (!fs.existsSync(filePath)) {
      console.error(`Template file not found: ${filePath}`);
      rl.close();
      return;
    }

    // Parse .env file
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const variables: Array<{ key: string; value: string }> = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        // Skip empty values and placeholder values
        if (value && !value.includes('<') && !value.includes('>')) {
          variables.push({ key: key.trim(), value: value.trim() });
        }
      }
    }

    if (variables.length === 0) {
      console.log('No variables to sync from template.');
      rl.close();
      return;
    }

    console.log(`\nVariables to sync to ${projectName}:\n`);
    for (const v of variables) {
      const displayValue = v.value.length > 30 ? v.value.slice(0, 30) + '...' : v.value;
      console.log(`  ${v.key}=${displayValue}`);
    }
    console.log('');

    const confirmed = await confirm(rl, `Sync ${variables.length} variables?`);
    rl.close();

    if (!confirmed) {
      console.log('Sync cancelled.');
      return;
    }

    const client = createVercelClient();

    for (const { key, value } of variables) {
      await setEnvVar(projectName, key, value);
    }

    console.log(`\n✓ Synced ${variables.length} variables to ${projectName}`);
  } catch (error) {
    rl.close();
    console.error('Failed to sync from template:', error instanceof Error ? error.message : error);
  }
}

/**
 * Batch update an env var across all WealthPro projects
 */
async function batchUpdate(key: string, value: string): Promise<void> {
  const rl = createReadline();

  try {
    const client = createVercelClient();
    const { projects } = await client.listProjects(100);

    // Filter to only WealthPro projects
    const wpProjects = projects.filter((p) => p.name.startsWith('wp-'));

    if (wpProjects.length === 0) {
      console.log('No WealthPro projects found.');
      rl.close();
      return;
    }

    console.log(`\nThis will update ${key} on ${wpProjects.length} project(s):\n`);
    for (const project of wpProjects) {
      console.log(`  - ${project.name}`);
    }
    console.log('');

    const confirmed = await confirm(rl, `Proceed with batch update?`);
    rl.close();

    if (!confirmed) {
      console.log('Batch update cancelled.');
      return;
    }

    console.log('\nUpdating...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const project of wpProjects) {
      try {
        await setEnvVar(project.name, key, value);
        successCount++;
      } catch {
        console.error(`  ✗ Failed on ${project.name}`);
        errorCount++;
      }
    }

    console.log(`\nBatch update complete: ${successCount} succeeded, ${errorCount} failed`);
  } catch (error) {
    rl.close();
    console.error('Batch update failed:', error instanceof Error ? error.message : error);
  }
}

/**
 * Print help
 */
function printHelp(): void {
  console.log(`
WealthPro Environment Variable Manager

Usage:
  npx tsx scripts/env-manager.ts <command> [args]

Commands:
  list <project>                  List all env vars for a project
  get <project> <key>             Get a specific env var
  set <project> <key> <value>     Set an env var (all targets)
  delete <project> <key>          Delete an env var
  sync <project> [template]       Sync vars from .env.template
  batch-update <key> <value>      Update a var across all wp- projects

Examples:
  npx tsx scripts/env-manager.ts list wp-johnsmith
  npx tsx scripts/env-manager.ts get wp-johnsmith DATABASE_URL
  npx tsx scripts/env-manager.ts set wp-johnsmith NEW_VAR "value"
  npx tsx scripts/env-manager.ts delete wp-johnsmith OLD_VAR
  npx tsx scripts/env-manager.ts sync wp-johnsmith .env.production
  npx tsx scripts/env-manager.ts batch-update SESSION_SECRET "new-secret"

Environment Variables Required:
  VERCEL_TOKEN          Vercel API token
  VERCEL_TEAM_ID        Vercel team ID (optional)
`);
}

// Main execution
async function main(): Promise<void> {
  const command = process.argv[2];
  const arg1 = process.argv[3];
  const arg2 = process.argv[4];
  const arg3 = process.argv[5];

  if (!process.env.VERCEL_TOKEN) {
    console.error('Error: VERCEL_TOKEN environment variable is required');
    process.exit(1);
  }

  switch (command) {
    case 'list':
      if (!arg1) {
        console.error('Error: Project name required');
        process.exit(1);
      }
      await listEnvVars(arg1);
      break;

    case 'get':
      if (!arg1 || !arg2) {
        console.error('Error: Project name and key required');
        process.exit(1);
      }
      await getEnvVar(arg1, arg2);
      break;

    case 'set':
      if (!arg1 || !arg2 || !arg3) {
        console.error('Error: Project name, key, and value required');
        process.exit(1);
      }
      await setEnvVar(arg1, arg2, arg3);
      break;

    case 'delete':
      if (!arg1 || !arg2) {
        console.error('Error: Project name and key required');
        process.exit(1);
      }
      await deleteEnvVar(arg1, arg2);
      break;

    case 'sync':
      if (!arg1) {
        console.error('Error: Project name required');
        process.exit(1);
      }
      await syncFromTemplate(arg1, arg2);
      break;

    case 'batch-update':
      if (!arg1 || !arg2) {
        console.error('Error: Key and value required');
        process.exit(1);
      }
      await batchUpdate(arg1, arg2);
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
