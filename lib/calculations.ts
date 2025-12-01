import type { FinancialProfile, InsuranceType } from '@prisma/client';

// Calculate net worth from financial profile
export function calculateNetWorth(profile: {
  savings: number;
  investments: number;
  retirement401k: number;
  homeEquity: number;
  otherAssets: number;
  mortgage: number;
  carLoans: number;
  studentLoans: number;
  creditCards: number;
  otherDebts: number;
}): number {
  const totalAssets =
    profile.savings +
    profile.investments +
    profile.retirement401k +
    profile.homeEquity +
    profile.otherAssets;

  const totalLiabilities =
    profile.mortgage +
    profile.carLoans +
    profile.studentLoans +
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
  creditCards: number;
  otherDebts: number;
  currentLifeInsurance: number;
}): number {
  const yearsToRetirement = Math.max(0, profile.retirementAge - profile.age);

  // D - Debt
  const totalDebt =
    profile.mortgage +
    profile.carLoans +
    profile.studentLoans +
    profile.creditCards +
    profile.otherDebts;

  // I - Income replacement (10 years or until retirement, whichever is less)
  const incomeYears = Math.min(10, yearsToRetirement);
  const incomeReplacement = profile.annualIncome * incomeYears;

  // M - Mortgage (already included in debt)

  // E - Education ($50K per dependent for college)
  const educationFund = profile.dependents * 50000;

  // Final expenses
  const finalExpenses = 25000;

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
    // Rough premium estimate: $20/month per $500K for 35yo, adjust by age
    const ageMultiplier = 1 + (profile.age - 35) * 0.03;
    const premium = (protectionGap / 500000) * 20 * ageMultiplier;

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
  const disabilityNeed = monthlyIncome * 0.6; // 60% income replacement
  const disabilityGap = disabilityNeed - profile.currentDisability;

  if (disabilityGap > 0) {
    recommendations.push({
      type: 'DISABILITY',
      recommendedCoverage: disabilityNeed * 12, // Annual
      currentCoverage: profile.currentDisability * 12,
      gap: disabilityGap * 12,
      priority: 2,
      reasoning: `Disability insurance replaces your income if you cannot work. You need approximately $${Math.round(disabilityNeed).toLocaleString()}/month coverage (60% of your income).`,
      estimatedMonthlyPremium: Math.round(disabilityNeed * 0.02), // ~2% of benefit
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
      estimatedMonthlyPremium: Math.round((wholeLifeAmount / 1000) * 8), // ~$8 per $1K coverage
    });
  }

  // Long-term care (if age 45+)
  if (profile.age >= 45) {
    const ltcBenefit = 5000; // $5K/month benefit
    recommendations.push({
      type: 'LONG_TERM_CARE',
      recommendedCoverage: ltcBenefit * 36, // 3-year benefit
      currentCoverage: 0,
      gap: ltcBenefit * 36,
      priority: 4,
      reasoning: `70% of people over 65 will need long-term care. A policy with $${ltcBenefit.toLocaleString()}/month benefit helps protect your assets from nursing home costs.`,
      estimatedMonthlyPremium: Math.round(100 + (profile.age - 45) * 10),
    });
  }

  return recommendations.sort((a, b) => a.priority - b.priority);
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

  // Assumptions
  const avgPolicyPremium = 2000; // Annual premium
  const firstYearCommissionRate = 0.55; // 55% first year
  const renewalCommissionRate = 0.05; // 5% renewals
  const conversionRate = 0.15; // 15% of contacts become clients
  const policiesPerClient = 1.5; // Average policies per client
  const yearlyNewContacts = (hoursPerWeek / 10) * 50; // Contacts per year based on hours

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
  const annualReturn = 0.07; // 7% average return

  // Baseline projection (current path)
  const baselineProjection: Array<{ age: number; income: number; netWorth: number }> = [];
  let baselineNetWorth = currentSavings;

  for (let i = 0; i <= yearsTo65; i++) {
    const age = currentAge + i;
    const income = currentIncome * Math.pow(1.03, i); // 3% annual raise
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
    const baseIncome = currentIncome * Math.pow(1.03, i);

    // Agent income grows from year1 to year5, then stabilizes
    let agentIncome = 0;
    if (i < 5) {
      const progress = i / 4;
      agentIncome = params.agentYear1Income + (params.agentYear5Income - params.agentYear1Income) * progress;
    } else {
      agentIncome = params.agentYear5Income * Math.pow(1.05, i - 4); // 5% growth after year 5
    }

    const totalIncome = baseIncome + agentIncome;
    const agentMonthlyContribution = monthlyContribution + (agentIncome * 0.3) / 12; // Save 30% of agent income

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
