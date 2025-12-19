import { NextResponse } from 'next/server';
import { requireClient } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await requireClient();

    // Fetch client with snapshots
    const client = await db.client.findUnique({
      where: { id: session.clientId },
      include: {
        prospect: {
          include: {
            financialSnapshots: {
              orderBy: { snapshotDate: 'desc' },
            },
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    if (!client.prospect) {
      return NextResponse.json({
        success: true,
        data: {
          snapshots: [],
          hasProspect: false,
        },
      });
    }

    const snapshots = client.prospect.financialSnapshots.map((s) => ({
      id: s.id,
      date: s.snapshotDate,
      totalAssets: Number(s.totalAssets),
      totalLiabilities: Number(s.totalLiabilities),
      netWorth: Number(s.netWorth),
      assetsBreakdown: s.assetsBreakdown,
      liabilitiesBreakdown: s.liabilitiesBreakdown,
      incomeBreakdown: s.incomeBreakdown,
      notes: s.notes,
    }));

    // Calculate changes between snapshots
    const snapshotsWithChanges = snapshots.map((snapshot, index) => {
      const previousSnapshot = snapshots[index + 1]; // Previous in time (next in array since sorted desc)

      return {
        ...snapshot,
        changes: previousSnapshot
          ? {
              netWorthChange: snapshot.netWorth - previousSnapshot.netWorth,
              assetsChange: snapshot.totalAssets - previousSnapshot.totalAssets,
              liabilitiesChange: snapshot.totalLiabilities - previousSnapshot.totalLiabilities,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        snapshots: snapshotsWithChanges,
        hasProspect: true,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('History API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
