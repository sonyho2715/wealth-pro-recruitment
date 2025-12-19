import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// Helper to parse currency/number strings
const parseNumber = (v: string | undefined | null) => {
  if (!v) return 0;
  const cleaned = String(v).replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
};

const submitSchema = z.object({
  agentId: z.string(),
  agentCode: z.string(),

  // Step 1: Personal Info
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  age: z.string().transform(v => parseInt(v) || 0),
  spouseAge: z.string().optional().transform(v => v ? parseInt(v) || null : null),
  dependents: z.string().transform(v => parseInt(v) || 0),
  stateOfResidence: z.string().optional(),
  occupation: z.string().optional(),
  spouseOccupation: z.string().optional(),

  // Step 2: Income & Expenses
  annualIncome: z.string().transform(parseNumber),
  spouseIncome: z.string().optional().transform(v => parseNumber(v)),
  otherIncome: z.string().optional().transform(v => parseNumber(v)),
  // Monthly expenses breakdown
  housingCost: z.string().optional().transform(v => parseNumber(v)),
  utilities: z.string().optional().transform(v => parseNumber(v)),
  food: z.string().optional().transform(v => parseNumber(v)),
  transportation: z.string().optional().transform(v => parseNumber(v)),
  insurance: z.string().optional().transform(v => parseNumber(v)),
  childcare: z.string().optional().transform(v => parseNumber(v)),
  entertainment: z.string().optional().transform(v => parseNumber(v)),
  otherExpenses: z.string().optional().transform(v => parseNumber(v)),

  // Step 3: Assets - Savings & Investments
  savings: z.string().optional().transform(v => parseNumber(v)),
  emergencyFund: z.string().optional().transform(v => parseNumber(v)),
  retirement401k: z.string().optional().transform(v => parseNumber(v)),
  rothIra: z.string().optional().transform(v => parseNumber(v)),
  pensionValue: z.string().optional().transform(v => parseNumber(v)),
  hsaFsa: z.string().optional().transform(v => parseNumber(v)),
  investments: z.string().optional().transform(v => parseNumber(v)),
  businessEquity: z.string().optional().transform(v => parseNumber(v)),
  otherAssets: z.string().optional().transform(v => parseNumber(v)),

  // Step 4: Assets - Property
  homeMarketValue: z.string().optional().transform(v => parseNumber(v)),
  homeEquity: z.string().optional().transform(v => parseNumber(v)),
  investmentProperty: z.string().optional().transform(v => parseNumber(v)),
  personalProperty: z.string().optional().transform(v => parseNumber(v)),

  // Step 5: Debts & Liabilities
  mortgage: z.string().optional().transform(v => parseNumber(v)),
  carLoans: z.string().optional().transform(v => parseNumber(v)),
  studentLoans: z.string().optional().transform(v => parseNumber(v)),
  creditCards: z.string().optional().transform(v => parseNumber(v)),
  personalLoans: z.string().optional().transform(v => parseNumber(v)),
  businessDebt: z.string().optional().transform(v => parseNumber(v)),
  taxesOwed: z.string().optional().transform(v => parseNumber(v)),
  otherDebts: z.string().optional().transform(v => parseNumber(v)),

  // Step 6: Protection & Planning
  currentLifeInsurance: z.string().optional().transform(v => parseNumber(v)),
  spouseLifeInsurance: z.string().optional().transform(v => parseNumber(v)),
  currentDisability: z.string().optional().transform(v => parseNumber(v)),
  hospitalDailyBenefit: z.string().optional().transform(v => parseNumber(v)),
  liabilityInsurance: z.string().optional().transform(v => parseNumber(v)),
  hasWill: z.boolean().optional().default(false),
  hasTrust: z.boolean().optional().default(false),
  retirementAge: z.string().optional().transform(v => v ? parseInt(v) || 65 : 65),
  expectedSocialSecurity: z.string().optional().transform(v => parseNumber(v)),
  employer401kMatch: z.string().optional().transform(v => parseNumber(v)),
  filingStatus: z.enum(['SINGLE', 'MARRIED_FILING_JOINTLY', 'MARRIED_FILING_SEPARATELY', 'HEAD_OF_HOUSEHOLD']).optional().default('SINGLE'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = submitSchema.parse(body);

    // Verify agent exists
    const agent = await db.agent.findUnique({
      where: { id: data.agentId },
      select: { id: true, organizationId: true },
    });

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Calculate monthly expenses total from breakdown
    const monthlyExpenses = (
      data.housingCost +
      data.utilities +
      data.food +
      data.transportation +
      data.insurance +
      data.childcare +
      data.entertainment +
      data.otherExpenses
    );

    // Calculate totals
    const totalIncome = data.annualIncome + data.spouseIncome + data.otherIncome;

    // Total liquid/investment assets
    const totalLiquidAssets = (
      data.savings +
      data.emergencyFund +
      data.retirement401k +
      data.rothIra +
      data.pensionValue +
      data.hsaFsa +
      data.investments +
      data.businessEquity +
      data.otherAssets
    );

    // Total property assets
    const totalPropertyAssets = (
      data.homeMarketValue +
      data.investmentProperty +
      data.personalProperty
    );

    const totalAssets = totalLiquidAssets + totalPropertyAssets;

    // Total debts
    const totalDebts = (
      data.mortgage +
      data.carLoans +
      data.studentLoans +
      data.creditCards +
      data.personalLoans +
      data.businessDebt +
      data.taxesOwed +
      data.otherDebts
    );

    const netWorth = totalAssets - totalDebts;

    // Calculate protection gap (10x income - current coverage for primary + spouse)
    const totalLifeInsurance = data.currentLifeInsurance + data.spouseLifeInsurance;
    const recommendedCoverage = totalIncome * 10;
    const protectionGap = Math.max(0, recommendedCoverage - totalLifeInsurance);

    // Calculate monthly gap
    const monthlyIncome = totalIncome / 12;
    const monthlyGap = Math.max(0, monthlyExpenses - monthlyIncome);

    // Calculate home equity if not provided but we have home value and mortgage
    const calculatedHomeEquity = data.homeEquity > 0
      ? data.homeEquity
      : Math.max(0, data.homeMarketValue - data.mortgage);

    // Check if prospect already exists with this email
    let prospect = await db.prospect.findUnique({
      where: { email: data.email },
    });

    if (prospect) {
      // Update existing prospect and reassign to this agent
      prospect = await db.prospect.update({
        where: { id: prospect.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || null,
          agentId: data.agentId,
          referredByAgentId: data.agentId,
          referralSource: `balance-sheet-${data.agentCode}`,
          status: 'LEAD',
          stage: 'NEW',
        },
      });
    } else {
      // Create new prospect
      prospect = await db.prospect.create({
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || null,
          agentId: data.agentId,
          referredByAgentId: data.agentId,
          referralSource: `balance-sheet-${data.agentCode}`,
          status: 'LEAD',
          stage: 'NEW',
        },
      });
    }

    // Create or update financial profile with all fields
    await db.financialProfile.upsert({
      where: { prospectId: prospect.id },
      create: {
        prospectId: prospect.id,

        // Income
        annualIncome: data.annualIncome,
        spouseIncome: data.spouseIncome,
        otherIncome: data.otherIncome,

        // Monthly Expenses
        monthlyExpenses: monthlyExpenses,
        housingCost: data.housingCost,
        debtPayments: 0,
        utilities: data.utilities,
        food: data.food,
        transportation: data.transportation,
        insurance: data.insurance,
        childcare: data.childcare,
        entertainment: data.entertainment,
        otherExpenses: data.otherExpenses,

        // Assets - Savings & Investments
        savings: data.savings,
        emergencyFund: data.emergencyFund,
        investments: data.investments,
        retirement401k: data.retirement401k,
        rothIra: data.rothIra,
        pensionValue: data.pensionValue,
        hsaFsa: data.hsaFsa,
        businessEquity: data.businessEquity,
        otherAssets: data.otherAssets,

        // Assets - Property
        homeMarketValue: data.homeMarketValue,
        homeEquity: calculatedHomeEquity,
        investmentProperty: data.investmentProperty,
        personalProperty: data.personalProperty,

        // Debts
        mortgage: data.mortgage,
        carLoans: data.carLoans,
        studentLoans: data.studentLoans,
        creditCards: data.creditCards,
        personalLoans: data.personalLoans,
        businessDebt: data.businessDebt,
        taxesOwed: data.taxesOwed,
        otherDebts: data.otherDebts,

        // Demographics
        age: data.age,
        spouseAge: data.spouseAge,
        dependents: data.dependents,
        occupation: data.occupation || null,
        spouseOccupation: data.spouseOccupation || null,
        stateOfResidence: data.stateOfResidence || null,

        // Retirement & Tax
        retirementAge: data.retirementAge,
        expectedSocialSecurity: data.expectedSocialSecurity,
        employer401kMatch: data.employer401kMatch,
        filingStatus: data.filingStatus,

        // Insurance & Protection
        currentLifeInsurance: data.currentLifeInsurance,
        spouseLifeInsurance: data.spouseLifeInsurance,
        currentDisability: data.currentDisability,
        hospitalDailyBenefit: data.hospitalDailyBenefit,
        liabilityInsurance: data.liabilityInsurance,
        hasWill: data.hasWill,
        hasTrust: data.hasTrust,

        // Calculated
        netWorth: netWorth,
        monthlyGap: monthlyGap,
        protectionGap: protectionGap,
      },
      update: {
        // Income
        annualIncome: data.annualIncome,
        spouseIncome: data.spouseIncome,
        otherIncome: data.otherIncome,

        // Monthly Expenses
        monthlyExpenses: monthlyExpenses,
        housingCost: data.housingCost,
        utilities: data.utilities,
        food: data.food,
        transportation: data.transportation,
        insurance: data.insurance,
        childcare: data.childcare,
        entertainment: data.entertainment,
        otherExpenses: data.otherExpenses,

        // Assets - Savings & Investments
        savings: data.savings,
        emergencyFund: data.emergencyFund,
        investments: data.investments,
        retirement401k: data.retirement401k,
        rothIra: data.rothIra,
        pensionValue: data.pensionValue,
        hsaFsa: data.hsaFsa,
        businessEquity: data.businessEquity,
        otherAssets: data.otherAssets,

        // Assets - Property
        homeMarketValue: data.homeMarketValue,
        homeEquity: calculatedHomeEquity,
        investmentProperty: data.investmentProperty,
        personalProperty: data.personalProperty,

        // Debts
        mortgage: data.mortgage,
        carLoans: data.carLoans,
        studentLoans: data.studentLoans,
        creditCards: data.creditCards,
        personalLoans: data.personalLoans,
        businessDebt: data.businessDebt,
        taxesOwed: data.taxesOwed,
        otherDebts: data.otherDebts,

        // Demographics
        age: data.age,
        spouseAge: data.spouseAge,
        dependents: data.dependents,
        occupation: data.occupation || null,
        spouseOccupation: data.spouseOccupation || null,
        stateOfResidence: data.stateOfResidence || null,

        // Retirement & Tax
        retirementAge: data.retirementAge,
        expectedSocialSecurity: data.expectedSocialSecurity,
        employer401kMatch: data.employer401kMatch,
        filingStatus: data.filingStatus,

        // Insurance & Protection
        currentLifeInsurance: data.currentLifeInsurance,
        spouseLifeInsurance: data.spouseLifeInsurance,
        currentDisability: data.currentDisability,
        hospitalDailyBenefit: data.hospitalDailyBenefit,
        liabilityInsurance: data.liabilityInsurance,
        hasWill: data.hasWill,
        hasTrust: data.hasTrust,

        // Calculated
        netWorth: netWorth,
        monthlyGap: monthlyGap,
        protectionGap: protectionGap,
      },
    });

    // Create activity log for the agent
    await db.activity.create({
      data: {
        agentId: data.agentId,
        prospectId: prospect.id,
        type: 'OTHER',
        title: 'New Balance Sheet Submission',
        description: `${data.firstName} ${data.lastName} completed their Living Balance Sheet via your personal link.`,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        prospectId: prospect.id,
        summary: {
          totalAssets,
          totalDebts,
          netWorth,
          protectionGap,
          monthlyIncome,
          monthlyExpenses,
          totalIncome,
          totalLifeInsurance,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Balance sheet submit error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit balance sheet' },
      { status: 500 }
    );
  }
}
