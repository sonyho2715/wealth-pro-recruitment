import { useState } from 'react';
import { useClientStore } from '../../store/clientStore';
import type { ClientData } from '../../types/financial.types';
import {
  User,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Shield,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  MapPin,
  Target,
} from 'lucide-react';

export default function OnboardingWizard() {
  const { setClientData } = useClientStore();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  const [formData, setFormData] = useState<ClientData>({
    name: '',
    age: 35,
    dependents: 0,
    state: 'Hawaii',
    income: 0,
    spouseIncome: 0,
    checking: 0,
    savings: 0,
    retirement401k: 0,
    retirementIRA: 0,
    brokerage: 0,
    homeValue: 0,
    otherAssets: 0,
    lifeInsuranceCoverage: 0,
    disabilityInsuranceCoverage: 0,
    mortgage: 0,
    studentLoans: 0,
    carLoans: 0,
    creditCards: 0,
    otherDebts: 0,
    monthlyHousing: 0,
    monthlyTransportation: 0,
    monthlyFood: 0,
    monthlyUtilities: 0,
    monthlyInsurance: 0,
    monthlyEntertainment: 0,
    monthlyOther: 0,
    hasLifeInsurance: false,
    hasDisabilityInsurance: false,
    hasUmbrellaPolicy: false,
    hasEstatePlan: false,
    goals: {
      retirementAge: 65,
      retirementIncome: 0,
      emergencyFundMonths: 6,
      homeDownPayment: 0,
      educationSavings: 0,
      debtFreeDate: '',
      netWorthTarget: 0,
      annualSavingsTarget: 0,
      majorPurchase: {
        description: '',
        amount: 0,
        targetDate: '',
      },
    },
  });

  const handleChange = (field: keyof ClientData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGoalChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      goals: {
        ...prev.goals,
        [field]: value,
      },
    }));
  };

  const handleMajorPurchaseChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      goals: {
        ...prev.goals,
        majorPurchase: {
          ...prev.goals?.majorPurchase,
          [field]: value,
        },
      },
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - submit
      setClientData(formData);
      alert('✅ Your financial profile is complete! Navigate to Dashboard to see your analysis.');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  const steps = [
    { number: 1, title: 'Personal Info', icon: <User className="w-4 h-4" /> },
    { number: 2, title: 'Income', icon: <DollarSign className="w-4 h-4" /> },
    { number: 3, title: 'Assets', icon: <TrendingUp className="w-4 h-4" /> },
    { number: 4, title: 'Liabilities', icon: <TrendingDown className="w-4 h-4" /> },
    { number: 5, title: 'Expenses', icon: <Calendar className="w-4 h-4" /> },
    { number: 6, title: 'Insurance', icon: <Shield className="w-4 h-4" /> },
    { number: 7, title: 'Goals', icon: <Target className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="card-gradient text-center">
        <div className="flex justify-center mb-3">
          <Sparkles className="w-12 h-12 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-2">
          Let's Build Your Financial Profile
        </h1>
        <p className="text-gray-600">
          Answer a few simple questions to get personalized insights and recommendations
        </p>
      </div>

      {/* Progress Bar */}
      <div className="card">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Progress</span>
            <span className="text-sm font-semibold text-blue-600">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`flex flex-col items-center ${
                step.number <= currentStep ? 'opacity-100' : 'opacity-40'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                  step.number === currentStep
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110'
                    : step.number < currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.number < currentStep ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  step.icon
                )}
              </div>
              <span className="text-xs font-semibold text-gray-700 text-center hidden md:block">
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell Us About Yourself</h2>
                <p className="text-gray-600">Basic information to personalize your analysis</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="input"
                    placeholder="John Smith"
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    Your Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleChange('age', parseInt(e.target.value))}
                    className="input"
                    placeholder="35"
                    required
                  />
                </div>

                <div>
                  <label className="label">Number of Dependents</label>
                  <input
                    type="number"
                    value={formData.dependents}
                    onChange={(e) => handleChange('dependents', parseInt(e.target.value))}
                    className="input"
                    placeholder="2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Children or others financially dependent on you</p>
                </div>

                <div>
                  <label className="label">
                    State <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <select
                      value={formData.state || 'Hawaii'}
                      onChange={(e) => handleChange('state', e.target.value)}
                      className="input pl-10"
                    >
                      <option value="Hawaii">Hawaii</option>
                      <option value="California">California</option>
                      <option value="Nevada">Nevada</option>
                      <option value="Texas">Texas</option>
                      <option value="Florida">Florida</option>
                      <option value="New York">New York</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">For state tax calculations</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Income */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Income</h2>
                <p className="text-gray-600">How much do you earn annually?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">
                    Your Annual Income <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      value={formData.income}
                      onChange={(e) => handleChange('income', parseFloat(e.target.value))}
                      className="input pl-8"
                      placeholder="100,000"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Gross annual salary before taxes</p>
                </div>

                <div>
                  <label className="label">Spouse Annual Income (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      value={formData.spouseIncome || 0}
                      onChange={(e) => handleChange('spouseIncome', parseFloat(e.target.value))}
                      className="input pl-8"
                      placeholder="80,000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Leave blank if single or sole earner</p>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-900">
                  <strong>💡 Tip:</strong> Include all sources of income: salary, bonuses, side business, rental income, etc.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Assets */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Assets</h2>
                <p className="text-gray-600">What do you own? (Leave blank if zero)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Checking Account</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      value={formData.checking}
                      onChange={(e) => handleChange('checking', parseFloat(e.target.value))}
                      className="input pl-8"
                      placeholder="5,000"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Savings / Emergency Fund</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      value={formData.savings}
                      onChange={(e) => handleChange('savings', parseFloat(e.target.value))}
                      className="input pl-8"
                      placeholder="25,000"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">401(k) / Retirement Account</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      value={formData.retirement401k}
                      onChange={(e) => handleChange('retirement401k', parseFloat(e.target.value))}
                      className="input pl-8"
                      placeholder="150,000"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">IRA / Roth IRA</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      value={formData.retirementIRA}
                      onChange={(e) => handleChange('retirementIRA', parseFloat(e.target.value))}
                      className="input pl-8"
                      placeholder="50,000"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Brokerage / Investment Account</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      value={formData.brokerage}
                      onChange={(e) => handleChange('brokerage', parseFloat(e.target.value))}
                      className="input pl-8"
                      placeholder="75,000"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Home Value (if owned)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      value={formData.homeValue}
                      onChange={(e) => handleChange('homeValue', parseFloat(e.target.value))}
                      className="input pl-8"
                      placeholder="500,000"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Liabilities */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Debts</h2>
                <p className="text-gray-600">What do you owe? (Leave blank if zero)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Mortgage Balance</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      value={formData.mortgage}
                      onChange={(e) => handleChange('mortgage', parseFloat(e.target.value))}
                      className="input pl-8"
                      placeholder="350,000"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Student Loans</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      value={formData.studentLoans}
                      onChange={(e) => handleChange('studentLoans', parseFloat(e.target.value))}
                      className="input pl-8"
                      placeholder="30,000"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Car Loans</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      value={formData.carLoans}
                      onChange={(e) => handleChange('carLoans', parseFloat(e.target.value))}
                      className="input pl-8"
                      placeholder="25,000"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Credit Card Debt</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      value={formData.creditCards}
                      onChange={(e) => handleChange('creditCards', parseFloat(e.target.value))}
                      className="input pl-8"
                      placeholder="5,000"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-900">
                  <strong>💡 Tip:</strong> High-interest debt (like credit cards) should be prioritized for payoff. We'll show you the optimal strategy!
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Monthly Expenses */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Monthly Expenses</h2>
                <p className="text-gray-600">How much do you spend each month?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Housing (Rent/Mortgage)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      value={formData.monthlyHousing}
                      onChange={(e) => handleChange('monthlyHousing', parseFloat(e.target.value))}
                      className="input pl-8"
                      placeholder="2,500"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Transportation</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      value={formData.monthlyTransportation}
                      onChange={(e) => handleChange('monthlyTransportation', parseFloat(e.target.value))}
                      className="input pl-8"
                      placeholder="600"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Food & Groceries</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      value={formData.monthlyFood}
                      onChange={(e) => handleChange('monthlyFood', parseFloat(e.target.value))}
                      className="input pl-8"
                      placeholder="800"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Utilities</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      value={formData.monthlyUtilities}
                      onChange={(e) => handleChange('monthlyUtilities', parseFloat(e.target.value))}
                      className="input pl-8"
                      placeholder="200"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Insurance (Health, Auto, etc.)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      value={formData.monthlyInsurance}
                      onChange={(e) => handleChange('monthlyInsurance', parseFloat(e.target.value))}
                      className="input pl-8"
                      placeholder="400"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Entertainment & Dining</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      value={formData.monthlyEntertainment}
                      onChange={(e) => handleChange('monthlyEntertainment', parseFloat(e.target.value))}
                      className="input pl-8"
                      placeholder="500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Insurance & Planning */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Protection & Planning</h2>
                <p className="text-gray-600">Do you have these important protections in place?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'hasLifeInsurance', label: 'Life Insurance', icon: '🛡️' },
                  { key: 'hasDisabilityInsurance', label: 'Disability Insurance', icon: '💼' },
                  { key: 'hasUmbrellaPolicy', label: 'Umbrella Liability Policy', icon: '☂️' },
                  { key: 'hasEstatePlan', label: 'Estate Plan (Will/Trust)', icon: '📋' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border-2 border-gray-200 hover:border-blue-400 cursor-pointer transition-all duration-200 group"
                  >
                    <input
                      type="checkbox"
                      checked={formData[item.key as keyof ClientData] as boolean}
                      onChange={(e) => handleChange(item.key as keyof ClientData, e.target.checked)}
                      className="w-6 h-6 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                    />
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="label">Life Insurance Coverage Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      value={formData.lifeInsuranceCoverage}
                      onChange={(e) => handleChange('lifeInsuranceCoverage', parseFloat(e.target.value))}
                      className="input pl-8"
                      placeholder="500,000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Total death benefit amount</p>
                </div>

                <div>
                  <label className="label">Disability Insurance Monthly Benefit</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      value={formData.disabilityInsuranceCoverage}
                      onChange={(e) => handleChange('disabilityInsuranceCoverage', parseFloat(e.target.value))}
                      className="input pl-8"
                      placeholder="5,000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Monthly benefit if disabled</p>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
                <Target className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">One More Step!</h3>
                <p className="text-gray-700">
                  Set your financial goals to get personalized progress tracking.
                </p>
              </div>
            </div>
          )}

          {/* Step 7: Financial Goals */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Financial Goals</h2>
                <p className="text-gray-600">Set targets to track your progress and stay motivated</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Retirement Age */}
                <div>
                  <label className="label">🏖️ Desired Retirement Age</label>
                  <input
                    type="number"
                    value={formData.goals?.retirementAge || ''}
                    onChange={(e) => handleGoalChange('retirementAge', parseFloat(e.target.value) || 65)}
                    className="input"
                    placeholder="65"
                  />
                  <p className="text-xs text-gray-500 mt-1">When do you want to retire?</p>
                </div>

                {/* Retirement Income */}
                <div>
                  <label className="label">💰 Annual Retirement Income Goal</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      value={formData.goals?.retirementIncome || ''}
                      onChange={(e) => handleGoalChange('retirementIncome', parseFloat(e.target.value) || 0)}
                      className="input pl-8"
                      placeholder="80,000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Annual income you want in retirement</p>
                </div>

                {/* Emergency Fund */}
                <div>
                  <label className="label">🚨 Emergency Fund Goal (Months)</label>
                  <input
                    type="number"
                    value={formData.goals?.emergencyFundMonths || ''}
                    onChange={(e) => handleGoalChange('emergencyFundMonths', parseFloat(e.target.value) || 6)}
                    className="input"
                    placeholder="6"
                  />
                  <p className="text-xs text-gray-500 mt-1">Months of expenses to save</p>
                </div>

                {/* Home Down Payment */}
                <div>
                  <label className="label">🏠 Home Down Payment Goal</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      value={formData.goals?.homeDownPayment || ''}
                      onChange={(e) => handleGoalChange('homeDownPayment', parseFloat(e.target.value) || 0)}
                      className="input pl-8"
                      placeholder="100,000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Down payment savings target</p>
                </div>

                {/* Education Savings */}
                <div>
                  <label className="label">🎓 Education Savings Goal</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      value={formData.goals?.educationSavings || ''}
                      onChange={(e) => handleGoalChange('educationSavings', parseFloat(e.target.value) || 0)}
                      className="input pl-8"
                      placeholder="50,000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Total for children's education</p>
                </div>

                {/* Net Worth Target */}
                <div>
                  <label className="label">📈 Net Worth Target</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      value={formData.goals?.netWorthTarget || ''}
                      onChange={(e) => handleGoalChange('netWorthTarget', parseFloat(e.target.value) || 0)}
                      className="input pl-8"
                      placeholder="1,000,000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Your net worth goal</p>
                </div>

                {/* Annual Savings Target */}
                <div>
                  <label className="label">💵 Annual Savings Target</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      value={formData.goals?.annualSavingsTarget || ''}
                      onChange={(e) => handleGoalChange('annualSavingsTarget', parseFloat(e.target.value) || 0)}
                      className="input pl-8"
                      placeholder="25,000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">How much you want to save per year</p>
                </div>

                {/* Debt Free Date */}
                <div>
                  <label className="label">🎯 Target Debt-Free Date</label>
                  <input
                    type="date"
                    value={formData.goals?.debtFreeDate || ''}
                    onChange={(e) => handleGoalChange('debtFreeDate', e.target.value)}
                    className="input"
                  />
                  <p className="text-xs text-gray-500 mt-1">When you want to be debt-free</p>
                </div>
              </div>

              {/* Major Purchase Section */}
              <div className="border-2 border-purple-200 rounded-xl p-6 bg-purple-50">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🎁 Major Purchase Goal (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Description</label>
                    <input
                      type="text"
                      value={formData.goals?.majorPurchase?.description || ''}
                      onChange={(e) => handleMajorPurchaseChange('description', e.target.value)}
                      className="input"
                      placeholder="Vacation, Car, etc."
                    />
                  </div>
                  <div>
                    <label className="label">Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                      <input
                        type="number"
                        value={formData.goals?.majorPurchase?.amount || ''}
                        onChange={(e) => handleMajorPurchaseChange('amount', parseFloat(e.target.value) || 0)}
                        className="input pl-8"
                        placeholder="25,000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Target Date</label>
                    <input
                      type="date"
                      value={formData.goals?.majorPurchase?.targetDate || ''}
                      onChange={(e) => handleMajorPurchaseChange('targetDate', e.target.value)}
                      className="input"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">All Set!</h3>
                <p className="text-gray-700">
                  Click "Complete Profile" to see your personalized financial analysis and goal tracking.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t-2 border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={currentStep === 1 && !formData.name}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === totalSteps ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Complete Profile
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
