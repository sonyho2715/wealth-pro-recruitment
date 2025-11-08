import { useState } from 'react';
import { useClientStore } from '../../store/clientStore';
import { formatCurrency } from '../../utils/calculations';
import {
  CreditCard,
  Zap,
  Mountain,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';

interface Debt {
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
}

export default function DebtStrategy() {
  const { currentClient, currentMetrics } = useClientStore();
  const [extraPayment, setExtraPayment] = useState(500);
  const [method, setMethod] = useState<'avalanche' | 'snowball'>('avalanche');

  if (!currentClient || !currentMetrics) {
    return null;
  }

  // Build debt list
  const debts: Debt[] = [];
  if (currentClient.creditCards > 0) {
    debts.push({
      name: 'Credit Cards',
      balance: currentClient.creditCards,
      rate: 18.0,
      minPayment: currentClient.creditCards * 0.02,
    });
  }
  if (currentClient.carLoans > 0) {
    debts.push({
      name: 'Car Loans',
      balance: currentClient.carLoans,
      rate: 5.5,
      minPayment: currentClient.carLoans * 0.015,
    });
  }
  if (currentClient.studentLoans > 0) {
    debts.push({
      name: 'Student Loans',
      balance: currentClient.studentLoans,
      rate: 4.5,
      minPayment: currentClient.studentLoans * 0.01,
    });
  }
  if (currentClient.otherDebts > 0) {
    debts.push({
      name: 'Other Debts',
      balance: currentClient.otherDebts,
      rate: 8.0,
      minPayment: currentClient.otherDebts * 0.015,
    });
  }

  if (debts.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Debt-Free!</h3>
          <p className="text-gray-600">
            Congratulations! You have no consumer debt. Keep up the great work!
          </p>
        </div>
      </div>
    );
  }

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);

  // Calculate both strategies
  const avalancheResult = calculatePayoffStrategy([...debts], extraPayment, 'avalanche');
  const snowballResult = calculatePayoffStrategy([...debts], extraPayment, 'snowball');

  const activeResult = method === 'avalanche' ? avalancheResult : snowballResult;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-gradient">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-xl">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Debt Payoff Strategy</h2>
              <p className="text-sm text-gray-600">
                Compare methods to become debt-free faster
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Debt</p>
            <p className="text-4xl font-bold text-red-600">{formatCurrency(totalDebt)}</p>
          </div>
        </div>

        {/* Extra Payment Slider */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Extra Monthly Payment
          </label>
          <input
            type="range"
            min="0"
            max="2000"
            step="50"
            value={extraPayment}
            onChange={(e) => setExtraPayment(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>$0</span>
            <span className="font-bold text-green-600">{formatCurrency(extraPayment)}/month</span>
            <span>$2,000</span>
          </div>
        </div>
      </div>

      {/* Strategy Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Avalanche Method */}
        <div
          onClick={() => setMethod('avalanche')}
          className={`card cursor-pointer transition-all ${
            method === 'avalanche'
              ? 'ring-4 ring-blue-500 bg-blue-50'
              : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Mountain className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Avalanche Method</h3>
              <p className="text-sm text-gray-600">Highest interest first</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Payoff Time:</span>
              <span className="font-bold text-blue-600">
                {Math.floor(avalancheResult.months / 12)}y {avalancheResult.months % 12}m
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Interest:</span>
              <span className="font-bold text-red-600">
                {formatCurrency(avalancheResult.totalInterest)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Paid:</span>
              <span className="font-bold text-gray-900">
                {formatCurrency(avalancheResult.totalPaid)}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Best for:</strong> Minimizing interest - saves the most money overall
            </p>
          </div>
        </div>

        {/* Snowball Method */}
        <div
          onClick={() => setMethod('snowball')}
          className={`card cursor-pointer transition-all ${
            method === 'snowball'
              ? 'ring-4 ring-purple-500 bg-purple-50'
              : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Snowball Method</h3>
              <p className="text-sm text-gray-600">Smallest balance first</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Payoff Time:</span>
              <span className="font-bold text-purple-600">
                {Math.floor(snowballResult.months / 12)}y {snowballResult.months % 12}m
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Interest:</span>
              <span className="font-bold text-red-600">
                {formatCurrency(snowballResult.totalInterest)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Paid:</span>
              <span className="font-bold text-gray-900">
                {formatCurrency(snowballResult.totalPaid)}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-purple-100 rounded-lg">
            <p className="text-sm text-purple-900">
              <strong>Best for:</strong> Motivation - quick wins build momentum
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Insight */}
      <div className="card-highlight">
        <div className="flex items-start gap-3">
          <DollarSign className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Which Method is Better?</h4>
            <p className="text-gray-700 mb-3">
              The Avalanche method saves you{' '}
              <strong className="text-green-600">
                {formatCurrency(Math.abs(snowballResult.totalInterest - avalancheResult.totalInterest))}
              </strong>{' '}
              in interest compared to Snowball.
            </p>
            <p className="text-gray-600 text-sm">
              However, if you need psychological wins, Snowball pays off{' '}
              <strong>{snowballResult.payoffOrder[0].name}</strong> first in{' '}
              {Math.floor(snowballResult.payoffOrder[0].monthsToPayoff)} months, giving you an early victory.
            </p>
          </div>
        </div>
      </div>

      {/* Payoff Timeline */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {method === 'avalanche' ? 'Avalanche' : 'Snowball'} Payoff Timeline
        </h3>

        <div className="space-y-4">
          {activeResult.payoffOrder.map((debt, idx) => {
            const progress = ((totalDebt - debt.remainingWhenPaid) / totalDebt) * 100;
            const yearsMonths = formatMonthsToYears(debt.monthsToPayoff);

            return (
              <div key={idx} className="border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white font-bold rounded-full text-sm">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-gray-900">{debt.name}</h4>
                      <p className="text-sm text-gray-600">
                        {debt.rate.toFixed(1)}% APR • {formatCurrency(debt.balance)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{yearsMonths}</p>
                    <p className="text-xs text-gray-600">to payoff</p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-red-500 to-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${100 - progress}%` }}
                  />
                </div>

                <div className="mt-2 flex justify-between text-xs text-gray-600">
                  <span>Interest: {formatCurrency(debt.interestPaid)}</span>
                  <span>Total: {formatCurrency(debt.balance + debt.interestPaid)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <h4 className="font-bold text-green-900">Debt-Free Date</h4>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {getDebtFreeDate(activeResult.months)}
          </p>
          <p className="text-sm text-green-800 mt-2">
            You'll save {formatCurrency(activeResult.totalInterest)} in interest over {Math.floor(activeResult.months / 12)} years
          </p>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Tips to Accelerate Debt Payoff
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TipCard
            title="Negotiate Lower Rates"
            description="Call creditors to request lower APRs. Even 2-3% reduction saves thousands."
          />
          <TipCard
            title="Use Windfalls Wisely"
            description="Tax refunds, bonuses, and gifts go straight to highest-rate debt."
          />
          <TipCard
            title="Side Hustle Income"
            description="Dedicate all extra income to debt. Even $300/month makes huge impact."
          />
          <TipCard
            title="Stop New Debt"
            description="Freeze credit cards. Pay cash only. Break the debt cycle."
          />
        </div>
      </div>
    </div>
  );
}

function TipCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
      <h4 className="font-bold text-blue-900 mb-2">{title}</h4>
      <p className="text-sm text-blue-800">{description}</p>
    </div>
  );
}

interface PayoffResult {
  months: number;
  totalInterest: number;
  totalPaid: number;
  payoffOrder: Array<{
    name: string;
    balance: number;
    rate: number;
    monthsToPayoff: number;
    interestPaid: number;
    remainingWhenPaid: number;
  }>;
}

function calculatePayoffStrategy(
  debts: Debt[],
  extraPayment: number,
  method: 'avalanche' | 'snowball'
): PayoffResult {
  // Sort debts based on method
  if (method === 'avalanche') {
    debts.sort((a, b) => b.rate - a.rate); // Highest rate first
  } else {
    debts.sort((a, b) => a.balance - b.balance); // Smallest balance first
  }

  const payoffOrder: PayoffResult['payoffOrder'] = [];
  let totalMonths = 0;
  let totalInterestPaid = 0;
  let availableExtra = extraPayment;

  // Create copies to track balances
  const workingDebts = debts.map(d => ({ ...d }));

  while (workingDebts.length > 0) {
    totalMonths++;

    // Pay minimum on all debts
    for (const debt of workingDebts) {
      const interest = (debt.balance * (debt.rate / 100)) / 12;
      const principal = Math.min(debt.minPayment - interest, debt.balance);
      debt.balance -= principal;
      totalInterestPaid += interest;
    }

    // Apply extra payment to first debt
    if (availableExtra > 0 && workingDebts.length > 0) {
      const targetDebt = workingDebts[0];
      const extraApplied = Math.min(availableExtra, targetDebt.balance);
      targetDebt.balance -= extraApplied;
    }

    // Check for paid-off debts
    const paidOff = workingDebts.filter(d => d.balance <= 0);
    if (paidOff.length > 0) {
      for (const debt of paidOff) {
        const originalDebt = debts.find(d => d.name === debt.name)!;
        payoffOrder.push({
          name: debt.name,
          balance: originalDebt.balance,
          rate: debt.rate,
          monthsToPayoff: totalMonths,
          interestPaid: 0, // Simplified
          remainingWhenPaid: workingDebts.reduce((sum, d) => sum + d.balance, 0),
        });
      }
      workingDebts.splice(0, paidOff.length);
    }

    // Safety check
    if (totalMonths > 600) break; // Max 50 years
  }

  return {
    months: totalMonths,
    totalInterest: totalInterestPaid,
    totalPaid: debts.reduce((sum, d) => sum + d.balance, 0) + totalInterestPaid,
    payoffOrder,
  };
}

function formatMonthsToYears(months: number): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years === 0) return `${remainingMonths}mo`;
  if (remainingMonths === 0) return `${years}yr`;
  return `${years}yr ${remainingMonths}mo`;
}

function getDebtFreeDate(months: number): string {
  const now = new Date();
  const future = new Date(now);
  future.setMonth(future.getMonth() + months);
  return future.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
