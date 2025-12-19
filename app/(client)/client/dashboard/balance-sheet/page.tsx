'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Wallet,
  CreditCard,
  TrendingUp,
  DollarSign,
  Home,
  Car,
  GraduationCap,
  Building,
  PiggyBank,
  Briefcase,
  User,
  Mail,
  Phone,
  Pencil,
  X,
  Save,
  CheckCircle,
} from 'lucide-react';

interface BalanceSheetData {
  hasData: boolean;
  profile: {
    // Income
    annualIncome: number;
    spouseIncome: number;
    otherIncome: number;
    // Expenses
    monthlyExpenses: number;
    housingCost: number;
    debtPayments: number;
    utilities: number;
    food: number;
    transportation: number;
    insurance: number;
    childcare: number;
    entertainment: number;
    otherExpenses: number;
    // Assets
    savings: number;
    emergencyFund: number;
    investments: number;
    retirement401k: number;
    rothIra: number;
    pensionValue: number;
    hsaFsa: number;
    homeMarketValue: number;
    homeEquity: number;
    investmentProperty: number;
    businessEquity: number;
    otherAssets: number;
    // Liabilities
    mortgage: number;
    carLoans: number;
    studentLoans: number;
    creditCards: number;
    personalLoans: number;
    otherDebts: number;
    // Demographics
    age: number;
    spouseAge: number | null;
    dependents: number;
    retirementAge: number;
    occupation: string | null;
    spouseOccupation: string | null;
    stateOfResidence: string | null;
  } | null;
  totals: {
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    totalIncome: number;
  } | null;
  agent: {
    name: string;
    email: string;
    phone: string | null;
  } | null;
  lastUpdated: string | null;
}

// Editable fields grouped by category
interface EditableFields {
  // Income
  annualIncome: number;
  spouseIncome: number;
  otherIncome: number;
  // Assets
  savings: number;
  emergencyFund: number;
  investments: number;
  retirement401k: number;
  rothIra: number;
  pensionValue: number;
  hsaFsa: number;
  homeEquity: number;
  investmentProperty: number;
  businessEquity: number;
  otherAssets: number;
  // Liabilities
  mortgage: number;
  carLoans: number;
  studentLoans: number;
  creditCards: number;
  personalLoans: number;
  otherDebts: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface FieldRowProps {
  label: string;
  value: number;
  icon?: React.ReactNode;
}

function FieldRow({ label, value, icon }: FieldRowProps) {
  if (value === 0) return null;
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-2">
        {icon && <span className="text-slate-400">{icon}</span>}
        <span className="text-slate-600">{label}</span>
      </div>
      <span className="font-medium text-slate-900">{formatCurrency(value)}</span>
    </div>
  );
}

interface EditableFieldRowProps {
  label: string;
  fieldKey: keyof EditableFields;
  value: number;
  onChange: (key: keyof EditableFields, value: number) => void;
  icon?: React.ReactNode;
}

function EditableFieldRow({ label, fieldKey, value, onChange, icon }: EditableFieldRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-2">
        {icon && <span className="text-slate-400">{icon}</span>}
        <span className="text-slate-600">{label}</span>
      </div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
        <input
          type="number"
          min="0"
          value={value || ''}
          onChange={(e) => onChange(fieldKey, Number(e.target.value) || 0)}
          className="w-32 pl-7 pr-3 py-1.5 text-right border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="0"
        />
      </div>
    </div>
  );
}

export default function BalanceSheetPage() {
  const router = useRouter();
  const [data, setData] = useState<BalanceSheetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [editedFields, setEditedFields] = useState<EditableFields>({
    annualIncome: 0,
    spouseIncome: 0,
    otherIncome: 0,
    savings: 0,
    emergencyFund: 0,
    investments: 0,
    retirement401k: 0,
    rothIra: 0,
    pensionValue: 0,
    hsaFsa: 0,
    homeEquity: 0,
    investmentProperty: 0,
    businessEquity: 0,
    otherAssets: 0,
    mortgage: 0,
    carLoans: 0,
    studentLoans: 0,
    creditCards: 0,
    personalLoans: 0,
    otherDebts: 0,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/client/balance-sheet');
        const result = await res.json();

        if (!res.ok) {
          if (res.status === 401) {
            router.push('/client/login');
            return;
          }
          throw new Error(result.error || 'Failed to fetch balance sheet');
        }

        setData(result.data);

        // Initialize editable fields from profile data
        if (result.data.profile) {
          const p = result.data.profile;
          setEditedFields({
            annualIncome: p.annualIncome,
            spouseIncome: p.spouseIncome,
            otherIncome: p.otherIncome,
            savings: p.savings,
            emergencyFund: p.emergencyFund,
            investments: p.investments,
            retirement401k: p.retirement401k,
            rothIra: p.rothIra,
            pensionValue: p.pensionValue,
            hsaFsa: p.hsaFsa,
            homeEquity: p.homeEquity,
            investmentProperty: p.investmentProperty,
            businessEquity: p.businessEquity,
            otherAssets: p.otherAssets,
            mortgage: p.mortgage,
            carLoans: p.carLoans,
            studentLoans: p.studentLoans,
            creditCards: p.creditCards,
            personalLoans: p.personalLoans,
            otherDebts: p.otherDebts,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [router]);

  const handleFieldChange = (key: keyof EditableFields, value: number) => {
    setEditedFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleCancelEdit = () => {
    // Reset to original values
    if (data?.profile) {
      const p = data.profile;
      setEditedFields({
        annualIncome: p.annualIncome,
        spouseIncome: p.spouseIncome,
        otherIncome: p.otherIncome,
        savings: p.savings,
        emergencyFund: p.emergencyFund,
        investments: p.investments,
        retirement401k: p.retirement401k,
        rothIra: p.rothIra,
        pensionValue: p.pensionValue,
        hsaFsa: p.hsaFsa,
        homeEquity: p.homeEquity,
        investmentProperty: p.investmentProperty,
        businessEquity: p.businessEquity,
        otherAssets: p.otherAssets,
        mortgage: p.mortgage,
        carLoans: p.carLoans,
        studentLoans: p.studentLoans,
        creditCards: p.creditCards,
        personalLoans: p.personalLoans,
        otherDebts: p.otherDebts,
      });
    }
    setIsEditing(false);
    setSaveError('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/client/balance-sheet', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedFields),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to save changes');
      }

      // Refresh the data
      const refreshRes = await fetch('/api/client/balance-sheet');
      const refreshResult = await refreshRes.json();
      if (refreshRes.ok) {
        setData(refreshResult.data);
      }

      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate totals from edited fields
  const editedTotals = {
    totalAssets:
      editedFields.savings +
      editedFields.emergencyFund +
      editedFields.investments +
      editedFields.retirement401k +
      editedFields.rothIra +
      editedFields.pensionValue +
      editedFields.hsaFsa +
      editedFields.homeEquity +
      editedFields.investmentProperty +
      editedFields.businessEquity +
      editedFields.otherAssets,
    totalLiabilities:
      editedFields.mortgage +
      editedFields.carLoans +
      editedFields.studentLoans +
      editedFields.creditCards +
      editedFields.personalLoans +
      editedFields.otherDebts,
    totalIncome: editedFields.annualIncome + editedFields.spouseIncome + editedFields.otherIncome,
  };
  const editedNetWorth = editedTotals.totalAssets - editedTotals.totalLiabilities;

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading your balance sheet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.hasData || !data.profile || !data.totals) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/client/dashboard"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <Wallet className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            No Balance Sheet Data
          </h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Your balance sheet has not been completed yet. Contact your financial advisor
            to get started.
          </p>
          {data?.agent && (
            <div className="bg-slate-50 rounded-lg p-4 max-w-sm mx-auto">
              <p className="text-sm text-slate-500 mb-2">Your Advisor</p>
              <p className="font-medium text-slate-900">{data.agent.name}</p>
              <div className="flex items-center justify-center gap-4 mt-2 text-sm text-slate-600">
                <a href={`mailto:${data.agent.email}`} className="flex items-center gap-1 hover:text-emerald-600">
                  <Mail className="w-4 h-4" />
                  Email
                </a>
                {data.agent.phone && (
                  <a href={`tel:${data.agent.phone}`} className="flex items-center gap-1 hover:text-emerald-600">
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const { profile, totals, agent, lastUpdated } = data;
  const displayTotals = isEditing ? editedTotals : totals;
  const displayNetWorth = isEditing ? editedNetWorth : totals.netWorth;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/client/dashboard"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        {lastUpdated && !isEditing && (
          <p className="text-sm text-slate-500">
            Last updated: {formatDate(lastUpdated)}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Your Balance Sheet</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit Values
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-400 transition-colors"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {saveSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <p className="text-emerald-700">Balance sheet updated successfully! A snapshot has been saved to your history.</p>
        </div>
      )}

      {saveError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{saveError}</p>
        </div>
      )}

      {isEditing && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700 text-sm">
            <strong>Edit Mode:</strong> Update your financial values below. When you save, a snapshot will be created to track your progress over time.
          </p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">Net Worth</span>
          </div>
          <p className={`text-2xl font-bold ${displayNetWorth >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            {formatCurrency(displayNetWorth)}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Total Assets</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">
            {formatCurrency(displayTotals.totalAssets)}
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">Total Liabilities</span>
          </div>
          <p className="text-2xl font-bold text-amber-700">
            {formatCurrency(displayTotals.totalLiabilities)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900">Assets</h2>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-4 mb-2">
              Cash & Savings
            </p>
            {isEditing ? (
              <>
                <EditableFieldRow label="Savings" fieldKey="savings" value={editedFields.savings} onChange={handleFieldChange} icon={<PiggyBank className="w-4 h-4" />} />
                <EditableFieldRow label="Emergency Fund" fieldKey="emergencyFund" value={editedFields.emergencyFund} onChange={handleFieldChange} icon={<DollarSign className="w-4 h-4" />} />
                <EditableFieldRow label="HSA/FSA" fieldKey="hsaFsa" value={editedFields.hsaFsa} onChange={handleFieldChange} icon={<DollarSign className="w-4 h-4" />} />
              </>
            ) : (
              <>
                <FieldRow label="Savings" value={profile.savings} icon={<PiggyBank className="w-4 h-4" />} />
                <FieldRow label="Emergency Fund" value={profile.emergencyFund} icon={<DollarSign className="w-4 h-4" />} />
                <FieldRow label="HSA/FSA" value={profile.hsaFsa} icon={<DollarSign className="w-4 h-4" />} />
              </>
            )}

            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-4 mb-2">
              Investments
            </p>
            {isEditing ? (
              <>
                <EditableFieldRow label="Investments" fieldKey="investments" value={editedFields.investments} onChange={handleFieldChange} icon={<TrendingUp className="w-4 h-4" />} />
                <EditableFieldRow label="401(k)" fieldKey="retirement401k" value={editedFields.retirement401k} onChange={handleFieldChange} icon={<Briefcase className="w-4 h-4" />} />
                <EditableFieldRow label="Roth IRA" fieldKey="rothIra" value={editedFields.rothIra} onChange={handleFieldChange} icon={<Briefcase className="w-4 h-4" />} />
                <EditableFieldRow label="Pension" fieldKey="pensionValue" value={editedFields.pensionValue} onChange={handleFieldChange} icon={<Briefcase className="w-4 h-4" />} />
              </>
            ) : (
              <>
                <FieldRow label="Investments" value={profile.investments} icon={<TrendingUp className="w-4 h-4" />} />
                <FieldRow label="401(k)" value={profile.retirement401k} icon={<Briefcase className="w-4 h-4" />} />
                <FieldRow label="Roth IRA" value={profile.rothIra} icon={<Briefcase className="w-4 h-4" />} />
                <FieldRow label="Pension" value={profile.pensionValue} icon={<Briefcase className="w-4 h-4" />} />
              </>
            )}

            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-4 mb-2">
              Property
            </p>
            {isEditing ? (
              <>
                <EditableFieldRow label="Home Equity" fieldKey="homeEquity" value={editedFields.homeEquity} onChange={handleFieldChange} icon={<Home className="w-4 h-4" />} />
                <EditableFieldRow label="Investment Property" fieldKey="investmentProperty" value={editedFields.investmentProperty} onChange={handleFieldChange} icon={<Building className="w-4 h-4" />} />
                <EditableFieldRow label="Business Equity" fieldKey="businessEquity" value={editedFields.businessEquity} onChange={handleFieldChange} icon={<Building className="w-4 h-4" />} />
                <EditableFieldRow label="Other Assets" fieldKey="otherAssets" value={editedFields.otherAssets} onChange={handleFieldChange} />
              </>
            ) : (
              <>
                <FieldRow label="Home Equity" value={profile.homeEquity} icon={<Home className="w-4 h-4" />} />
                <FieldRow label="Investment Property" value={profile.investmentProperty} icon={<Building className="w-4 h-4" />} />
                <FieldRow label="Business Equity" value={profile.businessEquity} icon={<Building className="w-4 h-4" />} />
                <FieldRow label="Other Assets" value={profile.otherAssets} />
              </>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">Total Assets</span>
              <span className="font-bold text-emerald-600 text-lg">
                {formatCurrency(displayTotals.totalAssets)}
              </span>
            </div>
          </div>
        </div>

        {/* Liabilities Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-slate-900">Liabilities</h2>
          </div>

          <div className="space-y-1">
            {isEditing ? (
              <>
                <EditableFieldRow label="Mortgage" fieldKey="mortgage" value={editedFields.mortgage} onChange={handleFieldChange} icon={<Home className="w-4 h-4" />} />
                <EditableFieldRow label="Car Loans" fieldKey="carLoans" value={editedFields.carLoans} onChange={handleFieldChange} icon={<Car className="w-4 h-4" />} />
                <EditableFieldRow label="Student Loans" fieldKey="studentLoans" value={editedFields.studentLoans} onChange={handleFieldChange} icon={<GraduationCap className="w-4 h-4" />} />
                <EditableFieldRow label="Credit Cards" fieldKey="creditCards" value={editedFields.creditCards} onChange={handleFieldChange} icon={<CreditCard className="w-4 h-4" />} />
                <EditableFieldRow label="Personal Loans" fieldKey="personalLoans" value={editedFields.personalLoans} onChange={handleFieldChange} icon={<DollarSign className="w-4 h-4" />} />
                <EditableFieldRow label="Other Debts" fieldKey="otherDebts" value={editedFields.otherDebts} onChange={handleFieldChange} />
              </>
            ) : (
              <>
                <FieldRow label="Mortgage" value={profile.mortgage} icon={<Home className="w-4 h-4" />} />
                <FieldRow label="Car Loans" value={profile.carLoans} icon={<Car className="w-4 h-4" />} />
                <FieldRow label="Student Loans" value={profile.studentLoans} icon={<GraduationCap className="w-4 h-4" />} />
                <FieldRow label="Credit Cards" value={profile.creditCards} icon={<CreditCard className="w-4 h-4" />} />
                <FieldRow label="Personal Loans" value={profile.personalLoans} icon={<DollarSign className="w-4 h-4" />} />
                <FieldRow label="Other Debts" value={profile.otherDebts} />
              </>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">Total Liabilities</span>
              <span className="font-bold text-amber-600 text-lg">
                {formatCurrency(displayTotals.totalLiabilities)}
              </span>
            </div>
          </div>
        </div>

        {/* Income Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Income</h2>
          </div>

          <div className="space-y-1">
            {isEditing ? (
              <>
                <EditableFieldRow label="Annual Income" fieldKey="annualIncome" value={editedFields.annualIncome} onChange={handleFieldChange} icon={<Briefcase className="w-4 h-4" />} />
                <EditableFieldRow label="Spouse Income" fieldKey="spouseIncome" value={editedFields.spouseIncome} onChange={handleFieldChange} icon={<User className="w-4 h-4" />} />
                <EditableFieldRow label="Other Income" fieldKey="otherIncome" value={editedFields.otherIncome} onChange={handleFieldChange} icon={<DollarSign className="w-4 h-4" />} />
              </>
            ) : (
              <>
                <FieldRow label="Annual Income" value={profile.annualIncome} icon={<Briefcase className="w-4 h-4" />} />
                <FieldRow label="Spouse Income" value={profile.spouseIncome} icon={<User className="w-4 h-4" />} />
                <FieldRow label="Other Income" value={profile.otherIncome} icon={<DollarSign className="w-4 h-4" />} />
              </>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">Total Annual Income</span>
              <span className="font-bold text-blue-600 text-lg">
                {formatCurrency(displayTotals.totalIncome)}
              </span>
            </div>
          </div>
        </div>

        {/* Demographics */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Age</span>
              <span className="font-medium text-slate-900">{profile.age}</span>
            </div>
            {profile.spouseAge && (
              <div className="flex justify-between">
                <span className="text-slate-600">Spouse Age</span>
                <span className="font-medium text-slate-900">{profile.spouseAge}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-600">Dependents</span>
              <span className="font-medium text-slate-900">{profile.dependents}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Target Retirement Age</span>
              <span className="font-medium text-slate-900">{profile.retirementAge}</span>
            </div>
            {profile.occupation && (
              <div className="flex justify-between">
                <span className="text-slate-600">Occupation</span>
                <span className="font-medium text-slate-900">{profile.occupation}</span>
              </div>
            )}
            {profile.stateOfResidence && (
              <div className="flex justify-between">
                <span className="text-slate-600">State</span>
                <span className="font-medium text-slate-900">{profile.stateOfResidence}</span>
              </div>
            )}
          </div>

          {isEditing && (
            <p className="mt-4 text-xs text-slate-500">
              Contact your advisor to update demographic information.
            </p>
          )}
        </div>
      </div>

      {/* Advisor Contact */}
      {agent && (
        <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-6">
          <h3 className="text-sm font-medium text-slate-500 mb-3">Your Financial Advisor</h3>
          <div className="flex items-center justify-between">
            <p className="font-semibold text-slate-900">{agent.name}</p>
            <div className="flex items-center gap-4">
              <a
                href={`mailto:${agent.email}`}
                className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
              >
                <Mail className="w-4 h-4" />
                Email
              </a>
              {agent.phone && (
                <a
                  href={`tel:${agent.phone}`}
                  className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
                >
                  <Phone className="w-4 h-4" />
                  Call
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
