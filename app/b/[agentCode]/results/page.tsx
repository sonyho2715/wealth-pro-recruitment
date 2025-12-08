import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import ResultsDisplay from './ResultsDisplay';

interface PageProps {
  params: Promise<{ agentCode: string }>;
  searchParams: Promise<{ id?: string }>;
}

async function getProspectData(prospectId: string) {
  const prospect = await db.prospect.findUnique({
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

  const prospect = await getProspectData(id);

  if (!prospect) {
    return { title: 'Results Not Found' };
  }

  return {
    title: `Your Financial Snapshot | ${prospect.firstName}`,
    description: 'See your personalized Living Balance Sheet results.',
  };
}

export default async function ResultsPage({ params, searchParams }: PageProps) {
  const { agentCode } = await params;
  const { id } = await searchParams;

  if (!id) {
    redirect(`/${agentCode}`);
  }

  const prospect = await getProspectData(id);

  if (!prospect || !prospect.financialProfile || !prospect.agent) {
    notFound();
  }

  const fp = prospect.financialProfile;

  // Calculate summary data
  const totalAssets =
    Number(fp.savings) +
    Number(fp.emergencyFund) +
    Number(fp.investments) +
    Number(fp.retirement401k) +
    Number(fp.rothIra) +
    Number(fp.pensionValue) +
    Number(fp.hsaFsa) +
    Number(fp.homeMarketValue) +
    Number(fp.investmentProperty) +
    Number(fp.businessEquity) +
    Number(fp.otherAssets);

  const totalDebts =
    Number(fp.mortgage) +
    Number(fp.carLoans) +
    Number(fp.studentLoans) +
    Number(fp.creditCards) +
    Number(fp.personalLoans) +
    Number(fp.otherDebts);

  const netWorth = totalAssets - totalDebts;
  const totalIncome = Number(fp.annualIncome) + Number(fp.spouseIncome);
  const monthlyIncome = totalIncome / 12;
  const monthlyExpenses = Number(fp.monthlyExpenses);
  const monthlySurplus = monthlyIncome - monthlyExpenses;

  // Protection calculations
  const recommendedCoverage = totalIncome * 10;
  const currentCoverage = Number(fp.currentLifeInsurance);
  const protectionGap = Math.max(0, recommendedCoverage - currentCoverage);

  return (
    <ResultsDisplay
      prospect={{
        firstName: prospect.firstName,
        lastName: prospect.lastName,
        email: prospect.email,
        age: fp.age,
        dependents: fp.dependents,
      }}
      agent={{
        firstName: prospect.agent.firstName,
        lastName: prospect.agent.lastName,
        email: prospect.agent.email,
        phone: prospect.agent.phone,
        referralCode: prospect.agent.referralCode || agentCode,
        organizationName: prospect.agent.organization?.name,
        logo: prospect.agent.organization?.logo,
        primaryColor: prospect.agent.organization?.primaryColor || '#3B82F6',
      }}
      financials={{
        totalAssets,
        totalDebts,
        netWorth,
        monthlyIncome,
        monthlyExpenses,
        monthlySurplus,
        totalIncome,
        currentCoverage,
        recommendedCoverage,
        protectionGap,
        // Asset breakdown
        savings: Number(fp.savings),
        retirement: Number(fp.retirement401k) + Number(fp.rothIra),
        homeValue: Number(fp.homeMarketValue),
        otherAssets: Number(fp.investments) + Number(fp.otherAssets),
        // Debt breakdown
        mortgage: Number(fp.mortgage),
        carLoans: Number(fp.carLoans),
        studentLoans: Number(fp.studentLoans),
        creditCards: Number(fp.creditCards),
        otherDebts: Number(fp.personalLoans) + Number(fp.otherDebts),
      }}
    />
  );
}
