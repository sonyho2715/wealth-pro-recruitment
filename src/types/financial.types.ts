/**
 * Core Financial Data Types
 */

export interface ClientData {
  // Personal Information
  name: string;
  age: number;
  dependents: number;
  spouseName?: string;
  spouseAge?: number;
  state?: 'Hawaii' | 'California' | 'Nevada' | 'Texas' | 'Florida' | 'New York';
  filingStatus?: 'single' | 'married-joint' | 'married-separate' | 'head-of-household';
  childrenAges?: number[]; // Ages of children (for college planning)

  // Income
  income: number;
  spouseIncome?: number;
  monthlyRetirementContribution?: number; // Monthly 401(k)/IRA contributions

  // Assets
  checking: number;
  savings: number;
  retirement401k: number;
  retirementIRA: number;
  brokerage: number;
  brokerageIsRetirement?: boolean; // If true, include brokerage in retirement projections
  collegeSavings529?: number; // Dedicated 529 college savings plan balance
  homeValue: number;
  otherAssets: number;
  lifeInsuranceCoverage: number;
  disabilityInsuranceCoverage: number;

  // Liabilities
  mortgage: number;
  studentLoans: number;
  carLoans: number;
  creditCards: number;
  otherDebts: number;

  // Detailed Debt Tracking (optional - for advanced debt payoff analysis)
  detailedDebts?: {
    mortgage?: { balance: number; apr: number; monthlyPayment: number; yearsRemaining?: number };
    creditCardDebts?: Array<{ name: string; balance: number; apr: number; minPayment: number }>;
    studentLoanDebts?: Array<{ name: string; balance: number; apr: number; minPayment: number }>;
    carLoanDebts?: Array<{ name: string; balance: number; apr: number; monthlyPayment: number }>;
    otherDebts?: Array<{ name: string; balance: number; apr: number; minPayment: number }>;
  };

  // Portfolio Allocation (for investment analysis)
  portfolio?: {
    stocksPercent?: number; // % in stocks/equity
    bondsPercent?: number; // % in bonds/fixed income
    cashPercent?: number; // % in cash/money market
    otherPercent?: number; // % in other (real estate, commodities, etc.)
    averageExpenseRatio?: number; // Average fund expense ratio (e.g., 0.5 for 0.5%)
  };

  // Financial Assumptions
  assumptions?: {
    inflationRate?: number; // Annual inflation (default 3%)
    investmentReturnRate?: number; // Expected investment return (default 7%)
    salaryGrowthRate?: number; // Expected salary growth (default 3%)
    socialSecurityStartAge?: number; // When to start SS (default 67)
    estimatedMonthlySS?: number; // Estimated monthly Social Security benefit
  };

  // Monthly Expenses
  monthlyHousing: number;
  monthlyTransportation: number;
  monthlyFood: number;
  monthlyUtilities: number;
  monthlyInsurance: number;
  monthlyEntertainment: number;
  monthlyOther: number;

  // Insurance Information
  hasLifeInsurance: boolean;
  hasDisabilityInsurance: boolean;
  hasUmbrellaPolicy: boolean;
  hasEstatePlan: boolean;

  // Financial Goals
  goals?: {
    retirementAge?: number;
    retirementIncome?: number; // Annual income desired in retirement
    emergencyFundMonths?: number; // Target months of expenses
    homeDownPayment?: number; // For future home or upgrade
    educationSavings?: number; // For children's education
    debtFreeDate?: string; // Target date to be debt-free (YYYY-MM-DD)
    netWorthTarget?: number; // Target net worth
    annualSavingsTarget?: number; // Annual savings goal
    majorPurchase?: {
      description?: string;
      amount?: number;
      targetDate?: string; // YYYY-MM-DD
    };
  };

  // Metadata
  savedDate?: string;
  lastModified?: string;
}

export interface FinancialMetrics {
  // Totals
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  totalIncome: number;
  totalMonthlyExpenses: number;
  annualExpenses: number;

  // Ratios
  debtToIncomeRatio: number;
  savingsRate: number;
  emergencyFundMonths: number;

  // Insurance Gaps
  lifeInsuranceGap: number;
  lifeInsuranceNeeded: number;
  disabilityInsuranceGap: number;
  disabilityInsuranceNeeded: number;

  // Financial Health Score (0-100)
  healthScore: number;
  healthScoreBreakdown: {
    protectionCoverage: number;
    savingsRate: number;
    emergencyFund: number;
    debtToIncome: number;
    netWorthGrowth: number;
  };

  // Goal Progress (0-100% for each goal)
  goalProgress?: {
    retirementReadiness?: number; // % ready for retirement
    emergencyFund?: number; // % of emergency fund goal met
    homeDownPayment?: number; // % of down payment saved
    educationSavings?: number; // % of education goal saved
    debtFreeProgress?: number; // % of debt paid off
    netWorthProgress?: number; // % of net worth target achieved
    savingsProgress?: number; // % of annual savings goal achieved
    majorPurchaseProgress?: number; // % of major purchase saved
  };

  // Enhanced Goal Metrics (monthly savings needed to achieve goals)
  goalMonthlySavings?: {
    emergencyFund?: number; // Monthly savings needed
    homeDownPayment?: number;
    educationSavings?: number;
    retirementShortfall?: number; // Monthly savings needed to close retirement gap
    majorPurchase?: number;
  };

  // Enhanced Retirement Metrics
  retirementAnalysis?: {
    projectedSavingsAtRetirement: number;
    savingsNeededAtRetirement: number;
    gap: number;
    monthlySavingsNeeded: number;
    estimatedSocialSecurity: number;
    inflationAdjustedIncome: number;
  };

  // Social Security Estimate
  socialSecurityEstimate?: {
    monthlyBenefit: number;
    annualBenefit: number;
    fullRetirementAge: number;
  };

  // Portfolio Analysis
  portfolioAnalysis?: {
    riskScore: number; // 0-100, higher = more aggressive
    expectedReturn: number; // Expected annual return %
    targetAllocation: string; // Recommended allocation
    rebalancingNeeded: boolean;
    allocationWarnings: string[];
  };

  // Debt Payoff Analysis
  debtPayoffAnalysis?: {
    totalInterestAvalanche: number; // Total interest with avalanche method
    totalInterestSnowball: number; // Total interest with snowball method
    savingsFromAvalanche: number; // How much saved using avalanche
    monthsToPayoffAvalanche: number;
    monthsToPayoffSnowball: number;
    recommendedMethod: 'avalanche' | 'snowball';
  };

  // College Planning
  collegePlanning?: {
    yearsUntilCollege: number;
    estimatedTotalCost: number; // 4-year total with inflation
    currentSavings: number;
    monthlySavingsNeeded: number;
    projectedShortfall: number;
  };

  // Action Items (top priority recommendations)
  actionItems?: Array<{
    priority: 'critical' | 'high' | 'medium';
    category: string;
    action: string;
    impact: string;
    deadline?: string;
  }>;

  // Monte Carlo Simulation Results
  monteCarloSimulation?: {
    successRate: number; // % of simulations where goals are met
    medianNetWorth: number; // Median outcome
    percentile10: number; // 10th percentile (worst case)
    percentile90: number; // 90th percentile (best case)
    yearsSimulated: number;
    simulationsRun: number;
  };

  // Tax Optimization Recommendations
  taxOptimization?: {
    currentTaxBill: number;
    optimizedTaxBill: number;
    potentialSavings: number;
    recommendations: Array<{
      strategy: string;
      estimatedSavings: number;
      difficulty: 'easy' | 'moderate' | 'complex';
      description: string;
    }>;
  };
}

export interface RiskAssessment {
  categories: {
    lifeInsurance: RiskCategory;
    disability: RiskCategory;
    emergency: RiskCategory;
    debt: RiskCategory;
    retirement: RiskCategory;
    estate: RiskCategory;
    liability: RiskCategory;
    savings: RiskCategory;
  };
  overallRiskScore: number; // 0-100, higher is riskier
  criticalGaps: string[];
}

export interface RiskCategory {
  name: string;
  score: number; // 0-100, higher is riskier
  status: 'critical' | 'warning' | 'good' | 'excellent';
  message: string;
  recommendations: string[];
}

export interface InsuranceProduct {
  id: string;
  type: 'life' | 'disability' | 'umbrella' | 'long-term-care';
  name: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedCost: {
    min: number;
    max: number;
    unit: 'month' | 'year';
  };
  coverageAmount?: number;
  features: string[];
  recommended: boolean;
  reason?: string;
}

export interface InsuranceQuote {
  productType: string;
  coverageAmount: number;
  term?: number; // For term life insurance
  monthlyPremium: number;
  annualPremium: number;
  waitingPeriod?: number; // For disability
  benefitPeriod?: string; // For disability
}

export interface ClientProfile {
  id: string;
  name: string;
  data: ClientData;
  metrics?: FinancialMetrics;
  risk?: RiskAssessment;
  savedDate: string;
  lastModified: string;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'full-report' | 'urgent-gap' | 'follow-up';
}
