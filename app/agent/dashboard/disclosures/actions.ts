'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import crypto from 'crypto';

const createDisclosureSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  requiredFor: z.array(z.enum(['PROSPECT_INTAKE', 'BEFORE_PRESENTATION', 'BEFORE_APPLICATION', 'AGENT_ONBOARDING', 'ANNUAL_COMPLIANCE'])).optional(),
  requiresSignature: z.boolean().optional(),
});

const updateDisclosureSchema = createDisclosureSchema.partial();

export async function createDisclosure(formData: FormData) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const agent = await db.agent.findUnique({
      where: { id: session.agentId },
      select: { organizationId: true },
    });

    const requiredForRaw = formData.get('requiredFor');
    let requiredFor: string[] = [];
    if (requiredForRaw) {
      requiredFor = (requiredForRaw as string).split(',').filter(Boolean);
    }

    const validated = createDisclosureSchema.parse({
      title: formData.get('title'),
      description: formData.get('description') || undefined,
      content: formData.get('content'),
      requiredFor: requiredFor.length > 0 ? requiredFor : undefined,
      requiresSignature: formData.get('requiresSignature') === 'true',
    });

    const disclosure = await db.disclosure.create({
      data: {
        title: validated.title,
        description: validated.description,
        content: validated.content,
        requiredFor: validated.requiredFor || [],
        requiresSignature: validated.requiresSignature ?? true,
        organizationId: agent?.organizationId || undefined,
        version: 1,
      },
    });

    revalidatePath('/agent/dashboard/disclosures');
    return { success: true, data: disclosure };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input', details: error.errors };
    }
    console.error('Create disclosure error:', error);
    return { success: false, error: 'Failed to create disclosure' };
  }
}

export async function updateDisclosure(id: string, formData: FormData) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const agent = await db.agent.findUnique({
      where: { id: session.agentId },
      select: { organizationId: true },
    });

    const existing = await db.disclosure.findFirst({
      where: {
        id,
        OR: [
          { organizationId: agent?.organizationId },
          { organizationId: null },
        ],
      },
    });

    if (!existing) {
      return { success: false, error: 'Disclosure not found' };
    }

    const requiredForRaw = formData.get('requiredFor');
    let requiredFor: string[] | undefined;
    if (requiredForRaw) {
      requiredFor = (requiredForRaw as string).split(',').filter(Boolean);
    }

    const validated = updateDisclosureSchema.parse({
      title: formData.get('title') || undefined,
      description: formData.get('description') || undefined,
      content: formData.get('content') || undefined,
      requiredFor: requiredFor,
      requiresSignature: formData.get('requiresSignature') ? formData.get('requiresSignature') === 'true' : undefined,
    });

    // If content changed, increment version
    const newVersion = validated.content && validated.content !== existing.content
      ? existing.version + 1
      : existing.version;

    const disclosure = await db.disclosure.update({
      where: { id },
      data: {
        ...validated,
        version: newVersion,
      },
    });

    revalidatePath('/agent/dashboard/disclosures');
    return { success: true, data: disclosure };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input', details: error.errors };
    }
    console.error('Update disclosure error:', error);
    return { success: false, error: 'Failed to update disclosure' };
  }
}

export async function deleteDisclosure(id: string) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const agent = await db.agent.findUnique({
      where: { id: session.agentId },
      select: { organizationId: true },
    });

    const disclosure = await db.disclosure.findFirst({
      where: {
        id,
        OR: [
          { organizationId: agent?.organizationId },
          { organizationId: null },
        ],
      },
      include: { _count: { select: { signatures: true } } },
    });

    if (!disclosure) {
      return { success: false, error: 'Disclosure not found' };
    }

    if (disclosure._count.signatures > 0) {
      // Soft delete - mark as inactive instead
      await db.disclosure.update({
        where: { id },
        data: { isActive: false },
      });
    } else {
      await db.disclosure.delete({ where: { id } });
    }

    revalidatePath('/agent/dashboard/disclosures');
    return { success: true };
  } catch (error) {
    console.error('Delete disclosure error:', error);
    return { success: false, error: 'Failed to delete disclosure' };
  }
}

export async function toggleDisclosureActive(id: string) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const agent = await db.agent.findUnique({
      where: { id: session.agentId },
      select: { organizationId: true },
    });

    const disclosure = await db.disclosure.findFirst({
      where: {
        id,
        OR: [
          { organizationId: agent?.organizationId },
          { organizationId: null },
        ],
      },
    });

    if (!disclosure) {
      return { success: false, error: 'Disclosure not found' };
    }

    await db.disclosure.update({
      where: { id },
      data: { isActive: !disclosure.isActive },
    });

    revalidatePath('/agent/dashboard/disclosures');
    return { success: true };
  } catch (error) {
    console.error('Toggle disclosure error:', error);
    return { success: false, error: 'Failed to toggle disclosure' };
  }
}

// Generate a signing link for a prospect
export async function generateSigningLink(disclosureIds: string[], prospectId: string) {
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
        ],
      },
    });

    if (!prospect) {
      return { success: false, error: 'Prospect not found' };
    }

    // Create a unique signing token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Link valid for 7 days

    // Store signing request data
    const signingData = {
      prospectId,
      disclosureIds,
      agentId: session.agentId,
      token,
      expiresAt: expiresAt.toISOString(),
    };

    // Base64 encode the data (in production, store in DB and use just the token)
    const encodedData = Buffer.from(JSON.stringify(signingData)).toString('base64url');

    const signingUrl = `/sign/${encodedData}`;

    return { success: true, data: { url: signingUrl, expiresAt } };
  } catch (error) {
    console.error('Generate signing link error:', error);
    return { success: false, error: 'Failed to generate signing link' };
  }
}

// Submit a signature
export async function submitSignature(
  disclosureId: string,
  prospectId: string,
  signatureData: string,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    const disclosure = await db.disclosure.findUnique({
      where: { id: disclosureId },
    });

    if (!disclosure) {
      return { success: false, error: 'Disclosure not found' };
    }

    // Get prospect info for signature record
    const prospect = await db.prospect.findUnique({
      where: { id: prospectId },
      select: { firstName: true, lastName: true, email: true },
    });

    if (!prospect) {
      return { success: false, error: 'Prospect not found' };
    }

    // Check if already signed this version
    const existingSignature = await db.disclosureSignature.findFirst({
      where: {
        disclosureId,
        signerId: prospectId,
        disclosureVersion: disclosure.version,
      },
    });

    if (existingSignature) {
      return { success: false, error: 'Already signed this version' };
    }

    const signature = await db.disclosureSignature.create({
      data: {
        disclosureId,
        signerType: 'PROSPECT',
        signerId: prospectId,
        signerName: `${prospect.firstName} ${prospect.lastName}`,
        signerEmail: prospect.email,
        signatureData,
        signatureType: 'DRAWN',
        disclosureVersion: disclosure.version,
        disclosureContent: disclosure.content, // Snapshot of content at time of signing
        ipAddress: ipAddress || 'unknown',
        userAgent: userAgent || 'unknown',
      },
    });

    return { success: true, data: signature };
  } catch (error) {
    console.error('Submit signature error:', error);
    return { success: false, error: 'Failed to submit signature' };
  }
}

// Get signatures for a prospect
export async function getProspectSignatures(prospectId: string) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const signatures = await db.disclosureSignature.findMany({
      where: { signerId: prospectId, signerType: 'PROSPECT' },
      include: {
        disclosure: {
          select: {
            title: true,
            requiredFor: true,
            version: true,
          },
        },
      },
      orderBy: { signedAt: 'desc' },
    });

    return { success: true, data: signatures };
  } catch (error) {
    console.error('Get signatures error:', error);
    return { success: false, error: 'Failed to get signatures' };
  }
}

// Get pending disclosures for a prospect
export async function getPendingDisclosures(prospectId: string) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const agent = await db.agent.findUnique({
      where: { id: session.agentId },
      select: { organizationId: true },
    });

    // Get all active disclosures for this org
    const disclosures = await db.disclosure.findMany({
      where: {
        isActive: true,
        OR: [
          { organizationId: agent?.organizationId },
          { organizationId: null },
        ],
      },
    });

    // Get already signed disclosures
    const signatures = await db.disclosureSignature.findMany({
      where: { signerId: prospectId, signerType: 'PROSPECT' },
      select: { disclosureId: true, disclosureVersion: true },
    });

    const signedMap = new Map(signatures.map(s => [`${s.disclosureId}-${s.disclosureVersion}`, true]));

    // Filter to only pending ones
    const pending = disclosures.filter(d => !signedMap.has(`${d.id}-${d.version}`));

    return { success: true, data: pending };
  } catch (error) {
    console.error('Get pending disclosures error:', error);
    return { success: false, error: 'Failed to get pending disclosures' };
  }
}

// Send disclosure request via SMS/Email
export async function sendDisclosureRequest(prospectId: string, disclosureIds: string[], method: 'sms' | 'email') {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const agent = await db.agent.findUnique({
      where: { id: session.agentId },
      select: { organizationId: true },
    });

    if (!agent?.organizationId) {
      return { success: false, error: 'Agent organization not found' };
    }

    const prospect = await db.prospect.findFirst({
      where: {
        id: prospectId,
        OR: [
          { agentId: session.agentId },
          { agentId: null },
        ],
      },
    });

    if (!prospect) {
      return { success: false, error: 'Prospect not found' };
    }

    // Generate signing link
    const linkResult = await generateSigningLink(disclosureIds, prospectId);
    if (!linkResult.success || !linkResult.data) {
      return linkResult;
    }

    const fullUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${linkResult.data.url}`;

    if (method === 'sms') {
      // Create SMS message
      await db.message.create({
        data: {
          organizationId: agent.organizationId,
          agentId: session.agentId,
          type: 'SMS',
          direction: 'OUTBOUND',
          content: `Hi ${prospect.firstName}, please review and sign the required documents: ${fullUrl}`,
          recipientPhone: prospect.phone,
          recipientName: `${prospect.firstName} ${prospect.lastName}`,
          status: 'SENT',
          sentAt: new Date(),
        },
      });
      // In production, integrate with Twilio here
    } else {
      // Create email message
      await db.message.create({
        data: {
          organizationId: agent.organizationId,
          agentId: session.agentId,
          type: 'EMAIL',
          direction: 'OUTBOUND',
          content: `Hi ${prospect.firstName},\n\nPlease review and sign the required documents by clicking the link below:\n\n${fullUrl}\n\nThis link will expire in 7 days.\n\nThank you!`,
          recipientEmail: prospect.email,
          recipientName: `${prospect.firstName} ${prospect.lastName}`,
          status: 'SENT',
          sentAt: new Date(),
        },
      });
      // In production, integrate with email service here
    }

    revalidatePath('/agent/dashboard/messages');
    return { success: true, data: { url: linkResult.data.url } };
  } catch (error) {
    console.error('Send disclosure request error:', error);
    return { success: false, error: 'Failed to send disclosure request' };
  }
}
