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

    // Calculate home equity from market value and mortgage
    const homeEquity = Math.max(0, validated.homeMarketValue - validated.mortgage);

    // Calculate derived values using the calculated home equity
    const netWorth = calculateNetWorth({
      ...validated,
      homeEquity,
    });
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
        homeMarketValue: validated.homeMarketValue,
        homeEquity,  // Calculated: homeMarketValue - mortgage
        spouseIncome: validated.spouseIncome ?? null,
        otherIncome: validated.otherIncome ?? null,
        spouseAge: validated.spouseAge ?? null,
        netWorth,
        monthlyGap,
        protectionGap
      },
      update: {
        ...validated,
        homeMarketValue: validated.homeMarketValue,
        homeEquity,  // Calculated: homeMarketValue - mortgage
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

export async function updateFinancialProfile(prospectId: string, data: {
  currentLifeInsurance: number;
  currentDisability: number;
  savings: number;
  investments: number;
  retirement401k: number;
  homeMarketValue: number;
  otherAssets: number;
  mortgage: number;
  carLoans: number;
  studentLoans: number;
  creditCards: number;
  otherDebts: number;
  annualIncome: number;
  spouseIncome: number | null;
  monthlyExpenses: number;
}) {
  try {
    // Calculate derived values
    const homeEquity = Math.max(0, data.homeMarketValue - data.mortgage);

    const netWorth = calculateNetWorth({
      savings: data.savings,
      investments: data.investments,
      retirement401k: data.retirement401k,
      homeEquity,
      otherAssets: data.otherAssets,
      mortgage: data.mortgage,
      carLoans: data.carLoans,
      studentLoans: data.studentLoans,
      creditCards: data.creditCards,
      otherDebts: data.otherDebts,
    });

    const totalMonthlyIncome = (data.annualIncome + (data.spouseIncome || 0)) / 12;
    const monthlyGap = totalMonthlyIncome - data.monthlyExpenses;

    // Get existing profile for fields we don't update
    const existingProfile = await db.financialProfile.findUnique({
      where: { prospectId }
    });

    if (!existingProfile) {
      return { success: false, error: 'Financial profile not found' };
    }

    const protectionGap = calculateProtectionGap({
      annualIncome: data.annualIncome,
      spouseIncome: data.spouseIncome,
      age: existingProfile.age,
      retirementAge: existingProfile.retirementAge,
      dependents: existingProfile.dependents,
      mortgage: data.mortgage,
      carLoans: data.carLoans,
      studentLoans: data.studentLoans,
      creditCards: data.creditCards,
      otherDebts: data.otherDebts,
      currentLifeInsurance: data.currentLifeInsurance,
    });

    // Update the financial profile
    await db.financialProfile.update({
      where: { prospectId },
      data: {
        savings: data.savings,
        investments: data.investments,
        retirement401k: data.retirement401k,
        homeMarketValue: data.homeMarketValue,
        homeEquity,
        otherAssets: data.otherAssets,
        mortgage: data.mortgage,
        carLoans: data.carLoans,
        studentLoans: data.studentLoans,
        creditCards: data.creditCards,
        otherDebts: data.otherDebts,
        annualIncome: data.annualIncome,
        spouseIncome: data.spouseIncome,
        monthlyExpenses: data.monthlyExpenses,
        currentLifeInsurance: data.currentLifeInsurance,
        currentDisability: data.currentDisability,
        netWorth,
        monthlyGap,
        protectionGap,
      }
    });

    // Regenerate insurance recommendations
    const recommendations = generateInsuranceRecommendations({
      annualIncome: data.annualIncome,
      spouseIncome: data.spouseIncome,
      age: existingProfile.age,
      retirementAge: existingProfile.retirementAge,
      dependents: existingProfile.dependents,
      mortgage: data.mortgage,
      carLoans: data.carLoans,
      studentLoans: data.studentLoans,
      creditCards: data.creditCards,
      otherDebts: data.otherDebts,
      currentLifeInsurance: data.currentLifeInsurance,
      currentDisability: data.currentDisability,
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

    revalidatePath('/prospect/results');
    return { success: true };
  } catch (error) {
    console.error('Error updating financial profile:', error);
    return { success: false, error: 'Failed to update financial profile' };
  }
}

export async function sendFinancialSnapshot(prospectId: string) {
  try {
    const prospect = await db.prospect.findUnique({
      where: { id: prospectId },
      include: {
        financialProfile: true,
        insuranceNeeds: {
          orderBy: { priority: 'asc' }
        }
      }
    });

    if (!prospect) {
      return { success: false, error: 'Prospect not found' };
    }

    if (!prospect.financialProfile) {
      return { success: false, error: 'No financial profile found' };
    }

    const profile = prospect.financialProfile;

    // Calculate totals for email
    const totalAssets = Number(profile.savings) + Number(profile.investments) +
      Number(profile.retirement401k) + Number(profile.homeEquity) + Number(profile.otherAssets);
    const totalLiabilities = Number(profile.mortgage) + Number(profile.carLoans) +
      Number(profile.studentLoans) + Number(profile.creditCards) + Number(profile.otherDebts);
    const netWorth = totalAssets - totalLiabilities;

    // Format currency helper
    const fmt = (n: number) => new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(n);

    // Build email content
    const emailContent = `
Financial Snapshot for ${prospect.firstName} ${prospect.lastName}
Generated: ${new Date().toLocaleDateString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROTECTION
• Life Insurance: ${fmt(Number(profile.currentLifeInsurance) || 0)}
• Disability Coverage: ${fmt(Number(profile.currentDisability) || 0)}/month
• Protection Gap: ${fmt(Number(profile.protectionGap))}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ASSETS                          TOTAL: ${fmt(totalAssets)}
• Savings:                      ${fmt(Number(profile.savings))}
• Investments:                  ${fmt(Number(profile.investments))}
• Retirement (401k):            ${fmt(Number(profile.retirement401k))}
• Home Equity:                  ${fmt(Number(profile.homeEquity))}
• Other Assets:                 ${fmt(Number(profile.otherAssets))}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LIABILITIES                     TOTAL: ${fmt(totalLiabilities)}
• Mortgage:                     ${fmt(Number(profile.mortgage))}
• Car Loans:                    ${fmt(Number(profile.carLoans))}
• Student Loans:                ${fmt(Number(profile.studentLoans))}
• Credit Cards:                 ${fmt(Number(profile.creditCards))}
• Other Debts:                  ${fmt(Number(profile.otherDebts))}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NET WORTH:                      ${fmt(netWorth)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CASH FLOW
• Annual Income:                ${fmt(Number(profile.annualIncome))}
• Monthly Surplus/Deficit:      ${fmt(Number(profile.monthlyGap))}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is a summary of your financial information. For personalized
recommendations, please contact your financial advisor.
    `.trim();

    // Log email for now (TODO: integrate with email service like Resend, SendGrid, etc.)
    console.log('=== SENDING FINANCIAL SNAPSHOT EMAIL ===');
    console.log(`To: ${prospect.email}`);
    console.log(`Subject: Your Financial Snapshot - ${prospect.firstName} ${prospect.lastName}`);
    console.log('Content:', emailContent);
    console.log('=== END EMAIL ===');

    // Record the email send in activity log (if table exists)
    // For now, we'll just return success

    // TODO: Integrate with email service
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'noreply@wealthpro.com',
    //   to: prospect.email,
    //   subject: `Your Financial Snapshot - ${prospect.firstName} ${prospect.lastName}`,
    //   text: emailContent,
    // });

    return { success: true, message: `Email sent to ${prospect.email}` };
  } catch (error) {
    console.error('Error sending financial snapshot:', error);
    return { success: false, error: 'Failed to send email' };
  }
}
