'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Snapshot {
  id: string;
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  notes: string | null;
  changes: {
    netWorthChange: number;
    assetsChange: number;
    liabilitiesChange: number;
  } | null;
}

interface HistoryData {
  snapshots: Snapshot[];
  hasProspect: boolean;
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
    month: 'long',
    day: 'numeric',
  });
}

function ChangeIndicator({ value }: { value: number }) {
  if (value > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-600 text-sm">
        <TrendingUp className="w-4 h-4" />
        +{formatCurrency(value)}
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-red-600 text-sm">
        <TrendingDown className="w-4 h-4" />
        {formatCurrency(value)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-slate-500 text-sm">
      <Minus className="w-4 h-4" />
      No change
    </span>
  );
}

function SnapshotCard({ snapshot, isFirst }: { snapshot: Snapshot; isFirst: boolean }) {
  const [isExpanded, setIsExpanded] = useState(isFirst);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Calendar className="w-5 h-5 text-slate-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-slate-900">{formatDate(snapshot.date)}</p>
            <p className="text-sm text-slate-600">
              Net Worth: <span className={snapshot.netWorth >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                {formatCurrency(snapshot.netWorth)}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {snapshot.changes && (
            <ChangeIndicator value={snapshot.changes.netWorthChange} />
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-slate-200 p-5 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-600 mb-1">Total Assets</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(snapshot.totalAssets)}
              </p>
              {snapshot.changes && (
                <div className="mt-2">
                  <ChangeIndicator value={snapshot.changes.assetsChange} />
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-600 mb-1">Total Liabilities</p>
              <p className="text-xl font-bold text-amber-600">
                {formatCurrency(snapshot.totalLiabilities)}
              </p>
              {snapshot.changes && (
                <div className="mt-2">
                  {/* Liabilities decreasing is good */}
                  <span className={`inline-flex items-center gap-1 text-sm ${
                    snapshot.changes.liabilitiesChange < 0 ? 'text-emerald-600' :
                    snapshot.changes.liabilitiesChange > 0 ? 'text-red-600' : 'text-slate-500'
                  }`}>
                    {snapshot.changes.liabilitiesChange < 0 ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : snapshot.changes.liabilitiesChange > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <Minus className="w-4 h-4" />
                    )}
                    {snapshot.changes.liabilitiesChange === 0
                      ? 'No change'
                      : formatCurrency(Math.abs(snapshot.changes.liabilitiesChange))}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-600 mb-1">Net Worth</p>
              <p className={`text-xl font-bold ${snapshot.netWorth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(snapshot.netWorth)}
              </p>
              {snapshot.changes && (
                <div className="mt-2">
                  <ChangeIndicator value={snapshot.changes.netWorthChange} />
                </div>
              )}
            </div>
          </div>

          {snapshot.notes && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
              <p className="text-sm text-slate-500 mb-1">Notes</p>
              <p className="text-slate-700">{snapshot.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const [data, setData] = useState<HistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/client/history');
        const result = await res.json();

        if (!res.ok) {
          if (res.status === 401) {
            router.push('/client/login');
            return;
          }
          throw new Error(result.error || 'Failed to fetch history');
        }

        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading your history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading History</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const snapshots = data?.snapshots || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <Link
        href="/client/dashboard"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">Financial History</h1>
      <p className="text-slate-600 mb-8">
        Track how your financial picture has changed over time
      </p>

      {/* No Data State */}
      {snapshots.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            No History Yet
          </h2>
          <p className="text-slate-600 max-w-md mx-auto">
            Your financial history will appear here as snapshots are created.
            Work with your advisor to build your financial timeline.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          {snapshots.length >= 2 && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white mb-8">
              <h2 className="text-lg font-medium mb-4">Overall Progress</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-emerald-100 text-sm mb-1">Starting Net Worth</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(snapshots[snapshots.length - 1].netWorth)}
                  </p>
                </div>
                <div>
                  <p className="text-emerald-100 text-sm mb-1">Current Net Worth</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(snapshots[0].netWorth)}
                  </p>
                </div>
                <div>
                  <p className="text-emerald-100 text-sm mb-1">Total Change</p>
                  <p className="text-2xl font-bold flex items-center gap-2">
                    {snapshots[0].netWorth - snapshots[snapshots.length - 1].netWorth >= 0 ? (
                      <TrendingUp className="w-6 h-6" />
                    ) : (
                      <TrendingDown className="w-6 h-6" />
                    )}
                    {formatCurrency(snapshots[0].netWorth - snapshots[snapshots.length - 1].netWorth)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Snapshot List */}
          <div className="space-y-4">
            {snapshots.map((snapshot, index) => (
              <SnapshotCard
                key={snapshot.id}
                snapshot={snapshot}
                isFirst={index === 0}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
