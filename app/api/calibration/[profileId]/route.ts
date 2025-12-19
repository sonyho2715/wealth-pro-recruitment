import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { Prisma, RevenueTier, HealthTrend } from '@prisma/client';

const calibrationSchema = z.object({
  industryId: z.string(),
  revenueTier: z.nativeEnum(RevenueTier),

  // Percentile scores (0-100)
  grossProfitPercentile: z.number().min(0).max(100),
  netProfitPercentile: z.number().min(0).max(100),
  cogsPercentile: z.number().min(0).max(100),
  laborCostPercentile: z.number().min(0).max(100),
  currentRatioPercentile: z.number().min(0).max(100),
  debtToEquityPercentile: z.number().min(0).max(100),
  pensionPercentile: z.number().min(0).max(100),

  // Composite
  healthScore: z.number().min(0).max(100),
  healthTrend: z.nativeEnum(HealthTrend),

  // Opportunities (in dollars)
  revenueOpportunity: z.number().default(0),
  cogsOpportunity: z.number().default(0),
  laborOpportunity: z.number().default(0),
  pensionOpportunity: z.number().default(0),
  totalOpportunity: z.number().default(0),

  // 5-year projections (stored as JSON)
  withoutScenario: z.array(z.any()).optional(),
  withScenario: z.array(z.any()).optional(),

  // Insights
  insights: z.array(z.any()).optional(),
});

/**
 * GET /api/calibration/[profileId]
 *
 * Get existing calibration for a business profile
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const { profileId } = await params;

    const calibration = await db.businessCalibration.findUnique({
      where: { businessProfileId: profileId },
      include: {
        industry: {
          select: {
            naicsCode: true,
            title: true,
            shortTitle: true,
          },
        },
      },
    });

    if (!calibration) {
      return NextResponse.json(
        { success: false, error: 'No calibration found for this profile' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: calibration,
    });
  } catch (error) {
    console.error('Error fetching calibration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calibration' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calibration/[profileId]
 *
 * Create or update calibration for a business profile
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const { profileId } = await params;
    const body = await req.json();
    const data = calibrationSchema.parse(body);

    // Verify business profile exists
    const profile = await db.businessFinancialProfile.findUnique({
      where: { id: profileId },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Business profile not found' },
        { status: 404 }
      );
    }

    // Verify industry exists
    const industry = await db.industryClassification.findUnique({
      where: { id: data.industryId },
      select: { id: true },
    });

    if (!industry) {
      return NextResponse.json(
        { success: false, error: 'Industry not found' },
        { status: 404 }
      );
    }

    // Create or update calibration
    const calibration = await db.businessCalibration.upsert({
      where: { businessProfileId: profileId },
      create: {
        businessProfileId: profileId,
        industryId: data.industryId,
        revenueTier: data.revenueTier,

        // Percentiles
        grossProfitPercentile: data.grossProfitPercentile,
        netProfitPercentile: data.netProfitPercentile,
        cogsPercentile: data.cogsPercentile,
        laborCostPercentile: data.laborCostPercentile,
        currentRatioPercentile: data.currentRatioPercentile,
        debtToEquityPercentile: data.debtToEquityPercentile,
        pensionPercentile: data.pensionPercentile,

        // Composite
        healthScore: data.healthScore,
        healthTrend: data.healthTrend,

        // Opportunities
        revenueOpportunity: data.revenueOpportunity,
        cogsOpportunity: data.cogsOpportunity,
        laborOpportunity: data.laborOpportunity,
        pensionOpportunity: data.pensionOpportunity,
        totalOpportunity: data.totalOpportunity,

        // Projections
        withoutScenario: data.withoutScenario ?? Prisma.JsonNull,
        withScenario: data.withScenario ?? Prisma.JsonNull,

        // Insights
        insights: data.insights ?? Prisma.JsonNull,
      },
      update: {
        industryId: data.industryId,
        revenueTier: data.revenueTier,

        // Percentiles
        grossProfitPercentile: data.grossProfitPercentile,
        netProfitPercentile: data.netProfitPercentile,
        cogsPercentile: data.cogsPercentile,
        laborCostPercentile: data.laborCostPercentile,
        currentRatioPercentile: data.currentRatioPercentile,
        debtToEquityPercentile: data.debtToEquityPercentile,
        pensionPercentile: data.pensionPercentile,

        // Composite
        healthScore: data.healthScore,
        healthTrend: data.healthTrend,

        // Opportunities
        revenueOpportunity: data.revenueOpportunity,
        cogsOpportunity: data.cogsOpportunity,
        laborOpportunity: data.laborOpportunity,
        pensionOpportunity: data.pensionOpportunity,
        totalOpportunity: data.totalOpportunity,

        // Projections
        withoutScenario: data.withoutScenario ?? Prisma.JsonNull,
        withScenario: data.withScenario ?? Prisma.JsonNull,

        // Insights
        insights: data.insights ?? Prisma.JsonNull,

        // Update timestamp
        calibratedAt: new Date(),
      },
      include: {
        industry: {
          select: {
            naicsCode: true,
            title: true,
            shortTitle: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: calibration,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error saving calibration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save calibration' },
      { status: 500 }
    );
  }
}
