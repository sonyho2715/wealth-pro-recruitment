import { useClientStore } from '../../store/clientStore';
import { formatCurrency } from '../../utils/calculations';
import {
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Home,
  GraduationCap,
  Plane,
  Heart,
  Shield,
  PiggyBank,
} from 'lucide-react';

export default function GoalsAndRecommendations() {
  const { currentClient, currentMetrics } = useClientStore();

  if (!currentClient || !currentMetrics) {
    return null;
  }

  // Calculate actionable recommendations
  const recommendations = generateRecommendations(currentClient, currentMetrics);

  // Define common financial goals with progress
  const goals = [
    {
      id: 'emergency',
      name: 'Emergency Fund',
      icon: <Shield className="w-5 h-5" />,
      target: currentMetrics.totalMonthlyExpenses * 6,
      current: currentClient.checking + currentClient.savings,
      color: 'blue',
      priority: 'high',
    },
    {
      id: 'retirement',
      name: 'Retirement Savings',
      icon: <PiggyBank className="w-5 h-5" />,
      target: currentClient.income * 10, // 10x income rule of thumb
      current: currentClient.retirement401k + currentClient.retirementIRA,
      color: 'green',
      priority: 'high',
    },
    {
      id: 'debt-free',
      name: 'Debt Freedom',
      icon: <Target className="w-5 h-5" />,
      target: currentMetrics.totalLiabilities,
      current: currentMetrics.totalLiabilities - (currentClient.creditCards + currentClient.studentLoans + currentClient.carLoans),
      color: 'purple',
      priority: 'medium',
      inverse: true, // Progress = paying down
    },
  ];

  return (
    <div className="space-y-6">
      {/* Action Items Header */}
      <div className="card-gradient">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-600 rounded-xl">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recommended Actions</h2>
            <p className="text-sm text-gray-600">
              Prioritized strategies to improve your financial health
            </p>
          </div>
        </div>

        {/* Critical Actions */}
        <div className="space-y-3">
          {recommendations
            .filter((r) => r.priority === 'critical')
            .map((rec) => (
              <ActionCard key={rec.id} recommendation={rec} />
            ))}
        </div>

        {/* High Priority Actions */}
        {recommendations.filter((r) => r.priority === 'high').length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">High Priority</h3>
            <div className="space-y-3">
              {recommendations
                .filter((r) => r.priority === 'high')
                .map((rec) => (
                  <ActionCard key={rec.id} recommendation={rec} />
                ))}
            </div>
          </div>
        )}

        {/* Medium Priority Actions */}
        {recommendations.filter((r) => r.priority === 'medium').length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Worth Considering</h3>
            <div className="space-y-3">
              {recommendations
                .filter((r) => r.priority === 'medium')
                .map((rec) => (
                  <ActionCard key={rec.id} recommendation={rec} />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Financial Goals */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-900">Financial Goals Progress</h3>
        </div>

        <div className="space-y-6">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      </div>

      {/* Long-Term Goals (Aspirational) */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-6 h-6 text-pink-600" />
          <h3 className="text-xl font-bold text-gray-900">Life Goals to Plan For</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LifeGoalCard
            icon={<Home className="w-6 h-6" />}
            name="Home Purchase"
            description="Save for down payment"
            color="blue"
          />
          <LifeGoalCard
            icon={<GraduationCap className="w-6 h-6" />}
            name="Education Fund"
            description="College savings for kids"
            color="green"
          />
          <LifeGoalCard
            icon={<Plane className="w-6 h-6" />}
            name="Dream Vacation"
            description="Travel goals"
            color="purple"
          />
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          💡 Tip: Schedule a planning session to set specific targets for these goals
        </p>
      </div>
    </div>
  );
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  icon: React.ReactNode;
  timeframe: string;
}

function generateRecommendations(client: any, metrics: any): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Critical: Life Insurance Gap
  if (metrics.lifeInsuranceGap > 0) {
    recommendations.push({
      id: 'life-insurance',
      title: 'Close Life Insurance Gap',
      description: `Increase coverage by ${formatCurrency(metrics.lifeInsuranceGap)} to protect your family`,
      impact: `Protects ${formatCurrency(metrics.lifeInsuranceNeeded)} in family income`,
      priority: 'critical',
      category: 'Protection',
      icon: <Shield className="w-5 h-5" />,
      timeframe: 'This week',
    });
  }

  // Critical: No Emergency Fund
  if (metrics.emergencyFundMonths < 3) {
    recommendations.push({
      id: 'emergency-fund',
      title: 'Build Emergency Fund',
      description: `Save ${formatCurrency((6 - metrics.emergencyFundMonths) * metrics.totalMonthlyExpenses)} to reach 6 months`,
      impact: 'Protects against unexpected expenses',
      priority: 'critical',
      category: 'Savings',
      icon: <AlertTriangle className="w-5 h-5" />,
      timeframe: 'Next 12 months',
    });
  }

  // High: High-interest debt
  if (client.creditCards > 0) {
    const monthsToPayoff = Math.ceil(client.creditCards / (metrics.totalIncome / 12 - metrics.totalMonthlyExpenses));
    recommendations.push({
      id: 'credit-card-debt',
      title: 'Pay Off Credit Card Debt',
      description: `Eliminate ${formatCurrency(client.creditCards)} in high-interest debt`,
      impact: `Save ~${formatCurrency(client.creditCards * 0.18)} per year in interest`,
      priority: 'high',
      category: 'Debt',
      icon: <TrendingUp className="w-5 h-5" />,
      timeframe: `${monthsToPayoff} months`,
    });
  }

  // High: Low savings rate
  if (metrics.savingsRate < 15) {
    const targetSavings = metrics.totalIncome * 0.15 - (metrics.totalIncome - metrics.totalMonthlyExpenses * 12);
    recommendations.push({
      id: 'increase-savings',
      title: 'Increase Savings Rate',
      description: `Save an additional ${formatCurrency(targetSavings / 12)}/month to reach 15% target`,
      impact: `${formatCurrency(targetSavings)} more per year toward goals`,
      priority: 'high',
      category: 'Savings',
      icon: <PiggyBank className="w-5 h-5" />,
      timeframe: 'Starting next month',
    });
  }

  // Medium: No disability insurance
  if (!client.hasDisabilityInsurance && client.income > 50000) {
    recommendations.push({
      id: 'disability-insurance',
      title: 'Consider Disability Insurance',
      description: 'Protect your income in case of illness or injury',
      impact: `Covers 60% of ${formatCurrency(client.income)} income`,
      priority: 'medium',
      category: 'Protection',
      icon: <Shield className="w-5 h-5" />,
      timeframe: 'Next 3 months',
    });
  }

  // Medium: Retirement savings below age benchmark
  const retirementTarget = client.income * (client.age / 10); // Fidelity's age-based benchmark
  const retirementShortfall = retirementTarget - (client.retirement401k + client.retirementIRA);
  if (retirementShortfall > 0 && client.age >= 30) {
    recommendations.push({
      id: 'retirement-catchup',
      title: 'Accelerate Retirement Savings',
      description: `You should have ~${formatCurrency(retirementTarget)} saved by age ${client.age}`,
      impact: 'Stay on track for comfortable retirement',
      priority: 'medium',
      category: 'Retirement',
      icon: <Clock className="w-5 h-5" />,
      timeframe: 'Ongoing',
    });
  }

  // Medium: No estate plan
  if (!client.hasEstatePlan && metrics.netWorth > 100000) {
    recommendations.push({
      id: 'estate-plan',
      title: 'Create Estate Plan',
      description: 'Set up will, power of attorney, and healthcare directive',
      impact: 'Protect your family and assets',
      priority: 'medium',
      category: 'Planning',
      icon: <CheckCircle2 className="w-5 h-5" />,
      timeframe: 'Next 6 months',
    });
  }

  return recommendations;
}

interface ActionCardProps {
  recommendation: Recommendation;
}

function ActionCard({ recommendation }: ActionCardProps) {
  const priorityColors = {
    critical: 'bg-red-50 border-red-200',
    high: 'bg-orange-50 border-orange-200',
    medium: 'bg-blue-50 border-blue-200',
    low: 'bg-gray-50 border-gray-200',
  };

  const priorityBadge = {
    critical: 'bg-red-600 text-white',
    high: 'bg-orange-600 text-white',
    medium: 'bg-blue-600 text-white',
    low: 'bg-gray-600 text-white',
  };

  return (
    <div className={`border-2 rounded-xl p-4 ${priorityColors[recommendation.priority]}`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg ${priorityBadge[recommendation.priority]}`}>
          {recommendation.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h4 className="font-bold text-gray-900">{recommendation.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${priorityBadge[recommendation.priority]}`}>
              {recommendation.priority.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm mt-3">
            <div className="flex items-center gap-1 text-green-700">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">{recommendation.impact}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{recommendation.timeframe}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Goal {
  id: string;
  name: string;
  icon: React.ReactNode;
  target: number;
  current: number;
  color: string;
  priority: string;
  inverse?: boolean;
}

function GoalCard({ goal }: { goal: Goal }) {
  const progress = goal.inverse
    ? (goal.current / goal.target) * 100
    : (goal.current / goal.target) * 100;
  const displayProgress = Math.min(progress, 100);
  const remaining = goal.target - goal.current;

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  const textColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={textColorClasses[goal.color as keyof typeof textColorClasses]}>
            {goal.icon}
          </span>
          <span className="font-semibold text-gray-900">{goal.name}</span>
        </div>
        <span className="text-2xl font-bold text-gray-900">{displayProgress.toFixed(0)}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div
          className={`h-3 rounded-full transition-all ${colorClasses[goal.color as keyof typeof colorClasses]}`}
          style={{ width: `${displayProgress}%` }}
        />
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <span>Current: {formatCurrency(goal.current)}</span>
        <span>Target: {formatCurrency(goal.target)}</span>
      </div>

      {remaining > 0 && !goal.inverse && (
        <p className="text-sm text-gray-500 mt-2">
          {formatCurrency(remaining)} remaining to reach goal
        </p>
      )}
    </div>
  );
}

interface LifeGoalCardProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  color: 'blue' | 'green' | 'purple';
}

function LifeGoalCard({ icon, name, description, color }: LifeGoalCardProps) {
  const colorClasses: Record<'blue' | 'green' | 'purple', string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
  };

  return (
    <div className={`border-2 rounded-xl p-4 text-center ${colorClasses[color]}`}>
      <div className="flex justify-center mb-3">{icon}</div>
      <h4 className="font-bold text-gray-900 mb-1">{name}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
