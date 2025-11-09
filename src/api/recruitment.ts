/**
 * Recruitment API
 * Functions for submitting applications and related recruitment actions
 */

import { z } from 'zod';
import { post } from './client';
import { handleValidationError } from '../utils/error-handler';

/**
 * Application Form Schema
 */
export const ApplicationFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Please enter a valid email').toLowerCase(),
  phone: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit phone number'),
  currentOccupation: z.string().min(1, 'Current occupation is required').max(100),
  experience: z.enum(['none', 'some', 'experienced']),
  hasLicense: z.enum(['yes', 'no']),
  motivation: z.string().min(10, 'Please tell us more about your motivation (at least 10 characters)').max(1000),
  availability: z.enum(['full-time', 'part-time', 'flexible']),
  referralSource: z.string().max(100).optional(),
});

export type ApplicationFormData = z.infer<typeof ApplicationFormSchema>;

/**
 * Application Response
 */
export interface ApplicationResponse {
  success: boolean;
  applicationId: string;
  message: string;
  nextSteps?: {
    step: string;
    description: string;
    eta?: string;
  }[];
}

/**
 * Submit application
 */
export async function submitApplication(
  data: unknown
): Promise<ApplicationResponse> {
  try {
    // Validate data with Zod
    const validatedData = ApplicationFormSchema.parse(data);

    // Submit to API
    const response = await post<ApplicationResponse>('/applications/submit', {
      ...validatedData,
      submittedAt: new Date().toISOString(),
      source: 'web_application',
    });

    // Track conversion event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'application_submitted', {
        event_category: 'recruitment',
        event_label: 'application_form',
        value: 1,
      });
    }

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      handleValidationError(new Error(error.issues[0].message), data as any);
      throw error;
    }
    throw error;
  }
}

/**
 * Schedule interview/call via Calendly
 */
export interface ScheduleCallData {
  email: string;
  name: string;
  phone?: string;
}

export async function scheduleCall(data: ScheduleCallData): Promise<{ success: boolean; calendlyUrl: string }> {
  const response = await post<{ success: boolean; calendlyUrl: string }>('/recruitment/schedule-call', data);

  // Track event
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'call_scheduled', {
      event_category: 'recruitment',
      event_label: 'schedule_call',
    });
  }

  return response;
}

/**
 * Get income projection (for calculator)
 */
export interface IncomeProjectionRequest {
  monthlyPolicies: number;
  avgPremium: number;
  renewalBook: number;
  tierOverride?: string;
  teamProduction?: number;
  teamOverridePercentage?: number;
}

export interface IncomeProjection {
  firstYearIncome: number;
  fiveYearProjection: Array<{
    year: number;
    income: number;
  }>;
  tier: string;
  breakdowns: {
    firstYearCommission: number;
    renewalIncome: number;
    bonuses: number;
    teamOverride: number;
  };
}

export async function getIncomeProjection(
  _data: IncomeProjectionRequest
): Promise<IncomeProjection> {
  // For now, calculate client-side
  // In production, this should come from server to hide commission structure
  throw new Error('Not implemented - calculate client-side for now');
}

/**
 * Subscribe to email list
 */
export interface EmailSubscribeData {
  email: string;
  firstName?: string;
  lastName?: string;
  interests?: string[];
}

export async function subscribeToEmailList(
  data: EmailSubscribeData
): Promise<{ success: boolean; message: string }> {
  const response = await post<{ success: boolean; message: string }>('/recruitment/subscribe', data);

  // Track event
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'email_subscribed', {
      event_category: 'recruitment',
      event_label: 'email_list',
    });
  }

  return response;
}

/**
 * Download lead magnet (e.g., career guide PDF)
 */
export interface DownloadLeadMagnetData {
  email: string;
  magnetType: 'income_projection' | 'career_guide' | 'success_roadmap';
  name?: string;
}

export async function downloadLeadMagnet(
  data: DownloadLeadMagnetData
): Promise<{ success: boolean; downloadUrl: string }> {
  const response = await post<{ success: boolean; downloadUrl: string }>('/recruitment/lead-magnet', data);

  // Track event
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'lead_magnet_downloaded', {
      event_category: 'recruitment',
      event_label: data.magnetType,
    });
  }

  return response;
}
