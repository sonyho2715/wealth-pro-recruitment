'use client';

import { useState, useTransition } from 'react';
import {
  FileText, Plus, Edit2, Trash2, Send, CheckCircle, Clock,
  AlertTriangle, Shield, Eye, X, Search, Users, FileSignature,
  Mail, MessageSquare, Link2, Copy, Check, ToggleLeft, ToggleRight
} from 'lucide-react';
import {
  createDisclosure,
  updateDisclosure,
  deleteDisclosure,
  toggleDisclosureActive,
  generateSigningLink,
  sendDisclosureRequest,
} from './actions';

interface Disclosure {
  id: string;
  title: string;
  description: string | null;
  requiredFor: string[];
  content: string;
  requiresSignature: boolean;
  isActive: boolean;
  version: number;
  signatureCount: number;
  createdAt: string;
}

interface Prospect {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

interface Signature {
  id: string;
  disclosureTitle: string;
  requiredFor: string[];
  signerName: string;
  signerEmail: string;
  signedAt: string;
  version: number;
}

interface Stats {
  total: number;
  active: number;
  totalSignatures: number;
  thisWeek: number;
}

interface DisclosuresClientProps {
  disclosures: Disclosure[];
  prospects: Prospect[];
  recentSignatures: Signature[];
  stats: Stats;
}

const requirementLabels: Record<string, { color: string; label: string }> = {
  PROSPECT_INTAKE: { color: 'bg-blue-100 text-blue-700', label: 'Prospect Intake' },
  BEFORE_PRESENTATION: { color: 'bg-purple-100 text-purple-700', label: 'Before Presentation' },
  BEFORE_APPLICATION: { color: 'bg-green-100 text-green-700', label: 'Before Application' },
  AGENT_ONBOARDING: { color: 'bg-orange-100 text-orange-700', label: 'Agent Onboarding' },
  ANNUAL_COMPLIANCE: { color: 'bg-red-100 text-red-700', label: 'Annual Compliance' },
};

export default function DisclosuresClient({
  disclosures,
  prospects,
  recentSignatures,
  stats,
}: DisclosuresClientProps) {
  const [isPending, startTransition] = useTransition();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [editingDisclosure, setEditingDisclosure] = useState<Disclosure | null>(null);
  const [viewingDisclosure, setViewingDisclosure] = useState<Disclosure | null>(null);
  const [selectedDisclosures, setSelectedDisclosures] = useState<string[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'disclosures' | 'signatures'>('disclosures');

  const filteredProspects = prospects.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Get checked requirements
    const requirements: string[] = [];
    ['PROSPECT_INTAKE', 'BEFORE_PRESENTATION', 'BEFORE_APPLICATION', 'AGENT_ONBOARDING', 'ANNUAL_COMPLIANCE'].forEach(req => {
      if (formData.get(`req_${req}`) === 'true') {
        requirements.push(req);
      }
    });
    formData.set('requiredFor', requirements.join(','));

    startTransition(async () => {
      const result = await createDisclosure(formData);
      if (result.success) {
        setShowCreateModal(false);
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingDisclosure) return;
    const formData = new FormData(e.currentTarget);

    // Get checked requirements
    const requirements: string[] = [];
    ['PROSPECT_INTAKE', 'BEFORE_PRESENTATION', 'BEFORE_APPLICATION', 'AGENT_ONBOARDING', 'ANNUAL_COMPLIANCE'].forEach(req => {
      if (formData.get(`req_${req}`) === 'true') {
        requirements.push(req);
      }
    });
    formData.set('requiredFor', requirements.join(','));

    startTransition(async () => {
      const result = await updateDisclosure(editingDisclosure.id, formData);
      if (result.success) {
        setEditingDisclosure(null);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this disclosure?')) return;

    startTransition(async () => {
      await deleteDisclosure(id);
    });
  };

  const handleToggleActive = (id: string) => {
    startTransition(async () => {
      await toggleDisclosureActive(id);
    });
  };

  const handleGenerateLink = async () => {
    if (selectedDisclosures.length === 0 || !selectedProspect) return;

    startTransition(async () => {
      const result = await generateSigningLink(selectedDisclosures, selectedProspect.id);
      if (result.success && result.data) {
        const fullUrl = `${window.location.origin}${result.data.url}`;
        setGeneratedLink(fullUrl);
      }
    });
  };

  const handleSendDisclosure = async (method: 'sms' | 'email') => {
    if (selectedDisclosures.length === 0 || !selectedProspect) return;

    startTransition(async () => {
      const result = await sendDisclosureRequest(selectedProspect.id, selectedDisclosures, method);
      if (result.success) {
        setShowSendModal(false);
        setSelectedDisclosures([]);
        setSelectedProspect(null);
        setSearchQuery('');
      }
    });
  };

  const copyToClipboard = async () => {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleDisclosureSelection = (id: string) => {
    setSelectedDisclosures(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Disclosures & E-Signatures</h1>
        <p className="text-gray-600">Manage compliance documents and track signatures</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Disclosures</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          <p className="text-sm text-gray-600">Active</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-blue-600">{stats.totalSignatures}</p>
          <p className="text-sm text-gray-600">Total Signatures</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-purple-600">{stats.thisWeek}</p>
          <p className="text-sm text-gray-600">This Week</p>
        </div>
      </div>

      {/* Actions */}
      <div className="card-gradient mb-6">
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('disclosures')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'disclosures'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Disclosures
            </button>
            <button
              onClick={() => setActiveTab('signatures')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'signatures'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Recent Signatures
            </button>
          </div>
          <div className="flex gap-2">
            {selectedDisclosures.length > 0 && (
              <button
                onClick={() => setShowSendModal(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send ({selectedDisclosures.length})
              </button>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Disclosure
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'disclosures' ? (
        <div className="card-gradient">
          {disclosures.length === 0 ? (
            <div className="text-center py-12">
              <FileSignature className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No disclosures yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create Your First Disclosure
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {disclosures.map((disclosure) => {
                const isSelected = selectedDisclosures.includes(disclosure.id);
                return (
                  <div
                    key={disclosure.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Selection checkbox */}
                      <button
                        onClick={() => toggleDisclosureSelection(disclosure.id)}
                        className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </button>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{disclosure.title}</h3>
                          {disclosure.requiresSignature && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">
                              Requires Signature
                            </span>
                          )}
                          {!disclosure.isActive && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">
                              Inactive
                            </span>
                          )}
                        </div>
                        {disclosure.description && (
                          <p className="text-sm text-gray-600 mb-2">{disclosure.description}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {disclosure.requiredFor.map(req => {
                            const config = requirementLabels[req];
                            return config ? (
                              <span key={req} className={`px-2 py-0.5 rounded-full text-xs ${config.color}`}>
                                {config.label}
                              </span>
                            ) : null;
                          })}
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span>v{disclosure.version}</span>
                          <span>{disclosure.signatureCount} signatures</span>
                          <span>Created {new Date(disclosure.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewingDisclosure(disclosure)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingDisclosure(disclosure)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(disclosure.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title={disclosure.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {disclosure.isActive ? (
                            <ToggleRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(disclosure.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
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
      ) : (
        <div className="card-gradient">
          {recentSignatures.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No signatures yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentSignatures.map((sig) => (
                <div key={sig.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{sig.signerName}</span>
                        <span className="text-gray-400">signed</span>
                        <span className="font-medium text-gray-700">{sig.disclosureTitle}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>v{sig.version}</span>
                        <span>{new Date(sig.signedAt).toLocaleString()}</span>
                        <span className="text-gray-400">{sig.signerEmail}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Create Disclosure</h2>
            </div>
            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  name="title"
                  type="text"
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Privacy Policy Consent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <input
                  name="description"
                  type="text"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of this disclosure"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required For</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(requirementLabels).map(([key, config]) => (
                    <label key={key} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        name={`req_${key}`}
                        value="true"
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{config.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  name="content"
                  required
                  rows={10}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Enter the full disclosure text..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="requiresSignature"
                  id="requiresSignature"
                  value="true"
                  defaultChecked
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="requiresSignature" className="text-sm text-gray-700">
                  Requires signature
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 btn-primary"
                >
                  {isPending ? 'Creating...' : 'Create Disclosure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingDisclosure && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Edit Disclosure</h2>
              <p className="text-sm text-gray-500">Editing content will create a new version</p>
            </div>
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  name="title"
                  type="text"
                  defaultValue={editingDisclosure.title}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  name="description"
                  type="text"
                  defaultValue={editingDisclosure.description || ''}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required For</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(requirementLabels).map(([key, config]) => (
                    <label key={key} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        name={`req_${key}`}
                        value="true"
                        defaultChecked={editingDisclosure.requiredFor.includes(key)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{config.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  name="content"
                  required
                  rows={10}
                  defaultValue={editingDisclosure.content}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="requiresSignature"
                  id="editRequiresSignature"
                  value="true"
                  defaultChecked={editingDisclosure.requiresSignature}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="editRequiresSignature" className="text-sm text-gray-700">
                  Requires signature
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingDisclosure(null)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 btn-primary"
                >
                  {isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingDisclosure && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{viewingDisclosure.title}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {viewingDisclosure.requiredFor.map(req => {
                    const config = requirementLabels[req];
                    return config ? (
                      <span key={req} className={`px-2 py-0.5 rounded-full text-xs ${config.color}`}>
                        {config.label}
                      </span>
                    ) : null;
                  })}
                  <span className="text-sm text-gray-500">Version {viewingDisclosure.version}</span>
                </div>
              </div>
              <button
                onClick={() => setViewingDisclosure(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-700 text-sm leading-relaxed">
                  {viewingDisclosure.content}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Send for Signature</h2>
              <p className="text-sm text-gray-500">
                {selectedDisclosures.length} disclosure(s) selected
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Prospect Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Prospect</label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search prospects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {selectedProspect ? (
                  <div className="p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedProspect.firstName} {selectedProspect.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{selectedProspect.email}</p>
                    </div>
                    <button
                      onClick={() => setSelectedProspect(null)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                    {filteredProspects.slice(0, 10).map((prospect) => (
                      <button
                        key={prospect.id}
                        onClick={() => {
                          setSelectedProspect(prospect);
                          setSearchQuery('');
                          setGeneratedLink(null);
                        }}
                        className="w-full p-3 text-left hover:bg-gray-50 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                          {prospect.firstName[0]}{prospect.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {prospect.firstName} {prospect.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{prospect.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Generate Link */}
              {selectedProspect && (
                <div className="space-y-3">
                  <button
                    onClick={handleGenerateLink}
                    disabled={isPending}
                    className="w-full btn-secondary flex items-center justify-center gap-2"
                  >
                    <Link2 className="w-4 h-4" />
                    Generate Signing Link
                  </button>

                  {generatedLink && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-2">Signing Link:</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={generatedLink}
                          className="flex-1 p-2 text-sm bg-white border border-gray-200 rounded-lg"
                        />
                        <button
                          onClick={copyToClipboard}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">Or send directly:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleSendDisclosure('sms')}
                        disabled={isPending || !selectedProspect.phone}
                        className="btn-secondary flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Send SMS
                      </button>
                      <button
                        onClick={() => handleSendDisclosure('email')}
                        disabled={isPending}
                        className="btn-secondary flex items-center justify-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        Send Email
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowSendModal(false);
                  setSelectedProspect(null);
                  setSearchQuery('');
                  setGeneratedLink(null);
                }}
                className="w-full btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
