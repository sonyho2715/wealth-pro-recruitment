'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CreditCard,
  Check,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Users,
  UserPlus,
  MessageSquare,
  FileSignature,
  Zap,
} from 'lucide-react';
import { getBillingData, upgradePlan, openBillingPortal } from './actions';

interface BillingData {
  organization: {
    id: string;
    name: string;
    plan: string;
    planExpiresAt: string | null;
    hasSubscription: boolean;
  };
  limits: {
    plan: string;
    isActive: boolean;
    isTrialExpired: boolean | null;
    trialExpiresAt: Date | null;
    limits: {
      maxAgents: number;
      maxContacts: number;
      smsEnabled: boolean;
      eSignEnabled: boolean;
    };
    usage: {
      agents: number;
      contacts: number;
    };
  };
  plans: {
    [key: string]: {
      name: string;
      priceId: string | null;
      price: number;
      features: {
        maxAgents: number;
        maxContacts: number;
        smsEnabled: boolean;
        eSignEnabled: boolean;
      };
      description: string;
    };
  };
}

export default function BillingClient() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();

    // Check for success/cancel from Stripe
    if (searchParams.get('success') === 'true') {
      setSuccess('Your subscription has been updated successfully!');
    }
    if (searchParams.get('canceled') === 'true') {
      setError('Subscription update was canceled.');
    }
  }, [searchParams]);

  const loadData = async () => {
    setLoading(true);
    const result = await getBillingData();
    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.error || 'Failed to load billing data');
    }
    setLoading(false);
  };

  const handleUpgrade = async (planKey: string) => {
    setUpgrading(planKey);
    setError('');

    const result = await upgradePlan(planKey);

    if (result.success && result.url) {
      window.location.href = result.url;
    } else {
      setError(result.error || 'Failed to start upgrade');
      setUpgrading(null);
    }
  };

  const handleManageBilling = async () => {
    setUpgrading('portal');
    setError('');

    const result = await openBillingPortal();

    if (result.success && result.url) {
      window.location.href = result.url;
    } else {
      setError(result.error || 'Failed to open billing portal');
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Failed to load billing information. Please try again.
      </div>
    );
  }

  const currentPlan = data.organization.plan;
  const daysLeft = data.organization.planExpiresAt
    ? Math.max(0, Math.ceil((new Date(data.organization.planExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="space-y-8">
      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <Check className="w-5 h-5" />
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Trial Banner */}
      {daysLeft !== null && !data.organization.hasSubscription && (
        <div className={`p-4 rounded-lg flex items-center justify-between ${
          daysLeft <= 3
            ? 'bg-red-50 border border-red-200'
            : daysLeft <= 7
            ? 'bg-amber-50 border border-amber-200'
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-5 h-5 ${
              daysLeft <= 3 ? 'text-red-500' : daysLeft <= 7 ? 'text-amber-500' : 'text-blue-500'
            }`} />
            <div>
              <p className={`font-medium ${
                daysLeft <= 3 ? 'text-red-800' : daysLeft <= 7 ? 'text-amber-800' : 'text-blue-800'
              }`}>
                {daysLeft === 0
                  ? 'Your trial expires today!'
                  : daysLeft === 1
                  ? 'Your trial expires tomorrow!'
                  : `${daysLeft} days left in your trial`
                }
              </p>
              <p className={`text-sm ${
                daysLeft <= 3 ? 'text-red-600' : daysLeft <= 7 ? 'text-amber-600' : 'text-blue-600'
              }`}>
                Subscribe now to keep full access to all features
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current Plan & Usage */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
            <p className="text-gray-500">{data.organization.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {data.plans[currentPlan]?.name || currentPlan}
            </span>
            {data.organization.hasSubscription && (
              <button
                onClick={handleManageBilling}
                disabled={upgrading === 'portal'}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                {upgrading === 'portal' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                Manage Billing
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Usage Stats */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span className="text-sm">Agent Seats</span>
              </div>
              <span className="text-sm font-medium">
                {data.limits.usage.agents} / {data.limits.limits.maxAgents}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  data.limits.usage.agents >= data.limits.limits.maxAgents
                    ? 'bg-red-500'
                    : data.limits.usage.agents >= data.limits.limits.maxAgents * 0.8
                    ? 'bg-amber-500'
                    : 'bg-blue-500'
                }`}
                style={{
                  width: `${Math.min(100, (data.limits.usage.agents / data.limits.limits.maxAgents) * 100)}%`
                }}
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-gray-600">
                <UserPlus className="w-4 h-4" />
                <span className="text-sm">Contacts</span>
              </div>
              <span className="text-sm font-medium">
                {data.limits.usage.contacts} / {data.limits.limits.maxContacts}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  data.limits.usage.contacts >= data.limits.limits.maxContacts
                    ? 'bg-red-500'
                    : data.limits.usage.contacts >= data.limits.limits.maxContacts * 0.8
                    ? 'bg-amber-500'
                    : 'bg-blue-500'
                }`}
                style={{
                  width: `${Math.min(100, (data.limits.usage.contacts / data.limits.limits.maxContacts) * 100)}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Feature Status */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className={`flex items-center gap-2 text-sm ${
            data.limits.limits.smsEnabled ? 'text-green-600' : 'text-gray-400'
          }`}>
            <MessageSquare className="w-4 h-4" />
            <span>SMS Messaging</span>
            {data.limits.limits.smsEnabled ? (
              <Check className="w-4 h-4" />
            ) : (
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Upgrade</span>
            )}
          </div>
          <div className={`flex items-center gap-2 text-sm ${
            data.limits.limits.eSignEnabled ? 'text-green-600' : 'text-gray-400'
          }`}>
            <FileSignature className="w-4 h-4" />
            <span>E-Signatures</span>
            {data.limits.limits.eSignEnabled ? (
              <Check className="w-4 h-4" />
            ) : (
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Upgrade</span>
            )}
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Plans</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {['STARTER', 'PROFESSIONAL', 'ENTERPRISE'].map((planKey) => {
            const plan = data.plans[planKey];
            const isCurrentPlan = currentPlan === planKey;
            const isDowngrade = ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'].indexOf(planKey) <
                              ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'].indexOf(currentPlan);

            return (
              <div
                key={planKey}
                className={`relative bg-white border rounded-xl p-6 ${
                  isCurrentPlan
                    ? 'border-blue-500 ring-2 ring-blue-100'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {planKey === 'PROFESSIONAL' && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-500 text-sm">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-500">/month</span>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-blue-500" />
                    {plan.features.maxAgents === 1 ? '1 agent' : `Up to ${plan.features.maxAgents} agents`}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <UserPlus className="w-4 h-4 text-blue-500" />
                    {plan.features.maxContacts.toLocaleString()} contacts
                  </li>
                  <li className={`flex items-center gap-2 text-sm ${
                    plan.features.smsEnabled ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    <MessageSquare className={`w-4 h-4 ${plan.features.smsEnabled ? 'text-blue-500' : 'text-gray-300'}`} />
                    SMS messaging
                    {!plan.features.smsEnabled && <span className="text-xs">(not included)</span>}
                  </li>
                  <li className={`flex items-center gap-2 text-sm ${
                    plan.features.eSignEnabled ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    <FileSignature className={`w-4 h-4 ${plan.features.eSignEnabled ? 'text-blue-500' : 'text-gray-300'}`} />
                    E-signatures
                    {!plan.features.eSignEnabled && <span className="text-xs">(not included)</span>}
                  </li>
                </ul>

                <button
                  onClick={() => handleUpgrade(planKey)}
                  disabled={isCurrentPlan || upgrading !== null}
                  className={`w-full py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-500 cursor-default'
                      : isDowngrade
                      ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } disabled:opacity-50`}
                >
                  {upgrading === planKey ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrentPlan ? (
                    <>
                      <Check className="w-4 h-4" />
                      Current Plan
                    </>
                  ) : isDowngrade ? (
                    'Contact Support'
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Upgrade
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Help */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
        <h3 className="font-medium text-gray-900 mb-2">Need a custom plan?</h3>
        <p className="text-gray-600 text-sm mb-4">
          Contact us for custom pricing, white-label options, or enterprise features.
        </p>
        <a
          href="mailto:support@wealthpro.com"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          Contact Sales
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
