import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, FileText, Edit, Download } from 'lucide-react';
import BalanceSheetClient from './BalanceSheetClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BalanceSheetDetailPage({ params }: PageProps) {
  const session = await getSession();
  if (!session.agentId) redirect('/agent/login');

  const { id } = await params;

  // Fetch prospect with all related data
  const prospect = await db.prospect.findUnique({
    where: { id },
    include: {
      financialProfile: true,
      insuranceNeeds: {
        orderBy: { priority: 'asc' },
      },
      agentProjection: true,
    },
  });

  if (!prospect) {
    notFound();
  }

  const profile = prospect.financialProfile;
  if (!profile) {
    return (
      <div className="p-6 lg:p-8">
        <div className="card-gradient text-center py-12">
          <p className="text-gray-600 mb-4">No financial profile found for this prospect</p>
          <Link
            href={`/prospect?id=${prospect.id}`}
            className="btn-primary inline-block"
          >
            Complete Financial Intake
          </Link>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    LEAD: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'New Lead' },
    QUALIFIED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Qualified' },
    INSURANCE_CLIENT: { bg: 'bg-green-100', text: 'text-green-700', label: 'Insurance Client' },
    AGENT_PROSPECT: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Agent Prospect' },
    LICENSED_AGENT: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Licensed Agent' },
    INACTIVE: { bg: 'bg-red-100', text: 'text-red-700', label: 'Inactive' },
  };

  const status = statusColors[prospect.status] || statusColors.LEAD;

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

  // Calculate monthly cash flow
  const totalMonthlyIncome = (
    Number(profile.annualIncome) +
    Number(profile.spouseIncome || 0) +
    Number(profile.otherIncome || 0)
  ) / 12;
  const monthlyExpenses = Number(profile.monthlyExpenses);
  const monthlyGap = totalMonthlyIncome - monthlyExpenses;

  // Calculate protection gap
  const totalRecommendedCoverage = prospect.insuranceNeeds.reduce(
    (sum, need) => sum + Number(need.recommendedCoverage),
    0
  );
  const totalCurrentCoverage = prospect.insuranceNeeds.reduce(
    (sum, need) => sum + Number(need.currentCoverage),
    0
  );
  const protectionGap = totalRecommendedCoverage - totalCurrentCoverage;

  // Retirement projection
  const yearsToRetirement = profile.retirementAge - profile.age;

  // Prepare data for client component
  const chartData = {
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
    cashFlow: {
      income: totalMonthlyIncome,
      expenses: monthlyExpenses,
    },
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/agent/dashboard/prospects"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Prospects
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {prospect.firstName} {prospect.lastName}
              </h1>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>
                {status.label}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span>{prospect.email}</span>
              {prospect.phone && <span>{prospect.phone}</span>}
              <span>Last updated: {new Date(profile.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary text-sm flex items-center gap-2">
              <Download className="w-4 h-4" />
              Generate PDF
            </button>
            <a
              href={`mailto:${prospect.email}?subject=Your Living Balance Sheet&body=Hi ${prospect.firstName}, I've prepared your personalized Living Balance Sheet...`}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Send to Client
            </a>
            <Link
              href={`/agent/dashboard/prospects/${prospect.id}/edit`}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Net Worth Section */}
      <div className="card-gradient mb-6">
        <div className="text-center mb-6">
          <h2 className="text-lg text-gray-600 mb-2">Total Net Worth</h2>
          <p className={`text-5xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${netWorth.toLocaleString()}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Total Assets</p>
            <p className="text-2xl font-bold text-green-600">
              ${totalAssets.toLocaleString()}
            </p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Total Liabilities</p>
            <p className="text-2xl font-bold text-red-600">
              ${totalLiabilities.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Charts and Details */}
      <BalanceSheetClient
        chartData={chartData}
        assets={chartData.assets}
        liabilities={chartData.liabilities}
        insuranceNeeds={prospect.insuranceNeeds.map(need => ({
          id: need.id,
          type: need.type,
          recommendedCoverage: Number(need.recommendedCoverage),
          currentCoverage: Number(need.currentCoverage),
          gap: Number(need.gap),
          monthlyPremium: need.monthlyPremium ? Number(need.monthlyPremium) : null,
          priority: need.priority,
          reasoning: need.reasoning,
        }))}
        totalRecommendedCoverage={totalRecommendedCoverage}
        totalCurrentCoverage={totalCurrentCoverage}
        protectionGap={protectionGap}
        yearsToRetirement={yearsToRetirement}
        retirementAge={profile.retirementAge}
        currentAge={profile.age}
        agentProjection={prospect.agentProjection ? {
          year1Income: Number(prospect.agentProjection.year1Income),
          year3Income: Number(prospect.agentProjection.year3Income),
          year5Income: Number(prospect.agentProjection.year5Income),
          lifetimeValue: Number(prospect.agentProjection.lifetimeValue),
        } : null}
      />
    </div>
  );
}
