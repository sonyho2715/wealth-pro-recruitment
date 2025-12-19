'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  Building2,
  DollarSign,
  Landmark,
  CreditCard,
  Shield,
  Check,
} from 'lucide-react';

interface BusinessBalanceSheetFormProps {
  agentId: string;
  agentCode: string;
  agentName: string;
  primaryColor: string;
}

interface FormData {
  // Contact Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Business Info
  businessName: string;
  businessType: string;
  industry: string;
  yearsInBusiness: string;
  employeeCount: string;

  // Income
  annualRevenue: string;
  costOfGoodsSold: string;
  grossProfit: string;
  netIncome: string;
  ownerSalary: string;

  // Assets - Current
  cashOnHand: string;
  accountsReceivable: string;
  inventory: string;

  // Assets - Fixed
  equipment: string;
  vehicles: string;
  realEstate: string;

  // Assets - Other
  investments: string;
  otherAssets: string;

  // Liabilities - Current
  accountsPayable: string;
  shortTermLoans: string;
  creditCards: string;
  lineOfCredit: string;

  // Liabilities - Long Term
  termLoans: string;
  sbaLoans: string;
  equipmentLoans: string;
  commercialMortgage: string;

  // Insurance
  keyPersonInsurance: string;
  generalLiability: string;
  propertyInsurance: string;
  businessInterruption: string;
  buyerSellerAgreement: boolean;
  successionPlan: boolean;
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  businessName: '',
  businessType: 'LLC',
  industry: '',
  yearsInBusiness: '',
  employeeCount: '1',
  annualRevenue: '',
  costOfGoodsSold: '',
  grossProfit: '',
  netIncome: '',
  ownerSalary: '',
  cashOnHand: '',
  accountsReceivable: '',
  inventory: '',
  equipment: '',
  vehicles: '',
  realEstate: '',
  investments: '',
  otherAssets: '',
  accountsPayable: '',
  shortTermLoans: '',
  creditCards: '',
  lineOfCredit: '',
  termLoans: '',
  sbaLoans: '',
  equipmentLoans: '',
  commercialMortgage: '',
  keyPersonInsurance: '',
  generalLiability: '',
  propertyInsurance: '',
  businessInterruption: '',
  buyerSellerAgreement: false,
  successionPlan: false,
};

const steps = [
  { id: 'business', title: 'Business Info', icon: Building2 },
  { id: 'income', title: 'Income', icon: DollarSign },
  { id: 'assets', title: 'Assets', icon: Landmark },
  { id: 'liabilities', title: 'Liabilities', icon: CreditCard },
  { id: 'insurance', title: 'Insurance', icon: Shield },
];

const businessTypes = [
  { value: 'SOLE_PROPRIETORSHIP', label: 'Sole Proprietorship' },
  { value: 'LLC', label: 'LLC' },
  { value: 'PARTNERSHIP', label: 'Partnership' },
  { value: 'S_CORP', label: 'S Corporation' },
  { value: 'C_CORP', label: 'C Corporation' },
  { value: 'NONPROFIT', label: 'Nonprofit' },
  { value: 'OTHER', label: 'Other' },
];

const industries = [
  'Retail',
  'Restaurant/Food Service',
  'Professional Services',
  'Healthcare',
  'Construction',
  'Real Estate',
  'Manufacturing',
  'Technology',
  'Transportation',
  'Wholesale/Distribution',
  'Agriculture',
  'Other',
];

export default function BusinessBalanceSheetForm({
  agentId,
  agentCode,
  agentName,
  primaryColor,
}: BusinessBalanceSheetFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
    setError('');
    switch (currentStep) {
      case 0: // Business Info
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.businessName) {
          setError('Please fill in all required fields');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        break;
      case 1: // Income
        if (!formData.annualRevenue) {
          setError('Please enter your annual revenue');
          return false;
        }
        break;
    }
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
      const response = await fetch('/api/balance-sheet/business/submit', {
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

      router.push(`/b/${agentCode}/business/results?id=${result.data.businessProspectId}`);
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
            value={formatCurrency(formData[field] as string)}
            onChange={(e) => handleCurrencyChange(field, e.target.value)}
            placeholder={placeholder || '0'}
            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 pl-8 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
          />
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
    options: { value: string; label: string }[] | string[],
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
        <option value="">Select...</option>
        {options.map((opt) => {
          const value = typeof opt === 'string' ? opt : opt.value;
          const label = typeof opt === 'string' ? opt : opt.label;
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );

  const renderCheckbox = (label: string, field: keyof FormData, description?: string) => (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          type="checkbox"
          checked={formData[field] as boolean}
          onChange={(e) => updateField(field, e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-5 h-5 border-2 rounded transition-all ${
            formData[field]
              ? 'bg-slate-900 border-slate-900'
              : 'bg-white border-slate-300 group-hover:border-slate-400'
          }`}
        >
          {formData[field] && <Check className="w-4 h-4 text-white" />}
        </div>
      </div>
      <div>
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
    </label>
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
              className={`flex-1 min-w-[80px] flex flex-col items-center ${
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
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4 md:w-5 md:h-5" />}
              </div>
              <span
                className={`mt-2 text-xs font-medium text-center ${
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
      <div className="min-h-[380px]">
        {currentStep === 0 && (
          <div className="space-y-5">
            <div className="pb-4 border-b border-slate-200">
              <h3 className="font-medium text-slate-900 mb-1">Contact Information</h3>
              <p className="text-sm text-slate-500">Business owner or primary contact</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('First Name', 'firstName', 'text', 'John', true)}
              {renderInput('Last Name', 'lastName', 'text', 'Smith', true)}
            </div>
            {renderInput('Email', 'email', 'email', 'john@company.com', true)}
            {renderInput('Phone', 'phone', 'tel', '(555) 123-4567')}

            <div className="pt-6 pb-4 border-b border-slate-200">
              <h3 className="font-medium text-slate-900 mb-1">Business Information</h3>
              <p className="text-sm text-slate-500">Tell us about your business</p>
            </div>
            {renderInput('Business Name', 'businessName', 'text', 'ABC Company LLC', true)}
            <div className="grid grid-cols-2 gap-4">
              {renderSelect('Business Type', 'businessType', businessTypes, true)}
              {renderSelect('Industry', 'industry', industries)}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Years in Business', 'yearsInBusiness', 'number', '5')}
              {renderInput('Number of Employees', 'employeeCount', 'number', '10')}
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="pb-4 border-b border-slate-200">
              <h3 className="font-medium text-slate-900 mb-1">Business Income</h3>
              <p className="text-sm text-slate-500">Annual financial performance</p>
            </div>
            {renderInput('Annual Revenue', 'annualRevenue', 'currency', '500,000', true)}
            {renderInput('Cost of Goods Sold (COGS)', 'costOfGoodsSold', 'currency', '300,000')}
            {renderInput('Gross Profit', 'grossProfit', 'currency', '200,000')}
            {renderInput('Net Income (after expenses)', 'netIncome', 'currency', '100,000')}

            <div className="pt-6 pb-4 border-b border-slate-200">
              <h3 className="font-medium text-slate-900 mb-1">Owner Compensation</h3>
              <p className="text-sm text-slate-500">What you take from the business</p>
            </div>
            {renderInput('Owner Salary/Draw', 'ownerSalary', 'currency', '80,000')}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="pb-4 border-b border-slate-200">
              <h3 className="font-medium text-slate-900 mb-1">Current Assets</h3>
              <p className="text-sm text-slate-500">Cash and assets convertible within 1 year</p>
            </div>
            {renderInput('Cash on Hand', 'cashOnHand', 'currency', '50,000')}
            {renderInput('Accounts Receivable', 'accountsReceivable', 'currency', '75,000')}
            {renderInput('Inventory', 'inventory', 'currency', '30,000')}

            <div className="pt-6 pb-4 border-b border-slate-200">
              <h3 className="font-medium text-slate-900 mb-1">Fixed Assets</h3>
              <p className="text-sm text-slate-500">Long-term assets</p>
            </div>
            {renderInput('Equipment & Machinery', 'equipment', 'currency', '100,000')}
            {renderInput('Vehicles', 'vehicles', 'currency', '40,000')}
            {renderInput('Real Estate', 'realEstate', 'currency', '0')}

            <div className="pt-6 pb-4 border-b border-slate-200">
              <h3 className="font-medium text-slate-900 mb-1">Other Assets</h3>
            </div>
            {renderInput('Investments', 'investments', 'currency', '0')}
            {renderInput('Other Assets', 'otherAssets', 'currency', '0')}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="pb-4 border-b border-slate-200">
              <h3 className="font-medium text-slate-900 mb-1">Current Liabilities</h3>
              <p className="text-sm text-slate-500">Debts due within 1 year</p>
            </div>
            {renderInput('Accounts Payable', 'accountsPayable', 'currency', '25,000')}
            {renderInput('Short-Term Loans', 'shortTermLoans', 'currency', '0')}
            {renderInput('Credit Cards', 'creditCards', 'currency', '10,000')}
            {renderInput('Line of Credit Balance', 'lineOfCredit', 'currency', '15,000')}

            <div className="pt-6 pb-4 border-b border-slate-200">
              <h3 className="font-medium text-slate-900 mb-1">Long-Term Liabilities</h3>
              <p className="text-sm text-slate-500">Debts due beyond 1 year</p>
            </div>
            {renderInput('Term Loans', 'termLoans', 'currency', '50,000')}
            {renderInput('SBA Loans', 'sbaLoans', 'currency', '0')}
            {renderInput('Equipment Loans', 'equipmentLoans', 'currency', '30,000')}
            {renderInput('Commercial Mortgage', 'commercialMortgage', 'currency', '0')}
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="pb-4 border-b border-slate-200">
              <h3 className="font-medium text-slate-900 mb-1">Business Insurance Coverage</h3>
              <p className="text-sm text-slate-500">Current coverage amounts</p>
            </div>
            {renderInput('Key Person Insurance', 'keyPersonInsurance', 'currency', '0')}
            {renderInput('General Liability', 'generalLiability', 'currency', '1,000,000')}
            {renderInput('Property Insurance', 'propertyInsurance', 'currency', '500,000')}
            {renderInput('Business Interruption', 'businessInterruption', 'currency', '0')}

            <div className="pt-6 pb-4 border-b border-slate-200">
              <h3 className="font-medium text-slate-900 mb-1">Business Continuity Planning</h3>
              <p className="text-sm text-slate-500">Exit and succession planning</p>
            </div>
            <div className="space-y-4">
              {renderCheckbox(
                'Buy-Sell Agreement in Place',
                'buyerSellerAgreement',
                'Funded agreement for ownership transfer'
              )}
              {renderCheckbox(
                'Succession Plan Documented',
                'successionPlan',
                'Written plan for business continuity'
              )}
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
                Analyzing...
              </>
            ) : (
              <>
                See Business Analysis
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
