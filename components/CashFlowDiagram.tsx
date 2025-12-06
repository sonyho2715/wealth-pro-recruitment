'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  Home,
  CreditCard,
  TrendingUp,
  PiggyBank,
  Briefcase,
  ArrowRight,
  ArrowDown,
  Play,
  Pause,
  RotateCcw,
  Wallet,
  Receipt,
  Car,
  Utensils,
  Zap,
  Baby,
  Film,
  MoreHorizontal
} from 'lucide-react';

interface ExpenseBreakdown {
  housing?: number;
  utilities?: number;
  food?: number;
  transportation?: number;
  insurance?: number;
  childcare?: number;
  entertainment?: number;
  debtPayments?: number;
  other?: number;
}

interface CashFlowDiagramProps {
  annualIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  expenseBreakdown?: ExpenseBreakdown;
  growthStocksAllocation?: number;
  balancedAllocation?: number;
  fixedIncomeAllocation?: number;
  taxRate?: number;
}

export default function CashFlowDiagram({
  annualIncome,
  monthlyExpenses,
  monthlySavings,
  expenseBreakdown,
  growthStocksAllocation = 30,
  balancedAllocation = 40,
  fixedIncomeAllocation = 30,
  taxRate = 27,
}: CashFlowDiagramProps) {
  const [animationStep, setAnimationStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showExpenseDetails, setShowExpenseDetails] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const monthlyIncome = annualIncome / 12;
  const monthlyTaxes = (annualIncome * (taxRate / 100)) / 12;
  const monthlyNetIncome = monthlyIncome - monthlyTaxes;
  const annualSavings = monthlySavings * 12;
  const growthAmount = Math.round(annualSavings * (growthStocksAllocation / 100));
  const balancedAmount = Math.round(annualSavings * (balancedAllocation / 100));
  const fixedAmount = annualSavings - growthAmount - balancedAmount;

  // Calculate expense breakdown percentages
  const totalExpenses = monthlyExpenses;
  const getExpensePercent = (amount: number) => Math.round((amount / totalExpenses) * 100);

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setAnimationStep((prev) => {
          if (prev >= 5) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPlaying]);

  const resetAnimation = () => {
    setAnimationStep(0);
    setIsPlaying(false);
  };

  const playAnimation = () => {
    if (animationStep >= 5) {
      setAnimationStep(0);
    }
    setIsPlaying(true);
  };

  const getFlowClass = (step: number) => {
    if (animationStep >= step) {
      return 'opacity-100 translate-y-0';
    }
    return 'opacity-0 -translate-y-4';
  };

  const getArrowClass = (step: number) => {
    if (animationStep >= step) {
      return 'text-teal-500';
    }
    return 'text-slate-300';
  };

  const expenseCategories = [
    { key: 'housing', label: 'Housing', icon: Home, color: 'bg-blue-500' },
    { key: 'utilities', label: 'Utilities', icon: Zap, color: 'bg-yellow-500' },
    { key: 'food', label: 'Food', icon: Utensils, color: 'bg-orange-500' },
    { key: 'transportation', label: 'Transport', icon: Car, color: 'bg-purple-500' },
    { key: 'insurance', label: 'Insurance', icon: Receipt, color: 'bg-teal-500' },
    { key: 'childcare', label: 'Childcare', icon: Baby, color: 'bg-pink-500' },
    { key: 'entertainment', label: 'Entertainment', icon: Film, color: 'bg-indigo-500' },
    { key: 'debtPayments', label: 'Debt', icon: CreditCard, color: 'bg-red-500' },
    { key: 'other', label: 'Other', icon: MoreHorizontal, color: 'bg-slate-500' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Cash Flow Analysis</h2>
              <p className="text-teal-100 text-sm">How your money flows each month</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetAnimation}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={isPlaying ? () => setIsPlaying(false) : playAnimation}
              className="flex items-center gap-2 bg-white text-teal-600 px-4 py-2 rounded-xl font-medium hover:bg-teal-50 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play Animation'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Flow Diagram - Vertical Layout */}
        <div className="max-w-lg mx-auto space-y-4">

          {/* Step 0: Gross Income */}
          <div className={`transition-all duration-500 ${getFlowClass(0)}`}>
            <div className="bg-green-100 border-2 border-green-400 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-200 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-700" />
                  </div>
                  <div>
                    <div className="text-green-700 text-sm font-medium">Gross Income</div>
                    <div className="text-xs text-green-600">Before taxes</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-800">{formatCurrency(monthlyIncome)}</div>
                  <div className="text-xs text-green-600">/month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className={`flex justify-center transition-colors duration-300 ${getArrowClass(1)}`}>
            <ArrowDown className="w-6 h-6" />
          </div>

          {/* Step 1: Taxes */}
          <div className={`transition-all duration-500 ${getFlowClass(1)}`}>
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Receipt className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <div className="text-amber-700 text-sm font-medium">Federal & State Taxes</div>
                    <div className="text-xs text-amber-600">{taxRate}% effective rate</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-amber-800">-{formatCurrency(monthlyTaxes)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className={`flex justify-center transition-colors duration-300 ${getArrowClass(2)}`}>
            <ArrowDown className="w-6 h-6" />
          </div>

          {/* Step 2: Net Income (Take-Home) */}
          <div className={`transition-all duration-500 ${getFlowClass(2)}`}>
            <div className="bg-blue-100 border-2 border-blue-400 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <Wallet className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <div className="text-blue-700 text-sm font-medium">Take-Home Pay</div>
                    <div className="text-xs text-blue-600">After taxes</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-800">{formatCurrency(monthlyNetIncome)}</div>
                  <div className="text-xs text-blue-600">/month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Split into two paths */}
          <div className={`flex justify-center gap-8 transition-colors duration-300 ${getArrowClass(3)}`}>
            <div className="flex flex-col items-center">
              <ArrowDown className="w-5 h-5 text-red-400" />
              <span className="text-xs text-red-500 mt-1">Expenses</span>
            </div>
            <div className="flex flex-col items-center">
              <ArrowDown className="w-5 h-5 text-emerald-500" />
              <span className="text-xs text-emerald-600 mt-1">Savings</span>
            </div>
          </div>

          {/* Step 3: Split - Expenses and Savings */}
          <div className={`grid grid-cols-2 gap-4 transition-all duration-500 ${getFlowClass(3)}`}>
            {/* Expenses */}
            <div
              className="bg-red-50 border-2 border-red-300 rounded-xl p-4 cursor-pointer hover:bg-red-100 transition-colors"
              onClick={() => setShowExpenseDetails(!showExpenseDetails)}
            >
              <div className="flex items-center gap-2 text-red-700 text-sm font-medium mb-2">
                <CreditCard className="w-4 h-4" />
                <span>Living Expenses</span>
              </div>
              <div className="text-xl font-bold text-red-800">{formatCurrency(monthlyExpenses)}</div>
              <div className="text-xs text-red-600 mt-1">Click for breakdown</div>
            </div>

            {/* Savings */}
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium mb-2">
                <PiggyBank className="w-4 h-4" />
                <span>Monthly Savings</span>
              </div>
              <div className="text-xl font-bold text-emerald-800">{formatCurrency(monthlySavings)}</div>
              <div className="text-xs text-emerald-600 mt-1">{Math.round((monthlySavings / monthlyNetIncome) * 100)}% savings rate</div>
            </div>
          </div>

          {/* Expense Breakdown (collapsible) */}
          {showExpenseDetails && expenseBreakdown && (
            <div className={`bg-slate-50 border border-slate-200 rounded-xl p-4 transition-all duration-500 ${getFlowClass(3)}`}>
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Expense Breakdown</h4>
              <div className="space-y-2">
                {expenseCategories.map(({ key, label, icon: Icon, color }) => {
                  const amount = expenseBreakdown[key as keyof ExpenseBreakdown] || 0;
                  if (amount === 0) return null;
                  const percent = getExpensePercent(amount);
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-slate-500" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">{label}</span>
                          <span className="font-medium text-slate-800">{formatCurrency(amount)}</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full mt-1">
                          <div
                            className={`h-full ${color} rounded-full transition-all duration-500`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 w-10 text-right">{percent}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Arrow to investments */}
          <div className={`flex justify-center transition-colors duration-300 ${getArrowClass(4)}`}>
            <div className="flex flex-col items-center">
              <ArrowDown className="w-6 h-6" />
              <span className="text-xs text-slate-500 mt-1">Wealth Building</span>
            </div>
          </div>

          {/* Step 4: Investment Allocation */}
          <div className={`transition-all duration-500 ${getFlowClass(4)}`}>
            <div className="bg-slate-100 border-2 border-slate-300 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-700 text-sm font-medium mb-4">
                <Briefcase className="w-4 h-4" />
                <span>Annual Investment Allocation</span>
                <span className="ml-auto font-bold">{formatCurrency(annualSavings)}/yr</span>
              </div>

              {/* Allocation bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-amber-700 font-medium">Fixed Income</span>
                    <span className="text-amber-800 font-bold">{formatCurrency(fixedAmount)}</span>
                  </div>
                  <div className="h-3 bg-amber-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                      style={{ width: `${fixedIncomeAllocation}%` }}
                    />
                  </div>
                  <div className="text-xs text-amber-600 mt-0.5">{fixedIncomeAllocation}% - Bonds, CDs, Money Market</div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-blue-700 font-medium">Balanced/Income</span>
                    <span className="text-blue-800 font-bold">{formatCurrency(balancedAmount)}</span>
                  </div>
                  <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                      style={{ width: `${balancedAllocation}%` }}
                    />
                  </div>
                  <div className="text-xs text-blue-600 mt-0.5">{balancedAllocation}% - Dividend Stocks, REITs</div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-700 font-medium">Growth Stocks</span>
                    <span className="text-green-800 font-bold">{formatCurrency(growthAmount)}</span>
                  </div>
                  <div className="h-3 bg-green-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-1000"
                      style={{ width: `${growthStocksAllocation}%` }}
                    />
                  </div>
                  <div className="text-xs text-green-600 mt-0.5">{growthStocksAllocation}% - Index Funds, Growth ETFs</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-sm text-green-600 mb-1">Gross Income</div>
              <div className="text-lg font-bold text-green-700">{formatCurrency(annualIncome)}/yr</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <div className="text-sm text-amber-600 mb-1">Est. Taxes</div>
              <div className="text-lg font-bold text-amber-700">{formatCurrency(monthlyTaxes * 12)}/yr</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <div className="text-sm text-red-600 mb-1">Total Expenses</div>
              <div className="text-lg font-bold text-red-700">{formatCurrency(monthlyExpenses * 12)}/yr</div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <div className="text-sm text-emerald-600 mb-1">Total Savings</div>
              <div className="text-lg font-bold text-emerald-700">{formatCurrency(annualSavings)}/yr</div>
            </div>
          </div>

          {/* Savings Rate Indicator */}
          <div className="mt-4 bg-gradient-to-r from-red-100 via-yellow-100 to-green-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Savings Rate</span>
              <span className={`text-lg font-bold ${
                (annualSavings / annualIncome) >= 0.20 ? 'text-green-600' :
                (annualSavings / annualIncome) >= 0.10 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {Math.round((annualSavings / annualIncome) * 100)}%
              </span>
            </div>
            <div className="relative h-3 bg-white rounded-full">
              <div
                className={`absolute h-full rounded-full transition-all duration-500 ${
                  (annualSavings / annualIncome) >= 0.20 ? 'bg-green-500' :
                  (annualSavings / annualIncome) >= 0.10 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((annualSavings / annualIncome) * 100, 100)}%` }}
              />
              <div className="absolute top-1/2 left-[10%] -translate-y-1/2 w-0.5 h-4 bg-slate-300" title="10% minimum" />
              <div className="absolute top-1/2 left-[20%] -translate-y-1/2 w-0.5 h-4 bg-slate-300" title="20% target" />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0%</span>
              <span>10% min</span>
              <span>20% target</span>
              <span>30%+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
