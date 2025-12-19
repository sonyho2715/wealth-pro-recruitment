import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getClientSession } from '@/lib/auth';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = signupSchema.parse(body);

    // Check if client already exists
    const existingClient = await db.client.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (existingClient) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Check if a prospect exists with this email (to link them)
    const existingProspect = await db.prospect.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    // Check if a business prospect exists with this email
    const existingBusinessProspect = await db.businessProspect.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    // Hash password
    const passwordHash = await bcrypt.hash(validated.password, 12);

    // Create client account
    const client = await db.client.create({
      data: {
        email: validated.email.toLowerCase(),
        passwordHash,
        firstName: validated.firstName,
        lastName: validated.lastName,
        phone: validated.phone || null,
        prospectId: existingProspect?.id || null,
        businessProspectId: existingBusinessProspect?.id || null,
      },
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
        hasProspectData: !!client.prospectId,
        hasBusinessData: !!client.businessProspectId,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
