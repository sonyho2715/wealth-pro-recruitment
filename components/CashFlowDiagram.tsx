'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Home, CreditCard, TrendingUp, PiggyBank, Briefcase, ArrowRight, Play, Pause, RotateCcw } from 'lucide-react';

interface CashFlowDiagramProps {
  annualIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  growthStocksAllocation?: number; // percentage
  balancedAllocation?: number; // percentage
  fixedIncomeAllocation?: number; // percentage
}

export default function CashFlowDiagram({
  annualIncome,
  monthlyExpenses,
  monthlySavings,
  growthStocksAllocation = 30,
  balancedAllocation = 40,
  fixedIncomeAllocation = 30,
}: CashFlowDiagramProps) {
  const [animationStep, setAnimationStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const annualSavings = monthlySavings * 12;
  const growthAmount = Math.round(annualSavings * (growthStocksAllocation / 100));
  const balancedAmount = Math.round(annualSavings * (balancedAllocation / 100));
  const fixedAmount = annualSavings - growthAmount - balancedAmount;

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setAnimationStep((prev) => {
          if (prev >= 4) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
      return () => clearInterval(timer);
    }
  }, [isPlaying]);

  const resetAnimation = () => {
    setAnimationStep(0);
    setIsPlaying(false);
  };

  const playAnimation = () => {
    if (animationStep >= 4) {
      setAnimationStep(0);
    }
    setIsPlaying(true);
  };

  // Flow line animation classes
  const getFlowClass = (step: number) => {
    if (animationStep >= step) {
      return 'opacity-100 scale-100';
    }
    return 'opacity-0 scale-95';
  };

  const getArrowClass = (step: number) => {
    if (animationStep >= step) {
      return 'text-green-500 animate-pulse';
    }
    return 'text-slate-300';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Cash Flow Allocation</h2>
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
        {/* Flow Diagram */}
        <div className="relative min-h-[400px]">
          {/* Income Box - Step 0 */}
          <div className={`absolute left-0 top-0 transition-all duration-500 ${getFlowClass(0)}`}>
            <div className="bg-green-100 border-2 border-green-400 rounded-xl p-4 w-48">
              <div className="flex items-center gap-2 text-green-700 text-sm font-medium mb-1">
                <DollarSign className="w-4 h-4" />
                What you earn
              </div>
              <div className="text-2xl font-bold text-green-800">{formatCurrency(annualIncome)}</div>
            </div>
          </div>

          {/* Arrow from Income to Checking */}
          <div className={`absolute left-[200px] top-[30px] transition-all duration-300 ${getArrowClass(1)}`}>
            <div className="flex items-center">
              <div className="w-12 h-0.5 bg-current" />
              <ArrowRight className="w-5 h-5 -ml-1" />
            </div>
          </div>

          {/* Household Checking - Step 1 */}
          <div className={`absolute left-[260px] top-0 transition-all duration-500 ${getFlowClass(1)}`}>
            <div className="bg-blue-100 border-2 border-blue-400 rounded-xl p-4 w-48">
              <div className="flex items-center gap-2 text-blue-700 text-sm font-medium mb-1">
                <Home className="w-4 h-4" />
                Household Checking
              </div>
              <div className="text-lg font-bold text-blue-800">{formatCurrency(annualIncome / 12)}/mo</div>
            </div>
          </div>

          {/* Arrow from Checking to Expenses */}
          <div className={`absolute left-[335px] top-[75px] transition-all duration-300 ${getArrowClass(2)}`}>
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-12 bg-current" />
              <ArrowRight className="w-5 h-5 rotate-90 -mt-1" />
            </div>
          </div>

          {/* Expenses Box - Step 2 */}
          <div className={`absolute left-[260px] top-[140px] transition-all duration-500 ${getFlowClass(2)}`}>
            <div className="bg-red-100 border-2 border-red-400 rounded-xl p-4 w-48">
              <div className="flex items-center gap-2 text-red-700 text-sm font-medium mb-1">
                <CreditCard className="w-4 h-4" />
                Expenses
              </div>
              <div className="text-lg font-bold text-red-800">{formatCurrency(monthlyExpenses)}/mo</div>
            </div>
          </div>

          {/* What you save - Step 2 */}
          <div className={`absolute left-[130px] top-[100px] transition-all duration-500 ${getFlowClass(2)}`}>
            <div className="bg-emerald-50 border border-emerald-300 rounded-lg px-3 py-2">
              <div className="text-xs text-emerald-600 font-medium">What you save</div>
              <div className="text-lg font-bold text-emerald-700">{formatCurrency(annualSavings)}/yr</div>
            </div>
          </div>

          {/* Arrow to Wealth Building Account */}
          <div className={`absolute left-[215px] top-[125px] transition-all duration-300 ${getArrowClass(3)}`}>
            <div className="flex items-center">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          {/* Wealth Building Account - Step 3 */}
          <div className={`absolute left-[130px] top-[170px] transition-all duration-500 ${getFlowClass(3)}`}>
            <div className="bg-slate-100 border-2 border-slate-400 rounded-xl p-3 w-40 text-center">
              <div className="text-slate-700 text-xs font-medium">Wealth Building</div>
              <div className="text-slate-800 text-sm font-bold">Account</div>
            </div>
          </div>

          {/* Arrows to Investment Buckets */}
          <div className={`absolute left-[200px] top-[220px] transition-all duration-300 ${getArrowClass(4)}`}>
            <svg width="320" height="120" className="overflow-visible">
              {/* Arrow to Growth Stocks */}
              <path
                d="M 0,0 L 0,30 L 100,30 L 100,60"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-green-500"
              />
              <polygon points="95,55 100,65 105,55" fill="currentColor" className="text-green-500" />

              {/* Arrow to Balanced */}
              <path
                d="M 0,0 L 0,60"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-blue-500"
              />
              <polygon points="-5,55 0,65 5,55" fill="currentColor" className="text-blue-500" />

              {/* Arrow to Fixed Income */}
              <path
                d="M 0,0 L 0,30 L -100,30 L -100,60"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-amber-500"
              />
              <polygon points="-105,55 -100,65 -95,55" fill="currentColor" className="text-amber-500" />
            </svg>
          </div>

          {/* Investment Buckets - Step 4 */}
          <div className={`absolute left-[0px] top-[290px] transition-all duration-500 ${getFlowClass(4)}`}>
            <div className="bg-amber-100 border-2 border-amber-400 rounded-xl p-4 w-44">
              <div className="flex items-center gap-2 text-amber-700 text-sm font-medium mb-1">
                <PiggyBank className="w-4 h-4" />
                Fixed Income
              </div>
              <div className="text-xl font-bold text-amber-800">{formatCurrency(fixedAmount)}</div>
              <div className="text-xs text-amber-600">{fixedIncomeAllocation}% allocation</div>
            </div>
          </div>

          <div className={`absolute left-[160px] top-[290px] transition-all duration-500 delay-100 ${getFlowClass(4)}`}>
            <div className="bg-blue-100 border-2 border-blue-400 rounded-xl p-4 w-44">
              <div className="flex items-center gap-2 text-blue-700 text-sm font-medium mb-1">
                <Briefcase className="w-4 h-4" />
                Balanced/Income
              </div>
              <div className="text-xl font-bold text-blue-800">{formatCurrency(balancedAmount)}</div>
              <div className="text-xs text-blue-600">{balancedAllocation}% allocation</div>
            </div>
          </div>

          <div className={`absolute left-[320px] top-[290px] transition-all duration-500 delay-200 ${getFlowClass(4)}`}>
            <div className="bg-green-100 border-2 border-green-400 rounded-xl p-4 w-44">
              <div className="flex items-center gap-2 text-green-700 text-sm font-medium mb-1">
                <TrendingUp className="w-4 h-4" />
                Growth Stocks
              </div>
              <div className="text-xl font-bold text-green-800">{formatCurrency(growthAmount)}</div>
              <div className="text-xs text-green-600">{growthStocksAllocation}% allocation</div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm text-slate-500">Annual Income</div>
              <div className="text-lg font-bold text-green-600">{formatCurrency(annualIncome)}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Annual Expenses</div>
              <div className="text-lg font-bold text-red-600">{formatCurrency(monthlyExpenses * 12)}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Annual Savings</div>
              <div className="text-lg font-bold text-emerald-600">{formatCurrency(annualSavings)}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Savings Rate</div>
              <div className="text-lg font-bold text-blue-600">
                {Math.round((annualSavings / annualIncome) * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
