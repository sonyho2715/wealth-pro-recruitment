'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

const scriptSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  category: z.enum([
    'PHONE_OPENING', 'PHONE_FOLLOW_UP', 'OBJECTION_HANDLING',
    'APPOINTMENT_SETTING', 'PRESENTATION', 'CLOSING',
    'RECRUITING', 'TEXT_TEMPLATE', 'EMAIL_TEMPLATE', 'SOCIAL_MEDIA'
  ]),
  tags: z.array(z.string()).default([]),
});

export async function createScript(formData: FormData) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const agent = await db.agent.findUnique({
      where: { id: session.agentId },
      select: { organizationId: true },
    });

    const rawData = {
      title: formData.get('title'),
      description: formData.get('description') || undefined,
      content: formData.get('content'),
      category: formData.get('category'),
      tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [],
    };

    const validated = scriptSchema.parse(rawData);

    const script = await db.script.create({
      data: {
        ...validated,
        organizationId: agent?.organizationId || null,
        createdById: session.agentId,
        isSystem: false,
      },
    });

    revalidatePath('/agent/dashboard/scripts');
    return { success: true, data: script };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input', details: error.errors };
    }
    console.error('Create script error:', error);
    return { success: false, error: 'Failed to create script' };
  }
}

export async function updateScript(id: string, formData: FormData) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership or system script
    const existing = await db.script.findFirst({
      where: {
        id,
        OR: [
          { createdById: session.agentId },
          { isSystem: false },
        ],
      },
    });

    if (!existing) {
      return { success: false, error: 'Script not found' };
    }

    if (existing.isSystem) {
      return { success: false, error: 'Cannot edit system scripts' };
    }

    const rawData = {
      title: formData.get('title'),
      description: formData.get('description') || undefined,
      content: formData.get('content'),
      category: formData.get('category'),
      tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [],
    };

    const validated = scriptSchema.parse(rawData);

    const script = await db.script.update({
      where: { id },
      data: validated,
    });

    revalidatePath('/agent/dashboard/scripts');
    return { success: true, data: script };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input', details: error.errors };
    }
    console.error('Update script error:', error);
    return { success: false, error: 'Failed to update script' };
  }
}

export async function deleteScript(id: string) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const existing = await db.script.findFirst({
      where: { id, createdById: session.agentId },
    });

    if (!existing) {
      return { success: false, error: 'Script not found' };
    }

    if (existing.isSystem) {
      return { success: false, error: 'Cannot delete system scripts' };
    }

    await db.script.delete({
      where: { id },
    });

    revalidatePath('/agent/dashboard/scripts');
    return { success: true };
  } catch (error) {
    console.error('Delete script error:', error);
    return { success: false, error: 'Failed to delete script' };
  }
}

export async function trackScriptUsage(id: string) {
  try {
    await db.script.update({
      where: { id },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });
    return { success: true };
  } catch (error) {
    console.error('Track usage error:', error);
    return { success: false };
  }
}

export async function duplicateScript(id: string) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const agent = await db.agent.findUnique({
      where: { id: session.agentId },
      select: { organizationId: true },
    });

    const original = await db.script.findUnique({
      where: { id },
    });

    if (!original) {
      return { success: false, error: 'Script not found' };
    }

    const script = await db.script.create({
      data: {
        title: `${original.title} (Copy)`,
        description: original.description,
        content: original.content,
        category: original.category,
        tags: original.tags,
        organizationId: agent?.organizationId || null,
        createdById: session.agentId,
        isSystem: false,
      },
    });

    revalidatePath('/agent/dashboard/scripts');
    return { success: true, data: script };
  } catch (error) {
    console.error('Duplicate script error:', error);
    return { success: false, error: 'Failed to duplicate script' };
  }
}
