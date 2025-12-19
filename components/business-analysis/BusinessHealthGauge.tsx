'use client';

import { HealthScore } from '@/lib/business-calculations';
import { CheckCircle, AlertTriangle, XCircle, Lightbulb } from 'lucide-react';

interface BusinessHealthGaugeProps {
  health: HealthScore;
  showRecommendations?: boolean;
}

export default function BusinessHealthGauge({ health, showRecommendations = true }: BusinessHealthGaugeProps) {
  const { score, grade, color, breakdown, recommendations } = health;

  // Calculate arc angle for the gauge (0-180 degrees)
  const angle = (score / 100) * 180;

  // Get status text based on score
  const getStatusText = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 50) return 'Fair';
    if (score >= 35) return 'Needs Attention';
    return 'Critical';
  };

  // Get icon based on score
  const getStatusIcon = () => {
    if (score >= 65) return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    if (score >= 50) return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900">Business Health Score</h3>
        <p className="text-sm text-slate-500 mt-1">Overall assessment of your business financial health</p>
      </div>

      <div className="p-6">
        {/* Gauge */}
        <div className="relative flex flex-col items-center">
          {/* SVG Gauge */}
          <svg width="200" height="120" viewBox="0 0 200 120" className="overflow-visible">
            {/* Background arc */}
            <path
              d="M 10 100 A 90 90 0 0 1 190 100"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="16"
              strokeLinecap="round"
            />

            {/* Colored arc */}
            <path
              d="M 10 100 A 90 90 0 0 1 190 100"
              fill="none"
              stroke={color}
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${(angle / 180) * 283} 283`}
              className="transition-all duration-700 ease-out"
            />

            {/* Tick marks */}
            {[0, 25, 50, 75, 100].map((tick) => {
              const tickAngle = ((tick / 100) * 180 - 180) * (Math.PI / 180);
              const x1 = 100 + 75 * Math.cos(tickAngle);
              const y1 = 100 + 75 * Math.sin(tickAngle);
              const x2 = 100 + 85 * Math.cos(tickAngle);
              const y2 = 100 + 85 * Math.sin(tickAngle);

              return (
                <g key={tick}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="2" />
                  <text
                    x={100 + 95 * Math.cos(tickAngle)}
                    y={100 + 95 * Math.sin(tickAngle)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs fill-slate-400"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* Needle */}
            <g className="transition-transform duration-700 ease-out" style={{ transformOrigin: '100px 100px', transform: `rotate(${angle - 90}deg)` }}>
              <line x1="100" y1="100" x2="100" y2="30" stroke={color} strokeWidth="3" strokeLinecap="round" />
              <circle cx="100" cy="100" r="8" fill={color} />
              <circle cx="100" cy="100" r="4" fill="white" />
            </g>
          </svg>

          {/* Score Display */}
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-5xl font-bold" style={{ color }}>
                {score}
              </span>
              <div className="flex flex-col items-start">
                <span
                  className="text-2xl font-bold px-2 py-0.5 rounded"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {grade}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mt-2">
              {getStatusIcon()}
              <span className="text-slate-600 font-medium">{getStatusText()}</span>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="mt-8 grid grid-cols-5 gap-2">
          <BreakdownBar label="Profit" value={breakdown.profitability} max={30} color={color} />
          <BreakdownBar label="Margin" value={breakdown.margin} max={25} color={color} />
          <BreakdownBar label="COGS" value={breakdown.cogsEfficiency} max={20} color={color} />
          <BreakdownBar label="Retire" value={breakdown.retirementPlanning} max={15} color={color} />
          <BreakdownBar label="Growth" value={breakdown.growthTrend} max={10} color={color} />
        </div>
      </div>

      {/* Recommendations */}
      {showRecommendations && recommendations.length > 0 && (
        <div className="p-6 bg-slate-50/50 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h4 className="font-semibold text-slate-900">Key Recommendations</h4>
          </div>
          <ul className="space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-xs font-medium text-slate-600 shrink-0">
                  {index + 1}
                </span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface BreakdownBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

function BreakdownBar({ label, value, max, color }: BreakdownBarProps) {
  const percentage = (value / max) * 100;

  return (
    <div className="flex flex-col items-center">
      <div className="w-full h-16 bg-slate-100 rounded-lg relative overflow-hidden">
        <div
          className="absolute bottom-0 left-0 right-0 rounded-lg transition-all duration-500"
          style={{
            height: `${percentage}%`,
            backgroundColor: color,
            opacity: 0.7,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-slate-700">
            {value}/{max}
          </span>
        </div>
      </div>
      <span className="text-xs text-slate-500 mt-1">{label}</span>
    </div>
  );
}
