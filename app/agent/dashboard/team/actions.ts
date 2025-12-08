'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import * as bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { requireAgent, getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { checkPlanLimit } from '@/lib/stripe';

function generateInviteToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

const addTeamMemberSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  licenseNumber: z.string().optional(),
});

const updateTeamMemberSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().optional().nullable(),
  licenseNumber: z.string().optional().nullable(),
  monthlyGoal: z.number().optional().nullable(),
});

export async function addTeamMember(formData: FormData) {
  try {
    const session = await requireAgent();

    // Get current agent's organization
    const currentAgent = await db.agent.findUnique({
      where: { id: session.agentId },
      select: { organizationId: true },
    });

    if (currentAgent?.organizationId) {
      // Check plan limit for adding agents
      const limitCheck = await checkPlanLimit(currentAgent.organizationId, 'addAgent');
      if (!limitCheck.allowed) {
        return {
          success: false,
          error: limitCheck.reason || 'Cannot add more agents on current plan',
        };
      }
    }

    const validated = addTeamMemberSchema.parse({
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone') || undefined,
      licenseNumber: formData.get('licenseNumber') || undefined,
    });

    // Check if agent with this email already exists
    const existingAgent = await db.agent.findUnique({
      where: { email: validated.email },
    });

    if (existingAgent) {
      return {
        success: false,
        error: 'An agent with this email already exists',
      };
    }

    // Generate temporary password (first name + last 4 digits of phone or "2024")
    const tempPasswordSuffix = validated.phone
      ? validated.phone.slice(-4)
      : '2024';
    const tempPassword = `${validated.firstName}${tempPasswordSuffix}`;
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Create new agent under current agent
    const newAgent = await db.agent.create({
      data: {
        email: validated.email,
        passwordHash,
        firstName: validated.firstName,
        lastName: validated.lastName,
        phone: validated.phone || null,
        licenseNumber: validated.licenseNumber || null,
        role: 'AGENT',
        uplineId: session.agentId,
      },
    });

    revalidatePath('/agent/dashboard/team');

    return {
      success: true,
      data: {
        id: newAgent.id,
        tempPassword, // Return this so agent can share with new team member
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input',
        details: error.errors,
      };
    }

    console.error('Add Team Member Error:', error);
    return {
      success: false,
      error: 'Failed to add team member',
    };
  }
}

export async function updateTeamMember(memberId: string, data: Record<string, unknown>) {
  try {
    const session = await requireAgent();

    // Verify that the member being updated is in the agent's downline
    const member = await db.agent.findUnique({
      where: { id: memberId },
      select: { uplineId: true },
    });

    if (!member || member.uplineId !== session.agentId) {
      return {
        success: false,
        error: 'Unauthorized to update this team member',
      };
    }

    const validated = updateTeamMemberSchema.parse(data);

    // Filter out undefined values
    const updateData = Object.fromEntries(
      Object.entries(validated).filter(([_, v]) => v !== undefined)
    );

    const updatedMember = await db.agent.update({
      where: { id: memberId },
      data: updateData,
    });

    revalidatePath('/agent/dashboard/team');

    return {
      success: true,
      data: updatedMember,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input',
        details: error.errors,
      };
    }

    console.error('Update Team Member Error:', error);
    return {
      success: false,
      error: 'Failed to update team member',
    };
  }
}

export async function deleteTeamMember(memberId: string) {
  try {
    const session = await requireAgent();

    // Verify that the member being deleted is in the agent's downline
    const member = await db.agent.findUnique({
      where: { id: memberId },
      select: { uplineId: true, firstName: true, lastName: true },
    });

    if (!member || member.uplineId !== session.agentId) {
      return {
        success: false,
        error: 'Unauthorized to delete this team member',
      };
    }

    // Check if member has any downlines
    const hasDownlines = await db.agent.count({
      where: { uplineId: memberId },
    });

    if (hasDownlines > 0) {
      return {
        success: false,
        error: 'Cannot delete a team member who has their own downlines. Reassign their team first.',
      };
    }

    // Delete the team member
    await db.agent.delete({
      where: { id: memberId },
    });

    revalidatePath('/agent/dashboard/team');

    return {
      success: true,
      message: `${member.firstName} ${member.lastName} has been removed from your team.`,
    };
  } catch (error) {
    console.error('Delete Team Member Error:', error);
    return {
      success: false,
      error: 'Failed to delete team member',
    };
  }
}

export async function getTeamMemberDetails(memberId: string) {
  try {
    const session = await requireAgent();

    // Get member with their stats
    const member = await db.agent.findUnique({
      where: { id: memberId },
      include: {
        commissions: {
          where: { status: 'PAID' },
          select: {
            amount: true,
            productType: true,
            paidDate: true,
          },
        },
        activities: {
          where: { completedAt: { not: null } },
          select: {
            id: true,
            type: true,
            completedAt: true,
          },
        },
        downlines: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!member) {
      return {
        success: false,
        error: 'Team member not found',
      };
    }

    // Verify access (must be upline or same agent)
    if (member.uplineId !== session.agentId && member.id !== session.agentId) {
      return {
        success: false,
        error: 'Unauthorized to view this team member',
      };
    }

    // Calculate total production
    const totalProduction = member.commissions.reduce(
      (sum, comm) => sum + Number(comm.amount),
      0
    );

    return {
      success: true,
      data: {
        ...member,
        totalProduction,
        totalActivities: member.activities.length,
        teamSize: member.downlines.length,
      },
    };
  } catch (error) {
    console.error('Get Team Member Details Error:', error);
    return {
      success: false,
      error: 'Failed to fetch team member details',
    };
  }
}

// ============================================
// TEAM INVITE FUNCTIONS
// ============================================

export async function sendTeamInvite(formData: FormData) {
  const session = await getSession();
  if (!session.agentId) return { success: false, error: 'Unauthorized' };

  const agent = await db.agent.findUnique({
    where: { id: session.agentId },
    include: {
      organization: {
        select: {
          id: true,
          maxAgents: true,
          _count: {
            select: { agents: true },
          },
        },
      },
    },
  });

  if (!agent?.organization) {
    return { success: false, error: 'No organization found' };
  }

  // Check if org has room for more agents
  if (agent.organization._count.agents >= agent.organization.maxAgents) {
    return {
      success: false,
      error: `Your plan allows up to ${agent.organization.maxAgents} team members. Please upgrade to add more.`
    };
  }

  const email = (formData.get('email') as string)?.toLowerCase();
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const role = (formData.get('role') as string) || 'AGENT';

  if (!email) {
    return { success: false, error: 'Email is required' };
  }

  // Check if email already exists as an agent
  const existingAgent = await db.agent.findUnique({
    where: { email },
  });

  if (existingAgent) {
    return { success: false, error: 'This email is already registered' };
  }

  // Check for existing pending invite
  const existingInvite = await db.teamInvite.findFirst({
    where: {
      email,
      organizationId: agent.organization.id,
      status: 'PENDING',
    },
  });

  if (existingInvite) {
    return { success: false, error: 'An invite has already been sent to this email' };
  }

  try {
    const token = generateInviteToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await db.teamInvite.create({
      data: {
        organizationId: agent.organization.id,
        invitedById: session.agentId,
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        role: role as any,
        token,
        expiresAt,
      },
    });

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${token}`;

    revalidatePath('/agent/dashboard');
    revalidatePath('/agent/dashboard/team');
    return {
      success: true,
      data: invite,
      inviteUrl,
    };
  } catch (error) {
    console.error('Error creating invite:', error);
    return { success: false, error: 'Failed to send invite' };
  }
}

export async function cancelInvite(inviteId: string) {
  const session = await getSession();
  if (!session.agentId) return { success: false, error: 'Unauthorized' };

  try {
    await db.teamInvite.update({
      where: { id: inviteId },
      data: { status: 'CANCELLED' },
    });

    revalidatePath('/agent/dashboard/team');
    return { success: true };
  } catch (error) {
    console.error('Error cancelling invite:', error);
    return { success: false, error: 'Failed to cancel invite' };
  }
}

export async function resendInvite(inviteId: string) {
  const session = await getSession();
  if (!session.agentId) return { success: false, error: 'Unauthorized' };

  try {
    const token = generateInviteToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.teamInvite.update({
      where: { id: inviteId },
      data: {
        token,
        expiresAt,
        status: 'PENDING',
      },
    });

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${token}`;

    revalidatePath('/agent/dashboard/team');
    return { success: true, inviteUrl };
  } catch (error) {
    console.error('Error resending invite:', error);
    return { success: false, error: 'Failed to resend invite' };
  }
}
