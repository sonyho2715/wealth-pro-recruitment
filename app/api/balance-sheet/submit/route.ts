import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const submitSchema = z.object({
  agentId: z.string(),
  agentCode: z.string(),

  // Personal
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  age: z.string().transform(v => parseInt(v) || 0),
  dependents: z.string().transform(v => parseInt(v) || 0),

  // Income
  annualIncome: z.string().transform(v => parseInt(v) || 0),
  spouseIncome: z.string().transform(v => parseInt(v) || 0),

  // Expenses
  monthlyExpenses: z.string().transform(v => parseInt(v) || 0),
  housingCost: z.string().transform(v => parseInt(v) || 0),

  // Assets
  savings: z.string().transform(v => parseInt(v) || 0),
  retirement: z.string().transform(v => parseInt(v) || 0),
  homeValue: z.string().transform(v => parseInt(v) || 0),
  otherAssets: z.string().transform(v => parseInt(v) || 0),

  // Debts
  mortgage: z.string().transform(v => parseInt(v) || 0),
  carLoans: z.string().transform(v => parseInt(v) || 0),
  studentLoans: z.string().transform(v => parseInt(v) || 0),
  creditCards: z.string().transform(v => parseInt(v) || 0),
  otherDebts: z.string().transform(v => parseInt(v) || 0),

  // Insurance
  currentLifeInsurance: z.string().transform(v => parseInt(v) || 0),
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

    // Calculate totals
    const totalIncome = data.annualIncome + data.spouseIncome;
    const totalAssets = data.savings + data.retirement + data.homeValue + data.otherAssets;
    const totalDebts = data.mortgage + data.carLoans + data.studentLoans + data.creditCards + data.otherDebts;
    const netWorth = totalAssets - totalDebts;

    // Calculate protection gap (simple: 10x income - current coverage)
    const recommendedCoverage = totalIncome * 10;
    const protectionGap = Math.max(0, recommendedCoverage - data.currentLifeInsurance);

    // Calculate monthly gap
    const monthlyIncome = totalIncome / 12;
    const monthlyGap = Math.max(0, data.monthlyExpenses - monthlyIncome);

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

    // Create or update financial profile
    await db.financialProfile.upsert({
      where: { prospectId: prospect.id },
      create: {
        prospectId: prospect.id,
        // Income
        annualIncome: data.annualIncome,
        spouseIncome: data.spouseIncome,
        // Expenses
        monthlyExpenses: data.monthlyExpenses,
        housingCost: data.housingCost,
        debtPayments: 0,
        // Assets
        savings: data.savings,
        emergencyFund: 0,
        investments: 0,
        retirement401k: data.retirement,
        rothIra: 0,
        pensionValue: 0,
        hsaFsa: 0,
        homeMarketValue: data.homeValue,
        homeEquity: Math.max(0, data.homeValue - data.mortgage),
        investmentProperty: 0,
        businessEquity: 0,
        otherAssets: data.otherAssets,
        // Debts
        mortgage: data.mortgage,
        carLoans: data.carLoans,
        studentLoans: data.studentLoans,
        creditCards: data.creditCards,
        personalLoans: 0,
        otherDebts: data.otherDebts,
        // Demographics
        age: data.age,
        dependents: data.dependents,
        retirementAge: 65,
        // Insurance
        currentLifeInsurance: data.currentLifeInsurance,
        currentDisability: 0,
        // Calculated
        netWorth: netWorth,
        monthlyGap: monthlyGap,
        protectionGap: protectionGap,
      },
      update: {
        // Income
        annualIncome: data.annualIncome,
        spouseIncome: data.spouseIncome,
        // Expenses
        monthlyExpenses: data.monthlyExpenses,
        housingCost: data.housingCost,
        // Assets
        savings: data.savings,
        retirement401k: data.retirement,
        homeMarketValue: data.homeValue,
        homeEquity: Math.max(0, data.homeValue - data.mortgage),
        otherAssets: data.otherAssets,
        // Debts
        mortgage: data.mortgage,
        carLoans: data.carLoans,
        studentLoans: data.studentLoans,
        creditCards: data.creditCards,
        otherDebts: data.otherDebts,
        // Demographics
        age: data.age,
        dependents: data.dependents,
        // Insurance
        currentLifeInsurance: data.currentLifeInsurance,
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
          monthlyExpenses: data.monthlyExpenses,
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
