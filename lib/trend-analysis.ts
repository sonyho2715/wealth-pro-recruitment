/**
 * Trend Analysis Module
 * Analyzes multi-year business financial data for patterns, growth rates,
 * and predictive insights
 */

export interface YearlyFinancialData {
  taxYear: number;
  netReceipts: number;
  costOfGoodsSold: number;
  grossProfit: number;
  totalDeductions: number;
  netIncome: number;
  pensionContributions: number;
}

export interface TrendAnalysis {
  // Core metrics
  revenueCAGR: number;           // Compound Annual Growth Rate
  profitCAGR: number;
  avgGrossMargin: number;
  avgNetMargin: number;

  // Volatility measures
  revenueVolatility: number;     // Standard deviation / mean
  profitVolatility: number;

  // Trend direction
  revenueTrend: TrendDirection;
  profitTrend: TrendDirection;
  marginTrend: TrendDirection;

  // Year-over-year changes
  yoyChanges: YoYChange[];

  // Projections
  nextYearRevenue: number;
  nextYearProfit: number;
  confidenceBand: {
    low: number;
    high: number;
  };

  // Health indicators
  consistency: 'HIGH' | 'MEDIUM' | 'LOW';
  growthPhase: 'ACCELERATING' | 'STEADY' | 'DECELERATING' | 'DECLINING';

  // Insights
  insights: TrendInsight[];
}

export type TrendDirection = 'UP' | 'STABLE' | 'DOWN';

export interface YoYChange {
  year: number;
  previousYear: number;
  revenueChange: number;
  revenueChangePercent: number;
  profitChange: number;
  profitChangePercent: number;
  grossMargin: number;
  netMargin: number;
}

export interface TrendInsight {
  type: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  category: 'REVENUE' | 'PROFIT' | 'MARGIN' | 'VOLATILITY' | 'GROWTH';
  title: string;
  description: string;
  metric?: string;
}

/**
 * Analyze multi-year trend data
 */
export function analyzeMultiYearTrend(
  yearlyData: YearlyFinancialData[]
): TrendAnalysis | null {
  if (yearlyData.length < 2) {
    return null; // Need at least 2 years for trend analysis
  }

  // Sort by year ascending
  const sortedData = [...yearlyData].sort((a, b) => a.taxYear - b.taxYear);

  // Calculate CAGR
  const revenueCAGR = calculateCAGR(
    sortedData[0].netReceipts,
    sortedData[sortedData.length - 1].netReceipts,
    sortedData.length - 1
  );

  const profitCAGR = calculateCAGR(
    Math.abs(sortedData[0].netIncome) || 1,
    Math.abs(sortedData[sortedData.length - 1].netIncome) || 1,
    sortedData.length - 1
  );

  // Calculate averages
  const avgGrossMargin = calculateAverage(
    sortedData.map(d => d.netReceipts > 0 ? d.grossProfit / d.netReceipts : 0)
  );

  const avgNetMargin = calculateAverage(
    sortedData.map(d => d.netReceipts > 0 ? d.netIncome / d.netReceipts : 0)
  );

  // Calculate volatility
  const revenues = sortedData.map(d => d.netReceipts);
  const profits = sortedData.map(d => d.netIncome);

  const revenueVolatility = calculateVolatility(revenues);
  const profitVolatility = calculateVolatility(profits);

  // Determine trends
  const revenueTrend = determineTrend(revenues);
  const profitTrend = determineTrend(profits);
  const margins = sortedData.map(d => d.netReceipts > 0 ? d.netIncome / d.netReceipts : 0);
  const marginTrend = determineTrend(margins);

  // Calculate YoY changes
  const yoyChanges = calculateYoYChanges(sortedData);

  // Project next year
  const { nextYearRevenue, nextYearProfit, confidenceBand } = projectNextYear(
    sortedData,
    revenueCAGR,
    profitCAGR,
    revenueVolatility
  );

  // Assess consistency
  const consistency = assessConsistency(revenueVolatility, profitVolatility);

  // Determine growth phase
  const growthPhase = determineGrowthPhase(yoyChanges, revenueCAGR);

  // Generate insights
  const insights = generateInsights(
    sortedData,
    revenueCAGR,
    profitCAGR,
    avgGrossMargin,
    avgNetMargin,
    revenueVolatility,
    growthPhase
  );

  return {
    revenueCAGR,
    profitCAGR,
    avgGrossMargin,
    avgNetMargin,
    revenueVolatility,
    profitVolatility,
    revenueTrend,
    profitTrend,
    marginTrend,
    yoyChanges,
    nextYearRevenue,
    nextYearProfit,
    confidenceBand,
    consistency,
    growthPhase,
    insights,
  };
}

/**
 * Calculate Compound Annual Growth Rate
 */
function calculateCAGR(
  startValue: number,
  endValue: number,
  years: number
): number {
  if (startValue <= 0 || endValue <= 0 || years <= 0) {
    return 0;
  }
  return Math.pow(endValue / startValue, 1 / years) - 1;
}

/**
 * Calculate average of an array
 */
function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = calculateAverage(values);
  const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
  return Math.sqrt(squaredDiffs.reduce((sum, v) => sum + v, 0) / (values.length - 1));
}

/**
 * Calculate coefficient of variation (volatility)
 */
function calculateVolatility(values: number[]): number {
  const avg = calculateAverage(values);
  if (avg === 0) return 0;
  return calculateStdDev(values) / Math.abs(avg);
}

/**
 * Determine trend direction using linear regression slope
 */
function determineTrend(values: number[]): TrendDirection {
  if (values.length < 2) return 'STABLE';

  // Simple linear regression
  const n = values.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * values[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Normalize slope relative to average
  const avgValue = sumY / n;
  const normalizedSlope = avgValue !== 0 ? slope / Math.abs(avgValue) : 0;

  if (normalizedSlope > 0.05) return 'UP';
  if (normalizedSlope < -0.05) return 'DOWN';
  return 'STABLE';
}

/**
 * Calculate year-over-year changes
 */
function calculateYoYChanges(data: YearlyFinancialData[]): YoYChange[] {
  const changes: YoYChange[] = [];

  for (let i = 1; i < data.length; i++) {
    const current = data[i];
    const previous = data[i - 1];

    const revenueChange = current.netReceipts - previous.netReceipts;
    const revenueChangePercent = previous.netReceipts !== 0
      ? revenueChange / previous.netReceipts
      : 0;

    const profitChange = current.netIncome - previous.netIncome;
    const profitChangePercent = previous.netIncome !== 0
      ? profitChange / previous.netIncome
      : 0;

    const grossMargin = current.netReceipts > 0
      ? current.grossProfit / current.netReceipts
      : 0;

    const netMargin = current.netReceipts > 0
      ? current.netIncome / current.netReceipts
      : 0;

    changes.push({
      year: current.taxYear,
      previousYear: previous.taxYear,
      revenueChange,
      revenueChangePercent,
      profitChange,
      profitChangePercent,
      grossMargin,
      netMargin,
    });
  }

  return changes;
}

/**
 * Project next year values
 */
function projectNextYear(
  data: YearlyFinancialData[],
  revenueCAGR: number,
  profitCAGR: number,
  volatility: number
): {
  nextYearRevenue: number;
  nextYearProfit: number;
  confidenceBand: { low: number; high: number };
} {
  const lastYear = data[data.length - 1];

  // Project using CAGR
  const nextYearRevenue = lastYear.netReceipts * (1 + revenueCAGR);
  const nextYearProfit = lastYear.netIncome * (1 + profitCAGR);

  // Calculate confidence band based on volatility (95% confidence)
  const zScore = 1.96;
  const margin = nextYearRevenue * volatility * zScore;

  return {
    nextYearRevenue: Math.max(0, nextYearRevenue),
    nextYearProfit,
    confidenceBand: {
      low: Math.max(0, nextYearRevenue - margin),
      high: nextYearRevenue + margin,
    },
  };
}

/**
 * Assess consistency of financial performance
 */
function assessConsistency(
  revenueVolatility: number,
  profitVolatility: number
): 'HIGH' | 'MEDIUM' | 'LOW' {
  const avgVolatility = (revenueVolatility + profitVolatility) / 2;

  if (avgVolatility < 0.15) return 'HIGH';
  if (avgVolatility < 0.30) return 'MEDIUM';
  return 'LOW';
}

/**
 * Determine growth phase
 */
function determineGrowthPhase(
  yoyChanges: YoYChange[],
  revenueCAGR: number
): 'ACCELERATING' | 'STEADY' | 'DECELERATING' | 'DECLINING' {
  if (yoyChanges.length < 2) {
    return revenueCAGR > 0.05 ? 'STEADY' : revenueCAGR < -0.05 ? 'DECLINING' : 'STEADY';
  }

  // Compare recent growth to earlier growth
  const recentGrowth = yoyChanges[yoyChanges.length - 1].revenueChangePercent;
  const earlierGrowth = yoyChanges[0].revenueChangePercent;

  if (revenueCAGR < -0.05) return 'DECLINING';
  if (recentGrowth > earlierGrowth + 0.05) return 'ACCELERATING';
  if (recentGrowth < earlierGrowth - 0.05) return 'DECELERATING';
  return 'STEADY';
}

/**
 * Generate trend insights
 */
function generateInsights(
  data: YearlyFinancialData[],
  revenueCAGR: number,
  profitCAGR: number,
  avgGrossMargin: number,
  avgNetMargin: number,
  revenueVolatility: number,
  growthPhase: string
): TrendInsight[] {
  const insights: TrendInsight[] = [];

  // Revenue growth insight
  if (revenueCAGR > 0.15) {
    insights.push({
      type: 'POSITIVE',
      category: 'REVENUE',
      title: 'Strong Revenue Growth',
      description: `Revenue has grown at ${(revenueCAGR * 100).toFixed(1)}% annually, significantly above average small business growth.`,
      metric: `${(revenueCAGR * 100).toFixed(1)}% CAGR`,
    });
  } else if (revenueCAGR > 0.05) {
    insights.push({
      type: 'POSITIVE',
      category: 'REVENUE',
      title: 'Healthy Revenue Growth',
      description: `Revenue has grown at ${(revenueCAGR * 100).toFixed(1)}% annually, indicating stable business growth.`,
      metric: `${(revenueCAGR * 100).toFixed(1)}% CAGR`,
    });
  } else if (revenueCAGR < -0.05) {
    insights.push({
      type: 'NEGATIVE',
      category: 'REVENUE',
      title: 'Revenue Decline',
      description: `Revenue has declined ${(Math.abs(revenueCAGR) * 100).toFixed(1)}% annually. Review pricing, market position, and growth strategies.`,
      metric: `${(revenueCAGR * 100).toFixed(1)}% CAGR`,
    });
  }

  // Profit margin insight
  if (avgNetMargin > 0.15) {
    insights.push({
      type: 'POSITIVE',
      category: 'MARGIN',
      title: 'Excellent Profit Margins',
      description: `Average net margin of ${(avgNetMargin * 100).toFixed(1)}% indicates strong profitability and pricing power.`,
      metric: `${(avgNetMargin * 100).toFixed(1)}% avg net margin`,
    });
  } else if (avgNetMargin < 0.05 && avgNetMargin > 0) {
    insights.push({
      type: 'NEGATIVE',
      category: 'MARGIN',
      title: 'Thin Profit Margins',
      description: `Average net margin of ${(avgNetMargin * 100).toFixed(1)}% leaves little room for error. Consider cost reduction or pricing strategies.`,
      metric: `${(avgNetMargin * 100).toFixed(1)}% avg net margin`,
    });
  }

  // Volatility insight
  if (revenueVolatility > 0.25) {
    insights.push({
      type: 'NEGATIVE',
      category: 'VOLATILITY',
      title: 'High Revenue Volatility',
      description: 'Revenue fluctuates significantly year-to-year. Consider diversifying revenue streams or securing recurring revenue.',
      metric: `${(revenueVolatility * 100).toFixed(0)}% coefficient of variation`,
    });
  } else if (revenueVolatility < 0.10) {
    insights.push({
      type: 'POSITIVE',
      category: 'VOLATILITY',
      title: 'Stable Revenue Pattern',
      description: 'Revenue is highly consistent year-over-year, indicating predictable cash flows and lower risk profile.',
      metric: `${(revenueVolatility * 100).toFixed(0)}% coefficient of variation`,
    });
  }

  // Growth phase insight
  if (growthPhase === 'ACCELERATING') {
    insights.push({
      type: 'POSITIVE',
      category: 'GROWTH',
      title: 'Accelerating Growth',
      description: 'Growth rate is increasing, suggesting successful expansion or market penetration strategies.',
    });
  } else if (growthPhase === 'DECELERATING') {
    insights.push({
      type: 'NEUTRAL',
      category: 'GROWTH',
      title: 'Maturing Business',
      description: 'Growth rate is slowing, which is natural for maturing businesses. Consider new markets or product lines.',
    });
  }

  // Pension contribution trend
  const pensionData = data.filter(d => d.pensionContributions > 0);
  if (pensionData.length > 0) {
    const avgPension = calculateAverage(pensionData.map(d => d.pensionContributions));
    const avgPensionRate = calculateAverage(
      pensionData.map(d => d.netReceipts > 0 ? d.pensionContributions / d.netReceipts : 0)
    );

    if (avgPensionRate < 0.02) {
      insights.push({
        type: 'NEGATIVE',
        category: 'MARGIN', // Using margin as proxy for retirement planning
        title: 'Low Retirement Contributions',
        description: `Average pension contribution rate of ${(avgPensionRate * 100).toFixed(1)}% of revenue may indicate missed tax savings opportunities.`,
        metric: `$${avgPension.toLocaleString()} avg annual`,
      });
    }
  } else {
    insights.push({
      type: 'NEGATIVE',
      category: 'MARGIN',
      title: 'No Retirement Plan Detected',
      description: 'No pension contributions found in historical data. Significant tax savings opportunity available.',
    });
  }

  return insights;
}

/**
 * Get trend direction label
 */
export function getTrendLabel(trend: TrendDirection): string {
  const labels: Record<TrendDirection, string> = {
    UP: 'Increasing',
    STABLE: 'Stable',
    DOWN: 'Decreasing',
  };
  return labels[trend];
}

/**
 * Get trend direction icon
 */
export function getTrendIcon(trend: TrendDirection): string {
  const icons: Record<TrendDirection, string> = {
    UP: 'TrendingUp',
    STABLE: 'Minus',
    DOWN: 'TrendingDown',
  };
  return icons[trend];
}

/**
 * Get trend direction color
 */
export function getTrendColor(trend: TrendDirection): string {
  const colors: Record<TrendDirection, string> = {
    UP: 'text-green-600',
    STABLE: 'text-gray-600',
    DOWN: 'text-red-600',
  };
  return colors[trend];
}

/**
 * Get growth phase badge
 */
export function getGrowthPhaseBadge(phase: string): {
  color: string;
  label: string;
} {
  const badges: Record<string, { color: string; label: string }> = {
    ACCELERATING: { color: 'bg-green-100 text-green-800', label: 'Accelerating' },
    STEADY: { color: 'bg-blue-100 text-blue-800', label: 'Steady Growth' },
    DECELERATING: { color: 'bg-yellow-100 text-yellow-800', label: 'Maturing' },
    DECLINING: { color: 'bg-red-100 text-red-800', label: 'Declining' },
  };
  return badges[phase] || { color: 'bg-gray-100 text-gray-800', label: phase };
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(decimals)}%`;
}

/**
 * Get consistency badge
 */
export function getConsistencyBadge(consistency: 'HIGH' | 'MEDIUM' | 'LOW'): {
  color: string;
  label: string;
} {
  const badges: Record<string, { color: string; label: string }> = {
    HIGH: { color: 'bg-green-100 text-green-800', label: 'Highly Consistent' },
    MEDIUM: { color: 'bg-yellow-100 text-yellow-800', label: 'Moderately Consistent' },
    LOW: { color: 'bg-red-100 text-red-800', label: 'Volatile' },
  };
  return badges[consistency];
}
