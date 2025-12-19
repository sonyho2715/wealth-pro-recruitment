'use client';

import { useState } from 'react';
import {
  DollarSign,
  TrendingDown,
  PiggyBank,
  Calculator,
  Banknote,
  Shield,
  Lightbulb,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  ArrowRight,
} from 'lucide-react';
import {
  QuickFix,
  QuickFixCategory,
  ImplementationTimeframe,
  Complexity,
  formatImpact,
  getTimeframeLabel,
  getComplexityColor,
} from '@/lib/quick-fix-calculator';

interface QuickFixCardProps {
  fix: QuickFix;
  index: number;
  onStatusChange?: (status: 'RECOMMENDED' | 'IN_PROGRESS' | 'IMPLEMENTED' | 'DECLINED') => void;
}

const categoryIcons: Record<QuickFixCategory, React.ReactNode> = {
  PRICING: <DollarSign className="h-5 w-5" />,
  COST_REDUCTION: <TrendingDown className="h-5 w-5" />,
  RETIREMENT_PLAN: <PiggyBank className="h-5 w-5" />,
  TAX_STRATEGY: <Calculator className="h-5 w-5" />,
  CASH_FLOW: <Banknote className="h-5 w-5" />,
  INSURANCE: <Shield className="h-5 w-5" />,
  OTHER: <Lightbulb className="h-5 w-5" />,
};

const categoryColors: Record<QuickFixCategory, string> = {
  PRICING: 'bg-blue-100 text-blue-700 border-blue-200',
  COST_REDUCTION: 'bg-green-100 text-green-700 border-green-200',
  RETIREMENT_PLAN: 'bg-purple-100 text-purple-700 border-purple-200',
  TAX_STRATEGY: 'bg-orange-100 text-orange-700 border-orange-200',
  CASH_FLOW: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  INSURANCE: 'bg-red-100 text-red-700 border-red-200',
  OTHER: 'bg-gray-100 text-gray-700 border-gray-200',
};

const priorityColors: Record<number, string> = {
  10: 'border-l-red-500',
  9: 'border-l-red-400',
  8: 'border-l-orange-500',
  7: 'border-l-orange-400',
  6: 'border-l-yellow-500',
  5: 'border-l-yellow-400',
};

export function QuickFixCard({ fix, index, onStatusChange }: QuickFixCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState<'RECOMMENDED' | 'IN_PROGRESS' | 'IMPLEMENTED' | 'DECLINED'>('RECOMMENDED');

  const handleStatusChange = (newStatus: typeof status) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  };

  const priorityColor = priorityColors[fix.priority] || 'border-l-gray-300';

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 ${priorityColor} overflow-hidden transition-all duration-200 hover:shadow-md`}
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {/* Priority Number */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
              {index + 1}
            </div>

            <div className="flex-1 min-w-0">
              {/* Action Title */}
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                {fix.action}
              </h3>

              {/* Category & Timeline */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${categoryColors[fix.category]}`}>
                  {categoryIcons[fix.category]}
                  {fix.category.replace('_', ' ')}
                </span>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  <Clock className="h-3 w-3" />
                  {getTimeframeLabel(fix.implementation)}
                </span>

                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getComplexityColor(fix.complexity)}`}>
                  {fix.complexity}
                </span>
              </div>
            </div>
          </div>

          {/* Impact & Expand */}
          <div className="flex items-center gap-3 ml-2">
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">
                {formatImpact(fix.annualImpact)}
              </div>
              <div className="text-xs text-gray-500">annual impact</div>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Current vs Recommended */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-500">Current:</span>
                <span className="ml-2 font-medium">
                  {typeof fix.currentValue === 'number' && fix.currentValue > 100
                    ? formatImpact(fix.currentValue)
                    : `${fix.currentValue.toFixed(1)}%`}
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <div>
                <span className="text-gray-500">Recommended:</span>
                <span className="ml-2 font-medium text-green-600">
                  {typeof fix.recommendedValue === 'number' && fix.recommendedValue > 100
                    ? formatImpact(fix.recommendedValue)
                    : `${fix.recommendedValue.toFixed(1)}%`}
                </span>
              </div>
            </div>
          </div>

          {/* Required Action */}
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Implementation Steps:
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {fix.requiredAction}
            </p>
          </div>

          {/* Status Actions */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 mr-2">Status:</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange('RECOMMENDED');
                }}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  status === 'RECOMMENDED'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                Recommended
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange('IN_PROGRESS');
                }}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  status === 'IN_PROGRESS'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange('IMPLEMENTED');
                }}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  status === 'IMPLEMENTED'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <CheckCircle2 className="h-3 w-3 inline mr-1" />
                Done
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange('DECLINED');
                }}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  status === 'DECLINED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                N/A
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface QuickFixListProps {
  fixes: QuickFix[];
  showSummary?: boolean;
}

export function QuickFixList({ fixes, showSummary = true }: QuickFixListProps) {
  const totalImpact = fixes.reduce((sum, fix) => sum + fix.annualImpact, 0);
  const immediateCount = fixes.filter(
    f => f.implementation === 'IMMEDIATE' || f.implementation === 'THIRTY_DAYS'
  ).length;

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      {showSummary && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Quick Wins Action Plan</h3>
              <p className="text-sm text-gray-600">
                {fixes.length} opportunities identified, {immediateCount} can be implemented immediately
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{formatImpact(totalImpact)}</div>
              <div className="text-sm text-gray-500">total potential impact</div>
            </div>
          </div>
        </div>
      )}

      {/* Fix Cards */}
      <div className="space-y-3">
        {fixes.map((fix, index) => (
          <QuickFixCard key={index} fix={fix} index={index} />
        ))}
      </div>

      {fixes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle2 className="h-12 w-12 mx-auto text-green-400 mb-2" />
          <p>No quick fixes needed! Your business is well-optimized.</p>
        </div>
      )}
    </div>
  );
}

export default QuickFixCard;
