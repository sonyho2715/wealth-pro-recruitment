'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAgent } from '@/lib/auth';
import { db } from '@/lib/db';
import { ActivityType } from '@prisma/client';

const createActivitySchema = z.object({
  type: z.enum(['CALL', 'MEETING', 'EMAIL', 'FOLLOW_UP', 'PRESENTATION', 'APPLICATION', 'OTHER']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  prospectId: z.string().optional(),
  scheduledAt: z.string().optional(),
});

export async function createActivity(formData: FormData) {
  try {
    const session = await requireAgent();

    const validated = createActivitySchema.parse({
      type: formData.get('type'),
      title: formData.get('title'),
      description: formData.get('description') || undefined,
      prospectId: formData.get('prospectId') || undefined,
      scheduledAt: formData.get('scheduledAt') || undefined,
    });

    const activity = await db.activity.create({
      data: {
        agentId: session.agentId!,
        type: validated.type as ActivityType,
        title: validated.title,
        description: validated.description || null,
        prospectId: validated.prospectId || null,
        scheduledAt: validated.scheduledAt ? new Date(validated.scheduledAt) : null,
      },
      include: {
        prospect: true,
      },
    });

    revalidatePath('/agent/dashboard/activities');
    return { success: true, data: activity };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input', details: error.errors };
    }

    console.error('Create Activity Error:', error);
    return { success: false, error: 'Failed to create activity' };
  }
}

const completeActivitySchema = z.object({
  outcome: z.string().min(1, 'Outcome is required'),
});

export async function completeActivity(activityId: string, formData: FormData) {
  try {
    const session = await requireAgent();

    const validated = completeActivitySchema.parse({
      outcome: formData.get('outcome'),
    });

    // Verify the activity belongs to this agent
    const existingActivity = await db.activity.findFirst({
      where: {
        id: activityId,
        agentId: session.agentId!,
      },
    });

    if (!existingActivity) {
      return { success: false, error: 'Activity not found' };
    }

    const activity = await db.activity.update({
      where: { id: activityId },
      data: {
        completedAt: new Date(),
        outcome: validated.outcome,
      },
      include: {
        prospect: true,
      },
    });

    revalidatePath('/agent/dashboard/activities');
    return { success: true, data: activity };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input', details: error.errors };
    }

    console.error('Complete Activity Error:', error);
    return { success: false, error: 'Failed to complete activity' };
  }
}

export async function deleteActivity(activityId: string) {
  try {
    const session = await requireAgent();

    // Verify the activity belongs to this agent
    const existingActivity = await db.activity.findFirst({
      where: {
        id: activityId,
        agentId: session.agentId!,
      },
    });

    if (!existingActivity) {
      return { success: false, error: 'Activity not found' };
    }

    await db.activity.delete({
      where: { id: activityId },
    });

    revalidatePath('/agent/dashboard/activities');
    return { success: true };
  } catch (error) {
    console.error('Delete Activity Error:', error);
    return { success: false, error: 'Failed to delete activity' };
  }
}
