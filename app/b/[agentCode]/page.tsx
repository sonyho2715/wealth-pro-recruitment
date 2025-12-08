import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import BalanceSheetForm from './BalanceSheetForm';

interface PageProps {
  params: Promise<{ agentCode: string }>;
}

async function getAgent(agentCode: string) {
  // Find agent by referral code (case-insensitive)
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
    return { title: 'Agent Not Found' };
  }

  return {
    title: `Free Financial Snapshot | ${agent.firstName} ${agent.lastName}`,
    description: `Get your free Living Balance Sheet from ${agent.firstName}. See where you stand financially in just 2 minutes.`,
  };
}

export default async function BalanceSheetPage({ params }: PageProps) {
  const { agentCode } = await params;
  const agent = await getAgent(agentCode);

  if (!agent) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {agent.organization?.logo ? (
              <img
                src={agent.organization.logo}
                alt={agent.organization.name || 'Logo'}
                className="h-8 w-auto"
              />
            ) : (
              <div className="text-xl font-bold text-white">
                {agent.organization?.name || 'Living Balance Sheet'}
              </div>
            )}
          </div>
          <div className="text-sm text-slate-400">
            Your Advisor: <span className="text-white font-medium">{agent.firstName} {agent.lastName}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your Free Financial Snapshot
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            See where you stand financially in just 2 minutes.
            Get your personalized Living Balance Sheet.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
          <BalanceSheetForm
            agentId={agent.id}
            agentCode={agent.referralCode || agentCode}
            agentName={`${agent.firstName} ${agent.lastName}`}
            primaryColor={agent.organization?.primaryColor || '#3B82F6'}
          />
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>256-bit Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Your Data is Private</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Takes Only 2 Minutes</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-slate-500">
          <p>
            This is a financial awareness tool, not financial advice.
            Consult a licensed professional for personalized recommendations.
          </p>
        </div>
      </footer>
    </div>
  );
}
