'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function updateAgentSettings(data: {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  licenseNumber?: string | null;
  monthlyGoal?: number | null;
}) {
  try {
    const session = await getSession();
    if (!session.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    await db.agent.update({
      where: { id: session.agentId },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.licenseNumber !== undefined && { licenseNumber: data.licenseNumber }),
        ...(data.monthlyGoal !== undefined && { monthlyGoal: data.monthlyGoal }),
      },
    });

    revalidatePath('/agent/dashboard');
    revalidatePath('/agent/dashboard/settings');
    return { success: true };
  } catch (error) {
    console.error('Update agent settings error:', error);
    return { success: false, error: 'Failed to update settings' };
  }
}

export async function updateAgentPassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  try {
    const session = await getSession();
    if (!session.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const agent = await db.agent.findUnique({
      where: { id: session.agentId },
      select: { passwordHash: true },
    });

    if (!agent) {
      return { success: false, error: 'Agent not found' };
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(data.currentPassword, agent.passwordHash);
    if (!isValidPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(data.newPassword, 12);

    await db.agent.update({
      where: { id: session.agentId },
      data: { passwordHash: newPasswordHash },
    });

    return { success: true };
  } catch (error) {
    console.error('Update password error:', error);
    return { success: false, error: 'Failed to update password' };
  }
}
