'use client';

import { Shield, Briefcase, Home, PiggyBank, TrendingUp, Building2, Car, CreditCard, Receipt, Landmark, DollarSign, Heart, FileText, Skull } from 'lucide-react';

interface BalanceSheetData {
  // Protection
  protection: {
    liability: number;        // If you are sued
    disabilityMonthly: number; // If you get sick (monthly)
    hospitalDaily: number;    // Hospital daily benefit
    hasWill: boolean;
    hasTrust: boolean;
    lifeInsuranceClient: number;  // If you die - client
    lifeInsuranceSpouse: number;  // If you die - spouse
  };

  // Assets
  assets: {
    personalProperty: number;
    savings: number;
    investments: number;
    retirement: number;
    realEstate: number;
    business: number;
  };

  // Liabilities
  liabilities: {
    shortTerm: number;
    taxes: number;
    mortgages: number;
    businessDebt: number;
  };

  // Cash Flow
  cashFlow: {
    annualIncome: number;
    insuranceCosts: number;
    annualSavings: number;
    debtAndTaxCosts: number;
  };
}

interface FinancialSnapshotProps {
  data: BalanceSheetData;
  clientName?: string;
}

export default function FinancialSnapshot({ data, clientName }: FinancialSnapshotProps) {
  // Calculate totals
  const totalAssets =
    data.assets.personalProperty +
    data.assets.savings +
    data.assets.investments +
    data.assets.retirement +
    data.assets.realEstate +
    data.assets.business;

  const totalLiabilities =
    data.liabilities.shortTerm +
    data.liabilities.taxes +
    data.liabilities.mortgages +
    data.liabilities.businessDebt;

  const netWorth = totalAssets - totalLiabilities;

  const lifestyleRemaining =
    data.cashFlow.annualIncome -
    data.cashFlow.insuranceCosts -
    data.cashFlow.annualSavings -
    data.cashFlow.debtAndTaxCosts;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatShortCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 p-4">
      {/* Header */}
      {clientName && (
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Financial Snapshot</h2>
          <p className="text-slate-600">{clientName}</p>
        </div>
      )}

      {/* PROTECTION SECTION */}
      <div className="rounded-xl overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-3">
          <div className="flex items-center gap-2 text-amber-900">
            <Shield className="w-5 h-5" />
            <h3 className="font-bold text-lg tracking-wide">PROTECTION</h3>
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-100 to-yellow-100 grid grid-cols-2 md:grid-cols-4 divide-x divide-amber-300">
          <div className="p-4 text-center">
            <div className="text-xs text-amber-800 font-medium mb-1">If you are sued</div>
            <div className="text-lg font-bold text-amber-900">{formatShortCurrency(data.protection.liability)}</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-xs text-amber-800 font-medium mb-1">If you get sick</div>
            <div className="text-lg font-bold text-amber-900">
              D-{formatShortCurrency(data.protection.disabilityMonthly)} / H-{formatShortCurrency(data.protection.hospitalDaily)}
            </div>
          </div>
          <div className="p-4 text-center">
            <div className="text-xs text-amber-800 font-medium mb-1">In your will</div>
            <div className="text-lg font-bold text-amber-900">
              Wills-{data.protection.hasWill ? 'Y' : 'N'} / Trusts-{data.protection.hasTrust ? 'Y' : 'N'}
            </div>
          </div>
          <div className="p-4 text-center">
            <div className="text-xs text-amber-800 font-medium mb-1">If you die</div>
            <div className="text-lg font-bold text-amber-900">
              C-{formatShortCurrency(data.protection.lifeInsuranceClient)} / S-{formatShortCurrency(data.protection.lifeInsuranceSpouse)}
            </div>
          </div>
        </div>
      </div>

      {/* ASSETS & LIABILITIES SECTION */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* ASSETS */}
        <div className="rounded-xl overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3">
            <div className="flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5" />
              <h3 className="font-bold text-lg tracking-wide">ASSETS</h3>
            </div>
          </div>
          <div className="bg-gradient-to-b from-indigo-50 to-blue-50">
            {[
              { label: 'Personal Property', value: data.assets.personalProperty, icon: Car },
              { label: 'Savings', value: data.assets.savings, icon: PiggyBank },
              { label: 'Investments', value: data.assets.investments, icon: TrendingUp },
              { label: 'Retirement', value: data.assets.retirement, icon: Landmark },
              { label: 'Real Estate', value: data.assets.realEstate, icon: Home },
              { label: 'Business', value: data.assets.business, icon: Building2 },
            ].map((item, index) => (
              <div
                key={item.label}
                className={`flex items-center justify-between px-4 py-3 ${
                  index % 2 === 0 ? 'bg-indigo-600/10' : 'bg-blue-600/5'
                }`}
              >
                <div className="flex items-center gap-2 text-indigo-900">
                  <item.icon className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <span className="font-bold text-indigo-900">{formatCurrency(item.value)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-4 py-4 bg-indigo-600 text-white">
              <span className="font-bold">Total</span>
              <span className="font-bold text-xl">{formatCurrency(totalAssets)}</span>
            </div>
          </div>
        </div>

        {/* LIABILITIES */}
        <div className="rounded-xl overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-rose-600 to-red-600 px-4 py-3">
            <div className="flex items-center gap-2 text-white">
              <CreditCard className="w-5 h-5" />
              <h3 className="font-bold text-lg tracking-wide">LIABILITIES</h3>
            </div>
          </div>
          <div className="bg-gradient-to-b from-rose-50 to-red-50">
            {[
              { label: 'Short Term', value: data.liabilities.shortTerm, icon: CreditCard },
              { label: 'Taxes', value: data.liabilities.taxes, icon: Receipt },
              { label: 'Mortgages', value: data.liabilities.mortgages, icon: Home },
              { label: 'Business Debt', value: data.liabilities.businessDebt, icon: Briefcase },
            ].map((item, index) => (
              <div
                key={item.label}
                className={`flex items-center justify-between px-4 py-3 ${
                  index % 2 === 0 ? 'bg-rose-600/10' : 'bg-red-600/5'
                }`}
              >
                <div className="flex items-center gap-2 text-rose-900">
                  <item.icon className="w-4 h-4 text-rose-600" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <span className="font-bold text-rose-900">{formatCurrency(item.value)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-4 py-4 bg-rose-600 text-white">
              <span className="font-bold">Total</span>
              <span className="font-bold text-xl">{formatCurrency(totalLiabilities)}</span>
            </div>
          </div>

          {/* NET WORTH */}
          <div className="bg-slate-800 px-4 py-4 text-center">
            <div className="text-slate-400 text-sm font-medium mb-1">NET WORTH</div>
            <div className={`text-3xl font-bold ${netWorth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(netWorth)}
            </div>
          </div>
        </div>
      </div>

      {/* CASH FLOW SECTION */}
      <div className="rounded-xl overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3">
          <div className="flex items-center gap-2 text-white">
            <DollarSign className="w-5 h-5" />
            <h3 className="font-bold text-lg tracking-wide">CASH FLOW</h3>
          </div>
        </div>
        <div className="bg-gradient-to-r from-emerald-100 to-teal-100 grid grid-cols-2 md:grid-cols-5 divide-x divide-emerald-300">
          <div className="p-4 text-center">
            <div className="text-xs text-emerald-800 font-medium mb-1">What you earn</div>
            <div className="text-lg font-bold text-emerald-900">{formatCurrency(data.cashFlow.annualIncome)}</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-xs text-emerald-800 font-medium mb-1">Your insurance costs</div>
            <div className="text-lg font-bold text-emerald-900">{formatCurrency(data.cashFlow.insuranceCosts)}</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-xs text-emerald-800 font-medium mb-1">Your annual savings</div>
            <div className="text-lg font-bold text-emerald-900">{formatCurrency(data.cashFlow.annualSavings)}</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-xs text-emerald-800 font-medium mb-1">Your debt and tax costs</div>
            <div className="text-lg font-bold text-emerald-900">{formatCurrency(data.cashFlow.debtAndTaxCosts)}</div>
          </div>
          <div className="p-4 text-center bg-emerald-600/20">
            <div className="text-xs text-emerald-800 font-medium mb-1">What's left for lifestyle</div>
            <div className="text-lg font-bold text-emerald-900">{formatCurrency(lifestyleRemaining)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export sample data for testing
export const sampleBalanceSheetData: BalanceSheetData = {
  protection: {
    liability: 3000000,
    disabilityMonthly: 7000,
    hospitalDaily: 0,
    hasWill: true,
    hasTrust: true,
    lifeInsuranceClient: 850000,
    lifeInsuranceSpouse: 750000,
  },
  assets: {
    personalProperty: 90000,
    savings: 65207,
    investments: 150000,
    retirement: 275700,
    realEstate: 600000,
    business: 500000,
  },
  liabilities: {
    shortTerm: 17000,
    taxes: 96495,
    mortgages: 350000,
    businessDebt: 0,
  },
  cashFlow: {
    annualIncome: 206000,
    insuranceCosts: 7000,
    annualSavings: 16000,
    debtAndTaxCosts: 90000,
  },
};
