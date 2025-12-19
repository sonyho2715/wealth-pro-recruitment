'use client';

import { useState, useCallback } from 'react';
import { TrendingUp, Percent, PiggyBank, Info } from 'lucide-react';
import { formatCurrency, formatPercent, SOLO_401K_MAX_CONTRIBUTION } from '@/lib/business-calculations';

interface WhatIfSlidersProps {
  currentRevenue: number;
  currentCOGS: number;
  currentPension: number;
  onScenarioChange: (inputs: {
    priceAdjustment: number;
    costReduction: number;
    pensionContribution: number;
  }) => void;
}

export default function WhatIfSliders({
  currentRevenue,
  currentCOGS,
  currentPension,
  onScenarioChange,
}: WhatIfSlidersProps) {
  const [priceAdjustment, setPriceAdjustment] = useState(0);
  const [costReduction, setCostReduction] = useState(0);
  const [pensionContribution, setPensionContribution] = useState(currentPension);

  const handlePriceChange = useCallback(
    (value: number) => {
      setPriceAdjustment(value);
      onScenarioChange({
        priceAdjustment: value / 100,
        costReduction: costReduction / 100,
        pensionContribution,
      });
    },
    [costReduction, pensionContribution, onScenarioChange]
  );

  const handleCostChange = useCallback(
    (value: number) => {
      setCostReduction(value);
      onScenarioChange({
        priceAdjustment: priceAdjustment / 100,
        costReduction: value / 100,
        pensionContribution,
      });
    },
    [priceAdjustment, pensionContribution, onScenarioChange]
  );

  const handlePensionChange = useCallback(
    (value: number) => {
      setPensionContribution(value);
      onScenarioChange({
        priceAdjustment: priceAdjustment / 100,
        costReduction: costReduction / 100,
        pensionContribution: value,
      });
    },
    [priceAdjustment, costReduction, onScenarioChange]
  );

  // Calculate impacts for display
  const revenueImpact = currentRevenue * (priceAdjustment / 100);
  const costImpact = currentCOGS * (costReduction / 100);
  const taxSavingsFromPension = pensionContribution * 0.32;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900">What-If Scenarios</h3>
        <p className="text-sm text-slate-500 mt-1">
          Adjust the sliders to see real-time impact on your business
        </p>
      </div>

      <div className="p-6 space-y-8">
        {/* Price Adjustment Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-900">Price Increase</label>
                <p className="text-xs text-slate-500">Raise prices to boost revenue</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-emerald-600">{priceAdjustment}%</span>
              {revenueImpact > 0 && (
                <p className="text-xs text-emerald-600">+{formatCurrency(revenueImpact)}</p>
              )}
            </div>
          </div>

          <div className="relative">
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={priceAdjustment}
              onChange={(e) => handlePriceChange(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${priceAdjustment * 4}%, #e2e8f0 ${priceAdjustment * 4}%, #e2e8f0 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>0%</span>
              <span>5%</span>
              <span>10%</span>
              <span>15%</span>
              <span>20%</span>
              <span>25%</span>
            </div>
          </div>

          {priceAdjustment > 0 && priceAdjustment <= 10 && (
            <div className="flex items-start gap-2 p-3 bg-emerald-50 rounded-lg">
              <Info className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-700">
                A {priceAdjustment}% price increase is typically well-tolerated by customers and can significantly boost profitability.
              </p>
            </div>
          )}
        </div>

        {/* Cost Reduction Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Percent className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-900">Cost Reduction</label>
                <p className="text-xs text-slate-500">Optimize COGS through efficiency</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-blue-600">{costReduction}%</span>
              {costImpact > 0 && (
                <p className="text-xs text-blue-600">Save {formatCurrency(costImpact)}</p>
              )}
            </div>
          </div>

          <div className="relative">
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={costReduction}
              onChange={(e) => handleCostChange(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${costReduction * 5}%, #e2e8f0 ${costReduction * 5}%, #e2e8f0 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>0%</span>
              <span>5%</span>
              <span>10%</span>
              <span>15%</span>
              <span>20%</span>
            </div>
          </div>

          {costReduction > 0 && costReduction <= 10 && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700">
                Cost reduction through supplier negotiation, process optimization, or bulk purchasing is often achievable without compromising quality.
              </p>
            </div>
          )}
        </div>

        {/* Pension Contribution Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <PiggyBank className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-900">Retirement Contribution</label>
                <p className="text-xs text-slate-500">Solo 401(k) / SEP-IRA (max ${(SOLO_401K_MAX_CONTRIBUTION / 1000).toFixed(0)}K)</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-amber-600">{formatCurrency(pensionContribution)}</span>
              {pensionContribution > 0 && (
                <p className="text-xs text-amber-600">Tax savings: {formatCurrency(taxSavingsFromPension)}</p>
              )}
            </div>
          </div>

          <div className="relative">
            <input
              type="range"
              min="0"
              max={SOLO_401K_MAX_CONTRIBUTION}
              step="1000"
              value={pensionContribution}
              onChange={(e) => handlePensionChange(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              style={{
                background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(pensionContribution / SOLO_401K_MAX_CONTRIBUTION) * 100}%, #e2e8f0 ${(pensionContribution / SOLO_401K_MAX_CONTRIBUTION) * 100}%, #e2e8f0 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>$0</span>
              <span>$17K</span>
              <span>$35K</span>
              <span>$52K</span>
              <span>$69K</span>
            </div>
          </div>

          {pensionContribution > 0 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                Contributing to a Solo 401(k) reduces your taxable income, saving approximately 32% on every dollar contributed at this income level.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Presets */}
      <div className="px-6 pb-6">
        <p className="text-xs text-slate-500 mb-3">Quick Presets:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              handlePriceChange(10);
              handleCostChange(0);
              handlePensionChange(0);
            }}
            className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-full transition"
          >
            10% Price Increase
          </button>
          <button
            onClick={() => {
              handlePriceChange(0);
              handleCostChange(10);
              handlePensionChange(0);
            }}
            className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full transition"
          >
            10% Cost Reduction
          </button>
          <button
            onClick={() => {
              handlePriceChange(0);
              handleCostChange(0);
              handlePensionChange(69000);
            }}
            className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-full transition"
          >
            Max Retirement
          </button>
          <button
            onClick={() => {
              handlePriceChange(10);
              handleCostChange(5);
              handlePensionChange(69000);
            }}
            className="px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-full transition"
          >
            Optimized Combo
          </button>
          <button
            onClick={() => {
              handlePriceChange(0);
              handleCostChange(0);
              handlePensionChange(currentPension);
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
