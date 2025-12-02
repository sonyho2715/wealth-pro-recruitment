'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import * as bcrypt from 'bcryptjs';
import { requireAgent } from '@/lib/auth';
import { db } from '@/lib/db';

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
