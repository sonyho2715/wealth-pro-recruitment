# WealthPro Platform Provisioning Guide

This document explains how to provision new WealthPro instances for financial advisors using the Platform-as-a-Template architecture.

## Overview

Each financial advisor gets their own dedicated platform instance with:
- **Isolated PostgreSQL database** (Railway)
- **Dedicated Vercel deployment** (from template repository)
- **Custom subdomain** (e.g., `johnsmith.wealthpro.app`)
- **White-label branding** (custom name, colors)

## Prerequisites

### Required API Tokens

1. **Vercel Token**
   - Go to [Vercel Account Settings](https://vercel.com/account/tokens)
   - Create a new token with full access
   - Set as `VERCEL_TOKEN` environment variable

2. **Railway Token**
   - Go to [Railway Account Settings](https://railway.app/account)
   - Generate a new API token
   - Set as `RAILWAY_API_TOKEN` environment variable

3. **Optional: Vercel Team ID**
   - If using a Vercel team, set `VERCEL_TEAM_ID`

### Template Repository

Ensure the template repository exists at `sonyho2715/wealth-pro-template` on GitHub with:
- Complete Next.js application
- Prisma schema (simplified for single-agent)
- All required environment variable placeholders

## Provisioning Methods

### Method 1: Interactive CLI (Recommended)

The easiest way to provision a new instance:

```bash
npx tsx scripts/cli.ts provision
```

This will prompt you for:
- Agent email
- First and last name
- Subdomain
- Brand name (optional)
- Brand color (optional)
- Phone number (optional)

### Method 2: Command Line Arguments

For scripting or automation:

```bash
npx tsx scripts/provision.ts \
  --email john@example.com \
  --firstName John \
  --lastName Smith \
  --subdomain johnsmith \
  --brandName "Smith Financial" \
  --brandColor "#3b82f6"
```

### Method 3: Programmatic

Import and use in your own scripts:

```typescript
import { provisionAgentInstance } from './scripts/provision';

const result = await provisionAgentInstance({
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Smith',
  subdomain: 'johnsmith',
  brandName: 'Smith Financial',
  brandColor: '#3b82f6',
});

if (result.success) {
  console.log('Instance URL:', result.projectUrl);
  console.log('Database URL:', result.databaseUrl);
}
```

## What Gets Created

When you provision a new instance:

1. **Railway Project**
   - Name: `wp-db-{subdomain}`
   - PostgreSQL database with public access
   - Returns `DATABASE_URL` and `DATABASE_PUBLIC_URL`

2. **Vercel Project**
   - Name: `wp-{subdomain}`
   - Linked to template repository
   - Framework: Next.js

3. **Environment Variables** (automatically set on Vercel)
   - `DATABASE_URL` - PostgreSQL connection string
   - `SESSION_SECRET` - Auto-generated secure secret
   - `AGENT_EMAIL` - Agent's email address
   - `AGENT_FIRST_NAME` - Agent's first name
   - `AGENT_LAST_NAME` - Agent's last name
   - `BRAND_NAME` - Company/brand name
   - `BRAND_PRIMARY_COLOR` - Primary brand color
   - `AGENT_PHONE` - Phone number (if provided)

4. **Custom Domain**
   - `{subdomain}.wealthpro.app`
   - Requires DNS configuration (see below)

## Post-Provisioning Steps

### 1. Configure DNS for Custom Domain

Add DNS records for the custom domain:

**For subdomain (e.g., johnsmith.wealthpro.app)**:
- Type: CNAME
- Name: johnsmith
- Value: cname.vercel-dns.com

**For apex domain (if needed)**:
- Type: A
- Name: @
- Value: 76.76.21.21

### 2. Run Database Migrations

After the initial deployment, SSH into the deployment or run locally:

```bash
DATABASE_URL="<public-database-url>" npx prisma migrate deploy
```

### 3. Seed Agent Data

Create the agent record in the database:

```bash
DATABASE_URL="<public-database-url>" npx tsx prisma/seed-agent.ts
```

### 4. Share Credentials

Send the agent:
- Login URL: `https://{subdomain}.wealthpro.app/login`
- Initial password (if using password-based auth)
- Client portal URL for their clients

## Managing Instances

### List All Instances

```bash
npx tsx scripts/cli.ts list
```

### Get Instance Details

```bash
npx tsx scripts/cli.ts info wp-johnsmith
```

### Delete an Instance

```bash
npx tsx scripts/cli.ts delete wp-johnsmith
```

Note: This deletes the Vercel project but NOT the Railway database. Delete that separately if needed.

### Verify API Connections

```bash
npx tsx scripts/cli.ts verify
```

## Managing Environment Variables

### List Variables

```bash
npx tsx scripts/env-manager.ts list wp-johnsmith
```

### Set a Variable

```bash
npx tsx scripts/env-manager.ts set wp-johnsmith NEW_VAR "value"
```

### Delete a Variable

```bash
npx tsx scripts/env-manager.ts delete wp-johnsmith OLD_VAR
```

### Sync from Template

```bash
npx tsx scripts/env-manager.ts sync wp-johnsmith .env.template
```

### Batch Update Across All Instances

```bash
npx tsx scripts/env-manager.ts batch-update SESSION_SECRET "new-global-secret"
```

## Troubleshooting

### Provisioning Fails at Database Step

- Verify `RAILWAY_API_TOKEN` is set correctly
- Check Railway account has available credits
- Ensure API token has project creation permissions

### Provisioning Fails at Vercel Step

- Verify `VERCEL_TOKEN` is set correctly
- Check template repository is accessible
- Ensure no project with same name already exists

### Domain Not Working

1. Check DNS propagation: `nslookup {subdomain}.wealthpro.app`
2. Verify domain in Vercel dashboard
3. Check for verification requirements

### Database Connection Issues

- Ensure using the PUBLIC database URL, not internal
- Check SSL mode is set: `?sslmode=require`
- Verify Railway database is running

## Architecture Details

### File Structure

```
scripts/
  cli.ts              # Interactive CLI wrapper
  provision.ts        # Main provisioning script
  env-manager.ts      # Environment variable management

lib/
  railway-api.ts      # Railway GraphQL API client
  vercel-api.ts       # Vercel REST API client
```

### API Clients

**RailwayClient** (`lib/railway-api.ts`)
- GraphQL-based API client
- Handles project creation, PostgreSQL provisioning
- Manages environment variables via Railway
- Waits for database URL availability

**VercelClient** (`lib/vercel-api.ts`)
- REST API client
- Handles project creation from GitHub template
- Manages environment variables
- Handles domain configuration
- Tracks deployment status

### Environment Variable Types

| Variable | Type | Description |
|----------|------|-------------|
| DATABASE_URL | encrypted | PostgreSQL connection string |
| SESSION_SECRET | encrypted | iron-session encryption key |
| AGENT_EMAIL | plain | Agent's email address |
| AGENT_FIRST_NAME | plain | Agent's first name |
| AGENT_LAST_NAME | plain | Agent's last name |
| BRAND_NAME | plain | Display name for branding |
| BRAND_PRIMARY_COLOR | plain | Primary color (hex) |
| AGENT_PHONE | plain | Contact phone number |

## Security Considerations

- API tokens should be stored securely
- Never commit tokens to version control
- Use encrypted type for sensitive environment variables
- Each instance has isolated database
- Session secrets are unique per instance
- Database URLs use SSL/TLS encryption

## Scaling Considerations

- Each Railway project has resource limits
- Monitor database usage per instance
- Consider Railway's pricing for many instances
- Vercel has project limits per account
- For large scale, consider Railway Teams

## Future Improvements

1. **Automated DNS** - Integrate with DNS provider APIs
2. **Health Monitoring** - Add instance health checks
3. **Backup Automation** - Scheduled database backups
4. **Usage Tracking** - Monitor instance usage metrics
5. **Self-Service Portal** - Web UI for agent onboarding
