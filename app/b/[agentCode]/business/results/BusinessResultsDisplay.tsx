'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Shield,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Building2,
  Landmark,
  CreditCard,
  Briefcase,
  Users,
  BarChart3,
  FileText,
  Scale,
  Calculator,
  ArrowRight,
} from 'lucide-react';

interface BusinessResultsDisplayProps {
  businessProspect: {
    firstName: string;
    lastName: string;
    email: string;
    businessName: string;
    businessType: string;
    industry: string | null;
    yearsInBusiness: number;
    employeeCount: number;
  };
  agent: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    referralCode: string;
    organizationName?: string | null;
    logo?: string | null;
    primaryColor: string;
  };
  financials: {
    annualRevenue: number;
    grossProfit: number;
    netIncome: number;
    ownerSalary: number;
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    currentRatio: number;
    debtToEquityRatio: number;
    keyPersonGap: number;
    buyoutFundingGap: number;
    cashOnHand: number;
    accountsReceivable: number;
    inventory: number;
    equipment: number;
    vehicles: number;
    realEstate: number;
    investments: number;
    accountsPayable: number;
    shortTermLoans: number;
    creditCards: number;
    lineOfCredit: number;
    termLoans: number;
    sbaLoans: number;
    equipmentLoans: number;
    commercialMortgage: number;
    keyPersonInsurance: number;
    generalLiability: number;
    propertyInsurance: number;
    businessInterruption: number;
    buyerSellerAgreement: boolean;
    successionPlan: boolean;
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatRatio(ratio: number): string {
  return ratio.toFixed(2);
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function getRatioHealth(ratio: number, type: 'current' | 'debt') {
  if (type === 'current') {
    // Current ratio: > 2 is great, 1.5-2 is good, 1-1.5 is fair, < 1 is concerning
    if (ratio >= 2) return { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-100' };
    if (ratio >= 1.5) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (ratio >= 1) return { label: 'Fair', color: 'text-amber-600', bg: 'bg-amber-100' };
    return { label: 'Concerning', color: 'text-red-600', bg: 'bg-red-100' };
  } else {
    // Debt-to-equity: < 1 is good, 1-2 is fair, > 2 is concerning
    if (ratio <= 0.5) return { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-100' };
    if (ratio <= 1) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (ratio <= 2) return { label: 'Fair', color: 'text-amber-600', bg: 'bg-amber-100' };
    return { label: 'High Risk', color: 'text-red-600', bg: 'bg-red-100' };
  }
}

export default function BusinessResultsDisplay({
  businessProspect,
  agent,
  financials,
}: BusinessResultsDisplayProps) {
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const isNetWorthPositive = financials.netWorth >= 0;
  const hasKeyPersonGap = financials.keyPersonGap > 0;
  const hasBuyoutGap = financials.buyoutFundingGap > 0;
  const currentRatioHealth = getRatioHealth(financials.currentRatio, 'current');
  const debtRatioHealth = getRatioHealth(financials.debtToEquityRatio, 'debt');

  // Calculate business health score
  let healthScore = 50;
  if (isNetWorthPositive) healthScore += 15;
  if (financials.currentRatio >= 1.5) healthScore += 15;
  if (financials.debtToEquityRatio <= 1) healthScore += 10;
  if (!hasKeyPersonGap) healthScore += 5;
  if (financials.buyerSellerAgreement) healthScore += 5;
  if (financials.successionPlan) healthScore += 5;
  if (financials.businessInterruption > 0) healthScore += 5;
  healthScore = Math.min(100, Math.max(0, healthScore));

  const getHealthLabel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-100' };
    if (score >= 60) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 40) return { label: 'Fair', color: 'text-amber-600', bg: 'bg-amber-100' };
    return { label: 'Needs Attention', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const health = getHealthLabel(healthScore);

  const handleContactRequest = async () => {
    setContactSubmitted(true);
  };

  const businessTypeLabels: Record<string, string> = {
    SOLE_PROPRIETORSHIP: 'Sole Proprietorship',
    LLC: 'LLC',
    PARTNERSHIP: 'Partnership',
    S_CORP: 'S Corporation',
    C_CORP: 'C Corporation',
    NONPROFIT: 'Nonprofit',
    OTHER: 'Other',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {agent.logo ? (
              <img src={agent.logo} alt={agent.organizationName || 'Logo'} className="h-8 w-auto" />
            ) : (
              <>
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-slate-900 tracking-tight">
                  {agent.organizationName || 'Wealth Pro'}
                </span>
              </>
            )}
          </Link>
          <div className="text-sm text-slate-500">
            Your Advisor:{' '}
            <span className="text-slate-900 font-medium">
              {agent.firstName} {agent.lastName}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Business Info & Greeting */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4">
            <Building2 className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Business Financial Analysis
            </span>
          </span>
          <h1 className="text-3xl md:text-4xl font-medium text-slate-900 mb-2 tracking-tight font-serif">
            {businessProspect.businessName}
          </h1>
          <p className="text-slate-600">
            {businessTypeLabels[businessProspect.businessType] || businessProspect.businessType}
            {businessProspect.industry && ` • ${businessProspect.industry}`} •{' '}
            {businessProspect.yearsInBusiness} years • {businessProspect.employeeCount} employees
          </p>
        </div>

        {/* Health Score Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Business Health Score</h2>
              <p className="text-sm text-slate-500">
                Overall assessment of your business finances
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-slate-900">{healthScore}</div>
              <div className={`text-sm font-medium ${health.color}`}>{health.label}</div>
            </div>
          </div>
          <ProgressBar
            value={healthScore}
            max={100}
            color={healthScore >= 60 ? 'bg-emerald-500' : 'bg-amber-500'}
          />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {/* Annual Revenue */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
              <DollarSign className="w-4 h-4" />
              Annual Revenue
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(financials.annualRevenue)}
            </div>
          </div>

          {/* Net Income */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
              <TrendingUp className="w-4 h-4" />
              Net Income
            </div>
            <div
              className={`text-2xl font-bold ${
                financials.netIncome >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(financials.netIncome)}
            </div>
          </div>

          {/* Net Worth (Business Equity) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
              <Landmark className="w-4 h-4" />
              Business Equity
            </div>
            <div
              className={`text-2xl font-bold ${
                isNetWorthPositive ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(financials.netWorth)}
            </div>
          </div>

          {/* Owner Compensation */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
              <Briefcase className="w-4 h-4" />
              Owner Salary
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(financials.ownerSalary)}
            </div>
          </div>
        </div>

        {/* Financial Ratios */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-slate-400" />
                <h3 className="font-semibold text-slate-900">Current Ratio</h3>
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded ${currentRatioHealth.bg} ${currentRatioHealth.color}`}>
                {currentRatioHealth.label}
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {formatRatio(financials.currentRatio)}
            </div>
            <p className="text-xs text-slate-500">
              Measures ability to pay short-term obligations. Ideal: 1.5 - 2.0
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-slate-400" />
                <h3 className="font-semibold text-slate-900">Debt-to-Equity</h3>
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded ${debtRatioHealth.bg} ${debtRatioHealth.color}`}>
                {debtRatioHealth.label}
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {formatRatio(financials.debtToEquityRatio)}
            </div>
            <p className="text-xs text-slate-500">
              Measures financial leverage. Lower is generally better. Ideal: &lt; 1.0
            </p>
          </div>
        </div>

        {/* Protection Gaps */}
        {(hasKeyPersonGap || hasBuyoutGap || !financials.successionPlan) && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-amber-900">Business Protection Gaps Identified</h3>
            </div>
            <div className="space-y-3">
              {hasKeyPersonGap && (
                <div className="flex items-center justify-between py-2 border-b border-amber-200">
                  <span className="text-amber-800">Key Person Insurance Gap</span>
                  <span className="font-semibold text-amber-900">
                    {formatCurrency(financials.keyPersonGap)}
                  </span>
                </div>
              )}
              {hasBuyoutGap && (
                <div className="flex items-center justify-between py-2 border-b border-amber-200">
                  <span className="text-amber-800">Buy-Sell Funding Gap</span>
                  <span className="font-semibold text-amber-900">
                    {formatCurrency(financials.buyoutFundingGap)}
                  </span>
                </div>
              )}
              {!financials.successionPlan && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-amber-800">No Succession Plan</span>
                  <span className="font-semibold text-amber-900">Recommended</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assets vs Liabilities */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Assets */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              Business Assets
            </h3>
            <div className="text-2xl font-bold text-emerald-600 mb-4">
              {formatCurrency(financials.totalAssets)}
            </div>
            <div className="space-y-2">
              {financials.cashOnHand > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 text-sm">Cash on Hand</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(financials.cashOnHand)}
                  </span>
                </div>
              )}
              {financials.accountsReceivable > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 text-sm">Accounts Receivable</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(financials.accountsReceivable)}
                  </span>
                </div>
              )}
              {financials.inventory > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 text-sm">Inventory</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(financials.inventory)}
                  </span>
                </div>
              )}
              {financials.equipment > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 text-sm">Equipment</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(financials.equipment)}
                  </span>
                </div>
              )}
              {financials.vehicles > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 text-sm">Vehicles</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(financials.vehicles)}
                  </span>
                </div>
              )}
              {financials.realEstate > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 text-sm">Real Estate</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(financials.realEstate)}
                  </span>
                </div>
              )}
              {financials.investments > 0 && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600 text-sm">Investments</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(financials.investments)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Liabilities */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-red-600" />
              </div>
              Business Liabilities
            </h3>
            <div className="text-2xl font-bold text-red-600 mb-4">
              {formatCurrency(financials.totalLiabilities)}
            </div>
            <div className="space-y-2">
              {financials.accountsPayable > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 text-sm">Accounts Payable</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(financials.accountsPayable)}
                  </span>
                </div>
              )}
              {financials.creditCards > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 text-sm">Credit Cards</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(financials.creditCards)}
                  </span>
                </div>
              )}
              {financials.lineOfCredit > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 text-sm">Line of Credit</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(financials.lineOfCredit)}
                  </span>
                </div>
              )}
              {financials.termLoans > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 text-sm">Term Loans</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(financials.termLoans)}
                  </span>
                </div>
              )}
              {financials.sbaLoans > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 text-sm">SBA Loans</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(financials.sbaLoans)}
                  </span>
                </div>
              )}
              {financials.equipmentLoans > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 text-sm">Equipment Loans</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(financials.equipmentLoans)}
                  </span>
                </div>
              )}
              {financials.commercialMortgage > 0 && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600 text-sm">Commercial Mortgage</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(financials.commercialMortgage)}
                  </span>
                </div>
              )}
              {financials.totalLiabilities === 0 && (
                <div className="text-emerald-600 text-sm flex items-center gap-2 py-2">
                  <CheckCircle className="w-4 h-4" /> Debt-free!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Insurance Coverage */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
            Business Insurance Coverage
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 text-sm">Key Person Insurance</span>
                <span
                  className={`font-medium ${
                    financials.keyPersonInsurance > 0 ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {financials.keyPersonInsurance > 0
                    ? formatCurrency(financials.keyPersonInsurance)
                    : 'None'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 text-sm">General Liability</span>
                <span
                  className={`font-medium ${
                    financials.generalLiability > 0 ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {financials.generalLiability > 0
                    ? formatCurrency(financials.generalLiability)
                    : 'None'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 text-sm">Property Insurance</span>
                <span
                  className={`font-medium ${
                    financials.propertyInsurance > 0 ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {financials.propertyInsurance > 0
                    ? formatCurrency(financials.propertyInsurance)
                    : 'None'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 text-sm">Business Interruption</span>
                <span
                  className={`font-medium ${
                    financials.businessInterruption > 0 ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {financials.businessInterruption > 0
                    ? formatCurrency(financials.businessInterruption)
                    : 'None'}
                </span>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              {financials.buyerSellerAgreement ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              )}
              <span className="text-sm text-slate-700">
                Buy-Sell Agreement: {financials.buyerSellerAgreement ? 'In Place' : 'Not in Place'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {financials.successionPlan ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              )}
              <span className="text-sm text-slate-700">
                Succession Plan: {financials.successionPlan ? 'Documented' : 'Not Documented'}
              </span>
            </div>
          </div>
        </div>

        {/* What-If Analysis CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Calculator className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-white mb-1">
                  What-If Scenario Analysis
                </h3>
                <p className="text-blue-100 text-sm max-w-md">
                  Model different scenarios with interactive sliders. See how price adjustments,
                  cost reductions, and retirement contributions could improve your bottom line.
                </p>
              </div>
            </div>
            <Link
              href={`/b/${agent.referralCode}/business/analysis?demo=true`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-blue-50 text-blue-600 font-semibold rounded-xl transition shrink-0"
            >
              Try Analysis Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-slate-900 rounded-2xl p-8 md:p-10 text-center">
          {!contactSubmitted ? (
            <>
              <h2 className="text-2xl md:text-3xl font-medium text-white mb-3 font-serif">
                Ready to Protect Your Business?
              </h2>
              <p className="text-slate-300 mb-8 max-w-xl mx-auto">
                {agent.firstName} can help you address these gaps and create a comprehensive
                business protection strategy tailored to your needs.
              </p>

              {!showContactForm ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {agent.phone && (
                    <a
                      href={`tel:${agent.phone}`}
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition"
                    >
                      <Phone className="w-5 h-5" />
                      Call {agent.firstName}
                    </a>
                  )}
                  <button
                    onClick={() => setShowContactForm(true)}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 font-medium rounded-lg transition"
                  >
                    <Calendar className="w-5 h-5" />
                    Schedule a Call
                  </button>
                  <a
                    href={`mailto:${agent.email}?subject=Business Financial Review Follow-up&body=Hi ${agent.firstName},%0D%0A%0D%0AI just completed the business financial review for ${businessProspect.businessName} and would like to discuss the results with you.%0D%0A%0D%0ABest,%0D%0A${businessProspect.firstName}`}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-slate-600 hover:border-slate-400 text-white font-medium rounded-lg transition"
                  >
                    <Mail className="w-5 h-5" />
                    Email
                  </a>
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <p className="text-slate-300 mb-6">
                    Click below and {agent.firstName} will reach out to schedule a time that works
                    for you.
                  </p>
                  <button
                    onClick={handleContactRequest}
                    className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Yes, Have {agent.firstName} Contact Me
                  </button>
                  <button
                    onClick={() => setShowContactForm(false)}
                    className="mt-4 text-slate-400 hover:text-white text-sm transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-6">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-medium text-white mb-2 font-serif">Request Sent!</h2>
              <p className="text-slate-300">
                {agent.firstName} will reach out to you soon at {businessProspect.email}.
              </p>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-10 text-center text-xs text-slate-500 max-w-2xl mx-auto">
          <p>
            This business financial analysis is for informational purposes only and does not
            constitute financial or legal advice. Results are based on the information you provided
            and general business assumptions. Consult licensed professionals for personalized
            guidance on your business protection strategy.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 bg-white mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Wealth Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
