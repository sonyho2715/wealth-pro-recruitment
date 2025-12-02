'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  ChevronDown,
  Eye,
  Mail,
  Phone,
  TrendingUp,
  FileText,
  MoreVertical,
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
  agentProjection: {
    year1Income: number;
    year3Income: number;
    year5Income: number;
  } | null;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  LEAD: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'New Lead' },
  QUALIFIED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Qualified' },
  INSURANCE_CLIENT: { bg: 'bg-green-100', text: 'text-green-700', label: 'Insurance Client' },
  AGENT_PROSPECT: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Agent Prospect' },
  LICENSED_AGENT: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Licensed Agent' },
  INACTIVE: { bg: 'bg-red-100', text: 'text-red-700', label: 'Inactive' },
};

export default function ProspectsClient({ prospects }: { prospects: Prospect[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredProspects = prospects.filter((p) => {
    const matchesSearch =
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.phone && p.phone.includes(searchQuery));
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (prospectId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/prospects/${prospectId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Prospects</h1>
        <p className="text-gray-600">
          Manage and track all your prospects in one place.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="card-gradient mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          <div className="relative sm:w-64">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field pl-12 pr-10 appearance-none cursor-pointer w-full"
            >
              <option value="all">All Statuses</option>
              <option value="LEAD">New Leads</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="INSURANCE_CLIENT">Insurance Clients</option>
              <option value="AGENT_PROSPECT">Agent Prospects</option>
              <option value="LICENSED_AGENT">Licensed Agents</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredProspects.length}</span> of{' '}
          <span className="font-semibold text-gray-900">{prospects.length}</span> prospects
        </p>
      </div>

      {/* Prospects Table */}
      <div className="card-gradient overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-sm">
                  Prospect
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-sm">
                  Status
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-sm">
                  Annual Income
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-sm">
                  Protection Gap
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-sm">
                  Agent Interest
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProspects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    {searchQuery || statusFilter !== 'all'
                      ? 'No prospects match your filters'
                      : 'No prospects yet. Start by creating a new prospect.'}
                  </td>
                </tr>
              ) : (
                filteredProspects.map((prospect) => {
                  const status = statusColors[prospect.status] || statusColors.LEAD;
                  return (
                    <tr
                      key={prospect.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      {/* Prospect Name & Email */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {prospect.firstName[0]}
                            {prospect.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {prospect.firstName} {prospect.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{prospect.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenMenuId(openMenuId === prospect.id ? null : prospect.id)
                            }
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text} hover:opacity-80 transition-opacity`}
                          >
                            {status.label}
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          {openMenuId === prospect.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[180px]">
                                {Object.entries(statusColors).map(([key, value]) => (
                                  <button
                                    key={key}
                                    onClick={() => {
                                      handleStatusChange(prospect.id, key);
                                      setOpenMenuId(null);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                                      prospect.status === key ? 'bg-gray-50 font-medium' : ''
                                    }`}
                                  >
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${value.bg} ${value.text}`}>
                                      {value.label}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Annual Income */}
                      <td className="py-4 px-4">
                        {prospect.financialProfile ? (
                          <span className="font-medium text-gray-900">
                            ${Number(prospect.financialProfile.annualIncome).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">Not provided</span>
                        )}
                      </td>

                      {/* Protection Gap */}
                      <td className="py-4 px-4">
                        {prospect.financialProfile &&
                        Number(prospect.financialProfile.protectionGap) > 0 ? (
                          <span className="font-medium text-amber-600">
                            ${Number(prospect.financialProfile.protectionGap).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>

                      {/* Agent Interest */}
                      <td className="py-4 px-4">
                        {prospect.agentProjection ? (
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <div>
                              <p className="font-medium text-green-600 text-sm">
                                ${Number(prospect.agentProjection.year1Income).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">Year 1</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Not explored</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/agent/dashboard/balance-sheets/${prospect.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Balance Sheet"
                          >
                            <FileText className="w-5 h-5" />
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

      {/* Quick Stats Footer */}
      {filteredProspects.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-gradient">
            <p className="text-sm text-gray-600 mb-1">Avg Income</p>
            <p className="text-xl font-bold text-gray-900">
              $
              {(
                filteredProspects.reduce(
                  (sum, p) => sum + Number(p.financialProfile?.annualIncome || 0),
                  0
                ) / filteredProspects.length
              ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="card-gradient">
            <p className="text-sm text-gray-600 mb-1">Total Protection Gap</p>
            <p className="text-xl font-bold text-amber-600">
              $
              {filteredProspects
                .reduce((sum, p) => sum + Number(p.financialProfile?.protectionGap || 0), 0)
                .toLocaleString()}
            </p>
          </div>
          <div className="card-gradient">
            <p className="text-sm text-gray-600 mb-1">Agent Prospects</p>
            <p className="text-xl font-bold text-purple-600">
              {filteredProspects.filter((p) => p.status === 'AGENT_PROSPECT').length}
            </p>
          </div>
          <div className="card-gradient">
            <p className="text-sm text-gray-600 mb-1">Licensed Agents</p>
            <p className="text-xl font-bold text-indigo-600">
              {filteredProspects.filter((p) => p.status === 'LICENSED_AGENT').length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
