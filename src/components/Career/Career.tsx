import { useState, lazy, Suspense, useMemo, useEffect } from 'react';
import {
  Calculator,
  TrendingUp,
  Rocket,
  GraduationCap,
  Send,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  DollarSign,
  Users,
  Award,
  Clock,
  ArrowRight,
  Sparkles,
  Target,
} from 'lucide-react';
import { agentConfig } from '../../config/agent.config';

// Lazy load career sections
const IncomeCalculator = lazy(() => import('../Recruitment/IncomeCalculator'));
const TraditionalVsAgent = lazy(() => import('../Recruitment/TraditionalVsAgent'));
const CareerTimeline = lazy(() => import('../Recruitment/CareerTimeline'));
const TrainingSupport = lazy(() => import('../Recruitment/TrainingSupport'));
const ApplicationForm = lazy(() => import('../Recruitment/ApplicationForm'));
const EmailCapture = lazy(() => import('../Recruitment/EmailCapture'));
const CalendarBooking = lazy(() => import('../Recruitment/CalendarBooking'));

// Loading component
function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      <span className="ml-3 text-gray-600">Loading section...</span>
    </div>
  );
}

type CareerSection = 'calculator' | 'comparison' | 'timeline' | 'training' | 'schedule' | 'apply';

// Journey stage configuration (inspired by Living Balance Sheet's category approach)
interface JourneyStage {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  sections: {
    id: CareerSection;
    name: string;
    icon: React.ReactNode;
    description: string;
  }[];
}

export default function Career() {
  const [activeSection, setActiveSection] = useState<CareerSection>('calculator');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [visitedSections, setVisitedSections] = useState<Set<CareerSection>>(new Set(['calculator']));

  // Track visited sections for progress
  useEffect(() => {
    setVisitedSections(prev => new Set([...prev, activeSection]));
  }, [activeSection]);

  // Journey stages configuration
  const journeyStages: JourneyStage[] = useMemo(() => [
    {
      id: 'discover',
      label: 'Discover',
      description: 'Explore your income potential',
      icon: <Sparkles className="w-4 h-4" />,
      color: 'blue',
      sections: [
        {
          id: 'calculator',
          name: 'Income Calculator',
          icon: <Calculator className="w-4 h-4" />,
          description: 'Calculate your earning potential',
        },
        {
          id: 'comparison',
          name: 'Job vs Agent',
          icon: <TrendingUp className="w-4 h-4" />,
          description: 'Compare career paths',
        },
      ],
    },
    {
      id: 'learn',
      label: 'Learn',
      description: 'Understand the opportunity',
      icon: <GraduationCap className="w-4 h-4" />,
      color: 'purple',
      sections: [
        {
          id: 'timeline',
          name: 'Career Path',
          icon: <Rocket className="w-4 h-4" />,
          description: 'See your growth trajectory',
        },
        {
          id: 'training',
          name: 'Training & Support',
          icon: <GraduationCap className="w-4 h-4" />,
          description: 'World-class training program',
        },
      ],
    },
    {
      id: 'connect',
      label: 'Connect',
      description: 'Take the next step',
      icon: <Users className="w-4 h-4" />,
      color: 'green',
      sections: [
        {
          id: 'schedule',
          name: 'Schedule Call',
          icon: <Calendar className="w-4 h-4" />,
          description: 'Talk to a recruiter',
        },
        {
          id: 'apply',
          name: 'Apply Now',
          icon: <Send className="w-4 h-4" />,
          description: 'Start your application',
        },
      ],
    },
  ], []);

  // Get all sections flat
  const allSections = useMemo(() =>
    journeyStages.flatMap(stage => stage.sections),
    [journeyStages]
  );

  // Calculate progress
  const progress = useMemo(() => {
    const total = allSections.length;
    const visited = visitedSections.size;
    return Math.round((visited / total) * 100);
  }, [allSections, visitedSections]);

  // Get current section details
  const currentSection = useMemo(() =>
    allSections.find(s => s.id === activeSection),
    [allSections, activeSection]
  );

  // Get current stage
  const currentStage = useMemo(() =>
    journeyStages.find(stage =>
      stage.sections.some(s => s.id === activeSection)
    ),
    [journeyStages, activeSection]
  );

  // Get next recommended action
  const nextAction = useMemo(() => {
    const currentIndex = allSections.findIndex(s => s.id === activeSection);
    if (currentIndex < allSections.length - 1) {
      return allSections[currentIndex + 1];
    }
    return null;
  }, [allSections, activeSection]);

  // Quick stats (would be personalized based on calculator inputs in a full implementation)
  const quickStats = [
    { label: 'Avg First Year', value: '$85,000+', icon: <DollarSign className="w-4 h-4" /> },
    { label: 'Training Value', value: '$15,000', icon: <Award className="w-4 h-4" /> },
    { label: 'Time to License', value: '2-4 weeks', icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <div className="flex gap-6">
      {/* Sidebar Navigation */}
      <aside
        className={`flex-shrink-0 transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-72'
        }`}
      >
        <div className="sticky top-4 bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          {/* Sidebar Header with Progress */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center justify-between mb-3">
              {!sidebarCollapsed && (
                <div>
                  <h3 className="font-bold text-sm">Your Journey</h3>
                  <p className="text-xs opacity-80">Career Exploration</p>
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Progress Bar */}
            {!sidebarCollapsed && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats (collapsed shows icons only) */}
          {!sidebarCollapsed && (
            <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
              <div className="grid grid-cols-3 gap-2">
                {quickStats.map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="flex justify-center text-blue-600 mb-1">{stat.icon}</div>
                    <p className="text-xs font-bold text-gray-900">{stat.value}</p>
                    <p className="text-[10px] text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Sections by Journey Stage */}
          <nav className="p-2 max-h-[calc(100vh-350px)] overflow-y-auto">
            {journeyStages.map((stage, stageIdx) => (
              <div key={stage.id} className={stageIdx > 0 ? 'mt-4' : ''}>
                {/* Stage Header */}
                {!sidebarCollapsed ? (
                  <div className="px-3 py-2 flex items-center gap-2">
                    <div className={`p-1 rounded bg-${stage.color}-100 text-${stage.color}-600`}>
                      {stage.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {stage.label}
                      </p>
                      <p className="text-[10px] text-gray-400">{stage.description}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center py-2">
                    <div className={`p-1.5 rounded bg-${stage.color}-100 text-${stage.color}-600`}>
                      {stage.icon}
                    </div>
                  </div>
                )}

                {/* Stage Sections */}
                <div className="space-y-1 mt-1">
                  {stage.sections.map((section) => {
                    const isVisited = visitedSections.has(section.id);
                    const isActive = activeSection === section.id;

                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        title={sidebarCollapsed ? section.name : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? `bg-gradient-to-r from-${stage.color}-600 to-${stage.color}-700 text-white shadow-md`
                            : isVisited
                              ? 'text-gray-700 hover:bg-gray-100'
                              : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                        } ${sidebarCollapsed ? 'justify-center' : ''}`}
                      >
                        {/* Status Icon */}
                        {!sidebarCollapsed && (
                          <span className={isActive ? 'text-white' : isVisited ? 'text-green-500' : 'text-gray-300'}>
                            {isVisited && !isActive ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </span>
                        )}
                        {/* Section Icon */}
                        <span className={isActive ? 'text-white' : `text-${stage.color}-500`}>
                          {section.icon}
                        </span>
                        {/* Section Name */}
                        {!sidebarCollapsed && <span className="flex-1 text-left">{section.name}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom CTA in Sidebar */}
          {!sidebarCollapsed && activeSection !== 'apply' && (
            <div className="p-3 border-t border-gray-100">
              <button
                onClick={() => setActiveSection('apply')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
              >
                <Send className="w-4 h-4" />
                Apply Now
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Section Header with Context */}
        <div className="card-gradient">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 bg-${currentStage?.color || 'blue'}-100 rounded-xl`}>
                {currentSection?.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold text-${currentStage?.color || 'blue'}-600 uppercase tracking-wider`}>
                    {currentStage?.label}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500">{currentSection?.description}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{currentSection?.name}</h2>
              </div>
            </div>

            {/* Next Step Indicator */}
            {nextAction && (
              <button
                onClick={() => setActiveSection(nextAction.id)}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-sm"
              >
                <span className="text-gray-600">Next:</span>
                <span className="font-semibold text-gray-900">{nextAction.name}</span>
                <ArrowRight className="w-4 h-4 text-blue-600" />
              </button>
            )}
          </div>
        </div>

        {/* Active Section Content */}
        <div className="animate-fade-in">
          {activeSection === 'calculator' && (
            <Suspense fallback={<SectionLoader />}>
              <IncomeCalculator />
            </Suspense>
          )}

          {activeSection === 'comparison' && (
            <Suspense fallback={<SectionLoader />}>
              <TraditionalVsAgent />
            </Suspense>
          )}

          {activeSection === 'timeline' && (
            <Suspense fallback={<SectionLoader />}>
              <CareerTimeline />
            </Suspense>
          )}

          {activeSection === 'training' && (
            <Suspense fallback={<SectionLoader />}>
              <TrainingSupport />
            </Suspense>
          )}

          {activeSection === 'schedule' && (
            <Suspense fallback={<SectionLoader />}>
              <div className="space-y-6">
                <CalendarBooking />
                <EmailCapture />
              </div>
            </Suspense>
          )}

          {activeSection === 'apply' && (
            <Suspense fallback={<SectionLoader />}>
              <ApplicationForm />
            </Suspense>
          )}
        </div>

        {/* Journey Guide Card (shows on first visit) */}
        {visitedSections.size <= 2 && activeSection === 'calculator' && (
          <div className="card bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">How to Use This Tool</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Follow the journey stages on the left to explore your career potential:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {journeyStages.map((stage, idx) => (
                    <div key={stage.id} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full bg-${stage.color}-100 text-${stage.color}-600 text-xs font-bold`}>
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{stage.label}</p>
                        <p className="text-xs text-gray-500">{stage.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        {activeSection !== 'apply' && activeSection !== 'schedule' && (
          <div className="card bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Ready to Take the Next Step?</h3>
                <p className="text-sm opacity-90">
                  Join {agentConfig.companyName} and start building your financial future today.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveSection('schedule')}
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur border-2 border-white text-white font-bold rounded-lg hover:bg-white/30 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Call
                </button>
                <button
                  onClick={() => setActiveSection('apply')}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
