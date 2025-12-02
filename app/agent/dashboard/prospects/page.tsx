import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProspectsClient from './ProspectsClient';

export default async function ProspectsPage() {
  const session = await getSession();
  if (!session.agentId) redirect('/agent/login');

  // Fetch all prospects with related data
  const prospectsData = await db.prospect.findMany({
    include: {
      financialProfile: true,
      agentProjection: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Transform Decimal types to numbers for client component
  const prospects = prospectsData.map(prospect => ({
    id: prospect.id,
    firstName: prospect.firstName,
    lastName: prospect.lastName,
    email: prospect.email,
    phone: prospect.phone,
    status: prospect.status,
    createdAt: prospect.createdAt,
    financialProfile: prospect.financialProfile ? {
      annualIncome: Number(prospect.financialProfile.annualIncome),
      netWorth: Number(prospect.financialProfile.netWorth),
      protectionGap: Number(prospect.financialProfile.protectionGap),
    } : null,
    agentProjection: prospect.agentProjection ? {
      year1Income: Number(prospect.agentProjection.year1Income),
      year3Income: Number(prospect.agentProjection.year3Income),
      year5Income: Number(prospect.agentProjection.year5Income),
    } : null,
  }));

  return <ProspectsClient prospects={prospects} />;
}
