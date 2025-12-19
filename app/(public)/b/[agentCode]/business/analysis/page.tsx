import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import BusinessAnalysisDashboard from '@/components/business-analysis/BusinessAnalysisDashboard';
import { YearlyFinancials } from '@/lib/business-calculations';

interface PageProps {
  params: Promise<{ agentCode: string }>;
  searchParams: Promise<{ id?: string; demo?: string }>;
}

async function getBusinessProspectData(prospectId: string) {
  const prospect = await db.businessProspect.findUnique({
    where: { id: prospectId },
    include: {
      financialProfile: {
        include: {
          yearlyData: {
            orderBy: { taxYear: 'asc' },
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

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { id, demo } = await searchParams;

  if (demo === 'true') {
    return {
      title: 'Business Analysis Dashboard (Demo) - Wealth Pro',
      description: 'Interactive What-If scenario analysis for business financial planning.',
    };
  }

  if (!id) {
    return { title: 'Analysis Dashboard - Wealth Pro' };
  }

  const prospect = await getBusinessProspectData(id);

  if (!prospect) {
    return { title: 'Analysis Not Found' };
  }

  return {
    title: `Business Analysis | ${prospect.businessName} - Wealth Pro`,
    description: `Interactive What-If scenario analysis for ${prospect.businessName}.`,
  };
}

export default async function BusinessAnalysisPage({ params, searchParams }: PageProps) {
  const { agentCode } = await params;
  const { id, demo } = await searchParams;

  // Demo mode - show Zion Glass sample data
  if (demo === 'true') {
    const agent = await getAgentByCode(agentCode);

    if (!agent) {
      notFound();
    }

    return (
      <BusinessAnalysisDashboard
        businessName="Zion Glass Company (Demo)"
        agentCode={agent.referralCode || agentCode}
        agentName={`${agent.firstName} ${agent.lastName}`}
        agentPhone={agent.phone}
        agentEmail={agent.email}
        organizationName={agent.organization?.name}
        organizationLogo={agent.organization?.logo}
        primaryColor={agent.organization?.primaryColor || '#0f172a'}
        // yearlyData will default to Zion Glass sample
      />
    );
  }

  if (!id) {
    // Redirect to business balance sheet form if no ID
    redirect(`/b/${agentCode}/business`);
  }

  const prospect = await getBusinessProspectData(id);

  if (!prospect || !prospect.financialProfile || !prospect.agent) {
    notFound();
  }

  const fp = prospect.financialProfile;

  // Convert yearly data to YearlyFinancials format
  const yearlyData: YearlyFinancials[] = fp.yearlyData.map((y) => ({
    taxYear: y.taxYear,
    netReceipts: Number(y.netReceipts),
    costOfGoodsSold: Number(y.costOfGoodsSold),
    grossProfit: Number(y.grossProfit),
    totalDeductions: Number(y.totalDeductions),
    netIncome: Number(y.netIncome),
    pensionContributions: Number(y.pensionContributions),
  }));

  // Current year data from the financial profile (most recent submission)
  // Use actual COGS if available, otherwise calculate from revenue - gross profit
  const actualCOGS = fp.costOfGoodsSold ? Number(fp.costOfGoodsSold) : 0;
  const calculatedCOGS = Number(fp.annualRevenue) - Number(fp.grossProfit);
  const currentYearData = {
    revenue: Number(fp.annualRevenue),
    cogs: actualCOGS > 0 ? actualCOGS : calculatedCOGS,
    totalDeductions: 0, // Not tracked in basic profile
    netIncome: Number(fp.netIncome),
    currentPension: 0, // Not tracked in basic profile
  };

  return (
    <BusinessAnalysisDashboard
      businessName={prospect.businessName}
      agentCode={prospect.agent.referralCode || agentCode}
      agentName={`${prospect.agent.firstName} ${prospect.agent.lastName}`}
      agentPhone={prospect.agent.phone}
      agentEmail={prospect.agent.email}
      organizationName={prospect.agent.organization?.name}
      organizationLogo={prospect.agent.organization?.logo}
      primaryColor={prospect.agent.organization?.primaryColor || '#0f172a'}
      yearlyData={yearlyData.length > 0 ? yearlyData : undefined}
      currentYearData={currentYearData}
    />
  );
}
