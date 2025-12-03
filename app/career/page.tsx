import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  Clock,
  Users,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Star,
  Shield,
  Briefcase,
  Target,
  Award
} from 'lucide-react';
import ComplianceDisclaimer from '@/components/ComplianceDisclaimer';

export default function CareerPage() {
  const benefits = [
    {
      icon: DollarSign,
      title: 'Unlimited Income Potential',
      description: 'Earn based on your effort. Top agents earn $200K+ annually with no ceiling on commissions.'
    },
    {
      icon: Clock,
      title: 'Flexible Schedule',
      description: 'Be your own boss. Work part-time or full-time on your own terms.'
    },
    {
      icon: Users,
      title: 'Help Families',
      description: 'Make a real difference by protecting families and helping them build wealth.'
    },
    {
      icon: GraduationCap,
      title: 'Comprehensive Training',
      description: '250+ hours of training to get you licensed and successful, even with no experience.'
    },
    {
      icon: Target,
      title: 'Warm Market Start',
      description: 'Begin with your network. No cold calling required to get started.'
    },
    {
      icon: Award,
      title: 'Career Advancement',
      description: 'Clear path from agent to manager to executive with increasing override commissions.'
    }
  ];

  const timeline = [
    { week: 'Week 1-2', title: 'Training & Licensing', description: 'Complete training and pass your licensing exam' },
    { week: 'Week 3-4', title: 'First Clients', description: 'Start working with friends and family' },
    { week: 'Month 2-3', title: 'Build Momentum', description: 'Expand to referrals and build your client base' },
    { week: 'Month 6', title: 'Full Stride', description: 'Consistent income and growing renewal base' },
    { week: 'Year 1', title: 'Established', description: 'Solid income from new sales and renewals' },
  ];

  return (
    <div className="min-h-screen">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-900 hover:text-blue-600 transition-colors">
            <Shield className="w-6 h-6" />
            <span className="font-bold text-lg">Wealth Pro</span>
          </Link>
          <Link href="/prospect" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            Start Financial Review
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Star className="w-4 h-4" />
            <span className="text-sm font-medium">Join a Winning Team</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Build Your Financial
            <span className="block text-blue-200">Advisory Career</span>
          </h1>

          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10">
            Earn unlimited income while helping families protect their futures.
            See exactly how much YOU could earn based on your unique situation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/prospect" className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 inline-flex items-center gap-2">
              See Your Income Potential
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#benefits" className="border-2 border-white/50 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all inline-flex items-center gap-2">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Our Process Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We show you your complete financial picture AND how becoming an agent transforms it
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-gradient text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">1. Your Financial Review</h3>
              <p className="text-gray-600">
                Complete a quick assessment to see your Personal Balance Sheet, protection gaps, and current trajectory.
              </p>
            </div>

            <div className="card-gradient text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">2. Agent Income Projection</h3>
              <p className="text-gray-600">
                See how agent income integrates into YOUR financial picture based on your network and availability.
              </p>
            </div>

            <div className="card-gradient text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">3. Compare Your Futures</h3>
              <p className="text-gray-600">
                Side-by-side comparison of your future WITH vs WITHOUT the agent opportunity.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/prospect" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
              Start Your Analysis
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Become an Agent?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of successful agents who have transformed their careers and lives
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="card-gradient">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Income Potential */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Income Potential</h2>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Based on industry averages. Your results depend on effort, market, and other factors.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: 'Part-Time Year 1', income: '$25K - $50K', hours: '10-15 hrs/week' },
              { label: 'Full-Time Year 1', income: '$50K - $80K', hours: '30-40 hrs/week' },
              { label: 'Year 3 Average', income: '$100K - $150K', hours: 'With renewals' },
              { label: 'Top Performers', income: '$200K+', hours: 'Unlimited potential' },
            ].map((tier, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <div className="text-3xl font-bold mb-2">{tier.income}*</div>
                <div className="font-medium text-blue-200 mb-1">{tier.label}</div>
                <div className="text-sm text-blue-300">{tier.hours}</div>
              </div>
            ))}
          </div>

          {/* Income Disclaimer - Required for compliance */}
          <div className="mt-8 max-w-3xl mx-auto">
            <ComplianceDisclaimer variant="income" className="bg-white/10 border-white/20 [&_p]:text-blue-100 [&_.text-amber-800]:text-blue-200 [&_.text-amber-700]:text-blue-100" />
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Path to Success</h2>
            <p className="text-gray-600">A clear roadmap from day one to established agent</p>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200" />

            {timeline.map((step, index) => (
              <div key={index} className="relative flex items-start gap-6 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 z-10">
                  {index + 1}
                </div>
                <div className="card-gradient flex-1 ml-2">
                  <div className="text-sm text-blue-600 font-medium mb-1">{step.week}</div>
                  <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to See Your Potential?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Take 10 minutes to complete your financial review and see exactly how much
            you could earn as an agent, integrated into YOUR financial picture.
          </p>
          <Link href="/prospect" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
            Calculate My Income Potential
            <ArrowRight className="w-5 h-5" />
          </Link>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Free assessment
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              No obligation
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Personalized projections
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">Wealth Pro</span>
          </div>

          {/* Full Compliance Disclosure */}
          <ComplianceDisclaimer variant="full" className="bg-gray-800/50 text-gray-300 [&_h4]:text-gray-200 [&_strong]:text-gray-200 mb-8" />

          <p className="text-gray-500 text-sm text-center">
            © {new Date().getFullYear()} Wealth Pro. All rights reserved. For informational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
