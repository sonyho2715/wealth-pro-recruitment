'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function startPresentationSession(prospectId: string, deviceType: string) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify prospect access
    const prospect = await db.prospect.findFirst({
      where: {
        id: prospectId,
        OR: [
          { agentId: session.agentId },
          { agentId: null },
          {
            sharedWith: {
              some: { sharedWithAgentId: session.agentId },
            },
          },
        ],
      },
    });

    if (!prospect) {
      return { success: false, error: 'Prospect not found' };
    }

    const presentationSession = await db.presentationSession.create({
      data: {
        agentId: session.agentId,
        prospectId,
        deviceType,
        startedAt: new Date(),
        slidesViewed: [],
      },
    });

    revalidatePath('/agent/dashboard/presentations');
    return { success: true, data: presentationSession };
  } catch (error) {
    console.error('Start presentation error:', error);
    return { success: false, error: 'Failed to start presentation' };
  }
}

export async function updatePresentationSession(
  sessionId: string,
  updates: {
    currentSlide?: string;
    slidesViewed?: string[];
    interactionCount?: number;
  }
) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const presentationSession = await db.presentationSession.update({
      where: { id: sessionId, agentId: session.agentId },
      data: updates,
    });

    return { success: true, data: presentationSession };
  } catch (error) {
    console.error('Update presentation error:', error);
    return { success: false, error: 'Failed to update presentation' };
  }
}

export async function endPresentationSession(
  sessionId: string,
  outcome: 'COMPLETED' | 'INTERRUPTED' | 'FOLLOW_UP_NEEDED' | 'APPLICATION_STARTED' | 'DECLINED',
  notes?: string
) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const existingSession = await db.presentationSession.findFirst({
      where: { id: sessionId, agentId: session.agentId },
    });

    if (!existingSession) {
      return { success: false, error: 'Session not found' };
    }

    const duration = Math.round(
      (new Date().getTime() - existingSession.startedAt.getTime()) / 1000
    );

    const presentationSession = await db.presentationSession.update({
      where: { id: sessionId },
      data: {
        endedAt: new Date(),
        totalDuration: duration,
        outcome,
        notes,
      },
    });

    // If outcome suggests conversion, update prospect stage
    if (outcome === 'APPLICATION_STARTED') {
      await db.prospect.update({
        where: { id: existingSession.prospectId },
        data: { stage: 'PROPOSAL_SENT' },
      });
    }

    revalidatePath('/agent/dashboard/presentations');
    revalidatePath('/agent/dashboard/prospects');
    return { success: true, data: presentationSession };
  } catch (error) {
    console.error('End presentation error:', error);
    return { success: false, error: 'Failed to end presentation' };
  }
}

export async function logSlideView(sessionId: string, slideId: string) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const existingSession = await db.presentationSession.findFirst({
      where: { id: sessionId, agentId: session.agentId },
    });

    if (!existingSession) {
      return { success: false, error: 'Session not found' };
    }

    const slidesViewed = existingSession.slidesViewed || [];
    if (!slidesViewed.includes(slideId)) {
      slidesViewed.push(slideId);
    }

    await db.presentationSession.update({
      where: { id: sessionId },
      data: {
        currentSlide: slideId,
        slidesViewed,
        interactionCount: { increment: 1 },
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Log slide view error:', error);
    return { success: false, error: 'Failed to log slide view' };
  }
}

export async function getPresentationStats() {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const sessions = await db.presentationSession.findMany({
      where: { agentId: session.agentId },
      include: {
        prospect: {
          select: {
            firstName: true,
            lastName: true,
            status: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    const stats = {
      total: sessions.length,
      completed: sessions.filter(s => s.outcome === 'COMPLETED').length,
      applicationStarted: sessions.filter(s => s.outcome === 'APPLICATION_STARTED').length,
      followUpNeeded: sessions.filter(s => s.outcome === 'FOLLOW_UP_NEEDED').length,
      avgDuration: sessions.length > 0
        ? Math.round(sessions.reduce((sum, s) => sum + (s.totalDuration || 0), 0) / sessions.length / 60)
        : 0,
    };

    return { success: true, data: { sessions, stats } };
  } catch (error) {
    console.error('Get presentation stats error:', error);
    return { success: false, error: 'Failed to get stats' };
  }
}
