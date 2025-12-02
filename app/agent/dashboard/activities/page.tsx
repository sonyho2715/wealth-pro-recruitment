import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ActivitiesClient from './ActivitiesClient';

export default async function ActivitiesPage() {
  const session = await getSession();
  if (!session.agentId) redirect('/agent/login');

  // Fetch all activities for this agent with prospect details
  const [activities, prospects] = await Promise.all([
    db.activity.findMany({
      where: { agentId: session.agentId },
      include: {
        prospect: true,
      },
      orderBy: [
        { completedAt: 'asc' }, // Show incomplete first
        { scheduledAt: 'asc' }, // Then by scheduled date
        { createdAt: 'desc' }, // Finally by creation date
      ],
    }),
    db.prospect.findMany({
      where: {
        status: {
          not: 'INACTIVE',
        },
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
    }),
  ]);

  return (
    <div className="p-6 lg:p-8">
      <ActivitiesClient activities={activities} prospects={prospects} />
    </div>
  );
}
