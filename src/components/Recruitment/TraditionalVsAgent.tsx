import { Briefcase, TrendingUp, Lock, Unlock, Clock, Calendar, DollarSign, Target, Download } from 'lucide-react';
import { IncomeDisclaimer } from '../shared/ComplianceDisclaimer';
import { generateComparisonPDF } from '../../utils/pdf-export';

export default function TraditionalVsAgent() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Sample 5-year comparison data
  const traditionalJobIncome = [60000, 62400, 64896, 67491, 70151]; // 4% annual raise
  const agentIncome = [72000, 98000, 135000, 182000, 245000]; // With growing renewal book

  const comparisons = [
    {
      category: 'Income Potential',
      traditional: {
        icon: Lock,
        title: 'Capped by Salary',
        description: 'Fixed salary with modest annual raises (3-5%)',
        value: formatCurrency(traditionalJobIncome[0]),
        color: 'gray',
        pros: [],
        cons: [
          'Income ceiling determined by employer',
          'Raises require approval',
          'Limited bonus potential',
          'No equity or ownership',
        ],
      },
      agent: {
        icon: Unlock,
        title: 'Unlimited Earning Potential',
        description: 'Directly tied to your performance and effort',
        value: formatCurrency(agentIncome[0]) + '+',
        color: 'green',
        pros: [
          'No income ceiling',
          'You control your earnings',
          'Multiple income streams',
          'Residual income builds wealth',
        ],
        cons: [],
      },
    },
    {
      category: 'Time Freedom',
      traditional: {
        icon: Clock,
        title: 'Fixed Schedule',
        description: '9-5 office hours, limited flexibility',
        value: '40-50 hrs/week',
        color: 'gray',
        pros: ['Predictable schedule'],
        cons: [
          'Must be in office 9-5',
          'Limited PTO (10-15 days)',
          'Vacation requires approval',
          'Commute time wasted',
        ],
      },
      agent: {
        icon: Calendar,
        title: 'Own Your Schedule',
        description: 'Work when and where you want',
        value: 'Your Choice',
        color: 'green',
        pros: [
          'Work from anywhere',
          'Set your own hours',
          'Unlimited time off',
          'No commute',
        ],
        cons: ['Self-discipline required'],
      },
    },
    {
      category: 'Income Growth',
      traditional: {
        icon: TrendingUp,
        title: 'Slow & Linear',
        description: 'Gradual increases over decades',
        value: formatCurrency(traditionalJobIncome[4]) + ' (Year 5)',
        color: 'gray',
        pros: ['Predictable'],
        cons: [
          'Takes years for meaningful raises',
          'Limited to company budget',
          'Promotions are competitive',
          'Income stops when you stop working',
        ],
      },
      agent: {
        icon: Target,
        title: 'Exponential & Compounding',
        description: 'Renewal book creates passive income',
        value: formatCurrency(agentIncome[4]) + ' (Year 5)',
        color: 'green',
        pros: [
          'Income compounds annually',
          'Renewal book = passive income',
          'Fast advancement possible',
          'Build sellable asset',
        ],
        cons: [],
      },
    },
    {
      category: 'Job Security',
      traditional: {
        icon: Briefcase,
        title: "At Employer's Mercy",
        description: 'Can be laid off, downsized, or replaced',
        value: 'Dependent',
        color: 'gray',
        pros: [],
        cons: [
          'Layoffs, downsizing, mergers',
          'Can be fired anytime',
          'Age discrimination',
          'Start over if let go',
        ],
      },
      agent: {
        icon: DollarSign,
        title: 'You Own Your Business',
        description: 'Build asset you control and can sell',
        value: 'Independent',
        color: 'green',
        pros: [
          'Own your client relationships',
          'Build valuable renewal book',
          'Can sell your book for 2-3x value',
          'True independence',
        ],
        cons: [],
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Traditional Job vs Financial Advisor Career
        </h2>
        <p className="text-gray-700">
          See the real differences between a traditional W-2 job and building your own financial services business
        </p>
      </div>

      {/* Side-by-Side Comparisons */}
      {comparisons.map((comparison, idx) => (
        <div key={idx} className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            {comparison.category}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional Job */}
            <div className="p-6 bg-gray-50 border-2 border-gray-300 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gray-200">
                  <comparison.traditional.icon className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{comparison.traditional.title}</h4>
                  <p className="text-xs text-gray-600">{comparison.traditional.description}</p>
                </div>
              </div>

              <div className="mb-4 p-3 bg-white rounded-lg border border-gray-300">
                <p className="text-2xl font-bold text-gray-900 text-center">
                  {comparison.traditional.value}
                </p>
              </div>

              {comparison.traditional.pros.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-bold text-green-700 mb-2">Pros:</p>
                  <ul className="space-y-1">
                    {comparison.traditional.pros.map((pro, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {comparison.traditional.cons.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-red-700 mb-2">Cons:</p>
                  <ul className="space-y-1">
                    {comparison.traditional.cons.map((con, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-red-600">✗</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Agent Career */}
            <div className="p-6 bg-green-50 border-2 border-green-300 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-green-200">
                  <comparison.agent.icon className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{comparison.agent.title}</h4>
                  <p className="text-xs text-gray-600">{comparison.agent.description}</p>
                </div>
              </div>

              <div className="mb-4 p-3 bg-white rounded-lg border-2 border-green-400">
                <p className="text-2xl font-bold text-green-700 text-center">
                  {comparison.agent.value}
                </p>
              </div>

              {comparison.agent.pros.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-bold text-green-700 mb-2">Advantages:</p>
                  <ul className="space-y-1">
                    {comparison.agent.pros.map((pro, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {comparison.agent.cons.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-orange-700 mb-2">Considerations:</p>
                  <ul className="space-y-1">
                    {comparison.agent.cons.map((con, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-orange-600">•</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* 5-Year Income Comparison Chart */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          5-Year Income Comparison
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Traditional job with 4% annual raises vs Agent with consistent production
        </p>

        <div className="space-y-4">
          {traditionalJobIncome.map((tradIncome, year) => {
            const agentInc = agentIncome[year];
            const difference = agentInc - tradIncome;
            const maxIncome = Math.max(...agentIncome);

            return (
              <div key={year} className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span>Year {year + 1}</span>
                  <span className="text-green-700">
                    +{formatCurrency(difference)} advantage
                  </span>
                </div>

                {/* Traditional Job Bar */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-20">Traditional</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                    <div
                      className="bg-gray-500 h-8 rounded-full flex items-center justify-end pr-3"
                      style={{ width: `${(tradIncome / maxIncome) * 100}%` }}
                    >
                      <span className="text-xs font-bold text-white">
                        {formatCurrency(tradIncome)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Agent Bar */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-20">Agent</span>
                  <div className="flex-1 bg-green-200 rounded-full h-8 relative">
                    <div
                      className="bg-green-600 h-8 rounded-full flex items-center justify-end pr-3"
                      style={{ width: `${(agentInc / maxIncome) * 100}%` }}
                    >
                      <span className="text-xs font-bold text-white">
                        {formatCurrency(agentInc)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Comparison */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total 5-Year (Traditional)</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(traditionalJobIncome.reduce((a, b) => a + b, 0))}
            </p>
          </div>
          <div className="p-4 bg-green-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total 5-Year (Agent)</p>
            <p className="text-2xl font-bold text-green-700">
              {formatCurrency(agentIncome.reduce((a, b) => a + b, 0))}
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg">
          <p className="text-sm mb-1">Extra Income as Agent (5 Years)</p>
          <p className="text-3xl font-bold">
            {formatCurrency(
              agentIncome.reduce((a, b) => a + b, 0) - traditionalJobIncome.reduce((a, b) => a + b, 0)
            )}
          </p>
        </div>
      </div>

      {/* Download Comparison */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">Save This Comparison</h3>
            <p className="text-sm text-gray-600">Download a PDF to review later or share with others</p>
          </div>
          <button
            onClick={() => generateComparisonPDF(traditionalJobIncome, agentIncome)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Income Disclaimer */}
      <div className="card bg-amber-50 border border-amber-200">
        <IncomeDisclaimer />
        <p className="text-xs text-amber-700 mt-2">
          Traditional job income assumes 4% annual raises starting from $60,000. Agent income projections
          assume consistent production of 4 policies per month at $2,000 average premium with growing renewal book.
          Actual results depend on individual effort, market conditions, and other factors.
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="card bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <h3 className="text-2xl font-bold mb-4">The Choice Is Yours</h3>
        <p className="text-lg mb-6">
          Ready to explore a career with unlimited potential?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white/10 rounded-lg backdrop-blur">
            <p className="font-bold mb-2">Traditional Job = Linear Growth</p>
            <p className="text-sm opacity-90">
              Trade time for money. Income stops when you stop working. Limited upside.
            </p>
          </div>
          <div className="p-4 bg-white/10 rounded-lg backdrop-blur">
            <p className="font-bold mb-2">Agent Career = Exponential Growth</p>
            <p className="text-sm opacity-90">
              Build an asset. Create passive income. Unlimited potential. True ownership.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
