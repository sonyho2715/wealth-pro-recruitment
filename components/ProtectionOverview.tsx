'use client';

import { Shield, AlertTriangle, CheckCircle, AlertCircle, Car, Home, Umbrella, Heart, Stethoscope, Clock, FileText, Users, Scale } from 'lucide-react';

interface ProtectionData {
  // Insurance Coverage
  lifeInsurance: number;
  disabilityMonthly: number;
  autoInsurance: boolean;
  homeownersInsurance: boolean;
  umbrellaPolicy: boolean;
  healthInsurance: boolean;
  longTermCare: boolean;

  // Estate Documents
  hasWill: boolean;
  hasTrust: boolean;
  hasPowerOfAttorney: boolean;
  hasLivingWill: boolean;

  // Calculated needs
  lifeInsuranceNeed: number;
  disabilityNeed: number;
  annualIncome: number;
}

interface ProtectionOverviewProps {
  data: ProtectionData;
}

type StatusLevel = 'warning' | 'moderate' | 'optimal';

function getLifeInsuranceStatus(current: number, need: number): StatusLevel {
  if (current === 0) return 'warning';
  const ratio = current / need;
  if (ratio >= 0.8) return 'optimal';
  if (ratio >= 0.4) return 'moderate';
  return 'warning';
}

function getDisabilityStatus(current: number, income: number): StatusLevel {
  const monthlyIncome = income / 12;
  const targetCoverage = monthlyIncome * 0.6; // 60% income replacement
  if (current === 0) return 'warning';
  const ratio = current / targetCoverage;
  if (ratio >= 0.8) return 'optimal';
  if (ratio >= 0.4) return 'moderate';
  return 'warning';
}

function getBooleanStatus(has: boolean): StatusLevel {
  return has ? 'optimal' : 'warning';
}

const statusColors = {
  warning: {
    bg: 'bg-red-100',
    border: 'border-red-300',
    text: 'text-red-700',
    icon: 'text-red-500',
    label: 'Warning',
    dot: 'bg-red-500'
  },
  moderate: {
    bg: 'bg-amber-100',
    border: 'border-amber-300',
    text: 'text-amber-700',
    icon: 'text-amber-500',
    label: 'Moderate',
    dot: 'bg-amber-500'
  },
  optimal: {
    bg: 'bg-green-100',
    border: 'border-green-300',
    text: 'text-green-700',
    icon: 'text-green-500',
    label: 'Optimal',
    dot: 'bg-green-500'
  }
};

function StatusBadge({ status }: { status: StatusLevel }) {
  const colors = statusColors[status];
  const Icon = status === 'optimal' ? CheckCircle : status === 'moderate' ? AlertCircle : AlertTriangle;

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${colors.bg}`}>
      <Icon className={`w-3.5 h-3.5 ${colors.icon}`} />
      <span className={`text-xs font-medium ${colors.text}`}>{colors.label}</span>
    </div>
  );
}

function ProtectionItem({
  icon: Icon,
  label,
  value,
  status,
  subtext
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  status: StatusLevel;
  subtext?: string;
}) {
  const colors = statusColors[status];

  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border ${colors.border} ${colors.bg}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-white/60`}>
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
        <div>
          <div className="font-medium text-slate-800">{label}</div>
          {subtext && <div className="text-xs text-slate-500">{subtext}</div>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`font-semibold ${colors.text}`}>{value}</span>
        <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
      </div>
    </div>
  );
}

export default function ProtectionOverview({ data }: ProtectionOverviewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate statuses
  const lifeStatus = getLifeInsuranceStatus(data.lifeInsurance, data.lifeInsuranceNeed);
  const disabilityStatus = getDisabilityStatus(data.disabilityMonthly, data.annualIncome);
  const autoStatus = getBooleanStatus(data.autoInsurance);
  const homeStatus = getBooleanStatus(data.homeownersInsurance);
  const umbrellaStatus = getBooleanStatus(data.umbrellaPolicy);
  const healthStatus = getBooleanStatus(data.healthInsurance);
  const ltcStatus = getBooleanStatus(data.longTermCare);
  const willStatus = getBooleanStatus(data.hasWill);
  const trustStatus = getBooleanStatus(data.hasTrust);
  const poaStatus = getBooleanStatus(data.hasPowerOfAttorney);
  const livingWillStatus = getBooleanStatus(data.hasLivingWill);

  // Count statuses for summary
  const allStatuses = [lifeStatus, disabilityStatus, autoStatus, homeStatus, umbrellaStatus, healthStatus, ltcStatus, willStatus, trustStatus, poaStatus, livingWillStatus];
  const warningCount = allStatuses.filter(s => s === 'warning').length;
  const moderateCount = allStatuses.filter(s => s === 'moderate').length;
  const optimalCount = allStatuses.filter(s => s === 'optimal').length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Protection Overview</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="text-white text-sm font-medium">{warningCount}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-300" />
              <span className="text-white text-sm font-medium">{moderateCount}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <span className="text-white text-sm font-medium">{optimalCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Legend */}
        <div className="flex items-center gap-6 mb-6 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-slate-600">Warning - Needs Attention</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-sm text-slate-600">Moderate - Review Recommended</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-slate-600">Optimal - Well Protected</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Insurance Coverage */}
          <div>
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              Insurance Coverage
            </h3>
            <div className="space-y-2">
              <ProtectionItem
                icon={Shield}
                label="Life Insurance"
                value={formatCurrency(data.lifeInsurance)}
                status={lifeStatus}
                subtext={`Need: ${formatCurrency(data.lifeInsuranceNeed)}`}
              />
              <ProtectionItem
                icon={Stethoscope}
                label="Disability (Monthly)"
                value={formatCurrency(data.disabilityMonthly)}
                status={disabilityStatus}
                subtext="60% income replacement recommended"
              />
              <ProtectionItem
                icon={Car}
                label="Auto Insurance"
                value={data.autoInsurance ? 'Yes' : 'No'}
                status={autoStatus}
              />
              <ProtectionItem
                icon={Home}
                label="Homeowner's Insurance"
                value={data.homeownersInsurance ? 'Yes' : 'No'}
                status={homeStatus}
              />
              <ProtectionItem
                icon={Umbrella}
                label="Umbrella Policy"
                value={data.umbrellaPolicy ? 'Yes' : 'No'}
                status={umbrellaStatus}
              />
              <ProtectionItem
                icon={Heart}
                label="Health Insurance"
                value={data.healthInsurance ? 'Yes' : 'No'}
                status={healthStatus}
              />
              <ProtectionItem
                icon={Clock}
                label="Long Term Care"
                value={data.longTermCare ? 'Yes' : 'No'}
                status={ltcStatus}
              />
            </div>
          </div>

          {/* Estate Documents */}
          <div>
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Estate Documents
            </h3>
            <div className="space-y-2">
              <ProtectionItem
                icon={FileText}
                label="Will"
                value={data.hasWill ? 'Yes' : 'No'}
                status={willStatus}
                subtext="Directs asset distribution"
              />
              <ProtectionItem
                icon={Users}
                label="Trust"
                value={data.hasTrust ? 'Yes' : 'No'}
                status={trustStatus}
                subtext="Avoids probate, protects assets"
              />
              <ProtectionItem
                icon={Scale}
                label="Power of Attorney"
                value={data.hasPowerOfAttorney ? 'Yes' : 'No'}
                status={poaStatus}
                subtext="Financial decisions if incapacitated"
              />
              <ProtectionItem
                icon={Heart}
                label="Living Will / Healthcare Directive"
                value={data.hasLivingWill ? 'Yes' : 'No'}
                status={livingWillStatus}
                subtext="Medical decisions if incapacitated"
              />
            </div>

            {/* Summary Card */}
            {warningCount > 0 && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <div className="font-semibold text-red-800">
                      {warningCount} Area{warningCount > 1 ? 's' : ''} Need{warningCount === 1 ? 's' : ''} Attention
                    </div>
                    <p className="text-sm text-red-600 mt-1">
                      Review your protection gaps to ensure your family is fully protected.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
