'use client';

import { useState } from 'react';
import { X, Save, Loader2, DollarSign, Shield, TrendingUp, CreditCard } from 'lucide-react';

interface FinancialData {
  // Protection
  currentLifeInsurance: number;
  currentDisability: number;

  // Assets
  savings: number;
  investments: number;
  retirement401k: number;
  homeMarketValue: number;
  otherAssets: number;

  // Liabilities
  mortgage: number;
  carLoans: number;
  studentLoans: number;
  creditCards: number;
  otherDebts: number;

  // Cash Flow
  annualIncome: number;
  spouseIncome: number | null;
  monthlyExpenses: number;
}

interface EditFinancialDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FinancialData) => Promise<void>;
  initialData: FinancialData;
}

export default function EditFinancialDataModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: EditFinancialDataModalProps) {
  const [data, setData] = useState<FinancialData>(initialData);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'protection' | 'assets' | 'liabilities' | 'cashflow'>('assets');

  if (!isOpen) return null;

  const handleChange = (field: keyof FinancialData, value: string) => {
    const numValue = parseInt(value.replace(/[^0-9-]/g, '')) || 0;
    setData(prev => ({ ...prev, [field]: numValue }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  // Calculate derived values
  const homeEquity = Math.max(0, data.homeMarketValue - data.mortgage);
  const totalAssets = data.savings + data.investments + data.retirement401k + homeEquity + data.otherAssets;
  const totalLiabilities = data.mortgage + data.carLoans + data.studentLoans + data.creditCards + data.otherDebts;
  const netWorth = totalAssets - totalLiabilities;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const sections = [
    { id: 'protection' as const, label: 'Protection', icon: Shield, color: 'amber' },
    { id: 'assets' as const, label: 'Assets', icon: TrendingUp, color: 'blue' },
    { id: 'liabilities' as const, label: 'Liabilities', icon: CreditCard, color: 'red' },
    { id: 'cashflow' as const, label: 'Cash Flow', icon: DollarSign, color: 'green' },
  ];

  const InputField = ({
    label,
    field,
    helpText
  }: {
    label: string;
    field: keyof FinancialData;
    helpText?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
        <input
          type="text"
          value={data[field]?.toLocaleString() || '0'}
          onChange={(e) => handleChange(field, e.target.value)}
          className="w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right font-medium"
        />
      </div>
      {helpText && <p className="text-xs text-slate-500 mt-1">{helpText}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Edit Financial Data</h2>
              <p className="text-slate-300 text-sm">Update your financial information</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Section Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-all ${
                  activeSection === section.id
                    ? `bg-white border-b-2 border-${section.color}-500 text-${section.color}-600`
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <section.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{section.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            {/* Protection Section */}
            {activeSection === 'protection' && (
              <div className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                  <h3 className="font-semibold text-amber-900 mb-1">Protection Coverage</h3>
                  <p className="text-amber-700 text-sm">Your current insurance coverage amounts</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <InputField
                    label="Life Insurance (Client)"
                    field="currentLifeInsurance"
                    helpText="Total death benefit coverage"
                  />
                  <InputField
                    label="Disability Insurance (Monthly)"
                    field="currentDisability"
                    helpText="Monthly benefit if unable to work"
                  />
                </div>
              </div>
            )}

            {/* Assets Section */}
            {activeSection === 'assets' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Your Assets</h3>
                      <p className="text-blue-700 text-sm">What you own</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-blue-600">Total Assets</div>
                      <div className="text-2xl font-bold text-blue-800">{formatCurrency(totalAssets)}</div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <InputField label="Savings" field="savings" helpText="Checking & savings accounts" />
                  <InputField label="Investments" field="investments" helpText="Stocks, bonds, mutual funds" />
                  <InputField label="Retirement (401k/IRA)" field="retirement401k" helpText="Retirement accounts" />
                  <InputField label="Home Market Value" field="homeMarketValue" helpText="Current market value of home" />
                  <InputField label="Other Assets" field="otherAssets" helpText="Vehicles, personal property, etc." />
                </div>

                {/* Home Equity Calculator */}
                <div className="bg-slate-100 rounded-xl p-4 mt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-slate-600">Calculated Home Equity</span>
                      <p className="text-xs text-slate-500">Market Value - Mortgage Balance</p>
                    </div>
                    <span className={`text-xl font-bold ${homeEquity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(homeEquity)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Liabilities Section */}
            {activeSection === 'liabilities' && (
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-red-900 mb-1">Your Liabilities</h3>
                      <p className="text-red-700 text-sm">What you owe</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-red-600">Total Liabilities</div>
                      <div className="text-2xl font-bold text-red-800">{formatCurrency(totalLiabilities)}</div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <InputField label="Mortgage Balance" field="mortgage" helpText="Remaining mortgage balance" />
                  <InputField label="Car Loans" field="carLoans" helpText="Auto loan balances" />
                  <InputField label="Student Loans" field="studentLoans" helpText="Education debt" />
                  <InputField label="Credit Cards" field="creditCards" helpText="Credit card balances" />
                  <InputField label="Other Debts" field="otherDebts" helpText="Personal loans, etc." />
                </div>
              </div>
            )}

            {/* Cash Flow Section */}
            {activeSection === 'cashflow' && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <h3 className="font-semibold text-green-900 mb-1">Cash Flow</h3>
                  <p className="text-green-700 text-sm">Your income and expenses</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <InputField label="Annual Income (Client)" field="annualIncome" helpText="Your yearly gross income" />
                  <InputField label="Spouse Income (Annual)" field="spouseIncome" helpText="Spouse's yearly gross income" />
                  <InputField label="Monthly Expenses" field="monthlyExpenses" helpText="Total monthly living expenses" />
                </div>
              </div>
            )}

            {/* Net Worth Summary */}
            <div className="mt-6 bg-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-medium">Net Worth</span>
                <span className={`text-2xl font-bold ${netWorth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(netWorth)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
