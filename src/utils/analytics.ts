/**
 * Analytics Utilities
 * Google Analytics 4 and Web Vitals tracking
 */

import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';
import type { Metric } from 'web-vitals';
import { env } from '../config/env';

/**
 * Initialize Google Analytics
 */
export function initAnalytics(): void {
  if (!env.enableAnalytics || !env.googleAnalyticsId) {
    console.log('[Analytics] Disabled');
    return;
  }

  // Load Google Analytics script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${env.googleAnalyticsId}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', env.googleAnalyticsId, {
    send_page_view: true,
  });

  console.log(`[Analytics] Initialized (${env.googleAnalyticsId})`);

  // Track Web Vitals
  initWebVitals();
}

/**
 * Initialize Web Vitals tracking
 */
function initWebVitals(): void {
  function sendToAnalytics(metric: Metric) {
    const { name, value, id } = metric;

    // Send to Google Analytics
    if (window.gtag) {
      window.gtag('event', name, {
        event_category: 'Web Vitals',
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        event_label: id,
        non_interaction: true,
      });
    }

    // Log in development
    if (env.appEnvironment === 'development') {
      console.log(`[Web Vitals] ${name}:`, value);
    }
  }

  onCLS(sendToAnalytics);
  onINP(sendToAnalytics); // Replaced FID with INP in web-vitals v5
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}

/**
 * Track page view
 */
export function trackPageView(page: string, title?: string): void {
  if (!env.enableAnalytics || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_title: title || document.title,
    page_path: page,
  });
}

/**
 * Track event
 */
export function trackEvent(
  action: string,
  category?: string,
  label?: string,
  value?: number
): void {
  if (!env.enableAnalytics || !window.gtag) return;

  window.gtag('event', action, {
    event_category: category || 'engagement',
    event_label: label,
    value,
  });
}

/**
 * Track conversion
 */
export function trackConversion(
  conversionId: string,
  value?: number,
  currency: string = 'USD'
): void {
  if (!env.enableAnalytics || !window.gtag) return;

  window.gtag('event', 'conversion', {
    send_to: conversionId,
    value,
    currency,
  });
}

/**
 * Track calculator interaction
 */
export function trackCalculatorInteraction(data: {
  monthlyPolicies: number;
  avgPremium: number;
  projectedIncome: number;
  tier: string;
}): void {
  trackEvent('calculator_interaction', 'recruitment', 'income_calculator', data.projectedIncome);

  if (window.gtag) {
    window.gtag('event', 'calculator_used', {
      event_category: 'recruitment',
      monthly_policies: data.monthlyPolicies,
      avg_premium: data.avgPremium,
      projected_income: data.projectedIncome,
      tier: data.tier,
    });
  }
}

/**
 * Track form interaction
 */
export function trackFormStart(formName: string): void {
  trackEvent('form_start', 'forms', formName);
}

export function trackFormSubmit(formName: string): void {
  trackEvent('form_submit', 'forms', formName);
}

export function trackFormError(formName: string, error: string): void {
  trackEvent('form_error', 'forms', `${formName}: ${error}`);
}

/**
 * Track section view
 */
export function trackSectionView(section: string): void {
  trackEvent('section_view', 'engagement', section);
}

/**
 * Track CTA click
 */
export function trackCTAClick(ctaName: string, location: string): void {
  trackEvent('cta_click', 'engagement', `${ctaName} (${location})`);
}

/**
 * Track video play
 */
export function trackVideoPlay(videoName: string): void {
  trackEvent('video_play', 'engagement', videoName);
}

/**
 * Track file download
 */
export function trackDownload(fileName: string, fileType: string): void {
  trackEvent('file_download', 'downloads', `${fileName} (${fileType})`);
}

/**
 * Track outbound link
 */
export function trackOutboundLink(url: string, label?: string): void {
  trackEvent('click', 'outbound_link', label || url);
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, any>): void {
  if (!env.enableAnalytics || !window.gtag) return;

  window.gtag('set', 'user_properties', properties);
}

/**
 * Track timing
 */
export function trackTiming(
  category: string,
  variable: string,
  value: number,
  label?: string
): void {
  if (!env.enableAnalytics || !window.gtag) return;

  window.gtag('event', 'timing_complete', {
    name: variable,
    value,
    event_category: category,
    event_label: label,
  });
}

// Extend window object for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
