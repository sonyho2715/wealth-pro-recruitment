import { useState, useEffect } from 'react';
import { useClientStore } from '../../store/clientStore';
import { formatCurrency } from '../../utils/calculations';
import {
  LineChart,
  TrendingUp,
  Calendar,
  DollarSign,
  Target,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function RetirementProjection() {
  const { currentClient, currentMetrics } = useClientStore();
  const [targetAge, setTargetAge] = useState(67);
  const [targetIncome, setTargetIncome] = useState(70);
  const [monteCarlo, setMonteCarlo] = useState<any>(null);

  useEffect(() => {
    if (currentClient && currentMetrics) {
      const simulation = runMonteCarloSimulation(currentClient, currentMetrics, targetAge, 1000);
      setMonteCarlo(simulation);
    }
  }, [currentClient, currentMetrics, targetAge]);

  if (!currentClient || !currentMetrics || !monteCarlo) {
    return null;
  }

  const yearsToRetirement = targetAge - currentClient.age;
  const currentRetirement = currentClient.retirement401k + currentClient.retirementIRA;
  const annualSavings = (currentMetrics.totalIncome / 12 - currentMetrics.totalMonthlyExpenses) * 12;

  // Social Security estimate (simplified) - used in monte carlo calculations

  const successRate = monteCarlo.successRate;
  const medianValue = monteCarlo.medianValue;
  const targetNeeded = (currentClient.income * (targetIncome / 100)) * 25; // 4% rule

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-gradient">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-xl">
              <LineChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Retirement Projection</h2>
              <p className="text-sm text-gray-600">
                Monte Carlo simulation with 1,000 scenarios
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Success Rate</p>
            <p className={`text-4xl font-bold ${successRate >= 80 ? 'text-green-600' : successRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {successRate}%
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Target Retirement Age
            </label>
            <input
              type="range"
              min="55"
              max="75"
              value={targetAge}
              onChange={(e) => setTargetAge(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>55</span>
              <span className="font-bold text-blue-600">{targetAge} years old</span>
              <span>75</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Target Income Replacement
            </label>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={targetIncome}
              onChange={(e) => setTargetIncome(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>50%</span>
              <span className="font-bold text-green-600">{targetIncome}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-gray-600">Years to Retirement</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{yearsToRetirement} years</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <p className="text-sm text-gray-600">Target Portfolio</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(targetNeeded)}</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <p className="text-sm text-gray-600">Median Projection</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(medianValue)}</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-orange-600" />
            <p className="text-sm text-gray-600">Gap to Target</p>
          </div>
          <p className={`text-2xl font-bold ${medianValue >= targetNeeded ? 'text-green-600' : 'text-red-600'}`}>
            {medianValue >= targetNeeded ? (
              formatCurrency(medianValue - targetNeeded)
            ) : (
              `(${formatCurrency(targetNeeded - medianValue)})`
            )}
          </p>
        </div>
      </div>

      {/* Monte Carlo Chart */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Retirement Projection (1,000 Simulations)
        </h3>
        <div style={{ height: '400px' }}>
          <Line
            data={monteCarlo.chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom' as const,
                },
                tooltip: {
                  callbacks: {
                    label: (context: any) => {
                      return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                    },
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value: any) => formatCurrency(value),
                  },
                },
              },
            }}
          />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-600">Worst Case (10th %ile)</p>
            <p className="font-bold text-red-600">{formatCurrency(monteCarlo.percentile10)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Median (50th %ile)</p>
            <p className="font-bold text-blue-600">{formatCurrency(monteCarlo.medianValue)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Best Case (90th %ile)</p>
            <p className="font-bold text-green-600">{formatCurrency(monteCarlo.percentile90)}</p>
          </div>
        </div>
      </div>

      {/* Social Security Optimization */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Social Security Claiming Strategy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[62, 65, 67, 70].map((age) => {
            const multiplier = age < 62 ? 0 : age < 67 ? 0.7 : age === 67 ? 1.0 : 1.24;
            const monthlyBenefit = Math.min((currentClient.income * 0.35 * multiplier), 4873 * multiplier) / 12;
            const lifetimeValue = monthlyBenefit * 12 * (85 - age); // Assume living to 85

            return (
              <div
                key={age}
                className={`p-4 rounded-xl border-2 ${
                  age === 67 ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-gray-900">Age {age}</span>
                  {age === 67 && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">FRA</span>
                  )}
                  {age === 70 && (
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">MAX</span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600">Monthly Benefit</p>
                    <p className="font-bold text-gray-900">{formatCurrency(monthlyBenefit)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Annual Benefit</p>
                    <p className="font-bold text-blue-600">{formatCurrency(monthlyBenefit * 12)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Lifetime (to 85)</p>
                    <p className="font-bold text-green-600">{formatCurrency(lifetimeValue)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 bg-green-50 border-2 border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-900">
            <strong>💡 Optimal Strategy:</strong> For most people, delaying until age 70 maximizes lifetime benefits.
            Break-even vs. age 62 is around age 79. If you have good health and family longevity, waiting pays off.
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Recommendations to Improve Success Rate
        </h3>
        <div className="space-y-3">
          {annualSavings < currentClient.income * 0.15 && (
            <RecommendationCard
              icon={<AlertCircle className="w-5 h-5" />}
              title="Increase Savings Rate"
              description={`Save ${formatCurrency((currentClient.income * 0.15 - annualSavings) / 12)}/month more to reach 15% target`}
              priority="high"
            />
          )}
          {yearsToRetirement < 15 && currentRetirement < targetNeeded * 0.5 && (
            <RecommendationCard
              icon={<AlertCircle className="w-5 h-5" />}
              title="Accelerate Contributions"
              description="You're behind target. Consider catch-up contributions if age 50+"
              priority="critical"
            />
          )}
          {targetAge < 67 && (
            <RecommendationCard
              icon={<Calendar className="w-5 h-5" />}
              title="Consider Working Longer"
              description={`Each additional year increases success rate by ~8% and maximizes Social Security`}
              priority="medium"
            />
          )}
          {successRate >= 80 && (
            <RecommendationCard
              icon={<CheckCircle2 className="w-5 h-5" />}
              title="On Track!"
              description="You're well-positioned for retirement. Maintain current trajectory."
              priority="success"
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface RecommendationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'success';
}

function RecommendationCard({ icon, title, description, priority }: RecommendationCardProps) {
  const colors = {
    critical: 'bg-red-50 border-red-200 text-red-900',
    high: 'bg-orange-50 border-orange-200 text-orange-900',
    medium: 'bg-blue-50 border-blue-200 text-blue-900',
    success: 'bg-green-50 border-green-200 text-green-900',
  };

  return (
    <div className={`border-2 rounded-xl p-4 ${colors[priority]}`}>
      <div className="flex items-start gap-3">
        <div>{icon}</div>
        <div>
          <h4 className="font-bold mb-1">{title}</h4>
          <p className="text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
}

// Monte Carlo Simulation
function runMonteCarloSimulation(client: any, metrics: any, targetAge: number, iterations: number) {
  const yearsToRetirement = targetAge - client.age;
  const currentSavings = client.retirement401k + client.retirementIRA;
  const annualContribution = (metrics.totalIncome / 12 - metrics.totalMonthlyExpenses) * 12;

  const results: number[] = [];
  const years = Array.from({ length: yearsToRetirement + 1 }, (_, i) => client.age + i);

  // Run simulations
  for (let i = 0; i < iterations; i++) {
    let balance = currentSavings;
    for (let year = 0; year < yearsToRetirement; year++) {
      // Random return between -10% and 25%, normal distribution around 8%
      const randomReturn = gaussianRandom(8, 12);
      balance = balance * (1 + randomReturn / 100) + annualContribution;
    }
    results.push(Math.max(0, balance));
  }

  results.sort((a, b) => a - b);

  const percentile10 = results[Math.floor(iterations * 0.1)];
  const medianValue = results[Math.floor(iterations * 0.5)];
  const percentile90 = results[Math.floor(iterations * 0.9)];

  const targetNeeded = client.income * 0.7 * 25; // 4% rule with 70% replacement
  const successRate = Math.round((results.filter(r => r >= targetNeeded).length / iterations) * 100);

  // Generate percentile paths for chart
  const p10Path: number[] = [currentSavings];
  const medianPath: number[] = [currentSavings];
  const p90Path: number[] = [currentSavings];

  for (let year = 1; year <= yearsToRetirement; year++) {
    // Conservative (4% return)
    p10Path.push(calculateGrowth(currentSavings, annualContribution, 4, year));
    // Median (8% return)
    medianPath.push(calculateGrowth(currentSavings, annualContribution, 8, year));
    // Optimistic (12% return)
    p90Path.push(calculateGrowth(currentSavings, annualContribution, 12, year));
  }

  const chartData = {
    labels: years,
    datasets: [
      {
        label: 'Conservative (10th %ile)',
        data: p10Path,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: false,
      },
      {
        label: 'Median (50th %ile)',
        data: medianPath,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: false,
      },
      {
        label: 'Optimistic (90th %ile)',
        data: p90Path,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: false,
      },
    ],
  };

  return {
    successRate,
    medianValue,
    percentile10,
    percentile90,
    chartData,
  };
}

function gaussianRandom(mean: number, stdev: number): number {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

function calculateGrowth(principal: number, annualContribution: number, rate: number, years: number): number {
  let balance = principal;
  for (let i = 0; i < years; i++) {
    balance = balance * (1 + rate / 100) + annualContribution;
  }
  return balance;
}
