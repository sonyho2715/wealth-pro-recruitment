/**
 * Tests for formatting utilities
 */

import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatCurrencyCompact,
  formatPercentage,
  formatNumber,
  formatPhoneNumber,
  formatDuration,
  formatLargeNumber,
} from './formatters';

describe('formatCurrency', () => {
  it('should format currency with default options', () => {
    expect(formatCurrency(1000)).toBe('$1,000');
    expect(formatCurrency(1234.56)).toBe('$1,235');
    expect(formatCurrency(0)).toBe('$0');
  });

  it('should format currency with decimals', () => {
    expect(formatCurrency(1234.56, { minimumFractionDigits: 2, maximumFractionDigits: 2 })).toBe('$1,234.56');
    expect(formatCurrency(1000, { minimumFractionDigits: 2, maximumFractionDigits: 2 })).toBe('$1,000.00');
  });

  it('should handle negative numbers', () => {
    expect(formatCurrency(-1000)).toBe('-$1,000');
  });
});

describe('formatCurrencyCompact', () => {
  it('should format thousands with K suffix', () => {
    expect(formatCurrencyCompact(1500)).toBe('$1.5K');
    expect(formatCurrencyCompact(50000)).toBe('$50.0K');
  });

  it('should format millions with M suffix', () => {
    expect(formatCurrencyCompact(1500000)).toBe('$1.5M');
    expect(formatCurrencyCompact(2500000)).toBe('$2.5M');
  });

  it('should handle numbers below 1000', () => {
    expect(formatCurrencyCompact(999)).toBe('$999');
  });

  it('should handle negative numbers', () => {
    expect(formatCurrencyCompact(-1500000)).toBe('-$1.5M');
  });
});

describe('formatPercentage', () => {
  it('should format percentage', () => {
    expect(formatPercentage(50)).toBe('50%');
    expect(formatPercentage(75.5)).toBe('75.5%');
  });

  it('should format with custom decimals', () => {
    expect(formatPercentage(75.555, { maximumFractionDigits: 1 })).toBe('75.6%');
  });
});

describe('formatNumber', () => {
  it('should format numbers with thousands separator', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1000000)).toBe('1,000,000');
  });
});

describe('formatPhoneNumber', () => {
  it('should format 10-digit phone numbers', () => {
    expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
    expect(formatPhoneNumber('555-123-4567')).toBe('(555) 123-4567');
  });

  it('should format 11-digit numbers starting with 1', () => {
    expect(formatPhoneNumber('15551234567')).toBe('+1 (555) 123-4567');
  });

  it('should return original for invalid formats', () => {
    expect(formatPhoneNumber('123')).toBe('123');
  });
});

describe('formatDuration', () => {
  it('should format months only', () => {
    expect(formatDuration(6)).toBe('6 months');
    expect(formatDuration(1)).toBe('1 month');
  });

  it('should format years only', () => {
    expect(formatDuration(12)).toBe('1 year');
    expect(formatDuration(24)).toBe('2 years');
  });

  it('should format years and months', () => {
    expect(formatDuration(18)).toBe('1 year 6 months');
    expect(formatDuration(30)).toBe('2 years 6 months');
  });
});

describe('formatLargeNumber', () => {
  it('should format thousands', () => {
    expect(formatLargeNumber(5000)).toBe('5.0K');
  });

  it('should format millions', () => {
    expect(formatLargeNumber(2500000)).toBe('2.5M');
  });

  it('should format billions', () => {
    expect(formatLargeNumber(1500000000)).toBe('1.5B');
  });

  it('should handle negative numbers', () => {
    expect(formatLargeNumber(-5000)).toBe('-5.0K');
  });
});
