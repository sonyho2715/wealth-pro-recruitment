'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

// Twilio integration placeholder - would be configured per organization
async function sendTwilioSMS(to: string, body: string, org: { twilioAccountSid?: string | null; twilioAuthToken?: string | null; twilioPhoneNumber?: string | null }) {
  // In production, this would use Twilio SDK:
  // const client = twilio(org.twilioAccountSid, org.twilioAuthToken);
  // return await client.messages.create({ body, from: org.twilioPhoneNumber, to });

  // For now, return mock response
  console.log(`[SMS Placeholder] To: ${to}, Body: ${body}`);
  return { sid: `mock_${Date.now()}`, status: 'queued' };
}

const messageSchema = z.object({
  contactId: z.string().optional(),
  recipientPhone: z.string().min(10, 'Valid phone number required'),
  recipientName: z.string().optional(),
  content: z.string().min(1, 'Message content required'),
  type: z.enum(['SMS', 'EMAIL', 'WHATSAPP']).default('SMS'),
});

export async function sendMessage(formData: FormData) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const agent = await db.agent.findUnique({
      where: { id: session.agentId },
      include: {
        organization: true,
      },
    });

    // Check if SMS is enabled for this organization
    if (!agent?.organization?.smsEnabled) {
      return { success: false, error: 'SMS not enabled for your organization. Please upgrade your plan.' };
    }

    const rawData = {
      contactId: formData.get('contactId') || undefined,
      recipientPhone: formData.get('recipientPhone'),
      recipientName: formData.get('recipientName') || undefined,
      content: formData.get('content'),
      type: formData.get('type') || 'SMS',
    };

    const validated = messageSchema.parse(rawData);

    // Create message record first
    const message = await db.message.create({
      data: {
        organizationId: agent.organizationId!,
        agentId: session.agentId,
        contactId: validated.contactId || null,
        type: validated.type,
        direction: 'OUTBOUND',
        content: validated.content,
        recipientPhone: validated.recipientPhone,
        recipientName: validated.recipientName || null,
        status: 'PENDING',
      },
    });

    // Send via Twilio (or mock)
    try {
      const result = await sendTwilioSMS(validated.recipientPhone, validated.content, agent.organization);

      // Update message with Twilio SID and status
      await db.message.update({
        where: { id: message.id },
        data: {
          twilioSid: result.sid,
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      // Update contact's last contacted date if applicable
      if (validated.contactId) {
        await db.contact.update({
          where: { id: validated.contactId },
          data: { lastContactedAt: new Date() },
        });
      }

      revalidatePath('/agent/dashboard/messages');
      return { success: true, data: message };
    } catch (twilioError) {
      // Update message as failed
      await db.message.update({
        where: { id: message.id },
        data: {
          status: 'FAILED',
          errorMessage: String(twilioError),
        },
      });

      return { success: false, error: 'Failed to send message' };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input', details: error.errors };
    }
    console.error('Send message error:', error);
    return { success: false, error: 'Failed to send message' };
  }
}

export async function sendBulkMessages(contactIds: string[], content: string) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const agent = await db.agent.findUnique({
      where: { id: session.agentId },
      include: { organization: true },
    });

    if (!agent?.organization?.smsEnabled) {
      return { success: false, error: 'SMS not enabled for your organization' };
    }

    // Get contacts
    const contacts = await db.contact.findMany({
      where: {
        id: { in: contactIds },
        agentId: session.agentId,
        phone: { not: null },
      },
    });

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Send to each contact
    for (const contact of contacts) {
      if (!contact.phone) continue;

      try {
        const message = await db.message.create({
          data: {
            organizationId: agent.organizationId!,
            agentId: session.agentId,
            contactId: contact.id,
            type: 'SMS',
            direction: 'OUTBOUND',
            content,
            recipientPhone: contact.phone,
            recipientName: `${contact.firstName} ${contact.lastName}`,
            status: 'PENDING',
          },
        });

        const result = await sendTwilioSMS(contact.phone, content, agent.organization);

        await db.message.update({
          where: { id: message.id },
          data: {
            twilioSid: result.sid,
            status: 'SENT',
            sentAt: new Date(),
          },
        });

        await db.contact.update({
          where: { id: contact.id },
          data: { lastContactedAt: new Date() },
        });

        results.sent++;
      } catch (err) {
        results.failed++;
        results.errors.push(`${contact.firstName} ${contact.lastName}: ${String(err)}`);
      }
    }

    revalidatePath('/agent/dashboard/messages');
    revalidatePath('/agent/dashboard/contacts');
    return { success: true, data: results };
  } catch (error) {
    console.error('Bulk send error:', error);
    return { success: false, error: 'Failed to send bulk messages' };
  }
}

export async function getConversation(contactId: string) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const messages = await db.message.findMany({
      where: {
        contactId,
        agentId: session.agentId,
      },
      orderBy: { createdAt: 'asc' },
    });

    return { success: true, data: messages };
  } catch (error) {
    console.error('Get conversation error:', error);
    return { success: false, error: 'Failed to get conversation' };
  }
}

export async function deleteMessage(id: string) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    await db.message.delete({
      where: {
        id,
        agentId: session.agentId,
      },
    });

    revalidatePath('/agent/dashboard/messages');
    return { success: true };
  } catch (error) {
    console.error('Delete message error:', error);
    return { success: false, error: 'Failed to delete message' };
  }
}
