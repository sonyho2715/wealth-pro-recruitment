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
  Quote
} from 'lucide-react';

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
                See Your Complete
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Financial Picture
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-10">
                Get a comprehensive view of your finances, discover protection gaps,
                and explore how you could build wealth while helping others do the same.
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

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Financial Review Card */}
            <div className="card-gradient">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <PieChart className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Financial Review</h3>
                  <p className="text-gray-600">Comprehensive analysis of your financial situation</p>
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
            <div className="card-gradient">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Career Opportunity</h3>
                  <p className="text-gray-600">See how agent income transforms your finances</p>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {[
                  'Income projection calculator',
                  'Side-by-side comparison: with vs without',
                  'Earlier retirement analysis',
                  'Wealth building potential',
                  'Training and support overview'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/career" className="btn-primary w-full text-center block">
                Explore Opportunity
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real stories from families who have transformed their financial future
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah & Michael',
                role: 'Young Family',
                image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200',
                quote: 'We had no idea we had a $500,000 protection gap until the financial review. Now we sleep better knowing our kids are protected.',
                rating: 5,
              },
              {
                name: 'James Thompson',
                role: 'Business Owner',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
                quote: 'The career opportunity changed everything. I went from struggling to making six figures in my third year. Best decision ever.',
                rating: 5,
              },
              {
                name: 'Lisa Chen',
                role: 'Healthcare Professional',
                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200',
                quote: 'The Personal Balance Sheet showed me exactly where I stood financially. Now I have a clear path to retirement 7 years earlier.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div key={index} className="card-gradient">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-blue-200 mb-4" />
                <p className="text-gray-700 mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
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

      {/* Team/About Section */}
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
                    <p className="text-xs text-gray-500">Active Agents</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">98%</p>
                    <p className="text-xs text-gray-500">Retention Rate</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                A Career That Makes a Difference
              </h2>
              <p className="text-gray-600 mb-6">
                Join a team of professionals dedicated to helping families achieve financial security.
                Our proven system provides the training, support, and tools you need to succeed.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Comprehensive training program',
                  'Mentorship from top producers',
                  'Cutting-edge technology platform',
                  'Unlimited earning potential',
                  'Flexible schedule and work-life balance',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/career" className="btn-primary inline-flex items-center gap-2">
                Learn About Our Opportunity
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2070"
            alt="Success background"
            fill
            className="object-cover opacity-5"
          />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to See Your Financial Future?
          </h2>
          <p className="text-gray-600 mb-8">
            Take 10 minutes to complete your financial review and discover opportunities you might be missing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/prospect" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/career" className="btn-secondary inline-flex items-center gap-2 text-lg px-8 py-4">
              Explore Career
            </Link>
          </div>
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

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} Wealth Pro. All rights reserved.
              </p>
              <p className="text-gray-500 text-sm text-center">
                Results vary based on individual effort and market conditions.
                Insurance products are subject to underwriting approval.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
