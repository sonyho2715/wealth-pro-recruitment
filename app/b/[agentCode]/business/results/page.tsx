import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import BusinessResultsDisplay from './BusinessResultsDisplay';

interface PageProps {
  params: Promise<{ agentCode: string }>;
  searchParams: Promise<{ id?: string }>;
}

async function getBusinessProspectData(prospectId: string) {
  const prospect = await db.businessProspect.findUnique({
    where: { id: prospectId },
    include: {
      financialProfile: true,
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
  const { id } = await searchParams;

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
  const { id } = await searchParams;

  if (!id) {
    redirect(`/b/${agentCode}/business`);
  }

  const prospect = await getBusinessProspectData(id);

  if (!prospect || !prospect.financialProfile || !prospect.agent) {
    notFound();
  }

  const fp = prospect.financialProfile;

  return (
    <BusinessResultsDisplay
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
    />
  );
}
