import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import DashboardClient from './DashboardClient';

export default async function AgentDashboardPage() {
  const session = await getSession();

  if (!session.isLoggedIn || session.role !== 'agent' || !session.agentId) {
    redirect('/agent/login');
  }

  const agent = await db.agent.findUnique({
    where: { id: session.agentId }
  });

  if (!agent) {
    redirect('/agent/login');
  }

  const prospects = await db.prospect.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      financialProfile: true,
      insuranceNeeds: true,
      agentProjection: true,
      notes: {
        orderBy: { createdAt: 'desc' },
        take: 3
      }
    }
  });

  // Serialize Decimal types
  const serializedProspects = prospects.map(p => ({
    ...p,
    financialProfile: p.financialProfile ? {
      ...p.financialProfile,
      annualIncome: Number(p.financialProfile.annualIncome),
      netWorth: Number(p.financialProfile.netWorth),
      protectionGap: Number(p.financialProfile.protectionGap),
    } : null,
    insuranceNeeds: p.insuranceNeeds.map(n => ({
      ...n,
      gap: Number(n.gap),
    })),
    agentProjection: p.agentProjection ? {
      ...p.agentProjection,
      year1Income: Number(p.agentProjection.year1Income),
    } : null,
  }));

  return (
    <DashboardClient
      agent={{ firstName: agent.firstName, lastName: agent.lastName, email: agent.email }}
      prospects={serializedProspects}
    />
  );
}
