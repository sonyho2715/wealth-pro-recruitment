import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import DashboardSidebar from './DashboardSidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session.isLoggedIn || session.role !== 'agent' || !session.agentId) {
    redirect('/agent/login');
  }

  try {
    const agent = await db.agent.findUnique({
      where: { id: session.agentId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    if (!agent) {
      redirect('/agent/login');
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <DashboardSidebar agent={agent} />
        <main className="ml-64 transition-all duration-300">
          {children}
        </main>
      </div>
    );
  } catch (error) {
    console.error('Dashboard layout error:', error);
    // Show error state instead of crashing
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connection Error</h1>
          <p className="text-gray-600 mb-4">Unable to load dashboard. Please try again.</p>
          <a href="/agent/login" className="text-blue-600 hover:underline">Return to Login</a>
        </div>
      </div>
    );
  }
}
