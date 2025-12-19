import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// Helper to parse currency/number strings
const parseNumber = (v: string | undefined | null) => {
  if (!v) return 0;
  const cleaned = String(v).replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
};

// Schema for yearly tax data
const yearlyDataSchema = z.object({
  taxYear: z.number(),
  netReceipts: z.string().transform(parseNumber),
  costOfGoodsSold: z.string().transform(parseNumber),
  grossProfit: z.string().transform(parseNumber),
  totalDeductions: z.string().transform(parseNumber),
  netIncome: z.string().transform(parseNumber),
  pensionContributions: z.string().transform(parseNumber),
});

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
  annualRevenue: z.string().transform(parseNumber),
  costOfGoodsSold: z.string().optional().transform((v) => parseNumber(v)),
  grossProfit: z.string().optional().transform((v) => parseNumber(v)),
  netIncome: z.string().optional().transform((v) => parseNumber(v)),
  ownerSalary: z.string().optional().transform((v) => parseNumber(v)),
  ownerDistributions: z.string().optional().transform((v) => parseNumber(v)),

  // Assets - Current
  cashOnHand: z.string().optional().transform((v) => parseNumber(v)),
  accountsReceivable: z.string().optional().transform((v) => parseNumber(v)),
  inventory: z.string().optional().transform((v) => parseNumber(v)),
  prepaidExpenses: z.string().optional().transform((v) => parseNumber(v)),

  // Assets - Fixed
  equipment: z.string().optional().transform((v) => parseNumber(v)),
  vehicles: z.string().optional().transform((v) => parseNumber(v)),
  realEstate: z.string().optional().transform((v) => parseNumber(v)),
  leaseholdImprovements: z.string().optional().transform((v) => parseNumber(v)),

  // Assets - Intangible & Other
  intellectualProperty: z.string().optional().transform((v) => parseNumber(v)),
  goodwill: z.string().optional().transform((v) => parseNumber(v)),
  investments: z.string().optional().transform((v) => parseNumber(v)),
  otherAssets: z.string().optional().transform((v) => parseNumber(v)),

  // Liabilities - Current
  accountsPayable: z.string().optional().transform((v) => parseNumber(v)),
  accruedExpenses: z.string().optional().transform((v) => parseNumber(v)),
  shortTermLoans: z.string().optional().transform((v) => parseNumber(v)),
  creditCards: z.string().optional().transform((v) => parseNumber(v)),
  lineOfCredit: z.string().optional().transform((v) => parseNumber(v)),
  currentPortionLTD: z.string().optional().transform((v) => parseNumber(v)),

  // Liabilities - Long Term
  termLoans: z.string().optional().transform((v) => parseNumber(v)),
  sbaLoans: z.string().optional().transform((v) => parseNumber(v)),
  equipmentLoans: z.string().optional().transform((v) => parseNumber(v)),
  commercialMortgage: z.string().optional().transform((v) => parseNumber(v)),
  otherLongTermDebt: z.string().optional().transform((v) => parseNumber(v)),

  // Insurance
  keyPersonInsurance: z.string().optional().transform((v) => parseNumber(v)),
  generalLiability: z.string().optional().transform((v) => parseNumber(v)),
  professionalLiability: z.string().optional().transform((v) => parseNumber(v)),
  propertyInsurance: z.string().optional().transform((v) => parseNumber(v)),
  workersComp: z.string().optional().transform((v) => parseNumber(v)),
  businessInterruption: z.string().optional().transform((v) => parseNumber(v)),
  cyberLiability: z.string().optional().transform((v) => parseNumber(v)),
  buyerSellerAgreement: z.boolean().default(false),
  successionPlan: z.boolean().default(false),

  // Historical Data (optional)
  yearlyData: z.array(yearlyDataSchema).optional().default([]),
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

    // Calculate totals - Current Assets
    const currentAssets = (
      data.cashOnHand +
      data.accountsReceivable +
      data.inventory +
      data.prepaidExpenses
    );

    // Fixed Assets
    const fixedAssets = (
      data.equipment +
      data.vehicles +
      data.realEstate +
      data.leaseholdImprovements
    );

    // Intangible & Other Assets
    const otherAssets = (
      data.intellectualProperty +
      data.goodwill +
      data.investments +
      data.otherAssets
    );

    const totalAssets = currentAssets + fixedAssets + otherAssets;

    // Current Liabilities
    const currentLiabilities = (
      data.accountsPayable +
      data.accruedExpenses +
      data.shortTermLoans +
      data.creditCards +
      data.lineOfCredit +
      data.currentPortionLTD
    );

    // Long-Term Liabilities
    const longTermLiabilities = (
      data.termLoans +
      data.sbaLoans +
      data.equipmentLoans +
      data.commercialMortgage +
      data.otherLongTermDebt
    );

    const totalLiabilities = currentLiabilities + longTermLiabilities;

    const netWorth = totalAssets - totalLiabilities;

    // Calculate financial ratios
    const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
    const debtToEquityRatio = netWorth > 0 ? totalLiabilities / netWorth : 0;

    // Calculate protection gaps
    // Key person insurance: Recommended = 2x annual revenue or 10x owner salary
    const totalOwnerComp = data.ownerSalary + data.ownerDistributions;
    const recommendedKeyPerson = Math.max(data.annualRevenue * 2, totalOwnerComp * 10);
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

    // Create or update business financial profile with all fields
    const businessProfile = await db.businessFinancialProfile.upsert({
      where: { businessProspectId: businessProspect.id },
      create: {
        businessProspectId: businessProspect.id,

        // Income
        annualRevenue: data.annualRevenue,
        costOfGoodsSold: data.costOfGoodsSold,
        grossProfit: data.grossProfit,
        netIncome: data.netIncome,
        ownerSalary: data.ownerSalary,
        ownerDistributions: data.ownerDistributions,

        // Current Assets
        cashOnHand: data.cashOnHand,
        accountsReceivable: data.accountsReceivable,
        inventory: data.inventory,
        prepaidExpenses: data.prepaidExpenses,

        // Fixed Assets
        equipment: data.equipment,
        vehicles: data.vehicles,
        realEstate: data.realEstate,
        leaseholdImprovements: data.leaseholdImprovements,

        // Intangible & Other Assets
        intellectualProperty: data.intellectualProperty,
        goodwill: data.goodwill,
        investments: data.investments,
        otherAssets: data.otherAssets,

        // Current Liabilities
        accountsPayable: data.accountsPayable,
        accruedExpenses: data.accruedExpenses,
        shortTermLoans: data.shortTermLoans,
        creditCards: data.creditCards,
        lineOfCredit: data.lineOfCredit,
        currentPortionLTD: data.currentPortionLTD,

        // Long-Term Liabilities
        termLoans: data.termLoans,
        sbaLoans: data.sbaLoans,
        equipmentLoans: data.equipmentLoans,
        commercialMortgage: data.commercialMortgage,
        otherLongTermDebt: data.otherLongTermDebt,

        // Insurance
        keyPersonInsurance: data.keyPersonInsurance,
        generalLiability: data.generalLiability,
        professionalLiability: data.professionalLiability,
        propertyInsurance: data.propertyInsurance,
        workersComp: data.workersComp,
        businessInterruption: data.businessInterruption,
        cyberLiability: data.cyberLiability,
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
        costOfGoodsSold: data.costOfGoodsSold,
        grossProfit: data.grossProfit,
        netIncome: data.netIncome,
        ownerSalary: data.ownerSalary,
        ownerDistributions: data.ownerDistributions,

        // Current Assets
        cashOnHand: data.cashOnHand,
        accountsReceivable: data.accountsReceivable,
        inventory: data.inventory,
        prepaidExpenses: data.prepaidExpenses,

        // Fixed Assets
        equipment: data.equipment,
        vehicles: data.vehicles,
        realEstate: data.realEstate,
        leaseholdImprovements: data.leaseholdImprovements,

        // Intangible & Other Assets
        intellectualProperty: data.intellectualProperty,
        goodwill: data.goodwill,
        investments: data.investments,
        otherAssets: data.otherAssets,

        // Current Liabilities
        accountsPayable: data.accountsPayable,
        accruedExpenses: data.accruedExpenses,
        shortTermLoans: data.shortTermLoans,
        creditCards: data.creditCards,
        lineOfCredit: data.lineOfCredit,
        currentPortionLTD: data.currentPortionLTD,

        // Long-Term Liabilities
        termLoans: data.termLoans,
        sbaLoans: data.sbaLoans,
        equipmentLoans: data.equipmentLoans,
        commercialMortgage: data.commercialMortgage,
        otherLongTermDebt: data.otherLongTermDebt,

        // Insurance
        keyPersonInsurance: data.keyPersonInsurance,
        generalLiability: data.generalLiability,
        professionalLiability: data.professionalLiability,
        propertyInsurance: data.propertyInsurance,
        workersComp: data.workersComp,
        businessInterruption: data.businessInterruption,
        cyberLiability: data.cyberLiability,
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

    // Save yearly data if provided
    if (data.yearlyData && data.yearlyData.length > 0) {
      for (const yearData of data.yearlyData) {
        // Only save years with actual data
        if (yearData.netReceipts > 0 || yearData.netIncome !== 0) {
          await db.businessYearlyData.upsert({
            where: {
              businessProfileId_taxYear: {
                businessProfileId: businessProfile.id,
                taxYear: yearData.taxYear,
              },
            },
            create: {
              businessProfileId: businessProfile.id,
              taxYear: yearData.taxYear,
              netReceipts: yearData.netReceipts,
              costOfGoodsSold: yearData.costOfGoodsSold,
              grossProfit: yearData.grossProfit,
              totalDeductions: yearData.totalDeductions,
              netIncome: yearData.netIncome,
              pensionContributions: yearData.pensionContributions,
            },
            update: {
              netReceipts: yearData.netReceipts,
              costOfGoodsSold: yearData.costOfGoodsSold,
              grossProfit: yearData.grossProfit,
              totalDeductions: yearData.totalDeductions,
              netIncome: yearData.netIncome,
              pensionContributions: yearData.pensionContributions,
            },
          });
        }
      }
    }

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
