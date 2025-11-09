/**
 * Environment Configuration
 * Centralized access to environment variables with type safety
 */

interface EnvironmentConfig {
  // API
  apiBaseUrl: string;
  apiTimeout: number;

  // Analytics
  googleAnalyticsId: string;
  gaMeasurementId: string;
  enableAnalytics: boolean;

  // Error Tracking
  sentryDsn: string;
  sentryEnvironment: string;
  enableErrorTracking: boolean;

  // Feature Flags
  enableLiveChat: boolean;

  // Recruitment
  calendlyUrl: string;
  supportEmail: string;
  supportPhone: string;

  // Application
  appName: string;
  appVersion: string;
  appEnvironment: 'development' | 'staging' | 'production';
}

function getEnvVar(key: string, defaultValue = ''): string {
  return import.meta.env[key] || defaultValue;
}

function getBoolEnvVar(key: string, defaultValue = false): boolean {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
}

function getNumberEnvVar(key: string, defaultValue: number): number {
  const value = import.meta.env[key];
  return value ? parseInt(value, 10) : defaultValue;
}

export const env: EnvironmentConfig = {
  // API
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3000/api'),
  apiTimeout: getNumberEnvVar('VITE_API_TIMEOUT', 10000),

  // Analytics
  googleAnalyticsId: getEnvVar('VITE_GOOGLE_ANALYTICS_ID'),
  gaMeasurementId: getEnvVar('VITE_GA_MEASUREMENT_ID'),
  enableAnalytics: getBoolEnvVar('VITE_ENABLE_ANALYTICS', false),

  // Error Tracking
  sentryDsn: getEnvVar('VITE_SENTRY_DSN'),
  sentryEnvironment: getEnvVar('VITE_SENTRY_ENVIRONMENT', 'development'),
  enableErrorTracking: getBoolEnvVar('VITE_ENABLE_ERROR_TRACKING', false),

  // Feature Flags
  enableLiveChat: getBoolEnvVar('VITE_ENABLE_LIVE_CHAT', false),

  // Recruitment
  calendlyUrl: getEnvVar('VITE_CALENDLY_URL', 'https://calendly.com/demo/15min'),
  supportEmail: getEnvVar('VITE_SUPPORT_EMAIL', 'careers@example.com'),
  supportPhone: getEnvVar('VITE_SUPPORT_PHONE', '+1-555-0123'),

  // Application
  appName: getEnvVar('VITE_APP_NAME', 'Wealth Pro Recruitment'),
  appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  appEnvironment: (getEnvVar('VITE_APP_ENVIRONMENT', 'development') as EnvironmentConfig['appEnvironment']),
};

export const isDevelopment = env.appEnvironment === 'development';
export const isProduction = env.appEnvironment === 'production';
export const isStaging = env.appEnvironment === 'staging';
