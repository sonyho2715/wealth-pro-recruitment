import { useClientStore } from '../../store/clientStore';
import { formatCurrency } from '../../utils/calculations';
import { PieChart, TrendingUp, AlertCircle, CheckCircle2, BarChart3, DollarSign, Target } from 'lucide-react';
import { Pie } from 'react-chartjs-2';

export default function PortfolioAnalysis() {
  const { currentClient, currentMetrics } = useClientStore();

  if (!currentClient?.portfolio || !currentMetrics?.portfolioAnalysis) {
    return (
      <div className="card text-center py-12">
        <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Portfolio Data</h3>
        <p className="text-gray-600 mb-4">
          Add your portfolio allocation (stocks/bonds/cash percentages) in Client Input to see analysis.
        </p>
        <div className="text-sm text-gray-500">
          Go to Client Input → Portfolio Allocation (optional section)
        </div>
      </div>
    );
  }

  const portfolio = currentClient.portfolio;
  const analysis = currentMetrics.portfolioAnalysis;
  const age = currentClient.age;

  // Portfolio allocation pie chart data
  const chartData = {
    labels: ['Stocks/Equity', 'Bonds/Fixed Income', 'Cash/Money Market', 'Other'],
    datasets: [
      {
        data: [
          portfolio.stocksPercent || 0,
          portfolio.bondsPercent || 0,
          portfolio.cashPercent || 0,
          portfolio.otherPercent || 0,
        ],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
        borderColor: ['#2563EB', '#059669', '#D97706', '#7C3AED'],
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
        labels: {
          font: {
            size: 12,
          },
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ${context.parsed}%`;
          },
        },
      },
    },
  };

  const totalAllocation = (portfolio.stocksPercent || 0) + (portfolio.bondsPercent || 0) + (portfolio.cashPercent || 0) + (portfolio.otherPercent || 0);
  const allocationError = Math.abs(totalAllocation - 100);

  // Calculate recommended allocation for age
  const recommendedStocksPercent = Math.max(40, Math.min(90, 110 - age));
  const recommendedBondsPercent = 100 - recommendedStocksPercent;

  const totalInvestments = currentClient.retirement401k + currentClient.retirementIRA + currentClient.brokerage;
  const estimatedAnnualReturn = (totalInvestments * analysis.expectedReturn) / 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Analysis & Allocation</h2>
        <p className="text-gray-600">
          Review your current investment mix and get age-appropriate recommendations
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-700">Total Invested</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalInvestments / 1000)}K</p>
          <p className="text-xs text-gray-600 mt-1">across all accounts</p>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-sm font-semibold text-gray-700">Expected Return</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analysis.expectedReturn.toFixed(1)}%</p>
          <p className="text-xs text-gray-600 mt-1">~{formatCurrency(estimatedAnnualReturn)}/year</p>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-semibold text-gray-700">Risk Score</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analysis.riskScore}/100</p>
          <p className="text-xs text-gray-600 mt-1">
            {analysis.riskScore >= 80 ? 'Aggressive' : analysis.riskScore >= 60 ? 'Moderate-Aggressive' : analysis.riskScore >= 40 ? 'Moderate' : 'Conservative'}
          </p>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-orange-600" />
            <h3 className="text-sm font-semibold text-gray-700">Rebalancing</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analysis.rebalancingNeeded ? 'Needed' : 'Good'}</p>
          <p className="text-xs text-gray-600 mt-1">{analysis.rebalancingNeeded ? 'Action required' : 'On target'}</p>
        </div>
      </div>

      {/* Allocation Error Warning */}
      {allocationError > 1 && (
        <div className="card bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Allocation Error Detected</h3>
              <p className="text-sm text-gray-700">
                Your portfolio percentages add up to <strong>{totalAllocation.toFixed(1)}%</strong> instead of 100%.
                Please verify your allocation percentages in Client Input.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Allocation Warnings */}
      {analysis.allocationWarnings.length > 0 && (
        <div className="card bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Portfolio Alerts</h3>
              <ul className="space-y-1">
                {analysis.allocationWarnings.map((warning, idx) => (
                  <li key={idx} className="text-sm text-gray-700">• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Chart and Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Current Allocation</h3>
          <div style={{ height: '300px', position: 'relative' }}>
            <Pie data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Asset Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                <span className="font-medium text-gray-900">Stocks/Equity</span>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{portfolio.stocksPercent || 0}%</p>
                <p className="text-xs text-gray-600">{formatCurrency((totalInvestments * (portfolio.stocksPercent || 0)) / 100)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                <span className="font-medium text-gray-900">Bonds/Fixed Income</span>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{portfolio.bondsPercent || 0}%</p>
                <p className="text-xs text-gray-600">{formatCurrency((totalInvestments * (portfolio.bondsPercent || 0)) / 100)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-600 rounded"></div>
                <span className="font-medium text-gray-900">Cash/Money Market</span>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{portfolio.cashPercent || 0}%</p>
                <p className="text-xs text-gray-600">{formatCurrency((totalInvestments * (portfolio.cashPercent || 0)) / 100)}</p>
              </div>
            </div>

            {portfolio.otherPercent && portfolio.otherPercent > 0 && (
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-600 rounded"></div>
                  <span className="font-medium text-gray-900">Other Assets</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{portfolio.otherPercent}%</p>
                  <p className="text-xs text-gray-600">{formatCurrency((totalInvestments * portfolio.otherPercent) / 100)}</p>
                </div>
              </div>
            )}

            {portfolio.averageExpenseRatio && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Average Expense Ratio:</span>
                  <span className={`font-bold ${portfolio.averageExpenseRatio > 1 ? 'text-red-600' : 'text-green-600'}`}>
                    {portfolio.averageExpenseRatio.toFixed(2)}%
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Annual fees: ~{formatCurrency((totalInvestments * portfolio.averageExpenseRatio) / 100)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Age-Based Recommendation */}
      <div className="card bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-300">
        <div className="flex items-start gap-4">
          <Target className="w-8 h-8 text-indigo-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Recommended Allocation for Age {age}</h3>
            <p className="text-sm text-gray-700 mb-3">
              <strong>Target:</strong> {analysis.targetAllocation}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-lg border border-indigo-200">
                <p className="text-sm text-gray-600 mb-1">Recommended Stocks</p>
                <p className="text-2xl font-bold text-blue-600">{recommendedStocksPercent}%</p>
                <p className="text-xs text-gray-600 mt-1">Current: {portfolio.stocksPercent}%</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-indigo-200">
                <p className="text-sm text-gray-600 mb-1">Recommended Bonds</p>
                <p className="text-2xl font-bold text-green-600">{recommendedBondsPercent}%</p>
                <p className="text-xs text-gray-600 mt-1">Current: {portfolio.bondsPercent}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rebalancing Instructions */}
      {analysis.rebalancingNeeded && (
        <div className="card bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-orange-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Rebalancing Recommended</h3>
              <p className="text-sm text-gray-700 mb-3">
                Your current allocation differs significantly from the age-appropriate target. Consider rebalancing to reduce risk or increase growth potential.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-white rounded border">
                  <strong>If Too Conservative:</strong>
                  <p className="text-gray-700 mt-1">Shift more to stocks for long-term growth</p>
                </div>
                <div className="p-3 bg-white rounded border">
                  <strong>If Too Aggressive:</strong>
                  <p className="text-gray-700 mt-1">Add bonds to reduce volatility</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expected Returns by Asset Class */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Historical Average Returns</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
            <p className="text-sm text-gray-600 mb-1">Stocks</p>
            <p className="text-3xl font-bold text-blue-600">10%</p>
            <p className="text-xs text-gray-600 mt-1">annually (long-term)</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
            <p className="text-sm text-gray-600 mb-1">Bonds</p>
            <p className="text-3xl font-bold text-green-600">5%</p>
            <p className="text-xs text-gray-600 mt-1">annually (long-term)</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 text-center">
            <p className="text-sm text-gray-600 mb-1">Cash</p>
            <p className="text-3xl font-bold text-orange-600">2%</p>
            <p className="text-xs text-gray-600 mt-1">savings/money market</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-center">
            <p className="text-sm text-gray-600 mb-1">Your Portfolio</p>
            <p className="text-3xl font-bold text-purple-600">{analysis.expectedReturn.toFixed(1)}%</p>
            <p className="text-xs text-gray-600 mt-1">weighted average</p>
          </div>
        </div>
      </div>

      {/* Pro Tips */}
      <div className="card bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Portfolio Management Best Practices</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• <strong>Rebalance annually:</strong> Bring allocation back to target once per year</li>
              <li>• <strong>Stay diversified:</strong> Don't put all eggs in one basket - spread across asset classes</li>
              <li>• <strong>Keep costs low:</strong> Choose index funds with expense ratios under 0.50%</li>
              <li>• <strong>Time in market {'>'} timing the market:</strong> Stay invested through ups and downs</li>
              <li>• <strong>Adjust with age:</strong> Gradually shift to more conservative mix as you near retirement</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
