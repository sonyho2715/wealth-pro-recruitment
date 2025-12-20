'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  TrendingUp,
  Shield,
  ChevronRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Star,
} from 'lucide-react';
import ComplianceDisclaimer from '@/components/ComplianceDisclaimer';
import Navigation from '@/components/Navigation';
import AnimatedCounter from '@/components/AnimatedCounter';
import SocialProofNotification from '@/components/SocialProofNotification';
import ExitIntentPopup from '@/components/ExitIntentPopup';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-4 overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-full mb-8">
                <span className="text-xs font-medium uppercase tracking-wider">
                  Private Wealth Management
                </span>
              </div>

              <h1 className="heading-display text-slate-900 mb-6">
                Financial Clarity{' '}
                <span className="text-gradient-premium">
                  You Can Trust
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-lg">
                Institutional-grade planning for families. See your complete financial picture,
                identify protection gaps, and build lasting wealth.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/prospect"
                  className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-medium px-8 py-4 rounded-lg hover:bg-slate-800 transition-all group"
                >
                  Start Your Review
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/career"
                  className="inline-flex items-center justify-center gap-2 bg-transparent text-slate-900 font-medium px-8 py-4 rounded-lg border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all"
                >
                  Explore Advisory Careers
                </Link>
              </div>
            </div>

            {/* Right - Animated UI Card */}
            <div className="hidden lg:block relative">
              <div className="relative animate-float">
                {/* Main Dashboard Card */}
                <div className="bg-white rounded-2xl shadow-premium border border-slate-200 p-6 max-w-md ml-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-slate-900">Your Balance Sheet</h3>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                      Live
                    </span>
                  </div>

                  {/* Net Worth Display */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 mb-4">
                    <p className="text-slate-400 text-sm mb-1">Net Worth</p>
                    <p className="text-3xl font-bold text-white">$487,250</p>
                    <div className="flex items-center gap-2 mt-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 text-sm">+12.4% this year</span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-slate-500 text-xs mb-1">Total Assets</p>
                      <p className="font-semibold text-slate-900">$702,500</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-slate-500 text-xs mb-1">Liabilities</p>
                      <p className="font-semibold text-slate-900">$215,250</p>
                    </div>
                  </div>

                  {/* Protection Status */}
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
                    <Shield className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">Protection Gap Found</p>
                      <p className="text-xs text-amber-700">$350,000 additional coverage recommended</p>
                    </div>
                  </div>
                </div>

                {/* Floating accent elements */}
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-blue-100 rounded-full blur-2xl opacity-60" />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-slate-100 rounded-full blur-3xl opacity-60" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credibility Stats Band */}
      <section className="border-y border-slate-200 bg-slate-50/50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                $<AnimatedCounter end={2.5} decimals={1} duration={2000} />B+
              </p>
              <p className="text-sm text-slate-500">Assets Under Guidance</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                <AnimatedCounter end={10000} duration={2500} />+
              </p>
              <p className="text-sm text-slate-500">Families Served</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                <AnimatedCounter end={15} duration={1500} />+
              </p>
              <p className="text-sm text-slate-500">Years of Excellence</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                <AnimatedCounter end={4.9} decimals={1} duration={2000} />/5
              </p>
              <p className="text-sm text-slate-500">Client Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Two Paths Section */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-full mb-6">
              <span className="text-xs font-medium uppercase tracking-wider">
                Two Paths Forward
              </span>
            </span>
            <h2 className="heading-display text-slate-900 text-3xl md:text-4xl lg:text-5xl mb-4">
              Choose Your Journey
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Whether you seek financial clarity for your family or a rewarding career helping others,
              your path starts here.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Private Client Path */}
            <div className="group relative bg-white rounded-2xl border border-slate-200 p-8 md:p-10 hover:border-slate-300 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-3 font-serif">
                Private Client
              </h3>
              <p className="text-slate-600 mb-6">
                Get a complete view of your financial life. Understand where you stand,
                identify gaps in your protection, and receive personalized recommendations.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  'Complete net worth analysis',
                  'Protection gap identification',
                  'Personalized recommendations',
                  'No cost, no obligation',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/prospect"
                className="inline-flex items-center gap-2 text-slate-900 font-medium group-hover:gap-3 transition-all"
              >
                Start Your Financial Review
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Advisor Partnership Path */}
            <div className="group relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 md:p-10 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3 font-serif">
                Advisor Partnership
              </h3>
              <p className="text-slate-300 mb-6">
                Build a meaningful career helping families achieve financial security.
                Unlimited income potential with full training and mentorship.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  'No income ceiling',
                  'Comprehensive training program',
                  'Proven business model',
                  'Make a real difference',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-slate-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/career"
                className="inline-flex items-center gap-2 text-white font-medium group-hover:gap-3 transition-all"
              >
                Explore Advisory Careers
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-full mb-6 border border-slate-200">
              <span className="text-xs font-medium uppercase tracking-wider">
                Simple Process
              </span>
            </span>
            <h2 className="heading-display text-slate-900 text-3xl md:text-4xl lg:text-5xl mb-4">
              Four Steps to Clarity
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              In less than 15 minutes, gain the financial clarity that most families never achieve.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                step: '01',
                title: 'Share Your Picture',
                description: 'Answer simple questions about your income, assets, and goals.',
              },
              {
                step: '02',
                title: 'Get Your Analysis',
                description: 'See your complete balance sheet with identified gaps.',
              },
              {
                step: '03',
                title: 'Receive Recommendations',
                description: 'Get personalized guidance based on your unique situation.',
              },
              {
                step: '04',
                title: 'Take Action',
                description: 'Work with an advisor to implement your protection plan.',
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl border border-slate-200 p-6 h-full">
                  <span className="text-4xl font-bold text-slate-200 mb-4 block font-serif">
                    {item.step}
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className="w-6 h-6 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reality Check Section */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image */}
            <div className="relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1770"
                  alt="Family planning their financial future"
                  fill
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAQABQDAREAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABwgJ/8QAIhAAAQMEAwADAQAAAAAAAAAAAQIDBAUGBxEAEiEIE0FR/8QAGAEAAwEBAAAAAAAAAAAAAAAAAwQFBgL/xAAjEQABBAICAgIDAAAAAAAAAAABAgMEEQASBSETMUFRFGFx/9oADAMBEQACEEEEAKAAABDzpQPjTz9dvO0bqsm7rkxHdNMvuoWy0bTq1OoFVpKn0uKjPIqIkuPfeuU8hKtJCSE/YlZ0lKSSG2+RiZtYIujxLYZrQIFE2b+7I79YwzyPJRscYMhK1gpCj2RoeoIvpvUn8f/Z"
                  priority={false}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {/* Floating stat card */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-premium border border-slate-200 p-5 max-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                    Reality Check
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-1">78%</p>
                <p className="text-sm text-slate-600">of families are underinsured</p>
              </div>
            </div>

            {/* Content */}
            <div>
              <span className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full mb-6">
                <span className="text-xs font-medium uppercase tracking-wider">
                  The Uncomfortable Truth
                </span>
              </span>

              <h2 className="heading-display text-slate-900 text-3xl md:text-4xl mb-6">
                What You Don&apos;t Know{' '}
                <span className="text-slate-500">Could Cost Everything</span>
              </h2>

              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Most families believe they&apos;re protected. The reality? Gaps in coverage,
                missed opportunities, and blind spots that only become visible when it&apos;s too late.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { stat: '64%', text: 'of Americans will outlive their retirement savings' },
                  { stat: '40%', text: 'have less than $400 for emergencies' },
                  { stat: '91%', text: 'lack a comprehensive financial plan' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                    <span className="text-2xl font-bold text-slate-900 min-w-[60px]">
                      {item.stat}
                    </span>
                    <p className="text-slate-600">{item.text}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/prospect"
                className="inline-flex items-center gap-2 bg-slate-900 text-white font-medium px-8 py-4 rounded-lg hover:bg-slate-800 transition-all group"
              >
                See Where You Stand
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 px-4 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-white/10 text-white/90 px-4 py-2 rounded-full mb-6">
              <span className="text-xs font-medium uppercase tracking-wider">
                Client Stories
              </span>
            </span>
            <h2 className="heading-display text-white text-3xl md:text-4xl lg:text-5xl mb-4">
              Transforming Financial Futures
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "We thought we were prepared. The review revealed a $500K protection gap we never knew existed. Now our family is truly secure.",
                name: 'Sarah & Michael Chen',
                role: 'Young Family',
                highlight: '$500K gap found',
              },
              {
                quote: "After 20 years in corporate, I was burnt out. Now I make more money, set my own schedule, and actually help people.",
                name: 'James Thompson',
                role: 'Former IT Manager',
                highlight: '3x income increase',
              },
              {
                quote: "Finally saw my complete financial picture. On track to retire 7 years earlier than I thought possible.",
                name: 'Lisa Rodriguez',
                role: 'Registered Nurse',
                highlight: '7 years earlier retirement',
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
              >
                {/* Highlight badge */}
                <div className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-medium mb-4">
                  <CheckCircle2 className="w-3 h-3" />
                  {testimonial.highlight}
                </div>

                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-white/90 mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-white/60">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="heading-display text-slate-900 text-3xl md:text-4xl lg:text-5xl mb-6">
            Your Financial Future{' '}
            <span className="text-slate-500">Starts Today</span>
          </h2>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            In 15 minutes, gain clarity that most families never achieve.
            No cost. No obligation. Just answers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/prospect"
              className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-medium px-10 py-5 rounded-lg hover:bg-slate-800 transition-all group text-lg"
            >
              Start Your Free Review
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/career"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-slate-900 font-medium px-10 py-5 rounded-lg border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all text-lg"
            >
              Explore Advisory Careers
            </Link>
          </div>

          <p className="text-sm text-slate-500 mt-8">
            Trusted by 10,000+ families across Hawaii
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold tracking-tight">Wealth Pro</span>
              </div>
              <p className="text-slate-400 mb-6 max-w-md">
                Institutional-grade financial planning and protection for families.
                Building wealth and security across generations.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-slate-400 text-sm">4.9/5 from 500+ reviews</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-3 text-slate-400">
                <li>
                  <Link href="/prospect" className="hover:text-white transition-colors">
                    Financial Review
                  </Link>
                </li>
                <li>
                  <Link href="/career" className="hover:text-white transition-colors">
                    Advisory Careers
                  </Link>
                </li>
                <li>
                  <Link href="/agent/login" className="hover:text-white transition-colors">
                    Advisor Portal
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-slate-400">
                <li>support@wealthpro.com</li>
                <li>(808) 555-0123</li>
                <li>Monday - Friday</li>
                <li>9:00 AM - 5:00 PM HST</li>
              </ul>
            </div>
          </div>

          {/* Compliance Disclosures */}
          <div className="border-t border-slate-800 pt-8 mb-8">
            <ComplianceDisclaimer
              variant="full"
              className="bg-slate-800/50 text-slate-300 [&_h4]:text-slate-200 [&_strong]:text-slate-200"
            />
          </div>

          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-500 text-sm">
                &copy; {new Date().getFullYear()} Wealth Pro. All rights reserved.
              </p>
              <p className="text-slate-500 text-sm text-center">
                For informational purposes only. Not financial advice.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Social Proof Notification */}
      <SocialProofNotification />

      {/* Exit Intent Popup */}
      <ExitIntentPopup />
    </div>
  );
}
