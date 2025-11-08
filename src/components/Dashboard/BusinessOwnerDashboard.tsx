import { useState } from 'react';
import { useClientStore } from '../../store/clientStore';
import { formatCurrency } from '../../utils/calculations';
import {
  Briefcase,
  Building2,
  Scale,
  Award,
  Calculator,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function BusinessOwnerDashboard() {
  const { currentClient, currentMetrics } = useClientStore();
  const [businessIncome, setBusinessIncome] = useState(200000);
  const [businessExpenses, setBusinessExpenses] = useState(50000);
  const [employeeCount, setEmployeeCount] = useState(0);

  if (!currentClient || !currentMetrics) {
    return null;
  }

  const netBusinessIncome = businessIncome - businessExpenses;

  // Calculate optimal S-Corp salary (reasonable compensation)
  const optimalSalary = calculateOptimalSalary(businessIncome, employeeCount);
  const sCorp = analyzeScorp(businessIncome, optimalSalary);

  // Retirement plan comparison
  const retirementPlans = compareRetirementPlans(businessIncome, employeeCount);

  // QBI Deduction
  const qbiDeduction = calculateQBI(netBusinessIncome, currentClient.income);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-gradient">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-600 rounded-xl">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Business Owner Dashboard</h2>
            <p className="text-sm text-gray-600">
              Optimize your business structure and maximize tax savings
            </p>
          </div>
        </div>

        {/* Business Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Annual Business Revenue
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-500 font-semibold">$</span>
              <input
                type="number"
                value={businessIncome}
                onChange={(e) => setBusinessIncome(parseInt(e.target.value))}
                className="input pl-8"
                step="10000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Annual Business Expenses
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-500 font-semibold">$</span>
              <input
                type="number"
                value={businessExpenses}
                onChange={(e) => setBusinessExpenses(parseInt(e.target.value))}
                className="input pl-8"
                step="5000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Number of Employees
            </label>
            <input
              type="number"
              value={employeeCount}
              onChange={(e) => setEmployeeCount(parseInt(e.target.value))}
              className="input"
              min="0"
            />
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-xl">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-blue-700">Net Business Income</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(netBusinessIncome)}</p>
            </div>
            <div>
              <p className="text-sm text-green-700">QBI Deduction (20%)</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(qbiDeduction.deduction)}</p>
            </div>
            <div>
              <p className="text-sm text-purple-700">Tax Savings</p>
              <p className="text-2xl font-bold text-purple-900">{formatCurrency(qbiDeduction.taxSavings)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* S-Corp Optimization */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">S-Corporation Optimization</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Structure (Sole Prop/LLC) */}
          <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
            <h4 className="font-bold text-gray-900 mb-4">Sole Proprietor / LLC</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Net Business Income:</span>
                <span className="font-bold text-gray-900">{formatCurrency(netBusinessIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Self-Employment Tax (15.3%):</span>
                <span className="font-bold text-red-600">{formatCurrency(netBusinessIncome * 0.9235 * 0.153)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Income Tax (est. 24%):</span>
                <span className="font-bold text-red-600">{formatCurrency(netBusinessIncome * 0.24)}</span>
              </div>
              <div className="border-t-2 border-gray-300 pt-3 flex justify-between">
                <span className="font-bold text-gray-900">Total Tax:</span>
                <span className="font-bold text-red-600 text-lg">
                  {formatCurrency(netBusinessIncome * 0.9235 * 0.153 + netBusinessIncome * 0.24)}
                </span>
              </div>
            </div>
          </div>

          {/* S-Corp Structure */}
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-green-900">S-Corporation</h4>
              <span className="text-xs bg-green-600 text-white px-3 py-1 rounded-full font-bold">
                RECOMMENDED
              </span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Reasonable Salary:</span>
                <span className="font-bold text-green-900">{formatCurrency(sCorp.salary)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Distributions:</span>
                <span className="font-bold text-green-900">{formatCurrency(sCorp.distributions)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Payroll Tax on Salary:</span>
                <span className="font-bold text-orange-600">{formatCurrency(sCorp.payrollTax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Income Tax (est. 24%):</span>
                <span className="font-bold text-orange-600">{formatCurrency(netBusinessIncome * 0.24)}</span>
              </div>
              <div className="border-t-2 border-green-300 pt-3 flex justify-between">
                <span className="font-bold text-green-900">Total Tax:</span>
                <span className="font-bold text-orange-600 text-lg">
                  {formatCurrency(sCorp.totalTax)}
                </span>
              </div>
              <div className="mt-4 pt-3 border-t-2 border-green-300">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-green-900">Annual Savings:</span>
                  <span className="font-bold text-green-600 text-xl">
                    {formatCurrency(sCorp.savings)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-green-900 mb-1">S-Corp Tax Savings Strategy</h4>
              <p className="text-sm text-green-800">
                By paying yourself a reasonable salary of {formatCurrency(sCorp.salary)} and taking{' '}
                {formatCurrency(sCorp.distributions)} as distributions, you save {formatCurrency(sCorp.savings)} per year
                in self-employment taxes. The distributions avoid the 15.3% FICA tax!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Retirement Plan Comparison */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-900">Retirement Plan Comparison</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {retirementPlans.map((plan, idx) => (
            <RetirementPlanCard key={idx} plan={plan} isRecommended={idx === 1} />
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <h4 className="font-bold text-blue-900 mb-2">💡 Solo 401(k) Advantages</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Highest contribution limits ($69,000 in 2024)</li>
              <li>• Roth option available</li>
              <li>• Loan provision (up to $50,000)</li>
              <li>• No filing required under $250k assets</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
            <h4 className="font-bold text-purple-900 mb-2">⚠️ Important Considerations</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Must have W-2 income for Solo 401(k)</li>
              <li>• SEP IRA is simpler to administer</li>
              <li>• Defined Benefit if 50+ and high income</li>
              <li>• Consult CPA before implementing</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Entity Structure Comparison */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Scale className="w-6 h-6 text-orange-600" />
          <h3 className="text-xl font-bold text-gray-900">Business Entity Comparison</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Feature</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Sole Prop</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">LLC</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">S-Corp</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">C-Corp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <EntityRow
                feature="Liability Protection"
                values={['❌ No', '✅ Yes', '✅ Yes', '✅ Yes']}
              />
              <EntityRow
                feature="Self-Employment Tax"
                values={['15.3%', '15.3%', 'Salary only', 'N/A']}
              />
              <EntityRow
                feature="Setup Cost"
                values={['$0', '$100-500', '$500-2000', '$1000-3000']}
              />
              <EntityRow
                feature="Annual Compliance"
                values={['Easy', 'Easy', 'Moderate', 'Complex']}
              />
              <EntityRow
                feature="Tax Filing"
                values={['Schedule C', 'Schedule C', '1120-S', '1120']}
              />
              <EntityRow
                feature="Best For"
                values={['< $50k', '$50k-100k', '$100k+', 'VC-backed']}
              />
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-yellow-900 mb-1">Recommendation Based on Your Income</h4>
              <p className="text-sm text-yellow-800">
                {netBusinessIncome < 50000 && "Stay as Sole Proprietor or LLC. S-Corp overhead not justified yet."}
                {netBusinessIncome >= 50000 && netBusinessIncome < 100000 && "Consider LLC for liability protection. S-Corp if you have consistent income."}
                {netBusinessIncome >= 100000 && "S-Corp is highly recommended. Potential savings: " + formatCurrency(sCorp.savings) + "/year."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Business Deductions Checklist */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-bold text-gray-900">Common Business Deductions Checklist</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DeductionCard
            title="Home Office Deduction"
            description="Exclusive business use of home"
            amount="$5-10/sq ft or simplified $5/sq ft (max 300 sq ft)"
          />
          <DeductionCard
            title="Vehicle Expenses"
            description="Business mileage or actual expenses"
            amount="$0.67/mile (2024) or actual"
          />
          <DeductionCard
            title="Health Insurance"
            description="Self-employed health insurance deduction"
            amount="100% of premiums"
          />
          <DeductionCard
            title="Retirement Contributions"
            description="SEP IRA, Solo 401(k), etc."
            amount="Up to $69,000 (2024)"
          />
          <DeductionCard
            title="Business Meals"
            description="50% deductible (100% if from restaurant 2021-2022)"
            amount="50% of qualified meals"
          />
          <DeductionCard
            title="Professional Development"
            description="Courses, certifications, conferences"
            amount="Fully deductible"
          />
        </div>
      </div>
    </div>
  );
}

function RetirementPlanCard({ plan, isRecommended }: any) {
  return (
    <div className={`p-6 rounded-xl border-2 ${
      isRecommended
        ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-gray-900">{plan.name}</h4>
        {isRecommended && (
          <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full font-bold">
            BEST
          </span>
        )}
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <p className="text-gray-600">Max Contribution</p>
          <p className="font-bold text-gray-900 text-lg">{formatCurrency(plan.maxContribution)}</p>
        </div>
        <div>
          <p className="text-gray-600">Tax Savings (24%)</p>
          <p className="font-bold text-green-600">{formatCurrency(plan.maxContribution * 0.24)}</p>
        </div>
        <div>
          <p className="text-gray-600">Setup Complexity</p>
          <p className="font-semibold text-gray-700">{plan.complexity}</p>
        </div>
      </div>
    </div>
  );
}

function EntityRow({ feature, values }: { feature: string; values: string[] }) {
  return (
    <tr>
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{feature}</td>
      {values.map((value, idx) => (
        <td key={idx} className="px-4 py-3 text-sm text-center text-gray-700">{value}</td>
      ))}
    </tr>
  );
}

function DeductionCard({ title, description, amount }: any) {
  return (
    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
      <h4 className="font-bold text-green-900 mb-1">{title}</h4>
      <p className="text-sm text-green-700 mb-2">{description}</p>
      <p className="text-xs font-semibold text-green-600">{amount}</p>
    </div>
  );
}

// Helper functions
function calculateOptimalSalary(businessIncome: number, employeeCount: number): number {
  // IRS reasonable compensation guidelines
  // Typically 30-50% of net business income for service businesses
  if (employeeCount > 0) {
    // If you have employees, use industry average
    return Math.min(businessIncome * 0.5, 150000);
  }
  // Solo business owner
  const minSalary = Math.min(businessIncome * 0.3, 60000);
  const maxSalary = Math.min(businessIncome * 0.5, 160000);
  return Math.min(Math.max(minSalary, 60000), maxSalary);
}

function analyzeScorp(businessIncome: number, salary: number) {
  const distributions = businessIncome - salary;
  const payrollTax = salary * 0.153; // 15.3% FICA
  const soleProprietorTax = businessIncome * 0.9235 * 0.153;
  const totalTax = payrollTax + (businessIncome * 0.24); // Simplified
  const savings = soleProprietorTax - payrollTax;

  return {
    salary,
    distributions,
    payrollTax,
    totalTax,
    savings: Math.max(0, savings),
  };
}

function compareRetirementPlans(businessIncome: number, _employeeCount: number) {
  return [
    {
      name: 'SEP IRA',
      maxContribution: Math.min(businessIncome * 0.25, 69000),
      complexity: 'Very Easy',
    },
    {
      name: 'Solo 401(k)',
      maxContribution: Math.min(23000 + businessIncome * 0.25, 69000),
      complexity: 'Easy',
    },
    {
      name: 'Defined Benefit',
      maxContribution: Math.min(businessIncome * 0.5, 275000),
      complexity: 'Complex',
    },
  ];
}

function calculateQBI(netIncome: number, totalIncome: number) {
  // Simplified QBI calculation
  const qbiDeduction = Math.min(netIncome * 0.2, totalIncome * 0.2);
  const taxSavings = qbiDeduction * 0.24; // Assume 24% bracket
  return {
    deduction: qbiDeduction,
    taxSavings,
  };
}
