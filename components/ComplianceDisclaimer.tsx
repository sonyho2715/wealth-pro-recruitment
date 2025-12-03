/**
 * Compliance Disclaimer Component
 * Required disclaimers for FTC, insurance, and financial projections
 */

interface ComplianceDisclaimerProps {
  variant?: 'full' | 'compact' | 'income';
  className?: string;
}

export default function ComplianceDisclaimer({
  variant = 'full',
  className = ''
}: ComplianceDisclaimerProps) {

  if (variant === 'income') {
    return (
      <div className={`bg-amber-50 border border-amber-200 rounded-xl p-4 ${className}`}>
        <p className="text-amber-800 text-sm font-medium mb-2">Important Income Disclosure</p>
        <p className="text-amber-700 text-xs leading-relaxed">
          Income figures shown are <strong>hypothetical illustrations</strong> based on industry averages
          and assumed sales volumes. <strong>Results are not typical.</strong> Individual results vary
          significantly based on effort, sales ability, market conditions, and many other factors.
          The majority of new agents earn less than the projections shown. There is no guarantee of
          income. Past performance does not guarantee future results.
        </p>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <p className={`text-gray-500 text-xs ${className}`}>
        Income projections are hypothetical illustrations, not guarantees. Results vary.
        Insurance subject to underwriting. Not financial advice. Consult licensed professionals.
      </p>
    );
  }

  // Full disclaimer
  return (
    <div className={`bg-gray-100 rounded-xl p-6 space-y-4 ${className}`}>
      <h4 className="font-semibold text-gray-900 text-sm">Important Disclosures</h4>

      <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
        <p>
          <strong>Income Disclosure:</strong> All income projections shown are hypothetical
          illustrations based on industry averages and assumed sales volumes. These figures
          are for educational purposes only and do not represent actual earnings or guarantee
          future income. Individual results vary significantly based on effort, sales ability,
          market conditions, licensing, and many other factors. The majority of individuals
          who join earn less than the amounts illustrated. There is no assurance that any
          prior success or past results will indicate future income.
        </p>

        <p>
          <strong>Insurance Products:</strong> All insurance products and coverage amounts
          referenced are subject to underwriting approval. Premium estimates are illustrations
          only and actual premiums will vary based on age, health, coverage amount, and other
          underwriting factors. Policy terms, conditions, and exclusions apply.
        </p>

        <p>
          <strong>Not Professional Advice:</strong> This platform is for informational and
          educational purposes only. The information provided does not constitute financial,
          investment, tax, or legal advice. Consult with qualified, licensed professionals
          before making any financial decisions.
        </p>

        <p>
          <strong>Licensing:</strong> Insurance agents must be properly licensed in their
          state(s) of operation. Licensing requirements vary by state.
        </p>
      </div>
    </div>
  );
}
