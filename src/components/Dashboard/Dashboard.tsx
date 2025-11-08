import { useState, lazy, Suspense, memo, useMemo, useCallback } from 'react';
import { useClientStore } from '../../store/clientStore';
import { formatCurrency, formatPercentage } from '../../utils/calculations';

// Lazy load dashboard sections for better performance
const LivingBalanceSheet = lazy(() => import('./LivingBalanceSheet'));
const GoalsAndRecommendations = lazy(() => import('./GoalsAndRecommendations'));
const WhatIfScenarios = lazy(() => import('./WhatIfScenarios'));
const RetirementProjection = lazy(() => import('./RetirementProjection'));
const PeerBenchmark = lazy(() => import('./PeerBenchmark'));
const TaxOptimization = lazy(() => import('./TaxOptimization'));
const BusinessOwnerDashboard = lazy(() => import('./BusinessOwnerDashboard'));
const LifePlanning = lazy(() => import('./LifePlanning'));
const CashFlowProjection = lazy(() => import('./CashFlowProjection'));
const EnhancedInsurance = lazy(() => import('./EnhancedInsurance'));
const AdvancedAnalytics = lazy(() => import('./AdvancedAnalytics'));
const GoalProgress = lazy(() => import('./GoalProgress'));
const RiskAssessment = lazy(() => import('../RiskAssessment/RiskAssessment'));
const ActionItems = lazy(() => import('./ActionItems'));
const DebtPayoffCalculator = lazy(() => import('./DebtPayoffCalculator'));
const CollegePlanning = lazy(() => import('./CollegePlanning'));
const PortfolioAnalysis = lazy(() => import('./PortfolioAnalysis'));
const BeneficiaryBreakdown = lazy(() => import('./BeneficiaryBreakdown'));
const WithoutInsuranceCalculator = lazy(() => import('./WithoutInsuranceCalculator'));
const ComparisonMode = lazy(() => import('./ComparisonMode'));
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Shield,
  PiggyBank,
  CreditCard,
  Activity,
  GitCompare,
  LineChart,
  Users,
  Receipt,
  Briefcase,
  Target,
  Sparkles,
  BarChart,
  Loader2,
} from 'lucide-react';

// Loading component for Suspense fallback
function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      <span className="ml-3 text-gray-600">Loading section...</span>
    </div>
  );
}

export default function Dashboard() {
  const { currentClient, currentMetrics } = useClientStore();
  const [activeSection, setActiveSection] = useState<string>('overview');

  // Memoize helper functions to avoid recreating them on every render
  const getHealthScoreColor = useCallback((score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  }, []);

  const getHealthScoreLabel = useCallback((score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Improvement';
    return 'Critical';
  }, []);

  // Memoize section configuration
  const sections = useMemo(() => [
    { id: 'overview', name: 'Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'actions', name: 'Action Items', icon: <Target className="w-4 h-4" /> },
    { id: 'risk', name: 'Risk Assessment', icon: <Shield className="w-4 h-4" /> },
    { id: 'insurance', name: 'Insurance Quotes', icon: <Shield className="w-4 h-4" /> },
    { id: 'goals', name: 'Financial Goals', icon: <Target className="w-4 h-4" /> },
    { id: 'cashflow', name: 'Cash Flow', icon: <BarChart className="w-4 h-4" /> },
    { id: 'college', name: 'College Planning', icon: <Target className="w-4 h-4" /> },
    { id: 'portfolio', name: 'Portfolio Analysis', icon: <BarChart className="w-4 h-4" /> },
    { id: 'planning', name: 'Life Planning', icon: <Target className="w-4 h-4" /> },
    { id: 'analytics', name: 'Advanced Analytics', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'whatif', name: 'What-If', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'retirement', name: 'Retirement', icon: <LineChart className="w-4 h-4" /> },
    { id: 'debt', name: 'Debt Payoff', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'peers', name: 'Benchmarks', icon: <Users className="w-4 h-4" /> },
    { id: 'tax', name: 'Tax Optimization', icon: <Receipt className="w-4 h-4" /> },
    { id: 'business', name: 'Business Owner', icon: <Briefcase className="w-4 h-4" /> },
  ], []);

  // Memoize calculated values from metrics
  const monthlySurplus = useMemo(() => {
    if (!currentMetrics) return 0;
    return currentMetrics.totalIncome / 12 - currentMetrics.totalMonthlyExpenses;
  }, [currentMetrics]);

  const healthScoreColor = useMemo(() => {
    if (!currentMetrics) return '';
    return getHealthScoreColor(currentMetrics.healthScore);
  }, [currentMetrics, getHealthScoreColor]);

  const healthScoreLabel = useMemo(() => {
    if (!currentMetrics) return '';
    return getHealthScoreLabel(currentMetrics.healthScore);
  }, [currentMetrics, getHealthScoreLabel]);

  if (!currentClient || !currentMetrics) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="card-gradient">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              {section.icon}
              <span>{section.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Section Content */}
      {activeSection === 'overview' && (
        <div className="space-y-8">
          {/* Critical Alerts - MOVED TO TOP */}
          {currentMetrics.lifeInsuranceGap > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 animate-pulse-slow">
              <div className="flex items-start gap-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-900 mb-2">
                    ⚠️ CRITICAL: Life Insurance Protection Gap
                  </h3>
                  <p className="text-red-800 mb-3">
                    You have a <strong>{formatCurrency(currentMetrics.lifeInsuranceGap)}</strong> gap in
                    life insurance coverage. Your family would struggle financially if something
                    happened to you.
                  </p>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <p className="text-red-600">Current Coverage:</p>
                      <p className="font-bold text-red-900">
                        {formatCurrency(currentClient.lifeInsuranceCoverage)}
                      </p>
                    </div>
                    <div>
                      <p className="text-red-600">Recommended Coverage:</p>
                      <p className="font-bold text-red-900">
                        {formatCurrency(currentMetrics.lifeInsuranceNeeded)}
                      </p>
                    </div>
                    <div>
                      <p className="text-red-600">Years of Income:</p>
                      <p className="font-bold text-red-900">
                        {(currentClient.lifeInsuranceCoverage / currentMetrics.totalIncome).toFixed(1)}x
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Insurance Sales Conversion Components */}
          {currentMetrics.lifeInsuranceGap > 0 && (
            <>
              {/* Beneficiary Breakdown */}
              <Suspense fallback={<SectionLoader />}>
                <BeneficiaryBreakdown />
              </Suspense>

              {/* Without Insurance Calculator */}
              <Suspense fallback={<SectionLoader />}>
                <WithoutInsuranceCalculator />
              </Suspense>

              {/* Coverage Comparison Mode */}
              <Suspense fallback={<SectionLoader />}>
                <ComparisonMode />
              </Suspense>
            </>
          )}

          {/* Financial Snapshot Section */}
          <Suspense fallback={<SectionLoader />}>
            <LivingBalanceSheet />
          </Suspense>

          {/* Goals & Recommendations Section */}
          <Suspense fallback={<SectionLoader />}>
            <GoalsAndRecommendations />
          </Suspense>

          {/* Divider */}
          <div className="border-t-2 border-gray-200 pt-8">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Health Score & Key Metrics</h2>
              <p className="text-sm text-gray-600 mt-1">
                Detailed analysis for {currentClient.name} • Age {currentClient.age}
              </p>
            </div>
          </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Net Worth"
          value={formatCurrency(currentMetrics.netWorth)}
          icon={<DollarSign />}
          trend={currentMetrics.netWorth > 0 ? 'up' : 'down'}
          color="blue"
        />
        <MetricCard
          title="Annual Income"
          value={formatCurrency(currentMetrics.totalIncome)}
          icon={<TrendingUp />}
          color="green"
        />
        <MetricCard
          title="Total Assets"
          value={formatCurrency(currentMetrics.totalAssets)}
          icon={<PiggyBank />}
          color="purple"
        />
        <MetricCard
          title="Total Liabilities"
          value={formatCurrency(currentMetrics.totalLiabilities)}
          icon={<CreditCard />}
          color="orange"
        />
      </div>

      {/* Financial Health Score */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Financial Health Score</h3>
          <span className={`px-4 py-2 rounded-full font-bold text-2xl ${healthScoreColor}`}>
            {currentMetrics.healthScore}/100
          </span>
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{healthScoreLabel}</span>
            <span>{currentMetrics.healthScore}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                currentMetrics.healthScore >= 80
                  ? 'bg-green-600'
                  : currentMetrics.healthScore >= 60
                  ? 'bg-blue-600'
                  : currentMetrics.healthScore >= 40
                  ? 'bg-yellow-600'
                  : 'bg-red-600'
              }`}
              style={{ width: `${currentMetrics.healthScore}%` }}
            />
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(currentMetrics.healthScoreBreakdown).map(([key, value]) => (
            <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              <p className="text-lg font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Ratios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold">Savings Rate</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatPercentage(currentMetrics.savingsRate, 1)}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {currentMetrics.savingsRate >= 15 ? 'Excellent!' : 'Target: 15%+'}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold">Emergency Fund</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {currentMetrics.emergencyFundMonths.toFixed(1)} months
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {currentMetrics.emergencyFundMonths >= 6 ? 'Well protected' : 'Target: 6 months'}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <CreditCard className="w-6 h-6 text-orange-600" />
            <h3 className="font-semibold">Debt-to-Income</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {currentMetrics.debtToIncomeRatio.toFixed(1)}x
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {currentMetrics.debtToIncomeRatio <= 2 ? 'Healthy level' : 'Target: ≤2x'}
          </p>
        </div>
      </div>

      {/* Monthly Cash Flow */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Monthly Cash Flow</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Monthly Income</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(currentMetrics.totalIncome / 12)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Monthly Expenses</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(currentMetrics.totalMonthlyExpenses)}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600 mb-2">Monthly Surplus/Deficit</p>
            <p
              className={`text-3xl font-bold ${
                monthlySurplus > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(monthlySurplus)}
            </p>
          </div>
        </div>
      </div>
        </div>
      )}

      {/* Action Items */}
      {activeSection === 'actions' && (
        <Suspense fallback={<SectionLoader />}>
          <ActionItems />
        </Suspense>
      )}

      {/* Financial Goals */}
      {activeSection === 'goals' && (
        <Suspense fallback={<SectionLoader />}>
          <GoalProgress />
        </Suspense>
      )}

      {/* Risk Assessment */}
      {activeSection === 'risk' && (
        <Suspense fallback={<SectionLoader />}>
          <RiskAssessment />
        </Suspense>
      )}

      {/* Cash Flow Projection */}
      {activeSection === 'cashflow' && (
        <Suspense fallback={<SectionLoader />}>
          <CashFlowProjection />
        </Suspense>
      )}

      {/* College Planning */}
      {activeSection === 'college' && (
        <Suspense fallback={<SectionLoader />}>
          <CollegePlanning />
        </Suspense>
      )}

      {/* Portfolio Analysis */}
      {activeSection === 'portfolio' && (
        <Suspense fallback={<SectionLoader />}>
          <PortfolioAnalysis />
        </Suspense>
      )}

      {/* Life Planning */}
      {activeSection === 'planning' && (
        <Suspense fallback={<SectionLoader />}>
          <LifePlanning />
        </Suspense>
      )}

      {/* Enhanced Insurance */}
      {activeSection === 'insurance' && (
        <Suspense fallback={<SectionLoader />}>
          <EnhancedInsurance />
        </Suspense>
      )}

      {/* Advanced Analytics */}
      {activeSection === 'analytics' && (
        <Suspense fallback={<SectionLoader />}>
          <AdvancedAnalytics />
        </Suspense>
      )}

      {/* What-If Scenarios */}
      {activeSection === 'whatif' && (
        <Suspense fallback={<SectionLoader />}>
          <WhatIfScenarios />
        </Suspense>
      )}

      {/* Retirement Projection */}
      {activeSection === 'retirement' && (
        <Suspense fallback={<SectionLoader />}>
          <RetirementProjection />
        </Suspense>
      )}

      {/* Debt Strategy */}
      {activeSection === 'debt' && (
        <Suspense fallback={<SectionLoader />}>
          <DebtPayoffCalculator />
        </Suspense>
      )}

      {/* Peer Benchmarking */}
      {activeSection === 'peers' && (
        <Suspense fallback={<SectionLoader />}>
          <PeerBenchmark />
        </Suspense>
      )}

      {/* Tax Optimization */}
      {activeSection === 'tax' && (
        <Suspense fallback={<SectionLoader />}>
          <TaxOptimization />
        </Suspense>
      )}

      {/* Business Owner Dashboard */}
      {activeSection === 'business' && (
        <Suspense fallback={<SectionLoader />}>
          <BusinessOwnerDashboard />
        </Suspense>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  color: 'blue' | 'green' | 'purple' | 'orange';
}

// Memoize MetricCard to prevent unnecessary re-renders
const MetricCard = memo(function MetricCard({ title, value, icon, trend, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        {trend && (
          <div className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
            {trend === 'up' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
});
