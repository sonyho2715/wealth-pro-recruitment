import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { requireClient, getClientSession } from '@/lib/auth';
import { db } from '@/lib/db';

// GET client profile
export async function GET() {
  try {
    const session = await requireClient();

    const client = await db.client.findUnique({
      where: { id: session.clientId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
        prospect: {
          select: {
            agent: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...client,
        advisor: client.prospect?.agent || null,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Profile GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// Update client profile
const updateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireClient();
    const body = await req.json();
    const validated = updateSchema.parse(body);

    const client = await db.client.update({
      where: { id: session.clientId },
      data: validated,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
    });

    // Update session with new name
    const clientSession = await getClientSession();
    if (validated.firstName) clientSession.firstName = validated.firstName;
    if (validated.lastName) clientSession.lastName = validated.lastName;
    await clientSession.save();

    return NextResponse.json({
      success: true,
      data: client,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Profile PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// Change password
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export async function PUT(req: NextRequest) {
  try {
    const session = await requireClient();
    const body = await req.json();
    const validated = passwordSchema.parse(body);

    // Get current password hash
    const client = await db.client.findUnique({
      where: { id: session.clientId },
      select: { passwordHash: true },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const passwordValid = await bcrypt.compare(
      validated.currentPassword,
      client.passwordHash
    );

    if (!passwordValid) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(validated.newPassword, 12);

    // Update password
    await db.client.update({
      where: { id: session.clientId },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Password change error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
