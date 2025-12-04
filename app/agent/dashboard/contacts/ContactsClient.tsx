'use client';

import { useState, useTransition } from 'react';
import {
  Plus, Search, Filter, Phone, Mail, Calendar, User,
  Thermometer, ArrowRight, MoreVertical, Trash2, Edit,
  UserPlus, Clock, MessageSquare, X, ChevronDown, Users
} from 'lucide-react';
import {
  createContact,
  updateContact,
  updateContactTemperature,
  deleteContact,
  convertToProspect,
  scheduleFollowUp,
} from './actions';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  relationship: string | null;
  temperature: string;
  source: string;
  notes: string | null;
  tags: string[];
  birthday: string | null;
  occupation: string | null;
  company: string | null;
  lastContactedAt: string | null;
  nextFollowUpAt: string | null;
  followUpNotes: string | null;
  createdAt: string;
  prospect: { id: string; firstName: string; lastName: string; status: string } | null;
  referredBy: { id: string; firstName: string; lastName: string } | null;
  referrals: { id: string; firstName: string; lastName: string }[];
}

interface Stats {
  total: number;
  cold: number;
  warming: number;
  warm: number;
  hot: number;
  converted: number;
  followUpsToday: number;
}

interface ContactsClientProps {
  contacts: Contact[];
  stats: Stats;
}

const temperatureColors: Record<string, { bg: string; text: string; label: string; icon: string }> = {
  COLD: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Cold', icon: '❄️' },
  WARMING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Warming', icon: '🌤️' },
  WARM: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Warm', icon: '☀️' },
  HOT: { bg: 'bg-red-100', text: 'text-red-700', label: 'Hot', icon: '🔥' },
  CONVERTED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Converted', icon: '✅' },
  NOT_INTERESTED: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Not Interested', icon: '❌' },
};

const relationshipLabels: Record<string, string> = {
  FAMILY: 'Family',
  FRIEND: 'Friend',
  COWORKER: 'Coworker',
  NEIGHBOR: 'Neighbor',
  CHURCH: 'Church',
  GYM: 'Gym',
  SOCIAL_MEDIA: 'Social Media',
  REFERRAL: 'Referral',
  COLD_LEAD: 'Cold Lead',
  OTHER: 'Other',
};

export default function ContactsClient({ contacts, stats }: ContactsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [temperatureFilter, setTemperatureFilter] = useState<string>('all');
  const [relationshipFilter, setRelationshipFilter] = useState<string>('all');
  const [showFollowUpModal, setShowFollowUpModal] = useState<Contact | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch =
      contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone?.includes(searchQuery) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTemperature = temperatureFilter === 'all' || contact.temperature === temperatureFilter;
    const matchesRelationship = relationshipFilter === 'all' || contact.relationship === relationshipFilter;

    return matchesSearch && matchesTemperature && matchesRelationship;
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      if (editingContact) {
        await updateContact(editingContact.id, formData);
        setEditingContact(null);
      } else {
        await createContact(formData);
        setShowAddModal(false);
      }
    });
  };

  const handleTemperatureChange = async (contactId: string, newTemperature: string) => {
    startTransition(async () => {
      await updateContactTemperature(contactId, newTemperature);
    });
  };

  const handleDelete = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    startTransition(async () => {
      await deleteContact(contactId);
      setMenuOpenId(null);
    });
  };

  const handleConvert = async (contactId: string) => {
    if (!confirm('Convert this contact to a prospect? This will create a new prospect record.')) return;
    startTransition(async () => {
      const result = await convertToProspect(contactId);
      if (result.success) {
        alert('Contact converted to prospect successfully!');
      } else {
        alert(result.error || 'Failed to convert');
      }
      setMenuOpenId(null);
    });
  };

  const handleScheduleFollowUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showFollowUpModal) return;

    const formData = new FormData(e.currentTarget);
    const date = formData.get('date') as string;
    const notes = formData.get('notes') as string;

    startTransition(async () => {
      await scheduleFollowUp(showFollowUpModal.id, date, notes);
      setShowFollowUpModal(null);
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Warm Market</h1>
        <p className="text-gray-600">Manage your contacts and track relationship temperature</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Contacts</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-blue-600">{stats.cold}</p>
          <p className="text-sm text-gray-600">❄️ Cold</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-yellow-600">{stats.warming}</p>
          <p className="text-sm text-gray-600">🌤️ Warming</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-orange-600">{stats.warm}</p>
          <p className="text-sm text-gray-600">☀️ Warm</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-red-600">{stats.hot}</p>
          <p className="text-sm text-gray-600">🔥 Hot</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
          <p className="text-sm text-gray-600">✅ Converted</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-purple-600">{stats.followUpsToday}</p>
          <p className="text-sm text-gray-600">📅 Follow-ups Today</p>
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
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={temperatureFilter}
              onChange={(e) => setTemperatureFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Temperatures</option>
              {Object.entries(temperatureColors).map(([key, { label, icon }]) => (
                <option key={key} value={key}>{icon} {label}</option>
              ))}
            </select>

            <select
              value={relationshipFilter}
              onChange={(e) => setRelationshipFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Relationships</option>
              {Object.entries(relationshipLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Contacts List */}
      <div className="card-gradient">
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No contacts found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              Add Your First Contact
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredContacts.map((contact) => {
              const temp = temperatureColors[contact.temperature] || temperatureColors.COLD;
              return (
                <div
                  key={contact.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar & Temperature */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                        {contact.firstName[0]}{contact.lastName[0]}
                      </div>
                      <span className="text-lg mt-1">{temp.icon}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${temp.bg} ${temp.text}`}>
                          {temp.label}
                        </span>
                        {contact.relationship && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {relationshipLabels[contact.relationship] || contact.relationship}
                          </span>
                        )}
                        {contact.prospect && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Prospect
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {contact.phone && (
                          <a href={`tel:${contact.phone}`} className="flex items-center gap-1 hover:text-blue-600">
                            <Phone className="w-3 h-3" /> {contact.phone}
                          </a>
                        )}
                        {contact.email && (
                          <a href={`mailto:${contact.email}`} className="flex items-center gap-1 hover:text-blue-600">
                            <Mail className="w-3 h-3" /> {contact.email}
                          </a>
                        )}
                        {contact.company && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {contact.company}
                          </span>
                        )}
                      </div>

                      {contact.nextFollowUpAt && (
                        <div className="mt-2 flex items-center gap-1 text-sm text-purple-600">
                          <Clock className="w-3 h-3" />
                          Follow-up: {new Date(contact.nextFollowUpAt).toLocaleDateString()}
                          {contact.followUpNotes && (
                            <span className="text-gray-500 ml-2">- {contact.followUpNotes}</span>
                          )}
                        </div>
                      )}

                      {contact.referrals.length > 0 && (
                        <div className="mt-2 text-sm text-gray-500">
                          Referred: {contact.referrals.map(r => `${r.firstName} ${r.lastName}`).join(', ')}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {/* Temperature Quick Change */}
                      <select
                        value={contact.temperature}
                        onChange={(e) => handleTemperatureChange(contact.id, e.target.value)}
                        disabled={isPending}
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500"
                      >
                        {Object.entries(temperatureColors).map(([key, { label, icon }]) => (
                          <option key={key} value={key}>{icon} {label}</option>
                        ))}
                      </select>

                      {/* Follow-up */}
                      <button
                        onClick={() => setShowFollowUpModal(contact)}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                        title="Schedule Follow-up"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>

                      {/* More Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpenId(menuOpenId === contact.id ? null : contact.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {menuOpenId === contact.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button
                              onClick={() => {
                                setEditingContact(contact);
                                setMenuOpenId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" /> Edit
                            </button>
                            {!contact.prospect && (
                              <button
                                onClick={() => handleConvert(contact.id)}
                                className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                              >
                                <UserPlus className="w-4 h-4" /> Convert to Prospect
                              </button>
                            )}
                            {contact.prospect && (
                              <a
                                href={`/agent/dashboard/balance-sheets/${contact.prospect.id}`}
                                className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                              >
                                <ArrowRight className="w-4 h-4" /> View Prospect
                              </a>
                            )}
                            <button
                              onClick={() => handleDelete(contact.id)}
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
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingContact) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingContact ? 'Edit Contact' : 'Add New Contact'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingContact(null);
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
                    defaultValue={editingContact?.firstName}
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
                    defaultValue={editingContact?.lastName}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingContact?.phone || ''}
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
                    defaultValue={editingContact?.email || ''}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <select
                    name="relationship"
                    defaultValue={editingContact?.relationship || ''}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select relationship...</option>
                    {Object.entries(relationshipLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temperature
                  </label>
                  <select
                    name="temperature"
                    defaultValue={editingContact?.temperature || 'COLD'}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(temperatureColors).map(([key, { label, icon }]) => (
                      <option key={key} value={key}>{icon} {label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    defaultValue={editingContact?.company || ''}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Occupation
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    defaultValue={editingContact?.occupation || ''}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Birthday
                </label>
                <input
                  type="date"
                  name="birthday"
                  defaultValue={editingContact?.birthday?.split('T')[0] || ''}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  defaultValue={editingContact?.notes || ''}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any notes about this contact..."
                />
              </div>

              <input type="hidden" name="source" value="MANUAL" />
              <input type="hidden" name="tags" value="[]" />

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingContact(null);
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
                  {isPending ? 'Saving...' : editingContact ? 'Update Contact' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Follow-up Modal */}
      {showFollowUpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Schedule Follow-up</h2>
              <button
                onClick={() => setShowFollowUpModal(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleFollowUp} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact
                </label>
                <p className="font-semibold text-gray-900">
                  {showFollowUpModal.firstName} {showFollowUpModal.lastName}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Follow-up Date *
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  defaultValue={showFollowUpModal.nextFollowUpAt?.split('T')[0] || ''}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  defaultValue={showFollowUpModal.followUpNotes || ''}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="What to discuss..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFollowUpModal(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary"
                >
                  {isPending ? 'Saving...' : 'Schedule'}
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
