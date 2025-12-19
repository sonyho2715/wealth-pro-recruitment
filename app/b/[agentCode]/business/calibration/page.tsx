import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import CalibrationPageClient from './CalibrationPageClient';

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
          calibration: {
            include: {
              industry: {
                select: {
                  id: true,
                  naicsCode: true,
                  title: true,
                  shortTitle: true,
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

async function getIndustries() {
  const industries = await db.industryClassification.findMany({
    where: { isActive: true },
    select: {
      id: true,
      naicsCode: true,
      title: true,
      shortTitle: true,
      level: true,
      parentCode: true,
      _count: {
        select: { benchmarks: true },
      },
    },
    orderBy: { naicsCode: 'asc' },
  });

  return industries.map((i) => ({
    id: i.id,
    naicsCode: i.naicsCode,
    title: i.title,
    shortTitle: i.shortTitle,
    level: i.level,
    parentCode: i.parentCode,
    hasBenchmark: i._count.benchmarks > 0,
  }));
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
      title: 'Industry Calibration (Demo) - Wealth Pro',
      description: 'See how your business compares to industry peers.',
    };
  }

  if (!id) {
    return { title: 'Industry Calibration - Wealth Pro' };
  }

  const prospect = await getBusinessProspectData(id);

  if (!prospect) {
    return { title: 'Calibration Not Found' };
  }

  return {
    title: `Industry Calibration | ${prospect.businessName} - Wealth Pro`,
    description: `Industry benchmarking analysis for ${prospect.businessName}.`,
  };
}

export default async function CalibrationPage({ params, searchParams }: PageProps) {
  const { agentCode } = await params;
  const { id, demo } = await searchParams;

  const industries = await getIndustries();

  // Demo mode
  if (demo === 'true') {
    const agent = await getAgentByCode(agentCode);

    if (!agent) {
      notFound();
    }

    // Demo data for Zion Glass
    const demoMetrics = {
      revenue: 776000,
      costOfGoodsSold: 420000,
      grossProfit: 356000,
      netIncome: -51900,
      wages: 180000,
      pensionContributions: 0,
      currentAssets: 125000,
      currentLiabilities: 95000,
      totalLiabilities: 285000,
      totalEquity: 120000,
    };

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <CalibrationPageClient
            businessName="Zion Glass Company (Demo)"
            businessProfileId="demo"
            metrics={demoMetrics}
            industries={industries}
            initialIndustryId={null}
            agentCode={agent.referralCode || agentCode}
            agentName={`${agent.firstName} ${agent.lastName}`}
            agentEmail={agent.email}
            agentPhone={agent.phone}
            organizationName={agent.organization?.name}
            isDemo
          />
        </div>
      </div>
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

  // Build metrics from financial profile
  const metrics = {
    revenue: Number(fp.annualRevenue),
    costOfGoodsSold: Number(fp.costOfGoodsSold || 0),
    grossProfit: Number(fp.grossProfit),
    netIncome: Number(fp.netIncome),
    wages: Number(fp.ownerSalary || 0),
    pensionContributions: 0, // Add this field to profile if needed
    currentAssets:
      Number(fp.cashOnHand || 0) + Number(fp.accountsReceivable || 0) + Number(fp.inventory || 0),
    currentLiabilities:
      Number(fp.accountsPayable || 0) +
      Number(fp.shortTermLoans || 0) +
      Number(fp.creditCards || 0) +
      Number(fp.lineOfCredit || 0),
    totalLiabilities: Number(fp.totalLiabilities || 0),
    totalEquity: Number(fp.netWorth || 0),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CalibrationPageClient
          businessName={prospect.businessName}
          businessProfileId={fp.id}
          metrics={metrics}
          industries={industries}
          initialIndustryId={fp.calibration?.industryId || null}
          agentCode={prospect.agent.referralCode || agentCode}
          agentName={`${prospect.agent.firstName} ${prospect.agent.lastName}`}
          agentEmail={prospect.agent.email}
          agentPhone={prospect.agent.phone}
          organizationName={prospect.agent.organization?.name}
        />
      </div>
    </div>
  );
}
