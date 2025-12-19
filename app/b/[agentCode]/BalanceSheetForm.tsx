'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  User,
  DollarSign,
  PiggyBank,
  CreditCard,
  Check,
} from 'lucide-react';

interface BalanceSheetFormProps {
  agentId: string;
  agentCode: string;
  agentName: string;
  primaryColor: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: string;
  dependents: string;
  annualIncome: string;
  spouseIncome: string;
  monthlyExpenses: string;
  housingCost: string;
  savings: string;
  retirement: string;
  homeValue: string;
  otherAssets: string;
  mortgage: string;
  carLoans: string;
  studentLoans: string;
  creditCards: string;
  otherDebts: string;
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
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      case 0:
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.age) {
          setError('Please fill in all required fields');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        break;
      case 1:
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
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
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
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'currency' ? (
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
          <input
            type="text"
            value={formatCurrency(formData[field])}
            onChange={(e) => handleCurrencyChange(field, e.target.value)}
            placeholder={placeholder || '0'}
            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 pl-8 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
          />
        </div>
      ) : (
        <input
          type={type}
          value={formData[field]}
          onChange={(e) => updateField(field, e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
        />
      )}
    </div>
  );

  return (
    <div>
      {/* Progress Steps */}
      <div className="flex justify-between mb-10">
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
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : isCompleted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  isActive ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-6 left-[60%] w-[80%] h-0.5 ${
                    isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="min-h-[320px]">
        {currentStep === 0 && (
          <div className="space-y-5">
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
          <div className="space-y-5">
            <p className="text-slate-600 text-sm mb-6">
              Enter your annual household income before taxes.
            </p>
            {renderInput('Your Annual Income', 'annualIncome', 'currency', '75,000', true)}
            {renderInput('Spouse Annual Income (if applicable)', 'spouseIncome', 'currency', '0')}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <p className="text-slate-600 text-sm mb-6">Estimate your monthly expenses.</p>
              {renderInput('Total Monthly Expenses', 'monthlyExpenses', 'currency', '5,000')}
              {renderInput('Housing Cost (rent/mortgage)', 'housingCost', 'currency', '2,000')}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-5">
            <p className="text-slate-600 text-sm mb-6">
              What do you own? Enter approximate values.
            </p>
            {renderInput('Savings & Checking', 'savings', 'currency', '10,000')}
            {renderInput('Retirement Accounts (401k, IRA)', 'retirement', 'currency', '50,000')}
            {renderInput('Home Value (if you own)', 'homeValue', 'currency', '300,000')}
            {renderInput('Other Assets (vehicles, investments)', 'otherAssets', 'currency', '20,000')}
            <div className="mt-8 pt-8 border-t border-slate-200">
              {renderInput('Current Life Insurance Coverage', 'currentLifeInsurance', 'currency', '0')}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-5">
            <p className="text-slate-600 text-sm mb-6">
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
      <div className="flex justify-between mt-10 pt-8 border-t border-slate-200">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition ${
            currentStep === 0
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        {currentStep < steps.length - 1 ? (
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition"
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition disabled:opacity-50"
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
