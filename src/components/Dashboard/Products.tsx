import { useState } from 'react';
import { useClientStore } from '../../store/clientStore';
import { Shield, Heart, TrendingUp, CheckCircle2, DollarSign } from 'lucide-react';

export default function Products() {
  const { currentClient, currentMetrics } = useClientStore();
  const [selectedInsurance, setSelectedInsurance] = useState<'living' | 'iul' | 'whole'>('iul');

  if (!currentClient || !currentMetrics) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-gradient">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-600 rounded-xl">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Insurance Products</h2>
            <p className="text-sm text-gray-600">
              Protect your family and build wealth with life insurance solutions
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
            <p className="text-sm text-red-700 mb-1">Current Life Insurance</p>
            <p className="text-2xl font-bold text-red-900">
              ${currentClient.lifeInsuranceCoverage.toLocaleString()}
            </p>
            <p className="text-xs text-red-600 mt-1">
              {currentClient.lifeInsuranceCoverage > 0 ? (
                currentClient.lifeInsuranceCoverage >= currentMetrics.totalIncome * 10 ? (
                  <span className="text-green-600">✓ Adequate coverage</span>
                ) : (
                  <span>Need {((currentMetrics.totalIncome * 10 - currentClient.lifeInsuranceCoverage) / 1000).toFixed(0)}k more</span>
                )
              ) : (
                'No coverage'
              )}
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Recommended Coverage</p>
            <p className="text-2xl font-bold text-blue-900">
              ${currentMetrics.lifeInsuranceNeeded.toLocaleString()}
            </p>
            <p className="text-xs text-blue-600 mt-1">10x annual income rule</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
            <p className="text-sm text-green-700 mb-1">Protection Gap</p>
            <p className="text-2xl font-bold text-green-900">
              ${currentMetrics.lifeInsuranceGap.toLocaleString()}
            </p>
            <p className="text-xs text-green-600 mt-1">Additional coverage needed</p>
          </div>
        </div>
      </div>

      {/* Product Selection */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Choose Your Protection Strategy</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setSelectedInsurance('living')}
            className={`p-6 rounded-xl border-2 text-left transition-all ${
              selectedInsurance === 'living'
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <Heart className="w-10 h-10 text-blue-600 mb-3" />
            <h4 className="font-bold text-gray-900 mb-2">Living Benefits</h4>
            <p className="text-sm text-gray-600 mb-3">Access cash while alive for critical, chronic, or terminal illness</p>
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700 font-semibold">Most Comprehensive</span>
            </div>
          </button>

          <button
            onClick={() => setSelectedInsurance('iul')}
            className={`p-6 rounded-xl border-2 text-left transition-all ${
              selectedInsurance === 'iul'
                ? 'border-purple-500 bg-purple-50 shadow-lg'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <TrendingUp className="w-10 h-10 text-purple-600 mb-3" />
            <h4 className="font-bold text-gray-900 mb-2">Indexed Universal Life</h4>
            <p className="text-sm text-gray-600 mb-3">Market-linked growth with downside protection</p>
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
              <span className="text-purple-700 font-semibold">Growth Potential</span>
            </div>
          </button>

          <button
            onClick={() => setSelectedInsurance('whole')}
            className={`p-6 rounded-xl border-2 text-left transition-all ${
              selectedInsurance === 'whole'
                ? 'border-green-500 bg-green-50 shadow-lg'
                : 'border-gray-200 hover:border-green-300'
            }`}
          >
            <Shield className="w-10 h-10 text-green-600 mb-3" />
            <h4 className="font-bold text-gray-900 mb-2">Whole Life</h4>
            <p className="text-sm text-gray-600 mb-3">Guaranteed growth and fixed premiums</p>
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-green-700 font-semibold">100% Guaranteed</span>
            </div>
          </button>
        </div>

        {/* Living Benefits */}
        {selectedInsurance === 'living' && (
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-blue-600" />
              <h4 className="text-xl font-bold text-blue-900">Living Benefits Rider</h4>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-bold text-blue-900 mb-2">What It Is:</h5>
                <p className="text-sm text-gray-800">
                  Life insurance that pays <strong>YOU</strong> while you're still alive if diagnosed with:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-800">
                  <li>• <strong>Critical Illness:</strong> Heart attack, stroke, cancer, kidney failure</li>
                  <li>• <strong>Chronic Illness:</strong> Can't perform 2+ Activities of Daily Living (ADLs)</li>
                  <li>• <strong>Terminal Illness:</strong> Life expectancy less than 12-24 months</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-bold text-blue-900 mb-2">Why It's Essential in Hawaii:</h5>
                <ul className="text-sm text-gray-800 space-y-2">
                  <li>• <strong>$100,000-150,000/year</strong> for assisted living in Honolulu</li>
                  <li>• Medicare does NOT cover long-term care</li>
                  <li>• 70% of Americans need long-term care at some point</li>
                  <li>• Access 50-100% of death benefit tax-free while alive</li>
                  <li>• No "use it or lose it" - beneficiaries get remainder</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-bold text-blue-900 mb-2">Typical Cost Examples:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="p-3 bg-blue-50 rounded">
                    <p className="text-xs text-blue-700 mb-1">Age 40 / $500k Coverage</p>
                    <p className="text-2xl font-bold text-blue-900">$100-200</p>
                    <p className="text-xs text-blue-600">per month</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded">
                    <p className="text-xs text-blue-700 mb-1">Age 50 / $500k Coverage</p>
                    <p className="text-2xl font-bold text-blue-900">$200-400</p>
                    <p className="text-xs text-blue-600">per month</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-100 p-4 rounded-lg border-2 border-yellow-300">
                <p className="text-sm text-yellow-900 font-semibold">
                  💡 Best For: Families with dependents, business owners, anyone concerned about healthcare costs in retirement
                </p>
              </div>
            </div>
          </div>
        )}

        {/* IUL */}
        {selectedInsurance === 'iul' && (
          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <h4 className="text-xl font-bold text-purple-900">Indexed Universal Life (IUL)</h4>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-bold text-purple-900 mb-2">What It Is:</h5>
                <p className="text-sm text-gray-800">
                  Permanent life insurance with cash value tied to stock market index (typically S&P 500).
                  You get market upside with <strong>zero downside risk</strong>.
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-bold text-purple-900 mb-2">How It Works:</h5>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="text-center p-3 bg-red-50 rounded">
                    <p className="text-3xl font-bold text-red-600">0%</p>
                    <p className="text-xs text-red-700 mt-1">Floor (never lose money)</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <p className="text-3xl font-bold text-blue-600">6-8%</p>
                    <p className="text-xs text-blue-700 mt-1">Historical average</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <p className="text-3xl font-bold text-green-600">10-14%</p>
                    <p className="text-xs text-green-700 mt-1">Cap (max credit)</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-1 text-sm text-gray-800">
                  <li>• Tax-free loans against cash value in retirement</li>
                  <li>• Death benefit remains tax-free to beneficiaries</li>
                  <li>• No contribution limits (unlike 401k/IRA)</li>
                  <li>• Asset protection from creditors (state dependent)</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-bold text-purple-900 mb-2">Best For:</h5>
                <ul className="text-sm text-gray-800 space-y-1">
                  <li>✓ High earners who maxed out 401(k) and IRA ($69k+/year saved)</li>
                  <li>✓ Want supplemental tax-free retirement income</li>
                  <li>✓ Business owners funding buy-sell agreements</li>
                  <li>✓ Estate planning (tax-free wealth transfer)</li>
                  <li>✓ Real estate investors (tax-free cash for down payments)</li>
                </ul>
              </div>

              <div className="bg-purple-100 p-4 rounded-lg border-2 border-purple-300">
                <h5 className="font-bold text-purple-900 mb-2">📊 Realistic Example:</h5>
                <p className="text-sm text-purple-900">
                  <strong>Age 40, $1,000/month premium:</strong><br/>
                  • $500,000 death benefit (immediate)<br/>
                  • ~$800,000 cash value by age 65 (@ 7% avg)<br/>
                  • Tax-free loans of $40-50k/year from age 65-85<br/>
                  • Total retirement income: $800k-1M tax-free
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Whole Life */}
        {selectedInsurance === 'whole' && (
          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-green-600" />
              <h4 className="text-xl font-bold text-green-900">Whole Life Insurance</h4>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-bold text-green-900 mb-2">What It Is:</h5>
                <p className="text-sm text-gray-800">
                  Permanent life insurance with <strong>GUARANTEED</strong> cash value growth and death benefit.
                  Conservative, predictable, and boring (in a good way).
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-bold text-green-900 mb-2">How It Works:</h5>
                <ul className="text-sm text-gray-800 space-y-2">
                  <li>• <strong>Fixed premiums</strong> that never increase</li>
                  <li>• <strong>Guaranteed 3-4%</strong> growth (policy dependent)</li>
                  <li>• <strong>Dividends</strong> (not guaranteed) add 1-2% more</li>
                  <li>• Borrow against cash value at low interest rates (5-8%)</li>
                  <li>• <strong>"Paid-up"</strong> option after 10-20 years (no more premiums)</li>
                  <li>• Death benefit increases over time with dividends</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-bold text-green-900 mb-2">Infinite Banking Concept:</h5>
                <p className="text-sm text-gray-800 mb-2">
                  Use your whole life policy as your own "bank" to finance major purchases:
                </p>
                <ul className="text-sm text-gray-800 space-y-1">
                  <li>• Borrow from your policy to buy a car (instead of auto loan)</li>
                  <li>• Finance rental property down payment</li>
                  <li>• Fund your business without giving up equity</li>
                  <li>• Cash value continues to grow even while borrowed</li>
                  <li>• Pay yourself back on your own terms</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-bold text-green-900 mb-2">Pros & Cons:</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="font-semibold text-green-900 mb-1">✅ Pros:</p>
                    <ul className="text-sm text-gray-800 space-y-1">
                      <li>• 100% guaranteed</li>
                      <li>• Zero market risk</li>
                      <li>• Forced savings discipline</li>
                      <li>• Tax advantages</li>
                      <li>• Creditor protection</li>
                      <li>• Predictable growth</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-red-900 mb-1">❌ Cons:</p>
                    <ul className="text-sm text-gray-800 space-y-1">
                      <li>• Expensive premiums</li>
                      <li>• Lower returns than market</li>
                      <li>• Slow cash value build (years 1-10)</li>
                      <li>• Complex to understand</li>
                      <li>• Less flexible than IUL</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-green-100 p-4 rounded-lg border-2 border-green-300">
                <h5 className="font-bold text-green-900 mb-2">💡 Rule of Thumb:</h5>
                <p className="text-sm text-green-900">
                  Only buy whole life if you plan to keep it <strong>15+ years</strong> AND have maxed out other
                  tax-advantaged accounts (401k, IRA, HSA). Best for conservative investors who value guarantees
                  over growth potential.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Table */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Product Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Feature</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-blue-900">Living Benefits</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-purple-900">IUL</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-green-900">Whole Life</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Death Benefit</td>
                <td className="px-4 py-3 text-sm text-center">✅ Yes</td>
                <td className="px-4 py-3 text-sm text-center">✅ Yes</td>
                <td className="px-4 py-3 text-sm text-center">✅ Yes</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Living Benefits (Critical/Chronic)</td>
                <td className="px-4 py-3 text-sm text-center text-green-600 font-bold">✅ Primary Feature</td>
                <td className="px-4 py-3 text-sm text-center">Optional rider</td>
                <td className="px-4 py-3 text-sm text-center">Optional rider</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Cash Value Growth</td>
                <td className="px-4 py-3 text-sm text-center">Minimal</td>
                <td className="px-4 py-3 text-sm text-center text-purple-600 font-bold">6-8% average</td>
                <td className="px-4 py-3 text-sm text-center text-green-600 font-bold">3-5% guaranteed</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Market Risk</td>
                <td className="px-4 py-3 text-sm text-center">None</td>
                <td className="px-4 py-3 text-sm text-center text-green-600 font-bold">0% floor</td>
                <td className="px-4 py-3 text-sm text-center text-green-600 font-bold">None</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Premium Flexibility</td>
                <td className="px-4 py-3 text-sm text-center">Fixed</td>
                <td className="px-4 py-3 text-sm text-center text-blue-600 font-bold">Flexible</td>
                <td className="px-4 py-3 text-sm text-center">Fixed</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Best For</td>
                <td className="px-4 py-3 text-sm text-center">Health protection</td>
                <td className="px-4 py-3 text-sm text-center">Growth + Protection</td>
                <td className="px-4 py-3 text-sm text-center">Conservative wealth</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Typical Cost (Age 40, $500k)</td>
                <td className="px-4 py-3 text-sm text-center">$100-200/mo</td>
                <td className="px-4 py-3 text-sm text-center">$400-600/mo</td>
                <td className="px-4 py-3 text-sm text-center">$500-800/mo</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA */}
      <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-xl font-bold mb-2">Ready to Protect Your Family?</h4>
            <p className="text-blue-100">
              Schedule a consultation to review illustrations and find the right solution for your needs.
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href={`mailto:${currentClient.name}@example.com?subject=Insurance Consultation Request`}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              <DollarSign className="w-5 h-5" />
              Get Quote
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
