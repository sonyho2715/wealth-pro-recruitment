'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function createBPM(formData: FormData) {
  const session = await getSession();
  if (!session.agentId) return { success: false, error: 'Unauthorized' };

  const agent = await db.agent.findUnique({
    where: { id: session.agentId },
    select: { organizationId: true },
  });

  if (!agent?.organizationId) {
    return { success: false, error: 'No organization found' };
  }

  const name = formData.get('name') as string;
  const date = formData.get('date') as string;
  const location = formData.get('location') as string;
  const address = formData.get('address') as string;
  const isVirtual = formData.get('isVirtual') === 'true';
  const virtualLink = formData.get('virtualLink') as string;
  const inviteGoal = parseInt(formData.get('inviteGoal') as string) || 10;
  const attendanceGoal = parseInt(formData.get('attendanceGoal') as string) || 5;

  try {
    const bpm = await db.bPM.create({
      data: {
        organizationId: agent.organizationId,
        name,
        date: new Date(date),
        location: location || null,
        address: address || null,
        isVirtual,
        virtualLink: virtualLink || null,
        inviteGoal,
        attendanceGoal,
      },
    });

    revalidatePath('/agent/dashboard');
    revalidatePath('/agent/dashboard/events');
    return { success: true, data: bpm };
  } catch (error) {
    console.error('Error creating BPM:', error);
    return { success: false, error: 'Failed to create event' };
  }
}

export async function updateBPM(id: string, formData: FormData) {
  const session = await getSession();
  if (!session.agentId) return { success: false, error: 'Unauthorized' };

  const name = formData.get('name') as string;
  const date = formData.get('date') as string;
  const location = formData.get('location') as string;
  const address = formData.get('address') as string;
  const isVirtual = formData.get('isVirtual') === 'true';
  const virtualLink = formData.get('virtualLink') as string;
  const inviteGoal = parseInt(formData.get('inviteGoal') as string) || 10;
  const attendanceGoal = parseInt(formData.get('attendanceGoal') as string) || 5;
  const status = formData.get('status') as string;

  try {
    const bpm = await db.bPM.update({
      where: { id },
      data: {
        name,
        date: new Date(date),
        location: location || null,
        address: address || null,
        isVirtual,
        virtualLink: virtualLink || null,
        inviteGoal,
        attendanceGoal,
        status: status as any,
      },
    });

    revalidatePath('/agent/dashboard');
    revalidatePath('/agent/dashboard/events');
    revalidatePath(`/agent/dashboard/events/${id}`);
    return { success: true, data: bpm };
  } catch (error) {
    console.error('Error updating BPM:', error);
    return { success: false, error: 'Failed to update event' };
  }
}

export async function deleteBPM(id: string) {
  const session = await getSession();
  if (!session.agentId) return { success: false, error: 'Unauthorized' };

  try {
    await db.bPM.delete({ where: { id } });
    revalidatePath('/agent/dashboard');
    revalidatePath('/agent/dashboard/events');
    return { success: true };
  } catch (error) {
    console.error('Error deleting BPM:', error);
    return { success: false, error: 'Failed to delete event' };
  }
}

export async function addGuest(bpmId: string, formData: FormData) {
  const session = await getSession();
  if (!session.agentId) return { success: false, error: 'Unauthorized' };

  const guestName = formData.get('guestName') as string;
  const guestPhone = formData.get('guestPhone') as string;
  const guestEmail = formData.get('guestEmail') as string;
  const contactId = formData.get('contactId') as string;
  const notes = formData.get('notes') as string;

  try {
    const guest = await db.bPMGuest.create({
      data: {
        bpmId,
        inviterId: session.agentId,
        guestName,
        guestPhone: guestPhone || null,
        guestEmail: guestEmail || null,
        contactId: contactId || null,
        notes: notes || null,
      },
    });

    revalidatePath('/agent/dashboard');
    revalidatePath('/agent/dashboard/events');
    revalidatePath(`/agent/dashboard/events/${bpmId}`);
    return { success: true, data: guest };
  } catch (error) {
    console.error('Error adding guest:', error);
    return { success: false, error: 'Failed to add guest' };
  }
}

export async function updateGuestStatus(
  guestId: string,
  updates: {
    status?: string;
    arrived?: boolean;
    arrivedAt?: Date | null;
    confirmedAt?: Date | null;
    isClient?: boolean;
    isRecruit?: boolean;
    rescheduled?: boolean;
    notInterested?: boolean;
    leftMessage?: boolean;
    notes?: string;
  }
) {
  const session = await getSession();
  if (!session.agentId) return { success: false, error: 'Unauthorized' };

  try {
    const guest = await db.bPMGuest.update({
      where: { id: guestId },
      data: updates as any,
    });

    revalidatePath('/agent/dashboard');
    revalidatePath('/agent/dashboard/events');
    return { success: true, data: guest };
  } catch (error) {
    console.error('Error updating guest:', error);
    return { success: false, error: 'Failed to update guest' };
  }
}

export async function checkInGuest(guestId: string) {
  const session = await getSession();
  if (!session.agentId) return { success: false, error: 'Unauthorized' };

  try {
    const guest = await db.bPMGuest.update({
      where: { id: guestId },
      data: {
        status: 'ARRIVED',
        arrived: true,
        arrivedAt: new Date(),
      },
    });

    revalidatePath('/agent/dashboard');
    revalidatePath('/agent/dashboard/events');
    return { success: true, data: guest };
  } catch (error) {
    console.error('Error checking in guest:', error);
    return { success: false, error: 'Failed to check in guest' };
  }
}

export async function deleteGuest(guestId: string) {
  const session = await getSession();
  if (!session.agentId) return { success: false, error: 'Unauthorized' };

  try {
    const guest = await db.bPMGuest.findUnique({
      where: { id: guestId },
      select: { bpmId: true },
    });

    await db.bPMGuest.delete({ where: { id: guestId } });

    if (guest) {
      revalidatePath(`/agent/dashboard/events/${guest.bpmId}`);
    }
    revalidatePath('/agent/dashboard');
    revalidatePath('/agent/dashboard/events');
    return { success: true };
  } catch (error) {
    console.error('Error deleting guest:', error);
    return { success: false, error: 'Failed to delete guest' };
  }
}

export async function updateBPMStatus(id: string, status: string) {
  const session = await getSession();
  if (!session.agentId) return { success: false, error: 'Unauthorized' };

  try {
    const bpm = await db.bPM.update({
      where: { id },
      data: { status: status as any },
    });

    revalidatePath('/agent/dashboard');
    revalidatePath('/agent/dashboard/events');
    revalidatePath(`/agent/dashboard/events/${id}`);
    return { success: true, data: bpm };
  } catch (error) {
    console.error('Error updating BPM status:', error);
    return { success: false, error: 'Failed to update status' };
  }
}
