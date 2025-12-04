'use client';

import { useState, useTransition } from 'react';
import {
  Plus, Search, Calendar, DollarSign, User, CheckCircle2,
  X, Trash2, Edit, TrendingUp, Target, Award, Phone, Mail,
  FileText, Check, Circle
} from 'lucide-react';
import {
  createProduction,
  updateProduction,
  deleteProduction,
  updateProductionStatus,
  updatePersistency,
} from './actions';

interface Production {
  id: string;
  clientName: string;
  clientPhone: string | null;
  clientEmail: string | null;
  provider: string | null;
  product: string | null;
  productType: string | null;
  policyNumber: string | null;
  description: string | null;
  totalPoints: number;
  baseshopPoints: number;
  premium: number | null;
  splitRatio: number;
  writtenDate: string;
  dropDate: string | null;
  status: string;
  advPaid: boolean;
  pd1Paid: boolean;
  pd2Paid: boolean;
  isTrainee: boolean;
  notes: string | null;
  writingAgent: {
    id: string;
    firstName: string;
    lastName: string;
  };
  trainee: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

interface Agent {
  id: string;
  firstName: string;
  lastName: string;
}

interface Recruit {
  id: string;
  firstName: string;
  lastName: string;
}

interface Stats {
  totalProduction: number;
  totalPoints: number;
  baseshopPoints: number;
  pending: number;
  approved: number;
  paid: number;
}

interface ProductionClientProps {
  productions: Production[];
  agents: Agent[];
  recruits: Recruit[];
  stats: Stats;
  currentAgentId: string;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
  SUBMITTED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Submitted' },
  APPROVED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' },
  ISSUED: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Issued' },
  PAID: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Paid' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
  CHARGEBACK: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Chargeback' },
};

const productTypes = [
  { value: 'TERM_LIFE', label: 'Term Life' },
  { value: 'WHOLE_LIFE', label: 'Whole Life' },
  { value: 'IUL', label: 'IUL' },
  { value: 'ANNUITY', label: 'Annuity' },
  { value: 'DISABILITY', label: 'Disability' },
  { value: 'LTC', label: 'Long Term Care' },
  { value: 'HEALTH', label: 'Health' },
  { value: 'AUTO', label: 'Auto' },
  { value: 'HOME', label: 'Home' },
  { value: 'OTHER', label: 'Other' },
];

export default function ProductionClient({
  productions,
  agents,
  recruits,
  stats,
  currentAgentId,
}: ProductionClientProps) {
  const [isPending, startTransition] = useTransition();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduction, setEditingProduction] = useState<Production | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProductions = productions.filter(prod => {
    const matchesSearch =
      prod.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.policyNumber?.includes(searchQuery) ||
      prod.writingAgent.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.writingAgent.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || prod.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      if (editingProduction) {
        await updateProduction(editingProduction.id, formData);
        setEditingProduction(null);
      } else {
        await createProduction(formData);
        setShowAddModal(false);
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this production?')) return;
    startTransition(async () => {
      await deleteProduction(id);
    });
  };

  const handleStatusChange = async (id: string, status: string) => {
    startTransition(async () => {
      await updateProductionStatus(id, status);
    });
  };

  const handlePersistencyToggle = async (id: string, field: string, currentValue: boolean) => {
    startTransition(async () => {
      await updatePersistency(id, { [field]: !currentValue });
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Production Tracker</h1>
        <p className="text-gray-600">Track written business, points, and persistency</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.totalProduction}</p>
          <p className="text-sm text-gray-600">Total Cases</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-blue-600">{stats.totalPoints.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Total Points</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-purple-600">{stats.baseshopPoints.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Baseshop Points</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-sm text-gray-600">Pending</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          <p className="text-sm text-gray-600">Approved</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-emerald-600">{stats.paid}</p>
          <p className="text-sm text-gray-600">Paid</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card-gradient mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center flex-1">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search production..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              {Object.entries(statusColors).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Production
          </button>
        </div>
      </div>

      {/* Production Table */}
      <div className="card-gradient overflow-x-auto">
        {filteredProductions.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No production records found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              Add Your First Production
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Client</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Agent</th>
                <th className="text-center py-3 px-2 font-medium text-gray-700">Trainee</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">Points</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">BS Pts</th>
                <th className="text-center py-3 px-1 font-medium text-gray-700" title="Advance">Adv</th>
                <th className="text-center py-3 px-1 font-medium text-gray-700" title="Persistency Day 1">PD1</th>
                <th className="text-center py-3 px-1 font-medium text-gray-700" title="Persistency Day 2">PD2</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProductions.map((prod) => {
                const status = statusColors[prod.status] || statusColors.PENDING;
                return (
                  <tr key={prod.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(prod.writtenDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-gray-900">{prod.clientName}</p>
                        {prod.policyNumber && (
                          <p className="text-xs text-gray-500">#{prod.policyNumber}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">
                          {prod.writingAgent.firstName} {prod.writingAgent.lastName[0]}.
                        </span>
                        {prod.splitRatio < 100 && (
                          <span className="text-xs text-gray-500">({prod.splitRatio}%)</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center">
                      {prod.trainee ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                          <User className="w-3 h-3" />
                          {prod.trainee.firstName} {prod.trainee.lastName[0]}.
                        </span>
                      ) : prod.isTrainee ? (
                        <span className="text-xs text-gray-500">Yes</span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm text-gray-900">{prod.product || '-'}</p>
                        {prod.provider && (
                          <p className="text-xs text-gray-500">{prod.provider}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-gray-900">
                      {prod.totalPoints.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-purple-600">
                      {prod.baseshopPoints.toFixed(2)}
                    </td>
                    <td className="py-3 px-1 text-center">
                      <button
                        onClick={() => handlePersistencyToggle(prod.id, 'advPaid', prod.advPaid)}
                        disabled={isPending}
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                          prod.advPaid
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                        }`}
                      >
                        {prod.advPaid ? <Check className="w-4 h-4" /> : <Circle className="w-3 h-3" />}
                      </button>
                    </td>
                    <td className="py-3 px-1 text-center">
                      <button
                        onClick={() => handlePersistencyToggle(prod.id, 'pd1Paid', prod.pd1Paid)}
                        disabled={isPending}
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                          prod.pd1Paid
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                        }`}
                      >
                        {prod.pd1Paid ? <Check className="w-4 h-4" /> : <Circle className="w-3 h-3" />}
                      </button>
                    </td>
                    <td className="py-3 px-1 text-center">
                      <button
                        onClick={() => handlePersistencyToggle(prod.id, 'pd2Paid', prod.pd2Paid)}
                        disabled={isPending}
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                          prod.pd2Paid
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                        }`}
                      >
                        {prod.pd2Paid ? <Check className="w-4 h-4" /> : <Circle className="w-3 h-3" />}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={prod.status}
                        onChange={(e) => handleStatusChange(prod.id, e.target.value)}
                        disabled={isPending}
                        className={`text-xs rounded-lg px-2 py-1 border-0 ${status.bg} ${status.text}`}
                      >
                        {Object.entries(statusColors).map(([key, { label }]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingProduction(prod)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingProduction) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduction ? 'Edit Production' : 'Add New Production'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduction(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Client Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    defaultValue={editingProduction?.clientName}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Phone
                  </label>
                  <input
                    type="tel"
                    name="clientPhone"
                    defaultValue={editingProduction?.clientPhone || ''}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Email
                  </label>
                  <input
                    type="email"
                    name="clientEmail"
                    defaultValue={editingProduction?.clientEmail || ''}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Agent & Trainee */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Writing Agent
                  </label>
                  <select
                    name="writingAgentId"
                    defaultValue={editingProduction?.writingAgent.id || currentAgentId}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.id}>
                        {agent.firstName} {agent.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trainee
                  </label>
                  <select
                    name="traineeId"
                    defaultValue={editingProduction?.trainee?.id || ''}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    {recruits.map(recruit => (
                      <option key={recruit.id} value={recruit.id}>
                        {recruit.firstName} {recruit.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Split Ratio (%)
                  </label>
                  <input
                    type="number"
                    name="splitRatio"
                    defaultValue={editingProduction?.splitRatio || 100}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isTrainee"
                  id="isTrainee"
                  value="true"
                  defaultChecked={editingProduction?.isTrainee}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isTrainee" className="text-sm text-gray-700">
                  This is a trainee case
                </label>
              </div>

              {/* Product Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provider
                  </label>
                  <input
                    type="text"
                    name="provider"
                    defaultValue={editingProduction?.provider || ''}
                    placeholder="e.g., Transamerica"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product
                  </label>
                  <input
                    type="text"
                    name="product"
                    defaultValue={editingProduction?.product || ''}
                    placeholder="e.g., Term 20"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Type
                  </label>
                  <select
                    name="productType"
                    defaultValue={editingProduction?.productType || ''}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type...</option>
                    {productTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    name="policyNumber"
                    defaultValue={editingProduction?.policyNumber || ''}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    defaultValue={editingProduction?.description || ''}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Points & Premium */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Points
                  </label>
                  <input
                    type="number"
                    name="totalPoints"
                    defaultValue={editingProduction?.totalPoints || 0}
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Baseshop Points
                  </label>
                  <input
                    type="number"
                    name="baseshopPoints"
                    defaultValue={editingProduction?.baseshopPoints || 0}
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Premium
                  </label>
                  <input
                    type="number"
                    name="premium"
                    defaultValue={editingProduction?.premium || ''}
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Written Date
                  </label>
                  <input
                    type="date"
                    name="writtenDate"
                    defaultValue={editingProduction?.writtenDate?.split('T')[0] || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Drop Date
                  </label>
                  <input
                    type="date"
                    name="dropDate"
                    defaultValue={editingProduction?.dropDate?.split('T')[0] || ''}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {editingProduction && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={editingProduction.status}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(statusColors).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  defaultValue={editingProduction?.notes || ''}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduction(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary"
                >
                  {isPending ? 'Saving...' : editingProduction ? 'Update Production' : 'Add Production'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
