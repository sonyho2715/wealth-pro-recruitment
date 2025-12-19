import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProspectsClient from './ProspectsClient';

export default async function ProspectsPage() {
  const session = await getSession();
  if (!session.agentId) redirect('/agent/login');

  try {
    // Fetch all prospects for this agent OR unassigned (self-registered)
    const [prospectsData, sharedWithMe, agent] = await Promise.all([
      db.prospect.findMany({
        where: {
          OR: [
            { agentId: session.agentId },
            { agentId: null }
          ]
        },
        include: {
          financialProfile: true,
          agentProjection: true,
          sharedWith: {
            include: {
              sharedWithAgent: {
                select: { firstName: true, lastName: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      }),
      // Fetch prospects shared with this agent
      db.prospectShare.findMany({
        where: { sharedWithAgentId: session.agentId },
        include: {
          prospect: {
            include: {
              financialProfile: true,
              agentProjection: true,
            }
          },
          sharedByAgent: {
            select: { firstName: true, lastName: true }
          }
        }
      }),
      // Get agent's team info for sharing
      db.agent.findUnique({
        where: { id: session.agentId },
        include: {
          upline: { select: { id: true, firstName: true, lastName: true } },
          downlines: { select: { id: true, firstName: true, lastName: true } }
        }
      })
    ]);

    // Transform own prospects
    const ownProspects = prospectsData.map(prospect => ({
      id: prospect.id,
      firstName: prospect.firstName,
      lastName: prospect.lastName,
      email: prospect.email,
      phone: prospect.phone,
      status: prospect.status,
      stage: prospect.stage,
      createdAt: prospect.createdAt,
      isShared: false,
      sharedBy: null as { firstName: string; lastName: string } | null,
      sharedWith: prospect.sharedWith.map(s => ({
        agentName: `${s.sharedWithAgent.firstName} ${s.sharedWithAgent.lastName}`
      })),
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

    // Transform shared prospects
    const sharedProspects = sharedWithMe
      .filter(share => !prospectsData.some(p => p.id === share.prospect.id))
      .map(share => ({
        id: share.prospect.id,
        firstName: share.prospect.firstName,
        lastName: share.prospect.lastName,
        email: share.prospect.email,
        phone: share.prospect.phone,
        status: share.prospect.status,
        stage: share.prospect.stage,
        createdAt: share.prospect.createdAt,
        isShared: true,
        sharedBy: {
          firstName: share.sharedByAgent.firstName,
          lastName: share.sharedByAgent.lastName
        },
        sharedWith: [] as { agentName: string }[],
        financialProfile: share.prospect.financialProfile ? {
          annualIncome: Number(share.prospect.financialProfile.annualIncome),
          netWorth: Number(share.prospect.financialProfile.netWorth),
          protectionGap: Number(share.prospect.financialProfile.protectionGap),
        } : null,
        agentProjection: share.prospect.agentProjection ? {
          year1Income: Number(share.prospect.agentProjection.year1Income),
          year3Income: Number(share.prospect.agentProjection.year3Income),
          year5Income: Number(share.prospect.agentProjection.year5Income),
        } : null,
      }));

    const allProspects = [...ownProspects, ...sharedProspects];

    // Build shareable agents list
    const shareableAgents = [
      ...(agent?.upline ? [{ ...agent.upline, relationship: 'upline' as const }] : []),
      ...(agent?.downlines.map(d => ({ ...d, relationship: 'downline' as const })) || [])
    ];

    return <ProspectsClient prospects={allProspects} shareableAgents={shareableAgents} />;
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
