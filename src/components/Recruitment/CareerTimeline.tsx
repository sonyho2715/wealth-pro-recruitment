import { Award, TrendingUp, Users, Crown, Rocket, GraduationCap, Target, DollarSign } from 'lucide-react';

interface CareerStage {
  title: string;
  subtitle: string;
  timeline: string;
  icon: any;
  income: string;
  production: string;
  responsibilities: string[];
  benefits: string[];
  color: string;
  bgGradient: string;
}

const CAREER_STAGES: CareerStage[] = [
  {
    title: 'New Agent',
    subtitle: 'Getting Started',
    timeline: 'Months 1-6',
    icon: Rocket,
    income: '$40K - $70K',
    production: '$25K - $60K',
    responsibilities: [
      'Complete licensing & training',
      'Learn product knowledge',
      'Build initial client base',
      'Develop presentation skills',
      'Shadow experienced agents',
    ],
    benefits: [
      'Comprehensive training program',
      'Assigned mentor',
      'Lead generation support',
      '50%+ first year commissions',
      'Free CRM and tools',
    ],
    color: 'blue',
    bgGradient: 'from-blue-50 to-indigo-50',
  },
  {
    title: 'Qualified Agent',
    subtitle: 'Building Momentum',
    timeline: 'Months 7-18',
    icon: Target,
    income: '$70K - $120K',
    production: '$60K - $120K',
    responsibilities: [
      'Consistent monthly production',
      'Develop referral network',
      'Master 3-5 core products',
      'Build renewal book',
      'Attend advanced training',
    ],
    benefits: [
      '70% first year commissions',
      '7% renewal commissions',
      'Quarterly bonuses',
      'Convention qualification',
      'Advanced product access',
    ],
    color: 'green',
    bgGradient: 'from-green-50 to-emerald-50',
  },
  {
    title: 'Senior Agent',
    subtitle: 'Established Professional',
    timeline: 'Years 2-4',
    icon: Award,
    income: '$120K - $250K',
    production: '$120K - $250K',
    responsibilities: [
      'High-value client acquisition',
      'Specialize in niche markets',
      'Mentor new agents',
      'Lead study groups',
      'Speak at events',
    ],
    benefits: [
      '90% first year commissions',
      '9% renewal commissions',
      '1.25x bonus multiplier',
      'Trip incentives',
      'Office allowance',
      'Staff support available',
    ],
    color: 'purple',
    bgGradient: 'from-purple-50 to-pink-50',
  },
  {
    title: 'Executive Agent',
    subtitle: 'Top Producer',
    timeline: 'Years 4-7',
    icon: Crown,
    income: '$250K - $500K+',
    production: '$250K - $500K+',
    responsibilities: [
      'Multi-product expert',
      'High net worth clientele',
      'Strategic partnerships',
      'Team building (optional)',
      'Industry leadership',
    ],
    benefits: [
      '110% first year commissions',
      '10% renewal commissions',
      '1.5x bonus multiplier',
      'Profit sharing',
      'Stock/equity options',
      'International trips',
      'Full staff support',
    ],
    color: 'orange',
    bgGradient: 'from-orange-50 to-red-50',
  },
  {
    title: 'Managing Partner',
    subtitle: 'Building a Team',
    timeline: 'Years 5-10+',
    icon: Users,
    income: '$500K - $1M+',
    production: 'Team: $1M+',
    responsibilities: [
      'Recruit & train agents',
      'Build and manage team',
      'Override commissions',
      'Strategic planning',
      'Market development',
    ],
    benefits: [
      'All Executive Agent benefits',
      'Override income (20-40%)',
      'Equity in downline',
      'Succession planning',
      'Sellable agency value',
      'Legacy income',
    ],
    color: 'indigo',
    bgGradient: 'from-indigo-50 to-purple-50',
  },
];

export default function CareerTimeline() {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-white/20 backdrop-blur">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Your Career Progression Path</h2>
            <p className="text-lg opacity-90">
              Clear advancement opportunities at every stage of your journey
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="hidden md:block absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-purple-400 to-orange-400" />

        {/* Career Stages */}
        <div className="space-y-8">
          {CAREER_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div key={idx} className="relative">
                {/* Timeline dot */}
                <div className="hidden md:block absolute left-6 top-6 w-5 h-5 rounded-full bg-white border-4 border-blue-600 z-10" />

                {/* Content card */}
                <div className={`md:ml-20 card bg-gradient-to-br ${stage.bgGradient} border-2 border-${stage.color}-300`}>
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`p-3 rounded-full bg-${stage.color}-200`}>
                      <Icon className={`w-6 h-6 text-${stage.color}-700`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{stage.title}</h3>
                          <p className="text-sm text-gray-600">{stage.subtitle}</p>
                        </div>
                        <div className="text-right">
                          <div className={`px-3 py-1 bg-${stage.color}-200 rounded-full`}>
                            <p className={`text-sm font-bold text-${stage.color}-700`}>
                              {stage.timeline}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-white rounded-lg border-2 border-green-300">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-semibold text-gray-700">Annual Income</span>
                      </div>
                      <p className="text-2xl font-bold text-green-700">{stage.income}</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border-2 border-blue-300">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-700">Production Level</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-700">{stage.production}</p>
                    </div>
                  </div>

                  {/* Responsibilities & Benefits */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        Key Responsibilities
                      </h4>
                      <ul className="space-y-2">
                        {stage.responsibilities.map((resp, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-blue-600 font-bold mt-0.5">•</span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Benefits & Perks
                      </h4>
                      <ul className="space-y-2">
                        {stage.benefits.map((benefit, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-green-600 font-bold">✓</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Advancement criteria */}
                  {idx < CAREER_STAGES.length - 1 && (
                    <div className="mt-6 p-4 bg-white rounded-lg border-2 border-blue-300">
                      <p className="text-sm font-bold text-gray-900 mb-2">
                        📈 How to Advance to {CAREER_STAGES[idx + 1].title}:
                      </p>
                      <p className="text-sm text-gray-700">
                        Achieve consistent production of {CAREER_STAGES[idx + 1].production.split('-')[0].trim()} or higher
                        for 6+ months and complete advanced training requirements.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Insights */}
      <div className="card bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300">
        <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Career Path Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-lg">
            <p className="font-bold text-gray-900 mb-2">🚀 Fast Advancement</p>
            <p className="text-sm text-gray-700">
              Top performers reach Senior Agent in 12-18 months (vs. years in traditional careers)
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <p className="font-bold text-gray-900 mb-2">💰 Compounding Income</p>
            <p className="text-sm text-gray-700">
              Renewal book grows every year, creating passive income that compounds
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <p className="font-bold text-gray-900 mb-2">🎯 Clear Metrics</p>
            <p className="text-sm text-gray-700">
              No politics or favorites - advancement based purely on production
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <p className="font-bold text-gray-900 mb-2">👥 Team Building Optional</p>
            <p className="text-sm text-gray-700">
              Earn $250K+ as solo agent, or build a team for $1M+ potential
            </p>
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Real Success Stories</h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                JM
              </div>
              <div>
                <p className="font-bold text-gray-900">John M.</p>
                <p className="text-sm text-gray-600">Former Teacher → Executive Agent</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              "I went from $45K/year as a teacher to $280K in my 3rd year as an agent. The training and
              support made all the difference. Best career decision I ever made."
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                SR
              </div>
              <div>
                <p className="font-bold text-gray-900">Sarah R.</p>
                <p className="text-sm text-gray-600">Former Sales Rep → Managing Partner</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              "Started part-time while raising my kids. Now I have a team of 12 agents and earn $850K/year
              while setting my own schedule. True freedom."
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-300">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                DL
              </div>
              <div>
                <p className="font-bold text-gray-900">David L.</p>
                <p className="text-sm text-gray-600">Former IT Manager → Senior Agent</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              "Hit $180K in my 2nd year and never looked back. The renewal income means I can take vacations
              and still get paid. It's truly passive wealth building."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
