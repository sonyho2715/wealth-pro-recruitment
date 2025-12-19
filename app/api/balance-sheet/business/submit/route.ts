import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const submitSchema = z.object({
  agentId: z.string(),
  agentCode: z.string(),

  // Contact Info
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),

  // Business Info
  businessName: z.string().min(1),
  businessType: z.string(),
  industry: z.string().optional(),
  yearsInBusiness: z.string().transform((v) => parseInt(v) || 1),
  employeeCount: z.string().transform((v) => parseInt(v) || 1),

  // Income
  annualRevenue: z.string().transform((v) => parseInt(v) || 0),
  grossProfit: z.string().transform((v) => parseInt(v) || 0),
  netIncome: z.string().transform((v) => parseInt(v) || 0),
  ownerSalary: z.string().transform((v) => parseInt(v) || 0),

  // Assets - Current
  cashOnHand: z.string().transform((v) => parseInt(v) || 0),
  accountsReceivable: z.string().transform((v) => parseInt(v) || 0),
  inventory: z.string().transform((v) => parseInt(v) || 0),

  // Assets - Fixed
  equipment: z.string().transform((v) => parseInt(v) || 0),
  vehicles: z.string().transform((v) => parseInt(v) || 0),
  realEstate: z.string().transform((v) => parseInt(v) || 0),

  // Assets - Other
  investments: z.string().transform((v) => parseInt(v) || 0),
  otherAssets: z.string().transform((v) => parseInt(v) || 0),

  // Liabilities - Current
  accountsPayable: z.string().transform((v) => parseInt(v) || 0),
  shortTermLoans: z.string().transform((v) => parseInt(v) || 0),
  creditCards: z.string().transform((v) => parseInt(v) || 0),
  lineOfCredit: z.string().transform((v) => parseInt(v) || 0),

  // Liabilities - Long Term
  termLoans: z.string().transform((v) => parseInt(v) || 0),
  sbaLoans: z.string().transform((v) => parseInt(v) || 0),
  equipmentLoans: z.string().transform((v) => parseInt(v) || 0),
  commercialMortgage: z.string().transform((v) => parseInt(v) || 0),

  // Insurance
  keyPersonInsurance: z.string().transform((v) => parseInt(v) || 0),
  generalLiability: z.string().transform((v) => parseInt(v) || 0),
  propertyInsurance: z.string().transform((v) => parseInt(v) || 0),
  businessInterruption: z.string().transform((v) => parseInt(v) || 0),
  buyerSellerAgreement: z.boolean().default(false),
  successionPlan: z.boolean().default(false),
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
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });
    }

    // Calculate totals
    const currentAssets = data.cashOnHand + data.accountsReceivable + data.inventory;
    const fixedAssets = data.equipment + data.vehicles + data.realEstate;
    const otherAssets = data.investments + data.otherAssets;
    const totalAssets = currentAssets + fixedAssets + otherAssets;

    const currentLiabilities =
      data.accountsPayable + data.shortTermLoans + data.creditCards + data.lineOfCredit;
    const longTermLiabilities =
      data.termLoans + data.sbaLoans + data.equipmentLoans + data.commercialMortgage;
    const totalLiabilities = currentLiabilities + longTermLiabilities;

    const netWorth = totalAssets - totalLiabilities;

    // Calculate financial ratios
    const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
    const debtToEquityRatio = netWorth > 0 ? totalLiabilities / netWorth : 0;

    // Calculate protection gaps
    // Key person insurance: Recommended = 2x annual revenue or 10x owner salary
    const recommendedKeyPerson = Math.max(data.annualRevenue * 2, data.ownerSalary * 10);
    const keyPersonGap = Math.max(0, recommendedKeyPerson - data.keyPersonInsurance);

    // Buyout funding gap: Business value minus existing coverage
    const estimatedBusinessValue = netWorth > 0 ? netWorth : data.annualRevenue * 2;
    const buyoutFundingGap = data.buyerSellerAgreement ? 0 : estimatedBusinessValue;

    // Check if business prospect already exists with this email
    let businessProspect = await db.businessProspect.findUnique({
      where: { email: data.email },
    });

    if (businessProspect) {
      // Update existing business prospect
      businessProspect = await db.businessProspect.update({
        where: { id: businessProspect.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || null,
          businessName: data.businessName,
          businessType: data.businessType as any,
          industry: data.industry || null,
          yearsInBusiness: data.yearsInBusiness,
          employeeCount: data.employeeCount,
          agentId: data.agentId,
          referredByAgentId: data.agentId,
          status: 'LEAD',
        },
      });
    } else {
      // Create new business prospect
      businessProspect = await db.businessProspect.create({
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || null,
          businessName: data.businessName,
          businessType: data.businessType as any,
          industry: data.industry || null,
          yearsInBusiness: data.yearsInBusiness,
          employeeCount: data.employeeCount,
          agentId: data.agentId,
          referredByAgentId: data.agentId,
          status: 'LEAD',
        },
      });
    }

    // Create or update business financial profile
    await db.businessFinancialProfile.upsert({
      where: { businessProspectId: businessProspect.id },
      create: {
        businessProspectId: businessProspect.id,

        // Income
        annualRevenue: data.annualRevenue,
        grossProfit: data.grossProfit,
        netIncome: data.netIncome,
        ownerSalary: data.ownerSalary,
        ownerDistributions: 0,

        // Current Assets
        cashOnHand: data.cashOnHand,
        accountsReceivable: data.accountsReceivable,
        inventory: data.inventory,
        prepaidExpenses: 0,

        // Fixed Assets
        equipment: data.equipment,
        vehicles: data.vehicles,
        realEstate: data.realEstate,
        leaseholdImprovements: 0,

        // Other Assets
        intellectualProperty: 0,
        goodwill: 0,
        investments: data.investments,
        otherAssets: data.otherAssets,

        // Current Liabilities
        accountsPayable: data.accountsPayable,
        accruedExpenses: 0,
        shortTermLoans: data.shortTermLoans,
        creditCards: data.creditCards,
        lineOfCredit: data.lineOfCredit,
        currentPortionLTD: 0,

        // Long-Term Liabilities
        termLoans: data.termLoans,
        sbaLoans: data.sbaLoans,
        equipmentLoans: data.equipmentLoans,
        commercialMortgage: data.commercialMortgage,
        otherLongTermDebt: 0,

        // Insurance
        keyPersonInsurance: data.keyPersonInsurance,
        generalLiability: data.generalLiability,
        professionalLiability: 0,
        propertyInsurance: data.propertyInsurance,
        workersComp: 0,
        businessInterruption: data.businessInterruption,
        cyberLiability: 0,
        buyerSellerAgreement: data.buyerSellerAgreement,
        successionPlan: data.successionPlan,

        // Calculated
        totalAssets,
        totalLiabilities,
        netWorth,
        currentRatio,
        debtToEquityRatio,
        keyPersonGap,
        buyoutFundingGap,
      },
      update: {
        // Income
        annualRevenue: data.annualRevenue,
        grossProfit: data.grossProfit,
        netIncome: data.netIncome,
        ownerSalary: data.ownerSalary,

        // Current Assets
        cashOnHand: data.cashOnHand,
        accountsReceivable: data.accountsReceivable,
        inventory: data.inventory,

        // Fixed Assets
        equipment: data.equipment,
        vehicles: data.vehicles,
        realEstate: data.realEstate,

        // Other Assets
        investments: data.investments,
        otherAssets: data.otherAssets,

        // Current Liabilities
        accountsPayable: data.accountsPayable,
        shortTermLoans: data.shortTermLoans,
        creditCards: data.creditCards,
        lineOfCredit: data.lineOfCredit,

        // Long-Term Liabilities
        termLoans: data.termLoans,
        sbaLoans: data.sbaLoans,
        equipmentLoans: data.equipmentLoans,
        commercialMortgage: data.commercialMortgage,

        // Insurance
        keyPersonInsurance: data.keyPersonInsurance,
        generalLiability: data.generalLiability,
        propertyInsurance: data.propertyInsurance,
        businessInterruption: data.businessInterruption,
        buyerSellerAgreement: data.buyerSellerAgreement,
        successionPlan: data.successionPlan,

        // Calculated
        totalAssets,
        totalLiabilities,
        netWorth,
        currentRatio,
        debtToEquityRatio,
        keyPersonGap,
        buyoutFundingGap,
      },
    });

    // Create activity log for the agent
    await db.activity.create({
      data: {
        agentId: data.agentId,
        type: 'OTHER',
        title: 'New Business Balance Sheet Submission',
        description: `${data.firstName} ${data.lastName} (${data.businessName}) completed a Business Living Balance Sheet via your personal link.`,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        businessProspectId: businessProspect.id,
        summary: {
          businessName: data.businessName,
          totalAssets,
          totalLiabilities,
          netWorth,
          currentRatio: currentRatio.toFixed(2),
          debtToEquityRatio: debtToEquityRatio.toFixed(2),
          keyPersonGap,
          buyoutFundingGap,
          annualRevenue: data.annualRevenue,
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

    console.error('Business balance sheet submit error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit business balance sheet' },
      { status: 500 }
    );
  }
}
