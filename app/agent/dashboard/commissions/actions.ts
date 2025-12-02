'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAgent } from '@/lib/auth';
import { db } from '@/lib/db';
import { CommissionStatus } from '@prisma/client';

const createCommissionSchema = z.object({
  prospectId: z.string().optional(),
  productType: z.string().min(1, 'Product type is required'),
  policyNumber: z.string().optional(),
  amount: z.string().min(1, 'Amount is required'),
  earnedDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function createCommission(formData: FormData) {
  try {
    const session = await requireAgent();

    const validated = createCommissionSchema.parse({
      prospectId: formData.get('prospectId') || undefined,
      productType: formData.get('productType'),
      policyNumber: formData.get('policyNumber') || undefined,
      amount: formData.get('amount'),
      earnedDate: formData.get('earnedDate') || undefined,
      notes: formData.get('notes') || undefined,
    });

    const commission = await db.commission.create({
      data: {
        agentId: session.agentId!,
        prospectId: validated.prospectId || null,
        productType: validated.productType,
        policyNumber: validated.policyNumber || null,
        amount: parseFloat(validated.amount),
        earnedDate: validated.earnedDate ? new Date(validated.earnedDate) : null,
        notes: validated.notes || null,
        status: 'PENDING',
      },
      include: {
        prospect: true,
      },
    });

    revalidatePath('/agent/dashboard/commissions');
    return { success: true, data: commission };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input', details: error.errors };
    }

    console.error('Create Commission Error:', error);
    return { success: false, error: 'Failed to create commission' };
  }
}

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'PAID', 'CHARGEBACK']),
});

export async function updateCommissionStatus(commissionId: string, formData: FormData) {
  try {
    const session = await requireAgent();

    const validated = updateStatusSchema.parse({
      status: formData.get('status'),
    });

    // Verify the commission belongs to this agent
    const existingCommission = await db.commission.findFirst({
      where: {
        id: commissionId,
        agentId: session.agentId!,
      },
    });

    if (!existingCommission) {
      return { success: false, error: 'Commission not found' };
    }

    // Set paidDate when status is changed to PAID
    const paidDate = validated.status === 'PAID'
      ? new Date()
      : validated.status === 'PENDING' || validated.status === 'APPROVED'
      ? null
      : existingCommission.paidDate;

    const commission = await db.commission.update({
      where: { id: commissionId },
      data: {
        status: validated.status as CommissionStatus,
        paidDate,
      },
      include: {
        prospect: true,
      },
    });

    revalidatePath('/agent/dashboard/commissions');
    return { success: true, data: commission };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input', details: error.errors };
    }

    console.error('Update Commission Status Error:', error);
    return { success: false, error: 'Failed to update commission status' };
  }
}

export async function deleteCommission(commissionId: string) {
  try {
    const session = await requireAgent();

    // Verify the commission belongs to this agent
    const existingCommission = await db.commission.findFirst({
      where: {
        id: commissionId,
        agentId: session.agentId!,
      },
    });

    if (!existingCommission) {
      return { success: false, error: 'Commission not found' };
    }

    await db.commission.delete({
      where: { id: commissionId },
    });

    revalidatePath('/agent/dashboard/commissions');
    return { success: true };
  } catch (error) {
    console.error('Delete Commission Error:', error);
    return { success: false, error: 'Failed to delete commission' };
  }
}
