'use client';

import { useState } from 'react';
import {
  Handshake,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Building2,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Star,
  AlertCircle,
  Edit2,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Users,
  DollarSign,
} from 'lucide-react';

type COIType = 'CPA' | 'ATTORNEY' | 'BANKER' | 'CFO' | 'FINANCIAL_ADVISOR' | 'REAL_ESTATE_AGENT' | 'INSURANCE_AGENT' | 'OTHER';
type ReferralDirection = 'INBOUND' | 'OUTBOUND';
type ReferralStatus = 'PENDING' | 'CONTACTED' | 'MEETING_SCHEDULED' | 'PROPOSAL_SENT' | 'CLOSED_WON' | 'CLOSED_LOST';

interface Referral {
  id: string;
  direction: ReferralDirection;
  businessName: string | null;
  contactName: string;
  contactEmail: string | null;
  contactPhone?: string | null;
  status: ReferralStatus;
  estimatedValue: number | null;
  actualValue: number | null;
  notes?: string | null;
  followUpDate?: string | null;
  createdAt: string;
}

interface COIPartner {
  id: string;
  name: string;
  company: string;
  type: COIType;
  email: string | null;
  phone: string | null;
  referralsReceived: number;
  referralsSent: number;
  lastContactDate: string | null;
  relationshipScore: number | null;
  nextFollowUpDate: string | null;
  notes: string | null;
  tags: string[];
  createdAt: string;
  referrals: Referral[];
}

interface COIDashboardProps {
  partners: COIPartner[];
  stats: {
    totalPartners: number;
    totalInboundReferrals: number;
    totalOutboundReferrals: number;
    avgRelationshipScore: number;
    partnersNeedingFollowUp: number;
  };
}

const coiTypeLabels: Record<COIType, string> = {
  CPA: 'CPA/Accountant',
  ATTORNEY: 'Attorney',
  BANKER: 'Banker',
  CFO: 'CFO/Controller',
  FINANCIAL_ADVISOR: 'Financial Advisor',
  REAL_ESTATE_AGENT: 'Real Estate Agent',
  INSURANCE_AGENT: 'Insurance Agent',
  OTHER: 'Other',
};

const coiTypeColors: Record<COIType, string> = {
  CPA: 'bg-blue-100 text-blue-700',
  ATTORNEY: 'bg-purple-100 text-purple-700',
  BANKER: 'bg-green-100 text-green-700',
  CFO: 'bg-orange-100 text-orange-700',
  FINANCIAL_ADVISOR: 'bg-cyan-100 text-cyan-700',
  REAL_ESTATE_AGENT: 'bg-amber-100 text-amber-700',
  INSURANCE_AGENT: 'bg-red-100 text-red-700',
  OTHER: 'bg-gray-100 text-gray-700',
};

const statusColors: Record<ReferralStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  CONTACTED: 'bg-blue-100 text-blue-700',
  MEETING_SCHEDULED: 'bg-yellow-100 text-yellow-700',
  PROPOSAL_SENT: 'bg-purple-100 text-purple-700',
  CLOSED_WON: 'bg-green-100 text-green-700',
  CLOSED_LOST: 'bg-red-100 text-red-600',
};

export default function COIDashboard({ partners: initialPartners, stats }: COIDashboardProps) {
  const [partners, setPartners] = useState<COIPartner[]>(initialPartners);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<COIType | 'ALL'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedPartner, setExpandedPartner] = useState<string | null>(null);
  const [editingPartner, setEditingPartner] = useState<COIPartner | null>(null);
  const [showReferralModal, setShowReferralModal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter partners
  const filteredPartners = partners.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || p.type === filterType;
    return matchesSearch && matchesType;
  });

  // Add new partner
  const handleAddPartner = async (data: Partial<COIPartner>) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/coi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.success) {
        setPartners([{ ...result.data, referrals: [] }, ...partners]);
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error adding partner:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update partner
  const handleUpdatePartner = async (id: string, data: Partial<COIPartner>) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/coi', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });

      const result = await res.json();
      if (result.success) {
        setPartners(partners.map(p => (p.id === id ? { ...p, ...result.data } : p)));
        setEditingPartner(null);
      }
    } catch (error) {
      console.error('Error updating partner:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete partner
  const handleDeletePartner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this COI partner?')) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/coi?id=${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        setPartners(partners.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting partner:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add referral
  const handleAddReferral = async (partnerId: string, data: Partial<Referral>) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/coi/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coiPartnerId: partnerId, ...data }),
      });

      const result = await res.json();
      if (result.success) {
        // Refresh the page to get updated data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error adding referral:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRelationshipColor = (score: number | null) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Handshake className="h-7 w-7 text-blue-600" />
            COI Partners
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your Centers of Influence network
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Partner
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPartners}</p>
              <p className="text-xs text-gray-500">Total Partners</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingDown className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInboundReferrals}</p>
              <p className="text-xs text-gray-500">Inbound Referrals</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOutboundReferrals}</p>
              <p className="text-xs text-gray-500">Outbound Referrals</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.avgRelationshipScore}</p>
              <p className="text-xs text-gray-500">Avg. Score</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.partnersNeedingFollowUp}</p>
              <p className="text-xs text-gray-500">Need Follow-up</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search partners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as COIType | 'ALL')}
            className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
          >
            <option value="ALL">All Types</option>
            {Object.entries(coiTypeLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Partners List */}
      <div className="space-y-3">
        {filteredPartners.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Handshake className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No partners found</h3>
            <p className="text-gray-500 mt-1">Add your first COI partner to get started</p>
          </div>
        ) : (
          filteredPartners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* Partner Header */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedPartner(expandedPartner === partner.id ? null : partner.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {partner.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{partner.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${coiTypeColors[partner.type]}`}>
                          {coiTypeLabels[partner.type]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Building2 className="h-4 w-4" />
                        {partner.company}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Relationship Score */}
                    <div className="text-center hidden sm:block">
                      <div className={`text-xl font-bold ${getRelationshipColor(partner.relationshipScore)}`}>
                        {partner.relationshipScore || '-'}
                      </div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>

                    {/* Referral Stats */}
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingDown className="h-4 w-4" />
                        {partner.referralsReceived}
                      </div>
                      <ArrowRightLeft className="h-4 w-4 text-gray-400" />
                      <div className="flex items-center gap-1 text-purple-600">
                        <TrendingUp className="h-4 w-4" />
                        {partner.referralsSent}
                      </div>
                    </div>

                    {/* Expand Toggle */}
                    {expandedPartner === partner.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedPartner === partner.id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Contact Info */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">Contact Info</h4>
                      {partner.email && (
                        <a
                          href={`mailto:${partner.email}`}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Mail className="h-4 w-4" />
                          {partner.email}
                        </a>
                      )}
                      {partner.phone && (
                        <a
                          href={`tel:${partner.phone}`}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Phone className="h-4 w-4" />
                          {partner.phone}
                        </a>
                      )}
                      {partner.lastContactDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          Last contact: {new Date(partner.lastContactDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {partner.notes && (
                      <div>
                        <h4 className="font-medium text-gray-700">Notes</h4>
                        <p className="text-sm text-gray-600 mt-1">{partner.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Recent Referrals */}
                  {partner.referrals.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700 mb-2">Recent Referrals</h4>
                      <div className="space-y-2">
                        {partner.referrals.slice(0, 5).map((referral) => (
                          <div
                            key={referral.id}
                            className="flex items-center justify-between bg-white rounded p-2 border border-gray-100"
                          >
                            <div className="flex items-center gap-3">
                              {referral.direction === 'INBOUND' ? (
                                <TrendingDown className="h-4 w-4 text-green-500" />
                              ) : (
                                <TrendingUp className="h-4 w-4 text-purple-500" />
                              )}
                              <div>
                                <span className="font-medium text-sm">{referral.contactName}</span>
                                {referral.businessName && (
                                  <span className="text-gray-500 text-sm"> - {referral.businessName}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {referral.estimatedValue && (
                                <span className="text-sm text-gray-500">
                                  ${referral.estimatedValue.toLocaleString()}
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[referral.status]}`}>
                                {referral.status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowReferralModal(partner.id);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4" />
                      Add Referral
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPartner(partner);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePartner(partner.id);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Partner Modal */}
      {(showAddModal || editingPartner) && (
        <PartnerModal
          partner={editingPartner}
          onClose={() => {
            setShowAddModal(false);
            setEditingPartner(null);
          }}
          onSave={editingPartner
            ? (data) => handleUpdatePartner(editingPartner.id, data)
            : handleAddPartner
          }
          isLoading={isLoading}
        />
      )}

      {/* Add Referral Modal */}
      {showReferralModal && (
        <ReferralModal
          partnerId={showReferralModal}
          onClose={() => setShowReferralModal(null)}
          onSave={(data) => handleAddReferral(showReferralModal, data)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

// Partner Modal Component
function PartnerModal({
  partner,
  onClose,
  onSave,
  isLoading,
}: {
  partner: COIPartner | null;
  onClose: () => void;
  onSave: (data: Partial<COIPartner>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: partner?.name || '',
    company: partner?.company || '',
    type: partner?.type || 'CPA' as COIType,
    email: partner?.email || '',
    phone: partner?.phone || '',
    notes: partner?.notes || '',
    nextFollowUpDate: partner?.nextFollowUpDate?.split('T')[0] || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      email: formData.email || null,
      phone: formData.phone || null,
      notes: formData.notes || null,
      nextFollowUpDate: formData.nextFollowUpDate || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">
            {partner ? 'Edit Partner' : 'Add New Partner'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as COIType })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(coiTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Next Follow-up</label>
            <input
              type="date"
              value={formData.nextFollowUpDate}
              onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : partner ? 'Update Partner' : 'Add Partner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Referral Modal Component
function ReferralModal({
  partnerId,
  onClose,
  onSave,
  isLoading,
}: {
  partnerId: string;
  onClose: () => void;
  onSave: (data: Partial<Referral>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    direction: 'INBOUND' as ReferralDirection,
    contactName: '',
    businessName: '',
    contactEmail: '',
    contactPhone: '',
    estimatedValue: '',
    notes: '',
    followUpDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      direction: formData.direction,
      contactName: formData.contactName,
      businessName: formData.businessName || null,
      contactEmail: formData.contactEmail || null,
      estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null,
      notes: formData.notes || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Add Referral</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Direction */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Direction *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="INBOUND"
                  checked={formData.direction === 'INBOUND'}
                  onChange={(e) => setFormData({ ...formData, direction: e.target.value as ReferralDirection })}
                  className="text-blue-600"
                />
                <span className="flex items-center gap-1 text-sm">
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  They referred to me
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="OUTBOUND"
                  checked={formData.direction === 'OUTBOUND'}
                  onChange={(e) => setFormData({ ...formData, direction: e.target.value as ReferralDirection })}
                  className="text-blue-600"
                />
                <span className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  I referred to them
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
              <input
                type="text"
                required
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Value</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Referral'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
