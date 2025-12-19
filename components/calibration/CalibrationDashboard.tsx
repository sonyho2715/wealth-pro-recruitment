'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Target,
  PieChart,
  BarChart3,
  Building2,
  RefreshCw,
  Download,
} from 'lucide-react';
import IndustrySelector, { IndustryOption } from './IndustrySelector';
import PercentileGauge, { HealthScoreRing, PercentileGaugeCompact } from './PercentileGauge';
import WithWithoutProjection from './WithWithoutProjection';
import CalibrationPDFExport from './CalibrationPDFExport';
import {
  BusinessMetrics,
  IndustryBenchmarks,
  CalibrationResult,
  Insight,
  calibrateBusiness,
  getRevenueTierLabel,
  getHealthScoreDisplay,
} from '@/lib/calibration-engine';

interface CalibrationDashboardProps {
  businessName: string;
  metrics: BusinessMetrics;
  previousMetrics?: BusinessMetrics;
  industries: IndustryOption[];
  initialIndustryId?: string | null;
  onIndustryChange?: (industryId: string | null) => void;
  onFetchBenchmarks: (industryId: string) => Promise<IndustryBenchmarks | null>;
  onSaveCalibration?: (result: CalibrationResult, industryId: string) => Promise<void>;
  // Agent info for CTA and PDF
  agentName?: string;
  agentPhone?: string | null;
  agentEmail?: string;
  organizationName?: string;
}

export default function CalibrationDashboard({
  businessName,
  metrics,
  previousMetrics,
  industries,
  initialIndustryId = null,
  onIndustryChange,
  onFetchBenchmarks,
  onSaveCalibration,
  agentName,
  agentPhone,
  agentEmail,
  organizationName,
}: CalibrationDashboardProps) {
  const [selectedIndustryId, setSelectedIndustryId] = useState<string | null>(initialIndustryId);
  const [benchmarks, setBenchmarks] = useState<IndustryBenchmarks | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Find selected industry
  const selectedIndustry = useMemo(
    () => industries.find((i) => i.id === selectedIndustryId) || null,
    [industries, selectedIndustryId]
  );

  // Fetch benchmarks when industry changes
  useEffect(() => {
    if (selectedIndustryId) {
      setIsLoading(true);
      setError(null);
      onFetchBenchmarks(selectedIndustryId)
        .then((data) => {
          setBenchmarks(data);
          if (!data) {
            setError('No benchmark data available for this industry. Please select another.');
          }
        })
        .catch((err) => {
          console.error('Error fetching benchmarks:', err);
          setError('Failed to load industry benchmarks.');
          setBenchmarks(null);
        })
        .finally(() => setIsLoading(false));

      onIndustryChange?.(selectedIndustryId);
    } else {
      setBenchmarks(null);
    }
  }, [selectedIndustryId, onFetchBenchmarks, onIndustryChange]);

  // Calculate calibration result
  const calibration = useMemo(() => {
    if (!benchmarks) return null;
    return calibrateBusiness(metrics, benchmarks, previousMetrics);
  }, [metrics, benchmarks, previousMetrics]);

  // Save calibration
  const handleSave = async () => {
    if (!calibration || !selectedIndustryId || !onSaveCalibration) return;

    setIsSaving(true);
    try {
      await onSaveCalibration(calibration, selectedIndustryId);
    } catch (err) {
      console.error('Error saving calibration:', err);
      setError('Failed to save calibration results.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle industry selection
  const handleIndustrySelect = (industry: IndustryOption | null) => {
    setSelectedIndustryId(industry?.id || null);
  };

  const healthDisplay = calibration ? getHealthScoreDisplay(calibration.healthScore) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{businessName}</h1>
            <p className="text-slate-500 mt-1">
              Intelligent Calibration Engine - Industry Benchmarking Analysis
            </p>
          </div>

          {calibration && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-slate-500">Revenue Tier</p>
                <p className="font-medium text-slate-900">
                  {getRevenueTierLabel(calibration.revenueTier)}
                </p>
              </div>
              {onSaveCalibration && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Save Results
                </button>
              )}
            </div>
          )}
        </div>

        {/* Industry Selector */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Your Industry for Benchmarking
          </label>
          <IndustrySelector
            industries={industries}
            selectedIndustryId={selectedIndustryId}
            onSelect={handleIndustrySelect}
            disabled={isLoading}
            showBenchmarkIndicator
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">Calibration Error</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading industry benchmarks...</p>
        </div>
      )}

      {/* Empty State */}
      {!selectedIndustryId && !isLoading && (
        <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-2">Select an Industry</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Choose your industry above to see how your business compares to peers.
            You'll get a detailed breakdown of your strengths, opportunities, and a 5-year projection.
          </p>
        </div>
      )}

      {/* Calibration Results */}
      {calibration && !isLoading && (
        <>
          {/* Health Score & Key Metrics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Health Score Ring */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center">
              <HealthScoreRing score={calibration.healthScore} size={140} />
              <div className="mt-4 flex items-center gap-2">
                {calibration.healthTrend === 'IMPROVING' && (
                  <span className="flex items-center gap-1 text-sm text-emerald-600">
                    <TrendingUp className="w-4 h-4" /> Improving
                  </span>
                )}
                {calibration.healthTrend === 'DECLINING' && (
                  <span className="flex items-center gap-1 text-sm text-red-600">
                    <TrendingDown className="w-4 h-4" /> Declining
                  </span>
                )}
                {calibration.healthTrend === 'STABLE' && (
                  <span className="flex items-center gap-1 text-sm text-slate-500">
                    <Minus className="w-4 h-4" /> Stable
                  </span>
                )}
              </div>
            </div>

            {/* Opportunity Summary */}
            <div className="lg:col-span-3 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl border border-emerald-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-slate-900">Improvement Opportunities</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <OpportunityCard
                  label="Revenue Growth"
                  value={calibration.opportunities.revenueOpportunity}
                  icon={<TrendingUp className="w-4 h-4" />}
                  color="emerald"
                />
                <OpportunityCard
                  label="Cost Savings"
                  value={calibration.opportunities.cogsOpportunity}
                  icon={<PieChart className="w-4 h-4" />}
                  color="blue"
                />
                <OpportunityCard
                  label="Labor Efficiency"
                  value={calibration.opportunities.laborOpportunity}
                  icon={<BarChart3 className="w-4 h-4" />}
                  color="purple"
                />
                <OpportunityCard
                  label="Tax Savings"
                  value={calibration.opportunities.pensionOpportunity}
                  icon={<DollarSign className="w-4 h-4" />}
                  color="amber"
                />
              </div>

              <div className="mt-4 pt-4 border-t border-emerald-200/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Total Annual Opportunity</span>
                  <span className="text-xl font-bold text-emerald-700">
                    +{formatCurrency(calibration.opportunities.totalOpportunity)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Percentile Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Industry Percentile Rankings</h3>
            <p className="text-sm text-slate-500 mb-6">
              How you compare to other {selectedIndustry?.shortTitle || selectedIndustry?.title || 'industry'} businesses
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <PercentileGauge
                label="Net Profit Margin"
                percentile={calibration.percentileScores.netProfitPercentile}
                value={formatPercent(metrics.netIncome / (metrics.revenue || 1))}
                tooltip="Net income as % of revenue"
                size="sm"
              />
              <PercentileGauge
                label="Gross Profit Margin"
                percentile={calibration.percentileScores.grossProfitPercentile}
                value={formatPercent(metrics.grossProfit / (metrics.revenue || 1))}
                tooltip="Gross profit as % of revenue"
                size="sm"
              />
              <PercentileGauge
                label="Cost Efficiency"
                percentile={calibration.percentileScores.cogsPercentile}
                value={formatPercent(metrics.costOfGoodsSold / (metrics.revenue || 1))}
                lowerIsBetter
                tooltip="Lower COGS ratio is better"
                size="sm"
              />
              <PercentileGauge
                label="Labor Costs"
                percentile={calibration.percentileScores.laborCostPercentile}
                value={metrics.wages ? formatPercent(metrics.wages / (metrics.revenue || 1)) : 'N/A'}
                lowerIsBetter
                tooltip="Labor costs as % of revenue"
                size="sm"
              />
              <PercentileGauge
                label="Liquidity (Current Ratio)"
                percentile={calibration.percentileScores.currentRatioPercentile}
                value={
                  metrics.currentAssets && metrics.currentLiabilities
                    ? (metrics.currentAssets / metrics.currentLiabilities).toFixed(2) + 'x'
                    : 'N/A'
                }
                tooltip="Current assets / current liabilities"
                size="sm"
              />
              <PercentileGauge
                label="Pension Planning"
                percentile={calibration.percentileScores.pensionPercentile}
                value={formatCurrency(metrics.pensionContributions || 0)}
                tooltip="Annual pension contributions"
                size="sm"
              />
            </div>
          </div>

          {/* Insights */}
          {calibration.insights.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-slate-900">Key Insights</h3>
              </div>

              <div className="space-y-3">
                {calibration.insights.map((insight, index) => (
                  <InsightCard key={index} insight={insight} />
                ))}
              </div>
            </div>
          )}

          {/* 5-Year Projection */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">5-Year Projection</h3>
            <p className="text-sm text-slate-500 mb-6">
              Compare your trajectory with vs. without implementing recommended improvements
            </p>

            <WithWithoutProjection
              withoutScenario={calibration.withoutScenario}
              withScenario={calibration.withScenario}
              currentRevenue={metrics.revenue}
              currentNetIncome={metrics.netIncome}
            />
          </div>

          {/* Talk to Advisor CTA */}
          {(agentName || agentEmail || agentPhone) && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">Ready to Implement These Improvements?</h3>
                  <p className="text-blue-100 text-sm">
                    {agentName ? `Contact ${agentName} to discuss your personalized strategy` : 'Contact your advisor to get started'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {agentPhone && (
                    <a
                      href={`tel:${agentPhone}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition"
                    >
                      Call Now
                    </a>
                  )}
                  {agentEmail && (
                    <a
                      href={`mailto:${agentEmail}?subject=Industry Calibration Follow-up: ${businessName}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white border border-white/30 rounded-lg font-medium hover:bg-white/30 transition"
                    >
                      Send Email
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PDF Export & Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Export this report to share with stakeholders or for your records
            </p>
            <CalibrationPDFExport
              businessName={businessName}
              industryName={selectedIndustry?.shortTitle || selectedIndustry?.title || 'Industry'}
              calibration={calibration}
              metrics={metrics}
              agentName={agentName}
              agentPhone={agentPhone}
              agentEmail={agentEmail}
              organizationName={organizationName}
            />
          </div>
        </>
      )}
    </div>
  );
}

// Helper Components

interface OpportunityCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'emerald' | 'blue' | 'purple' | 'amber';
}

function OpportunityCard({ label, value, icon, color }: OpportunityCardProps) {
  const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    amber: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="bg-white/60 rounded-xl p-3 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-1">
        <div className={`p-1 rounded ${colorClasses[color]}`}>{icon}</div>
        <span className="text-xs font-medium text-slate-600">{label}</span>
      </div>
      <div className="text-lg font-bold text-slate-900">
        {value > 0 ? `+${formatCurrency(value)}` : '-'}
      </div>
    </div>
  );
}

interface InsightCardProps {
  insight: Insight;
}

function InsightCard({ insight }: InsightCardProps) {
  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      iconColor: 'text-emerald-500',
      titleColor: 'text-emerald-700',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      iconColor: 'text-amber-500',
      titleColor: 'text-amber-700',
    },
    opportunity: {
      icon: Lightbulb,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-700',
    },
    critical: {
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-500',
      titleColor: 'text-red-700',
    },
  };

  const config = typeConfig[insight.type];
  const Icon = config.icon;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${config.bgColor} ${config.borderColor}`}>
      <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className={`font-medium ${config.titleColor}`}>{insight.title}</h4>
          <span className="text-xs px-2 py-0.5 bg-white/50 rounded-full text-slate-500">
            {insight.category}
          </span>
          {insight.percentile !== undefined && (
            <span className="text-xs font-medium text-slate-600">
              {Math.round(insight.percentile)}th percentile
            </span>
          )}
        </div>
        <p className="text-sm text-slate-600 mt-1">{insight.description}</p>
      </div>
    </div>
  );
}

// Format helpers
function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  if (absValue >= 1000000) {
    return (value < 0 ? '-' : '') + '$' + (absValue / 1000000).toFixed(1) + 'M';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return (value * 100).toFixed(1) + '%';
}
