import { redirect } from 'next/navigation';
import { requireAgent } from '@/lib/auth';
import { db } from '@/lib/db';
import TeamClient from './TeamClient';

export const metadata = {
  title: 'Team Management | Wealth Pro Recruitment',
  description: 'Manage your downline organization and team performance',
};

export default async function TeamPage() {
  // Require authentication
  const session = await requireAgent();

  // Fetch team members (downlines) with their stats
  const teamMembers = await db.agent.findMany({
    where: {
      uplineId: session.agentId,
    },
    include: {
      commissions: {
        where: {
          status: 'PAID',
        },
        select: {
          amount: true,
        },
      },
      activities: {
        where: {
          completedAt: { not: null },
        },
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calculate stats for each team member
  const teamMembersWithStats = teamMembers.map((member) => {
    const totalProduction = member.commissions.reduce(
      (sum, commission) => sum + Number(commission.amount),
      0
    );

    return {
      ...member,
      totalProduction,
      activitiesCount: member.activities.length,
    };
  });

  // Calculate overall team stats
  const totalProduction = teamMembersWithStats.reduce(
    (sum, member) => sum + member.totalProduction,
    0
  );

  // Count active agents (agents with at least 1 activity in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeAgents = await db.agent.findMany({
    where: {
      uplineId: session.agentId,
      activities: {
        some: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      },
    },
    select: {
      id: true,
    },
  });

  const activeCount = activeAgents.length;

  return (
    <TeamClient
      teamMembers={teamMembersWithStats}
      totalProduction={totalProduction}
      activeCount={activeCount}
    />
  );
}
