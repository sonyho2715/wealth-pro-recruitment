'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import {
  FileText, CheckCircle, ChevronRight, ChevronLeft,
  AlertTriangle, Phone, Mail, Eraser, PenTool
} from 'lucide-react';
import { submitSignature } from '@/app/agent/dashboard/disclosures/actions';

interface Disclosure {
  id: string;
  title: string;
  requiredFor: string[];
  content: string;
  requiresSignature: boolean;
  version: number;
}

interface SigningViewProps {
  prospect: {
    id: string;
    firstName: string;
    lastName: string;
  };
  agent: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  } | null;
  disclosures: Disclosure[];
  alreadySignedCount: number;
}

const requirementLabels: Record<string, { color: string; label: string }> = {
  PROSPECT_INTAKE: { color: 'bg-blue-100 text-blue-700', label: 'Intake' },
  BEFORE_PRESENTATION: { color: 'bg-purple-100 text-purple-700', label: 'Pre-Presentation' },
  BEFORE_APPLICATION: { color: 'bg-green-100 text-green-700', label: 'Pre-Application' },
  AGENT_ONBOARDING: { color: 'bg-orange-100 text-orange-700', label: 'Onboarding' },
  ANNUAL_COMPLIANCE: { color: 'bg-cyan-100 text-cyan-700', label: 'Annual Compliance' },
  DEFAULT: { color: 'bg-gray-100 text-gray-700', label: 'Document' },
};

export default function SigningView({
  prospect,
  agent,
  disclosures,
  alreadySignedCount,
}: SigningViewProps) {
  const [isPending, startTransition] = useTransition();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [signedDisclosures, setSignedDisclosures] = useState<string[]>([]);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasRead, setHasRead] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentDisclosure = disclosures[currentIndex];
  const allSigned = signedDisclosures.length === disclosures.length;
  const isCurrentSigned = signedDisclosures.includes(currentDisclosure?.id);

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Set drawing style
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [showSignaturePad]);

  // Track scroll to mark as read
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = content;
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        setHasRead(true);
      }
    };

    // Check if content doesn't need scrolling
    if (content.scrollHeight <= content.clientHeight) {
      setHasRead(true);
    } else {
      setHasRead(false);
    }

    content.addEventListener('scroll', handleScroll);
    return () => content.removeEventListener('scroll', handleScroll);
  }, [currentIndex]);

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const coords = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getSignatureData = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Check if canvas has any content
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasContent = imageData.data.some((value, index) => {
      // Check alpha channel (every 4th value starting at index 3)
      return index % 4 === 3 && value > 0;
    });

    if (!hasContent) return null;

    return canvas.toDataURL('image/png');
  };

  const handleSign = () => {
    const signatureData = getSignatureData();
    if (!signatureData) {
      alert('Please draw your signature');
      return;
    }

    startTransition(async () => {
      const result = await submitSignature(
        currentDisclosure.id,
        prospect.id,
        signatureData,
        undefined, // IP address will be captured server-side in production
        navigator.userAgent
      );

      if (result.success) {
        setSignedDisclosures(prev => [...prev, currentDisclosure.id]);
        setShowSignaturePad(false);
        clearSignature();

        // Move to next unsigned disclosure
        if (currentIndex < disclosures.length - 1) {
          setCurrentIndex(prev => prev + 1);
        }
      } else {
        alert(result.error || 'Failed to submit signature');
      }
    });
  };

  if (disclosures.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">All Documents Signed</h1>
          <p className="text-gray-600 mb-4">
            You have already signed all required documents. Thank you!
          </p>
          {alreadySignedCount > 0 && (
            <p className="text-sm text-gray-500">
              {alreadySignedCount} document(s) were previously signed
            </p>
          )}
          {agent && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-2">Questions? Contact:</p>
              <p className="font-medium text-gray-900">
                {agent.firstName} {agent.lastName}
              </p>
              {agent.phone && (
                <a href={`tel:${agent.phone}`} className="flex items-center justify-center gap-1 text-blue-600 mt-1">
                  <Phone className="w-4 h-4" />
                  {agent.phone}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (allSigned) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-lg">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600 mb-6">
            You have successfully signed all {disclosures.length} document(s).
          </p>
          {agent && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-2">Your Financial Professional</p>
              <p className="font-semibold text-gray-900">
                {agent.firstName} {agent.lastName}
              </p>
              <div className="flex items-center justify-center gap-4 mt-2 text-sm">
                {agent.phone && (
                  <a href={`tel:${agent.phone}`} className="flex items-center gap-1 text-blue-600">
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                )}
                <a href={`mailto:${agent.email}`} className="flex items-center gap-1 text-blue-600">
                  <Mail className="w-4 h-4" />
                  Email
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const requirementType = currentDisclosure.requiredFor[0] || 'DEFAULT';
  const type = requirementLabels[requirementType] || requirementLabels.DEFAULT;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-gray-900">Document Signing</h1>
            <p className="text-sm text-gray-500">
              {prospect.firstName} {prospect.lastName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {signedDisclosures.length + 1} of {disclosures.length}
            </span>
            <div className="flex gap-1">
              {disclosures.map((d, i) => (
                <div
                  key={d.id}
                  className={`w-2 h-2 rounded-full ${
                    signedDisclosures.includes(d.id)
                      ? 'bg-green-500'
                      : i === currentIndex
                      ? 'bg-blue-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Document Header */}
          <div className="bg-white rounded-t-2xl p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-bold text-lg text-gray-900">{currentDisclosure.title}</h2>
                  {currentDisclosure.requiresSignature && (
                    <span className="text-xs text-red-600">*Signature Required</span>
                  )}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${type.color}`}>
                  {type.label}
                </span>
              </div>
              {isCurrentSigned && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Signed</span>
                </div>
              )}
            </div>
          </div>

          {/* Document Content */}
          <div
            ref={contentRef}
            className="bg-white p-4 overflow-y-auto max-h-[50vh] border-b border-gray-100"
          >
            <pre className="whitespace-pre-wrap font-sans text-gray-700 text-sm leading-relaxed">
              {currentDisclosure.content}
            </pre>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-b-2xl p-4 shadow-lg">
            {!hasRead && !isCurrentSigned ? (
              <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded-lg mb-4">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">Please scroll down to read the entire document</p>
              </div>
            ) : null}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCurrentIndex(prev => prev - 1);
                  setHasRead(false);
                }}
                disabled={currentIndex === 0}
                className={`p-3 rounded-lg border ${
                  currentIndex === 0
                    ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {isCurrentSigned ? (
                <button
                  onClick={() => {
                    // Find next unsigned
                    const nextUnsigned = disclosures.findIndex((d, i) =>
                      i > currentIndex && !signedDisclosures.includes(d.id)
                    );
                    if (nextUnsigned >= 0) {
                      setCurrentIndex(nextUnsigned);
                      setHasRead(false);
                    } else if (currentIndex < disclosures.length - 1) {
                      setCurrentIndex(currentIndex + 1);
                      setHasRead(false);
                    }
                  }}
                  disabled={currentIndex === disclosures.length - 1}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2"
                >
                  Next Document
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSignaturePad(true)}
                  disabled={!hasRead}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
                    hasRead
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <PenTool className="w-5 h-5" />
                  Sign Document
                </button>
              )}

              <button
                onClick={() => {
                  setCurrentIndex(prev => prev + 1);
                  setHasRead(false);
                }}
                disabled={currentIndex === disclosures.length - 1}
                className={`p-3 rounded-lg border ${
                  currentIndex === disclosures.length - 1
                    ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-white border-t border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-gray-600">
              {signedDisclosures.length} of {disclosures.length} signed
            </span>
          </div>
          {agent && (
            <span className="text-gray-500">
              Agent: {agent.firstName} {agent.lastName}
            </span>
          )}
        </div>
      </div>

      {/* Signature Pad Modal */}
      {showSignaturePad && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl sm:m-4 rounded-t-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900">Sign Document</h3>
              <p className="text-sm text-gray-500">Draw your signature below</p>
            </div>

            <div className="p-4">
              <div className="border-2 border-gray-200 rounded-xl bg-white mb-4 relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-40 touch-none cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                <div className="absolute bottom-2 left-2 right-2 border-t border-gray-300 border-dashed" />
                <button
                  onClick={clearSignature}
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Eraser className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mb-4">
                By signing, I acknowledge that I have read and agree to the terms of this document.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSignaturePad(false);
                    clearSignature();
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSign}
                  disabled={isPending}
                  className="flex-1 btn-primary"
                >
                  {isPending ? 'Signing...' : 'Submit Signature'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
