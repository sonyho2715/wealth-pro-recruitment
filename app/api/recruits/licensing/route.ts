import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.agentId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { recruitId, field, value } = body;

    if (!recruitId || !field) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the recruit belongs to the agent's organization
    const agent = await db.agent.findUnique({
      where: { id: session.agentId },
      select: { organizationId: true },
    });

    if (!agent?.organizationId) {
      return NextResponse.json(
        { success: false, error: 'No organization found' },
        { status: 403 }
      );
    }

    const recruit = await db.recruit.findFirst({
      where: {
        id: recruitId,
        organizationId: agent.organizationId,
      },
    });

    if (!recruit) {
      return NextResponse.json(
        { success: false, error: 'Recruit not found' },
        { status: 404 }
      );
    }

    // Build the update data based on the field
    const updateData: Record<string, unknown> = {};

    if (field === 'hoursCompleted') {
      updateData.hoursCompleted = typeof value === 'number' ? value : parseInt(value) || 0;
    } else if (field === 'examPassed') {
      updateData.examPassed = Boolean(value);
      updateData.examPassedDate = value ? new Date() : null;
      // Auto-update status if exam passed and license not yet issued
      if (value && !recruit.licenseIssued) {
        updateData.status = 'FAST_START_COMPLETE';
      }
    } else if (field === 'fingerprinting') {
      updateData.fingerprinting = Boolean(value);
      updateData.fingerprintDate = value ? new Date() : null;
    } else if (field === 'licenseIssued') {
      updateData.licenseIssued = Boolean(value);
      updateData.licenseIssuedDate = value ? new Date() : null;
      // Auto-update status when license is issued
      if (value) {
        updateData.status = 'LICENSED';
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid field' },
        { status: 400 }
      );
    }

    const updated = await db.recruit.update({
      where: { id: recruitId },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating licensing progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update licensing progress' },
      { status: 500 }
    );
  }
}
