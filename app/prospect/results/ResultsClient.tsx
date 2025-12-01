'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PieChart,
  Shield,
  TrendingUp,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Target,
  Wallet,
  CreditCard,
  Home,
  Car,
  GraduationCap,
  Heart
} from 'lucide-react';
import { generateAgentProjection } from '../actions';

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

type Tab = 'balance-sheet' | 'insurance' | 'opportunity' | 'comparison';

export default function ResultsClient({ prospect }: { prospect: Prospect }) {
  const [activeTab, setActiveTab] = useState<Tab>('balance-sheet');
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const [networkSize, setNetworkSize] = useState(100);
  const [loading, setLoading] = useState(false);
  const [expandedInsurance, setExpandedInsurance] = useState<string | null>(null);

  const profile = prospect.financialProfile!;
  const comparison = prospect.comparisons[0] || null;

  const totalAssets = profile.savings + profile.investments + profile.retirement401k + profile.homeEquity + profile.otherAssets;
  const totalLiabilities = profile.mortgage + profile.carLoans + profile.studentLoans + profile.creditCards + profile.otherDebts;
  const totalIncome = profile.annualIncome + (profile.spouseIncome || 0) + (profile.otherIncome || 0);

  const handleGenerateProjection = async () => {
    setLoading(true);
    await generateAgentProjection(prospect.id, hoursPerWeek, networkSize);
    setLoading(false);
    window.location.reload();
  };

  const insuranceTypeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    TERM_LIFE: { label: 'Term Life Insurance', icon: <Shield className="w-5 h-5" /> },
    WHOLE_LIFE: { label: 'Whole Life Insurance', icon: <Heart className="w-5 h-5" /> },
    UNIVERSAL_LIFE: { label: 'Universal Life Insurance', icon: <Shield className="w-5 h-5" /> },
    DISABILITY: { label: 'Disability Insurance', icon: <Users className="w-5 h-5" /> },
    LONG_TERM_CARE: { label: 'Long-Term Care Insurance', icon: <Clock className="w-5 h-5" /> },
  };

  const tabs = [
    { id: 'balance-sheet' as Tab, label: 'Balance Sheet', icon: <PieChart className="w-5 h-5" /> },
    { id: 'insurance' as Tab, label: 'Insurance Gaps', icon: <Shield className="w-5 h-5" /> },
    { id: 'opportunity' as Tab, label: 'Agent Opportunity', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'comparison' as Tab, label: 'Compare Futures', icon: <TrendingUp className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Financial Analysis, {prospect.firstName}
          </h1>
          <p className="text-gray-600">
            Here's your complete financial picture and personalized recommendations
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card-gradient text-center">
            <div className="text-2xl font-bold text-blue-600">${profile.netWorth.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Net Worth</div>
          </div>
          <div className="card-gradient text-center">
            <div className={`text-2xl font-bold ${profile.monthlyGap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(profile.monthlyGap).toLocaleString()}/mo
            </div>
            <div className="text-sm text-gray-600">{profile.monthlyGap >= 0 ? 'Monthly Surplus' : 'Monthly Deficit'}</div>
          </div>
          <div className="card-gradient text-center">
            <div className="text-2xl font-bold text-amber-600">${profile.protectionGap.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Protection Gap</div>
          </div>
          <div className="card-gradient text-center">
            <div className="text-2xl font-bold text-purple-600">{profile.retirementAge - profile.age} yrs</div>
            <div className="text-sm text-gray-600">To Retirement</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-blue-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="card-gradient">
          {activeTab === 'balance-sheet' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <PieChart className="w-6 h-6 text-blue-600" />
                Living Balance Sheet
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Assets */}
                <div>
                  <h3 className="font-semibold text-green-700 mb-4 flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Assets
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Savings', value: profile.savings, icon: <DollarSign className="w-4 h-4" /> },
                      { label: 'Investments', value: profile.investments, icon: <TrendingUp className="w-4 h-4" /> },
                      { label: 'Retirement (401k/IRA)', value: profile.retirement401k, icon: <Target className="w-4 h-4" /> },
                      { label: 'Home Equity', value: profile.homeEquity, icon: <Home className="w-4 h-4" /> },
                      { label: 'Other Assets', value: profile.otherAssets, icon: <Wallet className="w-4 h-4" /> },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="flex items-center gap-2 text-gray-700">
                          {item.icon}
                          {item.label}
                        </span>
                        <span className="font-medium text-green-600">${item.value.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-3 bg-green-50 rounded-lg px-3 mt-4">
                      <span className="font-bold text-green-800">Total Assets</span>
                      <span className="font-bold text-green-600 text-lg">${totalAssets.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Liabilities */}
                <div>
                  <h3 className="font-semibold text-red-700 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Liabilities
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Mortgage', value: profile.mortgage, icon: <Home className="w-4 h-4" /> },
                      { label: 'Car Loans', value: profile.carLoans, icon: <Car className="w-4 h-4" /> },
                      { label: 'Student Loans', value: profile.studentLoans, icon: <GraduationCap className="w-4 h-4" /> },
                      { label: 'Credit Cards', value: profile.creditCards, icon: <CreditCard className="w-4 h-4" /> },
                      { label: 'Other Debts', value: profile.otherDebts, icon: <CreditCard className="w-4 h-4" /> },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="flex items-center gap-2 text-gray-700">
                          {item.icon}
                          {item.label}
                        </span>
                        <span className="font-medium text-red-600">${item.value.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-3 bg-red-50 rounded-lg px-3 mt-4">
                      <span className="font-bold text-red-800">Total Liabilities</span>
                      <span className="font-bold text-red-600 text-lg">${totalLiabilities.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Worth Summary */}
              <div className="mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="text-blue-100 mb-1">Your Net Worth</div>
                    <div className="text-4xl font-bold">${profile.netWorth.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-100 mb-1">Annual Income</div>
                    <div className="text-2xl font-semibold">${totalIncome.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insurance' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
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
                    <div key={need.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedInsurance(isExpanded ? null : need.id)}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
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
                            <div className="font-semibold text-gray-900">{typeInfo.label}</div>
                            <div className="text-sm text-gray-500">
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
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                          <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div className="bg-white rounded-lg p-3">
                              <div className="text-sm text-gray-500">Recommended</div>
                              <div className="font-bold text-green-600">${need.recommendedCoverage.toLocaleString()}</div>
                            </div>
                            <div className="bg-white rounded-lg p-3">
                              <div className="text-sm text-gray-500">Current</div>
                              <div className="font-bold text-gray-600">${need.currentCoverage.toLocaleString()}</div>
                            </div>
                            <div className="bg-white rounded-lg p-3">
                              <div className="text-sm text-gray-500">Gap</div>
                              <div className="font-bold text-red-600">${need.gap.toLocaleString()}</div>
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm">{need.reasoning}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Ready to Get Protected?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Schedule a call to discuss these recommendations and get personalized quotes.
                </p>
                <Link href="/career" className="btn-success inline-flex items-center gap-2">
                  Schedule Consultation
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'opportunity' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-blue-600" />
                Agent Career Opportunity
              </h2>

              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">What if YOU could help others like this?</h3>
                <p className="text-gray-600 mb-4">
                  As a licensed insurance agent, you could earn significant income while helping families protect their futures.
                  Let's see how this opportunity could transform YOUR financial picture.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hours per week you could dedicate
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      value={hoursPerWeek}
                      onChange={e => setHoursPerWeek(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center font-bold text-purple-600">{hoursPerWeek} hours/week</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size of your network (friends, family, contacts)
                    </label>
                    <input
                      type="range"
                      min="25"
                      max="500"
                      step="25"
                      value={networkSize}
                      onChange={e => setNetworkSize(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center font-bold text-purple-600">{networkSize} people</div>
                  </div>
                </div>

                <button
                  onClick={handleGenerateProjection}
                  disabled={loading}
                  className="btn-primary w-full mt-6"
                >
                  {loading ? 'Calculating...' : 'Calculate My Potential Income'}
                </button>
              </div>

              {prospect.agentProjection && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                      <div className="text-3xl font-bold text-green-600">
                        ${prospect.agentProjection.year1Income.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Year 1 Income</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        ${prospect.agentProjection.year3Income.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Year 3 Income</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        ${prospect.agentProjection.year5Income.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Year 5 Income</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                      <div className="text-3xl font-bold text-indigo-600">
                        ${prospect.agentProjection.lifetimeValue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">10-Year Total</div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-amber-700 text-sm">
                      <strong>Disclaimer:</strong> These projections are estimates based on industry averages.
                      Individual results vary based on effort, market conditions, and other factors.
                      Past performance does not guarantee future results.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'comparison' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Your Future: With vs Without Agent Career
              </h2>

              {!comparison ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">
                    Generate your agent income projection first to see the comparison.
                  </p>
                  <button
                    onClick={() => setActiveTab('opportunity')}
                    className="btn-primary"
                  >
                    Calculate Agent Income
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Comparison Cards */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Without Agent Career */}
                    <div className="border-2 border-gray-200 rounded-xl p-6">
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full mb-4">
                          <Clock className="w-4 h-4" />
                          Current Path
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Without Agent Career</h3>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-600">Retirement Age</span>
                          <span className="font-bold text-gray-900">{comparison.baselineRetirementAge}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-600">Net Worth at 65</span>
                          <span className="font-bold text-gray-900">${comparison.baselineNetWorthAt65.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">Income Source</span>
                          <span className="font-bold text-gray-900">Job Only</span>
                        </div>
                      </div>
                    </div>

                    {/* With Agent Career */}
                    <div className="border-2 border-green-500 rounded-xl p-6 bg-gradient-to-br from-green-50 to-emerald-50">
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4">
                          <TrendingUp className="w-4 h-4" />
                          Enhanced Path
                        </div>
                        <h3 className="text-xl font-bold text-green-800">With Agent Career</h3>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-green-200">
                          <span className="text-green-700">Retirement Age</span>
                          <span className="font-bold text-green-800">
                            {comparison.agentRetirementAge}
                            {comparison.yearsEarlierRetirement > 0 && (
                              <span className="text-green-600 text-sm ml-2">
                                ({comparison.yearsEarlierRetirement} years earlier!)
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-green-200">
                          <span className="text-green-700">Net Worth at 65</span>
                          <span className="font-bold text-green-800">${comparison.agentNetWorthAt65.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-green-700">Income Sources</span>
                          <span className="font-bold text-green-800">Job + Agent</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Impact Summary */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
                    <h3 className="font-bold text-xl mb-4 text-center">The Agent Career Difference</h3>
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-4xl font-bold mb-1">+${comparison.additionalIncome.toLocaleString()}</div>
                        <div className="text-blue-100">Additional Lifetime Income</div>
                      </div>
                      <div>
                        <div className="text-4xl font-bold mb-1">{comparison.yearsEarlierRetirement}</div>
                        <div className="text-blue-100">Years Earlier Retirement</div>
                      </div>
                      <div>
                        <div className="text-4xl font-bold mb-1">+${comparison.additionalNetWorth.toLocaleString()}</div>
                        <div className="text-blue-100">Additional Net Worth at 65</div>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Ready to Transform Your Financial Future?</h3>
                    <Link href="/career" className="btn-success inline-flex items-center gap-2 text-lg px-8 py-4">
                      Learn More About Becoming an Agent
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
