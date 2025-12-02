import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session.agentId) redirect('/agent/login');

  const agent = await db.agent.findUnique({
    where: { id: session.agentId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      licenseNumber: true,
      licenseDate: true,
      monthlyGoal: true,
      role: true,
    },
  });

  if (!agent) redirect('/agent/login');

  return (
    <div className="p-6 lg:p-8">
      <SettingsClient agent={{
        ...agent,
        monthlyGoal: agent.monthlyGoal ? Number(agent.monthlyGoal) : null,
        licenseDate: agent.licenseDate ? agent.licenseDate.toISOString() : null,
      }} />
    </div>
  );
}
