import { AlertTriangle, Info, Shield } from 'lucide-react';

interface ComplianceDisclaimerProps {
  variant?: 'inline' | 'banner' | 'footer' | 'modal';
  showIcon?: boolean;
}

export default function ComplianceDisclaimer({
  variant = 'inline',
  showIcon = true
}: ComplianceDisclaimerProps) {
  const disclaimerContent = {
    income: "Income examples shown are illustrative only and not guaranteed. Individual results vary significantly based on effort, skills, market conditions, and other factors. These projections represent potential earnings for dedicated full-time agents and should not be construed as typical results or promises of specific income levels.",
    results: "Past performance does not guarantee future results. The income figures and success stories presented are based on historical data and may not reflect current market conditions or your individual experience.",
    commission: "Commission structures, bonus programs, and override percentages are subject to change at the company's discretion. Actual compensation may differ based on product type, carrier agreements, and individual performance.",
    general: "This platform is for educational and illustrative purposes only. All calculations, projections, and recommendations are general in nature and should not be considered personalized financial, legal, or career advice. Consult with appropriate professionals before making career decisions.",
  };

  if (variant === 'inline') {
    return (
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-2">
          {showIcon && <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />}
          <p className="text-xs text-amber-800">
            <strong>Important:</strong> {disclaimerContent.income}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-y border-amber-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-3">
            {showIcon && (
              <div className="p-2 bg-amber-100 rounded-full flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
            )}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-amber-900">
                Income Disclosure Statement
              </p>
              <p className="text-xs text-amber-800">{disclaimerContent.income}</p>
              <p className="text-xs text-amber-700">{disclaimerContent.results}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className="mt-8 p-6 bg-gray-100 border-t border-gray-200">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-gray-600" />
            <h4 className="font-bold text-gray-900">Important Disclosures</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
            <div>
              <p className="font-semibold text-gray-700 mb-1">Income Disclaimer</p>
              <p>{disclaimerContent.income}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-1">Results Disclaimer</p>
              <p>{disclaimerContent.results}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-1">Commission Disclaimer</p>
              <p>{disclaimerContent.commission}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-1">General Disclaimer</p>
              <p>{disclaimerContent.general}</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 pt-4 border-t border-gray-300">
            By using this platform, you acknowledge that you have read and understood these disclosures.
            This platform is not affiliated with or endorsed by any regulatory body.
            All trademarks and service marks are the property of their respective owners.
          </p>
        </div>
      </div>
    );
  }

  // Modal variant
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-amber-100 rounded-full">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Important Disclosures</h3>
          <p className="text-sm text-gray-600">Please read before proceeding</p>
        </div>
      </div>

      <div className="space-y-4 text-sm text-gray-700">
        <div className="p-4 bg-amber-50 rounded-lg">
          <p className="font-semibold text-amber-900 mb-2">Income Disclaimer</p>
          <p className="text-amber-800">{disclaimerContent.income}</p>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="font-semibold text-blue-900 mb-2">Results Disclaimer</p>
          <p className="text-blue-800">{disclaimerContent.results}</p>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg">
          <p className="font-semibold text-purple-900 mb-2">Commission Disclaimer</p>
          <p className="text-purple-800">{disclaimerContent.commission}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="font-semibold text-gray-900 mb-2">General Disclaimer</p>
          <p className="text-gray-700">{disclaimerContent.general}</p>
        </div>
      </div>
    </div>
  );
}

// Inline disclaimer for specific sections
export function IncomeDisclaimer() {
  return (
    <p className="text-xs text-gray-500 italic mt-2">
      * Income figures are illustrative and not guaranteed. Individual results vary based on effort,
      skills, and market conditions. These examples represent potential earnings for dedicated agents
      and are not typical results.
    </p>
  );
}

// Testimonial disclaimer
export function TestimonialDisclaimer() {
  return (
    <p className="text-xs text-gray-500 italic">
      * Individual results vary. Testimonials represent the experiences of specific individuals
      and may not reflect typical results. Past performance does not guarantee future success.
    </p>
  );
}

// Calculator disclaimer
export function CalculatorDisclaimer() {
  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-4">
      <p className="text-xs text-blue-800">
        <strong>Calculator Disclaimer:</strong> This calculator provides estimates based on the
        inputs you provide and current commission structures. Actual earnings depend on many factors
        including product mix, client retention, market conditions, and individual effort. Commission
        rates and bonus structures are subject to change. Use these projections for illustrative
        purposes only.
      </p>
    </div>
  );
}
