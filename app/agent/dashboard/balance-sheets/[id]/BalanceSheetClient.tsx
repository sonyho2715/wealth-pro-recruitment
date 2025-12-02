'use client';

import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend, TooltipItem } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  Briefcase,
  Home,
  CreditCard,
  PiggyBank,
  Car,
  GraduationCap,
  Calendar,
} from 'lucide-react';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface AssetBreakdown {
  savings: number;
  investments: number;
  retirement401k: number;
  homeEquity: number;
  otherAssets: number;
}

interface LiabilityBreakdown {
  mortgage: number;
  carLoans: number;
  studentLoans: number;
  creditCards: number;
  otherDebts: number;
}

interface CashFlow {
  income: number;
  expenses: number;
}

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

interface AgentProjection {
  year1Income: number;
  year3Income: number;
  year5Income: number;
  lifetimeValue: number;
}

interface BalanceSheetClientProps {
  chartData: {
    assets: AssetBreakdown;
    liabilities: LiabilityBreakdown;
    cashFlow: CashFlow;
  };
  assets: AssetBreakdown;
  liabilities: LiabilityBreakdown;
  insuranceNeeds: InsuranceNeed[];
  totalRecommendedCoverage: number;
  totalCurrentCoverage: number;
  protectionGap: number;
  yearsToRetirement: number;
  retirementAge: number;
  currentAge: number;
  agentProjection: AgentProjection | null;
}

export default function BalanceSheetClient({
  chartData,
  assets,
  liabilities,
  insuranceNeeds,
  totalRecommendedCoverage,
  totalCurrentCoverage,
  protectionGap,
  yearsToRetirement,
  retirementAge,
  currentAge,
  agentProjection,
}: BalanceSheetClientProps) {
  // Assets Doughnut Chart
  const assetsChartData = {
    labels: ['Savings', 'Investments', '401(k)', 'Home Equity', 'Other'],
    datasets: [
      {
        data: [
          assets.savings,
          assets.investments,
          assets.retirement401k,
          assets.homeEquity,
          assets.otherAssets,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(99, 102, 241, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Liabilities Doughnut Chart
  const liabilitiesChartData = {
    labels: ['Mortgage', 'Car Loans', 'Student Loans', 'Credit Cards', 'Other'],
    datasets: [
      {
        data: [
          liabilities.mortgage,
          liabilities.carLoans,
          liabilities.studentLoans,
          liabilities.creditCards,
          liabilities.otherDebts,
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(234, 88, 12, 0.8)',
          'rgba(220, 38, 38, 0.8)',
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(234, 88, 12, 1)',
          'rgba(220, 38, 38, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Cash Flow Bar Chart
  const cashFlowChartData = {
    labels: ['Monthly Income', 'Monthly Expenses'],
    datasets: [
      {
        label: 'Amount ($)',
        data: [chartData.cashFlow.income, chartData.cashFlow.expenses],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'doughnut'>) {
            return `${context.label}: $${context.parsed.toLocaleString()}`;
          }
        }
      }
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'bar'>) {
            return `$${(context.parsed.y ?? 0).toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: string | number) {
            return '$' + Number(value).toLocaleString();
          }
        }
      }
    }
  };

  const monthlyGap = chartData.cashFlow.income - chartData.cashFlow.expenses;

  const insuranceTypeLabels: Record<string, string> = {
    TERM_LIFE: 'Term Life Insurance',
    WHOLE_LIFE: 'Whole Life Insurance',
    UNIVERSAL_LIFE: 'Universal Life Insurance',
    DISABILITY: 'Disability Insurance',
    LONG_TERM_CARE: 'Long-Term Care Insurance',
  };

  return (
    <div className="space-y-6">
      {/* Assets and Liabilities Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets Card */}
        <div className="card-gradient">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Assets Breakdown
          </h2>
          <div className="h-64 mb-6">
            <Doughnut data={assetsChartData} options={chartOptions} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-blue-600" />
                <span className="text-gray-600">Savings</span>
              </div>
              <span className="font-semibold text-gray-900">${assets.savings.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span className="text-gray-600">Investments</span>
              </div>
              <span className="font-semibold text-gray-900">${assets.investments.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-600" />
                <span className="text-gray-600">401(k)/Retirement</span>
              </div>
              <span className="font-semibold text-gray-900">${assets.retirement401k.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">Home Equity</span>
              </div>
              <span className="font-semibold text-gray-900">${assets.homeEquity.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-600" />
                <span className="text-gray-600">Other Assets</span>
              </div>
              <span className="font-semibold text-gray-900">${assets.otherAssets.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Liabilities Card */}
        <div className="card-gradient">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            Liabilities Breakdown
          </h2>
          <div className="h-64 mb-6">
            <Doughnut data={liabilitiesChartData} options={chartOptions} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-red-600" />
                <span className="text-gray-600">Mortgage</span>
              </div>
              <span className="font-semibold text-gray-900">${liabilities.mortgage.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-amber-600" />
                <span className="text-gray-600">Car Loans</span>
              </div>
              <span className="font-semibold text-gray-900">${liabilities.carLoans.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-orange-600" />
                <span className="text-gray-600">Student Loans</span>
              </div>
              <span className="font-semibold text-gray-900">${liabilities.studentLoans.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-700" />
                <span className="text-gray-600">Credit Cards</span>
              </div>
              <span className="font-semibold text-gray-900">${liabilities.creditCards.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-red-700" />
                <span className="text-gray-600">Other Debts</span>
              </div>
              <span className="font-semibold text-gray-900">${liabilities.otherDebts.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Flow Card */}
      <div className="card-gradient">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          Monthly Cash Flow
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <Bar data={cashFlowChartData} options={barChartOptions} />
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <div className="p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Monthly Income</p>
              <p className="text-2xl font-bold text-green-600">
                ${chartData.cashFlow.income.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Monthly Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                ${chartData.cashFlow.expenses.toLocaleString()}
              </p>
            </div>
            <div className={`p-4 rounded-xl ${monthlyGap >= 0 ? 'bg-blue-50' : 'bg-amber-50'}`}>
              <p className="text-sm text-gray-600 mb-1">Monthly Surplus/Deficit</p>
              <p className={`text-2xl font-bold ${monthlyGap >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                {monthlyGap >= 0 ? '+' : ''}${monthlyGap.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Protection Gap Section */}
      {insuranceNeeds.length > 0 && (
        <div className="card-gradient">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Protection Gap Analysis
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-xl text-center">
              <p className="text-sm text-gray-600 mb-1">Recommended Coverage</p>
              <p className="text-2xl font-bold text-green-600">
                ${totalRecommendedCoverage.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl text-center">
              <p className="text-sm text-gray-600 mb-1">Current Coverage</p>
              <p className="text-2xl font-bold text-blue-600">
                ${totalCurrentCoverage.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl text-center">
              <p className="text-sm text-gray-600 mb-1">Coverage Gap</p>
              <p className="text-2xl font-bold text-red-600">
                ${protectionGap.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Insurance Recommendations
            </h3>
            {insuranceNeeds.map((need) => (
              <div key={need.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {insuranceTypeLabels[need.type] || need.type}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{need.reasoning}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    Priority {need.priority}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-gray-500">Recommended</p>
                    <p className="font-semibold text-gray-900">
                      ${need.recommendedCoverage.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Current</p>
                    <p className="font-semibold text-gray-900">
                      ${need.currentCoverage.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Gap</p>
                    <p className="font-semibold text-red-600">
                      ${need.gap.toLocaleString()}
                    </p>
                  </div>
                  {need.monthlyPremium && (
                    <div>
                      <p className="text-xs text-gray-500">Est. Premium/mo</p>
                      <p className="font-semibold text-green-600">
                        ${need.monthlyPremium.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Retirement Projection */}
      <div className="card-gradient">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          Retirement Timeline
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-indigo-50 rounded-xl text-center">
            <p className="text-sm text-gray-600 mb-1">Current Age</p>
            <p className="text-3xl font-bold text-indigo-600">{currentAge}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl text-center">
            <p className="text-sm text-gray-600 mb-1">Target Retirement Age</p>
            <p className="text-3xl font-bold text-purple-600">{retirementAge}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl text-center">
            <p className="text-sm text-gray-600 mb-1">Years Until Retirement</p>
            <p className="text-3xl font-bold text-blue-600">{yearsToRetirement}</p>
          </div>
        </div>
      </div>

      {/* Agent Opportunity Section */}
      {agentProjection && (
        <div className="card-gradient bg-gradient-to-br from-purple-50 to-indigo-50">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-600" />
            Agent Career Opportunity
          </h2>
          <p className="text-gray-600 mb-6">
            Projected income potential as a licensed agent with our organization:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl text-center shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Year 1 Income</p>
              <p className="text-2xl font-bold text-blue-600">
                ${agentProjection.year1Income.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl text-center shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Year 3 Income</p>
              <p className="text-2xl font-bold text-indigo-600">
                ${agentProjection.year3Income.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl text-center shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Year 5 Income</p>
              <p className="text-2xl font-bold text-purple-600">
                ${agentProjection.year5Income.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl text-center shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Lifetime Value</p>
              <p className="text-2xl font-bold text-green-600">
                ${agentProjection.lifetimeValue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
