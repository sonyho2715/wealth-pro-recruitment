import { useState } from 'react';
import { useClientStore } from '../../store/clientStore';
import { formatCurrency, calculateStateTax } from '../../utils/calculations';
import {
  Home,
  Building,
  GraduationCap,
  Target,
  MapPin,
} from 'lucide-react';

type State = 'Hawaii' | 'California' | 'Nevada' | 'Texas' | 'Florida' | 'New York';

export default function LifePlanning() {
  const { currentClient, currentMetrics } = useClientStore();
  const [activeTab, setActiveTab] = useState<'home' | 'business' | 'college'>('home');

  const selectedState = (currentClient?.state || 'Hawaii') as State;

  // Home Buying
  const [homePrice, setHomePrice] = useState(650000);
  const [downPayment, setDownPayment] = useState(20);
  const [mortgageRate, setMortgageRate] = useState(7.0);
  const [mortgageYears, setMortgageYears] = useState(30);

  // Business Purchase
  const [businessPrice, setBusinessPrice] = useState(500000);
  const [businessDownPayment, setBusinessDownPayment] = useState(25);
  const [businessRevenue, setBusinessRevenue] = useState(300000);
  const [businessProfit, setBusinessProfit] = useState(75000);

  // College Planning
  const [yearsUntilCollege, setYearsUntilCollege] = useState(10);
  const [collegeCostPerYear, setCollegeCostPerYear] = useState(50000);
  const [currentCollegeSavings, setCurrentCollegeSavings] = useState(20000);

  if (!currentClient || !currentMetrics) {
    return null;
  }

  // Calculate taxes for selected state
  const taxInfo = calculateStateTax(currentMetrics.totalIncome, selectedState);

  // Home buying calculations
  const downPaymentAmount = homePrice * (downPayment / 100);
  const loanAmount = homePrice - downPaymentAmount;
  const monthlyRate = mortgageRate / 100 / 12;
  const numPayments = mortgageYears * 12;
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  const totalHomeCost = monthlyPayment * numPayments + downPaymentAmount;
  const totalHomeInterest = totalHomeCost - homePrice;

  // Business purchase calculations
  const businessDownAmount = businessPrice * (businessDownPayment / 100);
  const businessROI = businessProfit > 0 ? (businessProfit / businessPrice) * 100 : 0;
  const businessPaybackYears = businessProfit > 0 ? businessPrice / businessProfit : 0;

  // College calculations
  const yearsOfCollege = 4;
  const inflationRate = 5; // College inflation
  const investmentReturn = 7; // Expected return
  const totalCollegeCost = calculateFutureCollegeCost(collegeCostPerYear, yearsUntilCollege, yearsOfCollege, inflationRate);
  const projectedSavings = calculateCollegeSavings(currentCollegeSavings, yearsUntilCollege, investmentReturn);
  const monthlyContributionNeeded = calculateMonthlyCollegeContribution(totalCollegeCost, projectedSavings, yearsUntilCollege, investmentReturn);

  const tabs = [
    { id: 'home', name: 'Home Buying', icon: <Home className="w-4 h-4" /> },
    { id: 'business', name: 'Business Purchase', icon: <Building className="w-4 h-4" /> },
    { id: 'college', name: 'Kids College', icon: <GraduationCap className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Tax Information */}
      <div className="card-gradient">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-600 rounded-xl">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Life Planning</h2>
            <p className="text-sm text-gray-600">
              Home buying, business purchase, and college planning
            </p>
          </div>

          {/* State Display */}
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">{selectedState}</span>
            <span className="text-xs text-gray-600">(Change in Client Input)</span>
          </div>
        </div>

        {/* Tax Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
            <p className="text-sm text-blue-700 mb-1">{selectedState} State Tax</p>
            <p className="text-2xl font-bold text-blue-900">{formatCurrency(taxInfo.stateTax)}</p>
            <p className="text-xs text-blue-600 mt-1">
              {selectedState === 'Nevada' || selectedState === 'Texas' || selectedState === 'Florida' ? (
                'No state income tax!'
              ) : selectedState === 'Hawaii' ? (
                'Top bracket: 11%'
              ) : selectedState === 'California' ? (
                'Top bracket: 12.3%'
              ) : (
                'Top bracket: 10.9%'
              )}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
            <p className="text-sm text-purple-700 mb-1">Federal Tax</p>
            <p className="text-2xl font-bold text-purple-900">{formatCurrency(taxInfo.federalTax)}</p>
            <p className="text-xs text-purple-600 mt-1">Progressive brackets</p>
          </div>
          <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
            <p className="text-sm text-red-700 mb-1">Total Tax</p>
            <p className="text-2xl font-bold text-red-900">{formatCurrency(taxInfo.totalTax)}</p>
            <p className="text-xs text-red-600 mt-1">{taxInfo.effectiveRate.toFixed(1)}% effective rate</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
            <p className="text-sm text-green-700 mb-1">After-Tax Income</p>
            <p className="text-2xl font-bold text-green-900">{formatCurrency(currentMetrics.totalIncome - taxInfo.totalTax)}</p>
            <p className="text-xs text-green-600 mt-1">{formatCurrency((currentMetrics.totalIncome - taxInfo.totalTax) / 12)}/month</p>
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
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Home Buying */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Home className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Home Buying Calculator</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Home Purchase Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500 font-semibold">$</span>
                  <input
                    type="number"
                    value={homePrice}
                    onChange={(e) => setHomePrice(parseInt(e.target.value))}
                    className="input pl-8"
                    step="10000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Down Payment: {downPayment}%
                </label>
                <input
                  type="range"
                  min="3"
                  max="50"
                  value={downPayment}
                  onChange={(e) => setDownPayment(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mortgage Rate: {mortgageRate}%
                </label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  step="0.1"
                  value={mortgageRate}
                  onChange={(e) => setMortgageRate(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Loan Term: {mortgageYears} years
                </label>
                <input
                  type="range"
                  min="15"
                  max="30"
                  step="5"
                  value={mortgageYears}
                  onChange={(e) => setMortgageYears(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <p className="text-sm text-blue-700 mb-1">Down Payment Needed</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(downPaymentAmount)}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                <p className="text-sm text-green-700 mb-1">Monthly Payment</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(monthlyPayment)}</p>
                <p className="text-xs text-green-600 mt-1">P&I only (add taxes/insurance)</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                <p className="text-sm text-orange-700 mb-1">Total Interest</p>
                <p className="text-2xl font-bold text-orange-900">{formatCurrency(totalHomeInterest)}</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
              <p className="text-sm text-yellow-900">
                <strong>💡 Affordability Check:</strong> Your current monthly housing budget is{' '}
                <strong>{formatCurrency(currentClient.monthlyHousing)}</strong>. The new payment of{' '}
                <strong>{formatCurrency(monthlyPayment)}</strong>{' '}
                {monthlyPayment > currentClient.monthlyHousing ? (
                  <span className="text-red-600">exceeds your current budget by {formatCurrency(monthlyPayment - currentClient.monthlyHousing)}/month.</span>
                ) : (
                  <span className="text-green-600">fits comfortably in your budget!</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Business Purchase */}
        {activeTab === 'business' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Building className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900">Business Purchase Analyzer</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Purchase Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500 font-semibold">$</span>
                  <input
                    type="number"
                    value={businessPrice}
                    onChange={(e) => setBusinessPrice(parseInt(e.target.value))}
                    className="input pl-8"
                    step="50000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Down Payment: {businessDownPayment}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={businessDownPayment}
                  onChange={(e) => setBusinessDownPayment(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Annual Revenue
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500 font-semibold">$</span>
                  <input
                    type="number"
                    value={businessRevenue}
                    onChange={(e) => setBusinessRevenue(parseInt(e.target.value))}
                    className="input pl-8"
                    step="10000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Annual Net Profit (SDE)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500 font-semibold">$</span>
                  <input
                    type="number"
                    value={businessProfit}
                    onChange={(e) => setBusinessProfit(parseInt(e.target.value))}
                    className="input pl-8"
                    step="5000"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                <p className="text-sm text-purple-700 mb-1">Cash Required</p>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(businessDownAmount)}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <p className="text-sm text-blue-700 mb-1">Multiple Paid</p>
                <p className="text-2xl font-bold text-blue-900">
                  {businessProfit > 0 ? (businessPrice / businessProfit).toFixed(1) : '0'}x
                </p>
                <p className="text-xs text-blue-600 mt-1">SDE multiple</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                <p className="text-sm text-green-700 mb-1">Annual ROI</p>
                <p className="text-2xl font-bold text-green-900">{businessROI.toFixed(1)}%</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                <p className="text-sm text-orange-700 mb-1">Payback Period</p>
                <p className="text-2xl font-bold text-orange-900">{businessPaybackYears.toFixed(1)}</p>
                <p className="text-xs text-orange-600 mt-1">years</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
              <h4 className="font-bold text-green-900 mb-2">💡 Business Valuation Rules:</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• <strong>Service businesses:</strong> 2-4x SDE (Seller's Discretionary Earnings)</li>
                <li>• <strong>Product businesses:</strong> 3-5x SDE</li>
                <li>• <strong>SaaS/Tech:</strong> 5-10x revenue (recurring revenue premium)</li>
                <li>• <strong>Retail/Restaurants:</strong> 1.5-3x SDE</li>
                <li>• SBA loans require 10-20% down payment for businesses under $5M</li>
              </ul>
            </div>
          </div>
        )}

        {/* College Planning */}
        {activeTab === 'college' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold text-gray-900">Kids College Planning</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Years Until College: {yearsUntilCollege}
                </label>
                <input
                  type="range"
                  min="1"
                  max="18"
                  value={yearsUntilCollege}
                  onChange={(e) => setYearsUntilCollege(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current College Cost/Year
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500 font-semibold">$</span>
                  <input
                    type="number"
                    value={collegeCostPerYear}
                    onChange={(e) => setCollegeCostPerYear(parseInt(e.target.value))}
                    className="input pl-8"
                    step="5000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current 529 Savings
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500 font-semibold">$</span>
                  <input
                    type="number"
                    value={currentCollegeSavings}
                    onChange={(e) => setCurrentCollegeSavings(parseInt(e.target.value))}
                    className="input pl-8"
                    step="1000"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
                <p className="text-sm text-red-700 mb-1">Future Total Cost</p>
                <p className="text-2xl font-bold text-red-900">{formatCurrency(totalCollegeCost)}</p>
                <p className="text-xs text-red-600 mt-1">4 years @ 5% inflation</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <p className="text-sm text-blue-700 mb-1">Projected Savings</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(projectedSavings)}</p>
                <p className="text-xs text-blue-600 mt-1">@ 7% growth</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                <p className="text-sm text-orange-700 mb-1">Funding Gap</p>
                <p className="text-2xl font-bold text-orange-900">
                  {formatCurrency(Math.max(0, totalCollegeCost - projectedSavings))}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                <p className="text-sm text-green-700 mb-1">Monthly Contribution</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(monthlyContributionNeeded)}</p>
                <p className="text-xs text-green-600 mt-1">to close gap</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <h4 className="font-bold text-blue-900 mb-2">💡 529 Plan Benefits (Hawaii):</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Hawaii allows deduction of up to $10,000/year ($20,000 married) from state taxes</li>
                <li>• Tax-free growth when used for qualified education expenses</li>
                <li>• Can change beneficiary to another child or use for yourself</li>
                <li>• Starting 2024: $35,000 lifetime can be rolled to Roth IRA (15 year rule)</li>
              </ul>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}


// Helper functions
function calculateFutureCollegeCost(currentCost: number, yearsUntil: number, yearsOfCollege: number, inflationRate: number): number {
  let total = 0;
  for (let i = yearsUntil; i < yearsUntil + yearsOfCollege; i++) {
    total += currentCost * Math.pow(1 + inflationRate / 100, i);
  }
  return total;
}

function calculateCollegeSavings(currentSavings: number, years: number, returnRate: number): number {
  return currentSavings * Math.pow(1 + returnRate / 100, years);
}

function calculateMonthlyCollegeContribution(totalNeeded: number, projectedSavings: number, years: number, returnRate: number): number {
  const gap = Math.max(0, totalNeeded - projectedSavings);
  const monthlyRate = returnRate / 100 / 12;
  const months = years * 12;

  if (monthlyRate === 0) return gap / months;

  return (gap * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
}
