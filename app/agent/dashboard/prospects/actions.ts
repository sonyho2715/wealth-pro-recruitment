'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { ProspectStage } from '@prisma/client';
import { nanoid } from 'nanoid';

// Share prospect with another agent (typically upline)
export async function shareProspectWithAgent(
  prospectId: string,
  sharedWithAgentId: string,
  options?: { canEdit?: boolean; note?: string }
) {
  try {
    const session = await getSession();
    if (!session.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify the prospect exists and belongs to the current agent
    const prospect = await db.prospect.findUnique({
      where: { id: prospectId },
      include: { sharedWith: true }
    });

    if (!prospect) {
      return { success: false, error: 'Prospect not found' };
    }

    // Check if current agent owns this prospect or has it shared with them
    const isOwner = prospect.agentId === session.agentId || prospect.agentId === null;
    const hasAccess = prospect.sharedWith.some(s => s.sharedWithAgentId === session.agentId);

    if (!isOwner && !hasAccess) {
      return { success: false, error: 'You do not have permission to share this prospect' };
    }

    // Check if already shared with this agent
    const existingShare = await db.prospectShare.findUnique({
      where: {
        prospectId_sharedWithAgentId: {
          prospectId,
          sharedWithAgentId
        }
      }
    });

    if (existingShare) {
      return { success: false, error: 'Prospect is already shared with this agent' };
    }

    // Verify the target agent exists
    const targetAgent = await db.agent.findUnique({
      where: { id: sharedWithAgentId },
      select: { id: true, firstName: true, lastName: true }
    });

    if (!targetAgent) {
      return { success: false, error: 'Target agent not found' };
    }

    // Create the share
    await db.prospectShare.create({
      data: {
        prospectId,
        sharedByAgentId: session.agentId,
        sharedWithAgentId,
        canEdit: options?.canEdit ?? false,
        canViewOnly: true,
        note: options?.note
      }
    });

    revalidatePath('/agent/dashboard/prospects');
    revalidatePath(`/agent/dashboard/balance-sheets/${prospectId}`);

    return {
      success: true,
      message: `Prospect shared with ${targetAgent.firstName} ${targetAgent.lastName}`
    };
  } catch (error) {
    console.error('Error sharing prospect:', error);
    return { success: false, error: 'Failed to share prospect' };
  }
}

// Share prospect with upline
export async function shareProspectWithUpline(prospectId: string, note?: string) {
  try {
    const session = await getSession();
    if (!session.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get current agent's upline
    const agent = await db.agent.findUnique({
      where: { id: session.agentId },
      include: {
        upline: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    if (!agent?.upline) {
      return { success: false, error: 'You do not have an upline configured' };
    }

    return shareProspectWithAgent(prospectId, agent.upline.id, { note });
  } catch (error) {
    console.error('Error sharing with upline:', error);
    return { success: false, error: 'Failed to share with upline' };
  }
}

// Remove share access
export async function removeProspectShare(prospectId: string, sharedWithAgentId: string) {
  try {
    const session = await getSession();
    if (!session.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify the share exists and was created by current agent
    const share = await db.prospectShare.findUnique({
      where: {
        prospectId_sharedWithAgentId: {
          prospectId,
          sharedWithAgentId
        }
      }
    });

    if (!share) {
      return { success: false, error: 'Share not found' };
    }

    if (share.sharedByAgentId !== session.agentId) {
      return { success: false, error: 'You can only remove shares you created' };
    }

    await db.prospectShare.delete({
      where: {
        prospectId_sharedWithAgentId: {
          prospectId,
          sharedWithAgentId
        }
      }
    });

    revalidatePath('/agent/dashboard/prospects');
    return { success: true };
  } catch (error) {
    console.error('Error removing share:', error);
    return { success: false, error: 'Failed to remove share' };
  }
}

// Update prospect stage
export async function updateProspectStage(prospectId: string, stage: ProspectStage) {
  try {
    const session = await getSession();
    if (!session.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify access to prospect
    const prospect = await db.prospect.findUnique({
      where: { id: prospectId },
      include: { sharedWith: true }
    });

    if (!prospect) {
      return { success: false, error: 'Prospect not found' };
    }

    const isOwner = prospect.agentId === session.agentId || prospect.agentId === null;
    const hasEditAccess = prospect.sharedWith.some(
      s => s.sharedWithAgentId === session.agentId && s.canEdit
    );

    if (!isOwner && !hasEditAccess) {
      return { success: false, error: 'You do not have permission to update this prospect' };
    }

    await db.prospect.update({
      where: { id: prospectId },
      data: { stage }
    });

    revalidatePath('/agent/dashboard/prospects');
    revalidatePath(`/agent/dashboard/balance-sheets/${prospectId}`);

    return { success: true, stage };
  } catch (error) {
    console.error('Error updating stage:', error);
    return { success: false, error: 'Failed to update stage' };
  }
}

// Get or generate referral code for agent
export async function getOrCreateReferralCode() {
  try {
    const session = await getSession();
    if (!session.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const agent = await db.agent.findUnique({
      where: { id: session.agentId },
      select: { referralCode: true, firstName: true, lastName: true }
    });

    if (!agent) {
      return { success: false, error: 'Agent not found' };
    }

    // If referral code exists, return it
    if (agent.referralCode) {
      return { success: true, referralCode: agent.referralCode };
    }

    // Generate a new referral code
    const referralCode = nanoid(10);

    await db.agent.update({
      where: { id: session.agentId },
      data: { referralCode }
    });

    return { success: true, referralCode };
  } catch (error) {
    console.error('Error getting referral code:', error);
    return { success: false, error: 'Failed to get referral code' };
  }
}

// Get agent by referral code (for prospect registration)
export async function getAgentByReferralCode(referralCode: string) {
  try {
    const agent = await db.agent.findUnique({
      where: { referralCode },
      select: { id: true, firstName: true, lastName: true }
    });

    if (!agent) {
      return { success: false, error: 'Invalid referral code' };
    }

    return { success: true, agent };
  } catch (error) {
    console.error('Error finding agent:', error);
    return { success: false, error: 'Failed to find agent' };
  }
}

// Get agents for sharing (upline and team members)
export async function getShareableAgents() {
  try {
    const session = await getSession();
    if (!session.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const agent = await db.agent.findUnique({
      where: { id: session.agentId },
      include: {
        upline: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true }
        },
        downlines: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true }
        }
      }
    });

    if (!agent) {
      return { success: false, error: 'Agent not found' };
    }

    const shareableAgents = [];

    if (agent.upline) {
      shareableAgents.push({
        ...agent.upline,
        relationship: 'upline' as const
      });
    }

    for (const downline of agent.downlines) {
      shareableAgents.push({
        ...downline,
        relationship: 'downline' as const
      });
    }

    return { success: true, agents: shareableAgents };
  } catch (error) {
    console.error('Error getting shareable agents:', error);
    return { success: false, error: 'Failed to get agents' };
  }
}

// Get prospects shared with current agent
export async function getSharedProspects() {
  try {
    const session = await getSession();
    if (!session.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const shares = await db.prospectShare.findMany({
      where: { sharedWithAgentId: session.agentId },
      include: {
        prospect: {
          include: {
            financialProfile: true,
            agentProjection: true
          }
        },
        sharedByAgent: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { sharedAt: 'desc' }
    });

    return { success: true, shares };
  } catch (error) {
    console.error('Error getting shared prospects:', error);
    return { success: false, error: 'Failed to get shared prospects' };
  }
}

// ============================================
// BSCpro QUICK ACTIONS
// ============================================

// Get upcoming BPM events for the agent's organization
export async function getUpcomingBPMEvents() {
  try {
    const session = await getSession();
    if (!session.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const agent = await db.agent.findUnique({
      where: { id: session.agentId },
      select: { organizationId: true },
    });

    if (!agent?.organizationId) {
      return { success: false, error: 'No organization found' };
    }

    const events = await db.bPM.findMany({
      where: {
        organizationId: agent.organizationId,
        date: { gte: new Date() },
        status: 'SCHEDULED',
      },
      select: {
        id: true,
        name: true,
        date: true,
        location: true,
        isVirtual: true,
      },
      orderBy: { date: 'asc' },
      take: 10,
    });

    return { success: true, events };
  } catch (error) {
    console.error('Error getting BPM events:', error);
    return { success: false, error: 'Failed to get events' };
  }
}

// Invite prospect to a BPM event
export async function inviteProspectToBPM(
  prospectId: string,
  bpmId: string
) {
  try {
    const session = await getSession();
    if (!session.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get prospect details
    const prospect = await db.prospect.findUnique({
      where: { id: prospectId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
      },
    });

    if (!prospect) {
      return { success: false, error: 'Prospect not found' };
    }

    // Verify BPM event exists
    const bpm = await db.bPM.findUnique({
      where: { id: bpmId },
      select: { id: true, name: true },
    });

    if (!bpm) {
      return { success: false, error: 'Event not found' };
    }

    // Check if already invited
    const existingGuest = await db.bPMGuest.findFirst({
      where: {
        bpmId,
        guestName: `${prospect.firstName} ${prospect.lastName}`,
        inviterId: session.agentId,
      },
    });

    if (existingGuest) {
      return { success: false, error: 'Prospect already invited to this event' };
    }

    // Create BPM guest
    await db.bPMGuest.create({
      data: {
        bpmId,
        inviterId: session.agentId,
        guestName: `${prospect.firstName} ${prospect.lastName}`,
        guestPhone: prospect.phone,
        guestEmail: prospect.email,
        status: 'INVITED',
      },
    });

    revalidatePath('/agent/dashboard/prospects');
    revalidatePath('/agent/dashboard/events');
    revalidatePath(`/agent/dashboard/events/${bpmId}`);

    return {
      success: true,
      message: `${prospect.firstName} ${prospect.lastName} invited to ${bpm.name}`,
    };
  } catch (error) {
    console.error('Error inviting to BPM:', error);
    return { success: false, error: 'Failed to invite to event' };
  }
}

// Get trainers for matchup request
export async function getAvailableTrainers() {
  try {
    const session = await getSession();
    if (!session.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const agent = await db.agent.findUnique({
      where: { id: session.agentId },
      select: { organizationId: true },
    });

    if (!agent?.organizationId) {
      return { success: false, error: 'No organization found' };
    }

    // Get agents who can be trainers (exclude current agent)
    const trainers = await db.agent.findMany({
      where: {
        organizationId: agent.organizationId,
        id: { not: session.agentId },
        role: { in: ['ADMIN', 'MANAGER', 'AGENT'] },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
      },
      orderBy: { firstName: 'asc' },
    });

    return { success: true, trainers };
  } catch (error) {
    console.error('Error getting trainers:', error);
    return { success: false, error: 'Failed to get trainers' };
  }
}

// Request matchup (field training appointment)
export async function requestMatchup(
  prospectId: string,
  trainerId: string,
  requestedDate: string,
  notes?: string
) {
  try {
    const session = await getSession();
    if (!session.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const agent = await db.agent.findUnique({
      where: { id: session.agentId },
      select: { organizationId: true, firstName: true, lastName: true },
    });

    if (!agent?.organizationId) {
      return { success: false, error: 'No organization found' };
    }

    // Get prospect details
    const prospect = await db.prospect.findUnique({
      where: { id: prospectId },
      select: { firstName: true, lastName: true, phone: true },
    });

    if (!prospect) {
      return { success: false, error: 'Prospect not found' };
    }

    // Create matchup request
    await db.matchupRequest.create({
      data: {
        organizationId: agent.organizationId,
        requestingAgentId: session.agentId,
        assignedTrainerId: trainerId,
        contactName: `${prospect.firstName} ${prospect.lastName}`,
        contactPhone: prospect.phone || '',
        appointmentDate: new Date(requestedDate),
        appointmentType: 'ONE_ON_ONE',
        notes,
        status: 'PENDING',
      },
    });

    revalidatePath('/agent/dashboard/prospects');

    return {
      success: true,
      message: `Matchup request submitted for ${prospect.firstName} ${prospect.lastName}`,
    };
  } catch (error) {
    console.error('Error requesting matchup:', error);
    return { success: false, error: 'Failed to submit matchup request' };
  }
}

// Convert prospect to recruit
export async function convertProspectToRecruit(
  prospectId: string,
  codeNumber?: string,
  codeExpiryDate?: string
) {
  try {
    const session = await getSession();
    if (!session.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const agent = await db.agent.findUnique({
      where: { id: session.agentId },
      select: { organizationId: true },
    });

    if (!agent?.organizationId) {
      return { success: false, error: 'No organization found' };
    }

    // Get prospect details
    const prospect = await db.prospect.findUnique({
      where: { id: prospectId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        status: true,
      },
    });

    if (!prospect) {
      return { success: false, error: 'Prospect not found' };
    }

    // Check if already a recruit
    const existingRecruit = await db.recruit.findFirst({
      where: {
        organizationId: agent.organizationId,
        firstName: prospect.firstName,
        lastName: prospect.lastName,
        phone: prospect.phone || undefined,
      },
    });

    if (existingRecruit) {
      return { success: false, error: 'This prospect is already a recruit' };
    }

    // Create recruit
    const recruit = await db.recruit.create({
      data: {
        organizationId: agent.organizationId,
        recruiterId: session.agentId,
        firstName: prospect.firstName,
        lastName: prospect.lastName,
        phone: prospect.phone || '',
        email: prospect.email,
        codeNumber: codeNumber || null,
        codeExpiryDate: codeExpiryDate ? new Date(codeExpiryDate) : null,
        status: 'ACTIVE',
        startDate: new Date(),
      },
    });

    // Update prospect status to AGENT_PROSPECT or LICENSED_AGENT
    await db.prospect.update({
      where: { id: prospectId },
      data: { status: 'AGENT_PROSPECT' },
    });

    revalidatePath('/agent/dashboard');
    revalidatePath('/agent/dashboard/prospects');
    revalidatePath('/agent/dashboard/recruits');

    return {
      success: true,
      message: `${prospect.firstName} ${prospect.lastName} converted to recruit`,
      recruitId: recruit.id,
    };
  } catch (error) {
    console.error('Error converting to recruit:', error);
    return { success: false, error: 'Failed to convert to recruit' };
  }
}
