'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Building2,
  DollarSign,
  Landmark,
  CreditCard,
  Shield,
  History,
  Check,
  Plus,
  Trash2,
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
  ownerDistributions: string;

  // Assets - Current
  cashOnHand: string;
  accountsReceivable: string;
  inventory: string;
  prepaidExpenses: string;

  // Assets - Fixed
  equipment: string;
  vehicles: string;
  realEstate: string;
  leaseholdImprovements: string;

  // Assets - Intangible & Other
  intellectualProperty: string;
  goodwill: string;
  investments: string;
  otherAssets: string;

  // Liabilities - Current
  accountsPayable: string;
  accruedExpenses: string;
  shortTermLoans: string;
  creditCards: string;
  lineOfCredit: string;
  currentPortionLTD: string;

  // Liabilities - Long Term
  termLoans: string;
  sbaLoans: string;
  equipmentLoans: string;
  commercialMortgage: string;
  otherLongTermDebt: string;

  // Insurance
  keyPersonInsurance: string;
  generalLiability: string;
  professionalLiability: string;
  propertyInsurance: string;
  workersComp: string;
  businessInterruption: string;
  cyberLiability: string;
  buyerSellerAgreement: boolean;
  successionPlan: boolean;
}

// Historical yearly data interface
interface YearlyData {
  taxYear: number;
  netReceipts: string;
  costOfGoodsSold: string;
  grossProfit: string;
  totalDeductions: string;
  netIncome: string;
  pensionContributions: string;
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
  ownerDistributions: '',
  cashOnHand: '',
  accountsReceivable: '',
  inventory: '',
  prepaidExpenses: '',
  equipment: '',
  vehicles: '',
  realEstate: '',
  leaseholdImprovements: '',
  intellectualProperty: '',
  goodwill: '',
  investments: '',
  otherAssets: '',
  accountsPayable: '',
  accruedExpenses: '',
  shortTermLoans: '',
  creditCards: '',
  lineOfCredit: '',
  currentPortionLTD: '',
  termLoans: '',
  sbaLoans: '',
  equipmentLoans: '',
  commercialMortgage: '',
  otherLongTermDebt: '',
  keyPersonInsurance: '',
  generalLiability: '',
  professionalLiability: '',
  propertyInsurance: '',
  workersComp: '',
  businessInterruption: '',
  cyberLiability: '',
  buyerSellerAgreement: false,
  successionPlan: false,
};

const createEmptyYearData = (year: number): YearlyData => ({
  taxYear: year,
  netReceipts: '',
  costOfGoodsSold: '',
  grossProfit: '',
  totalDeductions: '',
  netIncome: '',
  pensionContributions: '',
});

const steps = [
  { id: 'business', title: 'Business Info', icon: Building2 },
  { id: 'income', title: 'Revenue', icon: DollarSign },
  { id: 'assets', title: 'Assets', icon: Landmark },
  { id: 'liabilities', title: 'Liabilities', icon: CreditCard },
  { id: 'insurance', title: 'Insurance', icon: Shield },
  { id: 'history', title: 'History', icon: History },
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
  'Financial Services',
  'Legal Services',
  'Consulting',
  'Education',
  'Entertainment',
  'Hospitality',
  'Automotive',
  'Beauty & Personal Care',
  'Other',
];

// Available tax years (current year - 5 years)
const currentYear = new Date().getFullYear();
const availableYears = Array.from({ length: 6 }, (_, i) => currentYear - 1 - i);

export default function BusinessBalanceSheetForm({
  agentId,
  agentCode,
  agentName,
  primaryColor,
}: BusinessBalanceSheetFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [yearlyData, setYearlyData] = useState<YearlyData[]>([]);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

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

  // Yearly data handlers
  const addYear = (year: number) => {
    if (!yearlyData.find((y) => y.taxYear === year)) {
      setYearlyData((prev) => [...prev, createEmptyYearData(year)].sort((a, b) => b.taxYear - a.taxYear));
      setActiveYear(year);
    }
  };

  const removeYear = (year: number) => {
    setYearlyData((prev) => prev.filter((y) => y.taxYear !== year));
    if (activeYear === year) {
      setActiveYear(yearlyData.find((y) => y.taxYear !== year)?.taxYear || null);
    }
  };

  const updateYearlyField = (year: number, field: keyof YearlyData, value: string) => {
    setYearlyData((prev) =>
      prev.map((y) => (y.taxYear === year ? { ...y, [field]: parseCurrency(value) } : y))
    );
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
          yearlyData: yearlyData.filter((y) => y.netReceipts), // Only include years with data
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

  // Collapsible section component
  const CollapsibleSection = ({
    id,
    title,
    description,
    children,
    defaultOpen = false,
  }: {
    id: string;
    title: string;
    description?: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
  }) => {
    const isOpen = expandedSections[id] ?? defaultOpen;

    return (
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection(id)}
          className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div className="text-left">
            <h4 className="font-medium text-slate-900 text-sm">{title}</h4>
            {description && <p className="text-xs text-slate-500">{description}</p>}
          </div>
          <ChevronDown
            className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {isOpen && <div className="p-4 space-y-4 border-t border-slate-200">{children}</div>}
      </div>
    );
  };

  // Yearly data input renderer
  const renderYearlyInput = (
    year: number,
    field: keyof YearlyData,
    label: string,
    placeholder?: string
  ) => {
    const yearData = yearlyData.find((y) => y.taxYear === year);
    if (!yearData) return null;

    return (
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
          <input
            type="text"
            value={formatCurrency(yearData[field] as string)}
            onChange={(e) => updateYearlyField(year, field, e.target.value)}
            placeholder={placeholder || '0'}
            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 pl-8 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
          />
        </div>
      </div>
    );
  };

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
      <div className="min-h-[400px]">
        {/* Step 1: Business Info */}
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

        {/* Step 2: Revenue & Profitability */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="pb-4 border-b border-slate-200">
              <h3 className="font-medium text-slate-900 mb-1">Revenue & Profitability</h3>
              <p className="text-sm text-slate-500">Annual financial performance from your most recent tax year</p>
            </div>
            {renderInput('Annual Revenue (Gross Receipts)', 'annualRevenue', 'currency', '500,000', true)}
            {renderInput('Cost of Goods Sold (COGS)', 'costOfGoodsSold', 'currency', '300,000')}
            {renderInput('Gross Profit', 'grossProfit', 'currency', '200,000')}
            {renderInput('Net Income (after all expenses)', 'netIncome', 'currency', '100,000')}

            <div className="pt-6 pb-4 border-b border-slate-200">
              <h3 className="font-medium text-slate-900 mb-1">Owner Compensation</h3>
              <p className="text-sm text-slate-500">What you take from the business</p>
            </div>
            {renderInput('Owner Salary/W-2 Wages', 'ownerSalary', 'currency', '80,000')}
            {renderInput('Owner Distributions/Draws', 'ownerDistributions', 'currency', '20,000')}
          </div>
        )}

        {/* Step 3: Assets */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="pb-4 border-b border-slate-200">
              <h3 className="font-medium text-slate-900 mb-1">Current Assets</h3>
              <p className="text-sm text-slate-500">Cash and assets convertible within 1 year</p>
            </div>
            {renderInput('Cash on Hand', 'cashOnHand', 'currency', '50,000')}
            {renderInput('Accounts Receivable', 'accountsReceivable', 'currency', '75,000')}
            {renderInput('Inventory', 'inventory', 'currency', '30,000')}
            {renderInput('Prepaid Expenses', 'prepaidExpenses', 'currency', '5,000')}

            <div className="pt-6 pb-4 border-b border-slate-200">
              <h3 className="font-medium text-slate-900 mb-1">Fixed Assets</h3>
              <p className="text-sm text-slate-500">Long-term tangible assets</p>
            </div>
            {renderInput('Equipment & Machinery', 'equipment', 'currency', '100,000')}
            {renderInput('Vehicles', 'vehicles', 'currency', '40,000')}
            {renderInput('Real Estate/Property', 'realEstate', 'currency', '0')}
            {renderInput('Leasehold Improvements', 'leaseholdImprovements', 'currency', '15,000')}

            {/* Collapsible: Intangible Assets */}
            <CollapsibleSection
              id="intangibleAssets"
              title="Intangible & Other Assets"
              description="Patents, trademarks, goodwill, investments"
            >
              {renderInput('Intellectual Property', 'intellectualProperty', 'currency', '0')}
              {renderInput('Goodwill', 'goodwill', 'currency', '0')}
              {renderInput('Investments', 'investments', 'currency', '0')}
              {renderInput('Other Assets', 'otherAssets', 'currency', '0')}
            </CollapsibleSection>
          </div>
        )}

        {/* Step 4: Liabilities */}
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

            {/* Collapsible: Additional Current Liabilities */}
            <CollapsibleSection
              id="additionalCurrentLiabilities"
              title="Additional Current Liabilities"
              description="Accrued expenses, current portion of long-term debt"
            >
              {renderInput('Accrued Expenses', 'accruedExpenses', 'currency', '0')}
              {renderInput('Current Portion of Long-Term Debt', 'currentPortionLTD', 'currency', '0')}
            </CollapsibleSection>

            <div className="pt-6 pb-4 border-b border-slate-200">
              <h3 className="font-medium text-slate-900 mb-1">Long-Term Liabilities</h3>
              <p className="text-sm text-slate-500">Debts due beyond 1 year</p>
            </div>
            {renderInput('Term Loans', 'termLoans', 'currency', '50,000')}
            {renderInput('SBA Loans', 'sbaLoans', 'currency', '0')}
            {renderInput('Equipment Loans', 'equipmentLoans', 'currency', '30,000')}
            {renderInput('Commercial Mortgage', 'commercialMortgage', 'currency', '0')}
            {renderInput('Other Long-Term Debt', 'otherLongTermDebt', 'currency', '0')}
          </div>
        )}

        {/* Step 5: Insurance */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="pb-4 border-b border-slate-200">
              <h3 className="font-medium text-slate-900 mb-1">Business Insurance Coverage</h3>
              <p className="text-sm text-slate-500">Current coverage amounts (annual or per-occurrence limits)</p>
            </div>
            {renderInput('Key Person Insurance', 'keyPersonInsurance', 'currency', '0')}
            {renderInput('General Liability', 'generalLiability', 'currency', '1,000,000')}
            {renderInput('Property Insurance', 'propertyInsurance', 'currency', '500,000')}
            {renderInput('Business Interruption', 'businessInterruption', 'currency', '0')}

            {/* Collapsible: Additional Coverage */}
            <CollapsibleSection
              id="additionalCoverage"
              title="Additional Coverage Types"
              description="Professional liability, workers comp, cyber insurance"
            >
              {renderInput('Professional/E&O Liability', 'professionalLiability', 'currency', '0')}
              {renderInput('Workers Compensation', 'workersComp', 'currency', '0')}
              {renderInput('Cyber Liability', 'cyberLiability', 'currency', '0')}
            </CollapsibleSection>

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

        {/* Step 6: Historical Data (Optional) */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div className="pb-4 border-b border-slate-200">
              <h3 className="font-medium text-slate-900 mb-1">Historical Tax Data (Optional)</h3>
              <p className="text-sm text-slate-500">
                Enter data from previous tax years to enable trend analysis. This helps identify growth patterns
                and opportunities.
              </p>
            </div>

            {/* Add Year Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {availableYears
                .filter((year) => !yearlyData.find((y) => y.taxYear === year))
                .map((year) => (
                  <button
                    key={year}
                    onClick={() => addYear(year)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add {year}
                  </button>
                ))}
            </div>

            {yearlyData.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-slate-600 font-medium mb-1">No Historical Data Added</h4>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Click &quot;Add Year&quot; above to enter data from previous tax years.
                  This is optional but enables better trend analysis.
                </p>
              </div>
            ) : (
              <>
                {/* Year Tabs */}
                <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-px">
                  {yearlyData.map((year) => (
                    <button
                      key={year.taxYear}
                      onClick={() => setActiveYear(year.taxYear)}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                        activeYear === year.taxYear
                          ? 'text-slate-900 border-slate-900'
                          : 'text-slate-500 border-transparent hover:text-slate-700'
                      }`}
                    >
                      Tax Year {year.taxYear}
                    </button>
                  ))}
                </div>

                {/* Year Data Form */}
                {activeYear && (
                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-slate-900">Tax Year {activeYear} Data</h4>
                      <button
                        onClick={() => removeYear(activeYear)}
                        className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {renderYearlyInput(activeYear, 'netReceipts', 'Gross Receipts/Revenue', '500,000')}
                      {renderYearlyInput(activeYear, 'costOfGoodsSold', 'Cost of Goods Sold', '300,000')}
                      {renderYearlyInput(activeYear, 'grossProfit', 'Gross Profit', '200,000')}
                      {renderYearlyInput(activeYear, 'totalDeductions', 'Total Deductions', '150,000')}
                      {renderYearlyInput(activeYear, 'netIncome', 'Net Income/Profit', '50,000')}
                      {renderYearlyInput(activeYear, 'pensionContributions', 'Pension Contributions', '0')}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> You can find this information on your Schedule C (Form 1040) or business tax return.
                Adding 2-3 years of data provides the best trend analysis.
              </p>
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
