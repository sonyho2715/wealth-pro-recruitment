'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  FileText,
  ArrowRight,
  Loader2,
  AlertCircle,
  History,
  Settings,
} from 'lucide-react';
import NetWorthChart from './components/NetWorthChart';

interface DashboardData {
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    lastLoginAt: string | null;
  };
  hasProspectData: boolean;
  hasBusinessData: boolean;
  financialSummary: {
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    annualIncome: number;
    monthlyExpenses: number;
    lastUpdated: string | null;
  } | null;
  snapshots: Array<{
    id: string;
    date: string;
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
  }>;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ClientDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/client/dashboard');
        const result = await res.json();

        if (!res.ok) {
          if (res.status === 401) {
            router.push('/client/login');
            return;
          }
          throw new Error(result.error || 'Failed to fetch dashboard');
        }

        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboard();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { client, financialSummary, hasProspectData, snapshots } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {client.firstName}
        </h1>
        <p className="text-slate-600 mt-1">
          Track your financial progress and manage your balance sheet
        </p>
      </div>

      {/* No Data State */}
      {!hasProspectData || !financialSummary ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            No Balance Sheet Data Yet
          </h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Your financial advisor will work with you to complete your personal balance sheet.
            Once completed, you&apos;ll be able to track your progress here.
          </p>
          <Link
            href="/client/dashboard/balance-sheet"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            View Balance Sheet
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <>
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Net Worth */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  {financialSummary.netWorth >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-1">Net Worth</p>
              <p
                className={`text-2xl font-bold ${
                  financialSummary.netWorth >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(financialSummary.netWorth)}
              </p>
            </div>

            {/* Total Assets */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Wallet className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-1">Total Assets</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(financialSummary.totalAssets)}
              </p>
            </div>

            {/* Total Liabilities */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-1">Total Liabilities</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(financialSummary.totalLiabilities)}
              </p>
            </div>
          </div>

          {/* Net Worth Chart */}
          {snapshots.length >= 2 && (
            <div className="mb-8">
              <NetWorthChart snapshots={snapshots} height={220} />
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link
              href="/client/dashboard/balance-sheet"
              className="bg-white border border-slate-200 rounded-xl p-6 hover:border-emerald-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors">
                  <FileText className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700">
                    View Balance Sheet
                  </h3>
                  <p className="text-sm text-slate-600">
                    See your complete financial picture
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </div>
            </Link>

            <Link
              href="/client/dashboard/history"
              className="bg-white border border-slate-200 rounded-xl p-6 hover:border-emerald-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                  <History className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-700">
                    View History
                  </h3>
                  <p className="text-sm text-slate-600">
                    Track your progress over time
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </Link>

            <Link
              href="/client/dashboard/profile"
              className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-slate-200 transition-colors">
                  <Settings className="w-6 h-6 text-slate-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 group-hover:text-slate-700">
                    Profile Settings
                  </h3>
                  <p className="text-sm text-slate-600">
                    Manage your account
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
            </Link>
          </div>

          {/* Recent Snapshots */}
          {snapshots.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Recent Progress
              </h2>
              <div className="space-y-3">
                {snapshots.map((snapshot) => (
                  <div
                    key={snapshot.id}
                    className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {formatDate(snapshot.date)}
                      </p>
                      <p className="text-sm text-slate-600">
                        Assets: {formatCurrency(snapshot.totalAssets)} |
                        Liabilities: {formatCurrency(snapshot.totalLiabilities)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          snapshot.netWorth >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(snapshot.netWorth)}
                      </p>
                      <p className="text-xs text-slate-500">Net Worth</p>
                    </div>
                  </div>
                ))}
              </div>
              {snapshots.length >= 5 && (
                <Link
                  href="/client/dashboard/history"
                  className="mt-4 inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                >
                  View all history
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
