import { redirect } from 'next/navigation';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import COIDashboard from './COIDashboard';

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

export default async function COIPage() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session?.agentId) {
    redirect('/agent/login');
  }

  // Fetch COI partners with referrals
  const coiPartners = await db.cOIPartner.findMany({
    where: { agentId: session.agentId },
    include: {
      referrals: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Calculate summary stats
  const totalPartners = coiPartners.length;
  const totalInboundReferrals = coiPartners.reduce((sum, p) => sum + p.referralsReceived, 0);
  const totalOutboundReferrals = coiPartners.reduce((sum, p) => sum + p.referralsSent, 0);
  const avgRelationshipScore = totalPartners > 0
    ? Math.round(coiPartners.reduce((sum, p) => sum + (p.relationshipScore || 0), 0) / totalPartners)
    : 0;

  // Partners needing follow-up
  const now = new Date();
  const partnersNeedingFollowUp = coiPartners.filter(p => {
    if (!p.nextFollowUpDate) return false;
    return new Date(p.nextFollowUpDate) <= now;
  });

  // Format partners for client
  const formattedPartners = coiPartners.map(p => ({
    id: p.id,
    name: p.name,
    company: p.company,
    type: p.type,
    email: p.email,
    phone: p.phone,
    referralsReceived: p.referralsReceived,
    referralsSent: p.referralsSent,
    lastContactDate: p.lastContactDate?.toISOString() || null,
    relationshipScore: p.relationshipScore,
    nextFollowUpDate: p.nextFollowUpDate?.toISOString() || null,
    notes: p.notes,
    tags: p.tags,
    createdAt: p.createdAt.toISOString(),
    referrals: p.referrals.map(r => ({
      id: r.id,
      direction: r.direction,
      businessName: r.businessName,
      contactName: r.contactName,
      contactEmail: r.contactEmail,
      status: r.status,
      estimatedValue: r.estimatedValue ? Number(r.estimatedValue) : null,
      actualValue: r.actualValue ? Number(r.actualValue) : null,
      createdAt: r.createdAt.toISOString(),
    })),
  }));

  return (
    <COIDashboard
      partners={formattedPartners}
      stats={{
        totalPartners,
        totalInboundReferrals,
        totalOutboundReferrals,
        avgRelationshipScore,
        partnersNeedingFollowUp: partnersNeedingFollowUp.length,
      }}
    />
  );
}
