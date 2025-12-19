'use client';

import { ArrowRight, TrendingUp, TrendingDown, DollarSign, Percent, Receipt } from 'lucide-react';
import { ScenarioResults, formatCurrency, formatPercent, getValueColor } from '@/lib/business-calculations';

interface BeforeAfterComparisonProps {
  results: ScenarioResults;
  hasChanges: boolean;
}

export default function BeforeAfterComparison({ results, hasChanges }: BeforeAfterComparisonProps) {
  const {
    baseRevenue,
    baseCOGS,
    baseNetIncome,
    baseTaxLiability,
    adjustedRevenue,
    adjustedCOGS,
    adjustedNetIncome,
    adjustedTaxLiability,
    cogsRatio,
    adjustedCogsRatio,
    netMargin,
    adjustedNetMargin,
    revenueIncrease,
    costSavings,
    totalImprovements,
    taxSavings,
    netBenefit,
  } = results;

  const isImproved = adjustedNetIncome > baseNetIncome;
  const isProfitable = adjustedNetIncome > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900">Before & After Comparison</h3>
        <p className="text-sm text-slate-500 mt-1">
          See how the adjustments impact your bottom line
        </p>
      </div>

      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        {/* BEFORE Column */}
        <div className="p-6 bg-slate-50/50">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-slate-400" />
            <h4 className="font-semibold text-slate-700">Current State</h4>
          </div>

          <div className="space-y-4">
            <MetricRow
              label="Revenue"
              value={formatCurrency(baseRevenue)}
              icon={<DollarSign className="w-4 h-4" />}
            />
            <MetricRow
              label="Cost of Goods Sold"
              value={formatCurrency(baseCOGS)}
              subValue={`${formatPercent(cogsRatio)} of revenue`}
              icon={<Receipt className="w-4 h-4" />}
            />
            <MetricRow
              label="Net Income"
              value={formatCurrency(baseNetIncome)}
              subValue={`${formatPercent(netMargin)} margin`}
              icon={baseNetIncome >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              valueColor={getValueColor(baseNetIncome)}
            />
            <MetricRow
              label="Est. Tax Liability"
              value={formatCurrency(baseTaxLiability)}
              icon={<Percent className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* AFTER Column */}
        <div className={`p-6 ${hasChanges ? 'bg-emerald-50/30' : ''}`}>
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-3 h-3 rounded-full ${hasChanges ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            <h4 className={`font-semibold ${hasChanges ? 'text-emerald-700' : 'text-slate-500'}`}>
              {hasChanges ? 'After Optimization' : 'Adjust Sliders Above'}
            </h4>
          </div>

          <div className="space-y-4">
            <MetricRow
              label="Revenue"
              value={formatCurrency(adjustedRevenue)}
              change={hasChanges && revenueIncrease > 0 ? `+${formatCurrency(revenueIncrease)}` : undefined}
              changeColor="text-emerald-600"
              icon={<DollarSign className="w-4 h-4" />}
            />
            <MetricRow
              label="Cost of Goods Sold"
              value={formatCurrency(adjustedCOGS)}
              subValue={`${formatPercent(adjustedCogsRatio)} of revenue`}
              change={hasChanges && costSavings > 0 ? `-${formatCurrency(costSavings)}` : undefined}
              changeColor="text-blue-600"
              icon={<Receipt className="w-4 h-4" />}
            />
            <MetricRow
              label="Net Income"
              value={formatCurrency(adjustedNetIncome)}
              subValue={`${formatPercent(adjustedNetMargin)} margin`}
              icon={adjustedNetIncome >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              valueColor={getValueColor(adjustedNetIncome)}
              highlight={hasChanges && isProfitable && !isImproved ? false : hasChanges && isImproved}
            />
            <MetricRow
              label="Est. Tax Liability"
              value={formatCurrency(adjustedTaxLiability)}
              change={hasChanges && taxSavings > 0 ? `Save ${formatCurrency(taxSavings)}` : undefined}
              changeColor="text-amber-600"
              icon={<Percent className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>

      {/* Impact Summary */}
      {hasChanges && (
        <div className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <ArrowRight className="w-5 h-5 text-emerald-600" />
            <h4 className="font-semibold text-slate-900">Total Impact</h4>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ImpactCard
              label="Revenue Increase"
              value={formatCurrency(revenueIncrease)}
              color="emerald"
            />
            <ImpactCard
              label="Cost Savings"
              value={formatCurrency(costSavings)}
              color="blue"
            />
            <ImpactCard
              label="Tax Savings"
              value={formatCurrency(taxSavings)}
              color="amber"
            />
            <ImpactCard
              label="Net Benefit"
              value={formatCurrency(netBenefit)}
              color="purple"
              highlight
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components

interface MetricRowProps {
  label: string;
  value: string;
  subValue?: string;
  change?: string;
  changeColor?: string;
  valueColor?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}

function MetricRow({
  label,
  value,
  subValue,
  change,
  changeColor = 'text-emerald-600',
  valueColor = 'text-slate-900',
  icon,
  highlight = false,
}: MetricRowProps) {
  return (
    <div className={`flex items-start justify-between p-3 rounded-lg ${highlight ? 'bg-emerald-100/50' : ''}`}>
      <div className="flex items-center gap-2">
        <div className="text-slate-400">{icon}</div>
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <div className="text-right">
        <span className={`font-semibold ${valueColor}`}>{value}</span>
        {subValue && <p className="text-xs text-slate-400">{subValue}</p>}
        {change && <p className={`text-xs font-medium ${changeColor}`}>{change}</p>}
      </div>
    </div>
  );
}

interface ImpactCardProps {
  label: string;
  value: string;
  color: 'emerald' | 'blue' | 'amber' | 'purple';
  highlight?: boolean;
}

function ImpactCard({ label, value, color, highlight = false }: ImpactCardProps) {
  const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
  };

  return (
    <div
      className={`p-3 rounded-xl border ${colorClasses[color]} ${highlight ? 'ring-2 ring-offset-1 ring-purple-300' : ''}`}
    >
      <p className="text-xs opacity-75">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
