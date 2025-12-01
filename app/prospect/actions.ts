'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import {
  calculateNetWorth,
  calculateMonthlyGap,
  calculateProtectionGap,
  generateInsuranceRecommendations,
  calculateAgentProjection,
  calculateComparison
} from '@/lib/calculations';
import {
  prospectSchema,
  financialProfileSchema,
  agentProjectionSchema,
  type ProspectInput,
  type FinancialProfileInput
} from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProspect(data: ProspectInput) {
  try {
    const validated = prospectSchema.parse(data);

    // Check if prospect already exists
    const existing = await db.prospect.findUnique({
      where: { email: validated.email }
    });

    if (existing) {
      // Update session and return existing
      const session = await getSession();
      session.prospectId = existing.id;
      session.email = existing.email;
      session.role = 'prospect';
      session.isLoggedIn = true;
      await session.save();

      return { success: true, prospectId: existing.id };
    }

    const prospect = await db.prospect.create({
      data: validated
    });

    // Save to session
    const session = await getSession();
    session.prospectId = prospect.id;
    session.email = prospect.email;
    session.role = 'prospect';
    session.isLoggedIn = true;
    await session.save();

    return { success: true, prospectId: prospect.id };
  } catch (error) {
    console.error('Error creating prospect:', error);
    return { success: false, error: 'Failed to save your information' };
  }
}

export async function saveFinancialProfile(prospectId: string, data: FinancialProfileInput) {
  try {
    const validated = financialProfileSchema.parse(data);

    // Calculate derived values
    const netWorth = calculateNetWorth(validated);
    const monthlyGap = calculateMonthlyGap(validated);
    const protectionGap = calculateProtectionGap({
      annualIncome: validated.annualIncome,
      spouseIncome: validated.spouseIncome,
      age: validated.age,
      retirementAge: validated.retirementAge,
      dependents: validated.dependents,
      mortgage: validated.mortgage,
      carLoans: validated.carLoans,
      studentLoans: validated.studentLoans,
      creditCards: validated.creditCards,
      otherDebts: validated.otherDebts,
      currentLifeInsurance: validated.currentLifeInsurance || 0
    });

    // Upsert the financial profile
    const profile = await db.financialProfile.upsert({
      where: { prospectId },
      create: {
        prospectId,
        ...validated,
        spouseIncome: validated.spouseIncome ?? null,
        otherIncome: validated.otherIncome ?? null,
        spouseAge: validated.spouseAge ?? null,
        netWorth,
        monthlyGap,
        protectionGap
      },
      update: {
        ...validated,
        spouseIncome: validated.spouseIncome ?? null,
        otherIncome: validated.otherIncome ?? null,
        spouseAge: validated.spouseAge ?? null,
        netWorth,
        monthlyGap,
        protectionGap
      }
    });

    // Generate and save insurance recommendations
    const recommendations = generateInsuranceRecommendations({
      ...validated,
      currentLifeInsurance: validated.currentLifeInsurance || 0,
      currentDisability: validated.currentDisability || 0
    });

    // Delete existing recommendations and create new ones
    await db.insuranceNeed.deleteMany({ where: { prospectId } });

    for (const rec of recommendations) {
      await db.insuranceNeed.create({
        data: {
          prospectId,
          type: rec.type,
          recommendedCoverage: rec.recommendedCoverage,
          currentCoverage: rec.currentCoverage,
          gap: rec.gap,
          monthlyPremium: rec.estimatedMonthlyPremium,
          priority: rec.priority,
          reasoning: rec.reasoning
        }
      });
    }

    // Update prospect status
    await db.prospect.update({
      where: { id: prospectId },
      data: { status: 'QUALIFIED' }
    });

    revalidatePath('/prospect/results');
    return { success: true, profileId: profile.id };
  } catch (error) {
    console.error('Error saving financial profile:', error);
    return { success: false, error: 'Failed to save your financial information' };
  }
}

export async function generateAgentProjection(prospectId: string, hoursPerWeek: number, networkSize: number) {
  try {
    const profile = await db.financialProfile.findUnique({
      where: { prospectId }
    });

    if (!profile) {
      return { success: false, error: 'Financial profile not found' };
    }

    // Calculate agent projection
    const agentProjection = calculateAgentProjection({
      hoursPerWeek,
      networkSize,
      startingAge: profile.age
    });

    // Save agent projection
    await db.agentProjection.upsert({
      where: { prospectId },
      create: {
        prospectId,
        hoursPerWeek,
        networkSize,
        yearlyProjections: agentProjection.yearlyProjections,
        year1Income: agentProjection.year1Income,
        year3Income: agentProjection.year3Income,
        year5Income: agentProjection.year5Income,
        lifetimeValue: agentProjection.lifetimeValue
      },
      update: {
        hoursPerWeek,
        networkSize,
        yearlyProjections: agentProjection.yearlyProjections,
        year1Income: agentProjection.year1Income,
        year3Income: agentProjection.year3Income,
        year5Income: agentProjection.year5Income,
        lifetimeValue: agentProjection.lifetimeValue
      }
    });

    // Calculate comparison
    const comparison = calculateComparison({
      currentAge: profile.age,
      retirementAge: profile.retirementAge,
      currentIncome: Number(profile.annualIncome),
      currentSavings: Number(profile.savings) + Number(profile.investments) + Number(profile.retirement401k),
      monthlyContribution: Math.max(0, Number(profile.monthlyGap) * 0.3),
      agentYear1Income: agentProjection.year1Income,
      agentYear5Income: agentProjection.year5Income
    });

    // Save comparison
    await db.comparison.upsert({
      where: { id: `${prospectId}-default` },
      create: {
        id: `${prospectId}-default`,
        prospectId,
        name: 'Default Comparison',
        baselineProjection: comparison.baseline.projection,
        baselineRetirementAge: comparison.baseline.retirementAge,
        baselineNetWorthAt65: comparison.baseline.netWorthAt65,
        agentProjection: comparison.withAgent.projection,
        agentRetirementAge: comparison.withAgent.retirementAge,
        agentNetWorthAt65: comparison.withAgent.netWorthAt65,
        additionalIncome: comparison.additionalIncome,
        yearsEarlierRetirement: comparison.yearsEarlierRetirement,
        additionalNetWorth: comparison.additionalNetWorth
      },
      update: {
        baselineProjection: comparison.baseline.projection,
        baselineRetirementAge: comparison.baseline.retirementAge,
        baselineNetWorthAt65: comparison.baseline.netWorthAt65,
        agentProjection: comparison.withAgent.projection,
        agentRetirementAge: comparison.withAgent.retirementAge,
        agentNetWorthAt65: comparison.withAgent.netWorthAt65,
        additionalIncome: comparison.additionalIncome,
        yearsEarlierRetirement: comparison.yearsEarlierRetirement,
        additionalNetWorth: comparison.additionalNetWorth
      }
    });

    // Update prospect status
    await db.prospect.update({
      where: { id: prospectId },
      data: { status: 'AGENT_PROSPECT' }
    });

    revalidatePath('/prospect/results');
    return { success: true, projection: agentProjection, comparison };
  } catch (error) {
    console.error('Error generating agent projection:', error);
    return { success: false, error: 'Failed to generate projection' };
  }
}

export async function getProspectData(prospectId: string) {
  try {
    const prospect = await db.prospect.findUnique({
      where: { id: prospectId },
      include: {
        financialProfile: true,
        insuranceNeeds: {
          orderBy: { priority: 'asc' }
        },
        agentProjection: true,
        comparisons: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    return prospect;
  } catch (error) {
    console.error('Error fetching prospect data:', error);
    return null;
  }
}
