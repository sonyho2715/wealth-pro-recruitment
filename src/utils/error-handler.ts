/**
 * Error Handling Utilities
 * Centralized error handling and logging
 */

import * as Sentry from '@sentry/react';
import { env, isDevelopment } from '../config/env';

/**
 * Initialize error tracking (Sentry)
 */
export function initErrorTracking() {
  if (!env.enableErrorTracking || !env.sentryDsn) {
    if (isDevelopment) {
      console.log('[Error Tracking] Disabled in development');
    }
    return;
  }

  Sentry.init({
    dsn: env.sentryDsn,
    environment: env.sentryEnvironment,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: env.sentryEnvironment === 'production' ? 0.1 : 1.0,
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });

  console.log(`[Error Tracking] Initialized (${env.sentryEnvironment})`);
}

/**
 * Error types for better categorization
 */
export const ErrorCategory = {
  API: 'api',
  VALIDATION: 'validation',
  CALCULATION: 'calculation',
  UI: 'ui',
  NETWORK: 'network',
  UNKNOWN: 'unknown',
} as const;

export type ErrorCategory = typeof ErrorCategory[keyof typeof ErrorCategory];

/**
 * Handle and log errors
 */
export function handleError(
  error: Error | unknown,
  context?: {
    category?: ErrorCategory;
    severity?: 'fatal' | 'error' | 'warning' | 'info';
    extra?: Record<string, any>;
    tags?: Record<string, string>;
    user?: {
      email?: string;
      id?: string;
      name?: string;
    };
  }
): void {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  const category = context?.category || ErrorCategory.UNKNOWN;
  const severity = context?.severity || 'error';

  // Log to console in development
  if (isDevelopment) {
    console.group(`[${severity.toUpperCase()}] ${category}`);
    console.error(errorObj);
    if (context?.extra) {
      console.log('Extra context:', context.extra);
    }
    console.groupEnd();
  }

  // Send to Sentry if enabled
  if (env.enableErrorTracking) {
    Sentry.captureException(errorObj, {
      level: severity,
      tags: {
        category,
        ...context?.tags,
      },
      extra: context?.extra,
      user: context?.user,
    });
  }

  // Log to server (if API available)
  logErrorToServer(errorObj, category, context?.extra);
}

/**
 * Log error to server endpoint
 */
async function logErrorToServer(
  error: Error,
  category: ErrorCategory,
  extra?: Record<string, any>
): Promise<void> {
  try {
    // Only send to server if not in development
    if (isDevelopment) return;

    await fetch(`${env.apiBaseUrl}/errors/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        category,
        extra,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    });
  } catch (logError) {
    // Silently fail if logging fails
    console.warn('Failed to log error to server:', logError);
  }
}

/**
 * Handle API errors specifically
 */
export function handleApiError(
  error: any,
  endpoint: string,
  context?: Record<string, any>
): never {
  const message = error.response?.data?.message || error.message || 'API request failed';
  const statusCode = error.response?.status;

  handleError(error, {
    category: ErrorCategory.API,
    severity: statusCode >= 500 ? 'error' : 'warning',
    extra: {
      endpoint,
      statusCode,
      ...context,
    },
    tags: {
      endpoint,
      statusCode: String(statusCode),
    },
  });

  throw new Error(message);
}

/**
 * Handle validation errors
 */
export function handleValidationError(
  error: Error,
  formData?: Record<string, any>
): void {
  handleError(error, {
    category: ErrorCategory.VALIDATION,
    severity: 'warning',
    extra: {
      formData: formData ? Object.keys(formData) : undefined,
    },
  });
}

/**
 * Handle calculation errors
 */
export function handleCalculationError(
  error: Error,
  calculationType: string,
  inputs?: Record<string, any>
): void {
  handleError(error, {
    category: ErrorCategory.CALCULATION,
    severity: 'error',
    extra: {
      calculationType,
      inputs,
    },
    tags: {
      calculationType,
    },
  });
}

/**
 * Assertion helper with error tracking
 */
export function assert(
  condition: boolean,
  message: string,
  extra?: Record<string, any>
): asserts condition {
  if (!condition) {
    const error = new Error(`Assertion failed: ${message}`);
    handleError(error, {
      category: ErrorCategory.UNKNOWN,
      severity: 'error',
      extra,
    });
    throw error;
  }
}

/**
 * Wrap async functions with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  category: ErrorCategory = ErrorCategory.UNKNOWN
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, { category });
      throw error;
    }
  }) as T;
}
