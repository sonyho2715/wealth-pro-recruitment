import { useClientStore } from '../../store/clientStore';
import { formatCurrency } from '../../utils/calculations';
import { AlertTriangle, TrendingDown, Home, GraduationCap, CreditCard, Briefcase, HeartCrack, Shield } from 'lucide-react';
import { useState } from 'react';

export default function WithoutInsuranceCalculator() {
  const { currentClient, currentMetrics } = useClientStore();
  const [showComparison, setShowComparison] = useState(false);

  if (!currentClient || !currentMetrics) return null;

  // Calculate liquid assets available immediately
  const liquidAssets = currentClient.checking + currentClient.savings;

  // Calculate monthly expenses
  const monthlyExpenses = currentMetrics.totalMonthlyExpenses;

  // Calculate how many months liquid assets would last
  const monthsCovered = liquidAssets / monthlyExpenses;

  // Calculate when different assets would need to be liquidated
  const retirementFunds = currentClient.retirement401k + currentClient.retirementIRA;
  const monthsWithRetirement = (liquidAssets + retirementFunds * 0.7) / monthlyExpenses; // 30% penalty for early withdrawal

  const brokerageValue = currentClient.brokerage || 0;
  const monthsWithAll = (liquidAssets + retirementFunds * 0.7 + brokerageValue) / monthlyExpenses;

  // Calculate life insurance gap
  const gap = currentMetrics.lifeInsuranceGap;

  // Timeline of events
  const timeline = [
    {
      month: 0,
      event: 'Tragedy Strikes',
      description: 'Family loses primary breadwinner',
      icon: HeartCrack,
      severity: 'critical',
      color: 'red',
    },
    {
      month: Math.floor(monthsCovered),
      event: 'Savings Depleted',
      description: `After ${Math.floor(monthsCovered)} months, all liquid savings exhausted`,
      icon: TrendingDown,
      severity: 'critical',
      color: 'red',
    },
    {
      month: Math.floor(monthsCovered) + 1,
      event: 'Forced Asset Liquidation',
      description: 'Must sell retirement accounts with 30% penalty + taxes',
      icon: Briefcase,
      severity: 'critical',
      color: 'orange',
    },
    {
      month: Math.floor(monthsWithRetirement),
      event: 'Retirement Funds Gone',
      description: 'All retirement savings liquidated, no financial security left',
      icon: TrendingDown,
      severity: 'critical',
      color: 'red',
    },
    {
      month: Math.floor(monthsWithRetirement) + 2,
      event: 'House Goes Up For Sale',
      description: 'Family forced to sell home, relocate to smaller rental',
      icon: Home,
      severity: 'critical',
      color: 'red',
    },
  ];

  if (currentClient.dependents > 0) {
    timeline.push({
      month: Math.floor(monthsWithAll),
      event: 'College Dreams Shattered',
      description: 'Children must give up college plans, enter workforce early',
      icon: GraduationCap,
      severity: 'critical',
      color: 'red',
    });
  }

  if ((currentClient.creditCards || 0) > 0 || (currentClient.carLoans || 0) > 0 || (currentClient.studentLoans || 0) > 0 || (currentClient.otherDebts || 0) > 0) {
    timeline.push({
      month: Math.floor(monthsCovered) + 3,
      event: 'Debt Defaults & Collections',
      description: 'Unable to keep up with debt payments, credit destroyed',
      icon: CreditCard,
      severity: 'critical',
      color: 'red',
    });
  }

  // Sort timeline by month
  timeline.sort((a, b) => a.month - b.month);

  const withInsuranceBenefits = [
    {
      icon: Shield,
      title: 'Family Home Protected',
      description: 'Mortgage paid off, family stays in their home',
    },
    {
      icon: GraduationCap,
      title: 'College Fully Funded',
      description: `${formatCurrency(currentClient.dependents * 150000)} secured for education`,
    },
    {
      icon: Briefcase,
      title: 'Retirement Intact',
      description: 'No need to touch retirement accounts, they continue growing',
    },
    {
      icon: TrendingDown,
      title: 'Income Replacement',
      description: `${formatCurrency(currentMetrics.totalIncome * 0.7)}/year for surviving spouse`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stark Reality Section */}
      <div className="card bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-400">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-full bg-red-200">
            <AlertTriangle className="w-6 h-6 text-red-700" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Without Adequate Life Insurance: The Harsh Reality
            </h3>
            <p className="text-sm text-gray-700">
              If tragedy strikes today without {formatCurrency(currentMetrics.lifeInsuranceNeeded)} in coverage, here's exactly what your family would face:
            </p>
          </div>
        </div>

        {/* Critical Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white rounded-lg border-2 border-red-300">
            <p className="text-xs text-gray-600 mb-1">Liquid Assets Last</p>
            <p className="text-3xl font-bold text-red-700">{monthsCovered.toFixed(1)}</p>
            <p className="text-xs text-gray-600">months</p>
          </div>
          <div className="p-4 bg-white rounded-lg border-2 border-orange-300">
            <p className="text-xs text-gray-600 mb-1">After Raiding Retirement (30% penalty)</p>
            <p className="text-3xl font-bold text-orange-700">{monthsWithRetirement.toFixed(1)}</p>
            <p className="text-xs text-gray-600">months total</p>
          </div>
          <div className="p-4 bg-white rounded-lg border-2 border-red-400">
            <p className="text-xs text-gray-600 mb-1">Coverage Shortfall</p>
            <p className="text-3xl font-bold text-red-700">{formatCurrency(gap)}</p>
            <p className="text-xs text-gray-600">gap amount</p>
          </div>
        </div>

        {/* Timeline of Devastation */}
        <div className="space-y-3">
          <h4 className="font-bold text-gray-900 text-lg">Timeline of Financial Devastation</h4>
          {timeline.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`p-4 bg-white rounded-lg border-2 border-${item.color}-300 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-${item.color}-100 flex-shrink-0`}>
                    <Icon className={`w-5 h-5 text-${item.color}-700`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-bold text-gray-900">{item.event}</h5>
                      <span className={`text-sm font-bold text-${item.color}-700`}>
                        Month {item.month}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Emotional Impact */}
        <div className="mt-6 p-4 bg-red-100 border-2 border-red-400 rounded-lg">
          <p className="text-sm text-red-900 font-bold mb-2">The Real Cost:</p>
          <ul className="text-sm text-red-800 space-y-1 ml-4">
            <li>• Your spouse forced to work multiple jobs while grieving</li>
            <li>• Children lose their home, school, friends, and community</li>
            <li>• College dreams replaced with immediate workforce entry</li>
            <li>• Retirement savings destroyed, leaving spouse vulnerable in old age</li>
            <li>• Debt collectors calling during the darkest time of their lives</li>
            <li>• Your legacy: financial ruin instead of security</li>
          </ul>
        </div>
      </div>

      {/* Toggle to Show Comparison */}
      <div className="text-center">
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
        >
          {showComparison ? 'Hide' : 'Show'} What Life Insurance Changes
        </button>
      </div>

      {/* With Insurance Comparison */}
      {showComparison && (
        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-full bg-green-200">
              <Shield className="w-6 h-6 text-green-700" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                With {formatCurrency(currentMetrics.lifeInsuranceNeeded)} in Coverage: Peace of Mind
              </h3>
              <p className="text-sm text-gray-700">
                The same tragedy, but your family's financial future is completely protected:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {withInsuranceBenefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={idx}
                  className="p-4 bg-white rounded-lg border-2 border-green-300"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-green-100">
                      <Icon className="w-5 h-5 text-green-700" />
                    </div>
                    <h4 className="font-bold text-gray-900">{benefit.title}</h4>
                  </div>
                  <p className="text-sm text-gray-700 ml-11">{benefit.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-green-100 border-2 border-green-400 rounded-lg">
            <p className="text-sm text-green-900 font-bold mb-2">Your Legacy Protected:</p>
            <ul className="text-sm text-green-800 space-y-1 ml-4">
              <li>✓ Spouse can grieve without financial panic</li>
              <li>✓ Children stay in their home, school, and community</li>
              <li>✓ College education fully funded</li>
              <li>✓ Retirement accounts continue growing for spouse's future</li>
              <li>✓ No debt stress during family's darkest time</li>
              <li>✓ Your legacy: love, protection, and security</li>
            </ul>
          </div>

          <div className="mt-6 text-center">
            <p className="text-lg font-bold text-gray-900 mb-2">
              Monthly Cost of This Protection:
            </p>
            <p className="text-4xl font-bold text-green-700 mb-2">
              ${Math.round((currentMetrics.lifeInsuranceNeeded / 1000) * 0.15 * 12 / 12)}
              <span className="text-lg text-gray-600">/month</span>
            </p>
            <p className="text-sm text-gray-600">
              Less than a daily coffee to protect your family's entire future
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
