'use client';

import { useState } from 'react';
import {
  X,
  FileText,
  FileCheck,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building2,
  TrendingUp,
  PiggyBank,
  Lightbulb,
  BarChart3,
} from 'lucide-react';
import {
  BusinessReportData,
  generateBusinessAnalysisPDF,
  generateQuickSummaryPDF,
  downloadPDF,
} from '@/lib/pdf-generator';

type ReportType = 'full' | 'summary';

interface ExportSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  included: boolean;
}

interface PDFExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessData: BusinessReportData;
  businessName?: string;
}

export function PDFExportModal({
  isOpen,
  onClose,
  businessData,
  businessName = 'Business',
}: PDFExportModalProps) {
  const [reportType, setReportType] = useState<ReportType>('full');
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [sections, setSections] = useState<ExportSection[]>([
    { id: 'financialOverview', label: 'Financial Overview', icon: <Building2 className="h-4 w-4" />, included: true },
    { id: 'performanceMetrics', label: 'Performance Metrics', icon: <BarChart3 className="h-4 w-4" />, included: true },
    { id: 'trendAnalysis', label: 'Trend Analysis', icon: <TrendingUp className="h-4 w-4" />, included: true },
    { id: 'retirementPlan', label: 'Retirement Plan Analysis', icon: <PiggyBank className="h-4 w-4" />, included: true },
    { id: 'quickFixes', label: 'Quick Win Recommendations', icon: <Lightbulb className="h-4 w-4" />, included: true },
  ]);

  const toggleSection = (id: string) => {
    setSections(prev =>
      prev.map(s => (s.id === id ? { ...s, included: !s.included } : s))
    );
  };

  const handleExport = async () => {
    setIsGenerating(true);
    setExportStatus('idle');
    setErrorMessage('');

    try {
      let doc: Blob;

      if (reportType === 'full') {
        // Filter data based on selected sections
        const filteredData = { ...businessData };

        sections.forEach(section => {
          if (!section.included) {
            switch (section.id) {
              case 'trendAnalysis':
                filteredData.trendAnalysis = undefined;
                break;
              case 'retirementPlan':
                filteredData.retirementOptions = undefined;
                break;
              case 'quickFixes':
                filteredData.quickFixes = [];
                break;
            }
          }
        });

        doc = await generateBusinessAnalysisPDF(filteredData);
      } else {
        doc = await generateQuickSummaryPDF(businessData);
      }

      const filename = `${businessName.replace(/\s+/g, '_')}_${reportType === 'full' ? 'Analysis_Report' : 'Summary'}_${new Date().toISOString().split('T')[0]}.pdf`;
      downloadPDF(doc, filename);

      setExportStatus('success');

      // Auto-close after success
      setTimeout(() => {
        onClose();
        setExportStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('PDF generation error:', error);
      setExportStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Export PDF Report</h2>
                <p className="text-sm text-blue-100">Generate CPA-ready analysis</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Report Type Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Report Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setReportType('full')}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  reportType === 'full'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <FileText className={`h-8 w-8 ${reportType === 'full' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${reportType === 'full' ? 'text-blue-900' : 'text-gray-700'}`}>
                    Full Report
                  </span>
                  <span className="text-xs text-gray-500 text-center">
                    Comprehensive analysis with all sections
                  </span>
                </div>
                {reportType === 'full' && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  </div>
                )}
              </button>

              <button
                onClick={() => setReportType('summary')}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  reportType === 'summary'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <FileCheck className={`h-8 w-8 ${reportType === 'summary' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${reportType === 'summary' ? 'text-blue-900' : 'text-gray-700'}`}>
                    Quick Summary
                  </span>
                  <span className="text-xs text-gray-500 text-center">
                    One-page executive overview
                  </span>
                </div>
                {reportType === 'summary' && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Section Selection (Full Report Only) */}
          {reportType === 'full' && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Include Sections
              </label>
              <div className="space-y-2">
                {sections.map(section => (
                  <label
                    key={section.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={section.included}
                      onChange={() => toggleSection(section.id)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-400">{section.icon}</span>
                    <span className="text-sm text-gray-700">{section.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Status Messages */}
          {exportStatus === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">PDF downloaded successfully!</span>
            </div>
          )}

          {exportStatus === 'error' && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-medium">Export failed</span>
                {errorMessage && (
                  <p className="text-xs mt-1 text-red-600">{errorMessage}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isGenerating || (reportType === 'full' && !sections.some(s => s.included))}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Compact export button for inline use
interface PDFExportButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function PDFExportButton({
  onClick,
  variant = 'primary',
  size = 'md',
  label = 'Export PDF',
}: PDFExportButtonProps) {
  const baseStyles = 'inline-flex items-center gap-2 font-medium rounded-lg transition-colors';

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
    ghost: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      <FileText className={size === 'sm' ? 'h-3.5 w-3.5' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'} />
      {label}
    </button>
  );
}

export default PDFExportModal;
