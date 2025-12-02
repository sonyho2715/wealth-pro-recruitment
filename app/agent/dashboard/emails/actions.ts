'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAgent } from '@/lib/auth';

const createEmailTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  category: z.string().min(1, 'Category is required'),
  isActive: z.boolean().optional().default(true),
});

const updateEmailTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  subject: z.string().min(1, 'Subject is required').optional(),
  body: z.string().min(1, 'Body is required').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  isActive: z.boolean().optional(),
});

export async function createEmailTemplate(formData: FormData) {
  try {
    await requireAgent();

    const validated = createEmailTemplateSchema.parse({
      name: formData.get('name'),
      subject: formData.get('subject'),
      body: formData.get('body'),
      category: formData.get('category'),
      isActive: formData.get('isActive') === 'true',
    });

    const template = await db.emailTemplate.create({
      data: validated,
    });

    revalidatePath('/agent/dashboard/emails');
    return { success: true, data: template };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input', details: error.errors };
    }

    console.error('Create email template error:', error);
    return { success: false, error: 'Failed to create email template' };
  }
}

export async function updateEmailTemplate(id: string, data: {
  name?: string;
  subject?: string;
  body?: string;
  category?: string;
  isActive?: boolean;
}) {
  try {
    await requireAgent();

    const validated = updateEmailTemplateSchema.parse(data);

    const existingTemplate = await db.emailTemplate.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      return { success: false, error: 'Template not found' };
    }

    const template = await db.emailTemplate.update({
      where: { id },
      data: validated,
    });

    revalidatePath('/agent/dashboard/emails');
    return { success: true, data: template };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input', details: error.errors };
    }

    console.error('Update email template error:', error);
    return { success: false, error: 'Failed to update email template' };
  }
}

export async function deleteEmailTemplate(id: string) {
  try {
    await requireAgent();

    const existingTemplate = await db.emailTemplate.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      return { success: false, error: 'Template not found' };
    }

    await db.emailTemplate.delete({
      where: { id },
    });

    revalidatePath('/agent/dashboard/emails');
    return { success: true };
  } catch (error) {
    console.error('Delete email template error:', error);
    return { success: false, error: 'Failed to delete email template' };
  }
}

export async function toggleEmailTemplateStatus(id: string) {
  try {
    await requireAgent();

    const existingTemplate = await db.emailTemplate.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      return { success: false, error: 'Template not found' };
    }

    const template = await db.emailTemplate.update({
      where: { id },
      data: {
        isActive: !existingTemplate.isActive,
      },
    });

    revalidatePath('/agent/dashboard/emails');
    return { success: true, data: template };
  } catch (error) {
    console.error('Toggle email template status error:', error);
    return { success: false, error: 'Failed to toggle template status' };
  }
}

export async function getEmailTemplates() {
  try {
    await requireAgent();

    const templates = await db.emailTemplate.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    return { success: true, data: templates };
  } catch (error) {
    console.error('Get email templates error:', error);
    return { success: false, error: 'Failed to fetch email templates', data: [] };
  }
}

export async function getProspectsForEmail() {
  try {
    await requireAgent();

    const prospects = await db.prospect.findMany({
      include: {
        financialProfile: {
          select: {
            protectionGap: true,
          },
        },
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    // Transform to include protectionGap at top level
    const transformedProspects = prospects.map(p => ({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email,
      protectionGap: p.financialProfile ? Number(p.financialProfile.protectionGap) : 0,
    }));

    return { success: true, data: transformedProspects };
  } catch (error) {
    console.error('Get prospects for email error:', error);
    return { success: false, error: 'Failed to fetch prospects', data: [] };
  }
}
