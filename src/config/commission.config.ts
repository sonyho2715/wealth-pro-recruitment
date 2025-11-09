/**
 * Commission Configuration
 *
 * This file defines the commission structure for insurance agents.
 * Update these values based on Vantage or company policies.
 *
 * To customize with your Vantage document:
 * - Update tier thresholds, rates, and multipliers
 * - Add/remove tiers as needed
 * - Modify team override percentages
 */

export interface CommissionTier {
  name: string;
  threshold: number;
  lifeRate: number;
  renewalRate: number;
  bonusMultiplier: number;
  color: string;
  description?: string;
}

/**
 * Commission tier structure
 *
 * Update these values based on your Vantage commission schedule
 */
export const COMMISSION_TIERS: CommissionTier[] = [
  {
    name: 'New Agent',
    threshold: 0,
    lifeRate: 50,
    renewalRate: 5,
    bonusMultiplier: 1.0,
    color: 'blue',
    description: 'Starting tier for new agents',
  },
  {
    name: 'Qualified Agent',
    threshold: 50000,
    lifeRate: 70,
    renewalRate: 7,
    bonusMultiplier: 1.1,
    color: 'green',
    description: 'Advanced to qualified status',
  },
  {
    name: 'Senior Agent',
    threshold: 100000,
    lifeRate: 90,
    renewalRate: 9,
    bonusMultiplier: 1.25,
    color: 'purple',
    description: 'Senior level performance',
  },
  {
    name: 'Executive Agent',
    threshold: 200000,
    lifeRate: 110,
    renewalRate: 10,
    bonusMultiplier: 1.5,
    color: 'orange',
    description: 'Top tier executive level',
  },
];

/**
 * Team Override Configuration
 *
 * Team leaders/managers can earn additional percentage based on team production
 */
export interface TeamOverrideOption {
  name: string;
  percentage: number;
  description: string;
}

export const TEAM_OVERRIDE_OPTIONS: TeamOverrideOption[] = [
  {
    name: 'No Team',
    percentage: 0,
    description: 'Individual producer',
  },
  {
    name: 'Small Team (1-3 agents)',
    percentage: 5,
    description: '+5% override on team production',
  },
  {
    name: 'Medium Team (4-10 agents)',
    percentage: 10,
    description: '+10% override on team production',
  },
  {
    name: 'Large Team (11-25 agents)',
    percentage: 15,
    description: '+15% override on team production',
  },
  {
    name: 'Executive Team (26+ agents)',
    percentage: 20,
    description: '+20% override on team production',
  },
];

/**
 * Production bonus configuration
 */
export const PRODUCTION_BONUS_CONFIG = {
  threshold: 100000, // Minimum production for bonus eligibility
  bonusPerTier: 5000, // Bonus amount per $100K tier
};

/**
 * Helper function to get tier based on production
 */
export function getTierByProduction(annualProduction: number): CommissionTier {
  return [...COMMISSION_TIERS]
    .reverse()
    .find(tier => annualProduction >= tier.threshold) || COMMISSION_TIERS[0];
}

/**
 * Helper function to calculate team override income
 */
export function calculateTeamOverride(
  teamProduction: number,
  overridePercentage: number
): number {
  return (teamProduction * overridePercentage) / 100;
}
