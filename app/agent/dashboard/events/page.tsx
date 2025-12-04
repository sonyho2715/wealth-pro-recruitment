import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EventsClient from './EventsClient';

export default async function EventsPage() {
  const session = await getSession();
  if (!session.agentId) redirect('/agent/login');

  const agent = await db.agent.findUnique({
    where: { id: session.agentId },
    select: { organizationId: true },
  });

  if (!agent?.organizationId) {
    return (
      <div className="p-6 lg:p-8">
        <div className="card-gradient text-center py-12">
          <p className="text-gray-500">No organization found. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  // Fetch all BPM events for this organization
  const events = await db.bPM.findMany({
    where: { organizationId: agent.organizationId },
    include: {
      guests: {
        select: {
          id: true,
          guestName: true,
          status: true,
          arrived: true,
        },
      },
    },
    orderBy: { date: 'desc' },
  });

  // Transform data for client component
  const eventsData = events.map(event => ({
    id: event.id,
    name: event.name,
    date: event.date.toISOString(),
    location: event.location,
    address: event.address,
    isVirtual: event.isVirtual,
    virtualLink: event.virtualLink,
    inviteGoal: event.inviteGoal,
    attendanceGoal: event.attendanceGoal,
    status: event.status,
    guests: event.guests,
    createdAt: event.createdAt.toISOString(),
  }));

  // Calculate stats
  const stats = {
    total: events.length,
    scheduled: events.filter(e => e.status === 'SCHEDULED').length,
    inProgress: events.filter(e => e.status === 'IN_PROGRESS').length,
    completed: events.filter(e => e.status === 'COMPLETED').length,
    totalInvites: events.reduce((sum, e) => sum + e.guests.length, 0),
    totalAttended: events.reduce((sum, e) => sum + e.guests.filter(g => g.arrived).length, 0),
  };

  return (
    <div className="p-6 lg:p-8">
      <EventsClient events={eventsData} stats={stats} />
    </div>
  );
}
