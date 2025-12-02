import { Decimal } from '@prisma/client/runtime/library';

/**
 * Convert Prisma Decimal to JavaScript number
 * Handles null/undefined values gracefully
 */
export function decimalToNumber(value: Decimal | number | string | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  // Prisma Decimal
  return parseFloat(value.toString());
}

/**
 * Convert multiple Decimal fields in an object to numbers
 */
export function serializeDecimals<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };
  for (const field of fields) {
    if (field in result) {
      (result as Record<string, unknown>)[field as string] = decimalToNumber(
        result[field] as Decimal | number | null
      );
    }
  }
  return result;
}

/**
 * Serialize a financial profile from Prisma to plain numbers
 */
export interface SerializedFinancialProfile {
  id: string;
  prospectId: string;
  age: number;
  retirementAge: number;
  annualIncome: number;
  spouseIncome: number;
  otherIncome: number;
  monthlyExpenses: number;
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
  currentLifeInsurance: number;
  currentDisabilityInsurance: number;
  dependents: number;
  riskTolerance: string;
  createdAt: Date;
  updatedAt: Date;
}

const FINANCIAL_PROFILE_DECIMAL_FIELDS = [
  'annualIncome',
  'spouseIncome',
  'otherIncome',
  'monthlyExpenses',
  'savings',
  'investments',
  'retirement401k',
  'homeEquity',
  'otherAssets',
  'mortgage',
  'carLoans',
  'studentLoans',
  'creditCards',
  'otherDebts',
  'currentLifeInsurance',
  'currentDisabilityInsurance',
] as const;

export function serializeFinancialProfile<T extends Record<string, unknown>>(
  profile: T
): T & SerializedFinancialProfile {
  return serializeDecimals(profile, FINANCIAL_PROFILE_DECIMAL_FIELDS as unknown as (keyof T)[]) as T & SerializedFinancialProfile;
}

/**
 * Serialize insurance needs from Prisma to plain numbers
 */
export interface SerializedInsuranceNeed {
  id: string;
  type: string;
  recommendedCoverage: number;
  currentCoverage: number;
  gap: number;
  monthlyPremium: number | null;
  priority: number;
  reasoning: string;
}

const INSURANCE_NEED_DECIMAL_FIELDS = [
  'recommendedCoverage',
  'currentCoverage',
  'gap',
  'monthlyPremium',
] as const;

export function serializeInsuranceNeed<T extends Record<string, unknown>>(
  need: T
): T & SerializedInsuranceNeed {
  return serializeDecimals(need, INSURANCE_NEED_DECIMAL_FIELDS as unknown as (keyof T)[]) as T & SerializedInsuranceNeed;
}

export function serializeInsuranceNeeds<T extends Record<string, unknown>>(
  needs: T[]
): (T & SerializedInsuranceNeed)[] {
  return needs.map(serializeInsuranceNeed);
}

/**
 * Serialize agent projection from Prisma to plain numbers
 */
export interface SerializedAgentProjection {
  id: string;
  prospectId: string;
  year1Income: number;
  year3Income: number;
  year5Income: number;
  lifetimeValue: number;
}

const AGENT_PROJECTION_DECIMAL_FIELDS = [
  'year1Income',
  'year3Income',
  'year5Income',
  'lifetimeValue',
] as const;

export function serializeAgentProjection<T extends Record<string, unknown>>(
  projection: T | null
): (T & SerializedAgentProjection) | null {
  if (!projection) return null;
  return serializeDecimals(projection, AGENT_PROJECTION_DECIMAL_FIELDS as unknown as (keyof T)[]) as T & SerializedAgentProjection;
}
