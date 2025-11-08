import { useState, useMemo } from 'react';
import { useClientStore } from '../../store/clientStore';
import { formatCurrency } from '../../utils/calculations';
import {
  TrendingUp,
  RefreshCw,
  Target,
  PieChart,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';

export default function AdvancedAnalytics() {
  const { currentClient, currentMetrics } = useClientStore();
  const [activeTab, setActiveTab] = useState<'roth' | 'asset-location' | 'withdrawal'>('roth');

  // Roth Conversion Settings
  const [rothConversionAmount, setRothConversionAmount] = useState(50000);
  const [rothConversionYears, setRothConversionYears] = useState(5);
  const [currentTaxBracket, setCurrentTaxBracket] = useState(24);
  const [retirementTaxBracket, setRetirementTaxBracket] = useState(22);

  if (!currentClient || !currentMetrics) {
    return null;
  }

  const age = currentClient.age;
  const traditional401k = currentClient.retirement401k;
  const rothIRA = currentClient.retirementIRA;

  // Roth Conversion Ladder Analysis
  const rothConversionAnalysis = useMemo(() => {
    const totalConversion = rothConversionAmount * rothConversionYears;
    const taxPaidNow = totalConversion * (currentTaxBracket / 100);
    const taxSavedLater = totalConversion * (retirementTaxBracket / 100);
    const netBenefit = taxSavedLater - taxPaidNow;

    // Calculate future value with tax-free growth
    const yearsToRetirement = Math.max(65 - age, 0);
    const growthRate = 0.07;
    const futureValue = totalConversion * Math.pow(1 + growthRate, yearsToRetirement);
    const taxOnFutureGrowth = (futureValue - totalConversion) * (retirementTaxBracket / 100);

    return {
      totalConversion,
      taxPaidNow,
      taxSavedLater,
      netBenefit,
      futureValue,
      taxOnFutureGrowth,
      recommendation: netBenefit > 0 ? 'recommended' : 'not-recommended',
    };
  }, [rothConversionAmount, rothConversionYears, currentTaxBracket, retirementTaxBracket, age]);

  // Asset Location Strategy
  const totalInvestments = traditional401k + rothIRA + currentClient.brokerage;
  const assetLocationStrategy = useMemo(() => {
    // Recommended allocation
    const taxableAccount = currentClient.brokerage;
    const taxDeferred = traditional401k;
    const taxFree = rothIRA;

    // Optimal asset location rules
    const recommendations = [
      {
        asset: 'Tax-Efficient Equity Index Funds',
        location: 'Taxable',
        reason: 'Long-term capital gains taxed at lower rates',
        allocation: Math.min(taxableAccount, totalInvestments * 0.3),
      },
      {
        asset: 'Bonds / Fixed Income',
        location: 'Tax-Deferred (401k)',
        reason: 'Interest taxed as ordinary income - shelter in 401k',
        allocation: Math.min(taxDeferred, totalInvestments * 0.3),
      },
      {
        asset: 'High-Growth Stocks / REITs',
        location: 'Roth IRA',
        reason: 'Tax-free growth on highest returns',
        allocation: Math.min(taxFree, totalInvestments * 0.2),
      },
      {
        asset: 'International Stocks',
        location: 'Taxable',
        reason: 'Foreign tax credit available',
        allocation: Math.min(taxableAccount * 0.3, totalInvestments * 0.2),
      },
    ];

    // Calculate potential tax savings
    const currentTaxDrag = taxableAccount * 0.02; // Assume 2% annual tax drag
    const optimizedTaxDrag = taxableAccount * 0.5 * 0.02; // 50% reduction
    const annualSavings = currentTaxDrag - optimizedTaxDrag;
    const savingsOver30Years = annualSavings * 30; // Simplified

    return {
      recommendations,
      annualSavings,
      savingsOver30Years,
    };
  }, [currentClient, totalInvestments]);

  // Retirement Withdrawal Strategy
  const [retirementAge] = useState(65);
  const [expectedLifespan] = useState(95);
  const [annualRetirementNeeds] = useState(currentMetrics.totalMonthlyExpenses * 12);

  const withdrawalStrategy = useMemo(() => {
    const retirementYears = expectedLifespan - retirementAge;
    const totalNeeded = annualRetirementNeeds * retirementYears;

    // Optimal withdrawal sequence
    const sequence = [
      {
        step: 1,
        account: 'Taxable Brokerage',
        reason: 'First - Use taxable accounts to stay in lower tax brackets',
        years: '60-70',
        benefit: 'Qualified dividends and capital gains at 0-15% rate',
      },
      {
        step: 2,
        account: 'Tax-Deferred (401k/IRA)',
        reason: 'Second - Satisfy RMDs starting at age 73',
        years: '70-80',
        benefit: 'Minimize RMDs and stay in target tax bracket',
      },
      {
        step: 3,
        account: 'Roth IRA',
        reason: 'Last - Tax-free withdrawals, no RMDs, can leave to heirs',
        years: '80+',
        benefit: 'Maximum tax-free growth, legacy asset',
      },
    ];

    // Calculate RMDs
    const ageAtRMD = 73;
    const yearsUntilRMD = Math.max(ageAtRMD - age, 0);
    const growthRate = 0.06;
    const futureTraditionalBalance = traditional401k * Math.pow(1 + growthRate, yearsUntilRMD);
    const firstYearRMD = futureTraditionalBalance / 27.4; // IRS life expectancy table

    // Compare strategies
    const standardStrategy = {
      name: 'Proportional Withdrawal',
      totalTax: totalNeeded * 0.18, // Assume average 18% tax
    };

    const optimizedStrategy = {
      name: 'Strategic Sequence',
      totalTax: totalNeeded * 0.12, // Assume average 12% tax with optimization
    };

    const taxSavings = standardStrategy.totalTax - optimizedStrategy.totalTax;

    return {
      sequence,
      firstYearRMD,
      futureTraditionalBalance,
      standardStrategy,
      optimizedStrategy,
      taxSavings,
    };
  }, [age, traditional401k, expectedLifespan, annualRetirementNeeds]);

  const tabs = [
    { id: 'roth', name: 'Roth Conversion Ladder', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'asset-location', name: 'Asset Location', icon: <PieChart className="w-4 h-4" /> },
    { id: 'withdrawal', name: 'Withdrawal Strategy', icon: <Target className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-gradient">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-600 rounded-xl">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Advanced Tax & Retirement Analytics</h2>
            <p className="text-sm text-gray-600">
              Sophisticated strategies to minimize lifetime taxes and maximize wealth
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card">
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Roth Conversion Ladder */}
        {activeTab === 'roth' && (
          <div className="space-y-6">
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-purple-900 mb-1">What is a Roth Conversion Ladder?</h4>
                  <p className="text-sm text-purple-800">
                    Convert traditional 401(k)/IRA funds to Roth IRA over several years, paying taxes now at potentially lower rates
                    to enjoy tax-free growth and withdrawals later. Ideal strategy if you expect to be in a higher tax bracket in retirement.
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Annual Conversion Amount: {formatCurrency(rothConversionAmount)}
                </label>
                <input
                  type="range"
                  min="10000"
                  max="150000"
                  step="5000"
                  value={rothConversionAmount}
                  onChange={(e) => setRothConversionAmount(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Years: {rothConversionYears}
                </label>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={rothConversionYears}
                  onChange={(e) => setRothConversionYears(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Tax Bracket: {currentTaxBracket}%
                </label>
                <select
                  value={currentTaxBracket}
                  onChange={(e) => setCurrentTaxBracket(parseInt(e.target.value))}
                  className="input"
                >
                  <option value="10">10%</option>
                  <option value="12">12%</option>
                  <option value="22">22%</option>
                  <option value="24">24%</option>
                  <option value="32">32%</option>
                  <option value="35">35%</option>
                  <option value="37">37%</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expected Retirement Bracket: {retirementTaxBracket}%
                </label>
                <select
                  value={retirementTaxBracket}
                  onChange={(e) => setRetirementTaxBracket(parseInt(e.target.value))}
                  className="input"
                >
                  <option value="10">10%</option>
                  <option value="12">12%</option>
                  <option value="22">22%</option>
                  <option value="24">24%</option>
                  <option value="32">32%</option>
                </select>
              </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <p className="text-sm text-blue-700 mb-1">Total to Convert</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(rothConversionAnalysis.totalConversion)}</p>
                <p className="text-xs text-blue-600 mt-1">Over {rothConversionYears} years</p>
              </div>
              <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
                <p className="text-sm text-red-700 mb-1">Tax Paid Now</p>
                <p className="text-2xl font-bold text-red-900">{formatCurrency(rothConversionAnalysis.taxPaidNow)}</p>
                <p className="text-xs text-red-600 mt-1">At {currentTaxBracket}% bracket</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                <p className="text-sm text-green-700 mb-1">Tax Saved Later</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(rothConversionAnalysis.taxSavedLater)}</p>
                <p className="text-xs text-green-600 mt-1">At {retirementTaxBracket}% bracket</p>
              </div>
              <div className={`p-4 rounded-xl border-2 ${rothConversionAnalysis.netBenefit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'}`}>
                <p className={`text-sm mb-1 ${rothConversionAnalysis.netBenefit >= 0 ? 'text-emerald-700' : 'text-orange-700'}`}>
                  Net Tax Benefit
                </p>
                <p className={`text-2xl font-bold ${rothConversionAnalysis.netBenefit >= 0 ? 'text-emerald-900' : 'text-orange-900'}`}>
                  {formatCurrency(rothConversionAnalysis.netBenefit)}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                <p className="text-sm text-purple-700 mb-1">Future Value</p>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(rothConversionAnalysis.futureValue)}</p>
                <p className="text-xs text-purple-600 mt-1">Tax-free at retirement</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                <p className="text-sm text-yellow-700 mb-1">Growth Tax Savings</p>
                <p className="text-2xl font-bold text-yellow-900">{formatCurrency(rothConversionAnalysis.taxOnFutureGrowth)}</p>
                <p className="text-xs text-yellow-600 mt-1">Avoided on growth</p>
              </div>
            </div>

            {/* Recommendation */}
            <div className={`p-6 rounded-xl border-2 ${rothConversionAnalysis.netBenefit >= 0 ? 'bg-green-50 border-green-300' : 'bg-orange-50 border-orange-300'}`}>
              <div className="flex items-start gap-3">
                {rothConversionAnalysis.netBenefit >= 0 ? (
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-orange-600 mt-1" />
                )}
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">
                    {rothConversionAnalysis.netBenefit >= 0 ? 'Recommended Strategy' : 'Not Recommended'}
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    {rothConversionAnalysis.netBenefit >= 0
                      ? `Converting ${formatCurrency(rothConversionAmount)} annually for ${rothConversionYears} years could save you ${formatCurrency(rothConversionAnalysis.netBenefit)} in lifetime taxes.`
                      : `At current settings, you'd pay ${formatCurrency(Math.abs(rothConversionAnalysis.netBenefit))} MORE in taxes. Consider converting only if you expect higher tax rates in retirement.`
                    }
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Best done in low-income years (between jobs, semi-retirement)</li>
                    <li>• Stay within current tax bracket to avoid bracket creep</li>
                    <li>• Can recharacterize if market declines after conversion</li>
                    <li>• 5-year rule: Wait 5 years after conversion to withdraw tax-free</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Asset Location Strategy */}
        {activeTab === 'asset-location' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-blue-900 mb-1">What is Asset Location Strategy?</h4>
                  <p className="text-sm text-blue-800">
                    Asset location is about WHICH accounts to hold specific investments in - not what to invest in (asset allocation).
                    By placing tax-inefficient assets in tax-advantaged accounts, you can significantly reduce lifetime tax drag.
                  </p>
                </div>
              </div>
            </div>

            {/* Current Holdings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                <p className="text-sm text-green-700 mb-1">Taxable Account</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(currentClient.brokerage)}</p>
                <p className="text-xs text-green-600 mt-1">{((currentClient.brokerage / totalInvestments) * 100).toFixed(0)}% of total</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <p className="text-sm text-blue-700 mb-1">Tax-Deferred (401k)</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(traditional401k)}</p>
                <p className="text-xs text-blue-600 mt-1">{((traditional401k / totalInvestments) * 100).toFixed(0)}% of total</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                <p className="text-sm text-purple-700 mb-1">Tax-Free (Roth IRA)</p>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(rothIRA)}</p>
                <p className="text-xs text-purple-600 mt-1">{((rothIRA / totalInvestments) * 100).toFixed(0)}% of total</p>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Optimal Asset Location</h3>
              <div className="space-y-3">
                {assetLocationStrategy.recommendations.map((rec, idx) => (
                  <div key={idx} className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{rec.asset}</h4>
                        <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        rec.location.includes('Taxable') ? 'bg-green-100 text-green-700' :
                        rec.location.includes('401k') ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {rec.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(rec.allocation / totalInvestments) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {formatCurrency(rec.allocation)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax Savings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-300">
                <h4 className="font-bold text-gray-900 mb-2">Annual Tax Savings</h4>
                <p className="text-3xl font-bold text-orange-600">{formatCurrency(assetLocationStrategy.annualSavings)}</p>
                <p className="text-sm text-gray-600 mt-2">Per year from optimal asset location</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-300">
                <h4 className="font-bold text-gray-900 mb-2">30-Year Savings</h4>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(assetLocationStrategy.savingsOver30Years)}</p>
                <p className="text-sm text-gray-600 mt-2">Cumulative savings over 30 years</p>
              </div>
            </div>

            {/* Implementation Guide */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Implementation Guide
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span><strong>Taxable Accounts:</strong> Hold tax-efficient investments like total market index funds, municipal bonds (if high bracket), and long-term buy-and-hold stocks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span><strong>Tax-Deferred (401k/IRA):</strong> Hold bonds, REITs, actively managed funds, and high-dividend stocks that generate ordinary income</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span><strong>Roth IRA:</strong> Hold your highest expected return assets - small-cap, emerging markets, growth stocks - to maximize tax-free growth</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                  <span><strong>Rebalancing:</strong> Rebalance within tax-advantaged accounts to avoid capital gains in taxable accounts</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Withdrawal Strategy */}
        {activeTab === 'withdrawal' && (
          <div className="space-y-6">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-green-900 mb-1">Why Withdrawal Order Matters</h4>
                  <p className="text-sm text-green-800">
                    The order you withdraw from different account types in retirement can save tens of thousands in taxes.
                    Strategic withdrawals can keep you in lower tax brackets and maximize the value of Roth accounts.
                  </p>
                </div>
              </div>
            </div>

            {/* Optimal Sequence */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recommended Withdrawal Sequence</h3>
              <div className="space-y-4">
                {withdrawalStrategy.sequence.map((step) => (
                  <div key={step.step} className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-green-300 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-bold text-gray-900">{step.account}</h4>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                            Ages {step.years}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{step.reason}</p>
                        <p className="text-sm text-green-700 font-semibold flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          {step.benefit}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RMD Analysis */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Required Minimum Distributions (RMDs)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">RMD Age</p>
                  <p className="text-xl font-bold text-gray-900">73</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Projected 401(k) at RMD Age</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(withdrawalStrategy.futureTraditionalBalance)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">First Year RMD</p>
                  <p className="text-xl font-bold text-orange-600">{formatCurrency(withdrawalStrategy.firstYearRMD)}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                RMDs force withdrawals from tax-deferred accounts starting at age 73. Large RMDs can push you into higher tax brackets
                and increase Medicare premiums. Consider Roth conversions before age 73 to reduce future RMDs.
              </p>
            </div>

            {/* Strategy Comparison */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Strategy Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-gray-50 border-2 border-gray-200 rounded-xl">
                  <h4 className="font-bold text-gray-900 mb-2">Standard Approach</h4>
                  <p className="text-sm text-gray-600 mb-3">{withdrawalStrategy.standardStrategy.name}</p>
                  <p className="text-2xl font-bold text-gray-700">{formatCurrency(withdrawalStrategy.standardStrategy.totalTax)}</p>
                  <p className="text-xs text-gray-500 mt-1">Lifetime taxes paid</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
                  <h4 className="font-bold text-gray-900 mb-2">Optimized Strategy</h4>
                  <p className="text-sm text-gray-600 mb-3">{withdrawalStrategy.optimizedStrategy.name}</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(withdrawalStrategy.optimizedStrategy.totalTax)}</p>
                  <p className="text-xs text-gray-600 mt-1">Lifetime taxes paid</p>
                  <div className="mt-4 pt-4 border-t-2 border-green-200">
                    <p className="text-sm font-semibold text-green-700">Tax Savings</p>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(withdrawalStrategy.taxSavings)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h4 className="font-bold text-gray-900 mb-3">💡 Pro Tips for Tax-Efficient Withdrawals</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Use taxable accounts first to take advantage of low/zero capital gains rates</li>
                <li>• Manage taxable income to stay below Medicare IRMAA thresholds ($103K single, $206K married)</li>
                <li>• Harvest capital losses in taxable accounts to offset gains</li>
                <li>• Consider QCDs (Qualified Charitable Distributions) from IRA at age 70½</li>
                <li>• Delay Social Security to age 70 for maximum benefit while drawing from investments</li>
                <li>• Leave Roth IRA untouched as long as possible - it's the best legacy asset</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
