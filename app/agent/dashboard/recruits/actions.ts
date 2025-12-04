'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function createRecruit(formData: FormData) {
  const session = await getSession();
  if (!session.agentId) return { success: false, error: 'Unauthorized' };

  const agent = await db.agent.findUnique({
    where: { id: session.agentId },
    select: { organizationId: true },
  });

  if (!agent?.organizationId) {
    return { success: false, error: 'No organization found' };
  }

  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const codeNumber = formData.get('codeNumber') as string;
  const state = formData.get('state') as string;
  const fieldTrainerId = formData.get('fieldTrainerId') as string;
  const startDate = formData.get('startDate') as string;
  const notes = formData.get('notes') as string;

  try {
    const recruit = await db.recruit.create({
      data: {
        organizationId: agent.organizationId,
        recruiterId: session.agentId,
        firstName,
        lastName,
        phone,
        email: email || null,
        codeNumber: codeNumber || null,
        state: state || null,
        fieldTrainerId: fieldTrainerId || null,
        startDate: startDate ? new Date(startDate) : new Date(),
        notes: notes || null,
      },
    });

    revalidatePath('/agent/dashboard/recruits');
    return { success: true, data: recruit };
  } catch (error) {
    console.error('Error creating recruit:', error);
    return { success: false, error: 'Failed to create recruit' };
  }
}

export async function updateRecruit(id: string, formData: FormData) {
  const session = await getSession();
  if (!session.agentId) return { success: false, error: 'Unauthorized' };

  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const codeNumber = formData.get('codeNumber') as string;
  const state = formData.get('state') as string;
  const fieldTrainerId = formData.get('fieldTrainerId') as string;
  const status = formData.get('status') as string;
  const notes = formData.get('notes') as string;

  try {
    const recruit = await db.recruit.update({
      where: { id },
      data: {
        firstName,
        lastName,
        phone,
        email: email || null,
        codeNumber: codeNumber || null,
        state: state || null,
        fieldTrainerId: fieldTrainerId || null,
        status: status as any,
        notes: notes || null,
      },
    });

    revalidatePath('/agent/dashboard/recruits');
    return { success: true, data: recruit };
  } catch (error) {
    console.error('Error updating recruit:', error);
    return { success: false, error: 'Failed to update recruit' };
  }
}

export async function deleteRecruit(id: string) {
  const session = await getSession();
  if (!session.agentId) return { success: false, error: 'Unauthorized' };

  try {
    await db.recruit.delete({ where: { id } });
    revalidatePath('/agent/dashboard/recruits');
    return { success: true };
  } catch (error) {
    console.error('Error deleting recruit:', error);
    return { success: false, error: 'Failed to delete recruit' };
  }
}

export async function updateMilestone(
  recruitId: string,
  milestone: string,
  completed: boolean
) {
  const session = await getSession();
  if (!session.agentId) return { success: false, error: 'Unauthorized' };

  const milestoneMap: Record<string, { field: string; dateField: string }> = {
    meetSpouse: { field: 'meetSpouse', dateField: 'meetSpouseDate' },
    submitLic: { field: 'submitLic', dateField: 'submitLicDate' },
    prospectList: { field: 'prospectList', dateField: 'prospectListDate' },
    threeThreeThirty: { field: 'threeThreeThirty', dateField: 'threeThreeThirtyDate' },
    fna: { field: 'fna', dateField: 'fnaDate' },
    fastStartSchool: { field: 'fastStartSchool', dateField: 'fastStartSchoolDate' },
  };

  const mapping = milestoneMap[milestone];
  if (!mapping) {
    return { success: false, error: 'Invalid milestone' };
  }

  try {
    const updateData: any = {
      [mapping.field]: completed,
      [mapping.dateField]: completed ? new Date() : null,
    };

    const recruit = await db.recruit.update({
      where: { id: recruitId },
      data: updateData,
    });

    revalidatePath('/agent/dashboard/recruits');
    return { success: true, data: recruit };
  } catch (error) {
    console.error('Error updating milestone:', error);
    return { success: false, error: 'Failed to update milestone' };
  }
}

export async function updateLicensingProgress(
  recruitId: string,
  updates: {
    hoursCompleted?: number;
    examPassed?: boolean;
    examPassedDate?: Date | null;
    fingerprinting?: boolean;
    fingerprintDate?: Date | null;
    licenseIssued?: boolean;
    licenseIssuedDate?: Date | null;
    codeExpiryDate?: Date | null;
  }
) {
  const session = await getSession();
  if (!session.agentId) return { success: false, error: 'Unauthorized' };

  try {
    const recruit = await db.recruit.update({
      where: { id: recruitId },
      data: updates as any,
    });

    revalidatePath('/agent/dashboard/recruits');
    revalidatePath('/agent/dashboard/licensing');
    return { success: true, data: recruit };
  } catch (error) {
    console.error('Error updating licensing progress:', error);
    return { success: false, error: 'Failed to update licensing progress' };
  }
}

export async function updateRecruitStatus(id: string, status: string) {
  const session = await getSession();
  if (!session.agentId) return { success: false, error: 'Unauthorized' };

  try {
    const recruit = await db.recruit.update({
      where: { id },
      data: { status: status as any },
    });

    revalidatePath('/agent/dashboard/recruits');
    return { success: true, data: recruit };
  } catch (error) {
    console.error('Error updating recruit status:', error);
    return { success: false, error: 'Failed to update status' };
  }
}
