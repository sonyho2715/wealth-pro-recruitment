/**
 * Business Analysis Calculations
 *
 * Core calculation functions for the What-If Analysis Dashboard.
 * Includes scenario modeling, health score computation, and financial metrics.
 */

// ============================================
// TYPES
// ============================================

export interface YearlyFinancials {
  taxYear: number;
  netReceipts: number; // Revenue
  costOfGoodsSold: number;
  grossProfit: number;
  totalDeductions: number;
  netIncome: number;
  pensionContributions: number;
}

export interface ScenarioInputs {
  priceAdjustment: number; // 0-25% (as decimal: 0.00-0.25)
  costReduction: number; // 0-20% (as decimal: 0.00-0.20)
  pensionContribution: number; // $0-$70,000
}

export interface ScenarioResults {
  // Base (current) values
  baseRevenue: number;
  baseCOGS: number;
  baseGrossProfit: number;
  baseNetIncome: number;
  baseTaxLiability: number;
  basePensionContribution: number;

  // Adjusted (scenario) values
  adjustedRevenue: number;
  adjustedCOGS: number;
  adjustedGrossProfit: number;
  adjustedNetIncome: number;
  adjustedTaxLiability: number;

  // Impact metrics
  revenueIncrease: number;
  costSavings: number;
  totalImprovements: number;
  taxSavings: number;
  netBenefit: number;

  // Ratios
  cogsRatio: number;
  adjustedCogsRatio: number;
  netMargin: number;
  adjustedNetMargin: number;
}

export interface HealthScore {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  color: string;
  breakdown: {
    profitability: number;
    margin: number;
    cogsEfficiency: number;
    retirementPlanning: number;
    growthTrend: number;
  };
  recommendations: string[];
}

export interface TrendAnalysis {
  revenueGrowth: number; // YoY percentage
  cogsGrowthVsRevenue: number; // COGS growth relative to revenue growth
  profitabilityTrend: 'improving' | 'stable' | 'declining';
  volatility: number; // Income variance
  averageCogsRatio: number;
  averageNetMargin: number;
}

// ============================================
// CONSTANTS
// ============================================

// Tax rate assumption (combined federal + state + SE tax for self-employed)
export const ESTIMATED_TAX_RATE = 0.32; // 32%

// Solo 401(k) contribution limits for 2024
export const SOLO_401K_MAX_CONTRIBUTION = 69000;
export const SOLO_401K_EMPLOYEE_DEFERRAL = 23000;

// Health score thresholds
const HEALTH_THRESHOLDS = {
  COGS_EXCELLENT: 0.35,
  COGS_GOOD: 0.45,
  COGS_FAIR: 0.55,
  MARGIN_EXCELLENT: 0.15,
  MARGIN_GOOD: 0.1,
  MARGIN_FAIR: 0.05,
};

// ============================================
// SCENARIO CALCULATIONS
// ============================================

/**
 * Calculate scenario impact based on slider inputs
 */
export function calculateScenario(
  baseData: {
    revenue: number;
    cogs: number;
    totalDeductions: number;
    netIncome: number;
    currentPension: number;
  },
  inputs: ScenarioInputs
): ScenarioResults {
  // Base calculations
  const baseRevenue = baseData.revenue;
  const baseCOGS = baseData.cogs;
  const baseGrossProfit = baseRevenue - baseCOGS;
  const baseNetIncome = baseData.netIncome;
  const basePensionContribution = baseData.currentPension;

  // Base tax (only on positive income)
  const baseTaxableIncome = Math.max(0, baseNetIncome);
  const baseTaxLiability = baseTaxableIncome * ESTIMATED_TAX_RATE;

  // Calculate adjustments
  const revenueIncrease = baseRevenue * inputs.priceAdjustment;
  const costSavings = baseCOGS * inputs.costReduction;
  const pensionContribution = Math.min(inputs.pensionContribution, SOLO_401K_MAX_CONTRIBUTION);

  // Adjusted values
  const adjustedRevenue = baseRevenue + revenueIncrease;
  const adjustedCOGS = baseCOGS - costSavings;
  const adjustedGrossProfit = adjustedRevenue - adjustedCOGS;

  // Net income improvement before pension
  const operatingImprovement = revenueIncrease + costSavings;
  const newNetIncomeBeforePension = baseNetIncome + operatingImprovement;

  // Apply pension deduction (reduces taxable income)
  const adjustedNetIncome = newNetIncomeBeforePension - pensionContribution + basePensionContribution;
  const adjustedTaxableIncome = Math.max(0, newNetIncomeBeforePension);
  const adjustedTaxLiability = Math.max(0, (adjustedTaxableIncome - pensionContribution) * ESTIMATED_TAX_RATE);

  // Tax savings from pension contribution
  const taxSavings = Math.max(0, baseTaxLiability - adjustedTaxLiability + pensionContribution * ESTIMATED_TAX_RATE);

  // Total improvements
  const totalImprovements = revenueIncrease + costSavings;

  // Net benefit (total improvements + tax savings)
  const netBenefit = totalImprovements + taxSavings;

  // Ratios
  const cogsRatio = baseRevenue > 0 ? baseCOGS / baseRevenue : 0;
  const adjustedCogsRatio = adjustedRevenue > 0 ? adjustedCOGS / adjustedRevenue : 0;
  const netMargin = baseRevenue > 0 ? baseNetIncome / baseRevenue : 0;
  const adjustedNetMargin = adjustedRevenue > 0 ? (newNetIncomeBeforePension - pensionContribution) / adjustedRevenue : 0;

  return {
    baseRevenue,
    baseCOGS,
    baseGrossProfit,
    baseNetIncome,
    baseTaxLiability,
    basePensionContribution,
    adjustedRevenue,
    adjustedCOGS,
    adjustedGrossProfit,
    adjustedNetIncome,
    adjustedTaxLiability,
    revenueIncrease,
    costSavings,
    totalImprovements,
    taxSavings,
    netBenefit,
    cogsRatio,
    adjustedCogsRatio,
    netMargin,
    adjustedNetMargin,
  };
}

// ============================================
// HEALTH SCORE CALCULATIONS
// ============================================

/**
 * Calculate business health score (0-100)
 *
 * Scoring breakdown:
 * - Profitability: 30 points max
 * - Net Margin: 25 points max
 * - COGS Efficiency: 20 points max
 * - Retirement Planning: 15 points max
 * - Growth Trend: 10 points max
 */
export function calculateHealthScore(
  currentYear: {
    revenue: number;
    cogs: number;
    netIncome: number;
    pensionContributions: number;
  },
  historicalData?: YearlyFinancials[]
): HealthScore {
  let score = 0;
  const breakdown = {
    profitability: 0,
    margin: 0,
    cogsEfficiency: 0,
    retirementPlanning: 0,
    growthTrend: 0,
  };
  const recommendations: string[] = [];

  const { revenue, cogs, netIncome, pensionContributions } = currentYear;
  const cogsRatio = revenue > 0 ? cogs / revenue : 1;
  const netMargin = revenue > 0 ? netIncome / revenue : 0;

  // 1. Profitability (30 points max)
  if (netIncome > 0) {
    breakdown.profitability = 30;
    score += 30;
  } else if (netIncome > -10000) {
    breakdown.profitability = 15;
    score += 15;
    recommendations.push('Your business is near break-even. A small price increase could move you to profitability.');
  } else {
    breakdown.profitability = 0;
    recommendations.push('Your business is operating at a significant loss. Urgent action needed on pricing or cost structure.');
  }

  // 2. Net Margin (25 points max)
  if (netMargin >= HEALTH_THRESHOLDS.MARGIN_EXCELLENT) {
    breakdown.margin = 25;
    score += 25;
  } else if (netMargin >= HEALTH_THRESHOLDS.MARGIN_GOOD) {
    breakdown.margin = 18;
    score += 18;
  } else if (netMargin >= HEALTH_THRESHOLDS.MARGIN_FAIR) {
    breakdown.margin = 10;
    score += 10;
    recommendations.push('Net margin is below 10%. Consider reviewing pricing strategy or reducing overhead.');
  } else if (netMargin > 0) {
    breakdown.margin = 5;
    score += 5;
    recommendations.push('Thin margins make your business vulnerable. Prioritize margin improvement.');
  }

  // 3. COGS Efficiency (20 points max)
  if (cogsRatio <= HEALTH_THRESHOLDS.COGS_EXCELLENT) {
    breakdown.cogsEfficiency = 20;
    score += 20;
  } else if (cogsRatio <= HEALTH_THRESHOLDS.COGS_GOOD) {
    breakdown.cogsEfficiency = 14;
    score += 14;
  } else if (cogsRatio <= HEALTH_THRESHOLDS.COGS_FAIR) {
    breakdown.cogsEfficiency = 8;
    score += 8;
    recommendations.push('COGS ratio is high. Explore supplier negotiations or process improvements.');
  } else {
    breakdown.cogsEfficiency = 0;
    recommendations.push('COGS consuming too much revenue. This is a critical area for improvement.');
  }

  // 4. Retirement Planning (15 points max)
  if (pensionContributions >= 50000) {
    breakdown.retirementPlanning = 15;
    score += 15;
  } else if (pensionContributions >= 20000) {
    breakdown.retirementPlanning = 10;
    score += 10;
  } else if (pensionContributions > 0) {
    breakdown.retirementPlanning = 5;
    score += 5;
    recommendations.push('Increase retirement contributions to maximize tax savings.');
  } else {
    breakdown.retirementPlanning = 0;
    recommendations.push('No retirement contributions detected. A Solo 401(k) could save you thousands in taxes.');
  }

  // 5. Growth Trend (10 points max) - requires historical data
  if (historicalData && historicalData.length >= 2) {
    const trend = analyzeTrend(historicalData);
    if (trend.profitabilityTrend === 'improving' && trend.revenueGrowth > 0) {
      breakdown.growthTrend = 10;
      score += 10;
    } else if (trend.profitabilityTrend === 'stable') {
      breakdown.growthTrend = 6;
      score += 6;
    } else if (trend.revenueGrowth > 0) {
      breakdown.growthTrend = 4;
      score += 4;
      recommendations.push('Revenue growing but profitability declining. Review cost structure.');
    } else {
      breakdown.growthTrend = 0;
      recommendations.push('Revenue declining. Focus on customer acquisition and retention.');
    }
  } else {
    // Without historical data, give partial credit
    breakdown.growthTrend = 5;
    score += 5;
  }

  // Determine grade and color
  let grade: HealthScore['grade'];
  let color: string;

  if (score >= 80) {
    grade = 'A';
    color = '#10b981'; // emerald-500
  } else if (score >= 65) {
    grade = 'B';
    color = '#3b82f6'; // blue-500
  } else if (score >= 50) {
    grade = 'C';
    color = '#f59e0b'; // amber-500
  } else if (score >= 35) {
    grade = 'D';
    color = '#f97316'; // orange-500
  } else {
    grade = 'F';
    color = '#ef4444'; // red-500
  }

  return {
    score: Math.round(score),
    grade,
    color,
    breakdown,
    recommendations: recommendations.slice(0, 4), // Top 4 recommendations
  };
}

// ============================================
// TREND ANALYSIS
// ============================================

/**
 * Analyze multi-year trends from historical data
 */
export function analyzeTrend(data: YearlyFinancials[]): TrendAnalysis {
  if (data.length < 2) {
    return {
      revenueGrowth: 0,
      cogsGrowthVsRevenue: 0,
      profitabilityTrend: 'stable',
      volatility: 0,
      averageCogsRatio: 0,
      averageNetMargin: 0,
    };
  }

  // Sort by year
  const sorted = [...data].sort((a, b) => a.taxYear - b.taxYear);

  // Calculate year-over-year revenue growth (latest vs earliest)
  const firstYear = sorted[0];
  const lastYear = sorted[sorted.length - 1];
  const totalYears = lastYear.taxYear - firstYear.taxYear;

  let revenueGrowth = 0;
  if (firstYear.netReceipts > 0 && totalYears > 0) {
    revenueGrowth = ((lastYear.netReceipts - firstYear.netReceipts) / firstYear.netReceipts) / totalYears;
  }

  // COGS growth vs revenue growth
  let cogsGrowth = 0;
  if (firstYear.costOfGoodsSold > 0 && totalYears > 0) {
    cogsGrowth = ((lastYear.costOfGoodsSold - firstYear.costOfGoodsSold) / firstYear.costOfGoodsSold) / totalYears;
  }
  const cogsGrowthVsRevenue = cogsGrowth - revenueGrowth;

  // Profitability trend (last 3 years or available data)
  const recentYears = sorted.slice(-3);
  const profitTrends = recentYears.map((y) => y.netIncome);
  let profitabilityTrend: TrendAnalysis['profitabilityTrend'] = 'stable';

  if (profitTrends.length >= 2) {
    const improving = profitTrends.every((v, i) => i === 0 || v >= profitTrends[i - 1]);
    const declining = profitTrends.every((v, i) => i === 0 || v <= profitTrends[i - 1]);

    if (improving && profitTrends[profitTrends.length - 1] > profitTrends[0]) {
      profitabilityTrend = 'improving';
    } else if (declining && profitTrends[profitTrends.length - 1] < profitTrends[0]) {
      profitabilityTrend = 'declining';
    }
  }

  // Income volatility (standard deviation / mean)
  const incomes = sorted.map((y) => y.netIncome);
  const meanIncome = incomes.reduce((a, b) => a + b, 0) / incomes.length;
  const variance = incomes.reduce((sum, val) => sum + Math.pow(val - meanIncome, 2), 0) / incomes.length;
  const stdDev = Math.sqrt(variance);
  const volatility = meanIncome !== 0 ? Math.abs(stdDev / meanIncome) : 0;

  // Average COGS ratio
  const cogsRatios = sorted.map((y) => (y.netReceipts > 0 ? y.costOfGoodsSold / y.netReceipts : 0));
  const averageCogsRatio = cogsRatios.reduce((a, b) => a + b, 0) / cogsRatios.length;

  // Average net margin
  const netMargins = sorted.map((y) => (y.netReceipts > 0 ? y.netIncome / y.netReceipts : 0));
  const averageNetMargin = netMargins.reduce((a, b) => a + b, 0) / netMargins.length;

  return {
    revenueGrowth,
    cogsGrowthVsRevenue,
    profitabilityTrend,
    volatility,
    averageCogsRatio,
    averageNetMargin,
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format currency for display
 */
export function formatCurrency(value: number, compact = false): string {
  if (compact && Math.abs(value) >= 1000000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 1,
      notation: 'compact',
    }).format(value);
  }

  if (compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      notation: 'compact',
    }).format(value);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Get color based on value (positive = green, negative = red)
 */
export function getValueColor(value: number): string {
  if (value > 0) return 'text-emerald-600';
  if (value < 0) return 'text-red-600';
  return 'text-slate-600';
}

/**
 * Get background color based on value
 */
export function getValueBgColor(value: number): string {
  if (value > 0) return 'bg-emerald-50';
  if (value < 0) return 'bg-red-50';
  return 'bg-slate-50';
}

/**
 * Calculate recommended pension contribution based on income
 */
export function calculateRecommendedPension(netIncome: number): number {
  if (netIncome <= 0) return 0;

  // For Solo 401(k): Employee deferral + 25% of net self-employment income
  const maxEmployeeDefer = SOLO_401K_EMPLOYEE_DEFERRAL;
  const maxEmployerContrib = netIncome * 0.25;
  const recommended = Math.min(maxEmployeeDefer + maxEmployerContrib, SOLO_401K_MAX_CONTRIBUTION);

  // Round to nearest $1000
  return Math.round(recommended / 1000) * 1000;
}

/**
 * Generate Zion Glass sample data for demo/testing
 */
export function getZionGlassSampleData(): YearlyFinancials[] {
  return [
    {
      taxYear: 2020,
      netReceipts: 201000,
      costOfGoodsSold: 101000,
      grossProfit: 100000,
      totalDeductions: 101600,
      netIncome: -1600,
      pensionContributions: 0,
    },
    {
      taxYear: 2021,
      netReceipts: 121000,
      costOfGoodsSold: 38000,
      grossProfit: 83000,
      totalDeductions: 74900,
      netIncome: 8100,
      pensionContributions: 0,
    },
    {
      taxYear: 2022,
      netReceipts: 194000,
      costOfGoodsSold: 86000,
      grossProfit: 108000,
      totalDeductions: 182600,
      netIncome: -74600,
      pensionContributions: 0,
    },
    {
      taxYear: 2023,
      netReceipts: 370000,
      costOfGoodsSold: 143000,
      grossProfit: 227000,
      totalDeductions: 200400,
      netIncome: 26600,
      pensionContributions: 0,
    },
    {
      taxYear: 2024,
      netReceipts: 776000,
      costOfGoodsSold: 420000,
      grossProfit: 356000,
      totalDeductions: 407900,
      netIncome: -51900,
      pensionContributions: 0,
    },
  ];
}
