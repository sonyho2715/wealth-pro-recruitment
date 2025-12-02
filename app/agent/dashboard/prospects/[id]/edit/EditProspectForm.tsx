'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  DollarSign,
  Home,
  CreditCard,
  PiggyBank,
  Calendar,
  Users,
  Loader2,
  Save,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { updateProspect } from './actions';

interface FinancialProfile {
  annualIncome: number;
  spouseIncome: number;
  otherIncome: number;
  monthlyExpenses: number;
  housingCost: number;
  debtPayments: number;
  savings: number;
  investments: number;
  retirement401k: number;
  homeEquity: number;
  otherAssets: number;
  mortgage: number;
  carLoans: number;
  studentLoans: number;
  creditCards: number;
  otherDebts: number;
  age: number;
  spouseAge: number;
  dependents: number;
  retirementAge: number;
  currentLifeInsurance: number;
  currentDisability: number;
}

interface ProspectData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  financialProfile: FinancialProfile | null;
}

interface EditProspectFormProps {
  prospect: ProspectData;
}

const STATUS_OPTIONS = [
  { value: 'LEAD', label: 'New Lead' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'INSURANCE_CLIENT', label: 'Insurance Client' },
  { value: 'AGENT_PROSPECT', label: 'Agent Prospect' },
  { value: 'LICENSED_AGENT', label: 'Licensed Agent' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export default function EditProspectForm({ prospect }: EditProspectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Basic info
  const [firstName, setFirstName] = useState(prospect.firstName);
  const [lastName, setLastName] = useState(prospect.lastName);
  const [email, setEmail] = useState(prospect.email);
  const [phone, setPhone] = useState(prospect.phone);
  const [status, setStatus] = useState(prospect.status);

  // Financial profile
  const fp = prospect.financialProfile;
  const [annualIncome, setAnnualIncome] = useState(fp?.annualIncome || 0);
  const [spouseIncome, setSpouseIncome] = useState(fp?.spouseIncome || 0);
  const [otherIncome, setOtherIncome] = useState(fp?.otherIncome || 0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(fp?.monthlyExpenses || 0);
  const [housingCost, setHousingCost] = useState(fp?.housingCost || 0);
  const [debtPayments, setDebtPayments] = useState(fp?.debtPayments || 0);
  const [savings, setSavings] = useState(fp?.savings || 0);
  const [investments, setInvestments] = useState(fp?.investments || 0);
  const [retirement401k, setRetirement401k] = useState(fp?.retirement401k || 0);
  const [homeEquity, setHomeEquity] = useState(fp?.homeEquity || 0);
  const [otherAssets, setOtherAssets] = useState(fp?.otherAssets || 0);
  const [mortgage, setMortgage] = useState(fp?.mortgage || 0);
  const [carLoans, setCarLoans] = useState(fp?.carLoans || 0);
  const [studentLoans, setStudentLoans] = useState(fp?.studentLoans || 0);
  const [creditCards, setCreditCards] = useState(fp?.creditCards || 0);
  const [otherDebts, setOtherDebts] = useState(fp?.otherDebts || 0);
  const [age, setAge] = useState(fp?.age || 35);
  const [spouseAge, setSpouseAge] = useState(fp?.spouseAge || 0);
  const [dependents, setDependents] = useState(fp?.dependents || 0);
  const [retirementAge, setRetirementAge] = useState(fp?.retirementAge || 65);
  const [currentLifeInsurance, setCurrentLifeInsurance] = useState(fp?.currentLifeInsurance || 0);
  const [currentDisability, setCurrentDisability] = useState(fp?.currentDisability || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const result = await updateProspect(prospect.id, {
        firstName,
        lastName,
        email,
        phone,
        status,
        financialProfile: {
          annualIncome,
          spouseIncome,
          otherIncome,
          monthlyExpenses,
          housingCost,
          debtPayments,
          savings,
          investments,
          retirement401k,
          homeEquity,
          otherAssets,
          mortgage,
          carLoans,
          studentLoans,
          creditCards,
          otherDebts,
          age,
          spouseAge,
          dependents,
          retirementAge,
          currentLifeInsurance,
          currentDisability,
        },
      });

      if (!result.success) {
        setError(result.error || 'Failed to update');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/agent/dashboard/balance-sheets/${prospect.id}`);
        router.refresh();
      }, 1500);
    } catch {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  // Wrapper to convert string|number to string for text field setters
  const asString = (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (v: string | number) => setter(String(v));

  // Wrapper to convert string|number to number for number field setters
  const asNumber = (setter: React.Dispatch<React.SetStateAction<number>>) =>
    (v: string | number) => setter(Number(v));

  const InputField = ({
    label,
    value,
    onChange,
    type = 'text',
    icon: Icon,
    prefix,
  }: {
    label: string;
    value: string | number;
    onChange: (v: string | number) => void;
    type?: string;
    icon?: React.ComponentType<{ className?: string }>;
    prefix?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
          className={`input-field ${Icon ? 'pl-10' : ''} ${prefix ? 'pl-7' : ''}`}
        />
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          Profile updated successfully! Redirecting...
        </div>
      )}

      {/* Basic Information */}
      <div className="card-gradient">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="First Name" value={firstName} onChange={asString(setFirstName)} icon={User} />
          <InputField label="Last Name" value={lastName} onChange={asString(setLastName)} icon={User} />
          <InputField label="Email" value={email} onChange={asString(setEmail)} type="email" icon={Mail} />
          <InputField label="Phone" value={phone} onChange={asString(setPhone)} icon={Phone} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input-field"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Demographics */}
      <div className="card-gradient">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Demographics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InputField label="Age" value={age} onChange={asNumber(setAge)} type="number" icon={Calendar} />
          <InputField label="Spouse Age" value={spouseAge} onChange={asNumber(setSpouseAge)} type="number" icon={Calendar} />
          <InputField label="Dependents" value={dependents} onChange={asNumber(setDependents)} type="number" icon={Users} />
          <InputField label="Retirement Age" value={retirementAge} onChange={asNumber(setRetirementAge)} type="number" icon={Calendar} />
        </div>
      </div>

      {/* Income */}
      <div className="card-gradient">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Annual Income
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField label="Annual Income" value={annualIncome} onChange={asNumber(setAnnualIncome)} type="number" prefix="$" />
          <InputField label="Spouse Income" value={spouseIncome} onChange={asNumber(setSpouseIncome)} type="number" prefix="$" />
          <InputField label="Other Income" value={otherIncome} onChange={asNumber(setOtherIncome)} type="number" prefix="$" />
        </div>
      </div>

      {/* Expenses */}
      <div className="card-gradient">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-red-600" />
          Monthly Expenses
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField label="Total Monthly Expenses" value={monthlyExpenses} onChange={asNumber(setMonthlyExpenses)} type="number" prefix="$" />
          <InputField label="Housing Cost" value={housingCost} onChange={asNumber(setHousingCost)} type="number" prefix="$" />
          <InputField label="Debt Payments" value={debtPayments} onChange={asNumber(setDebtPayments)} type="number" prefix="$" />
        </div>
      </div>

      {/* Assets */}
      <div className="card-gradient">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <PiggyBank className="w-5 h-5 text-blue-600" />
          Assets
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <InputField label="Savings" value={savings} onChange={asNumber(setSavings)} type="number" prefix="$" />
          <InputField label="Investments" value={investments} onChange={asNumber(setInvestments)} type="number" prefix="$" />
          <InputField label="401(k)" value={retirement401k} onChange={asNumber(setRetirement401k)} type="number" prefix="$" />
          <InputField label="Home Equity" value={homeEquity} onChange={asNumber(setHomeEquity)} type="number" prefix="$" />
          <InputField label="Other Assets" value={otherAssets} onChange={asNumber(setOtherAssets)} type="number" prefix="$" />
        </div>
      </div>

      {/* Liabilities */}
      <div className="card-gradient">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Home className="w-5 h-5 text-red-600" />
          Liabilities
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <InputField label="Mortgage" value={mortgage} onChange={asNumber(setMortgage)} type="number" prefix="$" />
          <InputField label="Car Loans" value={carLoans} onChange={asNumber(setCarLoans)} type="number" prefix="$" />
          <InputField label="Student Loans" value={studentLoans} onChange={asNumber(setStudentLoans)} type="number" prefix="$" />
          <InputField label="Credit Cards" value={creditCards} onChange={asNumber(setCreditCards)} type="number" prefix="$" />
          <InputField label="Other Debts" value={otherDebts} onChange={asNumber(setOtherDebts)} type="number" prefix="$" />
        </div>
      </div>

      {/* Current Insurance */}
      <div className="card-gradient">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-purple-600" />
          Current Insurance Coverage
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Life Insurance Coverage" value={currentLifeInsurance} onChange={asNumber(setCurrentLifeInsurance)} type="number" prefix="$" />
          <InputField label="Disability Coverage" value={currentDisability} onChange={asNumber(setCurrentDisability)} type="number" prefix="$" />
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || success}
          className="btn-primary flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
