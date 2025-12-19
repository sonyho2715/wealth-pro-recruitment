'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface PercentileGaugeProps {
  label: string;
  percentile: number;  // 0-100
  value?: string;      // Formatted value to display (e.g., "15.2%")
  benchmark?: {
    p25: string;
    p50: string;
    p75: string;
  };
  lowerIsBetter?: boolean;
  showBenchmarks?: boolean;
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
}

export default function PercentileGauge({
  label,
  percentile,
  value,
  benchmark,
  lowerIsBetter = false,
  showBenchmarks = false,
  size = 'md',
  tooltip,
}: PercentileGaugeProps) {
  // Clamp percentile to 0-100
  const clampedPercentile = Math.max(0, Math.min(100, percentile));

  // Determine color based on percentile
  const { color, bgColor, textColor, label: statusLabel } = useMemo(() => {
    if (clampedPercentile >= 75) {
      return {
        color: 'emerald',
        bgColor: 'bg-emerald-500',
        textColor: 'text-emerald-600',
        label: 'Excellent',
      };
    } else if (clampedPercentile >= 50) {
      return {
        color: 'blue',
        bgColor: 'bg-blue-500',
        textColor: 'text-blue-600',
        label: 'Good',
      };
    } else if (clampedPercentile >= 25) {
      return {
        color: 'amber',
        bgColor: 'bg-amber-500',
        textColor: 'text-amber-600',
        label: 'Fair',
      };
    } else {
      return {
        color: 'red',
        bgColor: 'bg-red-500',
        textColor: 'text-red-600',
        label: 'Needs Work',
      };
    }
  }, [clampedPercentile]);

  const sizeClasses = {
    sm: { height: 'h-2', text: 'text-sm', valueText: 'text-lg' },
    md: { height: 'h-3', text: 'text-base', valueText: 'text-xl' },
    lg: { height: 'h-4', text: 'text-lg', valueText: 'text-2xl' },
  };

  const classes = sizeClasses[size];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`font-medium text-slate-900 ${classes.text}`}>{label}</span>
          {tooltip && (
            <div className="group relative">
              <Info className="w-4 h-4 text-slate-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition whitespace-nowrap z-10">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
              </div>
            </div>
          )}
        </div>
        {value && (
          <span className={`font-bold ${textColor} ${classes.valueText}`}>{value}</span>
        )}
      </div>

      {/* Progress Bar */}
      <div className={`relative w-full ${classes.height} bg-slate-100 rounded-full overflow-hidden`}>
        {/* Quartile markers */}
        <div className="absolute inset-0 flex">
          <div className="w-1/4 border-r border-slate-200/50" />
          <div className="w-1/4 border-r border-slate-200/50" />
          <div className="w-1/4 border-r border-slate-200/50" />
          <div className="w-1/4" />
        </div>

        {/* Fill */}
        <div
          className={`absolute top-0 left-0 h-full ${bgColor} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedPercentile}%` }}
        />

        {/* Position indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-1 h-[150%] bg-slate-900 rounded-full shadow-sm"
          style={{ left: `${clampedPercentile}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-2 text-xs text-slate-400">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-sm font-medium ${textColor}`}>
            {clampedPercentile >= 50 ? (
              <TrendingUp className="w-4 h-4" />
            ) : clampedPercentile >= 25 ? (
              <Minus className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {statusLabel}
          </span>
        </div>
        <span className="text-sm font-medium text-slate-700">
          {Math.round(clampedPercentile)}th percentile
        </span>
      </div>

      {/* Benchmark values */}
      {showBenchmarks && benchmark && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500 mb-2">Industry Benchmarks</p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="text-slate-400">25th</div>
              <div className="font-medium text-slate-600">{benchmark.p25}</div>
            </div>
            <div>
              <div className="text-slate-400">Median</div>
              <div className="font-medium text-slate-600">{benchmark.p50}</div>
            </div>
            <div>
              <div className="text-slate-400">75th</div>
              <div className="font-medium text-slate-600">{benchmark.p75}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for grid layouts
interface PercentileGaugeCompactProps {
  label: string;
  percentile: number;
  value?: string;
  icon?: React.ReactNode;
}

export function PercentileGaugeCompact({
  label,
  percentile,
  value,
  icon,
}: PercentileGaugeCompactProps) {
  const clampedPercentile = Math.max(0, Math.min(100, percentile));

  const getColor = () => {
    if (clampedPercentile >= 75) return { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50' };
    if (clampedPercentile >= 50) return { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50' };
    if (clampedPercentile >= 25) return { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50' };
    return { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-50' };
  };

  const colors = getColor();

  return (
    <div className={`rounded-lg p-3 ${colors.light}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        {icon}
      </div>
      <div className="flex items-end justify-between">
        {value && <span className={`text-lg font-bold ${colors.text}`}>{value}</span>}
        <span className={`text-xs font-medium ${colors.text}`}>
          {Math.round(clampedPercentile)}%ile
        </span>
      </div>
      <div className="mt-2 h-1.5 bg-white/50 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors.bg} rounded-full transition-all duration-500`}
          style={{ width: `${clampedPercentile}%` }}
        />
      </div>
    </div>
  );
}

// Health Score Ring Gauge
interface HealthScoreRingProps {
  score: number;  // 0-100
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export function HealthScoreRing({
  score,
  size = 120,
  strokeWidth = 10,
  showLabel = true,
}: HealthScoreRingProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  const getColor = () => {
    if (clampedScore >= 80) return { stroke: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Excellent' };
    if (clampedScore >= 60) return { stroke: '#3b82f6', bg: 'bg-blue-50', text: 'text-blue-600', label: 'Good' };
    if (clampedScore >= 40) return { stroke: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-600', label: 'Fair' };
    return { stroke: '#ef4444', bg: 'bg-red-50', text: 'text-red-600', label: 'Needs Work' };
  };

  const colors = getColor();

  return (
    <div className={`inline-flex flex-col items-center p-4 rounded-2xl ${colors.bg}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${colors.text}`}>{Math.round(clampedScore)}</span>
          <span className="text-xs text-slate-500">/ 100</span>
        </div>
      </div>
      {showLabel && (
        <div className="mt-2 text-center">
          <span className={`text-sm font-medium ${colors.text}`}>{colors.label}</span>
          <p className="text-xs text-slate-500 mt-0.5">Health Score</p>
        </div>
      )}
    </div>
  );
}
