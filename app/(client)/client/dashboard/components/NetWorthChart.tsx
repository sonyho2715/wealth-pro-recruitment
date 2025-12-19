'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Snapshot {
  id: string;
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

interface NetWorthChartProps {
  snapshots: Snapshot[];
  height?: number;
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  });
}

export default function NetWorthChart({ snapshots, height = 200 }: NetWorthChartProps) {
  const chartData = useMemo(() => {
    if (snapshots.length === 0) return null;

    // Sort by date ascending for the chart
    const sorted = [...snapshots].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Get min/max for scaling
    const netWorths = sorted.map((s) => s.netWorth);
    const minValue = Math.min(...netWorths);
    const maxValue = Math.max(...netWorths);
    const range = maxValue - minValue || 1; // Avoid division by zero

    // Add padding to range
    const paddedMin = minValue - range * 0.1;
    const paddedMax = maxValue + range * 0.1;
    const paddedRange = paddedMax - paddedMin;

    // Calculate points
    const width = 100; // Percentage-based
    const points = sorted.map((snapshot, index) => {
      const x = sorted.length === 1 ? 50 : (index / (sorted.length - 1)) * width;
      const y = 100 - ((snapshot.netWorth - paddedMin) / paddedRange) * 100;
      return { x, y, ...snapshot };
    });

    // Create SVG path
    const pathD = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    // Create area path (for gradient fill)
    const areaD = `${pathD} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`;

    // Calculate change
    const firstValue = sorted[0].netWorth;
    const lastValue = sorted[sorted.length - 1].netWorth;
    const change = lastValue - firstValue;
    const changePercent = firstValue !== 0 ? (change / Math.abs(firstValue)) * 100 : 0;

    return {
      points,
      pathD,
      areaD,
      minValue: paddedMin,
      maxValue: paddedMax,
      change,
      changePercent,
      isPositive: change >= 0,
    };
  }, [snapshots]);

  if (!chartData || snapshots.length < 2) {
    return (
      <div
        className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-slate-500 text-sm">
          {snapshots.length === 0
            ? 'No history data available yet'
            : 'Need at least 2 snapshots to show progress chart'}
        </p>
      </div>
    );
  }

  const { points, pathD, areaD, change, changePercent, isPositive } = chartData;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Net Worth Progress</h3>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
            isPositive
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          {isPositive ? '+' : ''}
          {changePercent.toFixed(1)}%
        </div>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={isPositive ? '#10b981' : '#ef4444'}
                stopOpacity="0.3"
              />
              <stop
                offset="100%"
                stopColor={isPositive ? '#10b981' : '#ef4444'}
                stopOpacity="0.05"
              />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1="0"
            y1="25"
            x2="100"
            y2="25"
            stroke="#e2e8f0"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1="0"
            y1="50"
            x2="100"
            y2="50"
            stroke="#e2e8f0"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1="0"
            y1="75"
            x2="100"
            y2="75"
            stroke="#e2e8f0"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />

          {/* Area fill */}
          <path d={areaD} fill="url(#netWorthGradient)" />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke={isPositive ? '#10b981' : '#ef4444'}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <circle
              key={point.id}
              cx={point.x}
              cy={point.y}
              r="1.5"
              fill="white"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-slate-500 -ml-2 transform -translate-x-full pr-2">
          <span>{formatCurrency(chartData.maxValue)}</span>
          <span>{formatCurrency((chartData.maxValue + chartData.minValue) / 2)}</span>
          <span>{formatCurrency(chartData.minValue)}</span>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-slate-500">
        <span>{formatDate(points[0].date)}</span>
        {points.length > 2 && (
          <span>{formatDate(points[Math.floor(points.length / 2)].date)}</span>
        )}
        <span>{formatDate(points[points.length - 1].date)}</span>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Total Change</p>
          <p
            className={`font-semibold ${
              isPositive ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {isPositive ? '+' : ''}
            {formatCurrency(change)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Time Period</p>
          <p className="font-medium text-slate-700">
            {points.length} snapshots
          </p>
        </div>
      </div>
    </div>
  );
}
