import { useState } from 'react';
import { useClientStore } from '../../store/clientStore';
import type { ClientData } from '../../types/financial.types';
import { Save, Upload, Trash2, Sparkles, TrendingUp, MapPin, Zap, Target } from 'lucide-react';
import OnboardingWizard from './OnboardingWizard';
import { useToast } from '../../hooks/useToast';

export default function ClientInput() {
  const { currentClient, setClientData, loadSampleData, profiles, saveProfile, loadProfile, deleteProfile } =
    useClientStore();
  const [useWizard, setUseWizard] = useState(true);
  const { success, error, warning, ToastContainer } = useToast();

  const [formData, setFormData] = useState<ClientData>(
    currentClient || {
      name: '',
      age: 35,
      dependents: 0,
      state: 'Hawaii',
      income: 0,
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
    }
  );

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

  const validateData = (data: ClientData): string | null => {
    // Name validation
    if (!data.name || data.name.trim() === '') {
      return 'Client name is required to generate personalized analysis';
    }

    // Age validation with professional messaging
    if (data.age < 18) {
      return 'Client must be at least 18 years old for insurance and financial planning purposes';
    }
    if (data.age > 100) {
      return 'Please verify age entry - for clients over 100, please contact us directly for specialized planning';
    }

    // Income validation
    if (data.income < 0 || (data.spouseIncome && data.spouseIncome < 0)) {
      return 'Income values cannot be negative';
    }
    if (data.income === 0 && (data.spouseIncome || 0) === 0) {
      warning('No household income entered - insurance and retirement projections will be limited');
    }

    // Asset validation - check for negative values
    if (data.checking < 0 || data.savings < 0 || data.retirement401k < 0 ||
        data.retirementIRA < 0 || data.brokerage < 0 || data.homeValue < 0 || data.otherAssets < 0) {
      return 'Asset values cannot be negative - please verify all entries';
    }

    // Liability validation
    if (data.mortgage < 0 || data.studentLoans < 0 || data.carLoans < 0 ||
        data.creditCards < 0 || data.otherDebts < 0) {
      return 'Debt amounts cannot be negative - please verify all entries';
    }

    // Smart logical consistency warnings (non-blocking)
    if (data.homeValue > 0 && data.homeValue < data.mortgage) {
      warning(`Home equity is negative: Mortgage ($${data.mortgage.toLocaleString()}) exceeds home value ($${data.homeValue.toLocaleString()}). This is common in declining markets but impacts net worth.`);
    }

    if (data.homeValue > 500000 && data.mortgage === 0 && data.age < 45) {
      success(`Excellent! Home owned free and clear at age ${data.age} - significant financial milestone achieved.`);
    }

    const totalAssets = data.checking + data.savings + data.retirement401k + data.retirementIRA +
                        data.brokerage + data.homeValue + data.otherAssets;
    const totalLiabilities = data.mortgage + data.studentLoans + data.carLoans + data.creditCards + data.otherDebts;

    if (totalAssets === 0 && totalLiabilities > 0) {
      return 'Financial data inconsistency: Debts exist but no assets reported. Please verify all account balances.';
    }

    // Monthly expenses validation
    const totalMonthlyExpenses = data.monthlyHousing + data.monthlyTransportation + data.monthlyFood +
                                  data.monthlyUtilities + data.monthlyInsurance + data.monthlyEntertainment + data.monthlyOther;
    const monthlyIncome = (data.income + (data.spouseIncome || 0)) / 12;

    if (totalMonthlyExpenses > monthlyIncome * 1.5 && monthlyIncome > 0) {
      warning(`Monthly expenses ($${totalMonthlyExpenses.toLocaleString()}) significantly exceed monthly income ($${monthlyIncome.toLocaleString()}). Budget adjustment may be needed.`);
    }

    if (totalMonthlyExpenses === 0 && monthlyIncome > 0) {
      warning('No monthly expenses entered - analysis will use conservative estimates.');
    }

    // Insurance coverage warnings for appropriate income levels
    const householdIncome = data.income + (data.spouseIncome || 0);

    if (householdIncome > 50000 && data.lifeInsuranceCoverage === 0) {
      warning(`Critical: No life insurance coverage with $${householdIncome.toLocaleString()} household income. Recommended: $${(householdIncome * 10).toLocaleString()} coverage.`);
    }

    if (!data.hasDisabilityInsurance && householdIncome > 40000 && data.age < 65) {
      warning(`Important: No disability insurance to protect income earning ability. This is your most valuable asset.`);
    }

    if (!data.hasEstatePlan && (totalAssets > 200000 || data.dependents > 0)) {
      warning('Consider estate planning: With significant assets or dependents, wills and trusts are important.');
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateData(formData);
    if (validationError) {
      error(validationError);
      return;
    }
    setClientData(formData);
    success('Analysis generated successfully! View Dashboard for insights.');
  };

  const handleLoadSample = () => {
    loadSampleData();
    if (useClientStore.getState().currentClient) {
      setFormData(useClientStore.getState().currentClient!);
      success('Sample data loaded successfully!');
    }
  };

  const handleSaveProfile = () => {
    const profileName = prompt('Enter profile name:');
    if (profileName) {
      const validationError = validateData(formData);
      if (validationError) {
        error(validationError);
        return;
      }
      setClientData(formData);
      saveProfile(profileName);
      success(`Profile "${profileName}" saved successfully!`);
    }
  };

  const handleLoadProfile = (id: string) => {
    loadProfile(id);
    const loadedClient = useClientStore.getState().currentClient;
    if (loadedClient) {
      setFormData(loadedClient);
      success('Profile loaded successfully!');
    }
  };

  const handleDeleteProfile = (id: string, name: string) => {
    if (confirm(`Delete profile "${name}"?`)) {
      deleteProfile(id);
      success('Profile deleted successfully!');
    }
  };

  // If wizard mode is enabled and no current client, show wizard
  if (useWizard && !currentClient) {
    return (
      <div className="space-y-4">
        <div className="text-right">
          <button
            onClick={() => setUseWizard(false)}
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
          >
            Switch to Advanced Form
          </button>
        </div>
        <OnboardingWizard />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <ToastContainer />
      {/* Header Section */}
      <div className="card-gradient">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold gradient-text flex items-center gap-2">
              <Sparkles className="w-8 h-8" />
              Client Information
            </h2>
            <p className="text-gray-600 mt-2">
              Enter comprehensive financial data to generate powerful insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* State Selector */}
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-600" />
              <select
                value={formData.state || 'Hawaii'}
                onChange={(e) => handleChange('state', e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold text-gray-900 bg-white hover:border-blue-400 transition-colors"
              >
                <option value="Hawaii">Hawaii</option>
                <option value="California">California</option>
                <option value="Nevada">Nevada</option>
                <option value="Texas">Texas</option>
                <option value="Florida">Florida</option>
                <option value="New York">New York</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            {!currentClient && (
              <button
                onClick={() => setUseWizard(true)}
                className="btn btn-primary"
              >
                <Zap className="w-4 h-4" />
                Use Guided Wizard
              </button>
            )}
            <button onClick={handleLoadSample} className="btn btn-secondary">
              <Upload className="w-4 h-4" />
              Load Sample
            </button>
            {currentClient && (
              <button onClick={handleSaveProfile} className="btn btn-success">
                <Save className="w-4 h-4" />
                Save Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Saved Profiles */}
      {Object.keys(profiles).length > 0 && (
        <div className="card animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Saved Profiles</h3>
            <span className="badge badge-primary">{Object.keys(profiles).length} profiles</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(profiles).map(([id, profile]) => (
              <div key={id} className="group bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 hover:border-blue-400 rounded-xl p-4 transition-all duration-300 hover:shadow-soft">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{profile.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{new Date(profile.savedDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleLoadProfile(id)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm px-3 py-1 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDeleteProfile(id, profile.name)}
                      className="text-red-600 hover:text-red-700 p-1 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="input"
                placeholder="Enter client name"
                required
              />
            </div>
            <div>
              <label className="label">
                Age <span className="text-red-500">*</span>
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
                placeholder="0"
              />
            </div>
            <div>
              <label className="label">
                Annual Income <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                <input
                  type="number"
                  value={formData.income}
                  onChange={(e) => handleChange('income', parseFloat(e.target.value))}
                  className="input pl-8"
                  placeholder="120,000"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Assets */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-2 h-8 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
            Assets
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { key: 'checking', label: 'Checking Account' },
              { key: 'savings', label: 'Savings Account' },
              { key: 'retirement401k', label: '401(k) / Retirement' },
              { key: 'retirementIRA', label: 'IRA' },
              { key: 'brokerage', label: 'Brokerage Account' },
              { key: 'homeValue', label: 'Home Value' },
              { key: 'lifeInsuranceCoverage', label: 'Life Insurance Coverage' },
              { key: 'disabilityInsuranceCoverage', label: 'Disability Insurance Coverage' },
            ].map((field) => (
              <div key={field.key}>
                <label className="label">{field.label}</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                  <input
                    type="number"
                    value={formData[field.key as keyof ClientData] as number}
                    onChange={(e) => handleChange(field.key as keyof ClientData, parseFloat(e.target.value))}
                    className="input pl-8"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Liabilities */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-2 h-8 bg-gradient-to-b from-red-600 to-orange-600 rounded-full"></div>
            Liabilities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { key: 'mortgage', label: 'Mortgage' },
              { key: 'studentLoans', label: 'Student Loans' },
              { key: 'carLoans', label: 'Car Loans' },
              { key: 'creditCards', label: 'Credit Cards' },
            ].map((field) => (
              <div key={field.key}>
                <label className="label">{field.label}</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                  <input
                    type="number"
                    value={formData[field.key as keyof ClientData] as number}
                    onChange={(e) => handleChange(field.key as keyof ClientData, parseFloat(e.target.value))}
                    className="input pl-8"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-2 h-8 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
            Monthly Expenses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { key: 'monthlyHousing', label: 'Housing' },
              { key: 'monthlyTransportation', label: 'Transportation' },
              { key: 'monthlyFood', label: 'Food' },
              { key: 'monthlyUtilities', label: 'Utilities' },
              { key: 'monthlyInsurance', label: 'Insurance' },
              { key: 'monthlyEntertainment', label: 'Entertainment' },
            ].map((field) => (
              <div key={field.key}>
                <label className="label">{field.label}</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">$</span>
                  <input
                    type="number"
                    value={formData[field.key as keyof ClientData] as number}
                    onChange={(e) => handleChange(field.key as keyof ClientData, parseFloat(e.target.value))}
                    className="input pl-8"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insurance Status */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-2 h-8 bg-gradient-to-b from-indigo-600 to-blue-600 rounded-full"></div>
            Insurance & Planning Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'hasLifeInsurance', label: 'Has Life Insurance', icon: '🛡️' },
              { key: 'hasDisabilityInsurance', label: 'Has Disability Insurance', icon: '💼' },
              { key: 'hasUmbrellaPolicy', label: 'Has Umbrella Liability Policy', icon: '☂️' },
              { key: 'hasEstatePlan', label: 'Has Estate Plan', icon: '📋' },
            ].map((item) => (
              <label key={item.key} className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border-2 border-gray-200 hover:border-blue-400 cursor-pointer transition-all duration-200 group">
                <input
                  type="checkbox"
                  checked={formData[item.key as keyof ClientData] as boolean}
                  onChange={(e) => handleChange(item.key as keyof ClientData, e.target.checked)}
                  className="w-6 h-6 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                />
                <span className="text-2xl">{item.icon}</span>
                <span className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Financial Goals */}
        <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-2 h-8 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full"></div>
            <Target className="w-6 h-6 text-purple-600" />
            Financial Goals
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Set your financial goals to track progress and stay motivated
          </p>

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
            </div>
          </div>

          {/* Major Purchase Section */}
          <div className="border-t-2 border-purple-300 mt-6 pt-6">
            <h4 className="text-md font-bold text-gray-900 mb-4">🎁 Major Purchase Goal (Optional)</h4>
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
        </div>

        {/* Submit Button */}
        <div className="card-highlight text-center py-8">
          <button type="submit" className="btn btn-primary text-xl px-12 py-4 shadow-glow-lg hover:shadow-glow">
            <TrendingUp className="w-6 h-6 mr-2 inline-block" />
            Generate Financial Analysis
          </button>
          <p className="text-sm text-gray-600 mt-4">
            Complete analysis with comprehensive insights and recommendations
          </p>
        </div>
      </form>
    </div>
  );
}
