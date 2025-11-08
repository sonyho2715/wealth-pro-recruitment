import { useClientStore } from '../../store/clientStore';
import { formatCurrency } from '../../utils/calculations';
import { TrendingDown, Zap, DollarSign, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DebtPayoffCalculator() {
  const { currentClient, currentMetrics } = useClientStore();

  if (!currentMetrics?.debtPayoffAnalysis || !currentClient?.detailedDebts) {
    return (
      <div className="card text-center py-12">
        <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Detailed Debt Data</h3>
        <p className="text-gray-600 mb-4">
          Add interest rates and minimum payments to your debts in Client Input to see payoff strategies.
        </p>
        <div className="text-sm text-gray-500">
          Go to Client Input → Detailed Debt Tracking (optional section)
        </div>
      </div>
    );
  }

  const analysis = currentMetrics.debtPayoffAnalysis;
  const detailedDebts = currentClient.detailedDebts;

  // Collect all debts for display
  const allDebts: Array<{ name: string; balance: number; apr: number; minPayment: number; type: string }> = [];

  if (detailedDebts.creditCardDebts) {
    detailedDebts.creditCardDebts.forEach(d =>
      allDebts.push({ ...d, minPayment: d.minPayment, type: 'Credit Card' })
    );
  }
  if (detailedDebts.studentLoanDebts) {
    detailedDebts.studentLoanDebts.forEach(d =>
      allDebts.push({ ...d, minPayment: d.minPayment, type: 'Student Loan' })
    );
  }
  if (detailedDebts.carLoanDebts) {
    detailedDebts.carLoanDebts.forEach(d =>
      allDebts.push({ name: d.name, balance: d.balance, apr: d.apr, minPayment: d.monthlyPayment, type: 'Car Loan' })
    );
  }
  if (detailedDebts.otherDebts) {
    detailedDebts.otherDebts.forEach(d =>
      allDebts.push({ ...d, minPayment: d.minPayment, type: 'Other Debt' })
    );
  }

  // Sort for display
  const avalancheOrder = [...allDebts].sort((a, b) => b.apr - a.apr);
  const snowballOrder = [...allDebts].sort((a, b) => a.balance - b.balance);

  const totalDebt = allDebts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinPayment = allDebts.reduce((sum, d) => sum + d.minPayment, 0);
  const monthsSavedFromAvalanche = analysis.monthsToPayoffSnowball - analysis.monthsToPayoffAvalanche;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Debt Payoff Strategy Comparison</h2>
        <p className="text-gray-600">
          Compare the Avalanche (pay highest interest first) vs Snowball (pay smallest balance first) methods
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-semibold text-gray-700">Total Debt</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalDebt)}</p>
          <p className="text-xs text-gray-600 mt-1">{allDebts.length} debts</p>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-700">Min. Payment</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalMinPayment)}</p>
          <p className="text-xs text-gray-600 mt-1">per month</p>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-green-600" />
            <h3 className="text-sm font-semibold text-gray-700">Interest Saved</h3>
          </div>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(analysis.savingsFromAvalanche)}</p>
          <p className="text-xs text-gray-600 mt-1">using Avalanche</p>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-semibold text-gray-700">Time Saved</h3>
          </div>
          <p className="text-2xl font-bold text-purple-700">{monthsSavedFromAvalanche} mo</p>
          <p className="text-xs text-gray-600 mt-1">using Avalanche</p>
        </div>
      </div>

      {/* Strategy Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Avalanche Method */}
        <div className={`card ${analysis.recommendedMethod === 'avalanche' ? 'border-4 border-green-400 shadow-lg' : 'border-2 border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-100">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Avalanche Method</h3>
                <p className="text-sm text-gray-600">Highest interest rate first</p>
              </div>
            </div>
            {analysis.recommendedMethod === 'avalanche' && (
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 border-2 border-green-300 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-green-700" />
                <span className="text-xs font-bold text-green-700">RECOMMENDED</span>
              </div>
            )}
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Interest Paid:</span>
              <span className="font-bold text-gray-900">{formatCurrency(analysis.totalInterestAvalanche)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Time to Debt Freedom:</span>
              <span className="font-bold text-gray-900">{analysis.monthsToPayoffAvalanche} months ({(analysis.monthsToPayoffAvalanche / 12).toFixed(1)} years)</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Payoff Order:</h4>
            <div className="space-y-2">
              {avalancheOrder.map((debt, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-green-100 text-green-700 rounded-full text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="flex-1 text-gray-900">{debt.name}</span>
                  <span className="text-red-600 font-semibold">{debt.apr.toFixed(1)}%</span>
                  <span className="text-gray-600">{formatCurrency(debt.balance)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-gray-700">
              <strong>Best for:</strong> Saving the most money in interest. Mathematically optimal.
            </p>
          </div>
        </div>

        {/* Snowball Method */}
        <div className={`card ${analysis.recommendedMethod === 'snowball' ? 'border-4 border-blue-400 shadow-lg' : 'border-2 border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-100">
                <TrendingDown className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Snowball Method</h3>
                <p className="text-sm text-gray-600">Smallest balance first</p>
              </div>
            </div>
            {analysis.recommendedMethod === 'snowball' && (
              <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 border-2 border-blue-300 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-blue-700" />
                <span className="text-xs font-bold text-blue-700">RECOMMENDED</span>
              </div>
            )}
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Interest Paid:</span>
              <span className="font-bold text-gray-900">{formatCurrency(analysis.totalInterestSnowball)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Time to Debt Freedom:</span>
              <span className="font-bold text-gray-900">{analysis.monthsToPayoffSnowball} months ({(analysis.monthsToPayoffSnowball / 12).toFixed(1)} years)</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Payoff Order:</h4>
            <div className="space-y-2">
              {snowballOrder.map((debt, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="flex-1 text-gray-900">{debt.name}</span>
                  <span className="text-gray-600">{formatCurrency(debt.balance)}</span>
                  <span className="text-red-600 font-semibold text-xs">{debt.apr.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-gray-700">
              <strong>Best for:</strong> Quick wins and psychological motivation. See debts disappear faster.
            </p>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Our Recommendation: {analysis.recommendedMethod === 'avalanche' ? 'Avalanche Method' : 'Snowball Method'}</h3>
            {analysis.recommendedMethod === 'avalanche' ? (
              <p className="text-sm text-gray-700">
                The <strong>Avalanche method</strong> will save you <strong>{formatCurrency(analysis.savingsFromAvalanche)}</strong> in interest
                and get you debt-free <strong>{monthsSavedFromAvalanche} months faster</strong>. While it may take longer to pay off your first debt,
                you'll save significantly more money overall.
              </p>
            ) : (
              <p className="text-sm text-gray-700">
                While the Avalanche method would save you ${analysis.savingsFromAvalanche.toLocaleString()} in interest,
                the <strong>Snowball method</strong> provides quick psychological wins that can help you stay motivated.
                Consider Avalanche if you're disciplined, or Snowball if you need early victories.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Current Debts List */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Your Current Debts</h3>
        <div className="space-y-3">
          {allDebts.map((debt, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{debt.name}</h4>
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">{debt.type}</span>
                </div>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>Balance: <strong className="text-gray-900">{formatCurrency(debt.balance)}</strong></span>
                  <span>APR: <strong className="text-red-600">{debt.apr}%</strong></span>
                  <span>Min. Payment: <strong className="text-gray-900">{formatCurrency(debt.minPayment)}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
