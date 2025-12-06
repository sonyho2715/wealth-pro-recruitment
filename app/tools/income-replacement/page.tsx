'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Shield, Calculator, DollarSign, Calendar, TrendingUp, ArrowRight, Info } from 'lucide-react';
import { calculateIncomeReplacement } from '@/lib/calculations';
import { FINANCIAL_ASSUMPTIONS } from '@/lib/config';

export default function IncomeReplacementCalculatorPage() {
  const [monthlyIncome, setMonthlyIncome] = useState(6000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(4500);
  const [yearsOfCoverage, setYearsOfCoverage] = useState(20);
  const [includeInflation, setIncludeInflation] = useState(true);

  const result = useMemo(() => {
    return calculateIncomeReplacement({
      monthlyIncome,
      monthlyExpenses,
      yearsOfCoverage,
      inflationRate: includeInflation ? FINANCIAL_ASSUMPTIONS.inflationRate : 0,
    });
  }, [monthlyIncome, monthlyExpenses, yearsOfCoverage, includeInflation]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-900 hover:text-blue-600 transition-colors">
            <Shield className="w-6 h-6" />
            <span className="font-bold text-lg">Wealth Pro</span>
          </Link>
          <Link href="/prospect" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            Start Full Financial Review
          </Link>
        </div>
      </nav>

      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Calculator className="w-4 h-4" />
              Financial Planning Tool
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Income Replacement Calculator
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Calculate how much income replacement insurance you need to protect your family
              if you were unable to work due to disability or death.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Your Financial Details
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Gross Income
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(parseInt(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Your total monthly income before taxes</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Living Expenses
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={monthlyExpenses}
                      onChange={(e) => setMonthlyExpenses(parseInt(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Housing, food, utilities, transportation, etc.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Coverage Needed
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="5"
                      max="40"
                      value={yearsOfCoverage}
                      onChange={(e) => setYearsOfCoverage(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <span className="text-lg font-semibold text-gray-900 w-16 text-right">
                      {yearsOfCoverage} yrs
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Until retirement or children are independent</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Adjust for {(FINANCIAL_ASSUMPTIONS.inflationRate * 100).toFixed(1)}% inflation</span>
                  </div>
                  <button
                    onClick={() => setIncludeInflation(!includeInflation)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      includeInflation ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        includeInflation ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {/* Total Need Card */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-2 text-blue-100 mb-2">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-medium">Your Income Replacement Need</span>
                </div>
                <div className="text-4xl font-bold mb-2">
                  {formatCurrency(result.totalNeed)}
                </div>
                <p className="text-blue-100 text-sm">
                  Total coverage needed for {yearsOfCoverage} years
                  {includeInflation && ' (inflation-adjusted)'}
                </p>
              </div>

              {/* Breakdown */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Calculation Breakdown
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Monthly Need</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(result.monthlyNeed)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Annual Need (Year 1)</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(result.annualNeed)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Years of Coverage</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {yearsOfCoverage} years
                    </span>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 mt-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">How we calculate this:</p>
                        <p>
                          Monthly Need ({formatCurrency(result.monthlyNeed)}) × 12 months × {yearsOfCoverage} years
                          {includeInflation && ' + inflation adjustments'} = {formatCurrency(result.totalNeed)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Link
                href="/prospect"
                className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-4 rounded-xl font-medium hover:bg-gray-800 transition w-full"
              >
                Get Your Complete Financial Analysis
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Year-by-Year Table */}
          {result.breakdown.length > 0 && (
            <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Year-by-Year Breakdown
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
                      <th className="py-3 px-4">Year</th>
                      <th className="py-3 px-4 text-right">Annual Need</th>
                      <th className="py-3 px-4 text-right">Cumulative Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.breakdown.slice(0, 10).map((row) => (
                      <tr key={row.year} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">Year {row.year}</td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {formatCurrency(row.annualNeed)}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">
                          {formatCurrency(row.cumulativeNeed)}
                        </td>
                      </tr>
                    ))}
                    {result.breakdown.length > 10 && (
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 text-gray-500 italic" colSpan={3}>
                          ... {result.breakdown.length - 10} more years
                        </td>
                      </tr>
                    )}
                    <tr className="bg-blue-50">
                      <td className="py-3 px-4 font-semibold">Total ({yearsOfCoverage} years)</td>
                      <td className="py-3 px-4"></td>
                      <td className="py-3 px-4 text-right font-bold text-blue-600 text-lg">
                        {formatCurrency(result.totalNeed)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Educational Content */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Why 60% of Income?</h4>
              <p className="text-sm text-gray-600">
                Most disability policies replace 60% of income because you won&apos;t pay
                Social Security taxes on benefits, making it roughly equivalent to your
                take-home pay.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Why Adjust for Inflation?</h4>
              <p className="text-sm text-gray-600">
                The cost of living increases over time. A 3% inflation rate means your
                $100 today will only have the purchasing power of $74 in 10 years.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Types of Coverage</h4>
              <p className="text-sm text-gray-600">
                Income replacement comes from life insurance (for death) and disability
                insurance (for illness/injury). Both are essential for complete protection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
