import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { BarChart3, Shield, Clock, Lock } from 'lucide-react';
import BalanceSheetForm from './BalanceSheetForm';

interface PageProps {
  params: Promise<{ agentCode: string }>;
}

async function getAgent(agentCode: string) {
  const agent = await db.agent.findFirst({
    where: {
      referralCode: {
        equals: agentCode,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      referralCode: true,
      organization: {
        select: {
          name: true,
          logo: true,
          primaryColor: true,
        },
      },
    },
  });

  return agent;
}

export async function generateMetadata({ params }: PageProps) {
  const { agentCode } = await params;
  const agent = await getAgent(agentCode);

  if (!agent) {
    return { title: 'Advisor Not Found' };
  }

  return {
    title: `Financial Review | ${agent.firstName} ${agent.lastName} - Wealth Pro`,
    description: `Get your complimentary financial review from ${agent.firstName}. See your complete financial picture in minutes.`,
  };
}

export default async function BalanceSheetPage({ params }: PageProps) {
  const { agentCode } = await params;
  const agent = await getAgent(agentCode);

  if (!agent) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {agent.organization?.logo ? (
              <img
                src={agent.organization.logo}
                alt={agent.organization.name || 'Logo'}
                className="h-8 w-auto"
              />
            ) : (
              <>
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-slate-900 tracking-tight">
                  {agent.organization?.name || 'Wealth Pro'}
                </span>
              </>
            )}
          </Link>
          <div className="text-sm text-slate-500">
            Your Advisor:{' '}
            <span className="text-slate-900 font-medium">
              {agent.firstName} {agent.lastName}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-full mb-6">
            <span className="text-xs font-medium uppercase tracking-wider">
              Complimentary Financial Review
            </span>
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium text-slate-900 mb-4 tracking-tight font-serif">
            See Your Complete{' '}
            <span className="text-gradient-premium">Financial Picture</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Answer a few simple questions and receive your personalized balance sheet
            with actionable insights. Takes less than 5 minutes.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-10 shadow-sm">
          <BalanceSheetForm
            agentId={agent.id}
            agentCode={agent.referralCode || agentCode}
            agentName={`${agent.firstName} ${agent.lastName}`}
            primaryColor={agent.organization?.primaryColor || '#0f172a'}
          />
        </div>

        {/* Trust Indicators */}
        <div className="mt-10 grid grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-3">
              <Lock className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-sm text-slate-600">Bank-Level Security</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-3">
              <Shield className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-sm text-slate-600">Your Data is Private</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-sm text-slate-600">Takes 5 Minutes</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-12 py-8 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-slate-500">
          <p className="mb-2">
            This is a financial awareness tool, not financial advice.
            Consult a licensed professional for personalized recommendations.
          </p>
          <p className="text-slate-400">
            &copy; {new Date().getFullYear()} Wealth Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
