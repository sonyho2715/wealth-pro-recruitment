'use client';

import { useState } from 'react';
import {
  Check,
  X,
  Star,
  Info,
  ChevronDown,
  ChevronUp,
  Calendar,
  DollarSign,
  Users,
  Award,
} from 'lucide-react';
import {
  RetirementPlanOption,
  RetirementPlanType,
  getPlanTypeName,
  getComplexityBadge,
  formatContribution,
} from '@/lib/retirement-plan-calculator';

interface RetirementPlanMatrixProps {
  options: RetirementPlanOption[];
  currentContribution?: number;
  recommendedPlanType?: RetirementPlanType;
  onPlanSelect?: (planType: RetirementPlanType) => void;
}

export function RetirementPlanMatrix({
  options,
  currentContribution = 0,
  recommendedPlanType,
  onPlanSelect,
}: RetirementPlanMatrixProps) {
  const [selectedPlan, setSelectedPlan] = useState<RetirementPlanType | null>(
    recommendedPlanType || options[0]?.planType || null
  );
  const [expandedPlan, setExpandedPlan] = useState<RetirementPlanType | null>(null);

  const handlePlanSelect = (planType: RetirementPlanType) => {
    setSelectedPlan(planType);
    onPlanSelect?.(planType);
  };

  const selectedOption = options.find(o => o.planType === selectedPlan);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Retirement Plan Comparison</h3>
            <p className="text-sm text-gray-600 mt-1">
              Compare tax-advantaged retirement options based on your business profile
            </p>
          </div>
          {currentContribution > 0 && (
            <div className="text-right">
              <div className="text-sm text-gray-500">Current Contributions</div>
              <div className="text-lg font-bold text-gray-700">
                {formatContribution(currentContribution)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {options.map((option) => {
          const isRecommended = option.planType === recommendedPlanType;
          const isSelected = option.planType === selectedPlan;
          const isExpanded = option.planType === expandedPlan;
          const complexityBadge = getComplexityBadge(option.complexity);

          return (
            <div
              key={option.planType}
              className={`relative bg-white rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-purple-500 shadow-lg'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              {/* Recommended Badge */}
              {isRecommended && (
                <div className="absolute -top-3 left-4 px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Recommended
                </div>
              )}

              {/* Card Header */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => handlePlanSelect(option.planType)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900">{option.name}</h4>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${complexityBadge.color}`}>
                      {complexityBadge.label}
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-purple-500 border-purple-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                </div>

                {/* Key Numbers */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-green-600">
                      {formatContribution(option.maxContribution)}
                    </div>
                    <div className="text-xs text-gray-500">Max Contribution</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {formatContribution(option.taxSavings)}
                    </div>
                    <div className="text-xs text-gray-500">Tax Savings</div>
                  </div>
                </div>

                {/* Quick Features */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span>Setup: {option.setupCost}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Admin: {option.annualAdminCost}/yr</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {option.hasRothOption ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-green-600">Roth Option</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-400">No Roth</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {option.loanAllowed ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-green-600">Loans Allowed</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-400">No Loans</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Expand Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedPlan(isExpanded ? null : option.planType);
                  }}
                  className="mt-3 w-full flex items-center justify-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                >
                  {isExpanded ? (
                    <>
                      Less Details <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      More Details <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                  {/* Best For */}
                  <div className="mb-3">
                    <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      Best For
                    </h5>
                    <ul className="space-y-1">
                      {option.bestFor.map((item, index) => (
                        <li key={index} className="flex items-start gap-1 text-sm text-gray-600">
                          <Award className="h-3 w-3 text-purple-500 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Deadlines */}
                  <div className="mb-3">
                    <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      Key Deadlines
                    </h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Setup by:</span>
                        <span className="text-gray-700">{option.deadlineToSetup}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Fund by:</span>
                        <span className="text-gray-700">{option.deadlineToFund}</span>
                      </div>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="mb-3">
                    <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      Requirements
                    </h5>
                    <ul className="space-y-1">
                      {option.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-1 text-sm text-gray-600">
                          <Info className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Considerations */}
                  {option.considerations.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        Considerations
                      </h5>
                      <ul className="space-y-1">
                        {option.considerations.map((item, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            * {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Plan Summary */}
      {selectedOption && (
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <h4 className="font-bold text-gray-900 mb-3">
            Selected: {selectedOption.name}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Max Contribution</span>
              <div className="font-bold text-green-600">
                {formatContribution(selectedOption.maxContribution)}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Estimated Tax Savings</span>
              <div className="font-bold text-blue-600">
                {formatContribution(selectedOption.taxSavings)}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Employer Portion</span>
              <div className="font-bold">
                {formatContribution(selectedOption.employerContribution)}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Employee Portion</span>
              <div className="font-bold">
                {formatContribution(selectedOption.employeeContribution)}
              </div>
            </div>
          </div>

          {currentContribution > 0 && (
            <div className="mt-4 pt-4 border-t border-purple-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Additional contribution potential:</span>
                <span className="text-xl font-bold text-purple-600">
                  +{formatContribution(Math.max(0, selectedOption.maxContribution - currentContribution))}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface RetirementPlanCompactProps {
  recommended: RetirementPlanOption;
  currentContribution: number;
}

export function RetirementPlanCompact({ recommended, currentContribution }: RetirementPlanCompactProps) {
  const additionalPotential = Math.max(0, recommended.maxContribution - currentContribution);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-gray-900">{recommended.name}</h4>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
              Recommended
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Best retirement plan option for your business
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-green-600">
            {formatContribution(recommended.maxContribution)}
          </div>
          <div className="text-xs text-gray-500">Max Contribution</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-blue-600">
            {formatContribution(recommended.taxSavings)}
          </div>
          <div className="text-xs text-gray-500">Tax Savings</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-purple-600">
            +{formatContribution(additionalPotential)}
          </div>
          <div className="text-xs text-gray-500">Additional Potential</div>
        </div>
      </div>

      <div className="mt-3 text-sm text-gray-600">
        <strong>Setup deadline:</strong> {recommended.deadlineToSetup}
      </div>
    </div>
  );
}

export default RetirementPlanMatrix;
