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
  Home,
  CreditCard,
  Shield,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface BalanceSheetFormProps {
  agentId: string;
  agentCode: string;
  agentName: string;
  primaryColor: string;
}

interface FormData {
  // Step 1: About You
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: string;
  spouseAge: string;
  dependents: string;
  stateOfResidence: string;
  occupation: string;
  spouseOccupation: string;

  // Step 2: Income & Expenses
  annualIncome: string;
  spouseIncome: string;
  otherIncome: string;
  housingCost: string;
  utilities: string;
  food: string;
  transportation: string;
  insurance: string;
  childcare: string;
  entertainment: string;
  otherExpenses: string;

  // Step 3: Assets - Savings & Investments
  savings: string;
  emergencyFund: string;
  retirement401k: string;
  rothIra: string;
  pensionValue: string;
  hsaFsa: string;
  investments: string;
  businessEquity: string;
  otherAssets: string;

  // Step 4: Assets - Property
  homeMarketValue: string;
  homeEquity: string;
  investmentProperty: string;
  personalProperty: string;

  // Step 5: Debts & Liabilities
  mortgage: string;
  carLoans: string;
  studentLoans: string;
  creditCards: string;
  personalLoans: string;
  businessDebt: string;
  taxesOwed: string;
  otherDebts: string;

  // Step 6: Protection & Planning
  currentLifeInsurance: string;
  spouseLifeInsurance: string;
  currentDisability: string;
  hospitalDailyBenefit: string;
  liabilityInsurance: string;
  hasWill: boolean;
  hasTrust: boolean;
  retirementAge: string;
  expectedSocialSecurity: string;
  employer401kMatch: string;
  filingStatus: string;
}

const initialFormData: FormData = {
  // Step 1
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  age: '',
  spouseAge: '',
  dependents: '0',
  stateOfResidence: '',
  occupation: '',
  spouseOccupation: '',

  // Step 2
  annualIncome: '',
  spouseIncome: '',
  otherIncome: '',
  housingCost: '',
  utilities: '',
  food: '',
  transportation: '',
  insurance: '',
  childcare: '',
  entertainment: '',
  otherExpenses: '',

  // Step 3
  savings: '',
  emergencyFund: '',
  retirement401k: '',
  rothIra: '',
  pensionValue: '',
  hsaFsa: '',
  investments: '',
  businessEquity: '',
  otherAssets: '',

  // Step 4
  homeMarketValue: '',
  homeEquity: '',
  investmentProperty: '',
  personalProperty: '',

  // Step 5
  mortgage: '',
  carLoans: '',
  studentLoans: '',
  creditCards: '',
  personalLoans: '',
  businessDebt: '',
  taxesOwed: '',
  otherDebts: '',

  // Step 6
  currentLifeInsurance: '',
  spouseLifeInsurance: '',
  currentDisability: '',
  hospitalDailyBenefit: '',
  liabilityInsurance: '',
  hasWill: false,
  hasTrust: false,
  retirementAge: '65',
  expectedSocialSecurity: '',
  employer401kMatch: '',
  filingStatus: '',
};

const steps = [
  { id: 'personal', title: 'About You', icon: User },
  { id: 'income', title: 'Income', icon: DollarSign },
  { id: 'investments', title: 'Investments', icon: PiggyBank },
  { id: 'property', title: 'Property', icon: Home },
  { id: 'debts', title: 'Debts', icon: CreditCard },
  { id: 'protection', title: 'Protection', icon: Shield },
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const FILING_STATUSES = [
  { value: '', label: 'Select filing status' },
  { value: 'SINGLE', label: 'Single' },
  { value: 'MARRIED_FILING_JOINTLY', label: 'Married Filing Jointly' },
  { value: 'MARRIED_FILING_SEPARATELY', label: 'Married Filing Separately' },
  { value: 'HEAD_OF_HOUSEHOLD', label: 'Head of Household' },
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
  const [showDetailedExpenses, setShowDetailedExpenses] = useState(false);
  const [showRetirementDetails, setShowRetirementDetails] = useState(false);

  const updateField = (field: keyof FormData, value: string | boolean) => {
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

      router.push(`/b/${agentCode}/results?id=${result.data.prospectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsSubmitting(false);
    }
  };

  const renderInput = (
    label: string,
    field: keyof FormData,
    type: 'text' | 'email' | 'tel' | 'number' | 'currency' | 'percent' = 'text',
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
            value={formatCurrency(formData[field] as string)}
            onChange={(e) => handleCurrencyChange(field, e.target.value)}
            placeholder={placeholder || '0'}
            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 pl-8 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
          />
        </div>
      ) : type === 'percent' ? (
        <div className="relative">
          <input
            type="text"
            value={formData[field] as string}
            onChange={(e) => updateField(field, e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder={placeholder || '0'}
            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 pr-8 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
        </div>
      ) : (
        <input
          type={type}
          value={formData[field] as string}
          onChange={(e) => updateField(field, e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
        />
      )}
    </div>
  );

  const renderSelect = (
    label: string,
    field: keyof FormData,
    options: { value: string; label: string }[],
    required = false
  ) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={formData[field] as string}
        onChange={(e) => updateField(field, e.target.value)}
        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  const renderCheckbox = (label: string, field: keyof FormData, description?: string) => (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={formData[field] as boolean}
        onChange={(e) => updateField(field, e.target.checked)}
        className="mt-1 w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
      />
      <div>
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
    </label>
  );

  const renderCollapsibleSection = (
    title: string,
    isOpen: boolean,
    setIsOpen: (v: boolean) => void,
    children: React.ReactNode
  ) => (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition"
      >
        <span className="text-sm font-medium text-slate-700">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        )}
      </button>
      {isOpen && <div className="p-4 space-y-4 bg-white">{children}</div>}
    </div>
  );

  return (
    <div>
      {/* Progress Steps */}
      <div className="flex justify-between mb-10 overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div
              key={step.id}
              className={`flex-1 min-w-[60px] flex flex-col items-center ${
                index < steps.length - 1 ? 'relative' : ''
              }`}
            >
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : isCompleted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : <Icon className="w-4 h-4 md:w-5 md:h-5" />}
              </div>
              <span
                className={`mt-2 text-[10px] md:text-xs font-medium text-center ${
                  isActive ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-5 md:top-6 left-[60%] w-[80%] h-0.5 ${
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
      <div className="min-h-[400px]">
        {/* Step 1: About You */}
        {currentStep === 0 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {renderInput('First Name', 'firstName', 'text', 'John', true)}
              {renderInput('Last Name', 'lastName', 'text', 'Smith', true)}
            </div>
            {renderInput('Email', 'email', 'email', 'john@example.com', true)}
            {renderInput('Phone', 'phone', 'tel', '(555) 123-4567')}
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Your Age', 'age', 'number', '35', true)}
              {renderInput('Spouse Age', 'spouseAge', 'number', '')}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Dependents', 'dependents', 'number', '0')}
              {renderSelect(
                'State',
                'stateOfResidence',
                [{ value: '', label: 'Select state' }, ...US_STATES.map((s) => ({ value: s, label: s }))]
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Your Occupation', 'occupation', 'text', 'Software Engineer')}
              {renderInput('Spouse Occupation', 'spouseOccupation', 'text', '')}
            </div>
          </div>
        )}

        {/* Step 2: Income & Expenses */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <p className="text-slate-600 text-sm mb-6">
              Enter your annual household income before taxes.
            </p>
            {renderInput('Your Annual Income', 'annualIncome', 'currency', '75,000', true)}
            {renderInput('Spouse Annual Income', 'spouseIncome', 'currency', '0')}
            {renderInput('Other Income (rental, dividends, etc.)', 'otherIncome', 'currency', '0')}

            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-slate-600 text-sm mb-4">Estimate your monthly expenses.</p>
              {renderInput('Housing (rent/mortgage)', 'housingCost', 'currency', '2,000')}

              {renderCollapsibleSection(
                'Detailed Monthly Expenses (Optional)',
                showDetailedExpenses,
                setShowDetailedExpenses,
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {renderInput('Utilities', 'utilities', 'currency', '200')}
                    {renderInput('Food & Groceries', 'food', 'currency', '600')}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {renderInput('Transportation', 'transportation', 'currency', '400')}
                    {renderInput('Insurance Premiums', 'insurance', 'currency', '300')}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {renderInput('Childcare', 'childcare', 'currency', '0')}
                    {renderInput('Entertainment', 'entertainment', 'currency', '200')}
                  </div>
                  {renderInput('Other Monthly Expenses', 'otherExpenses', 'currency', '500')}
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Assets - Savings & Investments */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <p className="text-slate-600 text-sm mb-6">
              What do you have in savings and investments?
            </p>
            {renderInput('Checking & Savings', 'savings', 'currency', '10,000')}
            {renderInput('Emergency Fund', 'emergencyFund', 'currency', '5,000')}

            <div className="mt-6 pt-6 border-t border-slate-200">
              <h4 className="text-sm font-medium text-slate-900 mb-4">Retirement Accounts</h4>
              {renderInput('401(k) Balance', 'retirement401k', 'currency', '50,000')}

              {renderCollapsibleSection(
                'More Retirement Accounts',
                showRetirementDetails,
                setShowRetirementDetails,
                <>
                  {renderInput('Roth IRA', 'rothIra', 'currency', '0')}
                  {renderInput('Pension Value', 'pensionValue', 'currency', '0')}
                  {renderInput('HSA/FSA', 'hsaFsa', 'currency', '0')}
                </>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <h4 className="text-sm font-medium text-slate-900 mb-4">Other Investments</h4>
              {renderInput('Brokerage/Investment Accounts', 'investments', 'currency', '20,000')}
              {renderInput('Business Equity', 'businessEquity', 'currency', '0')}
              {renderInput('Other Assets', 'otherAssets', 'currency', '0')}
            </div>
          </div>
        )}

        {/* Step 4: Assets - Property */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <p className="text-slate-600 text-sm mb-6">
              What property do you own?
            </p>
            {renderInput('Primary Home Value', 'homeMarketValue', 'currency', '300,000')}
            {renderInput('Home Equity (value minus mortgage)', 'homeEquity', 'currency', '50,000')}
            {renderInput('Investment Property Value', 'investmentProperty', 'currency', '0')}
            {renderInput('Vehicles & Personal Property', 'personalProperty', 'currency', '25,000')}
          </div>
        )}

        {/* Step 5: Debts & Liabilities */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <p className="text-slate-600 text-sm mb-6">
              What do you owe? Enter current balances.
            </p>
            {renderInput('Mortgage Balance', 'mortgage', 'currency', '250,000')}
            {renderInput('Car Loans', 'carLoans', 'currency', '15,000')}
            {renderInput('Student Loans', 'studentLoans', 'currency', '30,000')}
            {renderInput('Credit Cards', 'creditCards', 'currency', '5,000')}
            {renderInput('Personal Loans', 'personalLoans', 'currency', '0')}
            {renderInput('Business Debt', 'businessDebt', 'currency', '0')}
            {renderInput('Taxes Owed', 'taxesOwed', 'currency', '0')}
            {renderInput('Other Debts', 'otherDebts', 'currency', '0')}
          </div>
        )}

        {/* Step 6: Protection & Planning */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <p className="text-slate-600 text-sm mb-6">
              Help us understand your current protection and planning.
            </p>

            {/* Life Insurance */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 mb-4">Life Insurance</h4>
              <div className="space-y-4">
                {renderInput('Your Life Insurance Coverage', 'currentLifeInsurance', 'currency', '0')}
                {renderInput('Spouse Life Insurance Coverage', 'spouseLifeInsurance', 'currency', '0')}
              </div>
            </div>

            {/* Disability & Health */}
            <div className="pt-6 border-t border-slate-200">
              <h4 className="text-sm font-medium text-slate-900 mb-4">Disability & Health</h4>
              <div className="space-y-4">
                {renderInput('Disability Insurance (monthly benefit)', 'currentDisability', 'currency', '0')}
                {renderInput('Hospital Daily Benefit', 'hospitalDailyBenefit', 'currency', '0')}
                {renderInput('Liability/Umbrella Insurance', 'liabilityInsurance', 'currency', '0')}
              </div>
            </div>

            {/* Estate Planning */}
            <div className="pt-6 border-t border-slate-200">
              <h4 className="text-sm font-medium text-slate-900 mb-4">Estate Planning</h4>
              <div className="space-y-3">
                {renderCheckbox('I have a Will', 'hasWill', 'A legal document that specifies how your assets should be distributed')}
                {renderCheckbox('I have a Trust', 'hasTrust', 'A legal arrangement for managing and distributing assets')}
              </div>
            </div>

            {/* Retirement Goals */}
            <div className="pt-6 border-t border-slate-200">
              <h4 className="text-sm font-medium text-slate-900 mb-4">Retirement Goals</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {renderInput('Target Retirement Age', 'retirementAge', 'number', '65')}
                  {renderInput('Employer 401k Match', 'employer401kMatch', 'percent', '3')}
                </div>
                {renderInput('Expected Social Security (monthly)', 'expectedSocialSecurity', 'currency', '2,000')}
                {renderSelect('Tax Filing Status', 'filingStatus', FILING_STATUSES)}
              </div>
            </div>
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
