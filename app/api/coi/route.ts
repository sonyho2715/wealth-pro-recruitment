import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { db } from '@/lib/db';

interface SessionData {
  agentId?: string;
  email?: string;
  role?: string;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'agent_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  },
};

const coiPartnerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().min(1, 'Company is required'),
  type: z.enum(['CPA', 'ATTORNEY', 'BANKER', 'CFO', 'FINANCIAL_ADVISOR', 'REAL_ESTATE_AGENT', 'INSURANCE_AGENT', 'OTHER']),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  nextFollowUpDate: z.string().optional().nullable(),
});

// GET - Fetch all COI partners for the agent
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session?.agentId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const coiPartners = await db.cOIPartner.findMany({
      where: { agentId: session.agentId },
      include: {
        referrals: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: coiPartners });
  } catch (error) {
    console.error('Error fetching COI partners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch COI partners' },
      { status: 500 }
    );
  }
}

// POST - Create a new COI partner
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session?.agentId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = coiPartnerSchema.parse(body);

    const coiPartner = await db.cOIPartner.create({
      data: {
        agentId: session.agentId,
        name: validated.name,
        company: validated.company,
        type: validated.type,
        email: validated.email || null,
        phone: validated.phone || null,
        notes: validated.notes || null,
        tags: validated.tags || [],
        nextFollowUpDate: validated.nextFollowUpDate ? new Date(validated.nextFollowUpDate) : null,
        relationshipScore: 50, // Start with neutral score
      },
    });

    return NextResponse.json({ success: true, data: coiPartner });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating COI partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create COI partner' },
      { status: 500 }
    );
  }
}

// PATCH - Update a COI partner
export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session?.agentId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Partner ID required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await db.cOIPartner.findFirst({
      where: { id, agentId: session.agentId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Partner not found' }, { status: 404 });
    }

    // Process nextFollowUpDate if provided
    if (updates.nextFollowUpDate) {
      updates.nextFollowUpDate = new Date(updates.nextFollowUpDate);
    }

    const coiPartner = await db.cOIPartner.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ success: true, data: coiPartner });
  } catch (error) {
    console.error('Error updating COI partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update COI partner' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a COI partner
export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session?.agentId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Partner ID required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await db.cOIPartner.findFirst({
      where: { id, agentId: session.agentId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Partner not found' }, { status: 404 });
    }

    await db.cOIPartner.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting COI partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete COI partner' },
      { status: 500 }
    );
  }
}
