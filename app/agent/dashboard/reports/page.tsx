import { db } from '@/lib/db';
import { requireAgent } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ReportsClient from './ReportsClient';
import { startOfMonth, startOfYear, subMonths, format } from 'date-fns';

export default async function ReportsPage() {
  let session;
  try {
    session = await requireAgent();
  } catch {
    redirect('/agent/login');
  }

  const agentId = session.agentId!;

  // Fetch agent details for monthly goal
  const agent = await db.agent.findUnique({
    where: { id: agentId },
    select: {
      firstName: true,
      lastName: true,
      monthlyGoal: true,
    },
  });

  // Date ranges
  const now = new Date();
  const startOfThisMonth = startOfMonth(now);
  const startOfThisYear = startOfYear(now);
  const startOfLastMonth = startOfMonth(subMonths(now, 1));
  const endOfLastMonth = startOfMonth(now);

  // Fetch all commissions for the agent
  const [allCommissions, thisMonthCommissions, thisYearCommissions, lastMonthCommissions] = await Promise.all([
    db.commission.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
    }),
    db.commission.findMany({
      where: {
        agentId,
        createdAt: { gte: startOfThisMonth },
      },
    }),
    db.commission.findMany({
      where: {
        agentId,
        createdAt: { gte: startOfThisYear },
      },
    }),
    db.commission.findMany({
      where: {
        agentId,
        createdAt: {
          gte: startOfLastMonth,
          lt: endOfLastMonth,
        },
      },
    }),
  ]);

  // Calculate commission totals
  const totalCommissionsAllTime = allCommissions.reduce((sum, c) => sum + Number(c.amount), 0);
  const totalCommissionsThisMonth = thisMonthCommissions.reduce((sum, c) => sum + Number(c.amount), 0);
  const totalCommissionsThisYear = thisYearCommissions.reduce((sum, c) => sum + Number(c.amount), 0);
  const totalCommissionsLastMonth = lastMonthCommissions.reduce((sum, c) => sum + Number(c.amount), 0);

  // Count policies sold
  const policiesSoldAllTime = allCommissions.length;
  const policiesSoldThisMonth = thisMonthCommissions.length;
  const policiesSoldThisYear = thisYearCommissions.length;
  const policiesSoldLastMonth = lastMonthCommissions.length;

  // Average commission per policy
  const avgCommissionPerPolicy = policiesSoldAllTime > 0 ? totalCommissionsAllTime / policiesSoldAllTime : 0;

  // Monthly commission trend (last 12 months)
  const monthlyTrend = [];
  for (let i = 11; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i));
    const monthEnd = startOfMonth(subMonths(now, i - 1));

    const monthCommissions = allCommissions.filter(c => {
      const createdAt = new Date(c.createdAt);
      return createdAt >= monthStart && createdAt < monthEnd;
    });

    const total = monthCommissions.reduce((sum, c) => sum + Number(c.amount), 0);

    monthlyTrend.push({
      month: format(monthStart, 'MMM yyyy'),
      amount: total,
      count: monthCommissions.length,
    });
  }

  // Fetch all prospects for pipeline analysis
  const prospects = await db.prospect.findMany({
    select: {
      id: true,
      status: true,
      createdAt: true,
    },
  });

  // Count prospects by stage
  const prospectsByStage = {
    LEAD: prospects.filter(p => p.status === 'LEAD').length,
    QUALIFIED: prospects.filter(p => p.status === 'QUALIFIED').length,
    INSURANCE_CLIENT: prospects.filter(p => p.status === 'INSURANCE_CLIENT').length,
    AGENT_PROSPECT: prospects.filter(p => p.status === 'AGENT_PROSPECT').length,
    LICENSED_AGENT: prospects.filter(p => p.status === 'LICENSED_AGENT').length,
    INACTIVE: prospects.filter(p => p.status === 'INACTIVE').length,
  };

  // Calculate conversion rates
  const totalActiveProspects = prospects.filter(p => p.status !== 'INACTIVE').length;
  const conversionRates = {
    leadToQualified: prospectsByStage.LEAD > 0
      ? ((prospectsByStage.QUALIFIED + prospectsByStage.INSURANCE_CLIENT + prospectsByStage.AGENT_PROSPECT + prospectsByStage.LICENSED_AGENT) / (prospectsByStage.LEAD + prospectsByStage.QUALIFIED + prospectsByStage.INSURANCE_CLIENT + prospectsByStage.AGENT_PROSPECT + prospectsByStage.LICENSED_AGENT)) * 100
      : 0,
    qualifiedToClient: (prospectsByStage.QUALIFIED > 0)
      ? ((prospectsByStage.INSURANCE_CLIENT + prospectsByStage.AGENT_PROSPECT + prospectsByStage.LICENSED_AGENT) / (prospectsByStage.QUALIFIED + prospectsByStage.INSURANCE_CLIENT + prospectsByStage.AGENT_PROSPECT + prospectsByStage.LICENSED_AGENT)) * 100
      : 0,
    clientToAgent: (prospectsByStage.INSURANCE_CLIENT + prospectsByStage.AGENT_PROSPECT > 0)
      ? (prospectsByStage.LICENSED_AGENT / (prospectsByStage.INSURANCE_CLIENT + prospectsByStage.AGENT_PROSPECT + prospectsByStage.LICENSED_AGENT)) * 100
      : 0,
  };

  // Fetch all activities
  const [allActivities, thisMonthActivities, lastMonthActivities] = await Promise.all([
    db.activity.findMany({
      where: { agentId },
    }),
    db.activity.findMany({
      where: {
        agentId,
        createdAt: { gte: startOfThisMonth },
      },
    }),
    db.activity.findMany({
      where: {
        agentId,
        createdAt: {
          gte: startOfLastMonth,
          lt: endOfLastMonth,
        },
      },
    }),
  ]);

  // Activity metrics
  const totalActivities = allActivities.length;
  const activitiesThisMonth = thisMonthActivities.length;
  const activitiesLastMonth = lastMonthActivities.length;
  const completedActivities = allActivities.filter(a => a.completedAt).length;
  const completionRate = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

  // Activities by type
  const activitiesByType = {
    CALL: allActivities.filter(a => a.type === 'CALL').length,
    MEETING: allActivities.filter(a => a.type === 'MEETING').length,
    EMAIL: allActivities.filter(a => a.type === 'EMAIL').length,
    FOLLOW_UP: allActivities.filter(a => a.type === 'FOLLOW_UP').length,
    PRESENTATION: allActivities.filter(a => a.type === 'PRESENTATION').length,
    APPLICATION: allActivities.filter(a => a.type === 'APPLICATION').length,
    OTHER: allActivities.filter(a => a.type === 'OTHER').length,
  };

  // Goal tracking
  const monthlyGoal = agent?.monthlyGoal ? Number(agent.monthlyGoal) : null;
  const goalProgress = monthlyGoal ? (totalCommissionsThisMonth / monthlyGoal) * 100 : null;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - now.getDate();

  // Prepare data for client component
  const reportData = {
    agent: {
      name: `${agent?.firstName} ${agent?.lastName}`,
      monthlyGoal,
    },
    production: {
      totalCommissionsAllTime,
      totalCommissionsThisMonth,
      totalCommissionsThisYear,
      totalCommissionsLastMonth,
      policiesSoldAllTime,
      policiesSoldThisMonth,
      policiesSoldThisYear,
      policiesSoldLastMonth,
      avgCommissionPerPolicy,
      monthlyTrend,
    },
    pipeline: {
      prospectsByStage,
      conversionRates,
      totalActiveProspects,
    },
    activities: {
      totalActivities,
      activitiesThisMonth,
      activitiesLastMonth,
      completedActivities,
      completionRate,
      activitiesByType,
    },
    goal: {
      monthlyGoal,
      currentProgress: totalCommissionsThisMonth,
      goalProgress,
      daysRemaining,
    },
  };

  return <ReportsClient data={reportData} />;
}
