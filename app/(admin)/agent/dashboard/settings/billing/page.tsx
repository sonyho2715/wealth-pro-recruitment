import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import BillingClient from './BillingClient';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Billing & Subscription | WealthPro',
  description: 'Manage your subscription and billing',
};

export default async function BillingPage() {
  const session = await getSession();

  if (!session.isLoggedIn || !session.agentId) {
    redirect('/agent/login');
  }

  // Check if user is admin
  const agent = await db.agent.findUnique({
    where: { id: session.agentId },
    select: { role: true, organizationId: true },
  });

  if (!agent?.organizationId) {
    redirect('/agent/dashboard');
  }

  // Only admins can access billing
  if (agent.role !== 'ADMIN') {
    redirect('/agent/dashboard/settings');
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/agent/dashboard/settings"
          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Billing & Subscription</h1>
        <p className="text-gray-600">Manage your plan, view usage, and update payment methods</p>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }>
        <BillingClient />
      </Suspense>
    </div>
  );
}
