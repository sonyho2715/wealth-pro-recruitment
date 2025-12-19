'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  DollarSign,
  TrendingUp,
  Shield,
  Search,
  Filter,
  ChevronDown,
  Eye,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Briefcase,
  LogOut,
  ArrowUpRight,
  Sparkles,
  Target,
  Activity,
  UserPlus,
  FileText,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface Prospect {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: Date;
  financialProfile: {
    annualIncome: number;
    netWorth: number;
    protectionGap: number;
  } | null;
  insuranceNeeds: { gap: number }[];
  agentProjection: { year1Income: number } | null;
  notes: { content: string; createdAt: Date }[];
}

interface Agent {
  firstName: string;
  lastName: string;
  email: string;
  referralCode: string;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  LEAD: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'New Lead' },
  QUALIFIED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Qualified' },
  INSURANCE_CLIENT: { bg: 'bg-green-100', text: 'text-green-700', label: 'Insurance Client' },
  AGENT_PROSPECT: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Agent Prospect' },
  LICENSED_AGENT: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Licensed Agent' },
  INACTIVE: { bg: 'bg-red-100', text: 'text-red-700', label: 'Inactive' },
};

// Mini progress bar component
function MiniProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percentage = Math.min(100, Math.max(0, (value / Math.max(max, 1)) * 100));
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

// Stat card component with improved design
function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  color,
  progressValue,
  progressMax,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: { value: number; label: string };
  color: string;
  progressValue?: number;
  progressMax?: number;
}) {
  const bgColors: Record<string, string> = {
    blue: 'bg-blue-100',
    green: 'bg-emerald-100',
    amber: 'bg-amber-100',
    purple: 'bg-purple-100',
    indigo: 'bg-indigo-100',
  };
  const iconColors: Record<string, string> = {
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    amber: 'text-amber-600',
    purple: 'text-purple-600',
    indigo: 'text-indigo-600',
  };
  const progressColors: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${bgColors[color]} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColors[color]}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend.value >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            <ArrowUpRight className={`w-3 h-3 ${trend.value < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-0.5">{value}</div>
      <div className="text-sm text-slate-500 mb-2">{label}</div>
      {progressValue !== undefined && progressMax !== undefined && (
        <>
          <MiniProgressBar value={progressValue} max={progressMax} color={progressColors[color]} />
          <div className="text-xs text-slate-400 mt-1">{subValue}</div>
        </>
      )}
    </div>
  );
}

export default function DashboardClient({ agent, prospects }: { agent: Agent; prospects: Prospect[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProspects = prospects.filter(p => {
    const matchesSearch =
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const totalProspects = prospects.length;
  const newLeads = prospects.filter(p => p.status === 'LEAD').length;
  const qualified = prospects.filter(p => p.status !== 'LEAD' && p.status !== 'INACTIVE').length;
  const insuranceClients = prospects.filter(p => p.status === 'INSURANCE_CLIENT').length;
  const totalProtectionGap = prospects.reduce((sum, p) => sum + (p.financialProfile?.protectionGap || 0), 0);
  const agentProspects = prospects.filter(p => p.status === 'AGENT_PROSPECT').length;
  const conversionRate = totalProspects > 0 ? Math.round((qualified / totalProspects) * 100) : 0;
  const balanceSheetLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/b/${agent.referralCode}`;
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(balanceSheetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    await fetch('/api/agent/logout', { method: 'POST' });
    window.location.href = '/agent/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">Agent Dashboard</span>
                <p className="text-sm text-gray-500">{agent.firstName} {agent.lastName}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Welcome back, {agent.firstName}!
              </h1>
              <p className="text-slate-300 text-sm">
                {newLeads > 0 ? `You have ${newLeads} new lead${newLeads !== 1 ? 's' : ''} to follow up on.` : 'Your pipeline is up to date.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Balance Sheet Link */}
              <div className="flex items-center bg-white/10 rounded-xl px-4 py-2 gap-2">
                <FileText className="w-4 h-4 text-slate-300" />
                <span className="text-xs text-slate-300 truncate max-w-[180px]">{balanceSheetLink}</span>
                <button
                  onClick={copyLink}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition"
                  title="Copy link"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-300" />
                  )}
                </button>
                <a
                  href={balanceSheetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-white/10 rounded-lg transition"
                  title="Open link"
                >
                  <ExternalLink className="w-4 h-4 text-slate-300" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Enhanced */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="Total Prospects"
            value={totalProspects}
            color="blue"
            progressValue={qualified}
            progressMax={totalProspects}
            subValue={`${qualified} qualified`}
          />
          <StatCard
            icon={UserPlus}
            label="New Leads"
            value={newLeads}
            color="indigo"
          />
          <StatCard
            icon={Target}
            label="Conversion Rate"
            value={`${conversionRate}%`}
            color="green"
            progressValue={conversionRate}
            progressMax={100}
            subValue="leads to qualified"
          />
          <StatCard
            icon={AlertTriangle}
            label="Protection Gap"
            value={`$${(totalProtectionGap / 1000000).toFixed(1)}M`}
            color="amber"
          />
          <StatCard
            icon={Briefcase}
            label="Agent Prospects"
            value={agentProspects}
            color="purple"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link
            href="/agent/dashboard/prospects"
            className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 hover:border-blue-300 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 bg-blue-50 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-slate-900">View Prospects</div>
              <div className="text-xs text-slate-500">Manage your pipeline</div>
            </div>
          </Link>
          <Link
            href="/agent/dashboard/balance-sheets"
            className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 hover:border-emerald-300 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 bg-emerald-50 group-hover:bg-emerald-100 rounded-lg flex items-center justify-center transition">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="font-medium text-slate-900">Balance Sheets</div>
              <div className="text-xs text-slate-500">Review submissions</div>
            </div>
          </Link>
          <Link
            href="/agent/dashboard/activities"
            className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 hover:border-amber-300 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 bg-amber-50 group-hover:bg-amber-100 rounded-lg flex items-center justify-center transition">
              <Activity className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="font-medium text-slate-900">Activity Log</div>
              <div className="text-xs text-slate-500">Recent actions</div>
            </div>
          </Link>
          <Link
            href="/agent/dashboard/reports"
            className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 hover:border-purple-300 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 bg-purple-50 group-hover:bg-purple-100 rounded-lg flex items-center justify-center transition">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="font-medium text-slate-900">Reports</div>
              <div className="text-xs text-slate-500">Analytics & insights</div>
            </div>
          </Link>
        </div>

        {/* Recent Prospects Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Prospects</h2>
            <Link
              href="/agent/dashboard/prospects"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search prospects..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto pl-12 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer transition"
              >
                <option value="all">All Statuses</option>
                <option value="LEAD">New Leads</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="INSURANCE_CLIENT">Insurance Clients</option>
                <option value="AGENT_PROSPECT">Agent Prospects</option>
                <option value="LICENSED_AGENT">Licensed Agents</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Prospects Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wide">Prospect</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wide">Status</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wide">Income</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wide">Protection Gap</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wide">Agent Interest</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProspects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                          <Users className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-1">No prospects found</h3>
                        <p className="text-sm text-slate-500 mb-4 max-w-sm">
                          {searchQuery || statusFilter !== 'all'
                            ? 'Try adjusting your search or filters.'
                            : 'Share your Balance Sheet link to start collecting prospects.'}
                        </p>
                        {!searchQuery && statusFilter === 'all' && (
                          <button
                            onClick={copyLink}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition"
                          >
                            <Copy className="w-4 h-4" />
                            Copy Balance Sheet Link
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProspects.map((prospect, index) => {
                    const status = statusColors[prospect.status] || statusColors.LEAD;
                    const isLast = index === filteredProspects.length - 1;
                    return (
                      <tr key={prospect.id} className={`${!isLast ? 'border-b border-slate-100' : ''} hover:bg-slate-50/50 transition-colors`}>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-sm font-semibold text-slate-600">
                              {prospect.firstName[0]}{prospect.lastName[0]}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">
                                {prospect.firstName} {prospect.lastName}
                              </div>
                              <div className="text-sm text-slate-500">{prospect.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${status.bg} ${status.text}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          {prospect.financialProfile ? (
                            <span className="font-semibold text-slate-900">
                              ${prospect.financialProfile.annualIncome.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm">Not provided</span>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          {prospect.financialProfile && prospect.financialProfile.protectionGap > 0 ? (
                            <div className="flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                              <span className="font-semibold text-amber-600">
                                ${prospect.financialProfile.protectionGap.toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">N/A</span>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          {prospect.agentProjection ? (
                            <div className="flex items-center gap-1.5">
                              <TrendingUp className="w-4 h-4 text-emerald-500" />
                              <span className="font-semibold text-emerald-600">
                                ${prospect.agentProjection.year1Income.toLocaleString()}/yr
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">Not explored</span>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/prospect/results?id=${prospect.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            {prospect.email && (
                              <a
                                href={`mailto:${prospect.email}`}
                                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Send Email"
                              >
                                <Mail className="w-4 h-4" />
                              </a>
                            )}
                            {prospect.phone && (
                              <a
                                href={`tel:${prospect.phone}`}
                                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Call"
                              >
                                <Phone className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
