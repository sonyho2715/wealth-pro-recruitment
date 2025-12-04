import Image from 'next/image';
import Link from 'next/link';
import {
  Shield,
  TrendingUp,
  Users,
  Calculator,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  PieChart,
  Briefcase,
  Star,
  Quote,
  AlertTriangle,
  Eye,
  Heart,
  Target,
  Lightbulb,
  Award,
  Clock,
  Lock,
  Sparkles,
  Brain,
  MapPin,
  Compass
} from 'lucide-react';
import ComplianceDisclaimer from '@/components/ComplianceDisclaimer';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Wealth Pro
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/prospect" className="text-gray-600 hover:text-blue-600 transition-colors">
                Financial Review
              </Link>
              <Link href="/career" className="text-gray-600 hover:text-blue-600 transition-colors">
                Career Opportunity
              </Link>
              <Link href="/agent/login" className="btn-primary text-sm py-2">
                Agent Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section with Image */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1560472355-536de3962603?q=80&w=2070"
            alt="Family financial planning"
            fill
            className="object-cover opacity-10"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white/60 to-indigo-50/80" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">Free Financial Assessment</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                What You Can't See
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Could Cost Your Family Everything
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-6">
                Most families believe they're financially secure. Then life happens.
                A single unexpected event reveals the gaps they never knew existed.
              </p>
              <p className="text-lg text-gray-500 mb-10">
                <span className="font-medium text-gray-700">In just 10 minutes</span>, you'll discover exactly where you stand,
                what's missing, and the precise steps to protect the people who matter most.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/prospect" className="btn-primary inline-flex items-center gap-2">
                  Start Your Financial Review
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/career" className="btn-secondary inline-flex items-center gap-2">
                  Explore Career Opportunity
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 mt-10 pt-10 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">10K+</p>
                  <p className="text-sm text-gray-500">Families Helped</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">$2.5B+</p>
                  <p className="text-sm text-gray-500">Protection Placed</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">4.9/5</p>
                  <p className="text-sm text-gray-500">Client Rating</p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative hidden lg:block">
              <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1770"
                  alt="Financial advisor meeting with family"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Protection Gap Found</p>
                    <p className="text-sm text-gray-500">$250,000 coverage needed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our comprehensive process helps you understand your finances and discover opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                icon: Calculator,
                title: 'Financial Intake',
                description: 'Share your income, expenses, assets, and goals in our simple questionnaire'
              },
              {
                step: '2',
                icon: PieChart,
                title: 'Personal Balance Sheet',
                description: 'See your complete financial picture with protection gaps identified'
              },
              {
                step: '3',
                icon: Shield,
                title: 'Insurance Recommendations',
                description: 'Get personalized recommendations to protect your family'
              },
              {
                step: '4',
                icon: Briefcase,
                title: 'Career Opportunity',
                description: 'Discover how agent income could transform your financial future'
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="card-gradient text-center h-full">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Hidden Truth Section - Problem Agitation */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 px-4 py-2 rounded-full mb-6">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">The Uncomfortable Truth</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              What Most People Don't Realize<br />
              <span className="text-blue-400">Until It's Too Late</span>
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto text-lg">
              You've worked hard. You've saved. You've done what you were told. But somewhere along the way,
              the rules changed. And nobody sent you the memo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Eye,
                stat: '78%',
                title: 'Are Underinsured',
                description: 'Nearly 8 out of 10 families have significant protection gaps they don\'t even know about. The question isn\'t if you have gaps. It\'s how big they are.',
                color: 'from-red-500 to-orange-500',
              },
              {
                icon: Clock,
                stat: '64%',
                title: 'Will Outlive Savings',
                description: 'The average person will exhaust their retirement savings years before they pass. Traditional planning assumes a world that no longer exists.',
                color: 'from-amber-500 to-yellow-500',
              },
              {
                icon: Brain,
                stat: '91%',
                title: 'Lack Financial Clarity',
                description: 'Almost everyone is making major life decisions based on incomplete information. You can\'t optimize what you can\'t see.',
                color: 'from-purple-500 to-pink-500',
              },
            ].map((item, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-4`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">{item.stat}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <Lightbulb className="w-12 h-12 text-yellow-400 mx-auto mb-6" />
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Here's What Changes Everything
              </h3>
              <p className="text-gray-300 text-lg mb-6">
                The families who thrive aren't luckier. They simply <span className="text-blue-400 font-medium">see what others miss</span>.
                They have a clear, honest picture of where they stand today, and a precise map to where they want to be.
              </p>
              <p className="text-gray-400">
                When you can see your complete financial picture, something remarkable happens:
                the path forward becomes obvious. Decisions become clear. Worry transforms into confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Wealth Pro - The Solution */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Why Wealth Pro</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                We Built the Tool We Wished<br />
                <span className="text-blue-600">Someone Had Given Us</span>
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                After watching too many families discover their financial gaps at the worst possible moment,
                we knew there had to be a better way. Not someday. <span className="font-medium">Now.</span>
              </p>
              <p className="text-gray-600 mb-8">
                Wealth Pro isn't just another calculator. It's a complete financial clarity system that shows you
                exactly where you stand, identifies what's missing, and maps out your path to genuine security.
                All in the time it takes to drink your morning coffee.
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: Target,
                    title: 'Precision Analysis',
                    description: 'Not vague estimates. Exact numbers. Your real situation, clearly displayed.',
                  },
                  {
                    icon: Shield,
                    title: 'Gap Identification',
                    description: 'We find what\'s missing before life does. Protection gaps. Coverage shortfalls. Hidden risks.',
                  },
                  {
                    icon: Compass,
                    title: 'Clear Direction',
                    description: 'Not 50 options that confuse you. The specific steps for your specific situation.',
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 md:p-12">
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Your Personal Balance Sheet</h4>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Live Preview</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Assets</span>
                      <span className="font-semibold text-gray-900">$487,500</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Liabilities</span>
                      <span className="font-semibold text-gray-900">$215,000</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between items-center">
                      <span className="font-medium text-gray-900">Net Worth</span>
                      <span className="font-bold text-green-600 text-lg">$272,500</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Protection Gap Analysis</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Life Insurance Coverage</span>
                        <span className="text-red-600 font-medium">Gap: $350,000</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full w-2/5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Emergency Fund</span>
                        <span className="text-amber-600 font-medium">2.3 months</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Retirement Trajectory</span>
                        <span className="text-blue-600 font-medium">On Track</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full w-4/5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-white shadow-lg rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Takes only 10 minutes</p>
                    <p className="text-xs text-gray-500">No financial jargon required</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Two Paths to Financial Clarity</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Whether you want to secure your family's future or build a career helping others do the same,
              the journey starts with understanding where you truly stand.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Financial Review Card */}
            <div className="card-gradient hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <PieChart className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Personal Financial Review</h3>
                  <p className="text-gray-600">Finally see the complete picture</p>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {[
                  'Complete net worth calculation',
                  'Cash flow analysis',
                  'Protection gap identification',
                  'Personalized insurance recommendations',
                  'Retirement projection'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/prospect" className="btn-success w-full text-center block">
                Start Free Review
              </Link>
            </div>

            {/* Career Opportunity Card */}
            <div className="card-gradient hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Career Opportunity</h3>
                  <p className="text-gray-600">What if helping others could transform your own future?</p>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {[
                  'See your income potential (real numbers)',
                  'Compare: your life with vs. without this path',
                  'Discover how many years earlier you could retire',
                  'Calculate your true wealth building trajectory',
                  'Explore the training and mentorship provided'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/career" className="btn-primary w-full text-center block">
                Explore the Opportunity
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            {[
              { value: '$127K', label: 'Average Agent Income (Year 3)' },
              { value: '93%', label: 'Client Satisfaction Rate' },
              { value: '250+', label: 'Training Hours Provided' },
              { value: '5 Years', label: 'Average Earlier Retirement' }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full mb-6">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">Real Stories, Real Results</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              They Were Exactly Where You Are Now
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              The only difference? They took 10 minutes to see what they couldn't see before.
              Here's what happened next.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah & Michael',
                role: 'Young Family, 2 Kids',
                image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200',
                quote: 'We thought we were doing fine. The review revealed a $500,000 protection gap we had no idea existed. For the first time, I actually sleep through the night knowing my kids are truly protected.',
                highlight: '$500K gap discovered',
                rating: 5,
              },
              {
                name: 'James Thompson',
                role: 'Former Restaurant Manager',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
                quote: 'I was working 60 hours a week and barely getting by. The career path they showed me seemed too good to be true. Three years later, I make more than I ever imagined, and I set my own schedule.',
                highlight: '3x income in year 3',
                rating: 5,
              },
              {
                name: 'Lisa Chen',
                role: 'Registered Nurse',
                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200',
                quote: 'The Balance Sheet was eye-opening. I could finally see my entire financial picture in one place. Now I know exactly what I need to do, and I\'m on track to retire at 58 instead of 65.',
                highlight: '7 years earlier retirement',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div key={index} className="card-gradient hover:shadow-xl transition-shadow duration-300 relative">
                {/* Highlight badge */}
                <div className="absolute -top-3 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                  {testimonial.highlight}
                </div>

                <div className="flex items-center gap-1 mb-4 pt-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-blue-200 mb-4" />
                <p className="text-gray-700 mb-6 leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1770"
                  alt="Our professional team"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Floating Stats */}
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">500+</p>
                    <p className="text-xs text-gray-500">Families Served Monthly</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">98%</p>
                    <p className="text-xs text-gray-500">Would Recommend Us</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
                <Award className="w-4 h-4" />
                <span className="text-sm font-medium">Our Mission</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                We Believe Everyone Deserves<br />
                <span className="text-blue-600">Financial Clarity</span>
              </h2>
              <p className="text-gray-600 text-lg mb-4">
                Most financial tools are built for financial advisors. We built this one for <span className="font-medium">you</span>.
              </p>
              <p className="text-gray-600 mb-6">
                Our team of financial professionals, technologists, and educators came together with one goal:
                make the kind of financial clarity that used to cost thousands of dollars available to everyone.
                No complicated jargon. No pressure. Just honest answers to the questions that keep you up at night.
              </p>
              <p className="text-gray-600 mb-8">
                Because we've seen what happens when families finally understand their complete financial picture.
                Decisions become easier. Stress transforms into confidence. And the future stops feeling like a guess.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { icon: Lock, label: 'Bank-Level Security' },
                  { icon: Users, label: 'Expert Support' },
                  { icon: Heart, label: 'Family-First Values' },
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <item.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600">{item.label}</p>
                  </div>
                ))}
              </div>

              <Link href="/prospect" className="btn-primary inline-flex items-center gap-2">
                Start Your Free Review
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Career Opportunity Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-6">
                <Briefcase className="w-4 h-4" />
                <span className="text-sm font-medium">Career Opportunity</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                What If Your Income Had<br />
                <span className="text-purple-600">No Ceiling?</span>
              </h2>
              <p className="text-gray-600 text-lg mb-4">
                There's a strange thing that happens when you help families protect what matters most.
                <span className="font-medium"> You start protecting your own future too.</span>
              </p>
              <p className="text-gray-600 mb-6">
                Our agents don't just earn well. They build something. Residual income that grows year after year.
                The freedom to work when and where they want. And the deep satisfaction of knowing their work
                genuinely changes lives.
              </p>
              <p className="text-gray-600 mb-8">
                If you've ever wondered whether there's more to your career than trading time for money,
                this is your invitation to find out.
              </p>

              <ul className="space-y-4 mb-8">
                {[
                  'Complete training system (no experience needed)',
                  'Mentorship from agents earning $200K+',
                  'Cutting-edge tools like Wealth Pro',
                  'Build income that pays you even when you\'re not working',
                  'Set your own schedule. Be your own boss.',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/career" className="btn-primary bg-gradient-to-r from-purple-600 to-indigo-600 inline-flex items-center gap-2">
                See If This Is Right for You
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="order-1 lg:order-2 relative">
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1770"
                  alt="Financial advisor helping client"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Income Projection Card */}
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg max-w-xs">
                <p className="text-sm text-gray-500 mb-2">Average Agent Income</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Year 1</span>
                    <span className="font-semibold text-gray-900">$52,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Year 3</span>
                    <span className="font-semibold text-gray-900">$127,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Year 5</span>
                    <span className="font-bold text-purple-600">$215,000+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Takes Less Than 10 Minutes</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            A Year From Now, You'll Wish<br />
            <span className="text-blue-300">You Started Today</span>
          </h2>
          <p className="text-xl text-blue-100 mb-4 max-w-2xl mx-auto">
            The families who thrive don't have more time. They simply stopped waiting for the "perfect moment" and took the first step.
          </p>
          <p className="text-blue-200/80 mb-10 max-w-xl mx-auto">
            You're already here. You're already curious. The only question left is whether you'll discover what you can't currently see, or continue hoping everything works out.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/prospect" className="bg-white text-blue-900 font-semibold text-lg px-10 py-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-flex items-center gap-3">
              Start Your Free Financial Review
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/career" className="bg-white/10 backdrop-blur-sm text-white border border-white/30 font-semibold text-lg px-8 py-5 rounded-xl hover:bg-white/20 transition-all duration-300 inline-flex items-center gap-2">
              Explore Career Opportunity
            </Link>
          </div>
          <p className="text-blue-300/70 text-sm">
            No credit card required. No pressure. Just clarity.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Wealth Pro</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Helping families achieve financial security through comprehensive financial planning
                and protection solutions.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-gray-400 text-sm">4.9/5 from 500+ reviews</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/prospect" className="hover:text-white transition-colors">
                    Financial Review
                  </Link>
                </li>
                <li>
                  <Link href="/career" className="hover:text-white transition-colors">
                    Career Opportunity
                  </Link>
                </li>
                <li>
                  <Link href="/agent/login" className="hover:text-white transition-colors">
                    Agent Portal
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>support@wealthpro.com</li>
                <li>(808) 555-0123</li>
                <li>Monday - Friday, 9am - 5pm HST</li>
              </ul>
            </div>
          </div>

          {/* Compliance Disclosures */}
          <div className="border-t border-gray-800 pt-8 mb-8">
            <ComplianceDisclaimer variant="full" className="bg-gray-800/50 text-gray-300 [&_h4]:text-gray-200 [&_strong]:text-gray-200" />
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} Wealth Pro. All rights reserved.
              </p>
              <p className="text-gray-500 text-sm text-center">
                For informational purposes only. Not financial advice.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
