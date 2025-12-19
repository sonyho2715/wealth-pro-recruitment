import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireClient } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await requireClient();

    // Fetch client with prospect and financial profile
    const client = await db.client.findUnique({
      where: { id: session.clientId },
      include: {
        prospect: {
          include: {
            financialProfile: true,
            agent: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    if (!client.prospect) {
      return NextResponse.json({
        success: true,
        data: {
          hasData: false,
          profile: null,
          agent: null,
        },
      });
    }

    const profile = client.prospect.financialProfile;
    const agent = client.prospect.agent;

    if (!profile) {
      return NextResponse.json({
        success: true,
        data: {
          hasData: false,
          profile: null,
          agent: agent
            ? {
                name: `${agent.firstName} ${agent.lastName}`,
                email: agent.email,
                phone: agent.phone,
              }
            : null,
        },
      });
    }

    // Convert Decimal fields to numbers for JSON serialization
    const profileData = {
      // Income
      annualIncome: Number(profile.annualIncome || 0),
      spouseIncome: Number(profile.spouseIncome || 0),
      otherIncome: Number(profile.otherIncome || 0),

      // Monthly Expenses
      monthlyExpenses: Number(profile.monthlyExpenses || 0),
      housingCost: Number(profile.housingCost || 0),
      debtPayments: Number(profile.debtPayments || 0),
      utilities: Number(profile.utilities || 0),
      food: Number(profile.food || 0),
      transportation: Number(profile.transportation || 0),
      insurance: Number(profile.insurance || 0),
      childcare: Number(profile.childcare || 0),
      entertainment: Number(profile.entertainment || 0),
      otherExpenses: Number(profile.otherExpenses || 0),

      // Assets
      savings: Number(profile.savings || 0),
      emergencyFund: Number(profile.emergencyFund || 0),
      investments: Number(profile.investments || 0),
      retirement401k: Number(profile.retirement401k || 0),
      rothIra: Number(profile.rothIra || 0),
      pensionValue: Number(profile.pensionValue || 0),
      hsaFsa: Number(profile.hsaFsa || 0),
      homeMarketValue: Number(profile.homeMarketValue || 0),
      homeEquity: Number(profile.homeEquity || 0),
      investmentProperty: Number(profile.investmentProperty || 0),
      businessEquity: Number(profile.businessEquity || 0),
      otherAssets: Number(profile.otherAssets || 0),

      // Liabilities
      mortgage: Number(profile.mortgage || 0),
      carLoans: Number(profile.carLoans || 0),
      studentLoans: Number(profile.studentLoans || 0),
      creditCards: Number(profile.creditCards || 0),
      personalLoans: Number(profile.personalLoans || 0),
      otherDebts: Number(profile.otherDebts || 0),

      // Demographics
      age: profile.age,
      spouseAge: profile.spouseAge,
      dependents: profile.dependents,
      retirementAge: profile.retirementAge,
      occupation: profile.occupation,
      spouseOccupation: profile.spouseOccupation,
      stateOfResidence: profile.stateOfResidence,

      // Calculated
      netWorth: Number(profile.netWorth || 0),
    };

    // Calculate totals
    const totalAssets =
      profileData.savings +
      profileData.emergencyFund +
      profileData.investments +
      profileData.retirement401k +
      profileData.rothIra +
      profileData.pensionValue +
      profileData.hsaFsa +
      profileData.homeEquity +
      profileData.investmentProperty +
      profileData.businessEquity +
      profileData.otherAssets;

    const totalLiabilities =
      profileData.mortgage +
      profileData.carLoans +
      profileData.studentLoans +
      profileData.creditCards +
      profileData.personalLoans +
      profileData.otherDebts;

    const totalIncome =
      profileData.annualIncome + profileData.spouseIncome + profileData.otherIncome;

    return NextResponse.json({
      success: true,
      data: {
        hasData: true,
        profile: profileData,
        totals: {
          totalAssets,
          totalLiabilities,
          netWorth: totalAssets - totalLiabilities,
          totalIncome,
        },
        agent: agent
          ? {
              name: `${agent.firstName} ${agent.lastName}`,
              email: agent.email,
              phone: agent.phone,
            }
          : null,
        lastUpdated: client.prospect.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Balance sheet API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch balance sheet' },
      { status: 500 }
    );
  }
}

// Validation schema for financial profile updates
const updateBalanceSheetSchema = z.object({
  // Income (optional updates)
  annualIncome: z.number().min(0).optional(),
  spouseIncome: z.number().min(0).optional(),
  otherIncome: z.number().min(0).optional(),

  // Assets (optional updates)
  savings: z.number().min(0).optional(),
  emergencyFund: z.number().min(0).optional(),
  investments: z.number().min(0).optional(),
  retirement401k: z.number().min(0).optional(),
  rothIra: z.number().min(0).optional(),
  pensionValue: z.number().min(0).optional(),
  hsaFsa: z.number().min(0).optional(),
  homeMarketValue: z.number().min(0).optional(),
  homeEquity: z.number().min(0).optional(),
  investmentProperty: z.number().min(0).optional(),
  businessEquity: z.number().min(0).optional(),
  otherAssets: z.number().min(0).optional(),

  // Liabilities (optional updates)
  mortgage: z.number().min(0).optional(),
  carLoans: z.number().min(0).optional(),
  studentLoans: z.number().min(0).optional(),
  creditCards: z.number().min(0).optional(),
  personalLoans: z.number().min(0).optional(),
  otherDebts: z.number().min(0).optional(),
});

// PATCH - Update balance sheet and create snapshot
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireClient();
    const body = await req.json();
    const validated = updateBalanceSheetSchema.parse(body);

    // Get the client's prospect
    const client = await db.client.findUnique({
      where: { id: session.clientId },
      include: {
        prospect: {
          include: {
            financialProfile: true,
          },
        },
      },
    });

    if (!client || !client.prospect) {
      return NextResponse.json(
        { success: false, error: 'No prospect data found' },
        { status: 404 }
      );
    }

    const prospectId = client.prospect.id;

    // Update or create the financial profile
    // For create, we need to provide all required fields with defaults
    const existingProfile = client.prospect.financialProfile;
    const updatedProfile = await db.financialProfile.upsert({
      where: { prospectId },
      update: validated,
      create: {
        prospectId,
        // Demographics (required)
        age: existingProfile?.age ?? 30,
        dependents: existingProfile?.dependents ?? 0,
        retirementAge: existingProfile?.retirementAge ?? 65,
        // Expenses (required)
        monthlyExpenses: existingProfile?.monthlyExpenses ?? 0,
        housingCost: existingProfile?.housingCost ?? 0,
        debtPayments: existingProfile?.debtPayments ?? 0,
        // Income (with validated values or defaults)
        annualIncome: validated.annualIncome ?? existingProfile?.annualIncome ?? 0,
        spouseIncome: validated.spouseIncome ?? existingProfile?.spouseIncome ?? 0,
        otherIncome: validated.otherIncome ?? existingProfile?.otherIncome ?? 0,
        // Assets (with validated values or defaults)
        savings: validated.savings ?? existingProfile?.savings ?? 0,
        emergencyFund: validated.emergencyFund ?? existingProfile?.emergencyFund ?? 0,
        investments: validated.investments ?? existingProfile?.investments ?? 0,
        retirement401k: validated.retirement401k ?? existingProfile?.retirement401k ?? 0,
        rothIra: validated.rothIra ?? existingProfile?.rothIra ?? 0,
        pensionValue: validated.pensionValue ?? existingProfile?.pensionValue ?? 0,
        hsaFsa: validated.hsaFsa ?? existingProfile?.hsaFsa ?? 0,
        homeMarketValue: validated.homeMarketValue ?? existingProfile?.homeMarketValue ?? 0,
        homeEquity: validated.homeEquity ?? existingProfile?.homeEquity ?? 0,
        investmentProperty: validated.investmentProperty ?? existingProfile?.investmentProperty ?? 0,
        businessEquity: validated.businessEquity ?? existingProfile?.businessEquity ?? 0,
        otherAssets: validated.otherAssets ?? existingProfile?.otherAssets ?? 0,
        // Liabilities (with validated values or defaults)
        mortgage: validated.mortgage ?? existingProfile?.mortgage ?? 0,
        carLoans: validated.carLoans ?? existingProfile?.carLoans ?? 0,
        studentLoans: validated.studentLoans ?? existingProfile?.studentLoans ?? 0,
        creditCards: validated.creditCards ?? existingProfile?.creditCards ?? 0,
        personalLoans: validated.personalLoans ?? existingProfile?.personalLoans ?? 0,
        otherDebts: validated.otherDebts ?? existingProfile?.otherDebts ?? 0,
      },
    });

    // Calculate totals for the snapshot
    const totalAssets =
      Number(updatedProfile.savings || 0) +
      Number(updatedProfile.emergencyFund || 0) +
      Number(updatedProfile.investments || 0) +
      Number(updatedProfile.retirement401k || 0) +
      Number(updatedProfile.rothIra || 0) +
      Number(updatedProfile.pensionValue || 0) +
      Number(updatedProfile.hsaFsa || 0) +
      Number(updatedProfile.homeEquity || 0) +
      Number(updatedProfile.investmentProperty || 0) +
      Number(updatedProfile.businessEquity || 0) +
      Number(updatedProfile.otherAssets || 0);

    const totalLiabilities =
      Number(updatedProfile.mortgage || 0) +
      Number(updatedProfile.carLoans || 0) +
      Number(updatedProfile.studentLoans || 0) +
      Number(updatedProfile.creditCards || 0) +
      Number(updatedProfile.personalLoans || 0) +
      Number(updatedProfile.otherDebts || 0);

    const netWorth = totalAssets - totalLiabilities;

    // Update the netWorth field in financial profile
    await db.financialProfile.update({
      where: { prospectId },
      data: { netWorth },
    });

    // Create a financial snapshot for history tracking
    await db.financialSnapshot.create({
      data: {
        prospectId,
        totalAssets,
        totalLiabilities,
        netWorth,
        assetsBreakdown: {
          savings: Number(updatedProfile.savings || 0),
          emergencyFund: Number(updatedProfile.emergencyFund || 0),
          investments: Number(updatedProfile.investments || 0),
          retirement401k: Number(updatedProfile.retirement401k || 0),
          rothIra: Number(updatedProfile.rothIra || 0),
          pensionValue: Number(updatedProfile.pensionValue || 0),
          hsaFsa: Number(updatedProfile.hsaFsa || 0),
          homeEquity: Number(updatedProfile.homeEquity || 0),
          investmentProperty: Number(updatedProfile.investmentProperty || 0),
          businessEquity: Number(updatedProfile.businessEquity || 0),
          otherAssets: Number(updatedProfile.otherAssets || 0),
        },
        liabilitiesBreakdown: {
          mortgage: Number(updatedProfile.mortgage || 0),
          carLoans: Number(updatedProfile.carLoans || 0),
          studentLoans: Number(updatedProfile.studentLoans || 0),
          creditCards: Number(updatedProfile.creditCards || 0),
          personalLoans: Number(updatedProfile.personalLoans || 0),
          otherDebts: Number(updatedProfile.otherDebts || 0),
        },
      },
    });

    // Update prospect's updatedAt timestamp
    await db.prospect.update({
      where: { id: prospectId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: 'Balance sheet updated successfully',
      data: {
        totalAssets,
        totalLiabilities,
        netWorth,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Balance sheet update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update balance sheet' },
      { status: 500 }
    );
  }
}
