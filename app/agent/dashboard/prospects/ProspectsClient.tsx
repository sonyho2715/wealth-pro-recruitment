'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  ChevronDown,
  Mail,
  Phone,
  TrendingUp,
  FileText,
  Download,
  Share2,
  Users,
  Link2,
  Copy,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '@/components/Pagination';
import {
  ProspectStatus,
  STATUS_COLORS,
  STATUS_LABELS,
  getValidNextStatuses,
} from '@/lib/constants/prospect-statuses';
import { shareProspectWithAgent, updateProspectStage, getOrCreateReferralCode } from './actions';

interface Prospect {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: string;
  stage: string;
  createdAt: Date;
  isShared: boolean;
  sharedBy: { firstName: string; lastName: string } | null;
  sharedWith: { agentName: string }[];
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

interface ShareableAgent {
  id: string;
  firstName: string;
  lastName: string;
  relationship: 'upline' | 'downline';
}

// Combine colors and labels for display
const statusDisplay: Record<string, { bg: string; text: string; label: string }> = Object.fromEntries(
  Object.entries(STATUS_COLORS).map(([key, colors]) => [
    key,
    { ...colors, label: STATUS_LABELS[key as ProspectStatus] },
  ])
);

// Stage display configuration
const stageDisplay: Record<string, { bg: string; text: string; label: string }> = {
  NEW: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'New' },
  CONTACTED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Contacted' },
  MEETING_SCHEDULED: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Meeting Set' },
  NEEDS_ANALYSIS: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Analysis' },
  PROPOSAL_SENT: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Proposal' },
  NEGOTIATION: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Negotiation' },
  CLOSED_WON: { bg: 'bg-green-100', text: 'text-green-700', label: 'Won' },
  CLOSED_LOST: { bg: 'bg-red-100', text: 'text-red-700', label: 'Lost' },
};

const ITEMS_PER_PAGE = 10;

interface ProspectsClientProps {
  prospects: Prospect[];
  shareableAgents: ShareableAgent[];
}

export default function ProspectsClient({ prospects, shareableAgents }: ProspectsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openStageMenuId, setOpenStageMenuId] = useState<string | null>(null);
  const [openShareMenuId, setOpenShareMenuId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const filteredProspects = useMemo(() => {
    return prospects.filter((p) => {
      const matchesSearch =
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.phone && p.phone.includes(searchQuery));
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesStage = stageFilter === 'all' || p.stage === stageFilter;
      return matchesSearch && matchesStatus && matchesStage;
    });
  }, [prospects, searchQuery, statusFilter, stageFilter]);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleStageFilterChange = (value: string) => {
    setStageFilter(value);
    setCurrentPage(1);
  };

  // Handle stage update
  const handleStageChange = async (prospectId: string, newStage: string) => {
    try {
      const result = await updateProspectStage(prospectId, newStage as any);
      if (result.success) {
        toast.success('Stage updated');
        window.location.reload();
      } else {
        toast.error(result.error || 'Failed to update stage');
      }
    } catch (error) {
      console.error('Error updating stage:', error);
      toast.error('Failed to update stage');
    }
    setOpenStageMenuId(null);
  };

  // Handle sharing prospect
  const handleShareProspect = async (prospectId: string, agentId: string, agentName: string) => {
    try {
      const result = await shareProspectWithAgent(prospectId, agentId);
      if (result.success) {
        toast.success(`Shared with ${agentName}`);
        window.location.reload();
      } else {
        toast.error(result.error || 'Failed to share prospect');
      }
    } catch (error) {
      console.error('Error sharing prospect:', error);
      toast.error('Failed to share prospect');
    }
    setOpenShareMenuId(null);
  };

  // Handle referral link
  const handleGetReferralLink = async () => {
    try {
      const result = await getOrCreateReferralCode();
      if (result.success && result.referralCode) {
        setReferralCode(result.referralCode);
        setShowReferralModal(true);
      } else {
        toast.error(result.error || 'Failed to get referral code');
      }
    } catch (error) {
      console.error('Error getting referral code:', error);
      toast.error('Failed to get referral code');
    }
  };

  const copyReferralLink = () => {
    if (referralCode) {
      const link = `${window.location.origin}/prospect?ref=${referralCode}`;
      navigator.clipboard.writeText(link);
      setCopiedCode(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredProspects.length / ITEMS_PER_PAGE);
  const paginatedProspects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProspects.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProspects, currentPage]);

  const handleProspectStatusChange = async (prospectId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/prospects/${prospectId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Status updated');
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleExportCSV = () => {

    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Status', 'Annual Income', 'Net Worth', 'Protection Gap', 'Year 1 Agent Income', 'Created At'];
    const rows = filteredProspects.map(p => [
      p.firstName,
      p.lastName,
      p.email,
      p.phone || '',
      STATUS_LABELS[p.status as ProspectStatus] || p.status,
      p.financialProfile?.annualIncome?.toString() || '',
      p.financialProfile?.netWorth?.toString() || '',
      p.financialProfile?.protectionGap?.toString() || '',
      p.agentProjection?.year1Income?.toString() || '',
      new Date(p.createdAt).toLocaleDateString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prospects-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Prospects exported to CSV');
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prospects</h1>
          <p className="text-gray-600">
            Manage and track all your prospects in one place.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGetReferralLink}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Link2 className="w-5 h-5" />
            Referral Link
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>
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
              onChange={(e) => handleSearchChange(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          <div className="relative sm:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
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
          <div className="relative sm:w-44">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={stageFilter}
              onChange={(e) => handleStageFilterChange(e.target.value)}
              className="input-field pl-12 pr-10 appearance-none cursor-pointer w-full"
            >
              <option value="all">All Stages</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="MEETING_SCHEDULED">Meeting Set</option>
              <option value="NEEDS_ANALYSIS">Analysis</option>
              <option value="PROPOSAL_SENT">Proposal</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="CLOSED_WON">Won</option>
              <option value="CLOSED_LOST">Lost</option>
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
                  Stage
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-sm">
                  Annual Income
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-sm">
                  Protection Gap
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedProspects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    {searchQuery || statusFilter !== 'all'
                      ? 'No prospects match your filters'
                      : 'No prospects yet. Start by creating a new prospect.'}
                  </td>
                </tr>
              ) : (
                paginatedProspects.map((prospect) => {
                  const status = statusDisplay[prospect.status] || statusDisplay.LEAD;
                  const stage = stageDisplay[prospect.stage] || stageDisplay.NEW;
                  return (
                    <tr
                      key={prospect.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      {/* Prospect Name & Email */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                            prospect.isShared
                              ? 'bg-gradient-to-br from-cyan-500 to-teal-600'
                              : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                          }`}>
                            {prospect.firstName[0]}
                            {prospect.lastName[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">
                                {prospect.firstName} {prospect.lastName}
                              </p>
                              {prospect.isShared && prospect.sharedBy && (
                                <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">
                                  Shared by {prospect.sharedBy.firstName}
                                </span>
                              )}
                              {prospect.sharedWith.length > 0 && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                  Shared ({prospect.sharedWith.length})
                                </span>
                              )}
                            </div>
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
                                {Object.entries(statusDisplay)
                                  .filter(([key]) => getValidNextStatuses(prospect.status as ProspectStatus).includes(key as ProspectStatus))
                                  .map(([key, value]) => (
                                  <button
                                    key={key}
                                    onClick={() => {
                                      handleProspectStatusChange(prospect.id, key);
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

                      {/* Stage Badge */}
                      <td className="py-4 px-4">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenStageMenuId(openStageMenuId === prospect.id ? null : prospect.id)
                            }
                            disabled={prospect.isShared}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${stage.bg} ${stage.text} ${
                              prospect.isShared ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-80 transition-opacity'
                            }`}
                          >
                            {stage.label}
                            {!prospect.isShared && <ChevronDown className="w-3 h-3" />}
                          </button>
                          {openStageMenuId === prospect.id && !prospect.isShared && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenStageMenuId(null)}
                              />
                              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[140px]">
                                {Object.entries(stageDisplay).map(([key, value]) => (
                                  <button
                                    key={key}
                                    onClick={() => handleStageChange(prospect.id, key)}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                                      prospect.stage === key ? 'bg-gray-50 font-medium' : ''
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
                          {/* Share Button */}
                          {!prospect.isShared && shareableAgents.length > 0 && (
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setOpenShareMenuId(openShareMenuId === prospect.id ? null : prospect.id)
                                }
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Share with team"
                              >
                                <Share2 className="w-5 h-5" />
                              </button>
                              {openShareMenuId === prospect.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setOpenShareMenuId(null)}
                                  />
                                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[200px]">
                                    <div className="p-2 border-b border-gray-100">
                                      <p className="text-xs font-medium text-gray-500 uppercase">Share with</p>
                                    </div>
                                    {shareableAgents.map((agent) => (
                                      <button
                                        key={agent.id}
                                        onClick={() =>
                                          handleShareProspect(
                                            prospect.id,
                                            agent.id,
                                            `${agent.firstName} ${agent.lastName}`
                                          )
                                        }
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between"
                                      >
                                        <span>{agent.firstName} {agent.lastName}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                          agent.relationship === 'upline'
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-blue-100 text-blue-700'
                                        }`}>
                                          {agent.relationship}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
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

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredProspects.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
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

      {/* Referral Link Modal */}
      {showReferralModal && referralCode && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowReferralModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Link2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Your Referral Link</h3>
                <p className="text-sm text-gray-600">Share this link with prospects</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-xs text-gray-500 mb-2">Referral URL</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-white px-3 py-2 rounded border border-gray-200 overflow-x-auto">
                  {typeof window !== 'undefined' ? `${window.location.origin}/prospect?ref=${referralCode}` : `/prospect?ref=${referralCode}`}
                </code>
                <button
                  onClick={copyReferralLink}
                  className={`p-2 rounded-lg transition-colors ${
                    copiedCode
                      ? 'bg-green-100 text-green-600'
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                >
                  {copiedCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              When prospects register using this link, they will be automatically assigned to you and tracked in your dashboard.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReferralModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={copyReferralLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {copiedCode ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
