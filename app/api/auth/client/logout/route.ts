import { NextResponse } from 'next/server';
import { getClientSession } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getClientSession();
    session.destroy();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}
