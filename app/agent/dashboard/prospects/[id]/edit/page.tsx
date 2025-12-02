import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import EditProspectForm from './EditProspectForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProspectPage({ params }: PageProps) {
  const session = await getSession();
  if (!session.agentId) redirect('/agent/login');

  const { id } = await params;

  const prospect = await db.prospect.findUnique({
    where: { id },
    include: {
      financialProfile: true,
    },
  });

  // Security check: ensure prospect belongs to this agent
  if (!prospect || prospect.agentId !== session.agentId) {
    notFound();
  }

  // Transform Decimal types to numbers
  const prospectData = {
    id: prospect.id,
    firstName: prospect.firstName,
    lastName: prospect.lastName,
    email: prospect.email,
    phone: prospect.phone || '',
    status: prospect.status,
    financialProfile: prospect.financialProfile ? {
      annualIncome: Number(prospect.financialProfile.annualIncome),
      spouseIncome: prospect.financialProfile.spouseIncome ? Number(prospect.financialProfile.spouseIncome) : 0,
      otherIncome: prospect.financialProfile.otherIncome ? Number(prospect.financialProfile.otherIncome) : 0,
      monthlyExpenses: Number(prospect.financialProfile.monthlyExpenses),
      housingCost: Number(prospect.financialProfile.housingCost),
      debtPayments: Number(prospect.financialProfile.debtPayments),
      savings: Number(prospect.financialProfile.savings),
      investments: Number(prospect.financialProfile.investments),
      retirement401k: Number(prospect.financialProfile.retirement401k),
      homeEquity: Number(prospect.financialProfile.homeEquity),
      otherAssets: Number(prospect.financialProfile.otherAssets),
      mortgage: Number(prospect.financialProfile.mortgage),
      carLoans: Number(prospect.financialProfile.carLoans),
      studentLoans: Number(prospect.financialProfile.studentLoans),
      creditCards: Number(prospect.financialProfile.creditCards),
      otherDebts: Number(prospect.financialProfile.otherDebts),
      age: prospect.financialProfile.age,
      spouseAge: prospect.financialProfile.spouseAge || 0,
      dependents: prospect.financialProfile.dependents,
      retirementAge: prospect.financialProfile.retirementAge,
      currentLifeInsurance: Number(prospect.financialProfile.currentLifeInsurance),
      currentDisability: Number(prospect.financialProfile.currentDisability),
    } : null,
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <Link
          href={`/agent/dashboard/balance-sheets/${prospect.id}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Balance Sheet
        </Link>

        <h1 className="text-2xl font-bold text-gray-900">
          Edit Profile: {prospect.firstName} {prospect.lastName}
        </h1>
        <p className="text-gray-600">Update prospect information and financial profile</p>
      </div>

      <EditProspectForm prospect={prospectData} />
    </div>
  );
}
