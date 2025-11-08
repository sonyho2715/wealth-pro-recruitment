import { useState } from 'react';
import { useClientStore } from '../../store/clientStore';
import { formatCurrency } from '../../utils/calculations';
import { calculateFinancialMetrics } from '../../utils/calculations';
import type { ClientData } from '../../types/financial.types';
import {
  GitCompare,
  TrendingUp,
  Calendar,
  CreditCard,
  PiggyBank,
  ArrowRight,
} from 'lucide-react';

export default function WhatIfScenarios() {
  const { currentClient, currentMetrics } = useClientStore();
  const [activeScenario, setActiveScenario] = useState<string>('savings');

  if (!currentClient || !currentMetrics) {
    return null;
  }

  const scenarios = [
    {
      id: 'savings',
      name: 'Increase Monthly Savings',
      icon: <PiggyBank className="w-5 h-5" />,
      description: 'What if you saved more each month?',
      color: 'blue',
    },
    {
      id: 'debt',
      name: 'Pay Off Debt Faster',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'What if you paid extra toward debt?',
      color: 'red',
    },
    {
      id: 'income',
      name: 'Increase Income',
      icon: <TrendingUp className="w-5 h-5" />,
      description: 'What if you earned more?',
      color: 'green',
    },
    {
      id: 'retirement',
      name: 'Delay Retirement',
      icon: <Calendar className="w-5 h-5" />,
      description: 'What if you retired later?',
      color: 'purple',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-gradient">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-600 rounded-xl">
            <GitCompare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">What-If Scenario Planning</h2>
            <p className="text-sm text-gray-600">
              See how different decisions impact your financial future
            </p>
          </div>
        </div>

        {/* Scenario Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setActiveScenario(scenario.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                activeScenario === scenario.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 bg-white'
              }`}
            >
              <div className={`text-${scenario.color}-600 mb-2`}>{scenario.icon}</div>
              <h4 className="font-semibold text-gray-900 text-sm">{scenario.name}</h4>
              <p className="text-xs text-gray-600 mt-1">{scenario.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Active Scenario */}
      {activeScenario === 'savings' && <SavingsScenario client={currentClient} />}
      {activeScenario === 'debt' && <DebtScenario client={currentClient} />}
      {activeScenario === 'income' && <IncomeScenario client={currentClient} />}
      {activeScenario === 'retirement' && <RetirementScenario client={currentClient} />}
    </div>
  );
}

function SavingsScenario({ client }: { client: ClientData }) {
  const currentMetrics = calculateFinancialMetrics(client);
  const monthlySavings = (currentMetrics.totalIncome / 12) - currentMetrics.totalMonthlyExpenses;

  const scenarios = [
    { label: 'Current', amount: monthlySavings },
    { label: '+$250/mo', amount: monthlySavings + 250 },
    { label: '+$500/mo', amount: monthlySavings + 500 },
    { label: '+$1,000/mo', amount: monthlySavings + 1000 },
  ];

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Impact of Increased Savings
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {scenarios.map((scenario, idx) => {
          const annualSavings = scenario.amount * 12;
          const tenYearValue = calculateFutureValue(scenario.amount * 12, 7, 10);
          const twentyYearValue = calculateFutureValue(scenario.amount * 12, 7, 20);

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border-2 ${
                idx === 0 ? 'border-gray-300 bg-gray-50' : 'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-gray-900">{scenario.label}</span>
                {idx > 0 && <TrendingUp className="w-4 h-4 text-green-600" />}
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Per Year</p>
                  <p className="font-bold text-gray-900">{formatCurrency(annualSavings)}</p>
                </div>
                <div>
                  <p className="text-gray-600">10 Years @ 7%</p>
                  <p className="font-bold text-blue-600">{formatCurrency(tenYearValue)}</p>
                </div>
                <div>
                  <p className="text-gray-600">20 Years @ 7%</p>
                  <p className="font-bold text-green-600">{formatCurrency(twentyYearValue)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Insight:</strong> Saving an extra $500/month could give you{' '}
          {formatCurrency(calculateFutureValue(6000, 7, 20) - calculateFutureValue(monthlySavings * 12, 7, 20))}{' '}
          more in retirement (20 years @ 7% return)
        </p>
      </div>
    </div>
  );
}

function DebtScenario({ client }: { client: ClientData }) {
  const totalDebt = client.creditCards + client.studentLoans + client.carLoans;
  const currentMetrics = calculateFinancialMetrics(client);
  const monthlyExcess = (currentMetrics.totalIncome / 12) - currentMetrics.totalMonthlyExpenses;

  const scenarios = [
    { label: 'Minimum Only', payment: totalDebt * 0.02 },
    { label: '+$200/mo', payment: totalDebt * 0.02 + 200 },
    { label: '+$500/mo', payment: totalDebt * 0.02 + 500 },
    { label: 'Maximum Effort', payment: monthlyExcess * 0.7 },
  ];

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Debt Payoff Acceleration
      </h3>

      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Total Debt</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(totalDebt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Avg Interest</p>
            <p className="text-xl font-bold text-gray-900">12%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Monthly Excess</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(monthlyExcess)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {scenarios.map((scenario, idx) => {
          const monthsToPayoff = calculateDebtPayoffTime(totalDebt, scenario.payment, 0.12);
          const totalInterest = (scenario.payment * monthsToPayoff) - totalDebt;
          const years = Math.floor(monthsToPayoff / 12);
          const months = Math.round(monthsToPayoff % 12);

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border-2 ${
                idx === 0 ? 'border-gray-300 bg-gray-50' : 'border-green-200 bg-green-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-gray-900">{scenario.label}</span>
                {idx > 0 && <ArrowRight className="w-4 h-4 text-green-600" />}
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Monthly Payment</p>
                  <p className="font-bold text-gray-900">{formatCurrency(scenario.payment)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Payoff Time</p>
                  <p className="font-bold text-blue-600">
                    {years}y {months}m
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total Interest</p>
                  <p className="font-bold text-red-600">{formatCurrency(totalInterest)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
        <p className="text-sm text-green-900">
          <strong>💡 Insight:</strong> Paying an extra $500/month saves you{' '}
          {formatCurrency(
            (scenarios[0].payment * calculateDebtPayoffTime(totalDebt, scenarios[0].payment, 0.12) - totalDebt) -
            (scenarios[2].payment * calculateDebtPayoffTime(totalDebt, scenarios[2].payment, 0.12) - totalDebt)
          )}{' '}
          in interest and gets you debt-free{' '}
          {Math.floor((calculateDebtPayoffTime(totalDebt, scenarios[0].payment, 0.12) -
                      calculateDebtPayoffTime(totalDebt, scenarios[2].payment, 0.12)) / 12)} years faster!
        </p>
      </div>
    </div>
  );
}

function IncomeScenario({ client }: { client: ClientData }) {
  const scenarios = [
    { label: 'Current', income: client.income },
    { label: '+10%', income: client.income * 1.1 },
    { label: '+25%', income: client.income * 1.25 },
    { label: '+50%', income: client.income * 1.5 },
  ];

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Income Growth Scenarios
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {scenarios.map((scenario, idx) => {
          const modifiedClient = { ...client, income: scenario.income };
          const metrics = calculateFinancialMetrics(modifiedClient);
          const monthlySavings = (scenario.income / 12) - metrics.totalMonthlyExpenses;

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border-2 ${
                idx === 0 ? 'border-gray-300 bg-gray-50' : 'border-green-200 bg-green-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-gray-900">{scenario.label}</span>
                {idx > 0 && <TrendingUp className="w-4 h-4 text-green-600" />}
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Annual Income</p>
                  <p className="font-bold text-gray-900">{formatCurrency(scenario.income)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Monthly Savings</p>
                  <p className="font-bold text-green-600">{formatCurrency(monthlySavings)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Savings Rate</p>
                  <p className="font-bold text-blue-600">{metrics.savingsRate.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-600">10 Years Saved</p>
                  <p className="font-bold text-purple-600">
                    {formatCurrency(calculateFutureValue(monthlySavings * 12, 7, 10))}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
        <p className="text-sm text-purple-900">
          <strong>💡 Career Growth Tips:</strong> A 25% income increase could add{' '}
          {formatCurrency(calculateFutureValue((scenarios[2].income - scenarios[0].income) * 0.2, 7, 10))}{' '}
          to your retirement in 10 years (assuming 20% savings rate)
        </p>
      </div>
    </div>
  );
}

function RetirementScenario({ client }: { client: ClientData }) {
  const scenarios = [
    { label: 'Retire at 62', age: 62 },
    { label: 'Retire at 65', age: 65 },
    { label: 'Retire at 67', age: 67 },
    { label: 'Retire at 70', age: 70 },
  ];

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Retirement Age Comparison
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {scenarios.map((scenario, idx) => {
          const yearsToRetirement = scenario.age - client.age;
          const currentRetirement = client.retirement401k + client.retirementIRA;
          const annualContribution = client.income * 0.15; // Assume 15% savings
          const futureValue = calculateFutureValue(annualContribution, 7, yearsToRetirement, currentRetirement);
          const socialSecurityMultiplier = scenario.age < 67 ? 0.7 : scenario.age === 67 ? 1.0 : 1.24;
          const estimatedSS = (client.income * 0.3 * socialSecurityMultiplier) / 12;
          const monthlyIncome = (futureValue * 0.04) / 12 + estimatedSS;

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border-2 ${
                idx === 2 ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-gray-900">{scenario.label}</span>
                {idx === 2 && <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Full</span>}
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Years to Save</p>
                  <p className="font-bold text-gray-900">{yearsToRetirement} years</p>
                </div>
                <div>
                  <p className="text-gray-600">Portfolio @ 7%</p>
                  <p className="font-bold text-green-600">{formatCurrency(futureValue)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Social Security</p>
                  <p className="font-bold text-blue-600">{formatCurrency(estimatedSS)}/mo</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Monthly</p>
                  <p className="font-bold text-purple-600">{formatCurrency(monthlyIncome)}/mo</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
        <p className="text-sm text-orange-900">
          <strong>💡 Social Security Insight:</strong> Waiting until age 70 increases your benefit by 24% compared to
          full retirement age (67), and by 77% compared to early retirement at 62.
        </p>
      </div>
    </div>
  );
}

// Helper functions
function calculateFutureValue(
  annualContribution: number,
  returnRate: number,
  years: number,
  startingBalance: number = 0
): number {
  const monthlyRate = returnRate / 100 / 12;
  const months = years * 12;
  const monthlyContribution = annualContribution / 12;

  let balance = startingBalance;
  for (let i = 0; i < months; i++) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
  }
  return balance;
}

function calculateDebtPayoffTime(principal: number, monthlyPayment: number, annualRate: number): number {
  const monthlyRate = annualRate / 12;
  if (monthlyPayment <= principal * monthlyRate) {
    return 999; // Never pays off
  }
  return Math.log(monthlyPayment / (monthlyPayment - principal * monthlyRate)) / Math.log(1 + monthlyRate);
}
