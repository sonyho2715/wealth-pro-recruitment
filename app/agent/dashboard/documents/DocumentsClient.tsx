'use client';

import { useState, useMemo } from 'react';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Grid3x3,
  List,
  Filter,
  X,
  FileCheck,
  Shield,
  CreditCard,
  DollarSign,
  File,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '@/components/Pagination';
import { deleteDocument, uploadDocument } from './actions';

type DocumentType = 'APPLICATION' | 'POLICY' | 'ID_DOCUMENT' | 'FINANCIAL_STATEMENT' | 'OTHER';

interface Document {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  size: number | null;
  uploadedAt: Date;
  prospectId: string | null;
  prospect: {
    firstName: string;
    lastName: string;
  } | null;
}

interface Prospect {
  id: string;
  firstName: string;
  lastName: string;
}

interface Props {
  documents: Document[];
  prospects: Prospect[];
}

const documentTypes = [
  { value: 'APPLICATION', label: 'Application', icon: FileCheck, color: 'blue' },
  { value: 'POLICY', label: 'Policy', icon: Shield, color: 'green' },
  { value: 'ID_DOCUMENT', label: 'ID Document', icon: CreditCard, color: 'purple' },
  { value: 'FINANCIAL_STATEMENT', label: 'Financial Statement', icon: DollarSign, color: 'orange' },
  { value: 'OTHER', label: 'Other', icon: File, color: 'gray' },
];

const ITEMS_PER_PAGE = 12;

export default function DocumentsClient({ documents: initialDocuments, prospects }: Props) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedType, setSelectedType] = useState<DocumentType | 'ALL'>('ALL');
  const [selectedProspect, setSelectedProspect] = useState<string | 'ALL'>('ALL');
  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter documents
  const filteredDocuments = useMemo(() => {
    let filtered = [...documents];

    // Filter by type
    if (selectedType !== 'ALL') {
      filtered = filtered.filter(doc => doc.type === selectedType);
    }

    // Filter by prospect
    if (selectedProspect !== 'ALL') {
      filtered = filtered.filter(doc => doc.prospectId === selectedProspect);
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(doc => new Date(doc.uploadedAt) >= cutoff);
    }

    return filtered.sort((a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }, [documents, selectedType, selectedProspect, dateRange]);

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDocuments.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredDocuments, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = <T,>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleDelete = (id: string) => {
    setDeletingDocumentId(id);
  };

  const confirmDeleteDocument = async () => {
    if (!deletingDocumentId) return;

    const result = await deleteDocument(deletingDocumentId);
    if (result.success) {
      setDocuments(prev => prev.filter(doc => doc.id !== deletingDocumentId));
      toast.success('Document deleted');
    } else {
      toast.error(result.error || 'Failed to delete document');
    }
    setDeletingDocumentId(null);
  };

  const handleDownload = (url: string, name: string) => {
    // In a real app, this would download from S3/cloud storage
    // For now, show a toast and open in new tab
    toast.success(`Downloading: ${name}`);
    window.open(url, '_blank');
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDocumentIcon = (type: DocumentType) => {
    const docType = documentTypes.find(t => t.value === type);
    return docType ? docType.icon : File;
  };

  const getDocumentColor = (type: DocumentType) => {
    const docType = documentTypes.find(t => t.value === type);
    return docType?.color || 'gray';
  };

  const activeFiltersCount =
    (selectedType !== 'ALL' ? 1 : 0) +
    (selectedProspect !== 'ALL' ? 1 : 0) +
    (dateRange !== 'all' ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-1">
            Manage prospect documents and files
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Document Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => handleFilterChange(setSelectedType, e.target.value as DocumentType | 'ALL')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Types</option>
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Prospect Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prospect
            </label>
            <select
              value={selectedProspect}
              onChange={(e) => handleFilterChange(setSelectedProspect, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Prospects</option>
              <option value="GENERAL">General Documents</option>
              {prospects.map(prospect => (
                <option key={prospect.id} value={prospect.id}>
                  {prospect.firstName} {prospect.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => handleFilterChange(setDateRange, e.target.value as typeof dateRange)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => {
                setSelectedType('ALL');
                setSelectedProspect('ALL');
                setDateRange('all');
                setCurrentPage(1);
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Document Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'}
        </p>
      </div>

      {/* Documents Grid/List */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No documents found
            </h3>
            <p className="text-gray-600 mb-6">
              {activeFiltersCount > 0
                ? 'Try adjusting your filters or upload your first document.'
                : 'Upload your first document to get started.'}
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedDocuments.map((doc) => {
            const Icon = getDocumentIcon(doc.type);
            const color = getDocumentColor(doc.type);
            const docType = documentTypes.find(t => t.value === doc.type);

            return (
              <div
                key={doc.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-${color}-100`}>
                    <Icon className={`w-6 h-6 text-${color}-600`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate mb-1">
                      {doc.name}
                    </h3>
                    <div className="space-y-1">
                      <span className={`inline-block px-2 py-0.5 bg-${color}-100 text-${color}-700 text-xs rounded`}>
                        {docType?.label}
                      </span>
                      {doc.prospect && (
                        <p className="text-sm text-gray-600">
                          {doc.prospect.firstName} {doc.prospect.lastName}
                        </p>
                      )}
                      {!doc.prospectId && (
                        <p className="text-sm text-gray-500">General Document</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{formatDate(doc.uploadedAt)}</span>
                    <span>{formatFileSize(doc.size)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(doc.url, doc.name)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prospect
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedDocuments.map((doc) => {
                const Icon = getDocumentIcon(doc.type);
                const color = getDocumentColor(doc.type);
                const docType = documentTypes.find(t => t.value === doc.type);

                return (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded bg-${color}-100`}>
                          <Icon className={`w-4 h-4 text-${color}-600`} />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 bg-${color}-100 text-${color}-700 text-xs rounded`}>
                        {docType?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {doc.prospect
                        ? `${doc.prospect.firstName} ${doc.prospect.lastName}`
                        : <span className="text-gray-400">General</span>
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(doc.uploadedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatFileSize(doc.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownload(doc.url, doc.name)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
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
        </div>
      )}

      {/* Pagination */}
      {filteredDocuments.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredDocuments.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingDocumentId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Document</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingDocumentId(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteDocument}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          prospects={prospects}
          onClose={() => setShowUploadModal(false)}
          onUpload={(doc) => {
            setDocuments(prev => [doc, ...prev]);
            setShowUploadModal(false);
          }}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
        />
      )}
    </div>
  );
}

interface UploadModalProps {
  prospects: Prospect[];
  onClose: () => void;
  onUpload: (doc: Document) => void;
  isUploading: boolean;
  setIsUploading: (val: boolean) => void;
}

function UploadModal({ prospects, onClose, onUpload, isUploading, setIsUploading }: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('OTHER');
  const [prospectId, setProspectId] = useState<string>('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);

    // Simulate file upload (in production, upload to S3/cloud storage)
    const formData = new FormData();
    formData.append('name', selectedFile.name);
    formData.append('type', documentType);
    if (prospectId) formData.append('prospectId', prospectId);
    formData.append('url', `/uploads/${selectedFile.name}`); // Simulated URL
    formData.append('size', selectedFile.size.toString());

    const result = await uploadDocument(formData);

    setIsUploading(false);

    if (result.success && result.data) {
      const prospect = prospects.find(p => p.id === prospectId);
      onUpload({
        ...result.data,
        uploadedAt: new Date(result.data.uploadedAt),
        prospect: prospect ? { firstName: prospect.firstName, lastName: prospect.lastName } : null,
      });
      toast.success('Document uploaded');
    } else {
      toast.error(result.error || 'Failed to upload document');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {selectedFile ? (
              <div className="space-y-2">
                <FileText className="w-8 h-8 text-blue-600 mx-auto" />
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Change file
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600">
                  Drag and drop your file here, or{' '}
                  <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                    browse
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-500">
                  PDF, DOC, DOCX, JPG, PNG up to 10MB
                </p>
              </div>
            )}
          </div>

          {/* Document Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Type
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Prospect Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link to Prospect (Optional)
            </label>
            <select
              value={prospectId}
              onChange={(e) => setProspectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">General Document</option>
              {prospects.map(prospect => (
                <option key={prospect.id} value={prospect.id}>
                  {prospect.firstName} {prospect.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
