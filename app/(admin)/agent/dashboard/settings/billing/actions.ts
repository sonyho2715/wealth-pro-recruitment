'use server';

import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  createCheckoutSession,
  createBillingPortalSession,
  getOrganizationLimits,
  PLAN_CONFIG,
  PlanType,
} from '@/lib/stripe';

export async function getBillingData() {
  const session = await getSession();

  if (!session.isLoggedIn || !session.organizationId) {
    return { success: false, error: 'Not authenticated' };
  }

  const org = await db.organization.findUnique({
    where: { id: session.organizationId },
    select: {
      id: true,
      name: true,
      plan: true,
      planExpiresAt: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      maxAgents: true,
      maxContacts: true,
      smsEnabled: true,
      eSignEnabled: true,
      _count: {
        select: {
          agents: true,
          contacts: true,
        },
      },
    },
  });

  if (!org) {
    return { success: false, error: 'Organization not found' };
  }

  const limits = await getOrganizationLimits(session.organizationId);

  return {
    success: true,
    data: {
      organization: {
        id: org.id,
        name: org.name,
        plan: org.plan,
        planExpiresAt: org.planExpiresAt?.toISOString() || null,
        hasSubscription: !!org.stripeSubscriptionId,
      },
      limits: limits!,
      plans: PLAN_CONFIG,
    },
  };
}

export async function upgradePlan(targetPlan: string) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.organizationId) {
    return { success: false, error: 'Not authenticated' };
  }

  // Validate plan
  if (!['STARTER', 'PROFESSIONAL', 'ENTERPRISE'].includes(targetPlan)) {
    return { success: false, error: 'Invalid plan selected' };
  }

  const result = await createCheckoutSession(
    session.organizationId,
    targetPlan as PlanType
  );

  if (result.error) {
    return { success: false, error: result.error };
  }

  return { success: true, url: result.url };
}

export async function openBillingPortal() {
  const session = await getSession();

  if (!session.isLoggedIn || !session.organizationId) {
    return { success: false, error: 'Not authenticated' };
  }

  const result = await createBillingPortalSession(session.organizationId);

  if (result.error) {
    return { success: false, error: result.error };
  }

  return { success: true, url: result.url };
}
