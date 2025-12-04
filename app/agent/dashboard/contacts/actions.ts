'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

// Validation schemas
const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  relationship: z.enum([
    'FAMILY', 'FRIEND', 'COWORKER', 'NEIGHBOR', 'CHURCH',
    'GYM', 'SOCIAL_MEDIA', 'REFERRAL', 'COLD_LEAD', 'OTHER'
  ]).optional(),
  temperature: z.enum([
    'COLD', 'WARMING', 'WARM', 'HOT', 'CONVERTED', 'NOT_INTERESTED'
  ]).default('COLD'),
  source: z.enum([
    'MANUAL', 'IMPORT', 'REFERRAL', 'WEBSITE', 'SOCIAL'
  ]).default('MANUAL'),
  referredById: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  birthday: z.string().optional(),
  occupation: z.string().optional(),
  company: z.string().optional(),
  nextFollowUpAt: z.string().optional(),
  followUpNotes: z.string().optional(),
});

export async function createContact(formData: FormData) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get agent's organization
    const agent = await db.agent.findUnique({
      where: { id: session.agentId },
      select: { organizationId: true },
    });

    // Parse and validate
    const rawData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      phone: formData.get('phone') || undefined,
      email: formData.get('email') || undefined,
      relationship: formData.get('relationship') || undefined,
      temperature: formData.get('temperature') || 'COLD',
      source: formData.get('source') || 'MANUAL',
      referredById: formData.get('referredById') || undefined,
      notes: formData.get('notes') || undefined,
      tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [],
      birthday: formData.get('birthday') || undefined,
      occupation: formData.get('occupation') || undefined,
      company: formData.get('company') || undefined,
      nextFollowUpAt: formData.get('nextFollowUpAt') || undefined,
      followUpNotes: formData.get('followUpNotes') || undefined,
    };

    const validated = contactSchema.parse(rawData);

    // Create contact (require organizationId for multi-tenant)
    if (!agent?.organizationId) {
      // For backwards compatibility, create without organization if agent doesn't have one
      const contact = await db.contact.create({
        data: {
          ...validated,
          email: validated.email || null,
          phone: validated.phone || null,
          agentId: session.agentId,
          organizationId: '', // Will need to handle this properly in production
          birthday: validated.birthday ? new Date(validated.birthday) : null,
          nextFollowUpAt: validated.nextFollowUpAt ? new Date(validated.nextFollowUpAt) : null,
        },
      });

      revalidatePath('/agent/dashboard/contacts');
      return { success: true, data: contact };
    }

    const contact = await db.contact.create({
      data: {
        ...validated,
        email: validated.email || null,
        phone: validated.phone || null,
        agentId: session.agentId,
        organizationId: agent.organizationId,
        birthday: validated.birthday ? new Date(validated.birthday) : null,
        nextFollowUpAt: validated.nextFollowUpAt ? new Date(validated.nextFollowUpAt) : null,
      },
    });

    revalidatePath('/agent/dashboard/contacts');
    return { success: true, data: contact };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input', details: error.errors };
    }
    console.error('Create contact error:', error);
    return { success: false, error: 'Failed to create contact' };
  }
}

export async function updateContact(id: string, formData: FormData) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const existing = await db.contact.findFirst({
      where: { id, agentId: session.agentId },
    });

    if (!existing) {
      return { success: false, error: 'Contact not found' };
    }

    const rawData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      phone: formData.get('phone') || undefined,
      email: formData.get('email') || undefined,
      relationship: formData.get('relationship') || undefined,
      temperature: formData.get('temperature') || 'COLD',
      source: formData.get('source') || 'MANUAL',
      referredById: formData.get('referredById') || undefined,
      notes: formData.get('notes') || undefined,
      tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [],
      birthday: formData.get('birthday') || undefined,
      occupation: formData.get('occupation') || undefined,
      company: formData.get('company') || undefined,
      nextFollowUpAt: formData.get('nextFollowUpAt') || undefined,
      followUpNotes: formData.get('followUpNotes') || undefined,
    };

    const validated = contactSchema.parse(rawData);

    const contact = await db.contact.update({
      where: { id },
      data: {
        ...validated,
        email: validated.email || null,
        phone: validated.phone || null,
        birthday: validated.birthday ? new Date(validated.birthday) : null,
        nextFollowUpAt: validated.nextFollowUpAt ? new Date(validated.nextFollowUpAt) : null,
      },
    });

    revalidatePath('/agent/dashboard/contacts');
    return { success: true, data: contact };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input', details: error.errors };
    }
    console.error('Update contact error:', error);
    return { success: false, error: 'Failed to update contact' };
  }
}

export async function updateContactTemperature(id: string, temperature: string) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const existing = await db.contact.findFirst({
      where: { id, agentId: session.agentId },
    });

    if (!existing) {
      return { success: false, error: 'Contact not found' };
    }

    const contact = await db.contact.update({
      where: { id },
      data: {
        temperature: temperature as 'COLD' | 'WARMING' | 'WARM' | 'HOT' | 'CONVERTED' | 'NOT_INTERESTED',
        lastContactedAt: new Date(),
      },
    });

    revalidatePath('/agent/dashboard/contacts');
    return { success: true, data: contact };
  } catch (error) {
    console.error('Update temperature error:', error);
    return { success: false, error: 'Failed to update temperature' };
  }
}

export async function deleteContact(id: string) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const existing = await db.contact.findFirst({
      where: { id, agentId: session.agentId },
    });

    if (!existing) {
      return { success: false, error: 'Contact not found' };
    }

    await db.contact.delete({
      where: { id },
    });

    revalidatePath('/agent/dashboard/contacts');
    return { success: true };
  } catch (error) {
    console.error('Delete contact error:', error);
    return { success: false, error: 'Failed to delete contact' };
  }
}

export async function convertToProspect(contactId: string) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get contact
    const contact = await db.contact.findFirst({
      where: { id: contactId, agentId: session.agentId },
    });

    if (!contact) {
      return { success: false, error: 'Contact not found' };
    }

    if (contact.prospectId) {
      return { success: false, error: 'Contact already converted to prospect' };
    }

    // Create prospect from contact
    const prospect = await db.prospect.create({
      data: {
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email || `${contact.firstName.toLowerCase()}.${contact.lastName.toLowerCase()}@placeholder.com`,
        phone: contact.phone,
        agentId: session.agentId,
        status: 'LEAD',
        stage: 'NEW',
      },
    });

    // Update contact with prospect link
    await db.contact.update({
      where: { id: contactId },
      data: {
        prospectId: prospect.id,
        temperature: 'CONVERTED',
        convertedAt: new Date(),
      },
    });

    revalidatePath('/agent/dashboard/contacts');
    revalidatePath('/agent/dashboard/prospects');
    return { success: true, data: { prospect, contact } };
  } catch (error) {
    console.error('Convert to prospect error:', error);
    return { success: false, error: 'Failed to convert to prospect' };
  }
}

export async function logContactInteraction(contactId: string, notes: string) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const contact = await db.contact.update({
      where: { id: contactId },
      data: {
        lastContactedAt: new Date(),
        notes: notes || undefined,
      },
    });

    revalidatePath('/agent/dashboard/contacts');
    return { success: true, data: contact };
  } catch (error) {
    console.error('Log interaction error:', error);
    return { success: false, error: 'Failed to log interaction' };
  }
}

export async function scheduleFollowUp(contactId: string, date: string, notes?: string) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const contact = await db.contact.update({
      where: { id: contactId },
      data: {
        nextFollowUpAt: new Date(date),
        followUpNotes: notes || undefined,
      },
    });

    revalidatePath('/agent/dashboard/contacts');
    return { success: true, data: contact };
  } catch (error) {
    console.error('Schedule follow-up error:', error);
    return { success: false, error: 'Failed to schedule follow-up' };
  }
}
