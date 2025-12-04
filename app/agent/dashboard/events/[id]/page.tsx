import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import EventDetailClient from './EventDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();
  if (!session.agentId) redirect('/agent/login');

  const agent = await db.agent.findUnique({
    where: { id: session.agentId },
    select: { organizationId: true },
  });

  if (!agent?.organizationId) {
    redirect('/agent/dashboard/events');
  }

  // Fetch the event with guests
  const event = await db.bPM.findUnique({
    where: { id },
    include: {
      guests: {
        include: {
          inviter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!event || event.organizationId !== agent.organizationId) {
    notFound();
  }

  // Fetch contacts for quick add
  const contacts = await db.contact.findMany({
    where: { agentId: session.agentId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
    },
    orderBy: { firstName: 'asc' },
    take: 50,
  });

  // Transform data
  const eventData = {
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
    guests: event.guests.map(guest => ({
      id: guest.id,
      guestName: guest.guestName,
      guestPhone: guest.guestPhone,
      guestEmail: guest.guestEmail,
      status: guest.status,
      arrived: guest.arrived,
      arrivedAt: guest.arrivedAt?.toISOString() || null,
      confirmedAt: guest.confirmedAt?.toISOString() || null,
      isClient: guest.isClient,
      isRecruit: guest.isRecruit,
      rescheduled: guest.rescheduled,
      notInterested: guest.notInterested,
      leftMessage: guest.leftMessage,
      notes: guest.notes,
      inviter: guest.inviter,
      contact: guest.contact,
    })),
  };

  return (
    <div className="p-6 lg:p-8">
      <EventDetailClient event={eventData} contacts={contacts} />
    </div>
  );
}
