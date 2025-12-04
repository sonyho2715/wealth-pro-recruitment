'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-11-17.clover' })
  : null;

// Plan configuration
const planConfig = {
  solo: {
    name: 'Solo Agent',
    priceId: process.env.STRIPE_PRICE_SOLO,
    dbPlan: 'STARTER' as const,
    maxAgents: 1,
    maxContacts: 100,
    smsEnabled: false,
    eSignEnabled: false,
  },
  team: {
    name: 'Team Leader',
    priceId: process.env.STRIPE_PRICE_TEAM,
    dbPlan: 'PROFESSIONAL' as const,
    maxAgents: 5,
    maxContacts: 500,
    smsEnabled: true,
    eSignEnabled: false,
  },
  agency: {
    name: 'Agency',
    priceId: process.env.STRIPE_PRICE_AGENCY,
    dbPlan: 'ENTERPRISE' as const,
    maxAgents: 25,
    maxContacts: 2000,
    smsEnabled: true,
    eSignEnabled: true,
  },
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

async function generateUniqueSlug(baseName: string): Promise<string> {
  let slug = generateSlug(baseName);
  let counter = 0;

  while (true) {
    const testSlug = counter === 0 ? slug : `${slug}-${counter}`;
    const existing = await db.organization.findUnique({
      where: { slug: testSlug },
    });

    if (!existing) {
      return testSlug;
    }
    counter++;
  }
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  organizationName: string;
  plan: 'solo' | 'team' | 'agency';
}

export async function signup(data: SignupData): Promise<{
  success: boolean;
  error?: string;
  checkoutUrl?: string;
}> {
  try {
    // Validate required fields
    if (!data.email || !data.password || !data.firstName || !data.lastName || !data.organizationName) {
      return { success: false, error: 'Missing required fields' };
    }

    // Check if email already exists
    const existingAgent = await db.agent.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingAgent) {
      return { success: false, error: 'An account with this email already exists' };
    }

    // Get plan config
    const plan = planConfig[data.plan];
    if (!plan) {
      return { success: false, error: 'Invalid plan selected' };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Generate unique slug for organization
    const slug = await generateUniqueSlug(data.organizationName);

    // Generate referral code
    const referralCode = generateReferralCode();

    // Create organization and agent in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: data.organizationName,
          slug,
          plan: plan.dbPlan,
          maxAgents: plan.maxAgents,
          maxContacts: plan.maxContacts,
          smsEnabled: plan.smsEnabled,
          eSignEnabled: plan.eSignEnabled,
          // Trial expires in 14 days
          planExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });

      // Create agent (owner)
      const agent = await tx.agent.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || null,
          role: 'ADMIN',
          organizationId: organization.id,
          referralCode,
        },
      });

      return { organization, agent };
    });

    // Set session
    const session = await getSession();
    session.agentId = result.agent.id;
    session.email = result.agent.email;
    session.firstName = result.agent.firstName;
    session.role = result.agent.role;
    session.organizationId = result.organization.id;
    session.isLoggedIn = true;
    await session.save();

    // If Stripe is configured, create checkout session for after trial
    if (stripe && plan.priceId) {
      try {
        // Create Stripe customer
        const customer = await stripe.customers.create({
          email: data.email.toLowerCase(),
          name: `${data.firstName} ${data.lastName}`,
          metadata: {
            organizationId: result.organization.id,
            agentId: result.agent.id,
          },
        });

        // Update organization with Stripe customer ID
        await db.organization.update({
          where: { id: result.organization.id },
          data: { stripeCustomerId: customer.id },
        });

        // Create checkout session with trial
        const checkoutSession = await stripe.checkout.sessions.create({
          customer: customer.id,
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [
            {
              price: plan.priceId,
              quantity: 1,
            },
          ],
          subscription_data: {
            trial_period_days: 14,
          },
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/agent/dashboard?welcome=true`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/agent/dashboard?welcome=true`,
          metadata: {
            organizationId: result.organization.id,
          },
        });

        // Return checkout URL if we have one, otherwise just go to dashboard
        // For trial, we skip checkout and go straight to dashboard
        // User will be prompted to add payment before trial ends
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        // Continue without Stripe - user can set up payment later
      }
    }

    // For now, skip checkout and go straight to dashboard (free trial)
    return { success: true };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: 'Failed to create account. Please try again.' };
  }
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
  const existing = await db.agent.findUnique({
    where: { email: email.toLowerCase() },
  });
  return !existing;
}
