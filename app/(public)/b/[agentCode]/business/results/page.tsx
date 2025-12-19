import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import BusinessResultsDisplay from './BusinessResultsDisplay';

interface PageProps {
  params: Promise<{ agentCode: string }>;
  searchParams: Promise<{ id?: string; demo?: string }>;
}

async function getAgentByCode(agentCode: string) {
  const agent = await db.agent.findFirst({
    where: {
      referralCode: {
        equals: agentCode,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      referralCode: true,
      organization: {
        select: {
          name: true,
          logo: true,
          primaryColor: true,
        },
      },
    },
  });

  return agent;
}

async function getBusinessProspectData(prospectId: string) {
  const prospect = await db.businessProspect.findUnique({
    where: { id: prospectId },
    include: {
      financialProfile: {
        include: {
          calibration: {
            include: {
              industry: {
                select: {
                  title: true,
                  shortTitle: true,
                  naicsCode: true,
                },
              },
            },
          },
        },
      },
      agent: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          referralCode: true,
          organization: {
            select: {
              name: true,
              logo: true,
              primaryColor: true,
            },
          },
        },
      },
    },
  });

  return prospect;
}

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { id, demo } = await searchParams;

  if (demo === 'true') {
    return {
      title: 'Business Financial Analysis (Demo) - Wealth Pro',
      description: 'See sample business financial analysis and recommendations.',
    };
  }

  if (!id) {
    return { title: 'Results Not Found' };
  }

  const prospect = await getBusinessProspectData(id);

  if (!prospect) {
    return { title: 'Results Not Found' };
  }

  return {
    title: `Business Financial Analysis | ${prospect.businessName} - Wealth Pro`,
    description: 'See your personalized business financial analysis and recommendations.',
  };
}

export default async function BusinessResultsPage({ params, searchParams }: PageProps) {
  const { agentCode } = await params;
  const { id, demo } = await searchParams;

  // Demo mode - show Zion Glass sample data
  if (demo === 'true') {
    const agent = await getAgentByCode(agentCode);

    if (!agent) {
      notFound();
    }

    // Demo data for Zion Glass Company
    const demoFinancials = {
      annualRevenue: 776000,
      costOfGoodsSold: 420000,
      grossProfit: 356000,
      netIncome: -51900,
      ownerSalary: 85000,
      totalAssets: 450000,
      totalLiabilities: 285000,
      netWorth: 165000,
      currentRatio: 1.32,
      debtToEquityRatio: 1.73,
      keyPersonGap: 500000,
      buyoutFundingGap: 300000,
      cashOnHand: 45000,
      accountsReceivable: 65000,
      inventory: 35000,
      equipment: 180000,
      vehicles: 45000,
      realEstate: 0,
      investments: 80000,
      accountsPayable: 35000,
      shortTermLoans: 25000,
      creditCards: 15000,
      lineOfCredit: 35000,
      termLoans: 75000,
      sbaLoans: 0,
      equipmentLoans: 50000,
      commercialMortgage: 50000,
      keyPersonInsurance: 0,
      generalLiability: 1000000,
      propertyInsurance: 500000,
      businessInterruption: 0,
      buyerSellerAgreement: false,
      successionPlan: false,
    };

    return (
      <BusinessResultsDisplay
        prospectId="demo"
        businessProspect={{
          firstName: 'Demo',
          lastName: 'User',
          email: 'demo@example.com',
          businessName: 'Zion Glass Company (Demo)',
          businessType: 'LLC',
          industry: 'Glass & Glazing Contractors',
          yearsInBusiness: 5,
          employeeCount: 8,
        }}
        agent={{
          firstName: agent.firstName,
          lastName: agent.lastName,
          email: agent.email,
          phone: agent.phone,
          referralCode: agent.referralCode || agentCode,
          organizationName: agent.organization?.name,
          logo: agent.organization?.logo,
          primaryColor: agent.organization?.primaryColor || '#0f172a',
        }}
        financials={demoFinancials}
        calibration={null}
        isDemo
      />
    );
  }

  if (!id) {
    redirect(`/b/${agentCode}/business`);
  }

  const prospect = await getBusinessProspectData(id);

  if (!prospect || !prospect.financialProfile || !prospect.agent) {
    notFound();
  }

  const fp = prospect.financialProfile;

  // Build calibration summary if available
  const calibration = fp.calibration
    ? {
        healthScore: fp.calibration.healthScore,
        industryName: fp.calibration.industry.shortTitle || fp.calibration.industry.title,
        totalOpportunity: Number(fp.calibration.totalOpportunity),
        grossProfitPercentile: fp.calibration.grossProfitPercentile,
        netProfitPercentile: fp.calibration.netProfitPercentile,
      }
    : null;

  return (
    <BusinessResultsDisplay
      prospectId={id}
      businessProspect={{
        firstName: prospect.firstName,
        lastName: prospect.lastName,
        email: prospect.email,
        businessName: prospect.businessName,
        businessType: prospect.businessType,
        industry: prospect.industry,
        yearsInBusiness: prospect.yearsInBusiness,
        employeeCount: prospect.employeeCount,
      }}
      agent={{
        firstName: prospect.agent.firstName,
        lastName: prospect.agent.lastName,
        email: prospect.agent.email,
        phone: prospect.agent.phone,
        referralCode: prospect.agent.referralCode || agentCode,
        organizationName: prospect.agent.organization?.name,
        logo: prospect.agent.organization?.logo,
        primaryColor: prospect.agent.organization?.primaryColor || '#0f172a',
      }}
      financials={{
        annualRevenue: Number(fp.annualRevenue),
        costOfGoodsSold: Number(fp.costOfGoodsSold || 0),
        grossProfit: Number(fp.grossProfit),
        netIncome: Number(fp.netIncome),
        ownerSalary: Number(fp.ownerSalary),
        totalAssets: Number(fp.totalAssets),
        totalLiabilities: Number(fp.totalLiabilities),
        netWorth: Number(fp.netWorth),
        currentRatio: Number(fp.currentRatio),
        debtToEquityRatio: Number(fp.debtToEquityRatio),
        keyPersonGap: Number(fp.keyPersonGap),
        buyoutFundingGap: Number(fp.buyoutFundingGap),
        cashOnHand: Number(fp.cashOnHand),
        accountsReceivable: Number(fp.accountsReceivable),
        inventory: Number(fp.inventory),
        equipment: Number(fp.equipment),
        vehicles: Number(fp.vehicles),
        realEstate: Number(fp.realEstate),
        investments: Number(fp.investments),
        accountsPayable: Number(fp.accountsPayable),
        shortTermLoans: Number(fp.shortTermLoans),
        creditCards: Number(fp.creditCards),
        lineOfCredit: Number(fp.lineOfCredit),
        termLoans: Number(fp.termLoans),
        sbaLoans: Number(fp.sbaLoans),
        equipmentLoans: Number(fp.equipmentLoans),
        commercialMortgage: Number(fp.commercialMortgage),
        keyPersonInsurance: Number(fp.keyPersonInsurance),
        generalLiability: Number(fp.generalLiability),
        propertyInsurance: Number(fp.propertyInsurance),
        businessInterruption: Number(fp.businessInterruption),
        buyerSellerAgreement: fp.buyerSellerAgreement,
        successionPlan: fp.successionPlan,
      }}
      calibration={calibration}
    />
  );
}
