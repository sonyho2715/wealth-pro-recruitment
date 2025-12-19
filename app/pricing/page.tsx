'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Users,
  User,
  Zap,
  BarChart3,
  Phone,
  FileSignature,
  ArrowRight,
  Sparkles,
  Building2,
} from 'lucide-react';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Get started with essential tools for new agents',
    price: 9,
    interval: 'month',
    features: [
      '1 agent seat',
      'Up to 50 contacts',
      'Financial calculator',
      'Personal balance sheet',
      'Income replacement calculator',
      'Basic prospect tracking',
      'Community support',
    ],
    limits: {
      agents: 1,
      contacts: 50,
      sms: false,
      esign: false,
    },
    popular: false,
    icon: Sparkles,
    cta: 'Get Started',
  },
  {
    id: 'solo',
    name: 'Solo Agent',
    description: 'Perfect for individual agents building their business',
    price: 29,
    interval: 'month',
    features: [
      '1 agent seat',
      'Up to 100 contacts',
      'Everything in Basic, plus:',
      'Production tracking',
      'Scripts library',
      'Training modules',
      'Basic reports',
      'Email support',
    ],
    limits: {
      agents: 1,
      contacts: 100,
      sms: false,
      esign: false,
    },
    popular: false,
    icon: User,
    cta: 'Start Free Trial',
  },
  {
    id: 'team',
    name: 'Team Leader',
    description: 'For agents building and managing a team',
    price: 79,
    interval: 'month',
    features: [
      'Up to 5 agent seats',
      'Up to 500 contacts',
      'Everything in Solo, plus:',
      'Recruit tracking',
      'Team dashboard',
      'BPM event management',
      'Matchup requests',
      'SMS messaging (100/mo)',
      'Priority support',
    ],
    limits: {
      agents: 5,
      contacts: 500,
      sms: true,
      esign: false,
    },
    popular: true,
    icon: Users,
    cta: 'Start Free Trial',
  },
  {
    id: 'agency',
    name: 'Agency',
    description: 'Full-featured solution for growing agencies',
    price: 199,
    interval: 'month',
    features: [
      'Up to 25 agent seats',
      'Up to 2,000 contacts',
      'Everything in Team, plus:',
      'E-signature documents',
      'White-label branding',
      'Advanced analytics',
      'Custom training modules',
      'SMS messaging (500/mo)',
      'Dedicated support',
    ],
    limits: {
      agents: 25,
      contacts: 2000,
      sms: true,
      esign: true,
    },
    popular: false,
    icon: Building2,
    cta: 'Start Free Trial',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Unlimited scale for large organizations',
    price: null,
    interval: 'month',
    features: [
      'Unlimited agent seats',
      'Unlimited contacts',
      'Everything in Agency, plus:',
      'Custom integrations',
      'API access',
      'Dedicated account manager',
      'Custom training & onboarding',
      'SLA guarantees',
      '24/7 phone support',
    ],
    limits: {
      agents: -1,
      contacts: -1,
      sms: true,
      esign: true,
    },
    popular: false,
    icon: Zap,
    cta: 'Contact Sales',
  },
];

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');

  const getPrice = (price: number | null) => {
    if (price === null) return 'Custom';
    if (billingInterval === 'year') {
      return Math.round(price * 10);
    }
    return price;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-slate-900 tracking-tight">Wealth Pro</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/agent/login" className="text-slate-600 hover:text-slate-900 transition text-sm font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="heading-display text-slate-900 mb-4">Choose Your Plan</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
          Everything you need to grow your insurance business. Start with a 14-day free trial.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={billingInterval === 'month' ? 'text-slate-900 font-medium' : 'text-slate-500'}>Monthly</span>
          <button
            onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
            className="relative w-14 h-7 bg-slate-200 rounded-full transition"
          >
            <span
              className={`absolute top-1 w-5 h-5 bg-slate-900 rounded-full transition-all ${
                billingInterval === 'year' ? 'left-8' : 'left-1'
              }`}
            />
          </button>
          <span className={billingInterval === 'year' ? 'text-slate-900 font-medium' : 'text-slate-500'}>
            Yearly
            <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
              Save 17%
            </span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl p-6 text-left border shadow-sm ${
                  plan.popular ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${plan.popular ? 'bg-slate-900' : 'bg-slate-100'}`}>
                    <Icon className={`w-5 h-5 ${plan.popular ? 'text-white' : 'text-slate-600'}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                </div>

                <p className="text-slate-500 text-sm mb-4 h-10">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900">
                    {plan.price === null ? '' : '$'}
                    {getPrice(plan.price)}
                  </span>
                  {plan.price !== null && (
                    <span className="text-slate-500 ml-2">/{billingInterval === 'year' ? 'year' : 'mo'}</span>
                  )}
                </div>

                <Link
                  href={plan.id === 'enterprise' ? '/contact' : `/signup?plan=${plan.id}`}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition mb-6 ${
                    plan.popular
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison */}
        <div className="mt-20">
          <h2 className="heading-serif text-slate-900 mb-8">Compare Plans</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-4 px-4 text-slate-500 font-medium">Feature</th>
                  <th className="py-4 px-4 text-center text-slate-900">Basic</th>
                  <th className="py-4 px-4 text-center text-slate-900">Solo</th>
                  <th className="py-4 px-4 text-center text-slate-900">Team</th>
                  <th className="py-4 px-4 text-center text-slate-900">Agency</th>
                  <th className="py-4 px-4 text-center text-slate-900">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-b border-slate-100">
                  <td className="py-3 px-4">Agent Seats</td>
                  <td className="py-3 px-4 text-center">1</td>
                  <td className="py-3 px-4 text-center">1</td>
                  <td className="py-3 px-4 text-center">5</td>
                  <td className="py-3 px-4 text-center">25</td>
                  <td className="py-3 px-4 text-center">Unlimited</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-3 px-4">Contacts</td>
                  <td className="py-3 px-4 text-center">50</td>
                  <td className="py-3 px-4 text-center">100</td>
                  <td className="py-3 px-4 text-center">500</td>
                  <td className="py-3 px-4 text-center">2,000</td>
                  <td className="py-3 px-4 text-center">Unlimited</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-3 px-4">Financial Calculator</td>
                  <td className="py-3 px-4 text-center">
                    <Check className="w-4 h-4 mx-auto text-emerald-500" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Check className="w-4 h-4 mx-auto text-emerald-500" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Check className="w-4 h-4 mx-auto text-emerald-500" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Check className="w-4 h-4 mx-auto text-emerald-500" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Check className="w-4 h-4 mx-auto text-emerald-500" />
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-3 px-4">Scripts Library</td>
                  <td className="py-3 px-4 text-center text-slate-400">-</td>
                  <td className="py-3 px-4 text-center">
                    <Check className="w-4 h-4 mx-auto text-emerald-500" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Check className="w-4 h-4 mx-auto text-emerald-500" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Check className="w-4 h-4 mx-auto text-emerald-500" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Check className="w-4 h-4 mx-auto text-emerald-500" />
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-3 px-4 flex items-center gap-2">
                    <Phone className="w-4 h-4" /> SMS Messaging
                  </td>
                  <td className="py-3 px-4 text-center text-slate-400">-</td>
                  <td className="py-3 px-4 text-center text-slate-400">-</td>
                  <td className="py-3 px-4 text-center">100/mo</td>
                  <td className="py-3 px-4 text-center">500/mo</td>
                  <td className="py-3 px-4 text-center">Unlimited</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-3 px-4 flex items-center gap-2">
                    <FileSignature className="w-4 h-4" /> E-Signatures
                  </td>
                  <td className="py-3 px-4 text-center text-slate-400">-</td>
                  <td className="py-3 px-4 text-center text-slate-400">-</td>
                  <td className="py-3 px-4 text-center text-slate-400">-</td>
                  <td className="py-3 px-4 text-center">
                    <Check className="w-4 h-4 mx-auto text-emerald-500" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Check className="w-4 h-4 mx-auto text-emerald-500" />
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-3 px-4">White-label Branding</td>
                  <td className="py-3 px-4 text-center text-slate-400">-</td>
                  <td className="py-3 px-4 text-center text-slate-400">-</td>
                  <td className="py-3 px-4 text-center text-slate-400">-</td>
                  <td className="py-3 px-4 text-center">
                    <Check className="w-4 h-4 mx-auto text-emerald-500" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Check className="w-4 h-4 mx-auto text-emerald-500" />
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-3 px-4">API Access</td>
                  <td className="py-3 px-4 text-center text-slate-400">-</td>
                  <td className="py-3 px-4 text-center text-slate-400">-</td>
                  <td className="py-3 px-4 text-center text-slate-400">-</td>
                  <td className="py-3 px-4 text-center text-slate-400">-</td>
                  <td className="py-3 px-4 text-center">
                    <Check className="w-4 h-4 mx-auto text-emerald-500" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto text-left">
          <h2 className="heading-serif text-slate-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-slate-900 font-medium mb-2">Can I change plans later?</h3>
              <p className="text-slate-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-slate-900 font-medium mb-2">What happens after my free trial?</h3>
              <p className="text-slate-600">
                After 14 days, you&apos;ll be charged for your selected plan. You can cancel anytime during the trial
                with no obligation.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-slate-900 font-medium mb-2">Can I add more agents to my team?</h3>
              <p className="text-slate-600">
                Yes! Team and Agency plans include a set number of seats. Need more? Contact us for custom pricing or
                upgrade to Enterprise.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-slate-900 font-medium mb-2">Is my data secure?</h3>
              <p className="text-slate-600">
                Absolutely. We use industry-standard encryption and are fully compliant with insurance industry
                regulations.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 bg-slate-900 rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">Ready to grow your business?</h2>
          <p className="text-slate-300 mb-6 max-w-xl mx-auto">
            Join thousands of insurance professionals using WealthPro to recruit, train, and track their team&apos;s
            success.
          </p>
          <Link
            href="/signup?plan=team"
            className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-lg font-medium hover:bg-slate-100 transition"
          >
            Start Your Free Trial
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Wealth Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
