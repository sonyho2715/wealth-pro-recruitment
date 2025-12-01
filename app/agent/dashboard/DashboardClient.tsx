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
  LogOut
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
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  LEAD: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'New Lead' },
  QUALIFIED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Qualified' },
  INSURANCE_CLIENT: { bg: 'bg-green-100', text: 'text-green-700', label: 'Insurance Client' },
  AGENT_PROSPECT: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Agent Prospect' },
  LICENSED_AGENT: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Licensed Agent' },
  INACTIVE: { bg: 'bg-red-100', text: 'text-red-700', label: 'Inactive' },
};

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
  const qualified = prospects.filter(p => p.status !== 'LEAD' && p.status !== 'INACTIVE').length;
  const totalProtectionGap = prospects.reduce((sum, p) => sum + (p.financialProfile?.protectionGap || 0), 0);
  const agentProspects = prospects.filter(p => p.status === 'AGENT_PROSPECT').length;

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
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card-gradient">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalProspects}</div>
                <div className="text-sm text-gray-600">Total Prospects</div>
              </div>
            </div>
          </div>

          <div className="card-gradient">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{qualified}</div>
                <div className="text-sm text-gray-600">Qualified</div>
              </div>
            </div>
          </div>

          <div className="card-gradient">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">${(totalProtectionGap / 1000000).toFixed(1)}M</div>
                <div className="text-sm text-gray-600">Protection Gap</div>
              </div>
            </div>
          </div>

          <div className="card-gradient">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{agentProspects}</div>
                <div className="text-sm text-gray-600">Agent Prospects</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card-gradient mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search prospects..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-field pl-12"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="input-field pl-12 pr-10 appearance-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="LEAD">New Leads</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="INSURANCE_CLIENT">Insurance Clients</option>
                <option value="AGENT_PROSPECT">Agent Prospects</option>
                <option value="LICENSED_AGENT">Licensed Agents</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Prospects Table */}
        <div className="card-gradient overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Prospect</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Income</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Protection Gap</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Agent Interest</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProspects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      No prospects found
                    </td>
                  </tr>
                ) : (
                  filteredProspects.map(prospect => {
                    const status = statusColors[prospect.status] || statusColors.LEAD;
                    return (
                      <tr key={prospect.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">
                            {prospect.firstName} {prospect.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{prospect.email}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {prospect.financialProfile ? (
                            <span className="font-medium text-gray-900">
                              ${prospect.financialProfile.annualIncome.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-gray-400">Not provided</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {prospect.financialProfile && prospect.financialProfile.protectionGap > 0 ? (
                            <span className="font-medium text-amber-600">
                              ${prospect.financialProfile.protectionGap.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {prospect.agentProjection ? (
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-green-500" />
                              <span className="font-medium text-green-600">
                                ${prospect.agentProjection.year1Income.toLocaleString()}/yr
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not explored</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/prospect/results?id=${prospect.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </Link>
                            {prospect.email && (
                              <a
                                href={`mailto:${prospect.email}`}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Send Email"
                              >
                                <Mail className="w-5 h-5" />
                              </a>
                            )}
                            {prospect.phone && (
                              <a
                                href={`tel:${prospect.phone}`}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Call"
                              >
                                <Phone className="w-5 h-5" />
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
