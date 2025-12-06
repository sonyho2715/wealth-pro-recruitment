/**
 * Unified Configuration for Financial Calculations
 * All calculation modules should import from here to ensure consistency
 */

// Insurance Agent Income Assumptions
export const AGENT_ASSUMPTIONS = {
  // Policy Metrics
  averagePolicyPremium: 1800,      // Conservative average annual premium
  policiesPerClient: 1.3,          // Average policies placed per client

  // Commission Structure
  firstYearCommissionRate: 0.55,   // 55% first-year commission (industry standard)
  renewalCommissionRate: 0.05,     // 5% renewal commission (conservative)

  // Retention & Growth
  clientRetentionRate: 0.85,       // 85% client retention year-over-year
  annualGrowthFactor: 1.12,        // 12% annual productivity improvement

  // Conversion Metrics
  conversionRate: 0.12,            // 12% of contacts become clients (conservative)
  contactsPerHour: 3,              // Average contacts per hour of work
};

// Insurance Premium Estimation (for recommendations)
export const PREMIUM_ESTIMATES = {
  termLife: {
    basePremiumPer500K: 25,        // $25/month per $500K for age 35
    ageMultiplierRate: 0.035,      // 3.5% increase per year over 35
    baseAge: 35,
  },
  wholeLife: {
    premiumPer1K: 10,              // $10/month per $1K coverage
  },
  disability: {
    premiumRate: 0.025,            // 2.5% of monthly benefit
  },
  longTermCare: {
    basePremium: 125,              // Base monthly at age 45
    ageMultiplierRate: 12,         // $12 more per year over 45
    baseAge: 45,
  },
};

// Financial Planning Assumptions
export const FINANCIAL_ASSUMPTIONS = {
  // Investment Returns (real returns after inflation)
  nominalReturnRate: 0.07,         // 7% nominal return
  inflationRate: 0.025,            // 2.5% inflation
  realReturnRate: 0.045,           // ~4.5% real return

  // Retirement Planning
  incomeReplacementRate: 0.80,     // 80% income replacement needed
  retirementYears: 25,             // Plan for 25-year retirement
  safeWithdrawalRate: 0.04,        // 4% safe withdrawal rule

  // Salary Growth
  annualRaiseRate: 0.03,           // 3% annual salary increase

  // Savings Behavior
  agentIncomeSavingsRate: 0.30,    // Save 30% of agent income
  surplusSavingsRate: 0.30,        // Save 30% of monthly surplus (gap)
};

// Disability Insurance Assumptions
export const DISABILITY_ASSUMPTIONS = {
  incomeReplacementRate: 0.60,     // 60% income replacement (industry standard, tax-free)
};

// Insurance Needs (DIME Method)
export const DIME_ASSUMPTIONS = {
  incomeReplacementYears: 10,      // Replace income for 10 years
  educationFundPerDependent: 60000, // $60K per dependent for education
  finalExpenses: 25000,            // $25K final expenses
};

// Helper function to calculate commission per policy
export function getCommissionPerPolicy(): number {
  return AGENT_ASSUMPTIONS.averagePolicyPremium * AGENT_ASSUMPTIONS.firstYearCommissionRate;
}

// Helper function to calculate renewal commission per policy
export function getRenewalPerPolicy(): number {
  return AGENT_ASSUMPTIONS.averagePolicyPremium * AGENT_ASSUMPTIONS.renewalCommissionRate;
}
