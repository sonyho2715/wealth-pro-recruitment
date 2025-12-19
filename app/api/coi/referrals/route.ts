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

const referralSchema = z.object({
  coiPartnerId: z.string().min(1, 'Partner ID is required'),
  direction: z.enum(['INBOUND', 'OUTBOUND']),
  businessName: z.string().optional().nullable(),
  contactName: z.string().min(1, 'Contact name is required'),
  contactEmail: z.string().email().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  estimatedValue: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
  followUpDate: z.string().optional().nullable(),
});

// GET - Fetch referrals (optionally by partner)
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session?.agentId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get('partnerId');

    const referrals = await db.cOIReferral.findMany({
      where: partnerId
        ? {
            coiPartnerId: partnerId,
            coiPartner: { agentId: session.agentId },
          }
        : {
            coiPartner: { agentId: session.agentId },
          },
      include: {
        coiPartner: {
          select: { name: true, company: true, type: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: referrals });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
}

// POST - Create a new referral
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session?.agentId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = referralSchema.parse(body);

    // Verify partner ownership
    const partner = await db.cOIPartner.findFirst({
      where: { id: validated.coiPartnerId, agentId: session.agentId },
    });

    if (!partner) {
      return NextResponse.json({ success: false, error: 'Partner not found' }, { status: 404 });
    }

    // Create referral
    const referral = await db.cOIReferral.create({
      data: {
        coiPartnerId: validated.coiPartnerId,
        direction: validated.direction,
        businessName: validated.businessName || null,
        contactName: validated.contactName,
        contactEmail: validated.contactEmail || null,
        contactPhone: validated.contactPhone || null,
        estimatedValue: validated.estimatedValue || null,
        notes: validated.notes || null,
        followUpDate: validated.followUpDate ? new Date(validated.followUpDate) : null,
        status: 'PENDING',
      },
    });

    // Update partner's referral counts
    const updateField =
      validated.direction === 'INBOUND' ? 'referralsReceived' : 'referralsSent';

    await db.cOIPartner.update({
      where: { id: validated.coiPartnerId },
      data: {
        [updateField]: { increment: 1 },
        lastContactDate: new Date(),
        // Boost relationship score for activity
        relationshipScore: Math.min(100, (partner.relationshipScore || 50) + 5),
      },
    });

    return NextResponse.json({ success: true, data: referral });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating referral:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create referral' },
      { status: 500 }
    );
  }
}

// PATCH - Update referral status
export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session?.agentId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, actualValue, convertedToProspect, prospectId, businessProspectId, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Referral ID required' }, { status: 400 });
    }

    // Verify ownership through partner
    const existing = await db.cOIReferral.findFirst({
      where: {
        id,
        coiPartner: { agentId: session.agentId },
      },
      include: { coiPartner: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Referral not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (status) updateData.status = status;
    if (actualValue !== undefined) updateData.actualValue = actualValue;
    if (convertedToProspect !== undefined) updateData.convertedToProspect = convertedToProspect;
    if (prospectId !== undefined) updateData.prospectId = prospectId;
    if (businessProspectId !== undefined) updateData.businessProspectId = businessProspectId;
    if (notes !== undefined) updateData.notes = notes;

    const referral = await db.cOIReferral.update({
      where: { id },
      data: updateData,
    });

    // Boost relationship score if referral closed won
    if (status === 'CLOSED_WON') {
      await db.cOIPartner.update({
        where: { id: existing.coiPartnerId },
        data: {
          relationshipScore: Math.min(100, (existing.coiPartner.relationshipScore || 50) + 10),
        },
      });
    }

    return NextResponse.json({ success: true, data: referral });
  } catch (error) {
    console.error('Error updating referral:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update referral' },
      { status: 500 }
    );
  }
}
