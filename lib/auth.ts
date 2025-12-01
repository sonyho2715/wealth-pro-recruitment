import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  agentId?: string;
  prospectId?: string;
  email?: string;
  role?: 'agent' | 'prospect';
  isLoggedIn: boolean;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'wealth_pro_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function requireAgent() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'agent' || !session.agentId) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function getProspectSession() {
  const session = await getSession();
  return session.prospectId || null;
}
