/**
 * Quick Fix Calculator
 * Analyzes business financial data and generates actionable recommendations
 * with ROI calculations for immediate implementation
 */

export type QuickFixCategory =
  | 'PRICING'
  | 'COST_REDUCTION'
  | 'RETIREMENT_PLAN'
  | 'TAX_STRATEGY'
  | 'CASH_FLOW'
  | 'INSURANCE'
  | 'OTHER';

export type ImplementationTimeframe =
  | 'IMMEDIATE'
  | 'THIRTY_DAYS'
  | 'NINETY_DAYS'
  | 'SIX_MONTHS'
  | 'ONE_YEAR';

export type Complexity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface QuickFix {
  action: string;
  category: QuickFixCategory;
  currentValue: number;
  recommendedValue: number;
  annualImpact: number;
  implementation: ImplementationTimeframe;
  complexity: Complexity;
  requiredAction: string;
  priority: number;
}

export interface BusinessFinancialData {
  // Revenue & Profitability
  annualRevenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  netIncome: number;
  ownerSalary: number;
  ownerDistributions: number;

  // Balance Sheet
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  currentRatio: number;
  debtToEquityRatio: number;

  // Cash & Liquidity
  cashOnHand: number;
  accountsReceivable: number;
  inventory: number;
  accountsPayable: number;
  creditCards: number;
  lineOfCredit: number;

  // Insurance Coverage
  keyPersonInsurance: number;
  generalLiability: number;
  professionalLiability: number;
  businessInterruption: number;
  cyberLiability: number;
  buyerSellerAgreement: boolean;
  successionPlan: boolean;

  // Retirement Planning
  pensionContributions?: number;

  // Business Info
  employeeCount: number;
  yearsInBusiness: number;
  businessType: string;
}

export interface IndustryBenchmark {
  grossProfitMargin_p50: number;
  grossProfitMargin_p75: number;
  netProfitMargin_p50: number;
  netProfitMargin_p75: number;
  cogsRatio_p50: number;
  cogsRatio_p25: number; // Lower is better for COGS
  pensionContributionRate_p75: number;
}

// Default benchmarks when industry data is not available
const DEFAULT_BENCHMARKS: IndustryBenchmark = {
  grossProfitMargin_p50: 0.35,
  grossProfitMargin_p75: 0.45,
  netProfitMargin_p50: 0.10,
  netProfitMargin_p75: 0.15,
  cogsRatio_p50: 0.55,
  cogsRatio_p25: 0.45,
  pensionContributionRate_p75: 0.05,
};

/**
 * Calculate all applicable quick fixes for a business
 */
export function calculateQuickFixes(
  data: BusinessFinancialData,
  benchmarks: IndustryBenchmark = DEFAULT_BENCHMARKS
): QuickFix[] {
  const fixes: QuickFix[] = [];

  // 1. Pricing Optimization Analysis
  const pricingFix = analyzePricing(data, benchmarks);
  if (pricingFix) fixes.push(pricingFix);

  // 2. COGS Reduction Analysis
  const cogsFix = analyzeCOGS(data, benchmarks);
  if (cogsFix) fixes.push(cogsFix);

  // 3. Retirement Plan Optimization
  const retirementFix = analyzeRetirementPlan(data, benchmarks);
  if (retirementFix) fixes.push(retirementFix);

  // 4. Key Person Insurance Gap
  const keyPersonFix = analyzeKeyPersonInsurance(data);
  if (keyPersonFix) fixes.push(keyPersonFix);

  // 5. Business Interruption Insurance Gap
  const bizInterruptionFix = analyzeBusinessInterruption(data);
  if (bizInterruptionFix) fixes.push(bizInterruptionFix);

  // 6. Buy-Sell Agreement Gap
  const buySellFix = analyzeBuySellAgreement(data);
  if (buySellFix) fixes.push(buySellFix);

  // 7. Cash Flow Optimization
  const cashFlowFix = analyzeCashFlow(data);
  if (cashFlowFix) fixes.push(cashFlowFix);

  // 8. Debt Restructuring
  const debtFix = analyzeDebtStructure(data);
  if (debtFix) fixes.push(debtFix);

  // 9. AR Collection Improvement
  const arFix = analyzeAccountsReceivable(data);
  if (arFix) fixes.push(arFix);

  // 10. Cyber Insurance Gap
  const cyberFix = analyzeCyberInsurance(data);
  if (cyberFix) fixes.push(cyberFix);

  // Sort by priority (highest first) then by annual impact
  return fixes.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return b.annualImpact - a.annualImpact;
  });
}

/**
 * Analyze pricing opportunity
 */
function analyzePricing(
  data: BusinessFinancialData,
  benchmarks: IndustryBenchmark
): QuickFix | null {
  const currentGrossMargin = data.annualRevenue > 0
    ? data.grossProfit / data.annualRevenue
    : 0;

  const targetMargin = benchmarks.grossProfitMargin_p75;

  // Only suggest if current margin is below median
  if (currentGrossMargin >= benchmarks.grossProfitMargin_p50) {
    return null;
  }

  const marginGap = targetMargin - currentGrossMargin;
  const priceIncreaseNeeded = marginGap / (1 - currentGrossMargin);
  const annualImpact = data.annualRevenue * marginGap;

  // Calculate recommended price increase percentage
  const priceIncreasePercent = Math.min(priceIncreaseNeeded * 100, 15); // Cap at 15%

  if (priceIncreasePercent < 2) return null; // Too small to matter

  return {
    action: `Implement ${priceIncreasePercent.toFixed(1)}% price increase`,
    category: 'PRICING',
    currentValue: currentGrossMargin * 100,
    recommendedValue: targetMargin * 100,
    annualImpact: Math.round(annualImpact),
    implementation: 'THIRTY_DAYS',
    complexity: 'MEDIUM',
    requiredAction: `Review pricing strategy. Current gross margin is ${(currentGrossMargin * 100).toFixed(1)}% vs industry 75th percentile of ${(targetMargin * 100).toFixed(1)}%. Consider implementing tiered pricing, premium service options, or across-the-board adjustment of ${priceIncreasePercent.toFixed(1)}%.`,
    priority: annualImpact > 50000 ? 10 : annualImpact > 20000 ? 8 : 6,
  };
}

/**
 * Analyze COGS reduction opportunity
 */
function analyzeCOGS(
  data: BusinessFinancialData,
  benchmarks: IndustryBenchmark
): QuickFix | null {
  const currentCOGSRatio = data.annualRevenue > 0
    ? data.costOfGoodsSold / data.annualRevenue
    : 0;

  const targetRatio = benchmarks.cogsRatio_p25; // Lower is better

  // Only suggest if COGS ratio is above median
  if (currentCOGSRatio <= benchmarks.cogsRatio_p50) {
    return null;
  }

  const ratioGap = currentCOGSRatio - targetRatio;
  const annualSavings = data.annualRevenue * ratioGap;

  if (annualSavings < 5000) return null; // Too small

  const reductionPercent = (ratioGap / currentCOGSRatio) * 100;

  return {
    action: `Reduce COGS by ${reductionPercent.toFixed(1)}%`,
    category: 'COST_REDUCTION',
    currentValue: currentCOGSRatio * 100,
    recommendedValue: targetRatio * 100,
    annualImpact: Math.round(annualSavings),
    implementation: 'NINETY_DAYS',
    complexity: 'HIGH',
    requiredAction: `Current COGS ratio is ${(currentCOGSRatio * 100).toFixed(1)}% of revenue vs top quartile of ${(targetRatio * 100).toFixed(1)}%. Actions: 1) Renegotiate supplier contracts, 2) Evaluate inventory management, 3) Consider alternative suppliers, 4) Review waste and shrinkage.`,
    priority: annualSavings > 30000 ? 9 : annualSavings > 15000 ? 7 : 5,
  };
}

/**
 * Analyze retirement plan optimization
 */
function analyzeRetirementPlan(
  data: BusinessFinancialData,
  benchmarks: IndustryBenchmark
): QuickFix | null {
  const currentPensionRate = data.annualRevenue > 0
    ? (data.pensionContributions || 0) / data.annualRevenue
    : 0;

  const totalOwnerComp = data.ownerSalary + data.ownerDistributions;

  // Calculate max contribution limits (2024 limits)
  const maxSolo401k = Math.min(69000, totalOwnerComp * 0.25 + 23000);
  const maxSEPIRA = Math.min(69000, totalOwnerComp * 0.25);

  const currentContribution = data.pensionContributions || 0;
  const recommendedContribution = Math.min(maxSolo401k, totalOwnerComp * 0.20);

  // Only suggest if there's meaningful gap
  const gap = recommendedContribution - currentContribution;
  if (gap < 5000) return null;

  // Calculate tax savings (assume 30% combined tax rate)
  const taxSavings = gap * 0.30;

  return {
    action: `Maximize retirement contributions (+$${Math.round(gap).toLocaleString()}/year)`,
    category: 'RETIREMENT_PLAN',
    currentValue: currentContribution,
    recommendedValue: recommendedContribution,
    annualImpact: Math.round(taxSavings),
    implementation: 'IMMEDIATE',
    complexity: 'LOW',
    requiredAction: `Current retirement contributions: $${currentContribution.toLocaleString()}. Recommended: $${Math.round(recommendedContribution).toLocaleString()}. Consider Solo 401(k) (max $69K) or SEP-IRA (max 25% of comp). This generates approximately $${Math.round(taxSavings).toLocaleString()} in annual tax savings.`,
    priority: taxSavings > 15000 ? 10 : taxSavings > 8000 ? 8 : 6,
  };
}

/**
 * Analyze key person insurance gap
 */
function analyzeKeyPersonInsurance(data: BusinessFinancialData): QuickFix | null {
  const totalOwnerComp = data.ownerSalary + data.ownerDistributions;

  // Recommended: Greater of 2x revenue or 10x owner compensation
  const recommended = Math.max(
    data.annualRevenue * 2,
    totalOwnerComp * 10
  );

  const gap = recommended - data.keyPersonInsurance;

  if (gap < 100000) return null; // Small gap

  // Estimate premium (rough: $1 per $1000 coverage per year for healthy individual)
  const estimatedPremium = gap * 0.001;

  return {
    action: `Add $${(gap / 1000000).toFixed(1)}M key person insurance`,
    category: 'INSURANCE',
    currentValue: data.keyPersonInsurance,
    recommendedValue: recommended,
    annualImpact: gap, // Protection value, not savings
    implementation: 'THIRTY_DAYS',
    complexity: 'LOW',
    requiredAction: `Key person insurance gap: $${gap.toLocaleString()}. Current coverage: $${data.keyPersonInsurance.toLocaleString()}. Recommended based on 2x revenue or 10x owner comp. Estimated annual premium: $${Math.round(estimatedPremium).toLocaleString()}. Protects business continuity and loan covenants.`,
    priority: gap > 500000 ? 9 : gap > 250000 ? 7 : 5,
  };
}

/**
 * Analyze business interruption insurance
 */
function analyzeBusinessInterruption(data: BusinessFinancialData): QuickFix | null {
  // Recommended: 12 months of revenue coverage
  const recommended = data.annualRevenue;
  const gap = recommended - data.businessInterruption;

  if (gap < 50000 || data.businessInterruption > 0) return null;

  return {
    action: 'Add business interruption insurance',
    category: 'INSURANCE',
    currentValue: data.businessInterruption,
    recommendedValue: recommended,
    annualImpact: recommended, // Protection value
    implementation: 'THIRTY_DAYS',
    complexity: 'LOW',
    requiredAction: `No business interruption coverage detected. Recommend coverage for 12 months of revenue ($${data.annualRevenue.toLocaleString()}). Typical premium: 1-3% of coverage amount. Essential for disaster recovery and maintaining cash flow during disruptions.`,
    priority: 8,
  };
}

/**
 * Analyze buy-sell agreement
 */
function analyzeBuySellAgreement(data: BusinessFinancialData): QuickFix | null {
  if (data.buyerSellerAgreement) return null;

  // Only relevant for multi-owner businesses or succession planning
  const businessValue = Math.max(data.netWorth, data.annualRevenue * 2);

  if (businessValue < 100000) return null;

  return {
    action: 'Establish funded buy-sell agreement',
    category: 'INSURANCE',
    currentValue: 0,
    recommendedValue: businessValue,
    annualImpact: businessValue, // Protection value
    implementation: 'NINETY_DAYS',
    complexity: 'MEDIUM',
    requiredAction: `No buy-sell agreement in place. Business value estimated at $${businessValue.toLocaleString()}. Recommend establishing life insurance-funded buy-sell agreement to ensure business continuity and fair valuation for heirs. Coordinate with attorney for agreement and insurance agent for funding.`,
    priority: businessValue > 500000 ? 8 : 6,
  };
}

/**
 * Analyze cash flow optimization
 */
function analyzeCashFlow(data: BusinessFinancialData): QuickFix | null {
  // Calculate days of operating cash
  const dailyExpenses = (data.costOfGoodsSold + data.ownerSalary * 12) / 365;
  const cashDays = dailyExpenses > 0 ? data.cashOnHand / dailyExpenses : 0;

  // Recommend 90 days of operating cash
  const targetCashDays = 90;
  const targetCash = dailyExpenses * targetCashDays;

  if (cashDays >= 60) return null; // Adequate cash

  const cashGap = targetCash - data.cashOnHand;

  return {
    action: `Build ${Math.round(targetCashDays - cashDays)} more days of cash reserves`,
    category: 'CASH_FLOW',
    currentValue: Math.round(cashDays),
    recommendedValue: targetCashDays,
    annualImpact: Math.round(cashGap), // Amount needed
    implementation: 'SIX_MONTHS',
    complexity: 'MEDIUM',
    requiredAction: `Current cash reserves cover ${Math.round(cashDays)} days of operations. Target: 90 days ($${Math.round(targetCash).toLocaleString()}). Gap: $${Math.round(cashGap).toLocaleString()}. Consider: 1) Establishing cash reserve account, 2) Setting up business line of credit as backup, 3) Implementing cash sweep strategy.`,
    priority: cashDays < 30 ? 10 : cashDays < 45 ? 8 : 6,
  };
}

/**
 * Analyze debt structure
 */
function analyzeDebtStructure(data: BusinessFinancialData): QuickFix | null {
  // Check if high-interest debt exists
  const highInterestDebt = data.creditCards + (data.lineOfCredit * 0.5); // Assume LOC is partially used

  if (highInterestDebt < 10000) return null;

  // Estimate interest savings from refinancing (assume 18% credit card vs 8% term loan)
  const interestSavings = highInterestDebt * 0.10;

  return {
    action: `Refinance $${Math.round(highInterestDebt).toLocaleString()} of high-interest debt`,
    category: 'COST_REDUCTION',
    currentValue: highInterestDebt,
    recommendedValue: 0,
    annualImpact: Math.round(interestSavings),
    implementation: 'SIXTY_DAYS' as ImplementationTimeframe,
    complexity: 'MEDIUM',
    requiredAction: `High-interest debt identified: $${Math.round(highInterestDebt).toLocaleString()} in credit cards/lines of credit. Estimated annual interest savings from refinancing: $${Math.round(interestSavings).toLocaleString()}. Options: 1) SBA 7(a) loan (6-8%), 2) Bank term loan, 3) Equipment financing for secured debt.`,
    priority: interestSavings > 5000 ? 7 : 5,
  };
}

/**
 * Analyze accounts receivable
 */
function analyzeAccountsReceivable(data: BusinessFinancialData): QuickFix | null {
  if (data.accountsReceivable < 10000) return null;

  // Calculate AR days (assuming 30-day billing cycle)
  const arDays = data.annualRevenue > 0
    ? (data.accountsReceivable / data.annualRevenue) * 365
    : 0;

  if (arDays <= 30) return null; // Good AR management

  // Calculate cash freed by reducing to 30 days
  const targetAR = (data.annualRevenue / 365) * 30;
  const cashFreed = data.accountsReceivable - targetAR;

  // Opportunity cost of tied-up capital (assume 8% cost of capital)
  const opportunityCost = cashFreed * 0.08;

  return {
    action: `Reduce AR from ${Math.round(arDays)} to 30 days`,
    category: 'CASH_FLOW',
    currentValue: Math.round(arDays),
    recommendedValue: 30,
    annualImpact: Math.round(opportunityCost),
    implementation: 'NINETY_DAYS',
    complexity: 'MEDIUM',
    requiredAction: `Current AR days: ${Math.round(arDays)}. Target: 30 days. Cash tied up: $${Math.round(cashFreed).toLocaleString()}. Actions: 1) Implement invoice factoring or early payment discounts, 2) Tighten credit policies, 3) Use automated invoicing/collection, 4) Consider AR financing.`,
    priority: arDays > 60 ? 7 : 5,
  };
}

/**
 * Analyze cyber insurance
 */
function analyzeCyberInsurance(data: BusinessFinancialData): QuickFix | null {
  if (data.cyberLiability > 0) return null;

  // Recommend cyber insurance based on revenue
  const recommended = Math.min(data.annualRevenue, 1000000);

  // More relevant for businesses with digital operations
  if (data.annualRevenue < 100000) return null;

  return {
    action: 'Add cyber liability insurance',
    category: 'INSURANCE',
    currentValue: 0,
    recommendedValue: recommended,
    annualImpact: recommended, // Protection value
    implementation: 'THIRTY_DAYS',
    complexity: 'LOW',
    requiredAction: `No cyber liability coverage detected. Average data breach costs $200K+ for small businesses. Recommend $${(recommended / 1000).toFixed(0)}K coverage. Typical premium: $1,000-$3,000/year. Covers: data breaches, ransomware, business email compromise, regulatory fines.`,
    priority: 6,
  };
}

/**
 * Get summary statistics for quick fixes
 */
export function getQuickFixSummary(fixes: QuickFix[]): {
  totalAnnualImpact: number;
  immediateActions: number;
  byCategory: Record<QuickFixCategory, { count: number; impact: number }>;
  topPriority: QuickFix | null;
} {
  const byCategory: Record<QuickFixCategory, { count: number; impact: number }> = {
    PRICING: { count: 0, impact: 0 },
    COST_REDUCTION: { count: 0, impact: 0 },
    RETIREMENT_PLAN: { count: 0, impact: 0 },
    TAX_STRATEGY: { count: 0, impact: 0 },
    CASH_FLOW: { count: 0, impact: 0 },
    INSURANCE: { count: 0, impact: 0 },
    OTHER: { count: 0, impact: 0 },
  };

  let totalAnnualImpact = 0;
  let immediateActions = 0;

  for (const fix of fixes) {
    totalAnnualImpact += fix.annualImpact;
    byCategory[fix.category].count += 1;
    byCategory[fix.category].impact += fix.annualImpact;

    if (fix.implementation === 'IMMEDIATE' || fix.implementation === 'THIRTY_DAYS') {
      immediateActions += 1;
    }
  }

  return {
    totalAnnualImpact,
    immediateActions,
    byCategory,
    topPriority: fixes[0] || null,
  };
}

/**
 * Format currency for display
 */
export function formatImpact(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toFixed(0)}`;
}

/**
 * Get implementation timeline label
 */
export function getTimeframeLabel(timeframe: ImplementationTimeframe): string {
  const labels: Record<ImplementationTimeframe, string> = {
    IMMEDIATE: 'Immediate',
    THIRTY_DAYS: '30 Days',
    NINETY_DAYS: '90 Days',
    SIX_MONTHS: '6 Months',
    ONE_YEAR: '1 Year',
  };
  return labels[timeframe];
}

/**
 * Get complexity color class
 */
export function getComplexityColor(complexity: Complexity): string {
  const colors: Record<Complexity, string> = {
    LOW: 'text-green-600 bg-green-100',
    MEDIUM: 'text-yellow-600 bg-yellow-100',
    HIGH: 'text-red-600 bg-red-100',
  };
  return colors[complexity];
}

/**
 * Get category icon name (for lucide-react)
 */
export function getCategoryIcon(category: QuickFixCategory): string {
  const icons: Record<QuickFixCategory, string> = {
    PRICING: 'DollarSign',
    COST_REDUCTION: 'TrendingDown',
    RETIREMENT_PLAN: 'PiggyBank',
    TAX_STRATEGY: 'Calculator',
    CASH_FLOW: 'Banknote',
    INSURANCE: 'Shield',
    OTHER: 'Lightbulb',
  };
  return icons[category];
}
