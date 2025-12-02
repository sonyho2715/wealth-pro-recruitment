'use client';

import { useState } from 'react';
import { Activity, Prospect, ActivityType } from '@prisma/client';
import {
  Calendar,
  Phone,
  Mail,
  Users,
  Check,
  Plus,
  Filter,
  X,
  Clock,
  CheckCircle2,
  Trash2,
  FileText,
  Presentation,
  MoreHorizontal,
} from 'lucide-react';
import { createActivity, completeActivity, deleteActivity } from './actions';

type ActivityWithProspect = Activity & {
  prospect: Prospect | null;
};

interface ActivitiesClientProps {
  activities: ActivityWithProspect[];
  prospects: Prospect[];
}

const activityIcons: Record<ActivityType, typeof Phone> = {
  CALL: Phone,
  MEETING: Users,
  EMAIL: Mail,
  FOLLOW_UP: Clock,
  PRESENTATION: Presentation,
  APPLICATION: FileText,
  OTHER: MoreHorizontal,
};

const activityColors: Record<ActivityType, { bg: string; text: string }> = {
  CALL: { bg: 'bg-blue-100', text: 'text-blue-700' },
  MEETING: { bg: 'bg-green-100', text: 'text-green-700' },
  EMAIL: { bg: 'bg-purple-100', text: 'text-purple-700' },
  FOLLOW_UP: { bg: 'bg-amber-100', text: 'text-amber-700' },
  PRESENTATION: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  APPLICATION: { bg: 'bg-pink-100', text: 'text-pink-700' },
  OTHER: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

export default function ActivitiesClient({ activities, prospects }: ActivitiesClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityWithProspect | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<ActivityType | 'ALL'>('ALL');
  const [filterProspect, setFilterProspect] = useState<string>('ALL');
  const [filterDate, setFilterDate] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [viewMode, setViewMode] = useState<'ALL' | 'UPCOMING' | 'COMPLETED'>('ALL');

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    // Type filter
    if (filterType !== 'ALL' && activity.type !== filterType) return false;

    // Prospect filter
    if (filterProspect !== 'ALL' && activity.prospectId !== filterProspect) return false;

    // Date filter
    if (filterDate !== 'ALL' && activity.scheduledAt) {
      const activityDate = new Date(activity.scheduledAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filterDate === 'TODAY') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (activityDate < today || activityDate >= tomorrow) return false;
      } else if (filterDate === 'WEEK') {
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        if (activityDate < today || activityDate >= nextWeek) return false;
      } else if (filterDate === 'MONTH') {
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        if (activityDate < today || activityDate >= nextMonth) return false;
      }
    }

    // View mode filter
    if (viewMode === 'UPCOMING') {
      return !activity.completedAt && activity.scheduledAt && new Date(activity.scheduledAt) > new Date();
    } else if (viewMode === 'COMPLETED') {
      return !!activity.completedAt;
    }

    return true;
  });

  // Sort activities: upcoming first, then by scheduled date
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    // Completed activities go last
    if (a.completedAt && !b.completedAt) return 1;
    if (!a.completedAt && b.completedAt) return -1;

    // Sort by scheduled date
    if (a.scheduledAt && b.scheduledAt) {
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    }
    if (a.scheduledAt && !b.scheduledAt) return -1;
    if (!a.scheduledAt && b.scheduledAt) return 1;

    // Sort by created date
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleCreateActivity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createActivity(formData);

    if (result.success) {
      setIsModalOpen(false);
      e.currentTarget.reset();
    } else {
      setError(result.error || 'Failed to create activity');
    }

    setIsSubmitting(false);
  };

  const handleCompleteActivity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedActivity) return;

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await completeActivity(selectedActivity.id, formData);

    if (result.success) {
      setIsCompleteModalOpen(false);
      setSelectedActivity(null);
      e.currentTarget.reset();
    } else {
      setError(result.error || 'Failed to complete activity');
    }

    setIsSubmitting(false);
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    const result = await deleteActivity(activityId);
    if (!result.success) {
      alert(result.error || 'Failed to delete activity');
    }
  };

  const upcomingCount = activities.filter(
    (a) => !a.completedAt && a.scheduledAt && new Date(a.scheduledAt) > new Date()
  ).length;
  const completedCount = activities.filter((a) => !!a.completedAt).length;

  return (
    <div>
      {/* Header with Add Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Center</h1>
          <p className="text-gray-600">Track and manage all your activities</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Activity
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card-gradient">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{activities.length}</div>
              <div className="text-sm text-gray-600">Total Activities</div>
            </div>
          </div>
        </div>

        <div className="card-gradient">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{upcomingCount}</div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
          </div>
        </div>

        <div className="card-gradient">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{completedCount}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-gradient mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* View Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">View</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as typeof viewMode)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Activities</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Activity Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as typeof filterType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Types</option>
              <option value="CALL">Call</option>
              <option value="MEETING">Meeting</option>
              <option value="EMAIL">Email</option>
              <option value="FOLLOW_UP">Follow Up</option>
              <option value="PRESENTATION">Presentation</option>
              <option value="APPLICATION">Application</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Prospect */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prospect</label>
            <select
              value={filterProspect}
              onChange={(e) => setFilterProspect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Prospects</option>
              {prospects.map((prospect) => (
                <option key={prospect.id} value={prospect.id}>
                  {prospect.firstName} {prospect.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value as typeof filterDate)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">Next 7 Days</option>
              <option value="MONTH">Next 30 Days</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(filterType !== 'ALL' || filterProspect !== 'ALL' || filterDate !== 'ALL' || viewMode !== 'ALL') && (
          <button
            onClick={() => {
              setFilterType('ALL');
              setFilterProspect('ALL');
              setFilterDate('ALL');
              setViewMode('ALL');
            }}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Activities List */}
      <div className="card-gradient">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Activities ({sortedActivities.length})
        </h2>

        {sortedActivities.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No activities found</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Add your first activity
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedActivities.map((activity) => {
              const Icon = activityIcons[activity.type];
              const colors = activityColors[activity.type];
              const isUpcoming =
                !activity.completedAt && activity.scheduledAt && new Date(activity.scheduledAt) > new Date();
              const isOverdue =
                !activity.completedAt && activity.scheduledAt && new Date(activity.scheduledAt) < new Date();

              return (
                <div
                  key={activity.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-colors ${
                    activity.completedAt
                      ? 'bg-gray-50 border-gray-200'
                      : isOverdue
                      ? 'bg-red-50 border-red-200'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                            {activity.type}
                          </span>
                          {activity.completedAt && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Completed
                            </span>
                          )}
                          {isOverdue && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              Overdue
                            </span>
                          )}
                        </div>

                        {activity.description && (
                          <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          {activity.prospect && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {activity.prospect.firstName} {activity.prospect.lastName}
                            </div>
                          )}
                          {activity.scheduledAt && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(activity.scheduledAt).toLocaleString()}
                            </div>
                          )}
                          {activity.completedAt && (
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              Completed {new Date(activity.completedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        {activity.outcome && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                            <span className="font-medium text-gray-700">Outcome:</span>{' '}
                            <span className="text-gray-600">{activity.outcome}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {!activity.completedAt && (
                          <button
                            onClick={() => {
                              setSelectedActivity(activity);
                              setIsCompleteModalOpen(true);
                            }}
                            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                          >
                            <Check className="w-4 h-4" />
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Activity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add Activity</h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setError(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateActivity} className="space-y-4">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activity Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select type...</option>
                    <option value="CALL">Call</option>
                    <option value="MEETING">Meeting</option>
                    <option value="EMAIL">Email</option>
                    <option value="FOLLOW_UP">Follow Up</option>
                    <option value="PRESENTATION">Presentation</option>
                    <option value="APPLICATION">Application</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g., Follow up call with John"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Add any notes or details..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Prospect */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prospect (Optional)</label>
                  <select
                    name="prospectId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">None</option>
                    {prospects.map((prospect) => (
                      <option key={prospect.id} value={prospect.id}>
                        {prospect.firstName} {prospect.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Scheduled Date/Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled Date & Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledAt"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setError(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Activity'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Complete Activity Modal */}
      {isCompleteModalOpen && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Complete Activity</h2>
                <button
                  onClick={() => {
                    setIsCompleteModalOpen(false);
                    setSelectedActivity(null);
                    setError(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{selectedActivity.title}</p>
                {selectedActivity.prospect && (
                  <p className="text-sm text-gray-600">
                    {selectedActivity.prospect.firstName} {selectedActivity.prospect.lastName}
                  </p>
                )}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleCompleteActivity} className="space-y-4">
                {/* Outcome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Outcome <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="outcome"
                    required
                    rows={4}
                    placeholder="Describe what happened and next steps..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCompleteModalOpen(false);
                      setSelectedActivity(null);
                      setError(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      'Completing...'
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Mark Complete
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
