import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Search,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Eye
} from 'lucide-react';

export default async function BalanceSheetsPage() {
  const session = await getSession();
  if (!session.agentId) redirect('/agent/login');

  // Fetch all prospects with financial profiles (this agent's OR unassigned)
  const prospects = await db.prospect.findMany({
    where: {
      OR: [
        { agentId: session.agentId },
        { agentId: null }
      ]
    },
    include: {
      financialProfile: true,
      insuranceNeeds: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate totals
  const prospectsWithProfiles = prospects.filter(p => p.financialProfile);

  const totalNetWorth = prospectsWithProfiles.reduce((sum, p) => {
    const profile = p.financialProfile!;
    const assets = Number(profile.savings) + Number(profile.investments) +
                   Number(profile.retirement401k) + Number(profile.homeEquity) +
                   Number(profile.otherAssets);
    const liabilities = Number(profile.mortgage) + Number(profile.carLoans) +
                        Number(profile.studentLoans) + Number(profile.creditCards) +
                        Number(profile.otherDebts);
    return sum + (assets - liabilities);
  }, 0);

  const totalProtectionGap = prospectsWithProfiles.reduce((sum, p) => {
    return sum + Number(p.financialProfile?.protectionGap || 0);
  }, 0);

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    LEAD: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'New Lead' },
    QUALIFIED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Qualified' },
    INSURANCE_CLIENT: { bg: 'bg-green-100', text: 'text-green-700', label: 'Client' },
    AGENT_PROSPECT: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Agent Prospect' },
    LICENSED_AGENT: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Licensed' },
    INACTIVE: { bg: 'bg-red-100', text: 'text-red-700', label: 'Inactive' },
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Personal Balance Sheets</h1>
        <p className="text-gray-600">View comprehensive financial snapshots for all prospects</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card-gradient">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{prospectsWithProfiles.length}</p>
              <p className="text-sm text-gray-600">Balance Sheets</p>
            </div>
          </div>
        </div>

        <div className="card-gradient">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${totalNetWorth >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {totalNetWorth >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div>
              <p className={`text-3xl font-bold ${totalNetWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(totalNetWorth).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Net Worth</p>
            </div>
          </div>
        </div>

        <div className="card-gradient">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-600">
                ${(totalProtectionGap / 1000000).toFixed(1)}M
              </p>
              <p className="text-sm text-gray-600">Total Protection Gap</p>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Sheets List */}
      <div className="card-gradient">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">All Balance Sheets</h2>
          <Link
            href="/prospect"
            className="btn-primary text-sm"
          >
            + New Intake
          </Link>
        </div>

        {prospects.length === 0 ? (
          <div className="text-center py-12">
            <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No balance sheets yet</p>
            <Link href="/prospect" className="btn-primary">
              Start First Intake
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Net Worth</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Protection Gap</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Profile</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prospects.map((prospect) => {
                  const profile = prospect.financialProfile;
                  const status = statusColors[prospect.status] || statusColors.LEAD;

                  let netWorth = 0;
                  if (profile) {
                    const assets = Number(profile.savings) + Number(profile.investments) +
                                   Number(profile.retirement401k) + Number(profile.homeEquity) +
                                   Number(profile.otherAssets);
                    const liabilities = Number(profile.mortgage) + Number(profile.carLoans) +
                                        Number(profile.studentLoans) + Number(profile.creditCards) +
                                        Number(profile.otherDebts);
                    netWorth = assets - liabilities;
                  }

                  const protectionGap = profile ? Number(profile.protectionGap) : 0;

                  return (
                    <tr key={prospect.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {prospect.firstName[0]}{prospect.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {prospect.firstName} {prospect.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{prospect.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {profile ? (
                          <span className={`font-semibold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${netWorth.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {profile && protectionGap > 0 ? (
                          <span className="font-semibold text-amber-600">
                            ${protectionGap.toLocaleString()}
                          </span>
                        ) : profile ? (
                          <span className="text-green-600">Covered</span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {profile ? (
                          <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Complete
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
                            <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {profile ? (
                          <Link
                            href={`/agent/dashboard/balance-sheets/${prospect.id}`}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Link>
                        ) : (
                          <Link
                            href={`/prospect?id=${prospect.id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Complete Intake
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
