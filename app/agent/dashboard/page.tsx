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
  Mail
} from 'lucide-react';

export default async function DashboardOverviewPage() {
  const session = await getSession();
  if (!session.agentId) redirect('/agent/login');

  // Fetch all data for overview
  const [prospects, activities, commissions] = await Promise.all([
    db.prospect.findMany({
      where: { agentId: session.agentId },
      include: {
        financialProfile: true,
        agentProjection: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    db.activity.findMany({
      where: { agentId: session.agentId },
      include: { prospect: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    db.commission.findMany({
      where: { agentId: session.agentId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  // Calculate stats
  const totalProspects = prospects.length;
  const qualified = prospects.filter(p => p.status !== 'LEAD' && p.status !== 'INACTIVE').length;
  const totalProtectionGap = prospects.reduce(
    (sum, p) => sum + Number(p.financialProfile?.protectionGap || 0),
    0
  );
  const agentProspects = prospects.filter(p => p.status === 'AGENT_PROSPECT').length;
  const pendingCommissions = commissions
    .filter(c => c.status === 'PENDING')
    .reduce((sum, c) => sum + Number(c.amount), 0);
  const paidCommissions = commissions
    .filter(c => c.status === 'PAID')
    .reduce((sum, c) => sum + Number(c.amount), 0);

  // Recent prospects (last 5)
  const recentProspects = prospects.slice(0, 5);

  // Upcoming activities
  const upcomingActivities = activities.filter(
    a => a.scheduledAt && new Date(a.scheduledAt) > new Date() && !a.completedAt
  );

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card-gradient">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{totalProspects}</div>
              <div className="text-sm text-gray-600">Total Prospects</div>
            </div>
          </div>
        </div>

        <div className="card-gradient">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{qualified}</div>
              <div className="text-sm text-gray-600">Qualified</div>
            </div>
          </div>
        </div>

        <div className="card-gradient">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                ${(totalProtectionGap / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm text-gray-600">Protection Gap</div>
            </div>
          </div>
        </div>

        <div className="card-gradient">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{agentProspects}</div>
              <div className="text-sm text-gray-600">Agent Prospects</div>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="card-gradient">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                ${pendingCommissions.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Pending Commissions</div>
            </div>
          </div>
        </div>

        <div className="card-gradient">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                ${paidCommissions.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Paid (YTD)</div>
            </div>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/prospect"
            className="card-gradient hover:shadow-lg transition-shadow text-center"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <p className="font-medium text-gray-900">New Prospect</p>
            <p className="text-xs text-gray-500">Start financial intake</p>
          </Link>

          <Link
            href="/agent/dashboard/activities"
            className="card-gradient hover:shadow-lg transition-shadow text-center"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <p className="font-medium text-gray-900">Log Activity</p>
            <p className="text-xs text-gray-500">Record call or meeting</p>
          </Link>

          <Link
            href="/agent/dashboard/emails"
            className="card-gradient hover:shadow-lg transition-shadow text-center"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <p className="font-medium text-gray-900">Send Email</p>
            <p className="text-xs text-gray-500">Use a template</p>
          </Link>

          <Link
            href="/agent/dashboard/reports"
            className="card-gradient hover:shadow-lg transition-shadow text-center"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
            <p className="font-medium text-gray-900">View Reports</p>
            <p className="text-xs text-gray-500">Check performance</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
