import { useState, useMemo } from 'react';
import { useClientStore } from '../../store/clientStore';
import { formatCurrency } from '../../utils/calculations';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LifeEvent {
  year: number;
  description: string;
  impact: number;
  type: 'income' | 'expense';
}

export default function CashFlowProjection() {
  const { currentClient, currentMetrics } = useClientStore();
  const [retirementAge, setRetirementAge] = useState(65);
  const [inflationRate, setInflationRate] = useState(3);
  const [incomeGrowthRate, setIncomeGrowthRate] = useState(3);
  const [retirementIncomeReplacement, setRetirementIncomeReplacement] = useState(80);
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);

  if (!currentClient || !currentMetrics) {
    return null;
  }

  const currentAge = currentClient.age;
  const projectionYears = 30;

  // Calculate 30-year projection
  const projection = useMemo(() => {
    const years: any[] = [];
    const currentAnnualIncome = currentMetrics.totalIncome;
    const currentAnnualExpenses = currentMetrics.totalMonthlyExpenses * 12;

    for (let i = 0; i < projectionYears; i++) {
      const age = currentAge + i;
      const year = new Date().getFullYear() + i;
      const yearsFromNow = i;

      // Calculate income with growth until retirement
      let income = 0;
      if (age < retirementAge) {
        income = currentAnnualIncome * Math.pow(1 + incomeGrowthRate / 100, yearsFromNow);
      } else {
        // Retirement income (Social Security + retirement withdrawals)
        const yearsIntoRetirement = age - retirementAge;
        income = (currentAnnualIncome * Math.pow(1 + incomeGrowthRate / 100, retirementAge - currentAge)) *
                 (retirementIncomeReplacement / 100) *
                 Math.pow(1 + inflationRate / 100, yearsIntoRetirement);
      }

      // Calculate expenses with inflation
      let expenses = currentAnnualExpenses * Math.pow(1 + inflationRate / 100, yearsFromNow);

      // Apply life events
      let eventImpact = 0;
      lifeEvents.forEach(event => {
        if (event.year === yearsFromNow) {
          if (event.type === 'income') {
            income += event.impact;
          } else {
            expenses += event.impact;
          }
          eventImpact += event.type === 'income' ? event.impact : -event.impact;
        }
      });

      const netCashFlow = income - expenses;

      years.push({
        year,
        age,
        yearsFromNow,
        income,
        expenses,
        netCashFlow,
        cumulativeCashFlow: i === 0 ? netCashFlow : years[i - 1].cumulativeCashFlow + netCashFlow,
        isRetired: age >= retirementAge,
        eventImpact,
      });
    }

    return years;
  }, [currentClient, currentMetrics, retirementAge, inflationRate, incomeGrowthRate, retirementIncomeReplacement, lifeEvents]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalIncome = projection.reduce((sum, year) => sum + year.income, 0);
    const totalExpenses = projection.reduce((sum, year) => sum + year.expenses, 0);
    const totalSurplus = totalIncome - totalExpenses;
    const yearsInSurplus = projection.filter(y => y.netCashFlow > 0).length;
    const yearsInDeficit = projectionYears - yearsInSurplus;
    const avgAnnualSurplus = totalSurplus / projectionYears;

    return {
      totalIncome,
      totalExpenses,
      totalSurplus,
      yearsInSurplus,
      yearsInDeficit,
      avgAnnualSurplus,
    };
  }, [projection]);

  // Chart data for income vs expenses
  const chartData = {
    labels: projection.map(p => p.year.toString()),
    datasets: [
      {
        label: 'Income',
        data: projection.map(p => p.income),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: projection.map(p => p.expenses),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Chart data for net cash flow
  const cashFlowChartData = {
    labels: projection.map(p => p.year.toString()),
    datasets: [
      {
        label: 'Net Cash Flow',
        data: projection.map(p => p.netCashFlow),
        backgroundColor: projection.map(p => p.netCashFlow >= 0 ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)'),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value: any) {
            return '$' + (value / 1000).toFixed(0) + 'K';
          }
        }
      }
    }
  };

  const addLifeEvent = () => {
    const yearInput = prompt('How many years from now will this event occur?');
    const description = prompt('Event description (e.g., "College tuition for child"):');
    const impactInput = prompt('Annual financial impact (positive for income, negative for expense):');
    const typeInput = prompt('Type: "income" or "expense"?');

    if (yearInput && description && impactInput && typeInput) {
      setLifeEvents([...lifeEvents, {
        year: parseInt(yearInput),
        description,
        impact: Math.abs(parseFloat(impactInput)),
        type: typeInput === 'income' ? 'income' : 'expense',
      }]);
    }
  };

  // Monthly expense breakdown chart data
  const expenseBreakdownData = {
    labels: ['Housing', 'Transportation', 'Food', 'Utilities', 'Insurance', 'Entertainment', 'Other'],
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
          'rgba(59, 130, 246, 0.8)',   // Blue
          'rgba(16, 185, 129, 0.8)',   // Green
          'rgba(245, 158, 11, 0.8)',   // Orange
          'rgba(139, 92, 246, 0.8)',   // Purple
          'rgba(239, 68, 68, 0.8)',    // Red
          'rgba(236, 72, 153, 0.8)',   // Pink
          'rgba(107, 114, 128, 0.8)',  // Gray
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            size: 11,
          },
          padding: 10,
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const value = data.datasets[0].data[i];
                const percentage = ((value / currentMetrics.totalMonthlyExpenses) * 100).toFixed(1);
                return {
                  text: `${label}: ${formatCurrency(value)} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed;
            const percentage = ((value / currentMetrics.totalMonthlyExpenses) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Current Monthly Spending Breakdown */}
      <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Current Monthly Spending Breakdown</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div style={{ height: '300px', position: 'relative' }}>
            <Pie data={expenseBreakdownData} options={pieChartOptions} />
          </div>
          <div>
            <div className="space-y-2">
              {[
                { label: 'Housing', value: currentClient.monthlyHousing, color: 'bg-blue-500' },
                { label: 'Transportation', value: currentClient.monthlyTransportation, color: 'bg-green-500' },
                { label: 'Food', value: currentClient.monthlyFood, color: 'bg-orange-500' },
                { label: 'Utilities', value: currentClient.monthlyUtilities, color: 'bg-purple-500' },
                { label: 'Insurance', value: currentClient.monthlyInsurance, color: 'bg-red-500' },
                { label: 'Entertainment', value: currentClient.monthlyEntertainment, color: 'bg-pink-500' },
                { label: 'Other', value: currentClient.monthlyOther, color: 'bg-gray-500' },
              ].map((item) => {
                const percentage = ((item.value / currentMetrics.totalMonthlyExpenses) * 100).toFixed(1);
                return (
                  <div key={item.label} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(item.value)}</span>
                      <span className="text-xs text-gray-600 ml-2">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center justify-between p-3 bg-gray-100 rounded border-2 border-gray-300 mt-3">
                <span className="font-bold text-gray-900">Total Monthly</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(currentMetrics.totalMonthlyExpenses)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="card-gradient">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-600 rounded-xl">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">30-Year Cash Flow Projection</h2>
            <p className="text-sm text-gray-600">
              Visualize your financial future from age {currentAge} to {currentAge + projectionYears}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
            <p className="text-sm text-green-700 mb-1">Total Income (30yr)</p>
            <p className="text-2xl font-bold text-green-900">{formatCurrency(summary.totalIncome)}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
            <p className="text-sm text-red-700 mb-1">Total Expenses (30yr)</p>
            <p className="text-2xl font-bold text-red-900">{formatCurrency(summary.totalExpenses)}</p>
          </div>
          <div className={`p-4 rounded-xl border-2 ${summary.totalSurplus >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
            <p className={`text-sm mb-1 ${summary.totalSurplus >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Net Surplus/Deficit</p>
            <p className={`text-2xl font-bold ${summary.totalSurplus >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
              {formatCurrency(summary.totalSurplus)}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
            <p className="text-sm text-purple-700 mb-1">Years in Surplus</p>
            <p className="text-2xl font-bold text-purple-900">{summary.yearsInSurplus} / {projectionYears}</p>
            <p className="text-xs text-purple-600 mt-1">{summary.yearsInDeficit} years deficit</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Projection Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Retirement Age: {retirementAge}
            </label>
            <input
              type="range"
              min="55"
              max="75"
              value={retirementAge}
              onChange={(e) => setRetirementAge(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Inflation Rate: {inflationRate}%
            </label>
            <input
              type="range"
              min="1"
              max="6"
              step="0.5"
              value={inflationRate}
              onChange={(e) => setInflationRate(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Income Growth: {incomeGrowthRate}%
            </label>
            <input
              type="range"
              min="0"
              max="8"
              step="0.5"
              value={incomeGrowthRate}
              onChange={(e) => setIncomeGrowthRate(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Retirement Income: {retirementIncomeReplacement}%
            </label>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={retirementIncomeReplacement}
              onChange={(e) => setRetirementIncomeReplacement(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Life Events */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Major Life Events</h3>
          <button
            onClick={addLifeEvent}
            className="btn btn-secondary text-sm"
          >
            <Calendar className="w-4 h-4" />
            Add Event
          </button>
        </div>
        {lifeEvents.length > 0 ? (
          <div className="space-y-2">
            {lifeEvents.map((event, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700">Year {new Date().getFullYear() + event.year}</span>
                  <span className="text-sm text-gray-600">{event.description}</span>
                </div>
                <div className="flex items-center gap-2">
                  {event.type === 'income' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-bold ${event.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(event.impact)}
                  </span>
                  <button
                    onClick={() => setLifeEvents(lifeEvents.filter((_, i) => i !== idx))}
                    className="text-red-600 hover:text-red-700 text-xs ml-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No life events added. Click "Add Event" to model major expenses like college tuition, home purchase, or inheritances.
          </p>
        )}
      </div>

      {/* Income vs Expenses Chart */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Income vs. Expenses Timeline</h3>
        <div className="h-96">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Net Cash Flow Chart */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Annual Net Cash Flow</h3>
        <div className="h-96">
          <Bar data={cashFlowChartData} options={chartOptions} />
        </div>
      </div>

      {/* Year-by-Year Table */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Year-by-Year Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Year</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Age</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Income</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Expenses</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Net Cash Flow</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projection.map((year, idx) => (
                <tr key={idx} className={`${year.isRetired ? 'bg-blue-50' : ''} hover:bg-gray-50`}>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{year.year}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {year.age}
                    {year.isRetired && <span className="ml-2 text-xs text-blue-600 font-semibold">Retired</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-green-600 font-semibold">{formatCurrency(year.income)}</td>
                  <td className="px-4 py-3 text-sm text-red-600 font-semibold">{formatCurrency(year.expenses)}</td>
                  <td className={`px-4 py-3 text-sm font-bold ${year.netCashFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    {formatCurrency(year.netCashFlow)}
                  </td>
                  <td className="px-4 py-3">
                    {year.netCashFlow >= 0 ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          Key Insights
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            • You will be in <strong className="text-blue-600">{summary.yearsInSurplus} years of surplus</strong> and{' '}
            <strong className="text-orange-600">{summary.yearsInDeficit} years of deficit</strong> over the next 30 years.
          </li>
          <li>
            • Average annual surplus: <strong>{formatCurrency(summary.avgAnnualSurplus)}</strong>
            {summary.avgAnnualSurplus > 0 ? ' - You\'re building wealth!' : ' - Consider increasing income or reducing expenses.'}
          </li>
          <li>
            • At retirement age {retirementAge}, you'll need <strong>{formatCurrency(projection.find(p => p.age === retirementAge)?.expenses || 0)}</strong> per year to maintain your lifestyle.
          </li>
          <li>
            • Current plan replaces <strong>{retirementIncomeReplacement}%</strong> of pre-retirement income. Most retirees need 70-90%.
          </li>
        </ul>
      </div>
    </div>
  );
}
