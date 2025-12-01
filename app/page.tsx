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
  Briefcase
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

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
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

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Get a comprehensive view of your finances, discover protection gaps,
            and explore how you could build wealth while helping others do the same.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/prospect" className="btn-primary inline-flex items-center gap-2">
              Start Your Financial Review
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/career" className="btn-secondary inline-flex items-center gap-2">
              Explore Career Opportunity
            </Link>
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
                title: 'Living Balance Sheet',
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

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to See Your Financial Future?
          </h2>
          <p className="text-gray-600 mb-8">
            Take 10 minutes to complete your financial review and discover opportunities you might be missing.
          </p>
          <Link href="/prospect" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Wealth Pro</span>
            </div>
            <div className="text-gray-400 text-sm text-center">
              Results vary based on individual effort and market conditions.
              Insurance products are subject to underwriting approval.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
