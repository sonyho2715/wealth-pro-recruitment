'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function createProduction(formData: FormData) {
  const session = await getSession();
  if (!session.agentId) return { success: false, error: 'Unauthorized' };

  const agent = await db.agent.findUnique({
    where: { id: session.agentId },
    select: { organizationId: true },
  });

  if (!agent?.organizationId) {
    return { success: false, error: 'No organization found' };
  }

  const writingAgentId = formData.get('writingAgentId') as string || session.agentId;
  const traineeId = formData.get('traineeId') as string;
  const isTrainee = formData.get('isTrainee') === 'true';
  const clientName = formData.get('clientName') as string;
  const clientPhone = formData.get('clientPhone') as string;
  const clientEmail = formData.get('clientEmail') as string;
  const provider = formData.get('provider') as string;
  const product = formData.get('product') as string;
  const productType = formData.get('productType') as string;
  const policyNumber = formData.get('policyNumber') as string;
  const description = formData.get('description') as string;
  const totalPoints = parseFloat(formData.get('totalPoints') as string) || 0;
  const baseshopPoints = parseFloat(formData.get('baseshopPoints') as string) || 0;
  const premium = parseFloat(formData.get('premium') as string) || null;
  const splitRatio = parseInt(formData.get('splitRatio') as string) || 100;
  const writtenDate = formData.get('writtenDate') as string;
  const dropDate = formData.get('dropDate') as string;
  const notes = formData.get('notes') as string;

  try {
    const production = await db.production.create({
      data: {
        organizationId: agent.organizationId,
        writingAgentId,
        traineeId: traineeId || null,
        isTrainee,
        clientName,
        clientPhone: clientPhone || null,
        clientEmail: clientEmail || null,
        provider: provider || null,
        product: product || null,
        productType: productType as any || null,
        policyNumber: policyNumber || null,
        description: description || null,
        totalPoints,
        baseshopPoints,
        premium,
        splitRatio,
        writtenDate: writtenDate ? new Date(writtenDate) : new Date(),
        dropDate: dropDate ? new Date(dropDate) : null,
        notes: notes || null,
      },
    });

    revalidatePath('/agent/dashboard/production');
    return { success: true, data: production };
  } catch (error) {
    console.error('Error creating production:', error);
    return { success: false, error: 'Failed to create production' };
  }
}

export async function updateProduction(id: string, formData: FormData) {
  const session = await getSession();
  if (!session.agentId) return { success: false, error: 'Unauthorized' };

  const writingAgentId = formData.get('writingAgentId') as string;
  const traineeId = formData.get('traineeId') as string;
  const isTrainee = formData.get('isTrainee') === 'true';
  const clientName = formData.get('clientName') as string;
  const clientPhone = formData.get('clientPhone') as string;
  const clientEmail = formData.get('clientEmail') as string;
  const provider = formData.get('provider') as string;
  const product = formData.get('product') as string;
  const productType = formData.get('productType') as string;
  const policyNumber = formData.get('policyNumber') as string;
  const description = formData.get('description') as string;
  const totalPoints = parseFloat(formData.get('totalPoints') as string) || 0;
  const baseshopPoints = parseFloat(formData.get('baseshopPoints') as string) || 0;
  const premium = parseFloat(formData.get('premium') as string) || null;
  const splitRatio = parseInt(formData.get('splitRatio') as string) || 100;
  const writtenDate = formData.get('writtenDate') as string;
  const dropDate = formData.get('dropDate') as string;
  const status = formData.get('status') as string;
  const notes = formData.get('notes') as string;

  try {
    const production = await db.production.update({
      where: { id },
      data: {
        writingAgentId,
        traineeId: traineeId || null,
        isTrainee,
        clientName,
        clientPhone: clientPhone || null,
        clientEmail: clientEmail || null,
        provider: provider || null,
        product: product || null,
        productType: productType as any || null,
        policyNumber: policyNumber || null,
        description: description || null,
        totalPoints,
        baseshopPoints,
        premium,
        splitRatio,
        writtenDate: writtenDate ? new Date(writtenDate) : new Date(),
        dropDate: dropDate ? new Date(dropDate) : null,
        status: status as any,
        notes: notes || null,
      },
    });

    revalidatePath('/agent/dashboard/production');
    return { success: true, data: production };
  } catch (error) {
    console.error('Error updating production:', error);
    return { success: false, error: 'Failed to update production' };
  }
}

export async function deleteProduction(id: string) {
  const session = await getSession();
  if (!session.agentId) return { success: false, error: 'Unauthorized' };

  try {
    await db.production.delete({ where: { id } });
    revalidatePath('/agent/dashboard/production');
    return { success: true };
  } catch (error) {
    console.error('Error deleting production:', error);
    return { success: false, error: 'Failed to delete production' };
  }
}

export async function updateProductionStatus(id: string, status: string) {
  const session = await getSession();
  if (!session.agentId) return { success: false, error: 'Unauthorized' };

  try {
    const production = await db.production.update({
      where: { id },
      data: { status: status as any },
    });

    revalidatePath('/agent/dashboard/production');
    return { success: true, data: production };
  } catch (error) {
    console.error('Error updating production status:', error);
    return { success: false, error: 'Failed to update status' };
  }
}

export async function updatePersistency(
  id: string,
  updates: {
    advPaid?: boolean;
    pd1Paid?: boolean;
    pd2Paid?: boolean;
  }
) {
  const session = await getSession();
  if (!session.agentId) return { success: false, error: 'Unauthorized' };

  try {
    const production = await db.production.update({
      where: { id },
      data: updates,
    });

    revalidatePath('/agent/dashboard/production');
    return { success: true, data: production };
  } catch (error) {
    console.error('Error updating persistency:', error);
    return { success: false, error: 'Failed to update persistency' };
  }
}
