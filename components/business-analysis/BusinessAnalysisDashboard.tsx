'use client';

import { useState, useMemo, useCallback } from 'react';
import { BarChart3, Download, Calculator, Phone, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import WhatIfSliders from './WhatIfSliders';
import BeforeAfterComparison from './BeforeAfterComparison';
import BusinessHealthGauge from './BusinessHealthGauge';
import TrendCharts from './TrendCharts';
import {
  YearlyFinancials,
  ScenarioInputs,
  calculateScenario,
  calculateHealthScore,
  getZionGlassSampleData,
  formatCurrency,
} from '@/lib/business-calculations';

interface BusinessAnalysisDashboardProps {
  businessName: string;
  agentCode: string;
  agentName: string;
  agentPhone?: string | null;
  agentEmail?: string;
  organizationName?: string;
  organizationLogo?: string | null;
  primaryColor?: string;
  yearlyData?: YearlyFinancials[];
  currentYearData?: {
    revenue: number;
    cogs: number;
    totalDeductions: number;
    netIncome: number;
    currentPension: number;
  };
}

export default function BusinessAnalysisDashboard({
  businessName,
  agentCode,
  agentName,
  agentPhone,
  agentEmail,
  organizationName = 'Wealth Pro',
  organizationLogo,
  primaryColor = '#0f172a',
  yearlyData,
  currentYearData,
}: BusinessAnalysisDashboardProps) {
  // Use sample data if no real data provided
  const historicalData = useMemo(() => {
    if (yearlyData && yearlyData.length > 0) return yearlyData;
    return getZionGlassSampleData();
  }, [yearlyData]);

  // Get the most recent year's data for scenario calculations
  const latestYear = historicalData[historicalData.length - 1];
  const baseData = currentYearData || {
    revenue: latestYear.netReceipts,
    cogs: latestYear.costOfGoodsSold,
    totalDeductions: latestYear.totalDeductions,
    netIncome: latestYear.netIncome,
    currentPension: latestYear.pensionContributions,
  };

  // Scenario state
  const [scenarioInputs, setScenarioInputs] = useState<ScenarioInputs>({
    priceAdjustment: 0,
    costReduction: 0,
    pensionContribution: baseData.currentPension,
  });

  // Calculate scenario results
  const scenarioResults = useMemo(
    () => calculateScenario(baseData, scenarioInputs),
    [baseData, scenarioInputs]
  );

  // Calculate health score
  const healthScore = useMemo(
    () =>
      calculateHealthScore(
        {
          revenue: scenarioResults.adjustedRevenue,
          cogs: scenarioResults.adjustedCOGS,
          netIncome: scenarioResults.adjustedNetIncome,
          pensionContributions: scenarioInputs.pensionContribution,
        },
        historicalData
      ),
    [scenarioResults, scenarioInputs.pensionContribution, historicalData]
  );

  // Check if any changes have been made
  const hasChanges =
    scenarioInputs.priceAdjustment > 0 ||
    scenarioInputs.costReduction > 0 ||
    scenarioInputs.pensionContribution !== baseData.currentPension;

  // Handle scenario change from sliders
  const handleScenarioChange = useCallback((inputs: ScenarioInputs) => {
    setScenarioInputs(inputs);
  }, []);

  // Active tab state
  const [activeTab, setActiveTab] = useState<'scenario' | 'trends'>('scenario');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/b/${agentCode}/business/results`}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div className="flex items-center gap-2">
              {organizationLogo ? (
                <img src={organizationLogo} alt={organizationName} className="h-8 w-auto" />
              ) : (
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-lg font-semibold text-slate-900">{businessName}</h1>
                <p className="text-xs text-slate-500">Business Analysis Dashboard</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                // TODO: Implement PDF export
                alert('PDF export coming soon!');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
            <a
              href={`tel:${agentPhone}`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition"
              style={{ backgroundColor: primaryColor }}
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">Talk to {agentName.split(' ')[0]}</span>
            </a>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('scenario')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'scenario'
                  ? 'text-slate-900 border-slate-900'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
              }`}
            >
              <Calculator className="w-4 h-4 inline mr-2" />
              What-If Analysis
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'trends'
                  ? 'text-slate-900 border-slate-900'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Historical Trends
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'scenario' ? (
          <>
            {/* Scenario Analysis */}
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-medium text-slate-900 mb-2">
                What-If Scenario Analysis
              </h2>
              <p className="text-slate-600">
                Adjust the sliders below to model different scenarios and see the immediate impact on
                your business financials.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column: Sliders */}
              <div className="lg:col-span-1 space-y-6">
                <WhatIfSliders
                  currentRevenue={baseData.revenue}
                  currentCOGS={baseData.cogs}
                  currentPension={baseData.currentPension}
                  onScenarioChange={handleScenarioChange}
                />

                {/* Health Score */}
                <BusinessHealthGauge health={healthScore} showRecommendations={true} />
              </div>

              {/* Right Column: Results */}
              <div className="lg:col-span-2 space-y-6">
                <BeforeAfterComparison results={scenarioResults} hasChanges={hasChanges} />

                {/* Key Insights */}
                {hasChanges && (
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
                    <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {scenarioInputs.priceAdjustment > 0 && (
                        <InsightCard
                          title="Price Increase Strategy"
                          description={`A ${(scenarioInputs.priceAdjustment * 100).toFixed(0)}% price increase would generate ${formatCurrency(scenarioResults.revenueIncrease)} in additional revenue.`}
                        />
                      )}
                      {scenarioInputs.costReduction > 0 && (
                        <InsightCard
                          title="Cost Optimization"
                          description={`Reducing COGS by ${(scenarioInputs.costReduction * 100).toFixed(0)}% would save ${formatCurrency(scenarioResults.costSavings)} annually.`}
                        />
                      )}
                      {scenarioInputs.pensionContribution > 0 && (
                        <InsightCard
                          title="Tax-Advantaged Savings"
                          description={`Contributing ${formatCurrency(scenarioInputs.pensionContribution)} to retirement would save approximately ${formatCurrency(scenarioResults.taxSavings)} in taxes.`}
                        />
                      )}
                      {scenarioResults.netBenefit > 0 && (
                        <InsightCard
                          title="Total Benefit"
                          description={`Combined strategies would improve your financial position by ${formatCurrency(scenarioResults.netBenefit)}.`}
                          highlight
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Historical Trends */}
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-medium text-slate-900 mb-2">
                Historical Performance Trends
              </h2>
              <p className="text-slate-600">
                Review your business performance over multiple years to identify patterns and
                opportunities.
              </p>
            </div>

            <TrendCharts data={historicalData} showCOGSRatio={true} />
          </>
        )}
      </main>

      {/* Footer CTA */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Ready to Optimize Your Business?</h3>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Schedule a consultation with {agentName} to discuss these strategies and create a
            personalized action plan for your business.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {agentPhone && (
              <a
                href={`tel:${agentPhone}`}
                className="inline-flex items-center gap-2 px-6 py-3 text-white font-medium rounded-xl transition"
                style={{ backgroundColor: primaryColor }}
              >
                <Phone className="w-5 h-5" />
                Call {agentPhone}
              </a>
            )}
            {agentEmail && (
              <a
                href={`mailto:${agentEmail}?subject=Business Analysis Follow-up - ${businessName}`}
                className="inline-flex items-center gap-2 px-6 py-3 text-slate-700 font-medium bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Email {agentName.split(' ')[0]}
              </a>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-8">
            This analysis tool is for educational purposes only and does not constitute financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Insight Card Component
interface InsightCardProps {
  title: string;
  description: string;
  highlight?: boolean;
}

function InsightCard({ title, description, highlight = false }: InsightCardProps) {
  return (
    <div
      className={`p-4 rounded-xl ${
        highlight ? 'bg-emerald-500/20 border border-emerald-400/30' : 'bg-white/10'
      }`}
    >
      <h4 className={`font-medium mb-1 ${highlight ? 'text-emerald-300' : 'text-white'}`}>
        {title}
      </h4>
      <p className="text-sm text-slate-300">{description}</p>
    </div>
  );
}
