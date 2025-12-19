'use client';

import { useState, useTransition } from 'react';
import {
  Play, Clock, CheckCircle, XCircle, Calendar, Users,
  Smartphone, Monitor, Tablet, ExternalLink, BarChart3,
  Search, Plus, Eye
} from 'lucide-react';
import Link from 'next/link';
import { startPresentationSession } from './actions';

interface Session {
  id: string;
  prospect: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    stage: string;
  };
  startedAt: string;
  endedAt: string | null;
  slidesViewed: string[];
  currentSlide: string | null;
  totalDuration: number | null;
  interactionCount: number;
  deviceType: string | null;
  outcome: string | null;
  notes: string | null;
}

interface Prospect {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  stage: string;
  netWorth: number | null;
}

interface Stats {
  total: number;
  completed: number;
  applicationStarted: number;
  followUpNeeded: number;
  avgDuration: number;
  thisWeek: number;
}

interface PresentationsClientProps {
  sessions: Session[];
  prospects: Prospect[];
  stats: Stats;
}

const outcomeConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  COMPLETED: { color: 'bg-green-100 text-green-700', label: 'Completed', icon: <CheckCircle className="w-3 h-3" /> },
  APPLICATION_STARTED: { color: 'bg-blue-100 text-blue-700', label: 'Application Started', icon: <Play className="w-3 h-3" /> },
  FOLLOW_UP_NEEDED: { color: 'bg-yellow-100 text-yellow-700', label: 'Follow-up Needed', icon: <Clock className="w-3 h-3" /> },
  INTERRUPTED: { color: 'bg-orange-100 text-orange-700', label: 'Interrupted', icon: <XCircle className="w-3 h-3" /> },
  DECLINED: { color: 'bg-red-100 text-red-700', label: 'Declined', icon: <XCircle className="w-3 h-3" /> },
};

const deviceIcons: Record<string, React.ReactNode> = {
  mobile: <Smartphone className="w-4 h-4" />,
  tablet: <Tablet className="w-4 h-4" />,
  desktop: <Monitor className="w-4 h-4" />,
};

export default function PresentationsClient({ sessions, prospects, stats }: PresentationsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [showStartModal, setShowStartModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);

  // Filter prospects for selection
  const filteredProspects = prospects.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartPresentation = (prospect: Prospect) => {
    // Detect device type
    const ua = navigator.userAgent;
    let deviceType = 'desktop';
    if (/tablet|ipad/i.test(ua)) deviceType = 'tablet';
    else if (/mobile|iphone|android/i.test(ua)) deviceType = 'mobile';

    startTransition(async () => {
      const result = await startPresentationSession(prospect.id, deviceType);
      if (result.success && result.data) {
        // Open presentation in new tab
        window.open(`/present/${prospect.id}?session=${result.data.id}`, '_blank');
        setShowStartModal(false);
        setSelectedProspect(null);
      }
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Presentations</h1>
        <p className="text-gray-600">Track and manage your prospect presentations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Presentations</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-purple-600">{stats.thisWeek}</p>
          <p className="text-sm text-gray-600">This Week</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-sm text-gray-600">Completed</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-blue-600">{stats.applicationStarted}</p>
          <p className="text-sm text-gray-600">Apps Started</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-yellow-600">{stats.followUpNeeded}</p>
          <p className="text-sm text-gray-600">Follow-ups</p>
        </div>
        <div className="card-gradient p-4">
          <p className="text-2xl font-bold text-indigo-600">{stats.avgDuration}m</p>
          <p className="text-sm text-gray-600">Avg. Duration</p>
        </div>
      </div>

      {/* Actions */}
      <div className="card-gradient mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-gray-600">
            <BarChart3 className="w-5 h-5" />
            <span>Recent presentation sessions</span>
          </div>
          <button
            onClick={() => setShowStartModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Start Presentation
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="card-gradient">
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <Play className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No presentations yet</p>
            <button
              onClick={() => setShowStartModal(true)}
              className="btn-primary"
            >
              Start Your First Presentation
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sessions.map((session) => {
              const outcome = session.outcome ? outcomeConfig[session.outcome] : null;
              return (
                <div key={session.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Device Icon */}
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                      {deviceIcons[session.deviceType || 'desktop']}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {session.prospect.firstName} {session.prospect.lastName}
                        </h3>
                        {outcome && (
                          <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${outcome.color}`}>
                            {outcome.icon} {outcome.label}
                          </span>
                        )}
                        {!session.endedAt && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 animate-pulse">
                            In Progress
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(session.startedAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(session.totalDuration)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {session.slidesViewed.length} slides viewed
                        </span>
                      </div>
                      {session.notes && (
                        <p className="text-sm text-gray-500 mt-1 truncate">{session.notes}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/agent/dashboard/balance-sheets/${session.prospect.id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Balance Sheet"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      {!session.endedAt && (
                        <a
                          href={`/present/${session.prospect.id}?session=${session.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary text-sm"
                        >
                          Resume
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Start Presentation Modal */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Start Presentation</h2>
              <p className="text-sm text-gray-600">Select a prospect to present to</p>
            </div>

            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search prospects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredProspects.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  No prospects found
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredProspects.map((prospect) => (
                    <button
                      key={prospect.id}
                      onClick={() => handleStartPresentation(prospect)}
                      disabled={isPending}
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                        {prospect.firstName[0]}{prospect.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">
                          {prospect.firstName} {prospect.lastName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{prospect.email}</p>
                      </div>
                      {prospect.netWorth !== null && (
                        <span className="text-sm text-gray-500">
                          ${prospect.netWorth.toLocaleString()}
                        </span>
                      )}
                      <Play className="w-5 h-5 text-blue-600" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowStartModal(false);
                  setSearchQuery('');
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
