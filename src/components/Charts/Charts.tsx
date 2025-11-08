import { useMemo, memo } from 'react';
import { useClientStore } from '../../store/clientStore';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Memoize chart component to prevent unnecessary re-renders
const Charts = memo(function Charts() {
  const { currentClient, currentMetrics } = useClientStore();

  // Memoize chart options to prevent recreating on every render
  const pieChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
  }), []);

  const barChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }), []);

  // Memoize asset data to prevent recalculating when dependencies don't change
  const assetData = useMemo(() => {
    if (!currentClient) return null;
    return {
    labels: ['Checking', 'Savings', '401(k)', 'IRA', 'Brokerage', 'Home', 'Other'],
    datasets: [
      {
        data: [
          currentClient.checking,
          currentClient.savings,
          currentClient.retirement401k,
          currentClient.retirementIRA,
          currentClient.brokerage,
          currentClient.homeValue,
          currentClient.otherAssets,
        ],
        backgroundColor: [
          '#60a5fa',
          '#34d399',
          '#a78bfa',
          '#f472b6',
          '#fbbf24',
          '#fb923c',
          '#94a3b8',
        ],
      },
    ],
    };
  }, [currentClient]);

  // Memoize balance data
  const balanceData = useMemo(() => {
    if (!currentMetrics) return null;
    return {
    labels: ['Assets vs Liabilities'],
    datasets: [
      {
        label: 'Total Assets',
        data: [currentMetrics.totalAssets],
        backgroundColor: '#10b981',
      },
      {
        label: 'Total Liabilities',
        data: [currentMetrics.totalLiabilities],
        backgroundColor: '#ef4444',
      },
    ],
    };
  }, [currentMetrics]);

  // Memoize expenses data
  const expensesData = useMemo(() => {
    if (!currentClient) return null;
    return {
    labels: ['Housing', 'Transport', 'Food', 'Utilities', 'Insurance', 'Entertainment', 'Other'],
    datasets: [
      {
        data: [
          currentClient.monthlyHousing,
          currentClient.monthlyTransportation,
          currentClient.monthlyFood,
          currentClient.monthlyUtilities,
          currentClient.monthlyInsurance,
          currentClient.monthlyEntertainment,
          currentClient.monthlyOther,
        ],
        backgroundColor: [
          '#3b82f6',
          '#8b5cf6',
          '#ec4899',
          '#f59e0b',
          '#10b981',
          '#06b6d4',
          '#64748b',
        ],
      },
    ],
    };
  }, [currentClient]);

  if (!currentClient || !currentMetrics || !assetData || !balanceData || !expensesData) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Visual Analysis</h2>
        <p className="text-sm text-gray-600 mt-1">Interactive charts and visualizations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Allocation */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Asset Allocation</h3>
          <div className="h-80 flex items-center justify-center">
            <Pie data={assetData} options={pieChartOptions} />
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Monthly Expense Breakdown</h3>
          <div className="h-80 flex items-center justify-center">
            <Doughnut data={expensesData} options={pieChartOptions} />
          </div>
        </div>

        {/* Assets vs Liabilities */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Assets vs Liabilities</h3>
          <div className="h-80">
            <Bar data={balanceData} options={barChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
});

export default Charts;
