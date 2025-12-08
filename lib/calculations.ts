import type { FinancialProfile, InsuranceType } from '@prisma/client';
import {
  AGENT_ASSUMPTIONS,
  PREMIUM_ESTIMATES,
  FINANCIAL_ASSUMPTIONS,
  DISABILITY_ASSUMPTIONS,
  DIME_ASSUMPTIONS,
} from './config';

// Calculate net worth from financial profile
export function calculateNetWorth(profile: {
  savings: number;
  emergencyFund?: number;
  investments: number;
  hsaFsa?: number;
  retirement401k: number;
  rothIra?: number;
  pensionValue?: number;
  homeEquity: number;
  investmentProperty?: number;
  businessEquity?: number;
  otherAssets: number;
  mortgage: number;
  carLoans: number;
  studentLoans: number;
  personalLoans?: number;
  creditCards: number;
  otherDebts: number;
}): number {
  const totalAssets =
    profile.savings +
    (profile.emergencyFund || 0) +
    profile.investments +
    (profile.hsaFsa || 0) +
    profile.retirement401k +
    (profile.rothIra || 0) +
    (profile.pensionValue || 0) +
    profile.homeEquity +
    (profile.investmentProperty || 0) +
    (profile.businessEquity || 0) +
    profile.otherAssets;

  const totalLiabilities =
    profile.mortgage +
    profile.carLoans +
    profile.studentLoans +
    (profile.personalLoans || 0) +
    profile.creditCards +
    profile.otherDebts;

  return totalAssets - totalLiabilities;
}

// Calculate monthly cash flow gap
export function calculateMonthlyGap(profile: {
  annualIncome: number;
  spouseIncome?: number | null;
  otherIncome?: number | null;
  monthlyExpenses: number;
}): number {
  const totalMonthlyIncome =
    (profile.annualIncome +
      (profile.spouseIncome || 0) +
      (profile.otherIncome || 0)) /
    12;

  return totalMonthlyIncome - profile.monthlyExpenses;
}

// Calculate life insurance protection gap (DIME method)
export function calculateProtectionGap(profile: {
  annualIncome: number;
  spouseIncome?: number | null;
  age: number;
  retirementAge: number;
  dependents: number;
  mortgage: number;
  carLoans: number;
  studentLoans: number;
  personalLoans?: number;
  creditCards: number;
  otherDebts: number;
  taxesOwed?: number;
  businessDebt?: number;
  currentLifeInsurance: number;
}): number {
  const yearsToRetirement = Math.max(0, profile.retirementAge - profile.age);

  // D - Debt (includes all liabilities that must be settled)
  const totalDebt =
    profile.mortgage +
    profile.carLoans +
    profile.studentLoans +
    (profile.personalLoans || 0) +
    profile.creditCards +
    profile.otherDebts +
    (profile.taxesOwed || 0) +
    (profile.businessDebt || 0);

  // I - Income replacement (use config value or until retirement, whichever is less)
  const incomeYears = Math.min(DIME_ASSUMPTIONS.incomeReplacementYears, yearsToRetirement);
  const incomeReplacement = profile.annualIncome * incomeYears;

  // M - Mortgage (already included in debt)

  // E - Education (use config value per dependent)
  const educationFund = profile.dependents * DIME_ASSUMPTIONS.educationFundPerDependent;

  // Final expenses (from config)
  const finalExpenses = DIME_ASSUMPTIONS.finalExpenses;

  const totalNeed = totalDebt + incomeReplacement + educationFund + finalExpenses;
  const gap = totalNeed - profile.currentLifeInsurance;

  return Math.max(0, gap);
}

// Generate insurance recommendations based on profile
export function generateInsuranceRecommendations(profile: {
  annualIncome: number;
  spouseIncome?: number | null;
  age: number;
  retirementAge: number;
  dependents: number;
  mortgage: number;
  carLoans: number;
  studentLoans: number;
  personalLoans?: number;
  creditCards: number;
  otherDebts: number;
  currentLifeInsurance: number;
  currentDisability: number;
}): Array<{
  type: InsuranceType;
  recommendedCoverage: number;
  currentCoverage: number;
  gap: number;
  priority: number;
  reasoning: string;
  estimatedMonthlyPremium: number;
}> {
  const recommendations: Array<{
    type: InsuranceType;
    recommendedCoverage: number;
    currentCoverage: number;
    gap: number;
    priority: number;
    reasoning: string;
    estimatedMonthlyPremium: number;
  }> = [];

  const protectionGap = calculateProtectionGap(profile);
  const yearsToRetirement = profile.retirementAge - profile.age;

  // Term Life Insurance
  if (protectionGap > 0) {
    const termYears = Math.min(20, yearsToRetirement);
    // Premium estimate using config values
    const ageMultiplier = 1 + (profile.age - PREMIUM_ESTIMATES.termLife.baseAge) * PREMIUM_ESTIMATES.termLife.ageMultiplierRate;
    const premium = (protectionGap / 500000) * PREMIUM_ESTIMATES.termLife.basePremiumPer500K * Math.max(1, ageMultiplier);

    recommendations.push({
      type: 'TERM_LIFE',
      recommendedCoverage: protectionGap,
      currentCoverage: profile.currentLifeInsurance,
      gap: protectionGap,
      priority: 1,
      reasoning: `Based on your income ($${profile.annualIncome.toLocaleString()}), ${profile.dependents} dependents, and ${termYears} years to retirement, you need approximately $${protectionGap.toLocaleString()} in term life coverage to protect your family.`,
      estimatedMonthlyPremium: Math.round(premium),
    });
  }

  // Disability Insurance
  const monthlyIncome = profile.annualIncome / 12;
  const disabilityNeed = monthlyIncome * DISABILITY_ASSUMPTIONS.incomeReplacementRate;
  const disabilityGap = disabilityNeed - profile.currentDisability;

  if (disabilityGap > 0) {
    recommendations.push({
      type: 'DISABILITY',
      recommendedCoverage: disabilityNeed * 12, // Annual
      currentCoverage: profile.currentDisability * 12,
      gap: disabilityGap * 12,
      priority: 2,
      reasoning: `Disability insurance replaces your income if you cannot work. You need approximately $${Math.round(disabilityNeed).toLocaleString()}/month coverage (60% of your income).`,
      estimatedMonthlyPremium: Math.round(disabilityNeed * PREMIUM_ESTIMATES.disability.premiumRate),
    });
  }

  // Whole Life (for permanent needs + cash value)
  if (profile.age < 50 && profile.annualIncome > 75000) {
    const wholeLifeAmount = Math.min(250000, profile.annualIncome * 2);
    recommendations.push({
      type: 'WHOLE_LIFE',
      recommendedCoverage: wholeLifeAmount,
      currentCoverage: 0,
      gap: wholeLifeAmount,
      priority: 3,
      reasoning: `Whole life insurance provides permanent coverage and builds cash value. A $${wholeLifeAmount.toLocaleString()} policy can serve as a tax-advantaged savings vehicle and cover final expenses.`,
      estimatedMonthlyPremium: Math.round((wholeLifeAmount / 1000) * PREMIUM_ESTIMATES.wholeLife.premiumPer1K),
    });
  }

  // Long-term care (if age 45+)
  if (profile.age >= PREMIUM_ESTIMATES.longTermCare.baseAge) {
    const ltcBenefit = 5000; // $5K/month benefit
    recommendations.push({
      type: 'LONG_TERM_CARE',
      recommendedCoverage: ltcBenefit * 36, // 3-year benefit
      currentCoverage: 0,
      gap: ltcBenefit * 36,
      priority: 4,
      reasoning: `70% of people over 65 will need long-term care. A policy with $${ltcBenefit.toLocaleString()}/month benefit helps protect your assets from nursing home costs.`,
      estimatedMonthlyPremium: Math.round(
        PREMIUM_ESTIMATES.longTermCare.basePremium +
        (profile.age - PREMIUM_ESTIMATES.longTermCare.baseAge) * PREMIUM_ESTIMATES.longTermCare.ageMultiplierRate
      ),
    });
  }

  return recommendations.sort((a, b) => a.priority - b.priority);
}

// Calculate income replacement insurance need
// Formula: Monthly Need × 12 × Years = Total Income Replacement Insurance Need
export function calculateIncomeReplacement(params: {
  monthlyIncome: number;
  monthlyExpenses: number;
  yearsOfCoverage: number;
  inflationRate?: number;  // Optional: adjust for inflation
}): {
  monthlyNeed: number;
  annualNeed: number;
  totalNeed: number;
  breakdown: {
    year: number;
    annualNeed: number;
    cumulativeNeed: number;
  }[];
} {
  const inflationRate = params.inflationRate ?? FINANCIAL_ASSUMPTIONS.inflationRate; // Default from config

  // Monthly need is typically the higher of 60% of income or actual expenses
  const incomeBasedNeed = params.monthlyIncome * DISABILITY_ASSUMPTIONS.incomeReplacementRate;
  const monthlyNeed = Math.max(incomeBasedNeed, params.monthlyExpenses);
  const annualNeed = monthlyNeed * 12;

  // Calculate year-by-year breakdown with inflation adjustment
  const breakdown: { year: number; annualNeed: number; cumulativeNeed: number }[] = [];
  let cumulativeNeed = 0;

  for (let year = 1; year <= params.yearsOfCoverage; year++) {
    // Adjust for inflation each year
    const inflationAdjustedNeed = annualNeed * Math.pow(1 + inflationRate, year - 1);
    cumulativeNeed += inflationAdjustedNeed;

    breakdown.push({
      year,
      annualNeed: Math.round(inflationAdjustedNeed),
      cumulativeNeed: Math.round(cumulativeNeed),
    });
  }

  // Total need is the sum of all years (inflation-adjusted)
  const totalNeed = breakdown.length > 0
    ? breakdown[breakdown.length - 1].cumulativeNeed
    : annualNeed * params.yearsOfCoverage;

  return {
    monthlyNeed: Math.round(monthlyNeed),
    annualNeed: Math.round(annualNeed),
    totalNeed: Math.round(totalNeed),
    breakdown,
  };
}

// Calculate agent income projection
export function calculateAgentProjection(params: {
  hoursPerWeek: number;
  networkSize: number;
  startingAge: number;
}): {
  yearlyProjections: Array<{
    year: number;
    clients: number;
    policies: number;
    firstYearCommission: number;
    renewalCommission: number;
    totalIncome: number;
    cumulativeIncome: number;
  }>;
  year1Income: number;
  year3Income: number;
  year5Income: number;
  lifetimeValue: number;
} {
  const { hoursPerWeek, networkSize } = params;

  // Use unified config for assumptions
  const avgPolicyPremium = AGENT_ASSUMPTIONS.averagePolicyPremium;
  const firstYearCommissionRate = AGENT_ASSUMPTIONS.firstYearCommissionRate;
  const renewalCommissionRate = AGENT_ASSUMPTIONS.renewalCommissionRate;
  const conversionRate = AGENT_ASSUMPTIONS.conversionRate;
  const policiesPerClient = AGENT_ASSUMPTIONS.policiesPerClient;
  const yearlyNewContacts = hoursPerWeek * AGENT_ASSUMPTIONS.contactsPerHour * 50; // 50 weeks/year

  const projections: Array<{
    year: number;
    clients: number;
    policies: number;
    firstYearCommission: number;
    renewalCommission: number;
    totalIncome: number;
    cumulativeIncome: number;
  }> = [];

  let cumulativeIncome = 0;
  let totalPoliciesInForce = 0;

  for (let year = 1; year <= 10; year++) {
    // New clients this year (grows with experience)
    const experienceMultiplier = 1 + (year - 1) * 0.1;
    const newClients = Math.round(
      (year === 1 ? networkSize * conversionRate : yearlyNewContacts * conversionRate) *
      experienceMultiplier
    );

    const newPolicies = Math.round(newClients * policiesPerClient);
    const firstYearCommission = newPolicies * avgPolicyPremium * firstYearCommissionRate;

    // Renewal commissions from previous years (with 90% persistency)
    const renewalCommission = totalPoliciesInForce * avgPolicyPremium * renewalCommissionRate * 0.9;

    totalPoliciesInForce = Math.round(totalPoliciesInForce * 0.9 + newPolicies);

    const totalIncome = firstYearCommission + renewalCommission;
    cumulativeIncome += totalIncome;

    projections.push({
      year,
      clients: newClients,
      policies: newPolicies,
      firstYearCommission: Math.round(firstYearCommission),
      renewalCommission: Math.round(renewalCommission),
      totalIncome: Math.round(totalIncome),
      cumulativeIncome: Math.round(cumulativeIncome),
    });
  }

  return {
    yearlyProjections: projections,
    year1Income: projections[0].totalIncome,
    year3Income: projections[2].totalIncome,
    year5Income: projections[4].totalIncome,
    lifetimeValue: cumulativeIncome,
  };
}

// Calculate comparison between with/without agent career
export function calculateComparison(params: {
  currentAge: number;
  retirementAge: number;
  currentIncome: number;
  currentSavings: number;
  monthlyContribution: number;
  agentYear1Income: number;
  agentYear5Income: number;
}): {
  baseline: {
    projection: Array<{ age: number; income: number; netWorth: number }>;
    retirementAge: number;
    netWorthAt65: number;
  };
  withAgent: {
    projection: Array<{ age: number; income: number; netWorth: number }>;
    retirementAge: number;
    netWorthAt65: number;
  };
  additionalIncome: number;
  yearsEarlierRetirement: number;
  additionalNetWorth: number;
} {
  const { currentAge, retirementAge, currentIncome, currentSavings, monthlyContribution } = params;
  const yearsTo65 = 65 - currentAge;
  const annualReturn = FINANCIAL_ASSUMPTIONS.nominalReturnRate;

  // Baseline projection (current path)
  const baselineProjection: Array<{ age: number; income: number; netWorth: number }> = [];
  let baselineNetWorth = currentSavings;

  for (let i = 0; i <= yearsTo65; i++) {
    const age = currentAge + i;
    const income = currentIncome * Math.pow(1 + FINANCIAL_ASSUMPTIONS.annualRaiseRate, i);
    baselineNetWorth = baselineNetWorth * (1 + annualReturn) + monthlyContribution * 12;

    baselineProjection.push({
      age,
      income: Math.round(income),
      netWorth: Math.round(baselineNetWorth),
    });
  }

  // With agent career projection
  const agentProjection: Array<{ age: number; income: number; netWorth: number }> = [];
  let agentNetWorth = currentSavings;
  let totalBaselineIncome = 0;
  let totalAgentIncome = 0;

  for (let i = 0; i <= yearsTo65; i++) {
    const age = currentAge + i;
    const baseIncome = currentIncome * Math.pow(1 + FINANCIAL_ASSUMPTIONS.annualRaiseRate, i);

    // Agent income grows from year1 to year5, then stabilizes
    let agentIncome = 0;
    if (i < 5) {
      const progress = i / 4;
      agentIncome = params.agentYear1Income + (params.agentYear5Income - params.agentYear1Income) * progress;
    } else {
      agentIncome = params.agentYear5Income * Math.pow(1.05, i - 4); // 5% growth after year 5
    }

    const totalIncome = baseIncome + agentIncome;
    const agentMonthlyContribution = monthlyContribution + (agentIncome * FINANCIAL_ASSUMPTIONS.agentIncomeSavingsRate) / 12;

    agentNetWorth = agentNetWorth * (1 + annualReturn) + agentMonthlyContribution * 12;

    totalBaselineIncome += baseIncome;
    totalAgentIncome += totalIncome;

    agentProjection.push({
      age,
      income: Math.round(totalIncome),
      netWorth: Math.round(agentNetWorth),
    });
  }

  // Calculate when agent path reaches baseline retirement net worth
  const baselineRetirementNetWorth = baselineProjection.find(p => p.age === retirementAge)?.netWorth || 0;
  const agentRetirementAge = agentProjection.findIndex(p => p.netWorth >= baselineRetirementNetWorth);
  const earlierRetirement = agentRetirementAge > 0 ? retirementAge - (currentAge + agentRetirementAge) : 0;

  return {
    baseline: {
      projection: baselineProjection,
      retirementAge,
      netWorthAt65: baselineProjection[baselineProjection.length - 1]?.netWorth || 0,
    },
    withAgent: {
      projection: agentProjection,
      retirementAge: Math.max(currentAge, retirementAge - earlierRetirement),
      netWorthAt65: agentProjection[agentProjection.length - 1]?.netWorth || 0,
    },
    additionalIncome: Math.round(totalAgentIncome - totalBaselineIncome),
    yearsEarlierRetirement: Math.max(0, earlierRetirement),
    additionalNetWorth: Math.round(
      (agentProjection[agentProjection.length - 1]?.netWorth || 0) -
      (baselineProjection[baselineProjection.length - 1]?.netWorth || 0)
    ),
  };
}
