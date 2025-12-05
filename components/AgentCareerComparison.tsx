'use client';

import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Play, Pause, RotateCcw, Users, DollarSign, Calendar, ArrowRight, Sparkles } from 'lucide-react';

interface AgentCareerComparisonProps {
  currentAge: number;
  retirementAge: number;
  currentIncome: number;
  currentSavings: number;
  monthlySavingsRate: number;
  agentYear1Income: number;
  agentYear5Income: number;
}

interface YearlyData {
  age: number;
  year: number;
  currentIncome: number;
  currentNetWorth: number;
  agentIncome: number;
  agentTotalIncome: number;
  agentNetWorth: number;
}

export default function AgentCareerComparison({
  currentAge,
  retirementAge,
  currentIncome,
  currentSavings,
  monthlySavingsRate,
  agentYear1Income,
  agentYear5Income,
}: AgentCareerComparisonProps) {
  const [currentYear, setCurrentYear] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<'netWorth' | 'income' | 'death'>('netWorth');

  const yearsToRetirement = retirementAge - currentAge;
  const annualReturn = 0.07; // 7% annual return
  const annualRaise = 0.03; // 3% annual raise

  // Calculate projections
  const projections = useMemo((): YearlyData[] => {
    const data: YearlyData[] = [];
    let currentNetWorth = currentSavings;
    let agentNetWorth = currentSavings;
    let baseIncome = currentIncome;

    for (let year = 0; year <= yearsToRetirement; year++) {
      const age = currentAge + year;
      const yearIncome = baseIncome * Math.pow(1 + annualRaise, year);

      // Current path
      const currentMonthlySavings = monthlySavingsRate;
      currentNetWorth = currentNetWorth * (1 + annualReturn) + currentMonthlySavings * 12;

      // Agent path - income grows from year1 to year5, then 5% growth
      let agentIncome = 0;
      if (year < 5) {
        const progress = year / 4;
        agentIncome = agentYear1Income + (agentYear5Income - agentYear1Income) * progress;
      } else {
        agentIncome = agentYear5Income * Math.pow(1.05, year - 4);
      }

      const totalAgentIncome = yearIncome + agentIncome;
      const agentMonthlySavings = monthlySavingsRate + (agentIncome * 0.3) / 12; // Save 30% of agent income
      agentNetWorth = agentNetWorth * (1 + annualReturn) + agentMonthlySavings * 12;

      data.push({
        age,
        year,
        currentIncome: Math.round(yearIncome),
        currentNetWorth: Math.round(currentNetWorth),
        agentIncome: Math.round(agentIncome),
        agentTotalIncome: Math.round(totalAgentIncome),
        agentNetWorth: Math.round(agentNetWorth),
      });
    }

    return data;
  }, [currentAge, yearsToRetirement, currentIncome, currentSavings, monthlySavingsRate, agentYear1Income, agentYear5Income]);

  // Animation
  useEffect(() => {
    if (isPlaying && currentYear < yearsToRetirement) {
      const timer = setTimeout(() => {
        setCurrentYear((prev) => prev + 1);
      }, 300);
      return () => clearTimeout(timer);
    } else if (currentYear >= yearsToRetirement) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentYear, yearsToRetirement]);

  const currentData = projections[currentYear] || projections[0];
  const finalData = projections[projections.length - 1];

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatFullCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate totals
  const totalCurrentIncome = projections.reduce((sum, p) => sum + p.currentIncome, 0);
  const totalAgentIncome = projections.reduce((sum, p) => sum + p.agentTotalIncome, 0);
  const additionalIncome = totalAgentIncome - totalCurrentIncome;
  const additionalNetWorth = finalData.agentNetWorth - finalData.currentNetWorth;

  // Get max value for chart scaling
  const maxNetWorth = Math.max(...projections.map(p => Math.max(p.currentNetWorth, p.agentNetWorth)));
  const maxIncome = Math.max(...projections.map(p => Math.max(p.currentIncome, p.agentTotalIncome)));

  const getBarHeight = (value: number, max: number) => {
    return `${(value / max) * 100}%`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Career Path Comparison</h2>
              <p className="text-indigo-200 text-sm">Current Path vs. Joining as an Agent</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setCurrentYear(0); setIsPlaying(false); }}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
              title="Reset"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-xl font-medium hover:bg-indigo-50 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play Timeline'}
            </button>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="px-6 pt-4">
        <div className="inline-flex bg-slate-100 rounded-xl p-1">
          {[
            { id: 'netWorth', label: 'Net Worth Lifetime' },
            { id: 'income', label: 'Annual Income' },
            { id: 'death', label: 'Value at Death' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as typeof viewMode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === mode.id
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Timeline Slider */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Age {currentAge}</span>
            <span className="text-lg font-bold text-slate-800">
              Current Age: {currentData.age}
            </span>
            <span className="text-sm text-slate-500">Age {retirementAge}</span>
          </div>
          <input
            type="range"
            min="0"
            max={yearsToRetirement}
            value={currentYear}
            onChange={(e) => { setCurrentYear(parseInt(e.target.value)); setIsPlaying(false); }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        {/* Comparison Charts */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Current Path */}
          <div>
            <h3 className="text-center font-semibold text-slate-600 mb-4">Current Path</h3>
            <div className="h-64 flex items-end justify-center gap-1 bg-red-50 rounded-xl p-4">
              {projections.slice(0, currentYear + 1).map((p, i) => (
                <div
                  key={i}
                  className="flex-1 max-w-3 bg-red-400 rounded-t transition-all duration-300"
                  style={{
                    height: getBarHeight(
                      viewMode === 'netWorth' ? p.currentNetWorth :
                      viewMode === 'income' ? p.currentIncome : p.currentNetWorth,
                      viewMode === 'netWorth' ? maxNetWorth :
                      viewMode === 'income' ? maxIncome : maxNetWorth
                    )
                  }}
                  title={`Age ${p.age}: ${formatFullCurrency(viewMode === 'income' ? p.currentIncome : p.currentNetWorth)}`}
                />
              ))}
            </div>
            <div className="mt-4 text-center">
              <div className="text-sm text-slate-500">
                {viewMode === 'netWorth' ? 'Net Worth' : viewMode === 'income' ? 'Annual Income' : 'Estate Value'}
              </div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(
                  viewMode === 'income' ? currentData.currentIncome : currentData.currentNetWorth
                )}
              </div>
            </div>
          </div>

          {/* Agent Path */}
          <div>
            <h3 className="text-center font-semibold text-slate-600 mb-4">With Agent Career</h3>
            <div className="h-64 flex items-end justify-center gap-1 bg-green-50 rounded-xl p-4">
              {projections.slice(0, currentYear + 1).map((p, i) => (
                <div
                  key={i}
                  className="flex-1 max-w-3 bg-green-500 rounded-t transition-all duration-300"
                  style={{
                    height: getBarHeight(
                      viewMode === 'netWorth' ? p.agentNetWorth :
                      viewMode === 'income' ? p.agentTotalIncome : p.agentNetWorth,
                      viewMode === 'netWorth' ? maxNetWorth :
                      viewMode === 'income' ? maxIncome : maxNetWorth
                    )
                  }}
                  title={`Age ${p.age}: ${formatFullCurrency(viewMode === 'income' ? p.agentTotalIncome : p.agentNetWorth)}`}
                />
              ))}
            </div>
            <div className="mt-4 text-center">
              <div className="text-sm text-slate-500">
                {viewMode === 'netWorth' ? 'Net Worth' : viewMode === 'income' ? 'Annual Income' : 'Estate Value'}
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  viewMode === 'income' ? currentData.agentTotalIncome : currentData.agentNetWorth
                )}
              </div>
              {viewMode === 'income' && currentData.agentIncome > 0 && (
                <div className="text-sm text-green-500 mt-1">
                  +{formatCurrency(currentData.agentIncome)} from agent income
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Comparison Table */}
        <div className="mt-8 bg-slate-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">
            Accumulation Summary ({yearsToRetirement} Years)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-slate-600 font-medium"></th>
                  <th className="text-right py-3 px-4 text-red-600 font-semibold">Current Path</th>
                  <th className="text-right py-3 px-4 text-green-600 font-semibold">With Agent Career</th>
                  <th className="text-right py-3 px-4 text-indigo-600 font-semibold">Difference</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-3 px-4 text-slate-700">Total Lifetime Income</td>
                  <td className="py-3 px-4 text-right font-medium">{formatFullCurrency(totalCurrentIncome)}</td>
                  <td className="py-3 px-4 text-right font-medium">{formatFullCurrency(totalAgentIncome)}</td>
                  <td className="py-3 px-4 text-right font-bold text-green-600">+{formatFullCurrency(additionalIncome)}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-3 px-4 text-slate-700">Net Worth at {retirementAge}</td>
                  <td className="py-3 px-4 text-right font-medium">{formatFullCurrency(finalData.currentNetWorth)}</td>
                  <td className="py-3 px-4 text-right font-medium">{formatFullCurrency(finalData.agentNetWorth)}</td>
                  <td className="py-3 px-4 text-right font-bold text-green-600">+{formatFullCurrency(additionalNetWorth)}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-3 px-4 text-slate-700">Agent Income (Year 1)</td>
                  <td className="py-3 px-4 text-right text-slate-400">$0</td>
                  <td className="py-3 px-4 text-right font-medium">{formatFullCurrency(agentYear1Income)}</td>
                  <td className="py-3 px-4 text-right font-bold text-green-600">+{formatFullCurrency(agentYear1Income)}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-3 px-4 text-slate-700">Agent Income (Year 5)</td>
                  <td className="py-3 px-4 text-right text-slate-400">$0</td>
                  <td className="py-3 px-4 text-right font-medium">{formatFullCurrency(agentYear5Income)}</td>
                  <td className="py-3 px-4 text-right font-bold text-green-600">+{formatFullCurrency(agentYear5Income)}</td>
                </tr>
                <tr className="bg-indigo-50">
                  <td className="py-4 px-4 font-semibold text-slate-800">Total Additional Value</td>
                  <td className="py-4 px-4"></td>
                  <td className="py-4 px-4"></td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-2xl font-bold text-green-600">{formatFullCurrency(additionalIncome + additionalNetWorth)}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 text-center text-white">
          <Sparkles className="w-8 h-8 mx-auto mb-3 text-yellow-300" />
          <h4 className="text-xl font-bold mb-2">Ready to Build Your Future?</h4>
          <p className="text-indigo-100 mb-4">
            Join our team and earn an additional <span className="font-bold text-yellow-300">{formatFullCurrency(additionalIncome)}</span> over your career
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-indigo-200">
            <Users className="w-4 h-4" />
            <span>Flexible hours</span>
            <span className="mx-2">•</span>
            <DollarSign className="w-4 h-4" />
            <span>Unlimited earning potential</span>
            <span className="mx-2">•</span>
            <Calendar className="w-4 h-4" />
            <span>Work on your schedule</span>
          </div>
        </div>
      </div>
    </div>
  );
}
