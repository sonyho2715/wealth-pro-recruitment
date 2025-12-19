import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/calibration/industries
 *
 * Returns all active industry classifications with benchmark availability
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sector = searchParams.get('sector'); // Optional: filter by sector (2-digit NAICS)

    // Fetch all active industries
    const industries = await db.industryClassification.findMany({
      where: {
        isActive: true,
        ...(sector && { naicsCode: { startsWith: sector } }),
      },
      select: {
        id: true,
        naicsCode: true,
        title: true,
        shortTitle: true,
        level: true,
        parentCode: true,
        _count: {
          select: { benchmarks: true },
        },
      },
      orderBy: { naicsCode: 'asc' },
    });

    // Transform to add hasBenchmark flag
    const transformedIndustries = industries.map((industry) => ({
      id: industry.id,
      naicsCode: industry.naicsCode,
      title: industry.title,
      shortTitle: industry.shortTitle,
      level: industry.level,
      parentCode: industry.parentCode,
      hasBenchmark: industry._count.benchmarks > 0,
    }));

    return NextResponse.json({
      success: true,
      data: transformedIndustries,
    });
  } catch (error) {
    console.error('Error fetching industries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch industries' },
      { status: 500 }
    );
  }
}
