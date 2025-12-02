import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { z } from 'zod';
import {
  handleApiError,
  successResponse,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from '@/lib/errors';
import {
  ProspectStatus,
  PROSPECT_STATUSES,
  isValidTransition,
  getTransitionErrorMessage,
} from '@/lib/constants/prospect-statuses';

const updateStatusSchema = z.object({
  status: z.enum(PROSPECT_STATUSES as [ProspectStatus, ...ProspectStatus[]]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session.agentId) {
      throw new AuthenticationError();
    }

    const { id } = await params;
    const body = await req.json();
    const validated = updateStatusSchema.parse(body);

    const prospect = await db.prospect.findUnique({
      where: { id },
    });

    if (!prospect) {
      throw new NotFoundError('Prospect');
    }

    // Security check: ensure prospect belongs to this agent
    if (prospect.agentId !== session.agentId) {
      throw new AuthorizationError('Not authorized to update this prospect');
    }

    // Validate status transition
    const currentStatus = prospect.status as ProspectStatus;
    const newStatus = validated.status as ProspectStatus;

    if (!isValidTransition(currentStatus, newStatus)) {
      throw new ValidationError(getTransitionErrorMessage(currentStatus, newStatus));
    }

    const updated = await db.prospect.update({
      where: { id },
      data: { status: validated.status },
    });

    return NextResponse.json(successResponse(updated));
  } catch (error) {
    const { response, status } = handleApiError(error);
    return NextResponse.json(response, { status });
  }
}
