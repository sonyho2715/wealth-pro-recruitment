import { useState } from 'react';
import { DollarSign, TrendingUp, Calculator, Zap, Award, Target } from 'lucide-react';

interface CommissionTier {
  name: string;
  threshold: number;
  lifeRate: number;
  renewalRate: number;
  bonusMultiplier: number;
  color: string;
}

const COMMISSION_TIERS: CommissionTier[] = [
  {
    name: 'New Agent',
    threshold: 0,
    lifeRate: 50,
    renewalRate: 5,
    bonusMultiplier: 1.0,
    color: 'blue',
  },
  {
    name: 'Qualified Agent',
    threshold: 50000,
    lifeRate: 70,
    renewalRate: 7,
    bonusMultiplier: 1.1,
    color: 'green',
  },
  {
    name: 'Senior Agent',
    threshold: 100000,
    lifeRate: 90,
    renewalRate: 9,
    bonusMultiplier: 1.25,
    color: 'purple',
  },
  {
    name: 'Executive Agent',
    threshold: 200000,
    lifeRate: 110,
    renewalRate: 10,
    bonusMultiplier: 1.5,
    color: 'orange',
  },
];

export default function IncomeCalculator() {
  const [monthlyPolicies, setMonthlyPolicies] = useState(4);
  const [avgPremium, setAvgPremium] = useState(2000);
  const [renewalBook, setRenewalBook] = useState(0);

  // Calculate annual production
  const annualProduction = monthlyPolicies * avgPremium * 12;

  // Determine tier
  const currentTier = [...COMMISSION_TIERS]
    .reverse()
    .find(tier => annualProduction >= tier.threshold) || COMMISSION_TIERS[0];

  // Calculate first year commissions
  const firstYearCommission = (annualProduction * currentTier.lifeRate) / 100;

  // Calculate renewal income
  const renewalIncome = (renewalBook * currentTier.renewalRate) / 100;

  // Calculate bonuses (based on production thresholds)
  const productionBonus = annualProduction >= 100000
    ? Math.floor(annualProduction / 100000) * 5000 * currentTier.bonusMultiplier
    : 0;

  // Total first year income
  const totalFirstYearIncome = firstYearCommission + renewalIncome + productionBonus;

  // Project year 2-5 income (with growing renewal book)
  const projections: Array<{
    year: number;
    newCommission: number;
    renewalIncome: number;
    bonus: number;
    total: number;
  }> = [];
  let cumulativeRenewalBook = renewalBook;

  for (let year = 1; year <= 5; year++) {
    if (year > 1) {
      cumulativeRenewalBook += annualProduction; // Previous year's sales become renewals
    }

    const yearlyNewCommission = (annualProduction * currentTier.lifeRate) / 100;
    const yearlyRenewalIncome = (cumulativeRenewalBook * currentTier.renewalRate) / 100;
    const yearlyBonus = annualProduction >= 100000
      ? Math.floor(annualProduction / 100000) * 5000 * currentTier.bonusMultiplier
      : 0;

    projections.push({
      year,
      newCommission: yearlyNewCommission,
      renewalIncome: yearlyRenewalIncome,
      bonus: yearlyBonus,
      total: yearlyNewCommission + yearlyRenewalIncome + yearlyBonus,
    });
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-full bg-blue-200">
            <Calculator className="w-6 h-6 text-blue-700" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your Income Potential Calculator
            </h2>
            <p className="text-sm text-gray-700">
              Adjust the sliders below to see your realistic earning potential as a financial advisor
            </p>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="space-y-6">
          {/* Policies Per Month */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-gray-900">
                New Policies Per Month
              </label>
              <span className="text-lg font-bold text-blue-700">{monthlyPolicies}</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              value={monthlyPolicies}
              onChange={(e) => setMonthlyPolicies(Number(e.target.value))}
              className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Part-time (1-2)</span>
              <span>Full-time (4-6)</span>
              <span>High Performer (10+)</span>
            </div>
          </div>

          {/* Average Premium */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-gray-900">
                Average Annual Premium
              </label>
              <span className="text-lg font-bold text-blue-700">{formatCurrency(avgPremium)}</span>
            </div>
            <input
              type="range"
              min="500"
              max="5000"
              step="100"
              value={avgPremium}
              onChange={(e) => setAvgPremium(Number(e.target.value))}
              className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Term Life</span>
              <span>Whole Life</span>
              <span>Universal Life</span>
            </div>
          </div>

          {/* Existing Renewal Book */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-gray-900">
                Existing Renewal Book (Annual Premium)
              </label>
              <span className="text-lg font-bold text-blue-700">{formatCurrency(renewalBook)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="500000"
              step="10000"
              value={renewalBook}
              onChange={(e) => setRenewalBook(Number(e.target.value))}
              className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>New Agent ($0)</span>
              <span>Established ($250K)</span>
              <span>Senior ($500K+)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Tier Display */}
      <div className={`card bg-gradient-to-br from-${currentTier.color}-50 to-${currentTier.color}-100 border-2 border-${currentTier.color}-300`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full bg-${currentTier.color}-200`}>
              <Award className={`w-6 h-6 text-${currentTier.color}-700`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Your Tier: {currentTier.name}</h3>
              <p className="text-sm text-gray-700">
                Annual Production: {formatCurrency(annualProduction)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Commission Rate</p>
            <p className={`text-2xl font-bold text-${currentTier.color}-700`}>
              {currentTier.lifeRate}%
            </p>
          </div>
        </div>

        {/* Tier Benefits */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="p-3 bg-white rounded-lg">
            <p className="text-xs text-gray-600">First Year</p>
            <p className="text-lg font-bold text-gray-900">{currentTier.lifeRate}%</p>
          </div>
          <div className="p-3 bg-white rounded-lg">
            <p className="text-xs text-gray-600">Renewals</p>
            <p className="text-lg font-bold text-gray-900">{currentTier.renewalRate}%</p>
          </div>
          <div className="p-3 bg-white rounded-lg">
            <p className="text-xs text-gray-600">Bonus Multiplier</p>
            <p className="text-lg font-bold text-gray-900">{currentTier.bonusMultiplier}x</p>
          </div>
        </div>
      </div>

      {/* Income Breakdown */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-600" />
          Your First Year Income Breakdown
        </h3>

        <div className="space-y-4">
          <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-900">New Business Commissions</span>
              <span className="text-xl font-bold text-green-700">
                {formatCurrency(firstYearCommission)}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              {monthlyPolicies} policies/month × {formatCurrency(avgPremium)} × 12 months × {currentTier.lifeRate}%
            </p>
          </div>

          {renewalIncome > 0 && (
            <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-900">Renewal Income</span>
                <span className="text-xl font-bold text-blue-700">
                  {formatCurrency(renewalIncome)}
                </span>
              </div>
              <p className="text-xs text-gray-600">
                {formatCurrency(renewalBook)} renewal book × {currentTier.renewalRate}%
              </p>
            </div>
          )}

          {productionBonus > 0 && (
            <div className="p-4 bg-purple-50 border-2 border-purple-300 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-900">Production Bonuses</span>
                <span className="text-xl font-bold text-purple-700">
                  {formatCurrency(productionBonus)}
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Performance incentives and tier bonuses
              </p>
            </div>
          )}

          <div className="p-6 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-90 mb-1">Total First Year Income</p>
                <p className="text-4xl font-bold">{formatCurrency(totalFirstYearIncome)}</p>
              </div>
              <Zap className="w-12 h-12 opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* 5-Year Projection */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          5-Year Income Projection
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Watch your income grow as your renewal book builds (assumes consistent production)
        </p>

        <div className="space-y-3">
          {projections.map((projection) => (
            <div
              key={projection.year}
              className="p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-900">Year {projection.year}</span>
                <span className="text-2xl font-bold text-blue-700">
                  {formatCurrency(projection.total)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                <div>
                  <span className="block text-gray-500">New Business</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(projection.newCommission)}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500">Renewals</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(projection.renewalIncome)}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500">Bonuses</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(projection.bonus)}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((projection.total / projections[4].total) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Total 5-Year Earnings */}
        <div className="mt-6 p-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90 mb-1">Total 5-Year Earnings</p>
              <p className="text-4xl font-bold">
                {formatCurrency(projections.reduce((sum, p) => sum + p.total, 0))}
              </p>
            </div>
            <Target className="w-12 h-12 opacity-50" />
          </div>
        </div>
      </div>

      {/* Key Benefits Callout */}
      <div className="card bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300">
        <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Why Your Income Grows</h3>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span><strong>Residual Income:</strong> Earn {currentTier.renewalRate}% every year clients keep their policies</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span><strong>Tier Advancement:</strong> Higher production = higher commission rates</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span><strong>Performance Bonuses:</strong> Hit production milestones for extra rewards</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span><strong>Compounding Growth:</strong> Your book grows year after year automatically</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
