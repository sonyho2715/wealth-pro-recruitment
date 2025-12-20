'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { X, Gift, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';

export default function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleExitIntent = useCallback((e: MouseEvent) => {
    // Only trigger on desktop and when mouse leaves through the top
    if (hasShown || window.innerWidth < 768) return;

    if (e.clientY <= 5 && e.movementY < 0) {
      setIsVisible(true);
      setHasShown(true);
    }
  }, [hasShown]);

  useEffect(() => {
    // Check if popup was already shown in this session
    const wasShown = sessionStorage.getItem('exitPopupShown');
    if (wasShown) {
      setHasShown(true);
      return;
    }

    // Add delay before enabling exit intent (don't trigger immediately)
    const timer = setTimeout(() => {
      document.addEventListener('mouseout', handleExitIntent);
    }, 10000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseout', handleExitIntent);
    };
  }, [handleExitIntent]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('exitPopupShown', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSuccess(true);
    setIsSubmitting(false);

    // Close after showing success
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full pointer-events-auto animate-scaleIn overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors z-10"
            aria-label="Close popup"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

          <div className="p-8">
            {isSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                  Check Your Email!
                </h3>
                <p className="text-slate-600">
                  Your free report is on its way.
                </p>
              </div>
            ) : (
              <>
                {/* Icon */}
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <Gift className="w-7 h-7 text-blue-600" />
                </div>

                {/* Heading */}
                <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-3 font-serif">
                  Wait! Before You Go...
                </h2>

                <p className="text-slate-600 mb-6">
                  Get your <strong>FREE Financial Health Checkup Report</strong> and discover if you have any hidden protection gaps.
                </p>

                {/* Benefits */}
                <div className="space-y-3 mb-6">
                  {[
                    'Personalized risk assessment',
                    'Protection gap analysis',
                    'Actionable next steps',
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-medium px-6 py-3.5 rounded-lg hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : (
                      <>
                        Get My Free Report
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                {/* Urgency */}
                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span>Takes 2 minutes to complete</span>
                </div>

                {/* Alternative CTA */}
                <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                  <p className="text-sm text-slate-500 mb-2">
                    Or start your full review now
                  </p>
                  <Link
                    href="/prospect"
                    onClick={handleClose}
                    className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors"
                  >
                    Begin Financial Review
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
