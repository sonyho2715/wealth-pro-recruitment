'use client';

import { useState } from 'react';
import { Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PerformanceTierGaugeProps {
  title: string;
  value: number;
  percentile: number;
  benchmark25?: number;
  benchmark50?: number;
  benchmark75?: number;
  unit?: 'percent' | 'currency' | 'ratio' | 'days';
  higherIsBetter?: boolean;
  showBenchmarks?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PerformanceTierGauge({
  title,
  value,
  percentile,
  benchmark25,
  benchmark50,
  benchmark75,
  unit = 'percent',
  higherIsBetter = true,
  showBenchmarks = true,
  size = 'md',
}: PerformanceTierGaugeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Determine tier based on percentile
  const getTier = (): { label: string; color: string; bgColor: string } => {
    if (higherIsBetter) {
      if (percentile >= 75) return { label: 'Top Performer', color: 'text-green-600', bgColor: 'bg-green-500' };
      if (percentile >= 50) return { label: 'Above Average', color: 'text-blue-600', bgColor: 'bg-blue-500' };
      if (percentile >= 25) return { label: 'Average', color: 'text-yellow-600', bgColor: 'bg-yellow-500' };
      return { label: 'Below Average', color: 'text-red-600', bgColor: 'bg-red-500' };
    } else {
      // For metrics where lower is better (like COGS ratio)
      if (percentile <= 25) return { label: 'Top Performer', color: 'text-green-600', bgColor: 'bg-green-500' };
      if (percentile <= 50) return { label: 'Above Average', color: 'text-blue-600', bgColor: 'bg-blue-500' };
      if (percentile <= 75) return { label: 'Average', color: 'text-yellow-600', bgColor: 'bg-yellow-500' };
      return { label: 'Below Average', color: 'text-red-600', bgColor: 'bg-red-500' };
    }
  };

  const formatValue = (val: number): string => {
    switch (unit) {
      case 'percent':
        return `${(val * 100).toFixed(1)}%`;
      case 'currency':
        if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
        return `$${val.toLocaleString()}`;
      case 'ratio':
        return val.toFixed(2);
      case 'days':
        return `${Math.round(val)} days`;
      default:
        return val.toString();
    }
  };

  const tier = getTier();

  const sizeClasses = {
    sm: { container: 'p-3', title: 'text-xs', value: 'text-lg', gauge: 'h-2' },
    md: { container: 'p-4', title: 'text-sm', value: 'text-2xl', gauge: 'h-3' },
    lg: { container: 'p-5', title: 'text-base', value: 'text-3xl', gauge: 'h-4' },
  };

  const classes = sizeClasses[size];

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${classes.container}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className={`font-medium text-gray-700 ${classes.title}`}>{title}</h4>
        <div
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Info className="h-4 w-4 text-gray-400 cursor-help" />
          {showTooltip && showBenchmarks && (
            <div className="absolute right-0 top-6 w-48 bg-gray-900 text-white text-xs rounded-lg p-3 z-10 shadow-lg">
              <div className="font-medium mb-2">Industry Benchmarks</div>
              {benchmark25 !== undefined && (
                <div className="flex justify-between">
                  <span>25th %ile:</span>
                  <span>{formatValue(benchmark25)}</span>
                </div>
              )}
              {benchmark50 !== undefined && (
                <div className="flex justify-between">
                  <span>50th %ile:</span>
                  <span>{formatValue(benchmark50)}</span>
                </div>
              )}
              {benchmark75 !== undefined && (
                <div className="flex justify-between">
                  <span>75th %ile:</span>
                  <span>{formatValue(benchmark75)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Value Display */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className={`font-bold ${tier.color} ${classes.value}`}>
          {formatValue(value)}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${tier.bgColor} text-white font-medium`}>
          {percentile}th %ile
        </span>
      </div>

      {/* Gauge Bar */}
      <div className="relative">
        {/* Background track with segments */}
        <div className={`w-full ${classes.gauge} rounded-full bg-gray-100 overflow-hidden flex`}>
          <div className="w-1/4 bg-red-200 border-r border-white" />
          <div className="w-1/4 bg-yellow-200 border-r border-white" />
          <div className="w-1/4 bg-blue-200 border-r border-white" />
          <div className="w-1/4 bg-green-200" />
        </div>

        {/* Percentile marker */}
        <div
          className="absolute top-0 w-1 bg-gray-900 rounded-full transform -translate-x-1/2"
          style={{
            left: `${Math.min(Math.max(percentile, 2), 98)}%`,
            height: size === 'sm' ? '12px' : size === 'md' ? '16px' : '20px',
          }}
        >
          <div
            className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45"
            style={{ marginTop: '-2px' }}
          />
        </div>

        {/* Benchmark labels */}
        {showBenchmarks && size !== 'sm' && (
          <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        )}
      </div>

      {/* Tier Label */}
      <div className={`mt-2 text-xs font-medium ${tier.color}`}>
        {tier.label}
        {higherIsBetter ? (
          percentile >= 50 ? (
            <TrendingUp className="inline h-3 w-3 ml-1" />
          ) : (
            <TrendingDown className="inline h-3 w-3 ml-1" />
          )
        ) : (
          percentile <= 50 ? (
            <TrendingUp className="inline h-3 w-3 ml-1" />
          ) : (
            <TrendingDown className="inline h-3 w-3 ml-1" />
          )
        )}
      </div>
    </div>
  );
}

interface HealthScoreGaugeProps {
  score: number;
  trend?: 'IMPROVING' | 'STABLE' | 'DECLINING';
  size?: 'sm' | 'md' | 'lg';
}

export function HealthScoreGauge({ score, trend = 'STABLE', size = 'md' }: HealthScoreGaugeProps) {
  const getScoreColor = () => {
    if (score >= 80) return { text: 'text-green-600', bg: 'bg-green-500', ring: 'ring-green-500' };
    if (score >= 60) return { text: 'text-blue-600', bg: 'bg-blue-500', ring: 'ring-blue-500' };
    if (score >= 40) return { text: 'text-yellow-600', bg: 'bg-yellow-500', ring: 'ring-yellow-500' };
    return { text: 'text-red-600', bg: 'bg-red-500', ring: 'ring-red-500' };
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'IMPROVING':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'DECLINING':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const colors = getScoreColor();

  const sizeClasses = {
    sm: { container: 'w-20 h-20', score: 'text-xl', label: 'text-xs' },
    md: { container: 'w-32 h-32', score: 'text-3xl', label: 'text-sm' },
    lg: { container: 'w-40 h-40', score: 'text-4xl', label: 'text-base' },
  };

  const classes = sizeClasses[size];

  // Calculate the stroke dash for circular progress
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDash = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${classes.container}`}>
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={colors.text}
            style={{
              strokeDasharray: `${strokeDash}% ${circumference}%`,
              transition: 'stroke-dasharray 0.5s ease-in-out',
            }}
          />
        </svg>

        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${colors.text} ${classes.score}`}>{score}</span>
          <span className="text-gray-500 text-xs">/ 100</span>
        </div>
      </div>

      {/* Label and trend */}
      <div className="mt-2 flex items-center gap-2">
        <span className={`font-medium ${colors.text} ${classes.label}`}>
          Health Score
        </span>
        {getTrendIcon()}
      </div>
    </div>
  );
}

interface PerformanceGridProps {
  metrics: Array<{
    title: string;
    value: number;
    percentile: number;
    unit?: 'percent' | 'currency' | 'ratio' | 'days';
    higherIsBetter?: boolean;
  }>;
  columns?: 2 | 3 | 4;
}

export function PerformanceGrid({ metrics, columns = 3 }: PerformanceGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {metrics.map((metric, index) => (
        <PerformanceTierGauge
          key={index}
          title={metric.title}
          value={metric.value}
          percentile={metric.percentile}
          unit={metric.unit}
          higherIsBetter={metric.higherIsBetter}
          size="sm"
        />
      ))}
    </div>
  );
}

export default PerformanceTierGauge;
