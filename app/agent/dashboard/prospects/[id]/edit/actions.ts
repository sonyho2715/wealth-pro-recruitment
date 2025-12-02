'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

interface UpdateProspectData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  financialProfile: {
    annualIncome: number;
    spouseIncome: number;
    otherIncome: number;
    monthlyExpenses: number;
    housingCost: number;
    debtPayments: number;
    savings: number;
    investments: number;
    retirement401k: number;
    homeEquity: number;
    otherAssets: number;
    mortgage: number;
    carLoans: number;
    studentLoans: number;
    creditCards: number;
    otherDebts: number;
    age: number;
    spouseAge: number;
    dependents: number;
    retirementAge: number;
    currentLifeInsurance: number;
    currentDisability: number;
  };
}

export async function updateProspect(prospectId: string, data: UpdateProspectData) {
  try {
    const session = await getSession();
    if (!session.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate status
    const validStatuses = ['LEAD', 'QUALIFIED', 'INSURANCE_CLIENT', 'AGENT_PROSPECT', 'LICENSED_AGENT', 'INACTIVE'];
    if (!validStatuses.includes(data.status)) {
      return { success: false, error: 'Invalid status' };
    }

    // Calculate net worth and gaps
    const totalAssets = data.financialProfile.savings +
      data.financialProfile.investments +
      data.financialProfile.retirement401k +
      data.financialProfile.homeEquity +
      data.financialProfile.otherAssets;

    const totalLiabilities = data.financialProfile.mortgage +
      data.financialProfile.carLoans +
      data.financialProfile.studentLoans +
      data.financialProfile.creditCards +
      data.financialProfile.otherDebts;

    const netWorth = totalAssets - totalLiabilities;

    const totalMonthlyIncome = (
      data.financialProfile.annualIncome +
      data.financialProfile.spouseIncome +
      data.financialProfile.otherIncome
    ) / 12;
    const monthlyGap = totalMonthlyIncome - data.financialProfile.monthlyExpenses;

    // Calculate protection gap (10x income rule for life insurance)
    const recommendedCoverage = data.financialProfile.annualIncome * 10;
    const protectionGap = recommendedCoverage - data.financialProfile.currentLifeInsurance;

    // Update prospect basic info
    await db.prospect.update({
      where: { id: prospectId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        phone: data.phone || null,
        status: data.status as any,
      },
    });

    // Update or create financial profile
    await db.financialProfile.upsert({
      where: { prospectId },
      update: {
        annualIncome: data.financialProfile.annualIncome,
        spouseIncome: data.financialProfile.spouseIncome,
        otherIncome: data.financialProfile.otherIncome,
        monthlyExpenses: data.financialProfile.monthlyExpenses,
        housingCost: data.financialProfile.housingCost,
        debtPayments: data.financialProfile.debtPayments,
        savings: data.financialProfile.savings,
        investments: data.financialProfile.investments,
        retirement401k: data.financialProfile.retirement401k,
        homeEquity: data.financialProfile.homeEquity,
        otherAssets: data.financialProfile.otherAssets,
        mortgage: data.financialProfile.mortgage,
        carLoans: data.financialProfile.carLoans,
        studentLoans: data.financialProfile.studentLoans,
        creditCards: data.financialProfile.creditCards,
        otherDebts: data.financialProfile.otherDebts,
        age: data.financialProfile.age,
        spouseAge: data.financialProfile.spouseAge || null,
        dependents: data.financialProfile.dependents,
        retirementAge: data.financialProfile.retirementAge,
        currentLifeInsurance: data.financialProfile.currentLifeInsurance,
        currentDisability: data.financialProfile.currentDisability,
        netWorth,
        monthlyGap,
        protectionGap,
      },
      create: {
        prospectId,
        annualIncome: data.financialProfile.annualIncome,
        spouseIncome: data.financialProfile.spouseIncome,
        otherIncome: data.financialProfile.otherIncome,
        monthlyExpenses: data.financialProfile.monthlyExpenses,
        housingCost: data.financialProfile.housingCost,
        debtPayments: data.financialProfile.debtPayments,
        savings: data.financialProfile.savings,
        investments: data.financialProfile.investments,
        retirement401k: data.financialProfile.retirement401k,
        homeEquity: data.financialProfile.homeEquity,
        otherAssets: data.financialProfile.otherAssets,
        mortgage: data.financialProfile.mortgage,
        carLoans: data.financialProfile.carLoans,
        studentLoans: data.financialProfile.studentLoans,
        creditCards: data.financialProfile.creditCards,
        otherDebts: data.financialProfile.otherDebts,
        age: data.financialProfile.age,
        spouseAge: data.financialProfile.spouseAge || null,
        dependents: data.financialProfile.dependents,
        retirementAge: data.financialProfile.retirementAge,
        currentLifeInsurance: data.financialProfile.currentLifeInsurance,
        currentDisability: data.financialProfile.currentDisability,
        netWorth,
        monthlyGap,
        protectionGap,
      },
    });

    revalidatePath('/agent/dashboard');
    revalidatePath('/agent/dashboard/prospects');
    revalidatePath(`/agent/dashboard/balance-sheets/${prospectId}`);

    return { success: true };
  } catch (error) {
    console.error('Update prospect error:', error);
    return { success: false, error: 'Failed to update prospect' };
  }
}
