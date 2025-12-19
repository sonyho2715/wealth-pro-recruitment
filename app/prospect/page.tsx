'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  DollarSign,
  Wallet,
  CreditCard,
  Shield,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  BarChart3,
  Building2,
  Users
} from 'lucide-react';
import { createProspect, saveFinancialProfile } from './actions';

type Step = 'personal' | 'income' | 'assets' | 'liabilities' | 'protection';

const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: 'personal', label: 'Personal Info', icon: <User className="w-5 h-5" /> },
  { id: 'income', label: 'Income & Expenses', icon: <DollarSign className="w-5 h-5" /> },
  { id: 'assets', label: 'Assets', icon: <Wallet className="w-5 h-5" /> },
  { id: 'liabilities', label: 'Liabilities', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'protection', label: 'Protection', icon: <Shield className="w-5 h-5" /> }
];

export default function ProspectIntakePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('personal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prospectId, setProspectId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Personal
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    age: 35,
    spouseAge: undefined as number | undefined,
    dependents: 0,
    retirementAge: 65,
    occupation: '',
    spouseOccupation: '',
    stateOfResidence: '',

    // Income
    annualIncome: 75000,
    spouseIncome: undefined as number | undefined,
    otherIncome: undefined as number | undefined,
    monthlyExpenses: 4000,
    housingCost: 1500,
    debtPayments: 500,
    employer401kMatch: 0,
    monthlySavingsContribution: 0,

    // Assets
    savings: 10000,
    emergencyFund: 0,
    investments: 25000,
    retirement401k: 50000,
    rothIra: 0,
    pensionValue: 0,
    hsaFsa: 0,
    homeMarketValue: 500000,
    investmentProperty: 0,
    businessEquity: 0,
    otherAssets: 0,

    // Liabilities
    mortgage: 250000,
    carLoans: 15000,
    studentLoans: 0,
    personalLoans: 0,
    creditCards: 5000,
    otherDebts: 0,
    taxesOwed: 0,
    businessDebt: 0,

    // Protection
    currentLifeInsurance: 100000,
    currentDisability: 0,
    liabilityInsurance: 0,
    hospitalDailyBenefit: 0,
    spouseLifeInsurance: 0,
    annualInsuranceCosts: 0,
    hasWill: false,
    hasTrust: false,

    // Assets - Personal Property
    personalProperty: 0
  });

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleChange = (field: string, value: string | number | boolean | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    setError(null);

    if (currentStep === 'personal') {
      // Validate and create prospect
      if (!formData.email || !formData.firstName || !formData.lastName) {
        setError('Please fill in all required fields');
        return;
      }

      setLoading(true);
      const result = await createProspect({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined
      });
      setLoading(false);

      if (!result.success) {
        setError(result.error || 'Failed to save information');
        return;
      }

      setProspectId(result.prospectId!);
    }

    // Move to next step
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const handleSubmit = async () => {
    if (!prospectId) {
      setError('Session expired. Please start over.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await saveFinancialProfile(prospectId, {
      // Income
      annualIncome: formData.annualIncome,
      spouseIncome: formData.spouseIncome,
      otherIncome: formData.otherIncome,

      // Monthly Expenses
      monthlyExpenses: formData.monthlyExpenses,
      housingCost: formData.housingCost,
      debtPayments: formData.debtPayments,

      // Savings & Contributions
      monthlySavingsContribution: formData.monthlySavingsContribution,
      employer401kMatch: formData.employer401kMatch,

      // Cash & Liquid Assets
      savings: formData.savings,
      emergencyFund: formData.emergencyFund,

      // Investment Accounts
      investments: formData.investments,
      hsaFsa: formData.hsaFsa,

      // Retirement Accounts
      retirement401k: formData.retirement401k,
      rothIra: formData.rothIra,
      pensionValue: formData.pensionValue,

      // Real Estate
      homeMarketValue: formData.homeMarketValue,
      investmentProperty: formData.investmentProperty,

      // Business & Other Assets
      businessEquity: formData.businessEquity,
      otherAssets: formData.otherAssets,

      // Liabilities
      mortgage: formData.mortgage,
      carLoans: formData.carLoans,
      studentLoans: formData.studentLoans,
      personalLoans: formData.personalLoans,
      creditCards: formData.creditCards,
      otherDebts: formData.otherDebts,
      taxesOwed: formData.taxesOwed,
      businessDebt: formData.businessDebt,

      // Demographics
      age: formData.age,
      spouseAge: formData.spouseAge,
      dependents: formData.dependents,
      retirementAge: formData.retirementAge,
      occupation: formData.occupation || undefined,
      spouseOccupation: formData.spouseOccupation || undefined,
      stateOfResidence: formData.stateOfResidence || undefined,

      // Protection
      currentLifeInsurance: formData.currentLifeInsurance,
      currentDisability: formData.currentDisability,
      liabilityInsurance: formData.liabilityInsurance,
      hospitalDailyBenefit: formData.hospitalDailyBenefit,
      spouseLifeInsurance: formData.spouseLifeInsurance,
      annualInsuranceCosts: formData.annualInsuranceCosts,
      hasWill: formData.hasWill,
      hasTrust: formData.hasTrust,

      // Personal Property
      personalProperty: formData.personalProperty
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Failed to save information');
      return;
    }

    router.push(`/prospect/results?id=${prospectId}`);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'personal':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={e => handleChange('firstName', e.target.value)}
                  className="input-field"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={e => handleChange('lastName', e.target.value)}
                  className="input-field"
                  placeholder="Smith"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                className="input-field"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone (Optional)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                className="input-field"
                placeholder="(808) 555-0123"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Your Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={e => handleChange('age', parseInt(e.target.value) || 35)}
                  className="input-field"
                  min="18"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Number of Dependents</label>
                <input
                  type="number"
                  value={formData.dependents}
                  onChange={e => handleChange('dependents', parseInt(e.target.value) || 0)}
                  className="input-field"
                  min="0"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Spouse Age (if applicable)</label>
                <input
                  type="number"
                  value={formData.spouseAge || ''}
                  onChange={e => handleChange('spouseAge', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="input-field"
                  placeholder="Leave blank if single"
                  min="18"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Target Retirement Age</label>
                <input
                  type="number"
                  value={formData.retirementAge}
                  onChange={e => handleChange('retirementAge', parseInt(e.target.value) || 65)}
                  className="input-field"
                  min="50"
                  max="80"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Your Occupation</label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={e => handleChange('occupation', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Software Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">State of Residence</label>
                <select
                  value={formData.stateOfResidence}
                  onChange={e => handleChange('stateOfResidence', e.target.value)}
                  className="input-field"
                >
                  <option value="">Select state...</option>
                  <option value="AL">Alabama</option>
                  <option value="AK">Alaska</option>
                  <option value="AZ">Arizona</option>
                  <option value="AR">Arkansas</option>
                  <option value="CA">California</option>
                  <option value="CO">Colorado</option>
                  <option value="CT">Connecticut</option>
                  <option value="DE">Delaware</option>
                  <option value="FL">Florida</option>
                  <option value="GA">Georgia</option>
                  <option value="HI">Hawaii</option>
                  <option value="ID">Idaho</option>
                  <option value="IL">Illinois</option>
                  <option value="IN">Indiana</option>
                  <option value="IA">Iowa</option>
                  <option value="KS">Kansas</option>
                  <option value="KY">Kentucky</option>
                  <option value="LA">Louisiana</option>
                  <option value="ME">Maine</option>
                  <option value="MD">Maryland</option>
                  <option value="MA">Massachusetts</option>
                  <option value="MI">Michigan</option>
                  <option value="MN">Minnesota</option>
                  <option value="MS">Mississippi</option>
                  <option value="MO">Missouri</option>
                  <option value="MT">Montana</option>
                  <option value="NE">Nebraska</option>
                  <option value="NV">Nevada</option>
                  <option value="NH">New Hampshire</option>
                  <option value="NJ">New Jersey</option>
                  <option value="NM">New Mexico</option>
                  <option value="NY">New York</option>
                  <option value="NC">North Carolina</option>
                  <option value="ND">North Dakota</option>
                  <option value="OH">Ohio</option>
                  <option value="OK">Oklahoma</option>
                  <option value="OR">Oregon</option>
                  <option value="PA">Pennsylvania</option>
                  <option value="RI">Rhode Island</option>
                  <option value="SC">South Carolina</option>
                  <option value="SD">South Dakota</option>
                  <option value="TN">Tennessee</option>
                  <option value="TX">Texas</option>
                  <option value="UT">Utah</option>
                  <option value="VT">Vermont</option>
                  <option value="VA">Virginia</option>
                  <option value="WA">Washington</option>
                  <option value="WV">West Virginia</option>
                  <option value="WI">Wisconsin</option>
                  <option value="WY">Wyoming</option>
                </select>
              </div>
            </div>

            {formData.spouseAge && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Spouse Occupation</label>
                <input
                  type="text"
                  value={formData.spouseOccupation}
                  onChange={e => handleChange('spouseOccupation', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Nurse"
                />
              </div>
            )}
          </div>
        );

      case 'income':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Your Annual Income</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  value={formData.annualIncome}
                  onChange={e => handleChange('annualIncome', parseInt(e.target.value) || 0)}
                  className="input-field pl-8"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Spouse Annual Income (if applicable)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  value={formData.spouseIncome || ''}
                  onChange={e => handleChange('spouseIncome', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="input-field pl-8"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Other Income (rental, investments, etc.)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  value={formData.otherIncome || ''}
                  onChange={e => handleChange('otherIncome', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="input-field pl-8"
                  placeholder="0"
                />
              </div>
            </div>

            <hr className="my-6" />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Total Monthly Expenses</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  value={formData.monthlyExpenses}
                  onChange={e => handleChange('monthlyExpenses', parseInt(e.target.value) || 0)}
                  className="input-field pl-8"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Housing Cost</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    value={formData.housingCost}
                    onChange={e => handleChange('housingCost', parseInt(e.target.value) || 0)}
                    className="input-field pl-8"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Debt Payments</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    value={formData.debtPayments}
                    onChange={e => handleChange('debtPayments', parseInt(e.target.value) || 0)}
                    className="input-field pl-8"
                  />
                </div>
              </div>
            </div>

            <hr className="my-6" />

            <h4 className="font-medium text-slate-800 mb-4">Savings & Contributions</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Savings Contribution</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    value={formData.monthlySavingsContribution}
                    onChange={e => handleChange('monthlySavingsContribution', parseInt(e.target.value) || 0)}
                    className="input-field pl-8"
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">How much you save each month</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Employer 401(k) Match %</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.employer401kMatch}
                    onChange={e => handleChange('employer401kMatch', parseInt(e.target.value) || 0)}
                    className="input-field pr-8"
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">e.g., 3% = employer matches 3% of salary</p>
              </div>
            </div>
          </div>
        );

      case 'assets':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-blue-700 text-sm">
                Enter your current asset values. These help us calculate your net worth and retirement projections.
              </p>
            </div>

            {/* Cash & Liquid Assets */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
              <h4 className="font-medium text-slate-900">Cash & Liquid Assets</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Checking/Savings</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={formData.savings}
                      onChange={e => handleChange('savings', parseInt(e.target.value) || 0)}
                      className="input-field pl-8"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Emergency Fund</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={formData.emergencyFund}
                      onChange={e => handleChange('emergencyFund', parseInt(e.target.value) || 0)}
                      className="input-field pl-8"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Separate from regular savings</p>
                </div>
              </div>
            </div>

            {/* Investment Accounts */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
              <h4 className="font-medium text-slate-900">Investment Accounts</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Taxable Investments</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={formData.investments}
                      onChange={e => handleChange('investments', parseInt(e.target.value) || 0)}
                      className="input-field pl-8"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Stocks, bonds, mutual funds</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">HSA / FSA Balance</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={formData.hsaFsa}
                      onChange={e => handleChange('hsaFsa', parseInt(e.target.value) || 0)}
                      className="input-field pl-8"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Retirement Accounts */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
              <h4 className="font-medium text-slate-900">Retirement Accounts</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">401(k) / 403(b) / TSP</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={formData.retirement401k}
                      onChange={e => handleChange('retirement401k', parseInt(e.target.value) || 0)}
                      className="input-field pl-8"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Roth IRA</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={formData.rothIra}
                      onChange={e => handleChange('rothIra', parseInt(e.target.value) || 0)}
                      className="input-field pl-8"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Pension Value (if applicable)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    value={formData.pensionValue}
                    onChange={e => handleChange('pensionValue', parseInt(e.target.value) || 0)}
                    className="input-field pl-8"
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Estimated lump sum value or 0 if monthly pension</p>
              </div>
            </div>

            {/* Real Estate Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
              <h4 className="font-medium text-slate-900">Real Estate</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Primary Home Value</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={formData.homeMarketValue}
                      onChange={e => handleChange('homeMarketValue', parseInt(e.target.value) || 0)}
                      className="input-field pl-8"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Current estimated market value</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mortgage Balance</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={formData.mortgage}
                      onChange={e => handleChange('mortgage', parseInt(e.target.value) || 0)}
                      className="input-field pl-8"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Remaining balance owed</p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">Calculated Home Equity</span>
                  <span className="text-lg font-bold text-blue-600">
                    ${Math.max(0, formData.homeMarketValue - formData.mortgage).toLocaleString()}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Investment Property (Net Equity)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    value={formData.investmentProperty}
                    onChange={e => handleChange('investmentProperty', parseInt(e.target.value) || 0)}
                    className="input-field pl-8"
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Rental properties: market value minus mortgages</p>
              </div>
            </div>

            {/* Business & Other Assets */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
              <h4 className="font-medium text-slate-900">Business & Other Assets</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Business Equity</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={formData.businessEquity}
                      onChange={e => handleChange('businessEquity', parseInt(e.target.value) || 0)}
                      className="input-field pl-8"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Ownership stake in any businesses</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Personal Property</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={formData.personalProperty}
                      onChange={e => handleChange('personalProperty', parseInt(e.target.value) || 0)}
                      className="input-field pl-8"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Vehicles, jewelry, collectibles</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Other Assets</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    value={formData.otherAssets}
                    onChange={e => handleChange('otherAssets', parseInt(e.target.value) || 0)}
                    className="input-field pl-8"
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Any other assets not listed above</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-green-800">Total Assets</span>
                <span className="text-xl font-bold text-green-600">
                  ${(
                    formData.savings +
                    formData.emergencyFund +
                    formData.investments +
                    formData.hsaFsa +
                    formData.retirement401k +
                    formData.rothIra +
                    formData.pensionValue +
                    Math.max(0, formData.homeMarketValue - formData.mortgage) +
                    formData.investmentProperty +
                    formData.businessEquity +
                    formData.personalProperty +
                    formData.otherAssets
                  ).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">Includes all liquid, investment, retirement, and real estate assets</p>
            </div>
          </div>
        );

      case 'liabilities':
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-amber-700 text-sm">
                Enter your current debt balances (excluding mortgage, which was entered with your home value).
                This helps us identify protection needs and calculate your net worth.
              </p>
            </div>

            {/* Show mortgage from previous step */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Mortgage Balance (from previous step)</span>
                <span className="text-lg font-semibold text-slate-800">
                  ${formData.mortgage.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Car Loans</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    value={formData.carLoans}
                    onChange={e => handleChange('carLoans', parseInt(e.target.value) || 0)}
                    className="input-field pl-8"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Student Loans</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    value={formData.studentLoans}
                    onChange={e => handleChange('studentLoans', parseInt(e.target.value) || 0)}
                    className="input-field pl-8"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Credit Card Debt</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    value={formData.creditCards}
                    onChange={e => handleChange('creditCards', parseInt(e.target.value) || 0)}
                    className="input-field pl-8"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Personal Loans</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    value={formData.personalLoans}
                    onChange={e => handleChange('personalLoans', parseInt(e.target.value) || 0)}
                    className="input-field pl-8"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Taxes Owed</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    value={formData.taxesOwed}
                    onChange={e => handleChange('taxesOwed', parseInt(e.target.value) || 0)}
                    className="input-field pl-8"
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Back taxes, tax liens</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Business Debt</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    value={formData.businessDebt}
                    onChange={e => handleChange('businessDebt', parseInt(e.target.value) || 0)}
                    className="input-field pl-8"
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Business-related debt obligations</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Other Debts</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  value={formData.otherDebts}
                  onChange={e => handleChange('otherDebts', parseInt(e.target.value) || 0)}
                  className="input-field pl-8"
                  placeholder="0"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Medical bills, etc.</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-red-800">Total Liabilities</span>
                <span className="text-xl font-bold text-red-600">
                  ${(
                    formData.mortgage +
                    formData.carLoans +
                    formData.studentLoans +
                    formData.personalLoans +
                    formData.creditCards +
                    formData.taxesOwed +
                    formData.businessDebt +
                    formData.otherDebts
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-blue-800">Net Worth</span>
                <span className="text-xl font-bold text-blue-600">
                  ${(
                    // Assets
                    formData.savings +
                    formData.emergencyFund +
                    formData.investments +
                    formData.hsaFsa +
                    formData.retirement401k +
                    formData.rothIra +
                    formData.pensionValue +
                    formData.homeMarketValue +
                    formData.investmentProperty +
                    formData.businessEquity +
                    formData.personalProperty +
                    formData.otherAssets -
                    // Liabilities
                    formData.mortgage -
                    formData.carLoans -
                    formData.studentLoans -
                    formData.personalLoans -
                    formData.creditCards -
                    formData.taxesOwed -
                    formData.businessDebt -
                    formData.otherDebts
                  ).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">Total Assets minus Total Liabilities</p>
            </div>
          </div>
        );

      case 'protection':
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
              <p className="text-purple-700 text-sm">
                Tell us about your current insurance coverage and estate planning so we can identify any gaps.
              </p>
            </div>

            {/* Life Insurance */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
              <h4 className="font-medium text-slate-900">Life Insurance</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Your Life Insurance</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={formData.currentLifeInsurance}
                      onChange={e => handleChange('currentLifeInsurance', parseInt(e.target.value) || 0)}
                      className="input-field pl-8"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">All policies (term, whole life, group)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Spouse Life Insurance</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={formData.spouseLifeInsurance}
                      onChange={e => handleChange('spouseLifeInsurance', parseInt(e.target.value) || 0)}
                      className="input-field pl-8"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Leave blank if not applicable</p>
                </div>
              </div>
            </div>

            {/* Other Insurance */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
              <h4 className="font-medium text-slate-900">Other Insurance Coverage</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Disability Benefit</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={formData.currentDisability}
                      onChange={e => handleChange('currentDisability', parseInt(e.target.value) || 0)}
                      className="input-field pl-8"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Monthly benefit if disabled</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Hospital Daily Benefit</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={formData.hospitalDailyBenefit}
                      onChange={e => handleChange('hospitalDailyBenefit', parseInt(e.target.value) || 0)}
                      className="input-field pl-8"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Daily indemnity benefit</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Liability/Umbrella Coverage</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={formData.liabilityInsurance}
                      onChange={e => handleChange('liabilityInsurance', parseInt(e.target.value) || 0)}
                      className="input-field pl-8"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Personal liability protection</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Annual Insurance Costs</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={formData.annualInsuranceCosts}
                      onChange={e => handleChange('annualInsuranceCosts', parseInt(e.target.value) || 0)}
                      className="input-field pl-8"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Total annual premiums paid</p>
                </div>
              </div>
            </div>

            {/* Estate Planning */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
              <h4 className="font-medium text-slate-900">Estate Planning</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.hasWill}
                    onChange={e => handleChange('hasWill', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-slate-900">I have a Will</span>
                    <p className="text-xs text-slate-500">Legal document for asset distribution</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.hasTrust}
                    onChange={e => handleChange('hasTrust', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-slate-900">I have a Trust</span>
                    <p className="text-xs text-slate-500">Living trust or family trust</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mt-8">
              <h3 className="font-semibold text-slate-900 mb-3">What Happens Next?</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  View your complete Personal Balance Sheet
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Get personalized insurance recommendations
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  See how agent income could transform your finances
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Compare your future with and without this opportunity
                </li>
              </ul>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-slate-900 tracking-tight">Wealth Pro</span>
          </Link>
          <Link href="/career" className="text-slate-700 hover:text-slate-900 font-medium text-sm">
            Learn About Career Opportunity
          </Link>
        </div>
      </nav>

      <div className="py-6 md:py-10 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2">Financial Review</h1>
            <p className="text-slate-600 text-sm md:text-base">Complete this assessment to see your full financial picture</p>
          </div>

          {/* Personal / Business Toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-slate-100 rounded-xl p-1">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white font-medium text-sm transition-all"
              >
                <Users className="w-4 h-4" />
                Personal
              </button>
              <Link
                href="/b/demo/business"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 font-medium text-sm transition-all"
              >
                <Building2 className="w-4 h-4" />
                Business
              </Link>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6 md:mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                    index <= currentStepIndex
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {index < currentStepIndex ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                  <span className="hidden sm:inline text-sm font-medium">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${index < currentStepIndex ? 'bg-slate-900' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Form Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-slate-700">{steps[currentStepIndex].icon}</div>
              <h2 className="text-xl font-semibold text-slate-900">{steps[currentStepIndex].label}</h2>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                {error}
              </div>
            )}

            {renderStepContent()}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
              <button
                onClick={handleBack}
                disabled={currentStepIndex === 0 || loading}
                className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>

              {currentStep === 'protection' ? (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      See My Results
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
