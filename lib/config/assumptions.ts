/**
 * Financial calculation assumptions
 * These values can be adjusted based on business requirements
 */

// Life Insurance Calculation Assumptions
export const LIFE_INSURANCE = {
  // Income replacement multiplier (years of income to replace)
  INCOME_REPLACEMENT_YEARS: 10,

  // Education cost per dependent
  EDUCATION_COST_PER_DEPENDENT: 50000,

  // Final expenses (funeral, medical, legal)
  FINAL_EXPENSES: 25000,

  // Emergency fund months of expenses
  EMERGENCY_FUND_MONTHS: 6,
};

// Disability Insurance Assumptions
export const DISABILITY_INSURANCE = {
  // Percentage of income to replace
  INCOME_REPLACEMENT_PERCENTAGE: 0.6, // 60%

  // Standard benefit period in years
  BENEFIT_PERIOD_YEARS: 5,
};

// Long-term Care Assumptions
export const LONG_TERM_CARE = {
  // Average daily cost of care
  DAILY_CARE_COST: 250,

  // Standard coverage period in years
  COVERAGE_YEARS: 3,

  // Days per year
  DAYS_PER_YEAR: 365,
};

// Premium Calculation Assumptions
export const PREMIUM_RATES = {
  // Life insurance rate per $1000 of coverage (monthly)
  LIFE_RATE_PER_THOUSAND: 0.50,

  // Disability insurance as percentage of monthly benefit
  DISABILITY_RATE_PERCENTAGE: 0.02, // 2%

  // Long-term care rate per $1000 of coverage (monthly)
  LTC_RATE_PER_THOUSAND: 0.75,
};

// Retirement Calculation Assumptions
export const RETIREMENT = {
  // Expected annual investment return
  ANNUAL_RETURN_RATE: 0.07, // 7%

  // Safe withdrawal rate in retirement
  SAFE_WITHDRAWAL_RATE: 0.04, // 4%

  // Social Security replacement percentage
  SOCIAL_SECURITY_REPLACEMENT: 0.30, // 30%
};

// Agent Projection Assumptions
export const AGENT_PROJECTIONS = {
  // Base commission rate for insurance sales
  BASE_COMMISSION_RATE: 0.50, // 50%

  // Average policy premium
  AVERAGE_POLICY_PREMIUM: 2000,

  // Policies sold per year progression
  POLICIES_YEAR_1: 24,
  POLICIES_YEAR_3: 48,
  POLICIES_YEAR_5: 72,

  // Renewal commission rate
  RENEWAL_RATE: 0.10, // 10%

  // Client retention rate
  RETENTION_RATE: 0.85, // 85%

  // Years for lifetime value calculation
  LIFETIME_YEARS: 20,

  // Conversion rate from prospect to agent
  PROSPECT_TO_AGENT_CONVERSION: 0.05, // 5%

  // Team building bonus multiplier
  TEAM_BONUS_MULTIPLIER: 0.15, // 15%
};

// Risk Assessment Thresholds
export const RISK_THRESHOLDS = {
  // Net worth threshold for high risk tolerance suggestion
  HIGH_RISK_NET_WORTH: 500000,

  // Age threshold for conservative recommendation
  CONSERVATIVE_AGE: 55,

  // Debt-to-income ratio threshold for concern
  HIGH_DEBT_RATIO: 0.40, // 40%
};
