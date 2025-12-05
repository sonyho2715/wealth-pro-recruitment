'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PieChart,
  Shield,
  TrendingUp,
  DollarSign,
  ArrowRight,
  AlertTriangle,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  Heart,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Home,
  Mail,
  Loader2,
  Check,
  Pencil
} from 'lucide-react';
import ScenarioModal from '@/components/ScenarioModal';
import IncomeSlider, { IncomeProjection } from '@/components/IncomeSlider';
import ComplianceDisclaimer from '@/components/ComplianceDisclaimer';
import FinancialSnapshot from '@/components/FinancialSnapshot';
import EditFinancialDataModal from '@/components/EditFinancialDataModal';
import { sendFinancialSnapshot, updateFinancialProfile } from '../actions';
import { FINANCIAL_ASSUMPTIONS } from '@/lib/config';

interface InsuranceNeed {
  id: string;
  type: string;
  recommendedCoverage: number;
  currentCoverage: number;
  gap: number;
  monthlyPremium: number | null;
  priority: number;
  reasoning: string;
}

interface FinancialProfile {
  annualIncome: number;
  spouseIncome: number | null;
  otherIncome: number | null;
  monthlyExpenses: number;
  housingCost: number;
  debtPayments: number;
  savings: number;
  investments: number;
  retirement401k: number;
  homeMarketValue: number;
  homeEquity: number;
  otherAssets: number;
  mortgage: number;
  carLoans: number;
  studentLoans: number;
  creditCards: number;
  otherDebts: number;
  age: number;
  spouseAge: number | null;
  dependents: number;
  retirementAge: number;
  netWorth: number;
  monthlyGap: number;
  protectionGap: number;
  currentLifeInsurance: number;
  currentDisability: number;
}

interface AgentProjection {
  hoursPerWeek: number;
  networkSize: number;
  yearlyProjections: unknown;
  year1Income: number;
  year3Income: number;
  year5Income: number;
  lifetimeValue: number;
}

interface Comparison {
  baselineProjection: unknown;
  baselineRetirementAge: number;
  baselineNetWorthAt65: number;
  agentProjection: unknown;
  agentRetirementAge: number;
  agentNetWorthAt65: number;
  additionalIncome: number;
  yearsEarlierRetirement: number;
  additionalNetWorth: number;
}

interface Prospect {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  financialProfile: FinancialProfile | null;
  insuranceNeeds: InsuranceNeed[];
  agentProjection: AgentProjection | null;
  comparisons: Comparison[];
}

// State A tabs (Current Reality)
type RealityTab = 'balance-sheet' | 'insurance' | 'trajectory';
// State B tabs (Scenario Mode)
type ScenarioTab = 'opportunity' | 'comparison';

export default function ResultsClient({ prospect }: { prospect: Prospect }) {
  const router = useRouter();

  // TWO-STATE ARCHITECTURE
  // State A: Current Reality (default) - navy/grey theme
  // State B: Scenario Mode (requires consent) - green/gold theme
  const [isScenarioMode, setIsScenarioMode] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  // Tab states for each mode
  const [realityTab, setRealityTab] = useState<RealityTab>('balance-sheet');
  const [scenarioTab, setScenarioTab] = useState<ScenarioTab>('opportunity');

  // Expandable insurance items
  const [expandedInsurance, setExpandedInsurance] = useState<string | null>(null);

  // User-controlled income projection
  const [userProjection, setUserProjection] = useState<IncomeProjection | null>(null);

  // Email state
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);

  const profile = prospect.financialProfile!;

  const totalAssets = profile.savings + profile.investments + profile.retirement401k + profile.homeEquity + profile.otherAssets;
  const totalLiabilities = profile.mortgage + profile.carLoans + profile.studentLoans + profile.creditCards + profile.otherDebts;
  const totalIncome = profile.annualIncome + (profile.spouseIncome || 0) + (profile.otherIncome || 0);

  // Handle scenario mode toggle
  const handleToggleScenario = () => {
    if (!isScenarioMode) {
      // Trying to enter scenario mode - show consent modal
      if (!hasConsented) {
        setShowConsentModal(true);
      } else {
        setIsScenarioMode(true);
      }
    } else {
      // Exiting scenario mode - no consent needed
      setIsScenarioMode(false);
    }
  };

  const handleConsentAccept = () => {
    setHasConsented(true);
    setShowConsentModal(false);
    setIsScenarioMode(true);
  };

  const handleConsentDecline = () => {
    setShowConsentModal(false);
  };

  const handleProjectionChange = useCallback((projection: IncomeProjection) => {
    setUserProjection(projection);
  }, []);

  const handleSendEmail = async () => {
    setEmailStatus('sending');
    try {
      const result = await sendFinancialSnapshot(prospect.id);
      if (result.success) {
        setEmailStatus('sent');
        setTimeout(() => setEmailStatus('idle'), 3000);
      } else {
        setEmailStatus('error');
        setTimeout(() => setEmailStatus('idle'), 3000);
      }
    } catch {
      setEmailStatus('error');
      setTimeout(() => setEmailStatus('idle'), 3000);
    }
  };

  const handleSaveFinancialData = async (data: {
    currentLifeInsurance: number;
    currentDisability: number;
    savings: number;
    investments: number;
    retirement401k: number;
    homeMarketValue: number;
    otherAssets: number;
    mortgage: number;
    carLoans: number;
    studentLoans: number;
    creditCards: number;
    otherDebts: number;
    annualIncome: number;
    spouseIncome: number | null;
    monthlyExpenses: number;
  }) => {
    const result = await updateFinancialProfile(prospect.id, data);
    if (!result.success) {
      throw new Error(result.error || 'Failed to save');
    }
    // Refresh the page to show updated data
    router.refresh();
  };

  const insuranceTypeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    TERM_LIFE: { label: 'Term Life Insurance', icon: <Shield className="w-5 h-5" /> },
    WHOLE_LIFE: { label: 'Whole Life Insurance', icon: <Heart className="w-5 h-5" /> },
    UNIVERSAL_LIFE: { label: 'Universal Life Insurance', icon: <Shield className="w-5 h-5" /> },
    DISABILITY: { label: 'Disability Insurance', icon: <Users className="w-5 h-5" /> },
    LONG_TERM_CARE: { label: 'Long-Term Care Insurance', icon: <Clock className="w-5 h-5" /> },
  };

  // State A tabs configuration
  const realityTabs = [
    { id: 'balance-sheet' as RealityTab, label: 'Financial Snapshot', icon: <PieChart className="w-5 h-5" /> },
    { id: 'insurance' as RealityTab, label: 'Insurance Gaps', icon: <Shield className="w-5 h-5" /> },
    { id: 'trajectory' as RealityTab, label: 'Current Trajectory', icon: <TrendingUp className="w-5 h-5" /> },
  ];

  // State B tabs configuration
  const scenarioTabs = [
    { id: 'opportunity' as ScenarioTab, label: 'Income Scenario', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'comparison' as ScenarioTab, label: 'Compare Futures', icon: <TrendingUp className="w-5 h-5" /> },
  ];

  // Calculate trajectory (simplified future projection without agent income)
  const yearsToRetirement = profile.retirementAge - profile.age;
  const currentSavingsRate = profile.monthlyGap > 0 ? profile.monthlyGap * 12 : 0;
  const returnRate = FINANCIAL_ASSUMPTIONS.nominalReturnRate;
  const projectedRetirementSavings = Math.round(
    (profile.savings + profile.investments + profile.retirement401k) *
    Math.pow(1 + returnRate, yearsToRetirement) +
    currentSavingsRate * ((Math.pow(1 + returnRate, yearsToRetirement) - 1) / returnRate)
  );
  const retirementNeed = totalIncome * FINANCIAL_ASSUMPTIONS.incomeReplacementRate * FINANCIAL_ASSUMPTIONS.retirementYears;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isScenarioMode
        ? 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50'
        : 'bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100'
    }`}>
      {/* Consent Modal */}
      <ScenarioModal
        isOpen={showConsentModal}
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
      />

      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </Link>

            <button
              onClick={handleSendEmail}
              disabled={emailStatus === 'sending'}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                emailStatus === 'sent'
                  ? 'bg-green-100 text-green-700'
                  : emailStatus === 'error'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {emailStatus === 'sending' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : emailStatus === 'sent' ? (
                <>
                  <Check className="w-4 h-4" />
                  Sent to {prospect.email}
                </>
              ) : emailStatus === 'error' ? (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  Failed to send
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Email Snapshot
                </>
              )}
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className={`text-3xl font-bold mb-2 transition-colors ${
              isScenarioMode ? 'text-emerald-900' : 'text-slate-900'
            }`}>
              {isScenarioMode ? 'Hypothetical Scenario Analysis' : 'Your Financial Analysis'}, {prospect.firstName}
            </h1>
            <p className={`transition-colors ${isScenarioMode ? 'text-emerald-700' : 'text-slate-600'}`}>
              {isScenarioMode
                ? 'Explore what-if scenarios based on your inputs (for educational purposes only)'
                : 'Your current financial picture based on the information you provided'
              }
            </p>
          </div>

          {/* MODE TOGGLE - The Magic Switch */}
          <div className={`rounded-2xl p-4 mb-8 flex items-center justify-between transition-all ${
            isScenarioMode
              ? 'bg-gradient-to-r from-emerald-600 to-green-600 shadow-lg shadow-emerald-500/20'
              : 'bg-gradient-to-r from-slate-700 to-slate-800 shadow-lg shadow-slate-500/20'
          }`}>
            <div className="flex items-center gap-3">
              {isScenarioMode ? (
                <Sparkles className="w-6 h-6 text-amber-300" />
              ) : (
                <PieChart className="w-6 h-6 text-slate-300" />
              )}
              <div className="text-white">
                <div className="font-semibold">
                  {isScenarioMode ? 'Scenario Mode' : 'Current Reality'}
                </div>
                <div className="text-sm opacity-80">
                  {isScenarioMode
                    ? 'Viewing hypothetical income scenarios'
                    : 'Viewing your actual financial data'
                  }
                </div>
              </div>
            </div>

            <button
              onClick={handleToggleScenario}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                isScenarioMode
                  ? 'bg-white/20 text-white hover:bg-white/30'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
            >
              {isScenarioMode ? (
                <>
                  <ToggleRight className="w-5 h-5" />
                  Exit Scenario
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5" />
                  Explore Scenarios
                </>
              )}
            </button>
          </div>

          {/* Quick Stats - Different for each mode */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {isScenarioMode ? (
              // Scenario Mode Stats
              <>
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-emerald-100 text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    ${(userProjection?.year1Income || 0).toLocaleString()}*
                  </div>
                  <div className="text-sm text-slate-600">Hypothetical Year 1</div>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-emerald-100 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ${(userProjection?.year3Income || 0).toLocaleString()}*
                  </div>
                  <div className="text-sm text-slate-600">Hypothetical Year 3</div>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-emerald-100 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    ${(userProjection?.year5Income || 0).toLocaleString()}*
                  </div>
                  <div className="text-sm text-slate-600">Hypothetical Year 5</div>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-emerald-100 text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    ${(userProjection?.lifetimeValue || 0).toLocaleString()}*
                  </div>
                  <div className="text-sm text-slate-600">Hypothetical 10-Year</div>
                </div>
              </>
            ) : (
              // Reality Mode Stats
              <>
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-200 text-center">
                  <div className="text-2xl font-bold text-blue-600">${profile.netWorth.toLocaleString()}</div>
                  <div className="text-sm text-slate-600">Net Worth</div>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-200 text-center">
                  <div className={`text-2xl font-bold ${profile.monthlyGap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(profile.monthlyGap).toLocaleString()}/mo
                  </div>
                  <div className="text-sm text-slate-600">{profile.monthlyGap >= 0 ? 'Monthly Surplus' : 'Monthly Deficit'}</div>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-200 text-center">
                  <div className="text-2xl font-bold text-amber-600">${profile.protectionGap.toLocaleString()}</div>
                  <div className="text-sm text-slate-600">Protection Gap</div>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-200 text-center">
                  <div className="text-2xl font-bold text-purple-600">{yearsToRetirement} yrs</div>
                  <div className="text-sm text-slate-600">To Retirement</div>
                </div>
              </>
            )}
          </div>

          {/* Tab Navigation - Different for each mode */}
          <div className="flex flex-wrap gap-2 mb-6">
            {isScenarioMode ? (
              // Scenario Mode Tabs
              scenarioTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setScenarioTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    scenarioTab === tab.id
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                      : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))
            ) : (
              // Reality Mode Tabs
              realityTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setRealityTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    realityTab === tab.id
                      ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))
            )}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            {/* ============================================ */}
            {/* STATE A: CURRENT REALITY TABS                */}
            {/* ============================================ */}
            {!isScenarioMode && realityTab === 'balance-sheet' && (
              <div>
                {/* Edit Button */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit Data
                  </button>
                </div>

                <FinancialSnapshot
                  clientName={`${prospect.firstName} ${prospect.lastName}`}
                  data={{
                    protection: {
                      liability: 0,
                      disabilityMonthly: profile.currentDisability || 0,
                      hospitalDaily: 0,
                      hasWill: false,
                      hasTrust: false,
                      lifeInsuranceClient: profile.currentLifeInsurance || 0,
                      lifeInsuranceSpouse: 0,
                    },
                    assets: {
                      personalProperty: profile.otherAssets,
                      savings: profile.savings,
                      investments: profile.investments,
                      retirement: profile.retirement401k,
                      realEstate: profile.homeEquity,
                      business: 0,
                    },
                    liabilities: {
                      shortTerm: profile.creditCards + profile.carLoans,
                      taxes: 0,
                      mortgages: profile.mortgage,
                      businessDebt: profile.studentLoans + profile.otherDebts,
                    },
                    cashFlow: {
                      annualIncome: totalIncome,
                      insuranceCosts: 0,
                      annualSavings: profile.monthlyGap > 0 ? profile.monthlyGap * 12 : 0,
                      debtAndTaxCosts: profile.debtPayments * 12,
                    },
                  }}
                />

                {/* Edit Modal */}
                <EditFinancialDataModal
                  isOpen={showEditModal}
                  onClose={() => setShowEditModal(false)}
                  onSave={handleSaveFinancialData}
                  initialData={{
                    currentLifeInsurance: profile.currentLifeInsurance || 0,
                    currentDisability: profile.currentDisability || 0,
                    savings: profile.savings,
                    investments: profile.investments,
                    retirement401k: profile.retirement401k,
                    homeMarketValue: profile.homeMarketValue || profile.homeEquity + profile.mortgage,
                    otherAssets: profile.otherAssets,
                    mortgage: profile.mortgage,
                    carLoans: profile.carLoans,
                    studentLoans: profile.studentLoans,
                    creditCards: profile.creditCards,
                    otherDebts: profile.otherDebts,
                    annualIncome: profile.annualIncome,
                    spouseIncome: profile.spouseIncome,
                    monthlyExpenses: profile.monthlyExpenses,
                  }}
                />
              </div>
            )}

            {!isScenarioMode && realityTab === 'insurance' && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-slate-600" />
                  Insurance Recommendations
                </h2>

                {profile.protectionGap > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-amber-800">Protection Gap Identified</div>
                      <div className="text-amber-700 text-sm">
                        Based on your income, dependents, and debts, you have a ${profile.protectionGap.toLocaleString()} gap in life insurance coverage.
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {prospect.insuranceNeeds.map(need => {
                    const typeInfo = insuranceTypeLabels[need.type] || { label: need.type, icon: <Shield className="w-5 h-5" /> };
                    const isExpanded = expandedInsurance === need.id;

                    return (
                      <div key={need.id} className="border border-slate-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setExpandedInsurance(isExpanded ? null : need.id)}
                          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              need.priority === 1 ? 'bg-red-100 text-red-600' :
                              need.priority === 2 ? 'bg-amber-100 text-amber-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {typeInfo.icon}
                            </div>
                            <div className="text-left">
                              <div className="font-semibold text-slate-900">{typeInfo.label}</div>
                              <div className="text-sm text-slate-500">
                                Gap: ${need.gap.toLocaleString()}
                                {need.monthlyPremium && ` • Est. $${need.monthlyPremium}/mo`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              need.priority === 1 ? 'bg-red-100 text-red-700' :
                              need.priority === 2 ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              Priority {need.priority}
                            </span>
                            {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-4 border-t border-slate-200 bg-slate-50">
                            <div className="grid md:grid-cols-3 gap-4 mb-4">
                              <div className="bg-white rounded-lg p-3">
                                <div className="text-sm text-slate-500">Recommended</div>
                                <div className="font-bold text-green-600">${need.recommendedCoverage.toLocaleString()}</div>
                              </div>
                              <div className="bg-white rounded-lg p-3">
                                <div className="text-sm text-slate-500">Current</div>
                                <div className="font-bold text-slate-600">${need.currentCoverage.toLocaleString()}</div>
                              </div>
                              <div className="bg-white rounded-lg p-3">
                                <div className="text-sm text-slate-500">Gap</div>
                                <div className="font-bold text-red-600">${need.gap.toLocaleString()}</div>
                              </div>
                            </div>
                            <p className="text-slate-700 text-sm">{need.reasoning}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!isScenarioMode && realityTab === 'trajectory' && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-slate-600" />
                  Your Current Trajectory
                </h2>

                <div className="bg-slate-50 rounded-xl p-6 mb-6">
                  <p className="text-slate-700 mb-4">
                    Based on your current income, savings rate, and expenses, here's where you're headed:
                  </p>

                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <div className="text-sm text-slate-500 mb-1">Target Retirement Age</div>
                      <div className="text-3xl font-bold text-slate-800">{profile.retirementAge}</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <div className="text-sm text-slate-500 mb-1">Years to Go</div>
                      <div className="text-3xl font-bold text-slate-800">{yearsToRetirement}</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <div className="text-sm text-slate-500 mb-1">Current Savings Rate</div>
                      <div className="text-3xl font-bold text-slate-800">
                        ${currentSavingsRate.toLocaleString()}/yr
                      </div>
                    </div>
                  </div>

                  {/* Retirement Readiness */}
                  <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <h3 className="font-semibold text-slate-900 mb-4">Retirement Readiness Assessment</h3>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-slate-600">Projected savings at {profile.retirementAge}:</span>
                      <span className="font-bold text-slate-900">${projectedRetirementSavings.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-slate-600">Estimated need for 25-year retirement:</span>
                      <span className="font-bold text-slate-900">${retirementNeed.toLocaleString()}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            projectedRetirementSavings >= retirementNeed
                              ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                              : projectedRetirementSavings >= retirementNeed * 0.7
                              ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                              : 'bg-gradient-to-r from-red-400 to-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, (projectedRetirementSavings / retirementNeed) * 100)}%` }}
                        />
                      </div>
                      <div className="text-right text-sm text-slate-500 mt-1">
                        {Math.round((projectedRetirementSavings / retirementNeed) * 100)}% funded
                      </div>
                    </div>

                    {projectedRetirementSavings < retirementNeed && (
                      <div className={`p-4 rounded-lg ${
                        projectedRetirementSavings >= retirementNeed * 0.7
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-red-50 text-red-800'
                      }`}>
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold">
                              {projectedRetirementSavings >= retirementNeed * 0.7
                                ? 'Getting Close'
                                : 'Gap Identified'
                              }
                            </div>
                            <div className="text-sm">
                              At your current pace, you may be short approximately
                              ${(retirementNeed - projectedRetirementSavings).toLocaleString()} for retirement.
                              Consider increasing income or savings rate.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA to Scenario Mode */}
                <div className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl p-6 text-center">
                  <h3 className="font-semibold text-slate-900 mb-2">Want to explore income scenarios?</h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Toggle to Scenario Mode to see how additional income sources could impact your trajectory.
                  </p>
                  <button
                    onClick={handleToggleScenario}
                    className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Explore Scenarios
                  </button>
                </div>
              </div>
            )}

            {/* ============================================ */}
            {/* STATE B: SCENARIO MODE TABS                  */}
            {/* ============================================ */}
            {isScenarioMode && scenarioTab === 'opportunity' && (
              <div>
                <h2 className="text-xl font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-emerald-600" />
                  Hypothetical Income Scenario
                </h2>
                <p className="text-emerald-700 text-sm mb-6">
                  Drag the slider to explore different activity levels. All figures are hypothetical.
                </p>

                {/* Income Slider Component */}
                <div className="mb-8">
                  <IncomeSlider onProjectionChange={handleProjectionChange} />
                </div>

                {/* What This Could Mean */}
                {userProjection && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                    <h3 className="font-semibold text-emerald-900 mb-4">
                      What {userProjection.salesPerMonth} sales/month could mean for your trajectory
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4">
                        <div className="text-sm text-slate-500 mb-1">Potential additional annual income</div>
                        <div className="text-2xl font-bold text-emerald-600">
                          +${userProjection.year1Income.toLocaleString()}*
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <div className="text-sm text-slate-500 mb-1">Potential retirement boost</div>
                        <div className="text-2xl font-bold text-blue-600">
                          +${(userProjection.lifetimeValue * 0.7).toLocaleString()}*
                        </div>
                        <div className="text-xs text-slate-400">If 70% invested over 10 years</div>
                      </div>
                    </div>

                    <p className="text-emerald-700 text-xs mt-4">
                      *Hypothetical illustration only. Based on your selected inputs and assumptions.
                      Results are not typical. Individual outcomes vary.
                    </p>
                  </div>
                )}
              </div>
            )}

            {isScenarioMode && scenarioTab === 'comparison' && (
              <div>
                <h2 className="text-xl font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                  Hypothetical Future Comparison
                </h2>
                <p className="text-emerald-700 text-sm mb-6">
                  Compare your current trajectory with a hypothetical scenario where you add the projected income.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {/* Current Path */}
                  <div className="border-2 border-slate-200 rounded-xl p-6 bg-slate-50">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-full mb-4">
                        <Clock className="w-4 h-4" />
                        Current Path
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Without Additional Income</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-slate-600">Retirement Age Target</span>
                        <span className="font-bold text-slate-900">{profile.retirementAge}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-slate-600">Projected Savings at Retirement</span>
                        <span className="font-bold text-slate-900">${projectedRetirementSavings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-600">Retirement Readiness</span>
                        <span className="font-bold text-slate-900">
                          {Math.round((projectedRetirementSavings / retirementNeed) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hypothetical Path */}
                  <div className="border-2 border-emerald-400 rounded-xl p-6 bg-gradient-to-br from-emerald-50 to-green-50">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center gap-2 bg-emerald-200 text-emerald-800 px-4 py-2 rounded-full mb-4">
                        <Sparkles className="w-4 h-4" />
                        Hypothetical Path
                      </div>
                      <h3 className="text-xl font-bold text-emerald-900">With Projected Income*</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-emerald-200">
                        <span className="text-emerald-700">Could Retire As Early As</span>
                        <span className="font-bold text-emerald-800">
                          {Math.max(profile.age + 5, profile.retirementAge - Math.floor((userProjection?.year1Income || 0) / 10000))}
                          <span className="text-emerald-600 text-sm ml-1">
                            (hypothetical)
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-emerald-200">
                        <span className="text-emerald-700">Potential Retirement Savings</span>
                        <span className="font-bold text-emerald-800">
                          ${(projectedRetirementSavings + (userProjection?.lifetimeValue || 0) * 0.5).toLocaleString()}*
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-emerald-700">Potential Readiness</span>
                        <span className="font-bold text-emerald-800">
                          {Math.min(150, Math.round(((projectedRetirementSavings + (userProjection?.lifetimeValue || 0) * 0.5) / retirementNeed) * 100))}%*
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <ComplianceDisclaimer variant="income" />

                {/* CTA */}
                <div className="mt-8 text-center">
                  <h3 className="text-xl font-bold text-emerald-900 mb-4">Want to Learn More?</h3>
                  <p className="text-emerald-700 mb-4">
                    If you're interested in exploring this opportunity further, we can discuss the details.
                  </p>
                  <Link
                    href="/career"
                    className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-xl font-medium hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg inline-flex items-center gap-2"
                  >
                    Learn About the Opportunity
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Footer Disclaimer - Always visible in Scenario Mode */}
          {isScenarioMode && (
            <div className="mt-6">
              <ComplianceDisclaimer variant="compact" className="text-center" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
