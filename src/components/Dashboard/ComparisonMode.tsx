import { useClientStore } from '../../store/clientStore';
import { formatCurrency } from '../../utils/calculations';
import { ArrowRight, Shield, X, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

export default function ComparisonMode() {
  const { currentClient, currentMetrics } = useClientStore();

  if (!currentClient || !currentMetrics) return null;

  const currentCoverage = currentClient.lifeInsuranceCoverage;
  const recommendedCoverage = currentMetrics.lifeInsuranceNeeded;
  const gap = currentMetrics.lifeInsuranceGap;

  // Calculate coverage percentage
  const coveragePercentage = (currentCoverage / recommendedCoverage) * 100;

  // Comparison categories
  const comparisons = [
    {
      category: 'Spouse Income Replacement',
      current: {
        covered: currentCoverage > 0,
        amount: Math.min(currentCoverage * 0.3, currentMetrics.totalIncome * 0.7 * Math.max(0, 65 - (currentClient.spouseAge || currentClient.age))),
        years: Math.floor(Math.min(currentCoverage * 0.3 / (currentMetrics.totalIncome * 0.7), Math.max(0, 65 - (currentClient.spouseAge || currentClient.age)))),
      },
      recommended: {
        covered: true,
        amount: currentMetrics.totalIncome * 0.7 * Math.max(0, 65 - (currentClient.spouseAge || currentClient.age)),
        years: Math.max(0, 65 - (currentClient.spouseAge || currentClient.age)),
      },
    },
    {
      category: 'College Funding',
      current: {
        covered: currentCoverage >= currentClient.dependents * 150000,
        amount: Math.min(currentCoverage * 0.2, currentClient.dependents * 150000),
        perChild: Math.min(currentCoverage * 0.2 / Math.max(1, currentClient.dependents), 150000),
      },
      recommended: {
        covered: true,
        amount: currentClient.dependents * 150000,
        perChild: 150000,
      },
      show: currentClient.dependents > 0,
    },
    {
      category: 'Mortgage Protection',
      current: {
        covered: currentCoverage >= currentClient.mortgage,
        amount: Math.min(currentCoverage * 0.25, currentClient.mortgage),
        percentage: Math.min((currentCoverage * 0.25 / currentClient.mortgage) * 100, 100),
      },
      recommended: {
        covered: true,
        amount: currentClient.mortgage,
        percentage: 100,
      },
      show: currentClient.mortgage > 0,
    },
    {
      category: 'Emergency & Final Expenses',
      current: {
        covered: currentCoverage >= (currentMetrics.totalMonthlyExpenses * 12 + 50000),
        amount: Math.min(currentCoverage * 0.15, currentMetrics.totalMonthlyExpenses * 12 + 50000),
      },
      recommended: {
        covered: true,
        amount: currentMetrics.totalMonthlyExpenses * 12 + 50000,
      },
    },
  ].filter(item => item.show !== false);

  return (
    <div className="card bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 rounded-full bg-blue-200">
          <Shield className="w-6 h-6 text-blue-700" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Current vs Recommended Coverage Comparison
          </h3>
          <p className="text-sm text-gray-700">
            See exactly what your family gets with your current coverage vs what they need
          </p>
        </div>
      </div>

      {/* Overall Coverage Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded-lg border-2 border-gray-300 text-center">
          <p className="text-xs text-gray-600 mb-1">Current Coverage</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentCoverage)}</p>
          <div className="mt-2">
            {coveragePercentage >= 100 ? (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                ✓ Fully Protected
              </span>
            ) : (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                {coveragePercentage.toFixed(0)}% Protected
              </span>
            )}
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border-2 border-blue-300 flex items-center justify-center">
          <ArrowRight className="w-8 h-8 text-blue-600" />
        </div>

        <div className="p-4 bg-white rounded-lg border-2 border-green-300 text-center">
          <p className="text-xs text-gray-600 mb-1">Recommended Coverage</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(recommendedCoverage)}</p>
          <div className="mt-2">
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
              100% Protected
            </span>
          </div>
        </div>
      </div>

      {gap > 0 && (
        <div className="mb-6 p-3 bg-orange-50 border-2 border-orange-300 rounded-lg text-center">
          <p className="text-sm text-orange-900">
            <strong>Gap to Close:</strong> {formatCurrency(gap)} additional coverage needed
          </p>
        </div>
      )}

      {/* Category-by-Category Comparison */}
      <div className="space-y-4">
        <h4 className="font-bold text-gray-900 text-lg">Detailed Protection Breakdown</h4>

        {comparisons.map((item, idx) => (
          <div
            key={idx}
            className="p-4 bg-white rounded-lg border-2 border-gray-300"
          >
            <h5 className="font-bold text-gray-900 mb-4">{item.category}</h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Current Coverage */}
              <div className={`p-3 rounded-lg ${item.current.covered ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {item.current.covered ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <X className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm font-bold text-gray-900">Your Current Coverage</span>
                </div>

                <p className="text-xl font-bold text-gray-900 mb-1">
                  {formatCurrency(item.current.amount)}
                </p>

                {item.category === 'Spouse Income Replacement' && (
                  <p className="text-xs text-gray-600">
                    {item.current.years} years of income replacement
                  </p>
                )}

                {item.category === 'College Funding' && (
                  <p className="text-xs text-gray-600">
                    {formatCurrency(item.current.perChild || 0)} per child
                  </p>
                )}

                {item.category === 'Mortgage Protection' && (
                  <p className="text-xs text-gray-600">
                    {(item.current.percentage || 0).toFixed(0)}% of mortgage covered
                  </p>
                )}

                {!item.current.covered && (
                  <div className="mt-2 p-2 bg-red-100 rounded">
                    <p className="text-xs text-red-800 font-bold">
                      ⚠️ Insufficient Protection
                    </p>
                  </div>
                )}
              </div>

              {/* Recommended Coverage */}
              <div className="p-3 rounded-lg bg-green-50 border-2 border-green-300">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-bold text-gray-900">Recommended Coverage</span>
                </div>

                <p className="text-xl font-bold text-green-700 mb-1">
                  {formatCurrency(item.recommended.amount)}
                </p>

                {item.category === 'Spouse Income Replacement' && (
                  <p className="text-xs text-gray-600">
                    {item.recommended.years} years of full income replacement
                  </p>
                )}

                {item.category === 'College Funding' && (
                  <p className="text-xs text-gray-600">
                    {formatCurrency(item.recommended.perChild || 0)} per child
                  </p>
                )}

                {item.category === 'Mortgage Protection' && (
                  <p className="text-xs text-gray-600">
                    100% of mortgage covered - home secure
                  </p>
                )}

                <div className="mt-2 p-2 bg-green-100 rounded">
                  <p className="text-xs text-green-800 font-bold">
                    ✓ Full Protection
                  </p>
                </div>
              </div>
            </div>

            {/* Show gap for this category */}
            {!item.current.covered && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-300 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-700 flex-shrink-0" />
                <p className="text-xs text-yellow-900">
                  <strong>Gap:</strong> {formatCurrency(item.recommended.amount - item.current.amount)} more needed for full protection in this category
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Investment Context */}
      <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-blue-700 flex-shrink-0 mt-1" />
          <div>
            <p className="text-sm font-bold text-gray-900 mb-2">The Cost-Benefit Reality:</p>
            <div className="text-sm text-gray-700 space-y-1">
              <p>• <strong>Additional Coverage Needed:</strong> {formatCurrency(gap)}</p>
              <p>• <strong>Estimated Monthly Cost:</strong> ${Math.round((gap / 1000) * 0.15 * 12 / 12)}/month</p>
              <p>• <strong>Annual Cost:</strong> ${Math.round((gap / 1000) * 0.15 * 12)}/year</p>
              <p className="mt-2 pt-2 border-t border-blue-200">
                • <strong className="text-blue-700">That's {((((gap / 1000) * 0.15 * 12) / currentMetrics.totalIncome) * 100).toFixed(2)}% of your annual income</strong> to protect 100% of your family's future
              </p>
            </div>
          </div>
        </div>
      </div>

      {gap > 0 && (
        <div className="mt-4 text-center">
          <p className="text-lg font-bold text-gray-900 mb-2">
            Close the Gap Today
          </p>
          <p className="text-sm text-gray-600 mb-4">
            For less than {((((gap / 1000) * 0.15 * 12) / 365).toFixed(2))} per day, ensure complete protection
          </p>
          <button className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors">
            Get Quote for Full Coverage
          </button>
        </div>
      )}
    </div>
  );
}
