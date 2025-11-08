import { useState } from 'react';
import { useClientStore } from '../../store/clientStore';
import { formatCurrency } from '../../utils/calculations';
import { Receipt, TrendingDown, PiggyBank, Calculator, AlertCircle } from 'lucide-react';

export default function TaxOptimization() {
  const { currentClient, currentMetrics } = useClientStore();
  const [contributionSplit, setContributionSplit] = useState(50); // % to Roth

  if (!currentClient || !currentMetrics) {
    return null;
  }

  const taxBracket = getTaxBracket(currentClient.income);
  const currentAge = currentClient.age;
  const yearsToRetirement = 67 - currentAge;

  // Calculate Roth vs Traditional
  const annualContribution = 20000; // Assume max 401k contribution
  const rothPortion = annualContribution * (contributionSplit / 100);
  const traditionalPortion = annualContribution - rothPortion;

  const rothAnalysis = analyzeRoth(rothPortion, taxBracket.rate, yearsToRetirement);
  const traditionalAnalysis = analyzeTraditional(traditionalPortion, taxBracket.rate, yearsToRetirement);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-gradient">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-600 rounded-xl">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tax Optimization Strategies</h2>
            <p className="text-sm text-gray-600">
              Current tax bracket: {taxBracket.name} ({taxBracket.rate}%)
            </p>
          </div>
        </div>
      </div>

      {/* Roth vs Traditional Calculator */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-6">
          Roth vs Traditional 401(k) Analysis
        </h3>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Contribution Split (${formatCurrency(annualContribution)}/year)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={contributionSplit}
            onChange={(e) => setContributionSplit(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>100% Traditional</span>
            <span className="font-bold text-purple-600">
              {contributionSplit}% Roth / {100 - contributionSplit}% Traditional
            </span>
            <span>100% Roth</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Roth Side */}
          <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
            <h4 className="font-bold text-purple-900 text-lg mb-4 flex items-center gap-2">
              <PiggyBank className="w-5 h-5" />
              Roth 401(k)
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-700">Annual Contribution:</span>
                <span className="font-bold text-purple-900">{formatCurrency(rothPortion)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Tax Paid Today:</span>
                <span className="font-bold text-red-600">
                  {formatCurrency(rothPortion * (taxBracket.rate / 100))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Future Value @ 7%:</span>
                <span className="font-bold text-green-600">{formatCurrency(rothAnalysis.futureValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Tax in Retirement:</span>
                <span className="font-bold text-green-600">$0</span>
              </div>
              <div className="border-t-2 border-purple-300 pt-2 flex justify-between">
                <span className="text-purple-700 font-bold">Net After-Tax:</span>
                <span className="font-bold text-purple-900 text-lg">{formatCurrency(rothAnalysis.netValue)}</span>
              </div>
            </div>
          </div>

          {/* Traditional Side */}
          <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
            <h4 className="font-bold text-blue-900 text-lg mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Traditional 401(k)
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Annual Contribution:</span>
                <span className="font-bold text-blue-900">{formatCurrency(traditionalPortion)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Tax Saved Today:</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(traditionalPortion * (taxBracket.rate / 100))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Future Value @ 7%:</span>
                <span className="font-bold text-green-600">{formatCurrency(traditionalAnalysis.futureValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Tax in Retirement (22%):</span>
                <span className="font-bold text-red-600">
                  {formatCurrency(traditionalAnalysis.futureValue * 0.22)}
                </span>
              </div>
              <div className="border-t-2 border-blue-300 pt-2 flex justify-between">
                <span className="text-blue-700 font-bold">Net After-Tax:</span>
                <span className="font-bold text-blue-900 text-lg">{formatCurrency(traditionalAnalysis.netValue)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
          <p className="text-sm text-emerald-900">
            <strong>💡 Recommendation:</strong>{' '}
            {rothAnalysis.netValue > traditionalAnalysis.netValue
              ? 'Roth contributions will save you more in the long run if you expect higher tax rates in retirement.'
              : 'Traditional contributions give you immediate tax savings and may be better if you expect lower retirement taxes.'}
          </p>
        </div>
      </div>

      {/* Tax Optimization Strategies */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Tax Reduction Strategies
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TaxStrategyCard
            title="Max Out 401(k)"
            description={`Contribute $23,000 (2024 limit) to save ${formatCurrency(23000 * (taxBracket.rate / 100))} in taxes`}
            savings={23000 * (taxBracket.rate / 100)}
            priority="high"
          />
          <TaxStrategyCard
            title="HSA Triple Tax Advantage"
            description="Contribute $4,150 (individual) tax-free, grows tax-free, withdrawals tax-free for medical"
            savings={4150 * (taxBracket.rate / 100)}
            priority="high"
          />
          <TaxStrategyCard
            title="Roth IRA Conversion Ladder"
            description="Convert Traditional IRA to Roth in low-income years to minimize taxes"
            savings={0}
            priority="medium"
          />
          <TaxStrategyCard
            title="Tax-Loss Harvesting"
            description="Sell losing investments to offset capital gains, saving up to 20% on gains"
            savings={currentClient.brokerage * 0.05 * 0.2} // Assume 5% gains, 20% tax
            priority="medium"
          />
          <TaxStrategyCard
            title="Donor-Advised Fund"
            description="Bundle charitable donations for larger deduction in high-income years"
            savings={5000 * (taxBracket.rate / 100)}
            priority="low"
          />
          <TaxStrategyCard
            title="529 Plan Contributions"
            description="State tax deduction for education savings (varies by state)"
            savings={2000 * 0.05} // Estimate 5% state tax
            priority="low"
          />
        </div>
      </div>

      {/* Tax Bracket Planning */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Tax Bracket Optimization
        </h3>
        <div className="space-y-4">
          {currentClient.income > 95375 && currentClient.income < 182100 && (
            <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-yellow-900 mb-1">Bracket Management Opportunity</h4>
                  <p className="text-sm text-yellow-800">
                    You're ${formatCurrency(182100 - currentClient.income)} from the next tax bracket (32%).
                    Consider maxing retirement contributions to stay in the 24% bracket.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-blue-900 mb-3">Your Tax Situation</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-blue-700">Current Bracket</p>
                <p className="font-bold text-blue-900">{taxBracket.rate}%</p>
              </div>
              <div>
                <p className="text-blue-700">Est. Tax Owed</p>
                <p className="font-bold text-red-600">
                  {formatCurrency(calculateEstimatedTax(currentClient.income, taxBracket.rate))}
                </p>
              </div>
              <div>
                <p className="text-blue-700">Effective Rate</p>
                <p className="font-bold text-blue-900">
                  {((calculateEstimatedTax(currentClient.income, taxBracket.rate) / currentClient.income) * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-blue-700">Max Savings Potential</p>
                <p className="font-bold text-green-600">
                  {formatCurrency(23000 * (taxBracket.rate / 100) + 4150 * (taxBracket.rate / 100))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TaxStrategyCardProps {
  title: string;
  description: string;
  savings: number;
  priority: 'high' | 'medium' | 'low';
}

function TaxStrategyCard({ title, description, savings, priority }: TaxStrategyCardProps) {
  const colors: Record<'high' | 'medium' | 'low', string> = {
    high: 'bg-green-50 border-green-200',
    medium: 'bg-blue-50 border-blue-200',
    low: 'bg-gray-50 border-gray-200',
  };

  const badges: Record<'high' | 'medium' | 'low', string> = {
    high: 'bg-green-600 text-white',
    medium: 'bg-blue-600 text-white',
    low: 'bg-gray-600 text-white',
  };

  return (
    <div className={`border-2 rounded-xl p-4 ${colors[priority]}`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-bold text-gray-900">{title}</h4>
        <span className={`text-xs px-2 py-1 rounded ${badges[priority]}`}>
          {priority.toUpperCase()}
        </span>
      </div>
      <p className="text-sm text-gray-700 mb-3">{description}</p>
      {savings > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <TrendingDown className="w-4 h-4 text-green-600" />
          <span className="font-bold text-green-700">Save {formatCurrency(savings)}/year</span>
        </div>
      )}
    </div>
  );
}

function getTaxBracket(income: number) {
  if (income <= 11600) return { name: '10%', rate: 10 };
  if (income <= 47150) return { name: '12%', rate: 12 };
  if (income <= 100525) return { name: '22%', rate: 22 };
  if (income <= 191950) return { name: '24%', rate: 24 };
  if (income <= 243725) return { name: '32%', rate: 32 };
  if (income <= 609350) return { name: '35%', rate: 35 };
  return { name: '37%', rate: 37 };
}

function analyzeRoth(contribution: number, _currentTaxRate: number, years: number) {
  const futureValue = contribution * ((Math.pow(1.07, years) - 1) / 0.07);
  const netValue = futureValue; // No tax on withdrawal
  return { futureValue, netValue };
}

function analyzeTraditional(contribution: number, _currentTaxRate: number, years: number) {
  const futureValue = contribution * ((Math.pow(1.07, years) - 1) / 0.07);
  const retirementTaxRate = 0.22; // Assume 22% in retirement
  const netValue = futureValue * (1 - retirementTaxRate);
  return { futureValue, netValue };
}

function calculateEstimatedTax(income: number, marginalRate: number): number {
  // Simplified calculation
  return income * (marginalRate / 100) * 0.85; // Rough estimate accounting for standard deduction
}
