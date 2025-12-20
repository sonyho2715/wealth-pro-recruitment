'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface Activity {
  name: string;
  location: string;
  action: string;
  time: string;
}

const activities: Activity[] = [
  { name: 'Michael', location: 'Honolulu, HI', action: 'started a financial review', time: '2 min ago' },
  { name: 'Sarah', location: 'Maui, HI', action: 'completed their review', time: '5 min ago' },
  { name: 'David', location: 'Kailua, HI', action: 'scheduled a consultation', time: '8 min ago' },
  { name: 'Jennifer', location: 'Pearl City, HI', action: 'downloaded their report', time: '12 min ago' },
  { name: 'Robert', location: 'Hilo, HI', action: 'started a financial review', time: '15 min ago' },
  { name: 'Lisa', location: 'Kapolei, HI', action: 'joined as an advisor', time: '18 min ago' },
  { name: 'James', location: 'Waipahu, HI', action: 'completed their review', time: '22 min ago' },
  { name: 'Amanda', location: 'Aiea, HI', action: 'started a financial review', time: '25 min ago' },
];

export default function SocialProofNotification() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [activityIndex, setActivityIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Don't show if user dismissed or if on mobile
    if (isDismissed || typeof window !== 'undefined' && window.innerWidth < 768) {
      return;
    }

    // Initial delay before showing first notification
    const initialDelay = setTimeout(() => {
      showNotification();
    }, 5000);

    return () => clearTimeout(initialDelay);
  }, [isDismissed]);

  useEffect(() => {
    if (isDismissed) return;

    // Show new notifications periodically
    const interval = setInterval(() => {
      showNotification();
    }, 15000);

    return () => clearInterval(interval);
  }, [activityIndex, isDismissed]);

  const showNotification = () => {
    const activity = activities[activityIndex % activities.length];
    setCurrentActivity(activity);
    setIsVisible(true);

    // Hide after 5 seconds
    setTimeout(() => {
      setIsVisible(false);
      setActivityIndex((prev) => prev + 1);
    }, 5000);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  if (!currentActivity || isDismissed) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 z-40 max-w-sm transition-all duration-500 hidden md:block ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-4 flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900">
            {currentActivity.name} from {currentActivity.location}
          </p>
          <p className="text-sm text-slate-600">
            {currentActivity.action}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {currentActivity.time}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Dismiss notifications"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
