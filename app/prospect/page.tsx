'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  DollarSign,
  Wallet,
  CreditCard,
  Shield,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2
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

    // Income
    annualIncome: 75000,
    spouseIncome: undefined as number | undefined,
    otherIncome: undefined as number | undefined,
    monthlyExpenses: 4000,
    housingCost: 1500,
    debtPayments: 500,

    // Assets
    savings: 10000,
    investments: 25000,
    retirement401k: 50000,
    homeEquity: 75000,
    otherAssets: 0,

    // Liabilities
    mortgage: 250000,
    carLoans: 15000,
    studentLoans: 0,
    creditCards: 5000,
    otherDebts: 0,

    // Protection
    currentLifeInsurance: 100000,
    currentDisability: 0
  });

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleChange = (field: string, value: string | number | undefined) => {
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
      annualIncome: formData.annualIncome,
      spouseIncome: formData.spouseIncome,
      otherIncome: formData.otherIncome,
      monthlyExpenses: formData.monthlyExpenses,
      housingCost: formData.housingCost,
      debtPayments: formData.debtPayments,
      savings: formData.savings,
      investments: formData.investments,
      retirement401k: formData.retirement401k,
      homeEquity: formData.homeEquity,
      otherAssets: formData.otherAssets,
      mortgage: formData.mortgage,
      carLoans: formData.carLoans,
      studentLoans: formData.studentLoans,
      creditCards: formData.creditCards,
      otherDebts: formData.otherDebts,
      age: formData.age,
      spouseAge: formData.spouseAge,
      dependents: formData.dependents,
      retirementAge: formData.retirementAge,
      currentLifeInsurance: formData.currentLifeInsurance,
      currentDisability: formData.currentDisability
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
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={e => handleChange('firstName', e.target.value)}
                  className="input-field"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                className="input-field"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone (Optional)</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Age</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Dependents</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Spouse Age (if applicable)</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Retirement Age</label>
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
          </div>
        );

      case 'income':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Annual Income</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.annualIncome}
                  onChange={e => handleChange('annualIncome', parseInt(e.target.value) || 0)}
                  className="input-field pl-8"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Spouse Annual Income (if applicable)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Other Income (rental, investments, etc.)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Monthly Expenses</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Housing Cost</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.housingCost}
                    onChange={e => handleChange('housingCost', parseInt(e.target.value) || 0)}
                    className="input-field pl-8"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Debt Payments</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.debtPayments}
                    onChange={e => handleChange('debtPayments', parseInt(e.target.value) || 0)}
                    className="input-field pl-8"
                  />
                </div>
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

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Savings Accounts</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.savings}
                    onChange={e => handleChange('savings', parseInt(e.target.value) || 0)}
                    className="input-field pl-8"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Investments (Stocks, Bonds)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.investments}
                    onChange={e => handleChange('investments', parseInt(e.target.value) || 0)}
                    className="input-field pl-8"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">401(k) / IRA / Retirement</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.retirement401k}
                    onChange={e => handleChange('retirement401k', parseInt(e.target.value) || 0)}
                    className="input-field pl-8"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Home Equity</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.homeEquity}
                    onChange={e => handleChange('homeEquity', parseInt(e.target.value) || 0)}
                    className="input-field pl-8"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Other Assets (vehicles, etc.)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.otherAssets}
                  onChange={e => handleChange('otherAssets', parseInt(e.target.value) || 0)}
                  className="input-field pl-8"
                />
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-green-800">Total Assets</span>
                <span className="text-xl font-bold text-green-600">
                  ${(formData.savings + formData.investments + formData.retirement401k + formData.homeEquity + formData.otherAssets).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        );

      case 'liabilities':
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-amber-700 text-sm">
                Enter your current debt balances. This helps us identify protection needs and calculate your net worth.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mortgage Balance</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.mortgage}
                    onChange={e => handleChange('mortgage', parseInt(e.target.value) || 0)}
                    className="input-field pl-8"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Car Loans</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.carLoans}
                    onChange={e => handleChange('carLoans', parseInt(e.target.value) || 0)}
                    className="input-field pl-8"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student Loans</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.studentLoans}
                    onChange={e => handleChange('studentLoans', parseInt(e.target.value) || 0)}
                    className="input-field pl-8"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Credit Card Debt</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.creditCards}
                    onChange={e => handleChange('creditCards', parseInt(e.target.value) || 0)}
                    className="input-field pl-8"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Other Debts</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.otherDebts}
                  onChange={e => handleChange('otherDebts', parseInt(e.target.value) || 0)}
                  className="input-field pl-8"
                />
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-red-800">Total Liabilities</span>
                <span className="text-xl font-bold text-red-600">
                  ${(formData.mortgage + formData.carLoans + formData.studentLoans + formData.creditCards + formData.otherDebts).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-blue-800">Net Worth</span>
                <span className="text-xl font-bold text-blue-600">
                  ${((formData.savings + formData.investments + formData.retirement401k + formData.homeEquity + formData.otherAssets) - (formData.mortgage + formData.carLoans + formData.studentLoans + formData.creditCards + formData.otherDebts)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        );

      case 'protection':
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
              <p className="text-purple-700 text-sm">
                Tell us about your current insurance coverage so we can identify any gaps in your protection.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Life Insurance Coverage</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.currentLifeInsurance}
                  onChange={e => handleChange('currentLifeInsurance', parseInt(e.target.value) || 0)}
                  className="input-field pl-8"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Include all policies (term, whole life, group coverage)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Disability Coverage</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.currentDisability}
                  onChange={e => handleChange('currentDisability', parseInt(e.target.value) || 0)}
                  className="input-field pl-8"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Monthly benefit amount if you become disabled</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mt-8">
              <h3 className="font-semibold text-gray-900 mb-3">What Happens Next?</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  View your complete Living Balance Sheet
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
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Review</h1>
          <p className="text-gray-600">Complete this assessment to see your full financial picture</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  index <= currentStepIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-500'
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
                <div className={`w-8 h-0.5 mx-2 ${index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="card-gradient">
          <div className="flex items-center gap-3 mb-6">
            {steps[currentStepIndex].icon}
            <h2 className="text-xl font-semibold text-gray-900">{steps[currentStepIndex].label}</h2>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={handleBack}
              disabled={currentStepIndex === 0 || loading}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            {currentStep === 'protection' ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary flex items-center gap-2"
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
                className="btn-primary flex items-center gap-2"
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
  );
}
