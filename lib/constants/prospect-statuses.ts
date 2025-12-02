// Prospect status types and transitions
export type ProspectStatus =
  | 'LEAD'
  | 'QUALIFIED'
  | 'INSURANCE_CLIENT'
  | 'AGENT_PROSPECT'
  | 'LICENSED_AGENT'
  | 'INACTIVE';

export const PROSPECT_STATUSES: ProspectStatus[] = [
  'LEAD',
  'QUALIFIED',
  'INSURANCE_CLIENT',
  'AGENT_PROSPECT',
  'LICENSED_AGENT',
  'INACTIVE',
];

export const STATUS_LABELS: Record<ProspectStatus, string> = {
  LEAD: 'New Lead',
  QUALIFIED: 'Qualified',
  INSURANCE_CLIENT: 'Insurance Client',
  AGENT_PROSPECT: 'Agent Prospect',
  LICENSED_AGENT: 'Licensed Agent',
  INACTIVE: 'Inactive',
};

export const STATUS_COLORS: Record<ProspectStatus, { bg: string; text: string }> = {
  LEAD: { bg: 'bg-gray-100', text: 'text-gray-700' },
  QUALIFIED: { bg: 'bg-blue-100', text: 'text-blue-700' },
  INSURANCE_CLIENT: { bg: 'bg-green-100', text: 'text-green-700' },
  AGENT_PROSPECT: { bg: 'bg-purple-100', text: 'text-purple-700' },
  LICENSED_AGENT: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  INACTIVE: { bg: 'bg-red-100', text: 'text-red-700' },
};

// Valid status transitions
// INACTIVE can transition to any status (reactivation)
// Each status can always go to INACTIVE
export const VALID_TRANSITIONS: Record<ProspectStatus, ProspectStatus[]> = {
  LEAD: ['QUALIFIED', 'INACTIVE'],
  QUALIFIED: ['INSURANCE_CLIENT', 'AGENT_PROSPECT', 'INACTIVE'],
  INSURANCE_CLIENT: ['AGENT_PROSPECT', 'INACTIVE'],
  AGENT_PROSPECT: ['LICENSED_AGENT', 'INACTIVE'],
  LICENSED_AGENT: ['INACTIVE'],
  INACTIVE: ['LEAD', 'QUALIFIED', 'INSURANCE_CLIENT', 'AGENT_PROSPECT', 'LICENSED_AGENT'],
};

/**
 * Check if a status transition is valid
 */
export function isValidTransition(from: ProspectStatus, to: ProspectStatus): boolean {
  if (from === to) return true; // Same status is always valid
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Get all valid next statuses for a given current status (including current)
 */
export function getValidNextStatuses(currentStatus: ProspectStatus): ProspectStatus[] {
  return [currentStatus, ...(VALID_TRANSITIONS[currentStatus] || [])];
}

/**
 * Get a human-readable error message for invalid transitions
 */
export function getTransitionErrorMessage(from: ProspectStatus, to: ProspectStatus): string {
  const validNext = VALID_TRANSITIONS[from]?.map(s => STATUS_LABELS[s]).join(', ') || 'none';
  return `Cannot change status from "${STATUS_LABELS[from]}" to "${STATUS_LABELS[to]}". Valid next statuses: ${validNext}`;
}
