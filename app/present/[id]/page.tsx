import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import PresentationView from './PresentationView';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session?: string }>;
}

export default async function PresentPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { session: sessionId } = await searchParams;

  // Fetch prospect with financial data
  const prospect = await db.prospect.findUnique({
    where: { id },
    include: {
      financialProfile: true,
      insuranceNeeds: {
        orderBy: { priority: 'asc' },
      },
      agentProjection: true,
      agent: {
        select: {
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      },
    },
  });

  if (!prospect || !prospect.financialProfile) {
    notFound();
  }

  const profile = prospect.financialProfile;

  // Calculate totals
  const totalAssets = Number(profile.savings) +
    Number(profile.investments) +
    Number(profile.retirement401k) +
    Number(profile.homeEquity) +
    Number(profile.otherAssets);

  const totalLiabilities = Number(profile.mortgage) +
    Number(profile.carLoans) +
    Number(profile.studentLoans) +
    Number(profile.creditCards) +
    Number(profile.otherDebts);

  const netWorth = totalAssets - totalLiabilities;

  const totalMonthlyIncome = (
    Number(profile.annualIncome) +
    Number(profile.spouseIncome || 0) +
    Number(profile.otherIncome || 0)
  ) / 12;

  const totalRecommendedCoverage = prospect.insuranceNeeds.reduce(
    (sum, need) => sum + Number(need.recommendedCoverage),
    0
  );
  const totalCurrentCoverage = prospect.insuranceNeeds.reduce(
    (sum, need) => sum + Number(need.currentCoverage),
    0
  );
  const protectionGap = totalRecommendedCoverage - totalCurrentCoverage;

  const yearsToRetirement = profile.retirementAge - profile.age;

  // Prepare presentation data
  const presentationData = {
    prospect: {
      firstName: prospect.firstName,
      lastName: prospect.lastName,
    },
    agent: prospect.agent,
    sessionId: sessionId || null,
    financials: {
      totalAssets,
      totalLiabilities,
      netWorth,
      monthlyIncome: totalMonthlyIncome,
      monthlyExpenses: Number(profile.monthlyExpenses),
      monthlySurplus: totalMonthlyIncome - Number(profile.monthlyExpenses),
      assets: {
        savings: Number(profile.savings),
        investments: Number(profile.investments),
        retirement401k: Number(profile.retirement401k),
        homeEquity: Number(profile.homeEquity),
        otherAssets: Number(profile.otherAssets),
      },
      liabilities: {
        mortgage: Number(profile.mortgage),
        carLoans: Number(profile.carLoans),
        studentLoans: Number(profile.studentLoans),
        creditCards: Number(profile.creditCards),
        otherDebts: Number(profile.otherDebts),
      },
    },
    protection: {
      totalRecommended: totalRecommendedCoverage,
      totalCurrent: totalCurrentCoverage,
      gap: protectionGap,
      needs: prospect.insuranceNeeds.map(need => ({
        type: need.type,
        recommended: Number(need.recommendedCoverage),
        current: Number(need.currentCoverage),
        gap: Number(need.gap),
        priority: need.priority,
        reasoning: need.reasoning,
      })),
    },
    retirement: {
      currentAge: profile.age,
      targetAge: profile.retirementAge,
      yearsToGo: yearsToRetirement,
    },
    agentProjection: prospect.agentProjection ? {
      year1Income: Number(prospect.agentProjection.year1Income),
      year3Income: Number(prospect.agentProjection.year3Income),
      year5Income: Number(prospect.agentProjection.year5Income),
      lifetimeValue: Number(prospect.agentProjection.lifetimeValue),
    } : null,
  };

  return <PresentationView data={presentationData} />;
}
