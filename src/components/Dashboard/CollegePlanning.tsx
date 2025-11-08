import { useClientStore } from '../../store/clientStore';
import { formatCurrency } from '../../utils/calculations';
import { GraduationCap, TrendingUp, DollarSign, Calendar, Target, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CollegePlanning() {
  const { currentClient, currentMetrics } = useClientStore();

  if (!currentClient?.dependents || currentClient.dependents === 0) {
    return (
      <div className="card text-center py-12">
        <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Dependents Listed</h3>
        <p className="text-gray-600 mb-4">
          Add dependents in Client Input to see college cost projections and savings strategies.
        </p>
      </div>
    );
  }

  const planning = currentMetrics?.collegePlanning;
  if (!planning) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-16 h-16 text-orange-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">College Planning Data Unavailable</h3>
        <p className="text-gray-600">
          Unable to calculate college projections. Please ensure client data is complete.
        </p>
      </div>
    );
  }

  const progressPercent = planning.projectedShortfall > 0
    ? ((planning.estimatedTotalCost - planning.projectedShortfall) / planning.estimatedTotalCost) * 100
    : 100;

  const currentSavingsWithGrowth = planning.currentSavings * Math.pow(1.07, planning.yearsUntilCollege);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">College Cost Planning</h2>
        <p className="text-gray-600">
          Projected costs for {currentClient.dependents} {currentClient.dependents === 1 ? 'child' : 'children'} attending college
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-700">Years Until College</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{planning.yearsUntilCollege}</p>
          <p className="text-xs text-gray-600 mt-1">years remaining</p>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-semibold text-gray-700">Projected Cost</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(planning.estimatedTotalCost / 1000)}K</p>
          <p className="text-xs text-gray-600 mt-1">4-year total (5% inflation)</p>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="text-sm font-semibold text-gray-700">Current Savings</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(planning.currentSavings / 1000)}K</p>
          <p className="text-xs text-gray-600 mt-1">growing at 7% annually</p>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-orange-600" />
            <h3 className="text-sm font-semibold text-gray-700">Monthly Needed</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(planning.monthlySavingsNeeded)}</p>
          <p className="text-xs text-gray-600 mt-1">to reach goal</p>
        </div>
      </div>

      {/* Progress Visualization */}
      <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">College Savings Progress</h3>

        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-700 font-medium">Projected Savings at College Start</span>
            <span className="font-bold text-gray-900">{progressPercent.toFixed(0)}% of Goal</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-4 rounded-full transition-all ${
                progressPercent >= 100 ? 'bg-green-600' : progressPercent >= 50 ? 'bg-blue-600' : 'bg-orange-600'
              }`}
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Current Savings (Today)</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(planning.currentSavings)}</p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Projected Value (with 7% growth)</p>
            <p className="text-xl font-bold text-purple-700">{formatCurrency(currentSavingsWithGrowth)}</p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-orange-200">
            <p className="text-sm text-gray-600 mb-1">Estimated Total Cost</p>
            <p className="text-xl font-bold text-orange-700">{formatCurrency(planning.estimatedTotalCost)}</p>
          </div>
        </div>
      </div>

      {/* Shortfall Warning or Success */}
      {planning.projectedShortfall > 0 ? (
        <div className="card bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Projected Shortfall: {formatCurrency(planning.projectedShortfall)}</h3>
              <p className="text-sm text-gray-700 mb-3">
                Based on current savings and growth assumptions, you'll be short <strong>{formatCurrency(planning.projectedShortfall)}</strong> when
                college starts. To close this gap, you need to save <strong>{formatCurrency(planning.monthlySavingsNeeded)}/month</strong> for the next {planning.yearsUntilCollege} years.
              </p>
              <div className="flex gap-2 text-xs text-gray-600">
                <span>• Assumes 7% annual investment return</span>
                <span>• College costs inflating at 5% annually</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-300">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">On Track for College Funding!</h3>
              <p className="text-sm text-gray-700">
                Your current savings and growth trajectory should cover the projected college costs. Keep up the great work!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cost Breakdown */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Understanding College Costs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Current Average Costs (2024)</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-blue-50 rounded">
                <span className="text-gray-700">Public In-State (4-year):</span>
                <span className="font-bold text-gray-900">$100,000</span>
              </div>
              <div className="flex justify-between p-2 bg-purple-50 rounded">
                <span className="text-gray-700">Public Out-of-State (4-year):</span>
                <span className="font-bold text-gray-900">$200,000</span>
              </div>
              <div className="flex justify-between p-2 bg-orange-50 rounded">
                <span className="text-gray-700">Private University (4-year):</span>
                <span className="font-bold text-gray-900">$250,000+</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Your Projection Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-700">Base Cost Used:</span>
                <span className="font-bold text-gray-900">$150,000</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-700">Years to Inflate:</span>
                <span className="font-bold text-gray-900">{planning.yearsUntilCollege} years</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-700">Inflation Rate:</span>
                <span className="font-bold text-gray-900">5% annually</span>
              </div>
              <div className="flex justify-between p-2 bg-green-50 rounded border-2 border-green-200">
                <span className="text-gray-700 font-semibold">Your Projected Cost:</span>
                <span className="font-bold text-green-700">{formatCurrency(planning.estimatedTotalCost)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 529 Plan Recommendation */}
      <div className="card bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200">
        <div className="flex items-start gap-4">
          <GraduationCap className="w-8 h-8 text-indigo-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Consider a 529 College Savings Plan</h3>
            <p className="text-sm text-gray-700 mb-3">
              529 plans offer tax-advantaged growth for education expenses:
            </p>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• <strong>Tax-free growth:</strong> Earnings grow federal tax-free</li>
              <li>• <strong>Tax-free withdrawals:</strong> When used for qualified education expenses</li>
              <li>• <strong>State tax deduction:</strong> Many states offer deductions for contributions</li>
              <li>• <strong>Flexible:</strong> Can be used at any accredited college nationwide</li>
            </ul>
            <p className="text-xs text-gray-600 mt-3">
              Consult with a financial advisor about 529 plans available in your state.
            </p>
          </div>
        </div>
      </div>

      {/* Action Steps */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Next Steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-2">1. Start Saving Now</h4>
            <p className="text-sm text-gray-700">
              Even small amounts grow significantly over {planning.yearsUntilCollege} years. Start with {formatCurrency(planning.monthlySavingsNeeded/2)}/month and increase gradually.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-gray-900 mb-2">2. Open a 529 Plan</h4>
            <p className="text-sm text-gray-700">
              Research 529 plans in your state for tax benefits. Many offer automatic monthly contributions.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-gray-900 mb-2">3. Explore Financial Aid</h4>
            <p className="text-sm text-gray-700">
              Scholarships, grants, and federal aid can significantly reduce out-of-pocket costs.
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-gray-900 mb-2">4. Review Annually</h4>
            <p className="text-sm text-gray-700">
              Reassess projections yearly and adjust contributions as income and expenses change.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
