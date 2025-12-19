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
import { YearlyFinancials, formatCurrency, formatPercent } from '@/lib/business-calculations';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

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

interface TrendChartsProps {
  data: YearlyFinancials[];
  showCOGSRatio?: boolean;
}

export default function TrendCharts({ data, showCOGSRatio = true }: TrendChartsProps) {
  // Sort data by year
  const sortedData = useMemo(() => [...data].sort((a, b) => a.taxYear - b.taxYear), [data]);

  const labels = sortedData.map((d) => d.taxYear.toString());

  // Calculate YoY growth rates
  const growthRates = useMemo(() => {
    const rates: { revenue: number | null; netIncome: number | null }[] = [];
    for (let i = 0; i < sortedData.length; i++) {
      if (i === 0) {
        rates.push({ revenue: null, netIncome: null });
      } else {
        const prevRevenue = sortedData[i - 1].netReceipts;
        const currRevenue = sortedData[i].netReceipts;
        const revenueGrowth = prevRevenue !== 0 ? (currRevenue - prevRevenue) / prevRevenue : 0;

        rates.push({
          revenue: revenueGrowth,
          netIncome: null, // Net income growth can be misleading with negative values
        });
      }
    }
    return rates;
  }, [sortedData]);

  // Revenue & Profit Chart Data
  const revenueChartData = {
    labels,
    datasets: [
      {
        label: 'Revenue',
        data: sortedData.map((d) => d.netReceipts),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'COGS',
        data: sortedData.map((d) => d.costOfGoodsSold),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  // Net Income Chart Data (Bar chart with positive/negative colors)
  const netIncomeChartData = {
    labels,
    datasets: [
      {
        label: 'Net Income',
        data: sortedData.map((d) => d.netIncome),
        backgroundColor: sortedData.map((d) =>
          d.netIncome >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'
        ),
        borderColor: sortedData.map((d) =>
          d.netIncome >= 0 ? '#10b981' : '#ef4444'
        ),
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  // COGS Ratio Chart Data
  const cogsRatioData = {
    labels,
    datasets: [
      {
        label: 'COGS Ratio',
        data: sortedData.map((d) =>
          d.netReceipts > 0 ? (d.costOfGoodsSold / d.netReceipts) * 100 : 0
        ),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 6,
        pointHoverRadius: 8,
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
            return formatCurrency(value, true);
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

  const percentOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        ticks: {
          callback: function (value: any) {
            return `${value}%`;
          },
        },
        min: 0,
        max: 100,
      },
    },
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          label: function (context: any) {
            const value = context.raw as number;
            return `${context.dataset.label}: ${value.toFixed(1)}%`;
          },
        },
      },
    },
  };

  // Calculate summary metrics
  const latestYear = sortedData[sortedData.length - 1];
  const previousYear = sortedData.length > 1 ? sortedData[sortedData.length - 2] : null;
  const revenueChange = previousYear
    ? ((latestYear.netReceipts - previousYear.netReceipts) / previousYear.netReceipts)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          label="Latest Revenue"
          value={formatCurrency(latestYear.netReceipts)}
          change={previousYear ? revenueChange : null}
          year={latestYear.taxYear}
        />
        <SummaryCard
          label="Latest Net Income"
          value={formatCurrency(latestYear.netIncome)}
          isPositive={latestYear.netIncome >= 0}
          year={latestYear.taxYear}
        />
        <SummaryCard
          label="COGS Ratio"
          value={formatPercent(latestYear.costOfGoodsSold / latestYear.netReceipts)}
          subtext={latestYear.costOfGoodsSold / latestYear.netReceipts > 0.5 ? 'High' : 'Healthy'}
          year={latestYear.taxYear}
        />
        <SummaryCard
          label="Pension Contrib"
          value={formatCurrency(latestYear.pensionContributions)}
          subtext={latestYear.pensionContributions === 0 ? 'None' : 'Active'}
          year={latestYear.taxYear}
        />
      </div>

      {/* Revenue & COGS Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Revenue & Cost of Goods Sold</h3>
        <p className="text-sm text-slate-500 mb-4">Multi-year trend comparison</p>
        <div className="h-72">
          <Line data={revenueChartData} options={chartOptions} />
        </div>
      </div>

      {/* Net Income Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Net Income (Profit/Loss)</h3>
        <p className="text-sm text-slate-500 mb-4">
          <span className="inline-flex items-center gap-1 text-emerald-600">
            <span className="w-3 h-3 rounded-sm bg-emerald-500" />
            Profit
          </span>
          <span className="mx-2">/</span>
          <span className="inline-flex items-center gap-1 text-red-600">
            <span className="w-3 h-3 rounded-sm bg-red-500" />
            Loss
          </span>
        </p>
        <div className="h-72">
          <Bar data={netIncomeChartData} options={chartOptions} />
        </div>
      </div>

      {/* COGS Ratio Chart */}
      {showCOGSRatio && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">COGS Ratio Trend</h3>
          <p className="text-sm text-slate-500 mb-4">
            Cost of goods sold as percentage of revenue (target: below 45%)
          </p>
          <div className="h-72">
            <Line data={cogsRatioData} options={percentOptions} />
          </div>
        </div>
      )}

      {/* Year-over-Year Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Year-over-Year Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  YoY Growth
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  COGS
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  COGS %
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Net Income
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedData.map((year, index) => {
                const cogsRatio = year.netReceipts > 0 ? year.costOfGoodsSold / year.netReceipts : 0;
                const growth = growthRates[index].revenue;

                return (
                  <tr key={year.taxYear} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{year.taxYear}</td>
                    <td className="px-4 py-3 text-sm text-right text-slate-600">
                      {formatCurrency(year.netReceipts)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {growth !== null ? (
                        <span className={growth >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                          {growth >= 0 ? '+' : ''}
                          {formatPercent(growth)}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-slate-600">
                      {formatCurrency(year.costOfGoodsSold)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span
                        className={
                          cogsRatio > 0.55
                            ? 'text-red-600'
                            : cogsRatio > 0.45
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }
                      >
                        {formatPercent(cogsRatio)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      <span className={year.netIncome >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                        {formatCurrency(year.netIncome)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Summary Card Component
interface SummaryCardProps {
  label: string;
  value: string;
  change?: number | null;
  isPositive?: boolean;
  subtext?: string;
  year: number;
}

function SummaryCard({ label, value, change, isPositive, subtext, year }: SummaryCardProps) {
  const getTrendIcon = () => {
    if (change !== null && change !== undefined) {
      if (change > 0.05) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      if (change < -0.05) return <TrendingDown className="w-4 h-4 text-red-500" />;
      return <Minus className="w-4 h-4 text-slate-400" />;
    }
    if (isPositive !== undefined) {
      return isPositive ? (
        <TrendingUp className="w-4 h-4 text-emerald-500" />
      ) : (
        <TrendingDown className="w-4 h-4 text-red-500" />
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-xs text-slate-400">{year}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-slate-900">{value}</span>
        {getTrendIcon()}
      </div>
      {change !== null && change !== undefined && (
        <p className={`text-xs mt-1 ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {change >= 0 ? '+' : ''}
          {formatPercent(change)} YoY
        </p>
      )}
      {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
    </div>
  );
}
