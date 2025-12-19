import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { determineRevenueTier } from '@/lib/calibration-engine';
import { RevenueTier } from '@prisma/client';

/**
 * GET /api/calibration/benchmarks/[industryId]
 *
 * Returns industry benchmarks for calibration
 *
 * Query params:
 * - revenue: Optional revenue amount to determine tier
 * - tier: Optional explicit tier (overrides revenue)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ industryId: string }> }
) {
  try {
    const { industryId } = await params;
    const { searchParams } = new URL(req.url);
    const revenueParam = searchParams.get('revenue');
    const tierParam = searchParams.get('tier');

    // Determine revenue tier
    let revenueTier: RevenueTier = 'TIER_500K_1M'; // Default

    if (tierParam && Object.values(RevenueTier).includes(tierParam as RevenueTier)) {
      revenueTier = tierParam as RevenueTier;
    } else if (revenueParam) {
      const revenue = parseFloat(revenueParam);
      if (!isNaN(revenue)) {
        revenueTier = determineRevenueTier(revenue);
      }
    }

    // First try to get benchmark for specific tier
    let benchmark = await db.industryBenchmark.findFirst({
      where: {
        industryId,
        revenueTier,
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

    // If not found, try parent industry (2-digit sector)
    if (!benchmark) {
      const industry = await db.industryClassification.findUnique({
        where: { id: industryId },
        select: { parentCode: true },
      });

      if (industry?.parentCode) {
        const parentIndustry = await db.industryClassification.findUnique({
          where: { naicsCode: industry.parentCode },
        });

        if (parentIndustry) {
          benchmark = await db.industryBenchmark.findFirst({
            where: {
              industryId: parentIndustry.id,
              revenueTier,
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
        }
      }
    }

    // If still not found, try any tier for this industry
    if (!benchmark) {
      benchmark = await db.industryBenchmark.findFirst({
        where: { industryId },
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
    }

    if (!benchmark) {
      return NextResponse.json(
        { success: false, error: 'No benchmark data available for this industry' },
        { status: 404 }
      );
    }

    // Convert Decimal to number for JSON response
    const benchmarkData = {
      id: benchmark.id,
      industryId: benchmark.industryId,
      industry: benchmark.industry,
      revenueTier: benchmark.revenueTier,
      dataYear: benchmark.dataYear,

      // Profitability
      grossProfitMargin_p25: Number(benchmark.grossProfitMargin_p25),
      grossProfitMargin_p50: Number(benchmark.grossProfitMargin_p50),
      grossProfitMargin_p75: Number(benchmark.grossProfitMargin_p75),
      netProfitMargin_p25: Number(benchmark.netProfitMargin_p25),
      netProfitMargin_p50: Number(benchmark.netProfitMargin_p50),
      netProfitMargin_p75: Number(benchmark.netProfitMargin_p75),

      // Efficiency
      cogsRatio_p25: Number(benchmark.cogsRatio_p25),
      cogsRatio_p50: Number(benchmark.cogsRatio_p50),
      cogsRatio_p75: Number(benchmark.cogsRatio_p75),
      laborCostRatio_p25: Number(benchmark.laborCostRatio_p25),
      laborCostRatio_p50: Number(benchmark.laborCostRatio_p50),
      laborCostRatio_p75: Number(benchmark.laborCostRatio_p75),
      rentRatio_p25: Number(benchmark.rentRatio_p25),
      rentRatio_p50: Number(benchmark.rentRatio_p50),
      rentRatio_p75: Number(benchmark.rentRatio_p75),

      // Liquidity & Leverage
      currentRatio_p25: Number(benchmark.currentRatio_p25),
      currentRatio_p50: Number(benchmark.currentRatio_p50),
      currentRatio_p75: Number(benchmark.currentRatio_p75),
      debtToEquity_p25: Number(benchmark.debtToEquity_p25),
      debtToEquity_p50: Number(benchmark.debtToEquity_p50),
      debtToEquity_p75: Number(benchmark.debtToEquity_p75),

      // Pension
      pensionContributionRate_p25: Number(benchmark.pensionContributionRate_p25),
      pensionContributionRate_p50: Number(benchmark.pensionContributionRate_p50),
      pensionContributionRate_p75: Number(benchmark.pensionContributionRate_p75),

      sampleSize: benchmark.sampleSize,
    };

    return NextResponse.json({
      success: true,
      data: benchmarkData,
    });
  } catch (error) {
    console.error('Error fetching benchmarks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch industry benchmarks' },
      { status: 500 }
    );
  }
}
