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
  Home,
  Car,
  GraduationCap,
  CreditCard,
  PiggyBank,
  Landmark,
  BarChart3,
} from 'lucide-react';

interface ResultsDisplayProps {
  prospect: {
    firstName: string;
    lastName: string;
    email: string;
    age: number;
    dependents: number;
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
    totalAssets: number;
    totalDebts: number;
    netWorth: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlySurplus: number;
    totalIncome: number;
    currentCoverage: number;
    recommendedCoverage: number;
    protectionGap: number;
    savings: number;
    retirement: number;
    homeValue: number;
    otherAssets: number;
    mortgage: number;
    carLoans: number;
    studentLoans: number;
    creditCards: number;
    otherDebts: number;
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

export default function ResultsDisplay({ prospect, agent, financials }: ResultsDisplayProps) {
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const isNetWorthPositive = financials.netWorth >= 0;
  const hasSurplus = financials.monthlySurplus >= 0;
  const hasProtectionGap = financials.protectionGap > 0;

  // Calculate health score
  let healthScore = 50;
  if (isNetWorthPositive) healthScore += 20;
  if (hasSurplus) healthScore += 15;
  if (!hasProtectionGap) healthScore += 15;
  if (financials.savings >= financials.monthlyExpenses * 3) healthScore += 10;
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
        {/* Greeting */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-full mb-4">
            <span className="text-xs font-medium uppercase tracking-wider">
              Your Financial Snapshot
            </span>
          </span>
          <h1 className="text-3xl md:text-4xl font-medium text-slate-900 mb-2 tracking-tight font-serif">
            {prospect.firstName}, Here&apos;s Your Overview
          </h1>
          <p className="text-slate-600">Based on the information you provided</p>
        </div>

        {/* Health Score Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Financial Health Score</h2>
              <p className="text-sm text-slate-500">A snapshot of your overall financial wellness</p>
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

        {/* Main Stats Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Net Worth */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
              {isNetWorthPositive ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              Net Worth
            </div>
            <div
              className={`text-3xl font-bold ${
                isNetWorthPositive ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(financials.netWorth)}
            </div>
            <p className="text-xs text-slate-400 mt-2">Assets minus Debts</p>
          </div>

          {/* Monthly Cash Flow */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
              <DollarSign className="w-4 h-4" />
              Monthly Cash Flow
            </div>
            <div
              className={`text-3xl font-bold ${hasSurplus ? 'text-emerald-600' : 'text-red-600'}`}
            >
              {hasSurplus ? '+' : ''}
              {formatCurrency(financials.monthlySurplus)}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {formatCurrency(financials.monthlyIncome)} income -{' '}
              {formatCurrency(financials.monthlyExpenses)} expenses
            </p>
          </div>

          {/* Protection Gap */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
              <Shield className="w-4 h-4" />
              Protection Gap
            </div>
            <div
              className={`text-3xl font-bold ${
                hasProtectionGap ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              {hasProtectionGap ? formatCurrency(financials.protectionGap) : 'Covered'}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {hasProtectionGap
                ? `Need ${formatCurrency(financials.recommendedCoverage)} total`
                : 'Recommended coverage met'}
            </p>
          </div>
        </div>

        {/* Assets vs Debts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Assets */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <PiggyBank className="w-4 h-4 text-emerald-600" />
              </div>
              Your Assets
            </h3>
            <div className="text-2xl font-bold text-emerald-600 mb-4">
              {formatCurrency(financials.totalAssets)}
            </div>
            <div className="space-y-3">
              {financials.savings > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-slate-400" /> Savings
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(financials.savings)}
                  </span>
                </div>
              )}
              {financials.retirement > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 text-sm flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-slate-400" /> Retirement
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(financials.retirement)}
                  </span>
                </div>
              )}
              {financials.homeValue > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 text-sm flex items-center gap-2">
                    <Home className="w-4 h-4 text-slate-400" /> Home Value
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(financials.homeValue)}
                  </span>
                </div>
              )}
              {financials.otherAssets > 0 && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-slate-400" /> Other
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(financials.otherAssets)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Debts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-red-600" />
              </div>
              Your Debts
            </h3>
            <div className="text-2xl font-bold text-red-600 mb-4">
              {formatCurrency(financials.totalDebts)}
            </div>
            <div className="space-y-3">
              {financials.mortgage > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 text-sm flex items-center gap-2">
                    <Home className="w-4 h-4 text-slate-400" /> Mortgage
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(financials.mortgage)}
                  </span>
                </div>
              )}
              {financials.carLoans > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 text-sm flex items-center gap-2">
                    <Car className="w-4 h-4 text-slate-400" /> Car Loans
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(financials.carLoans)}
                  </span>
                </div>
              )}
              {financials.studentLoans > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 text-sm flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-slate-400" /> Student Loans
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(financials.studentLoans)}
                  </span>
                </div>
              )}
              {financials.creditCards > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-400" /> Credit Cards
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(financials.creditCards)}
                  </span>
                </div>
              )}
              {financials.otherDebts > 0 && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-slate-400" /> Other
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(financials.otherDebts)}
                  </span>
                </div>
              )}
              {financials.totalDebts === 0 && (
                <div className="text-emerald-600 text-sm flex items-center gap-2 py-2">
                  <CheckCircle className="w-4 h-4" /> Debt-free!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-slate-900 rounded-2xl p-8 md:p-10 text-center">
          {!contactSubmitted ? (
            <>
              <h2 className="text-2xl md:text-3xl font-medium text-white mb-3 font-serif">
                Want a Deeper Analysis?
              </h2>
              <p className="text-slate-300 mb-8 max-w-xl mx-auto">
                This is just a snapshot. {agent.firstName} can help you understand your complete
                financial picture and create a personalized plan to reach your goals.
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
                    href={`mailto:${agent.email}?subject=Financial Review Follow-up&body=Hi ${agent.firstName},%0D%0A%0D%0AI just completed my financial review and would like to discuss my results with you.%0D%0A%0D%0ABest,%0D%0A${prospect.firstName}`}
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
                {agent.firstName} will reach out to you soon at {prospect.email}.
              </p>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-10 text-center text-xs text-slate-500 max-w-2xl mx-auto">
          <p>
            This financial snapshot is for informational purposes only and does not constitute
            financial advice. Results are based on the information you provided and general
            assumptions. Consult a licensed financial professional for personalized guidance.
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
