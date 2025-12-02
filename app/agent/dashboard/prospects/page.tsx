import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProspectsClient from './ProspectsClient';

export default async function ProspectsPage() {
  const session = await getSession();
  if (!session.agentId) redirect('/agent/login');

  try {
    // Fetch all prospects for this agent with related data
    const prospectsData = await db.prospect.findMany({
      where: { agentId: session.agentId },
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
  } catch (error) {
    console.error('Prospects page error:', error);
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Prospects</h1>
        <p className="text-red-600 mt-2">Error loading prospects. Please try again later.</p>
      </div>
    );
  }
}
