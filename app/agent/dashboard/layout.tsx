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
}
