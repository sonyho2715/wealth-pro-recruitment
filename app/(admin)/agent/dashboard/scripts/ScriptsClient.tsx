'use client';

import { useState, useTransition } from 'react';
import {
  Plus, Search, Phone, MessageSquare, Mail, Users,
  Target, Handshake, Megaphone, Copy, Edit, Trash2,
  MoreVertical, X, FileText, Star, Clock, ChevronDown,
  ChevronRight, Clipboard
} from 'lucide-react';
import {
  createScript,
  updateScript,
  deleteScript,
  trackScriptUsage,
  duplicateScript,
} from './actions';

interface Script {
  id: string;
  title: string;
  description: string | null;
  content: string;
  category: string;
  tags: string[];
  isSystem: boolean;
  usageCount: number;
  lastUsedAt: string | null;
  createdById: string | null;
  createdAt: string;
}

interface ScriptsClientProps {
  scripts: Script[];
  categoryCounts: Record<string, number>;
  currentAgentId: string;
}

const categoryConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  PHONE_OPENING: { label: 'Phone Opening', icon: <Phone className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700' },
  PHONE_FOLLOW_UP: { label: 'Follow-up Calls', icon: <Phone className="w-4 h-4" />, color: 'bg-sky-100 text-sky-700' },
  OBJECTION_HANDLING: { label: 'Objection Handling', icon: <Target className="w-4 h-4" />, color: 'bg-red-100 text-red-700' },
  APPOINTMENT_SETTING: { label: 'Appointment Setting', icon: <Clock className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700' },
  PRESENTATION: { label: 'Presentation', icon: <Megaphone className="w-4 h-4" />, color: 'bg-orange-100 text-orange-700' },
  CLOSING: { label: 'Closing', icon: <Handshake className="w-4 h-4" />, color: 'bg-green-100 text-green-700' },
  RECRUITING: { label: 'Recruiting', icon: <Users className="w-4 h-4" />, color: 'bg-indigo-100 text-indigo-700' },
  TEXT_TEMPLATE: { label: 'Text Messages', icon: <MessageSquare className="w-4 h-4" />, color: 'bg-teal-100 text-teal-700' },
  EMAIL_TEMPLATE: { label: 'Email Templates', icon: <Mail className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-700' },
  SOCIAL_MEDIA: { label: 'Social Media', icon: <Megaphone className="w-4 h-4" />, color: 'bg-pink-100 text-pink-700' },
};

export default function ScriptsClient({ scripts, categoryCounts, currentAgentId }: ScriptsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingScript, setEditingScript] = useState<Script | null>(null);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(Object.keys(categoryConfig)));

  // Filter scripts
  const filteredScripts = scripts.filter(script => {
    const matchesSearch =
      script.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      script.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      script.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || script.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Group by category
  const scriptsByCategory = filteredScripts.reduce((acc, script) => {
    if (!acc[script.category]) {
      acc[script.category] = [];
    }
    acc[script.category].push(script);
    return acc;
  }, {} as Record<string, Script[]>);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      if (editingScript) {
        await updateScript(editingScript.id, formData);
        setEditingScript(null);
      } else {
        await createScript(formData);
        setShowAddModal(false);
      }
    });
  };

  const handleDelete = async (scriptId: string) => {
    if (!confirm('Are you sure you want to delete this script?')) return;
    startTransition(async () => {
      await deleteScript(scriptId);
      setMenuOpenId(null);
    });
  };

  const handleDuplicate = async (scriptId: string) => {
    startTransition(async () => {
      await duplicateScript(scriptId);
      setMenuOpenId(null);
    });
  };

  const handleCopy = async (script: Script) => {
    await navigator.clipboard.writeText(script.content);
    setCopiedId(script.id);
    trackScriptUsage(script.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Scripts Library</h1>
        <p className="text-gray-600">Phone scripts, objection handling, and message templates</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-gray-900">{scripts.length}</p>
          <p className="text-sm text-gray-600">Total Scripts</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-red-600">{categoryCounts['OBJECTION_HANDLING'] || 0}</p>
          <p className="text-sm text-gray-600">Objections</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-blue-600">{categoryCounts['PHONE_OPENING'] || 0}</p>
          <p className="text-sm text-gray-600">Phone Scripts</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-green-600">{categoryCounts['CLOSING'] || 0}</p>
          <p className="text-sm text-gray-600">Closing Scripts</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-teal-600">{categoryCounts['TEXT_TEMPLATE'] || 0}</p>
          <p className="text-sm text-gray-600">Text Templates</p>
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
                placeholder="Search scripts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {Object.entries(categoryConfig).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Script
          </button>
        </div>
      </div>

      {/* Scripts by Category */}
      <div className="space-y-4">
        {Object.entries(categoryConfig).map(([categoryKey, config]) => {
          const categoryScripts = scriptsByCategory[categoryKey] || [];
          if (categoryScripts.length === 0 && categoryFilter !== 'all' && categoryFilter !== categoryKey) {
            return null;
          }

          const isExpanded = expandedCategories.has(categoryKey);

          return (
            <div key={categoryKey} className="card-gradient overflow-hidden">
              <button
                onClick={() => toggleCategory(categoryKey)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`p-2 rounded-lg ${config.color}`}>
                    {config.icon}
                  </span>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{config.label}</h3>
                    <p className="text-sm text-gray-500">{categoryScripts.length} scripts</p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isExpanded && categoryScripts.length > 0 && (
                <div className="border-t border-gray-100">
                  {categoryScripts.map((script) => (
                    <div
                      key={script.id}
                      className="p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{script.title}</h4>
                            {script.isSystem && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                                System
                              </span>
                            )}
                            {script.usageCount > 10 && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700 flex items-center gap-1">
                                <Star className="w-3 h-3" /> Popular
                              </span>
                            )}
                          </div>
                          {script.description && (
                            <p className="text-sm text-gray-600 mb-2">{script.description}</p>
                          )}
                          <p className="text-sm text-gray-800 whitespace-pre-wrap line-clamp-3">
                            {script.content}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Used {script.usageCount} times</span>
                            {script.lastUsedAt && (
                              <span>Last used {new Date(script.lastUsedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(script)}
                            className={`p-2 rounded-lg transition-colors ${
                              copiedId === script.id
                                ? 'bg-green-100 text-green-600'
                                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                            title="Copy to clipboard"
                          >
                            {copiedId === script.id ? (
                              <span className="text-xs">Copied!</span>
                            ) : (
                              <Clipboard className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => setSelectedScript(script)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="View full script"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          <div className="relative">
                            <button
                              onClick={() => setMenuOpenId(menuOpenId === script.id ? null : script.id)}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {menuOpenId === script.id && (
                              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                <button
                                  onClick={() => handleDuplicate(script.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Copy className="w-4 h-4" /> Duplicate
                                </button>
                                {!script.isSystem && script.createdById === currentAgentId && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingScript(script);
                                        setMenuOpenId(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Edit className="w-4 h-4" /> Edit
                                    </button>
                                    <button
                                      onClick={() => handleDelete(script.id)}
                                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                      <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isExpanded && categoryScripts.length === 0 && (
                <div className="p-8 text-center text-gray-500 border-t border-gray-100">
                  No scripts in this category yet.
                  <button
                    onClick={() => {
                      setShowAddModal(true);
                    }}
                    className="text-blue-600 hover:underline ml-2"
                  >
                    Add one
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingScript) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingScript ? 'Edit Script' : 'Add New Script'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingScript(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingScript?.title}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Initial Contact - Warm Lead"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  defaultValue={editingScript?.category || ''}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category...</option>
                  {Object.entries(categoryConfig).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  defaultValue={editingScript?.description || ''}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of when to use this script"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Script Content *
                </label>
                <textarea
                  name="content"
                  defaultValue={editingScript?.content || ''}
                  required
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Enter your script here...

You can use [brackets] for things to fill in, like:

Hi [Name], this is [Your Name] from [Company]..."
                />
              </div>

              <input type="hidden" name="tags" value="[]" />

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingScript(null);
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
                  {isPending ? 'Saving...' : editingScript ? 'Update Script' : 'Add Script'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Script Modal */}
      {selectedScript && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedScript.title}</h2>
                {selectedScript.description && (
                  <p className="text-sm text-gray-600 mt-1">{selectedScript.description}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedScript(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <pre className="whitespace-pre-wrap text-gray-800 font-sans">
                  {selectedScript.content}
                </pre>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {categoryConfig[selectedScript.category]?.label}
                </span>
                <button
                  onClick={() => {
                    handleCopy(selectedScript);
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <Clipboard className="w-4 h-4" />
                  {copiedId === selectedScript.id ? 'Copied!' : 'Copy Script'}
                </button>
              </div>
            </div>
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
