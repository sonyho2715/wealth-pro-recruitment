import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const agent = await db.agent.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const validPassword = await bcrypt.compare(password, agent.passwordHash);

    if (!validPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session
    const session = await getSession();
    session.agentId = agent.id;
    session.email = agent.email;
    session.role = 'agent';
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        email: agent.email,
        firstName: agent.firstName,
        lastName: agent.lastName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    );
  }
}
