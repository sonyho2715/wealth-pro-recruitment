import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight,
  Phone,
  Mail,
  Share2,
  Award,
  Target,
  GraduationCap,
  CalendarCheck,
  UserPlus,
  FileCheck,
  Star,
  Trophy
} from 'lucide-react';

export default async function DashboardOverviewPage() {
  const session = await getSession();
  if (!session.agentId) redirect('/agent/login');

  try {
    const agent = await db.agent.findUnique({
      where: { id: session.agentId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        organizationId: true,
      },
    });

    if (!agent?.organizationId) {
      return (
        <div className="p-6 lg:p-8">
          <div className="card-gradient text-center py-12">
            <p className="text-gray-500">No organization found. Please contact your administrator.</p>
          </div>
        </div>
      );
    }

    // Get date ranges for filtering
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Fetch all data in parallel
    const [
      prospects,
      sharedProspects,
      activities,
      commissions,
      productions,
      recruits,
      bpms,
      allAgents,
    ] = await Promise.all([
      // Prospects
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
          sharedWith: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      // Shared prospects
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
      // Activities
      db.activity.findMany({
        where: { agentId: session.agentId },
        include: { prospect: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      // Commissions
      db.commission.findMany({
        where: { agentId: session.agentId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      // Productions (organization-wide for leaderboard)
      db.production.findMany({
        where: { organizationId: agent.organizationId },
        include: {
          writingAgent: {
            select: { id: true, firstName: true, lastName: true }
          },
          trainee: {
            select: { id: true, firstName: true, lastName: true }
          }
        },
        orderBy: { writtenDate: 'desc' },
      }),
      // Recruits
      db.recruit.findMany({
        where: { organizationId: agent.organizationId },
        include: {
          recruiter: {
            select: { id: true, firstName: true, lastName: true }
          }
        },
        orderBy: { startDate: 'desc' },
      }),
      // BPM Events
      db.bPM.findMany({
        where: {
          organizationId: agent.organizationId,
          date: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        },
        include: {
          guests: true,
        },
        orderBy: { date: 'desc' },
      }),
      // All agents for leaderboard
      db.agent.findMany({
        where: { organizationId: agent.organizationId },
        select: { id: true, firstName: true, lastName: true },
      }),
    ]);

    // ===== PROSPECT STATS =====
    const allProspects = [
      ...prospects,
      ...sharedProspects.map(sp => sp.prospect).filter(p => !prospects.some(op => op.id === p.id))
    ];
    const totalProspects = prospects.length;
    const sharedWithMeCount = sharedProspects.length;
    const qualified = allProspects.filter(p => p.status !== 'LEAD' && p.status !== 'INACTIVE').length;
    const totalProtectionGap = allProspects.reduce(
      (sum, p) => sum + Number(p.financialProfile?.protectionGap || 0),
      0
    );
    const agentProspects = allProspects.filter(p => p.status === 'AGENT_PROSPECT').length;

    // ===== COMMISSION STATS =====
    const pendingCommissions = commissions
      .filter(c => c.status === 'PENDING')
      .reduce((sum, c) => sum + Number(c.amount), 0);
    const paidCommissions = commissions
      .filter(c => c.status === 'PAID')
      .reduce((sum, c) => sum + Number(c.amount), 0);

    // ===== PRODUCTION STATS (MTD & YTD) =====
    const myProductions = productions.filter(p => p.writingAgentId === session.agentId);
    const mtdProductions = myProductions.filter(p => new Date(p.writtenDate) >= startOfMonth);
    const ytdProductions = myProductions.filter(p => new Date(p.writtenDate) >= startOfYear);

    const mtdPoints = mtdProductions.reduce((sum, p) => sum + Number(p.totalPoints), 0);
    const ytdPoints = ytdProductions.reduce((sum, p) => sum + Number(p.totalPoints), 0);
    const mtdBaseshop = mtdProductions.reduce((sum, p) => sum + Number(p.baseshopPoints), 0);
    const ytdBaseshop = ytdProductions.reduce((sum, p) => sum + Number(p.baseshopPoints), 0);

    // ===== RECRUIT STATS =====
    const myRecruits = recruits.filter(r => r.recruiterId === session.agentId);
    const activeRecruits = myRecruits.filter(r => r.status === 'ACTIVE' || r.status === 'FAST_START_COMPLETE').length;
    const licensedRecruits = myRecruits.filter(r => r.status === 'LICENSED').length;
    const totalMyRecruits = myRecruits.length;

    // All org recruits stats
    const orgActiveRecruits = recruits.filter(r => r.status === 'ACTIVE' || r.status === 'FAST_START_COMPLETE').length;
    const orgLicensedRecruits = recruits.filter(r => r.status === 'LICENSED').length;

    // ===== BPM STATS =====
    const upcomingBPMs = bpms.filter(b => new Date(b.date) >= now && b.status === 'SCHEDULED');
    const recentBPMs = bpms.filter(b => b.status === 'COMPLETED');
    const totalGuests = bpms.reduce((sum, b) => sum + b.guests.length, 0);
    const arrivedGuests = bpms.reduce((sum, b) => sum + b.guests.filter(g => g.arrived).length, 0);
    const attendanceRate = totalGuests > 0 ? Math.round((arrivedGuests / totalGuests) * 100) : 0;

    // ===== LEADERBOARD (YTD Production) =====
    const leaderboardData = allAgents.map(a => {
      const agentProds = productions.filter(
        p => p.writingAgentId === a.id && new Date(p.writtenDate) >= startOfYear
      );
      return {
        id: a.id,
        name: `${a.firstName} ${a.lastName}`,
        totalPoints: agentProds.reduce((sum, p) => sum + Number(p.totalPoints), 0),
        baseshopPoints: agentProds.reduce((sum, p) => sum + Number(p.baseshopPoints), 0),
        deals: agentProds.length,
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 5);

    // Find current agent's rank
    const sortedAgents = allAgents.map(a => {
      const agentProds = productions.filter(
        p => p.writingAgentId === a.id && new Date(p.writtenDate) >= startOfYear
      );
      return {
        id: a.id,
        totalPoints: agentProds.reduce((sum, p) => sum + Number(p.totalPoints), 0),
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);
    const myRank = sortedAgents.findIndex(a => a.id === session.agentId) + 1;

    // Recent productions (last 5)
    const recentProductions = productions.slice(0, 5);

    // Recent recruits (last 5)
    const recentRecruits = recruits.slice(0, 5);

    // Upcoming activities
    const upcomingActivities = activities.filter(
      a => a.scheduledAt && new Date(a.scheduledAt) > now && !a.completedAt
    );

    // Recent prospects
    const recentProspects = prospects.slice(0, 5);

    const statusColors: Record<string, { bg: string; text: string; label: string }> = {
      LEAD: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'New Lead' },
      QUALIFIED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Qualified' },
      INSURANCE_CLIENT: { bg: 'bg-green-100', text: 'text-green-700', label: 'Insurance Client' },
      AGENT_PROSPECT: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Agent Prospect' },
      LICENSED_AGENT: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Licensed Agent' },
      INACTIVE: { bg: 'bg-red-100', text: 'text-red-700', label: 'Inactive' },
    };

    return (
      <div className="p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back, {agent.firstName}! Here's your performance snapshot.</p>
        </div>

        {/* Production KPIs - BSCpro Style */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" /> Production Summary
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-gradient bg-gradient-to-br from-blue-50 to-blue-100/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-700">{mtdPoints.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Points (MTD)</div>
                </div>
              </div>
            </div>

            <div className="card-gradient bg-gradient-to-br from-green-50 to-green-100/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-700">{ytdPoints.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Points (YTD)</div>
                </div>
              </div>
            </div>

            <div className="card-gradient bg-gradient-to-br from-purple-50 to-purple-100/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-700">{mtdBaseshop.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Baseshop (MTD)</div>
                </div>
              </div>
            </div>

            <div className="card-gradient bg-gradient-to-br from-amber-50 to-amber-100/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-amber-700">#{myRank}</div>
                  <div className="text-sm text-gray-600">Rank (YTD)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recruiting & BPM Stats */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-green-600" /> Recruiting & Events
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="card-gradient">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalMyRecruits}</div>
                  <div className="text-xs text-gray-600">My Recruits</div>
                </div>
              </div>
            </div>

            <div className="card-gradient">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{activeRecruits}</div>
                  <div className="text-xs text-gray-600">In Progress</div>
                </div>
              </div>
            </div>

            <div className="card-gradient">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{licensedRecruits}</div>
                  <div className="text-xs text-gray-600">Licensed</div>
                </div>
              </div>
            </div>

            <div className="card-gradient">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{upcomingBPMs.length}</div>
                  <div className="text-xs text-gray-600">Upcoming BPMs</div>
                </div>
              </div>
            </div>

            <div className="card-gradient">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{attendanceRate}%</div>
                  <div className="text-xs text-gray-600">BPM Attendance</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prospect & Commission Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="card-gradient">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalProspects}</div>
                <div className="text-xs text-gray-600">My Prospects</div>
              </div>
            </div>
          </div>

          <div className="card-gradient">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                <Share2 className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{sharedWithMeCount}</div>
                <div className="text-xs text-gray-600">Shared With Me</div>
              </div>
            </div>
          </div>

          <div className="card-gradient">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{qualified}</div>
                <div className="text-xs text-gray-600">Qualified</div>
              </div>
            </div>
          </div>

          <div className="card-gradient">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">${pendingCommissions.toLocaleString()}</div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
            </div>
          </div>

          <div className="card-gradient">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">${paidCommissions.toLocaleString()}</div>
                <div className="text-xs text-gray-600">Paid (YTD)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard & Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Leaderboard */}
          <div className="card-gradient">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" /> Leaderboard (YTD)
              </h2>
            </div>
            <div className="space-y-3">
              {leaderboardData.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No production data yet</p>
              ) : (
                leaderboardData.map((leader, index) => (
                  <div
                    key={leader.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      leader.id === session.agentId ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-amber-400 text-white' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-amber-600 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{leader.name}</p>
                      <p className="text-xs text-gray-500">{leader.deals} deals</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{leader.totalPoints.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Productions */}
          <div className="card-gradient">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-green-600" /> Recent Production
              </h2>
              <Link
                href="/agent/dashboard/production"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentProductions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No production yet</p>
              ) : (
                recentProductions.map((prod) => (
                  <div key={prod.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileCheck className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{prod.clientName}</p>
                      <p className="text-xs text-gray-500">
                        {prod.writingAgent.firstName} {prod.writingAgent.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{Number(prod.totalPoints).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">pts</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Recruits */}
          <div className="card-gradient">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" /> Recent Recruits
              </h2>
              <Link
                href="/agent/dashboard/recruits"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentRecruits.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recruits yet</p>
              ) : (
                recentRecruits.map((recruit) => {
                  const statusMap: Record<string, { bg: string; text: string }> = {
                    ACTIVE: { bg: 'bg-blue-100', text: 'text-blue-700' },
                    LICENSED: { bg: 'bg-green-100', text: 'text-green-700' },
                    FAST_START_COMPLETE: { bg: 'bg-purple-100', text: 'text-purple-700' },
                    INACTIVE: { bg: 'bg-gray-100', text: 'text-gray-700' },
                    NOT_INTERESTED: { bg: 'bg-red-100', text: 'text-red-700' },
                  };
                  const status = statusMap[recruit.status] || statusMap.ACTIVE;
                  return (
                    <div key={recruit.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-medium">
                        {recruit.firstName[0]}{recruit.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">
                          {recruit.firstName} {recruit.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          by {recruit.recruiter.firstName} {recruit.recruiter.lastName}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.text}`}>
                        {recruit.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Prospects */}
          <div className="card-gradient">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Prospects</h2>
              <Link
                href="/agent/dashboard/prospects"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentProspects.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No prospects yet</p>
              ) : (
                recentProspects.map((prospect) => {
                  const status = statusColors[prospect.status] || statusColors.LEAD;
                  return (
                    <div
                      key={prospect.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {prospect.firstName[0]}{prospect.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {prospect.firstName} {prospect.lastName}
                          </p>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {prospect.email && (
                          <a
                            href={`mailto:${prospect.email}`}
                            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                        {prospect.phone && (
                          <a
                            href={`tel:${prospect.phone}`}
                            className="p-2 text-gray-400 hover:text-green-600 rounded-lg transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                        <Link
                          href={`/agent/dashboard/balance-sheets/${prospect.id}`}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Upcoming Activities */}
          <div className="card-gradient">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Activities</h2>
              <Link
                href="/agent/dashboard/activities"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingActivities.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No upcoming activities</p>
                  <Link
                    href="/agent/dashboard/activities"
                    className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
                  >
                    Schedule an activity
                  </Link>
                </div>
              ) : (
                upcomingActivities.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">
                        {activity.prospect
                          ? `${activity.prospect.firstName} ${activity.prospect.lastName}`
                          : 'No prospect'}
                        {activity.scheduledAt && (
                          <> • {new Date(activity.scheduledAt).toLocaleDateString()}</>
                        )}
                      </p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {activity.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Link
              href="/prospect"
              className="card-gradient hover:shadow-lg transition-shadow text-center"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="font-medium text-gray-900 text-sm">New Prospect</p>
            </Link>

            <Link
              href="/agent/dashboard/events"
              className="card-gradient hover:shadow-lg transition-shadow text-center"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <CalendarCheck className="w-5 h-5 text-purple-600" />
              </div>
              <p className="font-medium text-gray-900 text-sm">BPM Events</p>
            </Link>

            <Link
              href="/agent/dashboard/recruits"
              className="card-gradient hover:shadow-lg transition-shadow text-center"
            >
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <UserPlus className="w-5 h-5 text-green-600" />
              </div>
              <p className="font-medium text-gray-900 text-sm">Recruits</p>
            </Link>

            <Link
              href="/agent/dashboard/production"
              className="card-gradient hover:shadow-lg transition-shadow text-center"
            >
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <p className="font-medium text-gray-900 text-sm">Production</p>
            </Link>

            <Link
              href="/agent/dashboard/licensing"
              className="card-gradient hover:shadow-lg transition-shadow text-center"
            >
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="font-medium text-gray-900 text-sm">Licensing</p>
            </Link>

            <Link
              href="/agent/dashboard/reports"
              className="card-gradient hover:shadow-lg transition-shadow text-center"
            >
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Briefcase className="w-5 h-5 text-red-600" />
              </div>
              <p className="font-medium text-gray-900 text-sm">Reports</p>
            </Link>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-red-600">Error loading dashboard data. Please try again later.</p>
          {process.env.NODE_ENV !== 'production' && (
            <p className="text-sm text-gray-500 mt-2">Debug: {errorMessage}</p>
          )}
        </div>
      </div>
    );
  }
}
