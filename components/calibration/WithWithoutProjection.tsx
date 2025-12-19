'use client';

import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, DollarSign, Percent, ArrowRight } from 'lucide-react';
import { YearProjection } from '@/lib/calibration-engine';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WithWithoutProjectionProps {
  withoutScenario: YearProjection[];
  withScenario: YearProjection[];
  currentRevenue: number;
  currentNetIncome: number;
  assumptions?: {
    priceIncrease: number;
    cogsReduction: number;
    pensionTarget: number;
  };
}

export default function WithWithoutProjection({
  withoutScenario,
  withScenario,
  currentRevenue,
  currentNetIncome,
  assumptions = { priceIncrease: 0.10, cogsReduction: 0.05, pensionTarget: 50000 },
}: WithWithoutProjectionProps) {
  const labels = ['Current', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];

  // Calculate totals
  const totals = useMemo(() => {
    const withoutTotal = withoutScenario.reduce((sum, y) => sum + y.netIncome, 0);
    const withTotal = withScenario.reduce((sum, y) => sum + y.netIncome, 0);
    const taxSavingsTotal = withScenario.reduce((sum, y) => sum + y.taxSavings, 0);
    const pensionTotal = withScenario.reduce((sum, y) => sum + y.pension, 0);

    return {
      withoutTotal,
      withTotal,
      difference: withTotal - withoutTotal,
      taxSavingsTotal,
      pensionTotal,
      totalBenefit: withTotal - withoutTotal + taxSavingsTotal,
    };
  }, [withoutScenario, withScenario]);

  // Net Income Comparison Chart
  const netIncomeChartData = {
    labels,
    datasets: [
      {
        label: 'Without Changes',
        data: [currentNetIncome, ...withoutScenario.map((y) => y.netIncome)],
        borderColor: '#94a3b8',
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 6,
        pointHoverRadius: 8,
        borderDash: [5, 5],
      },
      {
        label: 'With Improvements',
        data: [currentNetIncome, ...withScenario.map((y) => y.netIncome)],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        fill: true,
        tension: 0.3,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  // Cumulative Value Chart
  const cumulativeChartData = {
    labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
    datasets: [
      {
        label: 'Without Changes',
        data: withoutScenario.map((y) => y.cumulativeValue),
        backgroundColor: 'rgba(148, 163, 184, 0.6)',
        borderColor: '#64748b',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'With Improvements',
        data: withScenario.map((y) => y.cumulativeValue),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: '#059669',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context: any) {
            const value = context.raw as number;
            return `${context.dataset.label}: ${formatCurrency(value)}`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (value: any) {
            return formatCurrencyShort(value);
          },
        },
        grid: {
          color: '#f1f5f9',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Year 5 comparison
  const year5Without = withoutScenario[4];
  const year5With = withScenario[4];
  const year5Improvement = year5With.netIncome - year5Without.netIncome;
  const year5ImprovementPercent = year5Without.netIncome > 0
    ? (year5Improvement / year5Without.netIncome)
    : year5With.netIncome > 0 ? 1 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="5-Year Net Benefit"
          value={totals.totalBenefit}
          description="Additional income + tax savings"
          color="emerald"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <SummaryCard
          title="Year 5 Income Improvement"
          value={year5Improvement}
          percent={year5ImprovementPercent}
          description="vs. status quo"
          color="blue"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <SummaryCard
          title="Total Tax Savings"
          value={totals.taxSavingsTotal}
          description="From pension contributions"
          color="purple"
          icon={<Percent className="w-5 h-5" />}
        />
      </div>

      {/* Assumptions Banner */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <h4 className="text-sm font-medium text-slate-700 mb-2">Scenario Assumptions</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-600">
              {(assumptions.priceIncrease * 100).toFixed(0)}% Price Increase
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-slate-600">
              {(assumptions.cogsReduction * 100).toFixed(0)}% COGS Reduction
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-slate-600">
              {formatCurrency(assumptions.pensionTarget)} Annual Pension
            </span>
          </div>
        </div>
      </div>

      {/* Net Income Projection Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Net Income Projection: With vs. Without
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          5-year trajectory comparison showing impact of recommended improvements
        </p>
        <div className="h-80">
          <Line data={netIncomeChartData} options={chartOptions} />
        </div>
      </div>

      {/* Cumulative Value Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Cumulative Net Income</h3>
        <p className="text-sm text-slate-500 mb-4">
          Total accumulated income over 5 years
        </p>
        <div className="h-72">
          <Bar data={cumulativeChartData} options={chartOptions} />
        </div>
      </div>

      {/* Year-by-Year Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Year-by-Year Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Without Changes
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">

                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  With Improvements
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Difference
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Tax Savings
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {withoutScenario.map((without, index) => {
                const withData = withScenario[index];
                const diff = withData.netIncome - without.netIncome;

                return (
                  <tr key={without.year} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      Year {without.year}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-slate-600">
                      {formatCurrency(without.netIncome)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ArrowRight className="w-4 h-4 text-slate-400 mx-auto" />
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-emerald-600">
                      {formatCurrency(withData.netIncome)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={diff >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                        {diff >= 0 ? '+' : ''}
                        {formatCurrency(diff)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-purple-600">
                      +{formatCurrency(withData.taxSavings)}
                    </td>
                  </tr>
                );
              })}
              {/* Totals Row */}
              <tr className="bg-slate-900 text-white">
                <td className="px-4 py-3 text-sm font-bold">5-Year Total</td>
                <td className="px-4 py-3 text-sm text-right font-medium">
                  {formatCurrency(totals.withoutTotal)}
                </td>
                <td className="px-4 py-3 text-center">
                  <ArrowRight className="w-4 h-4 text-slate-400 mx-auto" />
                </td>
                <td className="px-4 py-3 text-sm text-right font-bold text-emerald-400">
                  {formatCurrency(totals.withTotal)}
                </td>
                <td className="px-4 py-3 text-sm text-right font-bold text-emerald-400">
                  +{formatCurrency(totals.difference)}
                </td>
                <td className="px-4 py-3 text-sm text-right font-bold text-purple-400">
                  +{formatCurrency(totals.taxSavingsTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Line Summary */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold mb-1">Total 5-Year Benefit</h3>
            <p className="text-emerald-100 text-sm">
              Additional net income + tax savings from implementing improvements
            </p>
          </div>
          <div className="text-center md:text-right">
            <div className="text-4xl font-bold">{formatCurrency(totals.totalBenefit)}</div>
            <p className="text-emerald-200 text-sm mt-1">
              {formatCurrency(totals.difference)} income + {formatCurrency(totals.taxSavingsTotal)} tax savings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
interface SummaryCardProps {
  title: string;
  value: number;
  percent?: number;
  description: string;
  color: 'emerald' | 'blue' | 'purple' | 'amber';
  icon: React.ReactNode;
}

function SummaryCard({ title, value, percent, description, color, icon }: SummaryCardProps) {
  const colorClasses = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
  };

  const iconColorClasses = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
  };

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-medium opacity-80">{title}</span>
        <div className={`p-2 rounded-lg ${iconColorClasses[color]}`}>{icon}</div>
      </div>
      <div className="text-2xl font-bold">
        {value >= 0 ? '+' : ''}{formatCurrency(value)}
      </div>
      {percent !== undefined && (
        <div className="text-sm font-medium mt-1">
          {percent >= 0 ? '+' : ''}{(percent * 100).toFixed(0)}% improvement
        </div>
      )}
      <p className="text-xs opacity-70 mt-1">{description}</p>
    </div>
  );
}

// Format helpers
function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  if (absValue >= 1000000) {
    return (value < 0 ? '-' : '') + '$' + (absValue / 1000000).toFixed(1) + 'M';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCurrencyShort(value: number): string {
  const absValue = Math.abs(value);
  if (absValue >= 1000000) {
    return (value < 0 ? '-' : '') + '$' + (absValue / 1000000).toFixed(1) + 'M';
  }
  if (absValue >= 1000) {
    return (value < 0 ? '-' : '') + '$' + (absValue / 1000).toFixed(0) + 'K';
  }
  return '$' + value.toFixed(0);
}
