import { useEffect, useState } from 'react';
import { useClientStore } from '../../store/clientStore';
import { formatCurrency } from '../../utils/calculations';
import {
  TrendingUp,
  Wallet,
  Building2,
  CreditCard,
  DollarSign,
  Activity,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function LivingBalanceSheet() {
  const { currentClient, currentMetrics, history } = useClientStore();
  const [netWorthChange, setNetWorthChange] = useState(0);
  const [netWorthChangePercent, setNetWorthChangePercent] = useState(0);

  useEffect(() => {
    if (history.length >= 2) {
      const current = history[history.length - 1];
      const previous = history[history.length - 2];
      const change = current.metrics.netWorth - previous.metrics.netWorth;
      const changePercent = (change / Math.abs(previous.metrics.netWorth)) * 100;
      setNetWorthChange(change);
      setNetWorthChangePercent(changePercent);
    }
  }, [history]);

  if (!currentClient || !currentMetrics) {
    return null;
  }

  // Calculate asset breakdown
  const liquidAssets = currentClient.checking + currentClient.savings;
  const investmentAssets =
    currentClient.retirement401k + currentClient.retirementIRA + currentClient.brokerage;
  const realEstateAssets = currentClient.homeValue;
  const otherAssets = currentClient.otherAssets;

  // Calculate liability breakdown
  const mortgageDebt = currentClient.mortgage;
  const consumerDebt =
    currentClient.studentLoans + currentClient.carLoans + currentClient.creditCards;
  const otherDebt = currentClient.otherDebts;

  // Monthly income vs expenses
  const monthlyIncome = currentMetrics.totalIncome / 12;
  const monthlyExpenses = currentMetrics.totalMonthlyExpenses;
  const monthlySurplus = monthlyIncome - monthlyExpenses;

  // Asset/Liability comparison data
  const comparisonData = {
    labels: ['Liquid Assets', 'Investments', 'Real Estate', 'Other Assets', 'Liabilities'],
    datasets: [
      {
        label: 'Assets',
        data: [liquidAssets, investmentAssets, realEstateAssets, otherAssets, 0],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'Liabilities',
        data: [0, 0, 0, 0, currentMetrics.totalLiabilities],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  };

  // Net Worth Trend data
  const netWorthTrendData = {
    labels: history.map((h) => new Date(h.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Net Worth',
        data: history.map((h) => h.metrics.netWorth),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Total Assets',
        data: history.map((h) => h.metrics.totalAssets),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Total Liabilities',
        data: history.map((h) => h.metrics.totalLiabilities),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: false,
        tension: 0.4,
      },
    ],
  };

  // Cash Flow data
  const cashFlowData = {
    labels: ['Monthly Income', 'Monthly Expenses', 'Monthly Surplus'],
    datasets: [
      {
        data: [monthlyIncome, monthlyExpenses, monthlySurplus > 0 ? monthlySurplus : 0],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
      },
    ],
  };

  // Asset allocation pie chart
  const assetAllocationData = {
    labels: ['Liquid Assets', 'Investments', 'Real Estate', 'Other'],
    datasets: [
      {
        data: [liquidAssets, investmentAssets, realEstateAssets, otherAssets],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(251, 146, 60, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
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
    },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card-gradient">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold gradient-text flex items-center gap-2">
              <Activity className="w-8 h-8" />
              Financial Snapshot
            </h2>
            <p className="text-gray-600 mt-2">
              Your complete financial picture at a glance
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Net Worth</p>
            <p className="text-4xl font-bold text-gray-900">
              {formatCurrency(currentMetrics.netWorth)}
            </p>
            {history.length >= 2 && (
              <div className={`flex items-center justify-end gap-1 mt-1 ${netWorthChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netWorthChange >= 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span className="text-sm font-semibold">
                  {formatCurrency(Math.abs(netWorthChange))} ({Math.abs(netWorthChangePercent).toFixed(1)}%)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assets vs Liabilities Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets Card */}
        <div className="card-highlight">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Total Assets</h3>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(currentMetrics.totalAssets)}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <AssetRow
              label="Liquid Assets"
              amount={liquidAssets}
              total={currentMetrics.totalAssets}
              icon={<DollarSign className="w-4 h-4" />}
              color="blue"
            />
            <AssetRow
              label="Investments"
              amount={investmentAssets}
              total={currentMetrics.totalAssets}
              icon={<TrendingUp className="w-4 h-4" />}
              color="green"
            />
            <AssetRow
              label="Real Estate"
              amount={realEstateAssets}
              total={currentMetrics.totalAssets}
              icon={<Building2 className="w-4 h-4" />}
              color="purple"
            />
            <AssetRow
              label="Other Assets"
              amount={otherAssets}
              total={currentMetrics.totalAssets}
              icon={<PieChart className="w-4 h-4" />}
              color="orange"
            />
          </div>
        </div>

        {/* Liabilities Card */}
        <div className="card-highlight">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <CreditCard className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Total Liabilities</h3>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(currentMetrics.totalLiabilities)}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <AssetRow
              label="Mortgage"
              amount={mortgageDebt}
              total={currentMetrics.totalLiabilities}
              icon={<Building2 className="w-4 h-4" />}
              color="red"
            />
            <AssetRow
              label="Consumer Debt"
              amount={consumerDebt}
              total={currentMetrics.totalLiabilities}
              icon={<CreditCard className="w-4 h-4" />}
              color="orange"
            />
            <AssetRow
              label="Other Debt"
              amount={otherDebt}
              total={currentMetrics.totalLiabilities}
              icon={<DollarSign className="w-4 h-4" />}
              color="yellow"
            />
          </div>
          <div className="mt-4 pt-4 border-t-2 border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Net Worth</span>
              <span className={`text-xl font-bold ${currentMetrics.netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(currentMetrics.netWorth)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Allocation Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Asset Allocation</h3>
          <div style={{ height: '300px' }}>
            <Doughnut data={assetAllocationData} options={chartOptions} />
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Cash Flow Analysis</h3>
          <div style={{ height: '300px' }}>
            <Doughnut data={cashFlowData} options={chartOptions} />
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Monthly Income:</span>
              <span className="font-semibold text-green-600">{formatCurrency(monthlyIncome)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Monthly Expenses:</span>
              <span className="font-semibold text-red-600">{formatCurrency(monthlyExpenses)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="font-semibold text-gray-900">Monthly Surplus:</span>
              <span className={`font-bold ${monthlySurplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(monthlySurplus)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Assets vs Liabilities Comparison Chart */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Assets vs Liabilities Comparison
        </h3>
        <div style={{ height: '350px' }}>
          <Bar
            data={comparisonData}
            options={{
              ...chartOptions,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => formatCurrency(value as number),
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Net Worth Trend */}
      {history.length > 1 && (
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Net Worth Trend</h3>
          <div style={{ height: '350px' }}>
            <Line
              data={netWorthTrendData}
              options={{
                ...chartOptions,
                scales: {
                  y: {
                    beginAtZero: false,
                    ticks: {
                      callback: (value) => formatCurrency(value as number),
                    },
                  },
                },
              }}
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-600">First Snapshot</p>
              <p className="font-bold text-gray-900">
                {formatCurrency(history[0].metrics.netWorth)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Current</p>
              <p className="font-bold text-blue-600">
                {formatCurrency(currentMetrics.netWorth)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Total Change</p>
              <p className={`font-bold ${currentMetrics.netWorth - history[0].metrics.netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(currentMetrics.netWorth - history[0].metrics.netWorth)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface AssetRowProps {
  label: string;
  amount: number;
  total: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';
}

function AssetRow({ label, amount, total, icon, color }: AssetRowProps) {
  const percentage = total > 0 ? (amount / total) * 100 : 0;

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
  };

  const textColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className={textColorClasses[color]}>{icon}</span>
          <span className="text-gray-700">{label}</span>
        </div>
        <div className="text-right">
          <span className="font-semibold text-gray-900">{formatCurrency(amount)}</span>
          <span className="text-xs text-gray-500 ml-2">({percentage.toFixed(1)}%)</span>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
