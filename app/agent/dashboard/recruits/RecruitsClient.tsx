'use client';

import { useState, useTransition } from 'react';
import {
  Plus, Search, Calendar, Phone, Mail, User, CheckCircle2,
  X, MoreVertical, Trash2, Edit, UserPlus, Clock, Users,
  Check, Circle, AlertCircle, Award
} from 'lucide-react';
import {
  createRecruit,
  updateRecruit,
  deleteRecruit,
  updateMilestone,
  updateRecruitStatus,
} from './actions';

interface Recruit {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  codeNumber: string | null;
  state: string | null;
  status: string;
  startDate: string;
  // Onboarding milestones
  meetSpouse: boolean;
  meetSpouseDate: string | null;
  submitLic: boolean;
  submitLicDate: string | null;
  prospectList: boolean;
  prospectListDate: string | null;
  threeThreeThirty: boolean;
  threeThreeThirtyDate: string | null;
  fna: boolean;
  fnaDate: string | null;
  fastStartSchool: boolean;
  fastStartSchoolDate: string | null;
  // Licensing
  codeExpiryDate: string | null;
  hoursCompleted: number;
  examPassed: boolean;
  fingerprinting: boolean;
  licenseIssued: boolean;
  notes: string | null;
  recruiter: {
    id: string;
    firstName: string;
    lastName: string;
  };
  fieldTrainer: {
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

interface Stats {
  total: number;
  active: number;
  licensed: number;
  inactive: number;
  fastStartComplete: number;
}

interface RecruitsClientProps {
  recruits: Recruit[];
  agents: Agent[];
  stats: Stats;
  currentAgentId: string;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  ACTIVE: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Active' },
  LICENSED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Licensed' },
  INACTIVE: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Inactive' },
  NOT_INTERESTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Not Interested' },
  FAST_START_COMPLETE: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Fast Start Complete' },
};

const milestones = [
  { key: 'meetSpouse', label: 'Meet Spouse', short: 'Spouse' },
  { key: 'submitLic', label: 'Submit License', short: 'Lic' },
  { key: 'prospectList', label: 'Prospect List', short: 'List' },
  { key: 'threeThreeThirty', label: '3-3-30', short: '3-3-30' },
  { key: 'fna', label: 'FNA', short: 'FNA' },
  { key: 'fastStartSchool', label: 'Fast Start School', short: 'FSS' },
];

export default function RecruitsClient({ recruits, agents, stats, currentAgentId }: RecruitsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecruit, setEditingRecruit] = useState<Recruit | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const filteredRecruits = recruits.filter(recruit => {
    const matchesSearch =
      recruit.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recruit.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recruit.phone?.includes(searchQuery) ||
      recruit.codeNumber?.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || recruit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      if (editingRecruit) {
        await updateRecruit(editingRecruit.id, formData);
        setEditingRecruit(null);
      } else {
        await createRecruit(formData);
        setShowAddModal(false);
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recruit?')) return;
    startTransition(async () => {
      await deleteRecruit(id);
      setMenuOpenId(null);
    });
  };

  const handleMilestoneToggle = async (recruitId: string, milestone: string, currentValue: boolean) => {
    startTransition(async () => {
      await updateMilestone(recruitId, milestone, !currentValue);
    });
  };

  const handleStatusChange = async (recruitId: string, status: string) => {
    startTransition(async () => {
      await updateRecruitStatus(recruitId, status);
    });
  };

  const getMilestoneCount = (recruit: Recruit) => {
    let count = 0;
    if (recruit.meetSpouse) count++;
    if (recruit.submitLic) count++;
    if (recruit.prospectList) count++;
    if (recruit.threeThreeThirty) count++;
    if (recruit.fna) count++;
    if (recruit.fastStartSchool) count++;
    return count;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Recruit Tracker</h1>
        <p className="text-gray-600">Track recruits through onboarding milestones (Speed Filters)</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Recruits</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
          <p className="text-sm text-gray-600">Active</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-green-600">{stats.licensed}</p>
          <p className="text-sm text-gray-600">Licensed</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-purple-600">{stats.fastStartComplete}</p>
          <p className="text-sm text-gray-600">Fast Start Done</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
          <p className="text-sm text-gray-600">Inactive</p>
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
                placeholder="Search recruits..."
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
            Add Recruit
          </button>
        </div>
      </div>

      {/* Recruits Table */}
      <div className="card-gradient overflow-x-auto">
        {filteredRecruits.length === 0 ? (
          <div className="text-center py-12">
            <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No recruits found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              Add Your First Recruit
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700">Start Date</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700">Recruiter</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700">Trainer</th>
                {milestones.map(m => (
                  <th key={m.key} className="text-center py-3 px-1 font-medium text-gray-700" title={m.label}>
                    {m.short}
                  </th>
                ))}
                <th className="text-center py-3 px-2 font-medium text-gray-700">Progress</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700">Status</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecruits.map((recruit) => {
                const status = statusColors[recruit.status] || statusColors.ACTIVE;
                const milestoneCount = getMilestoneCount(recruit);
                const progress = Math.round((milestoneCount / 6) * 100);

                return (
                  <tr key={recruit.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {recruit.firstName} {recruit.lastName}
                        </p>
                        <div className="flex gap-2 text-xs text-gray-500">
                          {recruit.phone && (
                            <a href={`tel:${recruit.phone}`} className="hover:text-blue-600 flex items-center gap-0.5">
                              <Phone className="w-3 h-3" /> {recruit.phone}
                            </a>
                          )}
                        </div>
                        {recruit.codeNumber && (
                          <p className="text-xs text-gray-500">Code: {recruit.codeNumber}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-600">
                      {new Date(recruit.startDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-600">
                      {recruit.recruiter.firstName} {recruit.recruiter.lastName[0]}.
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-600">
                      {recruit.fieldTrainer ? `${recruit.fieldTrainer.firstName} ${recruit.fieldTrainer.lastName[0]}.` : '-'}
                    </td>
                    {milestones.map(m => {
                      const isComplete = recruit[m.key as keyof Recruit] as boolean;
                      return (
                        <td key={m.key} className="py-3 px-1 text-center">
                          <button
                            onClick={() => handleMilestoneToggle(recruit.id, m.key, isComplete)}
                            disabled={isPending}
                            className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                              isComplete
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                            }`}
                            title={`${m.label}: ${isComplete ? 'Complete' : 'Incomplete'}`}
                          >
                            {isComplete ? <Check className="w-4 h-4" /> : <Circle className="w-3 h-3" />}
                          </button>
                        </td>
                      );
                    })}
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{milestoneCount}/6</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <select
                        value={recruit.status}
                        onChange={(e) => handleStatusChange(recruit.id, e.target.value)}
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
                          onClick={() => {
                            setEditingRecruit(recruit);
                            setMenuOpenId(null);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(recruit.id)}
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
      {(showAddModal || editingRecruit) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingRecruit ? 'Edit Recruit' : 'Add New Recruit'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingRecruit(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    defaultValue={editingRecruit?.firstName}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    defaultValue={editingRecruit?.lastName}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingRecruit?.phone}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingRecruit?.email || ''}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code Number
                  </label>
                  <input
                    type="text"
                    name="codeNumber"
                    defaultValue={editingRecruit?.codeNumber || ''}
                    placeholder="Agent code once licensed"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    defaultValue={editingRecruit?.state || ''}
                    placeholder="e.g., CA, TX, NY"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    defaultValue={editingRecruit?.startDate?.split('T')[0] || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field Trainer
                  </label>
                  <select
                    name="fieldTrainerId"
                    defaultValue={editingRecruit?.fieldTrainer?.id || ''}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select trainer...</option>
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.id}>
                        {agent.firstName} {agent.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {editingRecruit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={editingRecruit.status}
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
                  defaultValue={editingRecruit?.notes || ''}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Any notes about this recruit..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingRecruit(null);
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
                  {isPending ? 'Saving...' : editingRecruit ? 'Update Recruit' : 'Add Recruit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {menuOpenId && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setMenuOpenId(null)}
        />
      )}
    </div>
  );
}
