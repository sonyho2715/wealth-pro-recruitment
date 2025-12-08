import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { provisionTenantDatabase, getTenantDatabaseInfo } from '@/lib/control-plane';

/**
 * POST /api/admin/white-label/provision
 * Provision a dedicated database for an organization (white-label setup)
 *
 * Only ADMIN users can provision databases
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.agentId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const agent = await db.agent.findUnique({
      where: { id: session.agentId },
      select: { role: true, organizationId: true },
    });

    if (agent?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { organizationId } = body;

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Check if already provisioned
    const existingInfo = await getTenantDatabaseInfo(organizationId);
    if (existingInfo.hasDedicatedDb) {
      return NextResponse.json({
        success: false,
        error: 'Organization already has a dedicated database',
        data: existingInfo,
      });
    }

    // Provision the database
    const result = await provisionTenantDatabase(organizationId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Database provisioned successfully',
      data: {
        organizationId,
        provisionedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Provision database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to provision database' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/white-label/provision?organizationId=xxx
 * Get database provisioning status for an organization
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.agentId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'organizationId is required' },
        { status: 400 }
      );
    }

    const info = await getTenantDatabaseInfo(organizationId);

    return NextResponse.json({
      success: true,
      data: info,
    });
  } catch (error) {
    console.error('Get database info error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get database info' },
      { status: 500 }
    );
  }
}
