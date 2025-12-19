import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';

// ============================================
// ADMIN/AGENT SESSION (existing)
// ============================================

export interface SessionData {
  agentId?: string;
  prospectId?: string;
  email?: string;
  firstName?: string;
  role?: 'agent' | 'prospect' | 'AGENT' | 'MANAGER' | 'ADMIN';
  organizationId?: string;
  isLoggedIn: boolean;
}

function getSessionPassword(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET environment variable is required in production');
  }
  return secret || 'development_only_secret_at_least_32_chars_long';
}

function getSessionOptions() {
  return {
    password: getSessionPassword(),
    cookieName: 'wealth_pro_session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  };
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, getSessionOptions());
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

// ============================================
// CLIENT SESSION (Platform-as-a-Template)
// ============================================

export interface ClientSessionData {
  clientId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  prospectId?: string;
  businessProspectId?: string;
  isLoggedIn: boolean;
}

function getClientSessionOptions() {
  return {
    password: getSessionPassword(),
    cookieName: 'client_session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 30, // 30 days for clients
    },
  };
}

export async function getClientSession(): Promise<IronSession<ClientSessionData>> {
  const cookieStore = await cookies();
  return getIronSession<ClientSessionData>(cookieStore, getClientSessionOptions());
}

export async function requireClient() {
  const session = await getClientSession();
  if (!session.isLoggedIn || !session.clientId) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function clearClientSession() {
  const session = await getClientSession();
  session.destroy();
}
