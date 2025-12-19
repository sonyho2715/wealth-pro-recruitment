/**
 * ICE (Intelligent Calibration Engine)
 *
 * Core calibration algorithms for business financial analysis:
 * - Revenue tier determination
 * - Percentile calculation (where a business ranks vs industry peers)
 * - Composite health score calculation
 * - Opportunity analysis (improvement potential)
 * - 5-year With/Without projections
 */

import { RevenueTier, HealthTrend } from '@prisma/client';

// ============================================
// TYPES
// ============================================

export interface BusinessMetrics {
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  netIncome: number;
  totalDeductions?: number;
  pensionContributions?: number;
  wages?: number;
  rent?: number;
  currentAssets?: number;
  currentLiabilities?: number;
  totalLiabilities?: number;
  totalEquity?: number;
}

export interface IndustryBenchmarks {
  // Profitability
  grossProfitMargin_p25: number;
  grossProfitMargin_p50: number;
  grossProfitMargin_p75: number;
  netProfitMargin_p25: number;
  netProfitMargin_p50: number;
  netProfitMargin_p75: number;
  // Efficiency
  cogsRatio_p25: number;
  cogsRatio_p50: number;
  cogsRatio_p75: number;
  laborCostRatio_p25: number;
  laborCostRatio_p50: number;
  laborCostRatio_p75: number;
  rentRatio_p25: number;
  rentRatio_p50: number;
  rentRatio_p75: number;
  // Liquidity & Leverage
  currentRatio_p25: number;
  currentRatio_p50: number;
  currentRatio_p75: number;
  debtToEquity_p25: number;
  debtToEquity_p50: number;
  debtToEquity_p75: number;
  // Pension
  pensionContributionRate_p25: number;
  pensionContributionRate_p50: number;
  pensionContributionRate_p75: number;
}

export interface PercentileScores {
  grossProfitPercentile: number;
  netProfitPercentile: number;
  cogsPercentile: number;
  laborCostPercentile: number;
  currentRatioPercentile: number;
  debtToEquityPercentile: number;
  pensionPercentile: number;
}

export interface OpportunityAnalysis {
  revenueOpportunity: number;
  cogsOpportunity: number;
  laborOpportunity: number;
  pensionOpportunity: number;
  totalOpportunity: number;
}

export interface YearProjection {
  year: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  netIncome: number;
  pension: number;
  taxSavings: number;
  cumulativeValue: number;
}

export interface CalibrationResult {
  revenueTier: RevenueTier;
  percentileScores: PercentileScores;
  healthScore: number;
  healthTrend: HealthTrend;
  opportunities: OpportunityAnalysis;
  withoutScenario: YearProjection[];
  withScenario: YearProjection[];
  insights: Insight[];
}

export interface Insight {
  type: 'success' | 'warning' | 'opportunity' | 'critical';
  category: string;
  title: string;
  description: string;
  value?: number;
  percentile?: number;
}

// ============================================
// CONSTANTS
// ============================================

// Revenue tier breakpoints
const REVENUE_TIERS: { tier: RevenueTier; min: number; max: number }[] = [
  { tier: 'TIER_0_250K', min: 0, max: 250000 },
  { tier: 'TIER_250K_500K', min: 250000, max: 500000 },
  { tier: 'TIER_500K_1M', min: 500000, max: 1000000 },
  { tier: 'TIER_1M_3M', min: 1000000, max: 3000000 },
  { tier: 'TIER_3M_5M', min: 3000000, max: 5000000 },
  { tier: 'TIER_5M_10M', min: 5000000, max: 10000000 },
  { tier: 'TIER_10M_25M', min: 10000000, max: 25000000 },
  { tier: 'TIER_25M_PLUS', min: 25000000, max: Infinity },
];

// Health score weights (sum to 100)
const HEALTH_WEIGHTS = {
  netProfitMargin: 30,      // Most important
  grossProfitMargin: 20,    // Cost efficiency
  cogsRatio: 15,            // Operational efficiency
  currentRatio: 15,         // Liquidity
  debtToEquity: 10,         // Leverage
  pension: 10,              // Tax planning maturity
};

// Default tax rate for pension savings calculation
const ASSUMED_TAX_RATE = 0.32;

// Maximum Solo 401(k) contribution (2024)
const MAX_PENSION_CONTRIBUTION = 69000;

// ============================================
// REVENUE TIER DETERMINATION
// ============================================

export function determineRevenueTier(revenue: number): RevenueTier {
  for (const { tier, min, max } of REVENUE_TIERS) {
    if (revenue >= min && revenue < max) {
      return tier;
    }
  }
  return 'TIER_25M_PLUS';
}

export function getRevenueTierLabel(tier: RevenueTier): string {
  const labels: Record<RevenueTier, string> = {
    TIER_0_250K: '$0 - $250K',
    TIER_250K_500K: '$250K - $500K',
    TIER_500K_1M: '$500K - $1M',
    TIER_1M_3M: '$1M - $3M',
    TIER_3M_5M: '$3M - $5M',
    TIER_5M_10M: '$5M - $10M',
    TIER_10M_25M: '$10M - $25M',
    TIER_25M_PLUS: '$25M+',
  };
  return labels[tier];
}

// ============================================
// PERCENTILE CALCULATION
// ============================================

/**
 * Calculate where a value falls between percentiles (0-100)
 *
 * For metrics where higher is better (gross profit margin, net profit margin, current ratio):
 * - Below p25 = 0-25
 * - Between p25-p50 = 25-50
 * - Between p50-p75 = 50-75
 * - Above p75 = 75-100
 *
 * For metrics where lower is better (COGS ratio, debt-to-equity):
 * - Above p75 = 0-25 (worse)
 * - Between p50-p75 = 25-50
 * - Between p25-p50 = 50-75
 * - Below p25 = 75-100 (best)
 */
export function calculatePercentile(
  value: number,
  p25: number,
  p50: number,
  p75: number,
  lowerIsBetter = false
): number {
  if (lowerIsBetter) {
    // Reverse the logic for metrics where lower is better
    if (value <= p25) {
      // Best performers (below 25th percentile of cost ratio)
      // Map to 75-100 range
      const ratio = Math.max(0, Math.min(1, p25 > 0 ? (p25 - value) / p25 : 1));
      return Math.round(75 + ratio * 25);
    } else if (value <= p50) {
      // Good performers (25th to 50th percentile)
      const range = p50 - p25;
      const ratio = range > 0 ? (p50 - value) / range : 0.5;
      return Math.round(50 + ratio * 25);
    } else if (value <= p75) {
      // Below average (50th to 75th percentile)
      const range = p75 - p50;
      const ratio = range > 0 ? (p75 - value) / range : 0.5;
      return Math.round(25 + ratio * 25);
    } else {
      // Worst performers (above 75th percentile of cost ratio)
      // Map to 0-25 range
      const excess = value - p75;
      const maxExcess = p75 * 0.5; // Cap at 50% above p75
      const ratio = Math.min(1, excess / maxExcess);
      return Math.round(25 - ratio * 25);
    }
  } else {
    // Higher is better (default)
    if (value >= p75) {
      // Top performers
      const excess = value - p75;
      const headroom = p75 > 0 ? p75 * 0.5 : 0.25; // Assume 50% headroom above p75
      const ratio = Math.min(1, excess / headroom);
      return Math.round(75 + ratio * 25);
    } else if (value >= p50) {
      // Above average
      const range = p75 - p50;
      const ratio = range > 0 ? (value - p50) / range : 0.5;
      return Math.round(50 + ratio * 25);
    } else if (value >= p25) {
      // Below average
      const range = p50 - p25;
      const ratio = range > 0 ? (value - p25) / range : 0.5;
      return Math.round(25 + ratio * 25);
    } else {
      // Bottom performers
      const ratio = p25 > 0 ? Math.max(0, value / p25) : 0;
      return Math.round(ratio * 25);
    }
  }
}

/**
 * Calculate all percentile scores for a business
 */
export function calculatePercentileScores(
  metrics: BusinessMetrics,
  benchmarks: IndustryBenchmarks
): PercentileScores {
  const revenue = metrics.revenue || 1; // Prevent division by zero

  // Calculate ratios
  const grossProfitMargin = metrics.grossProfit / revenue;
  const netProfitMargin = metrics.netIncome / revenue;
  const cogsRatio = metrics.costOfGoodsSold / revenue;
  const laborCostRatio = (metrics.wages || 0) / revenue;
  const currentRatio =
    metrics.currentAssets && metrics.currentLiabilities && metrics.currentLiabilities > 0
      ? metrics.currentAssets / metrics.currentLiabilities
      : 1.5; // Default to median if not available
  const debtToEquity =
    metrics.totalLiabilities && metrics.totalEquity && metrics.totalEquity > 0
      ? metrics.totalLiabilities / metrics.totalEquity
      : 1.0; // Default to median if not available
  const pensionRate = (metrics.pensionContributions || 0) / revenue;

  return {
    grossProfitPercentile: calculatePercentile(
      grossProfitMargin,
      benchmarks.grossProfitMargin_p25,
      benchmarks.grossProfitMargin_p50,
      benchmarks.grossProfitMargin_p75
    ),
    netProfitPercentile: calculatePercentile(
      netProfitMargin,
      benchmarks.netProfitMargin_p25,
      benchmarks.netProfitMargin_p50,
      benchmarks.netProfitMargin_p75
    ),
    cogsPercentile: calculatePercentile(
      cogsRatio,
      benchmarks.cogsRatio_p25,
      benchmarks.cogsRatio_p50,
      benchmarks.cogsRatio_p75,
      true // Lower is better
    ),
    laborCostPercentile: calculatePercentile(
      laborCostRatio,
      benchmarks.laborCostRatio_p25,
      benchmarks.laborCostRatio_p50,
      benchmarks.laborCostRatio_p75,
      true // Lower is better
    ),
    currentRatioPercentile: calculatePercentile(
      currentRatio,
      benchmarks.currentRatio_p25,
      benchmarks.currentRatio_p50,
      benchmarks.currentRatio_p75
    ),
    debtToEquityPercentile: calculatePercentile(
      debtToEquity,
      benchmarks.debtToEquity_p25,
      benchmarks.debtToEquity_p50,
      benchmarks.debtToEquity_p75,
      true // Lower is better
    ),
    pensionPercentile: calculatePercentile(
      pensionRate,
      benchmarks.pensionContributionRate_p25,
      benchmarks.pensionContributionRate_p50,
      benchmarks.pensionContributionRate_p75
    ),
  };
}

// ============================================
// HEALTH SCORE CALCULATION
// ============================================

/**
 * Calculate composite health score (0-100)
 *
 * Weights:
 * - Net Profit Margin: 30%
 * - Gross Profit Margin: 20%
 * - COGS Efficiency: 15%
 * - Current Ratio (Liquidity): 15%
 * - Debt-to-Equity: 10%
 * - Pension Planning: 10%
 */
export function calculateHealthScore(percentiles: PercentileScores): number {
  const weightedScore =
    percentiles.netProfitPercentile * (HEALTH_WEIGHTS.netProfitMargin / 100) +
    percentiles.grossProfitPercentile * (HEALTH_WEIGHTS.grossProfitMargin / 100) +
    percentiles.cogsPercentile * (HEALTH_WEIGHTS.cogsRatio / 100) +
    percentiles.currentRatioPercentile * (HEALTH_WEIGHTS.currentRatio / 100) +
    percentiles.debtToEquityPercentile * (HEALTH_WEIGHTS.debtToEquity / 100) +
    percentiles.pensionPercentile * (HEALTH_WEIGHTS.pension / 100);

  return Math.round(Math.max(0, Math.min(100, weightedScore)));
}

/**
 * Determine health trend based on year-over-year changes
 */
export function determineHealthTrend(
  currentMetrics: BusinessMetrics,
  previousMetrics?: BusinessMetrics
): HealthTrend {
  if (!previousMetrics) return 'STABLE';

  const currentNetMargin = currentMetrics.netIncome / (currentMetrics.revenue || 1);
  const previousNetMargin = previousMetrics.netIncome / (previousMetrics.revenue || 1);

  const marginChange = currentNetMargin - previousNetMargin;

  if (marginChange > 0.03) return 'IMPROVING'; // 3%+ improvement
  if (marginChange < -0.03) return 'DECLINING'; // 3%+ decline
  return 'STABLE';
}

/**
 * Get health score color and label
 */
export function getHealthScoreDisplay(score: number): { color: string; label: string } {
  if (score >= 80) return { color: 'emerald', label: 'Excellent' };
  if (score >= 60) return { color: 'blue', label: 'Good' };
  if (score >= 40) return { color: 'amber', label: 'Fair' };
  return { color: 'red', label: 'Needs Attention' };
}

// ============================================
// OPPORTUNITY ANALYSIS
// ============================================

/**
 * Calculate improvement opportunities in dollar terms
 *
 * For each metric below the 75th percentile, calculate:
 * - What would revenue/profit look like at 75th percentile?
 * - How much additional income is that?
 */
export function calculateOpportunities(
  metrics: BusinessMetrics,
  benchmarks: IndustryBenchmarks,
  percentiles: PercentileScores
): OpportunityAnalysis {
  const revenue = metrics.revenue || 1;

  // Revenue opportunity (if net margin reaches 75th percentile)
  let revenueOpportunity = 0;
  if (percentiles.netProfitPercentile < 75) {
    const currentNetMargin = metrics.netIncome / revenue;
    const targetNetMargin = benchmarks.netProfitMargin_p75;
    revenueOpportunity = Math.max(0, (targetNetMargin - currentNetMargin) * revenue);
  }

  // COGS opportunity (if COGS ratio reaches 25th percentile - lower is better)
  let cogsOpportunity = 0;
  if (percentiles.cogsPercentile < 75) {
    const currentCogsRatio = metrics.costOfGoodsSold / revenue;
    const targetCogsRatio = benchmarks.cogsRatio_p25; // Lower is better
    cogsOpportunity = Math.max(0, (currentCogsRatio - targetCogsRatio) * revenue);
  }

  // Labor opportunity (if labor ratio reaches 25th percentile)
  let laborOpportunity = 0;
  if (metrics.wages && percentiles.laborCostPercentile < 75) {
    const currentLaborRatio = metrics.wages / revenue;
    const targetLaborRatio = benchmarks.laborCostRatio_p25;
    laborOpportunity = Math.max(0, (currentLaborRatio - targetLaborRatio) * revenue);
  }

  // Pension opportunity (tax savings from maximizing contributions)
  let pensionOpportunity = 0;
  const currentPension = metrics.pensionContributions || 0;
  const maxAffordablePension = Math.min(
    MAX_PENSION_CONTRIBUTION,
    Math.max(0, metrics.netIncome * 0.5) // Cap at 50% of net income
  );
  if (currentPension < maxAffordablePension) {
    const additionalPension = maxAffordablePension - currentPension;
    pensionOpportunity = additionalPension * ASSUMED_TAX_RATE;
  }

  const totalOpportunity = revenueOpportunity + cogsOpportunity + laborOpportunity + pensionOpportunity;

  return {
    revenueOpportunity: Math.round(revenueOpportunity),
    cogsOpportunity: Math.round(cogsOpportunity),
    laborOpportunity: Math.round(laborOpportunity),
    pensionOpportunity: Math.round(pensionOpportunity),
    totalOpportunity: Math.round(totalOpportunity),
  };
}

// ============================================
// 5-YEAR PROJECTIONS
// ============================================

/**
 * Generate 5-year "Without" scenario (status quo)
 */
export function generateWithoutScenario(
  metrics: BusinessMetrics,
  growthRate: number = 0.03 // 3% default growth
): YearProjection[] {
  const projections: YearProjection[] = [];
  let cumulativeValue = 0;

  for (let year = 1; year <= 5; year++) {
    const growthFactor = Math.pow(1 + growthRate, year);
    const revenue = metrics.revenue * growthFactor;
    const cogs = metrics.costOfGoodsSold * growthFactor;
    const grossProfit = revenue - cogs;

    // Assume expenses grow proportionally, keeping same net margin
    const netMargin = metrics.netIncome / (metrics.revenue || 1);
    const netIncome = revenue * netMargin;

    const pension = (metrics.pensionContributions || 0) * growthFactor;
    const taxSavings = pension * ASSUMED_TAX_RATE;

    cumulativeValue += netIncome + taxSavings;

    projections.push({
      year,
      revenue: Math.round(revenue),
      cogs: Math.round(cogs),
      grossProfit: Math.round(grossProfit),
      netIncome: Math.round(netIncome),
      pension: Math.round(pension),
      taxSavings: Math.round(taxSavings),
      cumulativeValue: Math.round(cumulativeValue),
    });
  }

  return projections;
}

/**
 * Generate 5-year "With" scenario (with improvements)
 */
export function generateWithScenario(
  metrics: BusinessMetrics,
  benchmarks: IndustryBenchmarks,
  options: {
    growthRate?: number;
    priceIncrease?: number;     // e.g., 0.10 = 10% price increase
    cogsReduction?: number;     // e.g., 0.05 = 5% COGS reduction
    pensionTarget?: number;     // Target pension contribution
  } = {}
): YearProjection[] {
  const {
    growthRate = 0.05,          // 5% growth with improvements
    priceIncrease = 0.10,       // 10% price increase
    cogsReduction = 0.05,       // 5% COGS reduction
    pensionTarget,
  } = options;

  const projections: YearProjection[] = [];
  let cumulativeValue = 0;

  // Calculate target pension
  const targetPension = pensionTarget ?? Math.min(
    MAX_PENSION_CONTRIBUTION,
    Math.max(0, metrics.netIncome * 0.25) // 25% of current net income as target
  );

  // Year 1: Apply immediate improvements
  const year1Revenue = metrics.revenue * (1 + priceIncrease);
  const year1Cogs = metrics.costOfGoodsSold * (1 - cogsReduction);

  for (let year = 1; year <= 5; year++) {
    const yearGrowth = Math.pow(1 + growthRate, year - 1);

    // Revenue: base + price increase, then grow
    const revenue = year1Revenue * yearGrowth;

    // COGS: reduced base, then grow (but slower than revenue due to efficiency)
    const cogs = year1Cogs * Math.pow(1 + growthRate * 0.8, year - 1);

    const grossProfit = revenue - cogs;

    // Net income improves more due to operating leverage
    const baseNetIncome = metrics.netIncome + (year1Revenue - metrics.revenue) + (metrics.costOfGoodsSold - year1Cogs);
    const netIncome = baseNetIncome * yearGrowth;

    // Pension ramps up over 3 years
    const pensionRampUp = Math.min(1, year / 3);
    const pension = targetPension * pensionRampUp;
    const taxSavings = pension * ASSUMED_TAX_RATE;

    cumulativeValue += netIncome + taxSavings;

    projections.push({
      year,
      revenue: Math.round(revenue),
      cogs: Math.round(cogs),
      grossProfit: Math.round(grossProfit),
      netIncome: Math.round(netIncome),
      pension: Math.round(pension),
      taxSavings: Math.round(taxSavings),
      cumulativeValue: Math.round(cumulativeValue),
    });
  }

  return projections;
}

// ============================================
// INSIGHT GENERATION
// ============================================

/**
 * Generate actionable insights based on calibration results
 */
export function generateInsights(
  metrics: BusinessMetrics,
  benchmarks: IndustryBenchmarks,
  percentiles: PercentileScores,
  healthScore: number
): Insight[] {
  const insights: Insight[] = [];
  const revenue = metrics.revenue || 1;

  // Net Profit insights
  if (percentiles.netProfitPercentile >= 75) {
    insights.push({
      type: 'success',
      category: 'Profitability',
      title: 'Top-Tier Profitability',
      description: 'Your net profit margin is in the top 25% of your industry peers.',
      percentile: percentiles.netProfitPercentile,
    });
  } else if (percentiles.netProfitPercentile < 25) {
    const netMargin = metrics.netIncome / revenue;
    const targetMargin = benchmarks.netProfitMargin_p50;
    const gapDollars = (targetMargin - netMargin) * revenue;
    insights.push({
      type: 'critical',
      category: 'Profitability',
      title: 'Below-Average Net Profit',
      description: `Your net margin is in the bottom 25%. Reaching the median could add $${Math.round(gapDollars).toLocaleString()} annually.`,
      value: gapDollars,
      percentile: percentiles.netProfitPercentile,
    });
  }

  // COGS insights
  if (percentiles.cogsPercentile >= 75) {
    insights.push({
      type: 'success',
      category: 'Cost Efficiency',
      title: 'Excellent Cost Control',
      description: 'Your cost of goods sold is better than 75% of peers.',
      percentile: percentiles.cogsPercentile,
    });
  } else if (percentiles.cogsPercentile < 40) {
    const cogsRatio = metrics.costOfGoodsSold / revenue;
    const targetRatio = benchmarks.cogsRatio_p50;
    const savingsDollars = (cogsRatio - targetRatio) * revenue;
    insights.push({
      type: 'opportunity',
      category: 'Cost Efficiency',
      title: 'COGS Optimization Opportunity',
      description: `Bringing COGS to the median could save $${Math.round(savingsDollars).toLocaleString()} per year.`,
      value: savingsDollars,
      percentile: percentiles.cogsPercentile,
    });
  }

  // Pension/Tax Planning insights
  if (percentiles.pensionPercentile < 25) {
    const currentPension = metrics.pensionContributions || 0;
    const affordablePension = Math.min(MAX_PENSION_CONTRIBUTION, Math.max(0, metrics.netIncome * 0.3));
    const additionalContribution = affordablePension - currentPension;
    const taxSavings = additionalContribution * ASSUMED_TAX_RATE;

    if (additionalContribution > 5000) {
      insights.push({
        type: 'opportunity',
        category: 'Tax Planning',
        title: 'Pension Contribution Opportunity',
        description: `Contributing $${Math.round(additionalContribution).toLocaleString()} to a Solo 401(k) could save $${Math.round(taxSavings).toLocaleString()} in taxes.`,
        value: taxSavings,
        percentile: percentiles.pensionPercentile,
      });
    }
  }

  // Liquidity insights
  if (percentiles.currentRatioPercentile < 25) {
    insights.push({
      type: 'warning',
      category: 'Liquidity',
      title: 'Low Liquidity Warning',
      description: 'Your current ratio is in the bottom 25%. Consider building cash reserves.',
      percentile: percentiles.currentRatioPercentile,
    });
  }

  // Leverage insights
  if (percentiles.debtToEquityPercentile < 25) {
    insights.push({
      type: 'warning',
      category: 'Leverage',
      title: 'High Debt Levels',
      description: 'Your debt-to-equity ratio is high compared to peers. Consider debt reduction strategies.',
      percentile: percentiles.debtToEquityPercentile,
    });
  }

  // Overall health insight
  if (healthScore >= 80) {
    insights.unshift({
      type: 'success',
      category: 'Overall Health',
      title: 'Excellent Financial Health',
      description: 'Your business is performing better than most peers across key metrics.',
      value: healthScore,
    });
  } else if (healthScore < 40) {
    insights.unshift({
      type: 'critical',
      category: 'Overall Health',
      title: 'Financial Health Needs Attention',
      description: 'Multiple areas need improvement. Focus on the highest-impact opportunities first.',
      value: healthScore,
    });
  }

  return insights;
}

// ============================================
// MAIN CALIBRATION FUNCTION
// ============================================

/**
 * Perform full calibration analysis for a business
 */
export function calibrateBusiness(
  metrics: BusinessMetrics,
  benchmarks: IndustryBenchmarks,
  previousMetrics?: BusinessMetrics
): CalibrationResult {
  // 1. Determine revenue tier
  const revenueTier = determineRevenueTier(metrics.revenue);

  // 2. Calculate percentile scores
  const percentileScores = calculatePercentileScores(metrics, benchmarks);

  // 3. Calculate health score
  const healthScore = calculateHealthScore(percentileScores);

  // 4. Determine health trend
  const healthTrend = determineHealthTrend(metrics, previousMetrics);

  // 5. Calculate opportunities
  const opportunities = calculateOpportunities(metrics, benchmarks, percentileScores);

  // 6. Generate projections
  const withoutScenario = generateWithoutScenario(metrics);
  const withScenario = generateWithScenario(metrics, benchmarks);

  // 7. Generate insights
  const insights = generateInsights(metrics, benchmarks, percentileScores, healthScore);

  return {
    revenueTier,
    percentileScores,
    healthScore,
    healthTrend,
    opportunities,
    withoutScenario,
    withScenario,
    insights,
  };
}
