'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Info, Settings2 } from 'lucide-react';
import { AGENT_ASSUMPTIONS } from '@/lib/config';

interface IncomeSliderProps {
  onProjectionChange: (projection: IncomeProjection) => void;
  initialSalesPerMonth?: number;
}

export interface IncomeProjection {
  salesPerMonth: number;
  year1Income: number;
  year3Income: number;
  year5Income: number;
  lifetimeValue: number;
}

/**
 * IncomeSlider - User-Controlled Projection Tool
 *
 * COMPLIANCE PURPOSE: This component transfers liability from the software to the user.
 * By having the user drag the slider themselves to set their "Monthly Sales Activity,"
 * the income figures become THEIR hypothesis, not our claim.
 *
 * Key compliance features:
 * - User controls the input (not pre-filled with optimistic values)
 * - Clear labeling as "hypothetical" and "if you"
 * - Conservative defaults (starts at 2 sales/month, not 10)
 * - Prominent disclaimer that follows the slider
 */

// Default assumptions from config
const DEFAULT_ASSUMPTIONS = {
  averagePremium: AGENT_ASSUMPTIONS.averagePolicyPremium,
  commissionRate: AGENT_ASSUMPTIONS.firstYearCommissionRate,
  renewalRate: AGENT_ASSUMPTIONS.renewalCommissionRate,
  retentionRate: AGENT_ASSUMPTIONS.clientRetentionRate,
  growthFactor: AGENT_ASSUMPTIONS.annualGrowthFactor,
};

interface Assumptions {
  averagePremium: number;
  commissionRate: number;
  renewalRate: number;
  retentionRate: number;
  growthFactor: number;
}

function calculateProjection(salesPerMonth: number, assumptions: Assumptions): IncomeProjection {
  const annualPolicies = salesPerMonth * 12;
  const avgCommissionPerPolicy = assumptions.averagePremium * assumptions.commissionRate;

  // Year 1: Just first-year commissions
  const year1Income = Math.round(annualPolicies * avgCommissionPerPolicy);

  // Year 3: Improved productivity + renewals building up
  const year3AnnualPolicies = Math.round(annualPolicies * Math.pow(assumptions.growthFactor, 2));
  const year3Renewals = Math.round(
    annualPolicies * 2 * assumptions.retentionRate *
    assumptions.averagePremium * assumptions.renewalRate
  );
  const year3Income = Math.round(
    year3AnnualPolicies * avgCommissionPerPolicy + year3Renewals
  );

  // Year 5: Full renewal base + continued growth
  const year5AnnualPolicies = Math.round(annualPolicies * Math.pow(assumptions.growthFactor, 4));
  const year5Renewals = Math.round(
    annualPolicies * 4 * assumptions.retentionRate *
    assumptions.averagePremium * assumptions.renewalRate
  );
  const year5Income = Math.round(
    year5AnnualPolicies * avgCommissionPerPolicy + year5Renewals
  );

  // 10-year lifetime value (proper calculation)
  // Sum of first-year commissions + renewal book building over 10 years
  let lifetimeValue = 0;
  let totalPoliciesInForce = 0;

  for (let year = 1; year <= 10; year++) {
    // New policies this year with growth
    const yearPolicies = Math.round(annualPolicies * Math.pow(assumptions.growthFactor, year - 1));
    const firstYearCommission = yearPolicies * avgCommissionPerPolicy;

    // Renewals from existing book (with retention)
    const renewalCommission = totalPoliciesInForce * assumptions.averagePremium * assumptions.renewalRate;

    // Update book of business
    totalPoliciesInForce = Math.round(totalPoliciesInForce * assumptions.retentionRate + yearPolicies);

    lifetimeValue += firstYearCommission + renewalCommission;
  }

  lifetimeValue = Math.round(lifetimeValue);

  return {
    salesPerMonth,
    year1Income,
    year3Income,
    year5Income,
    lifetimeValue,
  };
}

export default function IncomeSlider({
  onProjectionChange,
  initialSalesPerMonth = 2 // Conservative default
}: IncomeSliderProps) {
  const [salesPerMonth, setSalesPerMonth] = useState(initialSalesPerMonth);
  const [showSettings, setShowSettings] = useState(false);
  const [assumptions, setAssumptions] = useState<Assumptions>(DEFAULT_ASSUMPTIONS);
  const [projection, setProjection] = useState<IncomeProjection>(() =>
    calculateProjection(initialSalesPerMonth, DEFAULT_ASSUMPTIONS)
  );

  useEffect(() => {
    const newProjection = calculateProjection(salesPerMonth, assumptions);
    setProjection(newProjection);
    onProjectionChange(newProjection);
  }, [salesPerMonth, assumptions, onProjectionChange]);

  const handlePremiumChange = (value: string) => {
    const num = parseInt(value.replace(/[^0-9]/g, '')) || 0;
    setAssumptions(prev => ({ ...prev, averagePremium: num }));
  };

  const handleCommissionChange = (value: string) => {
    const num = parseFloat(value) || 0;
    // Convert percentage to decimal (e.g., 55 -> 0.55)
    setAssumptions(prev => ({ ...prev, commissionRate: Math.min(100, Math.max(0, num)) / 100 }));
  };

  const getActivityLevel = () => {
    if (salesPerMonth <= 2) return { label: 'Part-Time Casual', color: 'text-blue-600' };
    if (salesPerMonth <= 4) return { label: 'Part-Time Active', color: 'text-indigo-600' };
    if (salesPerMonth <= 6) return { label: 'Full-Time Entry', color: 'text-purple-600' };
    if (salesPerMonth <= 8) return { label: 'Full-Time Active', color: 'text-emerald-600' };
    return { label: 'High Performer', color: 'text-amber-600' };
  };

  const activityLevel = getActivityLevel();

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Income Scenario Builder</h3>
            <p className="text-slate-400 text-sm">Drag the slider to explore hypothetical outcomes</p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-lg transition-colors ${
            showSettings ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
          title="Adjust assumptions"
        >
          <Settings2 className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Customize Assumptions</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Average Premium</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="text"
                  value={assumptions.averagePremium.toLocaleString()}
                  onChange={(e) => handlePremiumChange(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 pl-7 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Annual policy premium</p>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Commission Rate</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round(assumptions.commissionRate * 100)}
                  onChange={(e) => handleCommissionChange(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 pr-8 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">First-year commission</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Commission per policy: <span className="text-emerald-400 font-medium">${Math.round(assumptions.averagePremium * assumptions.commissionRate).toLocaleString()}</span>
            </span>
            <button
              onClick={() => setAssumptions(DEFAULT_ASSUMPTIONS)}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      )}

      {/* Slider Section */}
      <div className="bg-white/5 rounded-xl p-5 mb-6">
        <label className="block text-sm text-slate-300 mb-2">
          <span className="font-medium">IF</span> you made this many sales per month:
        </label>

        {/* Slider */}
        <div className="relative mb-4">
          <input
            type="range"
            min="1"
            max="12"
            value={salesPerMonth}
            onChange={(e) => setSalesPerMonth(parseInt(e.target.value))}
            className="w-full h-3 bg-slate-700 rounded-full appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-6
                       [&::-webkit-slider-thumb]:h-6
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-gradient-to-r
                       [&::-webkit-slider-thumb]:from-emerald-400
                       [&::-webkit-slider-thumb]:to-green-500
                       [&::-webkit-slider-thumb]:shadow-lg
                       [&::-webkit-slider-thumb]:shadow-emerald-500/30
                       [&::-webkit-slider-thumb]:cursor-pointer
                       [&::-webkit-slider-thumb]:border-2
                       [&::-webkit-slider-thumb]:border-white"
          />
          {/* Scale markers */}
          <div className="flex justify-between text-xs text-slate-500 mt-2 px-1">
            <span>1</span>
            <span>4</span>
            <span>8</span>
            <span>12</span>
          </div>
        </div>

        {/* Current Value Display */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-4xl font-bold text-emerald-400">{salesPerMonth}</span>
            <span className="text-slate-400 ml-2">sales/month</span>
          </div>
          <div className={`text-right ${activityLevel.color}`}>
            <div className="text-sm font-medium">{activityLevel.label}</div>
            <div className="text-xs text-slate-500">{salesPerMonth * 12} policies/year</div>
          </div>
        </div>
      </div>

      {/* Hypothetical Results */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-slate-400">THEN your hypothetical income could be:</span>
          <div className="group relative">
            <Info className="w-4 h-4 text-slate-500 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-700 rounded-lg text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              Based on ${assumptions.averagePremium.toLocaleString()} avg premium, {Math.round(assumptions.commissionRate * 100)}% commission,
              and {assumptions.retentionRate * 100}% client retention. Actual results vary.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
              <Calendar className="w-3 h-3" />
              Year 1
            </div>
            <div className="text-xl font-bold text-emerald-400">
              ${projection.year1Income.toLocaleString()}
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
              <Calendar className="w-3 h-3" />
              Year 3
            </div>
            <div className="text-xl font-bold text-blue-400">
              ${projection.year3Income.toLocaleString()}
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
              <Calendar className="w-3 h-3" />
              Year 5
            </div>
            <div className="text-xl font-bold text-purple-400">
              ${projection.year5Income.toLocaleString()}
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
              <DollarSign className="w-3 h-3" />
              10-Year
            </div>
            <div className="text-xl font-bold text-amber-400">
              ${projection.lifetimeValue.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Inline Disclaimer - Always Visible */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <p className="text-amber-200 text-xs leading-relaxed">
          <strong>Hypothetical Illustration Only.</strong> These figures are estimates based on
          YOUR selected activity level and industry-average assumptions. Results are not typical.
          Individual outcomes vary significantly. There is no guarantee of income. The majority
          of new agents earn less than the amounts shown.
        </p>
      </div>
    </div>
  );
}
