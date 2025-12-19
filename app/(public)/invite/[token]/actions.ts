'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

interface AcceptInviteData {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
}

export async function acceptInvite(
  token: string,
  data: AcceptInviteData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Find the invite
    const invite = await db.teamInvite.findUnique({
      where: { token },
      include: {
        organization: true,
        invitedBy: {
          select: { id: true },
        },
      },
    });

    if (!invite) {
      return { success: false, error: 'Invalid invite link' };
    }

    if (invite.status !== 'PENDING') {
      return { success: false, error: 'This invite is no longer valid' };
    }

    if (new Date() > invite.expiresAt) {
      // Mark as expired
      await db.teamInvite.update({
        where: { id: invite.id },
        data: { status: 'EXPIRED' },
      });
      return { success: false, error: 'This invite has expired' };
    }

    // Check if email already exists
    const existingAgent = await db.agent.findUnique({
      where: { email: invite.email },
    });

    if (existingAgent) {
      return { success: false, error: 'An account with this email already exists' };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Generate referral code
    const referralCode = generateReferralCode();

    // Create agent and update invite in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create the agent
      const agent = await tx.agent.create({
        data: {
          email: invite.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || null,
          role: invite.role,
          organizationId: invite.organizationId,
          uplineId: invite.invitedById,
          referralCode,
        },
      });

      // Update invite status
      await tx.teamInvite.update({
        where: { id: invite.id },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
          acceptedById: agent.id,
        },
      });

      return { agent };
    });

    // Set session
    const session = await getSession();
    session.agentId = result.agent.id;
    session.email = result.agent.email;
    session.firstName = result.agent.firstName;
    session.role = result.agent.role;
    session.organizationId = invite.organizationId;
    session.isLoggedIn = true;
    await session.save();

    return { success: true };
  } catch (error) {
    console.error('Accept invite error:', error);
    return { success: false, error: 'Failed to create account. Please try again.' };
  }
}
