import { useMemo } from 'react';
import { useClientStore } from '../../store/clientStore';
import { formatCurrency } from '../../utils/calculations';
import {
  Target,
  TrendingUp,
  PiggyBank,
  Home,
  GraduationCap,
  Calendar,
  DollarSign,
  Award,
  Gift,
  CheckCircle,
  AlertCircle,
  Edit3,
} from 'lucide-react';

export default function GoalProgress() {
  const { currentClient, currentMetrics } = useClientStore();

  const goals = useMemo(() => {
    if (!currentClient?.goals || !currentMetrics?.goalProgress) return [];

    const goalsArray = [];

    if (currentClient.goals.retirementAge && currentMetrics.goalProgress.retirementReadiness !== undefined) {
      const monthlySavings = currentMetrics.goalMonthlySavings?.retirementShortfall;
      goalsArray.push({
        icon: <TrendingUp className="w-6 h-6" />,
        title: 'Retirement Readiness',
        target: `Retire at ${currentClient.goals.retirementAge}`,
        current: `${currentMetrics.goalProgress.retirementReadiness.toFixed(1)}% Ready`,
        progress: currentMetrics.goalProgress.retirementReadiness,
        monthlySavings,
        color: 'blue',
      });
    }

    if (currentClient.goals.emergencyFundMonths && currentMetrics.goalProgress.emergencyFund !== undefined) {
      const targetAmount = currentMetrics.totalMonthlyExpenses * currentClient.goals.emergencyFundMonths;
      const monthlySavings = currentMetrics.goalMonthlySavings?.emergencyFund;
      goalsArray.push({
        icon: <PiggyBank className="w-6 h-6" />,
        title: 'Emergency Fund',
        target: `${currentClient.goals.emergencyFundMonths} months (${formatCurrency(targetAmount)})`,
        current: `${currentMetrics.goalProgress.emergencyFund.toFixed(1)}% Complete`,
        progress: currentMetrics.goalProgress.emergencyFund,
        monthlySavings,
        color: 'green',
      });
    }

    if (currentClient.goals.homeDownPayment && currentMetrics.goalProgress.homeDownPayment !== undefined) {
      const monthlySavings = currentMetrics.goalMonthlySavings?.homeDownPayment;
      goalsArray.push({
        icon: <Home className="w-6 h-6" />,
        title: 'Home Down Payment',
        target: formatCurrency(currentClient.goals.homeDownPayment),
        current: `${currentMetrics.goalProgress.homeDownPayment.toFixed(1)}% Saved`,
        progress: currentMetrics.goalProgress.homeDownPayment,
        monthlySavings,
        color: 'purple',
      });
    }

    if (currentClient.goals.educationSavings && currentMetrics.goalProgress.educationSavings !== undefined) {
      const monthlySavings = currentMetrics.goalMonthlySavings?.educationSavings;
      goalsArray.push({
        icon: <GraduationCap className="w-6 h-6" />,
        title: 'Education Savings',
        target: formatCurrency(currentClient.goals.educationSavings),
        current: `${currentMetrics.goalProgress.educationSavings.toFixed(1)}% Saved`,
        progress: currentMetrics.goalProgress.educationSavings,
        monthlySavings,
        color: 'orange',
      });
    }

    if (currentClient.goals.debtFreeDate && currentMetrics.goalProgress.debtFreeProgress !== undefined) {
      const targetDate = new Date(currentClient.goals.debtFreeDate);
      goalsArray.push({
        icon: <Calendar className="w-6 h-6" />,
        title: 'Debt Freedom',
        target: `By ${targetDate.toLocaleDateString()}`,
        current: `${currentMetrics.goalProgress.debtFreeProgress.toFixed(1)}% Complete`,
        progress: currentMetrics.goalProgress.debtFreeProgress,
        color: 'red',
      });
    }

    if (currentClient.goals.netWorthTarget && currentMetrics.goalProgress.netWorthProgress !== undefined) {
      goalsArray.push({
        icon: <Award className="w-6 h-6" />,
        title: 'Net Worth Target',
        target: formatCurrency(currentClient.goals.netWorthTarget),
        current: `${currentMetrics.goalProgress.netWorthProgress.toFixed(1)}% Achieved`,
        progress: currentMetrics.goalProgress.netWorthProgress,
        color: 'indigo',
      });
    }

    if (currentClient.goals.annualSavingsTarget && currentMetrics.goalProgress.savingsProgress !== undefined) {
      goalsArray.push({
        icon: <DollarSign className="w-6 h-6" />,
        title: 'Annual Savings',
        target: formatCurrency(currentClient.goals.annualSavingsTarget),
        current: `${currentMetrics.goalProgress.savingsProgress.toFixed(1)}% On Track`,
        progress: currentMetrics.goalProgress.savingsProgress,
        color: 'teal',
      });
    }

    if (currentClient.goals.majorPurchase?.description && currentMetrics.goalProgress.majorPurchaseProgress !== undefined) {
      const targetDate = currentClient.goals.majorPurchase.targetDate
        ? new Date(currentClient.goals.majorPurchase.targetDate).toLocaleDateString()
        : 'TBD';
      const monthlySavings = currentMetrics.goalMonthlySavings?.majorPurchase;
      goalsArray.push({
        icon: <Gift className="w-6 h-6" />,
        title: currentClient.goals.majorPurchase.description,
        target: `${formatCurrency(currentClient.goals.majorPurchase.amount || 0)} by ${targetDate}`,
        current: `${currentMetrics.goalProgress.majorPurchaseProgress.toFixed(1)}% Saved`,
        progress: currentMetrics.goalProgress.majorPurchaseProgress,
        monthlySavings,
        color: 'pink',
      });
    }

    return goalsArray;
  }, [currentClient, currentMetrics]);

  if (!currentClient || !currentMetrics || goals.length === 0) {
    return (
      <div className="card text-center py-12">
        <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Goals Set</h3>
        <p className="text-gray-600 mb-4">
          Set financial goals in the Client Input section to track your progress here.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
          <Edit3 className="w-4 h-4" />
          <span>Go to Client Input → Financial Goals section</span>
        </div>
      </div>
    );
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-600';
    if (progress >= 75) return 'bg-blue-600';
    if (progress >= 50) return 'bg-yellow-600';
    if (progress >= 25) return 'bg-orange-600';
    return 'bg-red-600';
  };

  const getProgressStatus = (progress: number) => {
    if (progress >= 100) return { icon: <CheckCircle className="w-5 h-5" />, color: 'text-green-600', text: 'Achieved!' };
    if (progress >= 75) return { icon: <CheckCircle className="w-5 h-5" />, color: 'text-blue-600', text: 'Almost There' };
    if (progress >= 50) return { icon: <Target className="w-5 h-5" />, color: 'text-yellow-600', text: 'On Track' };
    if (progress >= 25) return { icon: <AlertCircle className="w-5 h-5" />, color: 'text-orange-600', text: 'In Progress' };
    return { icon: <AlertCircle className="w-5 h-5" />, color: 'text-red-600', text: 'Just Starting' };
  };

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    teal: 'bg-teal-100 text-teal-600',
    pink: 'bg-pink-100 text-pink-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="text-center flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Financial Goals</h2>
          <p className="text-gray-600">Track your progress toward achieving your financial goals</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-2 border-blue-200 rounded-lg text-blue-700">
          <Edit3 className="w-4 h-4" />
          <span className="text-sm font-medium">Edit goals in Client Input</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal, index) => {
          const status = getProgressStatus(goal.progress);
          return (
            <div key={index} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${colorClasses[goal.color as keyof typeof colorClasses]}`}>
                    {goal.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{goal.title}</h3>
                    <p className="text-sm text-gray-600">{goal.target}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 ${status.color}`}>
                  {status.icon}
                  <span className="text-xs font-semibold">{status.text}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{goal.current}</span>
                  <span className="font-bold text-gray-900">{goal.progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(goal.progress)}`}
                    style={{ width: `${Math.min(100, goal.progress)}%` }}
                  />
                </div>
                {goal.monthlySavings && goal.monthlySavings > 0 && goal.progress < 100 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 font-medium">Monthly Savings Needed:</span>
                      <span className="font-bold text-blue-600">{formatCurrency(goal.monthlySavings)}/mo</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
