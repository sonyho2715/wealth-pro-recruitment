import { z } from 'zod';

export const prospectSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

export const financialProfileSchema = z.object({
  // Income
  annualIncome: z.number().min(0, 'Income must be positive'),
  spouseIncome: z.number().min(0).optional(),
  otherIncome: z.number().min(0).optional(),

  // Monthly Expenses
  monthlyExpenses: z.number().min(0, 'Expenses must be positive'),
  housingCost: z.number().min(0),
  debtPayments: z.number().min(0),

  // Savings & Contributions
  monthlySavingsContribution: z.number().min(0).default(0),
  employer401kMatch: z.number().min(0).max(100).default(0),

  // Cash & Liquid Assets
  savings: z.number().min(0).default(0),
  emergencyFund: z.number().min(0).default(0),

  // Investment Accounts
  investments: z.number().min(0).default(0),
  hsaFsa: z.number().min(0).default(0),

  // Retirement Accounts
  retirement401k: z.number().min(0).default(0),
  rothIra: z.number().min(0).default(0),
  pensionValue: z.number().min(0).default(0),

  // Real Estate
  homeMarketValue: z.number().min(0).default(0),
  investmentProperty: z.number().min(0).default(0),

  // Business & Other Assets
  businessEquity: z.number().min(0).default(0),
  personalProperty: z.number().min(0).default(0),
  otherAssets: z.number().min(0).default(0),

  // Liabilities
  mortgage: z.number().min(0).default(0),
  carLoans: z.number().min(0).default(0),
  studentLoans: z.number().min(0).default(0),
  personalLoans: z.number().min(0).default(0),
  creditCards: z.number().min(0).default(0),
  taxesOwed: z.number().min(0).default(0),
  businessDebt: z.number().min(0).default(0),
  otherDebts: z.number().min(0).default(0),

  // Demographics
  age: z.number().min(18).max(100),
  spouseAge: z.number().min(18).max(100).optional(),
  dependents: z.number().min(0).default(0),
  retirementAge: z.number().min(50).max(80).default(65),
  occupation: z.string().optional(),
  spouseOccupation: z.string().optional(),
  stateOfResidence: z.string().optional(),

  // Protection & Insurance
  currentLifeInsurance: z.number().min(0).default(0),
  currentDisability: z.number().min(0).default(0),
  liabilityInsurance: z.number().min(0).default(0),
  hospitalDailyBenefit: z.number().min(0).default(0),
  spouseLifeInsurance: z.number().min(0).default(0),
  annualInsuranceCosts: z.number().min(0).default(0),
  hasWill: z.boolean().default(false),
  hasTrust: z.boolean().default(false),
});

export const agentProjectionSchema = z.object({
  hoursPerWeek: z.number().min(5).max(60).default(20),
  networkSize: z.number().min(10).max(1000).default(100),
});

export type ProspectInput = z.infer<typeof prospectSchema>;
export type FinancialProfileInput = z.infer<typeof financialProfileSchema>;
export type AgentProjectionInput = z.infer<typeof agentProjectionSchema>;
