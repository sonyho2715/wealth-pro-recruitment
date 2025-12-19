/**
 * Retirement Plan Calculator
 * Compares different retirement plan options for business owners
 * with contribution limits, tax benefits, and implementation complexity
 */

export type RetirementPlanType =
  | 'SOLO_401K'
  | 'SEP_IRA'
  | 'SIMPLE_IRA'
  | 'CASH_BALANCE'
  | 'DEFINED_BENEFIT'
  | 'PROFIT_SHARING';

export interface RetirementPlanOption {
  planType: RetirementPlanType;
  name: string;
  maxContribution: number;
  employerContribution: number;
  employeeContribution: number;
  taxSavings: number;
  setupCost: string;
  annualAdminCost: string;
  bestFor: string[];
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
  hasRothOption: boolean;
  loanAllowed: boolean;
  deadlineToSetup: string;
  deadlineToFund: string;
  requirements: string[];
  considerations: string[];
}

export interface BusinessOwnerProfile {
  ownerSalary: number;
  ownerDistributions: number;
  netIncome: number;
  age: number;
  employeeCount: number;
  hasW2Employees: boolean;
  currentPensionContributions: number;
  businessType: string;
  yearsToRetirement: number;
}

// 2024 IRS Limits
const IRS_LIMITS_2024 = {
  // Solo 401(k) / Traditional 401(k)
  employee401kDefer: 23000,
  employee401kCatchUp: 7500,  // Age 50+
  total401kLimit: 69000,
  total401kCatchUp: 76500,    // With catch-up

  // SEP IRA
  sepIRAMaxPercent: 0.25,
  sepIRAMax: 69000,

  // SIMPLE IRA
  simpleIRADefer: 16000,
  simpleIRACatchUp: 3500,
  simpleIRAEmployerMatch: 0.03,  // Up to 3% match

  // Cash Balance / Defined Benefit
  definedBenefitMax: 275000,   // Annual benefit limit

  // Catch-up age threshold
  catchUpAge: 50,
};

/**
 * Calculate all retirement plan options for a business owner
 */
export function calculateRetirementOptions(
  profile: BusinessOwnerProfile,
  effectiveTaxRate: number = 0.30
): RetirementPlanOption[] {
  const options: RetirementPlanOption[] = [];

  // Calculate total owner compensation for contribution calculations
  const totalOwnerComp = profile.ownerSalary + profile.ownerDistributions;
  const isCatchUpEligible = profile.age >= IRS_LIMITS_2024.catchUpAge;

  // 1. Solo 401(k)
  if (!profile.hasW2Employees || profile.employeeCount <= 1) {
    const solo401k = calculateSolo401k(totalOwnerComp, isCatchUpEligible, effectiveTaxRate, profile);
    options.push(solo401k);
  }

  // 2. SEP IRA
  const sepIRA = calculateSEPIRA(totalOwnerComp, effectiveTaxRate, profile);
  options.push(sepIRA);

  // 3. SIMPLE IRA (if employees)
  if (profile.employeeCount <= 100) {
    const simpleIRA = calculateSIMPLEIRA(totalOwnerComp, isCatchUpEligible, effectiveTaxRate, profile);
    options.push(simpleIRA);
  }

  // 4. Cash Balance Plan (for high earners)
  if (totalOwnerComp >= 150000 && profile.yearsToRetirement >= 5) {
    const cashBalance = calculateCashBalance(totalOwnerComp, profile.age, effectiveTaxRate, profile);
    options.push(cashBalance);
  }

  // 5. Defined Benefit Plan (for very high earners with stable income)
  if (totalOwnerComp >= 250000 && profile.yearsToRetirement >= 5) {
    const definedBenefit = calculateDefinedBenefit(totalOwnerComp, profile.age, effectiveTaxRate, profile);
    options.push(definedBenefit);
  }

  // Sort by max contribution (descending)
  return options.sort((a, b) => b.maxContribution - a.maxContribution);
}

/**
 * Calculate Solo 401(k) contribution limits
 */
function calculateSolo401k(
  totalComp: number,
  isCatchUp: boolean,
  taxRate: number,
  profile: BusinessOwnerProfile
): RetirementPlanOption {
  // Employee deferral
  const employeeDefer = isCatchUp
    ? IRS_LIMITS_2024.employee401kDefer + IRS_LIMITS_2024.employee401kCatchUp
    : IRS_LIMITS_2024.employee401kDefer;

  // Employer contribution (25% of comp for S-corp/C-corp, 20% for sole prop/partnership)
  const employerPercent = ['S_CORP', 'C_CORP'].includes(profile.businessType) ? 0.25 : 0.20;
  const employerContrib = Math.min(totalComp * employerPercent, 69000 - employeeDefer);

  // Total limit
  const totalLimit = isCatchUp ? IRS_LIMITS_2024.total401kCatchUp : IRS_LIMITS_2024.total401kLimit;
  const maxContribution = Math.min(employeeDefer + employerContrib, totalLimit, totalComp);

  return {
    planType: 'SOLO_401K',
    name: 'Solo 401(k)',
    maxContribution,
    employerContribution: Math.min(employerContrib, maxContribution - employeeDefer),
    employeeContribution: Math.min(employeeDefer, maxContribution),
    taxSavings: maxContribution * taxRate,
    setupCost: '$500-$2,000',
    annualAdminCost: '$0-$500',
    bestFor: [
      'Self-employed with no employees',
      'Side business owners',
      'High earners wanting maximum deferral',
    ],
    complexity: 'MEDIUM',
    hasRothOption: true,
    loanAllowed: true,
    deadlineToSetup: 'December 31st of tax year',
    deadlineToFund: 'Tax filing deadline (with extensions)',
    requirements: [
      'No full-time employees (except spouse)',
      'Self-employment income',
      'File Form 5500-EZ if assets exceed $250K',
    ],
    considerations: [
      'Must cover spouse if employed in business',
      'Can contribute to both employee and employer portions',
      'Roth option allows tax-free growth',
      isCatchUp ? 'Includes $7,500 catch-up contribution' : '',
    ].filter(Boolean),
  };
}

/**
 * Calculate SEP IRA contribution limits
 */
function calculateSEPIRA(
  totalComp: number,
  taxRate: number,
  profile: BusinessOwnerProfile
): RetirementPlanOption {
  // SEP contribution (25% of comp, max $69K)
  const maxContribution = Math.min(
    totalComp * IRS_LIMITS_2024.sepIRAMaxPercent,
    IRS_LIMITS_2024.sepIRAMax
  );

  return {
    planType: 'SEP_IRA',
    name: 'SEP IRA',
    maxContribution,
    employerContribution: maxContribution,
    employeeContribution: 0,
    taxSavings: maxContribution * taxRate,
    setupCost: '$0-$100',
    annualAdminCost: '$0',
    bestFor: [
      'Simple setup and administration',
      'Variable income businesses',
      'Businesses with few employees',
    ],
    complexity: 'LOW',
    hasRothOption: false,
    loanAllowed: false,
    deadlineToSetup: 'Tax filing deadline (with extensions)',
    deadlineToFund: 'Tax filing deadline (with extensions)',
    requirements: [
      'Must cover all eligible employees at same percentage',
      'Employees must be 21+, worked 3 of last 5 years, earned $750+',
    ],
    considerations: [
      'No employee deferral (employer contributions only)',
      'Easy to set up, even last minute',
      'Contributions are flexible year to year',
      profile.hasW2Employees ? 'Must contribute same % for all eligible employees' : '',
    ].filter(Boolean),
  };
}

/**
 * Calculate SIMPLE IRA contribution limits
 */
function calculateSIMPLEIRA(
  totalComp: number,
  isCatchUp: boolean,
  taxRate: number,
  profile: BusinessOwnerProfile
): RetirementPlanOption {
  // Employee deferral
  const employeeDefer = isCatchUp
    ? IRS_LIMITS_2024.simpleIRADefer + IRS_LIMITS_2024.simpleIRACatchUp
    : IRS_LIMITS_2024.simpleIRADefer;

  // Employer match (up to 3% of comp)
  const employerMatch = totalComp * IRS_LIMITS_2024.simpleIRAEmployerMatch;

  const maxContribution = employeeDefer + employerMatch;

  return {
    planType: 'SIMPLE_IRA',
    name: 'SIMPLE IRA',
    maxContribution,
    employerContribution: employerMatch,
    employeeContribution: employeeDefer,
    taxSavings: maxContribution * taxRate,
    setupCost: '$0-$250',
    annualAdminCost: '$0-$100',
    bestFor: [
      'Small businesses with employees',
      'Simple administration',
      'Lower compensation levels',
    ],
    complexity: 'LOW',
    hasRothOption: true, // As of 2023
    loanAllowed: false,
    deadlineToSetup: 'October 1st of tax year',
    deadlineToFund: 'Salary deferrals due 30 days after month end',
    requirements: [
      'Must have 100 or fewer employees',
      'Cannot have another retirement plan',
      'Must make employer contributions',
    ],
    considerations: [
      'Lower contribution limits than 401(k) or SEP',
      'Mandatory employer contribution (match or 2% non-elective)',
      '25% penalty for withdrawals within first 2 years',
      isCatchUp ? 'Includes $3,500 catch-up contribution' : '',
    ].filter(Boolean),
  };
}

/**
 * Calculate Cash Balance Plan contribution limits
 */
function calculateCashBalance(
  totalComp: number,
  age: number,
  taxRate: number,
  profile: BusinessOwnerProfile
): RetirementPlanOption {
  // Cash balance contribution varies by age (older = more)
  // These are approximate maximum contributions
  const ageFactors: Record<number, number> = {
    35: 50000,
    40: 75000,
    45: 100000,
    50: 150000,
    55: 200000,
    60: 275000,
    65: 350000,
  };

  // Find closest age factor
  const ageKeys = Object.keys(ageFactors).map(Number);
  const closestAge = ageKeys.reduce((prev, curr) =>
    Math.abs(curr - age) < Math.abs(prev - age) ? curr : prev
  );

  const maxContribution = Math.min(ageFactors[closestAge], totalComp * 0.75);

  return {
    planType: 'CASH_BALANCE',
    name: 'Cash Balance Plan',
    maxContribution,
    employerContribution: maxContribution,
    employeeContribution: 0,
    taxSavings: maxContribution * taxRate,
    setupCost: '$2,000-$5,000',
    annualAdminCost: '$1,500-$3,000',
    bestFor: [
      'High earners age 50+',
      'Professionals wanting accelerated savings',
      'Businesses with stable, high income',
    ],
    complexity: 'HIGH',
    hasRothOption: false,
    loanAllowed: false,
    deadlineToSetup: 'Before fiscal year end',
    deadlineToFund: 'Tax filing deadline (with extensions)',
    requirements: [
      'Annual actuarial certification required',
      'Must be adequately funded',
      'Typically combined with 401(k) profit sharing',
    ],
    considerations: [
      'Highest contribution limits for older owners',
      'Requires multi-year commitment',
      'Higher administrative costs',
      'Can combine with 401(k) for even higher savings',
      `At age ${age}, estimated max contribution: $${maxContribution.toLocaleString()}`,
    ],
  };
}

/**
 * Calculate Defined Benefit Plan contribution limits
 */
function calculateDefinedBenefit(
  totalComp: number,
  age: number,
  taxRate: number,
  profile: BusinessOwnerProfile
): RetirementPlanOption {
  // Similar to cash balance but can be even higher for older participants
  const yearsToRetirement = Math.max(profile.yearsToRetirement, 5);

  // Simplified calculation: annual benefit up to $275K, funded over remaining years
  const targetBenefit = Math.min(totalComp, IRS_LIMITS_2024.definedBenefitMax);
  const presentValueFactor = 12; // Simplified factor for lump sum calculation

  // Annual contribution needed to fund benefit
  const annualContribution = (targetBenefit * presentValueFactor) / yearsToRetirement;
  const maxContribution = Math.min(annualContribution, totalComp * 0.80);

  return {
    planType: 'DEFINED_BENEFIT',
    name: 'Traditional Defined Benefit',
    maxContribution,
    employerContribution: maxContribution,
    employeeContribution: 0,
    taxSavings: maxContribution * taxRate,
    setupCost: '$3,000-$8,000',
    annualAdminCost: '$2,000-$5,000',
    bestFor: [
      'Very high earners (>$250K)',
      'Older business owners',
      'Stable, predictable income',
    ],
    complexity: 'HIGH',
    hasRothOption: false,
    loanAllowed: false,
    deadlineToSetup: 'Before fiscal year end',
    deadlineToFund: 'Tax filing deadline (with extensions)',
    requirements: [
      'Annual actuarial certification required',
      'PBGC insurance may be required',
      'Minimum funding rules apply',
    ],
    considerations: [
      'Highest possible tax deductions',
      'Multi-year funding commitment required',
      'Complex administration and high costs',
      'Best for consistent high earners close to retirement',
      'Can fund millions in a compressed timeframe',
    ],
  };
}

/**
 * Get the best plan recommendation based on profile
 */
export function getRecommendedPlan(
  profile: BusinessOwnerProfile,
  effectiveTaxRate: number = 0.30
): {
  recommended: RetirementPlanOption;
  reason: string;
  alternatives: RetirementPlanOption[];
} {
  const options = calculateRetirementOptions(profile, effectiveTaxRate);
  const totalComp = profile.ownerSalary + profile.ownerDistributions;

  // Decision logic
  let recommended: RetirementPlanOption;
  let reason: string;

  if (!profile.hasW2Employees && totalComp < 150000) {
    // Solo 401(k) for self-employed with moderate income
    recommended = options.find(o => o.planType === 'SOLO_401K') || options[0];
    reason = 'Solo 401(k) offers the highest contribution limits with no employees, plus Roth and loan options.';
  } else if (profile.age >= 55 && totalComp >= 250000) {
    // Cash Balance for older high earners
    recommended = options.find(o => o.planType === 'CASH_BALANCE') || options[0];
    reason = 'Cash Balance plan allows accelerated tax-deferred savings for older high earners.';
  } else if (profile.hasW2Employees && profile.employeeCount <= 10) {
    // SEP or SIMPLE for small teams
    if (totalComp >= 150000) {
      recommended = options.find(o => o.planType === 'SEP_IRA') || options[0];
      reason = 'SEP IRA offers higher contribution limits with simple administration for small teams.';
    } else {
      recommended = options.find(o => o.planType === 'SIMPLE_IRA') || options[0];
      reason = 'SIMPLE IRA provides good savings with lower administrative burden for small employers.';
    }
  } else {
    // Default to highest contribution option
    recommended = options[0];
    reason = 'This plan offers the highest tax-deferred contribution limits for your situation.';
  }

  return {
    recommended,
    reason,
    alternatives: options.filter(o => o.planType !== recommended.planType).slice(0, 2),
  };
}

/**
 * Calculate tax savings comparison
 */
export function calculateTaxComparison(
  currentContribution: number,
  recommendedPlan: RetirementPlanOption,
  effectiveTaxRate: number = 0.30
): {
  currentTaxSavings: number;
  potentialTaxSavings: number;
  additionalSavings: number;
  additionalContribution: number;
} {
  const currentTaxSavings = currentContribution * effectiveTaxRate;
  const potentialTaxSavings = recommendedPlan.maxContribution * effectiveTaxRate;
  const additionalSavings = potentialTaxSavings - currentTaxSavings;
  const additionalContribution = recommendedPlan.maxContribution - currentContribution;

  return {
    currentTaxSavings,
    potentialTaxSavings,
    additionalSavings,
    additionalContribution,
  };
}

/**
 * Get plan type display name
 */
export function getPlanTypeName(planType: RetirementPlanType): string {
  const names: Record<RetirementPlanType, string> = {
    SOLO_401K: 'Solo 401(k)',
    SEP_IRA: 'SEP IRA',
    SIMPLE_IRA: 'SIMPLE IRA',
    CASH_BALANCE: 'Cash Balance',
    DEFINED_BENEFIT: 'Defined Benefit',
    PROFIT_SHARING: 'Profit Sharing',
  };
  return names[planType];
}

/**
 * Get complexity badge color
 */
export function getComplexityBadge(complexity: 'LOW' | 'MEDIUM' | 'HIGH'): {
  color: string;
  label: string;
} {
  const badges: Record<string, { color: string; label: string }> = {
    LOW: { color: 'bg-green-100 text-green-800', label: 'Simple' },
    MEDIUM: { color: 'bg-yellow-100 text-yellow-800', label: 'Moderate' },
    HIGH: { color: 'bg-red-100 text-red-800', label: 'Complex' },
  };
  return badges[complexity];
}

/**
 * Format contribution for display
 */
export function formatContribution(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  }
  return `$${amount.toLocaleString()}`;
}
