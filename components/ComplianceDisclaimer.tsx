/**
 * Compliance Disclaimer Component
 * Required disclaimers for FTC, insurance, and financial projections
 *
 * SAFE HARBOR LANGUAGE - These disclaimers are legally critical:
 * 1. "Hypothetical illustration" - Not a promise or guarantee
 * 2. "Results are not typical" - FTC required language
 * 3. "No guarantee of income" - Prevents income claims liability
 * 4. "Educational purposes only" - Classifies content, not promotional
 * 5. User acknowledgment - Documents informed consent
 */

interface ComplianceDisclaimerProps {
  variant?: 'full' | 'compact' | 'income' | 'scenario-header' | 'safe-harbor';
  className?: string;
}

export default function ComplianceDisclaimer({
  variant = 'full',
  className = ''
}: ComplianceDisclaimerProps) {

  // Safe Harbor - The strongest legal protection language
  if (variant === 'safe-harbor') {
    return (
      <div className={`bg-slate-900 text-white rounded-xl p-6 ${className}`}>
        <h4 className="font-bold text-amber-400 mb-3 text-sm uppercase tracking-wide">
          Important Earnings Disclosure
        </h4>
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>
            All income figures, projections, and financial scenarios presented on this platform
            are <strong className="text-white">hypothetical illustrations</strong> for
            <strong className="text-white"> educational purposes only</strong>.
          </p>
          <p className="text-amber-300 font-medium">
            Results are not typical. There is no guarantee of income.
          </p>
          <p>
            Individual results vary significantly based on effort, sales ability, market conditions,
            geographic location, available time, personal network, and many other factors outside
            our control. The majority of individuals who enter this field earn less than the
            amounts illustrated. Some individuals earn nothing.
          </p>
          <p>
            Past performance does not guarantee future results. Any income examples shown are
            not intended to represent or guarantee that anyone will achieve the same or similar
            results.
          </p>
          <p className="text-xs text-slate-400 pt-2 border-t border-slate-700">
            By using this tool, you acknowledge that all projections are hypothetical and that
            you are responsible for your own due diligence before making any business decisions.
          </p>
        </div>
      </div>
    );
  }

  // Scenario Header - Brief reminder when in scenario mode
  if (variant === 'scenario-header') {
    return (
      <div className={`bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2 ${className}`}>
        <p className="text-amber-700 text-xs font-medium">
          You are viewing <strong>hypothetical scenarios</strong>. All figures are for educational
          purposes only and are not guarantees of income.
        </p>
      </div>
    );
  }

  // Income Disclaimer - For income projection displays
  if (variant === 'income') {
    return (
      <div className={`bg-amber-50 border border-amber-200 rounded-xl p-4 ${className}`}>
        <p className="text-amber-800 text-sm font-medium mb-2">Important Income Disclosure</p>
        <p className="text-amber-700 text-xs leading-relaxed">
          Income figures shown are <strong>hypothetical illustrations</strong> based on
          user-provided inputs and industry-average assumptions. <strong>Results are not typical.</strong> Individual
          results vary significantly based on effort, sales ability, market conditions, and many
          other factors. The majority of new agents earn less than the projections shown.
          <strong> There is no guarantee of income.</strong> Past performance does not guarantee
          future results.
        </p>
      </div>
    );
  }

  // Compact - One-liner for footers
  if (variant === 'compact') {
    return (
      <p className={`text-gray-500 text-xs ${className}`}>
        Income projections are hypothetical illustrations, not guarantees. Results are not typical.
        Individual outcomes vary. Insurance subject to underwriting. Not financial advice.
        Consult licensed professionals.
      </p>
    );
  }

  // Full disclaimer - Complete legal disclosure
  return (
    <div className={`bg-gray-100 rounded-xl p-6 space-y-4 ${className}`}>
      <h4 className="font-semibold text-gray-900 text-sm">Important Disclosures</h4>

      <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
        <p>
          <strong>Income Disclosure:</strong> All income projections, scenarios, and financial
          illustrations shown on this platform are <strong>hypothetical</strong> and presented
          for <strong>educational purposes only</strong>. These figures are not intended to
          represent or guarantee actual earnings. <strong>Results are not typical.</strong> Individual
          results vary significantly based on effort, sales ability, market conditions, geographic
          location, available time, personal network, licensing, and many other factors. The
          majority of individuals who join earn less than the amounts illustrated. Some individuals
          earn nothing. <strong>There is no guarantee of income.</strong> Past performance does
          not guarantee future results.
        </p>

        <p>
          <strong>User-Controlled Projections:</strong> Where income scenarios are presented
          based on user-provided inputs (such as estimated sales activity), the resulting
          figures are generated from the user's own hypothetical assumptions combined with
          industry-average data. These user-generated scenarios do not constitute earnings
          claims or guarantees by this platform.
        </p>

        <p>
          <strong>Insurance Products:</strong> All insurance products and coverage amounts
          referenced are subject to underwriting approval. Premium estimates are illustrations
          only and actual premiums will vary based on age, health, coverage amount, and other
          underwriting factors. Policy terms, conditions, and exclusions apply. Insurance
          products are offered through properly licensed agents.
        </p>

        <p>
          <strong>Not Professional Advice:</strong> This platform is for informational and
          educational purposes only. The information provided does not constitute financial,
          investment, tax, legal, or career advice. Consult with qualified, licensed professionals
          before making any financial or career decisions.
        </p>

        <p>
          <strong>Licensing Requirements:</strong> Insurance agents must be properly licensed
          in their state(s) of operation. Licensing requirements, costs, and timelines vary
          by state. Passing licensing exams is not guaranteed.
        </p>

        <p>
          <strong>Forward-Looking Statements:</strong> Any projections or scenarios about
          future income, market conditions, or business performance are forward-looking
          statements that involve risks and uncertainties. Actual results may differ materially
          from those projected.
        </p>
      </div>
    </div>
  );
}
