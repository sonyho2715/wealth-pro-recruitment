import { redirect } from 'next/navigation';
import { getProspectData } from '../actions';
import ResultsClient from './ResultsClient';

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function ResultsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const prospectId = params.id;

  if (!prospectId) {
    redirect('/prospect');
  }

  const prospect = await getProspectData(prospectId);

  if (!prospect || !prospect.financialProfile) {
    redirect('/prospect');
  }

  // Convert Prisma Decimal types to numbers for client component
  const serializedProspect = {
    ...prospect,
    financialProfile: prospect.financialProfile ? {
      ...prospect.financialProfile,
      annualIncome: Number(prospect.financialProfile.annualIncome),
      spouseIncome: prospect.financialProfile.spouseIncome ? Number(prospect.financialProfile.spouseIncome) : null,
      otherIncome: prospect.financialProfile.otherIncome ? Number(prospect.financialProfile.otherIncome) : null,
      monthlyExpenses: Number(prospect.financialProfile.monthlyExpenses),
      housingCost: Number(prospect.financialProfile.housingCost),
      debtPayments: Number(prospect.financialProfile.debtPayments),
      savings: Number(prospect.financialProfile.savings),
      investments: Number(prospect.financialProfile.investments),
      retirement401k: Number(prospect.financialProfile.retirement401k),
      homeMarketValue: Number(prospect.financialProfile.homeMarketValue),
      homeEquity: Number(prospect.financialProfile.homeEquity),
      otherAssets: Number(prospect.financialProfile.otherAssets),
      mortgage: Number(prospect.financialProfile.mortgage),
      carLoans: Number(prospect.financialProfile.carLoans),
      studentLoans: Number(prospect.financialProfile.studentLoans),
      creditCards: Number(prospect.financialProfile.creditCards),
      otherDebts: Number(prospect.financialProfile.otherDebts),
      netWorth: Number(prospect.financialProfile.netWorth),
      monthlyGap: Number(prospect.financialProfile.monthlyGap),
      protectionGap: Number(prospect.financialProfile.protectionGap),
      currentLifeInsurance: Number(prospect.financialProfile.currentLifeInsurance),
      currentDisability: Number(prospect.financialProfile.currentDisability),
    } : null,
    insuranceNeeds: prospect.insuranceNeeds.map(need => ({
      ...need,
      recommendedCoverage: Number(need.recommendedCoverage),
      currentCoverage: Number(need.currentCoverage),
      gap: Number(need.gap),
      monthlyPremium: need.monthlyPremium ? Number(need.monthlyPremium) : null,
    })),
    agentProjection: prospect.agentProjection ? {
      ...prospect.agentProjection,
      year1Income: Number(prospect.agentProjection.year1Income),
      year3Income: Number(prospect.agentProjection.year3Income),
      year5Income: Number(prospect.agentProjection.year5Income),
      lifetimeValue: Number(prospect.agentProjection.lifetimeValue),
    } : null,
    comparisons: prospect.comparisons.map(comp => ({
      ...comp,
      baselineNetWorthAt65: Number(comp.baselineNetWorthAt65),
      agentNetWorthAt65: Number(comp.agentNetWorthAt65),
      additionalIncome: Number(comp.additionalIncome),
      additionalNetWorth: Number(comp.additionalNetWorth),
    })),
  };

  return <ResultsClient prospect={serializedProspect} />;
}
