'use client';

import { useState, useEffect } from 'react';
import {
  Mail,
  MessageSquare,
  Plus,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  Power,
  X,
  Phone,
} from 'lucide-react';
import {
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  toggleEmailTemplateStatus,
} from './actions';
import { DEFAULT_EMAIL_TEMPLATES, EMAIL_CATEGORIES, EmailCategory, DEFAULT_SMS_TEMPLATES, SMS_CATEGORIES } from './templates';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Prospect {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  protectionGap: number | null;
}

interface EmailsClientProps {
  initialTemplates: EmailTemplate[];
  prospects: Prospect[];
  agentName: string;
}

export default function EmailsClient({
  initialTemplates,
  prospects,
  agentName,
}: EmailsClientProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates);
  const [activeTab, setActiveTab] = useState<'email' | 'sms'>('email');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSmsCategory, setSelectedSmsCategory] = useState<string>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUseModalOpen, setIsUseModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  // Filter templates by category
  const filteredTemplates = templates.filter(template => {
    if (selectedCategory === 'All') return true;
    return template.category === selectedCategory;
  });

  // Group templates by category
  const templatesByCategory = filteredTemplates.reduce((acc, template) => {
    const category = template.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, EmailTemplate[]>);

  // Replace merge fields in template
  const replaceMergeFields = (text: string, prospect: Prospect | null) => {
    if (!prospect) return text;

    return text
      .replace(/\{\{firstName\}\}/g, prospect.firstName)
      .replace(/\{\{lastName\}\}/g, prospect.lastName)
      .replace(/\{\{agentName\}\}/g, agentName)
      .replace(/\{\{protectionGap\}\}/g, prospect.protectionGap?.toLocaleString() || '0');
  };

  // Handle create template
  const handleCreateTemplate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await createEmailTemplate(formData);

    if (result.success && result.data) {
      setTemplates([...templates, result.data]);
      setIsCreateModalOpen(false);
      e.currentTarget.reset();
    } else {
      alert(result.error || 'Failed to create template');
    }

    setIsSubmitting(false);
  };

  // Handle update template
  const handleUpdateTemplate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      subject: formData.get('subject') as string,
      body: formData.get('body') as string,
      category: formData.get('category') as string,
    };

    const result = await updateEmailTemplate(selectedTemplate.id, data);

    if (result.success && result.data) {
      setTemplates(templates.map(t => t.id === selectedTemplate.id ? result.data! : t));
      setIsEditModalOpen(false);
      setSelectedTemplate(null);
    } else {
      alert(result.error || 'Failed to update template');
    }

    setIsSubmitting(false);
  };

  // Handle delete template
  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    const result = await deleteEmailTemplate(id);

    if (result.success) {
      setTemplates(templates.filter(t => t.id !== id));
    } else {
      alert(result.error || 'Failed to delete template');
    }
  };

  // Handle toggle template status
  const handleToggleStatus = async (id: string) => {
    const result = await toggleEmailTemplateStatus(id);

    if (result.success && result.data) {
      setTemplates(templates.map(t => t.id === id ? result.data! : t));
    } else {
      alert(result.error || 'Failed to toggle template status');
    }
  };

  // Handle copy to clipboard
  const handleCopyToClipboard = (template: EmailTemplate) => {
    const subject = replaceMergeFields(template.subject, selectedProspect);
    const body = replaceMergeFields(template.body, selectedProspect);
    const fullEmail = `Subject: ${subject}\n\n${body}`;

    navigator.clipboard.writeText(fullEmail);
    setCopiedTemplate(template.id);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  // Handle open in email client
  const handleOpenInEmail = (template: EmailTemplate) => {
    if (!selectedProspect) {
      alert('Please select a prospect first');
      return;
    }

    const subject = replaceMergeFields(template.subject, selectedProspect);
    const body = replaceMergeFields(template.body, selectedProspect);

    const mailtoLink = `mailto:${selectedProspect.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  // Open use template modal
  const handleUseTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsUseModalOpen(true);
  };

  // Open edit template modal
  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsEditModalOpen(true);
  };

  // Filter SMS templates
  const filteredSmsTemplates = DEFAULT_SMS_TEMPLATES.filter(template => {
    if (selectedSmsCategory === 'All') return true;
    return template.category === selectedSmsCategory;
  });

  // Group SMS templates by category
  const smsByCategory = filteredSmsTemplates.reduce((acc, template) => {
    const category = template.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, typeof DEFAULT_SMS_TEMPLATES>);

  // Handle copy SMS to clipboard
  const handleCopySms = (body: string) => {
    const text = selectedProspect
      ? body
          .replace(/\{\{firstName\}\}/g, selectedProspect.firstName)
          .replace(/\{\{lastName\}\}/g, selectedProspect.lastName)
          .replace(/\{\{agentName\}\}/g, agentName)
      : body;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Message Templates</h1>
          <p className="text-gray-600">Pre-written templates for emails and SMS</p>
        </div>
        {activeTab === 'email' && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Template
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('email')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'email'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Mail className="w-4 h-4" />
          Email Templates ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab('sms')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'sms'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          SMS Templates ({DEFAULT_SMS_TEMPLATES.length})
        </button>
      </div>

      {/* Prospect Selector for Preview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Prospect for Preview
        </label>
        <select
          value={selectedProspect?.id || ''}
          onChange={(e) => {
            const prospect = prospects.find(p => p.id === e.target.value);
            setSelectedProspect(prospect || null);
          }}
          className="w-full sm:w-96 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Choose a prospect...</option>
          {prospects.map(prospect => (
            <option key={prospect.id} value={prospect.id}>
              {prospect.firstName} {prospect.lastName} ({prospect.email})
            </option>
          ))}
        </select>
      </div>

      {/* EMAIL TEMPLATES TAB */}
      {activeTab === 'email' && (
        <>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'All'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {EMAIL_CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Email Templates Grid */}
          {selectedCategory === 'All' ? (
            <div className="space-y-8">
              {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
                <div key={category}>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{category}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryTemplates.map(template => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        selectedProspect={selectedProspect}
                        agentName={agentName}
                        copiedTemplate={copiedTemplate}
                        onUse={handleUseTemplate}
                        onEdit={handleEditTemplate}
                        onDelete={handleDeleteTemplate}
                        onToggleStatus={handleToggleStatus}
                        onCopy={handleCopyToClipboard}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  selectedProspect={selectedProspect}
                  agentName={agentName}
                  copiedTemplate={copiedTemplate}
                  onUse={handleUseTemplate}
                  onEdit={handleEditTemplate}
                  onDelete={handleDeleteTemplate}
                  onToggleStatus={handleToggleStatus}
                  onCopy={handleCopyToClipboard}
                />
              ))}
            </div>
          )}

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No templates found in this category</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Create your first template
              </button>
            </div>
          )}
        </>
      )}

      {/* SMS TEMPLATES TAB */}
      {activeTab === 'sms' && (
        <>
          {/* SMS Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSmsCategory('All')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedSmsCategory === 'All'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {SMS_CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedSmsCategory(category)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedSmsCategory === category
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* SMS Templates Grid */}
          {selectedSmsCategory === 'All' ? (
            <div className="space-y-8">
              {Object.entries(smsByCategory).map(([category, smsTemplates]) => (
                <div key={category}>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{category}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {smsTemplates.map((sms, idx) => (
                      <SmsTemplateCard
                        key={`${category}-${idx}`}
                        template={sms}
                        selectedProspect={selectedProspect}
                        agentName={agentName}
                        onCopy={handleCopySms}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSmsTemplates.map((sms, idx) => (
                <SmsTemplateCard
                  key={`sms-${idx}`}
                  template={sms}
                  selectedProspect={selectedProspect}
                  agentName={agentName}
                  onCopy={handleCopySms}
                />
              ))}
            </div>
          )}

          {filteredSmsTemplates.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No SMS templates found in this category</p>
            </div>
          )}
        </>
      )}

      {/* Create Template Modal */}
      {isCreateModalOpen && (
        <TemplateFormModal
          title="Create Email Template"
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateTemplate}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Edit Template Modal */}
      {isEditModalOpen && selectedTemplate && (
        <TemplateFormModal
          title="Edit Email Template"
          template={selectedTemplate}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTemplate(null);
          }}
          onSubmit={handleUpdateTemplate}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Use Template Modal */}
      {isUseModalOpen && selectedTemplate && (
        <UseTemplateModal
          template={selectedTemplate}
          selectedProspect={selectedProspect}
          prospects={prospects}
          agentName={agentName}
          onClose={() => {
            setIsUseModalOpen(false);
            setSelectedTemplate(null);
          }}
          onSelectProspect={setSelectedProspect}
          onCopy={handleCopyToClipboard}
          onOpenEmail={handleOpenInEmail}
          copiedTemplate={copiedTemplate}
        />
      )}
    </div>
  );
}

// Template Card Component
interface TemplateCardProps {
  template: EmailTemplate;
  selectedProspect: Prospect | null;
  agentName: string;
  copiedTemplate: string | null;
  onUse: (template: EmailTemplate) => void;
  onEdit: (template: EmailTemplate) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onCopy: (template: EmailTemplate) => void;
}

function TemplateCard({
  template,
  selectedProspect,
  agentName,
  copiedTemplate,
  onUse,
  onEdit,
  onDelete,
  onToggleStatus,
  onCopy,
}: TemplateCardProps) {
  const replaceMergeFields = (text: string) => {
    if (!selectedProspect) return text;

    return text
      .replace(/\{\{firstName\}\}/g, selectedProspect.firstName)
      .replace(/\{\{lastName\}\}/g, selectedProspect.lastName)
      .replace(/\{\{agentName\}\}/g, agentName)
      .replace(/\{\{protectionGap\}\}/g, selectedProspect.protectionGap?.toLocaleString() || '0');
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${template.isActive ? 'border-gray-200' : 'border-gray-300 opacity-60'} p-6 space-y-4`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{template.name}</h3>
          <span className="inline-block px-2 py-1 mt-2 text-xs rounded-full bg-blue-100 text-blue-700">
            {template.category}
          </span>
        </div>
        <button
          onClick={() => onToggleStatus(template.id)}
          className={`p-1 rounded hover:bg-gray-100 ${template.isActive ? 'text-green-600' : 'text-gray-400'}`}
          title={template.isActive ? 'Active' : 'Inactive'}
        >
          <Power className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Subject:</p>
          <p className="text-sm text-gray-700">
            {selectedProspect ? replaceMergeFields(template.subject) : template.subject}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Preview:</p>
          <p className="text-sm text-gray-600 line-clamp-3">
            {selectedProspect ? replaceMergeFields(template.body) : template.body}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t">
        <button
          onClick={() => onUse(template)}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          Use Template
        </button>
        <button
          onClick={() => onCopy(template)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          title="Copy to clipboard"
        >
          {copiedTemplate === template.id ? (
            <span className="text-green-600 text-xs font-medium">Copied!</span>
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={() => onEdit(template)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(template.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Template Form Modal
interface TemplateFormModalProps {
  title: string;
  template?: EmailTemplate;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
}

function TemplateFormModal({
  title,
  template,
  onClose,
  onSubmit,
  isSubmitting,
}: TemplateFormModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name
            </label>
            <input
              type="text"
              name="name"
              defaultValue={template?.name}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Initial Introduction"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              defaultValue={template?.category}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a category...</option>
              {EMAIL_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject Line
            </label>
            <input
              type="text"
              name="subject"
              defaultValue={template?.subject}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Introduction from {{agentName}}"
            />
            <p className="mt-1 text-xs text-gray-500">
              Use merge fields: {'{'}firstName{'}'}, {'{'}lastName{'}'}, {'{'}agentName{'}'}, {'{'}protectionGap{'}'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Body
            </label>
            <textarea
              name="body"
              defaultValue={template?.body}
              required
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="Write your email template here..."
            />
          </div>

          <div className="flex items-center gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Use Template Modal
interface UseTemplateModalProps {
  template: EmailTemplate;
  selectedProspect: Prospect | null;
  prospects: Prospect[];
  agentName: string;
  onClose: () => void;
  onSelectProspect: (prospect: Prospect | null) => void;
  onCopy: (template: EmailTemplate) => void;
  onOpenEmail: (template: EmailTemplate) => void;
  copiedTemplate: string | null;
}

function UseTemplateModal({
  template,
  selectedProspect,
  prospects,
  agentName,
  onClose,
  onSelectProspect,
  onCopy,
  onOpenEmail,
  copiedTemplate,
}: UseTemplateModalProps) {
  const replaceMergeFields = (text: string) => {
    if (!selectedProspect) return text;

    return text
      .replace(/\{\{firstName\}\}/g, selectedProspect.firstName)
      .replace(/\{\{lastName\}\}/g, selectedProspect.lastName)
      .replace(/\{\{agentName\}\}/g, agentName)
      .replace(/\{\{protectionGap\}\}/g, selectedProspect.protectionGap?.toLocaleString() || '0');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{template.name}</h2>
            <span className="inline-block px-2 py-1 mt-1 text-xs rounded-full bg-blue-100 text-blue-700">
              {template.category}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Prospect
            </label>
            <select
              value={selectedProspect?.id || ''}
              onChange={(e) => {
                const prospect = prospects.find(p => p.id === e.target.value);
                onSelectProspect(prospect || null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a prospect...</option>
              {prospects.map(prospect => (
                <option key={prospect.id} value={prospect.id}>
                  {prospect.firstName} {prospect.lastName} ({prospect.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-sm text-gray-900">
                {selectedProspect ? replaceMergeFields(template.subject) : template.subject}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Body
            </label>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
              <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans">
                {selectedProspect ? replaceMergeFields(template.body) : template.body}
              </pre>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              onClick={() => onCopy(template)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Copy className="w-4 h-4" />
              {copiedTemplate === template.id ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            <button
              onClick={() => onOpenEmail(template)}
              disabled={!selectedProspect}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ExternalLink className="w-4 h-4" />
              Open in Email Client
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// SMS Template Card Component
interface SmsTemplateCardProps {
  template: {
    name: string;
    body: string;
    category: string;
  };
  selectedProspect: Prospect | null;
  agentName: string;
  onCopy: (body: string) => void;
}

function SmsTemplateCard({
  template,
  selectedProspect,
  agentName,
  onCopy,
}: SmsTemplateCardProps) {
  const [copied, setCopied] = useState(false);

  const replaceMergeFields = (text: string) => {
    if (!selectedProspect) return text;

    return text
      .replace(/\{\{firstName\}\}/g, selectedProspect.firstName)
      .replace(/\{\{lastName\}\}/g, selectedProspect.lastName)
      .replace(/\{\{agentName\}\}/g, agentName);
  };

  const handleCopy = () => {
    onCopy(template.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const previewText = replaceMergeFields(template.body);
  const charCount = previewText.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">{template.name}</h3>
          <span className="inline-block px-2 py-0.5 mt-1 text-xs rounded-full bg-green-100 text-green-700">
            {template.category}
          </span>
        </div>
        <MessageSquare className="w-4 h-4 text-green-600 flex-shrink-0" />
      </div>

      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-sm text-gray-700 whitespace-pre-wrap">
          {previewText}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <span className={`text-xs ${charCount > 160 ? 'text-amber-600' : 'text-gray-500'}`}>
          {charCount} characters {charCount > 160 && '(may be split)'}
        </span>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            copied
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {copied ? (
            <>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
