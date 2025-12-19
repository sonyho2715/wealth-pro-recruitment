import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PresentationsClient from './PresentationsClient';

export default async function PresentationsPage() {
  const session = await getSession();
  if (!session.agentId) redirect('/agent/login');

  // Fetch presentation sessions
  const sessions = await db.presentationSession.findMany({
    where: { agentId: session.agentId },
    include: {
      prospect: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
          stage: true,
        },
      },
    },
    orderBy: { startedAt: 'desc' },
    take: 50,
  });

  // Fetch prospects for new presentation
  const prospects = await db.prospect.findMany({
    where: {
      OR: [
        { agentId: session.agentId },
        { agentId: null },
        {
          sharedWith: {
            some: { sharedWithAgentId: session.agentId },
          },
        },
      ],
    },
    include: {
      financialProfile: {
        select: { netWorth: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const sessionsData = sessions.map(s => ({
    id: s.id,
    prospect: s.prospect,
    startedAt: s.startedAt.toISOString(),
    endedAt: s.endedAt?.toISOString() || null,
    slidesViewed: s.slidesViewed,
    currentSlide: s.currentSlide,
    totalDuration: s.totalDuration,
    interactionCount: s.interactionCount,
    deviceType: s.deviceType,
    outcome: s.outcome,
    notes: s.notes,
  }));

  const prospectsData = prospects.map(p => ({
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email,
    status: p.status,
    stage: p.stage,
    netWorth: p.financialProfile ? Number(p.financialProfile.netWorth) : null,
  }));

  // Stats
  const stats = {
    total: sessions.length,
    completed: sessions.filter(s => s.outcome === 'COMPLETED').length,
    applicationStarted: sessions.filter(s => s.outcome === 'APPLICATION_STARTED').length,
    followUpNeeded: sessions.filter(s => s.outcome === 'FOLLOW_UP_NEEDED').length,
    avgDuration: sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + (s.totalDuration || 0), 0) / sessions.length / 60)
      : 0,
    thisWeek: sessions.filter(s => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return s.startedAt > weekAgo;
    }).length,
  };

  return (
    <div className="p-6 lg:p-8">
      <PresentationsClient
        sessions={sessionsData}
        prospects={prospectsData}
        stats={stats}
      />
    </div>
  );
}
