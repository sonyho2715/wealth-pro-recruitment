import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getClientSession } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);

    // Find client by email
    const client = await db.client.findUnique({
      where: { email: validated.email.toLowerCase() },
      include: {
        prospect: {
          select: { id: true, firstName: true, lastName: true },
        },
        businessProspect: {
          select: { id: true, businessName: true },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const passwordValid = await bcrypt.compare(validated.password, client.passwordHash);

    if (!passwordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    await db.client.update({
      where: { id: client.id },
      data: { lastLoginAt: new Date() },
    });

    // Set client session
    const session = await getClientSession();
    session.clientId = client.id;
    session.email = client.email;
    session.firstName = client.firstName;
    session.lastName = client.lastName;
    session.prospectId = client.prospectId || undefined;
    session.businessProspectId = client.businessProspectId || undefined;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      success: true,
      data: {
        id: client.id,
        email: client.email,
        firstName: client.firstName,
        lastName: client.lastName,
        hasProspectData: !!client.prospect,
        hasBusinessData: !!client.businessProspect,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
