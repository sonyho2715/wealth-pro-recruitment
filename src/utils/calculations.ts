import type { ClientData, FinancialMetrics, RiskAssessment, RiskCategory } from '../types/financial.types';

/**
 * Calculate State Tax for Multiple States (2024)
 */
export function calculateStateTax(taxableIncome: number, state: 'Hawaii' | 'California' | 'Nevada' | 'Texas' | 'Florida' | 'New York'): { stateTax: number; federalTax: number; totalTax: number; effectiveRate: number; stateName: string } {
  let stateTax = 0;

  switch (state) {
    case 'Hawaii':
      stateTax = calculateHawaiiStateTax(taxableIncome);
      break;
    case 'California':
      stateTax = calculateCaliforniaStateTax(taxableIncome);
      break;
    case 'Nevada':
      stateTax = 0; // No state income tax
      break;
    case 'Texas':
      stateTax = 0; // No state income tax
      break;
    case 'Florida':
      stateTax = 0; // No state income tax
      break;
    case 'New York':
      stateTax = calculateNewYorkStateTax(taxableIncome);
      break;
  }

  // Federal Tax (same for all states)
  const federalTax = calculateFederalTax(taxableIncome);
  const totalTax = stateTax + federalTax;
  const effectiveRate = taxableIncome > 0 ? (totalTax / taxableIncome) * 100 : 0;

  return {
    stateTax,
    federalTax,
    totalTax,
    effectiveRate,
    stateName: state,
  };
}

/**
 * Calculate Hawaii State Tax for 2024
 */
function calculateHawaiiStateTax(taxableIncome: number): number {
  // Hawaii State Tax Brackets 2024 (Single filer - adjust for married)
  let stateTax = 0;

  if (taxableIncome <= 2400) {
    stateTax = taxableIncome * 0.014;
  } else if (taxableIncome <= 4800) {
    stateTax = 2400 * 0.014 + (taxableIncome - 2400) * 0.032;
  } else if (taxableIncome <= 9600) {
    stateTax = 2400 * 0.014 + 2400 * 0.032 + (taxableIncome - 4800) * 0.055;
  } else if (taxableIncome <= 14400) {
    stateTax = 2400 * 0.014 + 2400 * 0.032 + 4800 * 0.055 + (taxableIncome - 9600) * 0.064;
  } else if (taxableIncome <= 19200) {
    stateTax = 2400 * 0.014 + 2400 * 0.032 + 4800 * 0.055 + 4800 * 0.064 + (taxableIncome - 14400) * 0.068;
  } else if (taxableIncome <= 24000) {
    stateTax = 2400 * 0.014 + 2400 * 0.032 + 4800 * 0.055 + 4800 * 0.064 + 4800 * 0.068 + (taxableIncome - 19200) * 0.072;
  } else if (taxableIncome <= 36000) {
    stateTax = 2400 * 0.014 + 2400 * 0.032 + 4800 * 0.055 + 4800 * 0.064 + 4800 * 0.068 + 4800 * 0.072 + (taxableIncome - 24000) * 0.076;
  } else if (taxableIncome <= 48000) {
    stateTax = 2400 * 0.014 + 2400 * 0.032 + 4800 * 0.055 + 4800 * 0.064 + 4800 * 0.068 + 4800 * 0.072 + 12000 * 0.076 + (taxableIncome - 36000) * 0.079;
  } else if (taxableIncome <= 150000) {
    stateTax = 2400 * 0.014 + 2400 * 0.032 + 4800 * 0.055 + 4800 * 0.064 + 4800 * 0.068 + 4800 * 0.072 + 12000 * 0.076 + 12000 * 0.079 + (taxableIncome - 48000) * 0.0825;
  } else if (taxableIncome <= 175000) {
    stateTax = 2400 * 0.014 + 2400 * 0.032 + 4800 * 0.055 + 4800 * 0.064 + 4800 * 0.068 + 4800 * 0.072 + 12000 * 0.076 + 12000 * 0.079 + 102000 * 0.0825 + (taxableIncome - 150000) * 0.09;
  } else if (taxableIncome <= 200000) {
    stateTax = 2400 * 0.014 + 2400 * 0.032 + 4800 * 0.055 + 4800 * 0.064 + 4800 * 0.068 + 4800 * 0.072 + 12000 * 0.076 + 12000 * 0.079 + 102000 * 0.0825 + 25000 * 0.09 + (taxableIncome - 175000) * 0.10;
  } else {
    stateTax = 2400 * 0.014 + 2400 * 0.032 + 4800 * 0.055 + 4800 * 0.064 + 4800 * 0.068 + 4800 * 0.072 + 12000 * 0.076 + 12000 * 0.079 + 102000 * 0.0825 + 25000 * 0.09 + 25000 * 0.10 + (taxableIncome - 200000) * 0.11;
  }

  return stateTax;
}

/**
 * Calculate California State Tax for 2024
 */
function calculateCaliforniaStateTax(taxableIncome: number): number {
  let stateTax = 0;

  if (taxableIncome <= 20198) {
    stateTax = taxableIncome * 0.01;
  } else if (taxableIncome <= 47884) {
    stateTax = 20198 * 0.01 + (taxableIncome - 20198) * 0.02;
  } else if (taxableIncome <= 75576) {
    stateTax = 20198 * 0.01 + 27686 * 0.02 + (taxableIncome - 47884) * 0.04;
  } else if (taxableIncome <= 104910) {
    stateTax = 20198 * 0.01 + 27686 * 0.02 + 27692 * 0.04 + (taxableIncome - 75576) * 0.06;
  } else if (taxableIncome <= 132590) {
    stateTax = 20198 * 0.01 + 27686 * 0.02 + 27692 * 0.04 + 29334 * 0.06 + (taxableIncome - 104910) * 0.08;
  } else if (taxableIncome <= 677278) {
    stateTax = 20198 * 0.01 + 27686 * 0.02 + 27692 * 0.04 + 29334 * 0.06 + 27680 * 0.08 + (taxableIncome - 132590) * 0.093;
  } else if (taxableIncome <= 812728) {
    stateTax = 20198 * 0.01 + 27686 * 0.02 + 27692 * 0.04 + 29334 * 0.06 + 27680 * 0.08 + 544688 * 0.093 + (taxableIncome - 677278) * 0.103;
  } else if (taxableIncome <= 1000000) {
    stateTax = 20198 * 0.01 + 27686 * 0.02 + 27692 * 0.04 + 29334 * 0.06 + 27680 * 0.08 + 544688 * 0.093 + 135450 * 0.103 + (taxableIncome - 812728) * 0.113;
  } else {
    stateTax = 20198 * 0.01 + 27686 * 0.02 + 27692 * 0.04 + 29334 * 0.06 + 27680 * 0.08 + 544688 * 0.093 + 135450 * 0.103 + 187272 * 0.113 + (taxableIncome - 1000000) * 0.123;
  }

  return stateTax;
}

/**
 * Calculate New York State Tax for 2024
 */
function calculateNewYorkStateTax(taxableIncome: number): number {
  let stateTax = 0;

  if (taxableIncome <= 17150) {
    stateTax = taxableIncome * 0.04;
  } else if (taxableIncome <= 23600) {
    stateTax = 17150 * 0.04 + (taxableIncome - 17150) * 0.045;
  } else if (taxableIncome <= 27900) {
    stateTax = 17150 * 0.04 + 6450 * 0.045 + (taxableIncome - 23600) * 0.0525;
  } else if (taxableIncome <= 161550) {
    stateTax = 17150 * 0.04 + 6450 * 0.045 + 4300 * 0.0525 + (taxableIncome - 27900) * 0.055;
  } else if (taxableIncome <= 323200) {
    stateTax = 17150 * 0.04 + 6450 * 0.045 + 4300 * 0.0525 + 133650 * 0.055 + (taxableIncome - 161550) * 0.06;
  } else if (taxableIncome <= 2155350) {
    stateTax = 17150 * 0.04 + 6450 * 0.045 + 4300 * 0.0525 + 133650 * 0.055 + 161650 * 0.06 + (taxableIncome - 323200) * 0.0685;
  } else if (taxableIncome <= 5000000) {
    stateTax = 17150 * 0.04 + 6450 * 0.045 + 4300 * 0.0525 + 133650 * 0.055 + 161650 * 0.06 + 1832150 * 0.0685 + (taxableIncome - 2155350) * 0.0965;
  } else {
    stateTax = 17150 * 0.04 + 6450 * 0.045 + 4300 * 0.0525 + 133650 * 0.055 + 161650 * 0.06 + 1832150 * 0.0685 + 2844650 * 0.0965 + (taxableIncome - 5000000) * 0.109;
  }

  return stateTax;
}

/**
 * Calculate Federal Tax (2024)
 */
function calculateFederalTax(taxableIncome: number): number {
  const standardDeduction = 29200; // 2024 married filing jointly
  const federalTaxableIncome = Math.max(0, taxableIncome - standardDeduction);

  if (federalTaxableIncome <= 22000) {
    return federalTaxableIncome * 0.10;
  } else if (federalTaxableIncome <= 89075) {
    return 22000 * 0.10 + (federalTaxableIncome - 22000) * 0.12;
  } else if (federalTaxableIncome <= 190750) {
    return 22000 * 0.10 + 67075 * 0.12 + (federalTaxableIncome - 89075) * 0.22;
  } else if (federalTaxableIncome <= 364200) {
    return 22000 * 0.10 + 67075 * 0.12 + 101675 * 0.22 + (federalTaxableIncome - 190750) * 0.24;
  } else if (federalTaxableIncome <= 462500) {
    return 22000 * 0.10 + 67075 * 0.12 + 101675 * 0.22 + 173450 * 0.24 + (federalTaxableIncome - 364200) * 0.32;
  } else if (federalTaxableIncome <= 693750) {
    return 22000 * 0.10 + 67075 * 0.12 + 101675 * 0.22 + 173450 * 0.24 + 98300 * 0.32 + (federalTaxableIncome - 462500) * 0.35;
  } else {
    return 22000 * 0.10 + 67075 * 0.12 + 101675 * 0.22 + 173450 * 0.24 + 98300 * 0.32 + 231250 * 0.35 + (federalTaxableIncome - 693750) * 0.37;
  }
}

/**
 * Legacy function - keeping for backward compatibility
 */
export function calculateHawaiiTax(taxableIncome: number): { stateTax: number; federalTax: number; totalTax: number; effectiveRate: number } {
  const result = calculateStateTax(taxableIncome, 'Hawaii');
  return {
    stateTax: result.stateTax,
    federalTax: result.federalTax,
    totalTax: result.totalTax,
    effectiveRate: result.effectiveRate,
  };
}

/**
 * Calculate goal progress (0-100% for each goal)
 */
function calculateGoalProgress(data: ClientData, metrics: FinancialMetrics) {
  if (!data.goals) return undefined;

  const goals = data.goals;
  const progress: NonNullable<FinancialMetrics['goalProgress']> = {};

  // Retirement Readiness (based on age and savings)
  if (goals.retirementAge) {
    const retirementSavings = data.retirement401k + data.retirementIRA + data.brokerage;
    const neededForRetirement = (goals.retirementIncome || metrics.totalIncome * 0.8) * 25; // 4% rule
    progress.retirementReadiness = Math.min(100, (retirementSavings / neededForRetirement) * 100);
  }

  // Emergency Fund Progress
  if (goals.emergencyFundMonths) {
    const liquidAssets = data.checking + data.savings;
    const targetEmergencyFund = metrics.totalMonthlyExpenses * goals.emergencyFundMonths;
    progress.emergencyFund = targetEmergencyFund > 0
      ? Math.min(100, (liquidAssets / targetEmergencyFund) * 100)
      : 100;
  }

  // Home Down Payment Progress
  if (goals.homeDownPayment && goals.homeDownPayment > 0) {
    const liquidAssets = data.checking + data.savings + data.brokerage;
    progress.homeDownPayment = Math.min(100, (liquidAssets / goals.homeDownPayment) * 100);
  }

  // Education Savings Progress
  if (goals.educationSavings && goals.educationSavings > 0) {
    // Assuming education savings would come from brokerage or dedicated accounts
    const educationFunds = data.brokerage * 0.3; // Estimate 30% of brokerage for education
    progress.educationSavings = Math.min(100, (educationFunds / goals.educationSavings) * 100);
  }

  // Debt Free Progress
  if (goals.debtFreeDate && metrics.totalLiabilities > 0) {
    const totalDebt = metrics.totalLiabilities;
    const paidOff = totalDebt === 0 ? 100 : 0; // Binary for now, can be improved with payment tracking
    progress.debtFreeProgress = paidOff;
  } else if (metrics.totalLiabilities === 0) {
    progress.debtFreeProgress = 100;
  }

  // Net Worth Progress
  if (goals.netWorthTarget && goals.netWorthTarget > 0) {
    progress.netWorthProgress = Math.min(100, Math.max(0, (metrics.netWorth / goals.netWorthTarget) * 100));
  }

  // Annual Savings Progress
  if (goals.annualSavingsTarget && goals.annualSavingsTarget > 0) {
    const annualSavings = metrics.totalIncome - metrics.annualExpenses;
    progress.savingsProgress = Math.min(100, Math.max(0, (annualSavings / goals.annualSavingsTarget) * 100));
  }

  // Major Purchase Progress
  if (goals.majorPurchase?.amount && goals.majorPurchase.amount > 0) {
    const liquidAssets = data.checking + data.savings;
    progress.majorPurchaseProgress = Math.min(100, (liquidAssets / goals.majorPurchase.amount) * 100);
  }

  return progress;
}

/**
 * Calculate all financial metrics from client data
 */
export function calculateFinancialMetrics(data: ClientData): FinancialMetrics {
  // Calculate totals
  const totalAssets =
    data.checking +
    data.savings +
    data.retirement401k +
    data.retirementIRA +
    data.brokerage +
    data.homeValue +
    data.otherAssets;

  const totalLiabilities =
    data.mortgage +
    data.studentLoans +
    data.carLoans +
    data.creditCards +
    data.otherDebts;

  const netWorth = totalAssets - totalLiabilities;

  const totalIncome = data.income + (data.spouseIncome || 0);

  const totalMonthlyExpenses =
    data.monthlyHousing +
    data.monthlyTransportation +
    data.monthlyFood +
    data.monthlyUtilities +
    data.monthlyInsurance +
    data.monthlyEntertainment +
    data.monthlyOther;

  const annualExpenses = totalMonthlyExpenses * 12;

  // Calculate ratios
  const debtToIncomeRatio = totalIncome > 0 ? totalLiabilities / totalIncome : 0;

  const liquidAssets = data.checking + data.savings;
  const annualSavings = totalIncome - annualExpenses;
  const savingsRate = totalIncome > 0 ? (annualSavings / totalIncome) * 100 : 0;
  const emergencyFundMonths = totalMonthlyExpenses > 0 ? liquidAssets / totalMonthlyExpenses : 0;

  // Calculate insurance gaps
  const lifeInsuranceNeeded = totalIncome * 10; // 10x income rule
  const lifeInsuranceGap = Math.max(0, lifeInsuranceNeeded - data.lifeInsuranceCoverage);

  const disabilityInsuranceNeeded = totalIncome * 0.6; // 60% income replacement
  const disabilityInsuranceGap = Math.max(0, disabilityInsuranceNeeded - data.disabilityInsuranceCoverage);

  // Calculate health score
  const healthScore = calculateHealthScore(
    data,
    savingsRate,
    emergencyFundMonths,
    debtToIncomeRatio,
    lifeInsuranceGap,
    totalIncome
  );

  // Build initial metrics object
  const metrics: FinancialMetrics = {
    totalAssets,
    totalLiabilities,
    netWorth,
    totalIncome,
    totalMonthlyExpenses,
    annualExpenses,
    debtToIncomeRatio,
    savingsRate,
    emergencyFundMonths,
    lifeInsuranceGap,
    lifeInsuranceNeeded,
    disabilityInsuranceGap,
    disabilityInsuranceNeeded,
    healthScore: healthScore.total,
    healthScoreBreakdown: healthScore.breakdown,
  };

  // Calculate goal progress if goals are defined
  const goalProgress = calculateGoalProgress(data, metrics);
  if (goalProgress) {
    metrics.goalProgress = goalProgress;
  }

  // Calculate enhanced retirement analysis
  if (data.goals?.retirementAge) {
    metrics.retirementAnalysis = calculateEnhancedRetirement(data, metrics);
    // Update retirement readiness based on enhanced calculation
    if (metrics.retirementAnalysis && metrics.goalProgress) {
      const readiness = (metrics.retirementAnalysis.projectedSavingsAtRetirement / metrics.retirementAnalysis.savingsNeededAtRetirement) * 100;
      metrics.goalProgress.retirementReadiness = Math.min(100, readiness);
    }
  }

  // Calculate Social Security estimate
  if (metrics.totalIncome > 0) {
    metrics.socialSecurityEstimate = estimateSocialSecurityBenefit(metrics.totalIncome, data.age);
  }

  // Calculate monthly savings needed for goals
  if (data.goals) {
    const goalMonthlySavings: NonNullable<typeof metrics['goalMonthlySavings']> = {};
    const returnRate = data.assumptions?.investmentReturnRate || 0.05;

    // Emergency Fund
    if (data.goals.emergencyFundMonths) {
      const targetAmount = metrics.totalMonthlyExpenses * data.goals.emergencyFundMonths;
      const currentAmount = data.checking + data.savings;
      const monthsToGoal = 12; // Default 1 year to build emergency fund
      goalMonthlySavings.emergencyFund = calculateMonthlyPaymentForGoal(
        currentAmount,
        targetAmount,
        monthsToGoal,
        0.02 // Low return for liquid savings
      );
    }

    // Home Down Payment
    if (data.goals.homeDownPayment && data.goals.homeDownPayment > 0) {
      const currentAmount = data.checking + data.savings + data.brokerage;
      const monthsToGoal = 36; // Default 3 years to save for down payment
      goalMonthlySavings.homeDownPayment = calculateMonthlyPaymentForGoal(
        currentAmount,
        data.goals.homeDownPayment,
        monthsToGoal,
        returnRate
      );
    }

    // Education Savings
    if (data.goals.educationSavings && data.goals.educationSavings > 0) {
      const currentAmount = data.brokerage * 0.3; // Estimate 30% of brokerage
      const monthsToGoal = 120; // Default 10 years for education
      goalMonthlySavings.educationSavings = calculateMonthlyPaymentForGoal(
        currentAmount,
        data.goals.educationSavings,
        monthsToGoal,
        returnRate
      );
    }

    // Major Purchase
    if (data.goals.majorPurchase?.amount && data.goals.majorPurchase.amount > 0) {
      const currentAmount = data.checking + data.savings;
      let monthsToGoal = 24; // Default 2 years

      if (data.goals.majorPurchase.targetDate) {
        const targetDate = new Date(data.goals.majorPurchase.targetDate);
        const today = new Date();
        monthsToGoal = Math.max(1, Math.round((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)));
      }

      goalMonthlySavings.majorPurchase = calculateMonthlyPaymentForGoal(
        currentAmount,
        data.goals.majorPurchase.amount,
        monthsToGoal,
        0.03 // Conservative return for short-term goal
      );
    }

    // Retirement Shortfall
    if (metrics.retirementAnalysis && metrics.retirementAnalysis.gap > 0) {
      goalMonthlySavings.retirementShortfall = metrics.retirementAnalysis.monthlySavingsNeeded;
    }

    metrics.goalMonthlySavings = goalMonthlySavings;
  }

  // Calculate portfolio analysis
  if (data.portfolio) {
    metrics.portfolioAnalysis = calculatePortfolioAnalysis(data);
  }

  // Calculate debt payoff analysis
  if (data.detailedDebts) {
    const monthlySurplus = metrics.totalIncome / 12 - metrics.totalMonthlyExpenses;
    metrics.debtPayoffAnalysis = calculateDebtPayoffAnalysis(data, monthlySurplus);
  }

  // Calculate college planning
  if (data.dependents && data.dependents > 0) {
    metrics.collegePlanning = calculateCollegePlanning(data);
  }

  // Generate tax optimization recommendations
  metrics.taxOptimization = generateTaxOptimization(data, metrics);

  return metrics;
}

/**
 * Calculate financial health score (0-100)
 */
function calculateHealthScore(
  data: ClientData,
  savingsRate: number,
  emergencyFundMonths: number,
  debtToIncomeRatio: number,
  lifeInsuranceGap: number,
  totalIncome: number
) {
  // Protection Coverage (25 points)
  let protectionScore = 0;
  if (data.hasUmbrellaPolicy) protectionScore += 7;
  if (data.hasDisabilityInsurance) protectionScore += 6;
  if (lifeInsuranceGap === 0) protectionScore += 8;
  if (data.hasEstatePlan) protectionScore += 4;

  // Savings Rate (25 points)
  let savingsRateScore = 0;
  if (savingsRate >= 20) savingsRateScore = 25;
  else if (savingsRate >= 15) savingsRateScore = 20;
  else if (savingsRate >= 10) savingsRateScore = 15;
  else if (savingsRate >= 5) savingsRateScore = 10;
  else savingsRateScore = Math.max(0, savingsRate);

  // Emergency Fund (20 points)
  let emergencyScore = 0;
  if (emergencyFundMonths >= 6) emergencyScore = 20;
  else if (emergencyFundMonths >= 3) emergencyScore = 15;
  else if (emergencyFundMonths >= 1) emergencyScore = 10;
  else emergencyScore = emergencyFundMonths * 5;

  // Debt-to-Income (15 points)
  let debtScore = 0;
  if (debtToIncomeRatio <= 2) debtScore = 15;
  else if (debtToIncomeRatio <= 3) debtScore = 12;
  else if (debtToIncomeRatio <= 4) debtScore = 8;
  else if (debtToIncomeRatio <= 5) debtScore = 4;
  else debtScore = 0;

  // Net Worth Growth (15 points)
  const netWorthToIncomeRatio = totalIncome > 0 ?
    ((data.checking + data.savings + data.retirement401k + data.retirementIRA + data.brokerage) / totalIncome) : 0;
  let netWorthScore = 0;
  if (netWorthToIncomeRatio >= 5) netWorthScore = 15;
  else if (netWorthToIncomeRatio >= 3) netWorthScore = 12;
  else if (netWorthToIncomeRatio >= 1) netWorthScore = 8;
  else netWorthScore = netWorthToIncomeRatio * 5;

  return {
    total: Math.round(protectionScore + savingsRateScore + emergencyScore + debtScore + netWorthScore),
    breakdown: {
      protectionCoverage: Math.round(protectionScore),
      savingsRate: Math.round(savingsRateScore),
      emergencyFund: Math.round(emergencyScore),
      debtToIncome: Math.round(debtScore),
      netWorthGrowth: Math.round(netWorthScore),
    },
  };
}

/**
 * Generate comprehensive risk assessment
 */
export function generateRiskAssessment(
  data: ClientData,
  metrics: FinancialMetrics
): RiskAssessment {
  const categories = {
    lifeInsurance: assessLifeInsurance(data, metrics),
    disability: assessDisability(data, metrics),
    emergency: assessEmergencyFund(metrics),
    debt: assessDebt(metrics),
    retirement: assessRetirement(data, metrics),
    estate: assessEstate(data),
    liability: assessLiability(data),
    savings: assessSavings(metrics),
  };

  // Calculate overall risk score
  const scores = Object.values(categories).map((cat) => cat.score);
  const overallRiskScore = Math.round(
    scores.reduce((sum, score) => sum + score, 0) / scores.length
  );

  // Identify critical gaps
  const criticalGaps = Object.values(categories)
    .filter((cat) => cat.status === 'critical')
    .map((cat) => cat.name);

  const riskAssessment: RiskAssessment = {
    categories,
    overallRiskScore,
    criticalGaps,
  };

  // Generate action items based on risk assessment and metrics
  const actionItems = generateActionItems(data, metrics, riskAssessment);
  if (actionItems && actionItems.length > 0) {
    // Add action items to metrics (will be added in calling function)
    (metrics as any)._actionItemsToAdd = actionItems;
  }

  return riskAssessment;
}

function assessLifeInsurance(data: ClientData, metrics: FinancialMetrics): RiskCategory {
  const coverage = data.lifeInsuranceCoverage;
  const needed = metrics.lifeInsuranceNeeded;
  const coverageRatio = needed > 0 ? coverage / needed : 1;

  let status: RiskCategory['status'];
  let score: number;
  let message: string;

  if (coverageRatio >= 1) {
    status = 'excellent';
    score = 10;
    message = 'Excellent life insurance coverage';
  } else if (coverageRatio >= 0.7) {
    status = 'good';
    score = 40;
    message = 'Good life insurance coverage, minor gap exists';
  } else if (coverageRatio >= 0.3) {
    status = 'warning';
    score = 70;
    message = 'Significant life insurance gap detected';
  } else {
    status = 'critical';
    score = 95;
    message = 'CRITICAL: Severe life insurance protection gap';
  }

  return {
    name: 'Life Insurance',
    score,
    status,
    message,
    recommendations: [
      `Recommended coverage: $${formatCurrency(needed)}`,
      `Current gap: $${formatCurrency(metrics.lifeInsuranceGap)}`,
      'Consider term life insurance for cost-effective protection',
    ],
  };
}

function assessDisability(data: ClientData, metrics: FinancialMetrics): RiskCategory {
  if (!data.hasDisabilityInsurance) {
    return {
      name: 'Disability Insurance',
      score: 90,
      status: 'critical',
      message: 'No disability insurance coverage',
      recommendations: [
        'Get disability insurance to protect income',
        `Recommended: $${formatCurrency(metrics.disabilityInsuranceNeeded)} annual coverage`,
        'Aim for 60% income replacement',
      ],
    };
  }

  const coverage = data.disabilityInsuranceCoverage;
  const needed = metrics.disabilityInsuranceNeeded;
  const coverageRatio = needed > 0 ? coverage / needed : 1;

  if (coverageRatio >= 0.6) {
    return {
      name: 'Disability Insurance',
      score: 20,
      status: 'good',
      message: 'Adequate disability coverage',
      recommendations: ['Maintain current coverage', 'Review annually'],
    };
  } else {
    return {
      name: 'Disability Insurance',
      score: 60,
      status: 'warning',
      message: 'Disability coverage below recommended level',
      recommendations: [
        `Recommended: $${formatCurrency(needed)} annual coverage`,
        `Current gap: $${formatCurrency(metrics.disabilityInsuranceGap)}`,
      ],
    };
  }
}

function assessEmergencyFund(metrics: FinancialMetrics): RiskCategory {
  const months = metrics.emergencyFundMonths;

  if (months >= 6) {
    return {
      name: 'Emergency Fund',
      score: 10,
      status: 'excellent',
      message: 'Excellent emergency fund reserves',
      recommendations: ['Maintain current level', 'Keep in high-yield savings'],
    };
  } else if (months >= 3) {
    return {
      name: 'Emergency Fund',
      score: 40,
      status: 'good',
      message: 'Good emergency fund, could be stronger',
      recommendations: ['Build to 6 months of expenses', 'Automate monthly contributions'],
    };
  } else if (months >= 1) {
    return {
      name: 'Emergency Fund',
      score: 70,
      status: 'warning',
      message: 'Insufficient emergency reserves',
      recommendations: [
        'Priority: Build to 3-6 months expenses',
        'Start with $1,000 starter fund',
      ],
    };
  } else {
    return {
      name: 'Emergency Fund',
      score: 95,
      status: 'critical',
      message: 'CRITICAL: No emergency fund',
      recommendations: [
        'URGENT: Build emergency fund immediately',
        'Target: 3-6 months of expenses',
        `Goal amount: $${formatCurrency(metrics.totalMonthlyExpenses * 6)}`,
      ],
    };
  }
}

function assessDebt(metrics: FinancialMetrics): RiskCategory {
  const ratio = metrics.debtToIncomeRatio;

  if (ratio <= 2) {
    return {
      name: 'Debt Level',
      score: 15,
      status: 'excellent',
      message: 'Excellent debt-to-income ratio',
      recommendations: ['Maintain low debt levels', 'Continue debt paydown'],
    };
  } else if (ratio <= 3) {
    return {
      name: 'Debt Level',
      score: 45,
      status: 'good',
      message: 'Manageable debt levels',
      recommendations: ['Consider accelerated debt payoff', 'Avoid new debt'],
    };
  } else if (ratio <= 4) {
    return {
      name: 'Debt Level',
      score: 70,
      status: 'warning',
      message: 'High debt burden',
      recommendations: ['Create debt reduction plan', 'Consider debt consolidation'],
    };
  } else {
    return {
      name: 'Debt Level',
      score: 90,
      status: 'critical',
      message: 'CRITICAL: Excessive debt levels',
      recommendations: [
        'URGENT: Debt reduction required',
        'Seek credit counseling',
        'Stop accumulating new debt',
      ],
    };
  }
}

function assessRetirement(data: ClientData, metrics: FinancialMetrics): RiskCategory {
  const retirementSavings = data.retirement401k + data.retirementIRA;
  const incomeMultiple = metrics.totalIncome > 0 ? retirementSavings / metrics.totalIncome : 0;

  let status: RiskCategory['status'];
  let score: number;

  // Age-based retirement benchmarks
  const age = data.age;
  let targetMultiple = 0;
  if (age >= 60) targetMultiple = 8;
  else if (age >= 50) targetMultiple = 6;
  else if (age >= 40) targetMultiple = 3;
  else if (age >= 30) targetMultiple = 1;

  if (incomeMultiple >= targetMultiple) {
    status = 'excellent';
    score = 15;
  } else if (incomeMultiple >= targetMultiple * 0.7) {
    status = 'good';
    score = 40;
  } else if (incomeMultiple >= targetMultiple * 0.4) {
    status = 'warning';
    score = 65;
  } else {
    status = 'critical';
    score = 85;
  }

  return {
    name: 'Retirement Savings',
    score,
    status,
    message: `Retirement savings at ${incomeMultiple.toFixed(1)}x income`,
    recommendations: [
      `Target for age ${age}: ${targetMultiple}x annual income`,
      'Maximize employer 401(k) match',
      'Consider increasing contribution rate by 1-2%',
    ],
  };
}

function assessEstate(data: ClientData): RiskCategory {
  if (data.hasEstatePlan) {
    return {
      name: 'Estate Planning',
      score: 10,
      status: 'excellent',
      message: 'Estate plan in place',
      recommendations: ['Review every 3-5 years', 'Update after major life events'],
    };
  } else {
    return {
      name: 'Estate Planning',
      score: 75,
      status: 'warning',
      message: 'No estate plan',
      recommendations: [
        'Create will and healthcare directives',
        'Consider living trust',
        'Designate beneficiaries on all accounts',
      ],
    };
  }
}

function assessLiability(data: ClientData): RiskCategory {
  if (data.hasUmbrellaPolicy) {
    return {
      name: 'Liability Protection',
      score: 15,
      status: 'excellent',
      message: 'Umbrella policy in place',
      recommendations: ['Maintain coverage', 'Review limits annually'],
    };
  } else {
    return {
      name: 'Liability Protection',
      score: 70,
      status: 'warning',
      message: 'No umbrella liability coverage',
      recommendations: [
        'Consider $1-2M umbrella policy',
        'Protects assets from lawsuits',
        'Very cost-effective coverage',
      ],
    };
  }
}

function assessSavings(metrics: FinancialMetrics): RiskCategory {
  const rate = metrics.savingsRate;

  if (rate >= 20) {
    return {
      name: 'Savings Rate',
      score: 10,
      status: 'excellent',
      message: 'Excellent savings rate',
      recommendations: ['Maintain current discipline', 'Maximize tax-advantaged accounts'],
    };
  } else if (rate >= 10) {
    return {
      name: 'Savings Rate',
      score: 40,
      status: 'good',
      message: 'Good savings rate',
      recommendations: ['Aim to increase to 15-20%', 'Automate savings'],
    };
  } else if (rate >= 5) {
    return {
      name: 'Savings Rate',
      score: 65,
      status: 'warning',
      message: 'Low savings rate',
      recommendations: ['Increase to minimum 10%', 'Review budget for opportunities'],
    };
  } else {
    return {
      name: 'Savings Rate',
      score: 90,
      status: 'critical',
      message: 'CRITICAL: Very low savings',
      recommendations: [
        'URGENT: Start saving immediately',
        'Target: Save at least 10% of income',
        'Create and follow a budget',
      ],
    };
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate monthly payment needed to reach a future value
 * Uses future value of annuity formula: FV = PMT * [((1 + r)^n - 1) / r]
 */
function calculateMonthlyPaymentForGoal(
  currentAmount: number,
  targetAmount: number,
  monthsRemaining: number,
  annualReturnRate: number = 0.05
): number {
  // Input validation
  if (currentAmount < 0 || targetAmount < 0 || monthsRemaining < 0) {
    console.warn('Invalid inputs to calculateMonthlyPaymentForGoal:', { currentAmount, targetAmount, monthsRemaining });
    return 0;
  }

  if (monthsRemaining <= 0) return Math.max(0, targetAmount - currentAmount);
  if (targetAmount <= currentAmount) return 0;

  const gap = targetAmount - currentAmount;
  const monthlyRate = annualReturnRate / 12;

  // If no growth assumed, simple division
  if (monthlyRate === 0) {
    return gap / monthsRemaining;
  }

  // Future value of current amount
  const futureValueOfCurrent = currentAmount * Math.pow(1 + monthlyRate, monthsRemaining);
  const remainingGap = targetAmount - futureValueOfCurrent;

  if (remainingGap <= 0) return 0;

  // Calculate monthly payment needed using FV annuity formula
  const monthlyPayment = remainingGap / (((Math.pow(1 + monthlyRate, monthsRemaining) - 1) / monthlyRate));

  return Math.max(0, monthlyPayment);
}

/**
 * Estimate Social Security benefit using simplified PIA formula
 * Based on average indexed monthly earnings (AIME)
 */
function estimateSocialSecurityBenefit(annualIncome: number, currentAge: number): {
  monthlyBenefit: number;
  annualBenefit: number;
  fullRetirementAge: number;
} {
  // Determine Full Retirement Age (FRA) based on birth year
  const birthYear = new Date().getFullYear() - currentAge;
  let fullRetirementAge = 67;
  if (birthYear < 1955) fullRetirementAge = 66;
  else if (birthYear < 1960) fullRetirementAge = 66 + (birthYear - 1954) * 2 / 12;

  // Simplified AIME calculation (assume current income is representative)
  const monthlyEarnings = annualIncome / 12;

  // 2024 bend points for PIA calculation
  const bendPoint1 = 1174;
  const bendPoint2 = 7078;

  let monthlyBenefit = 0;

  if (monthlyEarnings <= bendPoint1) {
    monthlyBenefit = monthlyEarnings * 0.90;
  } else if (monthlyEarnings <= bendPoint2) {
    monthlyBenefit = (bendPoint1 * 0.90) + ((monthlyEarnings - bendPoint1) * 0.32);
  } else {
    monthlyBenefit = (bendPoint1 * 0.90) + ((bendPoint2 - bendPoint1) * 0.32) + ((monthlyEarnings - bendPoint2) * 0.15);
  }

  // Cap at maximum benefit (2024 is ~$3,822/month at FRA)
  monthlyBenefit = Math.min(monthlyBenefit, 3822);

  // Adjust for early/late claiming
  // Early claiming (62-66): ~7% reduction per year before FRA
  // Late claiming (67-70): ~8% increase per year after FRA
  const claimingAge = fullRetirementAge; // Default to FRA
  const yearsDiff = claimingAge - fullRetirementAge;

  let adjustmentFactor = 1.0;
  if (yearsDiff < 0) {
    // Early claiming reduction (~30% at age 62 vs 67)
    adjustmentFactor = 1 + (yearsDiff * 0.07);
  } else if (yearsDiff > 0) {
    // Late claiming increase (~24% at age 70 vs 67)
    adjustmentFactor = 1 + (yearsDiff * 0.08);
  }

  monthlyBenefit = monthlyBenefit * adjustmentFactor;

  return {
    monthlyBenefit: Math.round(monthlyBenefit),
    annualBenefit: Math.round(monthlyBenefit * 12),
    fullRetirementAge,
  };
}

/**
 * Enhanced retirement calculation with inflation adjustment
 */
function calculateEnhancedRetirement(data: ClientData, metrics: FinancialMetrics) {
  const currentAge = data.age;
  const retirementAge = data.goals?.retirementAge || 67;
  const yearsToRetirement = Math.max(0, retirementAge - currentAge);

  // Get assumptions or use defaults
  const inflationRate = data.assumptions?.inflationRate || 0.03;
  const returnRate = data.assumptions?.investmentReturnRate || 0.07;

  // Current retirement savings (include brokerage if marked as retirement)
  let retirementSavings = data.retirement401k + data.retirementIRA;
  if (data.brokerageIsRetirement) {
    retirementSavings += data.brokerage;
  }

  // Desired annual retirement income (today's dollars)
  const desiredIncomeToday = data.goals?.retirementIncome || metrics.totalIncome * 0.8;

  // Adjust for inflation to retirement date
  const futureDesiredIncome = desiredIncomeToday * Math.pow(1 + inflationRate, yearsToRetirement);

  // Estimate Social Security
  let socialSecurityBenefit = 0;
  if (data.assumptions?.estimatedMonthlySS) {
    socialSecurityBenefit = data.assumptions.estimatedMonthlySS * 12;
  } else {
    const ssEstimate = estimateSocialSecurityBenefit(metrics.totalIncome, currentAge);
    socialSecurityBenefit = ssEstimate.annualBenefit;
  }

  // Adjust SS for inflation to retirement
  const futureSocialSecurity = socialSecurityBenefit * Math.pow(1 + inflationRate, yearsToRetirement);

  // Income needed from savings (after Social Security)
  const incomeNeededFromSavings = Math.max(0, futureDesiredIncome - futureSocialSecurity);

  // 4% rule: Need 25x annual expenses from savings
  const savingsNeededAtRetirement = incomeNeededFromSavings * 25;

  // Project current savings with growth
  let projectedSavings = retirementSavings * Math.pow(1 + returnRate, yearsToRetirement);

  // Add future value of ongoing monthly contributions
  const monthlyContribution = data.monthlyRetirementContribution || 0;
  if (monthlyContribution > 0 && yearsToRetirement > 0) {
    const monthlyRate = returnRate / 12;
    const monthsToRetirement = yearsToRetirement * 12;
    const contributionsFV = monthlyContribution * (((Math.pow(1 + monthlyRate, monthsToRetirement) - 1) / monthlyRate));
    projectedSavings += contributionsFV;
  }

  // Calculate gap and monthly savings needed
  const gap = Math.max(0, savingsNeededAtRetirement - projectedSavings);
  const monthsToRetirement = yearsToRetirement * 12;

  let monthlySavingsNeeded = 0;
  if (gap > 0 && monthsToRetirement > 0) {
    monthlySavingsNeeded = calculateMonthlyPaymentForGoal(
      retirementSavings,
      savingsNeededAtRetirement,
      monthsToRetirement,
      returnRate
    );
  }

  return {
    projectedSavingsAtRetirement: projectedSavings,
    savingsNeededAtRetirement,
    gap,
    monthlySavingsNeeded,
    estimatedSocialSecurity: socialSecurityBenefit,
    inflationAdjustedIncome: futureDesiredIncome,
  };
}

/**
 * Calculate portfolio risk score and allocation recommendations
 */
function calculatePortfolioAnalysis(data: ClientData) {
  const portfolio = data.portfolio;
  if (!portfolio) return undefined;

  const age = data.age;
  const stocksPercent = portfolio.stocksPercent || 0;
  const bondsPercent = portfolio.bondsPercent || 0;
  const cashPercent = portfolio.cashPercent || 0;
  const otherPercent = portfolio.otherPercent || 0;

  // Check if allocation adds up to 100%
  const totalAllocation = stocksPercent + bondsPercent + cashPercent + otherPercent;

  // Rule of thumb: Bonds % = Age (100 - age = stocks for moderate risk)
  const recommendedStocksPercent = Math.max(40, Math.min(90, 110 - age));

  // Calculate risk score (0-100, higher = more aggressive)
  // Based on stock allocation primarily
  const riskScore = Math.round(stocksPercent);

  // Expected return calculation (conservative estimates)
  // Stocks: 8% (more conservative than 10% historical), Bonds: 4.5%, Cash: 2%, Other: 6%
  let expectedReturn: number;

  // Normalize allocation if not exactly 100%
  if (Math.abs(totalAllocation - 100) > 0.1) {
    const stocksNorm = (stocksPercent / totalAllocation) * 100;
    const bondsNorm = (bondsPercent / totalAllocation) * 100;
    const cashNorm = (cashPercent / totalAllocation) * 100;
    const otherNorm = (otherPercent / totalAllocation) * 100;

    expectedReturn =
      (stocksNorm / 100) * 8 +
      (bondsNorm / 100) * 4.5 +
      (cashNorm / 100) * 2 +
      (otherNorm / 100) * 6;
  } else {
    expectedReturn =
      (stocksPercent / 100) * 8 +
      (bondsPercent / 100) * 4.5 +
      (cashPercent / 100) * 2 +
      (otherPercent / 100) * 6;
  }

  // Determine recommended allocation based on age and risk tolerance
  let targetAllocation = '';
  if (age < 35) {
    targetAllocation = 'Aggressive (80-90% stocks, 10-20% bonds)';
  } else if (age < 50) {
    targetAllocation = 'Moderate-Aggressive (70-80% stocks, 20-30% bonds)';
  } else if (age < 60) {
    targetAllocation = 'Moderate (60-70% stocks, 30-40% bonds)';
  } else {
    targetAllocation = 'Conservative (40-50% stocks, 50-60% bonds)';
  }

  // Check for rebalancing needs
  const stocksDiff = Math.abs(stocksPercent - recommendedStocksPercent);
  const rebalancingNeeded = stocksDiff > 10; // More than 10% off target

  // Generate warnings
  const allocationWarnings: string[] = [];

  if (totalAllocation !== 100) {
    allocationWarnings.push(`Portfolio allocation totals ${totalAllocation.toFixed(1)}% instead of 100%`);
  }
  if (cashPercent > 20) {
    allocationWarnings.push(`High cash allocation (${cashPercent}%) may reduce long-term returns`);
  }
  if (stocksPercent > 90 && age > 50) {
    allocationWarnings.push(`Very aggressive allocation for age ${age} - consider more bonds for stability`);
  }
  if (stocksPercent < 50 && age < 40) {
    allocationWarnings.push(`Conservative allocation for age ${age} - missing growth opportunities`);
  }
  if (portfolio.averageExpenseRatio && portfolio.averageExpenseRatio > 1.0) {
    allocationWarnings.push(`High expense ratio (${portfolio.averageExpenseRatio}%) - consider low-cost index funds`);
  }

  return {
    riskScore,
    expectedReturn: Math.round(expectedReturn * 10) / 10,
    targetAllocation,
    rebalancingNeeded,
    allocationWarnings,
  };
}

/**
 * Calculate debt payoff strategies (avalanche vs snowball)
 */
function calculateDebtPayoffAnalysis(data: ClientData, monthlySurplus: number) {
  const detailedDebts = data.detailedDebts;
  if (!detailedDebts) return undefined;

  // Collect all debts into a single array
  const allDebts: Array<{ name: string; balance: number; apr: number; minPayment: number }> = [];

  if (detailedDebts.creditCardDebts) {
    allDebts.push(...detailedDebts.creditCardDebts);
  }
  if (detailedDebts.studentLoanDebts) {
    allDebts.push(...detailedDebts.studentLoanDebts);
  }
  if (detailedDebts.otherDebts) {
    allDebts.push(...detailedDebts.otherDebts);
  }
  if (detailedDebts.carLoanDebts) {
    allDebts.push(...detailedDebts.carLoanDebts.map(d => ({
      name: d.name,
      balance: d.balance,
      apr: d.apr,
      minPayment: d.monthlyPayment,
    })));
  }

  if (allDebts.length === 0) return undefined;

  // Calculate total minimum payment
  const totalMinPayment = allDebts.reduce((sum, debt) => sum + debt.minPayment, 0);

  // Only add extra payment if there's positive surplus
  const extraPayment = monthlySurplus > 0 ? Math.max(100, monthlySurplus * 0.1) : 0;
  const totalPayment = totalMinPayment + extraPayment;

  // If payment is insufficient to cover minimums, return warning
  if (totalPayment < totalMinPayment * 0.95) {
    return {
      totalInterestAvalanche: 999999,
      totalInterestSnowball: 999999,
      savingsFromAvalanche: 0,
      monthsToPayoffAvalanche: 360,
      monthsToPayoffSnowball: 360,
      recommendedMethod: 'avalanche' as const,
      warning: 'Monthly payment insufficient to cover minimum payments. Debt will continue growing.',
    } as any;
  }

  // Avalanche method: Pay off highest APR first
  const avalancheDebts = [...allDebts].sort((a, b) => b.apr - a.apr);
  const avalancheResult = simulateDebtPayoff(avalancheDebts, totalPayment);

  // Snowball method: Pay off smallest balance first
  const snowballDebts = [...allDebts].sort((a, b) => a.balance - b.balance);
  const snowballResult = simulateDebtPayoff(snowballDebts, totalPayment);

  return {
    totalInterestAvalanche: avalancheResult.totalInterest,
    totalInterestSnowball: snowballResult.totalInterest,
    savingsFromAvalanche: snowballResult.totalInterest - avalancheResult.totalInterest,
    monthsToPayoffAvalanche: avalancheResult.monthsToPayoff,
    monthsToPayoffSnowball: snowballResult.monthsToPayoff,
    recommendedMethod: avalancheResult.totalInterest < snowballResult.totalInterest ? 'avalanche' as const : 'snowball' as const,
  };
}

/**
 * Simulate debt payoff using a specific ordering
 */
function simulateDebtPayoff(
  debts: Array<{ balance: number; apr: number; minPayment: number }>,
  totalMonthlyPayment: number
): { totalInterest: number; monthsToPayoff: number } {
  // Clone debts to avoid modifying original
  const debtsCopy = debts.map(d => ({ ...d }));
  let totalInterest = 0;
  let monthsToPayoff = 0;
  const maxMonths = 360; // 30 year cap

  while (debtsCopy.some(d => d.balance > 0) && monthsToPayoff < maxMonths) {
    monthsToPayoff++;
    let remainingPayment = totalMonthlyPayment;

    // Pay minimum on all debts
    for (const debt of debtsCopy) {
      if (debt.balance <= 0) continue;

      const monthlyInterest = (debt.balance * debt.apr) / 100 / 12;
      totalInterest += monthlyInterest;
      debt.balance += monthlyInterest;

      const payment = Math.min(debt.minPayment, debt.balance, remainingPayment);
      debt.balance -= payment;
      remainingPayment -= payment;
    }

    // Apply extra payment to first debt with balance
    if (remainingPayment > 0) {
      const targetDebt = debtsCopy.find(d => d.balance > 0);
      if (targetDebt) {
        const extraPayment = Math.min(remainingPayment, targetDebt.balance);
        targetDebt.balance -= extraPayment;
      }
    }
  }

  return { totalInterest, monthsToPayoff };
}

/**
 * Calculate college planning metrics
 */
function calculateCollegePlanning(data: ClientData) {
  if (!data.dependents || data.dependents === 0) return undefined;

  // Get children ages or assume newborn
  const childrenAges = data.childrenAges && data.childrenAges.length > 0
    ? data.childrenAges
    : Array(data.dependents).fill(0);

  // Average 4-year college cost in 2024: ~$100,000 (public), ~$200,000 (private)
  // Use middle estimate of $150,000
  const currentCollegeCost = 150000;
  const collegeInflationRate = 0.05;

  // Calculate cost for each child based on their age
  const collegeCosts = childrenAges.map(age => {
    const yearsUntilCollege = Math.max(0, 18 - age);
    return currentCollegeCost * Math.pow(1 + collegeInflationRate, yearsUntilCollege);
  });

  const estimatedTotalCost = collegeCosts.reduce((sum, cost) => sum + cost, 0);

  // Get youngest child's age for timeline calculation
  const youngestAge = Math.min(...childrenAges);
  const yearsUntilCollege = Math.max(0, 18 - youngestAge);

  // Current education savings (dedicated 529 or education goal)
  const currentSavings = data.collegeSavings529
    || data.goals?.educationSavings
    || 0;

  // Calculate monthly savings needed
  const monthsUntilCollege = Math.max(1, yearsUntilCollege * 12);
  const monthlySavingsNeeded = calculateMonthlyPaymentForGoal(
    currentSavings,
    estimatedTotalCost,
    monthsUntilCollege,
    0.07 // Assume 7% investment return
  );

  // Project current savings with growth
  const returnRate = 0.07;
  const projectedSavings = currentSavings * Math.pow(1 + returnRate, yearsUntilCollege);
  const projectedShortfall = Math.max(0, estimatedTotalCost - projectedSavings);

  return {
    yearsUntilCollege,
    estimatedTotalCost,
    currentSavings,
    monthlySavingsNeeded,
    projectedShortfall,
  };
}

/**
 * Generate tax optimization recommendations
 */
function generateTaxOptimization(data: ClientData, metrics: FinancialMetrics): NonNullable<FinancialMetrics['taxOptimization']> {
  const totalIncome = metrics.totalIncome;
  const filingStatus = data.filingStatus || 'married-joint';

  // Calculate current tax bill
  const stateTaxResult = data.state
    ? calculateStateTax(totalIncome, data.state)
    : { stateTax: 0, federalTax: calculateFederalTax(totalIncome), totalTax: calculateFederalTax(totalIncome), effectiveRate: 0, stateName: 'N/A' };

  const currentTaxBill = stateTaxResult.totalTax;

  const recommendations: Array<{
    strategy: string;
    estimatedSavings: number;
    difficulty: 'easy' | 'moderate' | 'complex';
    description: string;
  }> = [];

  // 1. Max out 401(k) contributions
  const current401k = (data.monthlyRetirementContribution || 0) * 12;
  const max401k = 23000; // 2024 limit
  if (current401k < max401k) {
    const additionalContribution = max401k - current401k;
    const taxSavings = additionalContribution * (stateTaxResult.effectiveRate / 100);
    recommendations.push({
      strategy: 'Maximize 401(k) contributions',
      estimatedSavings: taxSavings,
      difficulty: 'easy',
      description: `Increase 401(k) to $${max401k.toLocaleString()}/year (currently $${current401k.toLocaleString()}). Saves ${stateTaxResult.effectiveRate.toFixed(1)}% in taxes.`,
    });
  }

  // 2. HSA contributions
  if (totalIncome > 60000) {
    const hsaMax = filingStatus === 'married-joint' ? 8300 : 4150; // 2024 family limit
    const hsaTaxSavings = hsaMax * (stateTaxResult.effectiveRate / 100);
    recommendations.push({
      strategy: 'Contribute to HSA',
      estimatedSavings: hsaTaxSavings,
      difficulty: 'easy',
      description: `Max out HSA contributions ($${hsaMax.toLocaleString()}/year). Triple tax advantage: deductible, grows tax-free, tax-free withdrawals for medical.`,
    });
  }

  // 3. Tax-loss harvesting for brokerage
  if (data.brokerage > 50000) {
    const estimatedLosses = data.brokerage * 0.03; // Assume can harvest 3% losses
    const taxSavings = Math.min(3000, estimatedLosses) * (stateTaxResult.effectiveRate / 100);
    recommendations.push({
      strategy: 'Tax-loss harvesting',
      estimatedSavings: taxSavings,
      difficulty: 'moderate',
      description: 'Harvest investment losses to offset gains. Can deduct up to $3,000 in net losses against ordinary income annually.',
    });
  }

  // 4. Backdoor Roth IRA
  if (totalIncome > 230000 && filingStatus === 'married-joint') {
    recommendations.push({
      strategy: 'Backdoor Roth IRA',
      estimatedSavings: 0, // No immediate savings but long-term benefit
      difficulty: 'moderate',
      description: 'Convert traditional IRA to Roth via backdoor method. Enables tax-free growth despite income limits.',
    });
  }

  // 5. Donor-advised fund for charitable giving
  if (totalIncome > 150000) {
    const charityAmount = totalIncome * 0.05; // Assume 5% charitable giving
    const taxSavings = charityAmount * (stateTaxResult.effectiveRate / 100);
    recommendations.push({
      strategy: 'Donor-Advised Fund',
      estimatedSavings: taxSavings,
      difficulty: 'moderate',
      description: 'Bunch charitable contributions into one year for larger deduction, then distribute over time.',
    });
  }

  // 6. 529 college savings (state tax deduction)
  if (data.dependents > 0 && data.state && ['California', 'New York'].includes(data.state)) {
    const contribution529 = 10000; // Assume $10k contribution
    const stateTaxRate = data.state === 'California' ? 0.093 : 0.0685;
    const taxSavings = contribution529 * stateTaxRate;
    recommendations.push({
      strategy: '529 College Savings Plan',
      estimatedSavings: taxSavings,
      difficulty: 'easy',
      description: `Contribute to 529 plan for state tax deduction (${data.state} offers deduction). Tax-free growth for education.`,
    });
  }

  const totalPotentialSavings = recommendations.reduce((sum, rec) => sum + rec.estimatedSavings, 0);

  return {
    currentTaxBill,
    optimizedTaxBill: currentTaxBill - totalPotentialSavings,
    potentialSavings: totalPotentialSavings,
    recommendations,
  };
}

/**
 * Generate prioritized action items from risk assessment
 */
function generateActionItems(
  data: ClientData,
  metrics: FinancialMetrics,
  risk: RiskAssessment
) {
  const actionItems: NonNullable<typeof metrics['actionItems']> = [];

  // Critical gaps from risk assessment
  if (risk.criticalGaps.length > 0) {
    risk.criticalGaps.forEach(category => {
      const riskCategory = Object.values(risk.categories).find(c => c.name === category);
      if (riskCategory) {
        actionItems.push({
          priority: 'critical',
          category: riskCategory.name,
          action: riskCategory.recommendations[0] || riskCategory.message,
          impact: 'Protects family from financial disaster',
          deadline: '30 days',
        });
      }
    });
  }

  // Emergency fund
  if (metrics.emergencyFundMonths < 3) {
    actionItems.push({
      priority: 'critical',
      category: 'Emergency Fund',
      action: `Build emergency fund to 3-6 months (${formatCurrency(metrics.totalMonthlyExpenses * 6)})`,
      impact: 'Prevents debt spiral in emergencies',
      deadline: '90 days',
    });
  }

  // Retirement shortfall
  if (metrics.retirementAnalysis && metrics.retirementAnalysis.gap > 50000) {
    actionItems.push({
      priority: 'high',
      category: 'Retirement Planning',
      action: `Increase retirement savings by ${formatCurrency(metrics.retirementAnalysis.monthlySavingsNeeded)}/month`,
      impact: `Close ${formatCurrency(metrics.retirementAnalysis.gap)} retirement gap`,
      deadline: 'Start immediately',
    });
  }

  // High-interest debt
  if (data.detailedDebts && data.detailedDebts.creditCardDebts) {
    const highInterestDebt = data.detailedDebts.creditCardDebts.filter(d => d.apr > 15);
    if (highInterestDebt.length > 0) {
      const totalHighInterest = highInterestDebt.reduce((sum, d) => sum + d.balance, 0);
      actionItems.push({
        priority: 'high',
        category: 'Debt Reduction',
        action: `Pay off ${formatCurrency(totalHighInterest)} in high-interest credit card debt`,
        impact: 'Save thousands in interest charges',
        deadline: '12 months',
      });
    }
  }

  // Low savings rate
  if (metrics.savingsRate < 10) {
    actionItems.push({
      priority: 'high',
      category: 'Savings Rate',
      action: 'Increase savings rate to at least 10% of income',
      impact: 'Build wealth and reach financial goals faster',
      deadline: '60 days',
    });
  }

  // Portfolio rebalancing
  if (metrics.portfolioAnalysis?.rebalancingNeeded) {
    actionItems.push({
      priority: 'medium',
      category: 'Investments',
      action: 'Rebalance portfolio to target allocation',
      impact: 'Optimize risk/return for your age and goals',
      deadline: '30 days',
    });
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2 };
  actionItems.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return actionItems.slice(0, 8); // Top 8 actions
}
