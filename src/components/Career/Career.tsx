import { useState, lazy, Suspense } from 'react';
import { Calculator, TrendingUp, Rocket, GraduationCap, Send, Loader2, Calendar } from 'lucide-react';

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

type CareerSection = 'calculator' | 'comparison' | 'timeline' | 'training' | 'apply' | 'schedule';

export default function Career() {
  const [activeSection, setActiveSection] = useState<CareerSection>('calculator');

  const sections = [
    { id: 'calculator' as CareerSection, name: 'Income Calculator', icon: <Calculator className="w-4 h-4" />, color: 'blue' },
    { id: 'comparison' as CareerSection, name: 'Job vs Agent', icon: <TrendingUp className="w-4 h-4" />, color: 'green' },
    { id: 'timeline' as CareerSection, name: 'Career Path', icon: <Rocket className="w-4 h-4" />, color: 'purple' },
    { id: 'training' as CareerSection, name: 'Training & Support', icon: <GraduationCap className="w-4 h-4" />, color: 'orange' },
    { id: 'schedule' as CareerSection, name: 'Schedule Call', icon: <Calendar className="w-4 h-4" />, color: 'teal' },
    { id: 'apply' as CareerSection, name: 'Apply Now', icon: <Send className="w-4 h-4" />, color: 'red' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="card-gradient">
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Build Your Financial Advisory Career
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Discover unlimited income potential, career advancement, and comprehensive support to help you succeed
          </p>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="card-gradient">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`relative flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeSection === section.id
                  ? `bg-gradient-to-r from-${section.color}-600 to-${section.color}-700 text-white shadow-lg transform scale-105`
                  : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              {section.icon}
              <span>{section.name}</span>
            </button>
          ))}
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

      {/* Bottom CTA */}
      {activeSection !== 'apply' && activeSection !== 'schedule' && (
        <div className="card bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-lg mb-6 opacity-90">
              Take the first step towards financial freedom. Applications reviewed within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setActiveSection('schedule')}
                className="px-8 py-4 bg-white/20 backdrop-blur border-2 border-white text-white font-bold rounded-lg hover:bg-white/30 transition-all"
              >
                Schedule a Call First
              </button>
              <button
                onClick={() => setActiveSection('apply')}
                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg transform hover:scale-105"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
