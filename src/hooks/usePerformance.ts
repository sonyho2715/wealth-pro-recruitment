import { useMemo, useCallback } from 'react';
import { formatCurrency, formatPercentage } from '../utils/calculations';

/**
 * Performance optimization hook that provides memoized formatting functions
 * and calculations to reduce unnecessary re-computations
 */
export function usePerformance() {
  // Memoize currency formatter to avoid recreating the Intl.NumberFormat instance
  const memoizedFormatCurrency = useCallback((amount: number) => {
    return formatCurrency(amount);
  }, []);

  // Memoize percentage formatter
  const memoizedFormatPercentage = useCallback((value: number, decimals: number = 1) => {
    return formatPercentage(value, decimals);
  }, []);

  return {
    formatCurrency: memoizedFormatCurrency,
    formatPercentage: memoizedFormatPercentage,
  };
}

/**
 * Hook to memoize expensive calculations based on client data
 * Prevents recalculation when dependencies haven't changed
 */
export function useMemoizedMetrics(
  totalIncome: number,
  totalMonthlyExpenses: number,
  healthScore: number
) {
  const monthlySurplus = useMemo(() => {
    return totalIncome / 12 - totalMonthlyExpenses;
  }, [totalIncome, totalMonthlyExpenses]);

  const healthScoreColor = useMemo(() => {
    if (healthScore >= 80) return 'text-green-600 bg-green-100';
    if (healthScore >= 60) return 'text-blue-600 bg-blue-100';
    if (healthScore >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  }, [healthScore]);

  const healthScoreLabel = useMemo(() => {
    if (healthScore >= 80) return 'Excellent';
    if (healthScore >= 60) return 'Good';
    if (healthScore >= 40) return 'Needs Improvement';
    return 'Critical';
  }, [healthScore]);

  const annualSavings = useMemo(() => {
    return totalIncome - (totalMonthlyExpenses * 12);
  }, [totalIncome, totalMonthlyExpenses]);

  return {
    monthlySurplus,
    healthScoreColor,
    healthScoreLabel,
    annualSavings,
  };
}
