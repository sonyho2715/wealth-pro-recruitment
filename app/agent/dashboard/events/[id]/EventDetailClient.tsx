'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Search, Calendar, MapPin, Users, CheckCircle2,
  X, Trash2, Phone, Mail, UserCheck, UserX, Clock, Video,
  MessageSquare, RefreshCw, XCircle, User, ExternalLink
} from 'lucide-react';
import { addGuest, updateGuestStatus, checkInGuest, deleteGuest, updateBPMStatus } from '../actions';

interface Guest {
  id: string;
  guestName: string;
  guestPhone: string | null;
  guestEmail: string | null;
  status: string;
  arrived: boolean;
  arrivedAt: string | null;
  confirmedAt: string | null;
  isClient: boolean;
  isRecruit: boolean;
  rescheduled: boolean;
  notInterested: boolean;
  leftMessage: boolean;
  notes: string | null;
  inviter: {
    id: string;
    firstName: string;
    lastName: string;
  };
  contact: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

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
  guests: Guest[];
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
}

interface EventDetailClientProps {
  event: BPMEvent;
  contacts: Contact[];
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  INVITED: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Invited' },
  CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmed' },
  RESCHEDULED: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Rescheduled' },
  NOT_INTERESTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Not Interested' },
  ARRIVED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Arrived' },
  NO_SHOW: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'No Show' },
};

const eventStatusColors: Record<string, { bg: string; text: string; label: string }> = {
  SCHEDULED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Scheduled' },
  IN_PROGRESS: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'In Progress' },
  COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
};

export default function EventDetailClient({ event, contacts }: EventDetailClientProps) {
  const [isPending, startTransition] = useTransition();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const filteredGuests = event.guests.filter(guest => {
    const matchesSearch = guest.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.guestPhone?.includes(searchQuery) ||
      guest.inviter.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.inviter.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || guest.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const invited = event.guests.length;
  const confirmed = event.guests.filter(g => g.status === 'CONFIRMED').length;
  const arrived = event.guests.filter(g => g.arrived).length;
  const noShow = event.guests.filter(g => g.status === 'NO_SHOW').length;
  const rescheduled = event.guests.filter(g => g.rescheduled).length;
  const notInterested = event.guests.filter(g => g.notInterested).length;
  const attendanceRatio = invited > 0 ? Math.round((arrived / invited) * 100) : 0;

  const handleAddGuest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      await addGuest(event.id, formData);
      setShowAddModal(false);
      setSelectedContact(null);
    });
  };

  const handleCheckIn = async (guestId: string) => {
    startTransition(async () => {
      await checkInGuest(guestId);
    });
  };

  const handleStatusChange = async (guestId: string, newStatus: string) => {
    startTransition(async () => {
      const updates: any = { status: newStatus };
      if (newStatus === 'ARRIVED') {
        updates.arrived = true;
        updates.arrivedAt = new Date();
      }
      if (newStatus === 'CONFIRMED') {
        updates.confirmedAt = new Date();
      }
      if (newStatus === 'RESCHEDULED') {
        updates.rescheduled = true;
      }
      if (newStatus === 'NOT_INTERESTED') {
        updates.notInterested = true;
      }
      await updateGuestStatus(guestId, updates);
    });
  };

  const handleDelete = async (guestId: string) => {
    if (!confirm('Remove this guest from the event?')) return;
    startTransition(async () => {
      await deleteGuest(guestId);
    });
  };

  const handleEventStatusChange = async (status: string) => {
    startTransition(async () => {
      await updateBPMStatus(event.id, status);
    });
  };

  const eventDate = new Date(event.date);
  const eventStatus = eventStatusColors[event.status] || eventStatusColors.SCHEDULED;

  return (
    <div>
      {/* Back Link */}
      <Link
        href="/agent/dashboard/events"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </Link>

      {/* Event Header */}
      <div className="card-gradient mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${eventStatus.bg} ${eventStatus.text}`}>
                {eventStatus.label}
              </span>
              {event.isVirtual && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700 flex items-center gap-1">
                  <Video className="w-4 h-4" /> Virtual
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {eventDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
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
                  {event.address && ` - ${event.address}`}
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
                  Join Meeting
                </a>
              )}
            </div>
          </div>
          <select
            value={event.status}
            onChange={(e) => handleEventStatusChange(e.target.value)}
            disabled={isPending}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(eventStatusColors).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{invited}</p>
            <p className="text-sm text-gray-600">Invited</p>
          </div>
          <div className="bg-indigo-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-indigo-600">{confirmed}</p>
            <p className="text-sm text-gray-600">Confirmed</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{arrived}</p>
            <p className="text-sm text-gray-600">Checked In</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-emerald-600">{attendanceRatio}%</p>
            <p className="text-sm text-gray-600">Attendance</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-orange-600">{noShow}</p>
            <p className="text-sm text-gray-600">No Show</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">{rescheduled}</p>
            <p className="text-sm text-gray-600">Rescheduled</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-600">{notInterested}</p>
            <p className="text-sm text-gray-600">Not Interested</p>
          </div>
        </div>
      </div>

      {/* Guests Section */}
      <div className="card-gradient mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Guest List</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search guests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Guest
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              statusFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({event.guests.length})
          </button>
          <button
            onClick={() => setStatusFilter('ARRIVED')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              statusFilter === 'ARRIVED' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            Arrived ({arrived})
          </button>
          <button
            onClick={() => setStatusFilter('CONFIRMED')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              statusFilter === 'CONFIRMED' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            Confirmed ({confirmed})
          </button>
          <button
            onClick={() => setStatusFilter('RESCHEDULED')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              statusFilter === 'RESCHEDULED' ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            }`}
          >
            Rescheduled ({rescheduled})
          </button>
          <button
            onClick={() => setStatusFilter('NOT_INTERESTED')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              statusFilter === 'NOT_INTERESTED' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            Not Interested ({notInterested})
          </button>
        </div>

        {/* Guest List */}
        {filteredGuests.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No guests found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              Add Your First Guest
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredGuests.map((guest) => {
              const status = statusColors[guest.status] || statusColors.INVITED;
              return (
                <div
                  key={guest.id}
                  className={`p-4 rounded-xl border ${
                    guest.arrived ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                        guest.arrived ? 'bg-green-500' : 'bg-gray-400'
                      }`}>
                        {guest.guestName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{guest.guestName}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                            {status.label}
                          </span>
                          {guest.isClient && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              Client
                            </span>
                          )}
                          {guest.isRecruit && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                              Recruit
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
                          {guest.guestPhone && (
                            <a href={`tel:${guest.guestPhone}`} className="flex items-center gap-1 hover:text-blue-600">
                              <Phone className="w-3 h-3" /> {guest.guestPhone}
                            </a>
                          )}
                          {guest.guestEmail && (
                            <a href={`mailto:${guest.guestEmail}`} className="flex items-center gap-1 hover:text-blue-600">
                              <Mail className="w-3 h-3" /> {guest.guestEmail}
                            </a>
                          )}
                          <span className="flex items-center gap-1 text-gray-500">
                            <User className="w-3 h-3" /> Invited by {guest.inviter.firstName} {guest.inviter.lastName}
                          </span>
                          {guest.arrivedAt && (
                            <span className="flex items-center gap-1 text-green-600">
                              <Clock className="w-3 h-3" /> Checked in {new Date(guest.arrivedAt).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                        {guest.notes && (
                          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> {guest.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!guest.arrived && (
                        <button
                          onClick={() => handleCheckIn(guest.id)}
                          disabled={isPending}
                          className="btn-primary text-sm py-1.5 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Check In
                        </button>
                      )}
                      <select
                        value={guest.status}
                        onChange={(e) => handleStatusChange(guest.id, e.target.value)}
                        disabled={isPending}
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500"
                      >
                        {Object.entries(statusColors).map(([key, { label }]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleDelete(guest.id)}
                        disabled={isPending}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add Guest</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedContact(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGuest} className="p-6 space-y-4">
              {/* Quick Select from Contacts */}
              {contacts.length > 0 && !selectedContact && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Select from Contacts
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    {contacts.map(contact => (
                      <button
                        key={contact.id}
                        type="button"
                        onClick={() => setSelectedContact(contact)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-0"
                      >
                        <span className="font-medium">{contact.firstName} {contact.lastName}</span>
                        <span className="text-sm text-gray-500">{contact.phone}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Or enter details manually below</p>
                </div>
              )}

              {selectedContact && (
                <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
                  <span className="font-medium text-blue-700">
                    Selected: {selectedContact.firstName} {selectedContact.lastName}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedContact(null)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <input type="hidden" name="contactId" value={selectedContact?.id || ''} />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guest Name *
                </label>
                <input
                  type="text"
                  name="guestName"
                  defaultValue={selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName}` : ''}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="guestPhone"
                    defaultValue={selectedContact?.phone || ''}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="guestEmail"
                    defaultValue={selectedContact?.email || ''}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Any notes about this guest..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedContact(null);
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
                  {isPending ? 'Adding...' : 'Add Guest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
