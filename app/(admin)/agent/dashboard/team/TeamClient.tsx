'use client';

import { useState } from 'react';
import { Agent, Prisma } from '@prisma/client';
import { Users, TrendingUp, UserPlus, Mail, Phone, Calendar, DollarSign, Edit2, Eye, Trash2, X, AlertTriangle } from 'lucide-react';
import { addTeamMember, updateTeamMember, getTeamMemberDetails, deleteTeamMember } from './actions';

interface TeamMemberWithStats extends Agent {
  totalProduction: number;
  activitiesCount: number;
}

interface TeamClientProps {
  teamMembers: TeamMemberWithStats[];
  totalProduction: number;
  activeCount: number;
}

interface MemberCommission {
  paidDate: Date | null;
  productType: string;
  amount: Prisma.Decimal | number | string;
}

interface MemberActivity {
  id: string;
  type: string;
  completedAt: Date | null;
}

interface MemberDownline {
  id: string;
  firstName: string;
  lastName: string;
}

interface MemberDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  licenseNumber: string | null;
  licenseDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  role: string;
  monthlyGoal: Prisma.Decimal | number | string | null;
  passwordHash: string;
  uplineId: string | null;
  totalProduction: number;
  totalActivities: number;
  teamSize: number;
  commissions: MemberCommission[];
  activities: MemberActivity[];
  downlines: MemberDownline[];
}

export default function TeamClient({
  teamMembers,
  totalProduction,
  activeCount,
}: TeamClientProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [memberDetails, setMemberDetails] = useState<MemberDetails | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMemberWithStats | null>(null);
  const [deletingMember, setDeletingMember] = useState<TeamMemberWithStats | null>(null);

  const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const result = await addTeamMember(formData);

    if (result.success) {
      setSuccess(
        `Team member added successfully! Temporary password: ${result.data?.tempPassword}`
      );
      setShowAddForm(false);
      e.currentTarget.reset();
    } else {
      setError(result.error || 'Failed to add team member');
    }

    setLoading(false);
  };

  const handleViewDetails = async (memberId: string) => {
    setSelectedMember(memberId);
    setLoading(true);

    const result = await getTeamMemberDetails(memberId);

    if (result.success && result.data) {
      setMemberDetails(result.data);
    } else {
      setError(result.error || 'Failed to fetch member details');
    }

    setLoading(false);
  };

  const closeModal = () => {
    setSelectedMember(null);
    setMemberDetails(null);
  };

  const handleEditMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingMember) return;

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateTeamMember(editingMember.id, {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      phone: (formData.get('phone') as string) || null,
      licenseNumber: (formData.get('licenseNumber') as string) || null,
    });

    if (result.success) {
      setSuccess('Team member updated successfully!');
      setEditingMember(null);
    } else {
      setError(result.error || 'Failed to update team member');
    }

    setLoading(false);
  };

  const handleDeleteMember = async () => {
    if (!deletingMember) return;

    setLoading(true);
    setError(null);

    const result = await deleteTeamMember(deletingMember.id);

    if (result.success) {
      setSuccess(result.message || 'Team member removed successfully!');
      setDeletingMember(null);
    } else {
      setError(result.error || 'Failed to remove team member');
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">
            Build and manage your downline organization
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Add Team Member
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Team Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {teamMembers.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Agents</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {activeCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Team Production</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                ${totalProduction.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Add Team Member Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Add New Team Member
          </h2>
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Number (Optional)
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                {loading ? 'Adding...' : 'Add Team Member'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Team Members Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Your Team ({teamMembers.length})
        </h2>

        {teamMembers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              You haven't added any team members yet
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Team Member
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {member.firstName} {member.lastName}
                    </h3>
                    <span
                      className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${
                        member.role === 'MANAGER'
                          ? 'bg-purple-100 text-purple-800'
                          : member.role === 'ADMIN'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {member.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{member.email}</span>
                  </div>

                  {member.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{member.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Joined {new Date(member.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {member.licenseNumber && (
                    <div className="text-sm text-gray-600">
                      License: {member.licenseNumber}
                    </div>
                  )}
                </div>

                {/* Production Stats */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Production:</span>
                    <span className="font-semibold text-gray-900">
                      ${member.totalProduction.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Activities:</span>
                    <span className="font-semibold text-gray-900">
                      {member.activitiesCount}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(member.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => setEditingMember(member)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingMember(member)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Member Details Modal */}
      {selectedMember && memberDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {memberDetails.firstName} {memberDetails.lastName}
                  </h2>
                  <p className="text-gray-600 mt-1">{memberDetails.email}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  {memberDetails.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{memberDetails.phone}</span>
                    </div>
                  )}
                  {memberDetails.licenseNumber && (
                    <div className="text-gray-600">
                      License: {memberDetails.licenseNumber}
                    </div>
                  )}
                  <div className="text-gray-600">
                    Joined:{' '}
                    {new Date(memberDetails.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Production Stats */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Performance Metrics
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">
                      Total Production
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${memberDetails.totalProduction.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Activities</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {memberDetails.totalActivities}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Team Size</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {memberDetails.teamSize}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Commissions */}
              {memberDetails.commissions && memberDetails.commissions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Recent Commissions
                  </h3>
                  <div className="space-y-2">
                    {memberDetails.commissions.slice(0, 5).map((commission, index) => (
                      <div
                        key={`${commission.paidDate?.toString() || index}-${index}`}
                        className="flex justify-between items-center py-2 border-b border-gray-100"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {commission.productType}
                          </p>
                          <p className="text-xs text-gray-600">
                            {commission.paidDate ? new Date(commission.paidDate).toLocaleDateString() : 'Pending'}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          ${Number(commission.amount).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Downlines */}
              {memberDetails.downlines && memberDetails.downlines.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Their Team ({memberDetails.downlines.length})
                  </h3>
                  <div className="space-y-2">
                    {memberDetails.downlines.map((downline) => (
                      <div
                        key={downline.id}
                        className="flex items-center gap-2 py-2 border-b border-gray-100"
                      >
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {downline.firstName} {downline.lastName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  Edit Team Member
                </h2>
                <button
                  onClick={() => setEditingMember(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleEditMember} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    defaultValue={editingMember.firstName}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    defaultValue={editingMember.lastName}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={editingMember.phone || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Number
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  defaultValue={editingMember.licenseNumber || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Remove Team Member
                  </h2>
                  <p className="text-gray-600 text-sm">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                Are you sure you want to remove <strong>{deletingMember.firstName} {deletingMember.lastName}</strong> from your team?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteMember}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 transition-colors"
                >
                  {loading ? 'Removing...' : 'Yes, Remove'}
                </button>
                <button
                  onClick={() => setDeletingMember(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
