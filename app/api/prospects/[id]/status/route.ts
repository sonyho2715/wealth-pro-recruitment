import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum([
    'LEAD',
    'QUALIFIED',
    'INSURANCE_CLIENT',
    'AGENT_PROSPECT',
    'LICENSED_AGENT',
    'INACTIVE',
  ]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session.agentId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const validated = updateStatusSchema.parse(body);

    const prospect = await db.prospect.findUnique({
      where: { id },
    });

    if (!prospect) {
      return NextResponse.json(
        { success: false, error: 'Prospect not found' },
        { status: 404 }
      );
    }

    const updated = await db.prospect.update({
      where: { id },
      data: { status: validated.status },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Status update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
