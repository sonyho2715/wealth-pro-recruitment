import type { InsuranceQuote, InsuranceProduct } from '../types/financial.types';

/**
 * Calculate term life insurance premium estimate
 */
export function calculateTermLifePremium(
  age: number,
  coverageAmount: number,
  term: 10 | 20 | 30
): number {
  // Base rate per $1000 of coverage per month
  let baseRate = 0.05;

  // Age adjustments
  if (age < 30) baseRate *= 0.8;
  else if (age >= 30 && age < 40) baseRate *= 1.0;
  else if (age >= 40 && age < 50) baseRate *= 1.5;
  else if (age >= 50 && age < 60) baseRate *= 2.5;
  else baseRate *= 4.0;

  // Term adjustments
  if (term === 10) baseRate *= 0.8;
  else if (term === 20) baseRate *= 1.0;
  else if (term === 30) baseRate *= 1.3;

  // Calculate monthly premium
  const monthlyPremium = (coverageAmount / 1000) * baseRate;

  return Math.round(monthlyPremium);
}

/**
 * Calculate disability insurance premium estimate
 */
export function calculateDisabilityPremium(
  age: number,
  monthlyBenefit: number,
  waitingPeriod: 30 | 60 | 90 = 90
): number {
  // Base rate as % of monthly benefit
  let baseRate = 0.02;

  // Age adjustments
  if (age < 30) baseRate *= 0.9;
  else if (age >= 30 && age < 40) baseRate *= 1.0;
  else if (age >= 40 && age < 50) baseRate *= 1.3;
  else if (age >= 50 && age < 60) baseRate *= 1.7;
  else baseRate *= 2.2;

  // Waiting period adjustments (longer wait = lower premium)
  if (waitingPeriod === 30) baseRate *= 1.4;
  else if (waitingPeriod === 60) baseRate *= 1.15;
  else if (waitingPeriod === 90) baseRate *= 1.0;

  const monthlyPremium = monthlyBenefit * baseRate;

  return Math.round(monthlyPremium);
}

/**
 * Generate insurance product recommendations based on client data
 */
export function generateInsuranceRecommendations(
  age: number,
  income: number,
  hasLifeInsurance: boolean,
  hasDisabilityInsurance: boolean,
  hasUmbrellaPolicy: boolean,
  lifeInsuranceGap: number
): InsuranceProduct[] {
  const products: InsuranceProduct[] = [];

  // Term Life Insurance
  if (!hasLifeInsurance || lifeInsuranceGap > 0) {
    const coverage = income * 10;
    const monthlyPremium = calculateTermLifePremium(age, coverage, 20);

    products.push({
      id: 'term-life-20',
      type: 'life',
      name: '20-Year Term Life Insurance',
      description: 'Cost-effective protection for your family\'s financial security',
      priority: 'critical',
      estimatedCost: {
        min: monthlyPremium * 0.8,
        max: monthlyPremium * 1.2,
        unit: 'month',
      },
      coverageAmount: coverage,
      features: [
        'Level premiums for 20 years',
        'Convertible to permanent insurance',
        'Coverage up to age 70',
        'No medical exam options available',
      ],
      recommended: true,
      reason: lifeInsuranceGap > 0
        ? `You have a $${(lifeInsuranceGap / 1000).toFixed(0)}K protection gap`
        : 'Essential protection for your family',
    });
  }

  // Disability Insurance
  if (!hasDisabilityInsurance) {
    const monthlyBenefit = (income * 0.6) / 12;
    const monthlyPremium = calculateDisabilityPremium(age, monthlyBenefit, 90);

    products.push({
      id: 'disability-insurance',
      type: 'disability',
      name: 'Disability Income Protection',
      description: 'Protect your income if you\'re unable to work due to injury or illness',
      priority: 'critical',
      estimatedCost: {
        min: monthlyPremium * 0.8,
        max: monthlyPremium * 1.2,
        unit: 'month',
      },
      coverageAmount: monthlyBenefit * 12,
      features: [
        '60% income replacement',
        '90-day waiting period',
        'Own-occupation coverage',
        'Cost of living adjustments',
      ],
      recommended: true,
      reason: 'Your income is your most valuable asset',
    });
  }

  // Umbrella Liability
  if (!hasUmbrellaPolicy) {
    products.push({
      id: 'umbrella-policy',
      type: 'umbrella',
      name: 'Personal Umbrella Policy',
      description: 'Extra liability protection beyond your auto and home insurance',
      priority: 'high',
      estimatedCost: {
        min: 200,
        max: 400,
        unit: 'year',
      },
      coverageAmount: 1000000,
      features: [
        '$1-2M additional liability coverage',
        'Protects your assets from lawsuits',
        'Covers auto, home, and personal liability',
        'Very affordable coverage',
      ],
      recommended: true,
      reason: 'Protects your assets from unexpected liability claims',
    });
  }

  // Long-term Care (for older clients)
  if (age >= 50) {
    products.push({
      id: 'long-term-care',
      type: 'long-term-care',
      name: 'Long-Term Care Insurance',
      description: 'Coverage for assisted living, nursing home, or in-home care costs',
      priority: 'medium',
      estimatedCost: {
        min: 150,
        max: 350,
        unit: 'month',
      },
      features: [
        'Covers nursing home costs',
        'In-home care benefits',
        'Inflation protection',
        'Shared care options for couples',
      ],
      recommended: age >= 55,
      reason: 'Protect retirement savings from long-term care expenses',
    });
  }

  return products.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Generate insurance quote
 */
export function generateInsuranceQuote(
  productType: 'life' | 'disability',
  age: number,
  coverageAmount: number,
  term?: number,
  waitingPeriod?: number
): InsuranceQuote {
  if (productType === 'life' && term) {
    const monthlyPremium = calculateTermLifePremium(age, coverageAmount, term as 10 | 20 | 30);
    return {
      productType: `${term}-Year Term Life`,
      coverageAmount,
      term,
      monthlyPremium,
      annualPremium: monthlyPremium * 12,
    };
  } else if (productType === 'disability') {
    const monthlyBenefit = coverageAmount / 12;
    const monthlyPremium = calculateDisabilityPremium(
      age,
      monthlyBenefit,
      (waitingPeriod as 30 | 60 | 90) || 90
    );
    return {
      productType: 'Disability Income',
      coverageAmount,
      monthlyPremium,
      annualPremium: monthlyPremium * 12,
      waitingPeriod: waitingPeriod || 90,
      benefitPeriod: 'To Age 65',
    };
  }

  // Default return
  return {
    productType: 'Unknown',
    coverageAmount: 0,
    monthlyPremium: 0,
    annualPremium: 0,
  };
}
