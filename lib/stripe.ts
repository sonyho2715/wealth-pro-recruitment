import Stripe from 'stripe';
import { db } from './db';

// Initialize Stripe only if key is available
export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('STRIPE_SECRET_KEY not configured');
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-11-17.clover',
  });
}

// Plan configuration with price IDs
export const PLAN_CONFIG = {
  FREE: {
    name: 'Free',
    priceId: null,
    price: 0,
    features: {
      maxAgents: 1,
      maxContacts: 25,
      smsEnabled: false,
      eSignEnabled: false,
    },
    description: 'Get started with basic features',
  },
  STARTER: {
    name: 'Solo Agent',
    priceId: process.env.STRIPE_PRICE_SOLO || null,
    price: 29,
    features: {
      maxAgents: 1,
      maxContacts: 100,
      smsEnabled: false,
      eSignEnabled: false,
    },
    description: 'Perfect for individual agents',
  },
  PROFESSIONAL: {
    name: 'Team Leader',
    priceId: process.env.STRIPE_PRICE_TEAM || null,
    price: 79,
    features: {
      maxAgents: 5,
      maxContacts: 500,
      smsEnabled: true,
      eSignEnabled: false,
    },
    description: 'Build and manage your team',
  },
  ENTERPRISE: {
    name: 'Agency',
    priceId: process.env.STRIPE_PRICE_AGENCY || null,
    price: 199,
    features: {
      maxAgents: 25,
      maxContacts: 2000,
      smsEnabled: true,
      eSignEnabled: true,
    },
    description: 'Full-featured for growing agencies',
  },
} as const;

export type PlanType = keyof typeof PLAN_CONFIG;

// Get plan limits for an organization
export async function getOrganizationLimits(organizationId: string) {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      plan: true,
      planExpiresAt: true,
      maxAgents: true,
      maxContacts: true,
      smsEnabled: true,
      eSignEnabled: true,
      stripeSubscriptionId: true,
      _count: {
        select: {
          agents: true,
          contacts: true,
        },
      },
    },
  });

  if (!org) return null;

  const isTrialExpired = org.planExpiresAt && new Date(org.planExpiresAt) < new Date();
  const hasActiveSubscription = !!org.stripeSubscriptionId;
  const isActive = hasActiveSubscription || !isTrialExpired;

  return {
    plan: org.plan,
    isActive,
    isTrialExpired: isTrialExpired && !hasActiveSubscription,
    trialExpiresAt: org.planExpiresAt,
    limits: {
      maxAgents: org.maxAgents,
      maxContacts: org.maxContacts,
      smsEnabled: isActive ? org.smsEnabled : false,
      eSignEnabled: isActive ? org.eSignEnabled : false,
    },
    usage: {
      agents: org._count.agents,
      contacts: org._count.contacts,
    },
    canAddAgent: org._count.agents < org.maxAgents && isActive,
    canAddContact: org._count.contacts < org.maxContacts && isActive,
  };
}

// Check if organization can perform an action
export async function checkPlanLimit(
  organizationId: string,
  action: 'addAgent' | 'addContact' | 'sendSms' | 'useESign'
): Promise<{ allowed: boolean; reason?: string }> {
  const limits = await getOrganizationLimits(organizationId);

  if (!limits) {
    return { allowed: false, reason: 'Organization not found' };
  }

  if (!limits.isActive) {
    return {
      allowed: false,
      reason: limits.isTrialExpired
        ? 'Your trial has expired. Please upgrade to continue.'
        : 'Your subscription is inactive.'
    };
  }

  switch (action) {
    case 'addAgent':
      if (!limits.canAddAgent) {
        return {
          allowed: false,
          reason: `Agent limit reached (${limits.usage.agents}/${limits.limits.maxAgents}). Upgrade your plan to add more agents.`
        };
      }
      break;
    case 'addContact':
      if (!limits.canAddContact) {
        return {
          allowed: false,
          reason: `Contact limit reached (${limits.usage.contacts}/${limits.limits.maxContacts}). Upgrade your plan to add more contacts.`
        };
      }
      break;
    case 'sendSms':
      if (!limits.limits.smsEnabled) {
        return { allowed: false, reason: 'SMS is not available on your current plan. Upgrade to Team Leader or Agency.' };
      }
      break;
    case 'useESign':
      if (!limits.limits.eSignEnabled) {
        return { allowed: false, reason: 'E-signatures are not available on your current plan. Upgrade to Agency.' };
      }
      break;
  }

  return { allowed: true };
}

// Create Stripe checkout session for upgrade
export async function createCheckoutSession(
  organizationId: string,
  targetPlan: PlanType
): Promise<{ url: string | null; error?: string }> {
  const stripe = getStripe();
  if (!stripe) {
    return { url: null, error: 'Stripe is not configured' };
  }

  const planConfig = PLAN_CONFIG[targetPlan];
  if (!planConfig.priceId) {
    return { url: null, error: 'Invalid plan selected' };
  }

  const org = await db.organization.findUnique({
    where: { id: organizationId },
    include: {
      agents: {
        where: { role: 'ADMIN' },
        take: 1,
      },
    },
  });

  if (!org) {
    return { url: null, error: 'Organization not found' };
  }

  try {
    // Create or get Stripe customer
    let customerId = org.stripeCustomerId;

    if (!customerId && org.agents[0]) {
      const customer = await stripe.customers.create({
        email: org.agents[0].email,
        name: org.name,
        metadata: {
          organizationId: org.id,
        },
      });

      await db.organization.update({
        where: { id: organizationId },
        data: { stripeCustomerId: customer.id },
      });

      customerId = customer.id;
    }

    if (!customerId) {
      return { url: null, error: 'Could not create customer' };
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/agent/dashboard/settings/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/agent/dashboard/settings/billing?canceled=true`,
      metadata: {
        organizationId,
        targetPlan,
      },
    });

    return { url: session.url };
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return { url: null, error: 'Failed to create checkout session' };
  }
}

// Create Stripe billing portal session
export async function createBillingPortalSession(
  organizationId: string
): Promise<{ url: string | null; error?: string }> {
  const stripe = getStripe();
  if (!stripe) {
    return { url: null, error: 'Stripe is not configured' };
  }

  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { stripeCustomerId: true },
  });

  if (!org?.stripeCustomerId) {
    return { url: null, error: 'No billing account found. Please subscribe to a plan first.' };
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/agent/dashboard/settings/billing`,
    });

    return { url: session.url };
  } catch (error) {
    console.error('Stripe portal error:', error);
    return { url: null, error: 'Failed to open billing portal' };
  }
}

// Handle Stripe webhook events
export async function handleWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const organizationId = session.metadata?.organizationId;
      const targetPlan = session.metadata?.targetPlan as PlanType;

      if (organizationId && targetPlan && session.subscription) {
        const planFeatures = PLAN_CONFIG[targetPlan].features;

        await db.organization.update({
          where: { id: organizationId },
          data: {
            plan: targetPlan,
            stripeSubscriptionId: session.subscription as string,
            planExpiresAt: null, // Clear trial expiry
            maxAgents: planFeatures.maxAgents,
            maxContacts: planFeatures.maxContacts,
            smsEnabled: planFeatures.smsEnabled,
            eSignEnabled: planFeatures.eSignEnabled,
          },
        });
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;

      // Find organization by subscription ID
      const org = await db.organization.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });

      if (org) {
        // Update subscription status
        const isActive = subscription.status === 'active' || subscription.status === 'trialing';

        if (!isActive) {
          // Downgrade to free plan if subscription is cancelled/past_due
          await db.organization.update({
            where: { id: org.id },
            data: {
              plan: 'FREE',
              maxAgents: PLAN_CONFIG.FREE.features.maxAgents,
              maxContacts: PLAN_CONFIG.FREE.features.maxContacts,
              smsEnabled: false,
              eSignEnabled: false,
            },
          });
        }
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;

      // Find and downgrade organization
      const org = await db.organization.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });

      if (org) {
        await db.organization.update({
          where: { id: org.id },
          data: {
            plan: 'FREE',
            stripeSubscriptionId: null,
            maxAgents: PLAN_CONFIG.FREE.features.maxAgents,
            maxContacts: PLAN_CONFIG.FREE.features.maxContacts,
            smsEnabled: false,
            eSignEnabled: false,
          },
        });
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription };
      const subscriptionId = typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription?.id;

      if (subscriptionId) {
        const org = await db.organization.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
        });

        if (org) {
          // TODO: Send email notification about failed payment
          console.log(`Payment failed for organization ${org.id}`);
        }
      }
      break;
    }
  }
}
