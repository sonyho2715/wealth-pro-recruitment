import { NextResponse } from 'next/server';
import { requireClient } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await requireClient();

    // Fetch client with related data
    const client = await db.client.findUnique({
      where: { id: session.clientId },
      include: {
        prospect: {
          include: {
            financialProfile: true,
            financialSnapshots: {
              orderBy: { snapshotDate: 'desc' },
              take: 12, // More snapshots for better chart visualization
            },
          },
        },
        businessProspect: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    const profile = client.prospect?.financialProfile;

    // Calculate totals from financial profile
    let totalAssets = 0;
    let totalLiabilities = 0;
    let netWorth = 0;

    if (profile) {
      // Sum up all asset fields
      totalAssets =
        Number(profile.savings || 0) +
        Number(profile.emergencyFund || 0) +
        Number(profile.investments || 0) +
        Number(profile.retirement401k || 0) +
        Number(profile.rothIra || 0) +
        Number(profile.pensionValue || 0) +
        Number(profile.hsaFsa || 0) +
        Number(profile.homeEquity || 0) +
        Number(profile.investmentProperty || 0) +
        Number(profile.businessEquity || 0) +
        Number(profile.otherAssets || 0);

      // Sum up all liability fields
      totalLiabilities =
        Number(profile.mortgage || 0) +
        Number(profile.carLoans || 0) +
        Number(profile.studentLoans || 0) +
        Number(profile.creditCards || 0) +
        Number(profile.personalLoans || 0) +
        Number(profile.otherDebts || 0);

      netWorth = totalAssets - totalLiabilities;
    }

    // Get snapshots for history chart
    const snapshots = client.prospect?.financialSnapshots || [];

    return NextResponse.json({
      success: true,
      data: {
        client: {
          id: client.id,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          lastLoginAt: client.lastLoginAt,
        },
        hasProspectData: !!client.prospect,
        hasBusinessData: !!client.businessProspect,
        financialSummary: profile
          ? {
              totalAssets,
              totalLiabilities,
              netWorth,
              annualIncome: Number(profile.annualIncome || 0),
              monthlyExpenses: Number(profile.monthlyExpenses || 0),
              lastUpdated: client.prospect?.updatedAt,
            }
          : null,
        snapshots: snapshots.map((s) => ({
          id: s.id,
          date: s.snapshotDate,
          totalAssets: Number(s.totalAssets),
          totalLiabilities: Number(s.totalLiabilities),
          netWorth: Number(s.netWorth),
        })),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
