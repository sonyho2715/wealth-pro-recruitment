'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, BarChart2, FileText } from 'lucide-react';
import CalibrationDashboard from '@/components/calibration/CalibrationDashboard';
import { BusinessMetrics, IndustryBenchmarks, CalibrationResult } from '@/lib/calibration-engine';
import { IndustryOption } from '@/components/calibration/IndustrySelector';

interface CalibrationPageClientProps {
  businessName: string;
  businessProfileId: string;
  metrics: BusinessMetrics;
  industries: IndustryOption[];
  initialIndustryId: string | null;
  agentCode: string;
  agentName: string;
  agentEmail?: string;
  agentPhone?: string | null;
  organizationName?: string | null;
  isDemo?: boolean;
}

export default function CalibrationPageClient({
  businessName,
  businessProfileId,
  metrics,
  industries,
  initialIndustryId,
  agentCode,
  agentName,
  agentEmail,
  agentPhone,
  organizationName,
  isDemo = false,
}: CalibrationPageClientProps) {
  // Fetch benchmarks for a given industry
  const handleFetchBenchmarks = useCallback(
    async (industryId: string): Promise<IndustryBenchmarks | null> => {
      try {
        const response = await fetch(
          `/api/calibration/benchmarks/${industryId}?revenue=${metrics.revenue}`
        );
        const result = await response.json();

        if (!result.success) {
          console.error('Failed to fetch benchmarks:', result.error);
          return null;
        }

        return result.data as IndustryBenchmarks;
      } catch (error) {
        console.error('Error fetching benchmarks:', error);
        return null;
      }
    },
    [metrics.revenue]
  );

  // Save calibration results
  const handleSaveCalibration = useCallback(
    async (result: CalibrationResult, industryId: string): Promise<void> => {
      if (isDemo) {
        console.log('Demo mode: calibration would be saved', result);
        return;
      }

      try {
        const response = await fetch(`/api/calibration/${businessProfileId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            industryId,
            revenueTier: result.revenueTier,

            // Percentiles
            grossProfitPercentile: result.percentileScores.grossProfitPercentile,
            netProfitPercentile: result.percentileScores.netProfitPercentile,
            cogsPercentile: result.percentileScores.cogsPercentile,
            laborCostPercentile: result.percentileScores.laborCostPercentile,
            currentRatioPercentile: result.percentileScores.currentRatioPercentile,
            debtToEquityPercentile: result.percentileScores.debtToEquityPercentile,
            pensionPercentile: result.percentileScores.pensionPercentile,

            // Composite
            healthScore: result.healthScore,
            healthTrend: result.healthTrend,

            // Opportunities
            revenueOpportunity: result.opportunities.revenueOpportunity,
            cogsOpportunity: result.opportunities.cogsOpportunity,
            laborOpportunity: result.opportunities.laborOpportunity,
            pensionOpportunity: result.opportunities.pensionOpportunity,
            totalOpportunity: result.opportunities.totalOpportunity,

            // Projections
            withoutScenario: result.withoutScenario,
            withScenario: result.withScenario,

            // Insights
            insights: result.insights,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to save calibration');
        }

        console.log('Calibration saved successfully');
      } catch (error) {
        console.error('Error saving calibration:', error);
        throw error;
      }
    },
    [businessProfileId, isDemo]
  );

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href={`/b/${agentCode}/business/results${isDemo ? '?demo=true' : `?id=${businessProfileId}`}`}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Results
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/b/${agentCode}/business/analysis${isDemo ? '?demo=true' : `?id=${businessProfileId}`}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            <BarChart2 className="w-4 h-4" />
            What-If Analysis
          </Link>
        </div>
      </div>

      {/* Organization branding */}
      {organizationName && (
        <div className="text-sm text-slate-500">
          Powered by <span className="font-medium">{organizationName}</span>
          {agentName && <span> • Your Advisor: {agentName}</span>}
        </div>
      )}

      {/* Demo banner */}
      {isDemo && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <strong>Demo Mode:</strong> You are viewing sample data for Zion Glass Company.
            Complete the{' '}
            <Link href={`/b/${agentCode}/business`} className="underline hover:no-underline">
              business balance sheet
            </Link>{' '}
            to see your own calibration.
          </p>
        </div>
      )}

      {/* Calibration Dashboard */}
      <CalibrationDashboard
        businessName={businessName}
        metrics={metrics}
        industries={industries}
        initialIndustryId={initialIndustryId}
        onFetchBenchmarks={handleFetchBenchmarks}
        onSaveCalibration={isDemo ? undefined : handleSaveCalibration}
        agentName={agentName}
        agentEmail={agentEmail}
        agentPhone={agentPhone}
        organizationName={organizationName ?? undefined}
      />
    </div>
  );
}
