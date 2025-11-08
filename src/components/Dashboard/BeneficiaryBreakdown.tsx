import { useClientStore } from '../../store/clientStore';
import { formatCurrency } from '../../utils/calculations';
import { Users, GraduationCap, Home, Heart, DollarSign, PieChart } from 'lucide-react';

export default function BeneficiaryBreakdown() {
  const { currentClient, currentMetrics } = useClientStore();

  if (!currentClient || !currentMetrics) return null;

  const lifeInsuranceNeeded = currentMetrics.lifeInsuranceNeeded;
  const currentCoverage = currentClient.lifeInsuranceCoverage;
  const gap = currentMetrics.lifeInsuranceGap;

  // Calculate beneficiary allocations
  const spouseAge = currentClient.spouseAge || currentClient.age;
  const yearsOfSupport = Math.max(0, 65 - spouseAge); // Support until spouse reaches 65
  const spouseAnnualNeed = currentMetrics.totalIncome * 0.7; // 70% income replacement
  const spouseIncomeNeeds = spouseAnnualNeed * yearsOfSupport;

  const dependents = currentClient.dependents || 0;
  const collegePerChild = 150000; // Average 4-year college cost
  const collegeFunds = dependents * collegePerChild;

  const mortgagePayoff = currentClient.mortgage;

  const finalExpenses = 50000; // Funeral, medical bills, estate costs

  const emergencyBuffer = currentMetrics.totalMonthlyExpenses * 12; // 1 year buffer

  const totalNeeded = spouseIncomeNeeds + collegeFunds + mortgagePayoff + finalExpenses + emergencyBuffer;

  const allocations = [
    {
      icon: Users,
      label: 'Spouse Income Replacement',
      description: `${formatCurrency(spouseAnnualNeed)}/year for ${yearsOfSupport} years`,
      amount: spouseIncomeNeeds,
      color: 'blue',
      percentage: (spouseIncomeNeeds / totalNeeded) * 100,
    },
    {
      icon: GraduationCap,
      label: "Children's College Fund",
      description: `${formatCurrency(collegePerChild)} × ${dependents} ${dependents === 1 ? 'child' : 'children'}`,
      amount: collegeFunds,
      color: 'purple',
      percentage: (collegeFunds / totalNeeded) * 100,
      show: dependents > 0,
    },
    {
      icon: Home,
      label: 'Mortgage Payoff',
      description: 'Keep the family home',
      amount: mortgagePayoff,
      color: 'green',
      percentage: (mortgagePayoff / totalNeeded) * 100,
      show: mortgagePayoff > 0,
    },
    {
      icon: Heart,
      label: 'Final Expenses',
      description: 'Funeral, medical bills, estate costs',
      amount: finalExpenses,
      color: 'red',
      percentage: (finalExpenses / totalNeeded) * 100,
    },
    {
      icon: DollarSign,
      label: 'Emergency Buffer',
      description: '12 months living expenses',
      amount: emergencyBuffer,
      color: 'orange',
      percentage: (emergencyBuffer / totalNeeded) * 100,
    },
  ].filter(item => item.show !== false);

  return (
    <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 rounded-full bg-blue-200">
          <PieChart className="w-6 h-6 text-blue-700" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            How Your Insurance Would Protect Your Family
          </h3>
          <p className="text-sm text-gray-700">
            Here's exactly how {formatCurrency(lifeInsuranceNeeded)} in coverage would be allocated to protect your loved ones:
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {allocations.map((allocation, idx) => {
          const Icon = allocation.icon;
          return (
            <div
              key={idx}
              className={`p-4 bg-white rounded-lg border-2 border-${allocation.color}-200 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${allocation.color}-100`}>
                    <Icon className={`w-5 h-5 text-${allocation.color}-700`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{allocation.label}</h4>
                    <p className="text-xs text-gray-600">{allocation.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(allocation.amount)}</p>
                  <p className="text-xs text-gray-600">{allocation.percentage.toFixed(0)}%</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 bg-${allocation.color}-600 rounded-full transition-all`}
                  style={{ width: `${allocation.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border-2 border-blue-300">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Total Protection Needed</p>
          <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalNeeded)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Current Coverage</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentCoverage)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Coverage Gap</p>
          <p className={`text-2xl font-bold ${gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {gap > 0 ? formatCurrency(gap) : '✓ Covered'}
          </p>
        </div>
      </div>

      {gap > 0 && (
        <div className="mt-4 p-3 bg-red-50 border-2 border-red-300 rounded-lg">
          <p className="text-sm text-red-900">
            <strong>⚠️ Critical:</strong> Without the full {formatCurrency(lifeInsuranceNeeded)} in coverage, your family would need to:
          </p>
          <ul className="mt-2 text-sm text-red-800 space-y-1 ml-4">
            <li>• Reduce their standard of living by {((gap / totalNeeded) * 100).toFixed(0)}%</li>
            {mortgagePayoff > 0 && gap >= mortgagePayoff && <li>• Sell the house or face foreclosure</li>}
            {collegeFunds > 0 && gap >= collegeFunds && <li>• Give up on college plans for the kids</li>}
            <li>• Potentially liquidate retirement accounts with penalties</li>
          </ul>
        </div>
      )}
    </div>
  );
}
