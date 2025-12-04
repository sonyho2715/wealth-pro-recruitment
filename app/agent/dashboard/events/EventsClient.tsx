'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Plus, Search, Calendar, MapPin, Users, CheckCircle2,
  X, MoreVertical, Trash2, Edit, Video, Clock, Target,
  UserCheck, UserX, AlertCircle, ExternalLink
} from 'lucide-react';
import { createBPM, updateBPM, deleteBPM, updateBPMStatus } from './actions';

interface BPMEvent {
  id: string;
  name: string;
  date: string;
  location: string | null;
  address: string | null;
  isVirtual: boolean;
  virtualLink: string | null;
  inviteGoal: number;
  attendanceGoal: number;
  status: string;
  guests: {
    id: string;
    guestName: string;
    status: string;
    arrived: boolean;
  }[];
  createdAt: string;
}

interface Stats {
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  totalInvites: number;
  totalAttended: number;
}

interface EventsClientProps {
  events: BPMEvent[];
  stats: Stats;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  SCHEDULED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Scheduled' },
  IN_PROGRESS: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'In Progress' },
  COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
};

export default function EventsClient({ events, stats }: EventsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<BPMEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      if (editingEvent) {
        await updateBPM(editingEvent.id, formData);
        setEditingEvent(null);
      } else {
        await createBPM(formData);
        setShowAddModal(false);
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    startTransition(async () => {
      await deleteBPM(id);
      setMenuOpenId(null);
    });
  };

  const handleStatusChange = async (id: string, status: string) => {
    startTransition(async () => {
      await updateBPMStatus(id, status);
    });
  };

  const getEventStats = (event: BPMEvent) => {
    const invited = event.guests.length;
    const attended = event.guests.filter(g => g.arrived).length;
    const confirmed = event.guests.filter(g => g.status === 'CONFIRMED').length;
    return { invited, attended, confirmed };
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">BPM Events</h1>
        <p className="text-gray-600">Manage Business Presentation Meetings and track guest attendance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Events</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
          <p className="text-sm text-gray-600">Scheduled</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
          <p className="text-sm text-gray-600">In Progress</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-sm text-gray-600">Completed</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-purple-600">{stats.totalInvites}</p>
          <p className="text-sm text-gray-600">Total Invites</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-emerald-600">{stats.totalAttended}</p>
          <p className="text-sm text-gray-600">Total Attended</p>
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
                placeholder="Search events..."
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
            New Event
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="card-gradient text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No events found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              Create Your First Event
            </button>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const { invited, attended, confirmed } = getEventStats(event);
            const status = statusColors[event.status] || statusColors.SCHEDULED;
            const eventDate = new Date(event.date);
            const isUpcoming = eventDate > new Date();
            const isToday = eventDate.toDateString() === new Date().toDateString();

            return (
              <div key={event.id} className="card-gradient hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        href={`/agent/dashboard/events/${event.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {event.name}
                      </Link>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                      {isToday && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          Today
                        </span>
                      )}
                      {event.isVirtual && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 flex items-center gap-1">
                          <Video className="w-3 h-3" /> Virtual
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {eventDate.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </span>
                      )}
                      {event.virtualLink && (
                        <a
                          href={event.virtualLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Join Link
                        </a>
                      )}
                    </div>

                    {/* Progress Stats */}
                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{invited}</span>
                          <span className="text-gray-500">/ {event.inviteGoal} invited</span>
                        </div>
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min((invited / event.inviteGoal) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-sm">
                          <UserCheck className="w-4 h-4 text-green-500" />
                          <span className="font-medium">{attended}</span>
                          <span className="text-gray-500">/ {event.attendanceGoal} attended</span>
                        </div>
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${Math.min((attended / event.attendanceGoal) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="font-medium">{confirmed}</span>
                        <span className="text-gray-500">confirmed</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <select
                      value={event.status}
                      onChange={(e) => handleStatusChange(event.id, e.target.value)}
                      disabled={isPending}
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(statusColors).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>

                    <Link
                      href={`/agent/dashboard/events/${event.id}`}
                      className="btn-secondary text-sm py-1.5"
                    >
                      Manage
                    </Link>

                    <div className="relative">
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === event.id ? null : event.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {menuOpenId === event.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={() => {
                              setEditingEvent(event);
                              setMenuOpenId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingEvent) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingEvent ? 'Edit Event' : 'Create New BPM Event'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingEvent(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Name *
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingEvent?.name}
                  required
                  placeholder="e.g., Thursday Night BPM"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    defaultValue={editingEvent?.date?.slice(0, 16)}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type
                  </label>
                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="isVirtual"
                        value="false"
                        defaultChecked={!editingEvent?.isVirtual}
                        className="text-blue-600"
                      />
                      <span className="text-sm">In-Person</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="isVirtual"
                        value="true"
                        defaultChecked={editingEvent?.isVirtual}
                        className="text-blue-600"
                      />
                      <span className="text-sm">Virtual</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location Name
                  </label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={editingEvent?.location || ''}
                    placeholder="e.g., Main Office"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={editingEvent?.address || ''}
                    placeholder="123 Main St, City, State"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Virtual Meeting Link
                </label>
                <input
                  type="url"
                  name="virtualLink"
                  defaultValue={editingEvent?.virtualLink || ''}
                  placeholder="https://zoom.us/j/..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invite Goal
                  </label>
                  <input
                    type="number"
                    name="inviteGoal"
                    defaultValue={editingEvent?.inviteGoal || 10}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attendance Goal
                  </label>
                  <input
                    type="number"
                    name="attendanceGoal"
                    defaultValue={editingEvent?.attendanceGoal || 5}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {editingEvent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={editingEvent.status}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(statusColors).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingEvent(null);
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
                  {isPending ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
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
