'use client';

import { useState } from 'react';
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
    // Breakdowns
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
    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
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

  // Calculate health score (simple version)
  let healthScore = 50;
  if (isNetWorthPositive) healthScore += 20;
  if (hasSurplus) healthScore += 15;
  if (!hasProtectionGap) healthScore += 15;
  if (financials.savings >= financials.monthlyExpenses * 3) healthScore += 10; // 3 month emergency fund
  healthScore = Math.min(100, Math.max(0, healthScore));

  const getHealthLabel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-400' };
    if (score >= 60) return { label: 'Good', color: 'text-blue-400' };
    if (score >= 40) return { label: 'Fair', color: 'text-yellow-400' };
    return { label: 'Needs Attention', color: 'text-red-400' };
  };

  const health = getHealthLabel(healthScore);

  const handleContactRequest = async () => {
    // In production, this would send a notification to the agent
    setContactSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {agent.logo ? (
              <img src={agent.logo} alt={agent.organizationName || 'Logo'} className="h-8 w-auto" />
            ) : (
              <div className="text-xl font-bold text-white">
                {agent.organizationName || 'Living Balance Sheet'}
              </div>
            )}
          </div>
          <div className="text-sm text-slate-400">
            Your Advisor: <span className="text-white font-medium">{agent.firstName} {agent.lastName}</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Greeting */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {prospect.firstName}, Here&apos;s Your Financial Snapshot
          </h1>
          <p className="text-slate-400">
            Based on the information you provided
          </p>
        </div>

        {/* Health Score Card */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Financial Health Score</h2>
            <span className={`text-2xl font-bold ${health.color}`}>{healthScore}/100</span>
          </div>
          <ProgressBar
            value={healthScore}
            max={100}
            color={healthScore >= 60 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-yellow-500 to-orange-400'}
          />
          <p className={`mt-2 text-sm ${health.color}`}>{health.label}</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Net Worth */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              {isNetWorthPositive ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              Net Worth
            </div>
            <div className={`text-3xl font-bold ${isNetWorthPositive ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(financials.netWorth)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Assets minus Debts</p>
          </div>

          {/* Monthly Cash Flow */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <DollarSign className="w-4 h-4" />
              Monthly Cash Flow
            </div>
            <div className={`text-3xl font-bold ${hasSurplus ? 'text-green-400' : 'text-red-400'}`}>
              {hasSurplus ? '+' : ''}{formatCurrency(financials.monthlySurplus)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {formatCurrency(financials.monthlyIncome)} income - {formatCurrency(financials.monthlyExpenses)} expenses
            </p>
          </div>

          {/* Protection Gap */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <Shield className="w-4 h-4" />
              Protection Gap
            </div>
            <div className={`text-3xl font-bold ${hasProtectionGap ? 'text-amber-400' : 'text-green-400'}`}>
              {hasProtectionGap ? formatCurrency(financials.protectionGap) : 'Covered'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {hasProtectionGap
                ? `Need ${formatCurrency(financials.recommendedCoverage)} total`
                : 'Recommended coverage met'}
            </p>
          </div>
        </div>

        {/* Assets vs Debts Visual */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Assets */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-green-400" />
              Your Assets
            </h3>
            <div className="text-2xl font-bold text-green-400 mb-4">
              {formatCurrency(financials.totalAssets)}
            </div>
            <div className="space-y-3">
              {financials.savings > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Savings
                  </span>
                  <span className="text-white">{formatCurrency(financials.savings)}</span>
                </div>
              )}
              {financials.retirement > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm flex items-center gap-2">
                    <Landmark className="w-4 h-4" /> Retirement
                  </span>
                  <span className="text-white">{formatCurrency(financials.retirement)}</span>
                </div>
              )}
              {financials.homeValue > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm flex items-center gap-2">
                    <Home className="w-4 h-4" /> Home Value
                  </span>
                  <span className="text-white">{formatCurrency(financials.homeValue)}</span>
                </div>
              )}
              {financials.otherAssets > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Other
                  </span>
                  <span className="text-white">{formatCurrency(financials.otherAssets)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Debts */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-red-400" />
              Your Debts
            </h3>
            <div className="text-2xl font-bold text-red-400 mb-4">
              {formatCurrency(financials.totalDebts)}
            </div>
            <div className="space-y-3">
              {financials.mortgage > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm flex items-center gap-2">
                    <Home className="w-4 h-4" /> Mortgage
                  </span>
                  <span className="text-white">{formatCurrency(financials.mortgage)}</span>
                </div>
              )}
              {financials.carLoans > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm flex items-center gap-2">
                    <Car className="w-4 h-4" /> Car Loans
                  </span>
                  <span className="text-white">{formatCurrency(financials.carLoans)}</span>
                </div>
              )}
              {financials.studentLoans > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" /> Student Loans
                  </span>
                  <span className="text-white">{formatCurrency(financials.studentLoans)}</span>
                </div>
              )}
              {financials.creditCards > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Credit Cards
                  </span>
                  <span className="text-white">{formatCurrency(financials.creditCards)}</span>
                </div>
              )}
              {financials.otherDebts > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Other
                  </span>
                  <span className="text-white">{formatCurrency(financials.otherDebts)}</span>
                </div>
              )}
              {financials.totalDebts === 0 && (
                <div className="text-green-400 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Debt-free!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg border border-blue-500/30 rounded-2xl p-8 text-center">
          {!contactSubmitted ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-3">
                Want a Detailed Analysis?
              </h2>
              <p className="text-slate-300 mb-6 max-w-xl mx-auto">
                This is just a snapshot. {agent.firstName} can help you understand your complete
                financial picture and create a plan to reach your goals.
              </p>

              {!showContactForm ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {agent.phone && (
                    <a
                      href={`tel:${agent.phone}`}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition"
                    >
                      <Phone className="w-5 h-5" />
                      Call {agent.firstName}
                    </a>
                  )}
                  <button
                    onClick={() => setShowContactForm(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition"
                  >
                    <Calendar className="w-5 h-5" />
                    Schedule a Call
                  </button>
                  <a
                    href={`mailto:${agent.email}?subject=Living Balance Sheet Follow-up&body=Hi ${agent.firstName},%0D%0A%0D%0AI just completed my Living Balance Sheet and would like to discuss my results with you.%0D%0A%0D%0ABest,%0D%0A${prospect.firstName}`}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition"
                  >
                    <Mail className="w-5 h-5" />
                    Email
                  </a>
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <p className="text-slate-300 mb-4">
                    Click below and {agent.firstName} will reach out to schedule a time that works for you.
                  </p>
                  <button
                    onClick={handleContactRequest}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Yes, Have {agent.firstName} Contact Me
                  </button>
                  <button
                    onClick={() => setShowContactForm(false)}
                    className="mt-2 text-slate-400 hover:text-white text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-4">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Request Sent!
              </h2>
              <p className="text-slate-300">
                {agent.firstName} will reach out to you soon at {prospect.email}.
              </p>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <p>
            This financial snapshot is for informational purposes only and does not constitute
            financial advice. Results are based on the information you provided and general
            assumptions. Consult a licensed financial professional for personalized guidance.
          </p>
        </div>
      </main>
    </div>
  );
}
