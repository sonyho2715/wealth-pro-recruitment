'use client';

import { useState } from 'react';
import { X, ChevronRight, Users, Target, BookOpen, Rocket, Check } from 'lucide-react';

interface OnboardingWizardProps {
  firstName: string;
  onComplete: () => void;
  onDismiss: () => void;
}

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to WealthPro!',
    icon: Rocket,
    content: (firstName: string) => (
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Rocket className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Welcome, {firstName}!
        </h2>
        <p className="text-slate-400">
          Let&apos;s get you set up for success. This quick tour will show you the key features of your new recruitment platform.
        </p>
      </div>
    ),
  },
  {
    id: 'prospects',
    title: 'Manage Prospects',
    icon: Target,
    content: () => (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">Track Your Prospects</h3>
        </div>
        <p className="text-slate-400 mb-4">
          Add prospects from your warm market, track their journey from contact to client or recruit.
        </p>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-slate-300">
            <Check className="w-4 h-4 text-green-400" />
            Financial needs analysis calculator
          </li>
          <li className="flex items-center gap-2 text-slate-300">
            <Check className="w-4 h-4 text-green-400" />
            Quick actions: Schedule BPM, Request matchup
          </li>
          <li className="flex items-center gap-2 text-slate-300">
            <Check className="w-4 h-4 text-green-400" />
            Convert prospects to recruits with one click
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'recruits',
    title: 'Track Recruits',
    icon: Users,
    content: () => (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">Build Your Team</h3>
        </div>
        <p className="text-slate-400 mb-4">
          Track your recruits through the licensing process with milestone tracking.
        </p>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-slate-300">
            <Check className="w-4 h-4 text-green-400" />
            Onboarding milestones (Meet Spouse, Submit License, etc.)
          </li>
          <li className="flex items-center gap-2 text-slate-300">
            <Check className="w-4 h-4 text-green-400" />
            Licensing progress tracker
          </li>
          <li className="flex items-center gap-2 text-slate-300">
            <Check className="w-4 h-4 text-green-400" />
            Production tracking per recruit
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'events',
    title: 'BPM Events',
    icon: BookOpen,
    content: () => (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-orange-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">Business Presentation Meetings</h3>
        </div>
        <p className="text-slate-400 mb-4">
          Schedule and manage BPM events, track guest attendance and follow-ups.
        </p>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-slate-300">
            <Check className="w-4 h-4 text-green-400" />
            Create in-person or virtual events
          </li>
          <li className="flex items-center gap-2 text-slate-300">
            <Check className="w-4 h-4 text-green-400" />
            Invite guests and track confirmations
          </li>
          <li className="flex items-center gap-2 text-slate-300">
            <Check className="w-4 h-4 text-green-400" />
            Real-time check-in and follow-up tracking
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'ready',
    title: 'You\'re Ready!',
    icon: Rocket,
    content: () => (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          You&apos;re All Set!
        </h2>
        <p className="text-slate-400 mb-6">
          Your 14-day free trial has started. Here are some quick actions to get started:
        </p>
        <div className="grid grid-cols-2 gap-3 text-left">
          <a
            href="/agent/dashboard/prospects"
            className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition"
          >
            <div className="text-sm font-medium text-white">Add a Prospect</div>
            <div className="text-xs text-slate-400">Start building your pipeline</div>
          </a>
          <a
            href="/agent/dashboard/events"
            className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition"
          >
            <div className="text-sm font-medium text-white">Schedule a BPM</div>
            <div className="text-xs text-slate-400">Plan your next event</div>
          </a>
          <a
            href="/agent/dashboard/recruits"
            className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition"
          >
            <div className="text-sm font-medium text-white">Add a Recruit</div>
            <div className="text-xs text-slate-400">Track team members</div>
          </a>
          <a
            href="/agent/dashboard/scripts"
            className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition"
          >
            <div className="text-sm font-medium text-white">Browse Scripts</div>
            <div className="text-xs text-slate-400">Use proven templates</div>
          </a>
        </div>
      </div>
    ),
  },
];

export function OnboardingWizard({ firstName, onComplete, onDismiss }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <div
                key={s.id}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentStep
                    ? 'bg-blue-500'
                    : i < currentStep
                    ? 'bg-blue-500/50'
                    : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step.content(firstName)}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-800/50">
          {currentStep > 0 ? (
            <button
              onClick={handlePrevious}
              className="px-4 py-2 text-slate-400 hover:text-white transition"
            >
              Back
            </button>
          ) : (
            <button
              onClick={onDismiss}
              className="px-4 py-2 text-slate-400 hover:text-white transition"
            >
              Skip Tour
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
