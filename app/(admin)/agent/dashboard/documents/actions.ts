'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { DocumentType } from '@prisma/client';

const uploadSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  type: z.nativeEnum(DocumentType),
  prospectId: z.string().optional(),
  url: z.string().min(1, 'File URL is required'),
  size: z.number().int().positive(),
});

export async function uploadDocument(formData: FormData) {
  try {
    const session = await getSession();
    if (!session.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = uploadSchema.parse({
      name: formData.get('name'),
      type: formData.get('type'),
      prospectId: formData.get('prospectId') || undefined,
      url: formData.get('url'),
      size: Number(formData.get('size')),
    });

    const document = await db.document.create({
      data: {
        ...validated,
        agentId: session.agentId,
      },
    });

    revalidatePath('/agent/dashboard/documents');
    return { success: true, data: document };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input', details: error.errors };
    }

    console.error('Upload Document Error:', error);
    return { success: false, error: 'Failed to upload document' };
  }
}

export async function deleteDocument(id: string) {
  try {
    const session = await getSession();
    if (!session.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify document belongs to agent
    const document = await db.document.findFirst({
      where: { id, agentId: session.agentId },
    });

    if (!document) {
      return { success: false, error: 'Document not found' };
    }

    await db.document.delete({ where: { id } });

    revalidatePath('/agent/dashboard/documents');
    return { success: true };
  } catch (error) {
    console.error('Delete Document Error:', error);
    return { success: false, error: 'Failed to delete document' };
  }
}
