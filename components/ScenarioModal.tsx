'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Sparkles, X } from 'lucide-react';

interface ScenarioModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

/**
 * ScenarioModal - The Legal Shield
 *
 * This modal fires when users attempt to enter "Scenario Mode" (hypothetical income projections).
 * It serves as a consent gate that:
 * 1. Clearly communicates this is hypothetical/educational
 * 2. Requires explicit user acknowledgment
 * 3. Transfers liability - user chose to see projections
 * 4. Creates documentation trail of informed consent
 */
export default function ScenarioModal({ isOpen, onAccept, onDecline }: ScenarioModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onDecline}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all duration-300 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Close button */}
        <button
          onClick={onDecline}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with icon */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-2xl p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            Entering Scenario Mode
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning box */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-900 font-medium mb-2">
                  Important Notice
                </p>
                <p className="text-amber-800 text-sm leading-relaxed">
                  This mode allows you to simulate <strong>hypothetical business income</strong>.
                  These figures are for <strong>educational purposes only</strong> and are
                  <strong> not a guarantee of future earnings</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Key points */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-gray-600">1</span>
              </div>
              <p className="text-gray-700 text-sm">
                Income projections are <strong>hypothetical illustrations</strong> based on your inputs and industry averages.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-gray-600">2</span>
              </div>
              <p className="text-gray-700 text-sm">
                <strong>Results are not typical.</strong> Individual outcomes vary significantly based on effort, market conditions, and other factors.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-gray-600">3</span>
              </div>
              <p className="text-gray-700 text-sm">
                The majority of new agents earn less than the figures illustrated. <strong>There is no guarantee of income.</strong>
              </p>
            </div>
          </div>

          {/* Consent statement */}
          <p className="text-gray-600 text-xs text-center mb-6 px-4">
            By clicking "I Understand," you acknowledge that you are entering a hypothetical
            scenario mode and that all projections shown are for educational purposes only.
          </p>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onDecline}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={onAccept}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
