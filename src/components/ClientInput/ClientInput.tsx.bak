import { useState } from 'react';
import { useClientStore } from '../../store/clientStore';
import type { ClientData } from '../../types/financial.types';
import { Save, Upload, Trash2 } from 'lucide-react';

export default function ClientInput() {
  const { currentClient, setClientData, loadSampleData, profiles, saveProfile, loadProfile, deleteProfile } =
    useClientStore();

  const [formData, setFormData] = useState<ClientData>(
    currentClient || {
      name: '',
      age: 35,
      dependents: 0,
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
    }
  );

  const handleChange = (field: keyof ClientData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientData(formData);
    alert('✅ Analysis generated successfully! View other tabs for insights.');
  };

  const handleLoadSample = () => {
    loadSampleData();
    if (useClientStore.getState().currentClient) {
      setFormData(useClientStore.getState().currentClient!);
    }
  };

  const handleSaveProfile = () => {
    const profileName = prompt('Enter profile name:');
    if (profileName) {
      setClientData(formData);
      saveProfile(profileName);
      alert(`✅ Profile "${profileName}" saved!`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Client Information</h2>
          <p className="text-sm text-gray-600 mt-1">
            Enter comprehensive financial data to generate analysis
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleLoadSample} className="btn btn-secondary text-sm">
            <Upload className="w-4 h-4" />
            Load Sample
          </button>
          {currentClient && (
            <button onClick={handleSaveProfile} className="btn btn-primary text-sm">
              <Save className="w-4 h-4" />
              Save Profile
            </button>
          )}
        </div>
      </div>

      {Object.keys(profiles).length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-3">Saved Profiles ({Object.keys(profiles).length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(profiles).map(([id, profile]) => (
              <div key={id} className="border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{profile.name}</p>
                  <p className="text-xs text-gray-600">{new Date(profile.savedDate).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      loadProfile(id);
                      setFormData(useClientStore.getState().currentClient!);
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this profile?')) deleteProfile(id);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Name*</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Age*</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleChange('age', parseInt(e.target.value))}
                className="input"
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
              />
            </div>
            <div>
              <label className="label">Annual Income*</label>
              <input
                type="number"
                value={formData.income}
                onChange={(e) => handleChange('income', parseFloat(e.target.value))}
                className="input"
                required
              />
            </div>
          </div>
        </div>

        {/* Assets */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Assets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Checking Account</label>
              <input
                type="number"
                value={formData.checking}
                onChange={(e) => handleChange('checking', parseFloat(e.target.value))}
                className="input"
              />
            </div>
            <div>
              <label className="label">Savings Account</label>
              <input
                type="number"
                value={formData.savings}
                onChange={(e) => handleChange('savings', parseFloat(e.target.value))}
                className="input"
              />
            </div>
            <div>
              <label className="label">401(k) / Retirement</label>
              <input
                type="number"
                value={formData.retirement401k}
                onChange={(e) => handleChange('retirement401k', parseFloat(e.target.value))}
                className="input"
              />
            </div>
            <div>
              <label className="label">IRA</label>
              <input
                type="number"
                value={formData.retirementIRA}
                onChange={(e) => handleChange('retirementIRA', parseFloat(e.target.value))}
                className="input"
              />
            </div>
            <div>
              <label className="label">Brokerage Account</label>
              <input
                type="number"
                value={formData.brokerage}
                onChange={(e) => handleChange('brokerage', parseFloat(e.target.value))}
                className="input"
              />
            </div>
            <div>
              <label className="label">Home Value</label>
              <input
                type="number"
                value={formData.homeValue}
                onChange={(e) => handleChange('homeValue', parseFloat(e.target.value))}
                className="input"
              />
            </div>
            <div>
              <label className="label">Life Insurance Coverage</label>
              <input
                type="number"
                value={formData.lifeInsuranceCoverage}
                onChange={(e) => handleChange('lifeInsuranceCoverage', parseFloat(e.target.value))}
                className="input"
              />
            </div>
            <div>
              <label className="label">Disability Insurance Coverage</label>
              <input
                type="number"
                value={formData.disabilityInsuranceCoverage}
                onChange={(e) => handleChange('disabilityInsuranceCoverage', parseFloat(e.target.value))}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Liabilities */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Liabilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Mortgage</label>
              <input
                type="number"
                value={formData.mortgage}
                onChange={(e) => handleChange('mortgage', parseFloat(e.target.value))}
                className="input"
              />
            </div>
            <div>
              <label className="label">Student Loans</label>
              <input
                type="number"
                value={formData.studentLoans}
                onChange={(e) => handleChange('studentLoans', parseFloat(e.target.value))}
                className="input"
              />
            </div>
            <div>
              <label className="label">Car Loans</label>
              <input
                type="number"
                value={formData.carLoans}
                onChange={(e) => handleChange('carLoans', parseFloat(e.target.value))}
                className="input"
              />
            </div>
            <div>
              <label className="label">Credit Cards</label>
              <input
                type="number"
                value={formData.creditCards}
                onChange={(e) => handleChange('creditCards', parseFloat(e.target.value))}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Monthly Expenses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Housing</label>
              <input
                type="number"
                value={formData.monthlyHousing}
                onChange={(e) => handleChange('monthlyHousing', parseFloat(e.target.value))}
                className="input"
              />
            </div>
            <div>
              <label className="label">Transportation</label>
              <input
                type="number"
                value={formData.monthlyTransportation}
                onChange={(e) => handleChange('monthlyTransportation', parseFloat(e.target.value))}
                className="input"
              />
            </div>
            <div>
              <label className="label">Food</label>
              <input
                type="number"
                value={formData.monthlyFood}
                onChange={(e) => handleChange('monthlyFood', parseFloat(e.target.value))}
                className="input"
              />
            </div>
            <div>
              <label className="label">Utilities</label>
              <input
                type="number"
                value={formData.monthlyUtilities}
                onChange={(e) => handleChange('monthlyUtilities', parseFloat(e.target.value))}
                className="input"
              />
            </div>
            <div>
              <label className="label">Insurance</label>
              <input
                type="number"
                value={formData.monthlyInsurance}
                onChange={(e) => handleChange('monthlyInsurance', parseFloat(e.target.value))}
                className="input"
              />
            </div>
            <div>
              <label className="label">Entertainment</label>
              <input
                type="number"
                value={formData.monthlyEntertainment}
                onChange={(e) => handleChange('monthlyEntertainment', parseFloat(e.target.value))}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Insurance Status */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Insurance & Planning Status</h3>
          <div className="space-y-3">
            {[
              { key: 'hasLifeInsurance', label: 'Has Life Insurance' },
              { key: 'hasDisabilityInsurance', label: 'Has Disability Insurance' },
              { key: 'hasUmbrellaPolicy', label: 'Has Umbrella Liability Policy' },
              { key: 'hasEstatePlan', label: 'Has Estate Plan' },
            ].map((item) => (
              <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData[item.key as keyof ClientData] as boolean}
                  onChange={(e) => handleChange(item.key as keyof ClientData, e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary text-lg px-8 py-3">
            Generate Financial Analysis
          </button>
        </div>
      </form>
    </div>
  );
}
