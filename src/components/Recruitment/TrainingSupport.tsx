import { GraduationCap, Users, Book, Video, MessageSquare, Award, Rocket, Target, Briefcase, HeadphonesIcon, TrendingUp } from 'lucide-react';

export default function TrainingSupport() {
  const trainingPrograms = [
    {
      phase: 'Pre-Licensing (Weeks 1-2)',
      icon: Book,
      color: 'blue',
      items: [
        {
          title: 'Life & Health Insurance License Prep',
          description: 'Comprehensive study materials and practice exams',
          duration: '40 hours',
        },
        {
          title: 'State Licensing Exam Support',
          description: 'We cover exam fees and provide test-taking strategies',
          duration: '1-2 weeks',
        },
      ],
    },
    {
      phase: 'Initial Training (Weeks 3-6)',
      icon: Rocket,
      color: 'green',
      items: [
        {
          title: 'Product Knowledge Bootcamp',
          description: 'Deep dive into term life, whole life, universal life, annuities, and living benefits',
          duration: '3 weeks',
        },
        {
          title: 'Sales Process Mastery',
          description: 'Learn our proven 7-step sales system that consistently closes 40%+',
          duration: '2 weeks',
        },
        {
          title: 'Technology & CRM Training',
          description: 'Master all tools and systems for maximum efficiency',
          duration: '1 week',
        },
      ],
    },
    {
      phase: 'Field Training (Weeks 7-12)',
      icon: Users,
      color: 'purple',
      items: [
        {
          title: 'Shadow Top Producers',
          description: 'Observe 10+ live appointments with successful agents',
          duration: '4 weeks',
        },
        {
          title: 'Reverse Shadow',
          description: 'Run appointments while mentor observes and coaches',
          duration: '4 weeks',
        },
        {
          title: 'Solo Flight with Safety Net',
          description: 'Independent appointments with mentor on standby',
          duration: '4 weeks',
        },
      ],
    },
    {
      phase: 'Ongoing Development',
      icon: TrendingUp,
      color: 'orange',
      items: [
        {
          title: 'Weekly Training Calls',
          description: 'Live training every Tuesday on new strategies and products',
          duration: 'Weekly',
        },
        {
          title: 'Monthly Workshops',
          description: 'Advanced topics like estate planning, business insurance, and high net worth markets',
          duration: 'Monthly',
        },
        {
          title: 'Annual Convention',
          description: 'National conference with top industry speakers and networking',
          duration: 'Yearly',
        },
      ],
    },
  ];

  const supportSystems = [
    {
      title: 'Personal Mentor',
      icon: Users,
      description: 'Assigned successful agent who guides you 1-on-1',
      benefits: [
        'Weekly check-ins',
        'On-demand coaching',
        'Joint client meetings',
        'Accountability partnership',
      ],
      color: 'blue',
    },
    {
      title: 'Lead Generation',
      icon: Target,
      description: 'We help you find clients from day one',
      benefits: [
        'Warm lead programs',
        'Social media training',
        'Referral systems',
        'Marketing materials',
      ],
      color: 'green',
    },
    {
      title: 'Technology Stack',
      icon: Briefcase,
      description: 'Premium tools at no cost to you',
      benefits: [
        'Advanced CRM system',
        'E-application platform',
        'Illustration software',
        'Video conferencing',
      ],
      color: 'purple',
    },
    {
      title: 'Back Office Support',
      icon: HeadphonesIcon,
      description: 'Administrative team handles the paperwork',
      benefits: [
        'Case submission',
        'Underwriting support',
        'Compliance assistance',
        'Commission tracking',
      ],
      color: 'orange',
    },
  ];

  const resources = [
    {
      category: 'Learning Library',
      icon: Video,
      items: [
        '200+ training videos on-demand',
        'Product comparison guides',
        'Sales script templates',
        'Objection handling playbook',
        'Case study library',
      ],
    },
    {
      category: 'Community',
      icon: MessageSquare,
      items: [
        'Private Facebook group (500+ agents)',
        'Weekly study groups',
        'Regional networking events',
        'Mastermind groups',
        'Success accountability pods',
      ],
    },
    {
      category: 'Certifications',
      icon: Award,
      items: [
        'Advanced product certifications',
        'Industry designations (CLU, ChFC)',
        'Continuing education credits',
        'Specialist training tracks',
        'Leadership development program',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-white/20 backdrop-blur">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">World-Class Training & Support</h2>
            <p className="text-lg opacity-90">
              We invest heavily in your success from day one through your entire career
            </p>
          </div>
        </div>
      </div>

      {/* Training Timeline */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Your 12-Week Launch Program</h3>
        <div className="space-y-6">
          {trainingPrograms.map((program, idx) => {
            const Icon = program.icon;
            return (
              <div key={idx} className={`p-6 bg-${program.color}-50 rounded-lg border-2 border-${program.color}-300`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg bg-${program.color}-200`}>
                    <Icon className={`w-5 h-5 text-${program.color}-700`} />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">{program.phase}</h4>
                </div>

                <div className="space-y-3">
                  {program.items.map((item, i) => (
                    <div key={i} className="p-4 bg-white rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-gray-900">{item.title}</p>
                        <span className={`px-2 py-1 bg-${program.color}-100 text-${program.color}-700 text-xs font-semibold rounded`}>
                          {item.duration}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Support Systems */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Ongoing Support Systems</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {supportSystems.map((system, idx) => {
            const Icon = system.icon;
            return (
              <div key={idx} className={`p-6 bg-${system.color}-50 rounded-lg border-2 border-${system.color}-300`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg bg-${system.color}-200`}>
                    <Icon className={`w-5 h-5 text-${system.color}-700`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{system.title}</h4>
                    <p className="text-xs text-gray-600">{system.description}</p>
                  </div>
                </div>

                <ul className="space-y-2">
                  {system.benefits.map((benefit, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Resources */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Additional Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources.map((resource, idx) => {
            const Icon = resource.icon;
            return (
              <div key={idx} className="p-6 bg-gray-50 rounded-lg border-2 border-gray-300">
                <div className="flex items-center gap-3 mb-4">
                  <Icon className="w-6 h-6 text-blue-600" />
                  <h4 className="font-bold text-gray-900">{resource.category}</h4>
                </div>
                <ul className="space-y-2">
                  {resource.items.map((item, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Investment vs Value */}
      <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Our Investment in You</h3>
        <p className="text-gray-700 mb-6">
          We spend over $15,000 training each new agent in their first year. This includes:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-lg">
            <p className="text-2xl font-bold text-green-700 mb-1">$5,000+</p>
            <p className="text-sm text-gray-700">Training programs, certifications, and materials</p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <p className="text-2xl font-bold text-green-700 mb-1">$4,000+</p>
            <p className="text-sm text-gray-700">Technology stack and CRM access (annual value)</p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <p className="text-2xl font-bold text-green-700 mb-1">$3,000+</p>
            <p className="text-sm text-gray-700">Mentor time and 1-on-1 coaching</p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <p className="text-2xl font-bold text-green-700 mb-1">$3,000+</p>
            <p className="text-sm text-gray-700">Lead generation, marketing support, back office</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-600 text-white rounded-lg">
          <p className="font-bold mb-2">Your Investment: $0</p>
          <p className="text-sm">
            We cover ALL training costs. You just bring your commitment to succeed.
          </p>
        </div>
      </div>

      {/* Testimonials */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-6">What New Agents Say</h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
            <p className="text-sm text-gray-700 italic mb-2">
              "The training was incredibly thorough. I felt totally prepared by the time I started seeing
              clients. My mentor was available any time I had questions."
            </p>
            <p className="text-xs font-bold text-gray-900">- Michael T., 3 months in</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-600">
            <p className="text-sm text-gray-700 italic mb-2">
              "I've never felt so supported in a job. The combination of structured training and personal
              mentorship made all the difference. I closed my first case in week 8!"
            </p>
            <p className="text-xs font-bold text-gray-900">- Jennifer K., 6 months in</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-600">
            <p className="text-sm text-gray-700 italic mb-2">
              "Coming from a different industry, I was worried I wouldn't be able to learn everything. The
              training broke it down into manageable pieces. Now I'm a top producer in my office."
            </p>
            <p className="text-xs font-bold text-gray-900">- Robert L., 1 year in</p>
          </div>
        </div>
      </div>
    </div>
  );
}
