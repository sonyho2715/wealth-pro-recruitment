'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronRight, ChevronLeft, User, DollarSign, PiggyBank, CreditCard } from 'lucide-react';

interface BalanceSheetFormProps {
  agentId: string;
  agentCode: string;
  agentName: string;
  primaryColor: string;
}

interface FormData {
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: string;
  dependents: string;

  // Income
  annualIncome: string;
  spouseIncome: string;

  // Monthly Expenses
  monthlyExpenses: string;
  housingCost: string;

  // Assets
  savings: string;
  retirement: string;
  homeValue: string;
  otherAssets: string;

  // Debts
  mortgage: string;
  carLoans: string;
  studentLoans: string;
  creditCards: string;
  otherDebts: string;

  // Insurance
  currentLifeInsurance: string;
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  age: '',
  dependents: '0',
  annualIncome: '',
  spouseIncome: '',
  monthlyExpenses: '',
  housingCost: '',
  savings: '',
  retirement: '',
  homeValue: '',
  otherAssets: '',
  mortgage: '',
  carLoans: '',
  studentLoans: '',
  creditCards: '',
  otherDebts: '',
  currentLifeInsurance: '',
};

const steps = [
  { id: 'personal', title: 'About You', icon: User },
  { id: 'income', title: 'Income', icon: DollarSign },
  { id: 'assets', title: 'Assets', icon: PiggyBank },
  { id: 'debts', title: 'Debts', icon: CreditCard },
];

export default function BalanceSheetForm({
  agentId,
  agentCode,
  agentName,
  primaryColor,
}: BalanceSheetFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    if (!num) return '';
    return Number(num).toLocaleString();
  };

  const parseCurrency = (value: string) => {
    return value.replace(/[^0-9]/g, '');
  };

  const handleCurrencyChange = (field: keyof FormData, value: string) => {
    const parsed = parseCurrency(value);
    updateField(field, parsed);
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0: // Personal
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.age) {
          setError('Please fill in all required fields');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        break;
      case 1: // Income
        if (!formData.annualIncome) {
          setError('Please enter your annual income');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/balance-sheet/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          agentCode,
          ...formData,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit');
      }

      // Redirect to results page with prospect ID
      router.push(`/${agentCode}/results?id=${result.data.prospectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsSubmitting(false);
    }
  };

  const renderInput = (
    label: string,
    field: keyof FormData,
    type: 'text' | 'email' | 'tel' | 'number' | 'currency' = 'text',
    placeholder?: string,
    required = false
  ) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {type === 'currency' ? (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
          <input
            type="text"
            value={formatCurrency(formData[field])}
            onChange={(e) => handleCurrencyChange(field, e.target.value)}
            placeholder={placeholder || '0'}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2.5 pl-8 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      ) : (
        <input
          type={type}
          value={formData[field]}
          onChange={(e) => updateField(field, e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      )}
    </div>
  );

  return (
    <div>
      {/* Progress Steps */}
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div
              key={step.id}
              className={`flex-1 flex flex-col items-center ${
                index < steps.length - 1 ? 'relative' : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-white/10 text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  isActive ? 'text-white' : 'text-slate-500'
                }`}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-5 left-[60%] w-[80%] h-0.5 ${
                    isCompleted ? 'bg-green-500' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="min-h-[320px]">
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {renderInput('First Name', 'firstName', 'text', 'John', true)}
              {renderInput('Last Name', 'lastName', 'text', 'Smith', true)}
            </div>
            {renderInput('Email', 'email', 'email', 'john@example.com', true)}
            {renderInput('Phone', 'phone', 'tel', '(555) 123-4567')}
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Age', 'age', 'number', '35', true)}
              {renderInput('Dependents', 'dependents', 'number', '0')}
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <p className="text-slate-400 text-sm mb-4">
              Enter your annual household income before taxes.
            </p>
            {renderInput('Your Annual Income', 'annualIncome', 'currency', '75,000', true)}
            {renderInput('Spouse Annual Income (if applicable)', 'spouseIncome', 'currency', '0')}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-slate-400 text-sm mb-4">
                Estimate your monthly expenses.
              </p>
              {renderInput('Total Monthly Expenses', 'monthlyExpenses', 'currency', '5,000')}
              {renderInput('Housing Cost (rent/mortgage payment)', 'housingCost', 'currency', '2,000')}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <p className="text-slate-400 text-sm mb-4">
              What do you own? Enter approximate values.
            </p>
            {renderInput('Savings & Checking', 'savings', 'currency', '10,000')}
            {renderInput('Retirement Accounts (401k, IRA)', 'retirement', 'currency', '50,000')}
            {renderInput('Home Value (if you own)', 'homeValue', 'currency', '300,000')}
            {renderInput('Other Assets (vehicles, investments)', 'otherAssets', 'currency', '20,000')}
            <div className="mt-6 pt-6 border-t border-white/10">
              {renderInput('Current Life Insurance Coverage', 'currentLifeInsurance', 'currency', '0')}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <p className="text-slate-400 text-sm mb-4">
              What do you owe? Enter current balances.
            </p>
            {renderInput('Mortgage Balance', 'mortgage', 'currency', '250,000')}
            {renderInput('Car Loans', 'carLoans', 'currency', '15,000')}
            {renderInput('Student Loans', 'studentLoans', 'currency', '30,000')}
            {renderInput('Credit Cards', 'creditCards', 'currency', '5,000')}
            {renderInput('Other Debts', 'otherDebts', 'currency', '0')}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            currentStep === 0
              ? 'text-slate-600 cursor-not-allowed'
              : 'text-slate-300 hover:bg-white/5'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        {currentStep < steps.length - 1 ? (
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition"
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                See My Results
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
