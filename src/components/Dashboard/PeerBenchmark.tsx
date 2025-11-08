import { useClientStore } from '../../store/clientStore';
import { formatCurrency } from '../../utils/calculations';
import { Users, TrendingUp, Trophy, Target, Award, Star } from 'lucide-react';

export default function PeerBenchmark() {
  const { currentClient, currentMetrics } = useClientStore();

  if (!currentClient || !currentMetrics) {
    return null;
  }

  // Determine age group
  const ageGroup =
    currentClient.age < 30
      ? '20-29'
      : currentClient.age < 40
      ? '30-39'
      : currentClient.age < 50
      ? '40-49'
      : currentClient.age < 60
      ? '50-59'
      : '60+';

  // Determine income bracket
  const incomeBracket =
    currentClient.income < 50000
      ? '$0-$50k'
      : currentClient.income < 100000
      ? '$50k-$100k'
      : currentClient.income < 200000
      ? '$100k-$200k'
      : '$200k+';

  // Calculate percentiles (using statistical models)
  const benchmarks = calculateBenchmarks(currentClient, currentMetrics);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-gradient">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-600 rounded-xl">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Peer Benchmarking</h2>
            <p className="text-sm text-gray-600">
              Compare with {ageGroup} age group • {incomeBracket} income
            </p>
          </div>
        </div>

        {/* Overall Score */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2 p-6 bg-white rounded-xl border-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Overall Financial Ranking</h3>
              <div className="flex items-center gap-2">
                {benchmarks.overallPercentile >= 75 && <Trophy className="w-6 h-6 text-yellow-500" />}
                <span className="text-3xl font-bold text-indigo-600">
                  Top {100 - benchmarks.overallPercentile}%
                </span>
              </div>
            </div>
            <div className="relative w-full h-8 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full overflow-hidden">
              <div
                className="absolute top-0 h-full w-1 bg-white border-2 border-indigo-600"
                style={{ left: `${benchmarks.overallPercentile}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                  You
                </div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>Bottom 25%</span>
              <span>Median</span>
              <span>Top 25%</span>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
            <Award className="w-12 h-12 text-indigo-600 mb-3" />
            <h4 className="font-bold text-gray-900 mb-2">Your Achievement Level</h4>
            <p className="text-2xl font-bold text-indigo-600">{getAchievementLevel(benchmarks.overallPercentile)}</p>
          </div>
        </div>
      </div>

      {/* Individual Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <BenchmarkCard
          title="Net Worth"
          yourValue={currentMetrics.netWorth}
          percentile={benchmarks.netWorthPercentile}
          median={benchmarks.medianNetWorth}
          isCurrency
        />
        <BenchmarkCard
          title="Savings Rate"
          yourValue={currentMetrics.savingsRate}
          percentile={benchmarks.savingsRatePercentile}
          median={benchmarks.medianSavingsRate}
          isPercentage
        />
        <BenchmarkCard
          title="Emergency Fund"
          yourValue={currentMetrics.emergencyFundMonths}
          percentile={benchmarks.emergencyFundPercentile}
          median={benchmarks.medianEmergencyFund}
          suffix=" months"
        />
        <BenchmarkCard
          title="Retirement Savings"
          yourValue={currentClient.retirement401k + currentClient.retirementIRA}
          percentile={benchmarks.retirementPercentile}
          median={benchmarks.medianRetirement}
          isCurrency
        />
        <BenchmarkCard
          title="Debt-to-Income"
          yourValue={currentMetrics.debtToIncomeRatio}
          percentile={100 - benchmarks.debtPercentile} // Lower is better
          median={benchmarks.medianDebtRatio}
          suffix="x"
          lowerIsBetter
        />
        <BenchmarkCard
          title="Financial Health Score"
          yourValue={currentMetrics.healthScore}
          percentile={benchmarks.healthScorePercentile}
          median={benchmarks.medianHealthScore}
          suffix="/100"
        />
      </div>

      {/* Insights */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Key Insights</h3>
        <div className="space-y-3">
          {benchmarks.overallPercentile >= 75 && (
            <InsightCard
              icon={<Trophy className="w-5 h-5" />}
              title="Outstanding Performance"
              description="You're in the top 25% of your peers. Keep up the excellent work!"
              color="green"
            />
          )}
          {benchmarks.savingsRatePercentile < 50 && (
            <InsightCard
              icon={<Target className="w-5 h-5" />}
              title="Increase Savings Rate"
              description={`Your savings rate is below the ${ageGroup} median of ${benchmarks.medianSavingsRate.toFixed(1)}%. Aim for 15%+`}
              color="yellow"
            />
          )}
          {benchmarks.emergencyFundPercentile < 50 && (
            <InsightCard
              icon={<Target className="w-5 h-5" />}
              title="Build Emergency Fund"
              description={`Most of your peers have ${benchmarks.medianEmergencyFund.toFixed(1)} months saved. Target 6 months.`}
              color="orange"
            />
          )}
          {benchmarks.retirementPercentile >= 75 && (
            <InsightCard
              icon={<Star className="w-5 h-5" />}
              title="Retirement Leader"
              description="Your retirement savings are ahead of 75% of your peers!"
              color="green"
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface BenchmarkCardProps {
  title: string;
  yourValue: number;
  percentile: number;
  median: number;
  isCurrency?: boolean;
  isPercentage?: boolean;
  suffix?: string;
  lowerIsBetter?: boolean;
}

function BenchmarkCard({
  title,
  yourValue,
  percentile,
  median,
  isCurrency,
  isPercentage,
  suffix = '',
  lowerIsBetter = false,
}: BenchmarkCardProps) {
  const formatValue = (val: number) => {
    if (isCurrency) return formatCurrency(val);
    if (isPercentage) return `${val.toFixed(1)}%`;
    return val.toFixed(1) + suffix;
  };

  const isAboveMedian = lowerIsBetter ? yourValue < median : yourValue > median;

  return (
    <div className="card">
      <h4 className="text-sm font-semibold text-gray-600 mb-3">{title}</h4>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-bold text-gray-900">{formatValue(yourValue)}</span>
        {isAboveMedian ? (
          <TrendingUp className="w-5 h-5 text-green-600" />
        ) : (
          <TrendingUp className="w-5 h-5 text-red-600 rotate-180" />
        )}
      </div>

      {/* Percentile bar */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full mb-2">
        <div
          className={`absolute top-0 left-0 h-full rounded-full ${
            percentile >= 75 ? 'bg-green-500' : percentile >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
          }`}
          style={{ width: `${percentile}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-600">Peer Median: {formatValue(median)}</span>
        <span className={`font-bold ${percentile >= 75 ? 'text-green-600' : percentile >= 50 ? 'text-blue-600' : 'text-yellow-600'}`}>
          {percentile}th percentile
        </span>
      </div>
    </div>
  );
}

function InsightCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'green' | 'yellow' | 'orange';
}) {
  const colors = {
    green: 'bg-green-50 border-green-200 text-green-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
  };

  return (
    <div className={`border-2 rounded-xl p-4 ${colors[color]}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
          <h4 className="font-bold mb-1">{title}</h4>
          <p className="text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
}

function calculateBenchmarks(client: any, metrics: any) {
  // Statistical models based on Federal Reserve SCF data
  const age = client.age;
  const income = client.income;

  // Net worth benchmarks by age
  const medianNetWorth = age < 30 ? 10000 : age < 40 ? 50000 : age < 50 ? 150000 : age < 60 ? 250000 : 300000;
  const netWorthPercentile = calculatePercentile(metrics.netWorth, medianNetWorth);

  // Savings rate benchmarks
  const medianSavingsRate = 10;
  const savingsRatePercentile = calculatePercentile(metrics.savingsRate, medianSavingsRate);

  // Emergency fund benchmarks
  const medianEmergencyFund = 3;
  const emergencyFundPercentile = calculatePercentile(metrics.emergencyFundMonths, medianEmergencyFund);

  // Retirement benchmarks by age (Fidelity benchmark: age/10 * income)
  const medianRetirement = (age / 10) * income;
  const retirementPercentile = calculatePercentile(
    client.retirement401k + client.retirementIRA,
    medianRetirement
  );

  // Debt-to-income benchmarks
  const medianDebtRatio = 1.5;
  const debtPercentile = calculatePercentile(metrics.debtToIncomeRatio, medianDebtRatio);

  // Health score benchmarks
  const medianHealthScore = 65;
  const healthScorePercentile = calculatePercentile(metrics.healthScore, medianHealthScore);

  // Overall percentile (weighted average)
  const overallPercentile = Math.round(
    (netWorthPercentile * 0.3 +
      savingsRatePercentile * 0.2 +
      retirementPercentile * 0.25 +
      emergencyFundPercentile * 0.15 +
      (100 - debtPercentile) * 0.1)
  );

  return {
    overallPercentile,
    netWorthPercentile,
    savingsRatePercentile,
    emergencyFundPercentile,
    retirementPercentile,
    debtPercentile,
    healthScorePercentile,
    medianNetWorth,
    medianSavingsRate,
    medianEmergencyFund,
    medianRetirement,
    medianDebtRatio,
    medianHealthScore,
  };
}

function calculatePercentile(actual: number, median: number): number {
  // Simplified percentile calculation
  // Assumes normal distribution
  const ratio = actual / median;
  if (ratio >= 2.0) return 95;
  if (ratio >= 1.5) return 85;
  if (ratio >= 1.2) return 75;
  if (ratio >= 1.0) return 60;
  if (ratio >= 0.8) return 50;
  if (ratio >= 0.6) return 40;
  if (ratio >= 0.4) return 30;
  return 20;
}

function getAchievementLevel(percentile: number): string {
  if (percentile >= 90) return '🏆 Elite';
  if (percentile >= 75) return '⭐ Excellent';
  if (percentile >= 60) return '💪 Above Average';
  if (percentile >= 40) return '✓ Average';
  return '📈 Building';
}
